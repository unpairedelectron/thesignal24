/**
 * Dated follow-ups to records that are already published. This is how the site stays
 * current without anyone editing the database by hand: add an entry here and, on the
 * next start, the API applies it once (see applyStoryUpdates / applyPolicyUpdates in
 * content-pack.ts).
 *
 * - A story update appends "## Update: <date>" and its text to the English and Hindi
 *   bodies. It is skipped if that heading is already there.
 * - A policy update replaces the record's court status (and, if given, its status).
 *   It is skipped once applied, and never overwrites a record an editor changed after
 *   the update's date.
 *
 * Every entry must cite the primary source for the new fact. Never backdate: `on` is
 * the date the update is written.
 */
export type StoryUpdate = {
  /** The pack story's `key`. */
  key: string;
  /** YYYY-MM-DD, the day the update is written. */
  on: string;
  en: string;
  hi: string;
  sourceUrl: string;
};

export type PolicyUpdate = {
  slug: string;
  on: string;
  courtStatus: string;
  courtStatusHi: string;
  status?: "current" | "proposed" | "challenged" | "stayed" | "struck down";
  sourceUrl: string;
};

export const STORY_UPDATES: StoryUpdate[] = [];

export const POLICY_UPDATES: PolicyUpdate[] = [];
