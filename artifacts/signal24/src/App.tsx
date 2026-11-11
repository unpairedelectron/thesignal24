import { lazy, Suspense, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Heart,
  Link2,
  Menu,
  MessageCircle,
  MapPin,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams, useSearch } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { FOCUS_SOURCES } from '@/components/focus-source-desk';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  canonicalStateName,
  getRequestedStateFromSearch,
  getSelectedStateFromSearch,
  getMapFeatureName,
  getStateLinkedStories,
  getStateNames,
  getStoriesForState,
  getUnmappedStateNames,
  isMapSelectionKey,
  mapPath,
  parseStateMap,
  searchWithSelectedState,
  stateNameKey,
  toggleStateSelection,
  urlWithSelectedState,
  type MapFeature,
} from '@/lib/state-map';
import {
  getGetArchiveQueryKey,
  getGetDecisionImpactRevisionsQueryKey,
  getGetDecisionImpactRevisionsQueryOptions,
  getGetEditorialIssueQueryKey,
  getGetEditorSessionQueryKey,
  getGetCurrentIssueQueryKey,
  getGetEvidenceEventsQueryKey,
  getGetDecisionImpactsQueryKey,
  getGetLiveUpdatesQueryKey,
  getGetPoliciesQueryKey,
  getGetPolicyQueryKey,
  getGetStoryRevisionsQueryOptions,
  getGetStoryQueryKey,
  useCreateIssue,
  useCreateStory,
  useGetArchive,
  useGetCurrentIssue,
  useGetEvidenceEvents,
  useGetDecisionImpacts,
  useGetDecisionImpactRevisions,
  useGetEditorialIssue,
  useGetLiveUpdates,
  useGetPolicies,
  useGetPolicy,
  useGetStoryRevisions,
  useGetStory,
  getGetCommunityPostsQueryKey,
  getGetCommunityPostQueryKey,
  useGetCommunityPosts,
  useGetCommunityPost,
  useCreateCommunityPost,
  useCreateCommunityReply,
  useToggleCommunityPostLike,
  usePublishIssue,
  useSubscribeToNewsletter,
  useUpdateStory,
  useCreateDecisionImpact,
  useUpdateDecisionImpact,
  useGetEditorSession,
} from '@workspace/api-client-react';
import type { ArchiveResult, CommunityPost, CommunityReply, CommunityPostInput, CommunityPostKind, CommunityTopic, DecisionImpactArea, DecisionImpactEvidenceType, DecisionImpactInput, DecisionImpactRecord, DecisionImpactRevision, DecisionImpactWorkflowStatus, GetCommunityPostsParams, GetCommunityPostsSort, GetPoliciesParams, Issue, IssueInput, LiveUpdate, PolicyRecord, PolicySource, Story, StoryInput, StoryKind, StoryWorkflowStatus, Topic, VerificationStatus } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import { absoluteSiteUrl, basePath, getActiveLang, SITE_LANGUAGE, useSeo } from '@/lib/seo';
import { LangProvider, LanguageSwitch, localizePolicy, localizeStory, useLabel, useLang, useLocalHref, useLocalizeStories, useT, type LocalizedStory } from '@/lib/i18n';
import { ACCOUNTABILITY_CHECKED_ON, ACCOUNTABILITY_ITEMS } from '@/lib/accountability';
import { RichBody, outlineOf } from '@/components/rich-body';
import { GlobalFooter, Header } from '@/components/site-chrome';
import { WhatsAppShare } from '@/components/share';
import { HomeStage } from '@/components/home-stage';
import { CommunityTeaser, DeskStrip, LedgerTrio, SectionHead, TimelineStrip } from '@/components/home-sections';
import { KeyFigures } from '@/components/key-figures';
import { CountUp } from '@/components/home-stage';
import { KEY_FIGURES, daysSince, type Bilingual } from '@/lib/key-figures';
import { LazyMotion, m, useReducedMotion } from 'framer-motion';
import type { CabinetDrawer } from '@/components/topic-stage';
import { TOPIC_BRIEFS, TOPIC_BRIEFS_CHECKED_ON, topicBrief, type TopicBrief, type TopicKey } from '@/lib/topic-briefs';
import { authorPageStructuredData, breadcrumbNode, collectionPageNode, EDITORIAL_DESK_PATH, editorialDeskNode, editorialDeskRef, externalDocument, imageObject, organizationRef, placeForState, siteGraph, webPageNode, websiteRef } from '@/lib/structured-data';
import { AUTHORS, authorByName, authorBySlug, authorMeta, authorPath, PEN_NAME_NOTE, type Author } from '@/lib/authors';
import { PAGE_META } from '@/lib/page-meta';
import { INFO_PAGES } from '@/lib/info-pages';
import { POLICY_NOTES } from '@/lib/policy-notes';
import { illustration, imageCaptionForStory, imageForStory, imageForText, slugify, storyPath, storySeo, TOPIC_ILLUSTRATION, type IllustrationName } from '@/lib/stories';

// A minute of freshness: the page server has just fetched the data it embeds, so
// refetching it on first render doubled the download (about 600 KB on the home page).
// Writes still invalidate their queries, so edits show at once.
export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
primeFromServer(queryClient);

/**
 * The page server embeds the API responses it rendered the page from
 * (<script id="signal-data">, keyed by query key). Seeding them here lets the first
 * render show the page instead of a loading state; the data is fresh for a minute,
 * then React Query refetches it in the background as usual.
 */
function primeFromServer(client: QueryClient) {
  if (typeof document === 'undefined') return;
  const element = document.getElementById('signal-data');
  if (!element?.textContent) return;
  try {
    const entries = JSON.parse(element.textContent) as Array<[readonly unknown[], unknown]>;
    for (const [queryKey, data] of entries) {
      if (Array.isArray(queryKey) && data !== undefined) client.setQueryData(queryKey, data);
    }
  } catch (error) {
    console.error('Ignoring unreadable server data', error);
  }
  element.remove();
}

const loadMotionFeatures = () => import('@/lib/motion-features').then((module) => module.default);
const AnswersTeaser = lazy(() => import('@/components/answer-links').then((module) => ({ default: module.AnswersTeaser })));
const TopicAnswers = lazy(() => import('@/components/answer-links').then((module) => ({ default: module.TopicAnswers })));
const ToolsPage = lazy(() => import('@/components/tools-pages').then((module) => ({ default: module.ToolsPage })));
const ToolPage = lazy(() => import('@/components/tools-pages').then((module) => ({ default: module.ToolPage })));
const GlossaryPage = lazy(() => import('@/components/tools-pages').then((module) => ({ default: module.GlossaryPage })));
const ArticleTerms = lazy(() => import('@/components/tools-pages').then((module) => ({ default: module.ArticleTerms })));
const EditorRoutes = lazy(() => import('./editor-app'));
const AnswersPage = lazy(() => import('@/components/answers-pages').then((module) => ({ default: module.AnswersPage })));
const AnswerDetailPage = lazy(() => import('@/components/answers-pages').then((module) => ({ default: module.AnswerDetailPage })));
const CommunityPage = lazy(() => import('@/components/community-pages').then((module) => ({ default: module.CommunityPage })));
const CommunityDetailPage = lazy(() => import('@/components/community-pages').then((module) => ({ default: module.CommunityDetailPage })));
const ArticleEvidenceSection = lazy(() => import('@/components/evidence-pages').then((module) => ({ default: module.ArticleEvidenceSection })));
export const EditorEvidenceDesk = lazy(() => import('@/components/evidence-pages').then((module) => ({ default: module.EditorEvidenceDesk })));
const EvidenceEventDetailPage = lazy(() => import('@/components/evidence-pages').then((module) => ({ default: module.EvidenceEventDetailPage })));
const EvidenceEventsPage = lazy(() => import('@/components/evidence-pages').then((module) => ({ default: module.EvidenceEventsPage })));
const EvidenceSearchPage = lazy(() => import('@/components/evidence-pages').then((module) => ({ default: module.EvidenceSearchPage })));
const EvidenceSourceDetailPage = lazy(() => import('@/components/evidence-pages').then((module) => ({ default: module.EvidenceSourceDetailPage })));
const HomeStatesSection = lazy(() => import('@/components/states-pages').then((module) => ({ default: module.HomeStatesSection })));
const StateProfilePage = lazy(() => import('@/components/states-pages').then((module) => ({ default: module.StateProfilePage })));
const StatesPage = lazy(() => import('@/components/states-pages').then((module) => ({ default: module.StatesPage })));
const CeilingChart = lazy(() => import('@/components/opinion-data').then((module) => ({ default: module.CeilingChart })));
const DemandBoard = lazy(() => import('@/components/opinion-data').then((module) => ({ default: module.DemandBoard })));
const EvidenceSpine = lazy(() => import('@/components/topic-stage').then((module) => ({ default: module.EvidenceSpine })));
const TopicCabinet = lazy(() => import('@/components/topic-stage').then((module) => ({ default: module.TopicCabinet })));
const TopicHero = lazy(() => import('@/components/topic-stage').then((module) => ({ default: module.TopicHero })));

export const TOPICS = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'] as Topic[];
export const KINDS = ['Article', 'Paper note', 'Archive', 'Explainer', 'Opinion'] as StoryKind[];
export const WORKFLOW_STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'] as StoryWorkflowStatus[];
export const VERIFICATION_STATUSES = ['unverified', 'source-linked', 'verified'] as VerificationStatus[];
export const DECISION_IMPACT_EVIDENCE_TYPES = ['lived-account', 'monitored-lead', 'quantified-finding'] as DecisionImpactEvidenceType[];
export const DECISION_IMPACT_AREAS = ['migration', 'study', 'work', 'applications', 'staying', 'speaking', 'leaving'] as DecisionImpactArea[];
export const DECISION_IMPACT_WORKFLOW_STATUSES = ['draft', 'review', 'published', 'archived'] as DecisionImpactWorkflowStatus[];
const INDIA_STATES = ['All states', 'Andhra Pradesh', 'Bihar', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'];
const FOCUS_RECORD_PATTERN = /\b(ugc|university grants commission|upper.?caste|savarna|general.?category|non.?reserved|unreserved|open.?category|open.?competition|open.?merit|maratha|madhya pradesh|ews|103rd amendment|economically weaker sections)\b/i;

const DESK_SNAPSHOT_DATE = '2026-09-26';
function isFocusStory(story: Story) {
  const content = `${story.title} ${story.dek} ${story.source} ${story.state ?? ''}`;
  return Boolean(story.sourceUrl) && FOCUS_RECORD_PATTERN.test(content);
}

function isFocusLiveUpdate(update: LiveUpdate) {
  const content = `${update.headline} ${update.summary}`.toLowerCase();
  if (/\b(ugc|university grants commission|upper.?caste|savarna|general.?category|non.?reserved|unreserved|open.?category|open.?competition|open.?merit|ews|economically weaker sections|103rd amendment)\b/i.test(content)) return true;
  if (/\b(maharashtra|maratha)\b/i.test(content) && /\b(reservation|quota|open|seat|recruitment)\b/i.test(content)) return true;
  if (/\b(madhya pradesh|mp)\b/i.test(content) && /\b(reservation|quota|obc|recruitment|appointment)\b/i.test(content)) return true;
  if (/\bbihar\b/i.test(content) && /\b(reservation|quota|creamy layer|65 ?%)\b/i.test(content)) return true;
  return false;
}
export function formatDate(value?: string | null) {
  const hindi = getActiveLang() === 'hi';
  if (!value) return hindi ? 'तारीख़ उपलब्ध नहीं' : 'Date not supplied';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return hindi
    ? date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' })
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function LoadingBlock({ label }: { label?: string }) {
  const t = useT();
  return <div className="signal-container py-24" role="status" aria-live="polite"><div className="grid gap-4 animate-pulse"><div className="h-3 w-32 bg-muted" /><div className="h-14 max-w-3xl bg-muted" /><div className="h-4 max-w-xl bg-muted" /><p className="mt-3 signal-kicker text-muted-foreground">{label ?? t("Opening the record. Unlike some, we don’t need a committee for that…", "रिकॉर्ड खुल रहा है। हमें इसके लिए किसी समिति की ज़रूरत नहीं…")}</p></div></div>;
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const t = useT();
  return <div className="signal-container border-y border-accent/50 px-5 py-20 text-center" role="alert"><p className="signal-kicker text-accent">{t("Record unavailable", "रिकॉर्ड उपलब्ध नहीं")}</p><h2 className="mt-3 font-display text-4xl leading-none">{t('This record could not be opened.', 'यह रिकॉर्ड खुल नहीं सका।')}</h2><p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{message ?? t("The archive is having a moment. Nothing has been deleted; we don’t do that here.", "अभिलेखागार अभी अटका है। कुछ भी हटाया नहीं गया; यहाँ ऐसा नहीं होता।")}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-6 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground" data-testid="button-retry">{t('Try again', 'फिर कोशिश करें')}</button>}</div>;
}

export function EmptyState({ title, text }: { title?: string; text?: string }) {
  const t = useT();
  return <div className="border border-dashed border-foreground/30 px-6 py-20 text-center"><Archive className="mx-auto mb-4 text-accent" size={28} /><h3 className="font-display text-3xl">{title ?? t("Nothing here. Unlike the government, we’ll admit it.", "यहाँ कुछ नहीं है। सरकार के उलट, हम यह मान लेते हैं।")}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text ?? t('Widen the search, or return to the full archive.', 'खोज का दायरा बढ़ाएँ, या पूरे अभिलेखागार पर लौटें।')}</p></div>;
}

function statusClass(status: VerificationStatus) {
  return status === 'verified' ? 'is-verified' : status === 'source-linked' ? 'is-source-linked' : 'is-unverified';
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const label = useLabel();
  return <span className={`signal-status-badge ${statusClass(status)}`}>{label(status)}</span>;
}

function SourceLine({ story, detail = false }: { story: Story; detail?: boolean }) {
  const t = useT();
  const label = useLabel();
  return <div className={`source-stamp evidence-citation ${detail ? 'px-5 py-4' : 'pl-3'}`} data-testid={`citation-story-${story.id}`}>
    <p className="signal-kicker text-accent">{t('Evidence citation', 'सबूत का हवाला')} / {label(story.verificationStatus)}</p>
    <p className="mt-1 text-sm font-medium" lang="en">{story.source || t('Source not supplied', 'स्रोत नहीं दिया गया')}</p>
    <p className="mt-1 font-mono-signal text-[10px] uppercase tracking-[.1em] text-muted-foreground">{label(story.kind)}{story.state ? ` · ${label(story.state)}` : ''}</p>
    <dl className="mt-3 grid gap-1 text-[11px] text-muted-foreground">
      <div className="flex flex-wrap gap-2"><dt className="signal-kicker text-[9px]">{t('Date attached to record', 'रिकॉर्ड की तारीख़')}</dt><dd>{formatDate(story.recordDate)}</dd></div>
      {story.sourcePublishedOn && <div className="flex flex-wrap gap-2"><dt className="signal-kicker text-[9px]">{t('Source published', 'स्रोत प्रकाशित')}</dt><dd>{formatDate(story.sourcePublishedOn)}</dd></div>}
      {story.sourceRetrievedOn && <div className="flex flex-wrap gap-2"><dt className="signal-kicker text-[9px]">{t('Retrieved', 'प्राप्त किया')}</dt><dd>{formatDate(story.sourceRetrievedOn)}</dd></div>}
    </dl>
    {detail && story.verificationNotes && <p className="mt-3 text-sm leading-relaxed text-muted-foreground" lang="en">{story.verificationNotes}</p>}
    {story.sourceUrl ? <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[.68rem] font-bold uppercase tracking-[.12em] text-accent hover:underline" data-testid={`link-source-${story.id}`}>{t('Open the source', 'मूल स्रोत खोलें')} <ExternalLink size={12} /></a> : <p className="mt-3 signal-kicker text-muted-foreground">{t('No direct source link', 'सीधा स्रोत लिंक नहीं')}</p>}
  </div>;
}


function StoryArt({ story, className = '', showCredit = true }: { story: LocalizedStory | Story; className?: string; showCredit?: boolean }) {
  const image = imageForStory(story);
  const t = useT();
  return <div className={`story-art relative m-0 overflow-hidden ${image.kind === 'illustration' ? 'is-illustration' : 'bg-muted'} ${className}`} data-testid={`visual-story-${story.id}`}>
    <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" className="h-full w-full object-cover story-art-image" />
    {showCredit && image.kind === 'photo' && <p className="absolute inset-x-0 bottom-0 bg-primary/85 px-3 py-2 text-[9px] uppercase tracking-[.08em] text-primary-foreground/75">{image.credit} · {t('not evidence for this record', 'इस रिकॉर्ड का सबूत नहीं')}</p>}
  </div>;
}

function PageArt({ name, className = '' }: { name: IllustrationName; className?: string }) {
  const art = illustration(name);
  return <figure className={`page-art m-0 ${className}`}><img src={art.src} alt={art.alt} width={art.width} height={art.height} loading="lazy" decoding="async" /><figcaption className="sr-only">{art.credit}</figcaption></figure>;
}

function StoryCard({ story, compact = false }: { story: LocalizedStory; compact?: boolean }) {
  const t = useT();
  const label = useLabel();
  return <article className={`archive-visual-card story-hover group ${compact ? 'compact' : ''}`} data-testid={`card-story-${story.id}`}>
    <Link href={storyPath(story)} className="archive-thumb block" data-testid={`link-story-art-${story.id}`}><StoryArt story={story} className="h-full" /></Link>
    <div className="flex min-w-0 flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="signal-kicker text-accent">{story.kind === 'Opinion' ? <span className="opinion-label">{label('Opinion')}</span> : <>{label(story.topic)} / {label(story.kind)}</>}</p><time className="signal-kicker text-muted-foreground" dateTime={story.publishedOn ?? story.recordDate ?? undefined}>{story.publishedOn ? t('Published', 'प्रकाशित') : t('Record date', 'रिकॉर्ड तिथि')} / {formatDate(story.publishedOn ?? story.recordDate)}</time></div>
        <Link href={storyPath(story)} className="mt-3 block" data-testid={`link-story-${story.id}`}><h3 lang={story.contentLang} className={`${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} max-w-3xl font-display leading-[1.02] tracking-[-.025em] transition-colors group-hover:text-accent`}>{story.title}</h3></Link>
        <div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={story.verificationStatus} />{!story.isTranslated && <span className="signal-kicker text-muted-foreground">{t('', 'अभी केवल अंग्रेज़ी में')}</span>}</div>
        <p lang={story.contentLang} className={`${compact ? 'line-clamp-2' : 'max-w-2xl'} mt-3 text-sm leading-relaxed text-muted-foreground`}>{story.dek}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-3">
        <span className="signal-kicker text-muted-foreground">{label(story.state ?? 'India')} · {t(`${story.read} min read`, `${story.read} मिनट`)}</span>
        {story.byline && <span className="signal-kicker text-muted-foreground">{label(story.byline)}</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 signal-kicker text-muted-foreground"><span>{t(`${story.sourceCount ?? 0} sources · ${story.eventCount ?? 0} events`, `${story.sourceCount ?? 0} स्रोत · ${story.eventCount ?? 0} घटनाएँ`)}</span><span>{story.sourceUrl ? t('Direct source linked', 'सीधा स्रोत जुड़ा') : t('No direct source', 'सीधा स्रोत नहीं')}</span></div>
    </div>
  </article>;
}

function LiveDesk({ onSelect }: { onSelect?: (update: LiveUpdate) => void }) {
  const { data, isLoading, isError, isFetching, refetch } = useGetLiveUpdates({
    query: {
      queryKey: getGetLiveUpdatesQueryKey(),
      staleTime: 240_000,
      refetchInterval: 300_000,
      refetchOnWindowFocus: true,
    },
  });
  const t = useT();
  const updates = data?.updates.filter(isFocusLiveUpdate).slice(0, 8) ?? [];
  // On the front page an empty or failed monitor is noise: show the desk only when it has leads.
  if (isLoading || isError || updates.length === 0) return null;

  return <section id="live-desk" className="signal-container pt-20 sm:pt-28">
    <div className="live-desk-header flex flex-col justify-between gap-6 border-y border-foreground/20 py-6 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-3"><Radio size={17} className="text-accent" /><p className="signal-kicker text-accent">{t('Live desk / unverified leads', 'लाइव डेस्क / असत्यापित सुराग')}</p><span className="live-pulse h-2 w-2 rounded-full bg-accent" /></div>
        <h2 className="mt-3 max-w-3xl font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">{t(<>What is moving<br /><em className="font-normal text-accent">right now.</em></>, <>अभी क्या<br /><em className="font-normal text-accent">चल रहा है।</em></>)}</h2>
      </div>
      <div className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        <p>{t("Headlines from outside feeds. Not our reporting, not verified, and not facts until the desk checks them against a primary source. Radical, we know.", "बाहरी फ़ीड की सुर्ख़ियाँ। न हमारी रिपोर्टिंग, न सत्यापित, और जब तक डेस्क इन्हें मूल स्रोत से न मिला ले, तब तक तथ्य भी नहीं। अजीब बात है, हम जानते हैं।")}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 inline-flex items-center gap-2 signal-kicker text-accent disabled:opacity-50" disabled={isFetching} data-testid="button-refresh-live-desk"><RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> {isFetching ? t('Refreshing', 'ताज़ा हो रहा है') : t('Refresh feeds', 'फ़ीड ताज़ा करें')}</button>
      </div>
    </div>
    {isLoading ? <div className="grid gap-4 py-6 md:grid-cols-2"><div className="h-40 animate-pulse bg-muted" /><div className="h-40 animate-pulse bg-muted" /></div> :
      isError ? <div className="border border-dashed border-foreground/25 px-5 py-10 text-sm text-muted-foreground"><p className="signal-kicker text-accent">{t('Monitor unavailable', 'मॉनिटर उपलब्ध नहीं')}</p><p className="mt-2">{t('The outside feeds could not be reached. The published archive is unaffected.', 'बाहरी फ़ीड तक पहुँच नहीं हो सकी। प्रकाशित अभिलेखागार पर कोई असर नहीं है।')}</p></div> :
        <><div className="grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-2">{updates.map((update) => <LiveUpdateCard key={update.id} update={update} onSelect={onSelect} />)}</div>{updates.length === 0 && <EmptyState title={t('No on-focus leads right now.', 'अभी कोई प्रासंगिक सुराग नहीं।')} text={t('The monitor only surfaces UGC, open-category, EWS and state quota coverage. Everything else is filtered out.', 'मॉनिटर केवल यूजीसी, खुली श्रेणी, ईडब्ल्यूएस और राज्य आरक्षण से जुड़ी ख़बरें दिखाता है। बाक़ी सब छाँट दिया जाता है।')} />}</>}
    {data && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 py-4"><p className="signal-kicker text-muted-foreground">{t('Observed', 'देखा गया')} {formatDate(data.observedAt)} · {t(`${updates.length} on-focus leads`, `${updates.length} प्रासंगिक सुराग`)}</p><p className="signal-kicker text-muted-foreground">{t(`${data.feeds.filter((feed) => feed.status === 'ok').length}/${data.feeds.length} feeds responding`, `${data.feeds.filter((feed) => feed.status === 'ok').length}/${data.feeds.length} फ़ीड चालू`)}</p></div>}
  </section>;
}

function LiveUpdateCard({ update, onSelect }: { update: LiveUpdate; onSelect?: (update: LiveUpdate) => void }) {
  const t = useT();
  return <article className="live-update-card bg-card p-5 sm:p-6" data-testid={`card-live-update-${update.id}`}>
    <div className="flex items-start justify-between gap-4"><p className="signal-kicker text-accent">{update.topic}</p><span className="signal-kicker whitespace-nowrap text-[9px] text-muted-foreground">{t('Needs review', 'जाँच बाक़ी')}</span></div>
    <h3 className="mt-4 font-display text-2xl leading-tight tracking-[-.025em]" lang="en">{update.headline}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground" lang="en">{update.summary}</p>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{update.source} · {update.publishedAt ? formatDate(update.publishedAt) : t('Date not supplied', 'तारीख़ उपलब्ध नहीं')}</p><div className="flex items-center gap-4">{onSelect && <button type="button" onClick={() => onSelect(update)} className="signal-kicker text-accent hover:underline" data-testid={`button-use-live-update-${update.id}`}>Start draft</button>}<a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline">{t('Open source', 'स्रोत खोलें')} <ExternalLink size={12} /></a></div></div>
  </article>;
}

function InfoPage({ page }: { page: 'about' | 'standards' | 'methodology' }) {
  const t = useT();
  const content = {
    about: {
      name: t('About', 'परिचय'),
      title: t(<>We read the fine print.<br /><em className="font-normal text-accent">Someone has to.</em></>, <>हम बारीक अक्षर पढ़ते हैं।<br /><em className="font-normal text-accent">किसी को तो पढ़ने हैं।</em></>),
      intro: t(PAGE_META.about.description.en, PAGE_META.about.description.hi),
    },
    standards: {
      name: t('Editorial standards', 'संपादकीय मानक'),
      title: t(<>Hard on power.<br /><em className="font-normal text-accent">Harder on ourselves.</em></>, <>सत्ता पर सख़्त।<br /><em className="font-normal text-accent">ख़ुद पर और सख़्त।</em></>),
      intro: t(PAGE_META.standards.description.en, PAGE_META.standards.description.hi),
    },
    methodology: {
      name: t('Methodology', 'कार्यप्रणाली'),
      title: t(<>How we check<br /><em className="font-normal text-accent">the state’s paperwork.</em></>, <>सरकारी काग़ज़ों की<br /><em className="font-normal text-accent">जाँच हम कैसे करते हैं।</em></>),
      intro: t(PAGE_META.methodology.description.en, PAGE_META.methodology.description.hi),
    },
  }[page];
  const info = INFO_PAGES[page];
  const eyebrow = t(info.eyebrow.en, info.eyebrow.hi);
  const sections = info.sections.map(({ title, text }) => [t(title.en, title.hi), t(text.en, text.hi)] as const);
  const path = `/${page === 'standards' ? 'editorial-standards' : page}`;

  useSeo({
    title: t(PAGE_META[page === 'standards' ? 'standards' : page].title.en, PAGE_META[page === 'standards' ? 'standards' : page].title.hi),
    description: content.intro,
    canonicalPath: path,
    structuredData: siteGraph(
      webPageNode(path, { name: `${content.name} — The Signal 24`, description: content.intro, about: organizationRef, publisher: organizationRef }, page === 'about' ? 'AboutPage' : 'WebPage'),
      breadcrumbNode(path, [[content.name, path]]),
    ),
  });
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><p className="signal-kicker text-accent">{eyebrow}</p><h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{content.title}</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{content.intro}</p><PageArt name={page === 'about' ? 'magnifier-hero' : page === 'standards' ? 'court-stamp' : 'census-clipboard'} className="max-w-4xl" /></section><section className="signal-container mt-16 border-t border-foreground/20 sm:mt-24"><div className="grid divide-y divide-foreground/15 lg:grid-cols-2 lg:divide-x lg:divide-y-0">{sections.map(([title, text], index) => <article key={title} id={page === 'standards' && index === sections.length - 1 ? 'corrections' : undefined} className={`py-8 lg:px-8 ${index % 2 === 0 ? 'lg:pl-0' : 'lg:pr-0'} ${index > 1 ? 'lg:border-t lg:border-foreground/15' : ''}`}><p className="signal-kicker text-accent">{String(index + 1).padStart(2, '0')}</p><h2 className="mt-3 font-display text-3xl leading-tight">{title}</h2><p className="mt-4 max-w-xl text-[.95rem] leading-[1.8] text-muted-foreground">{text}</p></article>)}</div></section>{page === 'about' && <AuthorsSection />}</main>;
}

export function evidenceTypeLabel(value: DecisionImpactEvidenceType) {
  const hindi = getActiveLang() === 'hi';
  if (value === 'lived-account') return hindi ? 'आपबीती' : 'Lived account';
  if (value === 'monitored-lead') return hindi ? 'निगरानी में सुराग' : 'Monitored lead';
  return hindi ? 'मापा गया निष्कर्ष' : 'Quantified finding';
}

export function verificationLabel(value: VerificationStatus) {
  const hindi = getActiveLang() === 'hi';
  if (value === 'verified') return hindi ? 'सत्यापित' : 'Verified';
  if (value === 'source-linked') return hindi ? 'स्रोत से जुड़ा' : 'Source linked';
  return hindi ? 'असत्यापित' : 'Unverified';
}

function Home() {
  const issueQuery = useGetCurrentIssue();
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const archiveQuery = useGetArchive(archiveParams, { query: { queryKey: getGetArchiveQueryKey(archiveParams) } });
  const t = useT();
  const label = useLabel();
  const localize = useLocalizeStories();
  const homeTitle = t(PAGE_META.home.title.en, PAGE_META.home.title.hi);
  const homeDescription = t(PAGE_META.home.description.en, PAGE_META.home.description.hi);
  useSeo({ title: homeTitle, description: homeDescription, canonicalPath: '/', structuredData: siteGraph(webPageNode('/', { name: homeTitle, description: homeDescription, about: organizationRef, publisher: organizationRef, breadcrumb: undefined })) });
  const stories = useMemo(
    () => localize([...(archiveQuery.data?.stories ?? issueQuery.data?.stories ?? [])]
      .filter((story) => story.workflowStatus === 'published')
      .sort((a, b) => (b.publishedOn ?? b.recordDate ?? '').localeCompare(a.publishedOn ?? a.recordDate ?? ''))),
    [archiveQuery.data, issueQuery.data, localize],
  );
  if (issueQuery.isLoading || archiveQuery.isLoading) return <div className="signal-page"><Header /><LoadingBlock label={t("Assembling the front page. Faster than a commission report…", "पहला पन्ना तैयार हो रहा है। किसी आयोग की रिपोर्ट से तेज़…")} /></div>;
  if (issueQuery.isError && archiveQuery.isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t('The front page and archive could not be assembled.', 'पहला पन्ना और अभिलेखागार तैयार नहीं हो सके।')} onRetry={() => { void issueQuery.refetch(); void archiveQuery.refetch(); }} /></div></div>;
  const reporting = stories.filter((story) => story.kind !== 'Opinion');
  const opinions = stories.filter((story) => story.kind === 'Opinion');
  const sourcedStories = reporting.filter((story) => story.verificationStatus !== 'unverified' && Boolean(story.sourceUrl));
  const featured = sourcedStories[0];
  const investigation = sourcedStories.find((story) => story.id !== featured?.id && (story.kind === 'Article' || story.kind === 'Explainer'));
  const featuredImage = featured ? imageForStory(featured) : null;
  const second = investigation ?? reporting.find((story) => story.id !== featured?.id);
  const rail = reporting.filter((story) => story.id !== featured?.id && story.id !== second?.id).slice(0, 6);
  return <main className="signal-page"><Header />
    <HomeStage stories={stories} storyHref={storyPath} />
    {featured ? <section className={`signal-container visual-hero mt-7 ${featuredImage?.kind === 'illustration' ? 'visual-hero--illustration' : ''}`} data-testid={`card-home-hero-${featured.id}`}>{featuredImage ? <img src={featuredImage.src} alt={featuredImage.alt} width={featuredImage.width} height={featuredImage.height} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" /> : <div className="story-art-placeholder absolute inset-0" />}<div className="visual-hero-copy flex min-h-[440px] flex-col justify-end p-6 sm:min-h-[560px] sm:max-w-[72%] sm:p-12 lg:min-h-[680px] lg:max-w-[62%] lg:p-16"><p className="signal-kicker text-accent">{label(featured.topic)} / {label(featured.kind)}</p><Link href={storyPath(featured)} className="group mt-4 block"><h1 lang={featured.contentLang} className="max-w-4xl font-display text-5xl leading-[.91] tracking-[-.055em] group-hover:text-accent sm:text-7xl lg:text-[6.8rem]" data-testid="heading-hero">{featured.title}</h1></Link><p lang={featured.contentLang} className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">{featured.dek}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 signal-kicker text-primary-foreground/70"><span>{formatDate(featured.publishedOn ?? featured.recordDate)}</span><span>{t(`${featured.read} min read`, `${featured.read} मिनट`)}</span><span>{verificationLabel(featured.verificationStatus)}</span></div><Link href={storyPath(featured)} className="mt-7 inline-flex w-fit items-center gap-2 signal-button bg-accent text-accent-foreground" data-testid="link-read-briefing">{t('Read the record', 'पूरा रिकॉर्ड पढ़ें')} <ArrowUpRight size={14} /></Link></div>{featuredImage && <p className="hero-credit">{featuredImage.credit} · {t('contextual, not evidence for this record', 'संदर्भ के लिए, इस रिकॉर्ड का सबूत नहीं')}</p>}</section> : <section className="signal-container mt-7 border-y-2 border-foreground py-0"><div className="grid min-h-[480px] items-stretch lg:grid-cols-[1fr_.72fr]"><div className="order-last flex flex-col justify-center py-16 lg:order-first lg:pr-12"><p className="signal-kicker text-accent">{t("For the people, by the people. Someone has to be.", "जनता के लिए, जनता की ओर से। किसी को तो होना होगा।")}</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.92] sm:text-7xl">{t("The government has plenty of explanations. We have the documents.", "सरकार के पास सफ़ाइयाँ बहुत हैं। हमारे पास दस्तावेज़ हैं।")}</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{t("We track what India’s governments, courts and commissions promise on reservation and representation, then check what they actually file, publish and quietly forget. Every claim links to its source, because “trust us” is not a citation.", "आरक्षण और प्रतिनिधित्व पर भारत की सरकारें, अदालतें और आयोग क्या वादा करते हैं, हम इसका हिसाब रखते हैं, और फिर देखते हैं कि वे असल में क्या दर्ज करते हैं, क्या छापते हैं और क्या चुपचाप भूल जाते हैं। हर दावा अपने स्रोत से जुड़ा है, क्योंकि “हम पर भरोसा कीजिए” कोई हवाला नहीं होता।")}</p><div className="mt-7 flex flex-wrap gap-3"><a href="#accountability" className="inline-flex w-fit items-center gap-2 signal-button bg-accent text-accent-foreground">{t("See what they’re dodging", "देखिए वे किन सवालों से बच रहे हैं")} <ArrowDownRight size={14} /></a><Link href="/archive" className="inline-flex w-fit items-center gap-2 signal-button">{t('Browse the archive', 'अभिलेखागार देखें')} <ArrowUpRight size={14} /></Link></div></div><figure className="order-first relative m-0 min-h-[280px] overflow-hidden border-l border-foreground/15 lg:order-last"><img src={`${basePath}/illustrations/magnifier-hero.svg`} alt={illustration('magnifier-hero').alt} width="1600" height="900" fetchPriority="high" className="h-full w-full object-cover" /><figcaption className="absolute inset-x-0 bottom-0 bg-primary/85 px-3 py-3 signal-kicker text-primary-foreground/75">{t('Illustration: The Signal 24', 'चित्रण: द सिग्नल 24')}</figcaption></figure></div></section>}
    {(second || rail.length > 0) && <section className="signal-container hp-section" id="latest-stories" aria-labelledby="front-title">
      <SectionHead id="front-title" kicker={t('Latest reporting', 'ताज़ा रिपोर्टिंग')} title={t(<>Follow the paper trail. <em>Nobody expected you to.</em></>, <>काग़ज़ों का सिरा पकड़िए। <em>किसी को उम्मीद नहीं थी कि आप पकड़ेंगे।</em></>)} link="/archive" linkLabel={t('The full archive', 'पूरा अभिलेखागार')} />
      <div className="hp-front">
        {second && <article className="hp-front-lead group" data-testid={`card-home-second-${second.id}`}>
          <Link href={storyPath(second)} className="hp-front-art" tabIndex={-1} aria-hidden="true"><StoryArt story={second} className="h-full" /></Link>
          <div className="hp-front-copy">
            <p className="signal-kicker text-accent">{label(second.topic)} / {label(second.kind)}</p>
            <Link href={storyPath(second)}><h3 lang={second.contentLang} className="hp-front-title group-hover:text-accent">{second.title}</h3></Link>
            <div className="mt-3"><StatusBadge status={second.verificationStatus} /></div>
            <p lang={second.contentLang} className="hp-front-dek">{second.dek}</p>
            <p className="hp-front-meta">{formatDate(second.publishedOn ?? second.recordDate)} · {t(`${second.read} min read`, `${second.read} मिनट`)} · {t(`${second.sourceCount ?? 0} sources`, `${second.sourceCount ?? 0} स्रोत`)}</p>
          </div>
        </article>}
        <ol className="hp-rail" aria-label={t('More reporting', 'और रिपोर्टिंग')}>
          {rail.map((story, index) => <li key={story.id}><Link href={storyPath(story)} className="hp-rail-item group" data-testid={`link-home-rail-${story.id}`}>
            <span className="hp-rail-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="hp-rail-body">
              <span className="signal-kicker text-accent">{label(story.topic)} / {label(story.kind)}</span>
              <span lang={story.contentLang} className="hp-rail-title group-hover:text-accent">{story.title}</span>
              <span className="hp-rail-meta">{formatDate(story.publishedOn ?? story.recordDate)} · {t(`${story.sourceCount ?? 0} sources`, `${story.sourceCount ?? 0} स्रोत`)} · {verificationLabel(story.verificationStatus)}</span>
            </span>
          </Link></li>)}
        </ol>
      </div>
    </section>}
    <section className="signal-container hp-section" id="accountability" aria-labelledby="accountability-title">
      <SectionHead id="accountability-title" kicker={t('Accountability watch', 'जवाबदेही निगरानी')} title={t(<>The questions they keep not answering. <em>We are counting the days.</em></>, <>वे सवाल जिनका जवाब वे देते ही नहीं। <em>हम दिन गिन रहे हैं।</em></>)} link="/opinion" linkLabel={t('Every demand, argued', 'हर माँग, तर्क के साथ')} />
      <DemandBoard demands={ACCOUNTABILITY_ITEMS} />
      <p className="mt-6 signal-kicker text-muted-foreground">{t('Last checked', 'आख़िरी जाँच')} {formatDate(ACCOUNTABILITY_CHECKED_ON)} · {t('If the government has quietly answered one, tell us and we will strike it off.', 'अगर सरकार ने चुपचाप किसी का जवाब दे दिया हो, तो बताइए, हम उसे काट देंगे।')}</p>
    </section>
    <DeskStrip stories={stories} />
    <section className="signal-container hp-section" id="the-numbers" aria-labelledby="numbers-title">
      <SectionHead id="numbers-title" kicker={t('The numbers', 'आंकड़े')} title={t(<>No number <em>without its frame.</em></>, <>कोई आंकड़ा <em>संदर्भ के बिना नहीं।</em></>)} link="/data" linkLabel={t('Open the data room', 'आंकड़ा कक्ष खोलें')} />
      <p className="hp-lede">{t("The figures this whole fight turns on, each with its unit, year, definition and source. Notice how many of them are about what the state has frozen or withheld.", "वे आंकड़े जिन पर यह पूरी लड़ाई टिकी है, हर एक अपनी इकाई, वर्ष, परिभाषा और स्रोत के साथ। ग़ौर कीजिए कि इनमें से कितने इस बारे में हैं कि सरकार ने क्या जमा रखा है या रोक रखा है।")}</p>
      <div className="mt-6 hp-figures"><KeyFigures limit={8} /></div>
    </section>
    <LedgerTrio />
    <WhenNear minHeight={560}><AnswersTeaser /></WhenNear>
    <WhenNear minHeight={720}><HomeStatesSection /></WhenNear>
    <TimelineStrip />
    {opinions.length > 0 && <section className="signal-container mt-20 sm:mt-28" id="opinion"><div className="grid gap-8 bg-primary p-7 text-primary-foreground sm:p-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="opinion-label bg-accent text-accent-foreground">{label('Opinion')}</span><h2 className="mt-4 font-display text-4xl leading-[.95] sm:text-5xl">{t("Where we stop being polite.", "जहाँ हम शिष्टाचार छोड़ देते हैं।")}</h2><p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">{t("Signed, labelled, and kept away from the reporting so nobody mistakes our irritation for our evidence.", "नाम के साथ, लेबल के साथ, और रिपोर्टिंग से दूर, ताकि कोई हमारी झुँझलाहट को हमारा सबूत न समझ ले।")}</p><Link href="/opinion" className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">{t('All opinion', 'सारी राय')} <ArrowUpRight size={13} /></Link></div><div className="divide-y divide-primary-foreground/20">{opinions.slice(0, 3).map((story) => <Link key={story.id} href={storyPath(story)} className="group block py-5 first:pt-0"><p className="signal-kicker text-primary-foreground/60">{label(story.byline) || t('Editorial board', 'संपादकीय बोर्ड')} · {formatDate(story.publishedOn)}</p><h3 lang={story.contentLang} className="mt-2 font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3><p lang={story.contentLang} className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{story.dek}</p></Link>)}</div></div></section>}
    <CommunityTeaser />
    <LiveDesk />
  </main>;
}

/**
 * Renders its children once they come within a screen of the viewport. The home page's
 * state map needs a 300 KB boundary file; most readers never scroll that far.
 */
function WhenNear({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (near || !ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setNear(true); observer.disconnect(); }
    }, { rootMargin: '800px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [near]);
  const placeholder = <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
  return near ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder;
}

/** Archive query whose stories are already localized for the current edition. */
function useLocalizedArchive(...args: Parameters<typeof useGetArchive>) {
  const query = useGetArchive(...args);
  const lang = useLang();
  const raw = query.data as ArchiveResult | undefined;
  const data = useMemo<(Omit<ArchiveResult, 'stories'> & { stories: LocalizedStory[] }) | undefined>(
    () => raw ? { ...raw, stories: raw.stories.map((story) => localizeStory(story, lang)) } : undefined,
    [raw, lang],
  );
  return { ...query, data };
}

const TOPIC_DESK_ORDER: Topic[] = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'];

function topicHref(topic: string) {
  return `/topics/${encodeURIComponent(topic)}`;
}

/** Published evidence events, newest first, optionally narrowed to one topic (by event topic or by a linked record's topic). */
function useTopicEvents(topic?: string) {
  const params = useMemo(() => ({ limit: 100 }), []);
  const query = useGetEvidenceEvents(params, { query: { queryKey: getGetEvidenceEventsQueryKey(params), staleTime: 60_000 } });
  const events = useMemo(() => (query.data?.events ?? [])
    .filter((item) => !topic || item.event.topic === topic || item.articles.some((article) => article.topic === topic))
    .sort((a, b) => (b.event.recordDate ?? '').localeCompare(a.event.recordDate ?? '')), [query.data, topic]);
  return { ...query, events };
}

/** Ledger records named by a topic brief, in the brief's order. */
function useBriefPolicies(slugs: string[]) {
  const params = useMemo<GetPoliciesParams>(() => ({ limit: 100 }), []);
  const query = useGetPolicies(params, { query: { queryKey: getGetPoliciesQueryKey(params), staleTime: 60_000 } });
  const lang = useLang();
  const records = useMemo(() => slugs
    .map((slug) => query.data?.records.find((record) => record.slug === slug))
    .filter((record): record is PolicyRecord => Boolean(record))
    .map((record) => localizePolicy(record, lang)), [query.data, slugs, lang]);
  return { ...query, records };
}

function TopicBriefSection({ brief }: { brief: TopicBrief }) {
  const t = useT();
  const lang = useLang();
  const statusLabel = (status?: string) => status === 'pending' ? t('Pending', 'लंबित') : status === 'withheld' ? t('Withheld / frozen', 'रोका / जमा हुआ') : t('Decided', 'तय');
  return <section className="signal-container mt-16 sm:mt-24" aria-labelledby="topic-brief-title">
    <div className="grid gap-10 border-y-2 border-foreground py-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
      <div>
        <p className="signal-kicker text-accent">{t('The brief / state of play', 'ब्रीफ़ / अभी की स्थिति')}</p>
        <h2 id="topic-brief-title" className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{t('Where it stands, in dates.', 'मामला कहाँ है, तारीख़ों में।')}</h2>
        <ol className="topic-play mt-6">
          {brief.stateOfPlay.map((item) => <li key={item.when + item.text.en} className={`topic-play-item is-${item.status ?? 'decided'}`}>
            <time dateTime={item.when} className="signal-kicker text-muted-foreground">{formatDate(item.when)}</time>
            <span className="topic-play-status">{statusLabel(item.status)}</span>
            <p className="mt-1 text-[.95rem] leading-relaxed">{item.text[lang]}</p>
          </li>)}
        </ol>
      </div>
      <div>
        <p className="signal-kicker text-accent">{t('Questions on the table', 'मेज़ पर रखे सवाल')}</p>
        <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{t(<>Still <em className="font-normal text-accent">unanswered.</em></>, <>अब भी <em className="font-normal text-accent">अनुत्तरित।</em></>)}</h2>
        <ol className="mt-6 divide-y divide-foreground/15 border-y border-foreground/15">
          {brief.questions.map((question, index) => <li key={question.en} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4"><span className="font-display text-2xl text-accent">{String(index + 1).padStart(2, '0')}</span><p className="font-display text-xl leading-snug">{question[lang]}</p></li>)}
        </ol>
        <p className="mt-4 signal-kicker text-muted-foreground">{t('Last checked', 'आख़िरी जाँच')} {formatDate(TOPIC_BRIEFS_CHECKED_ON)} · {t('Every line restates a sourced record on this site.', 'हर पंक्ति इस साइट के किसी स्रोत-आधारित रिकॉर्ड पर टिकी है।')}</p>
      </div>
    </div>
  </section>;
}

function TopicPolicies({ records }: { records: Array<ReturnType<typeof localizePolicy>> }) {
  const t = useT();
  const label = useLabel();
  if (records.length === 0) return null;
  return <section className="signal-container mt-16 sm:mt-24">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
      <div><p className="signal-kicker text-accent">{t('From the policy ledger', 'नीति रजिस्टर से')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('The rules in play, and whether they survived.', 'लागू नियम, और क्या वे टिके।')}</h2></div>
      <Link href="/policies" className="signal-kicker text-accent hover:underline">{t('Full ledger', 'पूरा रजिस्टर')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
    </div>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {records.map((record) => <Link key={record.slug} href={record.canonicalPath} className="topic-policy-card group" lang={record.contentLang} data-testid={`topic-policy-${record.slug}`}>
        <div className="flex flex-wrap items-center justify-between gap-3"><span className={`topic-policy-status is-${slugify(record.status)}`}>{label(record.status)}</span><span className="signal-kicker text-muted-foreground">{formatDate(record.effectiveDate)} · {label(record.state ?? 'National')}</span></div>
        <h3 className="mt-4 font-display text-2xl leading-tight group-hover:text-accent">{record.title}</h3>
        <div className="mt-5 grid gap-4 border-t border-foreground/15 pt-4 sm:grid-cols-2">
          <div><p className="signal-kicker text-muted-foreground">{t('Before', 'पहले')}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{record.previousFramework}</p></div>
          <div><p className="signal-kicker text-accent">{t('Court status', 'अदालती स्थिति')}</p><p className="mt-1 text-sm leading-relaxed">{record.courtStatus}</p></div>
        </div>
      </Link>)}
    </div>
  </section>;
}

function TopicIndexPage() {
  const t = useT();
  const label = useLabel();
  const lang = useLang();
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  const { events } = useTopicEvents();
  const stories = data?.stories ?? [];
  const topics = useMemo(() => TOPIC_DESK_ORDER.map((topic) => ({
    topic,
    records: (data?.stories ?? []).filter((story) => story.topic === topic),
  })), [data]);
  const sourceCount = new Set(stories.map((story) => story.sourceUrl).filter(Boolean)).size;
  const title = t(PAGE_META.topics.title.en, PAGE_META.topics.title.hi);
  const description = t(PAGE_META.topics.description.en, PAGE_META.topics.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/topics',
    structuredData: siteGraph(
      collectionPageNode('/topics', { name: title, description, publisher: organizationRef }, [...topics.map(({ topic }) => ({ url: topicHref(topic), name: label(topic) })), { url: '/topics/open-category-competition', name: t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा') }]),
      breadcrumbNode('/topics', [[t('Topics', 'विषय'), '/topics']]),
    ),
  });
  const drawers: CabinetDrawer[] = [
    ...topics.map(({ topic, records }) => {
      const brief = TOPIC_BRIEFS[topic as TopicKey];
      return {
        href: topicHref(topic),
        title: label(topic),
        count: t(`${records.length} ${records.length === 1 ? 'record' : 'records'}`, `${records.length} रिकॉर्ड`),
        headline: `${brief.headline[lang]} ${brief.accent[lang]}`,
        papers: records.slice(0, 3).map((story) => ({ title: story.title, lang: story.contentLang })),
        illustration: brief.illustration,
        testId: `link-topic-${slugify(topic)}`,
      };
    }),
    {
      href: '/topics/open-category-competition',
      title: t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा'),
      count: t('Topic file', 'विषय फ़ाइल'),
      headline: t('UGC equity rules, EWS eligibility and who open seats are open to.', 'यूजीसी समता नियम, ईडब्ल्यूएस पात्रता, और खुली सीटें किसके लिए खुली हैं।'),
      papers: [],
      illustration: TOPIC_BRIEFS['open-category-competition'].illustration,
      testId: 'link-topic-open-category-competition',
    },
  ];
  return <main className="signal-page">
    <Header />
    <TopicHero
      kicker={t('The Signal 24 / topic files', 'द सिग्नल 24 / विषय फ़ाइलें')}
      headline={t('Follow one subject', 'एक विषय को')}
      accent={t('through the whole record.', 'पूरे रिकॉर्ड में परखिए।')}
      standfirst={t('Each desk keeps a brief, a dated chain of evidence and every source it relies on. Sharing a topic is not evidence that two records are connected; the evidence links say that, or nothing does.', 'हर डेस्क के पास एक ब्रीफ़, सबूतों की तारीख़वार कड़ी और हर वह स्रोत है जिस पर वह टिका है। एक विषय में होना इस बात का सबूत नहीं कि दो रिकॉर्ड जुड़े हैं; यह सबूत के लिंक बताते हैं, वरना कुछ नहीं।')}
      stats={[
        { value: TOPIC_DESK_ORDER.length, label: t('Desks', 'डेस्क') },
        { value: stories.length, label: t('Published records', 'प्रकाशित रिकॉर्ड') },
        { value: events.length, label: t('Dated events', 'तारीख़वार घटनाएँ') },
        { value: sourceCount, label: t('Direct sources', 'सीधे स्रोत') },
      ]}
      illustration="archive-history"
      illustrationAlt={illustration('archive-history').alt}
      exhibits={stories.slice(0, 2).map((story) => ({ title: story.title, meta: `${label(story.topic)} · ${label(story.kind)}`, lang: story.contentLang }))}
    />
    <section className="signal-container mt-16 sm:mt-24" aria-label={t('Topic files', 'विषय फ़ाइलें')}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t('The cabinet', 'अलमारी')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('Pull a file. Everything in it is sourced.', 'कोई फ़ाइल खींचिए। उसमें सब कुछ स्रोत के साथ है।')}</h2></div>
        <Link href="/archive" className="signal-kicker text-accent hover:underline">{t('Browse all records', 'सभी रिकॉर्ड देखें')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      {isLoading ? <LoadingBlock label={t('Reading the published archive…', 'प्रकाशित अभिलेखागार पढ़ा जा रहा है…')} /> :
        isError ? <div className="py-10"><ErrorState message={t('Topics could not be assembled from the archive.', 'अभिलेखागार से विषय तैयार नहीं हो सके।')} onRetry={() => void refetch()} /></div> :
          <TopicCabinet drawers={drawers} />}
    </section>
    
  </main>;
}

function TopicPage() {
  const t = useT();
  const label = useLabel();
  const lang = useLang();
  const params = useParams<{ slug?: string }>();
  const topic = decodeURIComponent(params.slug ?? '') as Topic;
  const brief = topicBrief(topic);
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(archiveParams, { query: { queryKey: getGetArchiveQueryKey(archiveParams) } });
  const records = useMemo(() => (data?.stories ?? []).filter((story) => story.topic === topic), [data, topic]);
  const { events } = useTopicEvents(topic);
  const { records: policies } = useBriefPolicies(brief?.policies ?? []);
  const sourceDocuments = useMemo(() => {
    const byUrl = new Map<string, { name: string; url: string }>();
    for (const story of records) if (story.sourceUrl) byUrl.set(story.sourceUrl, { name: story.source, url: story.sourceUrl });
    for (const item of events) for (const source of [...item.primarySources, ...item.secondarySources]) if (source.sourceUrl && !byUrl.has(source.sourceUrl)) byUrl.set(source.sourceUrl, { name: `${source.publisher}: ${source.title}`, url: source.sourceUrl });
    return Array.from(byUrl.values());
  }, [records, events]);
  const path = params.slug ? `/topics/${params.slug}` : '/topics';
  const name = `${label(topic) || t('Topic', 'विषय')} — ${t('The Signal 24', 'द सिग्नल 24')}`;
  const description = brief?.standfirst[lang] ?? t('Published records on this topic, with sources and verification status visible.', 'इस विषय के प्रकाशित रिकॉर्ड, स्रोत और सत्यापन स्थिति के साथ।');
  // An unknown topic renders NotFound; its effect runs before this one, so this page
  // must not overwrite it with an indexable title.
  useSeo({
    title: brief ? name : t(PAGE_META.notFound.title.en, PAGE_META.notFound.title.hi),
    description: brief ? description : PAGE_META.notFound.description.en,
    canonicalPath: brief ? path : undefined,
    robots: brief ? 'index, follow' : 'noindex, nofollow',
    structuredData: brief ? siteGraph(
      collectionPageNode(topicHref(topic), { name, description, about: { '@type': 'Thing', name: label(topic) }, publisher: organizationRef }, records.filter((story) => story.indexable).map((story) => ({ url: storyPath(story), name: story.title }))),
      breadcrumbNode(topicHref(topic), [[t('Topics', 'विषय'), '/topics'], [label(topic), topicHref(topic)]]),
    ) : undefined,
  });
  if (!brief) return <NotFound />;
  return <main className="signal-page">
    <Header />
    <TopicHero
      back={<Link href="/topics" className="topic-stage-backlink"><ArrowLeft size={13} /> {t('All topic files', 'सभी विषय फ़ाइलें')}</Link>}
      kicker={brief.desk[lang]}
      headline={brief.headline[lang]}
      accent={brief.accent[lang]}
      standfirst={brief.standfirst[lang]}
      stats={[
        { value: records.length, label: t('Records', 'रिकॉर्ड') },
        { value: events.length, label: t('Dated events', 'तारीख़वार घटनाएँ') },
        { value: sourceDocuments.length, label: t('Sources', 'स्रोत') },
        { value: policies.length, label: t('Ledger entries', 'रजिस्टर प्रविष्टियाँ') },
      ]}
      illustration={brief.illustration}
      illustrationAlt={illustration(brief.illustration as IllustrationName).alt}
      exhibits={records.slice(0, 2).map((story) => ({ title: story.title, meta: `${label(story.kind)} · ${label(story.state ?? 'National')}`, lang: story.contentLang }))}
    />
    <TopicBriefSection brief={brief} />
    {brief.figures.length > 0 && <section className="signal-container mt-16 sm:mt-24">
      <div className="mb-6 border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('The numbers on this desk', 'इस डेस्क के आंकड़े')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('No number without its frame.', 'कोई आंकड़ा संदर्भ के बिना नहीं।')}</h2></div>
      <KeyFigures ids={brief.figures} />
    </section>}
    <section className="signal-container mt-16 sm:mt-24" id="topic-records">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t(`${records.length} published ${records.length === 1 ? 'record' : 'records'}`, `${records.length} प्रकाशित रिकॉर्ड`)}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('The reporting.', 'रिपोर्टिंग।')}</h2></div>
        <Link href="/archive" className="signal-kicker text-accent hover:underline">{t('Search the archive', 'अभिलेखागार में खोजें')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      {isLoading ? <LoadingBlock label={t('Assembling the topic record…', 'विषय का रिकॉर्ड तैयार हो रहा है…')} /> :
        isError ? <div className="py-10"><ErrorState message={t('This topic could not be assembled from the archive.', 'अभिलेखागार से यह विषय तैयार नहीं हो सका।')} onRetry={() => void refetch()} /></div> :
          records.length === 0 ? <div className="pt-8"><EmptyState title={t('No published record on this desk yet.', 'इस डेस्क पर अभी कोई प्रकाशित रिकॉर्ड नहीं।')} text={t('The brief above stands on records elsewhere on the site. This desk fills when the reporting clears our standards, not before.', 'ऊपर का ब्रीफ़ साइट के दूसरे रिकॉर्ड पर टिका है। यह डेस्क तब भरेगा जब रिपोर्टिंग हमारे मानकों पर खरी उतरेगी, उससे पहले नहीं।')} /></div> :
            <div>{records.map((story) => <StoryCard key={story.id} story={story} compact={records.length > 3} />)}</div>}
    </section>
    {events.length > 0 && <section className="signal-container mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t('The evidence chain', 'सबूतों की कड़ी')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('Dated, documented, linked.', 'तारीख़वार, दस्तावेज़ी, जुड़ी हुई।')}</h2></div>
        <Link href="/events" className="signal-kicker text-accent hover:underline">{t('All evidence events', 'सभी सबूत घटनाएँ')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">{t('Event titles and summaries are kept in the language of the record they come from. Only links the desk has made are shown; nothing is inferred from sharing a topic.', 'घटनाओं के शीर्षक और सार उसी भाषा में हैं जिसमें मूल रिकॉर्ड है। केवल वे लिंक दिखते हैं जो डेस्क ने जोड़े हैं; एक विषय में होने से कोई संबंध नहीं गढ़ा जाता।')}</p>
      <EvidenceSpine events={events} />
    </section>}
    <TopicPolicies records={policies} />
    {sourceDocuments.length > 0 && <section className="signal-container mt-16 sm:mt-24">
      <div className="border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('Read it yourself', 'ख़ुद पढ़िए')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('Every document this desk relies on.', 'हर वह दस्तावेज़ जिस पर यह डेस्क टिका है।')}</h2></div>
      <ul className="divide-y divide-foreground/15 border-b border-foreground/15">
        {sourceDocuments.map((source) => <li key={source.url} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <span className="text-sm" lang="en">{source.name}</span>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline">{t('Open source', 'स्रोत खोलें')} <ExternalLink size={12} /></a>
        </li>)}
      </ul>
    </section>}
    <section className="signal-container mt-16 border-t border-foreground/20 pt-8 sm:mt-24">
      <p className="signal-kicker text-accent">{t('Other desks', 'दूसरे डेस्क')}</p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">{[...TOPIC_DESK_ORDER.filter((item) => item !== topic).map((item) => [topicHref(item), label(item)] as const), ['/topics/open-category-competition', t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा')] as const].map(([href, text]) => <Link key={href} href={href} className="signal-kicker signal-link">{text}</Link>)}</div>
    </section>
    
  </main>;
}

function TimelinePage() {
  const t = useT();
  const label = useLabel();
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const policyParams = useMemo<GetPoliciesParams>(() => ({ limit: 100 }), []);
  const eventsQuery = useGetEvidenceEvents(archiveParams, { query: { queryKey: getGetEvidenceEventsQueryKey(archiveParams), staleTime: 60_000 } });
  const policyQuery = useGetPolicies(policyParams, {
    query: { queryKey: getGetPoliciesQueryKey(policyParams) },
  });
  const entries = useMemo(() => {
    const policyEntries = (policyQuery.data?.records ?? []).filter((record) => record.sources.length > 0).map((record) => ({
      id: `policy-${record.id}`,
      date: record.effectiveDate || record.publishedOn,
      dateLabel: record.effectiveDate ? t("Effective date", "लागू होने की तिथि") : 'Published',
      kind: 'official' as const,
      visual: imageForText(`${record.slug} ${record.title} ${record.summary} ${record.authority}`) ?? illustration('constitution-amend'),
      label: `Policy record / ${record.status}`,
      title: record.title,
      summary: record.summary,
      source: record.authority,
      href: record.canonicalPath,
    }));
    // Evidence events carry the real dates (1951 onwards); records are reachable from each event.
    const eventEntries = (eventsQuery.data?.events ?? [])
      .filter((item) => Boolean(item.event.recordDate))
      .map((item) => ({
        id: `event-${item.event.id}`,
        date: item.event.recordDate!,
        dateLabel: t('Date of the event', 'घटना की तारीख़'),
        kind: 'record' as const,
        visual: imageForText(`${item.event.title} ${item.event.summary}`) ?? illustration(TOPIC_ILLUSTRATION[item.event.topic] ?? 'magnifier-hero'),
        label: `${label(item.event.topic)} / ${t('Evidence event', 'सबूत घटना')}`,
        title: item.event.title,
        summary: item.event.summary,
        source: [...item.primarySources, ...item.secondarySources].map((source) => source.publisher).slice(0, 2).join(' · ') + ` · ${t(`${item.articleCount} linked records`, `${item.articleCount} जुड़े रिकॉर्ड`)}`,
        href: `/events/${item.event.id}`,
      }));
    const leadEntries = FOCUS_SOURCES.map((source, index) => ({
      id: `lead-${index}`,
      date: source.date,
      dateLabel: 'External publication date',
      kind: 'lead' as const,
      visual: imageForText(`${source.title} ${source.summary} ${source.lane} ${source.place}`) ?? illustration('magnifier-hero'),
      label: `External lead / ${source.lane}`,
      title: source.title,
      summary: source.summary,
      source: `${source.publisher} · ${source.place}`,
      href: source.href,
    }));
    return [...policyEntries, ...eventEntries, ...leadEntries]
      .filter((entry) => entry.date && !Number.isNaN(Date.parse(entry.date)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [eventsQuery.data, policyQuery.data, label, t]);
  useSeo({
    title: t(PAGE_META.timeline.title.en, PAGE_META.timeline.title.hi),
    description: t(PAGE_META.timeline.description.en, PAGE_META.timeline.description.hi),
    canonicalPath: '/timeline',
    structuredData: siteGraph(
      collectionPageNode('/timeline', { name: t(PAGE_META.timeline.title.en, PAGE_META.timeline.title.hi), description: t(PAGE_META.timeline.description.en, PAGE_META.timeline.description.hi), publisher: organizationRef }, entries.filter((entry) => entry.kind !== 'lead' && entry.href.startsWith('/')).map((entry) => ({ url: entry.href, name: entry.title }))),
      breadcrumbNode('/timeline', [['Timeline', '/timeline']]),
    ),
  });
  const hasError = eventsQuery.isError || policyQuery.isError;
  const loading = eventsQuery.isLoading || policyQuery.isLoading;
  const decades = [...new Set(entries.map((entry) => `${entry.date.slice(0, 3)}0`))].sort();
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">{t("The Signal 24 / timeline", "द सिग्नल 24 / समयरेखा")}</p>
      <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.88] tracking-[-.06em] sm:text-8xl">{t("Seventy-five years,", "पचहत्तर साल,")}<br /><em className="font-normal text-accent">{t("in the order it happened.", "उसी क्रम में जैसे हुआ।")}</em></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("An index of dated records, not a complete history. Governments prefer announcements to dates; we prefer dates. Effective dates, publication dates and outside leads are labelled separately, and a headline is never treated as a court finding.", "तारीख़वार रिकॉर्ड की सूची, पूरा इतिहास नहीं। सरकारों को घोषणाएँ पसंद हैं, हमें तारीख़ें। लागू होने की तिथि, प्रकाशन तिथि और बाहरी सुराग अलग-अलग चिह्नित हैं, और किसी सुर्ख़ी को कभी अदालत का निष्कर्ष नहीं माना जाता।")}</p>
    </section>
    <section className="signal-container mt-12 pb-12 sm:mt-16 sm:pb-16">
      {hasError && <p className="signal-note mb-5 p-4 text-sm text-muted-foreground" role="status">{t("Some source lists did not load. The dates below come only from the lists that did.", "कुछ स्रोत सूचियाँ लोड नहीं हुईं। नीचे की तारीख़ें सिर्फ़ उन्हीं सूचियों से हैं जो लोड हुईं।")}</p>}
      {loading ? <LoadingBlock label={t("Assembling dated source entries…", "तारीख़वार प्रविष्टियाँ तैयार हो रही हैं…")} /> :
        !entries.length ? <EmptyState title={t("No dated entries are available.", "कोई तारीख़वार प्रविष्टि उपलब्ध नहीं।")} text={t("The timeline only uses dates attached to published records or attributed external sources.", "समयरेखा सिर्फ़ प्रकाशित रिकॉर्ड या नामित बाहरी स्रोतों से जुड़ी तारीख़ों का इस्तेमाल करती है।")} /> :
          <>
          <nav className="timeline-decades" aria-label={t('Jump to a decade', 'दशक पर जाएँ')}>{decades.map((decade) => <a key={decade} href={`#decade-${decade}`}>{decade}s</a>)}</nav>
          <div className="border-t-2 border-foreground">
            {entries.map((entry, index) => <article key={entry.id} id={index === entries.findIndex((item) => item.date.slice(0, 3) === entry.date.slice(0, 3)) ? `decade-${entry.date.slice(0, 3)}0` : undefined} className="timeline-visual-entry" data-testid={`timeline-entry-${entry.id}`}>
              <time className="font-display text-2xl leading-tight" dateTime={entry.date}>{formatDate(entry.date)}<span className="mt-2 block signal-kicker text-muted-foreground">{entry.dateLabel}</span></time>
              <span className="timeline-dot hidden md:block" />
              <div className="timeline-visual-thumb">{entry.visual ? <img src={entry.visual.src} alt={entry.visual.alt} width={entry.visual.width} height={entry.visual.height} loading="lazy" /> : <div className="story-art-placeholder flex h-full min-h-[140px] items-center justify-center p-5 text-center"><p className="signal-kicker text-accent">{t("No relevant archive image available", "कोई प्रासंगिक अभिलेख चित्र उपलब्ध नहीं")}</p></div>}</div>
              <div className={`border-l-2 pl-5 ${entry.kind === 'lead' ? 'border-secondary' : entry.kind === 'official' ? 'border-ring' : 'border-accent'}`}>
                <p className="signal-kicker">{entry.label}</p>
                <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{entry.kind === 'lead' ? <a href={entry.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{entry.title}</a> : <Link href={entry.href} className="hover:text-accent">{entry.title}</Link>}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
                <p className="mt-4 signal-kicker text-muted-foreground">{entry.source}</p>
                <p className="mt-3 signal-kicker text-accent">{entry.kind === 'lead' ? 'External lead / verify source' : 'View evidence →'}</p>
              </div>
            </article>)}
          </div>
          </>}
      <p className="mt-5 signal-kicker text-muted-foreground">{t("Outside leads are not Signal 24 reporting. Check the court’s own order before relying on any reported update.", "बाहरी सुराग द सिग्नल 24 की रिपोर्टिंग नहीं हैं। किसी ख़बर पर भरोसा करने से पहले अदालत का अपना आदेश देखें।")}</p>
    </section>
  </main>;
}
function SearchPage() {
  const t = useT();
  const label = useLabel();
  const initialQuery = new URLSearchParams(window.location.search).get('q') ?? '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('');
  const [state, setState] = useState('');
  const params = useMemo(() => ({
    ...(query.trim() ? { q: query.trim() } : {}),
    ...(topic ? { topic: topic as Topic } : {}),
    ...(kind ? { kind: kind as StoryKind } : {}),
    ...(state ? { state } : {}),
    limit: 100,
  }), [kind, query, state, topic]);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  useSeo({
    title: t(PAGE_META.search.title.en, PAGE_META.search.title.hi),
    description: t(PAGE_META.search.description.en, PAGE_META.search.description.hi),
    robots: 'noindex, follow',
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = queryInput.trim();
    setQuery(nextQuery);
    const nextUrl = `${basePath}/search${nextQuery ? `?q=${encodeURIComponent(nextQuery)}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
  };
  const clear = () => {
    setQueryInput('');
    setQuery('');
    setTopic('');
    setKind('');
    setState('');
    window.history.replaceState({}, '', `${basePath}/search`);
  };
  const leads = FOCUS_SOURCES.filter((source) => {
    if (!query.trim()) return true;
    const haystack = `${source.title} ${source.publisher} ${source.date} ${source.lane} ${source.place} ${source.summary}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">{t("The Signal 24 / search", "द सिग्नल 24 / खोज")}</p>
      <h1 className="mt-4 max-w-4xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{t("Find the", "खोजिए")}<br /><em className="font-normal text-accent">{t("source record.", "मूल रिकॉर्ड।")}</em></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("Search published records and the separate outside reading list. Every result shows its source and verification status.", "प्रकाशित रिकॉर्ड और अलग बाहरी पठन-सूची में खोजें। हर नतीजे के साथ उसका स्रोत और सत्यापन स्थिति दिखती है।")}</p>
    </section>
    <section className="signal-container archive-grid mt-12 border-y border-foreground/20 py-6 sm:mt-16" aria-label={t("Search records and sources", "रिकॉर्ड और स्रोत खोजें")}>
      <form role="search" onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 border border-foreground/20 bg-card px-3 py-2">
          <Search size={16} className="shrink-0 text-accent" />
          <span className="sr-only">{t("Search records, publishers and topics", "रिकॉर्ड, प्रकाशक और विषय खोजें")}</span>
          <input type="search" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder={t("Judgments, notifications, states, dates…", "फ़ैसले, अधिसूचनाएँ, राज्य, तारीख़ें…")} className="min-h-10 w-full bg-transparent text-sm outline-none" data-testid="input-search-page" />
        </label>
        <button className="signal-button" type="submit" data-testid="button-search-page">{t("Search", "खोजें")}</button>
      </form>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <SelectFilter label={t("Topic", "विषय")} value={topic} options={data?.topics.length ? data.topics : TOPICS} onChange={setTopic} testId="select-search-topic" />
        <SelectFilter label={t("Record type", "रिकॉर्ड का प्रकार")} value={kind} options={data?.kinds.length ? data.kinds : KINDS} onChange={setKind} testId="select-search-kind" />
        <SelectFilter label={t("State", "राज्य")} value={state} options={data?.states.length ? ['All states', ...data.states] : INDIA_STATES} onChange={(value) => setState(value === 'All states' ? '' : value)} testId="select-search-state" />
        <button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-search">{t("Clear filters", "फ़िल्टर हटाएँ")}</button>
      </div>
    </section>
    <section className="signal-container py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/20 pb-4">
        <div><p className="signal-kicker text-accent">{t("01 / Published archive", "01 / प्रकाशित अभिलेखागार")}</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("Signal 24 records", "द सिग्नल 24 के रिकॉर्ड")}</h2></div>
        {data && <p className="signal-kicker text-muted-foreground">{data.stories.length} returned by the archive</p>}
      </div>
      {isLoading ? <div className="py-8"><LoadingBlock label={t("Searching published records…", "प्रकाशित रिकॉर्ड खोजे जा रहे हैं…")} /></div> :
        isError ? <div className="py-8"><ErrorState message={t("Published records could not be searched.", "प्रकाशित रिकॉर्ड खोजे नहीं जा सके।")} onRetry={() => void refetch()} /></div> :
          !data?.stories.length ? <div className="py-8"><EmptyState title={t("No published record matched.", "कोई प्रकाशित रिकॉर्ड नहीं मिला।")} text={t("Try another term or clear a filter. External sources are listed separately below.", "दूसरा शब्द आज़माएँ या फ़िल्टर हटाएँ। बाहरी स्रोत नीचे अलग से दिए गए हैं।")} /></div> :
            <div className="border-t border-foreground/20">{data.stories.map((story) => <StoryCard key={story.id} story={story} compact />)}</div>}
    </section>
    <section className="signal-container pb-12 sm:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/20 py-5">
        <div><p className="signal-kicker text-accent">{t("02 / External leads", "02 / बाहरी सुराग")}</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("A reading list, not Signal 24 reporting", "पढ़ने की सूची, द सिग्नल 24 की रिपोर्टिंग नहीं")}</h2></div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t("These are outside sources gathered for the desk. Their claims are not Signal 24 findings.", "ये डेस्क के लिए जुटाए गए बाहरी स्रोत हैं। इनके दावे द सिग्नल 24 के निष्कर्ष नहीं हैं।")}</p>
      </div>
      {!leads.length ? <p className="py-8 text-sm text-muted-foreground">{t("No outside lead matched this search.", "इस खोज से कोई बाहरी सुराग नहीं मिला।")}</p> :
        <div className="grid gap-x-8 sm:grid-cols-2">
          {leads.map((source) => <article key={source.href} className="story-record-row">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="signal-tag signal-tag--amber">External lead / {source.lane}</span><time className="signal-kicker text-muted-foreground" dateTime={source.date}>{formatDate(source.date)}</time></div>
            <div><h3 className="font-display text-2xl leading-tight">{source.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{source.summary}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-3"><span className="signal-kicker text-muted-foreground">{source.publisher} · {source.place}</span><a href={source.href} target="_blank" rel="noopener noreferrer" className="signal-kicker text-accent hover:underline">{t("Open source", "स्रोत खोलें")} <ExternalLink size={12} className="ml-1 inline" /></a></div></div>
          </article>)}
        </div>}
    </section>
  </main>;
}

function OpenCategoryTopicPage() {
  const t = useT();
  const lang = useLang();
  const brief = TOPIC_BRIEFS['open-category-competition'];
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  const { records: policies } = useBriefPolicies(brief.policies);
  const leads = FOCUS_SOURCES.filter((source) => ['UGC rules', 'Open competition', 'EWS / eligibility'].includes(source.lane));
  const stories = (data?.stories ?? []).filter((story) =>
    story.verificationStatus !== 'unverified' &&
    isFocusStory(story) &&
    /\b(open|unreserved|general.?category|ugc|ews|economically weaker sections)\b/i.test(`${story.title} ${story.dek} ${story.source}`),
  );
  const title = t(PAGE_META.openCategory.title.en, PAGE_META.openCategory.title.hi);
  const description = t(PAGE_META.openCategory.description.en, PAGE_META.openCategory.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/topics/open-category-competition',
    structuredData: siteGraph(
      collectionPageNode('/topics/open-category-competition', { name: title, description, about: { '@type': 'Thing', name: t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा') }, publisher: organizationRef }, stories.filter((story) => story.indexable).map((story) => ({ url: storyPath(story), name: story.title }))),
      breadcrumbNode('/topics/open-category-competition', [[t('Topics', 'विषय'), '/topics'], [t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा'), '/topics/open-category-competition']]),
    ),
  });
  return <main className="signal-page"><Header />
    <TopicHero
      back={<Link href="/topics" className="topic-stage-backlink"><ArrowLeft size={13} /> {t('All topic files', 'सभी विषय फ़ाइलें')}</Link>}
      kicker={t('The Signal 24 / topic file', 'द सिग्नल 24 / विषय फ़ाइल')}
      headline={brief.headline[lang]}
      accent={brief.accent[lang]}
      standfirst={brief.standfirst[lang]}
      stats={[
        { value: stories.length, label: t('Records', 'रिकॉर्ड') },
        { value: policies.length, label: t('Ledger entries', 'रजिस्टर प्रविष्टियाँ') },
        { value: leads.length, label: t('External leads', 'बाहरी सुराग') },
      ]}
      illustration={brief.illustration}
      illustrationAlt={illustration(TOPIC_BRIEFS['open-category-competition'].illustration as IllustrationName).alt}
      exhibits={stories.slice(0, 2).map((story) => ({ title: story.title, meta: story.source, lang: story.contentLang }))}
    />
    <section className="signal-container mt-12 sm:mt-16">
      <div className="signal-note max-w-3xl p-5 sm:p-6">
        <p className="signal-kicker text-accent">{t('Reading rule / evidence boundary', 'पढ़ने का नियम / सबूत की सीमा')}</p>
        <p className="mt-3 text-sm leading-relaxed">{t('A political demand, a litigant’s argument, an interim order and a final judgment are four different things. Headlines blur them. This page keeps them apart, and keeps outside coverage separate from Signal 24 records.', 'राजनीतिक माँग, किसी पक्षकार की दलील, अंतरिम आदेश और अंतिम फ़ैसला चार अलग चीज़ें हैं। सुर्ख़ियाँ इन्हें गड्डमड्ड कर देती हैं। यह पेज इन्हें अलग रखता है, और बाहरी कवरेज को द सिग्नल 24 के रिकॉर्ड से अलग।')}</p>
      </div>
    </section>
    <TopicBriefSection brief={brief} />
    <section className="signal-container mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t('01 / Signal 24 records', '01 / द सिग्नल 24 के रिकॉर्ड')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('Source-linked reporting', 'स्रोत से जुड़ी रिपोर्टिंग')}</h2></div>
        <Link href="/archive" className="signal-kicker text-accent hover:underline">{t('Search all records', 'सभी रिकॉर्ड खोजें')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      {isLoading ? <div className="py-8"><LoadingBlock label={t('Loading topic records…', 'विषय के रिकॉर्ड लोड हो रहे हैं…')} /></div> :
        isError ? <div className="py-8"><ErrorState message={t('Topic records could not be loaded.', 'विषय के रिकॉर्ड लोड नहीं हो सके।')} onRetry={() => void refetch()} /></div> :
          stories.length ? <div>{stories.map((story) => <StoryCard key={story.id} story={story} compact />)}</div> :
            <div className="signal-editorial-section"><p className="signal-kicker text-accent">{t('No Signal 24 record on this subject yet', 'इस विषय पर अभी द सिग्नल 24 का कोई रिकॉर्ड नहीं')}</p><p className="mt-3 max-w-2xl font-display text-2xl leading-tight">{t('Outside coverage is not a substitute for a sourced record. The gap stays visible until the desk fills it.', 'बाहरी कवरेज स्रोत-आधारित रिकॉर्ड का विकल्प नहीं है। जब तक डेस्क इसे न भरे, यह कमी दिखती रहेगी।')}</p></div>}
    </section>
    <section className="signal-container mt-16 sm:mt-24">
      <div className="mb-6 border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('02 / The numbers', '02 / आंकड़े')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('The lines that decide eligibility.', 'वे रेखाएँ जो पात्रता तय करती हैं।')}</h2></div>
      <KeyFigures ids={brief.figures} />
    </section>
    <TopicPolicies records={policies} />
    <section className="signal-container mt-16 pb-4 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/20 py-5">
        <div><p className="signal-kicker text-accent">{t('03 / External leads', '03 / बाहरी सुराग')}</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{t('What to read next', 'आगे क्या पढ़ें')}</h2></div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t('Each link is credited to its publisher. These are leads, not Signal 24 reporting.', 'हर लिंक उसके प्रकाशक के नाम से है। ये सुराग हैं, द सिग्नल 24 की रिपोर्टिंग नहीं।')}</p>
      </div>
      <div className="grid gap-x-8 sm:grid-cols-2">{leads.map((source) => <article key={source.href} className="story-record-row">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="signal-tag signal-tag--amber">{t('External lead', 'बाहरी सुराग')} / {source.lane}</span><time className="signal-kicker text-muted-foreground" dateTime={source.date}>{formatDate(source.date)}</time></div>
        <div><h3 className="font-display text-2xl leading-tight" lang="en">{source.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground" lang="en">{source.summary}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-foreground/15 pt-3"><span className="signal-kicker text-muted-foreground">{source.publisher}</span><a href={source.href} target="_blank" rel="noopener noreferrer" className="signal-kicker text-accent hover:underline">{t('Open source', 'स्रोत खोलें')} <ExternalLink size={12} className="ml-1 inline" /></a></div></div>
      </article>)}</div>
    </section>
    
  </main>;
}
function ArchivePage() {
  const t = useT();
  const label = useLabel();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('');
  const [state, setState] = useState('');
  const [year, setYear] = useState('');
  const [organization, setOrganization] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const params = useMemo(() => ({ ...(query ? { q: query } : {}), ...(topic ? { topic: topic as Topic } : {}), ...(kind ? { kind: kind as StoryKind } : {}), ...(state ? { state } : {}), limit: 100 }), [kind, query, state, topic]);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(params, { query: { queryKey: getGetArchiveQueryKey(params) } });
  useSeo({
    title: t(PAGE_META.archive.title.en, PAGE_META.archive.title.hi),
    description: t(PAGE_META.archive.description.en, PAGE_META.archive.description.hi),
    canonicalPath: '/archive',
    structuredData: siteGraph(
      collectionPageNode('/archive', { name: t(PAGE_META.archive.title.en, PAGE_META.archive.title.hi), description: t(PAGE_META.archive.description.en, PAGE_META.archive.description.hi), publisher: organizationRef }, (data?.stories ?? []).filter((story) => story.indexable).map((story) => ({ url: storyPath(story), name: story.title }))),
      breadcrumbNode('/archive', [['Archive', '/archive']]),
    ),
  });
  const clear = () => { setQuery(''); setTopic(''); setKind(''); setState(''); setYear(''); setOrganization(''); };
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label={t("Indexing records and sources…", "रिकॉर्ड और स्रोत सूचीबद्ध हो रहे हैं…")} /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t("The search index could not be reached.", "खोज सूची तक पहुँच नहीं हो सकी।")} onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState /></div></div>;
  const years = Array.from(new Set(data.stories.map((story) => story.publishedOn?.slice(0, 4)).filter(Boolean))).sort().reverse() as string[];
  const organizations = Array.from(new Set(data.stories.map((story) => story.source).filter(Boolean))).sort();
  const records = data.stories.filter((story) =>
    (!year || story.publishedOn?.startsWith(year)) &&
    (!organization || story.source === organization),
  );
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><div className="max-w-4xl"><p className="signal-kicker text-accent">{t("The Signal 24 / archive", "द सिग्नल 24 / अभिलेखागार")}</p><h1 className="mt-4 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{t("A record you", "एक रिकॉर्ड, जिस पर")}<br /><em className="font-normal text-accent">{t("can return to.", "आप बार-बार लौट सकें।")}</em></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("Every published record in one place: rulings, policy changes, documents and state records. Search it, filter it, check every claim against its source. Governments rely on short memories. This is the long one.", "हर प्रकाशित रिकॉर्ड एक जगह: फ़ैसले, नीतिगत बदलाव, दस्तावेज़ और राज्यों के रिकॉर्ड। खोजिए, छाँटिए, हर दावे को उसके स्रोत से मिलाइए। सरकारें कमज़ोर याददाश्त के भरोसे चलती हैं। यह लंबी याददाश्त है।")}</p></div></section>
    <section className="signal-container archive-grid mt-16 border-y border-foreground/20 py-6 sm:mt-24"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><SlidersHorizontal size={16} className="text-accent" /><p className="signal-kicker">{t("Filter the archive", "अभिलेखागार छाँटें")}</p></div><button type="button" onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground md:hidden" data-testid="button-toggle-filters">{filtersOpen ? 'Hide' : 'Show'} filters <ChevronDown size={14} /></button></div><div className={`${filtersOpen ? 'grid' : 'hidden'} mt-5 gap-3 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_auto]`}><label className="flex items-center gap-2 border border-foreground/20 bg-card px-3 py-2"><Search size={15} className="shrink-0 text-accent" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search title, source or place", "शीर्षक, स्रोत या जगह खोजें")} className="w-full bg-transparent text-sm outline-none" data-testid="input-archive-search" /></label><SelectFilter label={t("Topic", "विषय")} value={topic} options={data.topics.length ? data.topics : TOPICS} onChange={setTopic} testId="select-archive-topic" /><SelectFilter label={t("Record type", "रिकॉर्ड का प्रकार")} value={kind} options={data.kinds.length ? data.kinds : KINDS} onChange={setKind} testId="select-archive-kind" /><SelectFilter label={t("State", "राज्य")} value={state} options={data.states.length ? ['All states', ...data.states] : INDIA_STATES} onChange={(value) => setState(value === 'All states' ? '' : value)} testId="select-archive-state" /><SelectFilter label="Organization / source" value={organization} options={organizations} onChange={setOrganization} testId="select-archive-organization" allLabel="All sources" /><SelectFilter label="Published year" value={year} options={years} onChange={setYear} testId="select-archive-year" /><button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-filters">{t("Clear", "हटाएँ")}</button></div><div className="mt-5 flex items-center justify-between border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{records.length} {records.length === 1 ? 'record' : 'records'} / source labels shown</p>{(query || topic || kind || state || year || organization) && <p className="signal-kicker text-accent">{t("Filtered view", "छाँटा हुआ दृश्य")}</p>}</div></section>
    <section className="signal-container py-12 sm:py-16">{records.length === 0 ? <EmptyState title={t("No record found here.", "यहाँ कोई रिकॉर्ड नहीं मिला।")} text={t("Clear one of the filters and try again. The archive grows with each edition.", "कोई फ़िल्टर हटाकर फिर कोशिश करें। हर सत्यापित रिकॉर्ड के साथ अभिलेखागार बढ़ता है।")} /> : <div className="border-t border-foreground/20">{records.map((story) => <StoryCard key={story.id} story={story} />)}</div>}</section>
  </main>;
}
function PolicySourceCard({ source }: { source: PolicySource }) {
  const t = useT();
  const label = useLabel();
  return <article className="border border-foreground/15 bg-card p-5 sm:p-6" data-testid={`card-policy-source-${source.id}`}>
    <div className="flex items-start justify-between gap-4">
      <span className={`signal-tag ${source.isPrimary ? 'signal-tag--blue' : 'signal-tag--amber'}`}>{source.isPrimary ? 'Primary source' : 'Supporting source'}</span>
      <span className="signal-kicker text-muted-foreground">{source.sourceType}</span>
    </div>
    <h3 className="mt-4 font-display text-2xl leading-tight">{source.title}</h3>
    <p className="mt-3 text-sm text-muted-foreground">{source.publisher}</p>
    <dl className="mt-5 grid gap-2 border-t border-foreground/15 pt-4 text-xs">
      <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">{t("Published", "प्रकाशित")}</dt><dd data-testid={`text-policy-source-published-${source.id}`}>{formatDate(source.publishedOn)}</dd></div>
      <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">{t("Retrieved", "प्राप्त किया")}</dt><dd data-testid={`text-policy-source-retrieved-${source.id}`}>{formatDate(source.retrievedOn)}</dd></div>
    </dl>
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid={`link-policy-source-${source.id}`}>{t("Open source", "स्रोत खोलें")} <ExternalLink size={13} /></a>
  </article>;
}

function PoliciesPage() {
  const t = useT();
  const label = useLabel();
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [sector, setSector] = useState('');
  const [status, setStatus] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const params = useMemo<GetPoliciesParams>(() => ({
    ...(query.trim() ? { q: query.trim() } : {}),
    ...(state ? { state } : {}),
    ...(sector ? { sector } : {}),
    ...(status ? { status } : {}),
    ...(effectiveFrom ? { effectiveFrom } : {}),
    ...(effectiveTo ? { effectiveTo } : {}),
    limit: 100,
  }), [effectiveFrom, effectiveTo, query, sector, state, status]);
  const { data: rawData, isLoading, isError, refetch } = useGetPolicies(params, { query: { queryKey: getGetPoliciesQueryKey(params) } });
  const lang = useLang();
  const data = useMemo(() => rawData ? { ...rawData, records: rawData.records.map((record) => localizePolicy(record, lang)) } : undefined, [rawData, lang]);
  useSeo({
    title: t(PAGE_META.policies.title.en, PAGE_META.policies.title.hi),
    description: t(PAGE_META.policies.description.en, PAGE_META.policies.description.hi),
    canonicalPath: '/policies',
    structuredData: siteGraph(
      collectionPageNode('/policies', { name: t(PAGE_META.policies.title.en, PAGE_META.policies.title.hi), description: t("Every recorded change in reservation policy, with the old rule, the new rule, the legal basis, the court status and the primary sources.", "आरक्षण नीति का हर दर्ज बदलाव: पुराना नियम, नया नियम, क़ानूनी आधार, अदालत में स्थिति और मूल स्रोत।"), publisher: organizationRef }, (data?.records ?? []).map((record) => ({ url: record.canonicalPath, name: record.title }))),
      breadcrumbNode('/policies', [['Policy ledger', '/policies']]),
    ),
  });
  const clear = () => { setQuery(''); setState(''); setSector(''); setStatus(''); setEffectiveFrom(''); setEffectiveTo(''); };
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label={t("Indexing policy records and sources…", "नीति रिकॉर्ड और स्रोत सूचीबद्ध हो रहे हैं…")} /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t("The policy ledger could not be reached.", "नीति रजिस्टर तक पहुँच नहीं हो सकी।")} onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState title={t("The policy ledger is not available.", "नीति रजिस्टर उपलब्ध नहीं है।")} /></div></div>;
  const activeFilters = Boolean(query || state || sector || status || effectiveFrom || effectiveTo);
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <div className="max-w-4xl"><p className="signal-kicker text-accent">{t("The Signal 24 / policy ledger", "द सिग्नल 24 / नीति रजिस्टर")}</p><h1 className="mt-4 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{t("What changed,", "क्या बदला,")}<br /><em className="font-normal text-accent">{t("and who decided?", "और किसने तय किया?")}</em></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("A permanent record of every reservation policy change we track: what the rule was, what it became, who changed it, and whether it survived in court. Several did not.", "हर उस आरक्षण नीति-बदलाव का स्थायी रिकॉर्ड जिस पर हम नज़र रखते हैं: नियम क्या था, क्या बना, किसने बदला, और अदालत में टिका या नहीं। कई नहीं टिके।")}</p></div>
    </section>
    <section className="signal-container archive-grid mt-16 border-y border-foreground/20 py-6 sm:mt-24" aria-label={t("Filter policy ledger", "नीति रजिस्टर छाँटें")}>
      <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><SlidersHorizontal size={16} className="text-accent" /><p className="signal-kicker">{t("Filter the ledger", "रजिस्टर छाँटें")}</p></div><button type="button" onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground md:hidden" data-testid="button-toggle-policy-filters">{filtersOpen ? 'Hide' : 'Show'} filters <ChevronDown size={14} /></button></div>
      <div className={`${filtersOpen ? 'grid' : 'hidden'} mt-5 gap-3 md:grid md:grid-cols-[1.7fr_1fr_1fr_1fr_1fr_1fr_auto]`}>
        <label className="flex items-center gap-2 border border-foreground/20 bg-card px-3 py-2"><Search size={15} className="shrink-0 text-accent" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search title, authority or framework", "शीर्षक, प्राधिकारी या ढाँचा खोजें")} className="w-full bg-transparent text-sm outline-none" data-testid="input-policy-search" /></label>
        <SelectFilter label={t("State", "राज्य")} value={state} options={data.states} onChange={setState} testId="select-policy-state" />
        <SelectFilter label={t("Sector", "क्षेत्र")} value={sector} options={data.sectors} onChange={setSector} testId="select-policy-sector" />
        <SelectFilter label={t("Status", "स्थिति")} value={status} options={data.statuses} onChange={setStatus} testId="select-policy-status" />
        <label className="border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">{t("Effective from", "कब से लागू")}</span><input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="input-policy-effective-from" /></label>
        <label className="border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">{t("Effective to", "कब तक लागू")}</span><input type="date" value={effectiveTo} onChange={(event) => setEffectiveTo(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="input-policy-effective-to" /></label>
        <button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-policy-filters">{t("Clear", "हटाएँ")}</button>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground" data-testid="text-policy-result-count">{data.records.length} {data.records.length === 1 ? 'record' : 'records'} / source-linked</p>{activeFilters && <p className="signal-kicker text-accent">{t("Filtered view", "छाँटा हुआ दृश्य")}</p>}</div>
    </section>
    <section className="signal-container py-12 sm:py-16">
      {data.records.length === 0 ? <EmptyState title={t("No policy record found here.", "यहाँ कोई नीति रिकॉर्ड नहीं मिला।")} text={t("Clear one of the filters and try again. New entries appear only when their source record is ready.", "कोई फ़िल्टर हटाकर फिर कोशिश करें। नई प्रविष्टियाँ तभी आती हैं जब उनका स्रोत रिकॉर्ड तैयार हो।")} /> : <div className="border-t border-foreground/20">{data.records.map((record) => <Link href={record.canonicalPath} key={record.id} className="group grid gap-5 border-b border-foreground/20 py-7 md:grid-cols-[.85fr_1.4fr_.8fr] md:gap-10" data-testid={`link-policy-record-${record.id}`}><div><p className="signal-kicker text-accent">{record.state ?? 'National'} / {record.sector}</p><p className="mt-2 signal-kicker text-muted-foreground">{record.status}</p></div><div><h2 className="font-display text-3xl leading-tight tracking-[-.025em] group-hover:text-accent sm:text-4xl">{record.title}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{record.summary}</p></div><div className="md:border-l md:border-foreground/15 md:pl-6"><p className="signal-kicker text-muted-foreground">{t("Effective date", "लागू होने की तिथि")}</p><p className="mt-2 font-display text-xl" data-testid={`text-policy-effective-date-${record.id}`}>{formatDate(record.effectiveDate)}</p><p className="mt-4 signal-kicker text-accent">{t("Authority", "प्राधिकारी")}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{record.authority}</p></div></Link>)}</div>}
    </section>
  </main>;
}

function PolicyDetail() {
  const t = useT();
  const label = useLabel();
  const params = useParams<{ slug?: string }>();
  const slug = params.slug ?? '';
  const { data: rawRecord, isLoading, isError, refetch } = useGetPolicy(slug, { query: { enabled: Boolean(slug), queryKey: getGetPolicyQueryKey(slug) } });
  const lang = useLang();
  const record = useMemo(() => rawRecord ? localizePolicy(rawRecord, lang) : undefined, [rawRecord, lang]);
  const note = record ? POLICY_NOTES[record.slug] : undefined;
  const structuredData = useMemo(() => {
    if (!record) return null;
    const path = record.canonicalPath;
    const primarySources = record.sources.filter((source) => source.isPrimary);
    return siteGraph(
      webPageNode(path, { name: `${record.title} — The Signal 24`, description: record.summary, primaryImageOfPage: imageObject() }),
      {
        // A source-linked explainer about a policy change, not the legal instrument itself,
        // so Article + about/spatialCoverage rather than Legislation.
        '@type': 'Article',
        '@id': `${path}#policy`,
        headline: record.title,
        description: record.summary,
        url: path,
        mainEntityOfPage: { '@id': `${path}#webpage` },
        image: [imageObject()],
        datePublished: record.publishedOn,
        dateModified: record.publishedOn,
        author: editorialDeskRef,
        publisher: organizationRef,
        isPartOf: websiteRef,
        inLanguage: SITE_LANGUAGE,
        isAccessibleForFree: true,
        articleSection: 'Policy ledger',
        keywords: [record.sector, record.status, record.state ?? 'National', record.authority].filter(Boolean).join(', '),
        about: { '@type': 'Thing', name: `${record.sector} reservation policy` },
        spatialCoverage: placeForState(record.state),
        ...(primarySources.length ? { isBasedOn: primarySources.map((source) => source.url) } : {}),
        ...(record.sources.length ? { citation: record.sources.map((source) => externalDocument({ title: source.title, url: source.url, publisher: source.publisher, datePublished: source.publishedOn, genre: source.sourceType })) } : {}),
      },
      editorialDeskNode,
      breadcrumbNode(path, [['Policy ledger', '/policies'], [record.title, path]]),
    );
  }, [record]);
  useSeo({
    title: record ? `${record.title} — The Signal 24` : 'Policy record — The Signal 24',
    description: record?.summary ?? 'A source-linked policy record from The Signal 24.',
    canonicalPath: record?.canonicalPath,
    robots: record ? 'index, follow' : 'noindex, follow',
    translated: record?.isTranslated ?? true,
    type: record ? 'article' : 'website',
    structuredData,
  });
  if (!slug) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t("That policy address is not valid.", "यह नीति पता मान्य नहीं है।")} /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label={t("Opening the permanent policy record…", "स्थायी नीति रिकॉर्ड खुल रहा है…")} /></div>;
  if (isError || !record) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t("This policy record may have moved or is not published yet.", "यह नीति रिकॉर्ड शायद हट गया है या अभी प्रकाशित नहीं हुआ।")} onRetry={() => void refetch()} /></div></div>;
  return <main className="signal-page"><Header />
    <article className="signal-container py-12 sm:py-20">
      <Link href="/policies" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground" data-testid="link-back-policy-ledger"><ArrowLeft size={13} /> {t("Back to the policy ledger", "नीति रजिस्टर पर लौटें")}</Link>
      <header className="mt-12 border-b border-foreground/20 pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 signal-kicker text-accent"><span>{record.state ?? 'National'}</span><span>{record.sector}</span><span className="text-muted-foreground">{record.status}</span></div>
        <h1 className="mt-5 max-w-5xl font-display text-5xl leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-8xl" data-testid="heading-policy">{record.title}</h1>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl" data-testid="text-policy-summary">{record.summary}</p>
        <div className="mt-8 grid gap-4 border-l-2 border-accent pl-4 sm:grid-cols-3 sm:gap-8 sm:pl-5">
          <div><p className="signal-kicker text-accent">{t("Effective date", "लागू होने की तिथि")}</p><p className="mt-2 font-display text-2xl" data-testid="text-policy-detail-effective-date">{formatDate(record.effectiveDate)}</p></div>
          <div><p className="signal-kicker text-accent">{t("Published", "प्रकाशित")}</p><p className="mt-2 font-display text-2xl">{formatDate(record.publishedOn)}</p></div>
          <div><p className="signal-kicker text-accent">{t("Permanent link", "स्थायी लिंक")}</p><p className="mt-2 break-all font-mono-signal text-xs text-muted-foreground">{record.canonicalPath}</p></div>
        </div>
      </header>
      <section className="grid gap-8 border-b border-foreground/20 py-10 sm:py-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div><p className="signal-kicker text-accent">{t("01 / What changed", "01 / क्या बदला")}</p><h2 className="mt-3 font-display text-4xl leading-[.96]">{t("The framework,", "ढाँचा,")}<br /><em className="font-normal text-accent">{t("before and after.", "पहले और बाद में।")}</em></h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("The earlier rule stays on the record, so a change is explained, not just announced.", "पुराना नियम रिकॉर्ड पर बना रहता है, ताकि बदलाव सिर्फ़ घोषित न हो, समझाया भी जाए।")}</p></div>
        <div className="grid gap-6 sm:grid-cols-2"><div className="border-t-2 border-foreground/25 pt-4"><p className="signal-kicker text-muted-foreground">{t("Previous framework", "पुराना ढाँचा")}</p><p className="mt-4 font-display text-2xl leading-tight" data-testid="text-policy-previous-framework">{record.previousFramework}</p></div><div className="border-t-2 border-accent pt-4"><p className="signal-kicker text-accent">{t("New framework", "नया ढाँचा")}</p><p className="mt-4 font-display text-2xl leading-tight" data-testid="text-policy-new-framework">{record.newFramework}</p></div></div>
      </section>
      <section className="grid gap-8 border-b border-foreground/20 py-10 sm:py-14 lg:grid-cols-3 lg:gap-8">
        <div><p className="signal-kicker text-accent">{t("Authority", "प्राधिकारी")}</p><p className="mt-3 text-base leading-relaxed" data-testid="text-policy-authority">{record.authority}</p></div>
        <div><p className="signal-kicker text-accent">{t("Legal basis", "क़ानूनी आधार")}</p><p className="mt-3 text-base leading-relaxed" data-testid="text-policy-legal-basis">{record.legalBasis}</p></div>
        <div><p className="signal-kicker text-accent">{t("Court status", "अदालत में स्थिति")}</p><p className="mt-3 text-base leading-relaxed" data-testid="text-policy-court-status">{record.courtStatus}</p></div>
      </section>
      {note && <section className="grid gap-8 border-b border-foreground/20 py-10 sm:py-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-16" data-testid="section-policy-why">
        <div><p className="signal-kicker text-accent">{t('Why it matters', 'यह क्यों मायने रखता है')}</p><h2 className="mt-3 font-display text-4xl leading-[.96]">{t('What this changed,', 'इससे क्या बदला,')}<br /><em className="font-normal text-accent">{t('and what it left open.', 'और क्या खुला छोड़ा।')}</em></h2></div>
        <div>
          <p className="text-lg leading-[1.75]">{t(note.why.en, note.why.hi)}</p>
          <div className="record-panel is-questions mt-8"><p className="record-panel-title">{t('Questions still unanswered', 'जिन सवालों का जवाब अब तक नहीं')}</p><ol>{note.questions.map((question, index) => <li key={question.en}><span className="record-panel-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{t(question.en, question.hi)}</span></li>)}</ol></div>
        </div>
      </section>}
      <section className="pt-10 sm:pt-14">
        <div className="flex flex-col justify-between gap-4 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">{t("02 / Primary sources", "02 / मूल स्रोत")}</p><h2 className="mt-3 font-display text-4xl leading-none">{t("Read the documents.", "दस्तावेज़ पढ़िए।")}</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t("Publication and retrieval dates stay attached to every source, so the record can be rechecked at any time.", "हर स्रोत के साथ उसके प्रकाशन और प्राप्ति की तारीख़ जुड़ी रहती है, ताकि रिकॉर्ड कभी भी दोबारा जाँचा जा सके।")}</p></div>
        {record.sources.length === 0 ? <div className="pt-8"><EmptyState title={t("No sources are attached to this record.", "इस रिकॉर्ड से कोई स्रोत नहीं जुड़ा है।")} text={t("This policy record is not ready to carry a source claim.", "यह नीति रिकॉर्ड अभी किसी स्रोत-आधारित दावे के लिए तैयार नहीं है।")} /></div> : <div className="grid gap-4 py-8 md:grid-cols-2">{record.sources.map((source) => <PolicySourceCard key={source.id} source={source} />)}</div>}
      </section>
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/20 pt-5"><p className="signal-kicker text-muted-foreground">End of policy record / {record.id}</p><Link href="/policies" className="inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-policy-ledger-bottom">{t("Return to the ledger", "रजिस्टर पर लौटें")} <ArrowUpRight size={13} /></Link></footer>
    </article>
  </main>;
}

function SelectFilter({ label, value, options, onChange, testId, allLabel }: { label: string; value: string; options: string[]; onChange: (value: string) => void; testId: string; allLabel?: string }) {
  const t = useT();
  const valueLabel = useLabel();
  return <label className="relative border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-transparent pt-1 text-sm outline-none" data-testid={testId}><option value="">{allLabel ?? t(`All ${label.toLowerCase()}`, 'सभी')}</option>{options.filter(Boolean).map((option) => <option key={option} value={option}>{valueLabel(option)}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 bottom-3 text-muted-foreground" /></label>;
}

function ReadingProgress() {
  const t = useT();
  const label = useLabel();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return <div className="reading-progress lg:hidden" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>;
}

function ShareStory({ story }: { story: Story }) {
  const t = useT();
  const label = useLabel();
  const [status, setStatus] = useState('');
  async function share() {
    const url = window.location.href;
    const payload = { title: story.title, text: story.dek, url };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(url);
        setStatus('Link copied');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setStatus('Link copied');
      } catch {
        setStatus('Copy unavailable');
      }
    }
  }
  return <div className="share-row" aria-live="polite"><WhatsAppShare title={story.title} summary={story.dek} path={storyPath(story)} testId={`link-share-whatsapp-${story.id}`} /><button type="button" className="share-button" onClick={() => void share()} data-testid={`button-share-story-${story.id}`}><Link2 size={13} /> {t("Share record", "रिकॉर्ड साझा करें")}</button>{status && <span className="signal-kicker text-accent" data-testid={`status-share-story-${story.id}`}>{status}</span>}</div>;
}

function StoryDetail() {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const params = useParams<{ id?: string; family?: string; slug?: string }>();
  const slugId = Number(params.slug?.match(/-(\d+)$/)?.[1]);
  const storyId = Number(params.id ?? slugId);
  const { data: rawStory, isLoading, isError, refetch } = useGetStory(storyId, { query: { enabled: Number.isFinite(storyId), queryKey: getGetStoryQueryKey(storyId) } });
  const story = useMemo(() => rawStory ? localizeStory(rawStory, lang) : undefined, [rawStory, lang]);
  const relatedParams = useMemo(() => ({ limit: 100 }), []);
  const relatedQuery = useLocalizedArchive(relatedParams, { query: { queryKey: getGetArchiveQueryKey(relatedParams), staleTime: 60_000 } });
  const isOpinion = story?.kind === 'Opinion';
  const storyAuthor = authorByName(story?.byline);
  const seo = useMemo(() => story ? storySeo(story, lang) : null, [story, lang]);
  useSeo(seo ?? {
    title: t('Record — The Signal 24', 'रिकॉर्ड — द सिग्नल 24'),
    description: t('A source record from The Signal 24.', 'द सिग्नल 24 का एक स्रोत-आधारित रिकॉर्ड।'),
    robots: 'noindex, follow',
  });
  if (!Number.isFinite(storyId)) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t('That record address is not valid.', 'यह रिकॉर्ड पता मान्य नहीं है।')} /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label={t("Opening the record. Unlike some, we don’t need a committee for that…", "रिकॉर्ड खुल रहा है। हमें इसके लिए किसी समिति की ज़रूरत नहीं…")} /></div>;
  if (isError || !story) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t('This record may have moved or is not published yet.', 'यह रिकॉर्ड शायद हट गया है या अभी प्रकाशित नहीं हुआ।')} onRetry={() => void refetch()} /></div></div>;
  const outline = outlineOf(story.body);
  // The single-record endpoint carries no evidence counts; the archive listing does.
  const listed = relatedQuery.data?.stories.find((item) => item.id === story.id);
  const eventCount = listed?.eventCount ?? story.eventCount ?? 0;
  const sourceCount = listed?.sourceCount ?? story.sourceCount ?? 0;
  const related = (relatedQuery.data?.stories ?? []).filter((item) => item.id !== story.id && item.topic === story.topic).slice(0, 3);
  const moreRelated = related.length < 3 ? (relatedQuery.data?.stories ?? []).filter((item) => item.id !== story.id && item.topic !== story.topic && !related.includes(item)).slice(0, 3 - related.length) : [];
  const keepReading = [...related, ...moreRelated];
  const byline = label(story.byline) || (isOpinion ? t('The Signal 24 editorial board', 'द सिग्नल 24 संपादकीय बोर्ड') : t('The Signal 24 editorial desk', 'द सिग्नल 24 संपादकीय डेस्क'));
  return <main className="signal-page">
    <Header />
    <ReadingProgress />
    <article className="article-shell">
      <header className="article-head signal-container">
        <nav className="article-crumbs" aria-label={t('Breadcrumb', 'ब्रेडक्रंब')}>
          <Link href={isOpinion ? '/opinion' : `/topics/${encodeURIComponent(story.topic)}`} data-testid="link-back-archive">{isOpinion ? label('Opinion') : label(story.topic)}</Link>
          <span aria-hidden="true">/</span>
          <span>{label(story.kind)}</span>
          {story.state && story.state !== 'National' && <><span aria-hidden="true">/</span><Link href={`/state/${slugify(story.state)}`}>{label(story.state)}</Link></>}
        </nav>
        <div className="article-head-grid">
          <div>
            {isOpinion && <div className="mb-5 flex flex-wrap items-center gap-3"><span className="opinion-label">{label('Opinion')}</span><span className="signal-kicker text-muted-foreground">{t('A signed viewpoint, separate from our reporting', 'हस्ताक्षरित राय, हमारी रिपोर्टिंग से अलग')}</span></div>}
            <h1 lang={story.contentLang} className="article-title" data-testid="heading-story">{story.title}</h1>
            <p lang={story.contentLang} className="article-dek">{story.dek}</p>
            <div className="article-byline">
              <Link href={storyAuthor ? authorPath(storyAuthor) : EDITORIAL_DESK_PATH} className="article-byline-name" rel="author">{t('By', 'लेखक:')} {byline}</Link>
              <span>{formatDate(story.publishedOn ?? story.recordDate)}</span>
              <span>{t(`${story.read} min read`, `${story.read} मिनट`)}</span>
              <span className={`article-verify is-${story.verificationStatus}`}><ShieldCheck size={14} /> {verificationLabel(story.verificationStatus)}</span>
            </div>
            <div className="mt-5"><ShareStory story={story} /></div>
          </div>
          <figure className="article-art">
            <StoryArt story={story} className="aspect-[4/3] w-full" showCredit={false} />
            <figcaption>{imageCaptionForStory(story)}</figcaption>
          </figure>
        </div>
      </header>
      {!story.isTranslated && <p className="translation-notice signal-container mt-8" role="note" data-testid="note-untranslated">हिंदी संस्करण अभी तैयार हो रहा है। नीचे मूल अंग्रेज़ी रिकॉर्ड है। <span className="text-muted-foreground">The Hindi edition of this record is being translated; the original English follows.</span></p>}
      {story.correctionNote && <div className="signal-container mt-8"><div className="signal-callout max-w-3xl px-5 py-4"><p className="signal-kicker text-accent">{t('Correction note', 'सुधार सूचना')}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground" lang="en">{story.correctionNote}</p></div></div>}
      <div className="article-layout signal-container">
        <aside className="article-toc" aria-label={t('In this record', 'इस रिकॉर्ड में')}>
          {outline.length > 1 && <nav className="article-toc-inner">
            <p className="article-rail-heading">{t('In this record', 'इस रिकॉर्ड में')}</p>
            <ol>{outline.map((item) => <li key={item.id} className={`is-${item.kind}`}><a href={`#${item.id}`}>{item.text}</a></li>)}</ol>
            <a href="#record-evidence" className="article-toc-evidence">{t('The evidence', 'सबूत')} ↓</a>
          </nav>}
        </aside>
        <div id="record-body" lang={story.contentLang} className="story-body article-body" data-testid="text-story-body">
          <RichBody body={story.body} dropCap={!isOpinion} />
          <div className="article-end">
            <p className="signal-kicker text-muted-foreground">{t('End of record', 'रिकॉर्ड समाप्त')} / <span lang="en">{story.source}</span></p>
            <div className="flex flex-wrap items-center gap-4">
              {story.sourceUrl && <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 signal-kicker text-accent" data-testid="link-open-source-bottom">{t('Read the source', 'स्रोत पढ़ें')} <ExternalLink size={13} /></a>}
              <Link href="/editorial-standards#corrections" className="signal-kicker text-muted-foreground hover:text-accent" data-testid="link-report-correction">{t('Report a correction', 'सुधार बताएँ')}</Link>
            </div>
          </div>
        </div>
        <aside className="article-rail">
          <div className="article-rail-sticky">
            <p className="article-rail-heading">{t('At a glance', 'एक नज़र में')}</p>
            <dl className="article-glance">
              <div><dt>{t('Desk', 'डेस्क')}</dt><dd><Link href={`/topics/${encodeURIComponent(story.topic)}`}>{label(story.topic)}</Link></dd></div>
              <div><dt>{t('Where', 'कहाँ')}</dt><dd>{label(story.state ?? 'National')}</dd></div>
              <div><dt>{t('Evidence', 'सबूत')}</dt><dd><a href="#record-evidence">{t(`${eventCount} events · ${sourceCount} sources`, `${eventCount} घटनाएँ · ${sourceCount} स्रोत`)}</a></dd></div>
              <div><dt>{t('Status', 'स्थिति')}</dt><dd>{verificationLabel(story.verificationStatus)}</dd></div>
            </dl>
            <div id="record-source" className="mt-5"><SourceLine story={story} /></div>
            <Link href={`/community?ask=${encodeURIComponent(story.title)}`} className="article-rail-cta">{t('Discuss this, anonymously', 'इस पर चर्चा करें, गुमनाम रूप से')} <ArrowUpRight size={14} /></Link>
          </div>
        </aside>
      </div>
      <section id="record-evidence" className="signal-container article-evidence">
        <ArticleEvidenceSection storyId={story.id} />
        {story.aiDisclosure && <div className="signal-note mt-8 max-w-3xl px-5 py-4"><p className="signal-kicker text-accent">{t('How this record was made', 'यह रिकॉर्ड कैसे बना')}</p><p className="mt-2 text-sm leading-relaxed text-foreground/80" lang="en">{story.aiDisclosure}</p></div>}
      </section>
      <Suspense fallback={null}><ArticleTerms text={`${story.title} ${story.dek} ${story.body ?? ''}`} /></Suspense>
      <Suspense fallback={null}><TopicAnswers topic={story.topic} /></Suspense>
      <section className="signal-container article-next" aria-labelledby="keep-reading-title">
        <div className="article-next-grid">
          <div className="article-next-cta">
            <p className="signal-kicker text-accent">{t('Your turn', 'आपकी बारी')}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight">{t('Know something the record doesn’t?', 'कुछ ऐसा जानते हैं जो रिकॉर्ड में नहीं है?')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('Ask a question or answer one in the community room. No account, no name required. Documents beat anecdotes.', 'समुदाय कक्ष में सवाल पूछिए या किसी का जवाब दीजिए। न खाता, न नाम ज़रूरी। दस्तावेज़ क़िस्सों से बेहतर हैं।')}</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link href={`/community?ask=${encodeURIComponent(story.title)}`} className="signal-button">{t('Start a discussion', 'चर्चा शुरू करें')}</Link><Link href="/answers" className="signal-button is-ghost">{t('Browse Answers', 'जवाब देखें')}</Link></div>
          </div>
          {keepReading.length > 0 && <div>
            <h2 id="keep-reading-title" className="signal-kicker text-accent">{t('Keep reading', 'आगे पढ़ें')}</h2>
            <div className="mt-4 grid gap-4">{keepReading.map((item) => <Link key={item.id} href={storyPath(item)} className="article-next-card group"><div className="article-next-thumb"><StoryArt story={item} className="h-full" showCredit={false} /></div><div><p className="signal-kicker text-muted-foreground">{label(item.topic)} / {label(item.kind)}</p><p lang={item.contentLang} className="mt-1 font-display text-xl leading-snug group-hover:text-accent">{item.title}</p></div></Link>)}</div>
          </div>}
        </div>
      </section>
    </article>
  </main>;
}

function AboutPage() {
  return <InfoPage page="about" />;
}

function StandardsPage() {
  return <InfoPage page="standards" />;
}

function MethodologyPage() {
  return <InfoPage page="methodology" />;
}

function AuthorPage() {
  const params = useParams<{ slug?: string }>();
  if (params.slug === 'signal-24') return <EditorialDeskPage />;
  const author = authorBySlug(params.slug);
  if (!author) return <NotFound />;
  return <AuthorProfilePage key={author.slug} author={author} />;
}

function authorInitials(author: Author) {
  return author.name.en.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

/** "Who writes here": every named author, linked to their profile. */
function AuthorsSection({ exclude }: { exclude?: string }) {
  const t = useT();
  const lang = useLang();
  const people = AUTHORS.filter((author) => author.slug !== exclude);
  return <section className="signal-container hp-section" aria-labelledby="authors-title">
    <SectionHead id="authors-title" kicker={t('Who writes here', 'यहाँ कौन लिखता है')} title={exclude ? t(<>The rest of <em>the desk.</em></>, <>डेस्क के <em>बाक़ी लोग।</em></>) : t(<>Names on the record. <em>Answerable for it.</em></>, <>रिकॉर्ड पर नाम। <em>उसकी जवाबदेही के साथ।</em></>)} />
    <p className="mt-5 max-w-3xl text-[.95rem] leading-relaxed text-muted-foreground">{t('These are pen names of The Signal 24 desk, one for each beat, not the names of individual journalists. Records are drafted with AI assistance from the sources they cite and corrected in public.', 'ये द सिग्नल 24 डेस्क के उपनाम हैं, हर बीट के लिए एक, अलग-अलग पत्रकारों के नाम नहीं। रिकॉर्ड उन स्रोतों से एआई की मदद से लिखे जाते हैं जिनका वे हवाला देते हैं, और सुधार सार्वजनिक रूप से किए जाते हैं।')} <Link href="/editorial-standards" className="text-accent underline underline-offset-2">{t('How bylines work', 'नाम कैसे तय होते हैं')}</Link></p>
    <ul className="author-grid">
      {people.map((author) => <li key={author.slug}><Link href={authorPath(author)} className="author-card group" data-testid={`link-author-${author.slug}`}>
        <span className="author-monogram is-small" aria-hidden="true">{authorInitials(author)}</span>
        <span className="author-card-body">
          <span className="author-card-name group-hover:text-accent">{author.name[lang]}</span>
          <span className="author-card-role">{author.role[lang]}</span>
          <span className="author-card-beat">{author.beat[lang]}</span>
        </span>
      </Link></li>)}
    </ul>
  </section>;
}

function AuthorProfilePage({ author }: { author: Author }) {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading } = useLocalizedArchive(archiveParams, { query: { queryKey: getGetArchiveQueryKey(archiveParams), staleTime: 60_000 } });
  const records = (data?.stories ?? []).filter((story) => story.byline === author.name.en && story.workflowStatus === 'published');
  const meta = authorMeta(author, lang);
  const structuredData = useMemo(() => authorPageStructuredData(author, lang), [author, lang]);
  useSeo({ title: meta.title, description: meta.description, canonicalPath: authorPath(author), type: 'profile', structuredData });
  return <main className="signal-page"><Header />
    <section className="signal-container author-head">
      <nav className="article-crumbs" aria-label={t('Breadcrumb', 'ब्रेडक्रंब')}><Link href="/about">{t('About', 'परिचय')}</Link><span aria-hidden="true">/</span><span>{t('Authors', 'लेखक')}</span></nav>
      <div className="author-head-grid">
        <span className="author-monogram" aria-hidden="true">{authorInitials(author)}</span>
        <div>
          <p className="signal-kicker text-accent">{author.role[lang]} · {t('The Signal 24', 'द सिग्नल 24')}</p>
          <h1 className="author-name" data-testid="heading-author">{author.name[lang]}</h1>
          <p className="author-beat">{author.beat[lang]}</p>
          <p className="author-pen-note" data-testid="text-pen-name-note">{PEN_NAME_NOTE[lang]}</p>
        </div>
      </div>
    </section>
    <section className="signal-container author-body">
      <div className="author-bio">
        <h2 className="signal-kicker text-accent">{t('About', 'परिचय')}</h2>
        <p>{author.bio[lang]}</p>
        <h2 className="signal-kicker text-accent">{t('Before a record goes out under this name', 'इस नाम से रिकॉर्ड छपने से पहले')}</h2>
        <p>{author.method[lang]}</p>
      </div>
      <aside className="author-facts" aria-label={t('At a glance', 'एक नज़र में')}>
        <dl>
          <div><dt>{t('Desk', 'डेस्क')}</dt><dd>{author.topics.map((topic, index) => <span key={topic}>{index > 0 && ', '}<Link href={`/topics/${encodeURIComponent(topic)}`}>{label(topic)}</Link></span>)}</dd></div>
          {!isLoading && <div><dt>{t('Records signed', 'हस्ताक्षरित रिकॉर्ड')}</dt><dd>{records.length}</dd></div>}
          <div><dt>{t('Corrections', 'सुधार')}</dt><dd><Link href="/editorial-standards#corrections">{t('Logged in public, with the date', 'सार्वजनिक रूप से, तारीख़ के साथ')}</Link></dd></div>
        </dl>
      </aside>
    </section>
    <section className="signal-container hp-section" aria-labelledby="author-records-title">
      <SectionHead id="author-records-title" kicker={t('On the record', 'रिकॉर्ड पर')} title={t(<>Signed by {author.name.en}.</>, <>{author.name.hi} के हस्ताक्षर से।</>)} />
      {isLoading ? <LoadingBlock /> : records.length ? <div className="mt-2">{records.map((story) => <StoryCard key={story.id} story={story} compact />)}</div> : <EmptyState title={t('No published records under this name yet.', 'इस नाम से अभी कोई प्रकाशित रिकॉर्ड नहीं।')} />}
    </section>
    <AuthorsSection exclude={author.slug} />
  </main>;
}

function EditorialDeskPage() {
  const t = useT();
  const path = EDITORIAL_DESK_PATH;
  const title = t(PAGE_META.editorialDesk.title.en, PAGE_META.editorialDesk.title.hi);
  const description = t(PAGE_META.editorialDesk.description.en, PAGE_META.editorialDesk.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: path,
    // The desk is a department of the publisher, not a person, so ProfilePage → Organization.
    structuredData: siteGraph(
      webPageNode(EDITORIAL_DESK_PATH, { name: title, description, mainEntity: editorialDeskRef }, 'ProfilePage'),
      { ...editorialDeskNode, description: 'The editorial desk responsible for sourcing, reviewing and presenting the Signal 24 archive.', publishingPrinciples: '/editorial-standards' },
      breadcrumbNode(EDITORIAL_DESK_PATH, [[t('Editorial desk', 'संपादकीय डेस्क'), EDITORIAL_DESK_PATH]]),
    ),
  });
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><p className="signal-kicker text-accent">{t('The Signal 24 / editorial desk', 'द सिग्नल 24 / संपादकीय डेस्क')}</p><h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{t(<>The desk<br /><em className="font-normal text-accent">that signs off.</em></>, <>वह डेस्क,<br /><em className="font-normal text-accent">जो ज़िम्मेदारी लेती है।</em></>)}</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p></section><section className="signal-container mt-16 border-y border-foreground/20 py-10 sm:mt-24 sm:py-14"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="signal-kicker text-accent">{t('A byline is a responsibility', 'नाम का मतलब ज़िम्मेदारी')}</p><h2 className="mt-3 font-display text-4xl leading-tight">{t('Who answers for each record.', 'हर रिकॉर्ड के लिए कौन जवाबदेह है।')}</h2></div><p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{t('Every record carries the pen name of the desk that answers for it, a linked primary source and a verification label. Editorials are signed by the editorial board. When we are wrong, the correction appears on the record with the date it was made.', 'हर रिकॉर्ड पर उस डेस्क का उपनाम होता है जो उसके लिए जवाबदेह है, साथ में मूल स्रोत का लिंक और सत्यापन का लेबल। संपादकीय पर संपादकीय बोर्ड के हस्ताक्षर होते हैं। जब हम ग़लत होते हैं, तो सुधार उसी रिकॉर्ड पर तारीख़ के साथ दर्ज होता है।')}</p></div></section><AuthorsSection /></main>;
}


const COMMUNITY_TOPICS = ['general', 'caste', 'policy', 'representation', 'migration', 'violence', 'work', 'education', 'culture'] as CommunityTopic[];
const COMMUNITY_KINDS = ['thought', 'article', 'piece'] as CommunityPostKind[];
const COMMUNITY_STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

function EvidenceEventsRoute() {
  return <main className="signal-page"><Header /><EvidenceEventsPage /></main>;
}

function EvidenceEventRoute() {
  return <main className="signal-page"><Header /><EvidenceEventDetailPage /></main>;
}

function EvidenceSourceRoute() {
  return <main className="signal-page"><Header /><EvidenceSourceDetailPage /></main>;
}

function EvidenceSearchRoute() {
  return <main className="signal-page"><Header /><EvidenceSearchPage /></main>;
}


function AppRoutes() {
  return <><Suspense fallback={<main className="signal-container py-16" role="status" aria-live="polite">Loading page…</main>}><Switch>
    <Route path="/" component={Home} />
    <Route path="/sign-in/*?" component={EditorRoutes} />
    <Route path="/sign-up/*?" component={EditorRoutes} />
    <Route path="/community" component={CommunityPage} />
    <Route path="/community/:id" component={CommunityDetailPage} />
    <Route path="/policies" component={PoliciesPage} />
    <Route path="/policies/:slug" component={PolicyDetail} />
    <Route path="/archive" component={ArchivePage} />
    <Route path="/events" component={EvidenceEventsRoute} />
    <Route path="/events/:id" component={EvidenceEventRoute} />
    <Route path="/sources/:id" component={EvidenceSourceRoute} />
    <Route path="/search" component={SearchPage} />
    <Route path="/evidence/search" component={EvidenceSearchRoute} />
    <Route path="/topics" component={TopicIndexPage} />
    <Route path="/topics/open-category-competition" component={OpenCategoryTopicPage} />
    <Route path="/topics/:slug" component={TopicPage} />
    <Route path="/timeline" component={TimelinePage} />
    <Route path="/authors/:slug" component={AuthorPage} />
    <Route path="/data" component={DataIndexPage} />
    <Route path="/opinion" component={OpinionPage} />
    <Route path="/answers" component={AnswersPage} />
    <Route path="/states" component={StatesPage} />
    <Route path="/state/:slug" component={StateProfilePage} />
    <Route path="/answers/:id" component={AnswerDetailPage} />
    <Route path="/tools" component={ToolsPage} />
    <Route path="/tools/:id" component={ToolPage} />
    <Route path="/glossary" component={GlossaryPage} />
    <Route path="/stories/:id" component={StoryDetail} />
    <Route path="/editor/evidence" component={EditorRoutes} />
    <Route path="/editor" component={EditorRoutes} />
    <Route path="/about" component={AboutPage} />
    <Route path="/editorial-standards" component={StandardsPage} />
    <Route path="/methodology" component={MethodologyPage} />
    <Route path="/:family/:slug" component={StoryDetail} />
    <Route component={NotFound} />
  </Switch></Suspense><GlobalFooter /></>;
}

function AppShell() {
  return <QueryClientProvider client={queryClient}>
    <LazyMotion features={loadMotionFeatures} strict>
      <TooltipProvider>
        <a
          href="#main-content"
          className="skip-link"
          onClick={(event) => {
            event.preventDefault();
            const main = document.querySelector<HTMLElement>('main');
            if (main) {
              main.tabIndex = -1;
              main.focus();
              main.scrollIntoView({ block: 'start' });
            }
          }}
        >
          {/^\/hi(\/|$)/.test(window.location.pathname.slice(basePath.length)) ? 'मुख्य सामग्री पर जाएँ' : 'Skip to main content'}
        </a>
        <ErrorBoundary><Switch>
          <Route path="/hi" nest><LangProvider lang="hi"><AppRoutes /></LangProvider></Route>
          <Route><LangProvider lang="en"><AppRoutes /></LangProvider></Route>
        </Switch><Toaster /></ErrorBoundary>
      </TooltipProvider>
    </LazyMotion>
    </QueryClientProvider>;
}
function App() {
  return <WouterRouter base={basePath}><AppShell /></WouterRouter>;
}

export default App;


function DataIndexPage() {
  const t = useT();
  const label = useLabel();
  const lang = useLang();
  const path = '/data';
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  const { events } = useTopicEvents('Data & Notes');
  const records = data?.stories.filter((story) =>
    (story.recordFamily === 'data' || story.topic === 'Data & Notes') &&
    story.verificationStatus !== 'unverified' &&
    Boolean(story.sourceUrl),
  ) ?? [];
  const gaps = ACCOUNTABILITY_ITEMS.filter((item) => ['secc-2011', 'rohini-commission', 'census-2027-caste', 'ews-eight-lakh'].includes(item.id));
  const title = t(PAGE_META.data.title.en, PAGE_META.data.title.hi);
  const description = t(PAGE_META.data.description.en, PAGE_META.data.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: path,
    // Data records are articles/notes about data (typed NewsArticle/Article on their own
    // pages), so they are listed here rather than re-typed as Dataset.
    structuredData: siteGraph(
      collectionPageNode(path, { name: title, description, publisher: organizationRef }, records.filter((story) => story.indexable).map((story) => ({ url: storyPath(story), name: story.title }))),
      breadcrumbNode(path, [[t('Data', 'आंकड़े'), path]]),
    ),
  });
  return <main className="signal-page">
    <Header />
    <TopicHero
      kicker={t('The Signal 24 / data room', 'द सिग्नल 24 / आंकड़ा कक्ष')}
      headline={t('The data', 'वे आंकड़े,')}
      accent={t('they won’t release.', 'जो जारी नहीं होते।')}
      standfirst={t('India argues about reservation without the numbers that could settle the argument, and that is not an accident. A number appears here only with its value, unit, year, definition and source. Where the state has the number and won’t publish it, we count the days.', 'भारत आरक्षण पर उन आंकड़ों के बिना बहस करता है जो बहस सुलझा सकते थे, और यह संयोग नहीं है। यहाँ कोई आंकड़ा तभी दिखता है जब उसके साथ मान, इकाई, वर्ष, परिभाषा और स्रोत हो। जहाँ सरकार के पास आंकड़ा है और वह उसे छापती नहीं, वहाँ हम दिन गिनते हैं।')}
      stats={[
        { value: KEY_FIGURES.length, label: t('Figures on file', 'दर्ज आंकड़े') },
        { value: records.length, label: t('Data records', 'आंकड़ा रिकॉर्ड') },
        { value: gaps.length, label: t('Datasets withheld', 'रोके गए डेटासेट') },
        { value: daysSince(ACCOUNTABILITY_ITEMS.find((item) => item.id === 'secc-2011')?.since ?? '2021-12-15'), label: t('Days the SECC question is unanswered', 'SECC का सवाल अनुत्तरित, दिन') },
      ]}
      illustration="chair-on-files"
      illustrationAlt={t('Illustration: an empty government chair sitting on a stack of withheld files', 'चित्रण: रोकी गई फ़ाइलों के ढेर पर ख़ाली सरकारी कुर्सी')}
      exhibits={records.slice(0, 2).map((story) => ({ title: story.title, meta: `${label(story.kind)} · ${label(story.verificationStatus)}`, lang: story.contentLang }))}
    />
    <section className="signal-container mt-16 sm:mt-24" aria-labelledby="data-room-figures-title">
      <div className="mb-8 border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('01 / Key figures', '01 / मुख्य आंकड़े')}</p>
      <h2 id="data-room-figures-title" className="mt-2 max-w-4xl font-display text-4xl leading-tight sm:text-5xl">{t('The numbers the argument actually turns on, with their frames attached.', 'वे आंकड़े जिन पर बहस असल में टिकी है, अपने संदर्भ के साथ।')}</h2></div>
      <KeyFigures />
    </section>
    <section className="signal-container mt-16 sm:mt-24">
      <div className="mb-8 border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('02 / The ceiling', '02 / सीमा')}</p><h2 className="mt-2 max-w-4xl font-display text-4xl leading-tight sm:text-5xl">{t('Who went over 50%, and what the courts did about it.', 'किसने 50% पार किया, और अदालतों ने क्या किया।')}</h2></div>
      <CeilingChart />
    </section>
    <section id="accountability-data" className="signal-container mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t('03 / Withheld or unpublished', '03 / रोके गए या अप्रकाशित')}</p><h2 className="mt-2 max-w-4xl font-display text-4xl leading-tight sm:text-5xl">{t('Collected with public money. Kept from the public.', 'जनता के पैसे से जुटाए। जनता से छिपाए।')}</h2></div>
        <a href={`${lang === 'hi' ? '/hi' : ''}/#accountability`} className="signal-kicker text-accent hover:underline">{t('Accountability watch', 'जवाबदेही पर नज़र')} <ArrowUpRight size={13} className="ml-1 inline" /></a>
      </div>
      <div className="mt-6 grid gap-px border border-foreground/20 bg-foreground/20 md:grid-cols-2">
        {gaps.map((item) => <DataGapCard key={item.id} item={item} />)}
      </div>
    </section>
    {events.length > 0 && <section className="signal-container mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t('04 / The data timeline', '04 / आंकड़ों की समयरेखा')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('Counted, claimed, withheld: in order.', 'गिना, दावा किया, रोका: क्रम से।')}</h2></div>
        <Link href={topicHref('Data & Notes')} className="signal-kicker text-accent hover:underline">{t('The data desk', 'आंकड़ा डेस्क')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      <EvidenceSpine events={events} />
    </section>}
    <section className="signal-container mt-16 sm:mt-24" aria-labelledby="data-room-records-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="signal-kicker text-accent">{t('05 / Source-linked data records', '05 / स्रोत से जुड़े आंकड़ा रिकॉर्ड')}</p><h2 id="data-room-records-title" className="mt-2 font-display text-4xl sm:text-5xl">{t('The reporting behind the numbers.', 'आंकड़ों के पीछे की रिपोर्टिंग।')}</h2></div>
        <Link href="/methodology" className="signal-kicker text-accent hover:underline">{t('How we handle numbers', 'आंकड़ों को हम कैसे बरतते हैं')} <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      {isLoading ? <div className="mt-6" role="status" aria-live="polite">{t('Loading published data records…', 'प्रकाशित आंकड़ा रिकॉर्ड लोड हो रहे हैं…')}</div> :
        isError ? <div className="mt-6"><ErrorState message={t('Published data records could not be loaded.', 'प्रकाशित आंकड़ा रिकॉर्ड लोड नहीं हो सके।')} onRetry={() => void refetch()} /></div> :
          records.length === 0 ? <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t('No source-linked data record is published yet.', 'अभी कोई स्रोत-आधारित आंकड़ा रिकॉर्ड प्रकाशित नहीं हुआ है।')}</p> :
            <div>{records.map((story) => <StoryCard key={story.id} story={story} compact />)}</div>}
    </section>
    
  </main>;
}

function DataGapCard({ item }: { item: (typeof ACCOUNTABILITY_ITEMS)[number] }) {
  const t = useT();
  const lang = useLang();
  return <article className="bg-card p-6">
    <img src={`${basePath}/illustrations/${item.illustration}.svg`} alt="" loading="lazy" decoding="async" width="1600" height="900" className="accountability-art mb-5 !max-w-none" />
    <div className="flex flex-wrap items-center justify-between gap-3"><span className="signal-status-badge is-unverified">{item.status[lang]}</span><span className="data-gap-days"><CountUp to={daysSince(item.since)} /> <small>{t('days', 'दिन')}</small></span></div>
    <h3 className="mt-4 font-display text-2xl leading-tight">{item.question[lang]}</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.record[lang]}</p>
    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1">{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline">{source.name} <ExternalLink size={11} /></a>)}<span className="signal-kicker text-muted-foreground">{t('Since', 'कब से')} {formatDate(item.since)}</span></p>
  </article>;
}

/** The first pull-quote line ("> …") of an opinion body, if it has one. */
function pullQuote(body: string | null | undefined) {
  const line = (body ?? '').split('\n').find((item) => item.trim().startsWith('> '));
  return line ? line.trim().slice(2).trim() : null;
}

const OPINION_RULES: Array<[Bilingual, Bilingual]> = [
  [{ en: 'Aimed at power', hi: 'निशाना सत्ता पर' }, { en: 'Governments, ministries, commissions, agencies and the decisions they make. Never caste, religion, region or any community, and never private citizens.', hi: 'सरकारें, मंत्रालय, आयोग, एजेंसियाँ और उनके फ़ैसले। जाति, धर्म, क्षेत्र या कोई समुदाय कभी नहीं, और आम नागरिक कभी नहीं।' }],
  [{ en: 'Every jibe on a fact', hi: 'हर तंज़ एक तथ्य पर' }, { en: 'Each argument sits on a sourced record linked from the piece. If the fact falls, the joke goes with it.', hi: 'हर तर्क लेख से जुड़े किसी स्रोत-आधारित रिकॉर्ड पर टिका है। तथ्य गिरा, तो तंज़ भी जाएगा।' }],
  [{ en: 'Signed and labelled', hi: 'हस्ताक्षरित और चिह्नित' }, { en: 'Opinion carries the editorial board’s name or an author’s, and a label that never comes off. It is never mixed into reporting.', hi: 'राय पर संपादकीय बोर्ड या लेखक का नाम और ऐसा लेबल होता है जो कभी नहीं हटता। इसे रिपोर्टिंग में नहीं मिलाया जाता।' }],
  [{ en: 'Bipartisan contempt', hi: 'सब दलों से बराबर दूरी' }, { en: 'Withholding data and passing laws built to lose in court are habits of every party in power. We say so, whoever holds office.', hi: 'आंकड़े रोकना और अदालत में हारने वाले क़ानून बनाना हर सत्ताधारी दल की आदत है। सत्ता में जो भी हो, हम यह कहते हैं।' }],
];

function OpinionPage() {
  const t = useT();
  const label = useLabel();
  const lang = useLang();
  const reduce = useReducedMotion() ?? false;
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useLocalizedArchive(params, { query: { queryKey: getGetArchiveQueryKey(params) } });
  const pieces = (data?.stories ?? []).filter((story) => story.kind === 'Opinion' && story.workflowStatus === 'published');
  const lead = pieces[0];
  const leadQuote = lead ? pullQuote(lead.body) : null;
  const sourcesCited = new Set(pieces.map((story) => story.sourceUrl).filter(Boolean)).size;
  const title = t(PAGE_META.opinion.title.en, PAGE_META.opinion.title.hi);
  const description = t(PAGE_META.opinion.description.en, PAGE_META.opinion.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/opinion',
    structuredData: siteGraph(
      collectionPageNode('/opinion', { name: title, description, publisher: organizationRef }, pieces.filter((story) => story.indexable).map((story) => ({ url: storyPath(story), name: story.title }))),
      breadcrumbNode('/opinion', [[t('Opinion', 'राय'), '/opinion']]),
    ),
  });
  return <main className="signal-page">
    <Header />
    <TopicHero
      kicker={t('Opinion / signed by the editorial board', 'राय / संपादकीय बोर्ड के हस्ताक्षर')}
      headline={t('Where we stop', 'जहाँ हम शिष्टाचार')}
      accent={t('being polite.', 'छोड़ देते हैं।')}
      standfirst={t('Our reporting tells you what the documents say. Our opinion tells you what we think of the decisions behind them, without the diplomatic padding. Every piece is signed, labelled and argued from the record. The target is always governments, agencies and decisions. Never communities.', 'हमारी रिपोर्टिंग बताती है कि दस्तावेज़ क्या कहते हैं। हमारी राय बताती है कि उनके पीछे के फ़ैसलों के बारे में हम क्या सोचते हैं, बिना कूटनीतिक लीपापोती के। हर लेख हस्ताक्षरित, चिह्नित और रिकॉर्ड पर आधारित है। निशाना हमेशा सरकारें, एजेंसियाँ और फ़ैसले होते हैं। समुदाय कभी नहीं।')}
      stats={[
        { value: pieces.length, label: t('Signed pieces', 'हस्ताक्षरित लेख') },
        { value: sourcesCited, label: t('Sources cited', 'उद्धृत स्रोत') },
        { value: ACCOUNTABILITY_ITEMS.length, label: t('Demands unmet', 'अधूरी माँगें') },
      ]}
      illustration="bill-crash"
      illustrationAlt={t('Illustration: a paper plane made from a quota bill crashing into a wall marked 50%', 'चित्रण: आरक्षण विधेयक से बना काग़ज़ी जहाज़, 50% लिखी दीवार से टकराता हुआ')}
      exhibits={pieces.slice(0, 2).map((story) => ({ title: story.title, meta: `${label('Opinion')} · ${label(story.byline) || t('Editorial board', 'संपादकीय बोर्ड')}`, lang: story.contentLang }))}
    />
    {isLoading ? <LoadingBlock /> : isError ? <div className="signal-container py-16"><ErrorState onRetry={() => void refetch()} /></div> : pieces.length === 0 ? <div className="signal-container py-16"><EmptyState title={t('No opinion published yet.', 'अभी कोई राय प्रकाशित नहीं हुई।')} text={t('Opinion pieces appear here once the editorial board has signed them off.', 'संपादकीय बोर्ड की मंज़ूरी के बाद राय के लेख यहाँ दिखेंगे।')} /></div> : <>
      {lead && <section className="signal-container mt-16 sm:mt-24">
        <m.div className="opinion-lead" initial={reduce ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className="opinion-lead-art"><StoryArt story={lead} className="h-full" showCredit={false} /></div>
          <div className="opinion-lead-copy">
            <span className="opinion-label bg-accent text-accent-foreground">{t('This week’s editorial', 'इस हफ़्ते का संपादकीय')}</span>
            {leadQuote && <blockquote lang={lead.contentLang} className="opinion-lead-quote">“{leadQuote}”</blockquote>}
            <Link href={storyPath(lead)} className="group mt-6 block" data-testid={`link-opinion-lead-${lead.id}`}><h2 lang={lead.contentLang} className="font-display text-3xl leading-tight group-hover:text-accent sm:text-4xl">{lead.title}</h2></Link>
            <p lang={lead.contentLang} className="mt-3 max-w-xl text-sm leading-relaxed opacity-75">{lead.dek}</p>
            <p className="mt-5 signal-kicker opacity-70">{label(lead.byline) || t('Editorial board', 'संपादकीय बोर्ड')} · {formatDate(lead.publishedOn)} · {t(`${lead.read} min read`, `${lead.read} मिनट`)}</p>
          </div>
        </m.div>
      </section>}
      <section className="signal-container mt-16 sm:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
          <div><p className="signal-kicker text-accent">{t(`${pieces.length} signed ${pieces.length === 1 ? 'piece' : 'pieces'}`, `${pieces.length} हस्ताक्षरित लेख`)}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('The arguments, on the record.', 'तर्क, रिकॉर्ड पर।')}</h2></div>
        </div>
        <div>{pieces.map((story) => <StoryCard key={story.id} story={story} />)}</div>
      </section>
    </>}
    <section className="signal-container mt-16 sm:mt-24" aria-labelledby="demand-board-title">
      <div className="grid gap-6 border-b-2 border-foreground pb-4 lg:grid-cols-[1fr_.8fr] lg:items-end">
        <div><p className="signal-kicker text-accent">{t('The demand board', 'माँगों का बोर्ड')}</p><h2 id="demand-board-title" className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{t(<>What we’ve asked for. <em className="font-normal text-accent">The clock is running.</em></>, <>हमने क्या माँगा है। <em className="font-normal text-accent">घड़ी चल रही है।</em></>)}</h2></div>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('Each card counts the days since the question opened, from a sourced date. Turn one over for the specific demand. When a government answers, the card comes down.', 'हर कार्ड सवाल उठने की स्रोत-आधारित तारीख़ से दिन गिनता है। ठोस माँग देखने के लिए उसे पलटिए। जब सरकार जवाब देगी, कार्ड हट जाएगा।')}</p>
      </div>
      <DemandBoard demands={ACCOUNTABILITY_ITEMS} />
    </section>
    <section className="signal-container mt-16 sm:mt-24">
      <div className="border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('House rules', 'हमारे नियम')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t('Sarcasm is cheap. Being right is not.', 'व्यंग्य सस्ता है। सही होना नहीं।')}</h2></div>
      <ol className="mt-6 grid gap-px border border-foreground/20 bg-foreground/20 md:grid-cols-2 lg:grid-cols-4">
        {OPINION_RULES.map(([name, text], index) => <li key={name.en} className="bg-card p-6"><p className="font-display text-3xl text-accent">{String(index + 1).padStart(2, '0')}</p><h3 className="mt-3 font-display text-2xl leading-tight">{name[lang]}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text[lang]}</p></li>)}
      </ol>
      <Link href="/editorial-standards" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">{t('Read the full editorial standards', 'पूरे संपादकीय मानक पढ़ें')} <ArrowUpRight size={13} /></Link>
    </section>
    
  </main>;
}

