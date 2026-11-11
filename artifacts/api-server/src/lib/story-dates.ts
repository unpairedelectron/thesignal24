/**
 * When a story actually went public: its issue's publication time, or, for a story
 * added to an already-published issue (every scheduled-run article), the moment the
 * story itself was created. Null while the issue is unpublished.
 */
export function storyPublishedAt(
  story: { createdAt: Date },
  issuePublishedAt: Date | null,
) {
  if (!issuePublishedAt) return null;
  return story.createdAt > issuePublishedAt ? story.createdAt : issuePublishedAt;
}
