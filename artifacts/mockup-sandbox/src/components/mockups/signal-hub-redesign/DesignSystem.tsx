import { ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, CircleAlert, ExternalLink, FileText, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppShell } from './_shared/AppShell';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';
import './_group.css';

const lanes = ['All lanes', ...Array.from(new Set(sourceLeads.map((lead) => lead.lane)))];
const evidenceKinds = [
  { title: 'Official record', tone: 'blue', detail: 'Text published by an authority.' },
  { title: 'Court status', tone: 'amber', detail: 'Procedural posture, tied to a date.' },
  { title: 'Litigant claim', tone: 'red', detail: 'A party’s position, not a finding.' },
  { title: 'Analysis', tone: '', detail: 'Interpretation, labelled as analysis.' },
  { title: 'External lead', tone: 'blue', detail: 'A source for editorial review, not Signal Hub reporting.' },
];

function DemoHeading({ id, number, title, note }: { id: string; number: string; title: string; note: string }) {
  return (
    <div id={id} className="grid gap-4 border-y-2 border-[var(--sh-ink)] py-5 sm:grid-cols-[1fr_300px] sm:items-end">
      <div><p className="sh-kicker">{number} / Interface element</p><h2 className="sh-serif mt-2 text-3xl leading-none sm:text-5xl">{title}</h2></div>
      <p className="text-sm leading-relaxed text-[var(--sh-muted)]">{note}</p>
    </div>
  );
}

function LeadItem({ lead, index }: { lead: (typeof sourceLeads)[number]; index: number }) {
  return (
    <article className="sh-source-panel grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px] sm:gap-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="sh-mono text-[9px] text-[var(--sh-muted)]">LEAD {String(index + 1).padStart(2, '0')}</span>
          <span className="sh-kicker">{lead.lane}</span>
          <span className="sh-tag sh-tag--blue">External source · not Signal Hub reporting</span>
        </div>
        <h3 className="sh-serif max-w-3xl text-2xl leading-tight sm:text-3xl"><a href={lead.href} target="_blank" rel="noreferrer" className="hover:text-[var(--sh-red)]">{lead.title}</a></h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--sh-muted)]">{lead.summary}</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[var(--sh-rule)] pt-3 sm:flex-col sm:items-start sm:justify-between sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div><p className="sh-mono text-[9px]">{lead.date}</p><p className="mt-1 text-xs text-[var(--sh-muted)]">{lead.publisher}</p><p className="mt-1 text-xs text-[var(--sh-muted)]">{lead.place}</p></div>
        <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={lead.href} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={11} /></a>
      </div>
    </article>
  );
}

export function DesignSystem() {
  const [query, setQuery] = useState('');
  const [lane, setLane] = useState('All lanes');
  const [page, setPage] = useState(1);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [activeButton, setActiveButton] = useState('All records');
  const pageSize = 3;
  const filteredLeads = useMemo(
    () => sourceLeads.filter((lead) => (lane === 'All lanes' || lead.lane === lane) && `${lead.title} ${lead.publisher} ${lead.summary} ${lead.place}`.toLowerCase().includes(query.toLowerCase())),
    [lane, query],
  );
  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const visibleLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }
  function changeLane(value: string) {
    setLane(value);
    setPage(1);
  }

  return (
    <AppShell active="About">
      <div className="sh-container pb-16">
        <header className="grid gap-8 pb-10 pt-12 sm:pb-14 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:gap-16">
          <div>
            <p className="sh-kicker">Signal Hub / Pattern library</p>
            <h1 className="sh-serif mt-4 max-w-4xl text-5xl leading-[.9] sm:text-7xl lg:text-[82px]">The record is<br /><em className="font-normal text-[var(--sh-red)]">the interface.</em></h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4e5051]">Reusable editorial elements for tracing rules, court status, primary documents and leads without blurring what each one can establish.</p>
          </div>
          <div className="border-y-2 border-[var(--sh-ink)] py-4">
            <p className="sh-kicker">Live desk snapshot · {deskSnapshot.date}</p>
            <p className="sh-serif mt-2 text-2xl leading-tight">{deskSnapshot.publishedFocusedRecords} published focused records</p>
            <p className="mt-1 text-sm text-[var(--sh-muted)]">{deskSnapshot.externalLeads} external leads for editorial review · {deskSnapshot.jurisdictions} jurisdiction contexts</p>
            <p className="sh-mono mt-3 text-[8px] text-[var(--sh-muted)]">Snapshot, not cumulative outcomes</p>
          </div>
        </header>

        <section className="mb-12">
          <DemoHeading id="navigation" number="01" title="Navigation, controls & labels" note="Document-led navigation keeps the reading path clear. Controls are quiet, high contrast and keyboard visible." />
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="border-y border-[var(--sh-rule)] py-4">
              <p className="sh-mono mb-3 text-[9px] text-[var(--sh-muted)]">Reusable navigation / responsive header in this preview</p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="sh-serif text-2xl">SIGNAL <span className="text-[var(--sh-red)]">HUB</span></span>
                <nav aria-label="Pattern library sample navigation" className="flex flex-wrap gap-x-5 gap-y-2">
                  {['Investigations', 'Latest', 'Explainers', 'Data', 'Archive', 'About'].map((item) => <a key={item} href="#navigation" className={`sh-mono border-b py-1 text-[8px] ${item === 'About' ? 'border-[var(--sh-red)] text-[var(--sh-red)]' : 'border-transparent text-[var(--sh-muted)] hover:text-[var(--sh-ink)]'}`}>{item}</a>)}
                </nav>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setActiveButton(activeButton === 'All records' ? 'Saved view' : 'All records')} className="sh-button"><Check size={13} /> {activeButton}</button>
              <button type="button" onClick={() => setActiveButton('Source index')} className="sh-button sh-button--outline">Source index <ArrowUpRight size={12} /></button>
              <button type="button" onClick={() => setActiveButton('Filter applied')} aria-label="Apply sample filter" className="sh-icon-button border border-[var(--sh-rule)]"><ChevronDown size={16} /></button>
              <span role="status" className="sh-mono w-full text-[9px] text-[var(--sh-muted)]">Control state: {activeButton}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="sh-tag">Policy</span><span className="sh-tag sh-tag--red">Needs context</span><span className="sh-tag sh-tag--amber">Court status</span><span className="sh-tag sh-tag--blue">Primary source</span>
            <span className="sh-mono ml-auto self-center text-[9px] text-[var(--sh-muted)]">Metadata / 7 Nov 2022 · Supreme Court · India</span>
          </div>
        </section>

        <section className="mb-12">
          <DemoHeading id="leads" number="02" title="Editorial leads" note="Each external item retains its original publisher, date and link. Leads are not Signal Hub reporting." />
          <div className="mt-4 flex flex-col gap-0">
            {sourceLeads.slice(0, 2).map((lead, index) => <LeadItem key={lead.href} lead={lead} index={index} />)}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {policyRecord.sources.map((source) => (
              <article key={source.href} className="sh-paper-panel p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3"><p className="sh-kicker">Source document / primary</p><ExternalLink size={14} className="text-[var(--sh-muted)]" /></div>
                <h3 className="sh-serif mt-3 text-2xl leading-tight">{source.title}</h3>
                <p className="mt-2 text-sm text-[var(--sh-muted)]">{source.publisher}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--sh-rule)] pt-3">
                  <span className="sh-mono text-[8px] text-[var(--sh-muted)]">{source.type}</span>
                  <a href={source.href} target="_blank" rel="noreferrer" className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]">View original <ArrowUpRight size={11} /></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <DemoHeading id="evidence" number="03" title="Evidence, dates & status" note="The evidence block names what each statement is—and what it is not." />
          <div className="mt-5 grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
            {evidenceKinds.map((kind) => <article key={kind.title} className="border-y border-r-0 border-[var(--sh-rule)] bg-[var(--sh-white)] p-4 first:border-l sm:border-r lg:min-h-[155px]">
              <span className={`sh-tag ${kind.tone ? `sh-tag--${kind.tone}` : ''}`}>{kind.title}</span><p className="mt-3 text-xs leading-relaxed text-[var(--sh-muted)]">{kind.detail}</p>
            </article>)}
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="border-l-2 border-[var(--sh-blue)] bg-[var(--sh-soft-blue)] p-5">
              <p className="sh-kicker">Official record / constitutional text</p><h3 className="sh-serif mt-2 text-2xl">{policyRecord.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{policyRecord.summary}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <span className="sh-mono text-[9px]">Effective · {policyRecord.effectiveDate}</span><span className="sh-mono text-[9px]">Judgment · {policyRecord.judgmentDate}</span>
              </div>
            </div>
            <aside className="border border-[var(--sh-rule)] p-5">
              <p className="sh-kicker">Court status / cited ruling</p><p className="sh-serif mt-2 text-xl">{policyRecord.judgment}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">The Court upheld the amendment in this judgment. The cited date is 7 Nov 2022.</p>
              <a href={policyRecord.sources[1].href} target="_blank" rel="noreferrer" className="sh-link sh-mono mt-4 inline-flex items-center gap-1 text-[9px]">Open judgment <ArrowUpRight size={11} /></a>
            </aside>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {policyTimeline.map((item) => <article key={item.date} className="relative border-t-2 border-[var(--sh-ink)] pt-4">
              <span className="absolute -top-[5px] left-0 h-2 w-2 rounded-full bg-[var(--sh-red)]" /><p className="sh-mono text-[9px] text-[var(--sh-red)]">{item.date}</p>
              <h3 className="sh-serif mt-2 text-xl">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">{item.context}</p>
              <a className="sh-link sh-mono mt-3 inline-flex items-center gap-1 text-[9px]" href={item.href} target="_blank" rel="noreferrer">{item.source} <ArrowUpRight size={10} /></a>
            </article>)}
          </div>
        </section>

        <section className="mb-12">
          <DemoHeading id="snapshot" number="04" title="Snapshot statistics & chart state" note="A snapshot is dated and labelled. No trend is implied when comparable measurements are not present." />
          <div className="mt-5 grid gap-0 border-y-2 border-[var(--sh-ink)] sm:grid-cols-3">
            {[
              [String(deskSnapshot.publishedFocusedRecords), 'Published focused records'],
              [String(deskSnapshot.externalLeads), 'External leads for editorial review'],
              [String(deskSnapshot.jurisdictions), 'Jurisdiction contexts'],
            ].map(([value, label]) => <div key={label} className="border-b border-[var(--sh-rule)] py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 last:border-r-0">
              <p className="sh-mono text-[8px] text-[var(--sh-red)]">DESK SNAPSHOT / {deskSnapshot.date}</p><p className="sh-serif mt-3 text-5xl">{value}</p><p className="mt-2 text-sm text-[var(--sh-muted)]">{label}</p>
            </div>)}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
            <div className="flex min-h-[220px] flex-col justify-between border border-dashed border-[var(--sh-rule)] bg-[var(--sh-white)] p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="sh-kicker">Chart / no series supplied</p><h3 className="sh-serif mt-2 text-2xl">No trend line to show</h3></div><span className="sh-tag">Empty state</span></div>
              <div className="my-5 flex h-16 items-center justify-center border border-dashed border-[var(--sh-rule)] bg-[var(--sh-paper)] px-3">
                <span className="sh-mono text-[8px] text-[var(--sh-muted)]">NO COMPARABLE SERIES SUPPLIED</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--sh-muted)]">A valid chart needs a source, definition, unit, period and geography. None is supplied here for a comparable series; the snapshot is not a trend.</p>
            </div>
            <div className="border-l-2 border-[var(--sh-amber)] bg-[#f0eadb] p-5">
              <div className="flex items-center gap-2"><CircleAlert size={15} className="text-[var(--sh-amber)]" /><p className="sh-kicker !text-[var(--sh-amber)]">Evidence alert</p></div>
              <p className="sh-serif mt-3 text-xl">Do not infer movement or decision pressure.</p>
              <p className="mt-2 text-sm leading-relaxed">No quantified migration or decision-pressure evidence is supplied for this snapshot.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <DemoHeading id="research-desk" number="05" title="Research desk & related leads" note="The desk block keeps the source-review count separate from published records and links out to its external material." />
          <div className="mt-5 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <aside className="bg-[var(--sh-ink)] p-5 text-[var(--sh-paper)] sm:p-7">
              <p className="sh-mono text-[9px] text-[#e2a09a]">Research desk / snapshot</p>
              <p className="sh-serif mt-4 text-4xl">{deskSnapshot.externalLeads}<br /><span className="text-xl">external leads</span></p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#d0ccc5]">For editorial review. These links are not Signal Hub reporting.</p>
              <p className="sh-mono mt-6 border-t border-white/20 pt-3 text-[8px] text-[#c4c1bd]">{deskSnapshot.date} · {deskSnapshot.jurisdictions} jurisdiction contexts</p>
            </aside>
            <div>
              <p className="sh-kicker mb-1">Related leads / examples from the supplied desk list</p>
              {sourceLeads.slice(2, 4).map((lead, index) => <div key={lead.href} className="border-t-2 border-[var(--sh-ink)] py-4">
                <div className="flex flex-wrap items-center gap-2"><span className="sh-tag sh-tag--blue">External lead</span><span className="sh-mono text-[8px] text-[var(--sh-muted)]">{lead.date} · {lead.publisher}</span></div>
                <h3 className="sh-serif mt-2 text-xl">{lead.title}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">{lead.summary}</p>
                <a href={lead.href} target="_blank" rel="noreferrer" className="sh-link sh-mono mt-3 inline-flex items-center gap-1 text-[9px]">Open external source {index + 1} <ArrowUpRight size={11} /></a>
              </div>)}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <DemoHeading id="search" number="06" title="Search, filters & pagination" note="Try a phrase or choose a topic lane. The controls act on the supplied example leads only." />
          <div className="mt-5 border-y border-[var(--sh-rule)] py-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
              <label className="relative block">
                <span className="sr-only">Search external source leads</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sh-muted)]" />
                <input value={query} onChange={(event) => changeQuery(event.target.value)} className="sh-input pl-10" placeholder="Search lead title, publisher or place" />
              </label>
              <label>
                <span className="sr-only">Filter by topic lane</span>
                <select className="sh-select w-full" value={lane} onChange={(event) => changeLane(event.target.value)}>{lanes.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {lanes.map((item) => <button key={item} type="button" onClick={() => changeLane(item)} aria-pressed={lane === item} className={`sh-tag transition-colors ${lane === item ? 'border-[var(--sh-ink)] bg-[var(--sh-ink)] text-[var(--sh-white)]' : 'hover:border-[var(--sh-red)]'}`}>{item}</button>)}
              {(query || lane !== 'All lanes') && <button type="button" onClick={() => { changeQuery(''); changeLane('All lanes'); }} className="sh-mono inline-flex items-center gap-1 px-2 text-[9px] text-[var(--sh-red)]">Clear filters <X size={11} /></button>}
            </div>
          </div>
          <div aria-live="polite" className="mt-2">
            {visibleLeads.length ? visibleLeads.map((lead, index) => <LeadItem key={lead.href} lead={lead} index={(page - 1) * pageSize + index} />) : (
              <div className="border border-dashed border-[var(--sh-rule)] px-5 py-8 text-center">
                <Search size={18} className="mx-auto text-[var(--sh-muted)]" /><p className="sh-serif mt-3 text-2xl">No supplied leads match.</p><p className="mt-2 text-sm text-[var(--sh-muted)]">Try another phrase or clear the selected lane.</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-[var(--sh-rule)] py-4">
            <p className="sh-mono text-[9px] text-[var(--sh-muted)]">Example list · page {page} of {pageCount}</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="sh-button sh-button--outline !min-h-[36px] !px-3 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={13} /> Previous</button>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="sh-button sh-button--outline !min-h-[36px] !px-3 disabled:cursor-not-allowed disabled:opacity-40">Next <ArrowRight size={13} /></button>
            </div>
          </div>
        </section>

        {noticeOpen && <aside className="relative border-l-2 border-[var(--sh-red)] bg-[var(--sh-soft-red)] p-5 pr-12">
          <button type="button" aria-label="Dismiss editorial note" onClick={() => setNoticeOpen(false)} className="sh-icon-button absolute right-2 top-2"><X size={15} /></button>
          <div className="flex items-start gap-3"><Bell size={17} className="mt-1 shrink-0 text-[var(--sh-red)]" /><div>
            <p className="sh-kicker">Reader note / terminology</p><p className="sh-serif mt-2 text-2xl">“Open” means open to all candidates who qualify.</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed">Open-category seats are not exclusive to upper-caste applicants. Keep this definition visible wherever allocation or eligibility is discussed.</p>
          </div></div>
        </aside>}

        <section className="mt-12">
          <DemoHeading id="references" number="07" title="Footnotes & document references" note="Citations preserve document names, institutions and direct links. A reference should lead back to the source." />
          <ol className="mt-5 space-y-3 border-l border-[var(--sh-rule)] pl-5">
            {policyRecord.sources.map((source, index) => <li key={source.href} className="relative">
              <span className="absolute -left-[25px] top-1 font-mono text-[9px] text-[var(--sh-red)]">[{index + 1}]</span>
              <a href={source.href} target="_blank" rel="noreferrer" className="sh-link inline-flex items-start gap-2 text-sm leading-relaxed">{source.title} — {source.publisher} <ArrowUpRight size={12} className="mt-1 shrink-0" /></a>
              <p className="sh-mono mt-1 text-[8px] text-[var(--sh-muted)]">{source.type}</p>
            </li>)}
          </ol>
          <div className="mt-6 flex items-start gap-3 border-t border-[var(--sh-rule)] pt-4">
            <FileText size={16} className="mt-0.5 text-[var(--sh-blue)]" /><p className="text-xs leading-relaxed text-[var(--sh-muted)]">Source labels are not interchangeable: official text, court status, litigant claims, analysis and external leads must remain distinct throughout the interface.</p>
          </div>
        </section>
        <div className="sr-only" aria-hidden="true"><span>{deskSnapshot.date}</span><span>{policyRecord.legalBasis}</span></div>
      </div>
    </AppShell>
  );
}

export default DesignSystem;