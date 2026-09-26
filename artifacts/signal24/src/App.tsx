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
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
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
  getGetArchiveQueryKey,
  getGetDecisionImpactRevisionsQueryKey,
  getGetDecisionImpactRevisionsQueryOptions,
  getGetEditorialIssueQueryKey,
  getGetEditorSessionQueryKey,
  getGetCurrentIssueQueryKey,
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
import type { CommunityPost, CommunityReply, CommunityPostInput, CommunityPostKind, CommunityTopic, DecisionImpactArea, DecisionImpactEvidenceType, DecisionImpactInput, DecisionImpactRecord, DecisionImpactRevision, DecisionImpactWorkflowStatus, GetCommunityPostsParams, GetCommunityPostsSort, GetPoliciesParams, Issue, IssueInput, LiveUpdate, PolicyRecord, PolicySource, Story, StoryInput, StoryKind, StoryWorkflowStatus, Topic, VerificationStatus } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
function absoluteSiteUrl(path = '/') {
  const internalPath = path.startsWith('/') && !path.startsWith('//') ? path : `/${path}`;
  return new URL(`${basePath}${internalPath}` || '/', window.location.origin).href;
}

function absoluteStructuredData(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.startsWith('/') && !value.startsWith('//') ? absoluteSiteUrl(value) : value;
  }
  if (Array.isArray(value)) return value.map(absoluteStructuredData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, absoluteStructuredData(item)]));
  }
  return value;
}
const TOPICS = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'] as Topic[];
const KINDS = ['Article', 'Paper note', 'Archive', 'Explainer'] as StoryKind[];
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
  if (!value) return 'Date not supplied';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type SeoConfig = {
  title: string;
  description: string;
  canonicalPath?: string;
  robots?: string;
  type?: string;
  structuredData?: unknown;
};
function BrandMark() {
  return <span className="signal-mark shrink-0" aria-label="The Signal 24 mark"><span className="sr-only">The Signal 24</span></span>;
}

/*
// hint: Logic changed on both sides. Requires understanding intent of each change.
function Header({ editor = false }: { editor?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const close = () => setMobileOpen(false);
  return (
    <>
      <div className="bg-primary py-2.5 text-primary-foreground">
        <div className="signal-container flex items-center justify-between gap-4">
           <p className="signal-kicker flex items-center gap-2 text-[9px]"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Follow the evidence</p>
           <p className="hidden signal-kicker opacity-60 sm:block">SIGNAL HUB / public-interest newsroom</p>
        </div>
      </div>
      <header className="signal-container relative z-30 flex items-center justify-between border-b border-foreground/20 py-5" onKeyDown={(event) => {
        if (event.key === 'Escape' && mobileOpen) {
          close();
          mobileToggleRef.current?.focus();
        }
      }}>
        <Link href="/" onClick={close} className="signal-link flex items-center gap-3" data-testid="link-brand">
          <BrandMark />
          <span className="font-display text-[1.4rem] font-semibold leading-none tracking-[-.045em]">SIGNAL <span className="text-accent">HUB</span></span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {editor ? (
            <>
              <Link href="/" className="signal-kicker signal-link" data-testid="link-back-publication">Back to publication</Link>
              <Link href="/editor" className="signal-kicker signal-link" data-testid="link-editorial-desk">Editorial desk</Link>
              <Link href="/editor/evidence" className="signal-kicker text-accent" data-testid="link-editor-evidence">Evidence graph</Link>
            </>
          ) : (
            <>
              <Link href="/archive" className="signal-kicker signal-link" data-testid="link-investigations">Investigations</Link>
              <a href="/#briefing" className="signal-kicker signal-link" data-testid="link-signals">Signals</a>
              <Link href="/events" className="signal-kicker signal-link" data-testid="link-evidence-events">Evidence</Link>
              <Link href="/data" className="signal-kicker signal-link" data-testid="link-data">Data</Link>
              <Link href="/timeline" className="signal-kicker signal-link" data-testid="link-timeline">Timeline</Link>
              <Link href="/archive" className="signal-kicker signal-link" data-testid="link-archive">Archive</Link>
              <Link href="/topics" className="signal-kicker signal-link" data-testid="link-topics">Topics</Link>
              <Link href="/about" className="signal-kicker signal-link" data-testid="link-about">About</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!editor && <><Link href="/search" className="hidden items-center gap-2 border-b border-foreground/30 px-1 py-2 signal-kicker sm:inline-flex" data-testid="link-search"><Search size={13} /> Search</Link><a href="/#newsletter" className="hidden rounded-full bg-accent px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.12em] text-accent-foreground transition-transform hover:-translate-y-0.5 sm:inline-block" data-testid="link-subscribe">Subscribe</a></>}
          <button ref={mobileToggleRef} type="button" className="grid h-9 w-9 place-items-center md:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((value) => !value)} data-testid="button-mobile-navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav id="mobile-navigation" hidden={!mobileOpen} className="absolute left-0 right-0 top-full border-b border-foreground/20 bg-background p-5 shadow-md md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-5">
              {editor ? <>
                 <Link href="/" onClick={close} className="signal-kicker signal-link">Back to publication</Link>
                 <Link href="/editor" onClick={close} className="signal-kicker signal-link">Editorial desk</Link>
                 <Link href="/editor/evidence" onClick={close} className="signal-kicker signal-link">Evidence graph</Link>
              </> : <>
                 <Link href="/archive" onClick={close} className="signal-kicker signal-link">Investigations</Link>
                 <a href="/#briefing" onClick={close} className="signal-kicker signal-link">Signals</a>
                 <Link href="/events" onClick={close} className="signal-kicker signal-link">Evidence</Link>
                 <Link href="/data" onClick={close} className="signal-kicker signal-link">Data</Link>
                 <Link href="/timeline" onClick={close} className="signal-kicker signal-link">Timeline</Link>
                 <Link href="/archive" onClick={close} className="signal-kicker signal-link">Archive</Link>
                 <Link href="/topics" onClick={close} className="signal-kicker signal-link">Topics</Link>
                 <Link href="/about" onClick={close} className="signal-kicker signal-link">About</Link>
                 <div className="my-1 border-t border-foreground/15 pt-4" />
                 <Link href="/policies" onClick={close} className="signal-kicker signal-link">Policy ledger</Link>
                 <Link href="/community" onClick={close} className="signal-kicker signal-link" data-testid="link-community-mobile">Community</Link>
                 <Link href="/editorial-standards" onClick={close} className="signal-kicker signal-link">Standards</Link>
                 <Link href="/methodology" onClick={close} className="signal-kicker signal-link">Methodology</Link>
                 <Link href="/search" onClick={close} className="signal-kicker signal-link">Search</Link>
              </>}
            </div>
          </nav>
      </header>
    </>
  );
}
*/
function Header({ editor = false }: { editor?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const close = () => setMobileOpen(false);
  return (
    <>
      <div className="signal-topline bg-primary py-2.5 text-primary-foreground">
        <div className="signal-container flex items-center justify-between gap-4">
          <p className="signal-kicker flex items-center gap-2 text-[9px]"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> A public-interest desk on UGC rules and open-category competition</p>
          <p className="hidden signal-kicker text-primary-foreground/65 sm:block">The Signal 24 / source desk</p>
        </div>
      </div>
      <header className="signal-site-header" onKeyDown={(event) => {
        if (event.key === 'Escape' && (mobileOpen || searchOpen)) {
          close();
          setSearchOpen(false);
          mobileToggleRef.current?.focus();
        }
      }}>
        <div className="signal-container signal-site-header-inner flex items-center justify-between gap-5">
          <Link href="/" onClick={close} className="signal-link flex shrink-0 items-center gap-3" data-testid="link-brand">
            <BrandMark />
            <span className="font-display text-[1.4rem] font-semibold leading-none tracking-[-.045em]">The Signal <span className="text-accent">24</span></span>
          </Link>
          <nav className="signal-site-nav hidden items-center gap-5 lg:gap-6 lg:flex" aria-label="Main navigation">
            {editor ? (
              <>
                <Link href="/" className="signal-kicker signal-link" data-testid="link-back-publication">Back to publication</Link>
                <Link href="/editor" className="signal-kicker signal-link" data-testid="link-editorial-desk">Editorial desk</Link>
                <Link href="/editor/evidence" className="signal-kicker text-accent" data-testid="link-editor-evidence">Evidence graph</Link>
              </>
            ) : (
              <>
                <Link href="/" className="signal-kicker signal-link" data-testid="link-home">Home</Link>
                <a href={`${basePath}/#briefing`} className="signal-kicker signal-link" data-testid="link-latest">Latest</a>
                <Link href="/events" className="signal-kicker signal-link" data-testid="link-evidence-events">Evidence</Link>
                <Link href="/timeline" className="signal-kicker signal-link" data-testid="link-timeline">Timeline</Link>
                <Link href="/policies" className="signal-kicker signal-link" data-testid="link-policy-ledger">Policy ledger</Link>
                <Link href="/data" className="signal-kicker signal-link" data-testid="link-data">Data</Link>
                <Link href="/archive" className="signal-kicker signal-link" data-testid="link-archive">Archive</Link>
              <Link href="/topics" className="signal-kicker signal-link" data-testid="link-topics">Topics</Link>
                <Link href="/community" className="signal-kicker signal-link" data-testid="link-community">Community</Link>
                <Link href="/about" className="signal-kicker signal-link" data-testid="link-about">About</Link>
              </>
            )}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            {!editor && <button type="button" className="grid h-10 w-10 place-items-center border border-transparent hover:border-border" aria-label={searchOpen ? 'Close search' : 'Open search'} aria-expanded={searchOpen} aria-controls="site-search-panel" onClick={() => setSearchOpen((value) => !value)} data-testid="button-open-search">{searchOpen ? <X size={17} /> : <Search size={17} />}</button>}
            {!editor && <Link href="/policies" className="signal-button browse-ledger-link !min-h-[36px] !px-3" data-testid="button-browse-archive">Explore the ledger</Link>}
            {!editor && <a href={`${basePath}/#newsletter`} className="hidden signal-kicker text-accent hover:underline xl:inline-flex" data-testid="link-subscribe">Subscribe</a>}
            <button ref={mobileToggleRef} type="button" className="grid h-10 w-10 place-items-center border border-transparent hover:border-border lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((value) => !value)} data-testid="button-mobile-navigation">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {!editor && searchOpen && <form id="site-search-panel" role="search" action={`${basePath}/search`} method="get" className="signal-search-panel">
          <div className="signal-container flex flex-col gap-3 py-4 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="signal-kicker mb-1 block text-accent">Search the source desk</span>
              <input autoFocus type="search" name="q" placeholder="Records, sources, dates, topics…" className="w-full" data-testid="input-site-search" />
            </label>
            <button className="signal-button" type="submit">Search archive</button>
          </div>
        </form>}
        <nav id="mobile-navigation" hidden={!mobileOpen} className="absolute left-0 right-0 top-full border-b border-foreground/20 bg-background p-5 shadow-md lg:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-5">
              {editor ? <>
                <Link href="/" onClick={close} className="signal-kicker signal-link">Back to publication</Link>
                <Link href="/editor" onClick={close} className="signal-kicker signal-link">Editorial desk</Link>
                <Link href="/editor/evidence" onClick={close} className="signal-kicker signal-link">Evidence graph</Link>
              </> : <>
                <Link href="/" onClick={close} className="signal-kicker signal-link">Home</Link>
                <a href={`${basePath}/#briefing`} onClick={close} className="signal-kicker signal-link">Latest</a>
                <a href={`${basePath}/#live-desk`} onClick={close} className="signal-kicker signal-link">Live desk</a>
                <Link href="/events" onClick={close} className="signal-kicker signal-link">Evidence</Link>
                <Link href="/timeline" onClick={close} className="signal-kicker signal-link">Timeline</Link>
                <Link href="/policies" onClick={close} className="signal-kicker signal-link">Policy ledger</Link>
                <Link href="/data" onClick={close} className="signal-kicker signal-link">Data</Link>
                <Link href="/archive" onClick={close} className="signal-kicker signal-link">Archive</Link>
                <Link href="/community" onClick={close} className="signal-kicker signal-link" data-testid="link-community-mobile">Community</Link>
                <Link href="/about" onClick={close} className="signal-kicker signal-link">About</Link>
                <Link href="/editorial-standards" onClick={close} className="signal-kicker signal-link">Standards</Link>
                <Link href="/methodology" onClick={close} className="signal-kicker signal-link">Methodology</Link>
                <Link href="/topics" onClick={close} className="signal-kicker signal-link">Topics</Link>
                <Link href="/topics/open-category-competition" onClick={close} className="signal-kicker signal-link">Open-category competition</Link>
                <Link href="/search" onClick={close} className="signal-kicker signal-link">Search archive</Link>
                <Link href="/evidence/search" onClick={close} className="signal-kicker signal-link">Search linked evidence</Link>
                <a href={`${basePath}/#newsletter`} onClick={close} className="signal-kicker signal-link">Subscribe</a>
              </>}
            </div>
          </nav>
      </header>
    </>
  );
}

function LoadingBlock({ label = 'Opening the archive…' }: { label?: string }) {
  return <div className="signal-container py-24" role="status" aria-live="polite"><div className="grid gap-4 animate-pulse"><div className="h-3 w-32 bg-muted" /><div className="h-14 max-w-3xl bg-muted" /><div className="h-4 max-w-xl bg-muted" /><p className="mt-3 signal-kicker text-muted-foreground">{label}</p></div></div>;
}

function ErrorState({ message = 'The archive is temporarily unavailable.', onRetry }: { message?: string; onRetry?: () => void }) {
  return <div className="signal-container border-y border-accent/50 px-5 py-20 text-center" role="alert"><p className="signal-kicker text-accent">Archive note / transmission interrupted</p><h2 className="mt-3 font-display text-4xl leading-none">The record could not be opened.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-6 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground" data-testid="button-retry">Try again</button>}</div>;
}

function EmptyState({ title = 'No records match this view.', text = 'Try a broader search, or return to the full archive.' }: { title?: string; text?: string }) {
  return <div className="border border-dashed border-foreground/30 px-6 py-20 text-center"><Archive className="mx-auto mb-4 text-accent" size={28} /><h3 className="font-display text-3xl">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}
function SourceLine({ story, detail = false }: { story: Story; detail?: boolean }) {
  const verificationLabel = story.verificationStatus === 'verified' ? 'Verified' : story.verificationStatus === 'source-linked' ? 'Source linked' : 'Unverified';
  return <div className={`source-stamp evidence-citation ${detail ? 'px-5 py-4' : 'pl-3'}`} data-testid={`citation-story-${story.id}`}>
    <p className="signal-kicker text-accent">Evidence citation / {verificationLabel}</p>
    <p className="mt-1 text-sm font-medium">{story.source || 'Source not supplied'}</p>
    <p className="mt-1 font-mono-signal text-[10px] uppercase tracking-[.1em] text-muted-foreground">{story.kind}{story.state ? ` · ${story.state}` : ''}</p>
    <dl className="mt-3 grid gap-1 text-[11px] text-muted-foreground">
      <div className="flex flex-wrap gap-2"><dt className="signal-kicker text-[9px]">Date attached to record</dt><dd>{formatDate(story.recordDate)}</dd></div>
      {story.sourcePublishedOn && <div className="flex flex-wrap gap-2"><dt className="signal-kicker text-[9px]">Source published</dt><dd>{formatDate(story.sourcePublishedOn)}</dd></div>}
      {story.sourceRetrievedOn && <div className="flex flex-wrap gap-2"><dt className="signal-kicker text-[9px]">Retrieved</dt><dd>{formatDate(story.sourceRetrievedOn)}</dd></div>}
    </dl>
    {detail && story.verificationNotes && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.verificationNotes}</p>}
    {story.sourceUrl ? <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[.68rem] font-bold uppercase tracking-[.12em] text-accent hover:underline" data-testid={`link-source-${story.id}`}>Open direct source <ExternalLink size={12} /></a> : <p className="mt-3 signal-kicker text-muted-foreground">Direct source link unavailable</p>}
  </div>;
}

/*
// hint: Structural and logic conflict. Both design and behavior differ.
function StoryCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  return <article className={`story-hover group ${compact ? 'grid grid-cols-[112px_1fr] gap-4 border-b border-foreground/15 py-5 last:border-0 sm:grid-cols-[145px_1fr]' : ''}`} data-testid={`card-story-${story.id}`}>
    <Link href={storyPath(story)} className={compact ? 'block h-[112px] sm:h-[145px]' : 'block w-full'} data-testid={`link-story-art-${story.id}`}><StoryArt story={story} compact={compact} /></Link>
    <div className={compact ? 'flex min-w-0 flex-col justify-between' : 'pt-5'}><div><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><Link href={storyPath(story)} className="mt-2 block" data-testid={`link-story-${story.id}`}><h3 className={`${compact ? 'text-[1.12rem] sm:text-[1.3rem]' : 'text-[2rem] sm:text-[2.7rem]'} font-display leading-[1.02] tracking-[-.025em] transition-colors group-hover:text-accent`}>{story.title}</h3></Link><p className={`mt-3 ${compact ? 'line-clamp-2 text-[.84rem]' : 'max-w-xl text-[1rem]'} leading-relaxed text-muted-foreground`}>{story.dek}</p></div><div className="mt-4"><SourceLine story={story} /></div>{((story.eventCount ?? 0) + (story.sourceCount ?? 0)) > 0 && <p className="mt-3 signal-kicker text-muted-foreground">{story.eventCount ?? 0} explicitly linked {(story.eventCount ?? 0) === 1 ? 'event' : 'events'} · {story.sourceCount ?? 0} {(story.sourceCount ?? 0) === 1 ? 'source' : 'sources'}</p>}</div>
  </article>;
}
*/
function StoryCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  return <article className={`story-record-row story-hover group ${compact ? 'compact' : ''}`} data-testid={`card-story-${story.id}`}>
    <div>
      <p className="signal-kicker text-accent">{story.topic} / {story.kind}</p>
      <Link href={storyPath(story)} className="mt-2 block" data-testid={`link-story-${story.id}`}>
        <h3 className={`${compact ? 'text-[1.35rem]' : 'text-[2rem] sm:text-[2.7rem]'} max-w-3xl font-display leading-[1.02] tracking-[-.025em] transition-colors group-hover:text-accent`}>{story.title}</h3>
      </Link>
      <p className={`${compact ? 'line-clamp-2' : 'max-w-2xl'} mt-3 text-sm leading-relaxed text-muted-foreground`}>{story.dek}</p>
    </div>
    <SourceLine story={story} />
    {((story.eventCount ?? 0) + (story.sourceCount ?? 0)) > 0 && <p className="signal-kicker text-muted-foreground">{story.eventCount ?? 0} explicitly linked {(story.eventCount ?? 0) === 1 ? 'event' : 'events'} · {story.sourceCount ?? 0} {(story.sourceCount ?? 0) === 1 ? 'source' : 'sources'}</p>}
  </article>;
}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useSubscribeToNewsletter();
  const subscribed = submitted;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    subscribe.mutate({ data: { email } }, { onSuccess: () => setSubmitted(true) });
  }
  return <section id="newsletter" className="signal-container mt-24 border-y-2 border-primary py-10 sm:mt-36 sm:py-14"><div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="signal-kicker text-accent">Stay with the record</p><h2 className="mt-3 max-w-lg font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">A considered briefing, not a firehose.</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">A short note when the national conversation moves: new reporting, court records, research and context.</p></div>{subscribed ? <div className="border border-accent bg-accent/10 p-6" role="status" aria-live="polite" data-testid="newsletter-confirmation"><div className="flex items-start gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={15} /></div><div><p className="font-display text-2xl">Thanks for signing up.</p><p className="mt-1 text-sm text-muted-foreground">If this address is eligible, the next note will arrive in your inbox.</p></div></div></div> : <form onSubmit={submit} className="border border-foreground/20 bg-card p-5 sm:p-7" data-testid="form-newsletter"><label htmlFor="newsletter-email" className="signal-kicker text-muted-foreground">Your email, kept private</label><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input id="newsletter-email" data-testid="input-newsletter-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-0 py-3 text-sm outline-none focus:border-accent" /><button type="submit" disabled={subscribe.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground disabled:opacity-60" data-testid="button-newsletter-submit">{subscribe.isPending ? 'Sending…' : 'Join the briefing'} <Send size={13} /></button></div>{subscribe.isError && <p className="mt-3 text-sm text-destructive" role="alert">That address could not be added. Please try again.</p>}<p className="mt-4 signal-kicker text-[9px] text-muted-foreground">One considered email / unsubscribe anytime</p></form>}</div></section>;
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
  const updates = data?.updates.filter(isFocusLiveUpdate).slice(0, 8) ?? [];

  return <section id="live-desk" className="signal-container pt-20 sm:pt-28">
    <div className="live-desk-header flex flex-col justify-between gap-6 border-y border-foreground/20 py-6 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-3"><Radio size={17} className="text-accent" /><p className="signal-kicker text-accent">02 / Live desk</p><span className="live-pulse h-2 w-2 rounded-full bg-accent" /></div>
        <h2 className="mt-3 max-w-3xl font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">What is moving<br /><em className="font-normal text-accent">right now.</em></h2>
      </div>
      <div className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        <p>External feeds are monitored for leads. This is not published Signal Hub reporting: every item remains unreviewed until the editorial desk checks the source and builds a record.</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 inline-flex items-center gap-2 signal-kicker text-accent disabled:opacity-50" disabled={isFetching} data-testid="button-refresh-live-desk"><RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> {isFetching ? 'Refreshing' : 'Refresh feeds'}</button>
      </div>
    </div>
    {isLoading ? <div className="grid gap-4 py-6 md:grid-cols-2"><div className="h-40 animate-pulse bg-muted" /><div className="h-40 animate-pulse bg-muted" /></div> :
      isError ? <div className="border border-dashed border-foreground/25 px-5 py-10 text-sm text-muted-foreground"><p className="signal-kicker text-accent">Monitor unavailable</p><p className="mt-2">The external feeds could not be reached. The published archive remains available.</p></div> :
        <><div className="grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-2">{updates.map((update) => <LiveUpdateCard key={update.id} update={update} onSelect={onSelect} />)}</div>{updates.length === 0 && <EmptyState title="No on-focus leads returned." text="The monitor only surfaces UGC, open-category, EWS and relevant state quota coverage. Broader headlines are left out of this desk." />}</>}
    {data && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 py-4"><p className="signal-kicker text-muted-foreground">Observed {formatDate(data.observedAt)} · {updates.length} on-focus leads shown</p><p className="signal-kicker text-muted-foreground">{data.feeds.filter((feed) => feed.status === 'ok').length}/{data.feeds.length} feeds responding</p></div>}
  </section>;
}

function LiveUpdateCard({ update, onSelect }: { update: LiveUpdate; onSelect?: (update: LiveUpdate) => void }) {
  return <article className="live-update-card bg-card p-5 sm:p-6" data-testid={`card-live-update-${update.id}`}>
    <div className="flex items-start justify-between gap-4"><p className="signal-kicker text-accent">{update.topic}</p><span className="signal-kicker whitespace-nowrap text-[9px] text-muted-foreground">Needs review</span></div>
    <h3 className="mt-4 font-display text-2xl leading-tight tracking-[-.025em]">{update.headline}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{update.summary}</p>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{update.source} · {update.publishedAt ? formatDate(update.publishedAt) : 'Date not supplied'}</p><div className="flex items-center gap-4">{onSelect && <button type="button" onClick={() => onSelect(update)} className="signal-kicker text-accent hover:underline" data-testid={`button-use-live-update-${update.id}`}>Start draft</button>}<a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline">Open source <ExternalLink size={12} /></a></div></div>
  </article>;
}

function PolicyLedger() {
  const listParams = useMemo<GetPoliciesParams>(() => ({ limit: 1 }), []);
  const { data, isLoading, isError } = useGetPolicies(listParams, { query: { queryKey: getGetPoliciesQueryKey(listParams) } });
  const record: PolicyRecord | undefined = data?.records?.[0];
  return <section id="policy-ledger" className="signal-container mt-24 border-y border-foreground/20 py-10 sm:mt-36 sm:py-14">
    <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
      <div><p className="signal-kicker text-accent">04 / Policy ledger</p><h2 className="mt-3 max-w-sm font-display text-5xl leading-[.92] tracking-[-.05em]">What changed,<br /><em className="font-normal text-accent">and when?</em></h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">A policy is easier to understand when the previous position, new position, authority and source sit together.</p>{record && <Link href={record.canonicalPath} className="mt-7 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-home-policy-ledger">Open the record <ArrowUpRight size={13} /></Link>}</div>
      {isLoading ? <div className="border border-foreground/20 bg-card p-6" role="status" data-testid="status-policy-ledger-loading"><div className="grid animate-pulse gap-4"><div className="h-3 w-32 bg-muted" /><div className="h-8 max-w-lg bg-muted" /><div className="h-4 max-w-md bg-muted" /><div className="h-16 max-w-xl bg-muted" /></div><p className="mt-5 signal-kicker text-muted-foreground">Loading the latest policy record…</p></div> : isError ? <div className="border border-accent/50 bg-card p-6" role="alert" data-testid="status-policy-ledger-error"><p className="signal-kicker text-accent">Ledger note / unavailable</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The latest policy record could not be loaded. The full ledger remains available to browse.</p><Link href="/policies" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-policy-ledger-retry">Browse the ledger <ArrowUpRight size={13} /></Link></div> : !record ? <div className="border border-dashed border-foreground/25 bg-card p-6" data-testid="status-policy-ledger-empty"><p className="signal-kicker text-accent">Ledger / awaiting records</p><p className="mt-3 font-display text-2xl">No policy record has been published yet.</p><Link href="/policies" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-policy-ledger-empty">Open the ledger <ArrowUpRight size={13} /></Link></div> : <div className="border border-foreground/20 bg-card">
        <div className="flex items-center justify-between border-b border-foreground/15 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><Scale size={17} className="text-accent" /><p className="signal-kicker">Policy delta / source-linked record</p></div><span className="signal-kicker text-muted-foreground">{record.status}</span></div>
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-7"><div><p className="signal-kicker text-muted-foreground">Previous framework</p><p className="mt-3 font-display text-2xl leading-tight">{record.previousFramework}</p></div><ArrowDownRight className="hidden text-accent sm:block" size={22} /><div><p className="signal-kicker text-accent">Record in view</p><Link href={record.canonicalPath} className="group mt-3 block" data-testid="link-home-policy-record"><p className="font-display text-2xl leading-tight group-hover:text-accent">{record.title}</p></Link><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{record.summary}</p><div className="mt-5 border-l-2 border-accent pl-3"><p className="signal-kicker text-accent">Authority / effective date</p><p className="mt-1 text-sm">{record.authority}</p><p className="mt-1 signal-kicker text-muted-foreground">{formatDate(record.effectiveDate)} · {record.state ?? 'National'}</p></div></div></div>
      </div>}
    </div>
  </section>;
}

function RecordCollections({ stories }: { stories: Story[] }) {
  const courtRecords = stories.filter((story) => story.topic === 'Courts & Policy').slice(0, 2);
  const stateRecords = stories.filter((story) => story.topic === 'States').slice(0, 3);
  const documents = Array.from(new Map(stories.map((story) => [story.source, story])).values()).slice(0, 4);
  const explainer = stories.find((story) => story.kind === 'Explainer');
  return <>
    <section id="courtroom" className="signal-container pt-24 sm:pt-36">
      <div className="grid gap-8 border-y border-foreground/20 py-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-16"><div><div className="flex items-center gap-3"><Scale size={17} className="text-accent" /><p className="signal-kicker text-accent">05 / Courtroom</p></div><h2 className="mt-3 max-w-sm font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">The case file,<br /><em className="font-normal text-accent">carefully read.</em></h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Judgments and orders need their own context. This section keeps the legal record distinct from reporting about it.</p></div><div className="grid gap-6 sm:grid-cols-2">{courtRecords.map((story) => <Link href={storyPath(story)} key={story.id} className="group border-b border-foreground/15 pb-6 sm:border-b-0 sm:border-l sm:pl-6"><p className="signal-kicker text-accent">{story.kind} · {formatDate(story.publishedOn)}</p><h3 className="mt-3 font-display text-2xl leading-tight group-hover:text-accent">{story.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><p className="mt-4 signal-kicker text-muted-foreground">{story.source}</p></Link>)}</div></div>
    </section>
    <section id="states" className="signal-container pt-24 sm:pt-36">
      <div className="flex flex-col justify-between gap-6 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><MapPin size={17} className="text-accent" /><p className="signal-kicker text-accent">06 / States</p></div><h2 className="mt-3 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">One country,<br /><em className="font-normal text-accent">many frameworks.</em></h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">State records are not interchangeable. Each one needs its own source, date, legal basis and history.</p></div>
      <div className="grid gap-6 py-8 sm:grid-cols-3">{stateRecords.length ? stateRecords.map((story) => <Link href={storyPath(story)} key={story.id} className="group border-b border-foreground/15 pb-5 sm:border-b-0 sm:border-r sm:pr-6 last:border-0"><p className="signal-kicker text-accent">{story.state ?? 'State record'}</p><h3 className="mt-3 font-display text-2xl leading-tight group-hover:text-accent">{story.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><p className="mt-4 signal-kicker text-muted-foreground">{story.kind} · {formatDate(story.publishedOn)}</p></Link>) : <EmptyState title="No state records yet." text="The state desk will grow as verified records are added." />}</div>
    </section>
    <section id="data" className="signal-container pt-24 sm:pt-36">
      <div className="grid gap-8 border-y border-foreground/20 py-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-16"><div><div className="flex items-center gap-3"><Database size={17} className="text-accent" /><p className="signal-kicker text-accent">07 / Data room</p></div><h2 className="mt-3 max-w-sm font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">Numbers need<br /><em className="font-normal text-accent">a denominator.</em></h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">We will not force a comparison where the public record uses different definitions.</p></div><div className="flex items-center border border-dashed border-foreground/25 bg-card p-6 sm:p-8"><div className="flex items-start gap-4"><CircleAlert className="mt-1 shrink-0 text-accent" size={18} /><div><p className="font-display text-2xl">Public data is currently insufficient for a reliable comparison.</p><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">When a dataset arrives, this room will show the value, unit, year, geography, definition, source and last verified date beside every chart.</p><Link href="/archive" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">Read the methodology in the record <ArrowUpRight size={13} /></Link></div></div></div></div>
    </section>
    <section id="documents" className="signal-container pt-24 sm:pt-36">
      <div className="flex flex-col justify-between gap-6 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><FileText size={17} className="text-accent" /><p className="signal-kicker text-accent">08 / Document vault</p></div><h2 className="mt-3 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">The sources<br /><em className="font-normal text-accent">behind the story.</em></h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Primary documents, court records and research notes should be findable long after a headline moves on.</p></div>
      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">{documents.map((story) => <Link href={storyPath(story)} key={story.id} className="group border border-foreground/15 bg-card p-5 hover:border-accent"><p className="signal-kicker text-accent">Source card</p><h3 className="mt-4 font-display text-xl leading-tight group-hover:text-accent">{story.source}</h3><p className="mt-4 signal-kicker text-muted-foreground">{story.kind} · {formatDate(story.publishedOn)}</p></Link>)}</div>
    </section>
    <section id="explainers" className="signal-container pt-24 sm:pt-36">
      <div className="grid gap-8 border-y border-foreground/20 py-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-16"><div><div className="flex items-center gap-3"><BookOpen size={17} className="text-accent" /><p className="signal-kicker text-accent">09 / Explainers</p></div><h2 className="mt-3 max-w-sm font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">Start with<br /><em className="font-normal text-accent">the terms.</em></h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Evergreen context belongs beside the news, not buried underneath it.</p></div>{explainer ? <Link href={storyPath(explainer)} className="group border-l-2 border-accent bg-card p-6 sm:p-8"><p className="signal-kicker text-accent">Explainer / {formatDate(explainer.publishedOn)}</p><h3 className="mt-4 max-w-2xl font-display text-3xl leading-tight group-hover:text-accent sm:text-4xl">{explainer.title}</h3><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{explainer.dek}</p><span className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent">Read the explainer <ArrowUpRight size={13} /></span></Link> : <EmptyState title="No explainer published yet." />}</div>
    </section>
  </>;
}

function TrustNote() {
  return <section className="signal-container mt-24 border-t-2 border-primary py-10 sm:mt-36 sm:py-14"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end"><div><div className="flex items-center gap-3"><ShieldCheck size={17} className="text-accent" /><p className="signal-kicker text-accent">10 / Editorial standards</p></div><h2 className="mt-3 max-w-md font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-5xl">Trust is part<br />of the interface.</h2></div><div><p className="max-w-2xl text-lg leading-relaxed text-foreground/80">Reporting, documents, analysis and opinion must remain visibly distinct. We name sources, preserve dates, show uncertainty, and never present a starter record as live verified news.</p><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3"><Link href="/editorial-standards" className="inline-flex items-center gap-2 signal-kicker text-accent hover:underline">Read editorial standards <ArrowUpRight size={13} /></Link><Link href="/methodology" className="inline-flex items-center gap-2 signal-kicker text-muted-foreground hover:text-accent">Read methodology <ArrowUpRight size={13} /></Link></div></div></div></section>;
}

function InfoPage({ page }: { page: 'about' | 'standards' | 'methodology' }) {
  const content = {
    about: {
      eyebrow: 'Signal Hub / about',
      title: <>A permanent record<br /><em className="font-normal text-accent">for a difficult debate.</em></>,
      intro: 'Signal Hub is India’s reservation and representation monitor: a public-interest newsroom and research archive for policy, courts, documents, data and the histories behind them.',
      sections: [
        ['What this is', 'A source-first place to follow reservation-related developments without reducing a national question to a daily outrage cycle. The archive is designed to help readers understand what happened, where it came from, what changed, and what remains uncertain.'],
        ['What this is not', 'It is not a party publication, a campaign platform, or a substitute for the original judgment, notification, report or dataset. It does not rank governments or communities.'],
        ['A growing record', 'The first release establishes the publication shell, archive, source labels and editorial desk. Live ingestion, document storage, state pages and data tools will be added only when they can meet the same sourcing standard.'],
      ],
    },
    standards: {
      eyebrow: 'Signal Hub / editorial standards',
      title: <>Every claim has a source.<br /><em className="font-normal text-accent">Every number has a document.</em></>,
      intro: 'The subject demands a higher standard than speed alone. We distinguish reporting, documents, analysis and opinion so a reader can tell what kind of record they are reading.',
      sections: [
        ['Reporting', 'What happened, attributed to a source and dated. We do not present an allegation as an established fact or infer motives without reliable documentation.'],
        ['Documents', 'What an original source says. Court orders, government notifications, commission reports and statutory text should be linked or identified wherever possible.'],
        ['Analysis', 'What the available evidence suggests. Analysis must show its method, preserve uncertainty and avoid turning a partial record into a universal claim.'],
        ['Opinion', 'A clearly labelled viewpoint with an identified author and relevant disclosure. Opinion must never be presented as neutral reporting.'],
        ['Corrections and AI', 'If we get a fact wrong, the record should say what changed and when. AI may assist with organization, summarization or metadata, but publication requires editorial review against source material.'],
      ],
    },
    methodology: {
      eyebrow: 'Signal Hub / methodology',
      title: <>A record is only useful<br /><em className="font-normal text-accent">when its frame is visible.</em></>,
      intro: 'The archive preserves source type, date, state, record type and verification context because numbers and claims change meaning when their definitions disappear.',
      sections: [
        ['Source hierarchy', 'Primary government documents, court records, constitutional and statutory text, official statistical releases, parliamentary records, commission reports, academic research and reputable news organizations each play different roles. We name the role rather than hiding it behind a score.'],
        ['Data integrity', 'For an important number, the eventual data room should show value, unit, year, geography, definition, source, source date, collection method and last verified date. Population share, reservation allocation, representation and selection rates must remain distinct.'],
        ['Archive status', 'Records should be marked as current, historical, proposed, challenged, stayed, struck down or unavailable where those distinctions matter. A missing source is a limitation to disclose, not a gap to fill with invention.'],
        ['Starter content', 'Some records in this first release are clearly marked starter records or source-link-pending records. They demonstrate the structure of the publication and must not be mistaken for live verified reporting.'],
      ],
    },
  }[page];

  useSeo({
    title: `${content.eyebrow.split(' / ')[1]} — Signal Hub`,
    description: content.intro,
    canonicalPath: `/${page === 'standards' ? 'editorial-standards' : page}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: content.eyebrow, description: content.intro },
        organizationSchema,
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Signal Hub', item: '/' }, { '@type': 'ListItem', position: 2, name: content.eyebrow.split(' / ')[1], item: `/${page === 'standards' ? 'editorial-standards' : page}` }] },
      ],
    },
  });
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><p className="signal-kicker text-accent">{content.eyebrow}</p><h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{content.title}</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{content.intro}</p></section><section className="signal-container mt-16 border-t border-foreground/20 sm:mt-24"><div className="grid divide-y divide-foreground/15 lg:grid-cols-2 lg:divide-x lg:divide-y-0">{content.sections.map(([title, text], index) => <article key={title} className={`py-8 lg:px-8 ${index % 2 === 0 ? 'lg:pl-0' : 'lg:pr-0'}`}><p className="signal-kicker text-accent">0{index + 1}</p><h2 className="mt-3 font-display text-3xl leading-tight">{title}</h2><p className="mt-4 max-w-xl text-sm leading-[1.8] text-muted-foreground">{text}</p></article>)}</div></section><footer className="signal-container flex flex-wrap justify-between gap-6 border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Current edition</Link><div className="flex gap-5 signal-kicker text-muted-foreground"><Link href="/about" className="signal-link">About</Link><Link href="/editorial-standards" className="signal-link">Standards</Link><Link href="/methodology" className="signal-link">Methodology</Link></div></footer></main>;
}

function HomeIndex({ stories }: { stories: Story[] }) {
  const jurisdictionCount = new Set(FOCUS_SOURCES.map((source) => source.place.split('/')[0].trim())).size;
  return <section className="signal-container mt-8" aria-label="Current edition index">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className="signal-kicker text-accent">Focus desk snapshot</p>
      <time className="signal-kicker text-muted-foreground" dateTime={DESK_SNAPSHOT_DATE}>As of 26 Sep 2026</time>
    </div>
    <div className="home-index grid-cols-2 sm:grid-cols-4">
      <div className="home-scanline col-span-2 p-5 sm:col-span-1 sm:p-6"><p className="signal-kicker text-accent">Verified focus records</p><p className="home-number mt-5" data-testid="text-home-record-count">{stories.length}</p><p className="mt-3 text-xs text-muted-foreground">Published records with a source link and verified status</p></div>
      <div className="p-5 sm:p-6"><p className="signal-kicker text-accent">External leads</p><p className="home-number mt-5">{FOCUS_SOURCES.length}</p><p className="mt-3 text-xs text-muted-foreground">For editorial review; not Signal 24 reporting</p></div>
      <div className="p-5 sm:p-6"><p className="signal-kicker text-accent">Jurisdictions</p><p className="home-number mt-5">{jurisdictionCount}</p><p className="mt-3 text-xs text-muted-foreground">National and state-level source contexts</p></div>
      <div className="signal-note col-span-2 p-5 sm:col-span-1 sm:p-6"><p className="signal-kicker text-accent">Editorial rule</p><p className="mt-5 max-w-[15rem] font-display text-2xl leading-[.95]">No source. No certainty.</p><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Signals can start a question. They cannot finish one.</p></div>
    </div>
  </section>;
}

function evidenceTypeLabel(value: DecisionImpactEvidenceType) {
  return value === 'lived-account' ? 'Lived account' : value === 'monitored-lead' ? 'Monitored lead' : 'Quantified finding';
}

function verificationLabel(value: VerificationStatus) {
  return value === 'verified' ? 'Verified' : value === 'source-linked' ? 'Source linked' : 'Unverified';
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
  const byType = (type: DecisionImpactEvidenceType) => records.find((record) => record.evidenceType === type);
  const lived = byType('lived-account');
  const monitored = byType('monitored-lead');
  const quantified = byType('quantified-finding');
  const measured = isMeasuredDecisionImpact(quantified);
  const missing = DECISION_IMPACT_EVIDENCE_TYPES.filter((type) => !byType(type)).length;
  const card = (record: DecisionImpactRecord | undefined, type: DecisionImpactEvidenceType) => {
    if (!record) {
      return <div className="border border-dashed border-foreground/25 p-5" data-testid={`decision-evidence-missing-${type}`}><p className="signal-kicker text-accent">No published record</p><p className="mt-3 font-display text-2xl leading-tight">The evidence gap stays visible.</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The desk has not published a source-backed {evidenceTypeLabel(type).toLowerCase()} for this area yet.</p></div>;
    }
    return <article className="border border-foreground/15 bg-card p-5" data-testid={`decision-evidence-card-${type}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="signal-kicker text-accent">{evidenceTypeLabel(type)}</p><span className="signal-kicker text-muted-foreground">{verificationLabel(record.verificationStatus)}</span></div>
      <h3 className="mt-4 font-display text-2xl leading-tight">{record.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{record.summary}</p>
      <dl className="mt-5 grid gap-2 border-t border-foreground/15 pt-4 text-xs">
        <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">Area</dt><dd>{record.decisionArea}</dd></div>
        <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">Geography</dt><dd>{record.geography}</dd></div>
        <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">Observed</dt><dd>{formatDate(record.observedOn)}</dd></div>
      </dl>
      <p className="mt-4 border-l-2 border-accent pl-3 text-sm leading-relaxed"><span className="signal-kicker text-accent">What this record means</span><span className="mt-1 block text-muted-foreground">{type === 'lived-account' ? 'Context from an account, not a prevalence estimate.' : type === 'monitored-lead' ? 'A source to check, not a published finding.' : record.definition}</span></p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{record.source} · retrieved {formatDate(record.sourceRetrievedOn)}</p><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline" data-testid={`link-decision-evidence-source-${record.id}`}>Open source <ExternalLink size={12} /></a></div>
      <div className="mt-3 border-t border-foreground/10 pt-3 text-xs leading-relaxed text-muted-foreground">
        {record.verificationNotes && <p>Verification context / {record.verificationNotes}</p>}
        {record.lastVerifiedAt && <p className="mt-1">Last verified / {formatDate(record.lastVerifiedAt)}</p>}
        {record.reviewedAt && <p className="mt-1">Editorial review / {formatDate(record.reviewedAt)}</p>}
        {record.publishedOn && <p className="mt-1">Published / {formatDate(record.publishedOn)}</p>}
      </div>
    </article>;
  };
  return <section id="decision-evidence" className="signal-container pt-24 sm:pt-36">
    <div className="flex flex-col justify-between gap-6 border-y-2 border-primary py-6 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">05 / Migration + decision impacts</p><h2 className="mt-3 max-w-4xl font-display text-5xl leading-[.88] tracking-[-.055em] sm:text-7xl">What people decide,<br /><em className="font-normal text-accent">and what the record can prove.</em></h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Lived accounts show experience. Monitored leads show what needs checking. Quantified findings show measured patterns only when their source, definition and frame are visible.</p></div>
    {isLoading ? <div className="mt-7 grid gap-5 md:grid-cols-3" role="status" data-testid="status-decision-evidence-loading">{DECISION_IMPACT_EVIDENCE_TYPES.map((type) => <div key={type} className="h-64 animate-pulse bg-muted" />)}</div> : isError ? <div className="mt-7 border border-accent/50 bg-card p-6" role="alert" data-testid="status-decision-evidence-error"><p className="signal-kicker text-accent">Evidence ledger / unavailable</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The evidence ledger could not be reached. No movement number is shown.</p></div> : <div className="mt-7 grid gap-5 md:grid-cols-3">{card(lived, 'lived-account')}{card(monitored, 'monitored-lead')}{measured ? card(quantified, 'quantified-finding') : <div className="border border-dashed border-accent/60 p-5" data-testid="decision-evidence-quantified-gap"><p className="signal-kicker text-accent">Quantified finding / not established</p><p className="mt-3 font-display text-2xl leading-tight">{quantified ? 'A record exists, but it cannot carry a measured movement signal yet.' : 'No measured movement signal is published.'}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{quantified ? `The current record is missing a complete source, definition, geography, date or verification frame. ${quantified.summary}` : 'The available records do not establish a defensible migration trend. We will not replace the gap with an inferred number.'}</p>{quantified?.sourceUrl && <a href={quantified.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 signal-kicker text-accent hover:underline">Review the source <ExternalLink size={12} /></a>}</div>}</div>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-foreground/20 py-4"><p className="signal-kicker text-muted-foreground">Evidence ledger / {records.length} published records</p><p className="signal-kicker text-accent">{missing} evidence class{missing === 1 ? '' : 'es'} still missing a published record</p></div>
  </section>;
}

function HomeDecisionGrid({ stories }: { stories: Story[] }) {
  const findStory = (topic: string) => stories.find((story) => story.topic === topic);
  const cells = [
    { number: '01', label: 'Courts + policy', title: 'What changed on paper?', story: findStory('Courts & Policy'), tone: 'bg-primary text-primary-foreground' },
    { number: '02', label: 'States', title: 'Where does the framework shift?', story: findStory('States'), tone: '' },
    { number: '03', label: 'Ground reports', title: 'What does it alter in a day?', story: findStory('Ground Reports'), tone: '' },
  ];
  return <section id="decisions" className="signal-container pt-24 sm:pt-36">
    <div className="flex flex-col justify-between gap-6 border-y border-foreground/20 py-6 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">04 / Decision map</p><h2 className="mt-3 max-w-3xl font-display text-5xl leading-[.88] tracking-[-.055em] sm:text-7xl">The headline is<br /><em className="font-normal text-accent">not the decision.</em></h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">People use public information to decide where to study, work, apply, stay, speak or leave. We connect the record to those smaller decisions without pretending one story explains a whole life.</p></div>
    <div className="mt-7 grid gap-px border border-foreground/20 bg-foreground/20 md:grid-cols-3">
      {cells.map((cell) => <article key={cell.number} className={`home-topic-card min-h-[270px] p-6 sm:p-8 ${cell.tone || 'bg-card'}`} data-testid={`card-decision-${cell.number}`}>
        <div className="flex items-start justify-between gap-4"><p className={`signal-kicker ${cell.tone ? 'text-secondary' : 'text-accent'}`}>{cell.number} / {cell.label}</p><ArrowDownRight size={17} className={cell.tone ? 'text-accent' : 'text-muted-foreground'} /></div>
        <h3 className="mt-16 font-display text-3xl leading-[.95] tracking-[-.03em]">{cell.title}</h3>
        {cell.story ? <Link href={storyPath(cell.story)} className={`mt-6 block border-t pt-4 text-sm leading-relaxed ${cell.tone ? 'border-primary-foreground/25 text-primary-foreground/70' : 'border-foreground/15 text-muted-foreground'}`} data-testid={`link-decision-story-${cell.story.id}`}><span className={`signal-kicker ${cell.tone ? 'text-secondary' : 'text-accent'}`}>{cell.story.source}</span><span className="mt-2 block font-medium">{cell.story.title}</span></Link> : <p className={`mt-6 border-t pt-4 text-sm leading-relaxed ${cell.tone ? 'border-primary-foreground/25 text-primary-foreground/70' : 'border-foreground/15 text-muted-foreground'}`}>No published record in this issue. The gap stays visible.</p>}
      </article>)}
    </div>
    <article className="home-gap mt-7 grid gap-8 border border-accent/60 p-6 sm:p-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center" data-testid="card-movement-pressure">
      <div><p className="signal-kicker text-accent">04 / Movement pressure</p><h3 className="mt-3 max-w-md font-display text-4xl leading-[.9] tracking-[-.045em] sm:text-5xl">Some people are asking whether to leave.</h3></div>
      <div className="border-l-2 border-accent pl-5">
        <><p className="signal-kicker text-accent">Evidence status / see the ledger below</p><p className="mt-3 max-w-xl font-display text-2xl leading-tight">The current issue does not turn movement pressure into a trend.</p><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">The decision-evidence ledger separates accounts, monitored leads and measured findings. Until a finding has a source, definition, geography, date and verification context, the gap stays visible.</p><a href="#decision-evidence" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-movement-evidence">Open the evidence ledger <ArrowUpRight size={13} /></a></>
      </div>
    </article>
  </section>;
}

function Home() {
  const { data, isLoading, isError, refetch } = useGetCurrentIssue();
  const decisionImpactQuery = useGetDecisionImpacts(
    { limit: 100 },
    { query: { queryKey: getGetDecisionImpactsQueryKey({ limit: 100 }) } },
  );
  const [activeTopic, setActiveTopic] = useState<Topic | 'All'>('All');
  const [search, setSearch] = useState('');
  const focusedStories = useMemo(
    () => data?.stories.filter((story) => isFocusStory(story) && story.verificationStatus === 'verified') ?? [],
    [data],
  );
  const focusTopics = useMemo(
    () => [...new Set(focusedStories.map((story) => story.topic))],
    [focusedStories],
  );
  useSeo({
    title: 'Signal Hub — Follow the evidence',
    description: 'A source-first public-interest newsroom and research archive for reservation policy, court records, official documents and data in India.',
    canonicalPath: '/',
    structuredData: { '@context': 'https://schema.org', '@graph': [organizationSchema, { '@type': 'WebSite', name: 'Signal Hub', url: '/' }] },
  });
  const stories = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return focusedStories.filter((story) => (activeTopic === 'All' || story.topic === activeTopic) && (!q || `${story.title} ${story.dek} ${story.source} ${story.state}`.toLowerCase().includes(q)));
  }, [activeTopic, data, focusedStories, search]);
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Assembling the current situation room…" /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="The current issue could not be assembled. The published archive remains available." onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState title="The current edition is not available." text="No published issue was returned. Check the archive for source-linked records." /></div></div>;
  const [featured, ...rest] = stories;
  const mediumStories = rest.slice(0, 2);
  const smallStories = rest.slice(2, 6);
  return <main className="signal-page"><Header />
    <div className="home-marquee signal-container mt-7 border-b border-foreground/20 py-3" aria-label="Current focus">
      <span className="signal-kicker text-accent">{focusedStories.length ? focusedStories.slice(0, 4).map((story) => story.title).join(' / ') : 'Current focus / UGC equity rules · open-category competition · state quota disputes · EWS eligibility'}</span>
    </div>
    <section className="signal-container situation-hero mt-8 grid gap-10 border-b border-foreground/20 pb-10 pt-6 sm:pb-14 sm:pt-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-14">
      <div>
        <div className="mb-6 flex flex-wrap items-center gap-3"><p className="signal-kicker text-accent">Issue {String(data.issue.issueNumber).padStart(3, '0')} / {formatDate(data.issue.issueDate)}</p><span className="signal-tag signal-tag--blue">India / policy focus</span></div>
        <p className="signal-kicker text-muted-foreground">Current edition / {data.issue.title}</p>
        <h1 className="situation-hero-title max-w-4xl font-display text-6xl font-semibold leading-[.91] tracking-[-.065em] sm:text-7xl lg:text-[6.6rem]" data-testid="heading-hero">Who gets<br /><em className="font-normal text-accent">to compete</em><br />in the open?</h1>
        <p className="signal-reading-column mt-7 max-w-xl text-base text-muted-foreground">{data.issue.intro}</p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Follow rules and court cases shaping open-category competition, UGC protections, EWS eligibility and state quota disputes. Reported claims, legal arguments and outcomes stay clearly separated.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/topics/open-category-competition" className="signal-button" data-testid="link-read-briefing">Explore the open-category question <ArrowDownRight size={15} /></Link>
          <a href="#focus-desk" className="signal-button signal-button--outline" data-testid="link-hero-live-desk">External source desk</a>
        </div>
      </div>
      <figure className="hero-documentary relative m-0 min-h-[280px] overflow-hidden border border-foreground/20 sm:aspect-[4/3] sm:min-h-0">
        <img src={`${basePath}/images/supreme-court.jpg`} alt="Supreme Court of India building" className="absolute inset-0 h-full w-full object-cover" />
        <figcaption className="absolute inset-x-0 bottom-0 border-t border-foreground/15 bg-background/95 p-4 sm:p-5">
          <p className="signal-kicker text-accent">Archive image / Supreme Court of India / Wikimedia Commons</p>
          <p className="mt-2 font-display text-2xl leading-tight sm:text-3xl">Read the rule. Check the order. Track the open pool.</p>
        </figcaption>
      </figure>
    </section>
    {!featured ? focusedStories.length === 0 ? <section id="briefing" className="signal-container pt-8 sm:pt-12">
      <div className="front-page-lead editorial-grid gap-y-7 py-7 sm:py-9">
        <div className="col-span-12 lg:col-span-7 lg:pr-8">
          <p className="signal-kicker text-accent">Front page / desk note</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">Nothing is ready to be called a sourced investigation.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">The current issue has no record that meets the front-page source and relevance checks. That gap stays visible; external monitoring leads remain separate from Signal Hub reporting.</p>
        </div>
        <div className="col-span-12 flex flex-col justify-center border-t border-foreground/20 pt-5 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="signal-kicker text-accent">Current issue / focused records</p>
          <p className="home-number mt-4" data-testid="text-home-record-count">{focusedStories.length}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Published records with a direct source link and a clear connection to this issue.</p>
          <Link href="/archive" className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-home-empty-archive">Browse the archive <ArrowUpRight size={13} /></Link>
        </div>
      </div>
    </section> : <section id="briefing" className="signal-container pt-10 sm:pt-16">
      <EmptyState title="No current record matches this view." text="Clear the current-issue search or topic filter to see the published source-linked records." />
      <button type="button" onClick={() => { setActiveTopic('All'); setSearch(''); }} className="mt-5 signal-kicker text-accent hover:underline" data-testid="button-clear-current-filters">Clear current-issue filters</button>
    </section> : <section id="briefing" className="signal-container pt-10 sm:pt-16">
      <div className="front-page-lead editorial-grid gap-y-8 py-8 sm:py-10">
        <article className="col-span-12 lg:col-span-7 lg:pr-6" data-testid={`card-story-lead-${featured.id}`}>
          <p className="signal-kicker text-accent">{featured.topic} / {featured.kind}</p>
          <Link href={storyPath(featured)} className="group mt-3 block" data-testid={`link-story-lead-${featured.id}`}><h2 className="max-w-4xl font-display text-5xl leading-[.92] tracking-[-.05em] group-hover:text-accent sm:text-7xl">{featured.title}</h2></Link>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{featured.dek}</p>
          <div className="mt-6 max-w-xl"><SourceLine story={featured} /></div>
        </article>
        <div className="signal-note col-span-12 flex flex-col justify-center border-l-2 p-5 sm:p-7 lg:col-span-5" data-testid={`story-evidence-summary-${featured.id}`}>
          <p className="signal-kicker text-accent">Evidence status / {verificationLabel(featured.verificationStatus)}</p>
          <p className="mt-5 font-display text-3xl leading-tight">{featured.source || 'Source not supplied'}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Record date / as supplied · {formatDate(featured.publishedOn)}</p>
          <Link href={storyPath(featured)} className="mt-6 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid={`link-story-lead-art-${featured.id}`}>Read this record <ArrowUpRight size={13} /></Link>
        </div>
      </div>
      {mediumStories.length > 0 && <div className="editorial-grid border-b border-foreground/20 py-8">{mediumStories.map((story) => <article key={story.id} className="col-span-12 border-t border-foreground/18 pt-5 sm:col-span-6 lg:col-span-4 lg:first:col-start-1" data-testid={`card-story-medium-${story.id}`}><p className="signal-kicker text-accent">{story.topic} / {formatDate(story.publishedOn)}</p><Link href={storyPath(story)} className="group block" data-testid={`link-story-medium-${story.id}`}><h3 className="mt-3 font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3></Link><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><p className="mt-4 signal-kicker text-muted-foreground">{story.source || 'Source not supplied'}</p></article>)}</div>}
      {smallStories.length > 0 && <div className="editorial-grid py-2">{smallStories.map((story) => <article key={story.id} className="front-page-small col-span-12 py-5 sm:col-span-6 lg:col-span-3" data-testid={`card-story-small-${story.id}`}><p className="signal-kicker text-accent">{story.topic}</p><Link href={storyPath(story)} className="group block" data-testid={`link-story-small-${story.id}`}><h3 className="mt-2 font-display text-xl leading-tight group-hover:text-accent">{story.title}</h3></Link><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><p className="mt-4 signal-kicker text-muted-foreground">{formatDate(story.publishedOn)}</p></article>)}</div>}
      <div className="flex flex-wrap items-center gap-3 border-y border-foreground/20 py-5" aria-label="Filter current investigations">{['All', ...focusTopics].map((topic) => <button key={topic} type="button" onClick={() => setActiveTopic(topic as Topic | 'All')} className={`border px-4 py-2 signal-kicker transition-colors ${activeTopic === topic ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 hover:border-accent hover:text-accent'}`} aria-pressed={activeTopic === topic} data-testid={`button-topic-${String(topic).replace(/\W/g, '-').toLowerCase()}`}>{topic}</button>)}<label className="ml-auto flex items-center gap-2 border-b border-foreground/25 py-2 text-sm"><Search size={14} className="text-accent" /><input aria-label="Search current issue" data-testid="input-search-current" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this issue" className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label></div>
    </section>}
    <LiveDesk />
    {focusedStories.length > 0 && <HomeDecisionGrid stories={focusedStories} />}
    <DecisionEvidenceSection records={decisionImpactQuery.data?.records ?? []} isLoading={decisionImpactQuery.isLoading} isError={decisionImpactQuery.isError} />
    <section className="signal-container signal-editorial-section mt-24 sm:mt-36"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20"><div><p className="signal-kicker text-accent">05 / How to read the record</p><h2 className="mt-4 max-w-md font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-7xl">Facts have<br /><em className="font-normal text-accent">a chain of custody.</em></h2><p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">Reservation is a constitutional guarantee, a question of representation, a response to discrimination and a lived reality in classrooms, offices and public life.</p></div><div className="border-l border-foreground/20 pl-6 sm:pl-10">{[['01', 'Source', 'Where did this come from?'], ['02', 'Context', 'What framework, state or history does it sit inside?'], ['03', 'Consequence', 'What can a reader responsibly do with it?']].map(([number, title, description], index) => <div key={number} className={`relative ${index < 2 ? 'pb-9' : ''}`}><span className="absolute -left-[29px] top-0 h-3 w-3 border-2 border-background bg-accent sm:-left-[45px]" /><p className="signal-kicker text-accent">{number}</p><h3 className="mt-2 font-display text-2xl">{title}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p></div>)}</div></div></section>
    <PolicyLedger />
    {focusedStories.length > 0 && <RecordCollections stories={focusedStories} />}
    <TrustNote />
    {focusedStories.length > 3 && <section className="signal-container pt-24 sm:pt-36"><div className="flex items-end justify-between border-b border-foreground/20 pb-5"><div><p className="signal-kicker text-accent">12 / The larger record</p><h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">Keep following.</h2></div><Link href="/archive" className="hidden items-center gap-2 text-[.68rem] font-bold uppercase tracking-[.13em] hover:text-accent sm:flex" data-testid="link-explore-archive">Explore all records <ChevronRight size={14} /></Link></div><div className="grid gap-7 py-8 sm:grid-cols-3">{focusedStories.slice(3, 6).map((story, index) => <Link href={storyPath(story)} key={story.id} className="group border-b border-foreground/15 pb-6 sm:border-b-0 sm:border-r sm:pr-6 last:border-0" data-testid={`link-follow-story-${story.id}`}><p className="signal-kicker text-accent">{story.topic} / 0{index + 1}</p><h3 className="mt-3 font-display text-2xl leading-[1.02] tracking-[-.03em] group-hover:text-accent">{story.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><span className="mt-5 block signal-kicker text-muted-foreground">{story.kind} <ArrowUpRight size={12} className="ml-1 inline" /></span></Link>)}</div></section>}
    <NewsletterSignup /><footer className="signal-container flex flex-col justify-between gap-8 py-10 sm:flex-row sm:items-end"><div><Link href="/" className="signal-link flex items-center gap-3"><BrandMark /><span className="font-display text-xl">SIGNAL <span className="text-accent">HUB</span></span></Link><p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">A source-first public-interest newsroom for understanding reservation in India.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 signal-kicker text-[9px] text-muted-foreground"><Link href="/archive" className="signal-link">Archive</Link><Link href="/about" className="signal-link">About</Link><Link href="/editorial-standards" className="signal-link">Standards</Link><Link href="/methodology" className="signal-link">Methodology</Link><Link href="/editor" className="signal-link">Editorial desk</Link><span>© Signal Hub</span></div></footer>
  </main>;
}

function TopicIndexPage() {
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useGetArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  const topics = useMemo(() => {
    const stories = data?.stories ?? [];
    return Array.from(new Set(stories.map((story) => story.topic))).map((topic) => ({
      topic,
      records: stories.filter((story) => story.topic === topic),
    }));
  }, [data]);
  useSeo({
    title: 'Topics — Signal Hub',
    description: 'Browse Signal Hub archive records by topic, with each record’s evidence status and source visible.',
    canonicalPath: '/topics',
  });
  return <main className="signal-page">
    <Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">SIGNAL HUB / topics</p>
      <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Follow a subject<br /><em className="font-normal text-accent">through the record.</em></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">Topic pages group published archive records. Each record keeps its own source, date and verification status; a topic label is not evidence of a connection.</p>
    </section>
    <section className="signal-container mt-16 border-t border-foreground/20 py-8 sm:mt-24 sm:py-12">
      {isLoading ? <LoadingBlock label="Reading the published archive…" /> :
        isError ? <ErrorState message="Topics could not be assembled from the archive." onRetry={() => void refetch()} /> :
          topics.length === 0 ? <EmptyState title="No topics are published yet." text="The index will appear when published archive records are available." /> :
            <div className="editorial-grid">
              {topics.map(({ topic, records }) => <Link key={topic} href={`/topics/${encodeURIComponent(topic)}`} className="col-span-12 border-b border-foreground/20 py-7 sm:col-span-6 lg:col-span-4" data-testid={`link-topic-${slugify(topic)}`}>
                <p className="signal-kicker text-accent">{records.length} {records.length === 1 ? 'record' : 'records'}</p>
                <h2 className="mt-3 font-display text-3xl leading-tight">{topic}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{records[0]?.dek ?? 'No description supplied.'}</p>
                <span className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent">Open topic <ArrowUpRight size={13} /></span>
              </Link>)}
            </div>}
    </section>
    <footer className="signal-container border-t border-foreground/20 py-8"><Link href="/archive" className="signal-kicker signal-link">Browse all records</Link></footer>
  </main>;
}

function TopicPage() {
  const params = useParams<{ slug?: string }>();
  const topic = decodeURIComponent(params.slug ?? '') as Topic;
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useGetArchive(archiveParams, { query: { queryKey: getGetArchiveQueryKey(archiveParams) } });
  const records = useMemo(() => (data?.stories ?? []).filter((story) => story.topic === topic), [data, topic]);
  const sourceDocuments = useMemo(() => {
    const byUrl = new Map<string, Story>();
    for (const story of records) {
      if (story.sourceUrl) byUrl.set(story.sourceUrl, story);
    }
    return Array.from(byUrl.values());
  }, [records]);
  const otherTopics = useMemo(() => (data?.topics ?? []).filter((item) => item !== topic), [data, topic]);
  useSeo({
    title: `${topic || 'Topic'} — Signal Hub`,
    description: `Published Signal Hub records on ${topic || 'this topic'}, with evidence status and direct sources visible.`,
    canonicalPath: params.slug ? `/topics/${params.slug}` : undefined,
  });
  if (!topic) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That topic address is not valid." /></div></div>;
  return <main className="signal-page">
    <Header />
    <section className="signal-container pt-14 sm:pt-24">
      <Link href="/topics" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground"><ArrowLeft size={13} /> All topics</Link>
      <p className="mt-12 signal-kicker text-accent">SIGNAL HUB / topic investigation</p>
      <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{topic}</h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">A topic view assembled from the published archive. Dates, direct sources and missing relationships remain explicit.</p>
    </section>
    {isLoading ? <LoadingBlock label="Assembling the topic record…" /> :
      isError ? <div className="signal-container py-16"><ErrorState message="This topic could not be assembled from the archive." onRetry={() => void refetch()} /></div> :
        <>
          <section className="signal-container mt-16 border-y border-foreground/20 py-8 sm:mt-24 sm:py-12">
            <div className="editorial-grid gap-y-8">
              <div className="col-span-12 lg:col-span-3">
                <p className="signal-kicker text-accent">Key facts / archive count</p>
                <p className="mt-4 font-display text-5xl">{records.length}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{records.length === 1 ? 'published archive record' : 'published archive records'} under this topic.</p>
              </div>
              <div className="col-span-12 lg:col-span-9">
                <p className="signal-kicker text-accent">Relationship map / archive data only</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-4">
                  <div className="border-t-2 border-primary pt-3"><p className="signal-kicker text-muted-foreground">Topic</p><p className="mt-2 font-display text-xl">{topic}</p></div>
                  <div className="border-t-2 border-foreground/25 pt-3"><p className="signal-kicker text-muted-foreground">Events</p><p className="mt-2 text-sm leading-relaxed">Not separately catalogued</p></div>
                  <div className="border-t-2 border-foreground/25 pt-3"><p className="signal-kicker text-muted-foreground">Direct source documents</p><p className="mt-2 font-display text-xl">{sourceDocuments.length}</p></div>
                  <div className="border-t-2 border-accent pt-3"><p className="signal-kicker text-muted-foreground">Archive records</p><p className="mt-2 font-display text-xl">{records.length}</p></div>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">The archive does not yet store event-to-document links as structured records. This map shows only topic membership and direct source links; it does not infer event relationships.</p>
                {sourceDocuments.length > 0 && <ul className="mt-5 divide-y divide-foreground/15 border-y border-foreground/15">
                  {sourceDocuments.map((story) => <li key={story.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="text-sm">{story.source || 'Direct source document'}</span>
                    <a href={story.sourceUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline">Open source <ExternalLink size={12} /></a>
                  </li>)}
                </ul>}
              </div>
            </div>
          </section>
          <section className="signal-container py-10 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/20 pb-5">
              <div><p className="signal-kicker text-accent">Latest developments / records in this topic</p><h2 className="mt-2 font-display text-4xl">The archive</h2></div>
              <Link href="/timeline" className="signal-kicker text-accent hover:underline">View dated records <ArrowUpRight size={12} className="ml-1 inline" /></Link>
            </div>
            {records.length === 0 ? <div className="pt-8"><EmptyState title="No records in this topic." text="Return to the topics index or browse the full archive." /></div> :
              <div className="border-t border-foreground/20">
                {records.map((story) => <article key={story.id} className="grid gap-5 border-b border-foreground/20 py-7 md:grid-cols-[.25fr_1fr_.62fr] md:gap-10" data-testid={`card-topic-record-${story.id}`}>
                  <div><p className="signal-kicker text-accent">Record date / as supplied</p><p className="mt-2 font-mono-signal text-xs">{formatDate(story.publishedOn)}</p><p className="mt-2 signal-kicker text-muted-foreground">{story.kind}</p></div>
                  <div><Link href={storyPath(story)} className="group"><h3 className="font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3></Link><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p></div>
                  <SourceLine story={story} />
                </article>)}
              </div>}
          </section>
          {otherTopics.length > 0 && <section className="signal-container border-t border-foreground/20 py-8">
            <p className="signal-kicker text-accent">Other indexed topics</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">{otherTopics.map((item) => <Link key={item} href={`/topics/${encodeURIComponent(item)}`} className="signal-kicker signal-link">{item}</Link>)}</div>
          </section>}
        </>}
  </main>;
}
function TimelinePage() {
  const archiveParams = useMemo(() => ({ limit: 100 }), []);
  const policyParams = useMemo<GetPoliciesParams>(() => ({ limit: 100 }), []);
  const archiveQuery = useGetArchive(archiveParams, {
    query: { queryKey: getGetArchiveQueryKey(archiveParams) },
  });
  const policyQuery = useGetPolicies(policyParams, {
    query: { queryKey: getGetPoliciesQueryKey(policyParams) },
  });
  useSeo({
    title: 'Source timeline — The Signal 24',
    description: 'A dated index of published policy records, verified Signal 24 records, and separately labelled external leads.',
    canonicalPath: '/timeline',
  });
  const entries = useMemo(() => {
    const policyEntries = (policyQuery.data?.records ?? []).filter((record) => record.sources.length > 0).map((record) => ({
      id: `policy-${record.id}`,
      date: record.effectiveDate || record.publishedOn,
      dateLabel: record.effectiveDate ? 'Effective date' : 'Published',
      kind: 'official' as const,
      label: `Policy record / ${record.status}`,
      title: record.title,
      summary: record.summary,
      source: record.authority,
      href: record.canonicalPath,
    }));
    const storyEntries = (archiveQuery.data?.stories ?? [])
      .filter((story) => story.verificationStatus === 'verified' && Boolean(story.sourceUrl && story.publishedOn))
      .map((story) => ({
        id: `story-${story.id}`,
        date: story.publishedOn!,
        dateLabel: 'Signal 24 publication date',
        kind: 'record' as const,
        label: `${story.kind} / ${verificationLabel(story.verificationStatus)}`,
        title: story.title,
        summary: story.dek,
        source: story.source,
        href: storyPath(story),
      }));
    const leadEntries = FOCUS_SOURCES.map((source, index) => ({
      id: `lead-${index}`,
      date: source.date,
      dateLabel: 'External publication date',
      kind: 'lead' as const,
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
  const hasError = archiveQuery.isError || policyQuery.isError;
  const loading = archiveQuery.isLoading || policyQuery.isLoading;
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">The Signal 24 / timeline</p>
      <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.88] tracking-[-.06em] sm:text-8xl">Dates with<br /><em className="font-normal text-accent">their record type.</em></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">This is an index of source dates, not a complete history. Effective dates, publication dates and external leads are labelled separately; a headline is not treated as a court finding.</p>
    </section>
    <section className="signal-container mt-12 pb-12 sm:mt-16 sm:pb-16">
      {hasError && <p className="signal-note mb-5 p-4 text-sm text-muted-foreground" role="status">Some source lists are unavailable. The dates shown below come only from the responses that loaded.</p>}
      {loading ? <LoadingBlock label="Assembling dated source entries…" /> :
        !entries.length ? <EmptyState title="No dated entries are available." text="The timeline only uses dates attached to published records or attributed external sources." /> :
          <div className="border-t-2 border-foreground">
            {entries.map((entry) => <article key={entry.id} className="grid gap-4 border-b border-foreground/20 py-6 md:grid-cols-[170px_1fr] md:gap-8" data-testid={`timeline-entry-${entry.id}`}>
              <div><time className="font-display text-2xl leading-tight" dateTime={entry.date}>{formatDate(entry.date)}</time><p className="mt-2 signal-kicker text-muted-foreground">{entry.dateLabel}</p></div>
              <div className={`border-l-2 pl-5 ${entry.kind === 'lead' ? 'border-secondary' : entry.kind === 'official' ? 'border-ring' : 'border-accent'}`}>
                <p className="signal-kicker">{entry.label}</p>
                <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{entry.kind === 'lead' ? <a href={entry.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{entry.title}</a> : <Link href={entry.href} className="hover:text-accent">{entry.title}</Link>}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
                <p className="mt-4 signal-kicker text-muted-foreground">{entry.source}</p>
              </div>
            </article>)}
          </div>}
      <p className="mt-5 signal-kicker text-muted-foreground">External leads are not Signal 24 reporting. Verify court status against the linked order before relying on a reported update.</p>
    </section>
    <footer className="signal-site-footer"><div className="signal-container flex flex-wrap justify-between gap-4 py-7"><Link href="/archive" className="signal-kicker signal-link">Browse the archive</Link><Link href="/methodology" className="signal-kicker signal-link">How dates are handled</Link></div></footer>
  </main>;
}
function SearchPage() {
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
  const { data, isLoading, isError, refetch } = useGetArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  useSeo({
    title: 'Search the archive — The Signal 24',
    description: 'Search published Signal 24 records and browse clearly labelled external source leads.',
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
      <p className="signal-kicker text-accent">The Signal 24 / search</p>
      <h1 className="mt-4 max-w-4xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Find the<br /><em className="font-normal text-accent">source record.</em></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">Search published archive records and the separate external reading list. Each result keeps its source and verification status visible.</p>
    </section>
    <section className="signal-container archive-grid mt-12 border-y border-foreground/20 py-6 sm:mt-16" aria-label="Search records and sources">
      <form role="search" onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 border border-foreground/20 bg-card px-3 py-2">
          <Search size={16} className="shrink-0 text-accent" />
          <span className="sr-only">Search records, publishers, and topics</span>
          <input type="search" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Records, publishers, dates, topics…" className="min-h-10 w-full bg-transparent text-sm outline-none" data-testid="input-search-page" />
        </label>
        <button className="signal-button" type="submit" data-testid="button-search-page">Search</button>
      </form>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <SelectFilter label="Topic" value={topic} options={data?.topics.length ? data.topics : TOPICS} onChange={setTopic} testId="select-search-topic" />
        <SelectFilter label="Record type" value={kind} options={data?.kinds.length ? data.kinds : KINDS} onChange={setKind} testId="select-search-kind" />
        <SelectFilter label="State" value={state} options={data?.states.length ? ['All states', ...data.states] : INDIA_STATES} onChange={(value) => setState(value === 'All states' ? '' : value)} testId="select-search-state" />
        <button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-search">Clear filters</button>
      </div>
    </section>
    <section className="signal-container py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/20 pb-4">
        <div><p className="signal-kicker text-accent">01 / Published archive</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">Signal 24 records</h2></div>
        {data && <p className="signal-kicker text-muted-foreground">{data.stories.length} returned by the archive</p>}
      </div>
      {isLoading ? <div className="py-8"><LoadingBlock label="Searching published records…" /></div> :
        isError ? <div className="py-8"><ErrorState message="Published records could not be searched." onRetry={() => void refetch()} /></div> :
          !data?.stories.length ? <div className="py-8"><EmptyState title="No published record matched." text="Try another term or clear a filter. External sources are listed separately below." /></div> :
            <div className="border-t border-foreground/20">{data.stories.map((story) => <StoryCard key={story.id} story={story} compact />)}</div>}
    </section>
    <section className="signal-container pb-12 sm:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/20 py-5">
        <div><p className="signal-kicker text-accent">02 / External leads</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">A reading list, not Signal 24 reporting</h2></div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">These links are external sources supplied or checked for the focus desk. Their claims have not been adopted as Signal 24 findings.</p>
      </div>
      {!leads.length ? <p className="py-8 text-sm text-muted-foreground">No external lead matched this search.</p> :
        <div className="grid gap-x-8 sm:grid-cols-2">
          {leads.map((source) => <article key={source.href} className="story-record-row">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="signal-tag signal-tag--amber">External lead / {source.lane}</span><time className="signal-kicker text-muted-foreground" dateTime={source.date}>{formatDate(source.date)}</time></div>
            <div><h3 className="font-display text-2xl leading-tight">{source.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{source.summary}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/15 pt-3"><span className="signal-kicker text-muted-foreground">{source.publisher} · {source.place}</span><a href={source.href} target="_blank" rel="noopener noreferrer" className="signal-kicker text-accent hover:underline">Open source <ExternalLink size={12} className="ml-1 inline" /></a></div></div>
          </article>)}
        </div>}
    </section>
    <footer className="signal-site-footer"><div className="signal-container flex flex-wrap justify-between gap-4 py-7"><Link href="/archive" className="signal-kicker signal-link">Full archive <ArrowUpRight size={13} className="ml-1 inline" /></Link><Link href="/evidence/search" className="signal-kicker signal-link">Search linked evidence</Link><Link href="/" className="signal-kicker signal-link">Current edition</Link></div></footer>
  </main>;
}

function OpenCategoryTopicPage() {
  const slug = 'open-category-competition';
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useGetArchive(params, {
    query: { enabled: slug === 'open-category-competition', queryKey: getGetArchiveQueryKey(params) },
  });
  const leads = FOCUS_SOURCES.filter((source) => ['UGC rules', 'Open competition', 'EWS / eligibility'].includes(source.lane));
  const stories = (data?.stories ?? []).filter((story) =>
    story.verificationStatus === 'verified' &&
    isFocusStory(story) &&
    /\b(open|unreserved|general.?category|ugc|ews|economically weaker sections)\b/i.test(`${story.title} ${story.dek} ${story.source}`),
  );
  useSeo({
    title: 'Open-category competition — The Signal 24',
    description: 'Source-linked context on open-category competition, UGC equity rules, EWS eligibility, and the distinction between reported claims and legal outcomes.',
    canonicalPath: '/topics/open-category-competition',
  });
  if (slug !== 'open-category-competition') return <NotFound />;
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">The Signal 24 / topic file</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_.62fr] lg:items-end">
        <h1 className="max-w-5xl font-display text-6xl leading-[.88] tracking-[-.06em] sm:text-8xl">Open-category<br /><em className="font-normal text-accent">competition.</em></h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">Open seats are generally available to eligible candidates across categories; they are not a reserved pool for any one caste group. Rules, selection lists and court orders must be read in their own context.</p>
      </div>
      <div className="signal-note mt-8 max-w-3xl p-5 sm:p-6">
        <p className="signal-kicker text-accent">Reading rule / evidence boundary</p>
        <p className="mt-3 text-sm leading-relaxed">A demand, a litigant’s argument, an interim order and a final judgment are different kinds of records. This page keeps external coverage apart from verified Signal 24 publications and does not infer an open-seat share from a quota headline.</p>
      </div>
    </section>
    <section className="signal-container mt-12 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/20 py-5">
        <div><p className="signal-kicker text-accent">01 / Signal 24 records</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">Verified archive entries</h2></div>
        <Link href="/archive" className="signal-kicker signal-rule-link">Search all records <ArrowUpRight size={13} className="ml-1 inline" /></Link>
      </div>
      {isLoading ? <div className="py-8"><LoadingBlock label="Loading verified topic records…" /></div> :
        isError ? <div className="py-8"><ErrorState message="Topic records could not be loaded." onRetry={() => void refetch()} /></div> :
          stories.length ? <div className="border-t border-foreground/20">{stories.map((story) => <StoryCard key={story.id} story={story} compact />)}</div> :
            <div className="signal-editorial-section"><p className="signal-kicker text-accent">No verified Signal 24 record in this topic</p><p className="mt-3 max-w-2xl font-display text-2xl leading-tight">External coverage is not a substitute for a source-linked, verified publication. The current record gap remains visible.</p></div>}
    </section>
    <section className="signal-container mt-8 pb-12 sm:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/20 py-5">
        <div><p className="signal-kicker text-accent">02 / External leads</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">What to read next</h2></div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Each link is attributed to its publisher and remains an external lead, not Signal 24 reporting.</p>
      </div>
      <div className="grid gap-x-8 sm:grid-cols-2">{leads.map((source) => <article key={source.href} className="story-record-row">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="signal-tag signal-tag--amber">External lead / {source.lane}</span><time className="signal-kicker text-muted-foreground" dateTime={source.date}>{formatDate(source.date)}</time></div>
        <div><h3 className="font-display text-2xl leading-tight">{source.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{source.summary}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-foreground/15 pt-3"><span className="signal-kicker text-muted-foreground">{source.publisher}</span><a href={source.href} target="_blank" rel="noopener noreferrer" className="signal-kicker text-accent hover:underline">Open source <ExternalLink size={12} className="ml-1 inline" /></a></div></div>
      </article>)}</div>
    </section>
    <footer className="signal-site-footer"><div className="signal-container flex flex-wrap justify-between gap-4 py-7"><Link href="/" className="signal-kicker signal-link">Current edition</Link><Link href="/timeline" className="signal-kicker signal-link">Open the timeline <ArrowUpRight size={13} className="ml-1 inline" /></Link></div></footer>
  </main>;
}
function ArchivePage() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('');
  const [state, setState] = useState('');
  const [year, setYear] = useState('');
  const [organization, setOrganization] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const params = useMemo(() => ({ ...(query ? { q: query } : {}), ...(topic ? { topic: topic as Topic } : {}), ...(kind ? { kind: kind as StoryKind } : {}), ...(state ? { state } : {}), limit: 100 }), [kind, query, state, topic]);
  const { data, isLoading, isError, refetch } = useGetArchive(params, { query: { queryKey: getGetArchiveQueryKey(params) } });
  useSeo({
    title: 'The archive — Signal Hub',
    description: 'Search published reporting, court and policy developments, historical documents, research notes and state context.',
    canonicalPath: '/archive',
    structuredData: { '@context': 'https://schema.org', '@graph': [organizationSchema, { '@type': 'CollectionPage', name: 'Signal Hub archive', description: 'Published reservation reporting and research.' }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Signal Hub', item: '/' }, { '@type': 'ListItem', position: 2, name: 'Archive', item: '/archive' }] }] },
  });
  const clear = () => { setQuery(''); setTopic(''); setKind(''); setState(''); setYear(''); setOrganization(''); };
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Indexing records and sources…" /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="The search index could not be reached." onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState /></div></div>;
  const years = Array.from(new Set(data.stories.map((story) => story.publishedOn?.slice(0, 4)).filter(Boolean))).sort().reverse() as string[];
  const organizations = Array.from(new Set(data.stories.map((story) => story.source).filter(Boolean))).sort();
  const records = data.stories.filter((story) =>
    (!year || story.publishedOn?.startsWith(year)) &&
    (!organization || story.source === organization),
  );
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><div className="max-w-4xl"><p className="signal-kicker text-accent">The Signal 24 / archive</p><h1 className="mt-4 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">A record you<br /><em className="font-normal text-accent">can return to.</em></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">Search reporting, court and policy developments, historical documents, research notes and state context. The archive is a work in progress, built to make difficult conversations easier to verify and remember.</p></div></section>
    <section className="signal-container archive-grid mt-16 border-y border-foreground/20 py-6 sm:mt-24"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><SlidersHorizontal size={16} className="text-accent" /><p className="signal-kicker">Filter the archive</p></div><button type="button" onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground md:hidden" data-testid="button-toggle-filters">{filtersOpen ? 'Hide' : 'Show'} filters <ChevronDown size={14} /></button></div><div className={`${filtersOpen ? 'grid' : 'hidden'} mt-5 gap-3 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_auto]`}><label className="flex items-center gap-2 border border-foreground/20 bg-card px-3 py-2"><Search size={15} className="shrink-0 text-accent" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, source or place" className="w-full bg-transparent text-sm outline-none" data-testid="input-archive-search" /></label><SelectFilter label="Topic" value={topic} options={data.topics.length ? data.topics : TOPICS} onChange={setTopic} testId="select-archive-topic" /><SelectFilter label="Record type" value={kind} options={data.kinds.length ? data.kinds : KINDS} onChange={setKind} testId="select-archive-kind" /><SelectFilter label="State" value={state} options={data.states.length ? ['All states', ...data.states] : INDIA_STATES} onChange={(value) => setState(value === 'All states' ? '' : value)} testId="select-archive-state" /><SelectFilter label="Organization / source" value={organization} options={organizations} onChange={setOrganization} testId="select-archive-organization" allLabel="All sources" /><SelectFilter label="Published year" value={year} options={years} onChange={setYear} testId="select-archive-year" /><button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-filters">Clear</button></div><div className="mt-5 flex items-center justify-between border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{records.length} {records.length === 1 ? 'record' : 'records'} / source labels shown</p>{(query || topic || kind || state || year || organization) && <p className="signal-kicker text-accent">Filtered view</p>}</div></section>
    <section className="signal-container py-12 sm:py-16">{records.length === 0 ? <EmptyState title="No record found here." text="Clear one of the filters and try again. The archive grows with each edition." /> : <div className="border-t border-foreground/20">{records.map((story) => <StoryCard key={story.id} story={story} />)}</div>}</section><footer className="signal-container flex justify-between gap-6 border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Current edition</Link><p className="signal-kicker text-muted-foreground">Built for careful reading</p></footer>
  </main>;
}
function PolicySourceCard({ source }: { source: PolicySource }) {
  return <article className="border border-foreground/15 bg-card p-5 sm:p-6" data-testid={`card-policy-source-${source.id}`}>
    <div className="flex items-start justify-between gap-4">
      <span className={`signal-tag ${source.isPrimary ? 'signal-tag--blue' : 'signal-tag--amber'}`}>{source.isPrimary ? 'Primary source' : 'Supporting source'}</span>
      <span className="signal-kicker text-muted-foreground">{source.sourceType}</span>
    </div>
    <h3 className="mt-4 font-display text-2xl leading-tight">{source.title}</h3>
    <p className="mt-3 text-sm text-muted-foreground">{source.publisher}</p>
    <dl className="mt-5 grid gap-2 border-t border-foreground/15 pt-4 text-xs">
      <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">Published</dt><dd data-testid={`text-policy-source-published-${source.id}`}>{formatDate(source.publishedOn)}</dd></div>
      <div className="flex justify-between gap-4"><dt className="signal-kicker text-muted-foreground">Retrieved</dt><dd data-testid={`text-policy-source-retrieved-${source.id}`}>{formatDate(source.retrievedOn)}</dd></div>
    </dl>
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid={`link-policy-source-${source.id}`}>Open source <ExternalLink size={13} /></a>
  </article>;
}

function PoliciesPage() {
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
  const { data, isLoading, isError, refetch } = useGetPolicies(params, { query: { queryKey: getGetPoliciesQueryKey(params) } });
  useSeo({
    title: 'Policy ledger — Signal Hub',
    description: 'Search source-linked records of reservation policy changes, with frameworks, legal basis, court status and first-class sources.',
    canonicalPath: '/policies',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationSchema,
        { '@type': 'CollectionPage', name: 'Signal Hub policy ledger', description: 'Source-linked records of reservation policy changes.', url: '/policies' },
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Signal Hub', item: '/' }, { '@type': 'ListItem', position: 2, name: 'Policy ledger', item: '/policies' }] },
      ],
    },
  });
  const clear = () => { setQuery(''); setState(''); setSector(''); setStatus(''); setEffectiveFrom(''); setEffectiveTo(''); };
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Indexing policy records and sources…" /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="The policy ledger could not be reached." onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState title="The policy ledger is not available." /></div></div>;
  const activeFilters = Boolean(query || state || sector || status || effectiveFrom || effectiveTo);
  return <main className="signal-page"><Header />
    <section className="signal-container pt-14 sm:pt-24">
      <div className="max-w-4xl"><p className="signal-kicker text-accent">Signal Hub / policy ledger</p><h1 className="mt-4 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">What changed,<br /><em className="font-normal text-accent">and when?</em></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">A permanent, source-linked record of reservation policy changes. Search by subject, state or sector, then follow the framework, authority and documents behind each entry.</p></div>
    </section>
    <section className="signal-container archive-grid mt-16 border-y border-foreground/20 py-6 sm:mt-24" aria-label="Filter policy ledger">
      <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><SlidersHorizontal size={16} className="text-accent" /><p className="signal-kicker">Filter the ledger</p></div><button type="button" onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground md:hidden" data-testid="button-toggle-policy-filters">{filtersOpen ? 'Hide' : 'Show'} filters <ChevronDown size={14} /></button></div>
      <div className={`${filtersOpen ? 'grid' : 'hidden'} mt-5 gap-3 md:grid md:grid-cols-[1.7fr_1fr_1fr_1fr_1fr_1fr_auto]`}>
        <label className="flex items-center gap-2 border border-foreground/20 bg-card px-3 py-2"><Search size={15} className="shrink-0 text-accent" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, authority or framework" className="w-full bg-transparent text-sm outline-none" data-testid="input-policy-search" /></label>
        <SelectFilter label="State" value={state} options={data.states} onChange={setState} testId="select-policy-state" />
        <SelectFilter label="Sector" value={sector} options={data.sectors} onChange={setSector} testId="select-policy-sector" />
        <SelectFilter label="Status" value={status} options={data.statuses} onChange={setStatus} testId="select-policy-status" />
        <label className="border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">Effective from</span><input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="input-policy-effective-from" /></label>
        <label className="border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">Effective to</span><input type="date" value={effectiveTo} onChange={(event) => setEffectiveTo(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="input-policy-effective-to" /></label>
        <button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-policy-filters">Clear</button>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground" data-testid="text-policy-result-count">{data.records.length} {data.records.length === 1 ? 'record' : 'records'} / source-linked</p>{activeFilters && <p className="signal-kicker text-accent">Filtered view</p>}</div>
    </section>
    <section className="signal-container py-12 sm:py-16">
      {data.records.length === 0 ? <EmptyState title="No policy record found here." text="Clear one of the filters and try again. New entries appear only when their source record is ready." /> : <div className="border-t border-foreground/20">{data.records.map((record) => <Link href={record.canonicalPath} key={record.id} className="group grid gap-5 border-b border-foreground/20 py-7 md:grid-cols-[.85fr_1.4fr_.8fr] md:gap-10" data-testid={`link-policy-record-${record.id}`}><div><p className="signal-kicker text-accent">{record.state ?? 'National'} / {record.sector}</p><p className="mt-2 signal-kicker text-muted-foreground">{record.status}</p></div><div><h2 className="font-display text-3xl leading-tight tracking-[-.025em] group-hover:text-accent sm:text-4xl">{record.title}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{record.summary}</p></div><div className="md:border-l md:border-foreground/15 md:pl-6"><p className="signal-kicker text-muted-foreground">Effective date</p><p className="mt-2 font-display text-xl" data-testid={`text-policy-effective-date-${record.id}`}>{formatDate(record.effectiveDate)}</p><p className="mt-4 signal-kicker text-accent">Authority</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{record.authority}</p></div></Link>)}</div>}
    </section>
    <footer className="signal-container flex justify-between gap-6 border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2" data-testid="link-policy-ledger-home"><ArrowLeft size={13} /> Current edition</Link><p className="signal-kicker text-muted-foreground">A durable record / not a feed</p></footer>
  </main>;
}

function PolicyDetail() {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug ?? '';
  const { data: record, isLoading, isError, refetch } = useGetPolicy(slug, { query: { enabled: Boolean(slug), queryKey: getGetPolicyQueryKey(slug) } });
  const structuredData = useMemo(() => {
    if (!record) return null;
    const url = absoluteSiteUrl(record.canonicalPath);
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', '@id': `${url}#policy`, headline: record.title, description: record.summary, datePublished: record.publishedOn, dateModified: record.publishedOn, mainEntityOfPage: url, author: { '@type': 'Organization', name: 'Signal Hub' }, publisher: { ...organizationSchema, url: absoluteSiteUrl('/') } },
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Signal Hub', item: absoluteSiteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Policy ledger', item: absoluteSiteUrl('/policies') }, { '@type': 'ListItem', position: 3, name: record.title, item: url }] },
        organizationSchema,
      ],
    };
  }, [record]);
  useSeo({
    title: record ? `${record.title} — Signal Hub` : 'Policy record — Signal Hub',
    description: record?.summary ?? 'A source-linked policy record from Signal Hub.',
    canonicalPath: record?.canonicalPath,
    robots: record ? 'index, follow' : 'noindex, follow',
    type: record ? 'article' : 'website',
    structuredData,
  });
  if (!slug) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That policy address is not valid." /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Opening the permanent policy record…" /></div>;
  if (isError || !record) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="This policy record may have moved or is not published yet." onRetry={() => void refetch()} /></div></div>;
  return <main className="signal-page"><Header />
    <article className="signal-container py-12 sm:py-20">
      <Link href="/policies" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground" data-testid="link-back-policy-ledger"><ArrowLeft size={13} /> Back to the policy ledger</Link>
      <header className="mt-12 border-b border-foreground/20 pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 signal-kicker text-accent"><span>{record.state ?? 'National'}</span><span>{record.sector}</span><span className="text-muted-foreground">{record.status}</span></div>
        <h1 className="mt-5 max-w-5xl font-display text-5xl leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-8xl" data-testid="heading-policy">{record.title}</h1>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl" data-testid="text-policy-summary">{record.summary}</p>
        <div className="mt-8 grid gap-4 border-l-2 border-accent pl-4 sm:grid-cols-3 sm:gap-8 sm:pl-5">
          <div><p className="signal-kicker text-accent">Effective date</p><p className="mt-2 font-display text-2xl" data-testid="text-policy-detail-effective-date">{formatDate(record.effectiveDate)}</p></div>
          <div><p className="signal-kicker text-accent">Published</p><p className="mt-2 font-display text-2xl">{formatDate(record.publishedOn)}</p></div>
          <div><p className="signal-kicker text-accent">Permanent path</p><p className="mt-2 break-all font-mono-signal text-xs text-muted-foreground">{record.canonicalPath}</p></div>
        </div>
      </header>
      <section className="grid gap-8 border-b border-foreground/20 py-10 sm:py-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div><p className="signal-kicker text-accent">01 / The policy delta</p><h2 className="mt-3 font-display text-4xl leading-[.96]">The framework,<br /><em className="font-normal text-accent">before and after.</em></h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">The record keeps the earlier position visible so a change can be understood rather than merely announced.</p></div>
        <div className="grid gap-6 sm:grid-cols-2"><div className="border-t-2 border-foreground/25 pt-4"><p className="signal-kicker text-muted-foreground">Previous framework</p><p className="mt-4 font-display text-2xl leading-tight" data-testid="text-policy-previous-framework">{record.previousFramework}</p></div><div className="border-t-2 border-accent pt-4"><p className="signal-kicker text-accent">New framework</p><p className="mt-4 font-display text-2xl leading-tight" data-testid="text-policy-new-framework">{record.newFramework}</p></div></div>
      </section>
      <section className="grid gap-8 border-b border-foreground/20 py-10 sm:py-14 lg:grid-cols-3 lg:gap-8">
        <div><p className="signal-kicker text-accent">Authority</p><p className="mt-3 text-base leading-relaxed" data-testid="text-policy-authority">{record.authority}</p></div>
        <div><p className="signal-kicker text-accent">Legal basis</p><p className="mt-3 text-base leading-relaxed" data-testid="text-policy-legal-basis">{record.legalBasis}</p></div>
        <div><p className="signal-kicker text-accent">Court status</p><p className="mt-3 text-base leading-relaxed" data-testid="text-policy-court-status">{record.courtStatus}</p></div>
      </section>
      <section className="pt-10 sm:pt-14">
        <div className="flex flex-col justify-between gap-4 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">02 / First-class sources</p><h2 className="mt-3 font-display text-4xl leading-none">Read the documents.</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Publication and retrieval dates remain attached to every source so the record can be checked over time.</p></div>
        {record.sources.length === 0 ? <div className="pt-8"><EmptyState title="No sources are attached to this record." text="This policy record is not ready to carry a source claim." /></div> : <div className="grid gap-4 py-8 md:grid-cols-2">{record.sources.map((source) => <PolicySourceCard key={source.id} source={source} />)}</div>}
      </section>
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/20 pt-5"><p className="signal-kicker text-muted-foreground">End of policy record / {record.id}</p><Link href="/policies" className="inline-flex items-center gap-2 signal-kicker text-accent hover:underline" data-testid="link-policy-ledger-bottom">Return to the ledger <ArrowUpRight size={13} /></Link></footer>
    </article>
  </main>;
}

function SelectFilter({ label, value, options, onChange, testId, allLabel }: { label: string; value: string; options: string[]; onChange: (value: string) => void; testId: string; allLabel?: string }) {
  return <label className="relative border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-transparent pt-1 text-sm outline-none" data-testid={testId}><option value="">{allLabel ?? `All ${label.toLowerCase()}`}</option>{options.filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 bottom-3 text-muted-foreground" /></label>;
}

function ReadingProgress() {
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

/*
// hint: Logic changed on both sides. Requires understanding intent of each change.
function StoryDetail() {
  const params = useParams<{ id?: string; family?: string; slug?: string }>();
  const slugId = Number(params.slug?.match(/-(\d+)$/)?.[1]);
  const storyId = Number(params.id ?? slugId);
  const { data: story, isLoading, isError, refetch } = useGetStory(storyId, { query: { enabled: Number.isFinite(storyId), queryKey: getGetStoryQueryKey(storyId) } });
  const recordPath = story ? storyPath(story) : undefined;
  const structuredData = useMemo(() => {
    if (!story) return null;
    const url = absoluteSiteUrl(recordPath ?? '/');
    const recordSchema = story.indexable ? {
      '@type': story.kind === 'Article' ? 'NewsArticle' : 'Article',
      '@id': `${url}#record`,
      headline: story.title,
      description: story.dek,
      mainEntityOfPage: url,
      publisher: { ...organizationSchema, url: absoluteSiteUrl('/') },
    } : {
      '@type': 'WebPage',
      '@id': `${url}#record`,
      name: story.title,
      description: story.dek,
    };
    return {
      '@context': 'https://schema.org',
      '@graph': [
        recordSchema,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Signal Hub', item: absoluteSiteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Archive', item: absoluteSiteUrl('/archive') },
            { '@type': 'ListItem', position: 3, name: story.title, item: url },
          ],
        },
        { ...organizationSchema, url: absoluteSiteUrl('/') },
      ],
    };
  }, [recordPath, story]);
  useSeo({
    title: story ? `${story.title} — Signal Hub` : 'Record — Signal Hub',
    description: story?.dek ?? 'A source record from the Signal Hub reservation archive.',
    canonicalPath: story?.indexable ? recordPath : undefined,
    robots: story?.indexable ? 'index, follow' : 'noindex, follow',
    type: story?.indexable ? 'article' : 'website',
    structuredData,
  });
  if (!Number.isFinite(storyId)) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That record address is not valid." /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Opening the source record…" /></div>;
  if (isError || !story) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="This record may have moved or is not published yet." onRetry={() => void refetch()} /></div></div>;
  return <main className="signal-page">
    <Header />
    <ReadingProgress />
    <article className="signal-container py-12 sm:py-20">
      <Link href="/archive" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground" data-testid="link-back-archive"><ArrowLeft size={13} /> Back to the archive</Link>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <div>
          <p className="signal-kicker text-accent">{story.topic} / {story.kind}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-8xl" data-testid="heading-story">{story.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{story.dek}</p>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 signal-kicker text-muted-foreground">
            <span>Record date / as supplied · {formatDate(story.recordDate)}</span>
            <span>{story.read} min read</span>
            {story.state && <span>{story.state}</span>}
          </div>
        </div>
        <StoryArt story={story} />
      </div>
      <div id="record-evidence" className="mx-auto mt-12 article-reading-column"><SourceLine story={story} detail /></div>
      <div className="signal-container"><ArticleEvidenceSection storyId={story.id} /></div>
      {story.aiDisclosure && <div className="mx-auto mt-6 article-reading-column border-l-2 border-accent bg-accent/10 px-5 py-4"><p className="signal-kicker text-accent">AI-assisted drafting disclosure</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.aiDisclosure}</p></div>}
      {story.correctionNote && <div className="mx-auto mt-6 article-reading-column border border-accent/40 bg-accent/5 px-5 py-4"><p className="signal-kicker text-accent">Correction note</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.correctionNote}</p></div>}
      <div className="mx-auto mt-10 grid max-w-[910px] gap-10 lg:grid-cols-[720px_150px] lg:items-start">
        <div id="record-body" className="story-body article-reading-column text-[1.08rem] leading-[1.85] text-foreground/85">
          {story.body.split(/\n{2,}/).map((paragraph, index) => <p key={`${story.id}-${index}`} className={index === 0 ? 'first-letter:font-display first-letter:text-5xl first-letter:leading-[.8] first-letter:text-accent' : ''}>{paragraph}</p>)}
        </div>
        <aside className="article-rail hidden lg:block">
          <p className="signal-kicker text-accent">On this record</p>
          <a href="#record-body" className="mt-4 block signal-kicker text-muted-foreground hover:text-accent">Reading</a>
          <a href="#record-evidence" className="mt-3 block signal-kicker text-muted-foreground hover:text-accent">Evidence</a>
          <p className="mt-6 border-t border-foreground/15 pt-4 signal-kicker text-muted-foreground">Dates</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">The date above is attached to this archive record. A source publication date appears separately only when supplied.</p>
        </aside>
      </div>
      <div className="mx-auto mt-12 flex article-reading-column flex-wrap items-center justify-between gap-4 border-t border-foreground/20 pt-5">
        <p className="signal-kicker text-muted-foreground">End of record / {story.source}</p>
        <div className="flex flex-wrap items-center gap-4">
          {story.sourceUrl && <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 signal-kicker text-accent" data-testid="link-open-source-bottom">View source <ExternalLink size={13} /></a>}
          <Link href="/editorial-standards#corrections" className="signal-kicker text-muted-foreground hover:text-accent" data-testid="link-report-correction">Report a correction</Link>
        </div>
      </div>
    </article>
  </main>;
}
*/
function StoryDetail() {
  const params = useParams<{ id?: string; family?: string; slug?: string }>();
  const slugId = Number(params.slug?.match(/-(\d+)$/)?.[1]);
  const storyId = Number(params.id ?? slugId);
  const { data: story, isLoading, isError, refetch } = useGetStory(storyId, { query: { enabled: Number.isFinite(storyId), queryKey: getGetStoryQueryKey(storyId) } });
  const recordPath = story ? storyPath(story) : undefined;
  const structuredData = useMemo(() => {
    if (!story) return null;
    const url = absoluteSiteUrl(recordPath ?? '/');
    const recordSchema = story.indexable ? {
      '@type': story.kind === 'Article' ? 'NewsArticle' : 'Article',
      '@id': `${url}#record`,
      headline: story.title,
      description: story.dek,
      mainEntityOfPage: url,
      publisher: { ...organizationSchema, url: absoluteSiteUrl('/') },
    } : {
      '@type': 'WebPage',
      '@id': `${url}#record`,
      name: story.title,
      description: story.dek,
    };
    return {
      '@context': 'https://schema.org',
      '@graph': [
        recordSchema,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Signal Hub', item: absoluteSiteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Archive', item: absoluteSiteUrl('/archive') },
            { '@type': 'ListItem', position: 3, name: story.title, item: url },
          ],
        },
        { ...organizationSchema, url: absoluteSiteUrl('/') },
      ],
    };
  }, [recordPath, story]);
  useSeo({
    title: story ? `${story.title} — Signal Hub` : 'Record — Signal Hub',
    description: story?.dek ?? 'A source record from the Signal Hub reservation archive.',
    canonicalPath: story?.indexable ? recordPath : undefined,
    robots: story?.indexable ? 'index, follow' : 'noindex, follow',
    type: story?.indexable ? 'article' : 'website',
    structuredData,
  });
  if (!Number.isFinite(storyId)) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That record address is not valid." /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Opening the source record…" /></div>;
  if (isError || !story) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="This record may have moved or is not published yet." onRetry={() => void refetch()} /></div></div>;
  return <main className="signal-page">
    <Header />
    <ReadingProgress />
    <article className="signal-container py-12 sm:py-20">
      <Link href="/archive" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground" data-testid="link-back-archive"><ArrowLeft size={13} /> Back to the archive</Link>
      <header className="mt-10 max-w-5xl border-b border-foreground/20 pb-8 sm:mt-14 sm:pb-10">
        <p className="signal-kicker text-accent">{story.topic} / {story.kind}</p>
        <h1 className="mt-4 font-display text-5xl leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-8xl" data-testid="heading-story">{story.title}</h1>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{story.dek}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          <span className="signal-tag">Record date / as supplied · {formatDate(story.recordDate)}</span>
          {story.state && <span className="signal-tag">{story.state}</span>}
          <span className={`signal-tag ${story.verificationStatus === 'verified' ? 'signal-tag--blue' : 'signal-tag--amber'}`}>Verification / {verificationLabel(story.verificationStatus)}</span>
          <span className="signal-tag">{story.read} min read</span>
        </div>
      </header>
      <div id="record-evidence" className="mx-auto mt-8 article-reading-column"><SourceLine story={story} detail /></div>
      <div className="signal-container"><ArticleEvidenceSection storyId={story.id} /></div>
      {story.aiDisclosure && <div className="signal-note mt-6 max-w-3xl px-5 py-4"><p className="signal-kicker text-accent">AI-assisted drafting disclosure</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.aiDisclosure}</p></div>}
      {story.correctionNote && <div className="signal-callout mt-6 max-w-3xl px-5 py-4"><p className="signal-kicker text-accent">Correction note</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.correctionNote}</p></div>}
      <div className="mx-auto mt-10 grid max-w-[910px] gap-10 lg:grid-cols-[720px_150px] lg:items-start">
        <div id="record-body" className="story-body article-reading-column text-[1.08rem] leading-[1.85] text-foreground/85" data-testid="text-story-body">
          {story.body.split(/\n{2,}/).map((paragraph, index) => <p key={`${story.id}-${index}`} className={index === 0 ? 'first-letter:font-display first-letter:text-5xl first-letter:leading-[.8] first-letter:text-accent' : ''}>{paragraph}</p>)}
        </div>
        <aside className="article-rail hidden lg:block">
          <p className="signal-kicker text-accent">On this record</p>
          <a href="#record-body" className="mt-4 block signal-kicker text-muted-foreground hover:text-accent">Reading</a>
          <a href="#record-evidence" className="mt-3 block signal-kicker text-muted-foreground hover:text-accent">Evidence</a>
          <p className="mt-6 border-t border-foreground/15 pt-4 signal-kicker text-muted-foreground">Dates</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">The date above is attached to this archive record. A source publication date appears separately only when supplied.</p>
        </aside>
      </div>
      <div className="mx-auto mt-12 flex article-reading-column flex-wrap items-center justify-between gap-4 border-t border-foreground/20 pt-5">
        <p className="signal-kicker text-muted-foreground">End of record / {story.source}</p>
        <div className="flex flex-wrap items-center gap-4">
          {story.sourceUrl && <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 signal-kicker text-accent" data-testid="link-open-source-bottom">View source <ExternalLink size={13} /></a>}
          <Link href="/editorial-standards#corrections" className="signal-kicker text-muted-foreground hover:text-accent" data-testid="link-report-correction">Report a correction</Link>
        </div>
      </div>
    </article>
  </main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="signal-kicker text-muted-foreground">{label}</span>{children}</label>;
}

type StoryDraft = StoryInput & { id?: number };
const emptyStory = (issueId: number): StoryDraft => ({ issueId, topic: 'Latest', kind: 'Article', state: '', source: '', sourceUrl: '', publishedOn: new Date().toISOString().slice(0, 10), eyebrow: '', title: '', dek: '', body: '', time: '6 min', read: 6, tone: 'Latest', number: null, sortOrder: 1 });

function Editor() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useGetCurrentIssue();
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
  useEffect(() => { if (data && !hydrated.current) { hydrated.current = true; setWorkingIssue(data.issue); setStories(data.stories); setIssueForm({ issueDate: data.issue.issueDate, issueNumber: data.issue.issueNumber, title: data.issue.title, intro: data.issue.intro }); } }, [data]);
  useSeo({
    title: 'Editorial desk — Signal Hub',
    description: 'Private editorial workspace for preparing source-aware Signal Hub records.',
    robots: 'noindex, nofollow',
  });
  if (isLoading) return <div className="signal-page"><Header editor /><LoadingBlock label="Loading the editorial desk…" /></div>;
  if (isError) return <div className="signal-page"><Header editor /><div className="py-20"><ErrorState message="The editorial workspace could not be loaded." onRetry={() => void refetch()} /></div></div>;
  const updateIssue = (field: keyof IssueInput, value: string) => setIssueForm((current) => ({ ...current, [field]: field === 'issueNumber' ? Number(value) : value }));
  function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(null);
    createIssueMutation.mutate({ data: issueForm }, { onSuccess: (issue) => { setWorkingIssue(issue); setStories([]); setNotice({ type: 'success', text: `Issue ${issue.issueNumber} created as a draft.` }); } , onError: () => setNotice({ type: 'error', text: 'The issue could not be created. Check the fields and try again.' }) });
  }
  function saveStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!storyForm) return; setNotice(null);
    const onSuccess = (saved: Story) => { setStories((current) => storyForm.id ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); setStoryForm(null); setNotice({ type: 'success', text: storyForm.id ? 'Record updated.' : 'Record added to the issue.' }); void queryClient.invalidateQueries({ queryKey: getGetCurrentIssueQueryKey() }); };
    if (storyForm.id) updateStoryMutation.mutate({ storyId: storyForm.id, data: storyForm }, { onSuccess, onError: () => setNotice({ type: 'error', text: 'The record could not be updated.' }) });
    else createStoryMutation.mutate({ data: storyForm }, { onSuccess, onError: () => setNotice({ type: 'error', text: 'The record could not be added.' }) });
  }
  function publish() {
    if (!workingIssue) return;
    publishMutation.mutate({ issueId: workingIssue.id }, { onSuccess: (issue) => { setWorkingIssue(issue); setNotice({ type: 'success', text: `Issue ${issue.issueNumber} is now published.` }); void queryClient.invalidateQueries({ queryKey: getGetCurrentIssueQueryKey() }); }, onError: () => setNotice({ type: 'error', text: 'Publishing did not complete.' }) });
  }
  function startDraft(update: LiveUpdate) {
    if (!workingIssue) {
      setNotice({ type: 'error', text: 'Create an issue before importing a monitoring lead.' });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setStoryForm({
      ...emptyStory(workingIssue.id),
      topic: update.topic,
      source: update.source,
      sourceUrl: update.sourceUrl,
      publishedOn: today,
      sourcePublishedOn: update.publishedAt?.slice(0, 10) ?? null,
      sourceRetrievedOn: today,
      eyebrow: 'Monitoring lead / requires review',
      title: update.headline,
      dek: update.summary,
      body: `This is an editorial draft based on a monitored external source.\n\nThe desk must independently verify the source, establish what is known and unknown, and replace this note with reported context before publication.\n\nSource: ${update.sourceUrl}`,
      workflowStatus: 'draft',
      verificationStatus: 'source-linked',
      verificationNotes: `Imported from the live source monitor on ${today}. Independent verification and editorial review are required.`,
      revisionNote: 'Imported from live source monitor',
    });
    setNotice({ type: 'success', text: 'Monitoring lead loaded as a draft. Verify it before moving it to review.' });
    window.setTimeout(() => document.querySelector('[data-testid="input-story-title"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }
  const setStory = (field: keyof StoryInput, value: string) => setStoryForm((current) => current ? { ...current, [field]: ['read', 'sortOrder', 'number'].includes(field) ? (value === '' ? null : Number(value)) : value } : current);
  return <main className="signal-page"><Header editor /><section className="signal-container pt-12 sm:pt-20"><div className="flex flex-col justify-between gap-7 border-b border-foreground/20 pb-8 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">Private workspace / editorial desk</p><h1 className="mt-3 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Make the<br /><em className="font-normal text-accent">record.</em></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">Create an issue, add source-aware records, and publish a considered edition. This desk keeps the expanded metadata visible because context is part of the work.</p></div><div className="flex items-center gap-2 signal-kicker text-muted-foreground"><Pencil size={14} className="text-accent" /> {workingIssue?.status ?? 'draft'} / {workingIssue ? `Issue ${workingIssue.issueNumber}` : 'No issue'}</div></div>{notice && <div className={`mt-6 flex items-center gap-3 border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-secondary bg-secondary/15' : 'border-destructive bg-destructive/10 text-destructive'}`} role="status" data-testid="status-editor-notice"><Check size={16} /> {notice.text}</div>}</section>
    <LiveDesk onSelect={startDraft} />
    <section className="signal-container grid gap-8 py-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-12"><div className="space-y-7"><div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="signal-kicker text-accent">01 / Issue</p><h2 className="mt-2 font-display text-3xl">Edition details</h2></div>{workingIssue && <span className="signal-kicker text-muted-foreground">{workingIssue.status}</span>}</div><form onSubmit={createIssue} className="mt-6 grid gap-4"><Field label="Issue date"><input required type="date" value={issueForm.issueDate} onChange={(event) => updateIssue('issueDate', event.target.value)} className="editor-input" data-testid="input-issue-date" /></Field><Field label="Issue number"><input required type="number" min="1" value={issueForm.issueNumber} onChange={(event) => updateIssue('issueNumber', event.target.value)} className="editor-input" data-testid="input-issue-number" /></Field><Field label="Edition title"><input required value={issueForm.title} onChange={(event) => updateIssue('title', event.target.value)} className="editor-input" placeholder="A clear title for this edition" data-testid="input-issue-title" /></Field><Field label="Introduction"><textarea required value={issueForm.intro} onChange={(event) => updateIssue('intro', event.target.value)} className="editor-input min-h-28 resize-y" placeholder="What should a reader understand before they begin?" data-testid="input-issue-intro" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createIssueMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-create-issue">{createIssueMutation.isPending ? 'Creating…' : 'Create new issue'} <Plus size={14} /></button>{workingIssue && <button type="button" onClick={publish} disabled={publishMutation.isPending || workingIssue.status === 'published'} className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-3 signal-kicker text-accent disabled:opacity-40" data-testid="button-publish-issue">{publishMutation.isPending ? 'Publishing…' : workingIssue.status === 'published' ? 'Published' : 'Publish issue'} <Send size={14} /></button>}</div></form></div><div className="border-l-2 border-accent px-5 py-2"><p className="signal-kicker text-accent">Desk note</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A source label is not decoration. It tells readers what kind of record they are reading, and what claims it can responsibly carry.</p></div></div>
      <div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 border-b border-foreground/15 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">02 / Records</p><h2 className="mt-2 font-display text-3xl">Build the issue</h2></div><button type="button" disabled={!workingIssue} onClick={() => workingIssue && setStoryForm(emptyStory(workingIssue.id))} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-record"><Plus size={14} /> Add record</button></div>{!workingIssue ? <div className="py-16"><EmptyState title="Create an issue first." text="The record form will appear here once an issue exists." /></div> : storyForm ? <form onSubmit={saveStory} className="mt-6 grid gap-4"><div className="flex items-center justify-between"><p className="font-display text-2xl">{storyForm.id ? 'Edit record' : 'New record'}</p><button type="button" onClick={() => setStoryForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close record form" data-testid="button-close-record-form"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Topic"><select value={storyForm.topic} onChange={(event) => setStory('topic', event.target.value)} className="editor-input" data-testid="select-story-topic">{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Record type"><select value={storyForm.kind} onChange={(event) => setStory('kind', event.target.value)} className="editor-input" data-testid="select-story-kind">{KINDS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="State / territory"><input value={storyForm.state ?? ''} onChange={(event) => setStory('state', event.target.value)} className="editor-input" placeholder="Leave blank if national" data-testid="input-story-state" /></Field><Field label="Published on"><input type="date" value={storyForm.publishedOn ?? ''} onChange={(event) => setStory('publishedOn', event.target.value)} className="editor-input" data-testid="input-story-date" /></Field><Field label="Source"><input required value={storyForm.source} onChange={(event) => setStory('source', event.target.value)} className="editor-input" placeholder="Court, publication, institution or archive" data-testid="input-story-source" /></Field><Field label="Source URL"><input type="url" value={storyForm.sourceUrl ?? ''} onChange={(event) => setStory('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-story-source-url" /></Field><Field label="Eyebrow"><input value={storyForm.eyebrow} onChange={(event) => setStory('eyebrow', event.target.value)} className="editor-input" placeholder="What kind of moment is this?" data-testid="input-story-eyebrow" /></Field><Field label="Visual tone"><input value={storyForm.tone} onChange={(event) => setStory('tone', event.target.value)} className="editor-input" placeholder="Latest, history, data…" data-testid="input-story-tone" /></Field><Field label="Reading time"><input value={storyForm.time} onChange={(event) => setStory('time', event.target.value)} className="editor-input" placeholder="8 min" data-testid="input-story-time" /></Field><Field label="Minutes"><input type="number" min="1" value={storyForm.read} onChange={(event) => setStory('read', event.target.value)} className="editor-input" data-testid="input-story-read" /></Field><Field label="Story number"><input type="number" value={storyForm.number ?? ''} onChange={(event) => setStory('number', event.target.value)} className="editor-input" data-testid="input-story-number" /></Field><Field label="Sort order"><input type="number" min="1" value={storyForm.sortOrder} onChange={(event) => setStory('sortOrder', event.target.value)} className="editor-input" data-testid="input-story-sort-order" /></Field></div><Field label="Title"><input required value={storyForm.title} onChange={(event) => setStory('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-title" /></Field><Field label="Dek"><textarea required value={storyForm.dek} onChange={(event) => setStory('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-dek" /></Field><Field label="Body"><textarea required value={storyForm.body} onChange={(event) => setStory('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="Separate paragraphs with a blank line." data-testid="input-story-body" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createStoryMutation.isPending || updateStoryMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-record">{createStoryMutation.isPending || updateStoryMutation.isPending ? 'Saving…' : storyForm.id ? 'Save changes' : 'Add to issue'}</button><button type="button" onClick={() => setStoryForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-record">Cancel</button></div></form> : <div className="mt-6">{stories.length === 0 ? <EmptyState title="No records in this issue." text="Add the first source-aware record to begin shaping the edition." /> : <div className="divide-y divide-foreground/15">{stories.map((story) => <div key={story.id} className="flex items-start justify-between gap-4 py-4" data-testid={`row-editor-story-${story.id}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><span className="rounded-full border border-foreground/20 px-2 py-1 signal-kicker text-[9px]">{story.workflowStatus}</span><span className="signal-kicker text-muted-foreground">{story.verificationStatus}</span></div><h3 className="mt-1 truncate font-display text-2xl">{story.title}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{story.source} · {formatDate(story.publishedOn)}{story.reviewedAt ? ` · reviewed ${formatDate(story.reviewedAt)}` : ' · review pending'}</p></div><button type="button" onClick={() => setStoryForm({ ...story, workflowStatus: story.workflowStatus === 'published' ? 'draft' : story.workflowStatus, revisionNote: '' })} className="inline-flex shrink-0 items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-story-${story.id}`}><Pencil size={13} /> Edit</button></div>)}</div>}</div>}</div></section><DecisionImpactDeskPanel /><footer className="signal-container flex justify-between border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Leave the desk</Link><span className="signal-kicker text-muted-foreground">Source first / always</span></footer></main>;
}

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
  useEffect(() => { document.title = 'Editorial desk — Signal Hub'; }, []);

  if (isLoading) return <div className="signal-page"><Header editor /><LoadingBlock label="Loading the editorial desk…" /></div>;
  if (isError) return <div className="signal-page"><Header editor /><div className="py-20"><ErrorState message="The editorial workspace could not be loaded." onRetry={() => void refetch()} /></div></div>;

  const updateIssue = (field: keyof IssueInput, value: string) => setIssueForm((current) => ({ ...current, [field]: field === 'issueNumber' ? Number(value) : value }));
  const setStory = (field: keyof StoryInput, value: string) => setStoryForm((current) => current ? { ...current, [field]: ['read', 'sortOrder', 'number'].includes(field) ? (value === '' ? null : Number(value)) : value } : current);

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
      <div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 border-b border-foreground/15 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">02 / Records</p><h2 className="mt-2 font-display text-3xl">Build the issue</h2></div><button type="button" disabled={!workingIssue} onClick={() => workingIssue && setStoryForm(emptyStory(workingIssue.id))} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-record"><Plus size={14} /> Add record</button></div>{!workingIssue ? <div className="py-16"><EmptyState title="Create an issue first." text="The record form will appear here once an issue exists." /></div> : storyForm ? <form onSubmit={saveStory} className="mt-6 grid gap-4"><div className="flex items-center justify-between"><p className="font-display text-2xl">{storyForm.id ? 'Edit record' : 'New record'}</p><button type="button" onClick={() => setStoryForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close record form" data-testid="button-close-record-form"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Workflow state"><select value={storyForm.workflowStatus ?? 'draft'} onChange={(event) => setStory('workflowStatus', event.target.value)} className="editor-input" data-testid="select-story-workflow">{WORKFLOW_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Verification state"><select value={storyForm.verificationStatus ?? 'unverified'} onChange={(event) => setStory('verificationStatus', event.target.value)} className="editor-input" data-testid="select-story-verification">{VERIFICATION_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Topic"><select value={storyForm.topic} onChange={(event) => setStory('topic', event.target.value)} className="editor-input" data-testid="select-story-topic">{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Record type"><select value={storyForm.kind} onChange={(event) => setStory('kind', event.target.value)} className="editor-input" data-testid="select-story-kind">{KINDS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="State / territory"><input value={storyForm.state ?? ''} onChange={(event) => setStory('state', event.target.value)} className="editor-input" placeholder="Leave blank if national" data-testid="input-story-state" /></Field><Field label="Published on"><input type="date" value={storyForm.publishedOn ?? ''} onChange={(event) => setStory('publishedOn', event.target.value)} className="editor-input" data-testid="input-story-date" /></Field><Field label="Source"><input required value={storyForm.source} onChange={(event) => setStory('source', event.target.value)} className="editor-input" placeholder="Court, publication, institution or archive" data-testid="input-story-source" /></Field><Field label="Source URL"><input type="url" value={storyForm.sourceUrl ?? ''} onChange={(event) => setStory('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-story-source-url" /></Field><Field label="Source published on"><input type="date" value={storyForm.sourcePublishedOn ?? ''} onChange={(event) => setStory('sourcePublishedOn', event.target.value)} className="editor-input" data-testid="input-source-published-on" /></Field><Field label="Source retrieved on"><input type="date" value={storyForm.sourceRetrievedOn ?? ''} onChange={(event) => setStory('sourceRetrievedOn', event.target.value)} className="editor-input" data-testid="input-source-retrieved-on" /></Field><Field label="Scheduled for"><input type="datetime-local" value={localDateTimeValue(storyForm.scheduledFor)} onChange={(event) => setStory('scheduledFor', event.target.value ? new Date(event.target.value).toISOString() : '')} className="editor-input" data-testid="input-story-scheduled-for" /></Field><Field label="Eyebrow"><input value={storyForm.eyebrow} onChange={(event) => setStory('eyebrow', event.target.value)} className="editor-input" placeholder="What kind of moment is this?" data-testid="input-story-eyebrow" /></Field><Field label="Visual tone"><input value={storyForm.tone} onChange={(event) => setStory('tone', event.target.value)} className="editor-input" placeholder="Latest, history, data…" data-testid="input-story-tone" /></Field><Field label="Reading time"><input value={storyForm.time} onChange={(event) => setStory('time', event.target.value)} className="editor-input" placeholder="8 min" data-testid="input-story-time" /></Field><Field label="Minutes"><input type="number" min="1" value={storyForm.read} onChange={(event) => setStory('read', event.target.value)} className="editor-input" data-testid="input-story-read" /></Field><Field label="Story number"><input type="number" value={storyForm.number ?? ''} onChange={(event) => setStory('number', event.target.value)} className="editor-input" data-testid="input-story-number" /></Field><Field label="Sort order"><input type="number" min="1" value={storyForm.sortOrder} onChange={(event) => setStory('sortOrder', event.target.value)} className="editor-input" data-testid="input-story-sort-order" /></Field></div><Field label="Verification notes"><textarea value={storyForm.verificationNotes ?? ''} onChange={(event) => setStory('verificationNotes', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="What was checked, against which source, and when?" data-testid="input-verification-notes" /></Field><Field label="AI-assisted drafting disclosure"><textarea value={storyForm.aiDisclosure ?? ''} onChange={(event) => setStory('aiDisclosure', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="Leave blank when no AI assistance was used." data-testid="input-ai-disclosure" /></Field><Field label="Correction note"><textarea value={storyForm.correctionNote ?? ''} onChange={(event) => setStory('correctionNote', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="Visible note for a correction or clarification." data-testid="input-correction-note" /></Field><Field label="Revision note"><input value={storyForm.revisionNote ?? ''} onChange={(event) => setStory('revisionNote', event.target.value)} className="editor-input" placeholder="What changed in this revision?" data-testid="input-revision-note" /></Field><Field label="Title"><input required value={storyForm.title} onChange={(event) => setStory('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-title" /></Field><Field label="Dek"><textarea required value={storyForm.dek} onChange={(event) => setStory('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-dek" /></Field><Field label="Body"><textarea required value={storyForm.body} onChange={(event) => setStory('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="Separate paragraphs with a blank line." data-testid="input-story-body" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createStoryMutation.isPending || updateStoryMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-record">{createStoryMutation.isPending || updateStoryMutation.isPending ? 'Saving…' : storyForm.id ? 'Save changes' : 'Add to issue'}</button><button type="button" onClick={() => setStoryForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-record">Cancel</button></div><RevisionHistory storyId={storyForm.id} /></form> : <div className="mt-6">{stories.length === 0 ? <EmptyState title="No records in this issue." text="Add the first source-aware record to begin shaping the edition." /> : <div className="divide-y divide-foreground/15">{stories.map((story) => <div key={story.id} className="flex items-start justify-between gap-4 py-4" data-testid={`row-editor-story-${story.id}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><span className="rounded-full border border-foreground/20 px-2 py-1 signal-kicker text-[9px]">{story.workflowStatus}</span><span className="signal-kicker text-muted-foreground">{story.verificationStatus}</span></div><h3 className="mt-1 truncate font-display text-2xl">{story.title}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{story.source} · {formatDate(story.publishedOn)}{story.reviewedAt ? ` · reviewed ${formatDate(story.reviewedAt)}` : ' · review pending'}</p></div><button type="button" onClick={() => setStoryForm({ ...story, workflowStatus: story.workflowStatus === 'published' ? 'draft' : story.workflowStatus, revisionNote: '' })} className="inline-flex shrink-0 items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-story-${story.id}`}><Pencil size={13} /> Edit</button></div>)}</div>}</div>}</div></section><footer className="signal-container flex justify-between border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Leave the desk</Link><span className="signal-kicker text-muted-foreground">Source first / always</span></footer></main>;
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
  const path = '/authors/signal-24';
  const validAuthor = params.slug === 'signal-24';
  useSeo({
    title: 'Signal Hub editorial desk — Signal Hub',
    description: 'Meet the editorial desk behind Signal Hub, a source-first publication and research archive on reservation in India.',
    canonicalPath: validAuthor ? path : undefined,
    robots: validAuthor ? 'index, follow' : 'noindex, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Person', name: 'Signal Hub editorial desk', description: 'The editorial desk responsible for sourcing, reviewing and presenting the Signal Hub archive.', url: path, worksFor: organizationSchema },
        organizationSchema,
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Signal Hub', item: '/' }, { '@type': 'ListItem', position: 2, name: 'Authors', item: path }] },
      ],
    },
  });
  if (!validAuthor) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That author page does not exist." /></div></div>;
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><p className="signal-kicker text-accent">Signal Hub / author</p><h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">The editorial<br /><em className="font-normal text-accent">desk.</em></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">The Signal Hub editorial desk keeps reporting, documents, analysis and opinion distinct, and names the source and date behind each published record.</p></section><section className="signal-container mt-16 border-y border-foreground/20 py-10 sm:mt-24 sm:py-14"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="signal-kicker text-accent">Source first / always</p><h2 className="mt-3 font-display text-4xl leading-none">A byline with a responsibility.</h2></div><p className="max-w-2xl text-base leading-relaxed text-muted-foreground">The desk is a publication identity rather than a claim that every record has one author. Individual bylines, disclosures and corrections belong on the record when they are available.</p></div></section><footer className="signal-container flex justify-between gap-6 border-t border-foreground/20 py-8"><Link href="/archive" className="signal-kicker signal-link">Browse the archive</Link><Link href="/editorial-standards" className="signal-kicker signal-link">Editorial standards</Link></footer></main>;
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
      <div><p className="signal-kicker text-accent">Share with the noticeboard</p><h2 id="community-composer-title" className="mt-2 font-display text-3xl leading-none sm:text-4xl">Put something in the room.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Use your name. Add context. Links are welcome. This is a public participant contribution, not an automatic Signal Hub report.</p></div>
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
    title: 'Community noticeboard — Signal Hub',
    description: 'Public participant contributions about reservation, representation and related policy. Contributions are not Signal Hub reporting.',
    canonicalPath: '/community',
    robots: 'noindex, follow',
  });
  const [topic, setTopic] = useState('');
  const [state, setState] = useState('');
  const [sort, setSort] = useState<GetCommunityPostsSort>('recent');
  const [composerOpen, setComposerOpen] = useState(false);
  const params = useMemo<GetCommunityPostsParams>(() => ({ topic: topic ? topic as CommunityTopic : undefined, state: state || undefined, sort, limit: 50 }), [topic, state, sort]);
  const { data, isLoading, isError, refetch, isFetching } = useGetCommunityPosts(params, { query: { queryKey: getGetCommunityPostsQueryKey(params) } });
  const posts = data?.posts ?? [];
  useSeo({ title: 'Community noticeboard — Signal Hub', description: 'A public discussion space for lived thoughts, articles, links and creative pieces from across India.', canonicalPath: '/community' });
  return <main className="signal-page"><Header /><section className="signal-container pt-12 sm:pt-20">
    <div className="grid gap-8 border-b-2 border-primary pb-10 lg:grid-cols-[1fr_.58fr] lg:items-end">
      <div><p className="signal-kicker text-accent">Signal Hub / community</p><h1 className="mt-4 max-w-4xl font-display text-6xl leading-[.88] tracking-[-.065em] sm:text-8xl">The national<br /><em className="font-normal text-accent">noticeboard.</em></h1><p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">A separate public room for lived thoughts, articles, links and creative pieces. Read across disagreement, geography and experience.</p></div>
      <div className="border-l-2 border-accent pl-5"><p className="signal-kicker text-accent">Important distinction</p><p className="mt-3 text-sm leading-relaxed">These are public participant contributions. They are not automatically Signal Hub reporting, and they do not carry the archive’s source verification.</p><button type="button" onClick={() => setComposerOpen((open) => !open)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 signal-kicker text-accent-foreground" data-testid="button-open-community-composer">{composerOpen ? 'Close share form' : 'Share a thought'} <Plus size={14} /></button></div>
    </div>
    {composerOpen && <div className="mt-8"><CommunityComposer onClose={() => setComposerOpen(false)} /></div>}
  </section>
  <section className="signal-container py-10 sm:py-14">
    <div className="flex flex-col justify-between gap-5 border-y border-foreground/20 py-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">Browse the room</p><h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Many voices. More context.</h2></div><button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex items-center gap-2 signal-kicker text-accent disabled:opacity-50" data-testid="button-refresh-community"><RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> {isFetching ? 'Refreshing' : 'Refresh posts'}</button></div>
    <div className="mt-6 grid gap-3 border border-foreground/15 bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:p-4"><label className="border-b border-foreground/15 px-2 py-2 sm:border-b-0 sm:border-r"><span className="signal-kicker block text-[9px] text-muted-foreground">Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="select-community-filter-topic"><option value="">All topics</option>{COMMUNITY_TOPICS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="border-b border-foreground/15 px-2 py-2 sm:border-b-0 sm:border-r"><span className="signal-kicker block text-[9px] text-muted-foreground">State</span><select value={state} onChange={(event) => setState(event.target.value)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="select-community-filter-state"><option value="">All states</option>{(data?.states?.length ? data.states : COMMUNITY_STATES).map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="px-2 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as GetCommunityPostsSort)} className="w-full bg-transparent pt-1 text-sm outline-none" data-testid="select-community-sort"><option value="recent">Most recent</option><option value="popular">Most liked</option></select></label></div>
    {isLoading ? <div className="mt-8 grid gap-5 md:grid-cols-2" role="status" aria-label="Loading community posts"><div className="h-64 animate-pulse bg-muted" /><div className="h-64 animate-pulse bg-muted" /><div className="h-64 animate-pulse bg-muted" /></div> : isError ? <div className="mt-8"><ErrorState message="The community noticeboard could not be loaded." onRetry={() => void refetch()} /></div> : posts.length === 0 ? <div className="mt-8"><EmptyState title="The noticeboard is quiet here." text="Try another topic or state, or be the first person to share a contribution." /></div> : <div className="mt-8 grid gap-5 md:grid-cols-2">{posts.map((post) => <CommunityPostCard key={post.id} post={post} />)}</div>}
  </section>
  <footer className="signal-container border-t border-foreground/20 py-8"><div className="flex flex-wrap justify-between gap-4"><p className="signal-kicker text-muted-foreground">Community / public participant contributions</p><Link href="/editorial-standards" className="signal-kicker text-accent hover:underline" data-testid="link-community-standards">Read editorial standards</Link></div></footer>
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
  useSeo({ title: data?.post ? `${data.post.title} — Community — Signal Hub` : 'Community post — Signal Hub', description: data?.post?.body.slice(0, 155) ?? 'A public participant contribution in the Signal Hub community.', robots: 'noindex, follow' });
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
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_.48fr]"><div><div className="flex flex-wrap items-center gap-2"><span className="signal-kicker text-accent">{post.kind}</span><span className="text-muted-foreground">/</span><span className="signal-kicker text-muted-foreground">{post.topic}</span>{post.state && <><span className="text-muted-foreground">/</span><span className="signal-kicker text-muted-foreground">{post.state}</span></>}</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[.92] tracking-[-.055em] sm:text-7xl" data-testid="heading-community-post">{post.title}</h1><p className="mt-6 signal-kicker text-muted-foreground">Shared by {post.authorName} · {communityDate(post.createdAt)}</p></div><aside className="border-l-2 border-accent pl-5"><p className="signal-kicker text-accent">Community record</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A public participant contribution. It is not automatically Signal Hub reporting or a verified archive record.</p><button type="button" onClick={like} disabled={likeMutation.isPending} className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 signal-kicker hover:border-accent hover:text-accent disabled:opacity-50 ${post.likedByViewer ? 'border-accent text-accent' : 'border-foreground/25'}`} data-testid="button-like-community-detail"><Heart size={14} fill={post.likedByViewer ? 'currentColor' : 'none'} /> {post.likedByViewer ? 'Liked' : 'Like'} · {post.likeCount}</button></aside></div>
    <div className="story-body mt-12 max-w-3xl whitespace-pre-line text-[1.08rem] leading-[1.85] text-foreground/85" data-testid="text-community-detail-body">{post.body}</div>
    {post.linkUrl && <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-accent pb-1 signal-kicker text-accent hover:border-primary hover:text-primary" data-testid="link-community-external"><Link2 size={14} /> Open shared link <ExternalLink size={13} /></a>}
    <section className="mt-16 border-t-2 border-primary pt-8" aria-labelledby="community-replies-title"><div className="flex items-end justify-between gap-4"><div><p className="signal-kicker text-accent">Responses</p><h2 id="community-replies-title" className="mt-2 font-display text-4xl">The reply line.</h2></div><span className="signal-kicker text-muted-foreground">{data.replies.length} replies</span></div>
      {data.replies.length ? <div className="mt-7 divide-y divide-foreground/15 border-y border-foreground/15">{data.replies.map((item: CommunityReply) => <article key={item.id} className="py-5" data-testid={`card-community-reply-${item.id}`}><div className="flex flex-wrap justify-between gap-3"><p className="signal-kicker text-accent">{item.authorName}</p><time className="signal-kicker text-[9px] text-muted-foreground" dateTime={item.createdAt}>{communityDate(item.createdAt)}</time></div><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.body}</p></article>)}</div> : <p className="mt-7 border border-dashed border-foreground/25 px-5 py-8 text-sm text-muted-foreground">No replies yet. Disagreement is welcome when it brings context.</p>}
      <form onSubmit={reply} className="mt-8 grid gap-4 border border-foreground/15 bg-card p-5 sm:p-7"><p className="font-display text-2xl">Add your context.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Your name"><input required minLength={2} maxLength={80} value={authorName} onChange={(event) => setAuthorName(event.target.value)} className="editor-input" data-testid="input-community-reply-author" /></Field><Field label="Your reply"><textarea required minLength={2} maxLength={5000} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} className="editor-input min-h-24 resize-y" data-testid="textarea-community-reply" /></Field></div>{replyError && <p className="text-sm text-destructive" role="alert">Your reply could not be posted. Please try again.</p>}<button type="submit" disabled={replyMutation.isPending} className="w-fit rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-50" data-testid="button-submit-community-reply">{replyMutation.isPending ? 'Posting…' : 'Post reply'}</button></form>
    </section>
  </article></main>;
}

function SignInPage() {
  useSeo({ title: 'Editor sign in — Signal Hub', description: 'Sign in to access the private Signal Hub editorial desk.', robots: 'noindex, nofollow' });
  return <main className="signal-page"><section className="signal-container flex min-h-[100dvh] flex-col items-center justify-center gap-8 py-12">
    <Link href="/" className="signal-link font-display text-2xl">SIGNAL <span className="text-accent">HUB</span></Link>
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

/*
// hint: Structural change (rename/retype). Check callers of this entity.
function AppRoutes() {
  return <Switch><Route path="/" component={Home} /><Route path="/sign-in/*?" component={SignInPage} /><Route path="/sign-up/*?" component={SignUpPage} /><Route path="/community" component={CommunityPage} /><Route path="/community/:id" component={CommunityDetailPage} /><Route path="/policies" component={PoliciesPage} /><Route path="/policies/:slug" component={PolicyDetail} /><Route path="/archive" component={ArchivePage} /><Route path="/events" component={EvidenceEventsRoute} /><Route path="/events/:id" component={EvidenceEventRoute} /><Route path="/sources/:id" component={EvidenceSourceRoute} /><Route path="/topics" component={TopicIndexPage} /><Route path="/topics/:slug" component={TopicPage} /><Route path="/timeline" component={TimelinePage} /><Route path="/search" component={EvidenceSearchRoute} /><Route path="/authors/:slug" component={AuthorPage} /><Route path="/data" component={DataIndexPage} /><Route path="/stories/:id" component={StoryDetail} /><Route path="/editor/evidence" component={EditorEvidenceAccessRoute} /><Route path="/editor" component={EditorAccessRoute} /><Route path="/about" component={AboutPage} /><Route path="/editorial-standards" component={StandardsPage} /><Route path="/methodology" component={MethodologyPage} /><Route path="/:family/:slug" component={StoryDetail} /><Route component={NotFound} /></Switch>;
}
*/
function AppRoutes() {
  return <Switch>
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
    <Route path="/stories/:id" component={StoryDetail} />
    <Route path="/editor/evidence" component={EditorEvidenceAccessRoute} />
    <Route path="/editor" component={EditorAccessRoute} />
    <Route path="/about" component={AboutPage} />
    <Route path="/editorial-standards" component={StandardsPage} />
    <Route path="/methodology" component={MethodologyPage} />
    <Route path="/:family/:slug" component={StoryDetail} />
    <Route component={NotFound} />
  </Switch>;
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
          Skip to main content
        </a>
        <ErrorBoundary><AppRoutes /><Toaster /></ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>;
}
function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRouting /></WouterRouter>;
}

export default App;

function useSeo({ title, description, canonicalPath, robots = 'index, follow', type = 'website', structuredData }: SeoConfig) {
  const structuredDataText = JSON.stringify(absoluteStructuredData(structuredData ?? null));
  useEffect(() => {
    document.title = title;
    const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        element.dataset.signalSeo = 'true';
        document.head.appendChild(element);
      }
      element.content = content;
    };

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    const pathname = window.location.pathname;
    const currentPath = basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || '/'
      : pathname;
    upsertMeta('property', 'og:url', absoluteSiteUrl(canonicalPath ?? currentPath));
    upsertMeta('property', 'og:site_name', 'Signal Hub');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove());
    if (canonicalPath && robots.startsWith('index')) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = absoluteSiteUrl(canonicalPath);
      canonical.dataset.signalSeo = 'true';
      document.head.appendChild(canonical);
    }

    document.head.querySelectorAll('script[data-signal-seo]').forEach((element) => element.remove());
    if (structuredDataText !== 'null') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.signalSeo = 'true';
      script.textContent = structuredDataText;
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, robots, structuredDataText, title, type]);
}

function storyPath(story: Story) {
  return story.canonicalPath || `/${recordFamilyForStory(story)}/${story.slug || `${slugify(story.title) || 'record'}-${story.id}`}`;
}

function slugify(value: string) {
  return value.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const organizationSchema = {
  '@type': 'Organization',
  name: 'Signal Hub',
  description: 'A source-first public-interest newsroom and research archive for reservation policy, court records, official documents and data in India.',
  url: absoluteSiteUrl('/'),
};

function recordFamilyForStory(story: Story) {
  if (story.recordFamily) return story.recordFamily;
  if (story.topic === 'States') return 'states';
  if (story.topic === 'Data & Notes') return 'data';
  if (story.topic === 'Courts & Policy') return story.kind === 'Paper note' ? 'cases' : 'policies';
  if (story.kind === 'Archive') return 'documents';
  return 'articles';
}

function DataIndexPage() {
  const path = '/data';
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useGetArchive(params, {
    query: { queryKey: getGetArchiveQueryKey(params) },
  });
  const records = data?.stories.filter((story) =>
    (story.recordFamily === 'data' || story.topic === 'Data & Notes') &&
    story.verificationStatus === 'verified' &&
    Boolean(story.sourceUrl),
  ) ?? [];
  useSeo({
    title: 'Data room — Signal Hub',
    description: 'Browse source-linked and reviewed data records on reservation and representation in India.',
    canonicalPath: path,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'CollectionPage', name: 'Signal Hub data room', description: 'Published data records and methodology notes on reservation and representation in India.', url: path, mainEntity: records.map((story) => ({ '@type': 'Dataset', name: story.title, description: story.dek, url: story.canonicalPath || storyPath(story), creator: organizationSchema, isAccessibleForFree: true })) },
        organizationSchema,
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Signal Hub', item: '/' }, { '@type': 'ListItem', position: 2, name: 'Data', item: path }] },
      ],
    },
  });
  return <main className="signal-page">
    <Header />
    <section className="signal-container pt-14 sm:pt-24">
      <p className="signal-kicker text-accent">Signal Hub / data room</p>
      <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Numbers need<br /><em className="font-normal text-accent">a denominator.</em></h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">Data records appear here only when their source and verification status are visible. A chart needs a defined value, unit, date, geography and denominator; none is inferred to fill a gap.</p>
    </section>
    <section className="signal-container mt-16 border-y border-foreground/20 py-10 sm:mt-24 sm:py-14" aria-labelledby="data-room-records-title">
      <p className="signal-kicker text-accent">Data room / source-linked records</p>
      <h2 id="data-room-records-title" className="mt-3 font-display text-3xl leading-tight">Published datasets and notes</h2>
      {isLoading ? <div className="mt-6" role="status" aria-live="polite">Loading published data records…</div> :
        isError ? <div className="mt-6"><ErrorState message="Published data records could not be loaded." onRetry={() => void refetch()} /></div> :
          records.length === 0 ? <>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">No reviewed, source-linked dataset is published yet. The current archive contains no data record that meets this bar, so no chart or numeric comparison is shown.</p>
            <Link href="/methodology" className="mt-7 inline-flex items-center gap-2 signal-kicker text-accent hover:underline">Read the methodology <ArrowUpRight size={13} /></Link>
          </> :
            <div className="mt-7 border-t border-foreground/20">
              {records.map((story) => <article key={story.id} className="grid gap-5 border-b border-foreground/20 py-7 md:grid-cols-[.25fr_1fr_.62fr] md:gap-10" data-testid={`data-record-${story.id}`}>
                <div><p className="signal-kicker text-accent">Record date / as supplied</p><time className="mt-2 block font-mono-signal text-xs" dateTime={story.publishedOn ?? undefined}>{formatDate(story.publishedOn)}</time><p className="mt-2 signal-kicker text-muted-foreground">{story.verificationStatus}</p></div>
                <div><p className="signal-kicker text-muted-foreground">{story.kind} / {story.state || 'National'}</p><Link href={storyPath(story)} className="group mt-2 block"><h3 className="font-display text-3xl leading-tight group-hover:text-accent">{story.title}</h3></Link><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p></div>
                <SourceLine story={story} detail />
              </article>)}
            </div>}
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
  useSeo({ title: 'Editor account — Signal Hub', description: 'Create an account to request access to the private Signal Hub editorial desk.', robots: 'noindex, nofollow' });
  return <main className="signal-page"><section className="signal-container flex min-h-[100dvh] flex-col items-center justify-center gap-8 py-12">
    <Link href="/" className="signal-link font-display text-2xl">SIGNAL <span className="text-accent">HUB</span></Link>
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
    title: evidence ? 'Evidence graph — Signal Hub' : 'Editorial desk — Signal Hub',
    description: evidence
      ? 'Private editorial workspace for maintaining explicit article, event, and source relationships.'
      : 'Private editorial workspace for preparing source-aware Signal Hub records.',
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
