export type PublicStoryCandidate = {
  canonicalPath: string;
  workflowStatus: string;
  indexable: boolean;
};

export function isSafePrerenderPath(routePath: string) {
  if (!routePath.startsWith('/') || routePath.startsWith('//') || routePath.includes('\\')) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(routePath);
  } catch {
    return false;
  }
  return !decoded.split('/').some((segment) => segment === '.' || segment === '..')
    && !/[?#\u0000-\u001f]/.test(decoded);
}

export function isPublicIndexableStory(story: PublicStoryCandidate) {
  return story.workflowStatus === 'published'
    && story.indexable
    && isSafePrerenderPath(story.canonicalPath);
}
