import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import type { EvidenceEventDetail } from '@workspace/api-client-react';
import { CountUp } from '@/components/home-stage';
import { basePath } from '@/lib/seo';
import { useLang, useT } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;

function formatDay(value: string, lang: 'en' | 'hi') {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

export type TopicStat = { value: number; label: string };

/**
 * A compact stage for topic pages: the same dark proscenium as the front page,
 * a headline that rises into the light, running counts, and the desk's
 * illustration hung as a 3D exhibit that turns toward the reader's pointer.
 */
export function TopicHero({ kicker, back, headline, accent, standfirst, stats, illustration, illustrationAlt, exhibits = [] }: {
  kicker: string;
  back?: ReactNode;
  headline: string;
  accent: string;
  standfirst: string;
  stats: TopicStat[];
  illustration: string;
  illustrationAlt: string;
  exhibits?: Array<{ title: string; meta: string; lang?: string }>;
}) {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  const px = useMotionValue(0.6);
  const py = useMotionValue(0.4);
  const sx = useSpring(px, { stiffness: 80, damping: 18 });
  const sy = useSpring(py, { stiffness: 80, damping: 18 });
  const spotlight = useMotionTemplate`radial-gradient(36rem 26rem at ${useTransform(sx, (v) => `${v * 100}%`)} ${useTransform(sy, (v) => `${v * 100}%`)}, hsl(42 70% 88% / .2), transparent 62%)`;
  const rotateY = useTransform(sx, [0, 1], [14, -14]);
  const rotateX = useTransform(sy, [0, 1], [-10, 10]);
  const onMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };
  const words = [...headline.split(' ').map((word) => ({ word, accent: false })), ...accent.split(' ').map((word) => ({ word, accent: true }))];
  return <section className="stage topic-stage" onPointerMove={onMove} data-testid="topic-stage">
    <div className="stage-backdrop" aria-hidden="true" />
    <m.div className="stage-spotlight" aria-hidden="true" style={{ backgroundImage: spotlight }} />
    <div className="stage-floor" aria-hidden="true" />
    <div className="stage-grain" aria-hidden="true" />
    <div className="stage-valance" aria-hidden="true" />
    <div className="stage-inner signal-container">
      <div className="stage-copy">
        {back && <div className="topic-stage-back">{back}</div>}
        <m.p className="stage-kicker" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><span className="stage-live-dot" /> {kicker}</m.p>
        <h1 className="stage-title topic-stage-title">
          {words.map(({ word, accent: isAccent }, index) => <span key={`${word}-${index}`} className="stage-word-mask">
            <m.span className={`stage-word ${isAccent ? 'is-accent' : ''}`} initial={reduce ? false : { y: '115%', rotateX: -70 }} animate={{ y: '0%', rotateX: 0 }} transition={{ delay: 0.15 + index * 0.06, duration: 0.85, ease: EASE }}>{word}</m.span>
          </span>)}
        </h1>
        <m.p className="stage-dek" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }}>{standfirst}</m.p>
        <m.dl className="topic-stage-stats" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }}>
          {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd><CountUp to={stat.value} /></dd></div>)}
        </m.dl>
      </div>
      <div className="topic-exhibit-scene">
        <m.div className="topic-exhibit" style={reduce ? undefined : { rotateX, rotateY }} initial={reduce ? false : { opacity: 0, rotateY: -35, z: -200 }} animate={{ opacity: 1, rotateY: 0, z: 0 }} transition={{ delay: 0.25, duration: 1.2, ease: EASE }}>
          {exhibits.slice(0, 2).map((exhibit, index) => <div key={exhibit.title} className="topic-exhibit-paper" aria-hidden="true" style={{ ['--depth' as string]: index + 1 }}>
            <span className="topic-exhibit-meta">{exhibit.meta}</span>
            <span lang={exhibit.lang} className="topic-exhibit-title">{exhibit.title}</span>
          </div>)}
          <figure className="topic-exhibit-frame">
            <img src={`${basePath}/illustrations/${illustration}.svg`} alt={illustrationAlt} width={1600} height={900} decoding="async" fetchPriority="high" />
          </figure>
          <span className="topic-exhibit-stamp" aria-hidden="true">{exhibits.length ? t('On the record', 'रिकॉर्ड पर') : t('Awaiting records', 'रिकॉर्ड की प्रतीक्षा')}</span>
        </m.div>
        <div className="stage-pedestal" aria-hidden="true" />
      </div>
    </div>
  </section>;
}

export type CabinetDrawer = {
  href: string;
  title: string;
  count: string;
  headline: string;
  papers: Array<{ title: string; lang?: string }>;
  illustration: string;
  testId: string;
};

/** The topic index as a cabinet of hanging files that lift toward the reader. */
export function TopicCabinet({ drawers }: { drawers: CabinetDrawer[] }) {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  return <div className="topic-cabinet">
    {drawers.map((drawer, index) => <m.div key={drawer.href} initial={reduce ? false : { opacity: 0, y: 50, rotateX: -35 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: '-5% 0px' }} transition={{ delay: (index % 3) * 0.1, duration: 0.9, ease: EASE }} className="topic-drawer-wrap">
      <Link href={drawer.href} className="topic-drawer" data-testid={drawer.testId}>
        <span className="topic-drawer-tab">{drawer.title}</span>
        <span className="topic-drawer-papers" aria-hidden="true">
          {drawer.papers.slice(0, 3).map((paper, paperIndex) => <span key={paper.title} lang={paper.lang} className="topic-drawer-paper" style={{ ['--n' as string]: paperIndex }}>{paper.title}</span>)}
        </span>
        <span className="topic-drawer-face">
          <img src={`${basePath}/illustrations/${drawer.illustration}.svg`} alt="" width={1600} height={900} loading="lazy" decoding="async" />
          <span className="topic-drawer-body">
            <span className="topic-drawer-count">{drawer.count}</span>
            <span className="topic-drawer-title">{drawer.title}</span>
            <span className="topic-drawer-headline">{drawer.headline}</span>
            <span className="topic-drawer-open">{t('Open the file', 'फ़ाइल खोलें')} <ArrowUpRight size={13} /></span>
          </span>
        </span>
      </Link>
    </m.div>)}
  </div>;
}

/** Dated events on a lit spine; each card swings in from the side as it is reached. */
export function EvidenceSpine({ events }: { events: EvidenceEventDetail[] }) {
  const reduce = useReducedMotion() ?? false;
  const lang = useLang();
  const t = useT();
  return <ol className="evidence-spine">
    {events.map((item, index) => {
      const sources = [...item.primarySources, ...item.secondarySources];
      const side = index % 2 === 0 ? 'is-left' : 'is-right';
      return <m.li key={item.event.id} className={`evidence-spine-item ${side}`} initial={reduce ? false : { opacity: 0, rotateY: index % 2 === 0 ? 40 : -40, x: index % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, rotateY: 0, x: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.8, ease: EASE }}>
        <span className="evidence-spine-dot" aria-hidden="true" />
        <time className="evidence-spine-date" dateTime={item.event.recordDate ?? undefined}>{item.event.recordDate ? formatDay(item.event.recordDate, lang) : t('Undated', 'तारीख़ नहीं')}</time>
        <article className="evidence-spine-card">
          <Link href={`/events/${item.event.id}`} className="group block"><h3 lang="en" className="font-display text-2xl leading-tight group-hover:text-accent">{item.event.title}</h3></Link>
          {item.event.summary && <p lang="en" className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.event.summary}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-foreground/15 pt-3">
            {sources.slice(0, 2).map((source) => source.sourceUrl
              ? <a key={source.id} href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 signal-kicker text-accent hover:underline" lang="en">{source.publisher} <ExternalLink size={10} /></a>
              : <span key={source.id} className="signal-kicker text-muted-foreground" lang="en">{source.publisher}</span>)}
            <span className="signal-kicker text-muted-foreground">{t(`${item.articleCount} linked records`, `${item.articleCount} जुड़े रिकॉर्ड`)}</span>
          </div>
        </article>
      </m.li>;
    })}
  </ol>;
}
