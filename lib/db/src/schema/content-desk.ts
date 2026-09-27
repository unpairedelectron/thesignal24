import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { storiesTable } from "./publication";

export const sourceRegistryTable = pgTable(
  "publication_content_sources",
  {
    id: serial("id").primaryKey(),
    sourceName: text("source_name").notNull(),
    sourceType: text("source_type").notNull(),
    authorityLevel: text("authority_level").notNull(),
    domain: text("domain").notNull(),
    rssUrl: text("rss_url"),
    sitemapUrl: text("sitemap_url"),
    searchUrl: text("search_url"),
    language: text("language").notNull().default("English"),
    state: text("state"),
    enabled: boolean("enabled").notNull().default(false),
    crawlFrequency: text("crawl_frequency").notNull().default("manual"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
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
  (table) => ({
    domainIndex: uniqueIndex("publication_content_sources_domain_idx").on(
      table.domain,
    ),
  }),
);

export const discoveryItemsTable = pgTable(
  "publication_discovery_items",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sourceRegistryTable.id, { onDelete: "restrict" }),
    originalUrl: text("original_url").notNull(),
    canonicalUrl: text("canonical_url").notNull(),
    title: text("title").notNull(),
    publisher: text("publisher"),
    sourcePublishedOn: date("source_published_on", { mode: "string" }),
    author: text("author"),
    summary: text("summary").notNull().default(""),
    language: text("language").notNull().default("English"),
    state: text("state"),
    topic: text("topic"),
    candidateEventTitle: text("candidate_event_title"),
    candidateSourceUrl: text("candidate_source_url"),
    candidateImageUrl: text("candidate_image_url"),
    status: text("status").notNull().default("new"),
    reviewNotes: text("review_notes").notNull().default(""),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    promotedStoryId: integer("promoted_story_id").references(
      () => storiesTable.id,
      { onDelete: "restrict" },
    ),
    promotedBy: text("promoted_by"),
    promotedAt: timestamp("promoted_at", { withTimezone: true }),
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
  (table) => ({
    canonicalUrlIndex: uniqueIndex(
      "publication_discovery_items_canonical_url_idx",
    ).on(table.canonicalUrl),
    statusCreatedAtIndex: index(
      "publication_discovery_items_status_created_at_idx",
    ).on(table.status, table.createdAt),
  }),
);

export const insertSourceRegistrySchema = createInsertSchema(
  sourceRegistryTable,
).omit({
  id: true,
  lastCheckedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const insertDiscoveryItemSchema = createInsertSchema(
  discoveryItemsTable,
).omit({
  id: true,
  reviewedBy: true,
  reviewedAt: true,
  promotedStoryId: true,
  promotedBy: true,
  promotedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type SourceRegistryEntry = typeof sourceRegistryTable.$inferSelect;
export type InsertSourceRegistryEntry = z.infer<
  typeof insertSourceRegistrySchema
>;
export type DiscoveryItem = typeof discoveryItemsTable.$inferSelect;
export type InsertDiscoveryItem = z.infer<typeof insertDiscoveryItemSchema>;