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
test("Wikimedia Commons adapter searches files and maps rights metadata", async () => {
  const requests: URL[] = [];
  const client = createWikimediaCommonsClient(async (input) => {
    requests.push(new URL(String(input)));
    return new Response(
      JSON.stringify({
        query: {
          pages: [
            {
              title: "File:Campus record.jpg",
              imageinfo: [
                {
                  url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Campus.jpg",
                  thumburl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Campus.jpg/640px-Campus.jpg",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:Campus_record.jpg",
                  extmetadata: {
                    LicenseShortName: { value: "CC BY-SA 4.0" },
                    LicenseUrl: {
                      value: "https://creativecommons.org/licenses/by-sa/4.0/",
                    },
                    Artist: { value: "Sample Creator" },
                    Credit: { value: "Photo by Sample Creator" },
                    Copyright: {
                      value: "Copyright statement supplied by source",
                    },
                    UsageTerms: { value: "Attribution required." },
                    AttributionRequired: { value: "true" },
                    Restrictions: { value: "Restrictions apply." },
                  },
                },
              ],
            },
          ],
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
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
  assert.equal(results[0].catalogReference, "");
  assert.equal(requests[0].searchParams.get("gsrnamespace"), "6");
  assert.equal(requests[0].searchParams.get("gsrlimit"), "8");
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
    const response =
      url.pathname === "/advancedsearch.php"
        ? { response: { docs: [{ identifier: "public-archive-photo" }], numFound: 1 } }
        : payload;
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  const { results, nextPage } = await client.searchImages("campus portrait");
  const [result] = results;
  assert.equal(nextPage, null);
  assert.equal(result.license, "CC BY 4.0");
  assert.equal(result.creator, "Photographer A; Institution Photo Unit");
  assert.equal(result.credit, "Photo courtesy of Example Archive");
  assert.equal(result.copyright, "Copyright notice retained from the item record.");
  assert.equal(result.catalogReference, "");
  assert.equal(result.artworkDate, "");
  assert.equal(result.provenance, "");
  assert.match(result.usageRights, /preserve the original credit line/);
});

test("Art Institute adapter preserves artwork metadata and validates artwork URLs", async () => {
  const requests: URL[] = [];
  const artwork = {
    id: 123,
    title: "Sample campus portrait",
    artist_title: "A. Photographer",
    credit_line: "Gift of the Example Foundation",
    is_public_domain: true,
    copyright_notice: "Copyright notice retained from the museum record.",
    main_reference_number: "1921.123",
    date_display: "1921",
    provenance_text: "Held by the Example family before entering the museum.",
    image_id: "abcdef01-2345-6789-abcd-0123456789ab",
  };
  const client = createArtInstituteClient(async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    const payload =
      url.pathname === "/api/v1/artworks/search"
        ? { data: [artwork], pagination: { current_page: 1, total_pages: 1 } }
        : { data: artwork };
    return new Response(
      JSON.stringify(payload),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

  const { results, nextPage } = await client.searchImages("campus portrait");
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
  assert.equal(result.catalogReference, "1921.123");
  assert.equal(result.artworkDate, "1921");
  assert.equal(
    result.provenance,
    "Held by the Example family before entering the museum.",
  );
  assert.match(result.usageRights, /marks this artwork as public domain/);
  assert.match(result.usageRights, /API metadata terms do not establish image reuse rights/);
  assert.equal(requests[0].hostname, "api.artic.edu");
  assert.equal(requests[0].searchParams.get("q"), "campus portrait");
  assert.equal(requests[0].searchParams.get("limit"), "8");
  assert.equal(requests[0].searchParams.get("page"), "1");
  const requestedFields = requests[0].searchParams.get("fields") ?? "";
  assert.match(requestedFields, /main_reference_number/);
  assert.match(requestedFields, /date_display/);
  assert.match(requestedFields, /provenance_text/);

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
  const client = createArtInstituteClient(async () =>
    new Response(
      JSON.stringify({
        data: [{ id: 654, title: "Unclear artwork", image_id: "image-654" }],
        pagination: { current_page: 1, total_pages: 1 },
      }),
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
  assert.equal(result.catalogReference, "");
  assert.equal(result.artworkDate, "");
  assert.equal(result.provenance, "");
  assert.match(result.usageRights, /did not supply a public-domain status/);
});

test("Art Institute adapter uses provider pagination and reports the last page", async () => {
  const requests: URL[] = [];
  const artworks = [
    { id: 123, title: "First artwork", image_id: "museum-image-123" },
    { id: 456, title: "Repeated artwork", image_id: "museum-image-456" },
    { id: 789, title: "Last artwork", image_id: "museum-image-789" },
  ];
  const client = createArtInstituteClient(async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    const page = Number(url.searchParams.get("page"));
    const data = page === 1 ? [artworks[0], artworks[1]] : [artworks[1], artworks[2]];
    return new Response(
      JSON.stringify({
        data,
        pagination: { current_page: page, total_pages: 2 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

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
    const client = createArtInstituteClient(async () =>
    new Response(
      JSON.stringify(payload),
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
  const client = createInternetArchiveClient(async (input) => {
    const url = new URL(String(input));
    if (url.pathname === "/advancedsearch.php") {
      searchRequests.push(url);
      const identifiers =
        url.searchParams.get("start") === "0"
          ? Array.from({ length: 8 }, (_, index) => `archive-${index + 1}`)
          : ["archive-8", "archive-9"];
      return new Response(
        JSON.stringify({
          response: {
            docs: identifiers.map((identifier) => ({ identifier })),
            numFound: 9,
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }
    const identifier = url.pathname.split("/").at(-1) ?? "";
    return new Response(
      JSON.stringify({
        metadata: {
          identifier,
          title: `Archive record ${identifier}`,
          license: "Rights information retained from the item",
          creator: "Archive contributor",
          credit: "Archive credit line",
          copyright: "Uploader-supplied copyright notice",
          rights: "Review original item terms",
        },
        files: [{ name: "image.jpg", source: "original", format: "JPEG" }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

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
  const editorGuard: RequestHandler = (_req, res) => {
    res.status(403).json({ message: "Verified editor identity is required." });
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
  const archiveClient = createInternetArchiveClient(async () =>
    new Response("", { status: 500 }),
  );
  const museumClient = createArtInstituteClient(async () =>
    new Response("", { status: 500 }),
  );
  const app = express();
  app.use(express.json());
  app.use(
    createContentDeskRouter(
      db,
      editorGuard,
      commonsClient,
      archiveClient,
      museumClient,
    ),
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
        catalogReference: "",
        artworkDate: "",
        provenance: "",
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
        catalogReference: "",
        artworkDate: "",
        provenance: "",
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
        catalogReference: "1921.123",
        artworkDate: "1921",
        provenance: "Held by the Campus Foundation before entering the museum.",
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
      let rightsReviewTransactionGate:
        | {
            started: ReturnType<typeof deferred>;
            release: ReturnType<typeof deferred>;
          }
        | undefined;
      let currentArchiveResult: EditorImageCandidateSearchResult | null =
        archiveResult;
      let archiveLookupError = false;
      let archiveLookupCalled = false;
      let archiveLookupGate:
        | {
            started: ReturnType<typeof deferred>;
            release: ReturnType<typeof deferred>;
          }
        | undefined;
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
          const gate = archiveLookupGate;
          if (gate) {
            archiveLookupGate = undefined;
            gate.started.resolve();
            await gate.release.promise;
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
      const databaseForRouter = new Proxy(tx as unknown as typeof db, {
        get(target, property) {
          if (property === "transaction") {
            return (...args: any[]) => {
              const gate = rightsReviewTransactionGate;
              if (!gate) {
                return Reflect.apply(target.transaction, target, args);
              }
              rightsReviewTransactionGate = undefined;
              gate.started.resolve();
              return gate.release.promise.then(() =>
                Reflect.apply(target.transaction, target, args),
              );
            };
          }
          const value = Reflect.get(target, property, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
      app.use(
        createContentDeskRouter(
          databaseForRouter,
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
        const imageCandidateFrom = (response: {
          body: Record<string, any>;
        }) => {
          const candidate = (
            response.body.candidates as Array<{
              id: number;
              [key: string]: any;
            }>
          ).find(
            ({ id }) => id === createdImageCandidate.body.id,
          );
          assert.ok(candidate);
          return candidate;
        };
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

        const archivePreviewRaceResult: EditorImageCandidateSearchResult = {
          ...archiveResult,
          fileTitle:
            "The college courtyard [signalhub-archive-preview-race-test]",
          imageUrl:
            "https://archive.org/download/signalhub-archive-preview-race-test/courtyard.jpg",
          thumbnailUrl:
            "https://archive.org/services/img/signalhub-archive-preview-race-test",
          filePageUrl:
            "https://archive.org/details/signalhub-archive-preview-race-test",
        };
        currentArchiveResult = archivePreviewRaceResult;
        const createdPreviewRaceCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Internet Archive",
            fileTitle: archivePreviewRaceResult.fileTitle,
            filePageUrl: archivePreviewRaceResult.filePageUrl,
            imageUrl: archivePreviewRaceResult.imageUrl,
          },
        );
        assert.equal(createdPreviewRaceCandidate.response.status, 201);
        const previewRaceGate = {
          started: deferred(),
          release: deferred(),
        };
        archiveLookupGate = previewRaceGate;
        const previewAgainstArchivedCandidate = requestJson(
          baseUrl,
          `/editor/image-candidates/${createdPreviewRaceCandidate.body.id}/recheck`,
          "POST",
        );
        await previewRaceGate.started.promise;
        const archivedPreviewRaceCandidate = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdPreviewRaceCandidate.body.id}`,
          "DELETE",
        );
        assert.equal(archivedPreviewRaceCandidate.response.status, 200);
        const archiveBeforeLatePreview = (
          await requestJson(
            baseUrl,
            "/editor/image-candidates/archive",
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdPreviewRaceCandidate.body.id,
        );
        assert.deepEqual(
          archiveBeforeLatePreview,
          archivedPreviewRaceCandidate.body,
        );
        previewRaceGate.release.resolve();
        const lateSourcePreview = await previewAgainstArchivedCandidate;
        assert.equal(lateSourcePreview.response.status, 404);
        assert.equal(
          lateSourcePreview.body.message,
          "Image candidate not found.",
        );
        const archiveAfterLatePreview = (
          await requestJson(
            baseUrl,
            "/editor/image-candidates/archive",
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdPreviewRaceCandidate.body.id,
        );
        assert.deepEqual(archiveAfterLatePreview, archiveBeforeLatePreview);
        currentArchiveResult = archiveResult;

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

        const missingArchivePreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdArchiveCandidate.body.id}/recheck`,
          "POST",
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
          imageCandidateFrom(historyAfterPreview).rightsHistory.length,
          4,
        );
        const beforeApplyingSourceChanges = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        assert.equal(
          imageCandidateFrom(beforeApplyingSourceChanges).rightsStatus,
          "approved",
        );
        assert.equal(
          imageCandidateFrom(beforeApplyingSourceChanges).license,
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
          imageCandidateFrom(afterStaleSourceApply).rightsStatus,
          "approved",
        );
        assert.equal(
          imageCandidateFrom(afterStaleSourceApply).credit,
          savedRightsMetadata.credit,
        );
        assert.equal(
          imageCandidateFrom(afterStaleSourceApply).rightsHistory.length,
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
          imageCandidateFrom(afterFailedSourceApply).license,
          appliedSourceChanges.body.candidate.license,
        );
        assert.equal(
          imageCandidateFrom(afterFailedSourceApply).rightsStatus,
          "pending",
        );
        assert.equal(
          imageCandidateFrom(afterFailedSourceApply).sourceAvailabilityStatus,
          "available",
        );
        assert.equal(
          imageCandidateFrom(afterFailedSourceApply).rightsHistory.length,
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
          imageCandidateFrom(afterRemovedSourceRecheck).credit,
          appliedSourceChanges.body.candidate.credit,
        );
        assert.equal(
          imageCandidateFrom(afterRemovedSourceRecheck).rightsStatus,
          "pending",
        );
        assert.equal(
          imageCandidateFrom(afterRemovedSourceRecheck).sourceAvailabilityStatus,
          "missing",
        );
        assert.equal(
          imageCandidateFrom(afterRemovedSourceRecheck).license,
          appliedSourceChanges.body.candidate.license,
        );
        assert.equal(
          imageCandidateFrom(afterRemovedSourceRecheck).credit,
          appliedSourceChanges.body.candidate.credit,
        );
        assert.equal(
          imageCandidateFrom(afterRemovedSourceRecheck).rightsHistory.length,
          5,
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

        currentCommonsResult = {
          ...changedCommonsTerms,
          credit: "A newer credit statement during the archive race.",
        };
        const archiveRacePreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(archiveRacePreview.response.status, 200);
        const reviewedBeforeArchiveRace = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "approved",
            reviewNotes: "Confirmed rights before the archive-race test.",
          },
        );
        assert.equal(reviewedBeforeArchiveRace.response.status, 200);
        const archiveRaceGate = {
          started: deferred(),
          release: deferred(),
        };
        commonsLookupGate = archiveRaceGate;
        const applyAgainstArchivedCandidate = requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/recheck/apply`,
          "POST",
          { expectedMetadata: archiveRacePreview.body.currentMetadata },
        );
        await archiveRaceGate.started.promise;

        const candidateBeforeRemovalResponse = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "GET",
        );
        const candidateBeforeRemoval =
          candidateBeforeRemovalResponse.body.candidates.find(
            (candidate: { id: number }) =>
              candidate.id === createdImageCandidate.body.id,
          );
        assert.ok(candidateBeforeRemoval);
        assert.equal(candidateBeforeRemoval.rightsStatus, "approved");
        assert.equal(
          candidateBeforeRemoval.reviewNotes,
          "Confirmed rights before the archive-race test.",
        );
        assert.equal(
          candidateBeforeRemoval.reviewedBy,
          "content-desk-test-editor",
        );
        assert.ok(candidateBeforeRemoval.reviewedAt);

        const rightsReviewGate = {
          started: deferred(),
          release: deferred(),
        };
        rightsReviewTransactionGate = rightsReviewGate;
        const lateManualRightsReview = requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}/rights`,
          "PATCH",
          {
            rightsStatus: "rejected",
            reviewNotes: "Late review after archival must not be recorded.",
          },
        );
        await rightsReviewGate.started.promise;

        const removedCandidate = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdImageCandidate.body.id}`,
          "DELETE",
        );
        assert.equal(removedCandidate.response.status, 200);
        assert.equal(removedCandidate.body.removedBy, "content-desk-test-editor");
        assert.ok(removedCandidate.body.removedAt);
        assert.equal(removedCandidate.body.fileTitle, candidateBeforeRemoval.fileTitle);
        rightsReviewGate.release.resolve();
        const rejectedLateManualReview = await lateManualRightsReview;
        assert.equal(rejectedLateManualReview.response.status, 404);
        assert.equal(
          rejectedLateManualReview.body.message,
          "Image candidate not found.",
        );
        for (const field of [
          "rightsStatus",
          "reviewNotes",
          "reviewedBy",
          "reviewedAt",
        ]) {
          assert.deepEqual(
            removedCandidate.body[field],
            candidateBeforeRemoval[field],
            `archival must preserve ${field} when a late manual review is rejected`,
          );
        }
        assert.deepEqual(
          removedCandidate.body.rightsHistory,
          candidateBeforeRemoval.rightsHistory,
        );
        archiveRaceGate.release.resolve();
        const lateSourceApply = await applyAgainstArchivedCandidate;
        assert.equal(lateSourceApply.response.status, 404);
        assert.equal(
          lateSourceApply.body.message,
          "Image candidate not found.",
        );
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
        assert.equal(archivedCandidate.credit, candidateBeforeRemoval.credit);
        assert.equal(archivedCandidate.license, candidateBeforeRemoval.license);
        for (const field of [
          "rightsStatus",
          "reviewNotes",
          "reviewedBy",
          "reviewedAt",
        ]) {
          assert.deepEqual(
            archivedCandidate[field],
            candidateBeforeRemoval[field],
            `archive listing must preserve ${field} after the late review is rejected`,
          );
        }
        assert.deepEqual(
          archivedCandidate.rightsHistory,
          removedCandidate.body.rightsHistory,
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

        const archiveNoChangeResult: EditorImageCandidateSearchResult = {
          ...archiveResult,
          fileTitle: "The college courtyard [signalhub-archive-no-change-test]",
          imageUrl:
            "https://archive.org/download/signalhub-archive-no-change-test/courtyard.jpg",
          thumbnailUrl:
            "https://archive.org/services/img/signalhub-archive-no-change-test",
          filePageUrl:
            "https://archive.org/details/signalhub-archive-no-change-test",
        };
        currentArchiveResult = archiveNoChangeResult;
        const createdNoChangeCandidate = await requestJson(
          baseUrl,
          `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
          "POST",
          {
            source: "Internet Archive",
            fileTitle: archiveNoChangeResult.fileTitle,
            filePageUrl: archiveNoChangeResult.filePageUrl,
            imageUrl: archiveNoChangeResult.imageUrl,
          },
        );
        assert.equal(createdNoChangeCandidate.response.status, 201);
        const noChangePreview = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdNoChangeCandidate.body.id}/recheck`,
          "POST",
        );
        assert.equal(noChangePreview.response.status, 200);
        assert.deepEqual(noChangePreview.body.changedFields, []);
        const noChangeGate = {
          started: deferred(),
          release: deferred(),
        };
        archiveLookupGate = noChangeGate;
        const applyWithUnchangedTerms = requestJson(
          baseUrl,
          `/editor/image-candidates/${createdNoChangeCandidate.body.id}/recheck/apply`,
          "POST",
          { expectedMetadata: noChangePreview.body.currentMetadata },
        );
        await noChangeGate.started.promise;
        const noChangeCandidateBeforeArchive = (
          await requestJson(
            baseUrl,
            `/editor/discovery-items/${createdLead.body.id}/image-candidates`,
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdNoChangeCandidate.body.id,
        );
        const archivedNoChangeCandidate = await requestJson(
          baseUrl,
          `/editor/image-candidates/${createdNoChangeCandidate.body.id}`,
          "DELETE",
        );
        assert.equal(archivedNoChangeCandidate.response.status, 200);
        noChangeGate.release.resolve();
        const lateNoChangeApply = await applyWithUnchangedTerms;
        assert.equal(lateNoChangeApply.response.status, 404);
        assert.equal(lateNoChangeApply.body.message, "Image candidate not found.");
        assert.equal(
          archivedNoChangeCandidate.body.credit,
          noChangeCandidateBeforeArchive.credit,
        );
        assert.deepEqual(
          archivedNoChangeCandidate.body.rightsHistory,
          noChangeCandidateBeforeArchive.rightsHistory,
        );
        const noChangeCandidateAfterArchive = (
          await requestJson(
            baseUrl,
            "/editor/image-candidates/archive",
            "GET",
          )
        ).body.candidates.find(
          (candidate: { id: number }) =>
            candidate.id === createdNoChangeCandidate.body.id,
        );
        assert.ok(noChangeCandidateAfterArchive);
        assert.equal(
          noChangeCandidateAfterArchive.credit,
          noChangeCandidateBeforeArchive.credit,
        );
        assert.deepEqual(
          noChangeCandidateAfterArchive.rightsHistory,
          archivedNoChangeCandidate.body.rightsHistory,
        );

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
