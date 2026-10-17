import type { EditorImageCandidateSearchResult } from "@workspace/api-zod";

const ART_INSTITUTE_API_ORIGIN = "https://api.artic.edu";
const ART_INSTITUTE_SITE_ORIGIN = "https://www.artic.edu";
const ART_INSTITUTE_IIIF_ORIGIN = `${ART_INSTITUTE_SITE_ORIGIN}/iiif/2`;
const MAX_RESULTS = 8;
const ARTWORK_FIELDS = [
  "id",
  "title",
  "artist_title",
  "credit_line",
  "is_public_domain",
  "copyright_notice",
  "image_id",
].join(",");

type JsonRecord = Record<string, unknown>;

export interface ArtInstituteClient {
  searchImages(query: string): Promise<EditorImageCandidateSearchResult[]>;
  getImageByArtworkPageUrl(
    filePageUrl: string,
    imageUrl: string,
  ): Promise<EditorImageCandidateSearchResult | null>;
}

function asRecord(value: unknown): JsonRecord | null {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validArtworkId(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
    ? value
    : null;
}

function validImageId(value: unknown): string | null {
  return typeof value === "string" &&
    /^[A-Za-z0-9-]{1,64}$/.test(value)
    ? value
    : null;
}

export function parseArtInstituteArtworkPageUrl(value: string): number | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "www.artic.edu" ||
      url.port !== "" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    const match =
      /^\/artworks\/([1-9]\d*)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.exec(url.pathname);
    if (!match) return null;
    const id = Number(match[1]);
    return Number.isSafeInteger(id) && String(id) === match[1] ? id : null;
  } catch {
    return null;
  }
}

export function isArtInstituteImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.toLowerCase() === "www.artic.edu" &&
      url.port === "" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/iiif\/2\/[A-Za-z0-9-]{1,64}\/full\/2000,\/0\/default\.jpg$/.test(
        url.pathname,
      )
    );
  } catch {
    return false;
  }
}

function artworkPageUrl(id: number, title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
  return `${ART_INSTITUTE_SITE_ORIGIN}/artworks/${id}/${slug || `artwork-${id}`}`;
}

function artworkImageUrl(imageId: string, width: 640 | 2000): string {
  return `${ART_INSTITUTE_IIIF_ORIGIN}/${encodeURIComponent(imageId)}/full/${width},/0/default.jpg`;
}

function normalizeArtwork(
  value: unknown,
): EditorImageCandidateSearchResult | null {
  const artwork = asRecord(value);
  if (!artwork) return null;
  const id = validArtworkId(artwork.id);
  const imageId = validImageId(artwork.image_id);
  if (id === null || !imageId) return null;

  const title = textValue(artwork.title) || `Artwork ${id}`;
  const isPublicDomain =
    typeof artwork.is_public_domain === "boolean"
      ? artwork.is_public_domain
      : null;
  const rightsStatus =
    isPublicDomain === true
      ? "The Art Institute of Chicago marks this artwork as public domain."
      : isPublicDomain === false
        ? "The Art Institute of Chicago does not mark this artwork as public domain."
        : "The Art Institute of Chicago did not supply a public-domain status for this artwork.";

  return {
    source: "Art Institute of Chicago",
    fileTitle: `${title.slice(0, 420)} [Art Institute ID ${id}]`,
    imageUrl: artworkImageUrl(imageId, 2000),
    thumbnailUrl: artworkImageUrl(imageId, 640),
    filePageUrl: artworkPageUrl(id, title),
    license:
      isPublicDomain === true
        ? "Public domain (Art Institute designation; verify the source record)"
        : "",
    licenseUrl: null,
    creator: textValue(artwork.artist_title),
    credit: textValue(artwork.credit_line),
    copyright: textValue(artwork.copyright_notice),
    usageRights: `${rightsStatus} Review the original record and copyright notice. API metadata terms do not establish image reuse rights; editor review is required.`,
  };
}

export function createArtInstituteClient(
  fetchImpl: typeof fetch = fetch,
): ArtInstituteClient {
  async function request(url: URL): Promise<unknown> {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Signal Hub editorial image review/1.0",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error("Art Institute of Chicago API request failed.");
    }
    return response.json();
  }

  async function getArtwork(id: number) {
    const url = new URL(
      `/api/v1/artworks/${id}`,
      ART_INSTITUTE_API_ORIGIN,
    );
    url.searchParams.set("fields", ARTWORK_FIELDS);
    const payload = asRecord(await request(url));
    return payload ? normalizeArtwork(payload.data) : null;
  }

  return {
    async searchImages(query) {
      const url = new URL(
        "/api/v1/artworks/search",
        ART_INSTITUTE_API_ORIGIN,
      );
      url.searchParams.set("q", query.trim());
      url.searchParams.set("limit", String(MAX_RESULTS));
      url.searchParams.set("fields", ARTWORK_FIELDS);
      const payload = asRecord(await request(url));
      if (!payload || !Array.isArray(payload.data)) {
        throw new Error("Art Institute of Chicago returned an invalid search response.");
      }
      return payload.data
        .map(normalizeArtwork)
        .filter(
          (result): result is EditorImageCandidateSearchResult =>
            result !== null,
        );
    },

    async getImageByArtworkPageUrl(filePageUrl, imageUrl) {
      const id = parseArtInstituteArtworkPageUrl(filePageUrl);
      if (id === null || !isArtInstituteImageUrl(imageUrl)) return null;
      const currentArtwork = await getArtwork(id);
      if (
        !currentArtwork ||
        currentArtwork.filePageUrl !== filePageUrl ||
        currentArtwork.imageUrl !== imageUrl
      ) {
        return null;
      }
      return currentArtwork;
    },
  };
}

export const artInstituteClient = createArtInstituteClient();