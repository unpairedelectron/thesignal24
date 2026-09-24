import { createInsertSchema } from "drizzle-zod";
import {
  date,
  doublePrecision,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const decisionImpactRecordsTable = pgTable(
  "decision_impact_records",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    evidenceType: text("evidence_type").notNull(),
    decisionArea: text("decision_area").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    geography: text("geography").notNull(),
    observedOn: date("observed_on", { mode: "string" }).notNull(),
    definition: text("definition").notNull(),
    findingValue: doublePrecision("finding_value"),
    findingUnit: text("finding_unit"),
    denominator: text("denominator"),
    source: text("source").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourcePublishedOn: date("source_published_on", { mode: "string" }),
    sourceRetrievedOn: date("source_retrieved_on", { mode: "string" }).notNull(),
    verificationStatus: text("verification_status").notNull().default("unverified"),
    verificationNotes: text("verification_notes"),
    workflowStatus: text("workflow_status").notNull().default("draft"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    publishedOn: date("published_on", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIndex: uniqueIndex("decision_impact_records_slug_idx").on(table.slug),
  }),
);

export const insertDecisionImpactRecordSchema = createInsertSchema(
  decisionImpactRecordsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DecisionImpactRecord =
  typeof decisionImpactRecordsTable.$inferSelect;
export type InsertDecisionImpactRecord = z.infer<
  typeof insertDecisionImpactRecordSchema
>;