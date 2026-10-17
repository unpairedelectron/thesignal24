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
import {
  createArtInstituteClient,
  isArtInstituteImageUrl,
  parseArtInstituteArtworkPageUrl,
  type ArtInstituteClient,
} from "../lib/art-institute";
import { createContentDeskRouter } from "./content-desk";
import { eq } from "drizzle-orm";
import { db, discoveryItemsTable, issuesTable } from "@workspace/db";

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

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve: (value?: T) => resolve(value as T) };
}

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
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );

  const { results, nextPage } = await client.searchImages("unclear");
  const [result] = results;
  assert.equal(nextPage, null);
  assert.equal(result.license, "");
  assert.equal(result.creator, "");
  assert.equal(result.credit, "");
  assert.equal(result.copyright, "");
  assert.match(result.usageRights, /does not mark this artwork as public domain/);
});

test("Art Institute adapter uses provider pagination and reports the last page", async () => {
  const requests: URL[] = [];
  const artwork = {
    id: 123,
    title: "Sample campus portrait",
    artist_title: "A. Photographer",
    credit_line: "Gift of the Example Foundation",
    is_public_domain: true,
    copyright_notice: "Copyright notice retained from the museum record.",
    image_id: "abcdef01-2345-6789-abcd-0123456789ab",
  };
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );

  const { results, nextPage } = await client.searchImages("unclear");
  const [result] = results;
  assert.equal(results.length, 1);
  assert.equal(nextPage, null);
  assert.equal(result.source, "Art Institute of Chicago");
  assert.equal(
    result.fileTitle,
    "Sample campus portrait [Art Institute ID 123]",
  );
  assert.equal(
    result.filePageUrl,
    "https://www.artic.edu/artworks/123/sample-campus-portrait",
  );
  assert.equal(
    result.imageUrl,
    "https://www.artic.edu/iiif/2/abcdef01-2345-6789-abcd-0123456789ab/full/2000,/0/default.jpg",
  );
  assert.equal(
    result.thumbnailUrl,
    "https://www.artic.edu/iiif/2/abcdef01-2345-6789-abcd-0123456789ab/full/640,/0/default.jpg",
  );
  assert.equal(result.creator, "A. Photographer");
  assert.equal(result.credit, "Gift of the Example Foundation");
  assert.equal(
    result.license,
    "Public domain (Art Institute designation; verify the source record)",
  );
  assert.equal(result.licenseUrl, null);
  assert.equal(
    result.copyright,
    "Copyright notice retained from the museum record.",
  );
  assert.match(result.usageRights, /marks this artwork as public domain/);
  assert.match(result.usageRights, /API metadata terms do not establish image reuse rights/);
  assert.equal(requests[0].hostname, "api.artic.edu");
  assert.equal(requests[0].searchParams.get("q"), "campus portrait");
  assert.equal(requests[0].searchParams.get("limit"), "8");
  assert.equal(requests[0].searchParams.get("page"), "1");

  assert.equal(
    parseArtInstituteArtworkPageUrl(
      "https://www.artic.edu/artworks/123/sample-campus-portrait",
    ),
    123,
  );
  assert.equal(
    parseArtInstituteArtworkPageUrl(
      "https://www.artic.edu.evil.example/artworks/123",
    ),
    null,
  );
  assert.equal(
    parseArtInstituteArtworkPageUrl(
      "https://www.artic.edu/artworks/123/sample-campus-portrait?redirect=https://evil.test",
    ),
    null,
  );
  assert.equal(
    isArtInstituteImageUrl(result.imageUrl),
    true,
  );
  assert.equal(
    isArtInstituteImageUrl(
      "https://www.artic.edu.evil.example/iiif/2/image/full/2000,/0/default.jpg",
    ),
    false,
  );

  assert.equal(
    await client.getImageByArtworkPageUrl(
      "https://www.artic.edu.evil.example/artworks/123",
      result.imageUrl,
    ),
    null,
  );
  assert.equal(
    await client.getImageByArtworkPageUrl(
      result.filePageUrl,
      result.imageUrl.replace("abcdef01", "bad-image"),
    ),
    null,
  );
  const refreshed = await client.getImageByArtworkPageUrl(
    result.filePageUrl,
    result.imageUrl,
  );
  assert.equal(refreshed?.fileTitle, result.fileTitle);
  assert.equal(requests.length, 3);
});

test("Art Institute adapter leaves unavailable artwork rights metadata explicit", async () => {
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );
  const { results, nextPage } = await client.searchImages("unclear");
  const [result] = results;
  assert.equal(nextPage, null);
  assert.equal(result.license, "");
  assert.equal(result.creator, "");
  assert.equal(result.credit, "");
  assert.equal(result.copyright, "");
  assert.match(result.usageRights, /does not mark this artwork as public domain/);
});

test("Art Institute adapter uses provider pagination and reports the last page", async () => {
  const requests: URL[] = [];
  const artworks = [
    { id: 123, title: "First artwork", image_id: "museum-image-123" },
    { id: 456, title: "Repeated artwork", image_id: "museum-image-456" },
    { id: 789, title: "Last artwork", image_id: "museum-image-789" },
  ];
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );

  const firstPage = await client.searchImages("campus records", 1);
  const lastPage = await client.searchImages("campus", 2);

  assert.equal(firstPage.results.length, 2);
  assert.equal(firstPage.nextPage, 2);
  assert.equal(lastPage.results.length, 2);
  assert.equal(lastPage.nextPage, null);
  assert.equal(
    firstPage.results[1].filePageUrl,
    lastPage.results[0].filePageUrl,
    "a repeated artwork across pages keeps one canonical artwork URL",
  );
  assert.equal(requests[0].searchParams.get("page"), "1");
  assert.equal(requests[1].searchParams.get("page"), "2");
});

test("Art Institute adapter rejects missing, malformed, and mismatched pagination", async () => {
  const invalidResponses = [
    { data: [] },
    { pagination: { total_pages: 2 }, data: [] },
    { pagination: { current_page: 1 }, data: [] },
    { pagination: { current_page: "1", total_pages: 2 }, data: [] },
    { pagination: { current_page: 1, total_pages: "2" }, data: [] },
    { pagination: { current_page: 2, total_pages: 3 }, data: [] },
  ];

  for (const payload of invalidResponses) {
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );
    await assert.rejects(
      client.searchImages("campus", 1),
      /invalid search response/,
      `rejected malformed response: ${JSON.stringify(payload)}`,
    );
  }
});

test("Internet Archive search paginates, preserves item validation, and signals exhaustion", async () => {
  const searchRequests: URL[] = [];
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );

  const firstPage = await client.searchImages("campus records", 1);
  const secondPage = await client.searchImages("campus records", 2);

  assert.equal(firstPage.results.length, 8);
  assert.equal(firstPage.nextPage, 2);
  assert.equal(secondPage.results.length, 2);
  assert.equal(secondPage.nextPage, null);
  assert.equal(
    firstPage.results.at(-1)?.filePageUrl,
    secondPage.results[0].filePageUrl,
    "a repeated item identifier across pages has the same canonical item URL",
  );
  assert.equal(searchRequests[0].searchParams.get("rows"), "8");
  assert.equal(searchRequests[0].searchParams.get("start"), "0");
  assert.equal(searchRequests[1].searchParams.get("start"), "8");
  for (const result of [...firstPage.results, ...secondPage.results]) {
    assert.equal(result.source, "Internet Archive");
    assert.equal(
      isInternetArchiveImageUrlForItem(result.filePageUrl, result.imageUrl),
      true,
    );
    assert.equal(result.license, "Rights information retained from the item");
    assert.equal(result.creator, "Archive contributor");
    assert.equal(result.credit, "Archive credit line");
    assert.equal(result.copyright, "Uploader-supplied copyright notice");
    assert.equal(result.usageRights, "Review original item terms");
  }
});

test("Internet Archive search reports exhausted results when there are no matches", async () => {
  const client = createInternetArchiveClient(async () =>
    new Response(
      JSON.stringify({ response: { docs: [], numFound: 0 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );

  assert.deepEqual(await client.searchImages("no archive matches"), {
    results: [],
    nextPage: null,
  });
});

test("image search is rejected by the editor guard before calling Commons", async () => {
  let searchCalled = false;
  let fileLookupCalled = false;
      const editorGuard: RequestHandler = (req, _res, next) => {
        req.editorIdentity = {
          id: "content-desk-test-editor",
          displayName: "Content Desk Test Editor",
        };
        next();
      };
      const commonsClient: WikimediaCommonsClient = {
        searchImages: async () =>
          currentCommonsResult ? [currentCommonsResult] : [],
        getFileByTitle: async (title) => {
          if (commonsLookupError) {
            throw new Error("Simulated Wikimedia Commons outage");
          }
          const gate = commonsLookupGate;
          if (gate) {
            commonsLookupGate = undefined;
            gate.started.resolve();
            await gate.release.promise;
          }
          return title === commonsResult.fileTitle
            ? currentCommonsResult
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
          museumClient,
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
      const museumResult: EditorImageCandidateSearchResult = {
        source: "Art Institute of Chicago" as const,
        fileTitle: "The campus portrait [Art Institute ID 8123]",
        imageUrl:
          "https://www.artic.edu/iiif/2/abcdef01-2345-6789-abcd-0123456789ab/full/2000,/0/default.jpg",
        thumbnailUrl:
          "https://www.artic.edu/iiif/2/abcdef01-2345-6789-abcd-0123456789ab/full/640,/0/default.jpg",
        filePageUrl:
          "https://www.artic.edu/artworks/8123/the-campus-portrait",
        license: "Public domain (Art Institute designation; verify the source record)",
        licenseUrl: null,
        creator: "Museum photographer",
        credit: "Gift of the Campus Foundation",
        copyright: "Museum copyright notice",
        usageRights:
          "The Art Institute of Chicago marks this artwork as public domain. API metadata terms do not establish image reuse rights; editor review is required.",
      };
      let currentCommonsResult: EditorImageCandidateSearchResult | null =
        commonsResult;
      let commonsLookupError = false;

      let commonsLookupGate:
        | {
            started: ReturnType<typeof deferred>;
            release: ReturnType<typeof deferred>;
          }
        | undefined;
      let currentArchiveResult: EditorImageCandidateSearchResult | null =
        archiveResult;
      let archiveLookupError = false;
      let archiveLookupCalled = false;
      let currentMuseumResult: EditorImageCandidateSearchResult | null =
        museumResult;
      let museumSearchUnavailable = false;
      let museumLookupCalled = false;
      const commonsClient: WikimediaCommonsClient = {
        searchImages: async () =>
          currentCommonsResult ? [currentCommonsResult] : [],
        getFileByTitle: async (title) => {
          if (commonsLookupError) {
            throw new Error("Simulated Wikimedia Commons outage");
          }
          const gate = commonsLookupGate;
          if (gate) {
            commonsLookupGate = undefined;
            gate.started.resolve();
            await gate.release.promise;
          }
          return title === commonsResult.fileTitle
            ? currentCommonsResult
            : null;
        },
      };
      const archiveClient = {
        searchImages: async (_query: string, page = 1) => ({
          results: currentArchiveResult ? [currentArchiveResult] : [],
          nextPage: page === 1 ? 2 : null,
        }),
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
      const museumClient: ArtInstituteClient = {
        searchImages: async (_query, page = 1) => {
          if (museumSearchUnavailable) {
            throw new Error("Art Institute of Chicago returned an invalid search response.");
          }
          return {
            results: currentMuseumResult ? [currentMuseumResult] : [],
            nextPage: page === 1 ? 2 : null,
          };
        },
        getImageByArtworkPageUrl: async (filePageUrl, imageUrl) => {
          museumLookupCalled = true;
          return currentMuseumResult?.filePageUrl === filePageUrl &&
            currentMuseumResult.imageUrl === imageUrl
            ? currentMuseumResult
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
          museumClient,
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
        assert.equal(archiveSearch.body.nextPage, 2);
        assert.equal(
          archiveSearch.body.results[0].creator,
          archiveResult.creator,
        );
        const archiveSearchPageTwo = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          { query: "college courtyard", source: "Internet Archive", page: 2 },
        );
        assert.equal(archiveSearchPageTwo.response.status, 200);
        assert.equal(archiveSearchPageTwo.body.nextPage, null);

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

        const museumSearch = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          {
            query: "campus portrait",
            source: "Art Institute of Chicago",
          },
        );
        assert.equal(museumSearch.response.status, 200);
        assert.equal(
          museumSearch.body.results[0].source,
          "Art Institute of Chicago",
        );
        assert.equal(museumSearch.body.nextPage, 2);
        assert.equal(museumSearch.body.results[0].credit, museumResult.credit);
        const museumSearchPageTwo = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          {
            query: "campus portrait",
            source: "Art Institute of Chicago",
            page: 2,
          },
        );
        assert.equal(museumSearchPageTwo.response.status, 200);
        assert.equal(museumSearchPageTwo.body.nextPage, null);

        museumSearchUnavailable = true;
        const failedMuseumSearch = await requestJson(
          baseUrl,
          "/editor/image-search",
          "POST",
          {
            query: "campus portrait",
            source: "Art Institute of Chicago",
            page: 2,
          },
        );
        assert.equal(failedMuseumSearch.response.status, 502);
        assert.equal(
          failedMuseumSearch.body.message,
          "Art Institute of Chicago could not be reached. Try again later.",
        );
        museumSearchUnavailable = false;

        museumLookupCalled = false;
        const invalidMuseumCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Art Institute of Chicago",
            fileTitle: museumResult.fileTitle,
            filePageUrl:
              "https://www.artic.edu.attacker.example/artworks/8123/the-campus-portrait",
            imageUrl: museumResult.imageUrl,
          },
        );
        assert.equal(invalidMuseumCandidate.response.status, 400);
        assert.equal(museumLookupCalled, false);

        const createdMuseumCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Art Institute of Chicago",
            fileTitle: museumResult.fileTitle,
            filePageUrl: museumResult.filePageUrl,
            imageUrl: museumResult.imageUrl,
          },
        );
        assert.equal(createdMuseumCandidate.response.status, 201);
        assert.equal(museumLookupCalled, true);
        assert.equal(
          createdMuseumCandidate.body.source,
          "Art Institute of Chicago",
        );
        assert.equal(createdMuseumCandidate.body.rightsStatus, "pending");
        assert.equal(createdMuseumCandidate.body.reviewedAt, null);
        assert.equal(createdMuseumCandidate.body.filePageUrl, museumResult.filePageUrl);
        assert.equal(createdMuseumCandidate.body.creator, museumResult.creator);
        assert.equal(createdMuseumCandidate.body.credit, museumResult.credit);
        assert.equal(
          createdMuseumCandidate.body.license,
          museumResult.license,
        );
        assert.equal(
          createdMuseumCandidate.body.copyright,
          museumResult.copyright,
        );
        assert.equal(
          createdMuseumCandidate.body.usageRights,
          museumResult.usageRights,
        );

        const duplicateMuseumCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Art Institute of Chicago",
            fileTitle: museumResult.fileTitle,
            filePageUrl: museumResult.filePageUrl,
            imageUrl: museumResult.imageUrl,
          },
        );
        assert.equal(duplicateMuseumCandidate.response.status, 409);

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
        assert.equal(checkedImageRights.body.rightsHistory.length, 2);
        assert.equal(
          checkedImageRights.body.rightsHistory[0].eventType,
          "decision_recorded",
        );
        assert.equal(
          checkedImageRights.body.rightsHistory[0].previousRightsStatus,
          "pending",
        );
        assert.equal(
          checkedImageRights.body.rightsHistory[0].newRightsStatus,
          "approved",
        );
        assert.equal(
          checkedImageRights.body.rightsHistory[0].newReviewNotes,
          "Confirmed the license and required attribution on Commons.",
        );
        assert.equal(
          checkedImageRights.body.rightsHistory[0].newReviewedBy,
          "content-desk-test-editor",
        );
        assert.deepEqual(
          checkedImageRights.body.rightsHistory[0].previousMetadata,
          checkedImageRights.body.rightsHistory[0].newMetadata,
        );

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
        assert.equal(changedRightsTerms.body.rightsHistory.length, 3);
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
        assert.equal(reapprovedImageRights.body.rightsHistory.length, 4);
        assert.equal(
          reapprovedImageRights.body.rightsHistory[0].eventType,
          "decision_recorded",
        );
        assert.equal(
          reapprovedImageRights.body.rightsHistory[0].newRightsStatus,
          "approved",
        );

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
          4,
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
          4,
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
          5,
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
          5,
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
          5,
        );

        const rejectedImageRights = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "rejected",
            reviewNotes: "The source does not establish acceptable reuse terms.",
          },
        );
        assert.equal(rejectedImageRights.response.status, 200);
        assert.equal(rejectedImageRights.body.rightsStatus, "rejected");
        assert.equal(rejectedImageRights.body.rightsHistory.length, 6);
        assert.equal(
          rejectedImageRights.body.rightsHistory[0].eventType,
          "decision_recorded",
        );
        assert.equal(
          rejectedImageRights.body.rightsHistory[0].previousRightsStatus,
          "pending",
        );
        assert.equal(
          rejectedImageRights.body.rightsHistory[0].newRightsStatus,
          "rejected",
        );
        assert.equal(
          rejectedImageRights.body.rightsHistory[0].newReviewNotes,
          "The source does not establish acceptable reuse terms.",
        );
        assert.deepEqual(
          rejectedImageRights.body.rightsHistory[0].previousMetadata,
          rejectedImageRights.body.rightsHistory[0].newMetadata,
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

        const beforeOverlappingManualEdit = (
          await requestJson(
            baseUrl,
            `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdImageCandidate.body.id,
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

        const candidateBeforeRemoval = imageCandidates.body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdImageCandidate.body.id,
        );
        assert.ok(candidateBeforeRemoval);
        const removedCandidate = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "DELETE",
        );
        assert.equal(removedCandidate.response.status, 200);
        assert.equal(removedCandidate.body.removedBy, "content-desk-test-editor");
        assert.ok(removedCandidate.body.removedAt);
        assert.equal(removedCandidate.body.fileTitle, candidateBeforeRemoval.fileTitle);
        assert.deepEqual(
          removedCandidate.body.rightsHistory,
          candidateBeforeRemoval.rightsHistory,
        );

        const activeCandidatesAfterRemoval = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          activeCandidatesAfterRemoval.body.candidates.some(
            (candidate: { id: number }) =>
              candidate.id === createdImageCandidate.body.id,
          ),
          false,
        );
        const archiveAfterCandidateRemoval = await requestJson(
          baseUrl,
          "/editor/image-candidates/archive",
          "GET",
        );
        const archivedCandidate =
          archiveAfterCandidateRemoval.body.candidates.find(
            (candidate: { id: number }) =>
              candidate.id === createdImageCandidate.body.id,
          );
        assert.ok(archivedCandidate);
        assert.equal(archivedCandidate.removedBy, "content-desk-test-editor");
        assert.equal(archivedCandidate.fileTitle, candidateBeforeRemoval.fileTitle);
        assert.deepEqual(
          archivedCandidate.rightsHistory,
          candidateBeforeRemoval.rightsHistory,
        );
        assert.equal(
          archivedCandidate.rightsHistory[0].changedBy,
          "content-desk-test-editor",
        );
        assert.ok(archivedCandidate.rightsHistory[0].changedAt);
        assert.equal(
          archivedCandidate.rightsHistory[0].previousMetadata.credit,
          candidateBeforeRemoval.rightsHistory[0].previousMetadata.credit,
        );
        assert.equal(
          archivedCandidate.rightsHistory[0].newMetadata.credit,
          candidateBeforeRemoval.rightsHistory[0].newMetadata.credit,
        );
        const editArchivedCandidate = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "PATCH",
          {
            license: "CC BY-SA 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
            creator: "Commons Artist",
            credit: "Changed after removal",
            copyright: "Source copyright statement",
            usageRights: "CC BY-SA 4.0; attribution required.",
            altText: "Campus",
            caption: "Campus archive image",
          },
        );
        assert.equal(editArchivedCandidate.response.status, 404);

        const detachedCandidateHistory = (
          await requestJson(
            baseUrl,
            `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdArchiveCandidate.body.id,
        ).rightsHistory;
        assert.ok(detachedCandidateHistory.length > 0);
        await tx
          .delete(discoveryItemsTable)
          .where(eq(discoveryItemsTable.id, createdLead.body.id));
        const archiveAfterLeadRemoval = await requestJson(
          baseUrl,
          "/editor/image-candidates/archive",
          "GET",
        );
        const detachedCandidate = archiveAfterLeadRemoval.body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdArchiveCandidate.body.id,
        );
        assert.ok(detachedCandidate);
        assert.equal(detachedCandidate.discoveryItemId, null);
        assert.equal(detachedCandidate.removedAt, null);
        assert.equal(detachedCandidate.fileTitle, createdArchiveCandidate.body.fileTitle);
        assert.deepEqual(
          detachedCandidate.rightsHistory,
          detachedCandidateHistory,
        );
        assert.equal(
          detachedCandidate.rightsHistory[0].changedBy,
          "content-desk-test-editor",
        );
        assert.ok(detachedCandidate.rightsHistory[0].changedAt);
      } finally {
        await close(server);
      }

      throw rollbackMarker;
    }),
    (error) => error === rollbackMarker,
  );
});

        const previewDuringReview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );

        const reviewGate = {
          started: deferred(),
          release: deferred(),
        };

        const conflictedReviewApply = await applyDuringReview;

        const conflictedApply = await overlappingApply;

        const overlappingApply = requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          { expectedMetadata: previewDuringManualEdit.body.currentMetadata },
        );

        const manualEditGate = {
          started: deferred(),
          release: deferred(),
        };

        const applyDuringReview = requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          { expectedMetadata: previewDuringReview.body.currentMetadata },
        );

        let candidateAfterOverlap = (
          await requestJson(
            baseUrl,
            `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdImageCandidate.body.id,
        );

        const overlappingManualEdit = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "PATCH",
          {
            ...imageMetadata,
            license: "CC BY 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
            credit: "Manual credit saved during source lookup.",
            usageRights: "Manual terms saved during source lookup.",
          },
        );

        const newerRightsDecision = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "approved",
            reviewNotes: "Confirmed the saved terms while the source check was pending.",
          },
        );

        const previewDuringManualEdit = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
