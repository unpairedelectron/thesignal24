import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Which public URLs have been submitted to IndexNow, and the last-change time they
 * were submitted with. The API resubmits a URL only when it is new or its last change
 * is later than this (artifacts/api-server/src/lib/indexnow.ts).
 */
export const indexnowSubmissionsTable = pgTable("indexnow_submissions", {
  url: text("url").primaryKey(),
  lastmod: timestamp("lastmod", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});
