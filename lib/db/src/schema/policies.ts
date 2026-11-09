import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
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

/** Hindi edition of a policy ledger record. */
export type PolicyTranslation = {
  title: string;
  summary: string;
  sector?: string;
  authority?: string;
  previousFramework?: string;
  newFramework?: string;
  legalBasis?: string;
  courtStatus?: string;
};

export const policyRecordsTable = pgTable(
  "policy_ledger_records",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    state: text("state"),
    sector: text("sector").notNull(),
    status: text("status").notNull(),
    authority: text("authority").notNull(),
    previousFramework: text("previous_framework").notNull(),
    newFramework: text("new_framework").notNull(),
    legalBasis: text("legal_basis").notNull(),
    courtStatus: text("court_status").notNull(),
    effectiveDate: date("effective_date", { mode: "string" }),
    publishedOn: date("published_on", { mode: "string" }).notNull(),
    workflowStatus: text("workflow_status").notNull().default("published"),
    hi: jsonb("hi").$type<PolicyTranslation>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIndex: uniqueIndex("policy_ledger_records_slug_idx").on(table.slug),
  }),
);

export const policySourcesTable = pgTable("policy_ledger_sources", {
  id: serial("id").primaryKey(),
  policyRecordId: integer("policy_record_id")
    .notNull()
    .references(() => policyRecordsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull(),
  publisher: text("publisher").notNull(),
  url: text("url").notNull(),
  publishedOn: date("published_on", { mode: "string" }),
  retrievedOn: date("retrieved_on", { mode: "string" }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const insertPolicyRecordSchema = createInsertSchema(policyRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPolicySourceSchema = createInsertSchema(policySourcesTable).omit({
  id: true,
});

export type PolicyRecord = typeof policyRecordsTable.$inferSelect;
export type InsertPolicyRecord = z.infer<typeof insertPolicyRecordSchema>;
export type PolicySource = typeof policySourcesTable.$inferSelect;
export type InsertPolicySource = z.infer<typeof insertPolicySourceSchema>;