import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGIONS, regionSlug, STATE_PROFILES } from '../src/lib/states';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(scriptDir, '../public');
const origin = (process.env.VITE_SITE_URL || 'https://thesignal24.com').replace(/\/$/, '');
const escapedOrigin = origin.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const today = new Date().toISOString().slice(0, 10);

function urlEntry(enPath: string, hiPath: string, lastModified: string) {
  return `  <url>
    <loc>${escapedOrigin}${enPath}</loc>
    <lastmod>${lastModified}</lastmod>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${escapedOrigin}${enPath}" />
    <xhtml:link rel="alternate" hreflang="hi-IN" href="${escapedOrigin}${hiPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapedOrigin}${enPath}" />
  </url>
  <url>
    <loc>${escapedOrigin}${hiPath}</loc>
    <lastmod>${lastModified}</lastmod>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${escapedOrigin}${enPath}" />
    <xhtml:link rel="alternate" hreflang="hi-IN" href="${escapedOrigin}${hiPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapedOrigin}${enPath}" />
  </url>`;
}

const entries = [
  urlEntry('/states', '/hi/states', today),
  ...REGIONS.map((region) => {
    const profile = STATE_PROFILES[region.name];
    const lastModified = profile?.facts
      .map((fact) => fact.review?.checkedOn ?? fact.when.slice(0, 10))
      .sort()
      .at(-1) ?? today;
    const enPath = `/state/${regionSlug(region.name)}`;
    return urlEntry(enPath, `/hi${enPath}`, lastModified);
  }),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'sitemap-states.xml'), xml, 'utf8');
console.log(`Generated sitemap-states.xml with ${REGIONS.length + 1} bilingual routes.`);
