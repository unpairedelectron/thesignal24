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