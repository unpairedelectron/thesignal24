import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { CountUp } from '@/components/home-stage';
import { useLang, useT } from '@/lib/i18n';
import { daysSince, type Bilingual } from '@/lib/key-figures';

const EASE = [0.16, 1, 0.3, 1] as const;

export type Demand = {
  id: string;
  since: string;
  question: Bilingual;
  ask: Bilingual;
  status: Bilingual;
  sources: Array<{ name: string; url: string }>;
};

/**
 * The demand board: each unanswered question as a card that turns over to show
 * what we asked for. The day count runs from the sourced date the question opened.
 * Both faces are in the DOM for screen readers; under reduced motion they stack.
 */
export function DemandBoard({ demands }: { demands: Demand[] }) {
  const lang = useLang();
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  return <ol className={`demand-board ${reduce ? 'is-static' : ''}`}>
    {demands.map((demand, index) => <motion.li key={demand.id} className="demand-card" tabIndex={0} initial={reduce ? false : { opacity: 0, y: 40, rotateX: 30 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: '-5% 0px' }} transition={{ delay: (index % 3) * 0.08, duration: 0.8, ease: EASE }} data-testid={`demand-${demand.id}`}>
      <div className="demand-card-inner">
        <div className="demand-face is-front">
          <p className="demand-status">{demand.status[lang]}</p>
          <p className="demand-days"><CountUp to={daysSince(demand.since)} /><span>{t('days unanswered', 'दिन से अनुत्तरित')}</span></p>
          <h3 className="demand-question">{demand.question[lang]}</h3>
          <p className="demand-hint" aria-hidden="true">{t('Turn over for the demand →', 'माँग देखने के लिए पलटिए →')}</p>
        </div>
        <div className="demand-face is-back">
          <p className="demand-status">{t('What we are asking for', 'हम क्या माँग रहे हैं')}</p>
          <p className="demand-ask">{demand.ask[lang]}</p>
          <p className="demand-sources">{demand.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.name} <ExternalLink size={10} /></a>)}</p>
        </div>
      </div>
    </motion.li>)}
  </ol>;
}

type CeilingRow = { id: string; label: Bilingual; value: number; status: 'in-force' | 'struck-down'; note: Bilingual; year: string };

/** Total SC/ST/backward-class reservation (EWS excluded), each figure as stated in a published record on this site. */
const CEILING_ROWS: CeilingRow[] = [
  { id: 'central', label: { en: 'Central government', hi: 'केंद्र सरकार' }, value: 49.5, status: 'in-force', year: '1990', note: { en: 'SC 15% + ST 7.5% + OBC 27%', hi: 'एससी 15% + एसटी 7.5% + ओबीसी 27%' } },
  { id: 'tamil-nadu', label: { en: 'Tamil Nadu', hi: 'तमिलनाडु' }, value: 69, status: 'in-force', year: '1994', note: { en: 'Placed in the Ninth Schedule by the 76th Amendment', hi: '76वें संशोधन से नौवीं अनुसूची में' } },
  { id: 'bihar', label: { en: 'Bihar', hi: 'बिहार' }, value: 65, status: 'struck-down', year: '2023', note: { en: 'Struck down by the Patna High Court, June 2024; appeal pending', hi: 'पटना हाई कोर्ट ने जून 2024 में रद्द किया; अपील लंबित' } },
];

/** Quota laws against the 50% ceiling: one measure, one axis, status by colour and by text. */
export function CeilingChart() {
  const t = useT();
  const lang = useLang();
  const reduce = useReducedMotion() ?? false;
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [hover, setHover] = useState<string | null>(null);
  const max = 80;
  const statusText = (status: CeilingRow['status']) => status === 'in-force' ? t('In force', 'लागू') : t('Struck down', 'रद्द');
  return <figure className="ceiling-chart" aria-labelledby="ceiling-chart-title">
    <div className="ceiling-chart-head">
      <div>
        <p className="signal-kicker text-accent">{t('Chart / total reservation, EWS excluded', 'चार्ट / कुल आरक्षण, ईडब्ल्यूएस को छोड़कर')}</p>
        <h3 id="ceiling-chart-title" className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{t('Against the ceiling.', 'सीमा के सामने।')}</h3>
      </div>
      <div className="ceiling-chart-toggle" role="group" aria-label={t('Chart or table', 'चार्ट या तालिका')}>
        <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>{t('Chart', 'चार्ट')}</button>
        <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>{t('Table', 'तालिका')}</button>
      </div>
    </div>
    <ul className="ceiling-legend" aria-label={t('Legend', 'संकेत')}>
      <li><span className="ceiling-swatch is-in-force" /> {statusText('in-force')}</li>
      <li><span className="ceiling-swatch is-struck-down" /> {statusText('struck-down')}</li>
      <li><span className="ceiling-swatch is-line" /> {t('50% ceiling, Indra Sawhney (1992)', '50% सीमा, इंद्रा साहनी (1992)')}</li>
    </ul>
    {view === 'chart' ? <div className="ceiling-plot" role="img" aria-label={CEILING_ROWS.map((row) => `${row.label[lang]} ${row.value}% (${statusText(row.status)})`).join('; ')}>
      <div className="ceiling-line" style={{ left: `${(50 / max) * 100}%` }}><span>50%</span></div>
      {CEILING_ROWS.map((row, index) => <div key={row.id} className={`ceiling-row ${hover && hover !== row.id ? 'is-dim' : ''}`} onPointerEnter={() => setHover(row.id)} onPointerLeave={() => setHover(null)}>
        <div className="ceiling-row-label"><span className="ceiling-row-name">{row.label[lang]}</span><span className="ceiling-row-year">{row.year}</span></div>
        <div className="ceiling-track">
          <motion.span className={`ceiling-bar is-${row.status}`} initial={reduce ? false : { width: 0 }} whileInView={{ width: `${(row.value / max) * 100}%` }} style={reduce ? { width: `${(row.value / max) * 100}%` } : undefined} viewport={{ once: true }} transition={{ delay: index * 0.12, duration: 1, ease: EASE }} />
          <span className="ceiling-value">{row.value}% <em>{statusText(row.status)}</em></span>
          {hover === row.id && <span className="ceiling-tip" role="tooltip">{row.note[lang]}</span>}
        </div>
      </div>)}
      <div className="ceiling-axis" aria-hidden="true">{[0, 20, 40, 60, 80].map((tick) => <span key={tick} style={{ left: `${(tick / max) * 100}%` }}>{tick}%</span>)}</div>
    </div> : <table className="ceiling-table">
      <thead><tr><th>{t('Jurisdiction', 'क्षेत्र')}</th><th>{t('Year', 'वर्ष')}</th><th>{t('Total', 'कुल')}</th><th>{t('Status', 'स्थिति')}</th><th>{t('Note', 'टिप्पणी')}</th></tr></thead>
      <tbody>{CEILING_ROWS.map((row) => <tr key={row.id}><td>{row.label[lang]}</td><td>{row.year}</td><td>{row.value}%</td><td>{statusText(row.status)}</td><td>{row.note[lang]}</td></tr>)}</tbody>
    </table>}
    <figcaption className="ceiling-caption">{t('Shares of seats and posts reserved for SC, ST and backward classes, excluding the separate 10% EWS quota. Figures as stated in this site’s ledger and reporting: the Mandal memorandum record, the three-states explainer and the Bihar ledger entry.', 'एससी, एसटी और पिछड़े वर्गों के लिए आरक्षित सीटों और पदों का हिस्सा, अलग 10% ईडब्ल्यूएस कोटे को छोड़कर। आंकड़े इस साइट के रजिस्टर और रिपोर्टिंग से: मंडल ज्ञापन रिकॉर्ड, तीन राज्यों वाली व्याख्या और बिहार रजिस्टर प्रविष्टि।')}</figcaption>
  </figure>;
}
