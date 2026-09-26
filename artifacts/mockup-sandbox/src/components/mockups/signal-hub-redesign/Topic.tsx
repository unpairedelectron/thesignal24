import { ArrowUpRight, Scale } from 'lucide-react';
import './_group.css';
import { AppShell } from './_shared/AppShell';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';
import { LeadRow, SourceCard, SourceStatus } from './_shared/Editorial';

const openTopicLeads = sourceLeads
  .filter((lead) => ['Open competition', 'State quota disputes', 'EWS / eligibility'].includes(lead.lane))
  .sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split(' ');
    const [dayB, monthB, yearB] = b.date.split(' ');
    return new Date(`${monthB} ${dayB}, ${yearB}`).getTime() - new Date(`${monthA} ${dayA}, ${yearA}`).getTime();
  });

export function Topic() {
  return (
    <AppShell active="Explainers">
      <div className="sh-container">
        <header className="grid gap-10 border-b-2 border-[var(--sh-ink)] py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <p className="sh-kicker">Topic file / rules &amp; access</p>
            <h1 className="sh-serif mt-4 max-w-5xl text-6xl leading-[0.88] sm:text-8xl">Open-category<br /><em className="font-normal text-[var(--sh-red)]">competition.</em></h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--sh-muted)]">
              A source-led guide to open seats, constitutional rules and the records that shape access to education and public employment in India.
            </p>
          </div>
          <div className="border-l-2 border-[var(--sh-blue)] pl-5">
            <p className="sh-kicker">Desk snapshot · {deskSnapshot.date}</p>
            <p className="sh-serif mt-3 text-3xl">No published focused records</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">{deskSnapshot.externalLeads} external leads are in review across {deskSnapshot.jurisdictions} jurisdiction contexts. Snapshot, not cumulative outcomes.</p>
          </div>
        </header>

        <section className="grid gap-8 border-b border-[var(--sh-rule)] py-9 lg:grid-cols-[.76fr_1.24fr] lg:gap-16">
          <div>
            <p className="sh-kicker">Overview / the term</p>
            <h2 className="sh-serif mt-3 text-4xl leading-[0.98] sm:text-5xl">Open is a way seats are allocated—not a caste pool.</h2>
          </div>
          <div className="sh-article-copy !max-w-none !text-lg">
            <p>Open-category seats are open to all candidates who qualify under the applicable selection rules. They are not reserved exclusively for upper-caste applicants.</p>
            <p>Reservation categories and open competition operate within the rules of a particular examination, admission process or recruitment. Read the governing notice and allocation for that process; do not infer a statewide share from a single schedule or turn a political demand into a rule in force.</p>
          </div>
        </section>

        <section className="grid gap-8 border-b border-[var(--sh-rule)] py-9 lg:grid-cols-[.76fr_1.24fr] lg:gap-16">
          <div>
            <p className="sh-kicker">The evidence boundary</p>
            <h2 className="sh-serif mt-3 text-4xl leading-[0.98] sm:text-5xl">Separate the record from the argument.</h2>
          </div>
          <div className="grid gap-0 border-y border-[var(--sh-rule)]">
            {[
              ['Official record', 'Constitutional text and published recruitment schedules establish what the document says.'],
              ['Court status', 'An order or judgment states the Court’s action; it is distinct from reporting about proceedings.'],
              ['Litigant claims', 'Petitioners’ submissions are positions advanced in a case, not findings by the Court.'],
              ['Analysis', 'Commentary can explain a dispute, but does not replace the primary order or rule.'],
              ['External leads', 'Links from other publishers are leads for review, not Signal Hub reporting.'],
            ].map(([label, text], index) => (
              <div key={label} className="grid gap-2 border-b border-[var(--sh-rule)] py-4 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-6">
                <p className={`sh-mono text-[10px] ${index === 0 ? 'text-[var(--sh-red)]' : index === 4 ? 'text-[var(--sh-blue)]' : 'text-[var(--sh-ink)]'}`}>{label}</p>
                <p className="text-sm leading-relaxed text-[var(--sh-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="grid gap-7 border-y-2 border-[var(--sh-ink)] py-6 sm:grid-cols-[1fr_290px] sm:items-end">
            <div>
              <p className="sh-kicker">Milestones / primary-source record</p>
              <h2 className="sh-serif mt-3 text-5xl leading-[0.92] sm:text-6xl">The 103rd Amendment<br /><em className="font-normal text-[var(--sh-red)]">in two dates.</em></h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--sh-muted)]">{policyRecord.summary} The amendment’s legal history is shown here as an official record and a court judgment—not as a Signal Hub published focused record.</p>
          </div>
          <div className="relative mt-7">
            <div className="absolute bottom-5 left-[7px] top-5 w-px bg-[var(--sh-rule)]" aria-hidden="true" />
            {policyTimeline.map((milestone, index) => (
              <article key={milestone.date} className="relative grid gap-4 pb-8 pl-8 last:pb-0 sm:grid-cols-[130px_minmax(0,1fr)_190px] sm:gap-7">
                <span className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 ${index === 0 ? 'border-[var(--sh-red)] bg-[var(--sh-paper)]' : 'border-[var(--sh-blue)] bg-[var(--sh-paper)]'}`} aria-hidden="true" />
                <p className="sh-mono pt-1 text-[10px] text-[var(--sh-muted)]">{milestone.date}</p>
                <div>
                  <p className="sh-kicker">{index === 0 ? 'Official record' : 'Court status'}</p>
                  <h3 className="sh-serif mt-2 text-3xl leading-tight">{milestone.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--sh-muted)]">{milestone.context}</p>
                </div>
                <a href={milestone.href} target="_blank" rel="noreferrer" className="sh-link sh-mono inline-flex items-start gap-1 text-[9px] sm:justify-self-start">
                  {milestone.source} <ArrowUpRight size={12} className="shrink-0" />
                </a>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {policyRecord.sources.map((source) => (
              <SourceCard key={source.title} title={source.title} publisher={source.publisher} type={source.type} href={source.href} date={source.title === 'Constitution of India' ? policyRecord.effectiveDate : policyRecord.judgmentDate} />
            ))}
          </div>
          <p className="mt-4 sh-mono text-[9px] text-[var(--sh-muted)]">Primary sources / Constitution of India and Supreme Court of India judgment / Janhit Abhiyan v. Union of India</p>
        </section>

        <section className="border-y-2 border-[var(--sh-ink)] py-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="sh-kicker">Latest leads / selected source links</p>
              <h2 className="sh-serif mt-3 text-5xl leading-[0.92]">What the desk is watching.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--sh-muted)]">External reporting and documents remain leads for review. This selection is not the complete set of 13 in the live desk snapshot.</p>
          </div>
          <div className="mt-6">
            {openTopicLeads.map((lead, index) => <LeadRow key={lead.title} lead={lead} compact number={`0${index + 1}`} />)}
          </div>
          <div className="mt-5 flex items-start gap-3 bg-[var(--sh-soft-blue)] px-4 py-4">
            <SourceStatus />
            <p className="max-w-2xl text-xs leading-relaxed text-[var(--sh-ink)]">These links are external source leads, not Signal Hub reporting. A reported demand is not a rule in force; a case analysis is not a final court finding.</p>
          </div>
        </section>

        <section className="grid gap-7 py-10 sm:grid-cols-[.7fr_1.3fr] sm:py-14">
          <div>
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-[var(--sh-red)]" aria-hidden="true" />
              <p className="sh-kicker">Related records</p>
            </div>
            <h2 className="sh-serif mt-3 text-5xl leading-[0.92]">Follow the source trail.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--sh-muted)]">Start with the governing primary text, then read the specific rule, notice or court record relevant to the process in view.</p>
          </div>
          <div className="grid gap-0 border-t-2 border-[var(--sh-ink)]">
            <article className="grid gap-3 border-b border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="sh-kicker">Official record / constitutional framework</p>
                <h3 className="sh-serif mt-2 text-2xl">{policyRecord.title}</h3>
                <p className="mt-2 text-sm text-[var(--sh-muted)]">{policyRecord.legalBasis} · effective {policyRecord.effectiveDate}</p>
              </div>
              <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={policyRecord.sources[0].href} target="_blank" rel="noreferrer">Read primary text <ArrowUpRight size={12} /></a>
            </article>
            <article className="grid gap-3 border-b border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="sh-kicker">Court judgment / 7 Nov 2022</p>
                <h3 className="sh-serif mt-2 text-2xl">{policyRecord.judgment}</h3>
                <p className="mt-2 text-sm text-[var(--sh-muted)]">Supreme Court of India · primary source</p>
              </div>
              <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" href={policyRecord.sources[1].href} target="_blank" rel="noreferrer">Read judgment <ArrowUpRight size={12} /></a>
            </article>
            <div className="grid gap-3 border-b border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="sh-kicker">Interpretation note</p>
                <h3 className="sh-serif mt-2 text-2xl">Open seats are open to all who qualify.</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--sh-muted)]">They are not an exclusive upper-caste pool. The applicable selection or admission rules determine how a specific process allocates seats.</p>
              </div>
              <span className="sh-tag sh-tag--blue">Clarification</span>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}