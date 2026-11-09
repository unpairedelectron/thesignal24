import { useEffect } from 'react';

export const SITE_NAME = 'The Signal 24';

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Canonical public origin. Canonicals, og:url, og:image and structured data always
// use this host, so mirror hosts (e.g. *.replit.app) never self-canonicalize.
export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://thesignal24.com').replace(/\/$/, '');

export const DEFAULT_SHARE_IMAGE = '/images/og-default.jpg';

export function absoluteSiteUrl(path = '/') {
  const internalPath = path.startsWith('/') && !path.startsWith('//') ? path : `/${path}`;
  return new URL(`${basePath}${internalPath}` || '/', SITE_ORIGIN).href;
}

/** Absolute URL for an image path that may already carry the base path or be absolute. */
export function absoluteImageUrl(src: string = DEFAULT_SHARE_IMAGE) {
  if (/^https?:\/\//.test(src)) return src;
  const withoutBase = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  return absoluteSiteUrl(withoutBase);
}

export function absoluteStructuredData(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.startsWith('/') && !value.startsWith('//') ? absoluteSiteUrl(value) : value;
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
  structuredData?: unknown;
};

export function useSeo({ title, description, canonicalPath, robots = 'index, follow', type = 'website', image, structuredData }: SeoConfig) {
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

    document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove());
    if (canonicalPath && robots.startsWith('index')) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = absoluteSiteUrl(canonicalPath);
      canonical.dataset.signalSeo = 'true';
      document.head.appendChild(canonical);
    }

    document.head.querySelectorAll('script[data-signal-seo]').forEach((element) => element.remove());
    if (structuredDataText !== 'null') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.signalSeo = 'true';
      script.textContent = structuredDataText;
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, robots, structuredDataText, title, type]);
}
