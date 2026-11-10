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
    reportCount: integer("report_count").notNull().default(0),
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
  helpfulCount: integer("helpful_count").notNull().default(0),
  reportCount: integer("report_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One "this answer helped" vote per participant per reply. */
export const communityReplyVotesTable = pgTable(
  "community_reply_votes",
  {
    id: serial("id").primaryKey(),
    replyId: integer("reply_id")
      .notNull()
      .references(() => communityRepliesTable.id, { onDelete: "cascade" }),
    participantKey: text("participant_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    participantReplyIndex: uniqueIndex(
      "community_reply_votes_participant_reply_idx",
    ).on(table.replyId, table.participantKey),
  }),
);

/** One report per participant per post or reply; repeated reports hide the item. */
export const communityReportsTable = pgTable(
  "community_reports",
  {
    id: serial("id").primaryKey(),
    targetType: text("target_type").notNull(),
    targetId: integer("target_id").notNull(),
    participantKey: text("participant_key").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    participantTargetIndex: uniqueIndex(
      "community_reports_participant_target_idx",
    ).on(table.targetType, table.targetId, table.participantKey),
  }),
);

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