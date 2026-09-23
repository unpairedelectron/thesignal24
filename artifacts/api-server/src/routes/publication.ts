import { Router, type IRouter } from "express";
import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm";
import {
  db,
  issuesTable,
  storiesTable,
  storyRevisionsTable,
} from "@workspace/db";
import {
  CreateIssueBody,
  CreateStoryBody,
  GetStoryRevisionsResponse,
  UpdateStoryBody,
} from "@workspace/api-zod";

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

function parseId(value: string) {
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

function serializeStory(story: typeof storiesTable.$inferSelect) {
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
  const serializedStories = stories.map(serializeStory);
  return {
    issue: serializeIssue(issue),
    stories: serializedStories,
    topics: [...new Set(serializedStories.map((story) => story.topic))],
  };
}

function queryString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function requestOrigin(req: {
  protocol: string;
  get(name: string): string | undefined;
}) {
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol || "https";
  const host = req.get("host") || "signal24.example";
  return `${protocol}://${host}`.replace(/\/$/, "");
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

router.get("/editor/issues/current", async (_req, res, next) => {
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
    if (topicValues.has(topic as Topic)) {
      conditions.push(eq(storiesTable.topic, topic));
    }
    if (kindValues.has(kind as StoryKind)) {
      conditions.push(eq(storiesTable.kind, kind));
    }
    if (state) {
      conditions.push(eq(storiesTable.state, state));
    }
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
      .select({ story: storiesTable })
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
    const serializedStories = results.map(({ story }) => serializeStory(story));

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

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const results = await db
      .select({ story: storiesTable })
      .from(storiesTable)
      .innerJoin(issuesTable, eq(storiesTable.issueId, issuesTable.id))
      .where(
        and(
          eq(issuesTable.status, "published"),
          eq(storiesTable.workflowStatus, "published"),
        ),
      )
      .orderBy(desc(storiesTable.updatedAt), asc(storiesTable.id));
    const origin = requestOrigin(req);
    const staticPaths = [
      "/",
      "/archive",
      "/about",
      "/editorial-standards",
      "/methodology",
      "/authors/signal-24",
    ];
    const urls = [
      ...staticPaths.map(
        (path) => `<url><loc>${xmlEscape(`${origin}${path}`)}</loc></url>`,
      ),
      ...results
        .map(({ story }) => story)
        .filter(isIndexableStory)
        .map(
          (story) =>
            `<url><loc>${xmlEscape(`${origin}${getCanonicalPath(story)}`)}</loc><lastmod>${story.updatedAt.toISOString()}</lastmod></url>`,
        ),
    ].join("");
    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    );
  } catch (error) {
    next(error);
  }
});

router.post("/issues", async (req, res, next) => {
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

router.post("/issues/:issueId/publish", async (req, res, next) => {
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
      .select({ story: storiesTable })
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
    res.json(serializeStory(story.story));
  } catch (error) {
    next(error);
  }
});

router.get("/stories/:storyId/revisions", async (req, res, next) => {
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

router.post("/stories", async (req, res, next) => {
  try {
    const input = CreateStoryBody.parse(req.body);
    const workflowStatus = input.workflowStatus ?? "draft";
    if (!["draft", "review"].includes(workflowStatus)) {
      res.status(400).json({
        message: "New records must start as drafts or enter editorial review.",
      });
      return;
    }
    const { publishedOn, scheduledFor, revisionNote } = input;
    const [story] = await db
      .insert(storiesTable)
      .values({
        issueId: input.issueId,
        topic: input.topic,
        kind: input.kind,
        state: input.state ?? null,
        source: input.source,
        sourceUrl: input.sourceUrl ?? null,
        publishedOn: dateOnly(publishedOn),
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
        lastVerifiedAt:
          input.verificationStatus === "verified" ? new Date() : null,
        reviewedAt: workflowStatus === "review" ? new Date() : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        aiDisclosure: input.aiDisclosure ?? null,
        correctionNote: input.correctionNote ?? null,
      })
      .returning();
    await recordRevision(story, revisionNote ?? "Created record");
    res.status(201).json(serializeStory(story));
  } catch (error) {
    next(error);
  }
});

router.put("/stories/:storyId", async (req, res, next) => {
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

export default router;