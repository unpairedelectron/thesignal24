import { FormEvent, useMemo, useState } from 'react';
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import './_group.css';
import { AppShell } from './_shared/AppShell';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';
import { SourceStatus } from './_shared/Editorial';

type SearchRecord = {
  title: string;
  date: string;
  organization: string;
  source: string;
  status: 'Official record' | 'Court status' | 'External source lead';
  topic: string;
  region: string;
  summary: string;
  href: string;
};

const records: SearchRecord[] = [
  ...policyTimeline.map((milestone, index) => ({
    title: milestone.title,
    date: milestone.date,
    organization: index === 0 ? 'Parliament of India' : 'Supreme Court of India',
    source: index === 0 ? policyRecord.sources[0].title : policyRecord.sources[1].title,
    status: (index === 0 ? 'Official record' : 'Court status') as SearchRecord['status'],
    topic: 'Open-category competition · EWS framework',
    region: 'National · India',
    summary: milestone.context,
    href: milestone.href,
  })),
  ...sourceLeads.map((lead) => ({
    title: lead.title,
    date: lead.date,
    organization: lead.publisher,
    source: lead.publisher,
    status: 'External source lead' as const,
    topic: lead.lane,
    region: lead.place,
    summary: lead.summary,
    href: lead.href,
  })),
];

const topics = Array.from(new Set(records.map((record) => record.topic))).sort();
const regions = Array.from(new Set(records.map((record) => record.region))).sort();
const statuses = ['Official record', 'Court status', 'External source lead'];

export function SearchResults() {
  const initialQuery = new URLSearchParams(window.location.search).get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [topic, setTopic] = useState('All');
  const [region, setRegion] = useState('All');
  const [status, setStatus] = useState('All');

  const results = useMemo(() => {
    const terms = submittedQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return records.filter((record) => {
      const haystack = `${record.title} ${record.summary} ${record.organization} ${record.source} ${record.topic} ${record.region} ${record.status} ${record.date}`.toLowerCase();
      return terms.every((term) => haystack.includes(term))
        && (topic === 'All' || record.topic === topic)
        && (region === 'All' || record.region === region)
        && (status === 'All' || record.status === status);
    }).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split(' ');
      const [dayB, monthB, yearB] = b.date.split(' ');
      return new Date(`${monthB} ${dayB}, ${yearB}`).getTime() - new Date(`${monthA} ${dayA}, ${yearA}`).getTime();
    });
  }, [submittedQuery, topic, region, status]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query);
    const nextUrl = new URL(window.location.href);
    if (query.trim()) nextUrl.searchParams.set('q', query.trim());
    else nextUrl.searchParams.delete('q');
    window.history.replaceState({}, '', nextUrl);
  }

  function clearSearch() {
    setQuery('');
    setSubmittedQuery('');
    setTopic('All');
    setRegion('All');
    setStatus('All');
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('q');
    window.history.replaceState({}, '', nextUrl);
  }

  return (
    <AppShell active="Latest">
      <div className="sh-container">
        <header className="grid gap-7 border-b-2 border-[var(--sh-ink)] py-10 sm:py-14 lg:grid-cols-[1fr_270px] lg:items-end">
          <div>
            <p className="sh-kicker">Search / source desk</p>
            <h1 className="sh-serif mt-4 max-w-4xl text-6xl leading-[0.9] sm:text-8xl">Find the record.<br /><em className="font-normal text-[var(--sh-red)]">Keep the status.</em></h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--sh-muted)]">
              Search supplied policy records and source leads. Results preserve the difference between an official record, a court position and external reporting.
            </p>
          </div>
          <div className="border-l-2 border-[var(--sh-blue)] pl-5">
            <p className="sh-kicker">Snapshot · {deskSnapshot.date}</p>
            <p className="sh-serif mt-3 text-3xl">{deskSnapshot.externalLeads} external leads</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">For editorial review, not Signal Hub reporting. Snapshot count, not cumulative coverage.</p>
          </div>
        </header>

        <form role="search" onSubmit={submitSearch} className="border-b border-[var(--sh-rule)] py-6">
          <label className="sh-kicker mb-2 block" htmlFor="signal-search">Search policy and source leads</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sh-muted)]" />
              <input id="signal-search" className="sh-input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Janhit Abhiyan”, “UGC”, or a source name" />
            </div>
            <button type="submit" className="sh-button">Search desk</button>
          </div>
          <p className="mt-2 sh-mono text-[9px] text-[var(--sh-muted)]">Search reads the supplied source index only; it does not query the web.</p>
        </form>

        <section className="grid gap-8 py-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="flex items-center gap-2 border-b-2 border-[var(--sh-ink)] pb-3">
              <SlidersHorizontal size={14} className="text-[var(--sh-red)]" aria-hidden="true" />
              <p className="sh-kicker">Refine results</p>
            </div>
            <label className="mt-4 block">
              <span className="sh-kicker mb-2 block">Topic</span>
              <select className="sh-select w-full text-sm" value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="All">All topics</option>{topics.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="sh-kicker mb-2 block">Jurisdiction</span>
              <select className="sh-select w-full text-sm" value={region} onChange={(event) => setRegion(event.target.value)}>
                <option value="All">All jurisdictions</option>{regions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="sh-kicker mb-2 block">Evidence status</span>
              <select className="sh-select w-full text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="All">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button type="button" onClick={clearSearch} className="sh-link sh-mono mt-5 text-[9px]">Clear search and facets</button>
            <div className="mt-8 border-t border-[var(--sh-rule)] pt-4">
              <p className="sh-mono text-[9px] text-[var(--sh-muted)]">Desk snapshot / 0 published focused records / {deskSnapshot.jurisdictions} jurisdiction contexts</p>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3 border-y-2 border-[var(--sh-ink)] py-4">
              <div>
                <p className="sh-kicker">{submittedQuery ? `Query / “${submittedQuery}”` : 'Source index'}</p>
                <h2 className="sh-serif mt-1 text-3xl">{results.length} matching entries</h2>
              </div>
              <p className="sh-mono text-[9px] text-[var(--sh-muted)]">Sorted by source date · newest first</p>
            </div>
            {results.length ? (
              <div>
                {results.map((record) => (
                  <article key={`${record.title}-${record.date}`} className="grid gap-4 border-b border-[var(--sh-rule)] py-6 sm:grid-cols-[minmax(0,1fr)_210px] sm:gap-8">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {record.status === 'External source lead'
                          ? <SourceStatus />
                          : <span className={`sh-tag ${record.status === 'Court status' ? 'sh-tag--amber' : 'sh-tag--red'}`}>{record.status}</span>}
                        <span className="sh-tag">{record.topic}</span>
                      </div>
                      <h3 className="sh-serif max-w-3xl text-3xl leading-[1.04] sm:text-4xl">
                        <a href={record.href} target="_blank" rel="noreferrer" className="hover:text-[var(--sh-red)]">{record.title}</a>
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sh-muted)]">{record.summary}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--sh-rule)] pt-3 text-xs sm:grid-cols-1 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div><dt className="sh-kicker">Date</dt><dd className="mt-1 sh-mono">{record.date}</dd></div>
                      <div><dt className="sh-kicker">Organization</dt><dd className="mt-1">{record.organization}</dd></div>
                      <div><dt className="sh-kicker">Source</dt><dd className="mt-1">{record.source}</dd></div>
                      <div><dt className="sh-kicker">Jurisdiction</dt><dd className="mt-1">{record.region}</dd></div>
                      <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={record.href} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={12} /></a>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <div className="my-8 border border-dashed border-[var(--sh-rule)] bg-[var(--sh-white)] px-6 py-10">
                <Search size={20} aria-hidden="true" className="text-[var(--sh-red)]" />
                <h3 className="sh-serif mt-4 text-3xl">No supplied source matches.</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--sh-muted)]">Try fewer terms or remove a facet. This search covers the supplied records and leads, not every item on the live desk.</p>
                <button type="button" className="sh-button sh-button--outline mt-5" onClick={clearSearch}>Reset search</button>
              </div>
            )}
            <div className="mt-7 border-l-2 border-[var(--sh-amber)] bg-[#f0eadb] px-4 py-4">
              <p className="text-xs leading-relaxed text-[var(--sh-ink)]">The supplied index displays seven external leads, not the complete live desk. The snapshot reports 13 external leads for editorial review. A lead is not Signal Hub reporting; case analysis is not a court order, and litigant claims are not court findings.</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}