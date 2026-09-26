import { useState } from 'react';
import { ArrowDown, ArrowUpRight, FileText, MoveDown, Scale } from 'lucide-react';
import { AppShell } from './_shared/AppShell';
import { policyRecord, policyTimeline } from './_shared/data';
import './_group.css';

export function Timeline() {
  const [layout, setLayout] = useState<'vertical' | 'rail'>('vertical');

  return (
    <AppShell active="Data">
      <div className="sh-container pb-14 pt-10 sm:pb-20 sm:pt-16">
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <span className="sh-tag sh-tag--amber">Policy chronology</span>
          <span className="sh-mono text-[9px] text-[var(--sh-muted)]">103rd Amendment / primary-source record</span>
        </div>

        <header className="grid gap-7 border-y-2 border-[var(--sh-ink)] py-7 sm:py-10 lg:grid-cols-[1fr_315px] lg:items-end">
          <div>
            <p className="sh-kicker">Two dates / one constitutional record</p>
            <h1 className="sh-serif mt-4 max-w-4xl text-5xl leading-[.91] sm:text-7xl lg:text-[6.3rem]">
              A rule enters.<br /><em className="font-normal text-[var(--sh-blue)]">A court answers.</em>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--sh-muted)]">
            The 103rd Amendment’s effective date and the Supreme Court’s later judgment are presented as separate milestones. This chronology contains only dates supported by the supplied primary-source record.
          </p>
        </header>

        <section aria-label="Timeline layout controls" className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sh-rule)] py-4">
          <p className="sh-mono text-[9px] text-[var(--sh-muted)]">View chronology / 2 sourced milestones</p>
          <div className="flex gap-2" role="group" aria-label="Choose timeline layout">
            <button type="button" aria-pressed={layout === 'vertical'} onClick={() => setLayout('vertical')} className={`sh-button !min-h-[37px] !px-3 ${layout === 'vertical' ? '' : 'sh-button--outline'}`}>
              <MoveDown size={12} aria-hidden="true" /> Vertical chronology
            </button>
            <button type="button" aria-pressed={layout === 'rail'} onClick={() => setLayout('rail')} className={`sh-button !min-h-[37px] !px-3 ${layout === 'rail' ? '' : 'sh-button--outline'}`}>
              <ArrowDown size={12} aria-hidden="true" className="rotate-[-90deg]" /> Milestone rail
            </button>
          </div>
        </section>

        <section aria-label="103rd Amendment milestones" className="mt-8">
          {layout === 'vertical' ? (
            <ol className="relative ml-3 border-l border-[var(--sh-rule)] sm:ml-5">
              {policyTimeline.map((event, index) => (
                <li key={event.date} className="relative pb-10 pl-7 last:pb-0 sm:pl-10">
                  <span className={`absolute -left-[6px] top-1 h-3 w-3 rounded-full border-2 border-[var(--sh-paper)] ${index === 0 ? 'bg-[var(--sh-red)]' : 'bg-[var(--sh-blue)]'}`} aria-hidden="true" />
                  <article className="grid gap-4 border-t-2 border-[var(--sh-ink)] pt-5 sm:grid-cols-[170px_minmax(0,1fr)_180px] sm:gap-7 sm:pt-6">
                    <div>
                      <p className={`sh-mono text-[10px] ${index === 0 ? 'text-[var(--sh-red)]' : 'text-[var(--sh-blue)]'}`}>{event.date}</p>
                      <p className="mt-2 sh-kicker">{index === 0 ? 'Effective date' : 'Judgment date'}</p>
                    </div>
                    <div>
                      <h2 className="sh-serif max-w-2xl text-3xl leading-tight sm:text-4xl">{event.title}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sh-muted)]">{event.context}</p>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-4 border-t border-[var(--sh-rule)] pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div><p className="sh-kicker">Original source</p><p className="mt-2 text-xs leading-relaxed">{event.source}</p></div>
                      <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={event.href} target="_blank" rel="noreferrer">
                        Read source <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className="relative grid gap-8 pt-2 md:grid-cols-2 md:gap-10">
              <div className="absolute left-0 right-0 top-[21px] hidden h-px bg-[var(--sh-rule)] md:block" aria-hidden="true" />
              {policyTimeline.map((event, index) => (
                <article key={event.date} className="relative border-t-2 border-[var(--sh-ink)] pt-5 sm:pt-6">
                  <span className={`mb-5 block h-3 w-3 rounded-full border-2 border-[var(--sh-paper)] ${index === 0 ? 'bg-[var(--sh-red)]' : 'bg-[var(--sh-blue)]'} md:relative md:-top-[31px] md:mb-[-3px]`} aria-hidden="true" />
                  <p className={`sh-mono text-[10px] ${index === 0 ? 'text-[var(--sh-red)]' : 'text-[var(--sh-blue)]'}`}>{event.date}</p>
                  <p className="mt-2 sh-kicker">{index === 0 ? 'Effective date' : 'Judgment date'}</p>
                  <h2 className="sh-serif mt-4 max-w-xl text-3xl leading-tight sm:text-4xl">{event.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--sh-muted)]">{event.context}</p>
                  <div className="mt-6 flex flex-col items-start gap-3 border-t border-[var(--sh-rule)] pt-4">
                    <p className="sh-mono text-[9px] text-[var(--sh-muted)]">{event.source}</p>
                    <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={event.href} target="_blank" rel="noreferrer">
                      Read original source <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="record-context" className="mt-14 grid gap-7 border-y border-[var(--sh-ink)] py-7 sm:py-9 lg:grid-cols-[.74fr_1.26fr]">
          <div>
            <div className="flex items-center gap-2"><Scale size={16} aria-hidden="true" className="text-[var(--sh-red)]" /><p className="sh-kicker">Record context</p></div>
            <h2 id="record-context" className="sh-serif mt-3 text-4xl leading-[.98] sm:text-5xl">Keep the source and status in view.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="border-l-2 border-[var(--sh-red)] pl-4">
              <p className="sh-kicker">Official record</p>
              <p className="sh-serif mt-2 text-2xl">{policyRecord.legalBasis}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">Effective {policyRecord.effectiveDate}. The source is constitutional text published by the Legislative Department.</p>
              <a className="sh-link sh-mono mt-4 inline-flex items-center gap-1 text-[9px]" href={policyRecord.sources[0].href} target="_blank" rel="noreferrer">
                <FileText size={12} aria-hidden="true" /> Constitution of India <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </article>
            <article className="border-l-2 border-[var(--sh-blue)] pl-4">
              <p className="sh-kicker">Court status</p>
              <p className="sh-serif mt-2 text-2xl">{policyRecord.judgment}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">On {policyRecord.judgmentDate}, the Supreme Court upheld the amendment.</p>
              <a className="sh-link sh-mono mt-4 inline-flex items-center gap-1 text-[9px]" href={policyRecord.sources[1].href} target="_blank" rel="noreferrer">
                <FileText size={12} aria-hidden="true" /> Supreme Court judgment <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </article>
          </div>
        </section>

        <aside className="mt-8 border border-[var(--sh-rule)] bg-[var(--sh-white)] p-5 sm:p-6">
          <p className="sh-kicker">Reading note / scope</p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--sh-muted)]">
            This is a two-event chronology, not a complete history of reservation law. It distinguishes the official constitutional record from the court’s judgment; it does not add intervening events, trend claims, or unverified effects. Open-category seats are open to all candidates who qualify, not exclusive to upper-caste applicants.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}