import { useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, FileText, Search, SlidersHorizontal } from 'lucide-react';
import './_group.css';
import { AppShell } from './_shared/AppShell';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';
import { SourceStatus } from './_shared/Editorial';

type ArchiveItem = {
  title: string;
  date: string;
  year: string;
  topic: string;
  category: string;
  publisher: string;
  region: string;
  status: 'Official record' | 'Court status' | 'External lead';
  summary: string;
  href: string;
  sourceType: string;
};

const officialItems: ArchiveItem[] = policyTimeline.map((milestone, index) => ({
  title: milestone.title,
  date: milestone.date,
  year: milestone.date.slice(-4),
  topic: 'Open-category competition',
  category: index === 0 ? 'Constitutional amendment' : 'Court judgment',
  publisher: index === 0 ? policyRecord.sources[0].publisher : policyRecord.sources[1].publisher,
  region: 'National · India',
  status: index === 0 ? 'Official record' : 'Court status',
  summary: milestone.context,
  href: milestone.href,
  sourceType: index === 0 ? policyRecord.sources[0].type : policyRecord.sources[1].type,
}));

const leadItems: ArchiveItem[] = sourceLeads.map((lead) => ({
  title: lead.title,
  date: lead.date,
  year: lead.date.slice(-4),
  topic: lead.lane,
  category: 'External source lead',
  publisher: lead.publisher,
  region: lead.place,
  status: 'External lead',
  summary: lead.summary,
  href: lead.href,
  sourceType: 'External source · editorial review',
}));

const archiveItems = [...officialItems, ...leadItems];
const years = Array.from(new Set(archiveItems.map((item) => item.year))).sort((a, b) => Number(b) - Number(a));
const topics = Array.from(new Set(archiveItems.map((item) => item.topic))).sort();
const categories = Array.from(new Set(archiveItems.map((item) => item.category))).sort();
const publishers = Array.from(new Set(archiveItems.map((item) => item.publisher))).sort();
const regions = Array.from(new Set(archiveItems.map((item) => item.region))).sort();

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="sh-kicker mb-2 block">{label}</span>
      <select className="sh-select w-full text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All {label.toLowerCase()}s</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function Archive() {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('All');
  const [topic, setTopic] = useState('All');
  const [category, setCategory] = useState('All');
  const [publisher, setPublisher] = useState('All');
  const [region, setRegion] = useState('All');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return archiveItems.filter((item) => {
      const searchable = `${item.title} ${item.summary} ${item.publisher} ${item.topic} ${item.category} ${item.region} ${item.status}`.toLowerCase();
      return (!normalized || searchable.includes(normalized))
        && (year === 'All' || item.year === year)
        && (topic === 'All' || item.topic === topic)
        && (category === 'All' || item.category === category)
        && (publisher === 'All' || item.publisher === publisher)
        && (region === 'All' || item.region === region);
    }).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split(' ');
      const [dayB, monthB, yearB] = b.date.split(' ');
      return new Date(`${monthB} ${dayB}, ${yearB}`).getTime() - new Date(`${monthA} ${dayA}, ${yearA}`).getTime();
    });
  }, [query, year, topic, category, publisher, region]);

  function clearFilters() {
    setQuery('');
    setYear('All');
    setTopic('All');
    setCategory('All');
    setPublisher('All');
    setRegion('All');
  }

  return (
    <AppShell active="Archive">
      <div className="sh-container">
        <header className="grid gap-8 border-b-2 border-[var(--sh-ink)] py-10 sm:py-14 lg:grid-cols-[1fr_290px] lg:items-end">
          <div>
            <p className="sh-kicker">Records / index 01</p>
            <h1 className="sh-serif mt-4 max-w-4xl text-6xl leading-[0.9] sm:text-8xl">The archive<br /><em className="font-normal text-[var(--sh-red)]">begins at the source.</em></h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--sh-muted)]">
              Browse official documents and external leads separately. Every entry keeps its source, date, jurisdiction and evidence status in view.
            </p>
          </div>
          <aside className="border-l-2 border-[var(--sh-red)] pl-5">
            <p className="sh-kicker">Desk snapshot · {deskSnapshot.date}</p>
            <p className="sh-serif mt-3 text-3xl leading-tight">{deskSnapshot.publishedFocusedRecords} published focused records</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">{deskSnapshot.externalLeads} external leads for editorial review across {deskSnapshot.jurisdictions} jurisdiction contexts. Snapshot figures, not cumulative outcomes.</p>
          </aside>
        </header>

        <section aria-label="Archive search and filters" className="border-b border-[var(--sh-rule)] py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} aria-hidden="true" className="text-[var(--sh-red)]" />
              <p className="sh-mono">Find a document or lead</p>
            </div>
            <button type="button" onClick={clearFilters} className="sh-link sh-mono text-[9px]">Clear filters</button>
          </div>
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sh-muted)]" size={16} aria-hidden="true" />
            <span className="sr-only">Search archive</span>
            <input className="sh-input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, source, topic, jurisdiction…" />
          </label>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Topic" value={topic} options={topics} onChange={setTopic} />
            <FilterSelect label="Category" value={category} options={categories} onChange={setCategory} />
            <FilterSelect label="Source" value={publisher} options={publishers} onChange={setPublisher} />
            <FilterSelect label="Region" value={region} options={regions} onChange={setRegion} />
          </div>
        </section>

        <div className="grid gap-10 py-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <p className="sh-kicker">Browse by year</p>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              <button type="button" onClick={() => setYear('All')} aria-pressed={year === 'All'} className={`sh-mono border px-3 py-2 text-[10px] ${year === 'All' ? 'border-[var(--sh-ink)] bg-[var(--sh-ink)] text-[var(--sh-white)]' : 'border-[var(--sh-rule)]'}`}>All years <span className="ml-2 opacity-60">{archiveItems.length}</span></button>
              {years.map((itemYear) => (
                <button type="button" key={itemYear} onClick={() => setYear(itemYear)} aria-pressed={year === itemYear} className={`sh-mono border px-3 py-2 text-[10px] ${year === itemYear ? 'border-[var(--sh-ink)] bg-[var(--sh-ink)] text-[var(--sh-white)]' : 'border-[var(--sh-rule)]'}`}>{itemYear} <span className="ml-2 opacity-60">{archiveItems.filter((item) => item.year === itemYear).length}</span></button>
              ))}
            </div>
            <div className="mt-7 border-t border-[var(--sh-rule)] pt-4">
              <p className="sh-mono text-[9px] text-[var(--sh-muted)]">Showing {filtered.length} of {archiveItems.length} supplied entries</p>
            </div>
          </aside>

          <section aria-label="Archive results">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-y-2 border-[var(--sh-ink)] py-4">
              <h2 className="sh-serif text-3xl">Source index</h2>
              <p className="sh-mono text-[9px] text-[var(--sh-muted)]">Official record ≠ external lead</p>
            </div>
            {filtered.length ? (
              <div>
                {filtered.map((item) => (
                  <article key={`${item.title}-${item.date}`} className="grid gap-4 border-b border-[var(--sh-rule)] py-6 sm:grid-cols-[minmax(0,1fr)_205px] sm:gap-8">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {item.status === 'External lead'
                          ? <SourceStatus />
                          : <span className={`sh-tag ${item.status === 'Court status' ? 'sh-tag--amber' : 'sh-tag--red'}`}>{item.status}</span>}
                        <span className="sh-tag">{item.category}</span>
                      </div>
                      <h3 className="sh-serif max-w-3xl text-3xl leading-[1.04] sm:text-4xl">
                        <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-[var(--sh-red)]">{item.title}</a>
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sh-muted)]">{item.summary}</p>
                      <p className="mt-4 sh-mono text-[9px] text-[var(--sh-muted)]">{item.topic} <span className="px-1.5">/</span> {item.region}</p>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[var(--sh-rule)] pt-3 text-xs sm:flex-col sm:items-start sm:justify-between sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div>
                        <p className="sh-mono">{item.date}</p>
                        <p className="mt-1 text-[var(--sh-muted)]">{item.publisher}</p>
                        <p className="mt-1 sh-mono text-[9px] text-[var(--sh-muted)]">{item.sourceType}</p>
                      </div>
                      <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={item.href} target="_blank" rel="noreferrer">
                        Open source <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="my-8 border border-dashed border-[var(--sh-rule)] bg-[var(--sh-white)] px-6 py-10">
                <FileText size={21} className="text-[var(--sh-red)]" aria-hidden="true" />
                <h3 className="sh-serif mt-4 text-3xl">No source matches this index.</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--sh-muted)]">Try a broader search or clear one of the filters. The archive does not fill gaps with unverified entries.</p>
                <button type="button" className="sh-button sh-button--outline mt-5" onClick={clearFilters}>Reset index</button>
              </div>
            )}
            <div className="mt-7 flex gap-3 border-l-2 border-[var(--sh-blue)] bg-[var(--sh-soft-blue)] px-4 py-4">
              <Bookmark size={16} className="mt-0.5 shrink-0 text-[var(--sh-blue)]" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-[var(--sh-ink)]">The external leads shown here are a supplied subset for editorial review, not Signal Hub reporting. The live desk snapshot lists 13 external leads; this index does not claim to display all 13.</p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}