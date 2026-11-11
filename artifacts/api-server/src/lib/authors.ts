/**
 * Named bylines for the desks. The profiles themselves (names in both languages,
 * roles, bios) live in artifacts/signal24/src/lib/authors.ts, which the web app and
 * the page server read; a byline links to a profile only when it equals the English
 * name there exactly. Keep the names and slugs below in sync with that file.
 */
export const AUTHOR_BY_TOPIC: Record<string, { name: string; slug: string }> = {
  "Courts & Policy": { name: "Ishaan Mishra", slug: "ishaan-mishra" },
  States: { name: "Meera Pandey", slug: "meera-pandey" },
  "Data & Notes": { name: "Anurag Dubey", slug: "anurag-dubey" },
  History: { name: "Tanvi Mishra", slug: "tanvi-mishra" },
  Latest: { name: "Kunal Pandey", slug: "kunal-pandey" },
  "Ground Reports": { name: "Kunal Pandey", slug: "kunal-pandey" },
};

export const EDITORIAL_BOARD_BYLINE = "The Signal 24 editorial board";
export const EDITORIAL_DESK_BYLINE = "The Signal 24 editorial desk";

/**
 * The byline a pack story should carry: signed opinion stays with the editorial
 * board; reporting goes to the correspondent for its desk.
 */
export function packByline(story: { topic: string; kind: string; byline?: string | null }) {
  if (story.kind === "Opinion") return story.byline ?? EDITORIAL_BOARD_BYLINE;
  return AUTHOR_BY_TOPIC[story.topic]?.name ?? EDITORIAL_DESK_BYLINE;
}
