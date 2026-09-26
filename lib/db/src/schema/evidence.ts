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
import { storiesTable } from "./publication";

export const evidenceEventsTable = pgTable(
  "publication_evidence_events",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    topic: text("topic").notNull(),
    recordDate: date("record_date", { mode: "string" }),
    summary: text("summary").notNull().default(""),
    workflowStatus: text("workflow_status").notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const sourceDocumentsTable = pgTable("publication_source_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  publicationDate: date("publication_date", { mode: "string" }),
  documentType: text("document_type").notNull().default("other"),
  sourceUrl: text("source_url"),
  status: text("status").notNull().default("unverified"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const articleEventsTable = pgTable(
  "publication_article_events",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id")
      .notNull()
      .references(() => storiesTable.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => evidenceEventsTable.id, { onDelete: "cascade" }),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    articleEventIndex: uniqueIndex(
      "publication_article_events_article_event_idx",
    ).on(table.articleId, table.eventId),
  }),
);

export const eventSourcesTable = pgTable(
  "publication_event_sources",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => evidenceEventsTable.id, { onDelete: "cascade" }),
    sourceDocumentId: integer("source_document_id")
      .notNull()
      .references(() => sourceDocumentsTable.id, { onDelete: "cascade" }),
    sourceRole: text("source_role").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventSourceIndex: uniqueIndex(
      "publication_event_sources_event_source_idx",
    ).on(table.eventId, table.sourceDocumentId),
  }),
);

export const insertEvidenceEventSchema = createInsertSchema(
  evidenceEventsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSourceDocumentSchema = createInsertSchema(
  sourceDocumentsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertArticleEventSchema = createInsertSchema(
  articleEventsTable,
).omit({
  id: true,
  createdAt: true,
});
export const insertEventSourceSchema = createInsertSchema(
  eventSourcesTable,
).omit({
  id: true,
  createdAt: true,
});

export type EvidenceEvent = typeof evidenceEventsTable.$inferSelect;
export type InsertEvidenceEvent = z.infer<typeof insertEvidenceEventSchema>;
export type SourceDocument = typeof sourceDocumentsTable.$inferSelect;
export type InsertSourceDocument = z.infer<typeof insertSourceDocumentSchema>;
export type ArticleEvent = typeof articleEventsTable.$inferSelect;
export type InsertArticleEvent = z.infer<typeof insertArticleEventSchema>;
export type EventSource = typeof eventSourcesTable.$inferSelect;
export type InsertEventSource = z.infer<typeof insertEventSourceSchema>;