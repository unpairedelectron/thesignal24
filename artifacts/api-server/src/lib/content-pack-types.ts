import type { StoryTranslation } from "@workspace/db";

/** A bilingual record shipped with the codebase and inserted for editorial review. */
export type ContentPackStory = {
  /** Stable identifier used only for idempotent seeding and review notes. */
  key: string;
  topic: "Latest" | "Courts & Policy" | "States" | "History" | "Ground Reports" | "Data & Notes";
  kind: "Article" | "Paper note" | "Archive" | "Explainer" | "Opinion";
  state: string | null;
  source: string;
  sourceUrl: string;
  sourcePublishedOn: string | null;
  eyebrow: string;
  title: string;
  dek: string;
  body: string;
  read: number;
  tone: string;
  byline?: string;
  hi: Required<Pick<StoryTranslation, "eyebrow">> & StoryTranslation;
  verificationNotes: string;
};
