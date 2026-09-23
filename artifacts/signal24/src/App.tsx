import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Clock3, Globe2, Menu, Search, Send, X, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Topic = 'All' | 'World' | 'Technology' | 'Business' | 'Culture';

type Story = {
  id: string;
  topic: Exclude<Topic, 'All'>;
  eyebrow: string;
  title: string;
  dek: string;
  time: string;
  read: string;
  tone: string;
  number?: string;
};

const stories: Story[] = [
  {
    id: 'shipping-routes',
    topic: 'World',
    eyebrow: 'The long view',
    title: 'The map is being redrawn at sea',
    dek: 'A new chain of shipping detours is quietly changing the cost, speed and politics of everything on the shelf.',
    time: '8:42 AM',
    read: '6 min read',
    tone: 'from-[#314b62] via-[#546c70] to-[#c3c970]',
    number: '01',
  },
  {
    id: 'quiet-computing',
    topic: 'Technology',
    eyebrow: 'The useful bit',
    title: 'Computing is moving closer to the edge',
    dek: 'The next wave of devices will make fewer trips to the cloud. That is less about speed than control.',
    time: '7:18 AM',
    read: '4 min read',
    tone: 'from-[#23394b] via-[#476a68] to-[#b4c47e]',
    number: '02',
  },
  {
    id: 'soft-landing',
    topic: 'Business',
    eyebrow: 'Signals & noise',
    title: 'The soft landing has a strange shape',
    dek: 'Jobs are steady, prices are easing, and households are still cautious. Three charts explain the tension.',
    time: '6:03 AM',
    read: '5 min read',
    tone: 'from-[#593d45] via-[#9d6856] to-[#edb069]',
    number: '03',
  },
  {
    id: 'new-night',
    topic: 'Culture',
    eyebrow: 'After hours',
    title: 'Why the night is becoming a public space again',
    dek: 'From late libraries to 24-hour bakeries, a new kind of city culture is making room for people who work off-clock.',
    time: 'Yesterday',
    read: '7 min read',
    tone: 'from-[#2e334f] via-[#5c5472] to-[#cc8372]',
    number: '04',
  },
  {
    id: 'water-budget',
    topic: 'World',
    eyebrow: 'Field notes',
    title: 'The new politics of a full glass',
    dek: 'Cities are learning that water resilience is a design problem before it is an engineering one.',
    time: 'Yesterday',
    read: '3 min read',
    tone: 'from-[#2e5663] via-[#53818a] to-[#d7d08e]',
  },
  {
    id: 'small-models',
    topic: 'Technology',
    eyebrow: 'The useful bit',
    title: 'Small models are getting interesting',
    dek: 'The rush toward bigger systems has left an opening for tools that are cheaper, narrower and easier to trust.',
    time: 'Yesterday',
    read: '5 min read',
    tone: 'from-[#394b3e] via-[#70815a] to-[#d9ba75]',
  },
  {
    id: 'repair-economy',
    topic: 'Business',
    eyebrow: 'On the ground',
    title: 'The repair economy is having a good year',
    dek: 'A growing market of fixers is turning broken things into local knowledge, and making “new” less automatic.',
    time: 'Mon',
    read: '4 min read',
    tone: 'from-[#5b4b38] via-[#9d865a] to-[#d5b96d]',
  },
  {
    id: 'attention-rituals',
    topic: 'Culture',
    eyebrow: 'The slower read',
    title: 'A case for having fewer tabs open',
    dek: 'Attention is not a personality trait. It is an environment we build, one small ritual at a time.',
    time: 'Mon',
    read: '9 min read',
    tone: 'from-[#3b3f4b] via-[#7a7268] to-[#c6a891]',
  },
];

const topics: Topic[] = ['All', 'World', 'Technology', 'Business', 'Culture'];

const queryClient = new QueryClient();

function BrandMark() {
  return (
    <span className="signal-mark shrink-0" aria-label="Signal mark" data-testid="mark-signal">
      <span className="sr-only">Signal 24</span>
    </span>
  );
}

function StoryArt({ tone, compact = false }: { tone: string; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-[2px] bg-gradient-to-br ${tone} ${compact ? 'h-full min-h-[150px]' : 'min-h-[290px]'}`} aria-hidden="true">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(120deg, transparent 35%, rgba(245,239,224,.65) 36%, transparent 37%), linear-gradient(32deg, transparent 50%, rgba(245,239,224,.4) 51%, transparent 52%)', backgroundSize: '44px 44px' }} />
      <div className="absolute -right-9 -top-9 h-40 w-40 rounded-full border border-[#f2ede3]/50" />
      <div className="absolute -right-1 top-0 h-32 w-32 rounded-full border border-[#f2ede3]/30" />
      <div className="absolute bottom-5 left-5 flex items-end gap-1">
        {[18, 32, 25, 49, 34, 60, 43, 22].map((height, index) => (
          <span key={index} className="block w-1 rounded-t-full bg-[#f2ede3]/80" style={{ height }} />
        ))}
      </div>
      <span className="absolute right-4 bottom-4 font-mono-signal text-[10px] uppercase tracking-[.2em] text-[#f2ede3]/85">S24 / {String(Math.round(tone.length * 3.4)).padStart(2, '0')}</span>
    </div>
  );
}

function ArticleCard({ story, onOpen, compact = false }: { story: Story; onOpen: (story: Story) => void; compact?: boolean }) {
  return (
    <article className={`story-hover group ${compact ? 'grid grid-cols-[112px_1fr] gap-4 border-b border-foreground/15 py-5 last:border-0 sm:grid-cols-[145px_1fr]' : ''}`} data-testid={`card-story-${story.id}`}>
      <button type="button" className={compact ? 'h-[112px] sm:h-[145px]' : 'block w-full text-left'} onClick={() => onOpen(story)} data-testid={`button-open-${story.id}`}>
        {compact ? <StoryArt tone={story.tone} compact /> : <StoryArt tone={story.tone} />}
      </button>
      <div className={compact ? 'flex min-w-0 flex-col justify-between' : 'pt-5'}>
        <div>
          <p className="signal-kicker text-accent">{story.topic} / {story.eyebrow}</p>
          <button type="button" className="mt-2 block text-left" onClick={() => onOpen(story)} data-testid={`button-title-${story.id}`}>
            <h3 className={`${compact ? 'text-[1.1rem] sm:text-[1.25rem]' : 'text-[2rem] sm:text-[2.65rem]'} font-display leading-[1.02] tracking-[-.025em] text-foreground transition-colors group-hover:text-accent`}>{story.title}</h3>
          </button>
          <p className={`mt-3 ${compact ? 'line-clamp-2 text-[.84rem]' : 'max-w-xl text-[1rem]'} leading-relaxed text-muted-foreground`}>{story.dek}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-muted-foreground">
          <span className="font-mono-signal text-[.65rem] uppercase tracking-[.12em]">{story.time} · {story.read}</span>
          <button type="button" className="flex items-center gap-1 text-[.7rem] font-bold uppercase tracking-[.12em] text-foreground transition-colors hover:text-accent" onClick={() => onOpen(story)} data-testid={`button-read-${story.id}`}>
            Read <ArrowUpRight size={14} className="story-arrow" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [activeTopic, setActiveTopic] = useState<Topic>('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [signupStatus, setSignupStatus] = useState<'idle' | 'success'>('idle');

  const filteredStories = useMemo(() => {
    const byTopic = activeTopic === 'All' ? stories : stories.filter((story) => story.topic === activeTopic);
    if (!searchQuery.trim()) return byTopic;
    const query = searchQuery.toLowerCase();
    return stories.filter((story) => `${story.title} ${story.dek} ${story.topic}`.toLowerCase().includes(query));
  }, [activeTopic, searchQuery]);

  const featured = filteredStories[0] ?? stories[0];
  const secondary = filteredStories.slice(1, 3);

  function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupStatus('success');
  }

  return (
    <main className="signal-page">
      <div className="bg-primary py-2.5 text-primary-foreground">
        <div className="signal-container flex items-center justify-between gap-4">
          <p className="font-mono-signal text-[10px] uppercase tracking-[.16em]"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />A daily briefing for the signal-seeking</p>
          <p className="hidden font-mono-signal text-[10px] uppercase tracking-[.16em] text-primary-foreground/60 sm:block">Issue 024 / Tuesday, 08 October 2024</p>
        </div>
      </div>

      <header className="signal-container relative z-20 flex items-center justify-between border-b border-foreground/20 py-5">
        <a href="#top" className="signal-link flex items-center gap-3" data-testid="link-brand">
          <BrandMark />
          <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-.04em]">The Signal <span className="text-accent">24</span></span>
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <a className="signal-kicker signal-link" href="#briefing" data-testid="link-briefing">Today’s briefing</a>
          <a className="signal-kicker signal-link" href="#dispatch" data-testid="link-dispatch">The dispatch</a>
          <a className="signal-kicker signal-link" href="#about" data-testid="link-about">Why 24?</a>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-foreground/20 transition-colors hover:bg-foreground hover:text-background" aria-label="Search stories" onClick={() => setSearchOpen((open) => !open)} data-testid="button-toggle-search">
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>
          <a href="#newsletter" className="hidden rounded-full bg-accent px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.12em] text-accent-foreground transition-transform hover:-translate-y-0.5 sm:inline-block" data-testid="link-subscribe-top">Get the briefing</a>
          <button type="button" className="grid h-9 w-9 place-items-center md:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen((open) => !open)} data-testid="button-toggle-navigation">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileNavOpen && (
          <nav className="absolute left-0 right-0 top-full border-b border-foreground/20 bg-background p-4 shadow-md md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4">
              <a className="signal-kicker signal-link" href="#briefing" onClick={() => setMobileNavOpen(false)} data-testid="mobile-link-briefing">Today’s briefing</a>
              <a className="signal-kicker signal-link" href="#dispatch" onClick={() => setMobileNavOpen(false)} data-testid="mobile-link-dispatch">The dispatch</a>
              <a className="signal-kicker signal-link" href="#about" onClick={() => setMobileNavOpen(false)} data-testid="mobile-link-about">Why 24?</a>
            </div>
          </nav>
        )}
      </header>

      {searchOpen && (
        <div className="search-drawer signal-container relative z-10 border-b border-foreground/20 py-5" data-testid="search-drawer">
          <div className="flex items-center gap-3 border-b-2 border-foreground/40 pb-3">
            <Search size={18} className="text-accent" />
            <input autoFocus type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the briefing..." className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60 sm:text-3xl" aria-label="Search stories" data-testid="input-search-stories" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search" data-testid="button-clear-search"><X size={17} /></button>}
          </div>
          {searchQuery && <p className="mt-3 font-mono-signal text-[10px] uppercase tracking-[.12em] text-muted-foreground" data-testid="text-search-count">{filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found in the sample archive</p>}
        </div>
      )}

      <section id="top" className="signal-container hero-grid relative mt-7 grid overflow-hidden border-y border-foreground/20 px-4 py-12 sm:mt-10 sm:px-10 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-14 lg:px-14">
        <div className="relative z-[1] reveal">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-accent" />
            <p className="signal-kicker text-accent">Your 24-hour filter</p>
          </div>
          <h1 className="max-w-3xl font-display text-[3.8rem] font-semibold leading-[.91] tracking-[-.065em] sm:text-[6.8rem] lg:text-[8rem]" data-testid="heading-hero">The signal<br /><em className="font-normal text-accent">beneath</em><br />the noise.</h1>
          <div className="mt-8 flex max-w-xl items-start gap-4 border-l-2 border-accent pl-4 sm:mt-10 sm:pl-5">
            <p className="text-[1rem] leading-relaxed text-muted-foreground sm:text-[1.08rem]">The important story, with enough context to know why it matters. A calm, curious briefing for people who have a lot to do.</p>
          </div>
          <a href="#briefing" className="mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-[.7rem] font-bold uppercase tracking-[.14em] text-primary-foreground transition-transform hover:-translate-y-1" data-testid="link-read-briefing">Read today’s briefing <ArrowDownRight size={15} /></a>
        </div>
        <div className="relative mt-12 flex min-h-[260px] items-end justify-between border-l border-foreground/20 pl-6 reveal reveal-delay-2 sm:min-h-[340px] sm:pl-10 lg:mt-0" data-testid="hero-signal-visual">
          <div className="absolute left-6 top-2 font-mono-signal text-[10px] uppercase tracking-[.15em] text-muted-foreground sm:left-10">Broadcasting since 06:00</div>
          <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border border-foreground/25 sm:h-[280px] sm:w-[280px]">
            <div className="absolute inset-7 rounded-full border border-foreground/20" />
            <div className="absolute inset-16 rounded-full border border-accent/80" />
            <div className="absolute inset-[35%] rounded-full bg-accent shadow-[0_0_0_12px_hsl(13_82%_57%_/_0.14)]" />
            <div className="absolute h-px w-[130%] rotate-[24deg] bg-foreground/35" />
            <div className="absolute h-px w-[130%] -rotate-[24deg] bg-foreground/15" />
            <span className="absolute -right-2 top-[28%] font-mono-signal text-[9px] uppercase tracking-[.13em] text-muted-foreground">Context</span>
            <span className="absolute -bottom-2 left-[16%] font-mono-signal text-[9px] uppercase tracking-[.13em] text-muted-foreground">Momentum</span>
          </div>
          <div className="absolute bottom-0 right-0 flex items-end gap-2">
            <span className="signal-kicker mb-1 text-muted-foreground [writing-mode:vertical-rl]">Reading time / 08:24</span>
            <div className="broadcast-bars"><span /><span /><span /><span /><span /><span /><span /></div>
          </div>
        </div>
      </section>

      <section id="briefing" className="signal-container pt-20 sm:pt-28">
        <div className="flex flex-col justify-between gap-6 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="signal-kicker text-accent">01 / Start here</p>
            <h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">The daily briefing</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Four stories worth the space they take up in your head. Updated for a human morning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 py-5" aria-label="Filter stories by topic">
          {topics.map((topic) => (
            <button type="button" key={topic} onClick={() => setActiveTopic(topic)} className={`rounded-full border px-4 py-2 font-mono-signal text-[10px] uppercase tracking-[.13em] transition-colors ${activeTopic === topic ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 hover:border-accent hover:text-accent'}`} aria-pressed={activeTopic === topic} data-testid={`button-topic-${topic.toLowerCase()}`}>{topic}</button>
          ))}
          <span className="ml-auto hidden items-center gap-2 font-mono-signal text-[10px] uppercase tracking-[.12em] text-muted-foreground sm:flex"><Clock3 size={13} /> 08 min read</span>
        </div>

        {filteredStories.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-10">
            <ArticleCard story={featured} onOpen={setSelectedStory} />
            <div className="border-t border-foreground/20 lg:border-t-0">
              {secondary.map((story) => <ArticleCard key={story.id} story={story} compact onOpen={setSelectedStory} />)}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-foreground/30 px-6 py-20 text-center" data-testid="empty-search-results">
            <Globe2 className="mx-auto mb-4 text-accent" size={28} />
            <h3 className="font-display text-3xl">Nothing on that frequency.</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Try a broader search, or return to the full briefing and let the day surprise you.</p>
            <button type="button" onClick={() => { setSearchQuery(''); setActiveTopic('All'); }} className="mt-5 rounded-full bg-primary px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.12em] text-primary-foreground" data-testid="button-reset-search">Reset the dial</button>
          </div>
        )}
      </section>

      <section id="dispatch" className="signal-container pt-24 sm:pt-36">
        <div className="grid gap-8 border-y border-foreground/20 py-7 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
          <div>
            <p className="signal-kicker text-accent">02 / Around the dial</p>
            <h2 className="mt-3 max-w-sm font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">A little more signal.</h2>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">Three quick reads for the space between the headlines. Small enough for a coffee queue, sharp enough to keep.</p>
            <div className="mt-9 flex items-center gap-3 font-mono-signal text-[10px] uppercase tracking-[.14em] text-muted-foreground"><Zap size={14} className="text-accent" /> Curated, not comprehensive</div>
          </div>
          <div className="grid divide-y divide-foreground/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ['World', 'The coastline is becoming a ledger', 'A new generation of maps is pricing risk in meters, not miles.', '04 min'],
              ['Technology', 'Your next computer may be a room', 'Ambient tools are moving from screens into the architecture around us.', '03 min'],
              ['Business', 'The most useful metric is a question', 'What gets measured changes when teams stop chasing the clean answer.', '05 min'],
            ].map(([topic, title, dek, read], index) => (
              <button type="button" key={topic} className="group text-left transition-colors first:pt-0 sm:px-6 sm:first:pl-0" onClick={() => setSelectedStory(stories[index + 4])} data-testid={`button-scan-${topic.toLowerCase()}`}>
                <div className="flex items-center justify-between py-5 sm:block sm:py-0">
                  <div>
                    <p className="signal-kicker text-accent">{topic} / 0{index + 1}</p>
                    <h3 className="mt-3 font-display text-2xl leading-[1.02] tracking-[-.03em] group-hover:text-accent">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{dek}</p>
                  </div>
                  <span className="mt-5 block whitespace-nowrap font-mono-signal text-[9px] uppercase tracking-[.12em] text-muted-foreground">{read} <ArrowUpRight size={12} className="ml-1 inline transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="signal-container mt-24 bg-primary px-5 py-12 text-primary-foreground sm:mt-36 sm:px-12 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20">
          <div>
            <p className="signal-kicker text-secondary">03 / In 24 hours</p>
            <h2 className="mt-4 max-w-md font-display text-5xl leading-[.92] tracking-[-.05em] sm:text-7xl">The day,<br /><em className="font-normal text-accent">in motion.</em></h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/65">News is not a pile. It is a sequence. Here is how the story moved while you were moving too.</p>
          </div>
          <div className="relative border-l border-primary-foreground/25 pl-6 sm:pl-10">
            {[
              ['06:00', 'The first light', 'Overnight signals are sorted into what changed, what held, and what can wait.'],
              ['12:00', 'The turn', 'The morning’s story meets the day’s facts. We look for the hinge, not the heat.'],
              ['18:00', 'The shape', 'A final read on what gathered momentum — and the quieter stories that deserve tomorrow.'],
            ].map(([time, title, description], index) => (
              <div key={time} className={`relative ${index < 2 ? 'pb-9' : ''}`}>
                <span className="absolute -left-[29px] top-0 h-3 w-3 rounded-full border-2 border-primary bg-accent sm:-left-[45px]" />
                <p className="font-mono-signal text-[10px] tracking-[.16em] text-secondary">{time}</p>
                <h3 className="mt-2 font-display text-2xl">{title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/60">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="signal-container pt-24 sm:pt-36">
        <div className="flex items-end justify-between border-b border-foreground/20 pb-5">
          <div>
            <p className="signal-kicker text-accent">04 / After hours</p>
            <h2 className="mt-2 font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl">Culture is a clue.</h2>
          </div>
          <button type="button" onClick={() => { setActiveTopic('Culture'); document.getElementById('briefing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hidden items-center gap-2 text-[.68rem] font-bold uppercase tracking-[.13em] hover:text-accent sm:flex" data-testid="button-explore-culture">Explore culture <ChevronRight size={14} /></button>
        </div>
        <div className="grid gap-8 py-8 lg:grid-cols-[1.45fr_.55fr]">
          <article className="story-hover grid gap-6 border-b border-foreground/15 pb-8 sm:grid-cols-[.95fr_1.05fr] sm:items-center lg:border-b-0 lg:border-r lg:pr-10" data-testid="card-culture-feature">
            <button type="button" className="text-left" onClick={() => setSelectedStory(stories[3])} data-testid="button-open-culture">
              <StoryArt tone={stories[3].tone} />
            </button>
            <div>
              <p className="signal-kicker text-accent">Culture / The city after dark</p>
              <h3 className="mt-3 font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-5xl">A city that refuses to go to sleep.</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">What we make room for after sunset tells us what we value in daylight. A field guide to the new night.</p>
              <button type="button" className="mt-6 flex items-center gap-2 text-[.68rem] font-bold uppercase tracking-[.13em] hover:text-accent" onClick={() => setSelectedStory(stories[3])} data-testid="button-read-culture">Read the feature <ArrowUpRight size={14} /></button>
            </div>
          </article>
          <div className="flex flex-col justify-center pl-0 lg:pl-2">
            <p className="signal-kicker text-muted-foreground">A thought to keep</p>
            <blockquote className="mt-4 font-display text-3xl leading-[1.02] tracking-[-.03em]">“Attention is the first form of participation.”</blockquote>
            <p className="mt-5 font-mono-signal text-[10px] uppercase tracking-[.14em] text-accent">— Simone Weil, re-read</p>
            <div className="mt-10 flex items-center gap-3"><div className="h-px w-12 bg-accent" /><span className="text-xs text-muted-foreground">Make a little room.</span></div>
          </div>
        </div>
      </section>

      <section id="newsletter" className="signal-container mt-24 border-y-2 border-primary py-10 sm:mt-36 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="signal-kicker text-accent">05 / Tomorrow’s signal</p>
            <h2 className="mt-3 max-w-lg font-display text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">Know what to carry into the day.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">The Signal 24 arrives once a day. No churn. No click maze. Just the four things that earned your attention.</p>
          </div>
          {signupStatus === 'success' ? (
            <div className="border border-accent bg-accent/10 p-6" data-testid="newsletter-confirmation">
              <div className="flex items-start gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Send size={15} /></div><div><p className="font-display text-2xl">You’re on the frequency.</p><p className="mt-1 text-sm text-muted-foreground">The next briefing will be waiting in your inbox. Until then, keep looking for the hinge.</p></div></div>
            </div>
          ) : (
            <form onSubmit={submitSignup} className="border border-foreground/20 bg-card p-5 sm:p-7" data-testid="form-newsletter">
              <label htmlFor="email" className="signal-kicker text-muted-foreground">Your email, kept private</label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input id="email" type="email" required placeholder="you@example.com" className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent" data-testid="input-newsletter-email" />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-submit-newsletter">Send the signal <Send size={13} /></button>
              </div>
              <p className="mt-4 font-mono-signal text-[9px] uppercase tracking-[.12em] text-muted-foreground">One email / every morning / unsubscribe anytime</p>
            </form>
          )}
        </div>
      </section>

      <footer className="signal-container flex flex-col justify-between gap-8 py-10 sm:flex-row sm:items-end">
        <div>
          <a href="#top" className="signal-link flex items-center gap-3" data-testid="link-footer-brand"><BrandMark /><span className="font-display text-xl">The Signal <span className="text-accent">24</span></span></a>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">A daily editorial filter for a world with too many open tabs.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono-signal text-[9px] uppercase tracking-[.14em] text-muted-foreground">
          <a href="#briefing" className="signal-link" data-testid="link-footer-briefing">Briefing</a>
          <a href="#dispatch" className="signal-link" data-testid="link-footer-dispatch">Dispatch</a>
          <a href="#newsletter" className="signal-link" data-testid="link-footer-newsletter">Newsletter</a>
          <span>© 2024 S24</span>
        </div>
      </footer>

      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/50 p-3 backdrop-blur-sm sm:items-center" role="presentation" onClick={() => setSelectedStory(null)} data-testid="story-modal-backdrop">
          <article className="relative max-h-[90dvh] w-full max-w-2xl overflow-auto bg-background p-5 shadow-md sm:p-8" role="dialog" aria-modal="true" aria-labelledby="story-modal-title" onClick={(event) => event.stopPropagation()} data-testid="story-modal">
            <button type="button" aria-label="Close story" onClick={() => setSelectedStory(null)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-foreground/20 hover:bg-primary hover:text-primary-foreground" data-testid="button-close-story"><X size={15} /></button>
            <p className="signal-kicker text-accent">{selectedStory.topic} / {selectedStory.eyebrow}</p>
            <h2 id="story-modal-title" className="mt-4 max-w-xl font-display text-4xl leading-[.98] tracking-[-.04em] sm:text-6xl">{selectedStory.title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{selectedStory.dek}</p>
            <div className="mt-7"><StoryArt tone={selectedStory.tone} /></div>
            <div className="mt-6 grid gap-4 border-t border-foreground/20 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="text-sm leading-relaxed text-muted-foreground">This is an editorial sample from The Signal 24. The full read would follow the thread, add the missing context, and leave you with a better question than the one you arrived with.</p>
              <span className="font-mono-signal text-[10px] uppercase tracking-[.13em] text-accent">{selectedStory.time} · {selectedStory.read}</span>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
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