import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Menu,
  Pencil,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  getGetArchiveQueryKey,
  getGetCurrentIssueQueryKey,
  getGetNewsletterStatusQueryKey,
  useCreateIssue,
  useCreateStory,
  useGetArchive,
  useGetCurrentIssue,
  useGetNewsletterStatus,
  useGetStory,
  usePublishIssue,
  useSubscribeToNewsletter,
  useUpdateStory,
} from '@workspace/api-client-react';
import type { Issue, IssueInput, Story, StoryInput, StoryKind, Topic } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const TOPICS = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'] as Topic[];
const KINDS = ['Article', 'Paper note', 'Archive', 'Explainer'] as StoryKind[];
const INDIA_STATES = ['All states', 'Andhra Pradesh', 'Bihar', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'];

function formatDate(value?: string | null) {
  if (!value) return 'Date not supplied';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function BrandMark() {
  return <span className="signal-mark shrink-0" aria-label="Signal 24 mark"><span className="sr-only">Signal 24</span></span>;
}

function Header({ editor = false }: { editor?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);
  return (
    <>
      <div className="bg-primary py-2.5 text-primary-foreground">
        <div className="signal-container flex items-center justify-between gap-4">
          <p className="signal-kicker flex items-center gap-2 text-[9px]"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> A public-interest archive on reservation</p>
          <p className="hidden signal-kicker opacity-60 sm:block">The Signal 24 / source desk</p>
        </div>
      </div>
      <header className="signal-container relative z-30 flex items-center justify-between border-b border-foreground/20 py-5">
        <Link href="/" onClick={close} className="signal-link flex items-center gap-3" data-testid="link-brand">
          <BrandMark />
          <span className="font-display text-[1.4rem] font-semibold leading-none tracking-[-.045em]">The Signal <span className="text-accent">24</span></span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {editor ? (
            <>
              <Link href="/" className="signal-kicker signal-link" data-testid="link-back-publication">Back to publication</Link>
              <span className="signal-kicker text-accent">Editorial desk</span>
            </>
          ) : (
            <>
              <Link href="/" className="signal-kicker signal-link" data-testid="link-current-edition">Current edition</Link>
              <Link href="/archive" className="signal-kicker signal-link" data-testid="link-archive">Archive</Link>
              <Link href="/editor" className="signal-kicker signal-link" data-testid="link-editor">Editorial desk</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!editor && <Link href="/archive" className="hidden rounded-full bg-accent px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.12em] text-accent-foreground transition-transform hover:-translate-y-0.5 sm:inline-block" data-testid="button-browse-archive">Browse the archive</Link>}
          <button type="button" className="grid h-9 w-9 place-items-center md:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen((value) => !value)} data-testid="button-mobile-navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="absolute left-0 right-0 top-full border-b border-foreground/20 bg-background p-5 shadow-md md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-5">
              {editor ? <Link href="/" onClick={close} className="signal-kicker signal-link">Back to publication</Link> : <>
                <Link href="/" onClick={close} className="signal-kicker signal-link">Current edition</Link>
                <Link href="/archive" onClick={close} className="signal-kicker signal-link">Archive</Link>
                <Link href="/editor" onClick={close} className="signal-kicker signal-link">Editorial desk</Link>
              </>}
            </div>
          </nav>
        )}
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

function StoryArt({ story, compact = false }: { story: Story; compact?: boolean }) {
  const tone = story.tone || story.topic;
  return <div className={`relative overflow-hidden border border-foreground/15 ${compact ? 'h-full min-h-[118px] sm:min-h-[142px]' : 'min-h-[270px]'} ${tone.includes('court') || tone.includes('policy') ? 'bg-[#314c5a]' : tone.includes('state') ? 'bg-[#52655b]' : tone.includes('history') ? 'bg-[#735d4e]' : tone.includes('data') ? 'bg-[#4d5370]' : 'bg-[#5f5369]'}`} aria-hidden="true">
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(120deg, transparent 35%, rgba(244,237,218,.7) 36%, transparent 37%), linear-gradient(32deg, transparent 50%, rgba(244,237,218,.42) 51%, transparent 52%)', backgroundSize: '44px 44px' }} />
    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#f2ede3]/50" /><div className="absolute right-5 top-7 h-28 w-28 rounded-full border border-[#f2ede3]/30" />
    <div className="absolute bottom-5 left-5 flex items-end gap-1">{[20, 36, 28, 52, 34, 63, 44, 26].map((height, index) => <span key={`${height}-${index}`} className="block w-1 rounded-t-full bg-[#f2ede3]/80" style={{ height }} />)}</div>
    <span className="absolute bottom-4 right-4 font-mono-signal text-[10px] uppercase tracking-[.2em] text-[#f2ede3]/85">S24 / {String(story.number ?? story.sortOrder).padStart(2, '0')}</span>
  </div>;
}

function SourceLine({ story, detail = false }: { story: Story; detail?: boolean }) {
  return <div className={`source-stamp ${detail ? 'px-5 py-4' : 'pl-3'}`}><p className="signal-kicker text-accent">Source record</p><p className="mt-1 text-sm font-medium">{story.source || 'Source not supplied'}</p><p className="mt-1 font-mono-signal text-[10px] uppercase tracking-[.1em] text-muted-foreground">{story.kind} · {formatDate(story.publishedOn)}{story.state ? ` · ${story.state}` : ''}</p>{detail && story.sourceUrl && <a href={story.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[.68rem] font-bold uppercase tracking-[.12em] text-accent hover:underline" data-testid={`link-source-${story.id}`}>Open source <ExternalLink size={12} /></a>}</div>;
}

function StoryCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  return <article className={`story-hover group ${compact ? 'grid grid-cols-[112px_1fr] gap-4 border-b border-foreground/15 py-5 last:border-0 sm:grid-cols-[145px_1fr]' : ''}`} data-testid={`card-story-${story.id}`}>
    <Link href={`/stories/${story.id}`} className={compact ? 'block h-[112px] sm:h-[145px]' : 'block w-full'} data-testid={`link-story-art-${story.id}`}><StoryArt story={story} compact={compact} /></Link>
    <div className={compact ? 'flex min-w-0 flex-col justify-between' : 'pt-5'}><div><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><Link href={`/stories/${story.id}`} className="mt-2 block" data-testid={`link-story-${story.id}`}><h3 className={`${compact ? 'text-[1.12rem] sm:text-[1.3rem]' : 'text-[2rem] sm:text-[2.7rem]'} font-display leading-[1.02] tracking-[-.025em] transition-colors group-hover:text-accent`}>{story.title}</h3></Link><p className={`mt-3 ${compact ? 'line-clamp-2 text-[.84rem]' : 'max-w-xl text-[1rem]'} leading-relaxed text-muted-foreground`}>{story.dek}</p></div><div className="mt-4"><SourceLine story={story} /></div></div>
  </article>;
}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useSubscribeToNewsletter();
  const statusQuery = useGetNewsletterStatus({ email }, { query: { enabled: Boolean(email), queryKey: getGetNewsletterStatusQueryKey({ email }) } });
  const subscribed = submitted || statusQuery.data?.subscribed === true;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    subscribe.mutate({ data: { email } }, { onSuccess: () => { window.localStorage.setItem('signal24-newsletter-email', email); setSubmitted(true); } });
  }
  return <section id="newsletter" className="signal-container mt-24 border-y-2 border-primary py-10 sm:mt-36 sm:py-14"><div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="signal-kicker text-accent">Stay with the record</p><h2 className="mt-3 max-w-lg font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">A considered briefing, not a firehose.</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">A short note when the national conversation moves: new reporting, court records, research and context.</p></div>{subscribed ? <div className="border border-accent bg-accent/10 p-6" data-testid="newsletter-confirmation"><div className="flex items-start gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={15} /></div><div><p className="font-display text-2xl">You are on the list.</p><p className="mt-1 text-sm text-muted-foreground">The next note will arrive in your inbox.</p></div></div></div> : <form onSubmit={submit} className="border border-foreground/20 bg-card p-5 sm:p-7" data-testid="form-newsletter"><label htmlFor="newsletter-email" className="signal-kicker text-muted-foreground">Your email, kept private</label><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input id="newsletter-email" data-testid="input-newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-0 py-3 text-sm outline-none focus:border-accent" /><button type="submit" disabled={subscribe.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground disabled:opacity-60" data-testid="button-newsletter-submit">{subscribe.isPending ? 'Sending…' : 'Join the briefing'} <Send size={13} /></button></div>{subscribe.isError && <p className="mt-3 text-sm text-destructive">That address could not be added. Please try again.</p>}<p className="mt-4 signal-kicker text-[9px] text-muted-foreground">One considered email / unsubscribe anytime</p></form>}</div></section>;
}

function Home() {
  const { data, isLoading, isError, refetch } = useGetCurrentIssue();
  const [activeTopic, setActiveTopic] = useState<Topic | 'All'>('All');
  const [search, setSearch] = useState('');
  useEffect(() => { document.title = data?.issue.title ? `${data.issue.title} — The Signal 24` : 'The Signal 24 — Reservation archive'; }, [data?.issue.title]);
  const stories = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.stories.filter((story) => (activeTopic === 'All' || story.topic === activeTopic) && (!q || `${story.title} ${story.dek} ${story.source} ${story.state}`.toLowerCase().includes(q)));
  }, [activeTopic, data, search]);
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Assembling the current edition…" /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState title="The current edition is not available." /></div></div>;
  const [featured, ...rest] = stories;
  return <main className="signal-page"><Header />
    <section className="signal-container hero-grid relative mt-7 grid overflow-hidden border-y border-foreground/20 px-4 py-12 sm:mt-10 sm:px-10 sm:py-20 lg:grid-cols-[1.12fr_.88fr] lg:gap-14 lg:px-14">
      <div className="relative z-[1] reveal"><div className="mb-7 flex items-center gap-3"><span className="h-px w-10 bg-accent" /><p className="signal-kicker text-accent">Issue {String(data.issue.issueNumber).padStart(3, '0')} / {formatDate(data.issue.issueDate)}</p></div><h1 className="max-w-3xl font-display text-[3.8rem] font-semibold leading-[.9] tracking-[-.065em] sm:text-[6.9rem] lg:text-[8.2rem]" data-testid="heading-hero">The record<br /><em className="font-normal text-accent">behind</em><br />the debate.</h1><div className="mt-8 flex max-w-xl items-start gap-4 border-l-2 border-accent pl-4 sm:mt-10 sm:pl-5"><p className="text-[1rem] leading-relaxed text-muted-foreground sm:text-[1.08rem]">{data.issue.intro}</p></div><a href="#briefing" className="mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-[.7rem] font-bold uppercase tracking-[.14em] text-primary-foreground transition-transform hover:-translate-y-1" data-testid="link-read-briefing">Read the current edition <ArrowDownRight size={15} /></a></div>
      <div className="relative mt-12 flex min-h-[260px] items-end justify-between border-l border-foreground/20 pl-6 reveal reveal-delay-2 sm:min-h-[340px] sm:pl-10 lg:mt-0"><div className="absolute left-6 top-2 signal-kicker text-[9px] text-muted-foreground sm:left-10">Published {formatDate(data.issue.publishedAt)}</div><div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border border-foreground/25 sm:h-[280px] sm:w-[280px]"><div className="absolute inset-7 rounded-full border border-foreground/20" /><div className="absolute inset-16 rounded-full border border-accent/80" /><div className="absolute inset-[35%] rounded-full bg-accent shadow-[0_0_0_12px_hsl(8_68%_48%_/_0.14)]" /><div className="absolute h-px w-[130%] rotate-[24deg] bg-foreground/35" /><div className="absolute h-px w-[130%] -rotate-[24deg] bg-foreground/15" /><span className="absolute -right-2 top-[28%] signal-kicker text-[9px] text-muted-foreground">Constitution</span><span className="absolute -bottom-2 left-[16%] signal-kicker text-[9px] text-muted-foreground">Experience</span></div><div className="absolute bottom-0 right-0 flex items-end gap-2"><span className="signal-kicker mb-1 text-muted-foreground [writing-mode:vertical-rl]">Records / {data.stories.length}</span><div className="broadcast-bars"><span /><span /><span /><span /><span /><span /><span /></div></div></div>
    </section>
    <section id="briefing" className="signal-container pt-20 sm:pt-28"><div className="flex flex-col justify-between gap-6 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">01 / Current edition</p><h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em]">What the record says now</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{data.issue.title}</p></div><div className="flex flex-wrap items-center gap-2 py-5" aria-label="Filter stories by topic">{['All', ...(data.topics.length ? data.topics : TOPICS)].map((topic) => <button key={topic} type="button" onClick={() => setActiveTopic(topic as Topic | 'All')} className={`rounded-full border px-4 py-2 signal-kicker transition-colors ${activeTopic === topic ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 hover:border-accent hover:text-accent'}`} aria-pressed={activeTopic === topic} data-testid={`button-topic-${String(topic).replace(/\W/g, '-').toLowerCase()}`}>{topic}</button>)}<label className="ml-auto hidden items-center gap-2 border-b border-foreground/25 py-2 text-sm sm:flex"><Search size={14} className="text-accent" /><input aria-label="Search current edition" data-testid="input-search-current" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this edition" className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label></div>{!featured ? <EmptyState /> : <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-10"><StoryCard story={featured} />{rest.slice(0, 3).length > 0 && <div className="border-t border-foreground/20 lg:border-t-0">{rest.slice(0, 3).map((story) => <StoryCard key={story.id} story={story} compact />)}</div>}</div>}</section>
    <section className="signal-container mt-24 bg-primary px-5 py-12 text-primary-foreground sm:mt-36 sm:px-12 sm:py-20"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20"><div><p className="signal-kicker text-secondary">02 / How to read this archive</p><h2 className="mt-4 max-w-md font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">A national question<br /><em className="font-normal text-accent">in many registers.</em></h2><p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/65">Reservation is at once a constitutional guarantee, a question of representation, a response to discrimination, and a lived reality in classrooms, offices and public life.</p></div><div className="relative border-l border-primary-foreground/25 pl-6 sm:pl-10">{[['01', 'Read the source', 'Every record names where it comes from and when it was published.'], ['02', 'Follow the thread', 'Court decisions, policy changes and research are placed beside the histories they inherit.'], ['03', 'Hold the complexity', 'No single record can stand in for every state, community or experience.']].map(([number, title, description], index) => <div key={number} className={`relative ${index < 2 ? 'pb-9' : ''}`}><span className="absolute -left-[29px] top-0 h-3 w-3 rounded-full border-2 border-primary bg-accent sm:-left-[45px]" /><p className="signal-kicker text-secondary">{number}</p><h3 className="mt-2 font-display text-2xl">{title}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/60">{description}</p></div>)}</div></div></section>
    <section className="signal-container pt-24 sm:pt-36"><div className="flex items-end justify-between border-b border-foreground/20 pb-5"><div><p className="signal-kicker text-accent">03 / The larger record</p><h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">Keep following.</h2></div><Link href="/archive" className="hidden items-center gap-2 text-[.68rem] font-bold uppercase tracking-[.13em] hover:text-accent sm:flex" data-testid="link-explore-archive">Explore all records <ChevronRight size={14} /></Link></div><div className="grid gap-7 py-8 sm:grid-cols-3">{data.stories.slice(4, 7).map((story, index) => <Link href={`/stories/${story.id}`} key={story.id} className="group border-b border-foreground/15 pb-6 sm:border-b-0 sm:border-r sm:pr-6 last:border-0" data-testid={`link-follow-story-${story.id}`}><p className="signal-kicker text-accent">{story.topic} / 0{index + 1}</p><h3 className="mt-3 font-display text-2xl leading-[1.02] tracking-[-.03em] group-hover:text-accent">{story.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><span className="mt-5 block signal-kicker text-muted-foreground">{story.kind} <ArrowUpRight size={12} className="ml-1 inline" /></span></Link>)}</div></section>
    <NewsletterSignup /><footer className="signal-container flex flex-col justify-between gap-8 py-10 sm:flex-row sm:items-end"><div><Link href="/" className="signal-link flex items-center gap-3"><BrandMark /><span className="font-display text-xl">The Signal <span className="text-accent">24</span></span></Link><p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">A source-first publication for understanding reservation in India.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 signal-kicker text-[9px] text-muted-foreground"><Link href="/archive" className="signal-link">Archive</Link><Link href="/editor" className="signal-link">Editorial desk</Link><span>© Signal 24</span></div></footer>
  </main>;
}

function ArchivePage() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('');
  const [state, setState] = useState('');
  const [year, setYear] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const params = useMemo(() => ({ ...(query ? { q: query } : {}), ...(topic ? { topic: topic as Topic } : {}), ...(kind ? { kind: kind as StoryKind } : {}), ...(state ? { state } : {}), limit: 100 }), [kind, query, state, topic]);
  const { data, isLoading, isError, refetch } = useGetArchive(params, { query: { queryKey: getGetArchiveQueryKey(params) } });
  useEffect(() => { document.title = 'The archive — The Signal 24'; }, []);
  const clear = () => { setQuery(''); setTopic(''); setKind(''); setState(''); setYear(''); };
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Indexing records and sources…" /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="The search index could not be reached." onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState /></div></div>;
  const years = Array.from(new Set(data.stories.map((story) => story.publishedOn?.slice(0, 4)).filter(Boolean))).sort().reverse() as string[];
  const records = data.stories.filter((story) => !year || story.publishedOn?.startsWith(year));
  return <main className="signal-page"><Header /><section className="signal-container pt-14 sm:pt-24"><div className="max-w-4xl"><p className="signal-kicker text-accent">The Signal 24 / archive</p><h1 className="mt-4 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">A record you<br /><em className="font-normal text-accent">can return to.</em></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">Search reporting, court and policy developments, historical documents, research notes and state context. The archive is a work in progress, built to make difficult conversations easier to verify and remember.</p></div></section>
    <section className="signal-container archive-grid mt-16 border-y border-foreground/20 py-6 sm:mt-24"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><SlidersHorizontal size={16} className="text-accent" /><p className="signal-kicker">Filter the archive</p></div><button type="button" onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground md:hidden" data-testid="button-toggle-filters">{filtersOpen ? 'Hide' : 'Show'} filters <ChevronDown size={14} /></button></div><div className={`${filtersOpen ? 'grid' : 'hidden'} mt-5 gap-3 md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]`}><label className="flex items-center gap-2 border border-foreground/20 bg-card px-3 py-2"><Search size={15} className="shrink-0 text-accent" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, source or place" className="w-full bg-transparent text-sm outline-none" data-testid="input-archive-search" /></label><SelectFilter label="Topic" value={topic} options={data.topics.length ? data.topics : TOPICS} onChange={setTopic} testId="select-archive-topic" /><SelectFilter label="Record type" value={kind} options={data.kinds.length ? data.kinds : KINDS} onChange={setKind} testId="select-archive-kind" /><SelectFilter label="State" value={state} options={data.states.length ? ['All states', ...data.states] : INDIA_STATES} onChange={(value) => setState(value === 'All states' ? '' : value)} testId="select-archive-state" /><SelectFilter label="Published year" value={year} options={years} onChange={setYear} testId="select-archive-year" /><button type="button" onClick={clear} className="border border-foreground/20 px-4 py-2 signal-kicker text-muted-foreground hover:border-accent hover:text-accent" data-testid="button-clear-filters">Clear</button></div><div className="mt-5 flex items-center justify-between border-t border-foreground/15 pt-4"><p className="signal-kicker text-muted-foreground">{records.length} {records.length === 1 ? 'record' : 'records'} / source labels shown</p>{(query || topic || kind || state || year) && <p className="signal-kicker text-accent">Filtered view</p>}</div></section>
    <section className="signal-container py-12 sm:py-16">{records.length === 0 ? <EmptyState title="No record found here." text="Clear one of the filters and try again. The archive grows with each edition." /> : <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">{records.map((story) => <StoryCard key={story.id} story={story} />)}</div>}</section><footer className="signal-container flex justify-between gap-6 border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Current edition</Link><p className="signal-kicker text-muted-foreground">Built for careful reading</p></footer>
  </main>;
}

function SelectFilter({ label, value, options, onChange, testId }: { label: string; value: string; options: string[]; onChange: (value: string) => void; testId: string }) {
  return <label className="relative border border-foreground/20 bg-card px-3 py-2"><span className="signal-kicker block text-[9px] text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-transparent pt-1 text-sm outline-none" data-testid={testId}><option value="">All {label.toLowerCase()}</option>{options.filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 bottom-3 text-muted-foreground" /></label>;
}

function StoryDetail() {
  const params = useParams<{ id: string }>();
  const storyId = Number(params.id);
  const { data: story, isLoading, isError, refetch } = useGetStory(storyId);
  useEffect(() => { document.title = story ? `${story.title} — The Signal 24` : 'Record — The Signal 24'; }, [story]);
  if (!Number.isFinite(storyId)) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That record address is not valid." /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Opening the source record…" /></div>;
  if (isError || !story) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="This record may have moved or is not published yet." onRetry={() => void refetch()} /></div></div>;
  return <main className="signal-page"><Header /><article className="signal-container py-12 sm:py-20"><Link href="/archive" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground" data-testid="link-back-archive"><ArrowLeft size={13} /> Back to the archive</Link><div className="mt-12 grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-8xl" data-testid="heading-story">{story.title}</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{story.dek}</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 signal-kicker text-muted-foreground"><span>Published {formatDate(story.publishedOn)}</span><span>{story.time}</span><span>{story.read} min read</span>{story.state && <span>{story.state}</span>}</div></div><StoryArt story={story} /></div><div className="mx-auto mt-12 w-full max-w-2xl"><SourceLine story={story} detail /></div><div className="story-body mx-auto mt-10 max-w-2xl text-[1.08rem] leading-[1.85] text-foreground/85">{story.body.split(/\n{2,}/).map((paragraph, index) => <p key={`${story.id}-${index}`} className={index === 0 ? 'first-letter:font-display first-letter:text-5xl first-letter:leading-[.8] first-letter:text-accent' : ''}>{paragraph}</p>)}</div><div className="mx-auto mt-12 flex max-w-2xl items-center justify-between border-t border-foreground/20 pt-5"><p className="signal-kicker text-muted-foreground">End of record / {story.source}</p>{story.sourceUrl && <a href={story.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 signal-kicker text-accent" data-testid="link-open-source-bottom">View source <ExternalLink size={13} /></a>}</div></article></main>;
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
  useEffect(() => { document.title = 'Editorial desk — The Signal 24'; }, []);
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
  const setStory = (field: keyof StoryInput, value: string) => setStoryForm((current) => current ? { ...current, [field]: ['read', 'sortOrder', 'number'].includes(field) ? (value === '' ? null : Number(value)) : value } : current);
  return <main className="signal-page"><Header editor /><section className="signal-container pt-12 sm:pt-20"><div className="flex flex-col justify-between gap-7 border-b border-foreground/20 pb-8 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">Private workspace / editorial desk</p><h1 className="mt-3 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Make the<br /><em className="font-normal text-accent">record.</em></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">Create an issue, add source-aware records, and publish a considered edition. This desk keeps the expanded metadata visible because context is part of the work.</p></div><div className="flex items-center gap-2 signal-kicker text-muted-foreground"><Pencil size={14} className="text-accent" /> {workingIssue?.status ?? 'draft'} / {workingIssue ? `Issue ${workingIssue.issueNumber}` : 'No issue'}</div></div>{notice && <div className={`mt-6 flex items-center gap-3 border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-secondary bg-secondary/15' : 'border-destructive bg-destructive/10 text-destructive'}`} role="status" data-testid="status-editor-notice"><Check size={16} /> {notice.text}</div>}</section>
    <section className="signal-container grid gap-8 py-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-12"><div className="space-y-7"><div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="signal-kicker text-accent">01 / Issue</p><h2 className="mt-2 font-display text-3xl">Edition details</h2></div>{workingIssue && <span className="signal-kicker text-muted-foreground">{workingIssue.status}</span>}</div><form onSubmit={createIssue} className="mt-6 grid gap-4"><Field label="Issue date"><input required type="date" value={issueForm.issueDate} onChange={(event) => updateIssue('issueDate', event.target.value)} className="editor-input" data-testid="input-issue-date" /></Field><Field label="Issue number"><input required type="number" min="1" value={issueForm.issueNumber} onChange={(event) => updateIssue('issueNumber', event.target.value)} className="editor-input" data-testid="input-issue-number" /></Field><Field label="Edition title"><input required value={issueForm.title} onChange={(event) => updateIssue('title', event.target.value)} className="editor-input" placeholder="A clear title for this edition" data-testid="input-issue-title" /></Field><Field label="Introduction"><textarea required value={issueForm.intro} onChange={(event) => updateIssue('intro', event.target.value)} className="editor-input min-h-28 resize-y" placeholder="What should a reader understand before they begin?" data-testid="input-issue-intro" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createIssueMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-create-issue">{createIssueMutation.isPending ? 'Creating…' : 'Create new issue'} <Plus size={14} /></button>{workingIssue && <button type="button" onClick={publish} disabled={publishMutation.isPending || workingIssue.status === 'published'} className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-3 signal-kicker text-accent disabled:opacity-40" data-testid="button-publish-issue">{publishMutation.isPending ? 'Publishing…' : workingIssue.status === 'published' ? 'Published' : 'Publish issue'} <Send size={14} /></button>}</div></form></div><div className="border-l-2 border-accent px-5 py-2"><p className="signal-kicker text-accent">Desk note</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A source label is not decoration. It tells readers what kind of record they are reading, and what claims it can responsibly carry.</p></div></div>
      <div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 border-b border-foreground/15 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">02 / Records</p><h2 className="mt-2 font-display text-3xl">Build the issue</h2></div><button type="button" disabled={!workingIssue} onClick={() => workingIssue && setStoryForm(emptyStory(workingIssue.id))} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-record"><Plus size={14} /> Add record</button></div>{!workingIssue ? <div className="py-16"><EmptyState title="Create an issue first." text="The record form will appear here once an issue exists." /></div> : storyForm ? <form onSubmit={saveStory} className="mt-6 grid gap-4"><div className="flex items-center justify-between"><p className="font-display text-2xl">{storyForm.id ? 'Edit record' : 'New record'}</p><button type="button" onClick={() => setStoryForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close record form" data-testid="button-close-record-form"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Topic"><select value={storyForm.topic} onChange={(event) => setStory('topic', event.target.value)} className="editor-input" data-testid="select-story-topic">{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Record type"><select value={storyForm.kind} onChange={(event) => setStory('kind', event.target.value)} className="editor-input" data-testid="select-story-kind">{KINDS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="State / territory"><input value={storyForm.state ?? ''} onChange={(event) => setStory('state', event.target.value)} className="editor-input" placeholder="Leave blank if national" data-testid="input-story-state" /></Field><Field label="Published on"><input type="date" value={storyForm.publishedOn ?? ''} onChange={(event) => setStory('publishedOn', event.target.value)} className="editor-input" data-testid="input-story-date" /></Field><Field label="Source"><input required value={storyForm.source} onChange={(event) => setStory('source', event.target.value)} className="editor-input" placeholder="Court, publication, institution or archive" data-testid="input-story-source" /></Field><Field label="Source URL"><input type="url" value={storyForm.sourceUrl ?? ''} onChange={(event) => setStory('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-story-source-url" /></Field><Field label="Eyebrow"><input value={storyForm.eyebrow} onChange={(event) => setStory('eyebrow', event.target.value)} className="editor-input" placeholder="What kind of moment is this?" data-testid="input-story-eyebrow" /></Field><Field label="Visual tone"><input value={storyForm.tone} onChange={(event) => setStory('tone', event.target.value)} className="editor-input" placeholder="Latest, history, data…" data-testid="input-story-tone" /></Field><Field label="Reading time"><input value={storyForm.time} onChange={(event) => setStory('time', event.target.value)} className="editor-input" placeholder="8 min" data-testid="input-story-time" /></Field><Field label="Minutes"><input type="number" min="1" value={storyForm.read} onChange={(event) => setStory('read', event.target.value)} className="editor-input" data-testid="input-story-read" /></Field><Field label="Story number"><input type="number" value={storyForm.number ?? ''} onChange={(event) => setStory('number', event.target.value)} className="editor-input" data-testid="input-story-number" /></Field><Field label="Sort order"><input type="number" min="1" value={storyForm.sortOrder} onChange={(event) => setStory('sortOrder', event.target.value)} className="editor-input" data-testid="input-story-sort-order" /></Field></div><Field label="Title"><input required value={storyForm.title} onChange={(event) => setStory('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-title" /></Field><Field label="Dek"><textarea required value={storyForm.dek} onChange={(event) => setStory('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-dek" /></Field><Field label="Body"><textarea required value={storyForm.body} onChange={(event) => setStory('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="Separate paragraphs with a blank line." data-testid="input-story-body" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createStoryMutation.isPending || updateStoryMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-record">{createStoryMutation.isPending || updateStoryMutation.isPending ? 'Saving…' : storyForm.id ? 'Save changes' : 'Add to issue'}</button><button type="button" onClick={() => setStoryForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-record">Cancel</button></div></form> : <div className="mt-6">{stories.length === 0 ? <EmptyState title="No records in this issue." text="Add the first source-aware record to begin shaping the edition." /> : <div className="divide-y divide-foreground/15">{stories.map((story) => <div key={story.id} className="flex items-start justify-between gap-4 py-4" data-testid={`row-editor-story-${story.id}`}><div className="min-w-0"><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><h3 className="mt-1 truncate font-display text-2xl">{story.title}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{story.source} · {formatDate(story.publishedOn)}</p></div><button type="button" onClick={() => setStoryForm({ ...story })} className="inline-flex shrink-0 items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-story-${story.id}`}><Pencil size={13} /> Edit</button></div>)}</div>}</div>}</div></section><footer className="signal-container flex justify-between border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Leave the desk</Link><span className="signal-kicker text-muted-foreground">Source first / always</span></footer></main>;
}

function AppRoutes() {
  return <Switch><Route path="/" component={Home} /><Route path="/archive" component={ArchivePage} /><Route path="/stories/:id" component={StoryDetail} /><Route path="/editor" component={Editor} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary><WouterRouter><AppRoutes /></WouterRouter><Toaster /></ErrorBoundary></TooltipProvider></QueryClientProvider>;
}

export default App;