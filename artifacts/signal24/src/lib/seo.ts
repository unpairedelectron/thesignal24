import { useEffect } from 'react';

export const SITE_NAME = 'The Signal 24';

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Canonical public origin. Canonicals, og:url, og:image and structured data always
// use this host, so mirror hosts (e.g. *.replit.app) never self-canonicalize.
export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://thesignal24.com').replace(/\/$/, '');

// Publication language/region: English as used in India. Keep in sync with <html lang> in index.html.
export const SITE_LANGUAGE = 'en-IN';
export const SITE_OG_LOCALE = 'en_IN';

export const DEFAULT_SHARE_IMAGE = '/images/og-default.jpg';

/** Language editions. English lives at /, Hindi at /hi/. */
export type Lang = 'en' | 'hi';
export const HINDI_PREFIX = '/hi';

// Set by LangProvider during render. Only one edition renders at a time.
let activeLang: Lang = 'en';
export function setActiveLang(lang: Lang) {
  activeLang = lang;
}
export function getActiveLang() {
  return activeLang;
}

/** Files and API routes are shared by both editions and are never prefixed. */
function isSharedPath(path: string) {
  const clean = path.split(/[?#]/)[0];
  return clean.startsWith('/api/') || /\.[a-z0-9]{2,5}$/i.test(clean);
}

/** Remove a leading /hi from an internal path. */
export function stripLangPrefix(path: string) {
  if (path === HINDI_PREFIX) return '/';
  if (path.startsWith(`${HINDI_PREFIX}/`) || path.startsWith(`${HINDI_PREFIX}?`) || path.startsWith(`${HINDI_PREFIX}#`)) {
    const rest = path.slice(HINDI_PREFIX.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return path;
}

/** Internal path for a page in the given edition: '/archive' → '/hi/archive'. */
export function localizePath(path: string, lang: Lang = activeLang) {
  const internal = path.startsWith('/') && !path.startsWith('//') ? path : `/${path}`;
  if (isSharedPath(internal)) return internal;
  const neutral = stripLangPrefix(internal);
  if (lang !== 'hi') return neutral;
  return neutral === '/' ? HINDI_PREFIX : `${HINDI_PREFIX}${neutral}`;
}

/** Absolute URL without language handling (assets, explicit alternates). */
export function siteUrl(path = '/') {
  const internalPath = path.startsWith('/') && !path.startsWith('//') ? path : `/${path}`;
  return new URL(`${basePath}${internalPath}` || '/', SITE_ORIGIN).href;
}

/** Absolute URL for a page in the current language edition. */
export function absoluteSiteUrl(path = '/') {
  return siteUrl(localizePath(path));
}

/** Absolute URL for an image path that may already carry the base path or be absolute. */
export function absoluteImageUrl(src: string = DEFAULT_SHARE_IMAGE) {
  if (/^https?:\/\//.test(src)) return src;
  const withoutBase = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  return siteUrl(withoutBase);
}

export function absoluteStructuredData(value: unknown): unknown {
  if (typeof value === 'string') {
    if (!value.startsWith('/') || value.startsWith('//')) return value;
    // Site-wide node ids ('/#organization', '/#website') stay identical in both editions.
    return value.startsWith('/#') ? siteUrl(value) : absoluteSiteUrl(value);
  }
  if (Array.isArray(value)) return value.map(absoluteStructuredData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, absoluteStructuredData(item)]));
  }
  return value;
}

export type SeoConfig = {
  title: string;
  description: string;
  canonicalPath?: string;
  robots?: string;
  type?: string;
  image?: string;
  /** Open Graph locale. Defaults to en_IN, or hi_IN on the Hindi edition. */
  locale?: string;
  /**
   * Whether this page's main content exists in the current edition's language.
   * Untranslated Hindi pages are noindexed and drop hreflang so search engines
   * never index English text under a Hindi URL.
   */
  translated?: boolean;
  structuredData?: unknown;
};

export function useSeo({ title, description, canonicalPath, robots: requestedRobots = 'index, follow', type = 'website', image, locale, translated = true, structuredData }: SeoConfig) {
  const lang = activeLang;
  const robots = lang === 'hi' && !translated && requestedRobots.startsWith('index') ? 'noindex, follow' : requestedRobots;
  const ogLocale = locale ?? (lang === 'hi' ? 'hi_IN' : SITE_OG_LOCALE);
  const structuredDataText = JSON.stringify(absoluteStructuredData(structuredData ?? null));
  useEffect(() => {
    document.title = title;
    const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        element.dataset.signalSeo = 'true';
        document.head.appendChild(element);
      }
      element.content = content;
    };

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    const pathname = window.location.pathname;
    const currentPath = basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || '/'
      : pathname;
    upsertMeta('property', 'og:url', absoluteSiteUrl(canonicalPath ?? currentPath));
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', ogLocale);
    document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((element) => element.remove());
    const shareImage = absoluteImageUrl(image);
    upsertMeta('property', 'og:image', shareImage);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', shareImage);
    // Dimensions are only known for the default 1200×630 card.
    if (image) {
      document.head.querySelectorAll('meta[property="og:image:width"], meta[property="og:image:height"]').forEach((element) => element.remove());
    } else {
      upsertMeta('property', 'og:image:width', '1200');
      upsertMeta('property', 'og:image:height', '630');
    }

    document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((element) => element.remove());
    if (canonicalPath && robots.startsWith('index')) {
      const addLink = (attributes: Record<string, string>) => {
        const link = document.createElement('link');
        Object.entries(attributes).forEach(([key, value]) => link.setAttribute(key, value));
        link.dataset.signalSeo = 'true';
        document.head.appendChild(link);
      };
      addLink({ rel: 'canonical', href: absoluteSiteUrl(canonicalPath) });
      // Alternates only when both editions carry this page's content.
      if (translated) {
        const english = siteUrl(localizePath(canonicalPath, 'en'));
        addLink({ rel: 'alternate', hreflang: 'en-IN', href: english });
        addLink({ rel: 'alternate', hreflang: 'hi-IN', href: siteUrl(localizePath(canonicalPath, 'hi')) });
        addLink({ rel: 'alternate', hreflang: 'x-default', href: english });
        const alternateLocale = document.createElement('meta');
        alternateLocale.setAttribute('property', 'og:locale:alternate');
        alternateLocale.content = ogLocale === 'hi_IN' ? 'en_IN' : 'hi_IN';
        alternateLocale.dataset.signalSeo = 'true';
        document.head.appendChild(alternateLocale);
      }
    }

    document.head.querySelectorAll('script[data-signal-seo]').forEach((element) => element.remove());
    if (structuredDataText !== 'null') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.signalSeo = 'true';
      script.textContent = structuredDataText;
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, lang, ogLocale, robots, structuredDataText, title, translated, type]);
}
