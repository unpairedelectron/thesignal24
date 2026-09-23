import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, issuesTable, storiesTable } from "@workspace/db";
import {
  CreateIssueBody,
  CreateStoryBody,
  UpdateStoryBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const topicValues = new Set(["World", "Technology", "Business", "Culture"]);
type Topic = "World" | "Technology" | "Business" | "Culture";

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

function serializeStory(story: typeof storiesTable.$inferSelect) {
  return {
    id: story.id,
    issueId: story.issueId,
    topic: topicValues.has(story.topic)
      ? (story.topic as Topic)
      : "World",
    eyebrow: story.eyebrow,
    title: story.title,
    dek: story.dek,
    body: story.body,
    time: story.time,
    read: story.read,
    tone: story.tone,
    number: story.number,
    sortOrder: story.sortOrder,
  };
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

    const stories = await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.issueId, issue.id))
      .orderBy(storiesTable.sortOrder, storiesTable.id);
    const serializedStories = stories.map(serializeStory);

    res.json({
      issue: serializeIssue(issue),
      stories: serializedStories,
      topics: [...new Set(serializedStories.map((story) => story.topic))],
    });
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

    await db.transaction(async (tx) => {
      await tx
        .update(issuesTable)
        .set({ status: "draft", publishedAt: null })
        .where(eq(issuesTable.status, "published"));
      await tx
        .update(issuesTable)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(issuesTable.id, issueId));
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
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.id, storyId))
      .limit(1);
    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }
    res.json(serializeStory(story));
  } catch (error) {
    next(error);
  }
});

router.post("/stories", async (req, res, next) => {
  try {
    const input = CreateStoryBody.parse(req.body);
    const [story] = await db
      .insert(storiesTable)
      .values({
        ...input,
        number: input.number ?? null,
      })
      .returning();
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
    const [story] = await db
      .update(storiesTable)
      .set({ ...input, number: input.number ?? null, updatedAt: new Date() })
      .where(eq(storiesTable.id, storyId))
      .returning();
    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }
    res.json(serializeStory(story));
  } catch (error) {
    next(error);
  }
});

export default router;