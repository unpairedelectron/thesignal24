import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  communityPostLikesTable,
  communityPostsTable,
  communityRepliesTable,
  db,
} from "@workspace/db";
import {
  CreateCommunityPostBody,
  CreateCommunityReplyBody,
  GetCommunityPostParams,
  GetCommunityPostsQueryParams,
} from "@workspace/api-zod";
import { randomUUID } from "node:crypto";

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

function serializePost(
  post: typeof communityPostsTable.$inferSelect,
  likedByViewer: boolean,
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
    createdAt: post.createdAt.toISOString(),
  };
}

function serializeReply(reply: typeof communityRepliesTable.$inferSelect) {
  return {
    id: reply.id,
    postId: reply.postId,
    authorName: reply.authorName,
    body: reply.body,
    createdAt: reply.createdAt.toISOString(),
  };
}

async function getLikedPostIds(key: string, postIds: number[]) {
  if (postIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ postId: communityPostLikesTable.postId })
    .from(communityPostLikesTable)
    .where(eq(communityPostLikesTable.participantKey, key));
  return new Set(rows.filter((row) => postIds.includes(row.postId)).map((row) => row.postId));
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
    const posts = await db
      .select()
      .from(communityPostsTable)
      .where(and(...conditions))
      .orderBy(
        query.sort === "popular"
          ? desc(communityPostsTable.likeCount)
          : desc(communityPostsTable.createdAt),
        desc(communityPostsTable.id),
      )
      .limit(query.limit);
    const likedIds = await getLikedPostIds(key, posts.map((post) => post.id));
    res.json({
      posts: posts.map((post) => serializePost(post, likedIds.has(post.id))),
      topics: [...topicValues],
      states: [...new Set(posts.map((post) => post.state).filter((state): state is string => Boolean(state)))],
    });
  } catch (error) {
    next(error);
  }
});

router.post("/community/posts", async (req, res, next) => {
  try {
    const key = participantKey(req, res);
    const input = CreateCommunityPostBody.parse(req.body);
    const [post] = await db
      .insert(communityPostsTable)
      .values({
        ...input,
        authorName: input.authorName.trim(),
        title: input.title.trim(),
        body: input.body.trim(),
        state: input.state?.trim() || null,
        linkUrl: input.linkUrl || null,
        participantKey: key,
        status: "published",
      })
      .returning();
    res.status(201).json(serializePost(post, false));
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
    const replies = await db
      .select()
      .from(communityRepliesTable)
      .where(and(eq(communityRepliesTable.postId, postId), eq(communityRepliesTable.status, "published")))
      .orderBy(asc(communityRepliesTable.createdAt), asc(communityRepliesTable.id));
    const likedIds = await getLikedPostIds(key, [postId]);
    res.json({
      post: serializePost(post, likedIds.has(postId)),
      replies: replies.map(serializeReply),
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
          authorName: input.authorName.trim(),
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
    res.status(201).json(serializeReply(reply));
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

export default router;