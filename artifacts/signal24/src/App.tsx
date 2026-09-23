import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Globe2,
  Menu,
  Pencil,
  Plus,
  Search,
  Send,
  X,
  Zap,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  getGetCurrentIssueQueryKey,
  getGetNewsletterStatusQueryKey,
  getGetStoryQueryKey,
  useCreateIssue,
  useCreateStory,
  useGetCurrentIssue,
  useGetNewsletterStatus,
  useGetStory,
  usePublishIssue,
  useSubscribeToNewsletter,
  useUpdateStory,
} from '@workspace/api-client-react';
import type { Issue, IssueInput, Story, StoryInput, Topic } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';

type FilterTopic = 'All' | Topic;

const topics: FilterTopic[] = ['All', 'World', 'Technology', 'Business', 'Culture'];
const queryClient = new QueryClient();

function BrandMark() {
  return (
    <span className="signal-mark shrink-0" aria-label="Signal mark" data-testid="mark-signal">
      <span className="sr-only">Signal 24</span>
    </span>
  );
}

function Header({ editor = false }: { editor?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div className="bg-primary py-2.5 text-primary-foreground">
        <div className="signal-container flex items-center justify-between gap-4">
          <p className="font-mono-signal text-[10px] uppercase tracking-[.16em]">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
            A daily briefing for the signal-seeking
          </p>
          <p className="hidden font-mono-signal text-[10px] uppercase tracking-[.16em] text-primary-foreground/60 sm:block">
            The Signal 24 / editorial desk
          </p>
        </div>
      </div>
      <header className="signal-container relative z-20 flex items-center justify-between border-b border-foreground/20 py-5">
        <Link href="/" className="signal-link flex items-center gap-3" data-testid="link-brand">
          <BrandMark />
          <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-.04em]">
            The Signal <span className="text-accent">24</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {editor ? (
            <>
              <Link href="/" className="signal-kicker signal-link">Back to publication</Link>
              <span className="signal-kicker text-accent">Editor / desk</span>
            </>
          ) : (
            <>
              <a className="signal-kicker signal-link" href="/#briefing">Today’s briefing</a>
              <a className="signal-kicker signal-link" href="/#dispatch">The dispatch</a>
              <Link href="/editor" className="signal-kicker signal-link">Editor</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!editor && (
            <a
              href="/#newsletter"
              className="hidden rounded-full bg-accent px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.12em] text-accent-foreground transition-transform hover:-translate-y-0.5 sm:inline-block"
            >
              Get the briefing
            </a>
          )}
          <button
            type="button"
            className="grid h-9 w-9 place-items-center md:hidden"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="absolute left-0 right-0 top-full border-b border-foreground/20 bg-background p-4 shadow-md md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4">
              {editor ? (
                <Link href="/" className="signal-kicker signal-link" onClick={() => setMobileOpen(false)}>Back to publication</Link>
              ) : (
                <>
                  <a className="signal-kicker signal-link" href="/#briefing" onClick={() => setMobileOpen(false)}>Today’s briefing</a>
                  <a className="signal-kicker signal-link" href="/#dispatch" onClick={() => setMobileOpen(false)}>The dispatch</a>
                  <Link href="/editor" className="signal-kicker signal-link" onClick={() => setMobileOpen(false)}>Editor</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

function LoadingBlock({ label = 'Tuning the frequency…' }: { label?: string }) {
  return (
    <div className="signal-container py-24" role="status" aria-live="polite">
      <div className="grid gap-4 animate-pulse">
        <div className="h-3 w-28 bg-muted" />
        <div className="h-12 max-w-2xl bg-muted" />
        <div className="h-4 max-w-xl bg-muted" />
        <p className="mt-4 font-mono-signal text-[10px] uppercase tracking-[.14em] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ErrorState({ message = 'The signal is temporarily out of range.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="signal-container border-y border-accent/50 px-5 py-20 text-center" role="alert">
      <p className="signal-kicker text-accent">Transmission interrupted</p>
      <h2 className="mt-3 font-display text-4xl leading-none">We could not load this edition.</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-6 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground">
          Try again
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-foreground/30 px-6 py-20 text-center">
      <Globe2 className="mx-auto mb-4 text-accent" size={28} />
      <h3 className="font-display text-3xl">Nothing on that frequency.</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        There are no published stories in this view yet. Check back when the next issue lands.
      </p>
    </div>
  );
}

function topicTone(topic: Topic) {
  const tones: Record<Topic, string> = {
    World: 'linear-gradient(135deg, #314b62 0%, #546c70 54%, #c3c970 100%)',
    Technology: 'linear-gradient(135deg, #23394b 0%, #476a68 54%, #b4c47e 100%)',
    Business: 'linear-gradient(135deg, #593d45 0%, #9d6856 54%, #edb069 100%)',
    Culture: 'linear-gradient(135deg, #2e334f 0%, #5c5472 54%, #cc8372 100%)',
  };
  return tones[topic];
}

function StoryArt({ story, compact = false }: { story: Story; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2px] ${compact ? 'h-full min-h-[112px] sm:min-h-[145px]' : 'min-h-[290px]'}`}
      style={{ background: topicTone(story.topic) }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(120deg, transparent 35%, rgba(245,239,224,.65) 36%, transparent 37%), linear-gradient(32deg, transparent 50%, rgba(245,239,224,.4) 51%, transparent 52%)', backgroundSize: '44px 44px' }} />
      <div className="absolute -right-9 -top-9 h-40 w-40 rounded-full border border-[#f2ede3]/50" />
      <div className="absolute -right-1 top-0 h-32 w-32 rounded-full border border-[#f2ede3]/30" />
      <div className="absolute bottom-5 left-5 flex items-end gap-1">
        {[18, 32, 25, 49, 34, 60, 43, 22].map((height) => (
          <span key={height} className="block w-1 rounded-t-full bg-[#f2ede3]/80" style={{ height }} />
        ))}
      </div>
      <span className="absolute bottom-4 right-4 font-mono-signal text-[10px] uppercase tracking-[.2em] text-[#f2ede3]/85">
        S24 / {String(story.number ?? story.sortOrder).padStart(2, '0')}
      </span>
    </div>
  );
}

function ArticleCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  return (
    <article className={`story-hover group ${compact ? 'grid grid-cols-[112px_1fr] gap-4 border-b border-foreground/15 py-5 last:border-0 sm:grid-cols-[145px_1fr]' : ''}`} data-testid={`card-story-${story.id}`}>
      <Link href={`/stories/${story.id}`} className={compact ? 'block h-[112px] sm:h-[145px]' : 'block w-full text-left'}>
        <StoryArt story={story} compact={compact} />
      </Link>
      <div className={compact ? 'flex min-w-0 flex-col justify-between' : 'pt-5'}>
        <div>
          <p className="signal-kicker text-accent">{story.topic} / {story.eyebrow}</p>
          <Link href={`/stories/${story.id}`} className="mt-2 block text-left">
            <h3 className={`${compact ? 'text-[1.1rem] sm:text-[1.25rem]' : 'text-[2rem] sm:text-[2.65rem]'} font-display leading-[1.02] tracking-[-.025em] text-foreground transition-colors group-hover:text-accent`}>
              {story.title}
            </h3>
          </Link>
          <p className={`mt-3 ${compact ? 'line-clamp-2 text-[.84rem]' : 'max-w-xl text-[1rem]'} leading-relaxed text-muted-foreground`}>{story.dek}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-muted-foreground">
          <span className="font-mono-signal text-[.65rem] uppercase tracking-[.12em]">{story.time} · {story.read} min read</span>
          <Link href={`/stories/${story.id}`} className="flex items-center gap-1 text-[.7rem] font-bold uppercase tracking-[.12em] text-foreground transition-colors hover:text-accent">
            Read <ArrowUpRight size={14} className="story-arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState(() => (typeof window === 'undefined' ? '' : window.localStorage.getItem('signal24-newsletter-email') ?? ''));
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useSubscribeToNewsletter();
  const statusQuery = useGetNewsletterStatus(
    { email },
    { query: { enabled: Boolean(email), queryKey: getGetNewsletterStatusQueryKey({ email }) } },
  );
  const subscribed = submitted || statusQuery.data?.subscribed === true;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    subscribe.mutate({ data: { email } }, {
      onSuccess: () => {
        window.localStorage.setItem('signal24-newsletter-email', email);
        setSubmitted(true);
      },
    });
  }

  return (
    <section id="newsletter" className="signal-container mt-24 border-y-2 border-primary py-10 sm:mt-36 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="signal-kicker text-accent">05 / Tomorrow’s signal</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">Know what to carry into the day.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">The Signal 24 arrives once a day. No churn. No click maze. Just the stories that earned your attention.</p>
        </div>
        {subscribed ? (
          <div className="border border-accent bg-accent/10 p-6" data-testid="newsletter-confirmation">
            <div className="flex items-start gap-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={15} /></div>
              <div><p className="font-display text-2xl">You’re on the frequency.</p><p className="mt-1 text-sm text-muted-foreground">The next briefing will be waiting in your inbox.</p></div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-foreground/20 bg-card p-5 sm:p-7" data-testid="form-newsletter">
            <label htmlFor="email" className="signal-kicker text-muted-foreground">Your email, kept private</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent" />
              <button type="submit" disabled={subscribe.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
                {subscribe.isPending ? 'Sending…' : 'Send the signal'} <Send size={13} />
              </button>
            </div>
            {subscribe.isError && <p className="mt-3 text-sm text-destructive">That address could not be added. Please try again.</p>}
            <p className="mt-4 font-mono-signal text-[9px] uppercase tracking-[.12em] text-muted-foreground">One email / every morning / unsubscribe anytime</p>
          </form>
        )}
      </div>
    </section>
  );
}

function Home() {
  const [activeTopic, setActiveTopic] = useState<FilterTopic>('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, refetch } = useGetCurrentIssue();

  useEffect(() => {
    document.title = data?.issue.title ? `${data.issue.title} — The Signal 24` : 'The Signal 24 — Context without noise';
  }, [data?.issue.title]);

  const filteredStories = useMemo(() => {
    if (!data) return [];
    const query = searchQuery.trim().toLowerCase();
    return data.stories.filter((story) => {
      const topicMatch = activeTopic === 'All' || story.topic === activeTopic;
      const searchMatch = !query || `${story.title} ${story.dek} ${story.body} ${story.topic} ${story.eyebrow}`.toLowerCase().includes(query);
      return topicMatch && searchMatch;
    });
  }, [activeTopic, data, searchQuery]);

  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock /></div>;
  if (isError) return <div className="signal-page"><Header /><div className="py-20"><ErrorState onRetry={() => void refetch()} /></div></div>;
  if (!data) return <div className="signal-page"><Header /><div className="py-20"><EmptyState /></div></div>;

  const featured = filteredStories[0];
  const secondary = filteredStories.slice(1, 3);
  const dispatch = data.stories.slice(4, 7);
  const cultureStory = data.stories.find((story) => story.topic === 'Culture') ?? data.stories[0];
  const filterTopics = ['All', ...data.topics] as FilterTopic[];

  return (
    <main className="signal-page">
      <Header />
      {searchOpen && (
        <div className="search-drawer signal-container relative z-10 border-b border-foreground/20 py-5">
          <div className="flex items-center gap-3 border-b-2 border-foreground/40 pb-3">
            <Search size={18} className="text-accent" />
            <input autoFocus type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the briefing…" className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60 sm:text-3xl" aria-label="Search stories" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search"><X size={17} /></button>}
          </div>
          {searchQuery && <p className="mt-3 font-mono-signal text-[10px] uppercase tracking-[.12em] text-muted-foreground">{filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found</p>}
        </div>
      )}
      <section id="top" className="signal-container hero-grid relative mt-7 grid overflow-hidden border-y border-foreground/20 px-4 py-12 sm:mt-10 sm:px-10 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-14 lg:px-14">
        <div className="relative z-[1] reveal">
          <div className="mb-7 flex items-center gap-3"><span className="h-px w-10 bg-accent" /><p className="signal-kicker text-accent">Issue {String(data.issue.issueNumber).padStart(3, '0')} / {data.issue.issueDate}</p></div>
          <h1 className="max-w-3xl font-display text-[3.8rem] font-semibold leading-[.91] tracking-[-.065em] sm:text-[6.8rem] lg:text-[8rem]" data-testid="heading-hero">The signal<br /><em className="font-normal text-accent">beneath</em><br />the noise.</h1>
          <div className="mt-8 flex max-w-xl items-start gap-4 border-l-2 border-accent pl-4 sm:mt-10 sm:pl-5"><p className="text-[1rem] leading-relaxed text-muted-foreground sm:text-[1.08rem]">{data.issue.intro}</p></div>
          <a href="#briefing" className="mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-[.7rem] font-bold uppercase tracking-[.14em] text-primary-foreground transition-transform hover:-translate-y-1">Read today’s briefing <ArrowDownRight size={15} /></a>
        </div>
        <div className="relative mt-12 flex min-h-[260px] items-end justify-between border-l border-foreground/20 pl-6 reveal reveal-delay-2 sm:min-h-[340px] sm:pl-10 lg:mt-0">
          <div className="absolute left-6 top-2 font-mono-signal text-[10px] uppercase tracking-[.15em] text-muted-foreground sm:left-10">Published {data.issue.publishedAt ? new Date(data.issue.publishedAt).toLocaleDateString() : 'today'}</div>
          <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border border-foreground/25 sm:h-[280px] sm:w-[280px]">
            <div className="absolute inset-7 rounded-full border border-foreground/20" /><div className="absolute inset-16 rounded-full border border-accent/80" /><div className="absolute inset-[35%] rounded-full bg-accent shadow-[0_0_0_12px_hsl(13_82%_57%_/_0.14)]" /><div className="absolute h-px w-[130%] rotate-[24deg] bg-foreground/35" /><div className="absolute h-px w-[130%] -rotate-[24deg] bg-foreground/15" />
            <span className="absolute -right-2 top-[28%] font-mono-signal text-[9px] uppercase tracking-[.13em] text-muted-foreground">Context</span><span className="absolute -bottom-2 left-[16%] font-mono-signal text-[9px] uppercase tracking-[.13em] text-muted-foreground">Momentum</span>
          </div>
          <div className="absolute bottom-0 right-0 flex items-end gap-2"><span className="signal-kicker mb-1 text-muted-foreground [writing-mode:vertical-rl]">Reading time / {String(data.stories.reduce((sum, story) => sum + story.read, 0)).padStart(2, '0')} min</span><div className="broadcast-bars"><span /><span /><span /><span /><span /><span /><span /></div></div>
        </div>
      </section>

      <section id="briefing" className="signal-container pt-20 sm:pt-28">
        <div className="flex flex-col justify-between gap-6 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end">
          <div><p className="signal-kicker text-accent">01 / Start here</p><h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em]">The daily briefing</h2></div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{data.issue.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 py-5" aria-label="Filter stories by topic">
           {filterTopics.map((topic) => <button type="button" key={topic} onClick={() => setActiveTopic(topic)} className={`rounded-full border px-4 py-2 font-mono-signal text-[10px] uppercase tracking-[.13em] transition-colors ${activeTopic === topic ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 hover:border-accent hover:text-accent'}`} aria-pressed={activeTopic === topic}>{topic}</button>)}
          <button type="button" className="ml-auto hidden items-center gap-2 font-mono-signal text-[10px] uppercase tracking-[.12em] text-muted-foreground sm:flex" onClick={() => setSearchOpen((value) => !value)}><Clock3 size={13} /> Search the issue</button>
        </div>
        {filteredStories.length === 0 ? <EmptyState /> : <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-10"><ArticleCard story={featured} /><div className="border-t border-foreground/20 lg:border-t-0">{secondary.map((story) => <ArticleCard key={story.id} story={story} compact />)}</div></div>}
      </section>

      {dispatch.length > 0 && (
        <section id="dispatch" className="signal-container pt-24 sm:pt-36">
          <div className="grid gap-8 border-y border-foreground/20 py-7 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
            <div><p className="signal-kicker text-accent">02 / Around the dial</p><h2 className="mt-3 max-w-sm font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">A little more signal.</h2><p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">Short reads for the space between the headlines. Small enough for a coffee queue, sharp enough to keep.</p><div className="mt-9 flex items-center gap-3 font-mono-signal text-[10px] uppercase tracking-[.14em] text-muted-foreground"><Zap size={14} className="text-accent" /> Curated, not comprehensive</div></div>
            <div className="grid divide-y divide-foreground/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">{dispatch.map((story, index) => <Link href={`/stories/${story.id}`} key={story.id} className="group text-left first:pt-0 sm:px-6 sm:first:pl-0"><div className="flex items-center justify-between py-5 sm:block sm:py-0"><div><p className="signal-kicker text-accent">{story.topic} / 0{index + 1}</p><h3 className="mt-3 font-display text-2xl leading-[1.02] tracking-[-.03em] group-hover:text-accent">{story.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.dek}</p></div><span className="mt-5 block whitespace-nowrap font-mono-signal text-[9px] uppercase tracking-[.12em] text-muted-foreground">{story.read} min <ArrowUpRight size={12} className="ml-1 inline transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div></Link>)}</div>
          </div>
        </section>
      )}

      <section id="about" className="signal-container mt-24 bg-primary px-5 py-12 text-primary-foreground sm:mt-36 sm:px-12 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20"><div><p className="signal-kicker text-secondary">03 / In 24 hours</p><h2 className="mt-4 max-w-md font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">The day,<br /><em className="font-normal text-accent">in motion.</em></h2><p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/65">News is not a pile. It is a sequence. We look for the hinge, not the heat.</p></div><div className="relative border-l border-primary-foreground/25 pl-6 sm:pl-10">{[['06:00', 'The first light', 'Overnight signals are sorted into what changed, what held, and what can wait.'], ['12:00', 'The turn', 'The morning story meets the day’s facts. We look for the hinge, not the heat.'], ['18:00', 'The shape', 'A final read on what gathered momentum — and the quieter stories that deserve tomorrow.']].map(([time, title, description], index) => <div key={time} className={`relative ${index < 2 ? 'pb-9' : ''}`}><span className="absolute -left-[29px] top-0 h-3 w-3 rounded-full border-2 border-primary bg-accent sm:-left-[45px]" /><p className="font-mono-signal text-[10px] tracking-[.16em] text-secondary">{time}</p><h3 className="mt-2 font-display text-2xl">{title}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/60">{description}</p></div>)}</div></div>
      </section>

      {cultureStory && <section className="signal-container pt-24 sm:pt-36"><div className="flex items-end justify-between border-b border-foreground/20 pb-5"><div><p className="signal-kicker text-accent">04 / After hours</p><h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">Culture is a clue.</h2></div><button type="button" onClick={() => { setActiveTopic('Culture'); document.getElementById('briefing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hidden items-center gap-2 text-[.68rem] font-bold uppercase tracking-[.13em] hover:text-accent sm:flex">Explore culture <ChevronRight size={14} /></button></div><div className="grid gap-8 py-8 lg:grid-cols-[1.45fr_.55fr]"><article className="story-hover grid gap-6 border-b border-foreground/15 pb-8 sm:grid-cols-[.95fr_1.05fr] sm:items-center lg:border-b-0 lg:border-r lg:pr-10"><Link href={`/stories/${cultureStory.id}`}><StoryArt story={cultureStory} /></Link><div><p className="signal-kicker text-accent">{cultureStory.topic} / {cultureStory.eyebrow}</p><h3 className="mt-3 font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">{cultureStory.title}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{cultureStory.dek}</p><Link href={`/stories/${cultureStory.id}`} className="mt-6 flex items-center gap-2 text-[.68rem] font-bold uppercase tracking-[.13em] hover:text-accent">Read the feature <ArrowUpRight size={14} /></Link></div></article><div className="flex flex-col justify-center pl-0 lg:pl-2"><p className="signal-kicker text-muted-foreground">A thought to keep</p><blockquote className="mt-4 font-display text-3xl leading-[1.02] tracking-[-.03em]">“Attention is the first form of participation.”</blockquote><p className="mt-5 font-mono-signal text-[10px] uppercase tracking-[.14em] text-accent">— Simone Weil, re-read</p><div className="mt-10 flex items-center gap-3"><div className="h-px w-12 bg-accent" /><span className="text-xs text-muted-foreground">Make a little room.</span></div></div></div></section>}
      <NewsletterSignup />
      <footer className="signal-container flex flex-col justify-between gap-8 py-10 sm:flex-row sm:items-end"><div><Link href="/" className="signal-link flex items-center gap-3"><BrandMark /><span className="font-display text-xl">The Signal <span className="text-accent">24</span></span></Link><p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">A daily editorial filter for a world with too many open tabs.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 font-mono-signal text-[9px] uppercase tracking-[.14em] text-muted-foreground"><a href="#briefing" className="signal-link">Briefing</a><a href="#dispatch" className="signal-link">Dispatch</a><a href="#newsletter" className="signal-link">Newsletter</a><Link href="/editor" className="signal-link">Editor</Link><span>© The Signal 24</span></div></footer>
    </main>
  );
}

function StoryDetail() {
  const params = useParams<{ id: string }>();
  const storyId = Number(params.id);
  const { data: story, isLoading, isError, refetch } = useGetStory(storyId);
  useEffect(() => { document.title = story ? `${story.title} — The Signal 24` : 'Story — The Signal 24'; }, [story]);
  if (!Number.isFinite(storyId)) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="That story address is not valid." /></div></div>;
  if (isLoading) return <div className="signal-page"><Header /><LoadingBlock label="Opening the story…" /></div>;
  if (isError || !story) return <div className="signal-page"><Header /><div className="py-20"><ErrorState message="This story may have moved or is not published yet." onRetry={() => void refetch()} /></div></div>;
   return <main className="signal-page"><Header /><article className="signal-container py-12 sm:py-20"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2 text-muted-foreground"><ArrowLeft size={13} /> Back to the briefing</Link><div className="mt-12 grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><p className="signal-kicker text-accent">{story.topic} / {story.eyebrow}</p><h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-8xl">{story.title}</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{story.dek}</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono-signal text-[10px] uppercase tracking-[.13em] text-muted-foreground"><span>{story.time}</span><span>{story.read} min read</span><span>Story {String(story.number ?? story.sortOrder + 1).padStart(2, '0')}</span></div></div><StoryArt story={story} /></div><div className="mx-auto mt-14 max-w-2xl border-t border-foreground/20 pt-9">{story.body.split(/\n{2,}/).map((paragraph, index) => <p key={`${story.id}-${index}`} className={`mb-6 text-[1.08rem] leading-[1.85] text-foreground/85 ${index === 0 ? 'first-letter:font-display first-letter:text-5xl first-letter:leading-[.8] first-letter:text-accent' : ''}`}>{paragraph}</p>)}</div></article></main>;
}

const emptyStory = (issueId: number): StoryInput => ({ issueId, topic: 'World', eyebrow: '', title: '', dek: '', body: '', time: '', read: 4, tone: '', number: null, sortOrder: 1 });

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="signal-kicker text-muted-foreground">{label}</span>{children}</label>;
}

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
  const [storyForm, setStoryForm] = useState<StoryInput | null>(null);
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

  useEffect(() => { document.title = 'Editor — The Signal 24'; }, []);

  function showNotice(type: 'success' | 'error', text: string) {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 5000);
  }

  function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createIssueMutation.mutate({ data: issueForm }, {
      onSuccess: (issue) => {
        setWorkingIssue(issue);
        setStories([]);
        setStoryForm(null);
        showNotice('success', `Issue ${issue.issueNumber} is ready for editing.`);
        void queryClient.invalidateQueries({ queryKey: getGetCurrentIssueQueryKey() });
      },
      onError: () => showNotice('error', 'The issue could not be created. Check the fields and try again.'),
    });
  }

  function saveStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storyForm || !workingIssue) return;
    const payload = { ...storyForm, issueId: workingIssue.id };
    if (storyForm.title && stories.some((story) => story.id === (storyForm as StoryInput & { id?: number }).id)) {
      const id = (storyForm as StoryInput & { id: number }).id;
      updateStoryMutation.mutate({ storyId: id, data: payload }, {
        onSuccess: (updated) => {
          setStories((current) => current.map((story) => story.id === updated.id ? updated : story));
          setStoryForm(null);
          showNotice('success', 'Story updated in the issue.');
          void queryClient.invalidateQueries({ queryKey: getGetCurrentIssueQueryKey() });
          queryClient.setQueryData(getGetStoryQueryKey(updated.id), updated);
        },
        onError: () => showNotice('error', 'The story could not be updated.'),
      });
    } else {
      createStoryMutation.mutate({ data: payload }, {
        onSuccess: (created) => {
          setStories((current) => [...current, created].sort((a, b) => a.sortOrder - b.sortOrder));
          setStoryForm(null);
          showNotice('success', 'Story added to the issue.');
          void queryClient.invalidateQueries({ queryKey: getGetCurrentIssueQueryKey() });
        },
        onError: () => showNotice('error', 'The story could not be created.'),
      });
    }
  }

  function publish() {
    if (!workingIssue) return;
    publishMutation.mutate({ issueId: workingIssue.id }, {
      onSuccess: (issue) => {
        setWorkingIssue(issue);
        showNotice('success', `Issue ${issue.issueNumber} is now published.`);
        void queryClient.invalidateQueries({ queryKey: getGetCurrentIssueQueryKey() });
      },
      onError: () => showNotice('error', 'Publishing failed. The issue remains in the desk.'),
    });
  }

  if (isLoading) return <div className="signal-page"><Header editor /><LoadingBlock label="Opening the desk…" /></div>;

  return (
    <main className="signal-page min-h-[100dvh]">
      <Header editor />
      <div className="signal-container py-10 sm:py-16">
        <div className="flex flex-col justify-between gap-5 border-b border-foreground/20 pb-7 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">The newsroom companion</p><h1 className="mt-3 font-display text-5xl leading-none tracking-[-.05em] sm:text-7xl">The desk.</h1><p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">Shape the current issue, keep the language clear, and publish when the sequence is ready.</p></div>{workingIssue && <div className="flex flex-wrap gap-2"><span className="rounded-full border border-foreground/20 px-3 py-2 font-mono-signal text-[10px] uppercase tracking-[.12em]">{workingIssue.status}</span><button type="button" onClick={publish} disabled={workingIssue.status === 'published' || publishMutation.isPending} className="rounded-full bg-accent px-4 py-2 text-[.68rem] font-bold uppercase tracking-[.13em] text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50">{publishMutation.isPending ? 'Publishing…' : workingIssue.status === 'published' ? 'Published' : 'Publish issue'}</button></div>}</div>
        {isError && <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-accent/50 bg-accent/10 px-4 py-3 text-sm"><span>No published issue is available yet. Start a new edition below.</span><button type="button" onClick={() => void refetch()} className="font-mono-signal text-[10px] uppercase tracking-[.12em] text-accent">Refresh issue</button></div>}
        {notice && <div className={`mt-6 flex items-center gap-3 border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-accent bg-accent/10' : 'border-destructive/50 bg-destructive/10 text-destructive'}`} role="status"><span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground">{notice.type === 'success' ? <Check size={13} /> : <X size={13} />}</span>{notice.text}</div>}
        <div className="mt-10 grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <section className="h-fit border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="signal-kicker text-accent">01 / Issue control</p><h2 className="mt-2 font-display text-3xl">The current edition</h2></div>{workingIssue && <span className="font-mono-signal text-[10px] uppercase tracking-[.12em] text-muted-foreground">#{workingIssue.issueNumber}</span>}</div><form onSubmit={createIssue} className="mt-7 grid gap-5"><Field label="Issue date"><input type="date" value={issueForm.issueDate} onChange={(event) => setIssueForm((form) => ({ ...form, issueDate: event.target.value }))} className="editor-input" required /></Field><Field label="Issue number"><input type="number" min="1" value={issueForm.issueNumber} onChange={(event) => setIssueForm((form) => ({ ...form, issueNumber: Number(event.target.value) }))} className="editor-input" required /></Field><Field label="Title"><input value={issueForm.title} onChange={(event) => setIssueForm((form) => ({ ...form, title: event.target.value }))} className="editor-input" placeholder="The shape of the day" required /></Field><Field label="Intro"><textarea value={issueForm.intro} onChange={(event) => setIssueForm((form) => ({ ...form, intro: event.target.value }))} className="editor-input min-h-28 resize-y" placeholder="One clear sentence that frames this issue." required /></Field><button type="submit" disabled={createIssueMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground disabled:opacity-50">{createIssueMutation.isPending ? 'Creating…' : workingIssue ? 'Create replacement issue' : 'Create issue'} <Plus size={14} /></button></form><p className="mt-5 border-t border-foreground/15 pt-4 text-xs leading-relaxed text-muted-foreground">Creating a replacement issue starts a clean story list. Existing published editions remain available to readers until you publish the new one.</p></section>
          <section><div className="flex items-end justify-between border-b border-foreground/20 pb-5"><div><p className="signal-kicker text-accent">02 / Story lineup</p><h2 className="mt-2 font-display text-3xl">The issue’s voices</h2></div><button type="button" disabled={!workingIssue} onClick={() => workingIssue && setStoryForm(emptyStory(workingIssue.id))} className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-[.68rem] font-bold uppercase tracking-[.12em] hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"><Plus size={14} /> New story</button></div>{stories.length === 0 ? <div className="border border-dashed border-foreground/25 px-5 py-14 text-center"><p className="font-display text-2xl">{workingIssue ? 'The page is quiet.' : 'Create an issue to begin.'}</p><p className="mt-2 text-sm text-muted-foreground">{workingIssue ? 'Add the first story to this edition.' : 'The desk needs an issue before it can hold stories.'}</p></div> : <div className="divide-y divide-foreground/15">{stories.map((story) => <div key={story.id} className="flex items-start justify-between gap-4 py-5"><div><p className="signal-kicker text-accent">{story.topic} / {story.eyebrow}</p><h3 className="mt-2 font-display text-2xl leading-none">{story.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{story.dek}</p><p className="mt-3 font-mono-signal text-[10px] uppercase tracking-[.12em] text-muted-foreground">Order {story.sortOrder} · {story.read} min read</p></div><button type="button" onClick={() => setStoryForm({ issueId: story.issueId, topic: story.topic, eyebrow: story.eyebrow, title: story.title, dek: story.dek, body: story.body, time: story.time, read: story.read, tone: story.tone, number: story.number, sortOrder: story.sortOrder, ...( { id: story.id } as unknown as Partial<StoryInput> ) })} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-foreground/20 hover:border-accent hover:text-accent" aria-label={`Edit ${story.title}`}><Pencil size={14} /></button></div>)}</div>}{storyForm && <form onSubmit={saveStory} className="mt-8 border border-accent/50 bg-card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="signal-kicker text-accent">03 / {('id' in storyForm) ? 'Edit story' : 'New story'}</p><h2 className="mt-2 font-display text-3xl">{('id' in storyForm) ? 'Tune the copy.' : 'Add a story.'}</h2></div><button type="button" onClick={() => setStoryForm(null)} className="grid h-8 w-8 place-items-center rounded-full border border-foreground/20" aria-label="Close story editor"><X size={14} /></button></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Topic"><select value={storyForm.topic} onChange={(event) => setStoryForm({ ...storyForm, topic: event.target.value as Topic })} className="editor-input">{topics.slice(1).map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></Field><Field label="Eyebrow"><input value={storyForm.eyebrow} onChange={(event) => setStoryForm({ ...storyForm, eyebrow: event.target.value })} className="editor-input" placeholder="The long view" required /></Field><Field label="Headline"><input value={storyForm.title} onChange={(event) => setStoryForm({ ...storyForm, title: event.target.value })} className="editor-input sm:col-span-2" required /></Field><Field label="Dek"><textarea value={storyForm.dek} onChange={(event) => setStoryForm({ ...storyForm, dek: event.target.value })} className="editor-input min-h-24 resize-y sm:col-span-2" required /></Field><Field label="Body"><textarea value={storyForm.body} onChange={(event) => setStoryForm({ ...storyForm, body: event.target.value })} className="editor-input min-h-52 resize-y sm:col-span-2" placeholder="Separate paragraphs with a blank line." required /></Field><Field label="Published time"><input value={storyForm.time} onChange={(event) => setStoryForm({ ...storyForm, time: event.target.value })} className="editor-input" placeholder="08:42 AM" required /></Field><Field label="Read time (minutes)"><input type="number" min="1" value={storyForm.read} onChange={(event) => setStoryForm({ ...storyForm, read: Number(event.target.value) })} className="editor-input" required /></Field><Field label="Sort order"><input type="number" min="1" value={storyForm.sortOrder} onChange={(event) => setStoryForm({ ...storyForm, sortOrder: Number(event.target.value) })} className="editor-input" required /></Field><Field label="Story number"><input type="number" min="1" value={storyForm.number ?? ''} onChange={(event) => setStoryForm({ ...storyForm, number: event.target.value ? Number(event.target.value) : null })} className="editor-input" /></Field></div><div className="mt-7 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setStoryForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em]">Cancel</button><button type="submit" disabled={createStoryMutation.isPending || updateStoryMutation.isPending} className="rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground disabled:opacity-50">{createStoryMutation.isPending || updateStoryMutation.isPending ? 'Saving…' : 'Save story'}</button></div></form>}</section>
        </div>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/stories/:id" component={StoryDetail} />
        <Route path="/editor" component={Editor} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;