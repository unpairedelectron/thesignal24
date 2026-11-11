import { sql } from "drizzle-orm";
import { db, indexnowSubmissionsTable } from "@workspace/db";
import { logger } from "./logger";
import { INDEXNOW_KEY } from "./indexnow-key";
import { sitemapAbsoluteUrls, sitemapEntries } from "../routes/publication";

/**
 * IndexNow: tells Bing, Yandex, Seznam, Naver and the other participating engines the
 * moment a public URL is new or has changed, instead of waiting for them to recrawl.
 *
 * - The key is public by design: engines confirm it by fetching
 *   https://thesignal24.com/<key>.txt (artifacts/signal24/public/<key>.txt), which must
 *   contain exactly the key. Change both together.
 * - On API start (production only), every sitemap URL is compared with what was last
 *   submitted (indexnow_submissions) and only new or changed URLs are sent.
 * - A failed submission is logged and retried on the next start; it never blocks or
 *   crashes the API.
 */
export { INDEXNOW_KEY };

const SITE_ORIGIN = (process.env.SITE_URL || "https://thesignal24.com").replace(/\/$/, "");
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
/** The protocol accepts up to 10,000 URLs per request. */
const BATCH = 10_000;

/**
 * Production only by default, so development databases never announce URLs to the
 * real engines. INDEXNOW_ENABLED=1 / 0 overrides (tests point INDEXNOW_ENDPOINT at a stub).
 */
export function indexNowEnabled() {
  if (process.env.INDEXNOW_ENABLED === "0") return false;
  if (process.env.INDEXNOW_ENABLED === "1") return true;
  return process.env.NODE_ENV === "production";
}

/** Creates the submissions table if a deployment has not run `drizzle-kit push`. */
export async function ensureIndexNowSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS indexnow_submissions (
      url text PRIMARY KEY,
      lastmod timestamp with time zone,
      submitted_at timestamp with time zone NOT NULL DEFAULT now()
    )`);
}

type Candidate = { url: string; lastmod: Date | null };

/** URLs that are new, or whose last change is later than the one last submitted. */
export function changedSince(candidates: Candidate[], submitted: Map<string, Date | null>) {
  return candidates.filter(({ url, lastmod }) => {
    if (!submitted.has(url)) return true;
    const previous = submitted.get(url) ?? null;
    if (!lastmod) return false;
    return !previous || lastmod.getTime() > previous.getTime();
  });
}

export async function submitChangedUrls(): Promise<{ submitted: number; skipped?: string }> {
  if (!indexNowEnabled()) return { submitted: 0, skipped: "disabled outside production" };
  const candidates = sitemapAbsoluteUrls(await sitemapEntries());
  const rows = await db.select().from(indexnowSubmissionsTable);
  const changed = changedSince(candidates, new Map(rows.map((row) => [row.url, row.lastmod])));
  if (changed.length === 0) {
    logger.info("IndexNow: no new or changed URLs");
    return { submitted: 0 };
  }
  const host = new URL(SITE_ORIGIN).host;
  let submitted = 0;
  for (let start = 0; start < changed.length; start += BATCH) {
    const batch = changed.slice(start, start + BATCH);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: batch.map(({ url }) => url),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    // 200 OK and 202 Accepted both mean the URLs were received.
    if (response.status !== 200 && response.status !== 202) {
      logger.warn({ status: response.status, urls: batch.length }, "IndexNow: submission refused; will retry on next start");
      break;
    }
    const now = new Date();
    for (const { url, lastmod } of batch) {
      await db
        .insert(indexnowSubmissionsTable)
        .values({ url, lastmod, submittedAt: now })
        .onConflictDoUpdate({ target: indexnowSubmissionsTable.url, set: { lastmod, submittedAt: now } });
    }
    submitted += batch.length;
  }
  logger.info({ submitted }, "IndexNow: submitted new and changed URLs");
  return { submitted };
}
