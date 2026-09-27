import { createInsertSchema } from "drizzle-zod";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { discoveryItemsTable } from "./content-desk";

export const contentImageCandidatesTable = pgTable(
  "publication_content_image_candidates",
  {
    id: serial("id").primaryKey(),
    discoveryItemId: integer("discovery_item_id")
      .notNull()
      .references(() => discoveryItemsTable.id, { onDelete: "cascade" }),
    source: text("source").notNull().default("Wikimedia Commons"),
    fileTitle: text("file_title").notNull(),
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    filePageUrl: text("file_page_url").notNull(),
    license: text("license").notNull().default(""),
    licenseUrl: text("license_url"),
    creator: text("creator").notNull().default(""),
    credit: text("credit").notNull().default(""),
    copyright: text("copyright").notNull().default(""),
    usageRights: text("usage_rights").notNull().default(""),
    altText: text("alt_text").notNull().default(""),
    caption: text("caption").notNull().default(""),
    rightsStatus: text("rights_status").notNull().default("pending"),
    reviewNotes: text("review_notes").notNull().default(""),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    discoveredAt: timestamp("discovered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
    itemFileTitleIndex: uniqueIndex(
      "publication_content_image_candidates_item_file_idx",
    ).on(table.discoveryItemId, table.fileTitle),
    rightsStatusDiscoveredAtIndex: index(
      "publication_content_image_candidates_status_discovered_at_idx",
    ).on(table.rightsStatus, table.discoveredAt),
  }),
);

export const insertContentImageCandidateSchema = createInsertSchema(
  contentImageCandidatesTable,
).omit({
  id: true,
  rightsStatus: true,
  reviewNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  discoveredAt: true,
  createdAt: true,
  updatedAt: true,
});

export type ContentImageCandidate =
  typeof contentImageCandidatesTable.$inferSelect;
export type InsertContentImageCandidate = z.infer<
  typeof insertContentImageCandidateSchema
>;