import type { EditorImageCandidateSearchResult } from "@workspace/api-zod";

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const COMMONS_USER_AGENT = "Signal Hub editorial image review/1.0";
const MAX_RESULTS = 8;

type JsonRecord = Record<string, unknown>;

export interface WikimediaCommonsClient {
  searchImages(query: string): Promise<EditorImageCandidateSearchResult[]>;
  getFileByTitle(
    fileTitle: string,
  ): Promise<EditorImageCandidateSearchResult | null>;
}

function asRecord(value: unknown): JsonRecord | null {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  return typeof record?.value === "string" ? record.value : "";
}

function plainText(value: unknown): string {
  return textValue(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|li|div)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function safeWikimediaUrl(value: unknown, allowAnyWikimediaHost = false): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    const isWikimediaHost =
      url.hostname === "wikimedia.org" ||
      url.hostname.endsWith(".wikimedia.org");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !isWikimediaHost ||
      (!allowAnyWikimediaHost &&
        url.hostname !== "upload.wikimedia.org" &&
        url.hostname !== "commons.wikimedia.org")
    ) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function safeLicenseUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function pageFileTitle(page: JsonRecord): string {
  return typeof page.title === "string" && page.title.startsWith("File:")
    ? page.title
    : "";
}

function normalizedImageResult(pageValue: unknown): EditorImageCandidateSearchResult | null {
  const page = asRecord(pageValue);
  if (!page) return null;

  const fileTitle = pageFileTitle(page);
  const imageInfo = Array.isArray(page.imageinfo)
    ? asRecord(page.imageinfo[0])
    : null;
  if (!fileTitle || !imageInfo) return null;

  const imageUrl = safeWikimediaUrl(imageInfo.url);
  const thumbnailUrl =
    safeWikimediaUrl(imageInfo.thumburl) || imageUrl;
  const filePageUrl =
    safeWikimediaUrl(imageInfo.descriptionurl) ||
    `https://commons.wikimedia.org/wiki/${fileTitle
      .split(":")
      .map((part) => encodeURIComponent(part.replaceAll(" ", "_")))
      .join(":")}`;
  if (!imageUrl || !thumbnailUrl) return null;

  const metadata = asRecord(imageInfo.extmetadata) ?? {};
  const license = plainText(metadata.LicenseShortName);
  const creator = plainText(metadata.Artist);
  const credit = plainText(metadata.Credit) || creator;
  const copyright =
    plainText(metadata.Copyright) || plainText(metadata.Copyrighted);
  const usageRights = [
    plainText(metadata.UsageTerms),
    /^true|yes|1$/i.test(plainText(metadata.AttributionRequired))
      ? "Attribution required."
      : "",
    plainText(metadata.Restrictions)
      ? `Restrictions: ${plainText(metadata.Restrictions)}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    source: "Wikimedia Commons",
    fileTitle,
    imageUrl,
    thumbnailUrl,
    filePageUrl,
    license,
    licenseUrl: safeLicenseUrl(textValue(metadata.LicenseUrl)),
    creator,
    credit,
    copyright,
    usageRights,
    catalogReference: "",
    artworkDate: "",
    provenance: "",
  };
}

function responsePages(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (root?.error) {
    throw new Error("Wikimedia Commons returned an API error.");
  }
  const query = asRecord(root?.query);
  const pages = query?.pages;
  if (Array.isArray(pages)) return pages;
  const pagesRecord = asRecord(pages);
  return pagesRecord ? Object.values(pagesRecord) : [];
}

export function createWikimediaCommonsClient(
  fetchImpl: typeof fetch = fetch,
): WikimediaCommonsClient {
  async function request(params: URLSearchParams): Promise<unknown> {
    const url = new URL(COMMONS_API_URL);
    params.forEach((value, key) => url.searchParams.set(key, value));
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": COMMONS_USER_AGENT,
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error("Wikimedia Commons request failed.");
    }
    return response.json();
  }

  return {
    async searchImages(query) {
      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: query,
        gsrnamespace: "6",
        gsrlimit: String(MAX_RESULTS),
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "640",
        format: "json",
        formatversion: "2",
      });
      const pages = responsePages(await request(params));
      const seen = new Set<string>();
      const results: EditorImageCandidateSearchResult[] = [];
      for (const page of pages) {
        const result = normalizedImageResult(page);
        if (!result || seen.has(result.fileTitle)) continue;
        seen.add(result.fileTitle);
        results.push(result);
        if (results.length >= MAX_RESULTS) break;
      }
      return results;
    },

    async getFileByTitle(fileTitle) {
      if (!fileTitle.startsWith("File:")) return null;
      const params = new URLSearchParams({
        action: "query",
        titles: fileTitle,
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "640",
        format: "json",
        formatversion: "2",
      });
      const [page] = responsePages(await request(params));
      return page ? normalizedImageResult(page) : null;
    },
  };
}

export const wikimediaCommonsClient = createWikimediaCommonsClient();