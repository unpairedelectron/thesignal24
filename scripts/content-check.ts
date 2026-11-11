/**
 * Content quality gate. Fails (exit 1) when published content would read as thin,
 * unsourced or unsigned, or when the lists the site keeps in two places disagree.
 * Run through scripts/site-check.sh, which bundles this file with esbuild.
 */
import { CONTENT_PACK_A } from '../artifacts/api-server/src/lib/content-pack-a';
import { CONTENT_PACK_B } from '../artifacts/api-server/src/lib/content-pack-b';
import { CONTENT_PACK_C } from '../artifacts/api-server/src/lib/content-pack-c';
import { CONTENT_PACK_D } from '../artifacts/api-server/src/lib/content-pack-d';
import { CONTENT_PACK_OPINION } from '../artifacts/api-server/src/lib/content-pack-opinion';
import { ADDENDA_A } from '../artifacts/api-server/src/lib/content-pack-addenda-a';
import { ADDENDA_B } from '../artifacts/api-server/src/lib/content-pack-addenda-b';
import { POLICY_LEDGER_PACK } from '../artifacts/api-server/src/lib/policy-ledger-pack';
import { POLICY_UPDATES, STORY_UPDATES } from '../artifacts/api-server/src/lib/content-pack-updates';
import { AUTHOR_BY_TOPIC, EDITORIAL_BOARD_BYLINE, packByline } from '../artifacts/api-server/src/lib/authors';
import { ANSWERS } from '../artifacts/signal24/src/lib/answers';
import { ANSWER_DEPTH } from '../artifacts/signal24/src/lib/answers-depth';
import { AUTHORS } from '../artifacts/signal24/src/lib/authors';
import { POLICY_NOTES } from '../artifacts/signal24/src/lib/policy-notes';
import { REGIONS, regionSlug, STATE_PROFILES } from '../artifacts/signal24/src/lib/states';
import { readFileSync } from 'node:fs';

/**
 * Floors that catch stubs and half-finished drafts. They are not a quality target:
 * search engines have no word-count rule, and padding a page to pass one makes it
 * worse. Whether a piece is worth publishing is judged by the editorial checklist in
 * OPERATIONS.md. A story's published body is its pack text plus its addendum.
 */
const MIN_STORY_WORDS = 550;
const MIN_OPINION_WORDS = 450;
const MIN_ANSWER_WORDS = 220;

const problems: string[] = [];
const fail = (message: string) => problems.push(message);
const words = (text: string | undefined | null) => (text ?? '').split(/\s+/).filter(Boolean).length;
const isHttps = (url: string | null | undefined) => typeof url === 'string' && /^https:\/\/[^\s]+$/.test(url);

// --- Stories -------------------------------------------------------------------
const ADDENDA: Record<string, { en: string; hi: string }> = { ...ADDENDA_A, ...ADDENDA_B };
const stories = [...CONTENT_PACK_D, ...CONTENT_PACK_A, ...CONTENT_PACK_B, ...CONTENT_PACK_C, ...CONTENT_PACK_OPINION];
const titles = new Set<string>();
const keys = new Set<string>();
const authorNames = new Set(AUTHORS.map((author) => author.name.en));
for (const story of stories) {
  const label = `story "${story.key}"`;
  if (titles.has(story.title)) fail(`${label}: duplicate title (pack records are matched by title)`);
  titles.add(story.title);
  if (keys.has(story.key)) fail(`${label}: duplicate key`);
  keys.add(story.key);
  const body = `${story.body}\n\n${ADDENDA[story.key]?.en ?? ''}`;
  const hiBody = `${story.hi.body ?? ''}\n\n${ADDENDA[story.key]?.hi ?? ''}`;
  const min = story.kind === 'Opinion' ? MIN_OPINION_WORDS : MIN_STORY_WORDS;
  if (words(body) < min) fail(`${label}: ${words(body)} words in English, needs at least ${min}`);
  if (!story.hi.title || !story.hi.dek || words(hiBody) < min * 0.8) fail(`${label}: Hindi edition missing or much shorter than the English (${words(hiBody)} words)`);
  if (!isHttps(story.sourceUrl)) fail(`${label}: sourceUrl must be an https link to the primary source`);
  if (!story.source.trim()) fail(`${label}: source name is empty`);
  if (story.dek.trim().length < 40) fail(`${label}: dek is shorter than 40 characters`);
  if (/(starter|placeholder|lorem ipsum|TODO|TBD|reporting needed)/i.test(`${story.title} ${story.dek} ${story.body}`)) fail(`${label}: contains placeholder text`);
  const byline = packByline(story);
  if (byline !== EDITORIAL_BOARD_BYLINE && !authorNames.has(byline)) fail(`${label}: byline "${byline}" is not a profiled author`);
}

// --- Authors: the API's desk map and the web profiles must agree ---------------
for (const [topic, author] of Object.entries(AUTHOR_BY_TOPIC)) {
  const profile = AUTHORS.find((item) => item.slug === author.slug);
  if (!profile) fail(`author for "${topic}": no web profile with slug "${author.slug}"`);
  else if (profile.name.en !== author.name) fail(`author for "${topic}": API name "${author.name}" differs from profile "${profile.name.en}"`);
}

// --- Answers --------------------------------------------------------------------
const answerIds = new Set(ANSWERS.map((answer) => answer.id));
for (const answer of ANSWERS) {
  const label = `answer "${answer.id}"`;
  const depth = ANSWER_DEPTH[answer.id];
  if (!depth) { fail(`${label}: no entry in answers-depth.ts`); continue; }
  const en = [answer.short.en, answer.truth.en, ...answer.steps.en, depth.law.en, ...depth.mistakes.en].join(' ');
  if (words(en) < MIN_ANSWER_WORDS) fail(`${label}: ${words(en)} words, needs at least ${MIN_ANSWER_WORDS}`);
  if (!depth.law.hi || depth.mistakes.hi.length !== depth.mistakes.en.length || answer.steps.hi.length !== answer.steps.en.length) fail(`${label}: Hindi text missing or out of step with the English`);
  if (!answer.sources.length || !answer.sources.every((source) => isHttps(source.url))) fail(`${label}: needs at least one https official source`);
  for (const related of answer.related ?? []) if (!answerIds.has(related)) fail(`${label}: related answer "${related}" does not exist`);
}
for (const id of Object.keys(ANSWER_DEPTH)) if (!answerIds.has(id)) fail(`answers-depth.ts: "${id}" is not an answer`);

// The API keeps its own list of answer URLs for the sitemap.
const publication = readFileSync(new URL('../artifacts/api-server/src/routes/publication.ts', import.meta.url), 'utf8');
const sitemapIds = new Set([...(publication.match(/SITEMAP_ANSWER_IDS = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/"([^"]+)"/g)].map((match) => match[1]));
for (const id of answerIds) if (!sitemapIds.has(id)) fail(`sitemap: answer "${id}" is missing from SITEMAP_ANSWER_IDS in publication.ts`);
for (const id of sitemapIds) if (!answerIds.has(id)) fail(`sitemap: SITEMAP_ANSWER_IDS lists "${id}", which is not an answer`);

// The API's sitemap lists exactly the state pages that are indexable (those with a profile).
const sitemapStates = new Set([...(publication.match(/SITEMAP_STATE_SLUGS = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/"([^"]+)"/g)].map((match) => match[1]));
const profiledStates = new Set(REGIONS.filter((region) => STATE_PROFILES[region.name]).map((region) => regionSlug(region.name)));
for (const slug of profiledStates) if (!sitemapStates.has(slug)) fail(`sitemap: profiled state "${slug}" is missing from SITEMAP_STATE_SLUGS in publication.ts`);
for (const slug of sitemapStates) if (!profiledStates.has(slug)) fail(`sitemap: SITEMAP_STATE_SLUGS lists "${slug}", which has no state profile (its page is noindex)`);
for (const [name, profile] of Object.entries(STATE_PROFILES)) {
  // Some official gazettes (e.g. Manipur's) are served only over http, so http is accepted here.
  for (const fact of profile.facts) if (fact.source && !/^https?:\/\/[^\s]+$/.test(fact.source.url)) fail(`state "${name}": fact source must be a full http(s) link`);
}

// --- Policy ledger ----------------------------------------------------------------
const packSlugs = new Set(POLICY_LEDGER_PACK.map((record) => record.slug));
for (const slug of Object.keys(POLICY_NOTES)) {
  // The EWS record predates the pack (it comes from the seed); every other note must match a pack record.
  if (!packSlugs.has(slug) && slug !== '103rd-constitutional-amendment-ews-reservation') fail(`policy-notes.ts: "${slug}" is not a policy-ledger record`);
}
for (const slug of packSlugs) if (!POLICY_NOTES[slug]) fail(`policy "${slug}": no analysis in policy-notes.ts`);
for (const [slug, note] of Object.entries(POLICY_NOTES)) {
  if (words(note.why.en) < 60 || !note.why.hi || note.questions.length < 3) fail(`policy "${slug}": analysis is too thin (needs 60+ words and 3 questions, in both languages)`);
}

// --- Dated updates -----------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const validDate = (on: string) => /^\d{4}-\d{2}-\d{2}$/.test(on) && !Number.isNaN(Date.parse(on)) && on <= today;
for (const update of STORY_UPDATES) {
  const label = `story update ${update.key} ${update.on}`;
  if (!keys.has(update.key)) fail(`${label}: no pack story with that key`);
  if (!validDate(update.on)) fail(`${label}: date must be YYYY-MM-DD and not in the future`);
  if (!isHttps(update.sourceUrl)) fail(`${label}: needs an https primary source`);
  if (words(update.en) < 40 || words(update.hi) < 30) fail(`${label}: update text missing or too short in English or Hindi`);
}
const policySlugs = new Set([...packSlugs, '103rd-constitutional-amendment-ews-reservation']);
for (const update of POLICY_UPDATES) {
  const label = `policy update ${update.slug} ${update.on}`;
  if (!policySlugs.has(update.slug)) fail(`${label}: no policy record with that slug`);
  if (!validDate(update.on)) fail(`${label}: date must be YYYY-MM-DD and not in the future`);
  if (!isHttps(update.sourceUrl)) fail(`${label}: needs an https primary source`);
  if (!update.courtStatus.trim() || !update.courtStatusHi.trim()) fail(`${label}: court status missing in English or Hindi`);
}

// --- Report ------------------------------------------------------------------------
if (problems.length) {
  console.error(`Content check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Content check passed: ${stories.length} stories, ${ANSWERS.length} answers, ${Object.keys(POLICY_NOTES).length} policy analyses, ${AUTHORS.length} authors.`);
