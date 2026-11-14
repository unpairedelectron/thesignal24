import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useLang } from '@/lib/i18n';

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
