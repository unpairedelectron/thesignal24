import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { CountUp } from '@/components/home-stage';
import { useLang, useT } from '@/lib/i18n';
import { KEY_FIGURES, KEY_FIGURES_CHECKED_ON, type KeyFigure } from '@/lib/key-figures';

function FigureCard({ figure, index }: { figure: KeyFigure; index: number }) {
  const lang = useLang();
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 160, damping: 18 });
  const glare = useTransform([mx, my] as const, ([x, y]: number[]) => `radial-gradient(18rem 14rem at ${x * 100}% ${y * 100}%, hsl(42 80% 96% / .5), transparent 60%)`);
  const onMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width);
    my.set((event.clientY - rect.top) / rect.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };
  return <motion.article
    ref={ref}
    className={`figure-card is-${figure.tone}`}
    style={reduce ? undefined : { rotateX: rx, rotateY: ry }}
    onPointerMove={onMove}
    onPointerLeave={reset}
    initial={reduce ? false : { opacity: 0, y: 40, rotateX: 25 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, margin: '-8% 0px' }}
    transition={{ duration: 0.8, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    data-testid={`key-figure-${figure.id}`}
  >
    {!reduce && <motion.span className="figure-glare" aria-hidden="true" style={{ backgroundImage: glare }} />}
    <div className="figure-head"><span className="figure-status">{figure.status[lang]}</span><span className="figure-year">{figure.year}</span></div>
    <p className="figure-value">{figure.numeric !== undefined
      ? <CountUp to={figure.numeric} decimals={figure.decimals} prefix={figure.prefix} suffix={lang === 'hi' && figure.suffix === ' lakh' ? ' लाख' : figure.suffix} />
      : figure.value}</p>
    <h3 className="figure-label">{figure.label[lang]}</h3>
    <p className="figure-definition">{figure.definition[lang]}</p>
    <p className="figure-foot"><span>{figure.geography[lang]}</span><a href={figure.source.url} target="_blank" rel="noopener noreferrer">{t('Source', 'स्रोत')}: {figure.source.name} <ExternalLink size={10} /></a></p>
  </motion.article>;
}

/** The numbers the reservation debate turns on, each with its frame attached. */
export function KeyFigures({ limit }: { limit?: number }) {
  const t = useT();
  const figures = limit ? KEY_FIGURES.slice(0, limit) : KEY_FIGURES;
  return <div>
    <div className="figure-grid">{figures.map((figure, index) => <FigureCard key={figure.id} figure={figure} index={index} />)}</div>
    <p className="mt-4 signal-kicker text-muted-foreground">{t('Every figure: value, unit, year, geography, definition, source. Last checked', 'हर आंकड़ा: मान, इकाई, वर्ष, भूगोल, परिभाषा, स्रोत। आख़िरी जाँच')} {new Date(`${KEY_FIGURES_CHECKED_ON}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
  </div>;
}
