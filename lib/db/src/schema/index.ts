import { createInsertSchema } from "drizzle-zod";
import {
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
export * from "./policies";
export * from "./community";

export const issuesTable = pgTable(
  "publication_issues",
  {
    id: serial("id").primaryKey(),
    issueDate: date("issue_date").notNull(),
    issueNumber: integer("issue_number").notNull(),
    status: text("status").notNull().default("draft"),
    title: text("title").notNull(),
    intro: text("intro").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    issueDateIndex: uniqueIndex("publication_issues_issue_date_idx").on(
      table.issueDate,
    ),
  }),
);

export const storiesTable = pgTable("publication_stories", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issuesTable.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  kind: text("kind").notNull().default("Article"),
  state: text("state"),
  source: text("source").notNull().default("Editorial desk"),
  sourceUrl: text("source_url"),
  publishedOn: date("published_on"),
  eyebrow: text("eyebrow").notNull(),
  title: text("title").notNull(),
  dek: text("dek").notNull(),
  body: text("body").notNull(),
  time: text("time").notNull(),
  read: integer("read").notNull().default(5),
  tone: text("tone").notNull(),
  number: integer("number"),
  sortOrder: integer("sort_order").notNull().default(0),
  workflowStatus: text("workflow_status").notNull().default("draft"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  verificationNotes: text("verification_notes"),
  sourcePublishedOn: date("source_published_on", { mode: "string" }),
  sourceRetrievedOn: date("source_retrieved_on", { mode: "string" }),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  aiDisclosure: text("ai_disclosure"),
  correctionNote: text("correction_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storyRevisionsTable = pgTable(
  "publication_story_revisions",
  {
    id: serial("id").primaryKey(),
    storyId: integer("story_id")
      .notNull()
      .references(() => storiesTable.id, { onDelete: "cascade" }),
    revisionNumber: integer("revision_number").notNull(),
    changeNote: text("change_note"),
    snapshot: jsonb("snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    storyRevisionIndex: uniqueIndex(
      "publication_story_revisions_story_revision_idx",
    ).on(table.storyId, table.revisionNumber),
  }),
);

export const newsletterSubscribersTable = pgTable(
  "newsletter_subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIndex: uniqueIndex("newsletter_subscribers_email_idx").on(
      table.email,
    ),
  }),
);

export const insertIssueSchema = createInsertSchema(issuesTable).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});
export const insertStorySchema = createInsertSchema(storiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertStoryRevisionSchema = createInsertSchema(
  storyRevisionsTable,
).omit({
  id: true,
  createdAt: true,
});
export const insertNewsletterSubscriberSchema = createInsertSchema(
  newsletterSubscribersTable,
).omit({
  id: true,
  createdAt: true,
});

export type Issue = typeof issuesTable.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Story = typeof storiesTable.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type StoryRevision = typeof storyRevisionsTable.$inferSelect;
export type InsertStoryRevision = z.infer<typeof insertStoryRevisionSchema>;
export type NewsletterSubscriber =
  typeof newsletterSubscribersTable.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<
  typeof insertNewsletterSubscriberSchema
>;