import { ArrowDown, ArrowUpRight, Check, CircleDot, FileCheck2, Mail, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell } from './_shared/AppShell';
import { policyRecord, policyTimeline } from './_shared/data';
import './_group.css';

const sections = [
  { id: 'mission', label: 'Mission' },
  { id: 'principles', label: 'Editorial principles' },
  { id: 'method', label: 'Methodology' },
  { id: 'sources', label: 'Sources & verification' },
  { id: 'corrections', label: 'Corrections' },
  { id: 'contact', label: 'Contact' },
];

function NumberedSection({
  number,
  eyebrow,
  title,
  children,
  id,
}: {
  number: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <section id={id} className="grid gap-6 border-t border-[var(--sh-rule)] py-9 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-10 sm:py-12">
      <div className="flex items-start gap-3 sm:block">
        <span className="sh-mono text-[var(--sh-red)]">{number}</span>
        <span className="sh-kicker">{eyebrow}</span>
      </div>
      <div>
        <h2 className="sh-serif max-w-3xl text-3xl leading-[1.02] sm:text-5xl">{title}</h2>
        <div className="mt-5 max-w-3xl text-[15px] leading-7 text-[#4e5051]">{children}</div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <AppShell active="About">
      <div className="sh-container">
        <div className="grid gap-10 pb-12 pt-12 sm:pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
          <div>
            <p className="sh-kicker">About Signal Hub / Editorial method</p>
            <h1 className="sh-serif mt-5 max-w-4xl text-5xl leading-[.91] sm:text-7xl lg:text-[86px]">
              Follow the record.<br /><em className="font-normal text-[var(--sh-red)]">Keep the lines clear.</em>
            </h1>
            <p className="mt-7 max-w-2xl border-l-2 border-[var(--sh-red)] pl-5 text-lg leading-relaxed text-[#4e5051] sm:text-xl">
              Signal Hub is a source-first public-interest research publication on reservation rules, court decisions, and access to education and public employment in India.
            </p>
            <a href="#mission" className="sh-mono mt-8 inline-flex items-center gap-2 text-[10px] text-[var(--sh-blue)]">
              Read our approach <ArrowDown size={13} />
            </a>
          </div>
          <aside className="self-end border-y-2 border-[var(--sh-ink)] py-4">
            <p className="sh-kicker">The distinction that matters</p>
            <p className="sh-serif mt-3 text-[25px] leading-tight">Signal Hub separates documented facts, analysis and opinion.</p>
            <p className="mt-4 text-xs leading-relaxed text-[var(--sh-muted)]">A source lead is not a reported finding. A litigant’s position is not a court conclusion.</p>
          </aside>
        </div>

        <div className="grid gap-12 border-y border-[var(--sh-rule)] py-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="On this page" className="h-fit lg:sticky lg:top-6">
            <p className="sh-kicker mb-3">On this page</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-1">
              {sections.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="sh-mono py-1 text-[9px] text-[var(--sh-muted)] hover:text-[var(--sh-red)]">
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div>
            <NumberedSection number="01" eyebrow="Mission" title="A public record, read with care." id="mission">
              <p>Rules and judgments shape access to education and public employment. Signal Hub follows the documents, authorities and dates behind those changes, so readers can see what is established, what is argued and what remains unresolved.</p>
              <p className="mt-4">We focus on reservation frameworks, eligibility rules, court decisions and the way rules are applied in particular jurisdictions. Context matters: a state rule, recruitment schedule or interim order should be read on its own terms.</p>
              <div className="mt-6 flex items-start gap-3 border-l-2 border-[var(--sh-blue)] bg-[var(--sh-soft-blue)] px-4 py-4">
                <CircleDot size={16} className="mt-1 shrink-0 text-[var(--sh-blue)]" />
                <p className="text-sm leading-relaxed text-[var(--sh-ink)]">Open-category seats are open to all candidates who qualify under the applicable rules; they are not exclusive to upper-caste applicants.</p>
              </div>
            </NumberedSection>

            <NumberedSection number="02" eyebrow="Editorial principles" title="Make the status visible." id="principles">
              <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {[
                  ['Name the source', 'Link to the underlying document or clearly identify the external publication behind a lead.'],
                  ['Separate the record', 'Keep official records, court status, litigant claims, analysis and opinion visibly distinct.'],
                  ['Keep uncertainty in view', 'An interim order, an argument and a final judgment are different kinds of information.'],
                  ['Do not outrun evidence', 'Do not infer a trend, quantify decision pressure or turn a gap in the record into a conclusion.'],
                ].map(([title, text], index) => (
                  <div key={title} className="border-t border-[var(--sh-rule)] pt-3">
                    <p className="sh-mono text-[9px] text-[var(--sh-red)]">0{index + 1} / {title}</p>
                    <p className="mt-2 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </NumberedSection>

            <NumberedSection number="03" eyebrow="Methodology" title="Start with a question. Return to the source." id="method">
              <ol className="space-y-4">
                {[
                  ['Identify', 'Define the rule, case, authority or public decision at issue.'],
                  ['Locate', 'Find the primary document where available; use reporting and research as context, not as a substitute for the record.'],
                  ['Classify', 'Mark whether a statement is an official record, court status, litigant claim, analysis or external lead.'],
                  ['Contextualise', 'Preserve relevant dates, jurisdiction and the limits of what the cited material establishes.'],
                ].map(([title, text], index) => (
                  <li key={title} className="grid grid-cols-[36px_1fr] gap-3">
                    <span className="sh-mono pt-1 text-[var(--sh-red)]">0{index + 1}</span>
                    <p><strong className="font-semibold text-[var(--sh-ink)]">{title}.</strong> {text}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-7 border-y-2 border-[var(--sh-ink)] py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="sh-kicker">Illustrative record / constitutional text + judgment</p>
                  <span className="sh-tag sh-tag--blue">Official record</span>
                </div>
                <h3 className="sh-serif mt-3 text-2xl sm:text-3xl">{policyRecord.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{policyRecord.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {policyRecord.sources.map((source) => (
                    <a className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]" key={source.title} href={source.href} target="_blank" rel="noreferrer">
                      {source.title} <ArrowUpRight size={11} />
                    </a>
                  ))}
                </div>
                <p className="sh-mono mt-4 text-[9px] text-[var(--sh-muted)]">Effective 14 Jan 2019 · Janhit Abhiyan judgment 7 Nov 2022</p>
              </div>
            </NumberedSection>

            <NumberedSection number="04" eyebrow="Sources & verification" title="A link is a beginning, not a verdict." id="sources">
              <p>Primary sources include legislation, constitutional text and court judgments. Official notices and recruitment schedules can establish what an authority published; reporting and analysis can help explain developments but are labelled as such.</p>
              <div className="mt-6 space-y-0">
                {policyRecord.sources.map((source, index) => (
                  <article key={source.title} className="grid gap-3 border-t-2 border-[var(--sh-ink)] py-4 sm:grid-cols-[1fr_160px] sm:gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="sh-mono text-[9px] text-[var(--sh-muted)]">DOC 0{index + 1}</span>
                        <span className="sh-tag sh-tag--blue">Primary source</span>
                      </div>
                      <h3 className="sh-serif mt-2 text-2xl">{source.title}</h3>
                      <p className="mt-1 text-sm text-[var(--sh-muted)]">{source.publisher}</p>
                    </div>
                    <a href={source.href} target="_blank" rel="noreferrer" className="sh-link sh-mono inline-flex items-center gap-1 self-end text-[9px]">
                      Open source <ArrowUpRight size={11} />
                    </a>
                  </article>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['Official record', 'Text issued by an authority or court.'],
                  ['Court status', 'Procedural posture stated with its date.'],
                  ['Litigant claim', 'A party’s position, not a finding.'],
                ].map(([title, text]) => (
                  <div className="border border-[var(--sh-rule)] bg-[var(--sh-white)] p-4" key={title}>
                    <p className="sh-mono text-[9px] text-[var(--sh-blue)]">{title}</p>
                    <p className="mt-2 text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </NumberedSection>

            <NumberedSection number="05" eyebrow="Corrections" title="Corrections should be clear and traceable." id="corrections">
              <div className="flex items-start gap-3">
                <FileCheck2 size={18} className="mt-1 shrink-0 text-[var(--sh-red)]" />
                <div>
                  <p>When a material error is identified, the relevant record should be corrected and the change described alongside it. A correction should not silently rewrite the history of what readers saw.</p>
                  <p className="mt-4">If a source changes, a case status moves, or a date is corrected, the update should be labelled with what changed and when. This page does not claim a correction log beyond the records supplied for this preview.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 border-l-2 border-[var(--sh-amber)] bg-[#f0eadb] px-4 py-3 text-sm">
                <ShieldCheck size={15} className="shrink-0 text-[var(--sh-amber)]" />
                <span>Correction pathway details will be published here when an official editorial contact is provided.</span>
              </div>
            </NumberedSection>

            <NumberedSection number="06" eyebrow="Contact" title="Bring us a document, a correction or a question." id="contact">
              <p>Signal Hub does not have a verified public email address or contact form in the information supplied for this page. No contact details are invented here.</p>
              <div className="mt-5 flex items-start gap-3 border border-dashed border-[var(--sh-rule)] p-4">
                <Mail size={17} className="mt-1 shrink-0 text-[var(--sh-blue)]" />
                <p className="text-sm leading-relaxed">A public editorial contact channel can be added here once one is confirmed. Until then, this page makes no promise that an unlisted route is monitored.</p>
              </div>
            </NumberedSection>

            <div className="border-t border-[var(--sh-rule)] pt-5">
              <p className="sh-kicker">Record dates / 103rd Amendment</p>
              <div className="mt-4 grid gap-0 sm:grid-cols-2">
                {policyTimeline.map((item) => (
                  <a key={item.date} href={item.href} target="_blank" rel="noreferrer" className="group border-t-2 border-[var(--sh-ink)] py-4 sm:mr-5">
                    <p className="sh-mono text-[9px] text-[var(--sh-red)]">{item.date}</p>
                    <h3 className="sh-serif mt-2 text-xl group-hover:text-[var(--sh-red)]">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--sh-muted)]">{item.context}</p>
                    <span className="sh-link sh-mono mt-3 inline-flex items-center gap-1 text-[9px]">Read cited document <ArrowUpRight size={10} /></span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sh-container mt-10 border-t-2 border-[var(--sh-ink)] py-5">
        <p className="flex items-center gap-2 sh-mono text-[9px] text-[var(--sh-muted)]"><Check size={13} className="text-[var(--sh-blue)]" /> Scope: source-first research on rules, decisions and access in India.</p>
      </div>
    </AppShell>
  );
}

export default About;