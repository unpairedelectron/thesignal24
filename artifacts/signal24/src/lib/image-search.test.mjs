import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createImageSearchState,
  mergeImageSearchResults,
  reduceImageSearchState,
  shouldShowSearchExhaustionNotice,
} from "./image-search.ts";

function result(identifier, title = identifier) {
  return {
    source: "Internet Archive",
    fileTitle: title,
    filePageUrl: `https://archive.org/details/${identifier}`,
  };
}

test("merges archive search pages without repeating item identifiers", () => {
  const firstPage = [result("archive-one"), result("archive-two")];
  const secondPage = [
    result("archive-two", "duplicate metadata"),
    result("archive-three"),
  ];

  assert.deepEqual(
    mergeImageSearchResults(firstPage, secondPage),
    [result("archive-one"), result("archive-two"), result("archive-three")],
  );
});

test("merges Art Institute pages without repeating artwork records", () => {
  const firstPage = [
    {
      source: "Art Institute of Chicago",
      filePageUrl: "https://www.artic.edu/artworks/123/first-artwork",
    },
    {
      source: "Art Institute of Chicago",
      filePageUrl: "https://www.artic.edu/artworks/456/repeated-artwork",
    },
  ];
  const secondPage = [
    {
      source: "Art Institute of Chicago",
      filePageUrl: "https://www.artic.edu/artworks/456/repeated-artwork",
    },
    {
      source: "Art Institute of Chicago",
      filePageUrl: "https://www.artic.edu/artworks/789/last-artwork",
    },
  ];

  assert.deepEqual(mergeImageSearchResults(firstPage, secondPage), [
    ...firstPage,
    secondPage[1],
  ]);
});

test("removes duplicate identifiers within a single returned page", () => {
  assert.deepEqual(
    mergeImageSearchResults([], [
      result("archive-one"),
      result("archive-one", "duplicate metadata"),
    ]),
    [result("archive-one")],
  );
});

test("a delayed Art Institute page cannot replace a newer search", async () => {
  const source = "Art Institute of Chicago";
  const firstPage = {
    source,
    fileTitle: "First artwork",
    filePageUrl: "https://www.artic.edu/artworks/101/first-artwork",
  };
  const oldSecondPage = {
    source,
    fileTitle: "Older second-page artwork",
    filePageUrl: "https://www.artic.edu/artworks/102/older-artwork",
  };
  const newestResult = {
    source,
    fileTitle: "Newest query result",
    filePageUrl: "https://www.artic.edu/artworks/201/newest-result",
  };
  let state = createImageSearchState(source);
  const dispatch = (action) => {
    state = reduceImageSearchState(state, action);
  };
  let resolveDelayedPage;
  const delayedPageResponse = new Promise((resolve) => {
    resolveDelayedPage = resolve;
  });

  dispatch({
    type: "search-started",
    requestId: 1,
    query: "first topic",
    source,
  });
  dispatch({
    type: "succeeded",
    requestId: 1,
    results: [firstPage],
    nextPage: 2,
  });
  dispatch({ type: "load-more-started", requestId: 2 });

  assert.deepEqual(state.results, [firstPage]);
  assert.equal(state.pendingRequestId, 2);
  assert.equal(state.pendingMode, "load-more");
  assert.equal(state.nextPage, 2);

  dispatch({
    type: "search-started",
    requestId: 3,
    query: "newest topic",
    source,
  });
  dispatch({
    type: "succeeded",
    requestId: 3,
    results: [newestResult],
    nextPage: 7,
  });

  resolveDelayedPage({ results: [oldSecondPage], nextPage: null });
  const delayedResponse = await delayedPageResponse;
  dispatch({
    type: "succeeded",
    requestId: 2,
    ...delayedResponse,
  });

  assert.deepEqual(state.results, [newestResult]);
  assert.equal(state.activeSearchQuery, "newest topic");
  assert.equal(state.nextPage, 7);
  assert.equal(state.pendingRequestId, null);
});

test("changing archives invalidates an in-flight Art Institute result", () => {
  const oldSource = "Art Institute of Chicago";
  let state = createImageSearchState(oldSource);
  state = reduceImageSearchState(state, {
    type: "search-started",
    requestId: 1,
    query: "old query",
    source: oldSource,
  });
  state = reduceImageSearchState(state, {
    type: "archive-changed",
    requestId: 2,
    source: "Wikimedia Commons",
  });
  state = reduceImageSearchState(state, {
    type: "succeeded",
    requestId: 1,
    results: [
      {
        source: oldSource,
        fileTitle: "Stale artwork",
        filePageUrl: "https://www.artic.edu/artworks/301/stale-artwork",
      },
    ],
    nextPage: 4,
  });

  assert.equal(state.source, "Wikimedia Commons");
  assert.deepEqual(state.results, []);
  assert.equal(state.nextPage, null);
  assert.equal(state.pendingRequestId, null);
});

test("shows exhausted state only after a successful final page with results", () => {
  assert.equal(
    shouldShowSearchExhaustionNotice({
      hasSearched: true,
      isPending: false,
      hasError: false,
      nextPage: null,
      resultCount: 2,
    }),
    true,
  );
  for (const change of [
    { hasError: true },
    { isPending: true },
    { nextPage: 2 },
    { resultCount: 0 },
    { hasSearched: false },
  ]) {
    assert.equal(
      shouldShowSearchExhaustionNotice({
        hasSearched: true,
        isPending: false,
        hasError: false,
        nextPage: null,
        resultCount: 2,
        ...change,
      }),
      false,
      `should not show exhausted state for ${JSON.stringify(change)}`,
    );
  }
});