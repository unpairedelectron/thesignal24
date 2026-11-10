import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
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
import {
  ArticleEvidenceSection,
  EditorEvidenceDesk,
  EvidenceEventDetailPage,
  EvidenceEventsPage,
  EvidenceSearchPage,
  EvidenceSourceDetailPage,
} from '@/components/evidence-pages';
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
import { RichBody, outlineOf, plainText } from '@/components/rich-body';
import { GlobalFooter, Header } from '@/components/site-chrome';
import { AnswerDetailPage, AnswersPage } from '@/components/answers-pages';
import { HomeStage } from '@/components/home-stage';
import { KeyFigures } from '@/components/key-figures';
import { CeilingChart, DemandBoard } from '@/components/opinion-data';
import { CountUp } from '@/components/home-stage';
import { KEY_FIGURES, daysSince, type Bilingual } from '@/lib/key-figures';
import { motion, useReducedMotion } from 'framer-motion';
import { EvidenceSpine, TopicCabinet, TopicHero, type CabinetDrawer } from '@/components/topic-stage';
import { TOPIC_BRIEFS, TOPIC_BRIEFS_CHECKED_ON, topicBrief, type TopicBrief, type TopicKey } from '@/lib/topic-briefs';
import { breadcrumbNode, collectionPageNode, EDITORIAL_DESK_PATH, editorialDeskNode, editorialDeskRef, externalDocument, imageObject, organizationRef, placeForState, siteGraph, webPageNode, websiteRef } from '@/lib/structured-data';

const queryClient = new QueryClient();

const TOPICS = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'] as Topic[];
const KINDS = ['Article', 'Paper note', 'Archive', 'Explainer', 'Opinion'] as StoryKind[];
const WORKFLOW_STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'] as StoryWorkflowStatus[];
const VERIFICATION_STATUSES = ['unverified', 'source-linked', 'verified'] as VerificationStatus[];
const DECISION_IMPACT_EVIDENCE_TYPES = ['lived-account', 'monitored-lead', 'quantified-finding'] as DecisionImpactEvidenceType[];
const DECISION_IMPACT_AREAS = ['migration', 'study', 'work', 'applications', 'staying', 'speaking', 'leaving'] as DecisionImpactArea[];
const DECISION_IMPACT_WORKFLOW_STATUSES = ['draft', 'review', 'published', 'archived'] as DecisionImpactWorkflowStatus[];
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
function formatDate(value?: string | null) {
  const hindi = getActiveLang() === 'hi';
  if (!value) return hindi ? 'तारीख़ उपलब्ध नहीं' : 'Date not supplied';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return hindi
    ? date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' })
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function LoadingBlock({ label }: { label?: string }) {
  const t = useT();
  return <div className="signal-container py-24" role="status" aria-live="polite"><div className="grid gap-4 animate-pulse"><div className="h-3 w-32 bg-muted" /><div className="h-14 max-w-3xl bg-muted" /><div className="h-4 max-w-xl bg-muted" /><p className="mt-3 signal-kicker text-muted-foreground">{label ?? t("Opening the record. Unlike some, we don’t need a committee for that…", "रिकॉर्ड खुल रहा है। हमें इसके लिए किसी समिति की ज़रूरत नहीं…")}</p></div></div>;
}

function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const t = useT();
  return <div className="signal-container border-y border-accent/50 px-5 py-20 text-center" role="alert"><p className="signal-kicker text-accent">{t("Record unavailable", "रिकॉर्ड उपलब्ध नहीं")}</p><h2 className="mt-3 font-display text-4xl leading-none">{t('This record could not be opened.', 'यह रिकॉर्ड खुल नहीं सका।')}</h2><p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{message ?? t("The archive is having a moment. Nothing has been deleted; we don’t do that here.", "अभिलेखागार अभी अटका है। कुछ भी हटाया नहीं गया; यहाँ ऐसा नहीं होता।")}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-6 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground" data-testid="button-retry">{t('Try again', 'फिर कोशिश करें')}</button>}</div>;
}

function EmptyState({ title, text }: { title?: string; text?: string }) {
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

type StoryVisual = {
  src: string;
  /** Raster share/structured-data image (social platforms do not accept SVG). */
  shareSrc: string;
  alt: string;
  credit: string;
  width: number;
  height: number;
  kind: 'photo' | 'illustration';
};

type IllustrationName = 'sealed-report' | 'census-clipboard' | 'frozen-meter' | 'ceiling-gauge' | 'constitution-amend' | 'court-stamp' | 'promotion-ladder' | 'archive-history' | 'chair-on-files' | 'bill-crash' | 'magnifier-hero';

/** Alt text for our own editorial illustrations (public/illustrations, generated by scripts/illustrations.py). */
const ILLUSTRATION_ALT: Record<IllustrationName, [string, string]> = {
  'sealed-report': ['Illustration: the Rohini Commission report locked in a filing cabinet drawer, stamped withheld', 'चित्रण: फ़ाइल कैबिनेट की दराज़ में ताले में बंद रोहिणी आयोग की रिपोर्ट, जिस पर “रोकी गई” की मुहर है'],
  'census-clipboard': ['Illustration: a census form with every column filled except caste', 'चित्रण: जनगणना का फ़ॉर्म, जिसमें जाति को छोड़कर हर कॉलम भरा है'],
  'frozen-meter': ['Illustration: an income meter frozen at ₹8 lakh while the years blow past', 'चित्रण: ₹8 लाख पर जमी आय की सुई, और पास से उड़ते साल'],
  'ceiling-gauge': ['Illustration: state quota bars breaking through the 50% ceiling, stamped struck down', 'चित्रण: 50% की छत तोड़ते राज्यों के आरक्षण, जिन पर “रद्द” की मुहर है'],
  'constitution-amend': ['Illustration: the Constitution covered in sticky notes for each amendment', 'चित्रण: हर संशोधन की पर्चियों से ढका संविधान'],
  'court-stamp': ['Illustration: a gazette notification stamped struck down beside a gavel', 'चित्रण: गज़ट अधिसूचना पर “रद्द” की मुहर और पास में हथौड़ा'],
  'promotion-ladder': ['Illustration: a promotion ladder beside an empty cadre data sheet', 'चित्रण: पदोन्नति की सीढ़ी और कैडर आंकड़ों की ख़ाली शीट'],
  'archive-history': ['Illustration: archival sheets from Kolhapur 1902, Madras 1921 and Poona 1932 linked by red thread', 'चित्रण: कोल्हापुर 1902, मद्रास 1921 और पूना 1932 के अभिलेख, लाल धागे से जुड़े'],
  'chair-on-files': ['Illustration: an empty government chair with a white towel sitting on a stack of withheld files', 'चित्रण: सफ़ेद तौलिये वाली ख़ाली सरकारी कुर्सी, रोकी गई फ़ाइलों के ढेर पर'],
  'bill-crash': ['Illustration: a paper plane made from a quota bill crashing into a wall marked 50%', 'चित्रण: आरक्षण विधेयक से बना काग़ज़ी जहाज़, 50% लिखी दीवार से टकराता हुआ'],
  'magnifier-hero': ['Illustration: a magnifying glass over government filings, next to a pile of press releases', 'चित्रण: सरकारी दस्तावेज़ों पर आवर्धक लेंस, पास में प्रेस विज्ञप्तियों का ढेर'],
};

function illustration(name: IllustrationName): StoryVisual {
  const hindi = getActiveLang() === 'hi';
  return {
    src: `${basePath}/illustrations/${name}.svg`,
    shareSrc: `${basePath}/illustrations/og/${name}.jpg`,
    alt: ILLUSTRATION_ALT[name][hindi ? 1 : 0],
    credit: hindi ? 'चित्रण: द सिग्नल 24' : 'Illustration: The Signal 24',
    width: 1600,
    height: 900,
    kind: 'illustration',
  };
}

/** Subject → illustration. Matched against the English slug/source, so both editions get the same art. Order matters. */
const ILLUSTRATION_RULES: Array<[RegExp, IllustrationName]> = [
  [/start-here|what-the-law-allows/, 'magnifier-hero'],
  [/ugc|equity-regulation|equity-rules|sixteen-days/, 'chair-on-files'],
  [/certificate|paper-chase/, 'frozen-meter'],
  [/sit-on-the-data|withhold|no-data/, 'chair-on-files'],
  [/designed-to-lose|quota-laws|built-to-fail/, 'bill-crash'],
  [/rohini|sub-categoris|mandal/, 'sealed-report'],
  [/secc|census|caste-data|counting-caste|unusable/, 'census-clipboard'],
  [/8-lakh|eight-lakh|creamy|income-limit|income-ceiling/, 'frozen-meter'],
  [/promotion|cadre|nagaraj|jarnail/, 'promotion-ladder'],
  [/1902|1921|1932|kolhapur|poona|before-1950/, 'archive-history'],
  [/tamil-nadu|maharashtra|maratha|bihar|quota-regime|50-ceiling|ceiling/, 'ceiling-gauge'],
  [/sub-classif|struck|judgment|indra-sawhney|ews|janhit/, 'court-stamp'],
  [/constitution|amendment|article/, 'constitution-amend'],
];

const TOPIC_ILLUSTRATION: Record<string, IllustrationName> = {
  'Courts & Policy': 'court-stamp',
  States: 'ceiling-gauge',
  History: 'archive-history',
  'Data & Notes': 'census-clipboard',
  'Ground Reports': 'magnifier-hero',
  Latest: 'magnifier-hero',
};

function photoForText(value: string): StoryVisual | null {
  const text = value.toLowerCase();
  const hindi = getActiveLang() === 'hi';
  const credit = hindi ? 'संदर्भ चित्र / विकिमीडिया कॉमन्स' : 'Contextual archive visual / Wikimedia Commons';
  const photo = (file: string, alt: string, width: number, height: number): StoryVisual => ({ src: `${basePath}/images/${file}`, shareSrc: `${basePath}/images/${file}`, alt, credit, width, height, kind: 'photo' });
  if (/\b(ambedkar|b\.?\s*r\.?\s*ambedkar)\b/.test(text)) return photo('ambedkar-public.jpg', hindi ? 'नई दिल्ली की एक सार्वजनिक सभा में बोलते हुए बी. आर. आंबेडकर' : 'B. R. Ambedkar speaking at a public meeting in New Delhi', 460, 353);
  if (/\b(doctors?|resident doctors?|kolkata)\b/.test(text)) return photo('doctors-movement.jpg', hindi ? 'कोलकाता में डॉक्टरों के आंदोलन के दौरान सार्वजनिक सभा' : 'Public gathering during a doctors’ movement in Kolkata', 1920, 1080);
  if (/\bquit india\b/.test(text)) return photo('quit-india.jpg', hindi ? 'भारत छोड़ो आंदोलन के अभिलेख से एक तस्वीर' : 'Archival portrait from the Quit India movement record', 1280, 1735);
  return null;
}

function imageForText(value: string): StoryVisual | null {
  const photo = photoForText(value);
  if (photo) return photo;
  const key = slugify(value);
  const rule = ILLUSTRATION_RULES.find(([pattern]) => pattern.test(key));
  return rule ? illustration(rule[1]) : null;
}

/** Every story gets a visual: a matching archive photo, a subject illustration, or its topic's illustration. */
function imageForStory(story: Story): StoryVisual {
  return imageForText(`${story.slug ?? ''} ${story.canonicalPath ?? ''} ${story.source} ${story.eyebrow}`)
    ?? imageForText(`${story.title} ${story.dek}`)
    ?? illustration(TOPIC_ILLUSTRATION[story.topic] ?? 'magnifier-hero');
}

function imageCaptionForStory(story: Story) {
  const image = imageForStory(story);
  const hindi = getActiveLang() === 'hi';
  if (image.kind === 'illustration') return hindi ? `${image.credit} · व्यंग्य चित्रण, दस्तावेज़ नहीं।` : `${image.credit} · editorial illustration, not a document.`;
  return hindi ? `${image.credit} · संदर्भ के लिए, इस रिकॉर्ड का सबूत नहीं।` : `${image.credit} · contextual archive visual, not evidence for this specific record.`;
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

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useSubscribeToNewsletter();
  const t = useT();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    subscribe.mutate({ data: { email } }, { onSuccess: () => setSubmitted(true) });
  }
  return <section id="newsletter" className="signal-container mt-24 border-y-2 border-primary py-10 sm:mt-36 sm:py-14"><div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="signal-kicker text-accent">{t('The briefing', 'ब्रीफ़िंग')}</p><h2 className="mt-3 max-w-lg font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">{t("When the state quietly changes something, you’ll hear about it loudly.", "सरकार जब चुपके से कुछ बदले, तो आपको ज़ोर से पता चलेगा।")}</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{t("A short note when a court rules, a notification sneaks out, or a promised report goes missing again. Sources attached. Spin removed at no extra cost.", "जब कोई अदालत फ़ैसला दे, कोई अधिसूचना चुपके से निकले, या कोई वादा की गई रिपोर्ट फिर ग़ायब हो जाए, तब एक छोटा नोट। स्रोत साथ में। लीपापोती मुफ़्त में हटाई गई।")}</p></div>{submitted ? <div className="border border-accent bg-accent/10 p-6" role="status" aria-live="polite" data-testid="newsletter-confirmation"><div className="flex items-start gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={15} /></div><div><p className="font-display text-2xl">{t('You are on the list.', 'आप सूची में जुड़ गए हैं।')}</p><p className="mt-1 text-sm text-muted-foreground">{t('If this address is eligible, the next note will arrive in your inbox.', 'अगर यह पता मान्य है, तो अगला नोट आपके इनबॉक्स में आएगा।')}</p></div></div></div> : <form onSubmit={submit} className="border border-foreground/20 bg-card p-5 sm:p-7" data-testid="form-newsletter"><label htmlFor="newsletter-email" className="signal-kicker text-muted-foreground">{t('Your email, kept private', 'आपका ईमेल, निजी रहेगा')}</label><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input id="newsletter-email" data-testid="input-newsletter-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-0 py-3 text-sm outline-none focus:border-accent" lang="en" /><button type="submit" disabled={subscribe.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground disabled:opacity-60" data-testid="button-newsletter-submit">{subscribe.isPending ? t('Sending…', 'भेज रहे हैं…') : t('Get the briefing', 'ब्रीफ़िंग पाएँ')} <Send size={13} /></button></div>{subscribe.isError && <p className="mt-3 text-sm text-destructive" role="alert">{t('That address could not be added. Please try again.', 'यह पता जोड़ा नहीं जा सका। कृपया फिर कोशिश करें।')}</p>}<p className="mt-4 signal-kicker text-[9px] text-muted-foreground">{t('One email at a time / unsubscribe anytime', 'एक बार में एक ईमेल / कभी भी सदस्यता छोड़ें')}</p></form>}</div></section>;
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

function AccountabilityWatch() {
  const t = useT();
  const lang = useLang();
  return <section id="accountability" className="signal-container mt-16 sm:mt-24" aria-labelledby="accountability-title">
    <div className="grid gap-6 border-y-2 border-foreground py-6 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
      <div><p className="signal-kicker text-accent">{t('Accountability watch', 'जवाबदेही पर नज़र')}</p><h2 id="accountability-title" className="mt-3 font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-7xl">{t(<>Questions the state<br /><em className="font-normal text-accent">would rather you forgot.</em></>, <>सवाल, जिन्हें सरकार चाहती है<br /><em className="font-normal text-accent">कि आप भूल जाएँ।</em></>)}</h2></div>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t("A report paid for with public money, then locked in a drawer. Data collected door to door, then declared “unusable” the moment a court asked to see it. Income limits that were meant to be reviewed and have instead been preserved like family heirlooms. Every item is sourced. When the government answers, we will update the page. We are not holding our breath.", "जनता के पैसे से बनी रिपोर्ट, जो फिर दराज़ में बंद हो गई। घर-घर जाकर जुटाए गए आंकड़े, जिन्हें अदालत के माँगते ही “बेकार” घोषित कर दिया गया। आय सीमाएँ, जिनकी समीक्षा होनी थी और जिन्हें ख़ानदानी विरासत की तरह सँभालकर रखा गया है। हर बिंदु का स्रोत है। सरकार जवाब देगी तो हम पेज बदल देंगे। साँस रोककर इंतज़ार नहीं कर रहे।")}</p>
    </div>
    <ol className="divide-y divide-foreground/15 border-b border-foreground/20">
      {ACCOUNTABILITY_ITEMS.map((item, index) => <li key={item.id} className="grid gap-4 py-7 md:grid-cols-[3rem_1.1fr_1fr] md:gap-8" data-testid={`accountability-item-${item.id}`}>
        <p className="font-display text-3xl text-accent" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
        <div>
          <div className="flex flex-wrap items-center gap-3"><span className="signal-status-badge is-unverified">{item.status[lang]}</span><span className="signal-kicker text-muted-foreground">{t('Since', 'कब से')} {formatDate(item.since)}</span></div>
          <h3 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{item.question[lang]}</h3>
          <img src={`${basePath}/illustrations/${item.illustration}.svg`} alt="" loading="lazy" decoding="async" width="1600" height="900" className="accountability-art mt-5" />
        </div>
        <div className="text-sm leading-relaxed">
          <p className="text-muted-foreground">{item.record[lang]}</p>
          <p className="mt-3 border-l-2 border-accent pl-3"><span className="signal-kicker block text-accent">{t("What a functioning government would do", "एक काम करने वाली सरकार क्या करती")}</span><span className="mt-1 block font-medium">{item.ask[lang]}</span></p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline">{source.name} <ExternalLink size={11} /></a>)}</p>
        </div>
      </li>)}
    </ol>
    <p className="mt-3 signal-kicker text-muted-foreground">{t('Last checked', 'आख़िरी जाँच')} {formatDate(ACCOUNTABILITY_CHECKED_ON)} · {t("If the government has quietly answered and we missed it, tell us. We correct the record faster than they publish reports.", "अगर सरकार ने चुपके से जवाब दे दिया और हमसे छूट गया, तो बताइए। हम रिकॉर्ड उससे जल्दी सुधारते हैं, जितनी जल्दी वे रिपोर्टें छापते हैं।")}</p>
  </section>;
}

function PolicyLedger() {
  const listParams = useMemo<GetPoliciesParams>(() => ({ limit: 1 }), []);
  const { data, isLoading, isError } = useGetPolicies(listParams, { query: { queryKey: getGetPoliciesQueryKey(listParams) } });
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const raw: PolicyRecord | undefined = data?.records?.[0];
  const record = raw ? localizePolicy(raw, lang) : undefined;
  return <section id="policy-ledger" className="signal-container mt-24 border-y border-foreground/20 py-10 sm:mt-36 sm:py-14">
    <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
      <div><p className="signal-kicker text-accent">{t('Policy ledger', 'नीति रजिस्टर')}</p><h2 className="mt-3 max-w-sm font-display text-5xl leading-[.92] tracking-[-.05em]">{t(<>What changed, who decided,<br /><em className="font-normal text-accent">and did it survive court?</em></>, <>क्या बदला, किसने तय किया,<br /><em className="font-normal text-accent">और क्या वह अदालत में टिका?</em></>)}</h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("Every policy change on one card: the old rule, the new rule, who signed it, and whether a court later had to clean up after them.", "हर नीतिगत बदलाव एक कार्ड पर: पुराना नियम, नया नियम, किसने दस्तख़त किए, और क्या बाद में अदालत को उनकी गड़बड़ी साफ़ करनी पड़ी।")}</p>{record && <Link href={record.canonicalPath} className="mt-7 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-home-policy-ledger">{t('Open the record', 'रिकॉर्ड खोलें')} <ArrowUpRight size={13} /></Link>}</div>
      {isLoading ? <div className="border border-foreground/20 bg-card p-6" role="status" data-testid="status-policy-ledger-loading"><div className="grid animate-pulse gap-4"><div className="h-3 w-32 bg-muted" /><div className="h-8 max-w-lg bg-muted" /><div className="h-4 max-w-md bg-muted" /><div className="h-16 max-w-xl bg-muted" /></div><p className="mt-5 signal-kicker text-muted-foreground">{t('Loading the latest policy record…', 'ताज़ा नीति रिकॉर्ड लोड हो रहा है…')}</p></div> : isError ? <div className="border border-accent/50 bg-card p-6" role="alert" data-testid="status-policy-ledger-error"><p className="signal-kicker text-accent">{t('Ledger unavailable', 'रजिस्टर उपलब्ध नहीं')}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('The latest policy record could not be loaded. The full ledger is still available.', 'ताज़ा नीति रिकॉर्ड लोड नहीं हुआ। पूरा रजिस्टर अब भी उपलब्ध है।')}</p><Link href="/policies" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-policy-ledger-retry">{t('Browse the ledger', 'रजिस्टर देखें')} <ArrowUpRight size={13} /></Link></div> : !record ? <div className="border border-dashed border-foreground/25 bg-card p-6" data-testid="status-policy-ledger-empty"><p className="signal-kicker text-accent">{t('Ledger / awaiting records', 'रजिस्टर / रिकॉर्ड की प्रतीक्षा')}</p><p className="mt-3 font-display text-2xl">{t('No policy record has been published yet.', 'अभी तक कोई नीति रिकॉर्ड प्रकाशित नहीं हुआ।')}</p><Link href="/policies" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-policy-ledger-empty">{t('Open the ledger', 'रजिस्टर खोलें')} <ArrowUpRight size={13} /></Link></div> : <div className="border border-foreground/20 bg-card" lang={record.contentLang}>
        <div className="flex items-center justify-between border-b border-foreground/15 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><Scale size={17} className="text-accent" /><p className="signal-kicker">{t('Policy change / source-linked', 'नीतिगत बदलाव / स्रोत से जुड़ा')}</p></div><span className="signal-kicker text-muted-foreground">{label(record.status)}</span></div>
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-7"><div><p className="signal-kicker text-muted-foreground">{t('Before', 'पहले')}</p><p className="mt-3 font-display text-2xl leading-tight">{record.previousFramework}</p></div><ArrowDownRight className="hidden text-accent sm:block" size={22} /><div><p className="signal-kicker text-accent">{t('Now', 'अब')}</p><Link href={record.canonicalPath} className="group mt-3 block" data-testid="link-home-policy-record"><p className="font-display text-2xl leading-tight group-hover:text-accent">{record.title}</p></Link><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{record.summary}</p><div className="mt-5 border-l-2 border-accent pl-3"><p className="signal-kicker text-accent">{t('Authority / effective date', 'प्राधिकारी / लागू तिथि')}</p><p className="mt-1 text-sm">{record.authority}</p><p className="mt-1 signal-kicker text-muted-foreground">{formatDate(record.effectiveDate)} · {label(record.state ?? 'National')}</p></div></div></div>
      </div>}
    </div>
  </section>;
}

function InfoPage({ page }: { page: 'about' | 'standards' | 'methodology' }) {
  const t = useT();
  const content = {
    about: {
      name: t('About', 'परिचय'),
      eyebrow: t('The Signal 24 / about', 'द सिग्नल 24 / परिचय'),
      title: t(<>We read the fine print.<br /><em className="font-normal text-accent">Someone has to.</em></>, <>हम बारीक अक्षर पढ़ते हैं।<br /><em className="font-normal text-accent">किसी को तो पढ़ने हैं।</em></>),
      intro: t("The Signal 24 is a public-interest newsroom that holds India’s governments, courts, commissions and agencies to their own records on reservation and representation. We read the judgments, notifications and reports that officials assume nobody will read, so you don’t have to take anyone’s word for it. Including ours.", "द सिग्नल 24 एक जनहित न्यूज़रूम है, जो आरक्षण और प्रतिनिधित्व के सवाल पर भारत की सरकारों, अदालतों, आयोगों और एजेंसियों को उनके अपने दस्तावेज़ों पर परखता है। हम वे फ़ैसले, अधिसूचनाएँ और रिपोर्टें पढ़ते हैं जिनके बारे में अफ़सर मानकर चलते हैं कि कोई नहीं पढ़ेगा, ताकि आपको किसी की बात पर आँख मूँदकर भरोसा न करना पड़े। हमारी बात पर भी नहीं।"),
      sections: [
        [t('Who we answer to', 'हम किसके प्रति जवाबदेह हैं'), t('Readers. Not a party, a government, a caste organisation or an advertiser. Every story carries its source so you can check us, and every correction is logged in public.', 'पाठकों के प्रति। किसी पार्टी, सरकार, जातीय संगठन या विज्ञापनदाता के प्रति नहीं। हर ख़बर के साथ उसका स्रोत है, ताकि आप हमें जाँच सकें, और हर सुधार सार्वजनिक रूप से दर्ज होता है।')],
        [t('What we go after', 'हम किसका पीछा करते हैं'), t("Promises with deadlines that quietly expire. Reports commissioned with fanfare and buried without any. Data collected with public money and then withheld for the public’s own good, apparently. Laws passed in election season and struck down in the off-season. The gap between what the state says at a press conference and what it files in court.", "ऐसे वादे जिनकी समय-सीमा चुपचाप ख़त्म हो जाती है। धूमधाम से बनवाई गईं और बिना किसी शोर के दफ़नाई गईं रिपोर्टें। जनता के पैसे से जुटाए गए और फिर, लगता है, जनता की भलाई के लिए ही रोके गए आंकड़े। चुनावी मौसम में पास हुए और उसके बाद अदालत में रद्द हुए क़ानून। प्रेस कॉन्फ़्रेंस में कही गई बात और अदालत में दाख़िल काग़ज़ के बीच का फ़ासला।")],
        [t('What we refuse to do', 'हम क्या नहीं करेंगे'), t("We do not target communities, rank castes or trade in outrage. There is more than enough to say about the people in charge without punching down at the people living under their decisions. Our sarcasm has a fixed address: institutions and office-holders.", "हम किसी समुदाय को निशाना नहीं बनाते, जातियों की रैंकिंग नहीं करते और ग़ुस्से का कारोबार नहीं करते। सत्ता में बैठे लोगों के बारे में कहने को इतना कुछ है कि उनके फ़ैसलों के तले जी रहे लोगों पर वार करने की ज़रूरत ही नहीं। हमारे व्यंग्य का पता तय है: संस्थाएँ और पदाधिकारी।")],
        [t('English and Hindi', 'अंग्रेज़ी और हिंदी'), t('The Signal 24 publishes in English and Hindi. When a record’s Hindi edition is not ready, the page says so and shows the English text. We do not publish unreviewed machine translation as reporting.', 'द सिग्नल 24 अंग्रेज़ी और हिंदी दोनों में प्रकाशित होता है। जब किसी रिकॉर्ड का हिंदी संस्करण तैयार न हो, तो पेज यह साफ़ बताता है और अंग्रेज़ी पाठ दिखाता है। बिना जाँचे मशीनी अनुवाद को हम रिपोर्टिंग के तौर पर नहीं छापते।')],
      ],
    },
    standards: {
      name: t('Editorial standards', 'संपादकीय मानक'),
      eyebrow: t('The Signal 24 / editorial standards', 'द सिग्नल 24 / संपादकीय मानक'),
      title: t(<>Hard on power.<br /><em className="font-normal text-accent">Harder on ourselves.</em></>, <>सत्ता पर सख़्त।<br /><em className="font-normal text-accent">ख़ुद पर और सख़्त।</em></>),
      intro: t("Sarcasm is cheap. Being right is not. These are the rules we follow before we mock anyone else for breaking theirs.", "व्यंग्य सस्ता है। सही होना नहीं। किसी और के नियम तोड़ने पर तंज़ कसने से पहले, हम इन नियमों का पालन करते हैं।"),
      sections: [
        [t('Reporting', 'रिपोर्टिंग'), t('What happened, who did it and when, with the document that proves it. Allegations stay allegations until the record establishes them. We name the ministry, department or office that acted, not just “the government”.', 'क्या हुआ, किसने किया और कब, उस दस्तावेज़ के साथ जो इसे साबित करता है। आरोप तब तक आरोप ही रहता है, जब तक रिकॉर्ड उसे साबित न कर दे। हम उस मंत्रालय, विभाग या दफ़्तर का नाम लेते हैं जिसने कार्रवाई की, सिर्फ़ “सरकार” कहकर नहीं छोड़ते।')],
        [t('Documents', 'दस्तावेज़'), t('Judgments, gazette notifications, commission reports, parliamentary answers and RTI replies are linked or identified. If a primary source is unavailable, the record says so.', 'फ़ैसले, गज़ट अधिसूचनाएँ, आयोगों की रिपोर्टें, संसद में दिए जवाब और आरटीआई के उत्तर लिंक किए जाते हैं या उनकी पहचान दी जाती है। अगर मूल स्रोत उपलब्ध नहीं है, तो रिकॉर्ड यह साफ़ कहता है।')],
        [t('Right of reply', 'जवाब का अधिकार'), t('Before we publish a finding against a named office or official, we ask for their response and record whether they gave one. Silence is reported as silence.', 'किसी नामित दफ़्तर या अधिकारी के ख़िलाफ़ कोई निष्कर्ष छापने से पहले हम उनसे जवाब माँगते हैं और दर्ज करते हैं कि जवाब आया या नहीं। चुप्पी को चुप्पी ही लिखा जाता है।')],
        [t('Analysis', 'विश्लेषण'), t('What the evidence supports, with the method shown. If the data cannot carry a conclusion, we do not draw it.', 'सबूत जिस बात का समर्थन करते हैं, तरीक़ा दिखाते हुए। अगर आंकड़े किसी निष्कर्ष का बोझ नहीं उठा सकते, तो हम वह निष्कर्ष नहीं निकालते।')],
        [t('Opinion', 'राय'), t('Opinion is labelled, carries a named author or the editorial board, and is never mixed into reporting. Our opinion pieces criticise institutions and decisions, not communities.', 'राय पर साफ़ लेबल होता है, उसके साथ लेखक या संपादकीय बोर्ड का नाम होता है, और उसे रिपोर्टिंग में नहीं मिलाया जाता। हमारी राय संस्थाओं और फ़ैसलों की आलोचना करती है, समुदायों की नहीं।')],
        [t('Tone', 'लहजा'), t('Yes, we are sarcastic. The sarcasm is aimed at power: governments, ministries, commissions, agencies and the decisions they make. Never at caste, religion, region or any community, and never at private citizens. Every jibe sits on a sourced fact; if the fact falls, the joke goes with it.', 'हाँ, हम व्यंग्य करते हैं। यह व्यंग्य सत्ता पर है: सरकारें, मंत्रालय, आयोग, एजेंसियाँ और उनके फ़ैसले। जाति, धर्म, क्षेत्र या किसी समुदाय पर कभी नहीं, और आम नागरिकों पर कभी नहीं। हर तंज़ किसी स्रोत-आधारित तथ्य पर टिका है; तथ्य गिरा, तो तंज़ भी जाएगा।')],
        [t('Corrections and AI', 'सुधार और एआई'), t('Mistakes are corrected in public: the record says what changed and when. AI tools may help with translation, organisation or first drafts; nothing is published until an editor has checked it against the source.', 'ग़लतियाँ सार्वजनिक रूप से सुधारी जाती हैं: रिकॉर्ड बताता है कि क्या बदला और कब। अनुवाद, व्यवस्था या पहले मसौदे में एआई की मदद ली जा सकती है; लेकिन कोई भी चीज़ तब तक प्रकाशित नहीं होती, जब तक संपादक उसे स्रोत से मिलाकर जाँच न ले।')],
      ],
    },
    methodology: {
      name: t('Methodology', 'कार्यप्रणाली'),
      eyebrow: t('The Signal 24 / methodology', 'द सिग्नल 24 / कार्यप्रणाली'),
      title: t(<>How we check<br /><em className="font-normal text-accent">the state’s paperwork.</em></>, <>सरकारी काग़ज़ों की<br /><em className="font-normal text-accent">जाँच हम कैसे करते हैं।</em></>),
      intro: t("Numbers change meaning when their definitions disappear, which is usually why the definitions disappear. Every record here keeps its source type, date, jurisdiction and verification status attached.", "परिभाषा हटते ही आंकड़ों का अर्थ बदल जाता है, और अक्सर इसीलिए परिभाषाएँ हटाई जाती हैं। यहाँ हर रिकॉर्ड के साथ उसके स्रोत का प्रकार, तारीख़, क्षेत्राधिकार और सत्यापन स्थिति जुड़ी रहती है।"),
      sections: [
        [t('Source hierarchy', 'स्रोतों का क्रम'), t('Constitutional and statutory text, court judgments, gazette notifications, parliamentary records, commission reports and official statistics come first. Reporting by other outlets is used for context and is always attributed.', 'संविधान और क़ानून का पाठ, अदालती फ़ैसले, गज़ट अधिसूचनाएँ, संसदीय रिकॉर्ड, आयोगों की रिपोर्टें और आधिकारिक आंकड़े सबसे पहले आते हैं। दूसरे मीडिया संस्थानों की रिपोर्टिंग संदर्भ के लिए इस्तेमाल होती है और हमेशा उनके नाम के साथ।')],
        [t('Verification labels', 'सत्यापन के लेबल'), t('Unverified: not yet checked against a primary source. Source-linked: tied to a named, linked source. Verified: checked line by line by the desk. The label is shown on every record.', 'असत्यापित: अभी मूल स्रोत से नहीं मिलाया गया। स्रोत से जुड़ा: किसी नामित, लिंक किए गए स्रोत से जुड़ा। सत्यापित: डेस्क ने पंक्ति-दर-पंक्ति जाँचा। यह लेबल हर रिकॉर्ड पर दिखता है।')],
        [t('Data integrity', 'आंकड़ों की ईमानदारी'), t('Every important number carries its unit, year, geography, definition and source. Population share, reserved seats and actual representation are different quantities, and we never substitute one for another.', 'हर अहम आंकड़े के साथ उसकी इकाई, वर्ष, भूगोल, परिभाषा और स्रोत होता है। आबादी में हिस्सा, आरक्षित सीटें और वास्तविक प्रतिनिधित्व तीन अलग चीज़ें हैं, और हम एक की जगह दूसरी का इस्तेमाल कभी नहीं करते।')],
        [t('Legal status', 'क़ानूनी स्थिति'), t('Records are marked current, proposed, challenged, stayed or struck down. A law a court has stayed is never reported as being in force.', 'रिकॉर्ड पर लिखा होता है कि नियम लागू है, प्रस्तावित है, चुनौती में है, उस पर रोक है या वह रद्द हो चुका है। जिस क़ानून पर अदालत ने रोक लगाई हो, उसे हम कभी लागू नहीं बताते।')],
        [t('The Hindi edition', 'हिंदी संस्करण'), t('Hindi pages are translations of the same record, not separate stories. Where a Hindi edition is not ready, the page says so and shows the English text, and search engines are told not to index it as Hindi.', 'हिंदी पेज उसी रिकॉर्ड का अनुवाद हैं, अलग ख़बरें नहीं। जहाँ हिंदी संस्करण तैयार नहीं है, वहाँ पेज यह बताता है और अंग्रेज़ी पाठ दिखाता है, और सर्च इंजनों को कहा जाता है कि उसे हिंदी पेज के तौर पर इंडेक्स न करें।')],
      ],
    },
  }[page];
  const path = `/${page === 'standards' ? 'editorial-standards' : page}`;

  useSeo({
    title: `${content.name} — The Signal 24`,
    description: content.intro,
    canonicalPath: path,
    structuredData: siteGraph(
      webPageNode(path, { name: `${content.name} — The Signal 24`, description: content.intro, about: organizationRef, publisher: organizationRef }, page === 'about' ? 'AboutPage' : 'WebPage'),
      breadcrumbNode(path, [[content.name, path]]),
    ),
  });
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><p className="signal-kicker text-accent">{content.eyebrow}</p><h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{content.title}</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{content.intro}</p><PageArt name={page === 'about' ? 'magnifier-hero' : page === 'standards' ? 'court-stamp' : 'census-clipboard'} className="max-w-4xl" /></section><section className="signal-container mt-16 border-t border-foreground/20 sm:mt-24"><div className="grid divide-y divide-foreground/15 lg:grid-cols-2 lg:divide-x lg:divide-y-0">{content.sections.map(([title, text], index) => <article key={title} id={page === 'standards' && index === content.sections.length - 1 ? 'corrections' : undefined} className={`py-8 lg:px-8 ${index % 2 === 0 ? 'lg:pl-0' : 'lg:pr-0'} ${index > 1 ? 'lg:border-t lg:border-foreground/15' : ''}`}><p className="signal-kicker text-accent">{String(index + 1).padStart(2, '0')}</p><h2 className="mt-3 font-display text-3xl leading-tight">{title}</h2><p className="mt-4 max-w-xl text-[.95rem] leading-[1.8] text-muted-foreground">{text}</p></article>)}</div></section></main>;
}

function evidenceTypeLabel(value: DecisionImpactEvidenceType) {
  const hindi = getActiveLang() === 'hi';
  if (value === 'lived-account') return hindi ? 'आपबीती' : 'Lived account';
  if (value === 'monitored-lead') return hindi ? 'निगरानी में सुराग' : 'Monitored lead';
  return hindi ? 'मापा गया निष्कर्ष' : 'Quantified finding';
}

function verificationLabel(value: VerificationStatus) {
  const hindi = getActiveLang() === 'hi';
  if (value === 'verified') return hindi ? 'सत्यापित' : 'Verified';
  if (value === 'source-linked') return hindi ? 'स्रोत से जुड़ा' : 'Source linked';
  return hindi ? 'असत्यापित' : 'Unverified';
}

function verificationSummary(stories: Story[]) {
  const counts = new Map<VerificationStatus, number>();
  for (const story of stories) {
    counts.set(story.verificationStatus, (counts.get(story.verificationStatus) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([status, count]) => `${count} ${verificationLabel(status)}`)
    .join(' · ');
}

function isMeasuredDecisionImpact(record?: DecisionImpactRecord) {
  return Boolean(
    record?.evidenceType === 'quantified-finding' &&
    typeof record.findingValue === 'number' &&
    record.findingUnit?.trim() &&
    record.definition.trim() &&
    record.geography.trim() &&
    record.observedOn &&
    record.sourceUrl &&
    record.sourceRetrievedOn &&
    record.verificationStatus !== 'unverified',
  );
}

function DecisionEvidenceSection({ records, isLoading, isError }: { records: DecisionImpactRecord[]; isLoading: boolean; isError: boolean }) {
  const t = useT();
  const byType = (type: DecisionImpactEvidenceType) => records.find((record) => record.evidenceType === type);
  const lived = byType('lived-account');
  const monitored = byType('monitored-lead');
  const quantified = byType('quantified-finding');
  const measured = isMeasuredDecisionImpact(quantified);
  const missing = DECISION_IMPACT_EVIDENCE_TYPES.filter((type) => !byType(type)).length;
  const card = (record: DecisionImpactRecord | undefined, type: DecisionImpactEvidenceType) => {
    if (!record) {
      return <div className="border border-dashed border-foreground/25 p-5" data-testid={`decision-evidence-missing-${type}`}><p className="signal-kicker text-accent">{t('No published record', 'कोई प्रकाशित रिकॉर्ड नहीं')}</p><p className="mt-3 font-display text-2xl leading-tight">{t('The gap stays visible.', 'यह कमी छिपाई नहीं जाएगी।')}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`The desk has not published a source-backed ${evidenceTypeLabel(type).toLowerCase()} for this area yet.`, `डेस्क ने इस क्षेत्र में अभी तक स्रोत-आधारित ${evidenceTypeLabel(type)} प्रकाशित नहीं किया है।`)}</p></div>;
    }
    return <article className="border border-foreground/15 bg-card p-5" data-testid={`decision-evidence-card-${type}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="signal-kicker text-accent">{evidenceTypeLabel(type)}</p><span className="signal-kicker text-muted-foreground">{verificationLabel(record.verificationStatus)}</span></div>
      <h3 className="mt-4 font-display text-2xl leading-tight" lang="en">{record.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground" lang="en">{record.summary}</p>
      <dl className="mt-5 grid gap-2 border-t border-foreground/15 pt-4 text-xs">
        <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">{t('Area', 'क्षेत्र')}</dt><dd>{record.decisionArea}</dd></div>
        <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">{t('Geography', 'भूगोल')}</dt><dd>{record.geography}</dd></div>
        <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">{t('Observed', 'दर्ज')}</dt><dd>{formatDate(record.observedOn)}</dd></div>
      </dl>
      <p className="mt-4 border-l-2 border-accent pl-3 text-sm leading-relaxed"><span className="signal-kicker text-accent">{t('What this record means', 'इस रिकॉर्ड का अर्थ')}</span><span className="mt-1 block text-muted-foreground">{type === 'lived-account' ? t('Context from one account, not a measure of how common it is.', 'एक व्यक्ति के अनुभव का संदर्भ, यह कितना आम है इसका माप नहीं।') : type === 'monitored-lead' ? t('A source to check, not a published finding.', 'जाँचने लायक स्रोत, प्रकाशित निष्कर्ष नहीं।') : record.definition}</span></p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{record.source} · {t('retrieved', 'प्राप्त')} {formatDate(record.sourceRetrievedOn)}</p><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline" data-testid={`link-decision-evidence-source-${record.id}`}>{t('Open source', 'स्रोत खोलें')} <ExternalLink size={12} /></a></div>
      <div className="mt-3 border-t border-foreground/10 pt-3 text-xs leading-relaxed text-muted-foreground">
        {record.verificationNotes && <p lang="en">{t('Verification context', 'सत्यापन संदर्भ')} / {record.verificationNotes}</p>}
        {record.lastVerifiedAt && <p className="mt-1">{t('Last verified', 'अंतिम सत्यापन')} / {formatDate(record.lastVerifiedAt)}</p>}
        {record.reviewedAt && <p className="mt-1">{t('Editorial review', 'संपादकीय समीक्षा')} / {formatDate(record.reviewedAt)}</p>}
        {record.publishedOn && <p className="mt-1">{t('Published', 'प्रकाशित')} / {formatDate(record.publishedOn)}</p>}
      </div>
    </article>;
  };
  return <section id="decision-evidence" className="signal-container pt-24 sm:pt-36">
    <div className="flex flex-col justify-between gap-6 border-y-2 border-primary py-6 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">{t('Lives and decisions', 'ज़िंदगियाँ और फ़ैसले')}</p><h2 className="mt-3 max-w-4xl font-display text-5xl leading-[.88] tracking-[-.055em] sm:text-7xl">{t(<>What people decide,<br /><em className="font-normal text-accent">and what the record can prove.</em></>, <>लोग क्या तय करते हैं,<br /><em className="font-normal text-accent">और रिकॉर्ड क्या साबित कर सकता है।</em></>)}</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t('Policy decides where people study, apply, work and whether they stay. We keep three kinds of evidence apart: one person’s account, a lead still being checked, and a measured finding with its source and definition.', 'नीति तय करती है कि लोग कहाँ पढ़ें, कहाँ आवेदन करें, कहाँ काम करें और टिकें या नहीं। हम तीन तरह के सबूत अलग रखते हैं: किसी एक की आपबीती, जाँच में चल रहा सुराग, और स्रोत व परिभाषा के साथ मापा गया निष्कर्ष।')}</p></div>
    {isLoading ? <div className="mt-7 grid gap-5 md:grid-cols-3" role="status" data-testid="status-decision-evidence-loading">{DECISION_IMPACT_EVIDENCE_TYPES.map((type) => <div key={type} className="h-64 animate-pulse bg-muted" />)}</div> : isError ? <div className="mt-7 border border-accent/50 bg-card p-6" role="alert" data-testid="status-decision-evidence-error"><p className="signal-kicker text-accent">{t('Evidence ledger unavailable', 'सबूत रजिस्टर उपलब्ध नहीं')}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('The evidence ledger could not be reached, so no number is shown.', 'सबूत रजिस्टर तक पहुँच नहीं हो सकी, इसलिए कोई आंकड़ा नहीं दिखाया गया।')}</p></div> : <div className="mt-7 grid gap-5 md:grid-cols-3">{card(lived, 'lived-account')}{card(monitored, 'monitored-lead')}{measured ? card(quantified, 'quantified-finding') : <div className="border border-dashed border-accent/60 p-5" data-testid="decision-evidence-quantified-gap"><p className="signal-kicker text-accent">{t('Quantified finding / not established', 'मापा गया निष्कर्ष / स्थापित नहीं')}</p><p className="mt-3 font-display text-2xl leading-tight">{quantified ? t('A record exists, but it cannot yet carry a measured trend.', 'रिकॉर्ड मौजूद है, पर अभी वह किसी मापे गए रुझान का बोझ नहीं उठा सकता।') : t('No measured trend has been published.', 'कोई मापा गया रुझान प्रकाशित नहीं हुआ है।')}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{quantified ? t(`The record is missing a complete source, definition, geography, date or verification. ${quantified.summary}`, 'इस रिकॉर्ड में पूरा स्रोत, परिभाषा, भूगोल, तारीख़ या सत्यापन नहीं है।') : t('The available records do not establish a defensible trend. We will not fill the gap with a guessed number.', 'उपलब्ध रिकॉर्ड किसी ठोस रुझान को साबित नहीं करते। हम इस कमी को अंदाज़े के आंकड़े से नहीं भरेंगे।')}</p>{quantified?.sourceUrl && <a href={quantified.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 signal-kicker text-accent hover:underline">{t('Review the source', 'स्रोत देखें')} <ExternalLink size={12} /></a>}</div>}</div>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-foreground/20 py-4"><p className="signal-kicker text-muted-foreground">{t(`Evidence ledger / ${records.length} published records`, `सबूत रजिस्टर / ${records.length} प्रकाशित रिकॉर्ड`)}</p><p className="signal-kicker text-accent">{t(`${missing} evidence class${missing === 1 ? '' : 'es'} still missing a published record`, `${missing} प्रकार के सबूत का अभी कोई प्रकाशित रिकॉर्ड नहीं`)}</p></div>
  </section>;
}

function IndiaFocus({ stories }: { stories: LocalizedStory[] }) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [geoStatus, setGeoStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [geoRetry, setGeoRetry] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const t = useT();
  const label = useLabel();
  const stateStories = useMemo(() => getStateLinkedStories(stories), [stories]);
  const states = useMemo(() => getStateNames(stateStories), [stateStories]);
  const selected = getSelectedStateFromSearch(search, states);
  const requestedState = getRequestedStateFromSearch(search);
  const unavailableState = requestedState && !selected ? requestedState : null;
  const clearStateSelection = () => {
    setLocation(`${location}${searchWithSelectedState(search, null)}${window.location.hash}`);
  };
  const toggleSelectedState = (stateName: string) => {
    const nextSelected = toggleStateSelection(selected, stateName);
    setLocation(`${location}${searchWithSelectedState(search, nextSelected)}${window.location.hash}`);
  };
  const copySelectedStateLink = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(urlWithSelectedState(window.location.href, selected));
      setCopyStatus(t('State link copied', 'राज्य का लिंक कॉपी हुआ'));
    } catch {
      setCopyStatus(t('Unable to copy state link', 'लिंक कॉपी नहीं हो सका'));
    }
  };
  useEffect(() => {
    let cancelled = false;
    setGeoStatus('loading');
    fetch(`${basePath}/data/india-states-simplified.geojson`).then((response) => {
      if (!response.ok) throw new Error(`GeoJSON request failed: ${response.status}`);
      return response.json();
    }).then((value: unknown) => {
      const parsedFeatures = parseStateMap(value);
      if (!cancelled) {
        setFeatures(parsedFeatures);
        setGeoStatus('ready');
      }
    }).catch(() => {
      if (!cancelled) {
        setFeatures([]);
        setGeoStatus('error');
      }
    });
    return () => { cancelled = true; };
  }, [geoRetry]);
  const unmappedStates = useMemo(
    () => geoStatus === 'ready' ? getUnmappedStateNames(states, features) : [],
    [features, geoStatus, states],
  );
  const selectedStories = unavailableState
    ? []
    : selected
      ? getStoriesForState(stateStories, selected)
      : stateStories.slice(0, 3);
  const selectedLatest = selectedStories[0];
  return <section className="map-shell mt-20 py-8 sm:mt-28 sm:py-12" id="india-in-focus" aria-labelledby="india-focus-title">
    <div className="signal-container">
      <div className="flex flex-col justify-between gap-5 border-b border-foreground/20 pb-6 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">{t('States', 'राज्य')}</p><h2 id="india-focus-title" className="mt-3 font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-7xl">{t(<>One country, many quota laws,<br /><em className="font-normal text-accent">many ways to test a court’s patience.</em></>, <>एक देश, आरक्षण के कई क़ानून,<br /><em className="font-normal text-accent">अदालत के सब्र को परखने के कई तरीक़े।</em></>)}</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t('Each state writes its own reservation law and answers to its own courts. The map shows only states with published, state-linked records. National records stay off the map.', 'हर राज्य अपना आरक्षण क़ानून ख़ुद बनाता है और अपनी अदालतों के प्रति जवाबदेह है। नक्शे पर सिर्फ़ वे राज्य हैं जिनके प्रकाशित रिकॉर्ड हैं। राष्ट्रीय रिकॉर्ड नक्शे से बाहर हैं।')}</p></div>
      {states.length === 0 ? <div className="py-12"><EmptyState title={t('No state-linked records yet.', 'अभी कोई राज्य-स्तरीय रिकॉर्ड नहीं।')} text={t('States appear on the map once a published record names them.', 'जब कोई प्रकाशित रिकॉर्ड किसी राज्य का नाम लेगा, वह नक्शे पर दिखेगा।')} /></div> : <div className="grid gap-8 py-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div className="overflow-hidden" data-testid="india-editorial-map">
          {geoStatus === 'loading' && <div className="border border-dashed border-foreground/25 py-16 text-center" role="status" data-testid="status-india-map-loading"><div className="mx-auto h-8 w-40 animate-pulse bg-muted" /><p className="mt-4 signal-kicker text-muted-foreground">{t('Loading the map…', 'नक्शा लोड हो रहा है…')}</p></div>}
          {geoStatus === 'error' && <div className="border border-accent/50 bg-card px-6 py-10 text-center" role="alert" data-testid="status-india-map-error"><p className="signal-kicker text-accent">{t('Map unavailable', 'नक्शा उपलब्ध नहीं')}</p><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t('The state-boundary file is missing or malformed. State records are still listed.', 'राज्य सीमाओं की फ़ाइल नहीं मिली या ख़राब है। राज्यों के रिकॉर्ड सूची में मौजूद हैं।')}</p><button type="button" className="signal-button mt-5" onClick={() => setGeoRetry((value) => value + 1)} data-testid="button-retry-india-map">{t('Try map again', 'नक्शा फिर लोड करें')}</button></div>}
          {geoStatus === 'ready' && <svg viewBox="0 0 1000 950" role="group" aria-label={t('Map of states with published records', 'प्रकाशित रिकॉर्ड वाले राज्यों का नक्शा')} className="india-map">{features.map((feature, index) => { const featureName = getMapFeatureName(feature); const stateName = featureName ? canonicalStateName(featureName) : null; const active = Boolean(stateName && states.some((name) => stateNameKey(name) === stateNameKey(stateName))); const isSelected = Boolean(stateName && selected && stateNameKey(selected) === stateNameKey(stateName)); return <path key={`${featureName ?? 'state'}-${index}`} data-testid={active && stateName ? `map-state-shape-${slugify(stateName)}` : undefined} d={mapPath(feature.geometry?.coordinates)} className={`${active ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`} aria-label={active && stateName ? t(`Select ${stateName}`, `${label(stateName)} चुनें`) : undefined} role={active ? 'button' : undefined} tabIndex={active ? 0 : undefined} aria-pressed={active ? isSelected : undefined} onClick={() => active && stateName && toggleSelectedState(stateName)} onKeyDown={(event) => { if (active && stateName && isMapSelectionKey(event.key)) { event.preventDefault(); toggleSelectedState(stateName); } }} />; })}</svg>}
        </div>
        <div><p className="signal-kicker text-accent">{t(`States with published records / ${states.length}`, `प्रकाशित रिकॉर्ड वाले राज्य / ${states.length}`)}</p><div className="mt-3 grid gap-0">{states.map((state) => <button key={state} type="button" className="map-state-button flex items-center justify-between gap-4 signal-kicker" aria-pressed={Boolean(selected && stateNameKey(selected) === stateNameKey(state))} onClick={() => toggleSelectedState(state)} data-testid={`button-map-state-${slugify(state)}`}><span>{label(state)}</span><span className="text-muted-foreground">{getStoriesForState(stateStories, state).length}</span></button>)}</div></div>
      </div>}
      {unavailableState && <div className="mt-6 border-l-2 border-accent bg-card px-4 py-4" role="status" data-testid="note-unavailable-state">
        <p className="signal-kicker text-accent">{t('No current records for this state', 'इस राज्य का कोई मौजूदा रिकॉर्ड नहीं')}</p>
        <p className="mt-2 text-sm leading-relaxed">{t(`No published state-linked records are available for ${unavailableState}. This link may be out of date.`, `${label(unavailableState)} के लिए कोई प्रकाशित रिकॉर्ड उपलब्ध नहीं है। यह लिंक पुराना हो सकता है।`)}</p>
        <button type="button" className="mt-3 signal-kicker text-accent hover:underline" onClick={clearStateSelection} data-testid="button-show-all-states-from-unavailable">{t('Show all states', 'सभी राज्य दिखाएँ')}</button>
      </div>}
      {unmappedStates.length > 0 && <p className="mt-3 border-l-2 border-accent px-3 py-2 text-xs leading-relaxed text-muted-foreground" role="note" data-testid="note-unmapped-map-states">{t(`No boundary is available for ${unmappedStates.join(', ')}. These records can still be selected from the list.`, `${unmappedStates.map((name) => label(name)).join(', ')} की सीमा उपलब्ध नहीं है। इनके रिकॉर्ड सूची से चुने जा सकते हैं।`)}</p>}
      <p className="mt-3 max-w-xl text-[10px] leading-relaxed text-muted-foreground">{t('Map for navigation only, not a legal boundary reference.', 'नक्शा केवल नेविगेशन के लिए है, क़ानूनी सीमा का संदर्भ नहीं।')} <a href={`${basePath}/data/india-map-attribution.md`} className="signal-rule-link" target="_blank" rel="noopener noreferrer">{t('Map attribution and boundary notice', 'नक्शे का स्रोत और सीमा सूचना')}</a>.</p>
      {selectedStories.length > 0 && <div className="border-t border-foreground/20 pt-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="signal-kicker text-accent">{selected ? label(selected) : t('Recent state records', 'हाल के राज्य रिकॉर्ड')}</p>{selectedLatest && <p className="mt-2 text-sm text-muted-foreground">{t('Latest:', 'ताज़ा:')} <span lang={selectedLatest.contentLang}>{selectedLatest.title}</span></p>}</div><div className="flex flex-wrap items-center gap-4">{selected && <><button type="button" className="inline-flex items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" onClick={() => void copySelectedStateLink()} data-testid="button-copy-map-state-link"><Copy size={13} /> {t('Copy state link', 'लिंक कॉपी करें')}</button><button type="button" className="signal-kicker text-muted-foreground hover:text-accent" onClick={clearStateSelection} data-testid="button-clear-map-state">{t('Show all states', 'सभी राज्य दिखाएँ')}</button></>}</div></div>{selected && copyStatus && <p className="mt-3 signal-kicker text-accent" role="status" aria-live="polite" data-testid="status-copy-map-state-link">{copyStatus}</p>}<div className="mt-4 grid gap-5 sm:grid-cols-3">{selectedStories.map((story) => <Link href={storyPath(story)} key={story.id} className="group"><p className="signal-kicker text-muted-foreground">{story.publishedOn ? t('Published', 'प्रकाशित') : t('Record date', 'रिकॉर्ड तिथि')} / {formatDate(story.recordDate ?? story.publishedOn)}</p><h3 className="mt-2 font-display text-2xl leading-tight group-hover:text-accent" lang={story.contentLang}>{story.title}</h3><div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={story.verificationStatus} /></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground" lang={story.contentLang}>{story.dek}</p></Link>)}</div></div>}
    </div>
  </section>;
}

function DocumentFeature() {
  const query = useGetEvidenceEvents(undefined, { query: { queryKey: getGetEvidenceEventsQueryKey(), staleTime: 60_000 } });
  const t = useT();
  const source = query.data?.events.flatMap((event) => event.primarySources)[0] ?? query.data?.events.flatMap((event) => event.secondarySources)[0];
  return <section className="signal-container mt-20 sm:mt-28" id="the-document" aria-labelledby="document-title">
    <div className="grid gap-8 border-y-2 border-foreground py-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-14">
      <div><p className="signal-kicker text-accent">{t('The document', 'दस्तावेज़')}</p><h2 id="document-title" className="mt-3 font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-7xl">{t(<>Don’t trust us.<br /><em className="font-normal text-accent">Read the source.</em></>, <>हम पर भरोसा मत कीजिए।<br /><em className="font-normal text-accent">स्रोत पढ़िए।</em></>)}</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">{t('A primary document from the public evidence archive, with its status and publication date intact.', 'सार्वजनिक सबूत अभिलेखागार का एक मूल दस्तावेज़, उसकी स्थिति और प्रकाशन तिथि के साथ।')}</p></div>
      <article className="grid gap-6 sm:grid-cols-[.8fr_1.2fr] sm:items-center" data-testid="feature-the-document">
        <div className="document-placeholder" role="img" aria-label={query.isLoading ? t('Loading source document preview', 'दस्तावेज़ लोड हो रहा है') : query.isError ? t('Source document request failed', 'दस्तावेज़ नहीं मिल सका') : source ? t('Source document preview unavailable', 'दस्तावेज़ का पूर्वावलोकन उपलब्ध नहीं') : t('No public source document returned', 'कोई सार्वजनिक दस्तावेज़ नहीं मिला')} />
        <div>{query.isLoading ? <div role="status"><div className="h-3 w-40 animate-pulse bg-muted" /><p className="mt-4 signal-kicker text-muted-foreground">{t('Loading published documents…', 'प्रकाशित दस्तावेज़ लोड हो रहे हैं…')}</p></div> : query.isError ? <div role="alert"><p className="signal-kicker text-accent">{t('Document archive unavailable', 'दस्तावेज़ अभिलेखागार उपलब्ध नहीं')}</p><h3 className="mt-3 font-display text-3xl leading-tight">{t('The document request failed.', 'दस्तावेज़ का अनुरोध विफल रहा।')}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('A failed request does not mean the document does not exist. Try the evidence archive.', 'अनुरोध विफल होने का मतलब यह नहीं कि दस्तावेज़ मौजूद नहीं है। सबूत अभिलेखागार देखें।')}</p><Link href="/events" className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">{t('Open the evidence archive', 'सबूत अभिलेखागार खोलें')} <ArrowUpRight size={13} /></Link></div> : source ? <><p className="signal-kicker text-accent">{source.documentType} / {source.status}</p><h3 className="mt-3 font-display text-3xl leading-tight" lang="en">{source.title}</h3><p className="mt-3 text-sm text-muted-foreground"><span lang="en">{source.publisher}</span> · {t('Published', 'प्रकाशित')} {formatDate(source.publicationDate)}</p>{source.sourceUrl ? <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">{t('View source', 'स्रोत देखें')} <ExternalLink size={13} /></a> : <p className="mt-6 signal-kicker text-muted-foreground">{t('No direct source link', 'सीधा स्रोत लिंक नहीं')}</p>}</> : <><p className="signal-kicker text-accent">{t('No public document yet', 'अभी कोई सार्वजनिक दस्तावेज़ नहीं')}</p><h3 className="mt-3 font-display text-3xl leading-tight">{t('This panel shows a document only when one exists in the archive.', 'यह पैनल तभी दस्तावेज़ दिखाता है जब वह अभिलेखागार में मौजूद हो।')}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('We do not simulate scans or mock up documents.', 'हम नक़ली स्कैन या दस्तावेज़ नहीं बनाते।')}</p></>}</div>
      </article>
    </div>
  </section>;
}

function Home() {
  const issueQuery = useGetCurrentIssue();
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const archiveQuery = useGetArchive(archiveParams, { query: { queryKey: getGetArchiveQueryKey(archiveParams) } });
  const decisionImpactQuery = useGetDecisionImpacts({ limit: 100 }, { query: { queryKey: getGetDecisionImpactsQueryKey({ limit: 100 }) } });
  const t = useT();
  const label = useLabel();
  const localize = useLocalizeStories();
  const homeTitle = t('The Signal 24 — Power, on the record', 'द सिग्नल 24 — सत्ता, दस्तावेज़ों के आईने में');
  const homeDescription = t("India’s governments promise. We check the paperwork. A ruthlessly sourced newsroom on reservation, courts and the state, in English and Hindi.", "भारत की सरकारें वादे करती हैं। हम काग़ज़ जाँचते हैं। आरक्षण, अदालतों और सरकार पर बेरहमी से स्रोत-आधारित न्यूज़रूम, हिंदी और अंग्रेज़ी में।");
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
  const visualStories = reporting.filter((story) => story.id !== featured?.id).slice(0, 3);
  const latestStories = reporting.slice(0, 6);
  const investigation = sourcedStories.find((story) => story.id !== featured?.id && (story.kind === 'Article' || story.kind === 'Explainer'));
  const featuredImage = featured ? imageForStory(featured) : null;
  const measuredRecords = (decisionImpactQuery.data?.records ?? []).filter(isMeasuredDecisionImpact);
  return <main className="signal-page"><Header />
    <HomeStage stories={stories} storyHref={storyPath} />
    {featured ? <section className={`signal-container visual-hero mt-7 ${featuredImage?.kind === 'illustration' ? 'visual-hero--illustration' : ''}`} data-testid={`card-home-hero-${featured.id}`}>{featuredImage ? <img src={featuredImage.src} alt={featuredImage.alt} width={featuredImage.width} height={featuredImage.height} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" /> : <div className="story-art-placeholder absolute inset-0" />}<div className="visual-hero-copy flex min-h-[440px] flex-col justify-end p-6 sm:min-h-[560px] sm:max-w-[72%] sm:p-12 lg:min-h-[680px] lg:max-w-[62%] lg:p-16"><p className="signal-kicker text-accent">{label(featured.topic)} / {label(featured.kind)}</p><Link href={storyPath(featured)} className="group mt-4 block"><h1 lang={featured.contentLang} className="max-w-4xl font-display text-5xl leading-[.91] tracking-[-.055em] group-hover:text-accent sm:text-7xl lg:text-[6.8rem]" data-testid="heading-hero">{featured.title}</h1></Link><p lang={featured.contentLang} className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">{featured.dek}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 signal-kicker text-primary-foreground/70"><span>{formatDate(featured.publishedOn ?? featured.recordDate)}</span><span>{t(`${featured.read} min read`, `${featured.read} मिनट`)}</span><span>{verificationLabel(featured.verificationStatus)}</span></div><Link href={storyPath(featured)} className="mt-7 inline-flex w-fit items-center gap-2 signal-button bg-accent text-accent-foreground" data-testid="link-read-briefing">{t('Read the record', 'पूरा रिकॉर्ड पढ़ें')} <ArrowUpRight size={14} /></Link></div>{featuredImage && <p className="hero-credit">{featuredImage.credit} · {t('contextual, not evidence for this record', 'संदर्भ के लिए, इस रिकॉर्ड का सबूत नहीं')}</p>}</section> : <section className="signal-container mt-7 border-y-2 border-foreground py-0"><div className="grid min-h-[480px] items-stretch lg:grid-cols-[1fr_.72fr]"><div className="order-last flex flex-col justify-center py-16 lg:order-first lg:pr-12"><p className="signal-kicker text-accent">{t("For the people, by the people. Someone has to be.", "जनता के लिए, जनता की ओर से। किसी को तो होना होगा।")}</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.92] sm:text-7xl">{t("The government has plenty of explanations. We have the documents.", "सरकार के पास सफ़ाइयाँ बहुत हैं। हमारे पास दस्तावेज़ हैं।")}</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{t("We track what India’s governments, courts and commissions promise on reservation and representation, then check what they actually file, publish and quietly forget. Every claim links to its source, because “trust us” is not a citation.", "आरक्षण और प्रतिनिधित्व पर भारत की सरकारें, अदालतें और आयोग क्या वादा करते हैं, हम इसका हिसाब रखते हैं, और फिर देखते हैं कि वे असल में क्या दर्ज करते हैं, क्या छापते हैं और क्या चुपचाप भूल जाते हैं। हर दावा अपने स्रोत से जुड़ा है, क्योंकि “हम पर भरोसा कीजिए” कोई हवाला नहीं होता।")}</p><div className="mt-7 flex flex-wrap gap-3"><a href="#accountability" className="inline-flex w-fit items-center gap-2 signal-button bg-accent text-accent-foreground">{t("See what they’re dodging", "देखिए वे किन सवालों से बच रहे हैं")} <ArrowDownRight size={14} /></a><Link href="/archive" className="inline-flex w-fit items-center gap-2 signal-button">{t('Browse the archive', 'अभिलेखागार देखें')} <ArrowUpRight size={14} /></Link></div></div><figure className="order-first relative m-0 min-h-[280px] overflow-hidden border-l border-foreground/15 lg:order-last"><img src={`${basePath}/illustrations/magnifier-hero.svg`} alt={illustration('magnifier-hero').alt} width="1600" height="900" fetchPriority="high" className="h-full w-full object-cover" /><figcaption className="absolute inset-x-0 bottom-0 bg-primary/85 px-3 py-3 signal-kicker text-primary-foreground/75">{t('Illustration: The Signal 24', 'चित्रण: द सिग्नल 24')}</figcaption></figure></div></section>}
    <AccountabilityWatch />
    <PolicyLedger />
    {visualStories.length > 0 && <section className="signal-container mt-16 sm:mt-24" id="visual-signals">
      <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4"><div><p className="signal-kicker text-accent">{t('On the record', 'रिकॉर्ड पर')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("What the documents show, despite everyone’s best efforts.", "दस्तावेज़ क्या दिखाते हैं, तमाम कोशिशों के बावजूद।")}</h2></div><Link href="/archive" className="signal-kicker text-accent hover:underline">{t('All records', 'सभी रिकॉर्ड')} <ArrowUpRight size={13} className="ml-1 inline" /></Link></div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">{visualStories.map((story) => <article key={story.id} className="visual-signal-card group" data-testid={`card-visual-signal-${story.id}`}>
        <Link href={storyPath(story)} className="visual-signal-image block"><StoryArt story={story} className="h-full" /></Link>
        <div className="flex flex-1 flex-col p-5">
          <p className="signal-kicker text-accent">{label(story.topic)} / {label(story.kind)}</p>
          <Link href={storyPath(story)} className="mt-3 block"><h3 lang={story.contentLang} className="font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3></Link>
          <div className="mt-2"><StatusBadge status={story.verificationStatus} /></div>
          <p lang={story.contentLang} className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p>
          <p className="mt-auto pt-6 signal-kicker text-muted-foreground">{story.publishedOn ? t('Published', 'प्रकाशित') : t('Record date', 'रिकॉर्ड तिथि')} / {formatDate(story.publishedOn ?? story.recordDate)} · {t(`${story.sourceCount ?? 0} sources`, `${story.sourceCount ?? 0} स्रोत`)}</p>
        </div>
      </article>)}</div>
    </section>}
    <section className="signal-container mt-20 sm:mt-28" id="latest-stories"><div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4"><div><p className="signal-kicker text-accent">{t('Latest reporting', 'ताज़ा रिपोर्टिंग')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("Follow the paper trail. Nobody expected you to.", "काग़ज़ों का सिरा पकड़िए। किसी को उम्मीद नहीं थी कि आप पकड़ेंगे।")}</h2></div><Link href="/timeline" className="signal-kicker text-accent hover:underline">{t('Open the timeline', 'समयरेखा खोलें')} <ArrowUpRight size={13} className="ml-1 inline" /></Link></div><div className="mt-2">{latestStories.length ? latestStories.map((story) => <StoryCard key={story.id} story={story} compact />) : <EmptyState title={t('No published reporting yet.', 'अभी कोई प्रकाशित रिपोर्टिंग नहीं।')} text={t('Published records appear here with their source and verification status.', 'प्रकाशित रिकॉर्ड यहाँ अपने स्रोत और सत्यापन स्थिति के साथ दिखेंगे।')} />}</div></section>
    {opinions.length > 0 && <section className="signal-container mt-20 sm:mt-28" id="opinion"><div className="grid gap-8 bg-primary p-7 text-primary-foreground sm:p-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="opinion-label bg-accent text-accent-foreground">{label('Opinion')}</span><h2 className="mt-4 font-display text-4xl leading-[.95] sm:text-5xl">{t("Where we stop being polite.", "जहाँ हम शिष्टाचार छोड़ देते हैं।")}</h2><p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">{t("Signed, labelled, and kept away from the reporting so nobody mistakes our irritation for our evidence.", "नाम के साथ, लेबल के साथ, और रिपोर्टिंग से दूर, ताकि कोई हमारी झुँझलाहट को हमारा सबूत न समझ ले।")}</p><Link href="/opinion" className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">{t('All opinion', 'सारी राय')} <ArrowUpRight size={13} /></Link></div><div className="divide-y divide-primary-foreground/20">{opinions.slice(0, 3).map((story) => <Link key={story.id} href={storyPath(story)} className="group block py-5 first:pt-0"><p className="signal-kicker text-primary-foreground/60">{label(story.byline) || t('Editorial board', 'संपादकीय बोर्ड')} · {formatDate(story.publishedOn)}</p><h3 lang={story.contentLang} className="mt-2 font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3><p lang={story.contentLang} className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{story.dek}</p></Link>)}</div></div></section>}
    {investigation && <section className="signal-container mt-20 sm:mt-28" id="featured-investigation"><div className="grid overflow-hidden bg-primary text-primary-foreground lg:grid-cols-[1.08fr_.92fr]"><div className="min-h-[300px]"><StoryArt story={investigation} className="h-full min-h-[300px]" /></div><div className="flex flex-col justify-center p-7 sm:p-12"><p className="signal-kicker text-accent">{t('In depth', 'विस्तार से')}</p><div className="mt-3 flex flex-wrap gap-2"><span className="signal-status-badge">{verificationLabel(investigation.verificationStatus)}</span></div><h2 lang={investigation.contentLang} className="mt-4 font-display text-4xl leading-[.94] sm:text-6xl">{investigation.title}</h2><p lang={investigation.contentLang} className="mt-5 text-sm leading-relaxed text-primary-foreground/70">{investigation.dek}</p><p className="mt-5 signal-kicker text-primary-foreground/65">{t(`${investigation.sourceCount ?? 0} sources · ${investigation.eventCount ?? 0} events`, `${investigation.sourceCount ?? 0} स्रोत · ${investigation.eventCount ?? 0} घटनाएँ`)}</p><Link href={storyPath(investigation)} className="mt-7 inline-flex w-fit items-center gap-2 signal-kicker text-accent hover:underline">{t('Read the full record', 'पूरा रिकॉर्ड पढ़ें')} <ArrowUpRight size={13} /></Link></div></div></section>}
    <IndiaFocus stories={stories} />
    <DocumentFeature />
    <section className="signal-container mt-20 sm:mt-28" id="the-numbers"><div className="border-y-2 border-foreground py-8"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="signal-kicker text-accent">{t('The numbers', 'आंकड़े')}</p><h2 className="mt-3 font-display text-5xl leading-[.9] sm:text-7xl">{t(<>No number<br /><em className="font-normal text-accent">without its frame.</em></>, <>कोई आंकड़ा<br /><em className="font-normal text-accent">संदर्भ के बिना नहीं।</em></>)}</h2></div><div className="max-w-md"><p className="text-sm leading-relaxed text-muted-foreground">{t("The figures this whole fight turns on, each with its unit, year, definition and source. Notice how many of them are about what the state has frozen or withheld.", "वे आंकड़े जिन पर यह पूरी लड़ाई टिकी है, हर एक अपनी इकाई, वर्ष, परिभाषा और स्रोत के साथ। ग़ौर कीजिए कि इनमें से कितने इस बारे में हैं कि सरकार ने क्या जमा रखा है या रोक रखा है।")}</p><Link href="/data" className="mt-4 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-home-data-room">{t('Open the data room', 'आंकड़ा कक्ष खोलें')} <ArrowUpRight size={13} /></Link></div></div>{measuredRecords.length > 0 && <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{measuredRecords.slice(0, 4).map((record) => <article key={record.id} className="border-t border-foreground/20 pt-4"><p className="signal-kicker text-accent">{record.geography} · {record.decisionArea}</p><p className="mt-3 font-display text-4xl">{record.findingValue} <span className="text-base">{record.findingUnit}</span></p><p className="mt-2 text-sm leading-relaxed text-muted-foreground" lang="en">{record.definition}</p><p className="mt-3 signal-kicker text-muted-foreground">{t('Source', 'स्रोत')}: {record.source}</p></article>)}</div>}<div className="mt-8"><KeyFigures limit={8} /></div></div></section>
    <section className="signal-container mt-20 sm:mt-28" id="timeline-preview">
      <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4"><div><p className="signal-kicker text-accent">{t('Timeline', 'समयरेखा')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("Dates, with the context they leave out.", "तारीख़ें, उस संदर्भ के साथ जो वे छोड़ देते हैं।")}</h2></div><Link href="/timeline" className="signal-kicker text-accent hover:underline">{t('Full timeline', 'पूरी समयरेखा')} <ArrowUpRight size={13} className="ml-1 inline" /></Link></div>
      {stories.length ? <div className="mt-2">{stories.slice(0, 3).map((story) => <Link key={story.id} href={storyPath(story)} className="timeline-visual-entry group">
        <time className="signal-kicker text-muted-foreground" dateTime={story.recordDate ?? story.publishedOn ?? undefined}>{formatDate(story.recordDate ?? story.publishedOn)}</time>
        <span className="timeline-dot hidden md:block" />
        <div className="timeline-visual-thumb"><StoryArt story={story} className="h-full" /></div>
        <div>
          <p className="signal-kicker text-accent">{label(story.topic)} / {label(story.kind)}</p>
          <h3 lang={story.contentLang} className="mt-2 font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3>
          <div className="mt-2"><StatusBadge status={story.verificationStatus} /></div>
          <p lang={story.contentLang} className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.dek}</p>
        </div>
      </Link>)}</div> : <div className="mt-2"><EmptyState title={t('No dated records yet.', 'अभी कोई तारीख़वार रिकॉर्ड नहीं।')} /></div>}
    </section>
    <section className="signal-container mt-20 sm:mt-28" id="archive-preview"><div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4"><div><p className="signal-kicker text-accent">{t('Archive', 'अभिलेखागार')}</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("Keep the record. They’re counting on you not to.", "रिकॉर्ड सँभालकर रखिए। वे इसी भरोसे हैं कि आप नहीं रखेंगे।")}</h2></div><Link href="/archive" className="signal-kicker text-accent hover:underline">{t('Browse the archive', 'अभिलेखागार देखें')} <ArrowUpRight size={13} className="ml-1 inline" /></Link></div><div className="mt-2">{stories.slice(0, 4).map((story) => <StoryCard key={story.id} story={story} compact />)}</div></section>
    <LiveDesk /><DecisionEvidenceSection records={decisionImpactQuery.data?.records ?? []} isLoading={decisionImpactQuery.isLoading} isError={decisionImpactQuery.isError} /><NewsletterSignup />
  </main>;
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
  const title = t('Topics — The Signal 24', 'विषय — द सिग्नल 24');
  const description = t('Six desks, one record: courts, states, history, data, ground reports and the latest. Every topic file carries its brief, its dated evidence and its sources.', 'छह डेस्क, एक रिकॉर्ड: अदालतें, राज्य, इतिहास, आंकड़े, ज़मीनी रिपोर्टें और ताज़ा। हर विषय फ़ाइल के साथ उसका ब्रीफ़, तारीख़वार सबूत और स्रोत।');
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
  useSeo({
    title: name,
    description,
    canonicalPath: brief ? path : undefined,
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
  const archiveQuery = useLocalizedArchive(archiveParams, {
    query: { queryKey: getGetArchiveQueryKey(archiveParams) },
  });
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
    const storyEntries = (archiveQuery.data?.stories ?? [])
      .filter((story) => story.workflowStatus === 'published' && Boolean(story.publishedOn ?? story.recordDate))
      .map((story) => ({
        id: `story-${story.id}`,
        date: story.publishedOn ?? story.recordDate!,
        dateLabel: story.publishedOn ? 'Signal 24 publication date' : t("Record date / as supplied", "रिकॉर्ड तिथि / जैसी दी गई"),
        kind: 'record' as const,
        visual: imageForStory(story),
        label: `${label(story.kind)} / ${verificationLabel(story.verificationStatus)}`,
        title: story.title,
        summary: story.dek,
        source: `${story.source} · ${story.sourceUrl ? 'Direct source available' : 'Direct source unavailable'} · ${story.sourceCount ?? 0} sources · ${story.eventCount ?? 0} events`,
        href: storyPath(story),
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
    return [...policyEntries, ...storyEntries, ...leadEntries]
      .filter((entry) => entry.date && !Number.isNaN(Date.parse(entry.date)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [archiveQuery.data, policyQuery.data]);
  useSeo({
    title: t("Timeline — The Signal 24", "समयरेखा — द सिग्नल 24"),
    description: t("A dated index of policy changes, court rulings and Signal 24 records, with outside leads labelled separately.", "नीतिगत बदलावों, अदालती फ़ैसलों और द सिग्नल 24 के रिकॉर्ड की तारीख़वार सूची, बाहरी सुराग अलग से चिह्नित।"),
    canonicalPath: '/timeline',
    structuredData: siteGraph(
      collectionPageNode('/timeline', { name: t("Timeline — The Signal 24", "समयरेखा — द सिग्नल 24"), description: t("A dated index of policy changes, court rulings and Signal 24 records, with outside leads labelled separately.", "नीतिगत बदलावों, अदालती फ़ैसलों और द सिग्नल 24 के रिकॉर्ड की तारीख़वार सूची, बाहरी सुराग अलग से चिह्नित।"), publisher: organizationRef }, entries.filter((entry) => entry.kind !== 'lead' && entry.href.startsWith('/')).map((entry) => ({ url: entry.href, name: entry.title }))),
      breadcrumbNode('/timeline', [['Timeline', '/timeline']]),
    ),
  });
  const hasError = archiveQuery.isError || policyQuery.isError;
  const loading = archiveQuery.isLoading || policyQuery.isLoading;
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">{t("The Signal 24 / timeline", "द सिग्नल 24 / समयरेखा")}</p>
      <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.88] tracking-[-.06em] sm:text-8xl">{t("Dates with", "तारीख़ें,")}<br /><em className="font-normal text-accent">{t("their record type.", "रिकॉर्ड के प्रकार के साथ।")}</em></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("An index of dated records, not a complete history. Governments prefer announcements to dates; we prefer dates. Effective dates, publication dates and outside leads are labelled separately, and a headline is never treated as a court finding.", "तारीख़वार रिकॉर्ड की सूची, पूरा इतिहास नहीं। सरकारों को घोषणाएँ पसंद हैं, हमें तारीख़ें। लागू होने की तिथि, प्रकाशन तिथि और बाहरी सुराग अलग-अलग चिह्नित हैं, और किसी सुर्ख़ी को कभी अदालत का निष्कर्ष नहीं माना जाता।")}</p>
    </section>
    <section className="signal-container mt-12 pb-12 sm:mt-16 sm:pb-16">
      {hasError && <p className="signal-note mb-5 p-4 text-sm text-muted-foreground" role="status">{t("Some source lists did not load. The dates below come only from the lists that did.", "कुछ स्रोत सूचियाँ लोड नहीं हुईं। नीचे की तारीख़ें सिर्फ़ उन्हीं सूचियों से हैं जो लोड हुईं।")}</p>}
      {loading ? <LoadingBlock label={t("Assembling dated source entries…", "तारीख़वार प्रविष्टियाँ तैयार हो रही हैं…")} /> :
        !entries.length ? <EmptyState title={t("No dated entries are available.", "कोई तारीख़वार प्रविष्टि उपलब्ध नहीं।")} text={t("The timeline only uses dates attached to published records or attributed external sources.", "समयरेखा सिर्फ़ प्रकाशित रिकॉर्ड या नामित बाहरी स्रोतों से जुड़ी तारीख़ों का इस्तेमाल करती है।")} /> :
          <div className="border-t-2 border-foreground">
            {entries.map((entry) => <article key={entry.id} className="timeline-visual-entry" data-testid={`timeline-entry-${entry.id}`}>
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
          </div>}
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
    title: t("Search the archive — The Signal 24", "अभिलेखागार खोजें — द सिग्नल 24"),
    description: t("Search published Signal 24 records and clearly labelled outside leads.", "द सिग्नल 24 के प्रकाशित रिकॉर्ड और साफ़ चिह्नित बाहरी सुराग खोजें।"),
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
  const title = t('Open-category competition — The Signal 24', 'खुली श्रेणी की प्रतिस्पर्धा — द सिग्नल 24');
  const description = t('Open-category competition, UGC equity rules and EWS eligibility: what the law says, what was claimed, and what the courts actually decided.', 'खुली श्रेणी की प्रतिस्पर्धा, यूजीसी समता नियम और ईडब्ल्यूएस पात्रता: क़ानून क्या कहता है, क्या दावा किया गया, और अदालतों ने असल में क्या फ़ैसला दिया।');
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
    title: t("The archive — The Signal 24", "अभिलेखागार — द सिग्नल 24"),
    description: t("Search published reporting, court rulings, policy changes, historical documents and state records.", "प्रकाशित रिपोर्टिंग, अदालती फ़ैसले, नीतिगत बदलाव, ऐतिहासिक दस्तावेज़ और राज्यों के रिकॉर्ड खोजें।"),
    canonicalPath: '/archive',
    structuredData: siteGraph(
      collectionPageNode('/archive', { name: t("The archive — The Signal 24", "अभिलेखागार — द सिग्नल 24"), description: t("Search published reporting, court rulings, policy changes, historical documents and state records.", "प्रकाशित रिपोर्टिंग, अदालती फ़ैसले, नीतिगत बदलाव, ऐतिहासिक दस्तावेज़ और राज्यों के रिकॉर्ड खोजें।"), publisher: organizationRef }, (data?.stories ?? []).filter((story) => story.indexable).map((story) => ({ url: storyPath(story), name: story.title }))),
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
    title: t("Policy ledger — The Signal 24", "नीति रजिस्टर — द सिग्नल 24"),
    description: t("Search every recorded change in reservation policy: the old rule, the new rule, the legal basis, the court status and the primary sources.", "आरक्षण नीति के हर दर्ज बदलाव को खोजें: पुराना नियम, नया नियम, क़ानूनी आधार, अदालत में स्थिति और मूल स्रोत।"),
    canonicalPath: '/policies',
    structuredData: siteGraph(
      collectionPageNode('/policies', { name: t("Policy ledger — The Signal 24", "नीति रजिस्टर — द सिग्नल 24"), description: t("Every recorded change in reservation policy, with the old rule, the new rule, the legal basis, the court status and the primary sources.", "आरक्षण नीति का हर दर्ज बदलाव: पुराना नियम, नया नियम, क़ानूनी आधार, अदालत में स्थिति और मूल स्रोत।"), publisher: organizationRef }, (data?.records ?? []).map((record) => ({ url: record.canonicalPath, name: record.title }))),
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
  return <div className="share-row" aria-live="polite"><button type="button" className="share-button" onClick={() => void share()} data-testid={`button-share-story-${story.id}`}><Link2 size={13} /> {t("Share record", "रिकॉर्ड साझा करें")}</button>{status && <span className="signal-kicker text-accent" data-testid={`status-share-story-${story.id}`}>{status}</span>}</div>;
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
  const recordPath = story ? storyPath(story) : undefined;
  const isOpinion = story?.kind === 'Opinion';
  const structuredData = useMemo(() => {
    if (!story) return null;
    const path = recordPath ?? '/';
    const visual = imageForStory(story);
    const image = visual.kind === 'illustration' ? imageObject(visual.shareSrc, 1200, 630) : imageObject(visual.src, visual.width, visual.height);
    const page = webPageNode(path, { name: `${story.title} — The Signal 24`, description: story.dek, primaryImageOfPage: image, inLanguage: story.contentLang === 'hi' ? 'hi-IN' : SITE_LANGUAGE });
    const breadcrumb = breadcrumbNode(path, [[lang === 'hi' ? 'अभिलेखागार' : 'Archive', '/archive'], [story.title, path]]);
    // Non-indexable records stay a plain WebPage with no article claims.
    if (!story.indexable) return siteGraph(page, breadcrumb);
    // articlePublishedAt is the full publication timestamp; publishedOn is the edition date.
    // The API exposes no content-modified timestamp (reviewedAt/lastVerifiedAt are source
    // checks, not edits), so dateModified mirrors datePublished.
    const published = story.articlePublishedAt ?? story.publishedOn ?? undefined;
    const sourceDocument = story.sourceUrl || story.source
      ? externalDocument({ title: story.source || story.sourceUrl || 'Source', url: story.sourceUrl, publisher: story.source, datePublished: story.sourcePublishedOn })
      : null;
    return siteGraph(
      page,
      {
        '@type': isOpinion ? 'OpinionNewsArticle' : story.kind === 'Article' ? 'NewsArticle' : 'Article',
        '@id': `${path}#record`,
        headline: story.title,
        description: story.dek,
        url: path,
        mainEntityOfPage: { '@id': `${path}#webpage` },
        image: [image],
        ...(published ? { datePublished: published, dateModified: published } : {}),
        author: isOpinion && story.byline ? { '@type': 'Organization', name: story.byline, parentOrganization: organizationRef } : editorialDeskRef,
        publisher: organizationRef,
        isPartOf: websiteRef,
        inLanguage: story.contentLang === 'hi' ? 'hi-IN' : SITE_LANGUAGE,
        isAccessibleForFree: true,
        articleSection: story.topic,
        genre: story.kind,
        keywords: [story.topic, story.kind, story.state].filter(Boolean).join(', '),
        wordCount: plainText(story.body).split(/\s+/).filter(Boolean).length,
        ...(story.state ? { spatialCoverage: placeForState(story.state) } : {}),
        ...(story.sourceUrl ? { isBasedOn: story.sourceUrl } : {}),
        ...(sourceDocument ? { citation: sourceDocument } : {}),
        ...(story.correctionNote ? { correction: { '@type': 'CorrectionComment', text: story.correctionNote } } : {}),
      },
      editorialDeskNode,
      breadcrumb,
    );
  }, [isOpinion, lang, recordPath, story]);
  useSeo({
    title: story ? `${story.title} — The Signal 24` : t('Record — The Signal 24', 'रिकॉर्ड — द सिग्नल 24'),
    description: story?.dek ?? t('A source record from The Signal 24.', 'द सिग्नल 24 का एक स्रोत-आधारित रिकॉर्ड।'),
    canonicalPath: story?.indexable ? recordPath : undefined,
    robots: story?.indexable ? 'index, follow' : 'noindex, follow',
    type: story?.indexable ? 'article' : 'website',
    image: story ? imageForStory(story).shareSrc : undefined,
    translated: story?.isTranslated ?? true,
    structuredData,
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
              <Link href="/authors/signal-24" className="article-byline-name">{t('By', 'लेखक:')} {byline}</Link>
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
        {story.aiDisclosure && <div className="signal-note mt-8 max-w-3xl px-5 py-4"><p className="signal-kicker text-accent">{t('How this record was made', 'यह रिकॉर्ड कैसे बना')}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground" lang="en">{story.aiDisclosure}</p></div>}
      </section>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="signal-kicker text-muted-foreground">{label}</span>{children}</label>;
}

type StoryDraft = StoryInput & { id?: number };
const emptyStory = (issueId: number): StoryDraft => ({ issueId, topic: 'Latest', kind: 'Article', state: '', source: '', sourceUrl: '', publishedOn: new Date().toISOString().slice(0, 10), eyebrow: '', title: '', dek: '', body: '', time: '6 min', read: 6, tone: 'Latest', number: null, sortOrder: 1 });

function localDateTimeValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function RevisionHistory({ storyId }: { storyId?: number }) {
  const { data, isLoading } = useGetStoryRevisions(storyId ?? 0, {
    query: { ...getGetStoryRevisionsQueryOptions(storyId ?? 0), enabled: Boolean(storyId) },
  });
  if (!storyId) return null;
  return <div className="mt-6 border-t border-foreground/15 pt-5">
    <div className="flex items-center justify-between gap-4">
      <p className="signal-kicker text-accent">Revision history</p>
      <span className="signal-kicker text-muted-foreground">{data?.length ?? 0} saved</span>
    </div>
    {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading saved revisions…</p> : data?.length ? <div className="mt-3 space-y-2">{data.map((revision) => {
      const title = typeof revision.snapshot.title === 'string' ? revision.snapshot.title : 'Untitled revision';
      return <div key={revision.id} className="flex items-start justify-between gap-4 border-l border-foreground/20 pl-3 text-sm">
        <div><p className="font-medium">Revision {revision.revisionNumber}</p><p className="text-muted-foreground">{revision.changeNote || 'No change note'}</p><p className="text-xs text-muted-foreground">{title}</p></div>
        <time className="shrink-0 text-xs text-muted-foreground">{formatDate(revision.createdAt)}</time>
      </div>;
    })}</div> : <p className="mt-3 text-sm text-muted-foreground">No revisions recorded yet.</p>}
  </div>;
}

type DecisionImpactDraft = DecisionImpactInput & { id?: number };

function DecisionImpactRevisionHistory({ recordId }: { recordId: number }) {
  const { data, isLoading, isError } = useGetDecisionImpactRevisions(recordId, {
    query: {
      ...getGetDecisionImpactRevisionsQueryOptions(recordId),
      enabled: Boolean(recordId),
    },
  });

  if (isLoading) {
    return <p className="mt-3 text-sm text-muted-foreground">Loading saved revisions…</p>;
  }
  if (isError) {
    return <p className="mt-3 text-sm text-accent" role="alert">The revision history could not be loaded.</p>;
  }
  if (!data?.length) {
    return <p className="mt-3 text-sm text-muted-foreground">No revisions recorded yet.</p>;
  }

  return <div className="mt-3 space-y-3">
    {data.map((revision: DecisionImpactRevision) => {
      const snapshot = revision.snapshot;
      const snapshotTitle = typeof snapshot.title === 'string' ? snapshot.title : 'Untitled revision';
      return <details key={revision.id} className="border-l border-foreground/20 pl-3" data-testid={`decision-impact-revision-${revision.revisionNumber}`}>
        <summary className="cursor-pointer text-sm">
          <span className="font-medium">Revision {revision.revisionNumber} / {snapshotTitle}</span>
          <span className="ml-2 text-xs text-muted-foreground">{formatDate(revision.createdAt)}</span>
        </summary>
        <p className="mt-2 text-sm text-muted-foreground">{revision.changeNote}</p>
        <p className="mt-1 signal-kicker text-muted-foreground">Recorded by {revision.changedBy}</p>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words border border-foreground/10 bg-background p-3 text-xs leading-relaxed text-muted-foreground">{JSON.stringify(snapshot, null, 2)}</pre>
      </details>;
    })}
  </div>;
}

function DecisionImpactDeskRecordRow({
  record,
  historyOpen,
  onToggleHistory,
  onEdit,
}: {
  record: DecisionImpactRecord;
  historyOpen: boolean;
  onToggleHistory: () => void;
  onEdit: () => void;
}) {
  return <div className="py-4" data-testid={`row-editor-decision-impact-${record.id}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="signal-kicker text-accent">{evidenceTypeLabel(record.evidenceType)} / {record.decisionArea}</p>
          <span className="rounded-full border border-foreground/20 px-2 py-1 signal-kicker text-[9px]">{record.workflowStatus}</span>
          <span className="signal-kicker text-muted-foreground">{verificationLabel(record.verificationStatus)}</span>
        </div>
        <h3 className="mt-1 truncate font-display text-2xl">{record.title}</h3>
        <p className="mt-1 truncate text-sm text-muted-foreground">{record.geography} · {formatDate(record.observedOn)} · {record.source}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-4">
        <button type="button" onClick={onToggleHistory} aria-expanded={historyOpen} className="inline-flex items-center gap-1 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-history-decision-impact-${record.id}`}>
          <ChevronDown size={13} className={historyOpen ? 'rotate-180' : ''} /> History
        </button>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-decision-impact-${record.id}`}>
          <Pencil size={13} /> Edit
        </button>
      </div>
    </div>
    {historyOpen && <DecisionImpactRevisionHistory recordId={record.id} />}
  </div>;
}

function emptyDecisionImpact(): DecisionImpactDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    evidenceType: 'lived-account',
    decisionArea: 'migration',
    title: '',
    summary: '',
    geography: 'India',
    observedOn: today,
    definition: '',
    findingValue: null,
    findingUnit: null,
    denominator: null,
    source: '',
    sourceUrl: '',
    sourcePublishedOn: null,
    sourceRetrievedOn: today,
    verificationStatus: 'unverified',
    verificationNotes: '',
    workflowStatus: 'draft',
    revisionNote: '',
  };
}

function DecisionImpactDeskPanel() {
  const queryClient = useQueryClient();
  const listParams = useMemo(() => ({ includeUnpublished: true, limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useGetDecisionImpacts(listParams, { query: { queryKey: getGetDecisionImpactsQueryKey(listParams) } });
  const createMutation = useCreateDecisionImpact();
  const updateMutation = useUpdateDecisionImpact();
  const [form, setForm] = useState<DecisionImpactDraft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [historyRecordId, setHistoryRecordId] = useState<number | null>(null);
  const records = data?.records ?? [];
  const setField = (field: keyof DecisionImpactDraft, value: string | number | null) => setForm((current) => current ? { ...current, [field]: value } : current);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setNotice(null);
    const onSuccess = () => {
      setForm(null);
      setNotice(form.id ? 'Decision-impact evidence updated.' : 'Decision-impact evidence saved as a draft.');
      void queryClient.invalidateQueries({ queryKey: getGetDecisionImpactsQueryKey(listParams) });
      void queryClient.invalidateQueries({ queryKey: getGetDecisionImpactsQueryKey({ limit: 100 }) });
      if (form.id) {
        void queryClient.invalidateQueries({ queryKey: getGetDecisionImpactRevisionsQueryKey(form.id) });
      }
    };
    const onError = () => setNotice('The evidence record could not be saved. Check the source, dates and required definition.');
    if (form.id) updateMutation.mutate({ recordId: form.id, data: form }, { onSuccess, onError });
    else createMutation.mutate({ data: form }, { onSuccess, onError });
  }
  return <section className="signal-container border-t-2 border-primary py-10 sm:py-14" data-testid="section-decision-impact-editor">
    <div className="flex flex-col justify-between gap-5 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">03 / Decision evidence</p><h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Publish what the evidence can carry.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Keep lived accounts, monitored leads and quantified findings separate. A quantified finding needs a definition, geography, date, source and verification context before it can appear as a measured signal.</p></div><button type="button" onClick={() => setForm(emptyDecisionImpact())} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground" data-testid="button-add-decision-impact"><Plus size={14} /> Add evidence</button></div>
    {notice && <p className="mt-5 border border-secondary bg-secondary/15 px-4 py-3 text-sm" role="status" data-testid="status-decision-impact-editor">{notice}</p>}
    {form ? <form onSubmit={save} className="mt-6 grid gap-4 border border-foreground/20 bg-card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4"><p className="font-display text-2xl">{form.id ? 'Edit evidence record' : 'New evidence record'}</p><button type="button" onClick={() => setForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close evidence form" data-testid="button-close-decision-impact-form"><X size={18} /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Evidence class"><select required value={form.evidenceType} onChange={(event) => setField('evidenceType', event.target.value)} className="editor-input" data-testid="select-decision-impact-evidence-type">{DECISION_IMPACT_EVIDENCE_TYPES.map((type) => <option key={type} value={type}>{evidenceTypeLabel(type)}</option>)}</select></Field>
        <Field label="Decision area"><select required value={form.decisionArea} onChange={(event) => setField('decisionArea', event.target.value)} className="editor-input" data-testid="select-decision-impact-area">{DECISION_IMPACT_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}</select></Field>
        <Field label="Workflow state"><select value={form.workflowStatus ?? 'draft'} onChange={(event) => setField('workflowStatus', event.target.value)} className="editor-input" data-testid="select-decision-impact-workflow">{DECISION_IMPACT_WORKFLOW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        <Field label="Verification state"><select value={form.verificationStatus ?? 'unverified'} onChange={(event) => setField('verificationStatus', event.target.value)} className="editor-input" data-testid="select-decision-impact-verification">{VERIFICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        <Field label="Geography"><input required minLength={2} value={form.geography} onChange={(event) => setField('geography', event.target.value)} className="editor-input" placeholder="India, Maharashtra, or a defined population" data-testid="input-decision-impact-geography" /></Field>
        <Field label="Observed on"><input required type="date" value={form.observedOn} onChange={(event) => setField('observedOn', event.target.value)} className="editor-input" data-testid="input-decision-impact-observed-on" /></Field>
        <Field label="Source"><input required value={form.source} onChange={(event) => setField('source', event.target.value)} className="editor-input" placeholder="Institution, publication, participant or dataset" data-testid="input-decision-impact-source" /></Field>
        <Field label="Source URL"><input required type="url" value={form.sourceUrl} onChange={(event) => setField('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-decision-impact-source-url" /></Field>
        <Field label="Source published on"><input type="date" value={form.sourcePublishedOn ?? ''} onChange={(event) => setField('sourcePublishedOn', event.target.value || null)} className="editor-input" data-testid="input-decision-impact-source-published-on" /></Field>
        <Field label="Source retrieved on"><input required type="date" value={form.sourceRetrievedOn} onChange={(event) => setField('sourceRetrievedOn', event.target.value)} className="editor-input" data-testid="input-decision-impact-source-retrieved-on" /></Field>
      </div>
      <Field label="Title"><input required minLength={12} value={form.title} onChange={(event) => setField('title', event.target.value)} className="editor-input text-lg" data-testid="input-decision-impact-title" /></Field>
      <Field label="Summary"><textarea required minLength={20} value={form.summary} onChange={(event) => setField('summary', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="textarea-decision-impact-summary" /></Field>
      <Field label="Definition / what was measured or observed"><textarea required minLength={20} value={form.definition} onChange={(event) => setField('definition', event.target.value)} className="editor-input min-h-24 resize-y" placeholder="Name the population, measure, period and comparison this record can support." data-testid="textarea-decision-impact-definition" /></Field>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Finding value (quantified only)"><input type="number" step="any" value={form.findingValue ?? ''} onChange={(event) => setField('findingValue', event.target.value === '' ? null : Number(event.target.value))} className="editor-input" placeholder="Leave blank for accounts or leads" data-testid="input-decision-impact-value" /></Field><Field label="Unit"><input value={form.findingUnit ?? ''} onChange={(event) => setField('findingUnit', event.target.value || null)} className="editor-input" placeholder="%, people, applications" data-testid="input-decision-impact-unit" /></Field><Field label="Denominator / comparison"><input value={form.denominator ?? ''} onChange={(event) => setField('denominator', event.target.value || null)} className="editor-input" placeholder="Who or what the value covers" data-testid="input-decision-impact-denominator" /></Field></div>
      <Field label="Verification context"><textarea value={form.verificationNotes ?? ''} onChange={(event) => setField('verificationNotes', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="What was checked, against which source, and what remains uncertain?" data-testid="textarea-decision-impact-verification-notes" /></Field>
      <Field label="Revision note"><input value={form.revisionNote ?? ''} onChange={(event) => setField('revisionNote', event.target.value)} className="editor-input" placeholder="What changed?" data-testid="input-decision-impact-revision-note" /></Field>
      <div className="flex flex-wrap gap-2"><button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-decision-impact">{createMutation.isPending || updateMutation.isPending ? 'Saving…' : form.id ? 'Save changes' : 'Save draft'}</button><button type="button" onClick={() => setForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-decision-impact">Cancel</button></div>
    </form> : <div className="mt-6">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading evidence records…</p> : isError ? <div className="flex flex-wrap items-center justify-between gap-4 border border-accent/50 p-5"><p className="text-sm text-muted-foreground">The evidence records could not be loaded.</p><button type="button" onClick={() => void refetch()} className="signal-kicker text-accent">Try again</button></div> : records.length === 0 ? <div className="border border-dashed border-foreground/25 p-6"><p className="signal-kicker text-accent">No decision evidence yet</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Add a lived account, monitored lead or quantified finding with its source and verification frame.</p></div> : <div className="divide-y divide-foreground/15">
        {records.map((record) => <DecisionImpactDeskRecordRow
          key={record.id}
          record={record}
          historyOpen={historyRecordId === record.id}
          onToggleHistory={() => setHistoryRecordId((current) => current === record.id ? null : record.id)}
          onEdit={() => setForm({
            ...record,
            revisionNote: '',
            observedOn: record.observedOn,
            sourcePublishedOn: record.sourcePublishedOn,
            sourceRetrievedOn: record.sourceRetrievedOn,
            workflowStatus: record.workflowStatus === 'published' ? 'draft' : record.workflowStatus,
          })}
        />)}
      </div>}
    </div>}
  </section>;
}

function EditorialDesk() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useGetEditorialIssue();
  const createIssueMutation = useCreateIssue();
  const publishMutation = usePublishIssue();
  const createStoryMutation = useCreateStory();
  const updateStoryMutation = useUpdateStory();
  const [workingIssue, setWorkingIssue] = useState<Issue | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [issueForm, setIssueForm] = useState<IssueInput>({ issueDate: new Date().toISOString().slice(0, 10), issueNumber: 1, title: '', intro: '' });
  const [storyForm, setStoryForm] = useState<StoryDraft | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (data && !hydrated.current) {
      hydrated.current = true;
      setWorkingIssue(data.issue);
      setStories(data.stories);
      setIssueForm({ issueDate: data.issue.issueDate, issueNumber: data.issue.issueNumber, title: data.issue.title, intro: data.issue.intro });
    }
  }, [data]);
  useEffect(() => { document.title = 'Editorial desk — The Signal 24'; }, []);

  if (isLoading) return <div className="signal-page"><Header editor /><LoadingBlock label="Loading the editorial desk…" /></div>;
  if (isError) return <div className="signal-page"><Header editor /><div className="py-20"><ErrorState message="The editorial workspace could not be loaded." onRetry={() => void refetch()} /></div></div>;

  const updateIssue = (field: keyof IssueInput, value: string) => setIssueForm((current) => ({ ...current, [field]: field === 'issueNumber' ? Number(value) : value }));
  const setStory = (field: keyof StoryInput, value: string) => setStoryForm((current) => current ? { ...current, [field]: ['read', 'sortOrder', 'number'].includes(field) ? (value === '' ? null : Number(value)) : value } : current);
  const setHi = (field: 'title' | 'dek' | 'body', value: string) => setStoryForm((current) => {
    if (!current) return current;
    const next = { title: current.hi?.title ?? '', dek: current.hi?.dek ?? '', body: current.hi?.body ?? '', [field]: value };
    return { ...current, hi: next.title || next.dek || next.body ? next : null };
  });

  function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    createIssueMutation.mutate({ data: issueForm }, {
      onSuccess: (issue) => { setWorkingIssue(issue); setStories([]); setStoryForm(null); setNotice({ type: 'success', text: `Issue ${issue.issueNumber} created as a draft.` }); },
      onError: () => setNotice({ type: 'error', text: 'The issue could not be created. Check the fields and try again.' }),
    });
  }

  function saveStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storyForm) return;
    setNotice(null);
    const onSuccess = (saved: Story) => {
      setStories((current) => storyForm.id ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setStoryForm(null);
      setNotice({ type: 'success', text: storyForm.id ? 'Record updated and revision saved.' : 'Record added as a draft.' });
      void queryClient.invalidateQueries({ queryKey: getGetEditorialIssueQueryKey() });
    };
    if (storyForm.id) {
      updateStoryMutation.mutate({ storyId: storyForm.id, data: storyForm }, { onSuccess, onError: () => setNotice({ type: 'error', text: 'The record could not be updated. Published records must be moved back to draft before editing.' }) });
    } else {
      createStoryMutation.mutate({ data: storyForm }, { onSuccess, onError: () => setNotice({ type: 'error', text: 'The record could not be added.' }) });
    }
  }

  function publish() {
    if (!workingIssue) return;
    publishMutation.mutate({ issueId: workingIssue.id }, {
      onSuccess: (issue) => { setWorkingIssue(issue); setNotice({ type: 'success', text: `Issue ${issue.issueNumber} is now published.` }); void queryClient.invalidateQueries({ queryKey: getGetEditorialIssueQueryKey() }); },
      onError: () => setNotice({ type: 'error', text: 'Publishing is blocked until every record is in review or already published with a review timestamp.' }),
    });
  }

  return <main className="signal-page"><Header editor /><section className="signal-container pt-12 sm:pt-20"><div className="flex flex-col justify-between gap-7 border-b border-foreground/20 pb-8 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">Private workspace / editorial desk</p><h1 className="mt-3 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Make the<br /><em className="font-normal text-accent">record.</em></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">Create an issue, add source-aware records, and move each record through draft, review, scheduled, published or archived states. Publication is blocked until review is recorded.</p></div><div className="flex items-center gap-2 signal-kicker text-muted-foreground"><Pencil size={14} className="text-accent" /> {workingIssue?.status ?? 'draft'} / {workingIssue ? `Issue ${workingIssue.issueNumber}` : 'No issue'}</div></div>{notice && <div className={`mt-6 flex items-center gap-3 border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-secondary bg-secondary/15' : 'border-destructive bg-destructive/10 text-destructive'}`} role="status" data-testid="status-editor-notice"><Check size={16} /> {notice.text}</div>}</section>
    <section className="signal-container grid gap-8 py-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-12"><div className="space-y-7"><div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="signal-kicker text-accent">01 / Issue</p><h2 className="mt-2 font-display text-3xl">Edition details</h2></div>{workingIssue && <span className="signal-kicker text-muted-foreground">{workingIssue.status}</span>}</div><form onSubmit={createIssue} className="mt-6 grid gap-4"><Field label="Issue date"><input required type="date" value={issueForm.issueDate} onChange={(event) => updateIssue('issueDate', event.target.value)} className="editor-input" data-testid="input-issue-date" /></Field><Field label="Issue number"><input required type="number" min="1" value={issueForm.issueNumber} onChange={(event) => updateIssue('issueNumber', event.target.value)} className="editor-input" data-testid="input-issue-number" /></Field><Field label="Edition title"><input required value={issueForm.title} onChange={(event) => updateIssue('title', event.target.value)} className="editor-input" placeholder="A clear title for this edition" data-testid="input-issue-title" /></Field><Field label="Introduction"><textarea required value={issueForm.intro} onChange={(event) => updateIssue('intro', event.target.value)} className="editor-input min-h-28 resize-y" placeholder="What should a reader understand before they begin?" data-testid="input-issue-intro" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createIssueMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-create-issue">{createIssueMutation.isPending ? 'Creating…' : 'Create new issue'} <Plus size={14} /></button>{workingIssue && <button type="button" onClick={publish} disabled={publishMutation.isPending || workingIssue.status === 'published'} className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-3 signal-kicker text-accent disabled:opacity-40" data-testid="button-publish-issue">{publishMutation.isPending ? 'Publishing…' : workingIssue.status === 'published' ? 'Published' : 'Publish issue'} <Send size={14} /></button>}</div></form></div><div className="border-l-2 border-accent px-5 py-2"><p className="signal-kicker text-accent">Desk note</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A source label is not decoration. It tells readers what kind of record they are reading, and what claims it can responsibly carry.</p></div></div>
      <div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 border-b border-foreground/15 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">02 / Records</p><h2 className="mt-2 font-display text-3xl">Build the issue</h2></div><button type="button" disabled={!workingIssue} onClick={() => workingIssue && setStoryForm(emptyStory(workingIssue.id))} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-record"><Plus size={14} /> Add record</button></div>{!workingIssue ? <div className="py-16"><EmptyState title="Create an issue first." text="The record form will appear here once an issue exists." /></div> : storyForm ? <form onSubmit={saveStory} className="mt-6 grid gap-4"><div className="flex items-center justify-between"><p className="font-display text-2xl">{storyForm.id ? 'Edit record' : 'New record'}</p><button type="button" onClick={() => setStoryForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close record form" data-testid="button-close-record-form"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Workflow state"><select value={storyForm.workflowStatus ?? 'draft'} onChange={(event) => setStory('workflowStatus', event.target.value)} className="editor-input" data-testid="select-story-workflow">{WORKFLOW_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Verification state"><select value={storyForm.verificationStatus ?? 'unverified'} onChange={(event) => setStory('verificationStatus', event.target.value)} className="editor-input" data-testid="select-story-verification">{VERIFICATION_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Topic"><select value={storyForm.topic} onChange={(event) => setStory('topic', event.target.value)} className="editor-input" data-testid="select-story-topic">{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Record type"><select value={storyForm.kind} onChange={(event) => setStory('kind', event.target.value)} className="editor-input" data-testid="select-story-kind">{KINDS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="State / territory"><input value={storyForm.state ?? ''} onChange={(event) => setStory('state', event.target.value)} className="editor-input" placeholder="Leave blank if national" data-testid="input-story-state" /></Field><Field label="Published on"><input type="date" value={storyForm.publishedOn ?? ''} onChange={(event) => setStory('publishedOn', event.target.value)} className="editor-input" data-testid="input-story-date" /></Field><Field label="Source"><input required value={storyForm.source} onChange={(event) => setStory('source', event.target.value)} className="editor-input" placeholder="Court, publication, institution or archive" data-testid="input-story-source" /></Field><Field label="Source URL"><input type="url" value={storyForm.sourceUrl ?? ''} onChange={(event) => setStory('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-story-source-url" /></Field><Field label="Source published on"><input type="date" value={storyForm.sourcePublishedOn ?? ''} onChange={(event) => setStory('sourcePublishedOn', event.target.value)} className="editor-input" data-testid="input-source-published-on" /></Field><Field label="Source retrieved on"><input type="date" value={storyForm.sourceRetrievedOn ?? ''} onChange={(event) => setStory('sourceRetrievedOn', event.target.value)} className="editor-input" data-testid="input-source-retrieved-on" /></Field><Field label="Scheduled for"><input type="datetime-local" value={localDateTimeValue(storyForm.scheduledFor)} onChange={(event) => setStory('scheduledFor', event.target.value ? new Date(event.target.value).toISOString() : '')} className="editor-input" data-testid="input-story-scheduled-for" /></Field><Field label="Eyebrow"><input value={storyForm.eyebrow} onChange={(event) => setStory('eyebrow', event.target.value)} className="editor-input" placeholder="What kind of moment is this?" data-testid="input-story-eyebrow" /></Field><Field label="Visual tone"><input value={storyForm.tone} onChange={(event) => setStory('tone', event.target.value)} className="editor-input" placeholder="Latest, history, data…" data-testid="input-story-tone" /></Field><Field label="Reading time"><input value={storyForm.time} onChange={(event) => setStory('time', event.target.value)} className="editor-input" placeholder="8 min" data-testid="input-story-time" /></Field><Field label="Minutes"><input type="number" min="1" value={storyForm.read} onChange={(event) => setStory('read', event.target.value)} className="editor-input" data-testid="input-story-read" /></Field><Field label="Story number"><input type="number" value={storyForm.number ?? ''} onChange={(event) => setStory('number', event.target.value)} className="editor-input" data-testid="input-story-number" /></Field><Field label="Sort order"><input type="number" min="1" value={storyForm.sortOrder} onChange={(event) => setStory('sortOrder', event.target.value)} className="editor-input" data-testid="input-story-sort-order" /></Field></div><Field label="Verification notes"><textarea value={storyForm.verificationNotes ?? ''} onChange={(event) => setStory('verificationNotes', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="What was checked, against which source, and when?" data-testid="input-verification-notes" /></Field><Field label="AI-assisted drafting disclosure"><textarea value={storyForm.aiDisclosure ?? ''} onChange={(event) => setStory('aiDisclosure', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="Leave blank when no AI assistance was used." data-testid="input-ai-disclosure" /></Field><Field label="Correction note"><textarea value={storyForm.correctionNote ?? ''} onChange={(event) => setStory('correctionNote', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="Visible note for a correction or clarification." data-testid="input-correction-note" /></Field><Field label="Revision note"><input value={storyForm.revisionNote ?? ''} onChange={(event) => setStory('revisionNote', event.target.value)} className="editor-input" placeholder="What changed in this revision?" data-testid="input-revision-note" /></Field><Field label="Title"><input required value={storyForm.title} onChange={(event) => setStory('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-title" /></Field><Field label="Dek"><textarea required value={storyForm.dek} onChange={(event) => setStory('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-dek" /></Field><Field label="Body"><textarea required value={storyForm.body} onChange={(event) => setStory('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="Separate paragraphs with a blank line." data-testid="input-story-body" /></Field><Field label="Byline (required for Opinion)"><input value={storyForm.byline ?? ''} onChange={(event) => setStory('byline', event.target.value)} className="editor-input" placeholder="Named author, or The Signal 24 editorial board" data-testid="input-story-byline" /></Field><fieldset className="grid gap-4 border border-foreground/15 p-4" lang="hi"><legend className="signal-kicker px-1 text-accent">हिंदी संस्करण / Hindi edition</legend><p className="text-xs leading-relaxed text-muted-foreground" lang="en">Leave blank until a reviewed Hindi translation exists. Hindi pages show the English text, marked as untranslated, when these are empty.</p><Field label="शीर्षक / Hindi title"><input value={storyForm.hi?.title ?? ''} onChange={(event) => setHi('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-hi-title" /></Field><Field label="सारांश / Hindi dek"><textarea value={storyForm.hi?.dek ?? ''} onChange={(event) => setHi('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-hi-dek" /></Field><Field label="मुख्य पाठ / Hindi body"><textarea value={storyForm.hi?.body ?? ''} onChange={(event) => setHi('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="अनुच्छेदों के बीच एक खाली पंक्ति छोड़ें।" data-testid="input-story-hi-body" /></Field></fieldset><div className="flex flex-wrap gap-2"><button type="submit" disabled={createStoryMutation.isPending || updateStoryMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-record">{createStoryMutation.isPending || updateStoryMutation.isPending ? 'Saving…' : storyForm.id ? 'Save changes' : 'Add to issue'}</button><button type="button" onClick={() => setStoryForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-record">Cancel</button></div><RevisionHistory storyId={storyForm.id} /></form> : <div className="mt-6">{stories.length === 0 ? <EmptyState title="No records in this issue." text="Add the first source-aware record to begin shaping the edition." /> : <div className="divide-y divide-foreground/15">{stories.map((story) => <div key={story.id} className="flex items-start justify-between gap-4 py-4" data-testid={`row-editor-story-${story.id}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><span className="rounded-full border border-foreground/20 px-2 py-1 signal-kicker text-[9px]">{story.workflowStatus}</span><span className="signal-kicker text-muted-foreground">{story.verificationStatus}</span></div><h3 className="mt-1 truncate font-display text-2xl">{story.title}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{story.source} · {formatDate(story.publishedOn)}{story.reviewedAt ? ` · reviewed ${formatDate(story.reviewedAt)}` : ' · review pending'}</p></div><button type="button" onClick={() => setStoryForm({ ...story, workflowStatus: story.workflowStatus === 'published' ? 'draft' : story.workflowStatus, revisionNote: '' })} className="inline-flex shrink-0 items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-story-${story.id}`}><Pencil size={13} /> Edit</button></div>)}</div>}</div>}</div></section><footer className="signal-container flex justify-between border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Leave the desk</Link><span className="signal-kicker text-muted-foreground">Source first / always</span></footer></main>;
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
  const t = useT();
  const params = useParams<{ slug?: string }>();
  const path = '/authors/signal-24';
  const validAuthor = params.slug === 'signal-24';
  const title = t('Editorial desk — The Signal 24', 'संपादकीय डेस्क — द सिग्नल 24');
  const description = t('The desk that sources, checks and publishes every Signal 24 record, and answers for the mistakes.', 'वह डेस्क जो द सिग्नल 24 के हर रिकॉर्ड का स्रोत खोजती है, जाँचती है, प्रकाशित करती है, और ग़लतियों की ज़िम्मेदारी लेती है।');
  useSeo({
    title,
    description,
    canonicalPath: validAuthor ? path : undefined,
    robots: validAuthor ? 'index, follow' : 'noindex, follow',
    // The desk is a department of the publisher, not a person, so ProfilePage → Organization.
    structuredData: validAuthor ? siteGraph(
      webPageNode(EDITORIAL_DESK_PATH, { name: title, description, mainEntity: editorialDeskRef }, 'ProfilePage'),
      { ...editorialDeskNode, description: 'The editorial desk responsible for sourcing, reviewing and presenting the Signal 24 archive.', publishingPrinciples: '/editorial-standards' },
      breadcrumbNode(EDITORIAL_DESK_PATH, [[t('Editorial desk', 'संपादकीय डेस्क'), EDITORIAL_DESK_PATH]]),
    ) : undefined,
  });
  if (!validAuthor) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message={t('That author page does not exist.', 'यह लेखक पेज मौजूद नहीं है।')} /></div></div>;
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><p className="signal-kicker text-accent">{t('The Signal 24 / editorial desk', 'द सिग्नल 24 / संपादकीय डेस्क')}</p><h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{t(<>The desk<br /><em className="font-normal text-accent">that signs off.</em></>, <>वह डेस्क,<br /><em className="font-normal text-accent">जो ज़िम्मेदारी लेती है।</em></>)}</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p></section><section className="signal-container mt-16 border-y border-foreground/20 py-10 sm:mt-24 sm:py-14"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="signal-kicker text-accent">{t('A byline is a responsibility', 'नाम का मतलब ज़िम्मेदारी')}</p><h2 className="mt-3 font-display text-4xl leading-tight">{t('Who answers for each record.', 'हर रिकॉर्ड के लिए कौन जवाबदेह है।')}</h2></div><p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{t('Records published under the desk’s name are checked by the desk, and the desk answers for them. Signed opinion pieces carry their author’s name. When we are wrong, the correction appears on the record with the date it was made.', 'डेस्क के नाम से छपे रिकॉर्ड डेस्क जाँचती है, और उनकी जवाबदेही उसी की है। हस्ताक्षरित राय पर उसके लेखक का नाम होता है। जब हम ग़लत होते हैं, तो सुधार उसी रिकॉर्ड पर तारीख़ के साथ दर्ज होता है।')}</p></div></section></main>;
}


const COMMUNITY_TOPICS = ['general', 'caste', 'policy', 'representation', 'migration', 'violence', 'work', 'education', 'culture'] as CommunityTopic[];
const COMMUNITY_KINDS = ['thought', 'article', 'piece'] as CommunityPostKind[];
const COMMUNITY_STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

function communityDate(value: string) {
  return formatDate(value);
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  const queryClient = useQueryClient();
  const likeMutation = useToggleCommunityPostLike();
  const [likeError, setLikeError] = useState(false);
  function toggleLike() {
    setLikeError(false);
    likeMutation.mutate({ postId: post.id }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetCommunityPostsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetCommunityPostQueryKey(post.id) });
      },
      onError: () => setLikeError(true),
    });
  }
  return <article className="community-card border border-foreground/15 bg-card p-5 sm:p-7" data-testid={`card-community-post-${post.id}`}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="signal-kicker text-accent">{post.kind}</span>
        <span className="text-muted-foreground">/</span>
        <span className="signal-kicker text-muted-foreground">{post.topic}</span>
        {post.state && <><span className="text-muted-foreground">/</span><span className="signal-kicker text-muted-foreground">{post.state}</span></>}
      </div>
      <time className="signal-kicker text-[9px] text-muted-foreground" dateTime={post.createdAt}>{communityDate(post.createdAt)}</time>
    </div>
    <Link href={`/community/${post.id}`} className="group mt-5 block" data-testid={`link-community-post-${post.id}`}>
      <h2 className="font-display text-3xl leading-[.98] tracking-[-.03em] group-hover:text-accent sm:text-4xl">{post.title}</h2>
    </Link>
    <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground" data-testid={`text-community-post-body-${post.id}`}>{post.body}</p>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/15 pt-4">
      <p className="signal-kicker text-muted-foreground">Shared by <span className="text-foreground">{post.authorName}</span></p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={toggleLike} disabled={likeMutation.isPending} className={`inline-flex items-center gap-2 signal-kicker transition-colors hover:text-accent disabled:opacity-50 ${post.likedByViewer ? 'text-accent' : 'text-muted-foreground'}`} aria-label={post.likedByViewer ? `Unlike ${post.title}` : `Like ${post.title}`} data-testid={`button-like-community-post-${post.id}`}>
          <Heart size={15} fill={post.likedByViewer ? 'currentColor' : 'none'} /> {post.likeCount}
        </button>
        <Link href={`/community/${post.id}`} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`link-replies-community-post-${post.id}`}>
          <MessageCircle size={15} /> {post.replyCount}
        </Link>
      </div>
    </div>
    {likeError && <p className="mt-3 text-xs text-destructive" role="alert">That reaction could not be saved. Try again.</p>}
  </article>;
}

function CommunityComposer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateCommunityPost();
  const initial: CommunityPostInput = { authorName: '', kind: 'thought', topic: 'general', state: null, title: '', body: '', linkUrl: null };
  const [form, setForm] = useState<CommunityPostInput>(initial);
  const [error, setError] = useState(false);
  function update(field: keyof CommunityPostInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    const payload: CommunityPostInput = { ...form, state: form.state?.trim() || null, linkUrl: form.linkUrl?.trim() || null };
    createMutation.mutate({ data: payload }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetCommunityPostsQueryKey() });
        onClose();
      },
      onError: () => setError(true),
    });
  }
  return <section className="community-composer border-2 border-primary bg-card p-5 sm:p-8" aria-labelledby="community-composer-title">
    <div className="flex items-start justify-between gap-5">
      <div><p className="signal-kicker text-accent">Share with the noticeboard</p><h2 id="community-composer-title" className="mt-2 font-display text-3xl leading-none sm:text-4xl">Put something in the room.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Use your name. Add context. Links are welcome. This is a public participant contribution, not an automatic The Signal 24 report.</p></div>
      <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center border border-foreground/20 text-muted-foreground hover:border-accent hover:text-accent" aria-label="Close share form" data-testid="button-close-community-composer"><X size={17} /></button>
    </div>
    <form onSubmit={submit} className="mt-7 grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name"><input required minLength={2} maxLength={80} value={form.authorName} onChange={(event) => update('authorName', event.target.value)} className="editor-input" placeholder="Name shown with your contribution" data-testid="input-community-author" /></Field>
        <Field label="Contribution type"><select value={form.kind} onChange={(event) => update('kind', event.target.value)} className="editor-input" data-testid="select-community-kind">{COMMUNITY_KINDS.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select></Field>
        <Field label="Topic"><select value={form.topic} onChange={(event) => update('topic', event.target.value)} className="editor-input" data-testid="select-community-topic">{COMMUNITY_TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></Field>
        <Field label="State / territory"><select value={form.state ?? ''} onChange={(event) => update('state', event.target.value)} className="editor-input" data-testid="select-community-state"><option value="">National / not specified</option>{COMMUNITY_STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></Field>
      </div>
      <Field label="Title"><input required minLength={4} maxLength={180} value={form.title} onChange={(event) => update('title', event.target.value)} className="editor-input text-lg" placeholder="What should people understand first?" data-testid="input-community-title" /></Field>
      <Field label="Your contribution"><textarea required minLength={10} maxLength={10000} value={form.body} onChange={(event) => update('body', event.target.value)} className="editor-input min-h-40 resize-y leading-relaxed" placeholder="Share the experience, argument, source or creative work." data-testid="textarea-community-body" /></Field>
      <Field label="Link, if relevant"><input type="url" value={form.linkUrl ?? ''} onChange={(event) => update('linkUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-community-link" /></Field>
      {error && <p className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">Your contribution could not be shared. Check the fields and try again.</p>}
      <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={createMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-50" data-testid="button-submit-community-post">{createMutation.isPending ? 'Sharing…' : 'Share publicly'} <Send size={14} /></button><p className="signal-kicker text-[9px] text-muted-foreground">Public participant contribution / not verified reporting</p></div>
    </form>
  </section>;
}

function CommunityPage() {
  useSeo({
    title: 'Community noticeboard — The Signal 24',
    description: 'Public participant contributions about reservation, representation and related policy. Contributions are not The Signal 24 reporting.',
    canonicalPath: '/community',
    translated: false,
    robots: 'noindex, follow',
  });
  const [topic, setTopic] = useState('');
  const [state, setState] = useState('');
  const [sort, setSort] = useState<GetCommunityPostsSort>('recent');
  const [composerOpen, setComposerOpen] = useState(false);
  const params = useMemo<GetCommunityPostsParams>(() => ({ topic: topic ? topic as CommunityTopic : undefined, state: state || undefined, sort, limit: 50 }), [topic, state, sort]);
  const { data, isLoading, isError, refetch, isFetching } = useGetCommunityPosts(params, { query: { queryKey: getGetCommunityPostsQueryKey(params) } });
  const posts = data?.posts ?? [];
  useSeo({ title: 'Community noticeboard — The Signal 24', description: 'A public discussion space for lived thoughts, articles, links and creative pieces from across India.', canonicalPath: '/community', translated: false });
  return <main className="signal-page"><Header /><section className="signal-container pt-12 sm:pt-20">
    <div className="grid gap-8 border-b-2 border-primary pb-10 lg:grid-cols-[1fr_.58fr] lg:items-end">
      <div><p className="signal-kicker text-accent">The Signal 24 / community</p><h1 className="mt-4 max-w-4xl font-display text-6xl leading-[.88] tracking-[-.065em] sm:text-8xl">The national<br /><em className="font-normal text-accent">noticeboard.</em></h1><p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">A separate public room for lived thoughts, articles, links and creative pieces. Read across disagreement, geography and experience.</p></div>
      <div className="border-l-2 border-accent pl-5"><p className="signal-kicker text-accent">Important distinction</p><p className="mt-3 text-sm leading-relaxed">These are public participant contributions. They are not automatically The Signal 24 reporting, and they do not carry the archive’s source verification.</p><button type="button" onClick={() => setComposerOpen((open) => !open)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 signal-kicker text-accent-foreground" data-testid="button-open-community-composer">{composerOpen ? 'Close share form' : 'Share a thought'} <Plus size={14} /></button></div>
    </div>
    {composerOpen && <div className="mt-8"><CommunityComposer onClose={() => setComposerOpen(false)} /></div>}
  </section>
  <section className="signal-container py-10 sm:py-14">
    <div className="flex flex-col justify-between gap-5 border-y border-foreground/20 py-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">Browse the room</p><h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Many voices. More context.</h2></div><button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex items-center gap-2 signal-kicker text-accent disabled:opacity-50" data-testid="button-refresh-community"><RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> {isFetching ? 'Refreshing' : 'Refresh posts'}</button></div>
    <div className="mt-6 grid gap-3 border border-foreground/15 bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:p-4"><label className="border-b border-foreground/15 px-2 py-2 sm:border-b-0 sm:border-r"><span className="signal-kicker block text-[9px] text-muted-foreground">Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="select-community-filter-topic"><option value="">All topics</option>{COMMUNITY_TOPICS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="border-b border-foreground/15 px-2 py-2 sm:border-b-0 sm:border-r"><span className="signal-kicker block text-[9px] text-muted-foreground">State</span><select value={state} onChange={(event) => setState(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="select-community-filter-state"><option value="">All states</option>{(data?.states?.length ? data.states : COMMUNITY_STATES).map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="px-2 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as GetCommunityPostsSort)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="select-community-sort"><option value="recent">Most recent</option><option value="popular">Most liked</option></select></label></div>
    {isLoading ? <div className="mt-8 grid gap-5 md:grid-cols-2" role="status" aria-label="Loading community posts"><div className="h-64 animate-pulse bg-muted" /><div className="h-64 animate-pulse bg-muted" /><div className="h-64 animate-pulse bg-muted" /></div> : isError ? <div className="mt-8"><ErrorState message="The community noticeboard could not be loaded." onRetry={() => void refetch()} /></div> : posts.length === 0 ? <div className="mt-8"><EmptyState title="The noticeboard is quiet here." text="Try another topic or state, or be the first person to share a contribution." /></div> : <div className="mt-8 grid gap-5 md:grid-cols-2">{posts.map((post) => <CommunityPostCard key={post.id} post={post} />)}</div>}
  </section>
  </main>;
}

function CommunityDetailPage() {
  const params = useParams<{ id?: string }>();
  const postId = Number(params.id);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useGetCommunityPost(postId, { query: { enabled: Number.isFinite(postId), queryKey: getGetCommunityPostQueryKey(postId) } });
  const likeMutation = useToggleCommunityPostLike();
  const replyMutation = useCreateCommunityReply();
  const [authorName, setAuthorName] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState(false);
  useSeo({ title: data?.post ? `${data.post.title} — Community — The Signal 24` : 'Community post — The Signal 24', description: data?.post?.body.slice(0, 155) ?? 'A public participant contribution in the Signal 24 community.', robots: 'noindex, follow' });
  function like() {
    if (!data?.post) return;
    likeMutation.mutate({ postId }, { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getGetCommunityPostsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetCommunityPostQueryKey(postId) }); } });
  }
  function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReplyError(false);
    replyMutation.mutate({ postId, data: { authorName, body: replyBody } }, {
      onSuccess: () => { setAuthorName(''); setReplyBody(''); void queryClient.invalidateQueries({ queryKey: getGetCommunityPostsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetCommunityPostQueryKey(postId) }); },
      onError: () => setReplyError(true),
    });
  }
  if (!Number.isFinite(postId)) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That community post address is not valid." /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Opening the community contribution…" /></div>;
  if (isError || !data?.post) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="This community contribution could not be opened." onRetry={() => void refetch()} /></div></div>;
  const post = data.post;
  return <main className="signal-page"><Header /><article className="signal-container py-12 sm:py-20">
    <Link href="/community" className="signal-kicker inline-flex items-center gap-2 text-muted-foreground hover:text-accent" data-testid="link-back-community"><ArrowLeft size={13} /> Back to community</Link>
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_.48fr]"><div><div className="flex flex-wrap items-center gap-2"><span className="signal-kicker text-accent">{post.kind}</span><span className="text-muted-foreground">/</span><span className="signal-kicker text-muted-foreground">{post.topic}</span>{post.state && <><span className="text-muted-foreground">/</span><span className="signal-kicker text-muted-foreground">{post.state}</span></>}</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.055em] sm:text-7xl" data-testid="heading-community-post">{post.title}</h1><p className="mt-6 signal-kicker text-muted-foreground">Shared by {post.authorName} · {communityDate(post.createdAt)}</p></div><aside className="border-l-2 border-accent pl-5"><p className="signal-kicker text-accent">Community record</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A public participant contribution. It is not automatically The Signal 24 reporting or a verified archive record.</p><button type="button" onClick={like} disabled={likeMutation.isPending} className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 signal-kicker hover:border-accent hover:text-accent disabled:opacity-50 ${post.likedByViewer ? 'border-accent text-accent' : 'border-foreground/25'}`} data-testid="button-like-community-detail"><Heart size={14} fill={post.likedByViewer ? 'currentColor' : 'none'} /> {post.likedByViewer ? 'Liked' : 'Like'} · {post.likeCount}</button></aside></div>
    <div className="story-body mt-12 max-w-3xl whitespace-pre-line text-[1.08rem] leading-[1.85] text-foreground/85" data-testid="text-community-detail-body">{post.body}</div>
    {post.linkUrl && <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-accent pb-1 signal-kicker text-accent hover:border-primary hover:text-primary" data-testid="link-community-external"><Link2 size={14} /> Open shared link <ExternalLink size={13} /></a>}
    <section className="mt-16 border-t-2 border-primary pt-8" aria-labelledby="community-replies-title"><div className="flex items-end justify-between gap-4"><div><p className="signal-kicker text-accent">Responses</p><h2 id="community-replies-title" className="mt-2 font-display text-4xl">The reply line.</h2></div><span className="signal-kicker text-muted-foreground">{data.replies.length} replies</span></div>
      {data.replies.length ? <div className="mt-7 divide-y divide-foreground/15 border-y border-foreground/15">{data.replies.map((item: CommunityReply) => <article key={item.id} className="py-5" data-testid={`card-community-reply-${item.id}`}><div className="flex flex-wrap justify-between gap-3"><p className="signal-kicker text-accent">{item.authorName}</p><time className="signal-kicker text-[9px] text-muted-foreground" dateTime={item.createdAt}>{communityDate(item.createdAt)}</time></div><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.body}</p></article>)}</div> : <p className="mt-7 border border-dashed border-foreground/25 px-5 py-8 text-sm text-muted-foreground">No replies yet. Disagreement is welcome when it brings context.</p>}
      <form onSubmit={reply} className="mt-8 grid gap-4 border border-foreground/15 bg-card p-5 sm:p-7"><p className="font-display text-2xl">Add your context.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Your name"><input required minLength={2} maxLength={80} value={authorName} onChange={(event) => setAuthorName(event.target.value)} className="editor-input" data-testid="input-community-reply-author" /></Field><Field label="Your reply"><textarea required minLength={2} maxLength={5000} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} className="editor-input min-h-24 resize-y" data-testid="textarea-community-reply" /></Field></div>{replyError && <p className="text-sm text-destructive" role="alert">Your reply could not be posted. Please try again.</p>}<button type="submit" disabled={replyMutation.isPending} className="w-fit rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-50" data-testid="button-submit-community-reply">{replyMutation.isPending ? 'Posting…' : 'Post reply'}</button></form>
    </section>
  </article></main>;
}

function SignInPage() {
  useSeo({ title: 'Editor sign in — The Signal 24', description: 'Sign in to access the private editorial desk of The Signal 24.', robots: 'noindex, nofollow' });
  return <main className="signal-page"><section className="signal-container flex min-h-[100dvh] flex-col items-center justify-center gap-8 py-12">
    <Link href="/" className="signal-link font-display text-2xl">THE SIGNAL <span className="text-accent">24</span></Link>
    <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={`${basePath}/editor`} />
  </section></main>;
}
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

function EditorEvidenceAccessRoute() {
  return <EditorAccessRoute />;
}

function AppRoutes() {
  return <><Switch>
    <Route path="/" component={Home} />
    <Route path="/sign-in/*?" component={SignInPage} />
    <Route path="/sign-up/*?" component={SignUpPage} />
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
    <Route path="/answers/:id" component={AnswerDetailPage} />
    <Route path="/stories/:id" component={StoryDetail} />
    <Route path="/editor/evidence" component={EditorEvidenceAccessRoute} />
    <Route path="/editor" component={EditorAccessRoute} />
    <Route path="/about" component={AboutPage} />
    <Route path="/editorial-standards" component={StandardsPage} />
    <Route path="/methodology" component={MethodologyPage} />
    <Route path="/:family/:slug" component={StoryDetail} />
    <Route component={NotFound} />
  </Switch><GlobalFooter /></>;
}

function ClerkProviderWithRouting() {
  const [, setLocation] = useLocation();

  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    signInFallbackRedirectUrl={`${basePath}/editor`}
    signUpFallbackRedirectUrl={`${basePath}/editor`}
    localization={{
      signIn: { start: { title: 'Editor sign in', subtitle: 'Sign in to access the private editorial desk.' } },
      signUp: { start: { title: 'Editor account', subtitle: 'Create an account, then use an authorized verified email.' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <QueryClientProvider client={queryClient}>
      <ClerkQueryClientCacheInvalidator />
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
    </QueryClientProvider>
  </ClerkProvider>;
}
function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRouting /></WouterRouter>;
}

export default App;

function storyPath(story: Story) {
  return story.canonicalPath || `/${recordFamilyForStory(story)}/${story.slug || `${slugify(story.title) || 'record'}-${story.id}`}`;
}

function slugify(value: string) {
  return (value ?? '').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function recordFamilyForStory(story: Story) {
  if (story.recordFamily) return story.recordFamily;
  if (story.topic === 'States') return 'states';
  if (story.topic === 'Data & Notes') return 'data';
  if (story.topic === 'Courts & Policy') return story.kind === 'Paper note' ? 'cases' : 'policies';
  if (story.kind === 'Archive') return 'documents';
  return 'articles';
}

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
  const title = t('Data room — The Signal 24', 'आंकड़ा कक्ष — द सिग्नल 24');
  const description = t('Source-linked data on reservation and representation in India, every number with its frame, and an honest account of the data the state has not released.', 'भारत में आरक्षण और प्रतिनिधित्व पर स्रोत-आधारित आंकड़े, हर संख्या अपने संदर्भ के साथ, और उन आंकड़ों का ईमानदार हिसाब जो सरकार ने जारी नहीं किए।');
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
  const title = t('Opinion — The Signal 24', 'राय — द सिग्नल 24');
  const description = t('Signed opinion from The Signal 24: where the record leads us to take a position on how India’s governments and institutions handle reservation and representation.', 'द सिग्नल 24 की हस्ताक्षरित राय: जहाँ रिकॉर्ड हमें इस पर पक्ष लेने को मजबूर करता है कि भारत की सरकारें और संस्थाएँ आरक्षण और प्रतिनिधित्व को कैसे संभालती हैं।');
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
        <motion.div className="opinion-lead" initial={reduce ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className="opinion-lead-art"><StoryArt story={lead} className="h-full" showCredit={false} /></div>
          <div className="opinion-lead-copy">
            <span className="opinion-label bg-accent text-accent-foreground">{t('This week’s editorial', 'इस हफ़्ते का संपादकीय')}</span>
            {leadQuote && <blockquote lang={lead.contentLang} className="opinion-lead-quote">“{leadQuote}”</blockquote>}
            <Link href={storyPath(lead)} className="group mt-6 block" data-testid={`link-opinion-lead-${lead.id}`}><h2 lang={lead.contentLang} className="font-display text-3xl leading-tight group-hover:text-accent sm:text-4xl">{lead.title}</h2></Link>
            <p lang={lead.contentLang} className="mt-3 max-w-xl text-sm leading-relaxed opacity-75">{lead.dek}</p>
            <p className="mt-5 signal-kicker opacity-70">{label(lead.byline) || t('Editorial board', 'संपादकीय बोर्ड')} · {formatDate(lead.publishedOn)} · {t(`${lead.read} min read`, `${lead.read} मिनट`)}</p>
          </div>
        </motion.div>
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


function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => addListener(({ user }) => {
    const userId = user?.id ?? null;
    if (previousUserId.current !== undefined && previousUserId.current !== userId) {
      client.clear();
    }
    previousUserId.current = userId;
  }), [addListener, client]);

  return null;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#d73524',
    colorForeground: '#19243a',
    colorMutedForeground: '#626773',
    colorDanger: '#c92f22',
    colorBackground: '#f8f5ed',
    colorInput: '#ffffff',
    colorInputForeground: '#19243a',
    colorNeutral: '#aeb2bd',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#f8f5ed] rounded-xl w-[440px] max-w-full overflow-hidden border border-[#aeb2bd]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#19243a]',
    headerSubtitle: 'text-[#626773]',
    socialButtonsBlockButtonText: 'text-[#19243a]',
    formFieldLabel: 'text-[#19243a]',
    footerActionLink: 'text-[#c92f22]',
    footerActionText: 'text-[#626773]',
    dividerText: 'text-[#626773]',
    identityPreviewEditButton: 'text-[#c92f22]',
    formFieldSuccessText: 'text-[#245e4d]',
    alertText: 'text-[#19243a]',
    logoBox: 'h-12',
    logoImage: 'h-10 w-auto',
    socialButtonsBlockButton: 'border border-[#aeb2bd] bg-white',
    formButtonPrimary: 'bg-[#19243a] text-[#f1eee4] hover:bg-[#303c54]',
    formFieldInput: 'border border-[#aeb2bd] bg-white text-[#19243a]',
    footerAction: 'text-[#626773]',
    dividerLine: 'bg-[#aeb2bd]',
    alert: 'border border-[#aeb2bd]',
    otpCodeFieldInput: 'border border-[#aeb2bd] bg-white text-[#19243a]',
    formFieldRow: 'text-[#19243a]',
    main: 'text-[#19243a]',
  },
};

function SignUpPage() {
  useSeo({ title: 'Editor account — The Signal 24', description: 'Create an account to request access to the private editorial desk of The Signal 24.', robots: 'noindex, nofollow' });
  return <main className="signal-page"><section className="signal-container flex min-h-[100dvh] flex-col items-center justify-center gap-8 py-12">
    <Link href="/" className="signal-link font-display text-2xl">THE SIGNAL <span className="text-accent">24</span></Link>
    <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={`${basePath}/editor`} />
  </section></main>;
}

function EditorAccessRoute() {
  const [location] = useLocation();
  const evidence = location === "/editor/evidence";
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const session = useGetEditorSession({
    query: {
      queryKey: getGetEditorSessionQueryKey(),
      enabled: isLoaded && isSignedIn === true,
      retry: false,
      staleTime: 30_000,
    },
  });
  useSeo({
    title: evidence ? 'Evidence graph — The Signal 24' : 'Editorial desk — The Signal 24',
    description: evidence
      ? 'Private editorial workspace for maintaining explicit article, event, and source relationships.'
      : 'Private editorial workspace for preparing source-aware records for The Signal 24.',
    robots: 'noindex, nofollow',
  });

  if (!isLoaded || (isSignedIn && session.isLoading)) {
    return <main className="signal-page"><Header editor /><section className="signal-container py-16 text-sm text-muted-foreground">Checking editor access…</section></main>;
  }

  if (!isSignedIn) {
    return <main className="signal-page"><Header editor /><section className="signal-container py-16">
      <p className="signal-kicker text-accent">Private workspace</p>
      <h1 className="mt-3 font-display text-5xl">Sign in to the editorial desk.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Use the verified editor account to manage publication records and review revision history.</p>
      <Link href="/sign-in" className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground">Sign in</Link>
    </section></main>;
  }

  if (session.isError || !session.data) {
    return <main className="signal-page"><Header editor /><section className="signal-container py-16">
      <p className="signal-kicker text-accent">Editor access denied</p>
      <h1 className="mt-3 font-display text-5xl">This account is not on the editor list.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Sign out and use an authorized account with a verified email address.</p>
      <button type="button" onClick={() => void signOut({ redirectUrl: basePath || '/' })} className="mt-7 rounded-full border border-foreground/25 px-5 py-3 signal-kicker">Sign out</button>
    </section></main>;
  }

  return evidence
    ? <main className="signal-page"><Header editor /><EditorEvidenceDesk /></main>
    : <EditorialDesk />;
}

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}
