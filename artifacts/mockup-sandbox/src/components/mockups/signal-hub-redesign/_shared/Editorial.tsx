import { ArrowUpRight, Clock3, ExternalLink } from 'lucide-react';
import type { SourceLead } from './data';

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="sh-kicker">{children}</p>;
}

export function SectionTitle({
  index,
  eyebrow,
  title,
  note,
}: {
  index?: string;
  eyebrow?: string;
  title: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="grid gap-5 border-y-2 border-[var(--sh-ink)] py-6 sm:grid-cols-[1fr_300px] sm:items-end">
      <div>
        {(index || eyebrow) && (
          <Eyebrow>
            {index ? `${index} / ` : ''}
            {eyebrow}
          </Eyebrow>
        )}
        <h2 className="sh-serif mt-3 text-4xl leading-[0.96] sm:text-6xl">
          {title}
        </h2>
      </div>
      {note && <p className="max-w-md text-sm leading-relaxed text-[var(--sh-muted)]">{note}</p>}
    </div>
  );
}

export function SourceStatus({
  children = 'External source · not Signal Hub reporting',
  tone = 'blue',
}: {
  children?: React.ReactNode;
  tone?: 'blue' | 'amber' | 'red';
}) {
  const toneClass =
    tone === 'amber'
      ? 'sh-tag--amber'
      : tone === 'red'
        ? 'sh-tag--red'
        : 'sh-tag--blue';
  return <span className={`sh-tag ${toneClass}`}>{children}</span>;
}

export function LeadRow({
  lead,
  compact = false,
  number,
}: {
  lead: SourceLead;
  compact?: boolean;
  number?: string;
}) {
  return (
    <article className="sh-source-panel grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:gap-8">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {number && <span className="sh-mono text-[9px] text-[var(--sh-muted)]">{number}</span>}
          <span className="sh-kicker">{lead.lane}</span>
          <SourceStatus />
        </div>
        <h3 className={`sh-serif max-w-3xl ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} leading-[1.04]`}>
          <a className="hover:text-[var(--sh-red)]" href={lead.href} target="_blank" rel="noreferrer">
            {lead.title}
          </a>
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sh-muted)]">
          {lead.summary}
        </p>
      </div>
      <div className="flex flex-row flex-wrap items-end justify-between gap-3 border-t border-[var(--sh-rule)] pt-3 text-[10px] sm:flex-col sm:items-start sm:justify-between sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div>
          <p className="sh-mono text-[var(--sh-ink)]">{lead.date}</p>
          <p className="mt-1 text-[var(--sh-muted)]">{lead.publisher}</p>
          <p className="mt-1 text-[var(--sh-muted)]">{lead.place}</p>
        </div>
        <a className="sh-link sh-mono inline-flex items-center gap-1" href={lead.href} target="_blank" rel="noreferrer">
          Read source <ArrowUpRight size={12} />
        </a>
      </div>
    </article>
  );
}

export function SourceCard({
  title,
  publisher,
  type,
  href,
  date,
}: {
  title: string;
  publisher: string;
  type: string;
  href: string;
  date?: string;
}) {
  return (
    <article className="sh-paper-panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="sh-kicker">Source document</p>
        <ExternalLink size={14} className="sh-muted" aria-hidden="true" />
      </div>
      <h3 className="sh-serif mt-3 text-xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--sh-muted)]">{publisher}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--sh-rule)] pt-3">
        <span className="sh-mono text-[9px] text-[var(--sh-muted)]">{type}</span>
        {date && <span className="sh-mono text-[9px] text-[var(--sh-muted)]">{date}</span>}
      </div>
      <a href={href} target="_blank" rel="noreferrer" className="sh-link sh-mono mt-4 inline-flex items-center gap-1 text-[9px]">
        View original <ArrowUpRight size={11} />
      </a>
    </article>
  );
}

export function ReadTime({ minutes }: { minutes?: number }) {
  return (
    <span className="sh-mono inline-flex items-center gap-1 text-[9px] text-[var(--sh-muted)]">
      <Clock3 size={11} aria-hidden="true" />
      {minutes ? `${minutes} min read` : 'Source read time not measured'}
    </span>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="sh-kicker mb-1 block">{children}</span>;
}