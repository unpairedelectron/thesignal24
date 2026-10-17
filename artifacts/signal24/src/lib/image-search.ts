import type { EditorImageCandidateSearchResult } from "@workspace/api-client-react";

export type ImageSearchState = {
  source: EditorImageCandidateSearchResult["source"];
  requestId: number;
  pendingRequestId: number | null;
  pendingMode: "search" | "load-more" | null;
  activeSearchQuery: string;
  results: EditorImageCandidateSearchResult[];
  nextPage: number | null;
  hasSearched: boolean;
};

export type ImageSearchAction =
  | {
      type: "archive-changed";
      requestId: number;
      source: EditorImageCandidateSearchResult["source"];
    }
  | {
      type: "search-started";
      requestId: number;
      query: string;
      source: EditorImageCandidateSearchResult["source"];
    }
  | { type: "load-more-started"; requestId: number }
  | {
      type: "succeeded";
      requestId: number;
      results: EditorImageCandidateSearchResult[];
      nextPage: number | null;
    }
  | { type: "failed"; requestId: number };

export function createImageSearchState(
  source: EditorImageCandidateSearchResult["source"] = "Wikimedia Commons",
): ImageSearchState {
  return {
    source,
    requestId: 0,
    pendingRequestId: null,
    pendingMode: null,
    activeSearchQuery: "",
    results: [],
    nextPage: null,
    hasSearched: false,
  };
}

export function reduceImageSearchState(
  state: ImageSearchState,
  action: ImageSearchAction,
): ImageSearchState {
  switch (action.type) {
    case "archive-changed":
      return {
        ...createImageSearchState(action.source),
        requestId: action.requestId,
      };
    case "search-started":
      return {
        ...state,
        source: action.source,
        requestId: action.requestId,
        pendingRequestId: action.requestId,
        pendingMode: "search",
        activeSearchQuery: action.query,
        results: [],
        nextPage: null,
        hasSearched: true,
      };
    case "load-more-started":
      if (state.nextPage === null || state.pendingRequestId !== null) {
        return state;
      }
      return {
        ...state,
        requestId: action.requestId,
        pendingRequestId: action.requestId,
        pendingMode: "load-more",
      };
    case "succeeded":
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        results:
          state.pendingMode === "load-more"
            ? mergeImageSearchResults(state.results, action.results)
            : mergeImageSearchResults([], action.results),
        nextPage: action.nextPage,
        pendingRequestId: null,
        pendingMode: null,
      };
    case "failed":
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        pendingRequestId: null,
        pendingMode: null,
      };
  }
}

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