import type { EditorImageCandidateSearchResult } from "@workspace/api-zod";

const INTERNET_ARCHIVE_ORIGIN = "https://archive.org";
const SEARCH_ENDPOINT = `${INTERNET_ARCHIVE_ORIGIN}/advancedsearch.php`;
const METADATA_ENDPOINT = `${INTERNET_ARCHIVE_ORIGIN}/metadata`;
const MAX_RESULTS = 8;
const MAX_SEARCH_PAGE = 1000;
const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

type JsonRecord = Record<string, unknown>;

export interface InternetArchiveClient {
  searchImages(
    query: string,
    page?: number,
  ): Promise<{
    results: EditorImageCandidateSearchResult[];
    nextPage: number | null;
  }>;
  getImageByItemUrl(
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
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(textValue).filter(Boolean).join("; ");
  }
  const record = asRecord(value);
  return typeof record?.value === "string" ? record.value.trim() : "";
}

function firstMetadataValue(
  metadata: JsonRecord,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = textValue(metadata[key]);
    if (value) return value;
  }
  return "";
}

function validIdentifier(value: unknown): string | null {
  return typeof value === "string" &&
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)
    ? value
    : null;
}

export function parseInternetArchiveItemPageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "archive.org" ||
      url.port !== "" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    const match = /^\/details\/([A-Za-z0-9][A-Za-z0-9._-]{0,127})\/?$/.exec(
      url.pathname,
    );
    return match ? validIdentifier(match[1]) : null;
  } catch {
    return null;
  }
}

export function isInternetArchiveImageUrlForItem(
  filePageUrl: string,
  imageUrl: string,
): boolean {
  const identifier = parseInternetArchiveItemPageUrl(filePageUrl);
  if (!identifier) return false;
  try {
    const url = new URL(imageUrl);
    const filePrefix = `/download/${encodeURIComponent(identifier)}/`;
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "archive.org" ||
      url.port !== "" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.startsWith(filePrefix)
    ) {
      return false;
    }
    const encodedFileName = url.pathname.slice(filePrefix.length);
    if (!encodedFileName || encodedFileName.includes("/")) return false;
    const fileName = decodeURIComponent(encodedFileName);
    return Boolean(fileName) &&
      fileName !== "." &&
      fileName !== ".." &&
      !fileName.includes("/") &&
      !fileName.includes("\\");
  } catch {
    return false;
  }
}

function safeLicenseUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (
      url.protocol === "http:" &&
      (host === "creativecommons.org" || host === "www.creativecommons.org")
    ) {
      url.protocol = "https:";
    }
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isOriginalImageFile(file: JsonRecord): boolean {
  if (file.source !== "original" || typeof file.name !== "string") {
    return false;
  }
  const name = file.name.trim();
  if (!name || name.includes("/") || name.includes("\\")) return false;
  const extension = name.slice(name.lastIndexOf(".")).toLowerCase();
  const mimeType = textValue(file.mimetype ?? file.mime_type).toLowerCase();
  const format = textValue(file.format).toLowerCase();
  return mimeType.startsWith("image/") ||
    IMAGE_EXTENSIONS.has(extension) ||
    /^(jpeg|jpg|png|gif|webp|bmp|tiff?)$/.test(format);
}

function fileImageUrl(identifier: string, fileName: string): string {
  return `${INTERNET_ARCHIVE_ORIGIN}/download/${encodeURIComponent(identifier)}/${encodeURIComponent(fileName)}`;
}

function normalizeItem(
  payload: unknown,
  expectedIdentifier: string,
  requestedImageUrl?: string,
): EditorImageCandidateSearchResult | null {
  const root = asRecord(payload);
  const metadata = asRecord(root?.metadata);
  const identifier = validIdentifier(metadata?.identifier);
  if (!root || !metadata || identifier !== expectedIdentifier) return null;

  const files = Array.isArray(root.files)
    ? root.files.map(asRecord).filter((file): file is JsonRecord => file !== null)
    : [];
  const imageFile = files.find((file) => {
    if (!isOriginalImageFile(file)) return false;
    const candidateUrl = fileImageUrl(identifier, file.name as string);
    return !requestedImageUrl || candidateUrl === requestedImageUrl;
  });
  if (!imageFile || typeof imageFile.name !== "string") return null;

  const imageUrl = fileImageUrl(identifier, imageFile.name);
  const filePageUrl = `${INTERNET_ARCHIVE_ORIGIN}/details/${encodeURIComponent(identifier)}`;
  if (!isInternetArchiveImageUrlForItem(filePageUrl, imageUrl)) return null;

  const title = firstMetadataValue(metadata, ["title"]) || identifier;
  const fileTitle = `${title.slice(0, 360)} [${identifier}]`;
  const licenseUrl = safeLicenseUrl(
    firstMetadataValue(metadata, ["licenseurl", "license_url"]),
  );

  return {
    source: "Internet Archive",
    fileTitle,
    imageUrl,
    thumbnailUrl: `${INTERNET_ARCHIVE_ORIGIN}/services/img/${encodeURIComponent(identifier)}`,
    filePageUrl,
    license: firstMetadataValue(metadata, ["license", "license_name"]),
    licenseUrl,
    creator: firstMetadataValue(metadata, [
      "creator",
      "photographer",
      "artist",
    ]),
    credit: firstMetadataValue(metadata, [
      "credit",
      "credit_line",
      "credits",
      "attribution",
    ]),
    copyright: firstMetadataValue(metadata, [
      "copyright",
      "copyright_notice",
      "copyrightnotice",
      "rights_holder",
    ]),
    usageRights: firstMetadataValue(metadata, [
      "rights",
      "rights_statement",
      "usage_rights",
      "usage",
      "access_conditions",
    ]),
    catalogReference: "",
    artworkDate: "",
    provenance: "",
  };
}

export function createInternetArchiveClient(
  fetchImpl: typeof fetch = fetch,
): InternetArchiveClient {
  async function fetchJson(url: URL): Promise<{
    response: Response;
    payload: unknown;
  }> {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "The Signal 24 editorial image review/1.0",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return { response, payload: null };
    if (!response.ok) {
      throw new Error("Internet Archive request failed.");
    }
    return { response, payload: await response.json() };
  }

  async function getImageByIdentifier(
    identifier: string,
    requestedImageUrl?: string,
  ): Promise<EditorImageCandidateSearchResult | null> {
    const url = new URL(
      `${METADATA_ENDPOINT}/${encodeURIComponent(identifier)}`,
    );
    const { response, payload } = await fetchJson(url);
    if (response.status === 404) return null;
    return normalizeItem(payload, identifier, requestedImageUrl);
  }

  return {
    async searchImages(query, page = 1) {
      if (!Number.isInteger(page) || page < 1 || page > MAX_SEARCH_PAGE) {
        throw new Error("Internet Archive search page is out of range.");
      }
      const url = new URL(SEARCH_ENDPOINT);
      const escapedQuery = query.trim().replaceAll("\\", "\\\\").replaceAll('"', '\\"');
      url.searchParams.set("q", `mediatype:image AND "${escapedQuery}"`);
      url.searchParams.append("fl[]", "identifier");
      url.searchParams.append("fl[]", "title");
      url.searchParams.set("output", "json");
      url.searchParams.set("rows", String(MAX_RESULTS));
      const start = (page - 1) * MAX_RESULTS;
      url.searchParams.set("start", String(start));

      const { payload } = await fetchJson(url);
      const response = asRecord(asRecord(payload)?.response);
      const totalResults =
        typeof response?.numFound === "number"
          ? response.numFound
          : typeof response?.numFound === "string" &&
              response.numFound.trim() !== ""
            ? Number(response.numFound)
            : Number.NaN;
      if (
        !response ||
        !Array.isArray(response.docs) ||
        !Number.isSafeInteger(totalResults) ||
        totalResults < 0
      ) {
        throw new Error("Internet Archive returned an invalid search response.");
      }

      const identifiers = [
        ...new Set(
          response.docs
            .map((value) => validIdentifier(asRecord(value)?.identifier))
            .filter((identifier): identifier is string => identifier !== null),
        ),
      ].slice(0, MAX_RESULTS);
      const results = await Promise.all(
        identifiers.map((identifier) => getImageByIdentifier(identifier)),
      );
      const normalizedResults = results.filter(
        (result): result is EditorImageCandidateSearchResult => result !== null,
      );
      const nextStart = start + response.docs.length;
      return {
        results: normalizedResults,
        nextPage:
          response.docs.length > 0 &&
          start + MAX_RESULTS < totalResults &&
          page < MAX_SEARCH_PAGE
            ? page + 1
            : null,
      };
    },

    async getImageByItemUrl(filePageUrl, imageUrl) {
      const identifier = parseInternetArchiveItemPageUrl(filePageUrl);
      if (
        !identifier ||
        !isInternetArchiveImageUrlForItem(filePageUrl, imageUrl)
      ) {
        return null;
      }
      return getImageByIdentifier(identifier, imageUrl);
    },
  };
}

export const internetArchiveClient = createInternetArchiveClient();