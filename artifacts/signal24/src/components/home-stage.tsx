import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import type { LocalizedStory } from '@/lib/i18n';
import { useLabel, useLang, useLocalHref, useT } from '@/lib/i18n';
import { daysSince, RUNNING_CLOCKS } from '@/lib/key-figures';

type StageProps = {
  stories: LocalizedStory[];
  storyHref: (story: LocalizedStory) => string;
};

/**
 * A number that counts up the first time it scrolls into view. The final value is
 * in the DOM from the first render, so anything that reads the page without
 * scrolling (print, screenshots, crawlers, screen readers) gets the real number.
 */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', className = '' }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const lang = useLang();
  const played = useRef(false);
  const format = (value: number) => `${prefix}${value.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: 'latn' } as Intl.NumberFormatOptions)}${suffix}`;
  const [text, setText] = useState(() => format(to));
  useEffect(() => {
    // Animate once, the first time a non-zero value is on screen; afterwards just show it.
    if (reduce || !inView || played.current || to === 0) { setText(format(to)); return; }
    played.current = true;
    const controls = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (value) => setText(format(value)) });
    return () => { controls.stop(); setText(format(to)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, reduce, lang]);
  return <span ref={ref} className={className}>{text}</span>;
}

/**
 * The front-page stage: curtains part on a dark proscenium, a ring of case files turns
 * in 3D under a spotlight that follows the reader, and running clocks count the days
 * the state has kept things waiting. Everything degrades to a static layout when the
 * reader prefers reduced motion.
 */
export function HomeStage({ stories, storyHref }: StageProps) {
  const t = useT();
  const label = useLabel();
  const lang = useLang();
  const reduce = useReducedMotion() ?? false;
  const localHref = useLocalHref();
  const sectionRef = useRef<HTMLElement>(null);
  const files = useMemo(() => stories.slice(0, 8), [stories]);
  const lead = stories.find((story) => story.kind !== 'Opinion') ?? stories[0];

  // Pointer → spotlight and tilt.
  const px = useMotionValue(0.62);
  const py = useMotionValue(0.38);
  const sx = useSpring(px, { stiffness: 90, damping: 20 });
  const sy = useSpring(py, { stiffness: 90, damping: 20 });
  const spotX = useTransform(sx, (v) => `${v * 100}%`);
  const spotY = useTransform(sy, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(42rem 30rem at ${spotX} ${spotY}, hsl(42 70% 88% / .22), transparent 62%)`;
  const tiltX = useTransform(sy, [0, 1], [10, -14]);
  const tiltY = useTransform(sx, [0, 1], [-10, 10]);

  // Ring rotation: slow auto-turn, paused on hover/focus, steered by keyboard focus.
  const rotation = useMotionValue(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  useAnimationFrame((_, delta) => {
    if (reduce || hovered.current || focused.current) return;
    rotation.set(rotation.get() - Math.min(delta, 64) * 0.0075);
  });
  const step = files.length ? 360 / files.length : 0;
  const bringToFront = (index: number) => {
    focused.current = true;
    const current = rotation.get();
    const target = -index * step;
    const turns = Math.round((current - target) / 360);
    void animate(rotation, target + turns * 360, { type: 'spring', stiffness: 60, damping: 16 });
  };

  // Scroll: the camera dollies in and the copy lifts away as the reader leaves the stage.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0]);
  const ringScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.35]);
  const ringLift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const headline = t('Power, on the record.', 'सत्ता, दस्तावेज़ों के आईने में।').split(' ');
  const today = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
  const curtainDelay = reduce ? 0 : 0.15;
  const copyDelay = reduce ? 0 : 1.05;

  return <section ref={sectionRef} className="stage" aria-labelledby="stage-title" onPointerMove={onPointerMove} data-testid="home-stage">
    <div className="stage-backdrop" aria-hidden="true" />
    <motion.div className="stage-spotlight" aria-hidden="true" style={{ backgroundImage: spotlight }} />
    <div className="stage-floor" aria-hidden="true" />
    <div className="stage-grain" aria-hidden="true" />

    <div className="stage-inner signal-container">
      <motion.div className="stage-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <motion.p className="stage-kicker" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: copyDelay, duration: 0.6 }}>
          <span className="stage-live-dot" /> {t('Tonight’s hearing', 'आज की सुनवाई')} · <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
        </motion.p>
        <h1 id="stage-title" className="stage-title">
          {headline.map((word, index) => <span key={`${word}-${index}`} className="stage-word-mask">
            <motion.span className={`stage-word ${index === headline.length - 1 || (lang === 'en' && index > 0) ? 'is-accent' : ''}`} initial={reduce ? false : { y: '115%', rotateX: -70 }} animate={{ y: '0%', rotateX: 0 }} transition={{ delay: copyDelay + 0.12 + index * 0.09, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>{word}</motion.span>
          </span>)}
        </h1>
        <motion.p className="stage-dek" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: copyDelay + 0.55, duration: 0.7 }}>
          {t('Governments promise. Courts rule. Commissions report, eventually. We put every document on the stage, under the light, with its source attached, so nobody gets to perform in the dark.', 'सरकारें वादे करती हैं। अदालतें फ़ैसले देती हैं। आयोग रिपोर्ट देते हैं, देर-सबेर। हम हर दस्तावेज़ को मंच पर, रोशनी में, उसके स्रोत के साथ रखते हैं, ताकि कोई अँधेरे में अभिनय न कर सके।')}
        </motion.p>
        <motion.div className="stage-actions" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: copyDelay + 0.7, duration: 0.7 }}>
          {lead && <Link href={storyHref(lead)} className="stage-cta is-primary" data-testid="link-stage-lead">{t('Read tonight’s lead', 'आज की मुख्य ख़बर पढ़ें')} <ArrowUpRight size={15} /></Link>}
          <Link href="/policies" className="stage-cta" data-testid="link-stage-ledger">{t('Open the policy ledger', 'नीति रजिस्टर खोलें')}</Link>
          <a href="#accountability" className="stage-cta is-quiet">{t('What they’re withholding', 'वे क्या छिपा रहे हैं')} <ArrowDownRight size={15} /></a>
        </motion.div>
      </motion.div>

      {files.length > 0 && <motion.div className="stage-scene" style={{ scale: ringScale, y: ringLift }} onPointerEnter={() => { hovered.current = true; }} onPointerLeave={() => { hovered.current = false; }}>
        <motion.div className="stage-tilt" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY }}>
          <motion.ul className="stage-ring" aria-label={t('Case files on tonight’s stage', 'आज मंच पर रखी फ़ाइलें')} style={{ rotateY: rotation, ['--files' as string]: files.length }} initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: copyDelay - 0.2, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
            {files.map((story, index) => <li key={story.id} className="stage-file" style={{ ['--i' as string]: index }}>
              <Link href={storyHref(story)} className="stage-file-card" onFocus={() => bringToFront(index)} onBlur={() => { focused.current = false; }} data-testid={`link-stage-file-${story.id}`}>
                <span className="stage-file-tab">{label(story.topic)}</span>
                <span className="stage-file-meta">{story.kind === 'Opinion' ? label('Opinion') : label(story.kind)} · {label(story.state ?? 'National')}</span>
                <span lang={story.contentLang} className="stage-file-title">{story.title}</span>
                <span className="stage-file-foot"><span>{t(`${story.sourceCount ?? 0} sources`, `${story.sourceCount ?? 0} स्रोत`)}</span><span className={`stage-stamp ${story.kind === 'Opinion' ? 'is-opinion' : ''}`}>{story.kind === 'Opinion' ? label('Opinion') : label(story.verificationStatus)}</span></span>
              </Link>
            </li>)}
          </motion.ul>
        </motion.div>
        <div className="stage-pedestal" aria-hidden="true" />
      </motion.div>}
    </div>

    <div className="stage-clocks signal-container" aria-label={t('Running clocks', 'चलती घड़ियाँ')}>
      {RUNNING_CLOCKS.map((clock, index) => {
        const body = <>
          <CountUp to={daysSince(clock.since)} className="stage-clock-value" />
          <span className="stage-clock-unit">{clock.unit[lang]}</span>
          <span className="stage-clock-label">{clock.label[lang]}</span>
        </>;
        return <motion.div key={clock.id} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: copyDelay + 0.9 + index * 0.12, duration: 0.7 }}>
          {clock.href.startsWith('/#')
            ? <a href={localHref(clock.href)} className="stage-clock" data-testid={`link-stage-clock-${clock.id}`}>{body}</a>
            : <Link href={clock.href} className="stage-clock" data-testid={`link-stage-clock-${clock.id}`}>{body}</Link>}
        </motion.div>;
      })}
    </div>

    {stories.length > 0 && <div className="stage-marquee" aria-hidden="true">
      <div className="stage-marquee-track">
        {[...stories.slice(0, 8), ...stories.slice(0, 8)].map((story, index) => <span key={`${story.id}-${index}`} lang={story.contentLang}><b>{label(story.topic)}</b> {story.title}</span>)}
      </div>
    </div>}

    <motion.div className="stage-curtain is-left" aria-hidden="true" initial={reduce ? { x: '-101%' } : { x: '0%' }} animate={{ x: '-101%' }} transition={{ delay: curtainDelay, duration: reduce ? 0 : 1.5, ease: [0.7, 0, 0.2, 1] }} />
    <motion.div className="stage-curtain is-right" aria-hidden="true" initial={reduce ? { x: '101%' } : { x: '0%' }} animate={{ x: '101%' }} transition={{ delay: curtainDelay, duration: reduce ? 0 : 1.5, ease: [0.7, 0, 0.2, 1] }} />
    <div className="stage-valance" aria-hidden="true" />
  </section>;
}
