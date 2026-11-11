// URLs from the site that used to live on this domain (a general news site, and before
// that a JSP site). None of that content exists here any more. Google keeps recrawling
// these addresses and lists them in Search Console as "Crawled - currently not indexed",
// "Not found (404)" and "Soft 404". Answer each one so it leaves the index fast:
//   - a 301 where the old page has a real equivalent here (the home page, the archive);
//   - otherwise 410 Gone, which tells crawlers the removal is permanent. Google drops a
//     410 at least as quickly as a 404 and stops retrying it sooner.
// Only prefixes that no current route uses are listed, so a live page can never match.

export type LegacyResult = { status: 301; location: string } | { status: 410 } | null;

const REDIRECTS: Record<string, string> = {
  '/index.jsp': '/',
  '/analysis': '/archive',
  '/analysis/archive': '/archive',
  '/contact': '/about',
};

// Old sections: /analysis/<slug>, /explained/<slug>, /article/<slug>, /topic/<tag>,
// /news_view.jsp?ncd=<id>, and old section index pages.
const GONE_PREFIXES = ['/analysis/', '/explained/', '/article/', '/topic/'];
const GONE_EXACT = new Set(['/news_view.jsp', '/careers', '/tech', '/explained', '/article', '/topic']);

export function legacyRoute(pathname: string): LegacyResult {
  const hindi = pathname === '/hi' || pathname.startsWith('/hi/');
  const path = hindi ? pathname.slice(3) || '/' : pathname;
  const target = REDIRECTS[path];
  if (target) return { status: 301, location: hindi ? (target === '/' ? '/hi' : `/hi${target}`) : target };
  if (GONE_EXACT.has(path) || path.endsWith('.jsp') || GONE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return { status: 410 };
  }
  return null;
}
