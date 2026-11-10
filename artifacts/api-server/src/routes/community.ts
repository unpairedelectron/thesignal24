import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  communityPostLikesTable,
  communityPostsTable,
  communityRepliesTable,
  communityReplyVotesTable,
  communityReportsTable,
  db,
} from "@workspace/db";
import {
  CreateCommunityPostBody,
  CreateCommunityReplyBody,
  GetCommunityPostParams,
  GetCommunityPostsQueryParams,
  ReportCommunityPostBody,
  ReportCommunityReplyBody,
  ReportCommunityReplyParams,
  ToggleCommunityReplyHelpfulParams,
} from "@workspace/api-zod";
import { createHash, randomUUID } from "node:crypto";

const router: IRouter = Router();

const participantCookie = "signal24-community-participant";
const topicValues = new Set([
  "general",
  "caste",
  "policy",
  "representation",
  "migration",
  "violence",
  "work",
  "education",
  "culture",
]);

/** Reports from this many different participants hide a post or reply until a moderator reviews it. */
const HIDE_AFTER_REPORTS = 3;
const POSTS_PER_HOUR = 5;
const REPLIES_PER_HOUR = 20;
const MAX_LINKS = 3;

function participantKey(req: Request, res: Response) {
  const existing = req.signedCookies?.[participantCookie];
  if (typeof existing === "string" && existing.length > 10) return existing;
  const key = randomUUID();
  res.cookie(participantCookie, key, {
    httpOnly: true,
    sameSite: "lax",
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  return key;
}

/** A stable anonymous handle per browser. It reveals nothing about the person. */
export function anonymousHandle(key: string) {
  const digest = createHash("sha256").update(key).digest();
  return `Citizen ${1000 + (digest.readUInt16BE(0) % 9000)}`;
}

/** Moderators can block terms without a deploy: COMMUNITY_BLOCKED_TERMS="term one,term two". */
function blockedTerms() {
  return (process.env.COMMUNITY_BLOCKED_TERMS ?? "")
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
}

/** House-rule checks that need no human: too many links, or a blocked term. Returns a reason or null. */
export function houseRuleProblem(text: string) {
  const links = text.match(/https?:\/\//gi)?.length ?? 0;
  if (links > MAX_LINKS) return `Please include no more than ${MAX_LINKS} links.`;
  const lower = text.toLowerCase();
  if (blockedTerms().some((term) => lower.includes(term))) {
    return "This breaks the house rules: no slurs, no abuse, no attacks on communities.";
  }
  return null;
}

function serializePost(
  post: typeof communityPostsTable.$inferSelect,
  likedByViewer: boolean,
  viewerKey: string,
) {
  return {
    id: post.id,
    authorName: post.authorName,
    kind: post.kind,
    topic: post.topic,
    state: post.state,
    title: post.title,
    body: post.body,
    linkUrl: post.linkUrl,
    likeCount: post.likeCount,
    replyCount: post.replyCount,
    likedByViewer,
    ownedByViewer: post.participantKey === viewerKey,
    createdAt: post.createdAt.toISOString(),
  };
}

function serializeReply(
  reply: typeof communityRepliesTable.$inferSelect,
  helpfulByViewer: boolean,
  viewerKey: string,
) {
  return {
    id: reply.id,
    postId: reply.postId,
    authorName: reply.authorName,
    body: reply.body,
    helpfulCount: reply.helpfulCount,
    helpfulByViewer,
    ownedByViewer: reply.participantKey === viewerKey,
    createdAt: reply.createdAt.toISOString(),
  };
}

async function getLikedPostIds(key: string, postIds: number[]) {
  if (postIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ postId: communityPostLikesTable.postId })
    .from(communityPostLikesTable)
    .where(and(eq(communityPostLikesTable.participantKey, key), inArray(communityPostLikesTable.postId, postIds)));
  return new Set(rows.map((row) => row.postId));
}

async function getHelpfulReplyIds(key: string, replyIds: number[]) {
  if (replyIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ replyId: communityReplyVotesTable.replyId })
    .from(communityReplyVotesTable)
    .where(and(eq(communityReplyVotesTable.participantKey, key), inArray(communityReplyVotesTable.replyId, replyIds)));
  return new Set(rows.map((row) => row.replyId));
}

router.get("/community/posts", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const query = GetCommunityPostsQueryParams.parse(req.query);
    const conditions = [eq(communityPostsTable.status, "published")];
    if (query.topic && topicValues.has(query.topic)) {
      conditions.push(eq(communityPostsTable.topic, query.topic));
    }
    if (query.state) conditions.push(eq(communityPostsTable.state, query.state));
    if (query.kind) conditions.push(eq(communityPostsTable.kind, query.kind));
    if (query.sort === "unanswered") conditions.push(eq(communityPostsTable.replyCount, 0));
    // Trending: engagement, with answers weighted above likes, decaying with age in hours.
    const trending = sql`(${communityPostsTable.likeCount} * 2 + ${communityPostsTable.replyCount} * 3 + 1) / power(extract(epoch from (now() - ${communityPostsTable.createdAt})) / 3600 + 2, 1.3)`;
    const order =
      query.sort === "popular"
        ? desc(communityPostsTable.likeCount)
        : query.sort === "trending"
          ? desc(trending)
          : desc(communityPostsTable.createdAt);
    const posts = await db
      .select()
      .from(communityPostsTable)
      .where(and(...conditions))
      .orderBy(order, desc(communityPostsTable.id))
      .limit(query.limit);
    const likedIds = await getLikedPostIds(key, posts.map((post) => post.id));
    const stateRows = await db
      .selectDistinct({ state: communityPostsTable.state })
      .from(communityPostsTable)
      .where(eq(communityPostsTable.status, "published"));
    res.json({
      posts: posts.map((post) => serializePost(post, likedIds.has(post.id), key)),
      topics: [...topicValues],
      states: stateRows.map((row) => row.state).filter((state): state is string => Boolean(state)),
      viewerHandle: anonymousHandle(key),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/community/posts", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const input = CreateCommunityPostBody.parse(req.body);
    const problem = houseRuleProblem(`${input.title} ${input.body} ${input.linkUrl ?? ""}`);
    if (problem) {
      res.status(400).json({ message: problem });
      return;
    }
    const [recent] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communityPostsTable)
      .where(and(eq(communityPostsTable.participantKey, key), gte(communityPostsTable.createdAt, new Date(Date.now() - 3_600_000))));
    if ((recent?.count ?? 0) >= POSTS_PER_HOUR) {
      res.status(429).json({ message: "You have posted a lot in the last hour. Please try again later." });
      return;
    }
    const [post] = await db
      .insert(communityPostsTable)
      .values({
        ...input,
        authorName: input.authorName?.trim() || anonymousHandle(key),
        title: input.title.trim(),
        body: input.body.trim(),
        state: input.state?.trim() || null,
        linkUrl: input.linkUrl || null,
        participantKey: key,
        status: "published",
      })
      .returning();
    res.status(201).json(serializePost(post, false, key));
  } catch (error) {
    next(error);
  }
});

router.get("/community/posts/:postId", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const { postId } = GetCommunityPostParams.parse(req.params);
    const [post] = await db
      .select()
      .from(communityPostsTable)
      .where(and(eq(communityPostsTable.id, postId), eq(communityPostsTable.status, "published")))
      .limit(1);
    if (!post) {
      res.status(404).json({ message: "Community post not found" });
      return;
    }
    // Most helpful answers first, then oldest first among equals.
    const replies = await db
      .select()
      .from(communityRepliesTable)
      .where(and(eq(communityRepliesTable.postId, postId), eq(communityRepliesTable.status, "published")))
      .orderBy(desc(communityRepliesTable.helpfulCount), asc(communityRepliesTable.createdAt), asc(communityRepliesTable.id));
    const likedIds = await getLikedPostIds(key, [postId]);
    const helpfulIds = await getHelpfulReplyIds(key, replies.map((reply) => reply.id));
    res.json({
      post: serializePost(post, likedIds.has(postId), key),
      replies: replies.map((reply) => serializeReply(reply, helpfulIds.has(reply.id), key)),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/community/posts/:postId/replies", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const { postId } = GetCommunityPostParams.parse(req.params);
    const input = CreateCommunityReplyBody.parse(req.body);
    const problem = houseRuleProblem(input.body);
    if (problem) {
      res.status(400).json({ message: problem });
      return;
    }
    const [recent] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communityRepliesTable)
      .where(and(eq(communityRepliesTable.participantKey, key), gte(communityRepliesTable.createdAt, new Date(Date.now() - 3_600_000))));
    if ((recent?.count ?? 0) >= REPLIES_PER_HOUR) {
      res.status(429).json({ message: "You have answered a lot in the last hour. Please try again later." });
      return;
    }
    const [reply] = await db.transaction(async (tx) => {
      const [post] = await tx
        .select({ id: communityPostsTable.id })
        .from(communityPostsTable)
        .where(and(eq(communityPostsTable.id, postId), eq(communityPostsTable.status, "published")))
        .limit(1);
      if (!post) return [];
      const inserted = await tx
        .insert(communityRepliesTable)
        .values({
          postId,
          authorName: input.authorName?.trim() || anonymousHandle(key),
          body: input.body.trim(),
          participantKey: key,
          status: "published",
        })
        .returning();
      await tx
        .update(communityPostsTable)
        .set({
          replyCount: sql`${communityPostsTable.replyCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(communityPostsTable.id, postId));
      return inserted;
    });
    if (!reply) {
      res.status(404).json({ message: "Community post not found" });
      return;
    }
    res.status(201).json(serializeReply(reply, false, key));
  } catch (error) {
    next(error);
  }
});

router.post("/community/posts/:postId/like", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const { postId } = GetCommunityPostParams.parse(req.params);
    const result = await db.transaction(async (tx) => {
      const [post] = await tx
        .select()
        .from(communityPostsTable)
        .where(and(eq(communityPostsTable.id, postId), eq(communityPostsTable.status, "published")))
        .limit(1);
      if (!post) return null;
      const [existing] = await tx
        .select({ id: communityPostLikesTable.id })
        .from(communityPostLikesTable)
        .where(
          and(
            eq(communityPostLikesTable.postId, postId),
            eq(communityPostLikesTable.participantKey, key),
          ),
        )
        .limit(1);
      if (existing) {
        await tx.delete(communityPostLikesTable).where(eq(communityPostLikesTable.id, existing.id));
        const [updated] = await tx
          .update(communityPostsTable)
          .set({ likeCount: sql`GREATEST(${communityPostsTable.likeCount} - 1, 0)` })
          .where(eq(communityPostsTable.id, postId))
          .returning({ likeCount: communityPostsTable.likeCount });
        return { liked: false, likeCount: updated.likeCount };
      }
      await tx.insert(communityPostLikesTable).values({ postId, participantKey: key });
      const [updated] = await tx
        .update(communityPostsTable)
        .set({ likeCount: sql`${communityPostsTable.likeCount} + 1` })
        .where(eq(communityPostsTable.id, postId))
        .returning({ likeCount: communityPostsTable.likeCount });
      return { liked: true, likeCount: updated.likeCount };
    });
    if (!result) {
      res.status(404).json({ message: "Community post not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

async function recordReport(targetType: "post" | "reply", targetId: number, key: string, reason: string) {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(communityReportsTable)
      .values({ targetType, targetId, participantKey: key, reason })
      .onConflictDoNothing()
      .returning({ id: communityReportsTable.id });
    if (inserted.length === 0) return { reported: true, hidden: false };
    const table = targetType === "post" ? communityPostsTable : communityRepliesTable;
    const [updated] = await tx
      .update(table)
      .set({ reportCount: sql`${table.reportCount} + 1` })
      .where(eq(table.id, targetId))
      .returning({ reportCount: table.reportCount });
    const hidden = (updated?.reportCount ?? 0) >= HIDE_AFTER_REPORTS;
    if (hidden) await tx.update(table).set({ status: "hidden" }).where(eq(table.id, targetId));
    return { reported: true, hidden };
  });
}

router.post("/community/posts/:postId/report", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const { postId } = GetCommunityPostParams.parse(req.params);
    const { reason } = ReportCommunityPostBody.parse(req.body);
    const [post] = await db.select({ id: communityPostsTable.id }).from(communityPostsTable).where(eq(communityPostsTable.id, postId)).limit(1);
    if (!post) {
      res.status(404).json({ message: "Community post not found" });
      return;
    }
    res.json(await recordReport("post", postId, key, reason));
  } catch (error) {
    next(error);
  }
});

router.post("/community/replies/:replyId/report", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const { replyId } = ReportCommunityReplyParams.parse(req.params);
    const { reason } = ReportCommunityReplyBody.parse(req.body);
    const [reply] = await db.select({ id: communityRepliesTable.id }).from(communityRepliesTable).where(eq(communityRepliesTable.id, replyId)).limit(1);
    if (!reply) {
      res.status(404).json({ message: "Answer not found" });
      return;
    }
    res.json(await recordReport("reply", replyId, key, reason));
  } catch (error) {
    next(error);
  }
});

router.post("/community/replies/:replyId/helpful", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const { replyId } = ToggleCommunityReplyHelpfulParams.parse(req.params);
    const result = await db.transaction(async (tx) => {
      const [reply] = await tx
        .select({ id: communityRepliesTable.id })
        .from(communityRepliesTable)
        .where(and(eq(communityRepliesTable.id, replyId), eq(communityRepliesTable.status, "published")))
        .limit(1);
      if (!reply) return null;
      const [existing] = await tx
        .select({ id: communityReplyVotesTable.id })
        .from(communityReplyVotesTable)
        .where(and(eq(communityReplyVotesTable.replyId, replyId), eq(communityReplyVotesTable.participantKey, key)))
        .limit(1);
      if (existing) {
        await tx.delete(communityReplyVotesTable).where(eq(communityReplyVotesTable.id, existing.id));
        const [updated] = await tx
          .update(communityRepliesTable)
          .set({ helpfulCount: sql`GREATEST(${communityRepliesTable.helpfulCount} - 1, 0)` })
          .where(eq(communityRepliesTable.id, replyId))
          .returning({ helpfulCount: communityRepliesTable.helpfulCount });
        return { helpful: false, helpfulCount: updated.helpfulCount };
      }
      await tx.insert(communityReplyVotesTable).values({ replyId, participantKey: key });
      const [updated] = await tx
        .update(communityRepliesTable)
        .set({ helpfulCount: sql`${communityRepliesTable.helpfulCount} + 1` })
        .where(eq(communityRepliesTable.id, replyId))
        .returning({ helpfulCount: communityRepliesTable.helpfulCount });
      return { helpful: true, helpfulCount: updated.helpfulCount };
    });
    if (!result) {
      res.status(404).json({ message: "Answer not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
