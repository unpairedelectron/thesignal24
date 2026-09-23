import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const communityPostsTable = pgTable(
  "community_posts",
  {
    id: serial("id").primaryKey(),
    authorName: text("author_name").notNull(),
    participantKey: text("participant_key").notNull(),
    kind: text("kind").notNull().default("thought"),
    topic: text("topic").notNull().default("general"),
    state: text("state"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    linkUrl: text("link_url"),
    status: text("status").notNull().default("published"),
    likeCount: integer("like_count").notNull().default(0),
    replyCount: integer("reply_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdAtIndex: uniqueIndex("community_posts_created_at_idx").on(
      table.createdAt,
      table.id,
    ),
  }),
);

export const communityRepliesTable = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => communityPostsTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  participantKey: text("participant_key").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const communityPostLikesTable = pgTable(
  "community_post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => communityPostsTable.id, { onDelete: "cascade" }),
    participantKey: text("participant_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    participantPostIndex: uniqueIndex(
      "community_post_likes_participant_post_idx",
    ).on(table.postId, table.participantKey),
  }),
);

export const insertCommunityPostSchema = createInsertSchema(
  communityPostsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCommunityReplySchema = createInsertSchema(
  communityRepliesTable,
).omit({
  id: true,
  createdAt: true,
});
export const insertCommunityPostLikeSchema = createInsertSchema(
  communityPostLikesTable,
).omit({
  id: true,
  createdAt: true,
});

export type CommunityPost = typeof communityPostsTable.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityReply = typeof communityRepliesTable.$inferSelect;
export type InsertCommunityReply = z.infer<typeof insertCommunityReplySchema>;
export type CommunityPostLike = typeof communityPostLikesTable.$inferSelect;
export type InsertCommunityPostLike = z.infer<
  typeof insertCommunityPostLikeSchema
>;