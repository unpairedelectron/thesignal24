import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, inArray, like, lte, or } from "drizzle-orm";
import {
  db,
  articleEventsTable,
  articleSourcesTable,
  decisionImpactRecordsTable,
  decisionImpactRevisionsTable,
  eventSourcesTable,
  evidenceEventsTable,
  issuesTable,
  policyRecordsTable,
  policySourcesTable,
  sourceDocumentsTable,
  storiesTable,
  storyRevisionsTable,
} from "@workspace/db";
import {
  CreateIssueBody,
  CreateDecisionImpactBody,
  CreateStoryBody,
  GetDecisionImpactsQueryParams,
  GetDecisionImpactsResponse,
  GetDecisionImpactRevisionsResponse,
  GetPoliciesQueryParams,
  GetPoliciesResponse,
  GetPolicyParams,
  GetPolicyResponse,
  GetStoryRevisionsResponse,
  UpdateStoryBody,
  UpdateDecisionImpactBody,
} from "@workspace/api-zod";
import { getLiveUpdates } from "../lib/live-feed";
import {
  requireEditor,
  requireEditorForUnpublished,
} from "../middlewares/editorAuth";

const router: IRouter = Router();

const topicList = [
  "Latest",
  "Courts & Policy",
  "States",
  "History",
  "Ground Reports",
  "Data & Notes",
] as const;
const topicValues = new Set(topicList);
type Topic = (typeof topicList)[number];
const kindList = ["Article", "Paper note", "Archive", "Explainer"] as const;
const kindValues = new Set(kindList);
type StoryKind = (typeof kindList)[number];
const recordFamilyList = [
  "articles",
  "policies",
  "cases",
  "documents",
  "states",
  "data",
] as const;
type RecordFamily = (typeof recordFamilyList)[number];
const workflowStatusList = [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
] as const;
const workflowStatusValues = new Set(workflowStatusList);
type WorkflowStatus = (typeof workflowStatusList)[number];
const verificationStatusList = ["unverified", "source-linked", "verified"] as const;
const verificationStatusValues = new Set(verificationStatusList);
type VerificationStatus = (typeof verificationStatusList)[number];
const decisionImpactEvidenceTypeList = [
  "lived-account",
  "monitored-lead",
  "quantified-finding",
] as const;
const decisionImpactEvidenceTypeValues = new Set(decisionImpactEvidenceTypeList);
type DecisionImpactEvidenceType =
  (typeof decisionImpactEvidenceTypeList)[number];
const decisionImpactAreaList = [
  "migration",
  "study",
  "work",
  "applications",
  "staying",
  "speaking",
  "leaving",
] as const;
const decisionImpactAreaValues = new Set(decisionImpactAreaList);
type DecisionImpactArea = (typeof decisionImpactAreaList)[number];
const decisionImpactWorkflowStatusList = [
  "draft",
  "review",
  "published",
  "archived",
] as const;
const decisionImpactWorkflowStatusValues = new Set(
  decisionImpactWorkflowStatusList,
);
type DecisionImpactWorkflowStatus =
  (typeof decisionImpactWorkflowStatusList)[number];

function parseId(value: unknown) {
  if (typeof value !== "string") return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

function serializeIssue(issue: typeof issuesTable.$inferSelect) {
  return {
    id: issue.id,
    issueDate: issue.issueDate,
    issueNumber: issue.issueNumber,
    status: issue.status === "published" ? "published" : "draft",
    title: issue.title,
    intro: issue.intro,
    publishedAt: issue.publishedAt?.toISOString() ?? null,
  };
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRecordFamily(story: typeof storiesTable.$inferSelect): RecordFamily {
  if (story.topic === "States") return "states";
  if (story.topic === "Data & Notes") return "data";
  if (story.topic === "Courts & Policy") {
    return story.kind === "Paper note" ? "cases" : "policies";
  }
  if (story.kind === "Archive") return "documents";
  return "articles";
}

function getStorySlug(story: typeof storiesTable.$inferSelect) {
  return `${slugify(story.title) || "record"}-${story.id}`;
}

function getCanonicalPath(story: typeof storiesTable.$inferSelect) {
  return `/${getRecordFamily(story)}/${getStorySlug(story)}`;
}

function isIndexableStory(story: typeof storiesTable.$inferSelect) {
  const markerText = `${story.source} ${story.title} ${story.dek} ${story.body}`;
  return Boolean(
    story.publishedOn &&
      story.sourceUrl &&
      story.title.trim().length >= 12 &&
      story.dek.trim().length >= 40 &&
      story.body.trim().length >= 240 &&
      !/(starter|source link pending|placeholder|reporting needed|editorial desk)/i.test(
        markerText,
      ),
  );
}

function serializeStory(
  story: typeof storiesTable.$inferSelect,
  articlePublishedAt: Date | null = null,
) {
  const recordFamily = getRecordFamily(story);
  return {
    id: story.id,
    issueId: story.issueId,
    topic: topicValues.has(story.topic as Topic)
      ? (story.topic as Topic)
      : "Latest",
    kind: kindValues.has(story.kind as StoryKind)
      ? (story.kind as StoryKind)
      : "Article",
    state: story.state,
    source: story.source,
    sourceUrl: story.sourceUrl,
    publishedOn: story.publishedOn,
    recordDate: dateOnly(story.publishedOn),
    articlePublishedAt: articlePublishedAt?.toISOString() ?? null,
    eyebrow: story.eyebrow,
    title: story.title,
    dek: story.dek,
    body: story.body,
    time: story.time,
    read: story.read,
    tone: story.tone,
    number: story.number,
    sortOrder: story.sortOrder,
    slug: getStorySlug(story),
    recordFamily,
    canonicalPath: getCanonicalPath(story),
    indexable: isIndexableStory(story),
    workflowStatus: workflowStatusValues.has(story.workflowStatus as WorkflowStatus)
      ? (story.workflowStatus as WorkflowStatus)
      : "draft",
    verificationStatus: verificationStatusValues.has(
      story.verificationStatus as VerificationStatus,
    )
      ? (story.verificationStatus as VerificationStatus)
      : "unverified",
    verificationNotes: story.verificationNotes,
    sourcePublishedOn: story.sourcePublishedOn,
    sourceRetrievedOn: story.sourceRetrievedOn,
    lastVerifiedAt: story.lastVerifiedAt?.toISOString() ?? null,
    reviewedAt: story.reviewedAt?.toISOString() ?? null,
    scheduledFor: story.scheduledFor?.toISOString() ?? null,
    aiDisclosure: story.aiDisclosure,
    correctionNote: story.correctionNote,
  };
}

async function addPublicEvidenceCounts<T extends { id: number }>(stories: T[]) {
  if (stories.length === 0) return stories.map((story) => ({ ...story, eventCount: 0, sourceCount: 0 }));
  const articleIds = stories.map((story) => story.id);
  const articleEventLinks = await db
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
    );
  const eventIds = [...new Set(articleEventLinks.map((link) => link.eventId))];
  const eventSources = eventIds.length
    ? await db
        .select({
          eventId: eventSourcesTable.eventId,
          sourceDocumentId: eventSourcesTable.sourceDocumentId,
        })
        .from(eventSourcesTable)
        .where(inArray(eventSourcesTable.eventId, eventIds))
    : [];
  const eventsByArticle = new Map<number, Set<number>>();
  const sourcesByEvent = new Map<number, Set<number>>();
  for (const link of articleEventLinks) {
    const linkedEvents = eventsByArticle.get(link.articleId) ?? new Set<number>();
    linkedEvents.add(link.eventId);
    eventsByArticle.set(link.articleId, linkedEvents);
  }
  for (const link of eventSources) {
    const linkedSources = sourcesByEvent.get(link.eventId) ?? new Set<number>();
    linkedSources.add(link.sourceDocumentId);
    sourcesByEvent.set(link.eventId, linkedSources);
  }
  return stories.map((story) => {
    const linkedEvents = eventsByArticle.get(story.id) ?? new Set<number>();
    const linkedSources = new Set<number>();
    for (const eventId of linkedEvents) {
      for (const sourceId of sourcesByEvent.get(eventId) ?? []) {
        linkedSources.add(sourceId);
      }
    }
    return {
      ...story,
      eventCount: linkedEvents.size,
      sourceCount: linkedSources.size,
    };
  });
}

async function recordRevision(
  story: typeof storiesTable.$inferSelect,
  changeNote?: string | null,
) {
  const [latest] = await db
    .select({ revisionNumber: storyRevisionsTable.revisionNumber })
    .from(storyRevisionsTable)
    .where(eq(storyRevisionsTable.storyId, story.id))
    .orderBy(desc(storyRevisionsTable.revisionNumber))
    .limit(1);
  await db.insert(storyRevisionsTable).values({
    storyId: story.id,
    revisionNumber: (latest?.revisionNumber ?? 0) + 1,
    changeNote: changeNote ?? null,
    snapshot: serializeStory(story),
  });
}

async function getIssuePayload(
  issue: typeof issuesTable.$inferSelect,
  includeUnpublished: boolean,
) {
  const stories = await db
    .select()
    .from(storiesTable)
    .where(
      includeUnpublished
        ? eq(storiesTable.issueId, issue.id)
        : and(
            eq(storiesTable.issueId, issue.id),
            eq(storiesTable.workflowStatus, "published"),
          ),
    )
    .orderBy(storiesTable.sortOrder, storiesTable.id);
  const serializedStories = stories.map((story) =>
    serializeStory(
      story,
      story.workflowStatus === "published" ? issue.publishedAt : null,
    ),
  );
  return {
    issue: serializeIssue(issue),
    stories: serializedStories,
    topics: [...new Set(serializedStories.map((story) => story.topic))],
  };
}

function queryString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function serializePolicySource(source: typeof policySourcesTable.$inferSelect) {
  return {
    id: source.id,
    title: source.title,
    sourceType: source.sourceType,
    publisher: source.publisher,
    url: source.url,
    publishedOn: source.publishedOn,
    retrievedOn: source.retrievedOn,
    isPrimary: source.isPrimary,
  };
}
function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Sitemap URLs always use the canonical public origin, never the request Host,
// so mirror hosts (e.g. *.replit.app) cannot publish a sitemap of their own URLs.
const SITE_ORIGIN = (process.env.SITE_URL || "https://thesignal24.com").replace(
  /\/$/,
  "",
);

type SitemapEntry = { path: string; lastmod?: Date | null };

function latestDate(dates: Array<Date | null | undefined>) {
  let latest: Date | null = null;
  for (const date of dates) {
    if (date && (!latest || date > latest)) latest = date;
  }
  return latest;
}

function sitemapUrl({ path, lastmod }: SitemapEntry) {
  const lastmodTag = lastmod
    ? `<lastmod>${lastmod.toISOString()}</lastmod>`
    : "";
  return `<url><loc>${xmlEscape(`${SITE_ORIGIN}${path}`)}</loc>${lastmodTag}</url>`;
}

router.get("/issues/current", async (_req, res, next) => {
  try {
    const [issue] = await db
      .select()
      .from(issuesTable)
      .where(eq(issuesTable.status, "published"))
      .orderBy(desc(issuesTable.issueDate))
      .limit(1);

    if (!issue) {
      res.status(404).json({ message: "No published issue exists" });
      return;
    }

    res.json(await getIssuePayload(issue, false));
  } catch (error) {
    next(error);
  }
});

router.get("/updates/live", async (_req, res, next) => {
  try {
    res.json(await getLiveUpdates());
  } catch (error) {
    next(error);
  }
});

router.get("/editor/session", requireEditor, (req, res) => {
  res.json({ displayName: req.editorIdentity!.displayName });
});

router.get("/editor/issues/current", requireEditor, async (_req, res, next) => {
  try {
    const [issue] = await db
      .select()
      .from(issuesTable)
      .where(eq(issuesTable.status, "published"))
      .orderBy(desc(issuesTable.issueDate))
      .limit(1);

    if (!issue) {
      res.status(404).json({ message: "No issue exists" });
      return;
    }

    res.json(await getIssuePayload(issue, true));
  } catch (error) {
    next(error);
  }
});

router.get("/archive", async (req, res, next) => {
  try {
    const q = queryString(req.query.q);
    const topic = queryString(req.query.topic);
    const kind = queryString(req.query.kind);
    const state = queryString(req.query.state);
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isInteger(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 50;
    const conditions = [
      eq(issuesTable.status, "published"),
      eq(storiesTable.workflowStatus, "published"),
      inArray(storiesTable.topic, [...topicList]),
    ];
    if (topicValues.has(topic as Topic)) conditions.push(eq(storiesTable.topic, topic));
    if (kindValues.has(kind as StoryKind)) conditions.push(eq(storiesTable.kind, kind));
    if (state) conditions.push(eq(storiesTable.state, state));
    if (q) {
      const search = `%${q}%`;
      conditions.push(
        or(
          like(storiesTable.title, search),
          like(storiesTable.dek, search),
          like(storiesTable.body, search),
          like(storiesTable.source, search),
          like(storiesTable.state, search),
        )!,
      );
    }
    const results = await db
      .select({
        story: storiesTable,
        articlePublishedAt: issuesTable.publishedAt,
      })
      .from(storiesTable)
      .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
      .where(and(...conditions))
      .orderBy(
        desc(storiesTable.publishedOn),
        desc(issuesTable.issueDate),
        asc(storiesTable.sortOrder),
        asc(storiesTable.id),
      )
      .limit(limit);
    const serializedStories = await addPublicEvidenceCounts(
      results.map(({ story, articlePublishedAt }) =>
        serializeStory(story, articlePublishedAt),
      ),
    );
    res.json({
      stories: serializedStories,
      topics: [...new Set(serializedStories.map((story) => story.topic))],
      kinds: [...new Set(serializedStories.map((story) => story.kind))],
      states: [...new Set(serializedStories.map((story) => story.state).filter(Boolean))],
    });
  } catch (error) {
    next(error);
  }
});

router.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const [results, policyResults, eventResults, eventSourceResults, articleSourceResults] =
      await Promise.all([
        db
          .select({ story: storiesTable })
          .from(storiesTable)
          .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
          .where(
            and(
              eq(issuesTable.status, "published"),
              eq(storiesTable.workflowStatus, "published"),
            ),
          )
          .orderBy(desc(storiesTable.updatedAt), asc(storiesTable.id)),
        db
          .select()
          .from(policyRecordsTable)
          .where(eq(policyRecordsTable.workflowStatus, "published"))
          .orderBy(desc(policyRecordsTable.updatedAt), asc(policyRecordsTable.id)),
        db
          .select()
          .from(evidenceEventsTable)
          .where(eq(evidenceEventsTable.workflowStatus, "published"))
          .orderBy(desc(evidenceEventsTable.updatedAt), asc(evidenceEventsTable.id)),
        // Source pages are only public when linked to published records.
        db
          .select({ source: sourceDocumentsTable })
          .from(eventSourcesTable)
          .innerJoin(
            evidenceEventsTable,
            eq(eventSourcesTable.eventId, evidenceEventsTable.id),
          )
          .innerJoin(
            sourceDocumentsTable,
            eq(eventSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
          )
          .where(eq(evidenceEventsTable.workflowStatus, "published")),
        db
          .select({ source: sourceDocumentsTable })
          .from(articleSourcesTable)
          .innerJoin(storiesTable, eq(articleSourcesTable.articleId, storiesTable.id))
          .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
          .innerJoin(
            sourceDocumentsTable,
            eq(articleSourcesTable.sourceDocumentId, sourceDocumentsTable.id),
          )
          .where(
            and(
              eq(storiesTable.workflowStatus, "published"),
              eq(issuesTable.status, "published"),
            ),
          ),
      ]);

    const indexableStories = results
      .map(({ story }) => story)
      .filter(isIndexableStory);
    const storiesLastmod = latestDate(indexableStories.map((story) => story.updatedAt));
    const policiesLastmod = latestDate(policyResults.map((policy) => policy.updatedAt));
    const eventsLastmod = latestDate(eventResults.map((event) => event.updatedAt));

    const topicLastmod = new Map<string, Date>();
    for (const story of indexableStories) {
      const current = topicLastmod.get(story.topic);
      if (!current || story.updatedAt > current) topicLastmod.set(story.topic, story.updatedAt);
    }

    const sources = new Map<number, typeof sourceDocumentsTable.$inferSelect>();
    for (const { source } of [...eventSourceResults, ...articleSourceResults]) {
      sources.set(source.id, source);
    }

    const entries: SitemapEntry[] = [
      { path: "/", lastmod: latestDate([storiesLastmod, policiesLastmod]) },
      { path: "/archive", lastmod: storiesLastmod },
      { path: "/policies", lastmod: policiesLastmod },
      { path: "/topics", lastmod: storiesLastmod },
      { path: "/topics/open-category-competition" },
      { path: "/timeline", lastmod: latestDate([storiesLastmod, policiesLastmod]) },
      { path: "/events", lastmod: eventsLastmod },
      { path: "/data" },
      { path: "/about" },
      { path: "/editorial-standards" },
      { path: "/methodology" },
      { path: "/authors/signal-24" },
      ...Array.from(topicLastmod, ([topic, lastmod]) => ({
        path: `/topics/${encodeURIComponent(topic)}`,
        lastmod,
      })),
      ...indexableStories.map((story) => ({
        path: getCanonicalPath(story),
        lastmod: story.updatedAt,
      })),
      ...policyResults.map((policy) => ({
        path: `/policies/${policy.slug}`,
        lastmod: policy.updatedAt,
      })),
      ...eventResults.map((event) => ({
        path: `/events/${event.id}`,
        lastmod: event.updatedAt,
      })),
      ...Array.from(sources.values(), (source) => ({
        path: `/sources/${source.id}`,
        lastmod: source.updatedAt,
      })),
    ];

    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(sitemapUrl).join("")}</urlset>`,
    );
  } catch (error) {
    next(error);
  }
});

router.post("/issues", requireEditor, async (req, res, next) => {
  try {
    const parsed = CreateIssueBody.parse(req.body);
    const input = {
      ...parsed,
      issueDate: parsed.issueDate.toISOString().slice(0, 10),
    };
    const [issue] = await db
      .insert(issuesTable)
      .values(input)
      .returning();
    res.status(201).json(serializeIssue(issue));
  } catch (error) {
    next(error);
  }
});

router.post(
  "/issues/:issueId/publish",
  requireEditor,
  async (req, res, next) => {
  try {
    const issueId = parseId(req.params.issueId);
    if (!issueId) {
      res.status(400).json({ message: "Invalid issue id" });
      return;
    }

    const [issue] = await db
      .select()
      .from(issuesTable)
      .where(eq(issuesTable.id, issueId))
      .limit(1);
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    const issueStories = await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.issueId, issueId));
    const blockedStories = issueStories.filter(
      (story) =>
        !story.reviewedAt ||
        !["review", "published"].includes(story.workflowStatus),
    );
    if (blockedStories.length > 0) {
      res.status(409).json({
        message:
          "Every record must pass editorial review before the issue can be published.",
        blockedStoryIds: blockedStories.map((story) => story.id),
      });
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(issuesTable)
        .set({ status: "draft", publishedAt: null })
        .where(eq(issuesTable.status, "published"));
      await tx
        .update(issuesTable)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(issuesTable.id, issueId));
      await tx
        .update(storiesTable)
        .set({ workflowStatus: "published", updatedAt: new Date() })
        .where(
          and(
            eq(storiesTable.issueId, issueId),
            inArray(storiesTable.workflowStatus, ["review", "published"]),
          ),
        );
    });

    const [publishedIssue] = await db
      .select()
      .from(issuesTable)
      .where(eq(issuesTable.id, issueId))
      .limit(1);
    res.json(serializeIssue(publishedIssue));
  } catch (error) {
    next(error);
  }
});

router.get("/stories/:storyId", async (req, res, next) => {
  try {
    const storyId = parseId(req.params.storyId);
    if (!storyId) {
      res.status(400).json({ message: "Invalid story id" });
      return;
    }
    const [story] = await db
      .select({
        story: storiesTable,
        articlePublishedAt: issuesTable.publishedAt,
      })
      .from(storiesTable)
      .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
      .where(
        and(
          eq(storiesTable.id, storyId),
          eq(issuesTable.status, "published"),
          eq(storiesTable.workflowStatus, "published"),
        ),
      )
      .limit(1);
    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }
    res.json(serializeStory(story.story, story.articlePublishedAt));
  } catch (error) {
    next(error);
  }
});

router.get(
  "/stories/:storyId/revisions",
  requireEditor,
  async (req, res, next) => {
  try {
    const storyId = parseId(req.params.storyId);
    if (!storyId) {
      res.status(400).json({ message: "Invalid story id" });
      return;
    }
    const [story] = await db
      .select({ id: storiesTable.id })
      .from(storiesTable)
      .where(eq(storiesTable.id, storyId))
      .limit(1);
    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }
    const revisions = await db
      .select()
      .from(storyRevisionsTable)
      .where(eq(storyRevisionsTable.storyId, storyId))
      .orderBy(desc(storyRevisionsTable.revisionNumber));
    res.json(
      GetStoryRevisionsResponse.parse(
        revisions.map((revision) => ({
          id: revision.id,
          storyId: revision.storyId,
          revisionNumber: revision.revisionNumber,
          changeNote: revision.changeNote,
          snapshot: revision.snapshot,
          createdAt: revision.createdAt.toISOString(),
        })),
      ),
    );
  } catch (error) {
    next(error);
  }
});

function dateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

router.post("/stories", requireEditor, async (req, res, next) => {
  try {
    const input = CreateStoryBody.parse(req.body);
    const workflowStatus = input.workflowStatus ?? "draft";
    if (!["draft", "review"].includes(workflowStatus)) {
      res.status(400).json({
        message: "New records must start as drafts or enter editorial review.",
      });
      return;
    }
    const [story] = await db
      .insert(storiesTable)
      .values({
        issueId: input.issueId,
        topic: input.topic,
        kind: input.kind,
        state: input.state ?? null,
        source: input.source,
        sourceUrl: input.sourceUrl ?? null,
        publishedOn: dateOnly(input.publishedOn),
        eyebrow: input.eyebrow,
        title: input.title,
        dek: input.dek,
        body: input.body,
        time: input.time,
        read: input.read,
        tone: input.tone,
        number: input.number ?? null,
        sortOrder: input.sortOrder,
        workflowStatus,
        verificationStatus: input.verificationStatus ?? "unverified",
        verificationNotes: input.verificationNotes ?? null,
        sourcePublishedOn: dateOnly(input.sourcePublishedOn),
        sourceRetrievedOn: dateOnly(input.sourceRetrievedOn),
        lastVerifiedAt: input.verificationStatus === "verified" ? new Date() : null,
        reviewedAt: workflowStatus === "review" ? new Date() : null,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        aiDisclosure: input.aiDisclosure ?? null,
        correctionNote: input.correctionNote ?? null,
      })
      .returning();
    await recordRevision(story, input.revisionNote ?? "Created record");
    res.status(201).json(serializeStory(story));
  } catch (error) {
    next(error);
  }
});

router.put("/stories/:storyId", requireEditor, async (req, res, next) => {
  try {
    const storyId = parseId(req.params.storyId);
    if (!storyId) {
      res.status(400).json({ message: "Invalid story id" });
      return;
    }
    const input = UpdateStoryBody.parse(req.body);
    const [existing] = await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.id, storyId))
      .limit(1);
    if (!existing) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    const workflowStatus = input.workflowStatus ?? existing.workflowStatus;
    if (
      workflowStatus === "published" &&
      (!existing.reviewedAt || existing.workflowStatus === "published")
    ) {
      res.status(400).json({
        message:
          "Published records must pass review and be moved to draft before editorial changes.",
      });
      return;
    }
    if (workflowStatus === "scheduled" && !existing.reviewedAt) {
      res.status(400).json({
        message: "Scheduled records must first pass editorial review.",
      });
      return;
    }
    if (workflowStatus === "scheduled" && !input.scheduledFor) {
      res.status(400).json({
        message: "Scheduled records need a publication date and time.",
      });
      return;
    }

    const {
      publishedOn,
      scheduledFor,
      revisionNote,
      ...storyInput
    } = input;
    const verificationStatus =
      input.verificationStatus ?? existing.verificationStatus;
    const [story] = await db
      .update(storiesTable)
      .set({
        ...storyInput,
        state: input.state === undefined ? existing.state : input.state,
        sourceUrl:
          input.sourceUrl === undefined ? existing.sourceUrl : input.sourceUrl,
        publishedOn:
          publishedOn === undefined
            ? existing.publishedOn
            : dateOnly(publishedOn),
        number: input.number ?? null,
        workflowStatus,
        verificationStatus,
        verificationNotes:
          input.verificationNotes === undefined
            ? existing.verificationNotes
            : input.verificationNotes,
        sourcePublishedOn:
          input.sourcePublishedOn === undefined
            ? existing.sourcePublishedOn
            : dateOnly(input.sourcePublishedOn),
        sourceRetrievedOn:
          input.sourceRetrievedOn === undefined
            ? existing.sourceRetrievedOn
            : dateOnly(input.sourceRetrievedOn),
        lastVerifiedAt:
          verificationStatus === "verified"
            ? existing.lastVerifiedAt ?? new Date()
            : verificationStatus === "unverified"
              ? null
              : existing.lastVerifiedAt,
        reviewedAt:
          workflowStatus === "review"
            ? existing.reviewedAt ?? new Date()
            : workflowStatus === "draft"
              ? null
              : existing.reviewedAt,
        scheduledFor:
          scheduledFor === undefined
            ? existing.scheduledFor
            : scheduledFor
              ? new Date(scheduledFor)
              : null,
        aiDisclosure:
          input.aiDisclosure === undefined
            ? existing.aiDisclosure
            : input.aiDisclosure,
        correctionNote:
          input.correctionNote === undefined
            ? existing.correctionNote
            : input.correctionNote,
        updatedAt: new Date(),
      })
      .where(eq(storiesTable.id, storyId))
      .returning();
    await recordRevision(story, revisionNote ?? "Updated record");
    res.json(serializeStory(story));
  } catch (error) {
    next(error);
  }
});

function serializePolicy(
  policy: typeof policyRecordsTable.$inferSelect,
  sources: typeof policySourcesTable.$inferSelect[],
) {
  return {
    id: policy.id,
    slug: policy.slug,
    canonicalPath: `/policies/${policy.slug}`,
    title: policy.title,
    summary: policy.summary,
    state: policy.state,
    sector: policy.sector,
    status: policy.status,
    authority: policy.authority,
    previousFramework: policy.previousFramework,
    newFramework: policy.newFramework,
    legalBasis: policy.legalBasis,
    courtStatus: policy.courtStatus,
    effectiveDate: policy.effectiveDate,
    publishedOn: policy.publishedOn,
    sources: sources.map(serializePolicySource),
  };
}

function serializeDecisionImpact(
  record: typeof decisionImpactRecordsTable.$inferSelect,
) {
  return {
    id: record.id,
    slug: record.slug,
    evidenceType: decisionImpactEvidenceTypeValues.has(
      record.evidenceType as DecisionImpactEvidenceType,
    )
      ? (record.evidenceType as DecisionImpactEvidenceType)
      : "lived-account",
    decisionArea: decisionImpactAreaValues.has(
      record.decisionArea as DecisionImpactArea,
    )
      ? (record.decisionArea as DecisionImpactArea)
      : "migration",
    title: record.title,
    summary: record.summary,
    geography: record.geography,
    observedOn: record.observedOn,
    definition: record.definition,
    findingValue: record.findingValue,
    findingUnit: record.findingUnit,
    denominator: record.denominator,
    source: record.source,
    sourceUrl: record.sourceUrl,
    sourcePublishedOn: record.sourcePublishedOn,
    sourceRetrievedOn: record.sourceRetrievedOn,
    verificationStatus: verificationStatusValues.has(
      record.verificationStatus as VerificationStatus,
    )
      ? (record.verificationStatus as VerificationStatus)
      : "unverified",
    verificationNotes: record.verificationNotes,
    workflowStatus: decisionImpactWorkflowStatusValues.has(
      record.workflowStatus as DecisionImpactWorkflowStatus,
    )
      ? (record.workflowStatus as DecisionImpactWorkflowStatus)
      : "draft",
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    lastVerifiedAt: record.lastVerifiedAt?.toISOString() ?? null,
    publishedOn: record.publishedOn,
  };
}

function decisionImpactSlug(title: string, id: number) {
  return `${slugify(title) || "decision-impact"}-${id}`;
}

type DecisionImpactTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

function decisionImpactChangeNote(
  existing: typeof decisionImpactRecordsTable.$inferSelect | null,
  current: typeof decisionImpactRecordsTable.$inferSelect,
  suppliedNote?: string | null,
) {
  const transitions: string[] = [];
  if (!existing) {
    transitions.push(
      `Created as ${current.workflowStatus}; verification ${current.verificationStatus}`,
    );
  } else {
    if (existing.workflowStatus !== current.workflowStatus) {
      transitions.push(
        `Publication status changed from ${existing.workflowStatus} to ${current.workflowStatus}`,
      );
    }
    if (existing.verificationStatus !== current.verificationStatus) {
      transitions.push(
        `Verification changed from ${existing.verificationStatus} to ${current.verificationStatus}`,
      );
    }
  }
  return [
    suppliedNote?.trim(),
    ...transitions,
  ]
    .filter(Boolean)
    .join(" · ") || "Updated decision-impact record";
}

async function recordDecisionImpactRevision(
  tx: DecisionImpactTransaction,
  record: typeof decisionImpactRecordsTable.$inferSelect,
  changeNote: string,
  editorId: string,
  editorName: string,
) {
  const [latest] = await tx
    .select({
      revisionNumber: decisionImpactRevisionsTable.revisionNumber,
    })
    .from(decisionImpactRevisionsTable)
    .where(
      eq(
        decisionImpactRevisionsTable.decisionImpactRecordId,
        record.id,
      ),
    )
    .orderBy(desc(decisionImpactRevisionsTable.revisionNumber))
    .limit(1);
  await tx.insert(decisionImpactRevisionsTable).values({
    decisionImpactRecordId: record.id,
    revisionNumber: (latest?.revisionNumber ?? 0) + 1,
    changeNote,
    changedBy: editorName,
    changedById: editorId,
    snapshot: serializeDecisionImpact(record),
  });
}

router.get("/policies", async (req, res, next) => {
  try {
    const parsed = GetPoliciesQueryParams.parse({
      ...req.query,
      effectiveFrom: req.query.effectiveFrom
        ? new Date(String(req.query.effectiveFrom))
        : undefined,
      effectiveTo: req.query.effectiveTo
        ? new Date(String(req.query.effectiveTo))
        : undefined,
    });
    const conditions = [eq(policyRecordsTable.workflowStatus, "published")];
    if (parsed.q) {
      const search = `%${parsed.q}%`;
      conditions.push(
        or(
          like(policyRecordsTable.title, search),
          like(policyRecordsTable.summary, search),
          like(policyRecordsTable.state, search),
          like(policyRecordsTable.sector, search),
          like(policyRecordsTable.authority, search),
        )!,
      );
    }
    if (parsed.state) conditions.push(eq(policyRecordsTable.state, parsed.state));
    if (parsed.sector) conditions.push(eq(policyRecordsTable.sector, parsed.sector));
    if (parsed.status) conditions.push(eq(policyRecordsTable.status, parsed.status));
    if (parsed.effectiveFrom) {
      conditions.push(
        gte(policyRecordsTable.effectiveDate, parsed.effectiveFrom.toISOString().slice(0, 10)),
      );
    }
    if (parsed.effectiveTo) {
      conditions.push(
        lte(policyRecordsTable.effectiveDate, parsed.effectiveTo.toISOString().slice(0, 10)),
      );
    }
    const [policies, sources, facets] = await Promise.all([
      db
        .select()
        .from(policyRecordsTable)
        .where(and(...conditions))
        .orderBy(desc(policyRecordsTable.effectiveDate), desc(policyRecordsTable.publishedOn))
        .limit(parsed.limit),
      db
        .select()
        .from(policySourcesTable)
        .orderBy(desc(policySourcesTable.isPrimary), asc(policySourcesTable.id)),
      db
        .select({
          state: policyRecordsTable.state,
          sector: policyRecordsTable.sector,
          status: policyRecordsTable.status,
        })
        .from(policyRecordsTable)
        .where(eq(policyRecordsTable.workflowStatus, "published")),
    ]);
    const sourcesByPolicy = new Map<number, typeof sources>();
    for (const source of sources) {
      const existing = sourcesByPolicy.get(source.policyRecordId) ?? [];
      existing.push(source);
      sourcesByPolicy.set(source.policyRecordId, existing);
    }
    res.json(
      GetPoliciesResponse.parse({
        records: policies.map((policy) =>
          serializePolicy(policy, sourcesByPolicy.get(policy.id) ?? []),
        ),
        states: [...new Set(facets.map((facet) => facet.state).filter(Boolean))],
        sectors: [...new Set(facets.map((facet) => facet.sector))],
        statuses: [...new Set(facets.map((facet) => facet.status))],
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/policies/:slug", async (req, res, next) => {
  try {
    const { slug } = GetPolicyParams.parse(req.params);
    const [policy] = await db
      .select()
      .from(policyRecordsTable)
      .where(
        and(
          eq(policyRecordsTable.slug, slug),
          eq(policyRecordsTable.workflowStatus, "published"),
        ),
      )
      .limit(1);
    if (!policy) {
      res.status(404).json({ message: "Policy record not found" });
      return;
    }
    const sources = await db
      .select()
      .from(policySourcesTable)
      .where(eq(policySourcesTable.policyRecordId, policy.id))
      .orderBy(desc(policySourcesTable.isPrimary), asc(policySourcesTable.id));
    res.json(GetPolicyResponse.parse(serializePolicy(policy, sources)));
  } catch (error) {
    next(error);
  }
});

router.get(
  "/decision-impacts",
  requireEditorForUnpublished,
  async (req, res, next) => {
  try {
    const parsed = GetDecisionImpactsQueryParams.parse({
      ...req.query,
      includeUnpublished: req.query.includeUnpublished === "true",
    });
    const conditions = [];
    if (!parsed.includeUnpublished) {
      conditions.push(eq(decisionImpactRecordsTable.workflowStatus, "published"));
    }
    if (parsed.evidenceType) {
      conditions.push(
        eq(decisionImpactRecordsTable.evidenceType, parsed.evidenceType),
      );
    }
    if (parsed.decisionArea) {
      conditions.push(
        eq(decisionImpactRecordsTable.decisionArea, parsed.decisionArea),
      );
    }
    if (parsed.geography) {
      conditions.push(
        eq(decisionImpactRecordsTable.geography, parsed.geography),
      );
    }
    const records = await db
      .select()
      .from(decisionImpactRecordsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        desc(decisionImpactRecordsTable.observedOn),
        desc(decisionImpactRecordsTable.updatedAt),
      )
      .limit(parsed.limit);
    const facets = await db
      .select({
        evidenceType: decisionImpactRecordsTable.evidenceType,
        decisionArea: decisionImpactRecordsTable.decisionArea,
        geography: decisionImpactRecordsTable.geography,
      })
      .from(decisionImpactRecordsTable)
      .where(
        parsed.includeUnpublished
          ? undefined
          : eq(decisionImpactRecordsTable.workflowStatus, "published"),
      );
    res.json(
      GetDecisionImpactsResponse.parse({
        records: records.map(serializeDecisionImpact),
        evidenceTypes: [
          ...new Set(
            facets
              .map((facet) => facet.evidenceType)
              .filter((value): value is DecisionImpactEvidenceType =>
                decisionImpactEvidenceTypeValues.has(
                  value as DecisionImpactEvidenceType,
                ),
              ),
          ),
        ],
        decisionAreas: [
          ...new Set(
            facets
              .map((facet) => facet.decisionArea)
              .filter((value): value is DecisionImpactArea =>
                decisionImpactAreaValues.has(value as DecisionImpactArea),
              ),
          ),
        ],
        geographies: [
          ...new Set(facets.map((facet) => facet.geography).filter(Boolean)),
        ],
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get(
  "/decision-impacts/:recordId/revisions",
  requireEditor,
  async (req, res, next) => {
  try {
    const recordId = parseId(req.params.recordId);
    if (!recordId) {
      res.status(400).json({ message: "Invalid decision-impact record id" });
      return;
    }
    const [record] = await db
      .select()
      .from(decisionImpactRecordsTable)
      .where(eq(decisionImpactRecordsTable.id, recordId))
      .limit(1);
    if (!record) {
      res.status(404).json({ message: "Decision-impact record not found" });
      return;
    }

    const revisions = await db
      .select()
      .from(decisionImpactRevisionsTable)
      .where(
        eq(decisionImpactRevisionsTable.decisionImpactRecordId, recordId),
      )
      .orderBy(desc(decisionImpactRevisionsTable.revisionNumber));
    res.json(
      GetDecisionImpactRevisionsResponse.parse(
        revisions.map((revision) => ({
          id: revision.id,
          decisionImpactRecordId: revision.decisionImpactRecordId,
          revisionNumber: revision.revisionNumber,
          changeNote: revision.changeNote,
          changedBy: revision.changedById
            ? revision.changedBy
            : "Legacy change — editor not recorded",
          changedById: revision.changedById,
          snapshot: revision.snapshot,
          createdAt: revision.createdAt.toISOString(),
        })),
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/decision-impacts", requireEditor, async (req, res, next) => {
  try {
    const input = CreateDecisionImpactBody.parse(req.body);
    const workflowStatus = input.workflowStatus ?? "draft";
    if (!["draft", "review"].includes(workflowStatus)) {
      res.status(400).json({
        message: "New evidence records must start as drafts or enter review.",
      });
      return;
    }
    const withSlug = await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(decisionImpactRecordsTable)
        .values({
          slug: slugify(input.title) || "decision-impact",
          evidenceType: input.evidenceType,
          decisionArea: input.decisionArea,
          title: input.title,
          summary: input.summary,
          geography: input.geography,
          observedOn: dateOnly(input.observedOn)!,
          definition: input.definition,
          findingValue: input.findingValue ?? null,
          findingUnit: input.findingUnit ?? null,
          denominator: input.denominator ?? null,
          source: input.source,
          sourceUrl: input.sourceUrl,
          sourcePublishedOn: dateOnly(input.sourcePublishedOn),
          sourceRetrievedOn: dateOnly(input.sourceRetrievedOn)!,
          verificationStatus: input.verificationStatus ?? "unverified",
          verificationNotes: input.verificationNotes ?? null,
          workflowStatus,
          reviewedAt: workflowStatus === "review" ? new Date() : null,
          lastVerifiedAt:
            input.verificationStatus === "verified" ? new Date() : null,
          publishedOn: null,
        })
        .returning();
      const [savedRecord] = await tx
        .update(decisionImpactRecordsTable)
        .set({ slug: decisionImpactSlug(record.title, record.id) })
        .where(eq(decisionImpactRecordsTable.id, record.id))
        .returning();
      await recordDecisionImpactRevision(
        tx,
        savedRecord,
        decisionImpactChangeNote(null, savedRecord, input.revisionNote),
        req.editorIdentity!.id,
        req.editorIdentity!.displayName,
      );
      return savedRecord;
    });
    res.status(201).json(serializeDecisionImpact(withSlug));
  } catch (error) {
    next(error);
  }
});

router.put(
  "/decision-impacts/:recordId",
  requireEditor,
  async (req, res, next) => {
  try {
    const recordId = parseId(req.params.recordId);
    if (!recordId) {
      res.status(400).json({ message: "Invalid decision-impact record id" });
      return;
    }
    const input = UpdateDecisionImpactBody.parse(req.body);
    const [existing] = await db
      .select()
      .from(decisionImpactRecordsTable)
      .where(eq(decisionImpactRecordsTable.id, recordId))
      .limit(1);
    if (!existing) {
      res.status(404).json({ message: "Decision-impact record not found" });
      return;
    }
    const workflowStatus = input.workflowStatus ?? existing.workflowStatus;
    if (
      workflowStatus === "published" &&
      (!existing.reviewedAt || existing.workflowStatus === "published")
    ) {
      res.status(400).json({
        message:
          "Evidence records must pass editorial review before publication.",
      });
      return;
    }
    const withSlug = await db.transaction(async (tx) => {
      const [lockedExisting] = await tx
        .select()
        .from(decisionImpactRecordsTable)
        .where(eq(decisionImpactRecordsTable.id, recordId))
        .for("update");
      if (!lockedExisting) {
        return null;
      }
      const currentWorkflowStatus =
        input.workflowStatus ?? lockedExisting.workflowStatus;
      const currentVerificationStatus =
        input.verificationStatus ?? lockedExisting.verificationStatus;
      const [savedRecord] = await tx
        .update(decisionImpactRecordsTable)
        .set({
          evidenceType: input.evidenceType,
          decisionArea: input.decisionArea,
          title: input.title,
          summary: input.summary,
          geography: input.geography,
          observedOn: dateOnly(input.observedOn)!,
          definition: input.definition,
          findingValue:
            input.findingValue === undefined
              ? lockedExisting.findingValue
              : input.findingValue,
          findingUnit:
            input.findingUnit === undefined
              ? lockedExisting.findingUnit
              : input.findingUnit,
          denominator:
            input.denominator === undefined
              ? lockedExisting.denominator
              : input.denominator,
          source: input.source,
          sourceUrl: input.sourceUrl,
          sourcePublishedOn:
            input.sourcePublishedOn === undefined
              ? lockedExisting.sourcePublishedOn
              : dateOnly(input.sourcePublishedOn),
          sourceRetrievedOn: dateOnly(input.sourceRetrievedOn)!,
          verificationStatus: currentVerificationStatus,
          verificationNotes:
            input.verificationNotes === undefined
              ? lockedExisting.verificationNotes
              : input.verificationNotes,
          workflowStatus: currentWorkflowStatus,
          reviewedAt:
            currentWorkflowStatus === "review"
              ? lockedExisting.reviewedAt ?? new Date()
              : lockedExisting.reviewedAt,
          lastVerifiedAt:
            currentVerificationStatus === "verified"
              ? lockedExisting.lastVerifiedAt ?? new Date()
              : currentVerificationStatus === "unverified"
                ? null
                : lockedExisting.lastVerifiedAt,
          publishedOn:
            currentWorkflowStatus === "published"
              ? lockedExisting.publishedOn ?? new Date().toISOString().slice(0, 10)
              : lockedExisting.publishedOn,
          updatedAt: new Date(),
        })
        .where(eq(decisionImpactRecordsTable.id, recordId))
        .returning();
      const [recordWithSlug] = await tx
        .update(decisionImpactRecordsTable)
        .set({ slug: decisionImpactSlug(savedRecord.title, savedRecord.id) })
        .where(eq(decisionImpactRecordsTable.id, savedRecord.id))
        .returning();
      await recordDecisionImpactRevision(
        tx,
        recordWithSlug,
        decisionImpactChangeNote(
          lockedExisting,
          recordWithSlug,
          input.revisionNote,
        ),
        req.editorIdentity!.id,
        req.editorIdentity!.displayName,
      );
      return recordWithSlug;
    });
    if (!withSlug) {
      res.status(404).json({ message: "Decision-impact record not found" });
      return;
    }
    res.json(serializeDecisionImpact(withSlug));
  } catch (error) {
    next(error);
  }
});

export default router;
