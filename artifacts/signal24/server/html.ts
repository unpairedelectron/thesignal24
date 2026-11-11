/**
 * HTML helpers for the page server: escaping, the <head> block, and splicing a
 * rendered page into the built index.html.
 *
 * buildHead mirrors useSeo (src/lib/seo.ts) rule for rule, so the tags a crawler
 * reads in the first response are the tags the app sets after it loads. If you
 * change one, change the other.
 */
import {
  absoluteImageUrl,
  absoluteStructuredData,
  localizePath,
  setActiveLang,
  siteUrl,
  SITE_NAME,
  SITE_OG_LOCALE,
  type Lang,
  type SeoConfig,
} from '../src/lib/seo';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/** JSON for a <script> element: nothing in it can close the tag or start a comment. */
export function scriptJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export type HeadInput = SeoConfig & { lang: Lang; /** Neutral path of the request (no /hi prefix). */ path: string };

/** The resolved robots value, exactly as useSeo computes it. */
export function effectiveRobots({ lang, robots = 'index, follow', translated = true }: Pick<HeadInput, 'lang' | 'robots' | 'translated'>) {
  return lang === 'hi' && !translated && robots.startsWith('index') ? 'noindex, follow' : robots;
}

export function buildHead(input: HeadInput) {
  const { title, description, canonicalPath, type = 'website', image, locale, translated = true, structuredData, lang, path } = input;
  const robots = effectiveRobots(input);
  const ogLocale = locale ?? (lang === 'hi' ? 'hi_IN' : SITE_OG_LOCALE);
  const abs = (target: string) => siteUrl(localizePath(target, lang));
  const shareImage = absoluteImageUrl(image);
  const tags: string[] = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${esc(robots)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:url" content="${esc(abs(canonicalPath ?? path))}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="${esc(ogLocale)}" />`,
    `<meta property="og:image" content="${esc(shareImage)}" />`,
    ...(image ? [] : ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />']),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(shareImage)}" />`,
  ];
  if (canonicalPath && robots.startsWith('index')) {
    tags.push(`<link rel="canonical" href="${esc(abs(canonicalPath))}" />`);
    if (translated) {
      const english = siteUrl(localizePath(canonicalPath, 'en'));
      tags.push(
        `<link rel="alternate" hreflang="en-IN" href="${esc(english)}" />`,
        `<link rel="alternate" hreflang="hi-IN" href="${esc(siteUrl(localizePath(canonicalPath, 'hi')))}" />`,
        `<link rel="alternate" hreflang="x-default" href="${esc(english)}" />`,
        `<meta property="og:locale:alternate" content="${ogLocale === 'hi_IN' ? 'en_IN' : 'hi_IN'}" />`,
      );
    }
  }
  if (structuredData) {
    // absoluteStructuredData localizes paths against the active edition; set it in the
    // same synchronous step so concurrent requests cannot interleave.
    setActiveLang(lang);
    // data-signal-seo: useSeo replaces this script instead of adding a second one.
    tags.push(`<script type="application/ld+json" data-signal-seo="true">${scriptJson(absoluteStructuredData(structuredData))}</script>`);
  }
  return tags.join('\n    ');
}

/** Tags in index.html that buildHead replaces. */
const TEMPLATE_HEAD_TAGS = [
  /\s*<title>[\s\S]*?<\/title>/,
  /\s*<meta name="description"[^>]*>/,
  /\s*<meta name="robots"[^>]*>/,
  /\s*<meta property="og:[^"]*"[^>]*>/g,
  /\s*<meta name="twitter:[^"]*"[^>]*>/g,
];

export type PageHtml = { lang: Lang; head: string; body: string; data?: Array<[readonly unknown[], unknown]> };

/** Splice a rendered page into the built index.html. */
export function renderDocument(template: string, page: PageHtml) {
  let html = template;
  for (const pattern of TEMPLATE_HEAD_TAGS) html = html.replace(pattern, '');
  if (page.lang === 'hi') {
    html = html
      .replace('<html lang="en-IN">', '<html lang="hi-IN" class="lang-hi">')
      .replace('<meta http-equiv="content-language" content="en-IN" />', '<meta http-equiv="content-language" content="hi-IN" />');
  }
  const data = page.data?.length ? `\n    <script type="application/json" id="signal-data">${scriptJson(page.data)}</script>` : '';
  html = html.replace('</head>', `    ${page.head}${data}\n  </head>`);
  // The server-rendered page replaces the generic <noscript> fallback: it already
  // carries the content and the links, with or without JavaScript.
  html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '');
  return html.replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
}

export { setActiveLang };
