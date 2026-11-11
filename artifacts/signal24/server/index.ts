/**
 * Production web server for The Signal 24.
 *
 * Serves the built app (dist/public) and renders every page URL on the server, so a
 * crawler gets the page's real title, description, canonical, hreflang, structured
 * data and text in the first response, with a real 404 for addresses that do not
 * exist. Development still uses Vite; this runs only in production.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync, statSync, type Stats } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';
import { ApiUnavailable } from './api';
import { renderDocument } from './html';
import { renderPath } from './render';

const rawPort = process.env.PORT;
if (!rawPort) throw new Error('PORT environment variable is required but was not provided.');
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const publicDir = path.resolve(process.env.PUBLIC_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public'));
const template = readFileSync(path.join(publicDir, 'index.html'), 'utf8');

const MIME: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json; charset=utf-8',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg\+xml)/;

function pickEncoding(req: IncomingMessage) {
  const accepted = String(req.headers['accept-encoding'] ?? '');
  if (/\bbr\b/.test(accepted)) return 'br' as const;
  if (/\bgzip\b/.test(accepted)) return 'gzip' as const;
  return null;
}

function compress(body: Buffer, encoding: 'br' | 'gzip', quality: number) {
  return encoding === 'br'
    ? brotliCompressSync(body, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: quality, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: body.length } })
    : gzipSync(body, { level: Math.min(9, quality) });
}

function send(req: IncomingMessage, res: ServerResponse, status: number, headers: Record<string, string>, body: Buffer, quality = 5) {
  const type = headers['Content-Type'] ?? '';
  const encoding = body.length > 1024 && COMPRESSIBLE.test(type) ? pickEncoding(req) : null;
  const payload = encoding ? compress(body, encoding, quality) : body;
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    ...headers,
    ...(COMPRESSIBLE.test(type) ? { Vary: 'Accept-Encoding' } : {}),
    ...(encoding ? { 'Content-Encoding': encoding } : {}),
    'Content-Length': String(payload.length),
  });
  res.end(req.method === 'HEAD' ? undefined : payload);
}

// --- Static files -----------------------------------------------------------

type StaticEntry = { stats: Stats; body: Buffer; compressed: Map<string, Buffer> };
const staticCache = new Map<string, StaticEntry>();

function resolveStatic(pathname: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const file = path.resolve(publicDir, `.${path.posix.normalize(decoded)}`);
  if (file !== publicDir && !file.startsWith(publicDir + path.sep)) return null;
  // Dotfiles are never served.
  if (file.slice(publicDir.length).split(path.sep).some((part) => part.startsWith('.'))) return null;
  try {
    const stats = statSync(file);
    return stats.isFile() ? { file, stats } : null;
  } catch {
    return null;
  }
}

async function serveStatic(req: IncomingMessage, res: ServerResponse, file: string, stats: Stats, pathname: string) {
  const type = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
  const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  // Vite's hashed bundles never change; everything else revalidates hourly.
  const cacheControl = pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag, 'Cache-Control': cacheControl });
    res.end();
    return;
  }
  let entry = staticCache.get(file);
  if (!entry || entry.stats.mtimeMs !== stats.mtimeMs || entry.stats.size !== stats.size) {
    entry = { stats, body: await readFile(file), compressed: new Map() };
    staticCache.set(file, entry);
  }
  const encoding = entry.body.length > 1024 && COMPRESSIBLE.test(type) ? pickEncoding(req) : null;
  let payload = entry.body;
  if (encoding) {
    payload = entry.compressed.get(encoding) ?? compress(entry.body, encoding, 11);
    entry.compressed.set(encoding, payload);
  }
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': String(payload.length),
    'Cache-Control': cacheControl,
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
    ...(COMPRESSIBLE.test(type) ? { Vary: 'Accept-Encoding' } : {}),
    ...(encoding ? { 'Content-Encoding': encoding } : {}),
  });
  res.end(req.method === 'HEAD' ? undefined : payload);
}

// --- Pages --------------------------------------------------------------------

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' };

async function servePage(req: IncomingMessage, res: ServerResponse, pathname: string, search: string) {
  try {
    const result = await renderPath(pathname);
    if (result.kind === 'redirect') {
      const location = /[^\x21-\x7e]/.test(result.location) ? encodeURI(result.location) : result.location;
      res.writeHead(result.status, { Location: `${location}${search}`, 'Cache-Control': 'public, max-age=3600' });
      res.end();
      return;
    }
    send(req, res, result.status, HTML_HEADERS, Buffer.from(renderDocument(template, result.page)));
  } catch (error) {
    // The API is down or starting: serve the plain app shell, which loads its data in
    // the browser, with a 503 so crawlers come back instead of indexing an empty page.
    if (!(error instanceof ApiUnavailable)) console.error(`render failed for ${pathname}:`, error);
    else console.warn(`API unavailable while rendering ${pathname}: ${error.message}`);
    send(req, res, 503, { ...HTML_HEADERS, 'Cache-Control': 'no-store', 'Retry-After': '30' }, Buffer.from(template));
  }
}

const server = createServer((req, res) => {
  void (async () => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed');
      return;
    }
    const url = new URL(req.url ?? '/', 'http://localhost');
    const { pathname, search } = url;
    if (pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : 'ok');
      return;
    }
    // One URL per page: no trailing slash, and the raw shell is never a page.
    if (pathname === '/index.html') {
      res.writeHead(301, { Location: `/${search}` });
      res.end();
      return;
    }
    if (pathname.length > 1 && pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${pathname.replace(/\/+$/, '') || '/'}${search}` });
      res.end();
      return;
    }
    const file = resolveStatic(pathname);
    if (file) {
      await serveStatic(req, res, file.file, file.stats, pathname);
      return;
    }
    // A missing file (an old hashed bundle, a typo'd image) is a 404, not a page.
    if (pathname.startsWith('/assets/') || /\.[a-z0-9]{2,5}$/i.test(pathname)) {
      send(req, res, 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, Buffer.from('Not found'));
      return;
    }
    await servePage(req, res, pathname, search);
  })().catch((error) => {
    console.error('request failed', error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end();
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Signal 24 web server listening on ${port}, serving ${publicDir}`);
});
