import { useMemo, useState } from 'react';
import { ArrowUpRight, Database, FileSearch, Filter, Minus, RotateCcw } from 'lucide-react';
import { AppShell } from './_shared/AppShell';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';
import './_group.css';

type EvidenceItem = {
  title: string;
  publisher: string;
  date: string;
  topic: string;
  category: string;
  geography: string;
  href: string;
  note: string;
  external?: boolean;
};

const evidenceItems: EvidenceItem[] = [
  {
    title: 'The Constitution of India · 103rd Amendment framework',
    publisher: policyRecord.sources[0].publisher,
    date: policyTimeline[0].date,
    topic: 'EWS / eligibility',
    category: 'Official record',
    geography: 'National',
    href: policyRecord.sources[0].href,
    note: 'Primary source · effective date of the 103rd Amendment',
  },
  {
    title: policyRecord.judgment,
    publisher: policyRecord.sources[1].publisher,
    date: policyTimeline[1].date,
    topic: 'EWS / eligibility',
    category: 'Court judgment',
    geography: 'National',
    href: policyRecord.sources[1].href,
    note: 'Primary source · the Court upheld the amendment',
  },
  ...sourceLeads.map((lead) => ({
    title: lead.title,
    publisher: lead.publisher,
    date: lead.date,
    topic: lead.lane,
    category: 'External lead',
    geography: lead.place,
    href: lead.href,
    note: lead.summary,
    external: true,
  })),
];

const uniqueValues = (values: string[]) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="sh-kicker">{label}</span>
      <select id={id} className="sh-select w-full" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function DataExplorer() {
  const [topic, setTopic] = useState('All');
  const [category, setCategory] = useState('All');
  const [geography, setGeography] = useState('All');
  const [source, setSource] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const topics = useMemo(() => uniqueValues(evidenceItems.map((item) => item.topic)), []);
  const categories = useMemo(() => uniqueValues(evidenceItems.map((item) => item.category)), []);
  const geographies = useMemo(() => uniqueValues(evidenceItems.map((item) => item.geography)), []);
  const sources = useMemo(() => uniqueValues(evidenceItems.map((item) => item.publisher)), []);
  const visibleItems = useMemo(() => evidenceItems.filter((item) => {
    const date = new Date(item.date).getTime();
    const lower = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const upper = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
    return (topic === 'All' || item.topic === topic)
      && (category === 'All' || item.category === category)
      && (geography === 'All' || item.geography === geography)
      && (source === 'All' || item.publisher === source)
      && date >= lower && date <= upper;
  }), [topic, category, geography, source, fromDate, toDate]);

  const resetFilters = () => {
    setTopic('All');
    setCategory('All');
    setGeography('All');
    setSource('All');
    setFromDate('');
    setToDate('');
  };
  const hasFilters = topic !== 'All' || category !== 'All' || geography !== 'All' || source !== 'All' || !!fromDate || !!toDate;

  return (
    <AppShell active="Data">
      <div className="sh-container pb-12 pt-10 sm:pb-20 sm:pt-16">
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <span className="sh-tag sh-tag--red">Data room</span>
          <span className="sh-mono text-[9px] text-[var(--sh-muted)]">Desk snapshot · {deskSnapshot.date}</span>
        </div>

        <header className="grid gap-7 border-y-2 border-[var(--sh-ink)] py-7 sm:py-10 lg:grid-cols-[1fr_310px] lg:items-end">
          <div>
            <p className="sh-kicker">Source-first research / India</p>
            <h1 className="sh-serif mt-4 max-w-4xl text-5xl leading-[0.91] sm:text-7xl lg:text-[6.4rem]">
              Read the record.<br /><em className="font-normal text-[var(--sh-red)]">Not into the gaps.</em>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--sh-muted)]">
            The desk currently has no published focused records. What is visible here is a dated desk snapshot and source material for editorial review—not policy outcomes or a longitudinal dataset.
          </p>
        </header>

        <section aria-labelledby="snapshot-heading" className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="snapshot-heading" className="sh-kicker">Desk counts / snapshot only</h2>
            <span className="sh-mono text-[9px] text-[var(--sh-muted)]">As at {deskSnapshot.date} · not cumulative outcomes</span>
          </div>
          <div className="grid border-y border-[var(--sh-ink)] sm:grid-cols-3">
            <article className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-[var(--sh-rule)] py-5 sm:border-b-0 sm:border-r sm:pr-6">
              <p className="sh-serif text-6xl leading-none">0</p>
              <div><p className="sh-kicker">Published focused records</p><p className="mt-1 text-xs leading-relaxed text-[var(--sh-muted)]">Signal Hub reporting</p></div>
            </article>
            <article className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-[var(--sh-rule)] py-5 sm:border-b-0 sm:border-r sm:border-[var(--sh-rule)] sm:px-6">
              <p className="sh-serif text-6xl leading-none text-[var(--sh-red)]">13</p>
              <div><p className="sh-kicker">External leads</p><p className="mt-1 text-xs leading-relaxed text-[var(--sh-muted)]">For editorial review; not Signal Hub reporting</p></div>
            </article>
            <article className="grid grid-cols-[100px_1fr] items-center gap-4 py-5 sm:pl-6">
              <p className="sh-serif text-6xl leading-none text-[var(--sh-blue)]">6</p>
              <div><p className="sh-kicker">Jurisdiction contexts</p><p className="mt-1 text-xs leading-relaxed text-[var(--sh-muted)]">Desk coverage contexts at snapshot date</p></div>
            </article>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-[var(--sh-muted)]">
            These are operational desk counts, not measures of reservation, access, representation, migration, or outcomes. Counts describe this snapshot only.
          </p>
        </section>

        <section aria-labelledby="filter-heading" className="mt-12 border border-[var(--sh-rule)] bg-[var(--sh-white)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sh-rule)] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Filter size={16} aria-hidden="true" className="text-[var(--sh-red)]" />
              <div><p className="sh-kicker">Editorial index</p><h2 id="filter-heading" className="sh-serif mt-1 text-2xl">Find source material</h2></div>
            </div>
            <p className="sh-mono text-[9px] text-[var(--sh-muted)]">Filters apply to dated source records below</p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="sh-kicker">Date from</span>
              <input aria-label="Filter from date" className="sh-select w-full" type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="sh-kicker">Date to</span>
              <input aria-label="Filter to date" className="sh-select w-full" type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} />
            </label>
            <FilterSelect id="topic-filter" label="Topic" value={topic} options={topics} onChange={setTopic} />
            <FilterSelect id="category-filter" label="Category" value={category} options={categories} onChange={setCategory} />
            <FilterSelect id="geography-filter" label="Geography" value={geography} options={geographies} onChange={setGeography} />
            <FilterSelect id="source-filter" label="Source" value={source} options={sources} onChange={setSource} />
            <div className="flex items-end sm:col-span-2 lg:col-span-5">
              <button type="button" onClick={resetFilters} disabled={!hasFilters} className="sh-button sh-button--outline !min-h-[38px] disabled:cursor-not-allowed disabled:opacity-40">
                <RotateCcw size={12} aria-hidden="true" /> Reset filters
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="materials-heading" className="mt-10">
          <div className="flex flex-col justify-between gap-3 border-b-2 border-[var(--sh-ink)] pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="sh-kicker">Source register / verified dates only</p>
              <h2 id="materials-heading" className="sh-serif mt-2 text-4xl sm:text-5xl">Material in view</h2>
            </div>
            <p aria-live="polite" className="sh-mono text-[9px] text-[var(--sh-muted)]">{visibleItems.length} supplied source records match</p>
          </div>

          {visibleItems.length ? (
            <div className="divide-y divide-[var(--sh-rule)]">
              {visibleItems.map((item) => (
                <article key={`${item.publisher}-${item.title}`} className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_195px] sm:gap-8 sm:py-6">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`sh-tag ${item.external ? 'sh-tag--blue' : item.category === 'Court judgment' ? 'sh-tag--amber' : 'sh-tag--red'}`}>{item.category}</span>
                      {item.external && <span className="sh-mono text-[9px] text-[var(--sh-blue)]">Not Signal Hub reporting</span>}
                    </div>
                    <h3 className="sh-serif max-w-3xl text-2xl leading-tight sm:text-3xl">{item.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--sh-muted)]">{item.note}</p>
                  </div>
                  <div className="flex flex-row flex-wrap items-end justify-between gap-3 border-t border-[var(--sh-rule)] pt-3 sm:flex-col sm:items-start sm:justify-between sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                    <div><p className="sh-mono text-[10px]">{item.date}</p><p className="mt-1 text-xs text-[var(--sh-muted)]">{item.publisher}</p><p className="mt-1 text-xs text-[var(--sh-muted)]">{item.geography}</p></div>
                    <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={item.href} target="_blank" rel="noreferrer">
                      Open source <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="my-5 border border-dashed border-[var(--sh-rule)] bg-[var(--sh-white)] px-5 py-10 sm:px-8">
              <div className="flex max-w-2xl items-start gap-4">
                <FileSearch size={20} className="mt-1 shrink-0 text-[var(--sh-amber)]" aria-hidden="true" />
                <div>
                  <p className="sh-kicker">No matching source records</p>
                  <h3 className="sh-serif mt-2 text-3xl">Widen the filters to continue.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">This index only includes supplied, dated primary documents and external leads. An empty result is not evidence that no relevant record exists.</p>
                  <button type="button" onClick={resetFilters} className="sh-button mt-5">Clear filters <RotateCcw size={12} aria-hidden="true" /></button>
                </div>
              </div>
            </div>
          )}
          <p className="border-t border-[var(--sh-rule)] py-3 text-xs leading-relaxed text-[var(--sh-muted)]">
            External leads are links surfaced for editorial review, not Signal Hub reporting. Petitioners’ positions remain litigant claims; they are not a court finding. The official record, court status, and analysis are kept distinct.
          </p>
        </section>

        <section aria-labelledby="longitudinal-heading" className="mt-12 grid gap-6 border-y border-[var(--sh-ink)] py-7 lg:grid-cols-[.72fr_1.28fr] lg:py-9">
          <div>
            <div className="flex items-center gap-2"><Database size={15} aria-hidden="true" className="text-[var(--sh-blue)]" /><p className="sh-kicker">Longitudinal data / not available</p></div>
            <h2 id="longitudinal-heading" className="sh-serif mt-3 text-4xl leading-[.98] sm:text-5xl">No series to chart—yet.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--sh-muted)]">The desk snapshot is not a time series. There are no comparable, source-backed observations here for trend lines or outcome comparisons.</p>
          </div>
          <div className="flex min-h-52 flex-col justify-between border border-dashed border-[var(--sh-rule)] bg-[var(--sh-white)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="sh-mono text-[9px] text-[var(--sh-muted)]">Series preview / intentionally unplotted</span>
              <span className="sh-tag">No observations</span>
            </div>
            <div className="my-8 flex items-center gap-3" aria-label="No data points available">
              <span className="h-px flex-1 bg-[var(--sh-rule)]" />
              <Minus size={17} className="text-[var(--sh-amber)]" aria-hidden="true" />
              <span className="h-px flex-1 bg-[var(--sh-rule)]" />
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--sh-muted)]">A future comparison needs dated values, definitions, geography, denominators and original sources. None are inferred from the current desk counts.</p>
          </div>
        </section>

        <section aria-labelledby="legal-sources-heading" className="mt-12">
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_330px] sm:items-end">
            <div><p className="sh-kicker">One legal record / two primary sources</p><h2 id="legal-sources-heading" className="sh-serif mt-2 text-4xl sm:text-5xl">{policyRecord.title}</h2></div>
            <p className="text-sm leading-relaxed text-[var(--sh-muted)]">{policyRecord.summary} The amendment’s effective date and the later judgment are distinct legal milestones.</p>
          </div>
          <div className="grid border-y border-[var(--sh-ink)] md:grid-cols-2">
            {policyRecord.sources.map((document, index) => (
              <article key={document.title} className={`py-5 sm:py-6 ${index === 0 ? 'md:border-r md:border-[var(--sh-rule)] md:pr-7' : 'md:pl-7'}`}>
                <p className="sh-kicker">{index === 0 ? 'Official record' : 'Court status'}</p>
                <h3 className="sh-serif mt-2 text-2xl">{document.title}</h3>
                <p className="mt-2 text-sm text-[var(--sh-muted)]">{document.publisher} · {document.type}</p>
                <a className="sh-link sh-mono mt-4 inline-flex items-center gap-1 text-[9px]" href={document.href} target="_blank" rel="noreferrer">
                  Open primary source <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <p className="mt-3 sh-mono flex items-center gap-2 text-[9px] text-[var(--sh-muted)]">
            <Minus size={12} aria-hidden="true" /> {policyRecord.legalBasis} · {policyRecord.authority}
          </p>
        </section>
      </div>
    </AppShell>
  );
}