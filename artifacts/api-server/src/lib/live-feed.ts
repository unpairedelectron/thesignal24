const FEEDS = [
  {
    id: "india-caste-policy",
    label: "Google News / India caste and policy",
    url: "https://news.google.com/rss/search?q=India+reservation+OR+caste+policy&hl=en-IN&gl=IN&ceid=IN:en",
  },
  {
    id: "the-hindu-national",
    label: "The Hindu / national",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
  },
] as const;

export type LiveUpdate = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string | null;
  observedAt: string;
  topic: "Latest" | "Courts & Policy" | "States" | "Ground Reports";
  status: "monitoring";
  reviewRequired: true;
};

type ParsedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  source: string | null;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

function cleanText(value: string) {
  return decodeXml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return match?.[1] ? cleanText(match[1]) : "";
}

function parseFeed(xml: string): ParsedItem[] {
  const itemBlocks = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(
    (match) => match[1],
  );
  const atomBlocks =
    itemBlocks.length > 0
      ? itemBlocks
      : [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map(
          (match) => match[1],
        );

  return atomBlocks
    .map((block) => {
      const link =
        tagValue(block, "link") ||
        block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
        "";
      return {
        title: tagValue(block, "title"),
        link: decodeXml(link),
        description: tagValue(block, "description") || tagValue(block, "summary"),
        pubDate: tagValue(block, "pubDate") || tagValue(block, "published") || null,
        source: tagValue(block, "source") || null,
      };
    })
    .filter((item) => item.title && /^https?:\/\//i.test(item.link));
}

function topicFor(headline: string): LiveUpdate["topic"] {
  const value = headline.toLowerCase();
  if (/(court|supreme court|high court|judgment|petition|order|quota|reservation|commission)/.test(value)) {
    return "Courts & Policy";
  }
  if (/(uttar pradesh|bihar|maharashtra|karnataka|tamil nadu|west bengal|rajasthan|delhi|state government)/.test(value)) {
    return "States";
  }
  if (/(violence|protest|discrimination|eviction|displaced|atrocit|village|campus)/.test(value)) {
    return "Ground Reports";
  }
  return "Latest";
}

async function fetchFeed(feed: (typeof FEEDS)[number]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(feed.url, {
      headers: {
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "user-agent": "TheSignal24/0.1 public-interest-monitor",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`${feed.label} returned HTTP ${response.status}`);
    }
    return parseFeed(await response.text()).map((item) => ({ ...item, feed }));
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLiveUpdates(): Promise<{
  updates: LiveUpdate[];
  feeds: { id: string; label: string; status: "ok" | "unavailable" }[];
  observedAt: string;
}> {
  const observedAt = new Date().toISOString();
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const updates = results.flatMap((result, index) => {
    if (result.status !== "fulfilled") return [];
    return result.value.map((item, itemIndex): LiveUpdate => ({
      id: `${FEEDS[index].id}-${itemIndex}-${Buffer.from(item.link).toString("base64url").slice(0, 14)}`,
      headline: item.title,
      summary:
        item.description ||
        "A source-linked item found in the monitoring feed. The Signal 24 has not independently verified this item.",
      source: item.source || FEEDS[index].label,
      sourceUrl: item.link,
      publishedAt: item.pubDate && !Number.isNaN(Date.parse(item.pubDate))
        ? new Date(item.pubDate).toISOString()
        : null,
      observedAt,
      topic: topicFor(item.title),
      status: "monitoring",
      reviewRequired: true,
    }));
  });
  const seen = new Set<string>();
  const deduped = updates
    .filter((item) => {
      if (seen.has(item.sourceUrl)) return false;
      seen.add(item.sourceUrl);
      return true;
    })
    .sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    })
    .slice(0, 24);

  return {
    updates: deduped,
    feeds: FEEDS.map((feed, index) => ({
      id: feed.id,
      label: feed.label,
      status: results[index]?.status === "fulfilled" ? "ok" : "unavailable",
    })),
    observedAt,
  };
}