import { Router, type IRouter, type RequestHandler } from "express";
import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm";
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
import {
  CreateEvidenceEventBody,
  CreateEvidenceEventResponse,
  CreateSourceDocumentBody,
  CreateSourceDocumentResponse,
  GetEditorEvidenceResponse,
  GetEvidenceEventResponse,
  GetEvidenceEventsQueryParams,
  GetEvidenceEventsResponse,
  GetSourceDocumentResponse,
  GetStoryEvidenceResponse,
  LinkArticleToSourceBody,
  LinkArticleToSourceResponse,
  LinkArticleToEventBody,
  LinkArticleToEventResponse,
  LinkSourceToEventBody,
  LinkSourceToEventResponse,
  SearchEvidenceRecordsQueryParams,
  SearchEvidenceRecordsResponse,
  UpdateArticleSourceRoleBody,
  UpdateArticleSourceRoleResponse,
  UpdateEvidenceEventBody,
  UpdateEvidenceEventResponse,
  UpdateSourceDocumentBody,
  UpdateSourceDocumentResponse,
} from "@workspace/api-zod";
import { requireEditor as defaultRequireEditor } from "../middlewares/editorAuth";

const topics = new Set([
  "Latest",
  "Courts & Policy",
  "States",
  "History",
  "Ground Reports",
  "Data & Notes",
]);
const eventStatuses = new Set(["draft", "published", "archived"]);
const sourceStatuses = new Set(["verified", "unverified", "archived", "unavailable"]);
const documentTypes = new Set([
  "official-document",
  "court-record",
  "government-data",
  "report",
  "news-report",
  "other",
]);
const sourceRoles = new Set(["primary", "secondary"]);
const verificationStatuses = new Set(["unverified", "source-linked", "verified"]);
const storyKinds = new Set(["Article", "Paper note", "Archive", "Explainer", "Opinion"]);
const storyStatuses = new Set(["draft", "review", "scheduled", "published", "archived"]);

type EventRow = typeof evidenceEventsTable.$inferSelect;
type SourceRow = typeof sourceDocumentsTable.$inferSelect;
type StoryRow = typeof storiesTable.$inferSelect;

function parseId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function dateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function isDateOnly(value: Date | string | null | undefined): boolean {
  const normalized = dateOnly(value);
  if (normalized == null) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return false;
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === normalized;
}

function serializeEvent(event: EventRow) {
  return {
    id: event.id,
    title: event.title,
    topic: topics.has(event.topic) ? event.topic : "Latest",
    recordDate: dateOnly(event.recordDate),
    summary: event.summary,
    workflowStatus: eventStatuses.has(event.workflowStatus)
      ? event.workflowStatus
      : "draft",
  };
}

function serializeSource(source: SourceRow) {
  return {
    id: source.id,
    title: source.title,
    publisher: source.publisher,
    publicationDate: dateOnly(source.publicationDate),
    documentType: documentTypes.has(source.documentType)
      ? source.documentType
      : "other",
    sourceUrl: source.sourceUrl,
    status: sourceStatuses.has(source.status) ? source.status : "unverified",
  };
}

function serializeArticle(
  story: StoryRow,
  articlePublishedAt?: Date | null,
  includeWorkflowStatus = false,
) {
  return {
    id: story.id,
    title: story.title,
    topic: topics.has(story.topic) ? story.topic : "Latest",
    kind: storyKinds.has(story.kind) ? story.kind : "Article",
    recordDate: dateOnly(story.publishedOn),
    articlePublishedAt: articlePublishedAt?.toISOString() ?? null,
    canonicalPath: `/stories/${story.id}`,
    verificationStatus: verificationStatuses.has(story.verificationStatus)
      ? story.verificationStatus
      : "unverified",
    ...(includeWorkflowStatus
      ? {
          workflowStatus: storyStatuses.has(story.workflowStatus)
            ? story.workflowStatus
            : "draft",
        }
      : {}),
  };
}

async function getEventDetails(
  events: EventRow[],
  database: typeof db,
  includeUnpublishedArticles = false,
) {
  if (events.length === 0) return [];
  const eventIds = events.map((event) => event.id);
  const [sourceLinks, articleLinks] = await Promise.all([
    database
      .select({
        eventId: eventSourcesTable.eventId,
        sourceRole: eventSourcesTable.sourceRole,
        sourceDocument: sourceDocumentsTable,
      })
      .from(eventSourcesTable)
      .innerJoin(
        sourceDocumentsTable,
        eq(eventSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
      )
      .where(inArray(eventSourcesTable.eventId, eventIds))
      .orderBy(asc(sourceDocumentsTable.publisher), asc(sourceDocumentsTable.title)),
    database
      .select({
        eventId: articleEventsTable.eventId,
        story: storiesTable,
        articlePublishedAt: issuesTable.publishedAt,
      })
      .from(articleEventsTable)
      .innerJoin(storiesTable, eq(articleEventsTable.articleId, storiesTable.id))
      .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
      .where(
        includeUnpublishedArticles
          ? inArray(articleEventsTable.eventId, eventIds)
          : and(
              inArray(articleEventsTable.eventId, eventIds),
              eq(storiesTable.workflowStatus, "published"),
              eq(issuesTable.status, "published"),
            ),
      )
      .orderBy(asc(storiesTable.title)),
  ]);

  const sourcesByEvent = new Map<number, { primary: ReturnType<typeof serializeSource>[]; secondary: ReturnType<typeof serializeSource>[] }>();
  for (const link of sourceLinks) {
    const group = sourcesByEvent.get(link.eventId) ?? { primary: [], secondary: [] };
    if (link.sourceRole === "primary") group.primary.push(serializeSource(link.sourceDocument));
    else group.secondary.push(serializeSource(link.sourceDocument));
    sourcesByEvent.set(link.eventId, group);
  }

  const articlesByEvent = new Map<number, ReturnType<typeof serializeArticle>[]>();
  for (const link of articleLinks) {
    const articles = articlesByEvent.get(link.eventId) ?? [];
    articles.push(
      serializeArticle(
        link.story,
        link.articlePublishedAt,
        includeUnpublishedArticles,
      ),
    );
    articlesByEvent.set(link.eventId, articles);
  }

  return events.map((event) => {
    const sources = sourcesByEvent.get(event.id) ?? { primary: [], secondary: [] };
    const articles = articlesByEvent.get(event.id) ?? [];
    return {
      event: serializeEvent(event),
      articles,
      primarySources: sources.primary,
      secondarySources: sources.secondary,
      articleCount: articles.length,
      sourceCount: sources.primary.length + sources.secondary.length,
    };
  });
}

async function isPublishedStory(storyId: number, database: typeof db) {
  const [story] = await database
    .select({ id: storiesTable.id })
    .from(storiesTable)
    .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
    .where(
      and(
        eq(storiesTable.id, storyId),
        eq(storiesTable.workflowStatus, "published"),
        eq(issuesTable.status, "published"),
      ),
    )
    .limit(1);
  return Boolean(story);
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code?: string }).code === "23505";
}

export function createEvidenceRouter(
  database: typeof db = db,
  editorAuthorization: RequestHandler = defaultRequireEditor,
): IRouter {
const router: IRouter = Router();
const db = database;
const requireEditor = editorAuthorization;

router.get("/events", async (req, res, next): Promise<void> => {
  try {
    const parsed = GetEvidenceEventsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const { topic, limit = 100 } = parsed.data;
    const events = await db
      .select()
      .from(evidenceEventsTable)
      .where(
        topic
          ? and(
              eq(evidenceEventsTable.workflowStatus, "published"),
              eq(evidenceEventsTable.topic, topic),
            )
          : eq(evidenceEventsTable.workflowStatus, "published"),
      )
      .orderBy(desc(evidenceEventsTable.recordDate), asc(evidenceEventsTable.id))
      .limit(limit);
    res.json(
      GetEvidenceEventsResponse.parse({
        events: await getEventDetails(events, database),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/events/:eventId", async (req, res, next): Promise<void> => {
  try {
    const eventId = parseId(req.params.eventId);
    if (!eventId) {
      res.status(400).json({ message: "Invalid event id" });
      return;
    }
    const [event] = await db
      .select()
      .from(evidenceEventsTable)
      .where(
        and(
          eq(evidenceEventsTable.id, eventId),
          eq(evidenceEventsTable.workflowStatus, "published"),
        ),
      )
      .limit(1);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    const [detail] = await getEventDetails([event], database);
    res.json(GetEvidenceEventResponse.parse({ event: detail }));
  } catch (error) {
    next(error);
  }
});

router.get("/stories/:storyId/evidence", async (req, res, next): Promise<void> => {
  try {
    const storyId = parseId(req.params.storyId);
    if (!storyId) {
      res.status(400).json({ message: "Invalid article id" });
      return;
    }
    if (!(await isPublishedStory(storyId, database))) {
      res.status(404).json({ message: "Article not found" });
      return;
    }
    const links = await database
      .select({ event: evidenceEventsTable })
      .from(articleEventsTable)
      .innerJoin(
        evidenceEventsTable,
        eq(articleEventsTable.eventId, evidenceEventsTable.id),
      )
      .where(
        and(
          eq(articleEventsTable.articleId, storyId),
          eq(evidenceEventsTable.workflowStatus, "published"),
        ),
      )
      .orderBy(desc(evidenceEventsTable.recordDate), asc(evidenceEventsTable.id));
    const events = await getEventDetails(
      links.map((link) => link.event),
      database,
    );
    const directSources = await database
      .select({
        sourceDocument: sourceDocumentsTable,
        sourceRole: articleSourcesTable.sourceRole,
      })
      .from(articleSourcesTable)
      .innerJoin(
        sourceDocumentsTable,
        eq(articleSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
      )
      .where(eq(articleSourcesTable.articleId, storyId))
      .orderBy(asc(sourceDocumentsTable.publisher), asc(sourceDocumentsTable.title));
    res.json(
      GetStoryEvidenceResponse.parse({
        events,
        directSources: directSources.map(({ sourceDocument, sourceRole }) => ({
          sourceDocument: serializeSource(sourceDocument),
          sourceRole: sourceRoles.has(sourceRole) ? sourceRole : "secondary",
        })),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/sources/:sourceId", async (req, res, next): Promise<void> => {
  try {
    const sourceId = parseId(req.params.sourceId);
    if (!sourceId) {
      res.status(400).json({ message: "Invalid source id" });
      return;
    }
    const [source] = await database
      .select()
      .from(sourceDocumentsTable)
      .where(eq(sourceDocumentsTable.id, sourceId))
      .limit(1);
    if (!source) {
      res.status(404).json({ message: "Source document not found" });
      return;
    }
    const [eventLinks, directArticleLinks] = await Promise.all([
      database
        .select({
          event: evidenceEventsTable,
          sourceRole: eventSourcesTable.sourceRole,
        })
        .from(eventSourcesTable)
        .innerJoin(
          evidenceEventsTable,
          eq(eventSourcesTable.eventId, evidenceEventsTable.id),
        )
        .where(
          and(
            eq(eventSourcesTable.sourceDocumentId, sourceId),
            eq(evidenceEventsTable.workflowStatus, "published"),
          ),
        )
        .orderBy(desc(evidenceEventsTable.recordDate), asc(evidenceEventsTable.id)),
      database
        .select({
          story: storiesTable,
          articlePublishedAt: issuesTable.publishedAt,
          sourceRole: articleSourcesTable.sourceRole,
        })
        .from(articleSourcesTable)
        .innerJoin(storiesTable, eq(articleSourcesTable.articleId, storiesTable.id))
        .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
        .where(
          and(
            eq(articleSourcesTable.sourceDocumentId, sourceId),
            eq(storiesTable.workflowStatus, "published"),
            eq(issuesTable.status, "published"),
          ),
        )
        .orderBy(asc(storiesTable.title)),
    ]);
    if (eventLinks.length === 0 && directArticleLinks.length === 0) {
      res.status(404).json({ message: "Source document not found" });
      return;
    }
    const details = await getEventDetails(
      eventLinks.map((link) => link.event),
      database,
    );
    const citedArticles = new Map<
      number,
      {
        article: ReturnType<typeof serializeArticle>;
        sourceRole: "primary" | "secondary" | null;
      }
    >();
    for (const detail of details) {
      for (const article of detail.articles) {
        citedArticles.set(article.id, { article, sourceRole: null });
      }
    }
    for (const link of directArticleLinks) {
      citedArticles.set(
        link.story.id,
        {
          article: serializeArticle(link.story, link.articlePublishedAt),
          sourceRole: sourceRoles.has(link.sourceRole)
            ? link.sourceRole as "primary" | "secondary"
            : "secondary",
        },
      );
    }
    res.json(
      GetSourceDocumentResponse.parse({
        sourceDocument: serializeSource(source),
        supportingEvents: eventLinks.map(({ event, sourceRole }) => ({
          event: serializeEvent(event),
          sourceRole: sourceRoles.has(sourceRole) ? sourceRole : "secondary",
        })),
        citedByArticles: [...citedArticles.values()],
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/evidence-search", async (req, res, next): Promise<void> => {
  try {
    const parsed = SearchEvidenceRecordsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const query = parsed.data.q.trim();
    if (!query) {
      res.status(400).json({ message: "Enter a search term." });
      return;
    }
    const pattern = `%${query}%`;
    const [articleRows, events, eventSourceRows, directSourceRows] = await Promise.all([
          database
        .select({
          story: storiesTable,
          articlePublishedAt: issuesTable.publishedAt,
        })
        .from(storiesTable)
        .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
        .where(
          and(
            eq(storiesTable.workflowStatus, "published"),
            eq(issuesTable.status, "published"),
            or(
              like(storiesTable.title, pattern),
              like(storiesTable.dek, pattern),
              like(storiesTable.body, pattern),
              like(storiesTable.source, pattern),
            ),
          ),
        )
        .orderBy(desc(storiesTable.publishedOn), asc(storiesTable.id))
        .limit(10),
      db
        .select()
        .from(evidenceEventsTable)
        .where(
          and(
            eq(evidenceEventsTable.workflowStatus, "published"),
            or(
              like(evidenceEventsTable.title, pattern),
              like(evidenceEventsTable.summary, pattern),
              like(evidenceEventsTable.topic, pattern),
            ),
          ),
        )
        .orderBy(desc(evidenceEventsTable.recordDate), asc(evidenceEventsTable.id))
        .limit(10),
      db
        .selectDistinct({ source: sourceDocumentsTable })
        .from(sourceDocumentsTable)
        .innerJoin(
          eventSourcesTable,
          eq(eventSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
        )
        .innerJoin(
          evidenceEventsTable,
          eq(eventSourcesTable.eventId, evidenceEventsTable.id),
        )
        .where(
          and(
            eq(evidenceEventsTable.workflowStatus, "published"),
            or(
              like(sourceDocumentsTable.title, pattern),
              like(sourceDocumentsTable.publisher, pattern),
            ),
          ),
        )
        .orderBy(asc(sourceDocumentsTable.title))
        .limit(10),
      db
        .selectDistinct({ source: sourceDocumentsTable })
        .from(articleSourcesTable)
        .innerJoin(
          sourceDocumentsTable,
          eq(articleSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
        )
        .innerJoin(storiesTable, eq(articleSourcesTable.articleId, storiesTable.id))
        .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
        .where(
          and(
            eq(storiesTable.workflowStatus, "published"),
            eq(issuesTable.status, "published"),
            or(
              like(sourceDocumentsTable.title, pattern),
              like(sourceDocumentsTable.publisher, pattern),
            ),
          ),
        )
        .orderBy(asc(sourceDocumentsTable.title))
        .limit(10),
    ]);
    const sourcesById = new Map<number, { source: SourceRow }>();
    for (const row of [...eventSourceRows, ...directSourceRows]) {
      sourcesById.set(row.source.id, row);
    }
    const sourceRows = [...sourcesById.values()]
      .sort((left, right) => left.source.title.localeCompare(right.source.title))
      .slice(0, 10);

    const articleIds = articleRows.map(({ story }) => story.id);
    const articleEventLinks = articleIds.length
      ? await db
          .select({
            articleId: articleEventsTable.articleId,
            eventId: articleEventsTable.eventId,
          })
          .from(articleEventsTable)
          .innerJoin(
            evidenceEventsTable,
            eq(articleEventsTable.eventId, evidenceEventsTable.id),
          )
          .where(
            and(
              inArray(articleEventsTable.articleId, articleIds),
              eq(evidenceEventsTable.workflowStatus, "published"),
            ),
          )
      : [];
    const directArticleSourceLinks = articleIds.length
      ? await db
          .select({
            articleId: articleSourcesTable.articleId,
            sourceDocumentId: articleSourcesTable.sourceDocumentId,
          })
          .from(articleSourcesTable)
          .where(inArray(articleSourcesTable.articleId, articleIds))
      : [];
    const articleEventIds = [...new Set(articleEventLinks.map((link) => link.eventId))];
    const sourceCountsByEvent = new Map<number, number>();
    if (articleEventIds.length) {
      const eventSourceLinks = await db
        .select({ eventId: eventSourcesTable.eventId })
        .from(eventSourcesTable)
        .where(inArray(eventSourcesTable.eventId, articleEventIds));
      for (const link of eventSourceLinks) {
        sourceCountsByEvent.set(
          link.eventId,
          (sourceCountsByEvent.get(link.eventId) ?? 0) + 1,
        );
      }
    }
    const eventCountsByArticle = new Map<number, number>();
    const sourceSetsByArticle = new Map<number, Set<number>>();
    for (const link of directArticleSourceLinks) {
      const sources = sourceSetsByArticle.get(link.articleId) ?? new Set<number>();
      sources.add(link.sourceDocumentId);
      sourceSetsByArticle.set(link.articleId, sources);
    }
    const sourceIdsByEvent = new Map<number, number[]>();
    if (articleEventIds.length) {
      const eventSourceRows = await db
        .select({
          eventId: eventSourcesTable.eventId,
          sourceDocumentId: eventSourcesTable.sourceDocumentId,
        })
        .from(eventSourcesTable)
        .where(inArray(eventSourcesTable.eventId, articleEventIds));
      for (const row of eventSourceRows) {
        const ids = sourceIdsByEvent.get(row.eventId) ?? [];
        ids.push(row.sourceDocumentId);
        sourceIdsByEvent.set(row.eventId, ids);
      }
    }
    for (const link of articleEventLinks) {
      eventCountsByArticle.set(
        link.articleId,
        (eventCountsByArticle.get(link.articleId) ?? 0) + 1,
      );
      const sources = sourceSetsByArticle.get(link.articleId) ?? new Set<number>();
      for (const sourceId of sourceIdsByEvent.get(link.eventId) ?? []) sources.add(sourceId);
      sourceSetsByArticle.set(link.articleId, sources);
    }

    const sourceEventCounts = new Map<number, number>();
    const sourceEventLinks = sourceRows.length
      ? await db
          .select({
            sourceId: eventSourcesTable.sourceDocumentId,
            eventId: eventSourcesTable.eventId,
          })
          .from(eventSourcesTable)
          .innerJoin(
            evidenceEventsTable,
            eq(eventSourcesTable.eventId, evidenceEventsTable.id),
          )
          .where(
            and(
              inArray(
                eventSourcesTable.sourceDocumentId,
                sourceRows.map(({ source }) => source.id),
              ),
              eq(evidenceEventsTable.workflowStatus, "published"),
            ),
          )
      : [];
    for (const link of sourceEventLinks) {
      sourceEventCounts.set(
        link.sourceId,
        (sourceEventCounts.get(link.sourceId) ?? 0) + 1,
      );
    }

    const results = [
      ...articleRows.map(({ story, articlePublishedAt }) => ({
        resultType: "article",
        id: story.id,
        title: story.title,
        summary: story.dek,
        topic: topics.has(story.topic) ? story.topic : "Latest",
        recordDate: dateOnly(story.publishedOn),
        articlePublishedAt: articlePublishedAt?.toISOString() ?? null,
        sourcePublicationDate: null,
        path: `/stories/${story.id}`,
        eventCount: eventCountsByArticle.get(story.id) ?? 0,
        sourceCount: sourceSetsByArticle.get(story.id)?.size ?? 0,
        sourceStatus: null,
        documentType: null,
        sourceUrl: story.sourceUrl,
      })),
      ...events.map((event) => ({
        resultType: "event",
        id: event.id,
        title: event.title,
        summary: event.summary,
        topic: topics.has(event.topic) ? event.topic : "Latest",
        recordDate: dateOnly(event.recordDate),
        articlePublishedAt: null,
        sourcePublicationDate: null,
        path: `/events/${event.id}`,
        eventCount: 1,
        sourceCount: sourceCountsByEvent.get(event.id) ?? 0,
        sourceStatus: null,
        documentType: null,
        sourceUrl: null,
      })),
      ...sourceRows.map(({ source }) => ({
        resultType: "source",
        id: source.id,
        title: source.title,
        summary: source.publisher,
        topic: null,
        recordDate: null,
        articlePublishedAt: null,
        sourcePublicationDate: dateOnly(source.publicationDate),
        path: `/sources/${source.id}`,
        eventCount: sourceEventCounts.get(source.id) ?? 0,
        sourceCount: 0,
        sourceStatus: sourceStatuses.has(source.status) ? source.status : "unverified",
        documentType: documentTypes.has(source.documentType) ? source.documentType : "other",
        sourceUrl: source.sourceUrl,
      })),
    ];
    res.json(SearchEvidenceRecordsResponse.parse({ results }));
  } catch (error) {
    next(error);
  }
});

router.get("/editor/evidence", requireEditor, async (_req, res, next): Promise<void> => {
  try {
    const [events, sourceDocuments, articleRows, articleSourceRows] = await Promise.all([
      database.select().from(evidenceEventsTable).orderBy(desc(evidenceEventsTable.updatedAt)),
      database
        .select()
        .from(sourceDocumentsTable)
        .orderBy(desc(sourceDocumentsTable.updatedAt)),
      database
        .select({
          story: storiesTable,
          articlePublishedAt: issuesTable.publishedAt,
          issueStatus: issuesTable.status,
        })
        .from(storiesTable)
        .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
        .orderBy(asc(storiesTable.title)),
      database
        .select({
          story: storiesTable,
          articlePublishedAt: issuesTable.publishedAt,
          issueStatus: issuesTable.status,
          sourceDocument: sourceDocumentsTable,
          sourceRole: articleSourcesTable.sourceRole,
          linkedBy: articleSourcesTable.createdBy,
          linkedAt: articleSourcesTable.createdAt,
        })
        .from(articleSourcesTable)
        .innerJoin(storiesTable, eq(articleSourcesTable.articleId, storiesTable.id))
        .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
        .innerJoin(
          sourceDocumentsTable,
          eq(articleSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
        )
        .orderBy(asc(storiesTable.title), asc(sourceDocumentsTable.title)),
    ]);
    const eventIds = events.map((event) => event.id);
    const [articleLinks, sourceLinks] = eventIds.length
      ? await Promise.all([
          database
            .select({
              eventId: articleEventsTable.eventId,
              linkedBy: articleEventsTable.createdBy,
              linkedAt: articleEventsTable.createdAt,
              story: storiesTable,
              articlePublishedAt: issuesTable.publishedAt,
              issueStatus: issuesTable.status,
            })
            .from(articleEventsTable)
            .innerJoin(storiesTable, eq(articleEventsTable.articleId, storiesTable.id))
            .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
            .where(inArray(articleEventsTable.eventId, eventIds))
            .orderBy(asc(storiesTable.title)),
          database
            .select({
              eventId: eventSourcesTable.eventId,
              sourceRole: eventSourcesTable.sourceRole,
              linkedBy: eventSourcesTable.createdBy,
              linkedAt: eventSourcesTable.createdAt,
              sourceDocument: sourceDocumentsTable,
            })
            .from(eventSourcesTable)
            .innerJoin(
              sourceDocumentsTable,
              eq(eventSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
            )
            .where(inArray(eventSourcesTable.eventId, eventIds))
            .orderBy(asc(sourceDocumentsTable.title)),
        ])
      : [[], []];
    const articleLinksByEvent = new Map<number, Array<Record<string, unknown>>>();
    for (const link of articleLinks) {
      const links = articleLinksByEvent.get(link.eventId) ?? [];
      links.push({
        article: serializeArticle(
          link.story,
          link.issueStatus === "published" && link.story.workflowStatus === "published"
            ? link.articlePublishedAt
            : null,
          true,
        ),
        linkedBy: link.linkedBy,
        linkedAt: link.linkedAt.toISOString(),
      });
      articleLinksByEvent.set(link.eventId, links);
    }
    const sourceLinksByEvent = new Map<number, Array<Record<string, unknown>>>();
    for (const link of sourceLinks) {
      const links = sourceLinksByEvent.get(link.eventId) ?? [];
      links.push({
        sourceDocument: serializeSource(link.sourceDocument),
        sourceRole: sourceRoles.has(link.sourceRole) ? link.sourceRole : "secondary",
        linkedBy: link.linkedBy,
        linkedAt: link.linkedAt.toISOString(),
      });
      sourceLinksByEvent.set(link.eventId, links);
    }
    res.json(
      GetEditorEvidenceResponse.parse({
        events: events.map((event) => ({
          event: serializeEvent(event),
          audit: {
            createdBy: event.createdBy,
            updatedBy: event.updatedBy,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
          },
          articleLinks: articleLinksByEvent.get(event.id) ?? [],
          sourceLinks: sourceLinksByEvent.get(event.id) ?? [],
        })),
        sourceDocuments: sourceDocuments.map((source) => ({
          sourceDocument: serializeSource(source),
          audit: {
            createdBy: source.createdBy,
            updatedBy: source.updatedBy,
            createdAt: source.createdAt.toISOString(),
            updatedAt: source.updatedAt.toISOString(),
          },
        })),
        articles: articleRows.map(({ story, articlePublishedAt }) =>
          serializeArticle(
            story,
            story.workflowStatus === "published"
              ? articlePublishedAt
              : null,
            true,
          ),
        ),
        articleSourceLinks: articleSourceRows.map((link) => ({
          article: serializeArticle(
            link.story,
            link.issueStatus === "published" &&
              link.story.workflowStatus === "published"
              ? link.articlePublishedAt
              : null,
            true,
          ),
          sourceDocument: serializeSource(link.sourceDocument),
          sourceRole: sourceRoles.has(link.sourceRole)
            ? link.sourceRole
            : "secondary",
          linkedBy: link.linkedBy,
          linkedAt: link.linkedAt.toISOString(),
        })),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/editor/events", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateEvidenceEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    if (!isDateOnly(parsed.data.recordDate)) {
      res.status(400).json({ message: "Event record dates must be calendar dates in YYYY-MM-DD format." });
      return;
    }
    const input = parsed.data;
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    const [event] = await db
      .insert(evidenceEventsTable)
      .values({
        title: input.title.trim(),
        topic: input.topic,
        recordDate: dateOnly(input.recordDate),
        summary: input.summary,
        workflowStatus: input.workflowStatus ?? "draft",
        createdBy: editorId,
        updatedBy: editorId,
      })
      .returning();
    res.status(201).json(CreateEvidenceEventResponse.parse(serializeEvent(event)));
  } catch (error) {
    next(error);
  }
});

router.put("/editor/events/:eventId", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const eventId = parseId(req.params.eventId);
    if (!eventId) {
      res.status(400).json({ message: "Invalid event id" });
      return;
    }
    const parsed = UpdateEvidenceEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    if (!isDateOnly(parsed.data.recordDate)) {
      res.status(400).json({ message: "Event record dates must be calendar dates in YYYY-MM-DD format." });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    const [event] = await db
      .update(evidenceEventsTable)
      .set({
        title: parsed.data.title.trim(),
        topic: parsed.data.topic,
        recordDate: dateOnly(parsed.data.recordDate),
        summary: parsed.data.summary,
        workflowStatus: parsed.data.workflowStatus ?? "draft",
        updatedBy: editorId,
        updatedAt: new Date(),
      })
      .where(eq(evidenceEventsTable.id, eventId))
      .returning();
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(UpdateEvidenceEventResponse.parse(serializeEvent(event)));
  } catch (error) {
    next(error);
  }
});

router.delete("/editor/events/:eventId", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const eventId = parseId(req.params.eventId);
    if (!eventId) {
      res.status(400).json({ message: "Invalid event id" });
      return;
    }
    const [deleted] = await db
      .delete(evidenceEventsTable)
      .where(eq(evidenceEventsTable.id, eventId))
      .returning({ id: evidenceEventsTable.id });
    if (!deleted) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.post("/editor/sources", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateSourceDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    if (!isDateOnly(parsed.data.publicationDate)) {
      res.status(400).json({ message: "Source publication dates must be calendar dates in YYYY-MM-DD format." });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    const [source] = await db
      .insert(sourceDocumentsTable)
      .values({
        title: parsed.data.title.trim(),
        publisher: parsed.data.publisher.trim(),
        publicationDate: dateOnly(parsed.data.publicationDate),
        documentType: parsed.data.documentType,
        sourceUrl: parsed.data.sourceUrl ?? null,
        status: parsed.data.status,
        createdBy: editorId,
        updatedBy: editorId,
      })
      .returning();
    res.status(201).json(CreateSourceDocumentResponse.parse(serializeSource(source)));
  } catch (error) {
    next(error);
  }
});

router.put("/editor/sources/:sourceId", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const sourceId = parseId(req.params.sourceId);
    if (!sourceId) {
      res.status(400).json({ message: "Invalid source id" });
      return;
    }
    const parsed = UpdateSourceDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    if (!isDateOnly(parsed.data.publicationDate)) {
      res.status(400).json({ message: "Source publication dates must be calendar dates in YYYY-MM-DD format." });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    const [source] = await db
      .update(sourceDocumentsTable)
      .set({
        title: parsed.data.title.trim(),
        publisher: parsed.data.publisher.trim(),
        publicationDate: dateOnly(parsed.data.publicationDate),
        documentType: parsed.data.documentType,
        sourceUrl: parsed.data.sourceUrl ?? null,
        status: parsed.data.status,
        updatedBy: editorId,
        updatedAt: new Date(),
      })
      .where(eq(sourceDocumentsTable.id, sourceId))
      .returning();
    if (!source) {
      res.status(404).json({ message: "Source document not found" });
      return;
    }
    res.json(UpdateSourceDocumentResponse.parse(serializeSource(source)));
  } catch (error) {
    next(error);
  }
});

router.delete("/editor/sources/:sourceId", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const sourceId = parseId(req.params.sourceId);
    if (!sourceId) {
      res.status(400).json({ message: "Invalid source id" });
      return;
    }
    const [deleted] = await db
      .delete(sourceDocumentsTable)
      .where(eq(sourceDocumentsTable.id, sourceId))
      .returning({ id: sourceDocumentsTable.id });
    if (!deleted) {
      res.status(404).json({ message: "Source document not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.post("/editor/article-events", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const parsed = LinkArticleToEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const [story, event, existing] = await Promise.all([
      db.select({ id: storiesTable.id }).from(storiesTable)
        .where(eq(storiesTable.id, parsed.data.articleId)).limit(1),
      db.select({ id: evidenceEventsTable.id }).from(evidenceEventsTable)
        .where(eq(evidenceEventsTable.id, parsed.data.eventId)).limit(1),
      db.select({ id: articleEventsTable.id }).from(articleEventsTable)
        .where(and(
          eq(articleEventsTable.articleId, parsed.data.articleId),
          eq(articleEventsTable.eventId, parsed.data.eventId),
        )).limit(1),
    ]);
    if (!story[0] || !event[0]) {
      res.status(404).json({ message: "Article or event not found" });
      return;
    }
    if (existing[0]) {
      res.status(400).json({ message: "This article is already linked to the event." });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    await db.insert(articleEventsTable).values({
      articleId: parsed.data.articleId,
      eventId: parsed.data.eventId,
      createdBy: editorId,
    });
    res.status(201).json(LinkArticleToEventResponse.parse({ linked: true }));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(400).json({ message: "This article is already linked to the event." });
      return;
    }
    next(error);
  }
});

router.delete(
  "/editor/article-events/:eventId/:storyId",
  requireEditor,
  async (req, res, next): Promise<void> => {
    try {
      const eventId = parseId(req.params.eventId);
      const storyId = parseId(req.params.storyId);
      if (!eventId || !storyId) {
        res.status(400).json({ message: "Invalid article or event id" });
        return;
      }
      const [deleted] = await db
        .delete(articleEventsTable)
        .where(and(
          eq(articleEventsTable.eventId, eventId),
          eq(articleEventsTable.articleId, storyId),
        ))
        .returning({ id: articleEventsTable.id });
      if (!deleted) {
        res.status(404).json({ message: "Article-event relationship not found" });
        return;
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/editor/article-sources", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const parsed = LinkArticleToSourceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const [story, source] = await Promise.all([
      database.select({ id: storiesTable.id }).from(storiesTable)
        .where(eq(storiesTable.id, parsed.data.articleId)).limit(1),
      database.select({ id: sourceDocumentsTable.id }).from(sourceDocumentsTable)
        .where(eq(sourceDocumentsTable.id, parsed.data.sourceDocumentId)).limit(1),
    ]);
    if (!story[0] || !source[0]) {
      res.status(404).json({ message: "Article or source document not found" });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    const [created] = await database
      .insert(articleSourcesTable)
      .values({
        articleId: parsed.data.articleId,
        sourceDocumentId: parsed.data.sourceDocumentId,
        sourceRole: parsed.data.sourceRole ?? "secondary",
        createdBy: editorId,
      })
      .onConflictDoNothing()
      .returning({ id: articleSourcesTable.id });
    if (!created) {
      res.status(400).json({ message: "This source document is already directly linked to the article." });
      return;
    }
    res.status(201).json(LinkArticleToSourceResponse.parse({ linked: true }));
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/editor/article-sources/:storyId/:sourceId",
  requireEditor,
  async (req, res, next): Promise<void> => {
    try {
      const storyId = parseId(req.params.storyId);
      const sourceId = parseId(req.params.sourceId);
      if (!storyId || !sourceId) {
        res.status(400).json({ message: "Invalid article or source id" });
        return;
      }
      const parsed = UpdateArticleSourceRoleBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      const [updated] = await database
        .update(articleSourcesTable)
        .set({ sourceRole: parsed.data.sourceRole })
        .where(and(
          eq(articleSourcesTable.articleId, storyId),
          eq(articleSourcesTable.sourceDocumentId, sourceId),
        ))
        .returning({ sourceRole: articleSourcesTable.sourceRole });
      if (!updated) {
        res.status(404).json({ message: "Article-source relationship not found" });
        return;
      }
      res.json(
        UpdateArticleSourceRoleResponse.parse({
          sourceRole: sourceRoles.has(updated.sourceRole)
            ? updated.sourceRole
            : "secondary",
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/editor/article-sources/:storyId/:sourceId",
  requireEditor,
  async (req, res, next): Promise<void> => {
    try {
      const storyId = parseId(req.params.storyId);
      const sourceId = parseId(req.params.sourceId);
      if (!storyId || !sourceId) {
        res.status(400).json({ message: "Invalid article or source id" });
        return;
      }
      const [deleted] = await database
        .delete(articleSourcesTable)
        .where(and(
          eq(articleSourcesTable.articleId, storyId),
          eq(articleSourcesTable.sourceDocumentId, sourceId),
        ))
        .returning({ id: articleSourcesTable.id });
      if (!deleted) {
        res.status(404).json({ message: "Article-source relationship not found" });
        return;
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/editor/event-sources", requireEditor, async (req, res, next): Promise<void> => {
  try {
    const parsed = LinkSourceToEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const [event, source, existing] = await Promise.all([
      db.select({ id: evidenceEventsTable.id }).from(evidenceEventsTable)
        .where(eq(evidenceEventsTable.id, parsed.data.eventId)).limit(1),
      db.select({ id: sourceDocumentsTable.id }).from(sourceDocumentsTable)
        .where(eq(sourceDocumentsTable.id, parsed.data.sourceDocumentId)).limit(1),
      db.select({ id: eventSourcesTable.id }).from(eventSourcesTable)
        .where(and(
          eq(eventSourcesTable.eventId, parsed.data.eventId),
          eq(eventSourcesTable.sourceDocumentId, parsed.data.sourceDocumentId),
        )).limit(1),
    ]);
    if (!event[0] || !source[0]) {
      res.status(404).json({ message: "Event or source document not found" });
      return;
    }
    if (existing[0]) {
      res.status(400).json({ message: "This source document is already linked to the event." });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is missing." });
      return;
    }
    await db.insert(eventSourcesTable).values({
      eventId: parsed.data.eventId,
      sourceDocumentId: parsed.data.sourceDocumentId,
      sourceRole: parsed.data.sourceRole,
      createdBy: editorId,
    });
    res.status(201).json(LinkSourceToEventResponse.parse({ linked: true }));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(400).json({ message: "This source document is already linked to the event." });
      return;
    }
    next(error);
  }
});

router.delete(
  "/editor/event-sources/:eventId/:sourceId",
  requireEditor,
  async (req, res, next): Promise<void> => {
    try {
      const eventId = parseId(req.params.eventId);
      const sourceId = parseId(req.params.sourceId);
      if (!eventId || !sourceId) {
        res.status(400).json({ message: "Invalid event or source id" });
        return;
      }
      const [deleted] = await db
        .delete(eventSourcesTable)
        .where(and(
          eq(eventSourcesTable.eventId, eventId),
          eq(eventSourcesTable.sourceDocumentId, sourceId),
        ))
        .returning({ id: eventSourcesTable.id });
      if (!deleted) {
        res.status(404).json({ message: "Event-source relationship not found" });
        return;
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

return router;
}

export default createEvidenceRouter();