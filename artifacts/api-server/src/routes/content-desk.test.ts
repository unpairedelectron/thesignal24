import assert from "node:assert/strict";
import { once } from "node:events";
import express, { type Express, type RequestHandler } from "express";
import { test } from "node:test";
import type { EditorImageCandidateSearchResult } from "@workspace/api-zod";
import {
  createWikimediaCommonsClient,
  type WikimediaCommonsClient,
} from "../lib/wikimedia-commons";
import {
  createInternetArchiveClient,
  isInternetArchiveImageUrlForItem,
  parseInternetArchiveItemPageUrl,
} from "../lib/internet-archive";
import { createContentDeskRouter } from "./content-desk";
import { eq } from "drizzle-orm";
import { db, issuesTable } from "@workspace/db";

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

test("Internet Archive adapter validates provider URLs and preserves item rights metadata", async () => {
  const requests: URL[] = [];
  const payload = {
    metadata: {
      identifier: "public-archive-photo",
      mediatype: "image",
      title: "The college courtyard",
      creator: ["Photographer A", "Institution Photo Unit"],
      credit: "Photo courtesy of Example Archive",
      copyright: "Copyright notice retained from the item record.",
      license: "CC BY 4.0",
      licenseurl: "http://creativecommons.org/licenses/by/4.0/",
      rights: "CC BY 4.0; preserve the original credit line.",
    },
    files: [
      { name: "courtyard.jpg", source: "original", format: "JPEG" },
      {
        name: "courtyard_thumb.jpg",
        source: "derivative",
        format: "JPEG Thumb",
      },
    ],
  };
  const client = createInternetArchiveClient(async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    if (url.pathname === "/advancedsearch.php") {
      return new Response(
        JSON.stringify({
          response: {
            docs: [{ identifier: "public-archive-photo", title: "The college courtyard" }],
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  const [result] = await client.searchImages("campus records");
  assert.equal(result.source, "Internet Archive");
  assert.equal(result.fileTitle, "The college courtyard [public-archive-photo]");
  assert.equal(result.filePageUrl, "https://archive.org/details/public-archive-photo");
  assert.equal(
    result.imageUrl,
    "https://archive.org/download/public-archive-photo/courtyard.jpg",
  );
  assert.equal(
    result.thumbnailUrl,
    "https://archive.org/services/img/public-archive-photo",
  );
  assert.equal(result.license, "CC BY 4.0");
  assert.equal(
    result.licenseUrl,
    "https://creativecommons.org/licenses/by/4.0/",
  );
  assert.equal(
    result.creator,
    "Photographer A; Institution Photo Unit",
  );
  assert.equal(result.credit, "Photo courtesy of Example Archive");
  assert.equal(
    result.copyright,
    "Copyright notice retained from the item record.",
  );
  assert.equal(
    result.usageRights,
    "CC BY 4.0; preserve the original credit line.",
  );
  assert.match(requests[0].searchParams.get("q") ?? "", /mediatype:image/);
  assert.equal(requests[0].searchParams.get("output"), "json");

  assert.equal(
    parseInternetArchiveItemPageUrl(
      "https://archive.org/details/public-archive-photo",
    ),
    "public-archive-photo",
  );
  assert.equal(
    parseInternetArchiveItemPageUrl(
      "http://archive.org/details/public-archive-photo",
    ),
    null,
  );
  assert.equal(
    parseInternetArchiveItemPageUrl(
      "https://archive.org.attacker.test/details/public-archive-photo",
    ),
    null,
  );
  assert.equal(
    parseInternetArchiveItemPageUrl(
      "https://editor@archive.org/details/public-archive-photo",
    ),
    null,
  );
  assert.equal(
    isInternetArchiveImageUrlForItem(
      result.filePageUrl,
      "https://archive.org/download/another-item/courtyard.jpg",
    ),
    false,
  );
  assert.equal(
    isInternetArchiveImageUrlForItem(
      result.filePageUrl,
      "https://images.example.test/courtyard.jpg",
    ),
    false,
  );
  assert.equal(
    isInternetArchiveImageUrlForItem(
      result.filePageUrl,
      "https://archive.org:8443/download/public-archive-photo/courtyard.jpg",
    ),
    false,
  );
  assert.equal(
    isInternetArchiveImageUrlForItem(
      result.filePageUrl,
      "https://archive.org/download/public-archive-photo/courtyard%2Fimage.jpg",
    ),
    false,
  );
  assert.equal(
    isInternetArchiveImageUrlForItem(
      result.filePageUrl,
      "https://archive.org/download/public-archive-photo/%2e%2e",
    ),
    false,
  );
});

test("image search is rejected by the editor guard before calling Commons", async () => {
  let searchCalled = false;
  let fileLookupCalled = false;
  const editorGuard: RequestHandler = (_req, res) => {
    res.status(403).json({ message: "Verified editor access required." });
  };
  const commonsClient: WikimediaCommonsClient = {
    searchImages: async () => {
      searchCalled = true;
      return [];
    },
    getFileByTitle: async () => {
      fileLookupCalled = true;
      return null;
    },
  };
  const app = express();
  app.use(express.json());
  app.use(createContentDeskRouter(undefined, editorGuard, commonsClient));
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
    const recheckResponse = await requestJson(
      baseUrl,
      "/editor/image-candidates/1/recheck",
      "POST",
    );
    assert.equal(recheckResponse.response.status, 403);
    assert.equal(fileLookupCalled, false);
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
      const commonsResult: EditorImageCandidateSearchResult = {
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
      const archiveResult: EditorImageCandidateSearchResult = {
        source: "Internet Archive" as const,
        fileTitle: "The college courtyard [signalhub-archive-test]",
        imageUrl:
          "https://archive.org/download/signalhub-archive-test/courtyard.jpg",
        thumbnailUrl:
          "https://archive.org/services/img/signalhub-archive-test",
        filePageUrl: "https://archive.org/details/signalhub-archive-test",
        license: "CC BY 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        creator: "Archive photographer",
        credit: "Photo courtesy of the contributor",
        copyright: "Contributor copyright statement",
        usageRights: "Use under CC BY 4.0 with attribution.",
      };
      let currentCommonsResult: EditorImageCandidateSearchResult | null =
        commonsResult;
      let commonsLookupError = false;
      let currentArchiveResult: EditorImageCandidateSearchResult | null =
        archiveResult;
      let archiveLookupError = false;
      let archiveLookupCalled = false;
      const commonsClient: WikimediaCommonsClient = {
        searchImages: async () =>
          currentCommonsResult ? [currentCommonsResult] : [],
        getFileByTitle: async (title) => {
          if (commonsLookupError) {
            throw new Error("Simulated Wikimedia Commons outage");
          }
          return title === commonsResult.fileTitle
            ? currentCommonsResult
            : null;
        },
      };
      const archiveClient = {
        searchImages: async () =>
          currentArchiveResult ? [currentArchiveResult] : [],
        getImageByItemUrl: async (filePageUrl: string, imageUrl: string) => {
          archiveLookupCalled = true;
          if (archiveLookupError) {
            throw new Error("Simulated Internet Archive outage");
          }
          return currentArchiveResult?.filePageUrl === filePageUrl &&
            currentArchiveResult.imageUrl === imageUrl
            ? currentArchiveResult
            : null;
        },
      };
      const app = express();
      app.use(express.json());
      app.use(
        createContentDeskRouter(
          tx as unknown as typeof db,
          editorGuard,
          commonsClient,
          archiveClient,
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

        const [issue] = await tx
          .insert(issuesTable)
          .values({
            issueDate: "2026-09-27",
            issueNumber: 4242,
            status: "published",
            title: "Test editorial issue",
            intro: "A transactional fixture for content desk tests.",
          })
          .returning();
        const createdSource = await requestJson(
          baseUrl,
          "/editor/content-sources",
          "POST",
          sourceInput,
        );
        assert.equal(
          createdSource.response.status,
          201,
          JSON.stringify(createdSource.body),
        );
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

        const promotionInput = {
          issueId: issue.id,
          topic: "Courts & Policy",
          title: "An original editorial headline",
          dek: "An original editorial standfirst written for the draft.",
          body: "An original body that adds context and reporting beyond the source lead.",
        };
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
          createdImageCandidate.body.sourceAvailabilityStatus,
          "available",
        );
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

        archiveLookupCalled = false;
        const invalidArchiveCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Internet Archive",
            fileTitle: archiveResult.fileTitle,
            filePageUrl: "https://archive.org.attacker.test/details/forged",
            imageUrl: "https://archive.org/download/forged/image.jpg",
          },
        );
        assert.equal(invalidArchiveCandidate.response.status, 400);
        assert.equal(archiveLookupCalled, false);

        const archiveSearch = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          { query: "college courtyard", source: "Internet Archive" },
        );
        assert.equal(archiveSearch.response.status, 200);
        assert.equal(archiveSearch.body.results[0].source, "Internet Archive");
        assert.equal(
          archiveSearch.body.results[0].creator,
          archiveResult.creator,
        );

        const createdArchiveCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Internet Archive",
            fileTitle: archiveResult.fileTitle,
            filePageUrl: archiveResult.filePageUrl,
            imageUrl: archiveResult.imageUrl,
          },
        );
        assert.equal(createdArchiveCandidate.response.status, 201);
        assert.equal(createdArchiveCandidate.body.source, "Internet Archive");
        assert.equal(createdArchiveCandidate.body.rightsStatus, "pending");
        assert.equal(
          createdArchiveCandidate.body.filePageUrl,
          archiveResult.filePageUrl,
        );
        assert.equal(
          createdArchiveCandidate.body.imageUrl,
          archiveResult.imageUrl,
        );
        assert.equal(createdArchiveCandidate.body.license, archiveResult.license);
        assert.equal(
          createdArchiveCandidate.body.licenseUrl,
          archiveResult.licenseUrl,
        );
        assert.equal(createdArchiveCandidate.body.creator, archiveResult.creator);
        assert.equal(createdArchiveCandidate.body.credit, archiveResult.credit);
        assert.equal(
          createdArchiveCandidate.body.copyright,
          archiveResult.copyright,
        );
        assert.equal(
          createdArchiveCandidate.body.usageRights,
          archiveResult.usageRights,
        );

        const duplicateArchiveCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Internet Archive",
            fileTitle: archiveResult.fileTitle,
            filePageUrl: archiveResult.filePageUrl,
            imageUrl: archiveResult.imageUrl,
          },
        );
        assert.equal(duplicateArchiveCandidate.response.status, 409);

        currentArchiveResult = {
          ...archiveResult,
          credit: "Updated archive credit line",
        };
        const archiveRightsPreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdArchiveCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(archiveRightsPreview.response.status, 200);
        assert.deepEqual(archiveRightsPreview.body.changedFields, ["credit"]);
        const archiveHistoryBeforeApply = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.deepEqual(
          archiveHistoryBeforeApply.body.candidates.find(
            (candidate: Record<string, any>) =>
              candidate.id === createdArchiveCandidate.body.id,
          ).rightsHistory,
          [],
        );
        const archiveRightsApplied = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdArchiveCandidate.body.id}/recheck/apply`,
          "POST",
          { expectedMetadata: archiveRightsPreview.body.currentMetadata },
        );
        assert.equal(archiveRightsApplied.response.status, 200);
        assert.equal(archiveRightsApplied.body.rightsTermsChanged, true);
        assert.equal(archiveRightsApplied.body.candidate.rightsStatus, "pending");
        assert.equal(
          archiveRightsApplied.body.candidate.credit,
          "Updated archive credit line",
        );
        assert.equal(
          archiveRightsApplied.body.candidate.rightsHistory.length,
          1,
        );
        assert.equal(
          archiveRightsApplied.body.candidate.rightsHistory[0].previousRightsStatus,
          "pending",
        );
        assert.equal(
          archiveRightsApplied.body.candidate.rightsHistory[0].previousMetadata.credit,
          archiveResult.credit,
        );
        assert.equal(
          archiveRightsApplied.body.candidate.rightsHistory[0].newMetadata.credit,
          "Updated archive credit line",
        );
        assert.equal(
          archiveRightsApplied.body.candidate.rightsHistory[0].changedBy,
          "content-desk-test-editor",
        );
        assert.equal(
          archiveRightsApplied.body.candidate.rightsHistory[0].changeSource,
          "source_recheck",
        );
        assert.ok(
          archiveRightsApplied.body.candidate.rightsHistory[0].changedAt,
        );

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
        assert.equal(changedRightsTerms.body.rightsHistory.length, 2);
        assert.equal(
          changedRightsTerms.body.rightsHistory[0].previousRightsStatus,
          "approved",
        );
        assert.equal(
          changedRightsTerms.body.rightsHistory[0].previousReviewNotes,
          "Confirmed the license and required attribution on Commons.",
        );
        assert.equal(
          changedRightsTerms.body.rightsHistory[0].previousReviewedBy,
          "content-desk-test-editor",
        );
        assert.ok(
          changedRightsTerms.body.rightsHistory[0].previousReviewedAt,
        );
        assert.equal(
          changedRightsTerms.body.rightsHistory[0].previousMetadata.license,
          commonsResult.license,
        );
        assert.equal(
          changedRightsTerms.body.rightsHistory[0].newMetadata.license,
          "CC BY 4.0",
        );
        assert.equal(
          changedRightsTerms.body.rightsHistory[0].changeSource,
          "editor_edit",
        );

        const savedRightsMetadata = {
          license: changedRightsTerms.body.license,
          licenseUrl: changedRightsTerms.body.licenseUrl,
          creator: changedRightsTerms.body.creator,
          credit: changedRightsTerms.body.credit,
          copyright: changedRightsTerms.body.copyright,
          usageRights: changedRightsTerms.body.usageRights,
        };
        currentCommonsResult = {
          ...commonsResult,
          ...savedRightsMetadata,
        };
        const reapprovedImageRights = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "approved",
            reviewNotes: "Rechecked the current Commons file page.",
          },
        );
        assert.equal(reapprovedImageRights.response.status, 200);
        assert.equal(reapprovedImageRights.body.rightsStatus, "approved");

        const unchangedSourcePreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(unchangedSourcePreview.response.status, 200);
        assert.deepEqual(unchangedSourcePreview.body.changedFields, []);
        const unchangedSourceApply = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          {
            expectedMetadata: unchangedSourcePreview.body.currentMetadata,
          },
        );
        assert.equal(unchangedSourceApply.response.status, 200);
        assert.equal(unchangedSourceApply.body.rightsTermsChanged, false);
        assert.equal(
          unchangedSourceApply.body.candidate.rightsStatus,
          "approved",
        );
        assert.equal(
          unchangedSourceApply.body.candidate.reviewedAt,
          reapprovedImageRights.body.reviewedAt,
        );

        const changedCommonsTerms: EditorImageCandidateSearchResult = {
          ...currentCommonsResult!,
          license: "CC BY 3.0",
          licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
          creator: "Updated Commons Artist",
          credit: "Updated photo credit",
          copyright: "Updated copyright notice",
          usageRights: "Updated Commons usage terms.",
        };
        currentCommonsResult = changedCommonsTerms;
        const changedSourcePreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(changedSourcePreview.response.status, 200);
        assert.deepEqual(changedSourcePreview.body.changedFields, [
          "license",
          "licenseUrl",
          "creator",
          "credit",
          "copyright",
          "usageRights",
        ]);
        const historyAfterPreview = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          historyAfterPreview.body.candidates[0].rightsHistory.length,
          2,
        );
        const beforeApplyingSourceChanges = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          beforeApplyingSourceChanges.body.candidates[0].rightsStatus,
          "approved",
        );
        assert.equal(
          beforeApplyingSourceChanges.body.candidates[0].license,
          savedRightsMetadata.license,
        );

        currentCommonsResult = {
          ...changedCommonsTerms,
          credit: "A newer credit statement on Commons.",
        };
        const staleSourceApply = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          {
            expectedMetadata: changedSourcePreview.body.currentMetadata,
          },
        );
        assert.equal(staleSourceApply.response.status, 409);
        const afterStaleSourceApply = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          afterStaleSourceApply.body.candidates[0].rightsStatus,
          "approved",
        );
        assert.equal(
          afterStaleSourceApply.body.candidates[0].credit,
          savedRightsMetadata.credit,
        );
        assert.equal(
          afterStaleSourceApply.body.candidates[0].rightsHistory.length,
          2,
        );

        const latestSourcePreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        const appliedSourceChanges = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          {
            expectedMetadata: latestSourcePreview.body.currentMetadata,
          },
        );
        assert.equal(appliedSourceChanges.response.status, 200);
        assert.equal(appliedSourceChanges.body.rightsTermsChanged, true);
        assert.equal(
          appliedSourceChanges.body.candidate.rightsStatus,
          "pending",
        );
        assert.equal(appliedSourceChanges.body.candidate.reviewNotes, "");
        assert.equal(appliedSourceChanges.body.candidate.reviewedBy, null);
        assert.equal(appliedSourceChanges.body.candidate.reviewedAt, null);
        assert.equal(
          appliedSourceChanges.body.candidate.credit,
          "A newer credit statement on Commons.",
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory.length,
          3,
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory[0].previousRightsStatus,
          "approved",
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory[0].previousReviewNotes,
          "Rechecked the current Commons file page.",
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory[0].previousReviewedBy,
          "content-desk-test-editor",
        );
        assert.ok(
          appliedSourceChanges.body.candidate.rightsHistory[0].previousReviewedAt,
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory[0].previousMetadata.license,
          savedRightsMetadata.license,
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory[0].newMetadata.license,
          "CC BY 3.0",
        );
        assert.equal(
          appliedSourceChanges.body.candidate.rightsHistory[0].changeSource,
          "source_recheck",
        );

        const stablePreviewBeforeOutage = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        commonsLookupError = true;
        const failedSourceApply = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          {
            expectedMetadata: stablePreviewBeforeOutage.body.currentMetadata,
          },
        );
        assert.equal(failedSourceApply.response.status, 502);
        commonsLookupError = false;
        const afterFailedSourceApply = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          afterFailedSourceApply.body.candidates[0].license,
          appliedSourceChanges.body.candidate.license,
        );
        assert.equal(
          afterFailedSourceApply.body.candidates[0].rightsStatus,
          "pending",
        );
        assert.equal(
          afterFailedSourceApply.body.candidates[0].sourceAvailabilityStatus,
          "available",
        );
        assert.equal(
          afterFailedSourceApply.body.candidates[0].rightsHistory.length,
          3,
        );

        currentCommonsResult = null;
        const removedSourceRecheck = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(removedSourceRecheck.response.status, 404);
        const removedSourceApply = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          {
            expectedMetadata: stablePreviewBeforeOutage.body.currentMetadata,
          },
        );
        assert.equal(removedSourceApply.response.status, 404);
        const afterRemovedSourceRecheck = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          afterRemovedSourceRecheck.body.candidates[0].credit,
          appliedSourceChanges.body.candidate.credit,
        );
        assert.equal(
          afterRemovedSourceRecheck.body.candidates[0].rightsStatus,
          "pending",
        );
        assert.equal(
          afterRemovedSourceRecheck.body.candidates[0].sourceAvailabilityStatus,
          "missing",
        );
        assert.equal(
          afterRemovedSourceRecheck.body.candidates[0].license,
          appliedSourceChanges.body.candidate.license,
        );
        assert.equal(
          afterRemovedSourceRecheck.body.candidates[0].credit,
          appliedSourceChanges.body.candidate.credit,
        );
        assert.equal(
          afterRemovedSourceRecheck.body.candidates[0].rightsHistory.length,
          3,
        );

        currentCommonsResult = changedCommonsTerms;
        const recoveredSourceRecheck = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(recoveredSourceRecheck.response.status, 200);
        const afterRecoveredSourceRecheck = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          afterRecoveredSourceRecheck.body.candidates[0]
            .sourceAvailabilityStatus,
          "available",
        );
        assert.equal(
          afterRecoveredSourceRecheck.body.candidates[0].license,
          appliedSourceChanges.body.candidate.license,
        );

        const imageCandidates = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(imageCandidates.response.status, 200);

        const unreviewedPromotion = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/promote`,
          "POST",
          promotionInput,
        );
        const reviewed = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}`,
          "PATCH",
          { status: "review", reviewNotes: "Check the issuing department." },
        );
        assert.equal(unreviewedPromotion.response.status, 409);
        assert.equal(reviewed.response.status, 200);

        const blankPromotion = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/promote`,
          "POST",
          { ...promotionInput, title: "   " },
        );
        const queue = await requestJson(
          baseUrl,
          "/editor/discovery-items",
          "GET",
        );
        assert.equal(blankPromotion.response.status, 400);
        assert.equal(queue.response.status, 200);

        const promoted = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/promote`,
          "POST",
          promotionInput,
        );
        assert.equal(promoted.response.status, 200);
        assert.ok(promoted.body.promotedStoryId);

        const duplicatePromotion = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/promote`,
          "POST",
          promotionInput,
        );
        assert.equal(duplicatePromotion.response.status, 409);

        const unreviewPromotedLead = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}`,
          "PATCH",
          { status: "rejected", reviewNotes: "Do not change promoted state." },
        );
        assert.equal(unreviewPromotedLead.response.status, 409);
      } finally {
        await close(server);
      }

      throw rollbackMarker;
    }),
    (error) => error === rollbackMarker,
  );
});
