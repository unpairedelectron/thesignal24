import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeImageSearchResults } from "./image-search.ts";

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

test("removes duplicate identifiers within a single returned page", () => {
  assert.deepEqual(
    mergeImageSearchResults([], [
      result("archive-one"),
      result("archive-one", "duplicate metadata"),
    ]),
    [result("archive-one")],
  );
});