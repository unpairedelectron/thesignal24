import assert from "node:assert/strict";
import { once } from "node:events";
import express, { type Express, type RequestHandler } from "express";
import { test } from "node:test";
import { db } from "@workspace/db";
import {
  createWikimediaCommonsClient,
  type WikimediaCommonsClient,
} from "../lib/wikimedia-commons";
import { createContentDeskRouter } from "./content-desk";

const rollbackMarker = new Error("Rollback content desk test fixtures");

async function listen(app: Express) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function close(server: ReturnType<Express["listen"]>) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function requestJson(
  baseUrl: string,
  path: string,
  method: string,
  body?: unknown,
) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(text) as Record<string, any>;
  } catch {
    parsed = { raw: text.slice(0, 2000) };
  }
  return {
    response,
    body: parsed,
  };
}

test("Wikimedia Commons adapter normalizes source metadata and rejects external image URLs", async () => {
  const requests: string[] = [];
  const payload = {
    query: {
      pages: [
        {
          title: "File:Campus record.jpg",
          imageinfo: [
            {
              url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Campus.jpg",
              thumburl:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Campus.jpg/640px-Campus.jpg",
              descriptionurl:
                "https://commons.wikimedia.org/wiki/File:Campus_record.jpg",
              extmetadata: {
                LicenseShortName: { value: "CC BY-SA 4.0" },
                LicenseUrl: {
                  value: "https://creativecommons.org/licenses/by-sa/4.0/",
                },
                Artist: {
                  value:
                    '<a href="https://commons.wikimedia.org/wiki/User:Editor">Sample Creator</a>',
                },
                Credit: { value: "Photo by Sample Creator" },
                Copyright: { value: "Copyright statement supplied by source" },
                UsageTerms: { value: "Creative Commons Attribution-ShareAlike 4.0" },
                AttributionRequired: { value: "true" },
                Restrictions: { value: "Review the original file page." },
              },
            },
          ],
        },
        {
          title: "File:External.jpg",
          imageinfo: [{ url: "https://images.example.test/external.jpg" }],
        },
      ],
    },
  };
  const client = createWikimediaCommonsClient(async (input) => {
    requests.push(String(input));
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  const results = await client.searchImages("campus records");
  assert.equal(results.length, 1);
  assert.equal(results[0].fileTitle, "File:Campus record.jpg");
  assert.equal(results[0].license, "CC BY-SA 4.0");
  assert.equal(results[0].creator, "Sample Creator");
  assert.equal(results[0].credit, "Photo by Sample Creator");
  assert.equal(results[0].copyright, "Copyright statement supplied by source");
  assert.match(results[0].usageRights, /Attribution required/);
  assert.match(results[0].usageRights, /Restrictions:/);
  assert.match(requests[0], /gsrnamespace=6/);
  assert.match(requests[0], /gsrlimit=8/);
});

test("image search is rejected by the editor guard before calling Commons", async () => {
  let searchCalled = false;
  const editorGuard: RequestHandler = (_req, res) => {
    res.status(403).json({ message: "Verified editor access is required." });
  };
  const commonsClient: WikimediaCommonsClient = {
    searchImages: async () => {
      searchCalled = true;
      return [];
    },
    getFileByTitle: async () => null,
  };
  const app = express();
  app.use(express.json());
  app.use(createContentDeskRouter(db, editorGuard, commonsClient));
  const { server, baseUrl } = await listen(app);

  try {
    const response = await requestJson(
      baseUrl,
      "/editor/image-search",
      "POST",
      { query: "institution records" },
    );
    assert.equal(response.response.status, 403);
    assert.equal(searchCalled, false);
  } finally {
    await close(server);
  }
});

test("editor source registry and manual discovery queue validate and retain review state", async () => {
  await assert.rejects(
    db.transaction(async (tx) => {
      const editorGuard: RequestHandler = (req, _res, next) => {
        req.editorIdentity = {
          id: "content-desk-test-editor",
          displayName: "Content Desk Test Editor",
        };
        next();
      };
      const commonsResult = {
        source: "Wikimedia Commons" as const,
        fileTitle: "File:Signal Hub test image.jpg",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/00/test.jpg",
        thumbnailUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/test.jpg/640px-test.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Signal_Hub_test_image.jpg",
        license: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        creator: "Commons Artist",
        credit: "Photo by Commons Artist",
        copyright: "Source copyright statement",
        usageRights: "CC BY-SA 4.0; attribution required.",
      };
      const commonsClient: WikimediaCommonsClient = {
        searchImages: async () => [commonsResult],
        getFileByTitle: async (title) =>
          title === commonsResult.fileTitle ? commonsResult : null,
      };
      const app = express();
      app.use(express.json());
      app.use(
        createContentDeskRouter(
          tx as unknown as typeof db,
          editorGuard,
          commonsClient,
        ),
      );
      app.use(
        (
          error: Error & { cause?: unknown },
          _req: express.Request,
          res: express.Response,
          _next: express.NextFunction,
        ) => {
          res.status(500).json({
            message: error.message,
            cause: error.cause instanceof Error ? error.cause.message : undefined,
          });
        },
      );
      const { server, baseUrl } = await listen(app);

      try {
        const sourceInput = {
          sourceName: "Signal Hub Test Source",
          sourceType: "government",
          authorityLevel: "primary",
          domain: "signalhub.test",
          rssUrl: null,
          sitemapUrl: null,
          searchUrl: "https://signalhub.test/search",
          language: "English",
          state: null,
          enabled: true,
        };
        const createdSource = await requestJson(
          baseUrl,
          "/editor/content-sources",
          "POST",
          sourceInput,
        );
        assert.equal(createdSource.response.status, 201);
        assert.equal(createdSource.body.domain, "signalhub.test");
        assert.equal(createdSource.body.crawlFrequency, "manual");
        assert.equal(createdSource.body.lastCheckedAt, null);

        const duplicateDomain = await requestJson(
          baseUrl,
          "/editor/content-sources",
          "POST",
          sourceInput,
        );
        assert.equal(duplicateDomain.response.status, 409);

        const invalidLead = await requestJson(
          baseUrl,
          "/editor/discovery-items",
          "POST",
          {
            sourceId: createdSource.body.id,
            originalUrl: "https://outside.test/not-an-approved-source",
            title: "An editor-entered lead",
            summary: "A short neutral research note.",
            language: "English",
          },
        );
        assert.equal(invalidLead.response.status, 400);

        const leadInput = {
          sourceId: createdSource.body.id,
          originalUrl:
            "https://signalhub.test/records/42/?utm_source=desk#document",
          title: "An editor-entered lead",
          publisher: "Signal Hub Test Source",
          sourcePublishedOn: "2026-09-20",
          author: null,
          summary: "A short neutral research note.",
          language: "English",
          state: "National",
          topic: "Government Orders",
          candidateEventTitle: "Possible event title",
          candidateSourceUrl: "https://signalhub.test/orders/42",
          candidateImageUrl: "https://commons.wikimedia.org/wiki/File:Candidate",
        };
        const createdLead = await requestJson(
          baseUrl,
          "/editor/discovery-items",
          "POST",
          leadInput,
        );
        assert.equal(createdLead.response.status, 201);
        assert.equal(
          createdLead.body.canonicalUrl,
          "https://signalhub.test/records/42",
        );
        assert.equal(createdLead.body.status, "new");
        assert.equal(createdLead.body.sourceName, sourceInput.sourceName);

        const duplicateLead = await requestJson(
          baseUrl,
          "/editor/discovery-items",
          "POST",
          {
            ...leadInput,
            originalUrl: "https://signalhub.test/records/42",
          },
        );
        assert.equal(duplicateLead.response.status, 409);
        assert.equal(duplicateLead.body.duplicateItemId, createdLead.body.id);

        const invalidImageSearch = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          { query: "  " },
        );
        assert.equal(invalidImageSearch.response.status, 400);

        const imageSearch = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          { query: "campus records" },
        );
        assert.equal(imageSearch.response.status, 200);
        assert.equal(imageSearch.body.results.length, 1);
        assert.equal(
          imageSearch.body.results[0].fileTitle,
          commonsResult.fileTitle,
        );

        const createdImageCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          { fileTitle: commonsResult.fileTitle },
        );
        assert.equal(createdImageCandidate.response.status, 201);
        assert.equal(createdImageCandidate.body.rightsStatus, "pending");
        assert.equal(createdImageCandidate.body.source, "Wikimedia Commons");
        assert.equal(
          createdImageCandidate.body.imageUrl,
          commonsResult.imageUrl,
        );
        assert.equal(createdImageCandidate.body.reviewedAt, null);

        const duplicateImageCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          { fileTitle: commonsResult.fileTitle },
        );
        assert.equal(duplicateImageCandidate.response.status, 409);

        const prematureRightsReview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "approved",
            reviewNotes: "Checked the original file page.",
          },
        );
        assert.equal(prematureRightsReview.response.status, 400);

        const imageMetadata = {
          license: commonsResult.license,
          licenseUrl: commonsResult.licenseUrl,
          creator: "Commons Artist",
          credit: "Photo by Commons Artist, CC BY-SA 4.0",
          copyright: "Photograph by Commons Artist; rights governed by CC BY-SA 4.0.",
          usageRights: "CC BY-SA 4.0; attribution and share-alike required.",
          altText: "A public institution building viewed from the main courtyard.",
          caption: "The institution building, photographed from the courtyard.",
        };
        const invalidLicenseLink = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "PATCH",
          { ...imageMetadata, licenseUrl: "http://creativecommons.org/license" },
        );
        assert.equal(invalidLicenseLink.response.status, 400);

        const savedImageMetadata = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "PATCH",
          imageMetadata,
        );
        assert.equal(savedImageMetadata.response.status, 200);
        assert.equal(savedImageMetadata.body.license, imageMetadata.license);
        assert.equal(savedImageMetadata.body.licenseUrl, imageMetadata.licenseUrl);
        assert.equal(savedImageMetadata.body.copyright, imageMetadata.copyright);
        assert.equal(savedImageMetadata.body.altText, imageMetadata.altText);
        assert.equal(savedImageMetadata.body.rightsStatus, "pending");

        const checkedImageRights = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "approved",
            reviewNotes: "Confirmed the license and required attribution on Commons.",
          },
        );
        assert.equal(checkedImageRights.response.status, 200);
        assert.equal(checkedImageRights.body.rightsStatus, "approved");
        assert.equal(
          checkedImageRights.body.reviewedBy,
          "content-desk-test-editor",
        );
        assert.ok(checkedImageRights.body.reviewedAt);

        const changedRightsTerms = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "PATCH",
          {
            ...imageMetadata,
            license: "CC BY 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
            usageRights: "Updated terms requiring editor confirmation.",
          },
        );
        assert.equal(changedRightsTerms.response.status, 200);
        assert.equal(changedRightsTerms.body.license, "CC BY 4.0");
        assert.equal(changedRightsTerms.body.rightsStatus, "pending");
        assert.equal(changedRightsTerms.body.reviewedBy, null);
        assert.equal(changedRightsTerms.body.reviewedAt, null);

        const imageCandidates = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(imageCandidates.response.status, 200);
        assert.equal(imageCandidates.body.candidates.length, 1);
        assert.equal(imageCandidates.body.candidates[0].rightsStatus, "pending");

        const reviewed = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}`,
          "PATCH",
          { status: "review", reviewNotes: "Check the issuing department." },
        );
        assert.equal(reviewed.response.status, 200);
        assert.equal(reviewed.body.status, "review");
        assert.equal(reviewed.body.reviewNotes, "Check the issuing department.");
        assert.equal(reviewed.body.reviewedBy, "content-desk-test-editor");

        const queue = await requestJson(
          baseUrl,
          "/editor/discovery-items",
          "GET",
        );
        assert.equal(queue.response.status, 200);
        assert.equal(queue.body.items.length, 1);
        assert.equal(queue.body.items[0].id, createdLead.body.id);
        assert.equal(queue.body.items[0].status, "review");
      } finally {
        await close(server);
      }

      throw rollbackMarker;
    }),
    (error) => error === rollbackMarker,
  );
});