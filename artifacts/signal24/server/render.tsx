/**
 * Server-side rendering of every public URL: the right status code, the same
 * <head> tags the app sets (via the shared modules in src/lib), and the page's
 * actual content as HTML, so search engines can index a page without running
 * JavaScript. The React app replaces this markup when it starts.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import type {
  ArchiveResult,
  CommunityPostDetail,
  CommunityPostList,
  CurrentIssue,
  EvidenceEventResponse,
  EvidenceEventsResponse,
  PolicyListResult,
  PolicyRecord,
  SourceDocumentResponse,
  Story,
} from '@workspace/api-client-react';
import { RichBody, plainText } from '../src/components/rich-body';
import { ANSWERS, ANSWER_CATEGORIES, answerById } from '../src/lib/answers';
import { AUTHORS, authorByName, authorBySlug, authorMeta, authorPath, type Author } from '../src/lib/authors';
import { localizePolicy, localizeStory, translateLabel, type LocalizedStory } from '../src/lib/i18n';
import { PAGE_META, type PageKey } from '../src/lib/page-meta';
import { localizePath, setActiveLang, stripLangPrefix, type Lang, type SeoConfig } from '../src/lib/seo';
import { REGIONS, regionBySlug, regionSlug, STATE_PROFILES, stateMeta, storyConcerns } from '../src/lib/states';
import { storyPath, storySeo } from '../src/lib/stories';
import { authorPageStructuredData } from '../src/lib/structured-data';
import { TOPIC_BRIEFS, topicBrief } from '../src/lib/topic-briefs';
import { ApiReader } from './api';
import { buildHead, esc, type PageHtml } from './html';

export type RenderResult =
  | { kind: 'page'; status: number; page: PageHtml }
  | { kind: 'redirect'; status: 301; location: string };

type Seo = SeoConfig;
type Page = { status?: number; seo: Seo; body: string };
type Ctx = { lang: Lang; path: string; api: ApiReader };

const ARCHIVE_PARAMS = { limit: 100 } as const;
const STORY_FAMILIES = new Set(['articles', 'cases', 'documents', 'states', 'data', 'policies']);
const DESKS = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'];

const tr = (lang: Lang, en: string, hi: string) => (lang === 'hi' ? hi : en);
const meta = (key: PageKey, lang: Lang) => ({ title: PAGE_META[key].title[lang], description: PAGE_META[key].description[lang] });

function href(target: string, lang: Lang) {
  return localizePath(target, lang);
}

function link(target: string, text: string, lang: Lang, attrs = '') {
  return `<a href="${esc(href(target, lang))}"${attrs}>${esc(text)}</a>`;
}

function formatDate(value: string | null | undefined, lang: Lang) {
  if (!value) return '';
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

function time(value: string | null | undefined, lang: Lang) {
  const text = formatDate(value, lang);
  return text ? `<time datetime="${esc(value)}">${esc(text)}</time>` : '';
}

// ---------------------------------------------------------------------------
// Shared page chrome

const NAV: Array<[string, string, string]> = [
  ['/', 'Latest', 'ताज़ा'],
  ['/topics', 'Topics', 'विषय'],
  ['/states', 'States', 'राज्य'],
  ['/policies', 'Policy ledger', 'नीति रजिस्टर'],
  ['/data', 'Data', 'आंकड़े'],
  ['/opinion', 'Opinion', 'राय'],
  ['/answers', 'Answers', 'जवाब'],
  ['/community', 'Community', 'समुदाय'],
];

const FOOTER: Array<[string, string, string]> = [
  ['/archive', 'Archive', 'अभिलेखागार'],
  ['/timeline', 'Timeline', 'समयरेखा'],
  ['/events', 'Evidence events', 'सबूत और घटनाएँ'],
  ['/about', 'About us', 'हमारे बारे में'],
  ['/editorial-standards', 'Editorial standards', 'संपादकीय मानक'],
  ['/methodology', 'Methodology', 'कार्यप्रणाली'],
  ['/authors/signal-24', 'The editorial desk', 'संपादकीय डेस्क'],
];

function chrome(ctx: Ctx, main: string) {
  const { lang, path } = ctx;
  const other: Lang = lang === 'hi' ? 'en' : 'hi';
  const nav = NAV.map(([target, en, hi]) => `<li>${link(target, tr(lang, en, hi), lang)}</li>`).join('');
  const foot = FOOTER.map(([target, en, hi]) => `<li>${link(target, tr(lang, en, hi), lang)}</li>`).join('');
  return `<div class="ssr-page">
<header class="ssr-header"><a class="ssr-brand" href="${esc(href('/', lang))}">The Signal 24</a><nav aria-label="${esc(tr(lang, 'Sections', 'खंड'))}"><ul>${nav}</ul></nav><a class="ssr-lang" href="${esc(localizePath(path, other))}" hreflang="${other === 'hi' ? 'hi-IN' : 'en-IN'}" lang="${other}">${other === 'hi' ? 'हिंदी' : 'English'}</a></header>
<main class="ssr-main" id="main">${main}</main>
<footer class="ssr-footer"><p>${esc(tr(lang, 'Power, on the record. A public-interest newsroom that reads what India’s governments publish and notices what they don’t.', 'सत्ता, दस्तावेज़ों के आईने में। एक जनहित न्यूज़रूम, जो पढ़ता है कि भारत की सरकारें क्या प्रकाशित करती हैं और देखता है कि क्या नहीं करतीं।'))}</p><ul>${foot}</ul></footer>
</div>`;
}

function storyItem(story: LocalizedStory, lang: Lang) {
  const author = authorByName(story.byline);
  const byline = author ? link(authorPath(author), author.name[lang], lang, ' rel="author"') : esc(translateLabel(story.byline, lang));
  return `<li class="ssr-item"><p class="ssr-kicker">${esc(translateLabel(story.topic, lang))} / ${esc(translateLabel(story.kind, lang))}</p><h3 lang="${story.contentLang}">${link(storyPath(story), story.title, lang)}</h3><p lang="${story.contentLang}">${esc(story.dek)}</p><p class="ssr-meta">${[byline, time(story.publishedOn ?? story.recordDate, lang)].filter(Boolean).join(' · ')}</p></li>`;
}

function storyList(stories: LocalizedStory[], lang: Lang) {
  return stories.length ? `<ul class="ssr-list">${stories.map((story) => storyItem(story, lang)).join('')}</ul>` : '';
}

function head(lang: Lang, kicker: string, title: string, intro?: string) {
  return `<p class="ssr-kicker">${esc(kicker)}</p><h1>${esc(title)}</h1>${intro ? `<p class="ssr-lede">${esc(intro)}</p>` : ''}`;
}

// ---------------------------------------------------------------------------
// Data

async function publishedStories(ctx: Ctx) {
  const archive = await ctx.api.getPrimed<ArchiveResult>('/api/archive?limit=100', ['/api/archive', ARCHIVE_PARAMS]);
  return (archive?.stories ?? [])
    .filter((story) => story.workflowStatus === 'published')
    .map((story) => localizeStory(story, ctx.lang));
}

function newestFirst(stories: LocalizedStory[]) {
  return [...stories].sort((a, b) => (b.publishedOn ?? b.recordDate ?? '').localeCompare(a.publishedOn ?? a.recordDate ?? ''));
}

async function policyRecords(ctx: Ctx) {
  const list = await ctx.api.getPrimed<PolicyListResult>('/api/policies?limit=100', ['/api/policies', ARCHIVE_PARAMS]);
  return (list?.records ?? []).map((record) => localizePolicy(record, ctx.lang));
}

// ---------------------------------------------------------------------------
// Pages

async function homePage(ctx: Ctx): Promise<Page> {
  const { lang } = ctx;
  await ctx.api.getPrimed<CurrentIssue>('/api/issues/current', ['/api/issues/current']);
  const stories = newestFirst(await publishedStories(ctx));
  const reporting = stories.filter((story) => story.kind !== 'Opinion');
  const opinion = stories.filter((story) => story.kind === 'Opinion');
  const m = meta('home', lang);
  const answers = ANSWERS.slice(0, 8).map((answer) => `<li>${link(`/answers/${answer.id}`, answer.question[lang], lang)}</li>`).join('');
  const states = REGIONS.filter((region) => STATE_PROFILES[region.name]).map((region) => `<li>${link(`/state/${regionSlug(region.name)}`, lang === 'hi' ? region.hi : region.name, lang)}</li>`).join('');
  return {
    seo: { title: m.title, description: m.description, canonicalPath: '/' },
    body: `${head(lang, tr(lang, 'Power, on the record', 'सत्ता, दस्तावेज़ों के आईने में'), m.title, m.description)}
<section><h2>${esc(tr(lang, 'Latest reporting', 'ताज़ा रिपोर्टिंग'))}</h2>${storyList(reporting.slice(0, 12), lang)}</section>
${opinion.length ? `<section><h2>${esc(tr(lang, 'Opinion', 'राय'))}</h2>${storyList(opinion.slice(0, 3), lang)}</section>` : ''}
<section><h2>${esc(tr(lang, 'Answers: ask the state', 'जवाब: सरकार से पूछिए'))}</h2><ul class="ssr-links">${answers}</ul></section>
<section><h2>${esc(tr(lang, 'State by state', 'राज्य-दर-राज्य'))}</h2><ul class="ssr-links">${states}</ul></section>
${authorsSection(lang)}`,
  };
}

function authorsSection(lang: Lang, exclude?: string) {
  const people = AUTHORS.filter((author) => author.slug !== exclude);
  return `<section><h2>${esc(tr(lang, 'Who writes here', 'यहाँ कौन लिखता है'))}</h2><ul class="ssr-list">${people.map((author) => `<li class="ssr-item"><h3>${link(authorPath(author), author.name[lang], lang)}</h3><p class="ssr-kicker">${esc(author.role[lang])}</p><p>${esc(author.beat[lang])}</p></li>`).join('')}</ul></section>`;
}

async function listingPage(ctx: Ctx, key: PageKey, path: string, pick: (stories: LocalizedStory[]) => LocalizedStory[]): Promise<Page> {
  const stories = pick(newestFirst(await publishedStories(ctx)));
  const m = meta(key, ctx.lang);
  return {
    seo: { title: m.title, description: m.description, canonicalPath: path },
    body: `${head(ctx.lang, 'The Signal 24', m.title, m.description)}${storyList(stories, ctx.lang)}`,
  };
}

async function storyPage(ctx: Ctx, storyId: number, requestedPath: string): Promise<Page | RenderResult> {
  const raw = await ctx.api.getPrimed<Story>(`/api/stories/${storyId}`, [`/api/stories/${storyId}`]);
  if (!raw) return notFound(ctx);
  const story = localizeStory(raw, ctx.lang);
  const canonical = storyPath(story);
  if (canonical !== requestedPath) return redirect(canonical, ctx.lang);
  setActiveLang(ctx.lang);
  const seo = storySeo(story, ctx.lang);
  const lang = ctx.lang;
  const author = authorByName(story.byline);
  const byline = author
    ? link(authorPath(author), author.name[lang], lang, ' rel="author"')
    : esc(translateLabel(story.byline, lang) || (story.kind === 'Opinion' ? tr(lang, 'The Signal 24 editorial board', 'द सिग्नल 24 संपादकीय बोर्ड') : tr(lang, 'The Signal 24 editorial desk', 'द सिग्नल 24 संपादकीय डेस्क')));
  const related = newestFirst(await publishedStories(ctx)).filter((item) => item.id !== story.id && item.topic === story.topic).slice(0, 3);
  const body = renderToStaticMarkup(<RichBody body={story.body} />);
  const source = story.sourceUrl
    ? `<p class="ssr-source">${esc(tr(lang, 'Primary source', 'मूल स्रोत'))}: <a href="${esc(story.sourceUrl)}" rel="noopener noreferrer">${esc(story.source || story.sourceUrl)}</a>${story.sourcePublishedOn ? ` (${time(story.sourcePublishedOn, lang)})` : ''}</p>`
    : '';
  return {
    seo,
    body: `<article class="ssr-article" lang="${story.contentLang}">
<nav class="ssr-crumbs" aria-label="${esc(tr(lang, 'Breadcrumb', 'ब्रेडक्रंब'))}">${link('/archive', tr(lang, 'Archive', 'अभिलेखागार'), lang)} / ${link(`/topics/${encodeURIComponent(story.topic)}`, translateLabel(story.topic, lang), lang)}</nav>
<h1>${esc(story.title)}</h1>
<p class="ssr-lede">${esc(story.dek)}</p>
<p class="ssr-meta">${esc(tr(lang, 'By', 'लेखक:'))} ${byline} · ${time(story.publishedOn ?? story.recordDate, lang)} · ${esc(tr(lang, `${story.read} min read`, `${story.read} मिनट`))} · ${esc(translateLabel(story.verificationStatus, lang))}</p>
${source}
<div class="ssr-body">${body}</div>
${story.correctionNote ? `<p class="ssr-note"><strong>${esc(tr(lang, 'Correction', 'सुधार'))}:</strong> ${esc(story.correctionNote)}</p>` : ''}
${story.aiDisclosure ? `<p class="ssr-note">${esc(story.aiDisclosure)}</p>` : ''}
</article>
${related.length ? `<section><h2>${esc(tr(lang, 'Keep reading', 'आगे पढ़िए'))}</h2>${storyList(related, lang)}</section>` : ''}`,
  };
}

async function policiesPage(ctx: Ctx): Promise<Page> {
  const { lang } = ctx;
  const records = await policyRecords(ctx);
  const m = meta('policies', lang);
  const items = records.map((record) => `<li class="ssr-item"><p class="ssr-kicker">${esc(translateLabel(record.status, lang))} · ${esc(translateLabel(record.state ?? 'National', lang))}</p><h3 lang="${record.contentLang}">${link(record.canonicalPath, record.title, lang)}</h3><p lang="${record.contentLang}">${esc(record.summary)}</p></li>`).join('');
  return {
    seo: { title: m.title, description: m.description, canonicalPath: '/policies' },
    body: `${head(lang, 'The Signal 24', m.title, m.description)}<ul class="ssr-list">${items}</ul>`,
  };
}

async function policyPage(ctx: Ctx, slug: string, requestedPath: string): Promise<Page | RenderResult> {
  const { lang } = ctx;
  const raw = await ctx.api.getPrimed<PolicyRecord>(`/api/policies/${encodeURIComponent(slug)}`, [`/api/policies/${slug}`]);
  if (!raw) {
    // Court explainers once lived at /policies/<title>-<id>; send them to their article.
    const legacyId = Number(slug.match(/-(\d+)$/)?.[1]);
    if (Number.isInteger(legacyId) && legacyId > 0) {
      const story = await ctx.api.get<Story>(`/api/stories/${legacyId}`);
      if (story && storyPath(story) !== requestedPath) return redirect(storyPath(story), lang);
    }
    return notFound(ctx);
  }
  const record = localizePolicy(raw, lang);
  const rows: Array<[string, string, string | null | undefined]> = [
    ['Authority', 'प्राधिकरण', record.authority],
    ['Sector', 'क्षेत्र', record.sector],
    ['Before', 'पहले', record.previousFramework],
    ['After', 'बाद में', record.newFramework],
    ['Legal basis', 'क़ानूनी आधार', record.legalBasis],
    ['In court', 'अदालत में', record.courtStatus],
    ['Effective', 'लागू', formatDate(record.effectiveDate, lang)],
  ];
  const sources = record.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.title)}</a>${source.publisher ? ` · ${esc(source.publisher)}` : ''}</li>`).join('');
  return {
    seo: {
      title: `${record.title} — The Signal 24`,
      description: record.summary,
      canonicalPath: record.canonicalPath,
      robots: 'index, follow',
      translated: record.isTranslated,
      type: 'article',
    },
    body: `<article class="ssr-article" lang="${record.contentLang}">
<nav class="ssr-crumbs">${link('/policies', tr(lang, 'Policy ledger', 'नीति रजिस्टर'), lang)}</nav>
<p class="ssr-kicker">${esc(translateLabel(record.status, lang))} · ${esc(translateLabel(record.state ?? 'National', lang))}</p>
<h1>${esc(record.title)}</h1>
<p class="ssr-lede">${esc(record.summary)}</p>
<dl class="ssr-facts">${rows.filter(([, , value]) => value).map(([en, hi, value]) => `<dt>${esc(tr(lang, en, hi))}</dt><dd>${esc(value)}</dd>`).join('')}</dl>
${sources ? `<h2>${esc(tr(lang, 'Sources', 'स्रोत'))}</h2><ul>${sources}</ul>` : ''}
</article>`,
  };
}

async function topicsPage(ctx: Ctx): Promise<Page> {
  const { lang } = ctx;
  const m = meta('topics', lang);
  const desks = DESKS.map((desk) => {
    const brief = topicBrief(desk);
    return `<li class="ssr-item"><h2>${link(`/topics/${encodeURIComponent(desk)}`, translateLabel(desk, lang), lang)}</h2>${brief ? `<p>${esc(brief.standfirst[lang])}</p>` : ''}</li>`;
  }).join('');
  return {
    seo: { title: m.title, description: m.description, canonicalPath: '/topics' },
    body: `${head(lang, 'The Signal 24', m.title, m.description)}<ul class="ssr-list">${desks}<li class="ssr-item"><h2>${link('/topics/open-category-competition', tr(lang, 'Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा'), lang)}</h2><p>${esc(TOPIC_BRIEFS['open-category-competition'].standfirst[lang])}</p></li></ul>`,
  };
}

async function topicPage(ctx: Ctx, slug: string): Promise<Page | RenderResult> {
  const { lang } = ctx;
  let topic: string;
  try {
    topic = decodeURIComponent(slug);
  } catch {
    return notFound(ctx);
  }
  const brief = topicBrief(topic);
  if (!brief) return notFound(ctx);
  const records = newestFirst(await publishedStories(ctx)).filter((story) => story.topic === topic);
  const name = `${translateLabel(topic, lang) || tr(lang, 'Topic', 'विषय')} — ${tr(lang, 'The Signal 24', 'द सिग्नल 24')}`;
  return {
    seo: { title: name, description: brief.standfirst[lang], canonicalPath: `/topics/${slug}` },
    body: `${head(lang, tr(lang, 'Topic file', 'विषय फ़ाइल'), translateLabel(topic, lang), brief.standfirst[lang])}${storyList(records, lang)}`,
  };
}

async function openCategoryPage(ctx: Ctx): Promise<Page> {
  const { lang } = ctx;
  const m = meta('openCategory', lang);
  const brief = TOPIC_BRIEFS['open-category-competition'];
  const records = newestFirst(await publishedStories(ctx)).filter((story) => story.verificationStatus !== 'unverified' && /\b(open|unreserved|general.?category|ugc|ews|economically weaker sections)\b/i.test(`${story.title} ${story.dek} ${story.source}`));
  return {
    seo: { title: m.title, description: m.description, canonicalPath: '/topics/open-category-competition' },
    body: `${head(lang, tr(lang, 'Topic file', 'विषय फ़ाइल'), m.title, brief.standfirst[lang])}${storyList(records, lang)}`,
  };
}

async function eventsPage(ctx: Ctx, key: 'events' | 'timeline'): Promise<Page> {
  const { lang } = ctx;
  const m = meta(key, lang);
  const data = await ctx.api.get<EvidenceEventsResponse>('/api/events?limit=100');
  const events = [...(data?.events ?? [])].sort((a, b) => (b.event.recordDate ?? '').localeCompare(a.event.recordDate ?? ''));
  const items = events.map(({ event }) => `<li class="ssr-item"><p class="ssr-meta">${time(event.recordDate, lang)}</p><h3 lang="en">${link(`/events/${event.id}`, event.title, lang)}</h3><p lang="en">${esc(event.summary)}</p></li>`).join('');
  return {
    seo: { title: m.title, description: m.description, canonicalPath: key === 'events' ? '/events' : '/timeline' },
    body: `${head(lang, 'The Signal 24', m.title, m.description)}<ol class="ssr-list">${items}</ol>`,
  };
}

async function eventPage(ctx: Ctx, id: number): Promise<Page | RenderResult> {
  const { lang } = ctx;
  const data = await ctx.api.get<EvidenceEventResponse>(`/api/events/${id}`);
  if (!data) return notFound(ctx);
  const detail = data.event;
  const stories = await publishedStories(ctx);
  const articleHref = (articleId: number, fallback: string) => {
    const story = stories.find((item) => item.id === articleId);
    return story ? storyPath(story) : fallback;
  };
  const sources = [...detail.primarySources, ...detail.secondarySources].map((source) => `<li>${source.sourceUrl ? `<a href="${esc(source.sourceUrl)}" rel="noopener noreferrer">${esc(source.title)}</a>` : esc(source.title)} · ${esc(source.publisher)} · ${link(`/sources/${source.id}`, tr(lang, 'source record', 'स्रोत रिकॉर्ड'), lang)}</li>`).join('');
  const articles = detail.articles.map((article) => `<li>${link(articleHref(article.id, article.canonicalPath), article.title, lang)}</li>`).join('');
  return {
    seo: {
      title: `${detail.event.title} — The Signal 24`,
      description: detail.event.summary || 'A published event record with explicitly linked articles and source documents.',
      canonicalPath: `/events/${id}`,
      translated: false,
      robots: 'index, follow',
    },
    body: `<article class="ssr-article" lang="en"><nav class="ssr-crumbs">${link('/events', tr(lang, 'Events and evidence', 'घटनाएँ और सबूत'), lang)}</nav><p class="ssr-meta">${time(detail.event.recordDate, lang)}</p><h1>${esc(detail.event.title)}</h1><p class="ssr-lede">${esc(detail.event.summary)}</p>${sources ? `<h2>${esc(tr(lang, 'Sources', 'स्रोत'))}</h2><ul>${sources}</ul>` : ''}${articles ? `<h2>${esc(tr(lang, 'Reporting', 'रिपोर्टिंग'))}</h2><ul>${articles}</ul>` : ''}</article>`,
  };
}

async function sourcePage(ctx: Ctx, id: number): Promise<Page | RenderResult> {
  const { lang } = ctx;
  const data = await ctx.api.get<SourceDocumentResponse>(`/api/sources/${id}`);
  if (!data) return notFound(ctx);
  const source = data.sourceDocument;
  const events = data.supportingEvents.map(({ event }) => `<li>${link(`/events/${event.id}`, event.title, lang)}</li>`).join('');
  return {
    seo: {
      title: `${source.title} — The Signal 24`,
      description: `${source.publisher} source document record with publication metadata and explicit event/article links.`,
      canonicalPath: `/sources/${id}`,
      translated: false,
      robots: 'index, follow',
    },
    body: `<article class="ssr-article" lang="en"><p class="ssr-kicker">${esc(source.publisher)}${source.publicationDate ? ` · ${time(source.publicationDate, lang)}` : ''}</p><h1>${esc(source.title)}</h1>${source.sourceUrl ? `<p><a href="${esc(source.sourceUrl)}" rel="noopener noreferrer">${esc(source.sourceUrl)}</a></p>` : ''}${events ? `<h2>${esc(tr(lang, 'Events this source supports', 'घटनाएँ जिनका यह स्रोत समर्थन करता है'))}</h2><ul>${events}</ul>` : ''}</article>`,
  };
}

function answersPage(ctx: Ctx): Page {
  const { lang } = ctx;
  const m = meta('answers', lang);
  const groups = ANSWER_CATEGORIES.map((category) => {
    const items = ANSWERS.filter((answer) => answer.category === category.id).map((answer) => `<li class="ssr-item"><h3>${link(`/answers/${answer.id}`, answer.question[lang], lang)}</h3><p>${esc(answer.short[lang])}</p></li>`).join('');
    return `<section><h2>${esc(category.label[lang])}</h2><p>${esc(category.blurb[lang])}</p><ul class="ssr-list">${items}</ul></section>`;
  }).join('');
  return { seo: { title: m.title, description: m.description, canonicalPath: '/answers' }, body: `${head(lang, 'The Signal 24', m.title, m.description)}${groups}` };
}

function answerPage(ctx: Ctx, id: string): Page | RenderResult {
  const { lang } = ctx;
  const answer = answerById(id);
  if (!answer || !ANSWER_CATEGORIES.some((item) => item.id === answer.category)) return notFound(ctx);
  const path = `/answers/${id}`;
  const name = `${answer.question[lang]} — ${tr(lang, 'The Signal 24', 'द सिग्नल 24')}`;
  const related = (answer.related ?? []).map(answerById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return {
    seo: { title: name, description: answer.short[lang], canonicalPath: path, robots: 'index, follow' },
    body: `<article class="ssr-article"><nav class="ssr-crumbs">${link('/answers', tr(lang, 'Answers', 'जवाब'), lang)}</nav><h1>${esc(answer.question[lang])}</h1><p class="ssr-lede">${esc(answer.short[lang])}</p><h2>${esc(tr(lang, 'The hard truth', 'कड़वा सच'))}</h2><p>${esc(answer.truth[lang])}</p><h2>${esc(tr(lang, 'What you can do', 'आप क्या कर सकते हैं'))}</h2><ol>${answer.steps[lang].map((step) => `<li>${esc(step)}</li>`).join('')}</ol><h2>${esc(tr(lang, 'Official sources', 'आधिकारिक स्रोत'))}</h2><ul>${answer.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.name)}</a></li>`).join('')}</ul>${related.length ? `<h2>${esc(tr(lang, 'Related answers', 'जुड़े जवाब'))}</h2><ul>${related.map((item) => `<li>${link(`/answers/${item.id}`, item.question[lang], lang)}</li>`).join('')}</ul>` : ''}</article>`,
  };
}

function statesPage(ctx: Ctx): Page {
  const { lang } = ctx;
  const m = meta('states', lang);
  const items = REGIONS.map((region) => {
    const profile = STATE_PROFILES[region.name];
    return `<li class="ssr-item"><h3>${link(`/state/${regionSlug(region.name)}`, lang === 'hi' ? region.hi : region.name, lang)}</h3>${profile ? `<p>${esc(profile.summary[lang])}</p>` : ''}</li>`;
  }).join('');
  return { seo: { title: m.title, description: m.description, canonicalPath: '/states' }, body: `${head(lang, 'The Signal 24', m.title, m.description)}<ul class="ssr-list">${items}</ul>` };
}

async function statePage(ctx: Ctx, slug: string): Promise<Page | RenderResult> {
  const { lang } = ctx;
  const region = regionBySlug(slug);
  if (!region) return notFound(ctx);
  const records = newestFirst(await publishedStories(ctx)).filter((story) => storyConcerns(story, region));
  const sm = stateMeta(region, records.length > 0, lang);
  const profile = STATE_PROFILES[region.name];
  const facts = profile ? `<h2>${esc(tr(lang, 'The record', 'रिकॉर्ड'))}</h2><ul>${profile.facts.map((fact) => `<li><strong>${esc(fact.when)}</strong> — ${esc(fact.text[lang])}</li>`).join('')}</ul><h2>${esc(tr(lang, 'Questions for the state', 'राज्य से सवाल'))}</h2><ul>${profile.questions.map((question) => `<li>${esc(question[lang])}</li>`).join('')}</ul>` : '';
  return {
    seo: { title: sm.title, description: sm.description, canonicalPath: `/state/${slug}`, robots: sm.robots },
    body: `<nav class="ssr-crumbs">${link('/states', tr(lang, 'States', 'राज्य'), lang)}</nav>${head(lang, profile ? profile.status[lang] : tr(lang, 'State file', 'राज्य फ़ाइल'), sm.name, sm.description)}${facts}${records.length ? `<h2>${esc(tr(lang, 'Records', 'रिकॉर्ड'))}</h2>${storyList(records, lang)}` : ''}`,
  };
}

async function communityPage(ctx: Ctx): Promise<Page> {
  const { lang } = ctx;
  const m = meta('community', lang);
  const list = await ctx.api.get<CommunityPostList>('/api/community/posts?sort=trending&limit=20');
  const posts = (list?.posts ?? []).map((post) => `<li class="ssr-item"><h3>${link(`/community/${post.id}`, post.title, lang)}</h3><p class="ssr-meta">${esc(post.authorName)} · ${esc(tr(lang, `${post.replyCount} answers`, `${post.replyCount} जवाब`))}</p></li>`).join('');
  return {
    seo: { title: m.title, description: m.description, canonicalPath: '/community' },
    body: `${head(lang, 'The Signal 24', m.title, m.description)}${posts ? `<ul class="ssr-list">${posts}</ul>` : ''}`,
  };
}

async function communityPostPage(ctx: Ctx, id: number): Promise<Page | RenderResult> {
  const { lang } = ctx;
  const data = await ctx.api.get<CommunityPostDetail>(`/api/community/posts/${id}`);
  if (!data) return notFound(ctx);
  const { post } = data;
  return {
    // Participant posts are visible to readers but kept out of search indexes.
    seo: { title: `${post.title} — ${tr(lang, 'The Signal 24 community', 'द सिग्नल 24 समुदाय')}`, description: post.body.slice(0, 160), canonicalPath: `/community/${id}`, robots: 'noindex, follow' },
    body: `<article class="ssr-article"><nav class="ssr-crumbs">${link('/community', tr(lang, 'Community', 'समुदाय'), lang)}</nav><h1>${esc(post.title)}</h1><p class="ssr-meta">${esc(post.authorName)}</p><p>${esc(post.body)}</p></article>`,
  };
}

function editorialDeskPage(ctx: Ctx): Page {
  const { lang } = ctx;
  const m = meta('editorialDesk', lang);
  return { seo: { title: m.title, description: m.description, canonicalPath: '/authors/signal-24' }, body: `${head(lang, tr(lang, 'The Signal 24 / editorial desk', 'द सिग्नल 24 / संपादकीय डेस्क'), m.title, m.description)}${authorsSection(lang)}` };
}

async function authorPage(ctx: Ctx, author: Author): Promise<Page> {
  const { lang } = ctx;
  const records = newestFirst(await publishedStories(ctx)).filter((story) => story.byline === author.name.en);
  const am = authorMeta(author, lang);
  return {
    seo: { title: am.title, description: am.description, canonicalPath: authorPath(author), type: 'profile', structuredData: authorPageStructuredData(author, lang) },
    body: `<nav class="ssr-crumbs">${link('/about', tr(lang, 'About', 'परिचय'), lang)}</nav>${head(lang, author.role[lang], author.name[lang], author.beat[lang])}<section><h2>${esc(tr(lang, 'About', 'परिचय'))}</h2><p>${esc(author.bio[lang])}</p><h2>${esc(tr(lang, 'Before a record goes out under this name', 'इस नाम से रिकॉर्ड छपने से पहले'))}</h2><p>${esc(author.method[lang])}</p></section><section><h2>${esc(tr(lang, 'On the record', 'रिकॉर्ड पर'))}</h2>${storyList(records, lang)}</section>${authorsSection(lang, author.slug)}`,
  };
}

function infoPage(ctx: Ctx, key: 'about' | 'standards' | 'methodology', path: string): Page {
  const { lang } = ctx;
  const m = meta(key, lang);
  return { seo: { title: m.title, description: m.description, canonicalPath: path }, body: `${head(lang, 'The Signal 24', m.title, m.description)}${key === 'about' ? authorsSection(lang) : ''}` };
}

function utilityPage(ctx: Ctx, key: 'search' | 'evidenceSearch'): Page {
  const m = meta(key, ctx.lang);
  return { seo: { title: m.title, description: m.description, robots: 'noindex, follow' }, body: head(ctx.lang, 'The Signal 24', m.title, m.description) };
}

function privatePage(ctx: Ctx, title: string, description: string): Page {
  return { seo: { title, description, robots: 'noindex, nofollow' }, body: head(ctx.lang, 'The Signal 24', title) };
}

function notFound(ctx: Ctx): Page {
  const m = meta('notFound', ctx.lang);
  return {
    status: 404,
    seo: { title: m.title, description: m.description, robots: 'noindex, nofollow' },
    body: `${head(ctx.lang, '404', m.title, tr(ctx.lang, 'This page does not exist, or it has moved. The record usually has not.', 'यह पेज मौजूद नहीं है, या हट गया है। रिकॉर्ड आमतौर पर नहीं हटता।'))}<p>${link('/', tr(ctx.lang, 'Go to the front page', 'पहले पन्ने पर जाइए'), ctx.lang)} · ${link('/archive', tr(ctx.lang, 'Search the archive', 'अभिलेखागार खोजिए'), ctx.lang)}</p>`,
  };
}

function redirect(target: string, lang: Lang): RenderResult {
  return { kind: 'redirect', status: 301, location: localizePath(target, lang) };
}

// ---------------------------------------------------------------------------
// Routing (mirrors AppRoutes in src/App.tsx)

async function route(ctx: Ctx): Promise<Page | RenderResult> {
  const path = ctx.path;
  const parts = path.split('/').filter(Boolean);
  const id = (value: string | undefined) => (value && /^\d+$/.test(value) ? Number(value) : NaN);

  switch (path) {
    case '/': return homePage(ctx);
    case '/archive': return listingPage(ctx, 'archive', '/archive', (stories) => stories);
    case '/opinion': return listingPage(ctx, 'opinion', '/opinion', (stories) => stories.filter((story) => story.kind === 'Opinion'));
    case '/data': return listingPage(ctx, 'data', '/data', (stories) => stories.filter((story) => (story.recordFamily === 'data' || story.topic === 'Data & Notes') && story.verificationStatus !== 'unverified' && Boolean(story.sourceUrl)));
    case '/policies': return policiesPage(ctx);
    case '/topics': return topicsPage(ctx);
    case '/topics/open-category-competition': return openCategoryPage(ctx);
    case '/timeline': return eventsPage(ctx, 'timeline');
    case '/events': return eventsPage(ctx, 'events');
    case '/answers': return answersPage(ctx);
    case '/states': return statesPage(ctx);
    case '/community': return communityPage(ctx);
    case '/about': return infoPage(ctx, 'about', '/about');
    case '/editorial-standards': return infoPage(ctx, 'standards', '/editorial-standards');
    case '/methodology': return infoPage(ctx, 'methodology', '/methodology');
    case '/search': return utilityPage(ctx, 'search');
    case '/evidence/search': return utilityPage(ctx, 'evidenceSearch');
    case '/editor': return privatePage(ctx, 'Editorial desk — The Signal 24', 'Private editorial workspace for preparing source-aware records for The Signal 24.');
    case '/editor/evidence': return privatePage(ctx, 'Evidence graph — The Signal 24', 'Private editorial workspace for maintaining explicit article, event, and source relationships.');
    default: break;
  }
  if (parts[0] === 'sign-in' || parts[0] === 'sign-up') {
    return privatePage(ctx, parts[0] === 'sign-in' ? 'Editor sign in — The Signal 24' : 'Editor account — The Signal 24', 'Sign in to access the private editorial desk of The Signal 24.');
  }
  if (parts.length !== 2) return notFound(ctx);
  const [section, slug] = parts;
  switch (section) {
    case 'topics': return topicPage(ctx, slug);
    case 'answers': return answerPage(ctx, slug);
    case 'state': return statePage(ctx, slug);
    case 'policies': return policyPage(ctx, slug, path);
    case 'events': return Number.isFinite(id(slug)) && id(slug) > 0 ? eventPage(ctx, id(slug)) : notFound(ctx);
    case 'sources': return Number.isFinite(id(slug)) && id(slug) > 0 ? sourcePage(ctx, id(slug)) : notFound(ctx);
    case 'community': return Number.isFinite(id(slug)) && id(slug) > 0 ? communityPostPage(ctx, id(slug)) : notFound(ctx);
    case 'authors': {
      if (slug === 'signal-24') return editorialDeskPage(ctx);
      const author = authorBySlug(slug);
      return author ? authorPage(ctx, author) : notFound(ctx);
    }
    case 'stories': {
      const storyId = id(slug);
      return Number.isFinite(storyId) && storyId > 0 ? storyPage(ctx, storyId, path) : notFound(ctx);
    }
    default: {
      const storyId = Number(slug.match(/-(\d+)$/)?.[1]);
      if (!STORY_FAMILIES.has(section) || !Number.isInteger(storyId) || storyId <= 0) return notFound(ctx);
      return storyPage(ctx, storyId, path);
    }
  }
}

/** Render one request path (no query string). */
export async function renderPath(rawPath: string): Promise<RenderResult> {
  const lang: Lang = rawPath === '/hi' || rawPath.startsWith('/hi/') ? 'hi' : 'en';
  const path = stripLangPrefix(rawPath);
  const ctx: Ctx = { lang, path, api: new ApiReader() };
  const result = await route(ctx);
  if ('kind' in result) return result;
  setActiveLang(lang);
  const headHtml = buildHead({ ...result.seo, lang, path });
  return {
    kind: 'page',
    status: result.status ?? 200,
    page: { lang, head: headHtml, body: chrome(ctx, result.body), data: ctx.api.primed },
  };
}

export { plainText };
