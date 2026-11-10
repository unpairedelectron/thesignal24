import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

/**
 * Creates the community additions (report counts, helpful votes, reports) if they are
 * missing, so a deployment that has not run `drizzle-kit push` keeps working. Every
 * statement is idempotent; names match what drizzle-kit would generate.
 */
export async function ensureCommunitySchema() {
  await db.execute(sql`ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0`);
  await db.execute(sql`ALTER TABLE community_replies ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0`);
  await db.execute(sql`ALTER TABLE community_replies ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS community_reply_votes (
      id serial PRIMARY KEY,
      reply_id integer NOT NULL,
      participant_key text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT community_reply_votes_reply_id_community_replies_id_fk
        FOREIGN KEY (reply_id) REFERENCES community_replies(id) ON DELETE CASCADE
    )`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS community_reply_votes_participant_reply_idx ON community_reply_votes (reply_id, participant_key)`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS community_reports (
      id serial PRIMARY KEY,
      target_type text NOT NULL,
      target_id integer NOT NULL,
      participant_key text NOT NULL,
      reason text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS community_reports_participant_target_idx ON community_reports (target_type, target_id, participant_key)`);
}
