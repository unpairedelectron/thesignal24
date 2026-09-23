import { createInsertSchema } from "drizzle-zod";
import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
export type NewsletterSubscriber =
  typeof newsletterSubscribersTable.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<
  typeof insertNewsletterSubscriberSchema
>;