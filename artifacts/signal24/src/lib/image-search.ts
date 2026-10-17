import type { EditorImageCandidateSearchResult } from "@workspace/api-client-react";

export function mergeImageSearchResults(
  current: EditorImageCandidateSearchResult[],
  incoming: EditorImageCandidateSearchResult[],
): EditorImageCandidateSearchResult[] {
  const seenItemPages = new Set(current.map((result) => result.filePageUrl));
  return [
    ...current,
    ...incoming.filter((result) => {
      if (seenItemPages.has(result.filePageUrl)) return false;
      seenItemPages.add(result.filePageUrl);
      return true;
    }),
  ];
}

export function shouldShowSearchExhaustionNotice(input: {
  hasSearched: boolean;
  isPending: boolean;
  hasError: boolean;
  nextPage: number | null;
  resultCount: number;
}): boolean {
  return (
    input.hasSearched &&
    !input.isPending &&
    !input.hasError &&
    input.nextPage === null &&
    input.resultCount > 0
  );
}