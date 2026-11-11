/**
 * Reads the public API for the page server. The API runs beside this server in the
 * same deployment (Replit routes /api to it), so requests go to it directly.
 */
import { SITE_ORIGIN } from '../src/lib/seo';

const TIMEOUT_MS = 8_000;
const CACHE_MS = 30_000;

const PRIMARY_ORIGIN = (process.env.API_ORIGIN || 'http://127.0.0.1:8080').replace(/\/$/, '');
// If the API is not reachable on this machine (a deployment that runs the services
// apart), read it through the public site instead. Only these two origins are used;
// the request's Host header is never trusted for this.
const FALLBACK_ORIGIN = (process.env.API_FALLBACK_ORIGIN || SITE_ORIGIN).replace(/\/$/, '');
let preferredOrigin = PRIMARY_ORIGIN;

async function fetchApi(path: string) {
  const init = { headers: { accept: 'application/json' } };
  try {
    return await fetch(`${preferredOrigin}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    if (preferredOrigin !== PRIMARY_ORIGIN || FALLBACK_ORIGIN === PRIMARY_ORIGIN || (error as Error).name === 'TimeoutError') throw error;
    const response = await fetch(`${FALLBACK_ORIGIN}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    console.warn(`API not reachable at ${PRIMARY_ORIGIN}; reading it through ${FALLBACK_ORIGIN} from now on.`);
    preferredOrigin = FALLBACK_ORIGIN;
    return response;
  }
}

/** The API could not answer (down, starting, timed out, 5xx). Rendered as a 503. */
export class ApiUnavailable extends Error {}

/** A text document from the API (the XML sitemap), uncached so it is always current. */
export async function getApiText(path: string) {
  let response: Response;
  try {
    response = await fetchApi(path);
  } catch (error) {
    throw new ApiUnavailable(`${path}: ${(error as Error).message}`);
  }
  if (!response.ok) throw new ApiUnavailable(`${path}: HTTP ${response.status}`);
  return response.text();
}

type Cached = { expires: number; status: number; data: unknown };
const cache = new Map<string, Cached>();
const inflight = new Map<string, Promise<Cached>>();

async function load(path: string): Promise<Cached> {
  const hit = cache.get(path);
  if (hit && hit.expires > Date.now()) return hit;
  const pending = inflight.get(path);
  if (pending) return pending;
  const request = (async () => {
    let response: Response;
    try {
      response = await fetchApi(path);
    } catch (error) {
      throw new ApiUnavailable(`${path}: ${(error as Error).message}`);
    }
    if (response.status >= 500) throw new ApiUnavailable(`${path}: HTTP ${response.status}`);
    const data = response.ok ? await response.json() : null;
    const entry = { expires: Date.now() + CACHE_MS, status: response.status, data };
    // Only successful reads and plain not-founds are cached.
    if (response.ok || response.status === 404) cache.set(path, entry);
    return entry;
  })();
  inflight.set(path, request);
  try {
    return await request;
  } finally {
    inflight.delete(path);
  }
}

/**
 * One page render's view of the API. `get` returns null for 4xx; `prime` marks a
 * response for the client (by its React Query key) so the first render needs no fetch.
 */
export class ApiReader {
  readonly primed: Array<[readonly unknown[], unknown]> = [];

  async get<T>(path: string): Promise<T | null> {
    const result = await load(path);
    return result.status >= 200 && result.status < 300 ? (result.data as T) : null;
  }

  /** Fetch and hand the response to the client under its orval query key. */
  async getPrimed<T>(path: string, queryKey: readonly unknown[]): Promise<T | null> {
    const data = await this.get<T>(path);
    if (data !== null && !this.primed.some(([key]) => JSON.stringify(key) === JSON.stringify(queryKey))) {
      this.primed.push([queryKey, data]);
    }
    return data;
  }
}
