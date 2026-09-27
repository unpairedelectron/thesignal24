import assert from "node:assert/strict";
import { once } from "node:events";
import express, { type Express, type RequestHandler } from "express";
import { test } from "node:test";
import { db } from "@workspace/db";
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
      const app = express();
      app.use(express.json());
      app.use(
        createContentDeskRouter(
          tx as unknown as typeof db,
          editorGuard,
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