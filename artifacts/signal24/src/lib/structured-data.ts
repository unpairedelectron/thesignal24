// schema.org JSON-LD building blocks shared by every public page.
//
// Every page emits one `@graph` that contains the publisher (NewsMediaOrganization)
// and the WebSite once, and other nodes point at them by `@id` instead of
// repeating them inline. Paths that start with "/" (including `@id`s) are made
// absolute against SITE_ORIGIN by useSeo's absoluteStructuredData.
import { DEFAULT_SHARE_IMAGE, SITE_LANGUAGE, SITE_NAME, absoluteImageUrl } from './seo';
import { authorMeta, authorPath, PEN_NAME_NOTE, type Author } from './authors';

export const ORGANIZATION_ID = '/#organization';
export const WEBSITE_ID = '/#website';
export const EDITORIAL_DESK_PATH = '/authors/signal-24';
export const EDITORIAL_DESK_ID = `${EDITORIAL_DESK_PATH}#desk`;

export const organizationRef = { '@id': ORGANIZATION_ID } as const;
export const websiteRef = { '@id': WEBSITE_ID } as const;
export const editorialDeskRef = { '@id': EDITORIAL_DESK_ID } as const;

const INDIA = { '@type': 'Country', name: 'India' } as const;

export const organizationNode = {
  '@type': 'NewsMediaOrganization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: '/',
  description: 'A source-first public-interest newsroom and research archive for reservation policy, court records, official documents and data in India.',
  logo: { '@type': 'ImageObject', url: '/logo.svg', contentUrl: '/logo.svg', width: 180, height: 48, caption: SITE_NAME },
  inLanguage: SITE_LANGUAGE,
  areaServed: INDIA,
  knowsAbout: [
    'Reservation policy in India',
    'Affirmative action',
    'Court judgments and orders',
    'Government notifications',
    'Representation data',
    'Education and public employment',
  ],
  publishingPrinciples: '/editorial-standards',
  ethicsPolicy: '/editorial-standards',
  correctionsPolicy: '/editorial-standards',
  verificationFactCheckingPolicy: '/methodology',
};

export const websiteNode = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: '/',
  inLanguage: SITE_LANGUAGE,
  publisher: organizationRef,
  // /search reads ?q= on load (SearchPage).
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: '/search?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

/** The editorial desk behind /authors/signal-24: a department of the publisher, not a person. */
export const editorialDeskNode = {
  '@type': 'Organization',
  '@id': EDITORIAL_DESK_ID,
  name: `${SITE_NAME} editorial desk`,
  url: EDITORIAL_DESK_PATH,
  parentOrganization: organizationRef,
};

/** Wrap page nodes in a graph that always carries the publisher and the website. */
export function siteGraph(...nodes: Array<Record<string, unknown> | null | undefined | false>) {
  return { '@context': 'https://schema.org', '@graph': [organizationNode, websiteNode, ...nodes.filter(Boolean)] };
}

export function breadcrumbNode(path: string, trail: Array<[name: string, path: string]>) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${path}#breadcrumb`,
    itemListElement: [[SITE_NAME, '/'] as [string, string], ...trail].map(([name, item], index) => ({ '@type': 'ListItem', position: index + 1, name, item })),
  };
}

/** A web page node with the standard cross-references. */
export function webPageNode(path: string, fields: Record<string, unknown> & { name: string }, type = 'WebPage') {
  return {
    '@type': type,
    '@id': `${path}#webpage`,
    url: path,
    isPartOf: websiteRef,
    inLanguage: SITE_LANGUAGE,
    breadcrumb: { '@id': `${path}#breadcrumb` },
    ...fields,
  };
}

/** CollectionPage with an ItemList of links already loaded on the page. */
export function collectionPageNode(path: string, fields: Record<string, unknown> & { name: string }, items: Array<{ url: string; name: string }> = []) {
  return webPageNode(path, {
    ...fields,
    ...(items.length ? {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, url: item.url, name: item.name })),
      },
    } : {}),
  }, 'CollectionPage');
}

export function imageObject(src?: string | null, width?: number, height?: number) {
  if (!src) return { '@type': 'ImageObject', url: absoluteImageUrl(DEFAULT_SHARE_IMAGE), width: 1200, height: 630 };
  return { '@type': 'ImageObject', url: absoluteImageUrl(src), ...(width && height ? { width, height } : {}) };
}

/** A state of India, nested in the country, for spatialCoverage. */
export function placeForState(state?: string | null) {
  return state ? { '@type': 'State', name: state, containedInPlace: INDIA } : INDIA;
}

export function externalDocument({ title, url, publisher, datePublished, genre }: { title: string; url?: string | null; publisher?: string | null; datePublished?: string | null; genre?: string | null }) {
  return {
    '@type': 'CreativeWork',
    name: title,
    ...(url ? { url } : {}),
    ...(publisher ? { publisher: { '@type': 'Organization', name: publisher } } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(genre ? { genre } : {}),
  };
}

/** A named Signal 24 author, referenced from their records and described on their profile page. */
export function personNode(author: Author, lang: 'en' | 'hi') {
  const path = authorPath(author);
  return {
    '@type': 'Person',
    '@id': `${path}#person`,
    name: author.name[lang],
    alternateName: author.name[lang === 'hi' ? 'en' : 'hi'],
    url: path,
    jobTitle: author.role[lang],
    worksFor: organizationRef,
    knowsAbout: author.knowsAbout,
  };
}

/** The ProfilePage graph for /authors/:slug. Shared by the client page and the page server. */
export function authorPageStructuredData(author: Author, lang: 'en' | 'hi') {
  const path = authorPath(author);
  const meta = authorMeta(author, lang);
  return siteGraph(
    webPageNode(path, { name: meta.title, description: meta.description, mainEntity: { '@id': `${path}#person` } }, 'ProfilePage'),
    { ...personNode(author, lang), description: `${author.bio[lang]} ${PEN_NAME_NOTE[lang]}` },
    breadcrumbNode(path, [[lang === 'hi' ? 'परिचय' : 'About', '/about'], [author.name[lang], path]]),
  );
}
