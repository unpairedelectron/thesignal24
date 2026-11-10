import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const artifactDir = path.resolve(scriptDir, '..');
const publicDir = path.join(artifactDir, 'dist/public');
const artifactConfig = path.join(artifactDir, '.replit-artifact/artifact.toml');

async function findHtml(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtml(fullPath);
    return entry.name === 'index.html' ? [fullPath] : [];
  }));
  return nested.flat();
}

const files = await findHtml(publicDir);
assert.ok(files.length >= 100, `Expected generated public pages, found ${files.length}`);
const routes = new Set(files.map((file) => `/${path.relative(publicDir, path.dirname(file)).split(path.sep).filter(Boolean).join('/')}`.replace(/^\/$/, '/')));

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const route = `/${path.relative(publicDir, path.dirname(file)).split(path.sep).filter(Boolean).join('/')}`.replace(/^\/$/, '/');
  assert.match(html, /<title>[^<]+\s*<\/title>/, `Missing page title: ${route}`);
  assert.match(html, /<meta name="description" content="[^"]+"\s*\/>/, `Missing description: ${route}`);
  assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+"/, `Missing canonical URL: ${route}`);
  assert.match(html, /<main\b[\s\S]*?<\/main>/, `Missing prerendered content: ${route}`);
  const structuredData = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(structuredData, `Missing structured data: ${route}`);
  assert.doesNotThrow(() => JSON.parse(structuredData!), `Invalid structured data: ${route}`);

  for (const match of html.matchAll(/<link rel="alternate" hreflang="(en-IN|hi-IN)" href="https:\/\/[^/]+([^"]*)"/g)) {
    const alternate = match[2] || '/';
    const alternateRoute = alternate.replace(/\/$/, '') || '/';
    assert.ok(routes.has(alternateRoute), `Missing ${match[1]} alternate ${alternateRoute} referenced by ${route}`);
  }

  const isStateProfile = /^\/(?:hi\/)?state\/[^/]+$/.test(route);
  if (isStateProfile) assert.match(html, /<h1>[^<]+<\/h1>/, `Missing state heading: ${route}`);
  const isStoryFamily = /^\/(?:hi\/)?(?:articles|data|states|documents|cases)\/[^/]+$/.test(route);
  if (isStoryFamily) {
    assert.match(structuredData!, /"@type":"NewsArticle"/, `Missing NewsArticle metadata: ${route}`);
    assert.match(html, /Open the original source|मूल स्रोत खोलें/, `Missing source link: ${route}`);
  }
}

const config = await readFile(artifactConfig, 'utf8');
const fallbackIndex = config.indexOf('from = "/*"');
assert.ok(fallbackIndex > 0, 'SPA fallback rewrite is missing');
for (const family of ['articles', 'data', 'states', 'documents', 'cases', 'policies']) {
  const ruleIndex = config.indexOf(`from = "/${family}/*"`);
  assert.ok(ruleIndex >= 0 && ruleIndex < fallbackIndex, `Missing or late static rewrite for /${family}/*`);
}
console.log(`Verified ${files.length} prerendered routes and all public-story rewrite families.`);
