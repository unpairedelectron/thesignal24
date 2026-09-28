import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import express, { type Express } from "express";
import { test } from "node:test";
import { eq } from "drizzle-orm";
import {
  articleEventsTable,
  articleSourcesTable,
  db,
  eventSourcesTable,
  evidenceEventsTable,
  issuesTable,
  sourceDocumentsTable,
  storiesTable,
} from "@workspace/db";
import { createEvidenceRouter } from "./evidence";

const rollbackMarker = new Error("Rollback evidence route test fixtures");

async function listen(app: Express) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}/api`,
  };
}

async function close(server: ReturnType<Express["listen"]>) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function getJson(baseUrl: string, path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  return { response, body: (await response.json()) as Record<string, any> };
}

async function postJson(baseUrl: string, path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function patchJson(baseUrl: string, path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function collectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [
    key,
    ...collectKeys(child),
  ]);
}

test("public evidence routes exclude draft-only records, links, and audit data", async () => {
  await assert.rejects(
    db.transaction(async (tx) => {
      const token = `route-visibility-${randomUUID()}`;
      const auditMarker = `private-audit-${token}`;
      const [publishedIssue] = await tx
        .insert(issuesTable)
        .values({
          issueDate: "2098-01-01",
          issueNumber: 9801,
          status: "published",
          title: `${token} published issue`,
          intro: "Fixture issue for evidence visibility route coverage.",
          publishedAt: new Date("2098-01-01T12:00:00.000Z"),
        })
        .returning({ id: issuesTable.id });
      const [draftIssue] = await tx
        .insert(issuesTable)
        .values({
          issueDate: "2098-01-02",
          issueNumber: 9802,
          status: "draft",
          title: `${token} draft issue`,
          intro: "Fixture issue for evidence visibility route coverage.",
        })
        .returning({ id: issuesTable.id });

      const [publishedArticle] = await tx
        .insert(storiesTable)
        .values({
          issueId: publishedIssue.id,
          topic: "Latest",
          kind: "Article",
          source: `${token} newsroom`,
          eyebrow: "Test fixture",
          title: `${token} published article`,
          dek: "Published article linked to both published and draft events.",
          body: "A test fixture for public evidence visibility.",
          time: "12:00",
          read: 3,
          tone: "neutral",
          publishedOn: "2098-01-01",
          workflowStatus: "published",
          verificationStatus: "verified",
        })
        .returning({ id: storiesTable.id });
      const [draftArticle] = await tx
        .insert(storiesTable)
        .values({
          issueId: draftIssue.id,
          topic: "Latest",
          kind: "Article",
          source: `${token} newsroom`,
          eyebrow: "Test fixture",
          title: `${token} draft article`,
          dek: "Draft article linked to a published event.",
          body: "A test fixture for public evidence visibility.",
          time: "12:00",
          read: 3,
          tone: "neutral",
          publishedOn: "2098-01-02",
          workflowStatus: "draft",
          verificationStatus: "unverified",
        })
        .returning({ id: storiesTable.id });

      const [publishedEvent, draftEvent] = await tx
        .insert(evidenceEventsTable)
        .values([
          {
            title: `${token} published event`,
            topic: "Latest",
            recordDate: "2098-01-03",
            summary: `${token} published event summary`,
            workflowStatus: "published",
            createdBy: auditMarker,
            updatedBy: auditMarker,
          },
          {
            title: `${token} draft event`,
            topic: "Latest",
            recordDate: "2098-01-04",
            summary: `${token} draft event summary`,
            workflowStatus: "draft",
            createdBy: auditMarker,
            updatedBy: auditMarker,
          },
        ])
        .returning({ id: evidenceEventsTable.id });

      const [
        sharedSource,
        draftOnlySource,
        publishedDirectOnlySource,
        draftDirectOnlySource,
      ] = await tx
        .insert(sourceDocumentsTable)
        .values([
          {
            title: `${token} shared source`,
            publisher: `${token} publisher`,
            publicationDate: "2098-01-01",
            documentType: "report",
            sourceUrl: "https://example.com/shared",
            status: "verified",
            createdBy: auditMarker,
            updatedBy: auditMarker,
          },
          {
            title: `${token} draft-only source`,
            publisher: `${token} draft publisher`,
            publicationDate: "2098-01-02",
            documentType: "report",
            sourceUrl: "https://example.com/draft-only",
            status: "verified",
            createdBy: auditMarker,
            updatedBy: auditMarker,
          },
          {
            title: `${token} published direct-only source`,
            publisher: `${token} direct publisher`,
            publicationDate: "2098-01-03",
            documentType: "report",
            sourceUrl: "https://example.com/published-direct",
            status: "verified",
            createdBy: auditMarker,
            updatedBy: auditMarker,
          },
          {
            title: `${token} draft direct-only source`,
            publisher: `${token} draft direct publisher`,
            publicationDate: "2098-01-04",
            documentType: "report",
            sourceUrl: "https://example.com/draft-direct",
            status: "verified",
            createdBy: auditMarker,
            updatedBy: auditMarker,
          },
        ])
        .returning({ id: sourceDocumentsTable.id });

      await tx.insert(articleEventsTable).values([
        {
          articleId: publishedArticle.id,
          eventId: publishedEvent.id,
          createdBy: auditMarker,
        },
        {
          articleId: draftArticle.id,
          eventId: publishedEvent.id,
          createdBy: auditMarker,
        },
        {
          articleId: publishedArticle.id,
          eventId: draftEvent.id,
          createdBy: auditMarker,
        },
        {
          articleId: draftArticle.id,
          eventId: draftEvent.id,
          createdBy: auditMarker,
        },
      ]);
      await tx.insert(eventSourcesTable).values([
        {
          eventId: publishedEvent.id,
          sourceDocumentId: sharedSource.id,
          sourceRole: "primary",
          createdBy: auditMarker,
        },
        {
          eventId: draftEvent.id,
          sourceDocumentId: sharedSource.id,
          sourceRole: "primary",
          createdBy: auditMarker,
        },
        {
          eventId: draftEvent.id,
          sourceDocumentId: draftOnlySource.id,
          sourceRole: "secondary",
          createdBy: auditMarker,
        },
      ]);
      await tx.insert(articleSourcesTable).values([
        {
          articleId: publishedArticle.id,
          sourceDocumentId: publishedDirectOnlySource.id,
          createdBy: auditMarker,
        },
        {
          articleId: draftArticle.id,
          sourceDocumentId: draftDirectOnlySource.id,
          createdBy: auditMarker,
        },
      ]);

      const app = express();
      app.use((req, _res, next) => {
        const auth = Object.assign(() => ({ userId: null }), {
          [Symbol.for("@clerk/express.auth")]: true,
        });
        Object.assign(req, { auth });
        next();
      });
      app.use("/api", createEvidenceRouter(tx as unknown as typeof db));
      app.use(
        (
          error: unknown,
          _req: unknown,
          res: express.Response,
          _next: unknown,
        ) => {
          res.status(500).json({
            message:
              error instanceof Error ? error.message : "Unexpected test error",
          });
        },
      );
      const { server, baseUrl } = await listen(app);

      try {
        const events = await getJson(baseUrl, "/events");
        const draftEventDetail = await getJson(
          baseUrl,
          `/events/${draftEvent.id}`,
        );
        const publishedEventDetail = await getJson(
          baseUrl,
          `/events/${publishedEvent.id}`,
        );
        assert(
          events.body.events.some(
            (entry: any) => entry.event.id === publishedEvent.id,
          ),
        );
        assert(
          !events.body.events.some(
            (entry: any) => entry.event.id === draftEvent.id,
          ),
        );
        assert.equal(draftEventDetail.response.status, 404);
        assert.deepEqual(
          publishedEventDetail.body.event.articles.map(
            (article: any) => article.id,
          ),
          [publishedArticle.id],
        );
        assert.deepEqual(
          publishedEventDetail.body.event.primarySources.map(
            (source: any) => source.id,
          ),
          [sharedSource.id],
        );

        const publishedArticleEvidence = await getJson(
          baseUrl,
          `/stories/${publishedArticle.id}/evidence`,
        );
        const draftArticleEvidence = await getJson(
          baseUrl,
          `/stories/${draftArticle.id}/evidence`,
        );
        assert.deepEqual(
          publishedArticleEvidence.body.events.map(
            (entry: any) => entry.event.id,
          ),
          [publishedEvent.id],
        );
        assert.deepEqual(
          publishedArticleEvidence.body.directSources.map(
            (source: any) => [source.sourceDocument.id, source.sourceRole],
          ),
          [[publishedDirectOnlySource.id, "secondary"]],
        );
        assert.equal(draftArticleEvidence.response.status, 404);

        const sharedSourceDetail = await getJson(
          baseUrl,
          `/sources/${sharedSource.id}`,
        );
        const draftOnlySourceDetail = await getJson(
          baseUrl,
          `/sources/${draftOnlySource.id}`,
        );
        const publishedDirectOnlySourceDetail = await getJson(
          baseUrl,
          `/sources/${publishedDirectOnlySource.id}`,
        );
        const draftDirectOnlySourceDetail = await getJson(
          baseUrl,
          `/sources/${draftDirectOnlySource.id}`,
        );
        assert.deepEqual(
          sharedSourceDetail.body.supportingEvents.map(
            (entry: any) => entry.event.id,
          ),
          [publishedEvent.id],
        );
        assert.deepEqual(
          sharedSourceDetail.body.citedByArticles.map(
            (entry: any) => [entry.article.id, entry.sourceRole],
          ),
          [[publishedArticle.id, null]],
        );
        assert.equal(draftOnlySourceDetail.response.status, 404);
        assert.equal(publishedDirectOnlySourceDetail.response.status, 200);
        assert.deepEqual(
          publishedDirectOnlySourceDetail.body.supportingEvents,
          [],
        );
        assert.deepEqual(
          publishedDirectOnlySourceDetail.body.citedByArticles.map(
            (entry: any) => [entry.article.id, entry.sourceRole],
          ),
          [[publishedArticle.id, "secondary"]],
        );
        assert.equal(draftDirectOnlySourceDetail.response.status, 404);

        const search = await getJson(
          baseUrl,
          `/evidence-search?q=${encodeURIComponent(token)}`,
        );
        const searchRecords = search.body.results;
        assert(
          searchRecords.some(
            (record: any) =>
              record.resultType === "event" && record.id === publishedEvent.id,
          ),
        );
        assert(
          !searchRecords.some(
            (record: any) =>
              record.resultType === "event" && record.id === draftEvent.id,
          ),
        );
        assert(
          searchRecords.some(
            (record: any) =>
              record.resultType === "article" &&
              record.id === publishedArticle.id,
          ),
        );
        assert(
          !searchRecords.some(
            (record: any) =>
              record.resultType === "article" && record.id === draftArticle.id,
          ),
        );
        assert(
          searchRecords.some(
            (record: any) =>
              record.resultType === "source" && record.id === sharedSource.id,
          ),
        );
        assert(
          !searchRecords.some(
            (record: any) =>
              record.resultType === "source" &&
              record.id === draftOnlySource.id,
          ),
        );
        assert(
          searchRecords.some(
            (record: any) =>
              record.resultType === "source" &&
              record.id === publishedDirectOnlySource.id,
          ),
        );
        assert(
          !searchRecords.some(
            (record: any) =>
              record.resultType === "source" &&
              record.id === draftDirectOnlySource.id,
          ),
        );
        const publishedArticleResult = searchRecords.find(
          (record: any) =>
            record.resultType === "article" &&
            record.id === publishedArticle.id,
        );
        assert.equal(publishedArticleResult.eventCount, 1);
        assert.equal(publishedArticleResult.sourceCount, 2);

        const editorResponse = await getJson(baseUrl, "/editor/evidence");
        assert.equal(editorResponse.response.status, 401);

        const editorApp = express();
        const editorAuth: express.RequestHandler = (req, _res, next) => {
          req.editorIdentity = {
            id: "test-editor",
            displayName: "Test editor",
          };
          next();
        };
        editorApp.use(express.json());
        editorApp.use(
          "/api",
          createEvidenceRouter(tx as unknown as typeof db, editorAuth),
        );
        editorApp.use(
          (
            error: unknown,
            _req: unknown,
            res: express.Response,
            _next: unknown,
          ) => {
            res.status(500).json({
              message:
                error instanceof Error
                  ? error.message
                  : "Unexpected test error",
            });
          },
        );
        const { server: editorServer, baseUrl: editorBaseUrl } =
          await listen(editorApp);
        try {
          const directLinkInput = {
            articleId: publishedArticle.id,
            sourceDocumentId: sharedSource.id,
            sourceRole: "primary",
          };
          const createDirectLink = await postJson(
            editorBaseUrl,
            "/editor/article-sources",
            directLinkInput,
          );
          assert.equal(createDirectLink.status, 201);
          assert.deepEqual(await createDirectLink.json(), { linked: true });

          const duplicateDirectLink = await postJson(
            editorBaseUrl,
            "/editor/article-sources",
            directLinkInput,
          );
          assert.equal(duplicateDirectLink.status, 400);

          const editorGraph = await getJson(editorBaseUrl, "/editor/evidence");
          const directEditorLink = editorGraph.body.articleSourceLinks.find(
            (link: any) =>
              link.article.id === publishedArticle.id &&
              link.sourceDocument.id === sharedSource.id,
          );
          assert.equal(directEditorLink.linkedBy, "test-editor");
          assert.equal(directEditorLink.sourceRole, "primary");

          const changeDirectLinkRole = await patchJson(
            editorBaseUrl,
            `/editor/article-sources/${publishedArticle.id}/${sharedSource.id}`,
            { sourceRole: "secondary" },
          );
          assert.equal(changeDirectLinkRole.status, 200);
          assert.deepEqual(await changeDirectLinkRole.json(), {
            sourceRole: "secondary",
          });

          const changedRoleArticleEvidence = await getJson(
            editorBaseUrl,
            `/stories/${publishedArticle.id}/evidence`,
          );
          assert(
            changedRoleArticleEvidence.body.directSources.some(
              (entry: any) =>
                entry.sourceDocument.id === sharedSource.id &&
                entry.sourceRole === "secondary",
            ),
          );

          const changedRoleSourceDetail = await getJson(
            editorBaseUrl,
            `/sources/${sharedSource.id}`,
          );
          assert(
            changedRoleSourceDetail.body.citedByArticles.some(
              (entry: any) =>
                entry.article.id === publishedArticle.id &&
                entry.sourceRole === "secondary",
            ),
          );

          const changedEditorGraph = await getJson(
            editorBaseUrl,
            "/editor/evidence",
          );
          assert.equal(
            changedEditorGraph.body.articleSourceLinks.find(
              (link: any) =>
                link.article.id === publishedArticle.id &&
                link.sourceDocument.id === sharedSource.id,
            ).sourceRole,
            "secondary",
          );

          const removeDirectLink = await fetch(
            `${editorBaseUrl}/editor/article-sources/${publishedArticle.id}/${sharedSource.id}`,
            { method: "DELETE" },
          );
          assert.equal(removeDirectLink.status, 204);
          const updatedEditorGraph = await getJson(
            editorBaseUrl,
            "/editor/evidence",
          );
          assert(
            !updatedEditorGraph.body.articleSourceLinks.some(
              (link: any) =>
                link.article.id === publishedArticle.id &&
                link.sourceDocument.id === sharedSource.id,
            ),
          );

          const restoreDirectLink = await postJson(
            editorBaseUrl,
            "/editor/article-sources",
            directLinkInput,
          );
          assert.equal(restoreDirectLink.status, 201);

          for (const status of ["draft", "archived"] as const) {
            await tx
              .update(storiesTable)
              .set({ workflowStatus: "published" })
              .where(eq(storiesTable.id, publishedArticle.id));
            await tx
              .update(storiesTable)
              .set({ workflowStatus: status })
              .where(eq(storiesTable.id, publishedArticle.id));

            const hiddenArticleEvidence = await getJson(
              baseUrl,
              `/stories/${publishedArticle.id}/evidence`,
            );
            assert.equal(hiddenArticleEvidence.response.status, 404);

            const hiddenDirectSource = await getJson(
              baseUrl,
              `/sources/${publishedDirectOnlySource.id}`,
            );
            assert.equal(hiddenDirectSource.response.status, 404);

            const remainingSharedSource = await getJson(
              baseUrl,
              `/sources/${sharedSource.id}`,
            );
            assert.equal(remainingSharedSource.response.status, 200);
            assert.deepEqual(
              remainingSharedSource.body.citedByArticles.map(
                (article: any) => article.id,
              ),
              [],
            );

            const statusSearch = await getJson(
              baseUrl,
              `/evidence-search?q=${encodeURIComponent(token)}`,
            );
            assert(
              !statusSearch.body.results.some(
                (record: any) =>
                  record.resultType === "article" &&
                  record.id === publishedArticle.id,
              ),
            );
            assert(
              !statusSearch.body.results.some(
                (record: any) =>
                  record.resultType === "source" &&
                  record.id === publishedDirectOnlySource.id,
              ),
            );

            const changedStatusEditorGraph = await getJson(
              editorBaseUrl,
              "/editor/evidence",
            );
            const retainedDirectLinks =
              changedStatusEditorGraph.body.articleSourceLinks.filter(
                (link: any) => link.article.id === publishedArticle.id,
              );
            assert(
              retainedDirectLinks.some(
                (link: any) =>
                  link.sourceDocument.id === publishedDirectOnlySource.id,
              ),
            );
            assert(
              retainedDirectLinks.some(
                (link: any) => link.sourceDocument.id === sharedSource.id,
              ),
            );
            assert(
              retainedDirectLinks.every(
                (link: any) => link.article.workflowStatus === status,
              ),
            );
          }
        } finally {
          await close(editorServer);
        }

        const publicPayloads = [
          events.body,
          draftEventDetail.body,
          publishedEventDetail.body,
          publishedArticleEvidence.body,
          draftArticleEvidence.body,
          sharedSourceDetail.body,
          draftOnlySourceDetail.body,
          publishedDirectOnlySourceDetail.body,
          draftDirectOnlySourceDetail.body,
          search.body,
        ];
        const publicKeys = new Set(collectKeys(publicPayloads));
        for (const privateKey of [
          "audit",
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
          "linkedBy",
          "linkedAt",
        ]) {
          assert(
            !publicKeys.has(privateKey),
            `Public response exposed ${privateKey}`,
          );
        }
        assert(!JSON.stringify(publicPayloads).includes(auditMarker));
      } finally {
        await close(server);
      }

      throw rollbackMarker;
    }),
    (error) => error === rollbackMarker,
  );
});
