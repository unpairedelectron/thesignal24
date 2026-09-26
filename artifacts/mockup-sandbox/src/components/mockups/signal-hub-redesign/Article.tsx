import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, BookOpen, FileText, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { AppShell } from './_shared/AppShell';
import { LeadRow, ReadTime, SectionTitle, SourceCard, SourceStatus } from './_shared/Editorial';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';
import './_group.css';

type ArticleVariant = 'annotated' | 'documents' | 'mobile';

const sectionLinks = [
  ['key-fact', 'Key fact'],
  ['what-changed', 'What changed'],
  ['why-it-matters', 'Why it matters'],
  ['documented-evidence', 'Documented evidence'],
  ['timeline', 'Timeline'],
  ['sources', 'Source documents'],
  ['related-leads', 'Related leads'],
] as const;

const articleStyles = `
  .sh-article { padding-bottom: 30px; }
  .sh-article .sh-article-title { font-size: clamp(3.2rem, 7.4vw, 6.7rem); }
  .sh-article .sh-intro { max-width: 720px; font-family: var(--sh-serif); font-size: clamp(1.25rem, 2vw, 1.65rem); line-height: 1.55; }
  .sh-article .sh-article-layout { display: grid; gap: 34px; }
  .sh-article[data-variant="annotated"] .sh-article-layout { grid-template-columns: 150px minmax(0, 690px) 164px; justify-content: center; }
  .sh-article[data-variant="documents"] .sh-article-layout { grid-template-columns: minmax(220px, 290px) minmax(0, 720px); justify-content: center; gap: clamp(30px, 5vw, 76px); }
  .sh-article[data-variant="mobile"] .sh-article-layout { grid-template-columns: minmax(0, 740px); justify-content: center; }
  .sh-article .sh-reading-copy { max-width: 720px; font-family: var(--sh-serif); font-size: 19px; line-height: 1.72; }
  .sh-article .sh-reading-copy p + p { margin-top: 1.15em; }
  .sh-article .sh-inline-cite { display: inline-flex; min-width: 1.5em; justify-content: center; border-bottom: 1px solid var(--sh-red); color: var(--sh-red); font-family: var(--sh-mono); font-size: .63em; line-height: 1.2; vertical-align: super; }
  .sh-article .sh-margin-note { border-top: 2px solid var(--sh-red); padding-top: 10px; color: var(--sh-muted); font-size: 11px; line-height: 1.55; }
  .sh-article .sh-margin-note + .sh-margin-note { margin-top: 34px; }
  .sh-article .sh-toc a { display: block; border-left: 1px solid var(--sh-rule); padding: 7px 0 7px 11px; color: var(--sh-muted); font-family: var(--sh-mono); font-size: 9px; letter-spacing: .04em; text-transform: uppercase; }
  .sh-article .sh-toc a:hover, .sh-article .sh-toc a:focus-visible { border-left: 2px solid var(--sh-red); color: var(--sh-red); }
  .sh-article .sh-document-index { position: sticky; top: 20px; align-self: start; }
  .sh-article .sh-key-fact { border-left: 3px solid var(--sh-red); background: #f0e3df; }
  .sh-article .sh-evidence-row { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 17px; border-top: 1px solid var(--sh-rule); padding: 17px 0; }
  .sh-article .sh-mobile-drawer-backdrop { position: fixed; z-index: 40; inset: 0; border: 0; background: rgba(32,38,51,.42); }
  .sh-article .sh-mobile-drawer { position: fixed; z-index: 41; top: 0; right: 0; bottom: 0; width: min(480px, 100%); overflow-y: auto; border-left: 1px solid var(--sh-rule); background: var(--sh-paper); padding: 24px; box-shadow: -18px 0 42px rgba(32,38,51,.15); }
  .sh-article[data-variant="documents"] .sh-article-title { font-size: clamp(3rem, 6vw, 5.8rem); }
  .sh-article[data-variant="documents"] .sh-title-block { border-bottom: 1px solid var(--sh-rule); }
  .sh-article[data-variant="mobile"] .sh-article-title { font-size: clamp(3rem, 8vw, 5.5rem); }
  .sh-article[data-variant="mobile"] .sh-reading-copy { font-size: 20px; line-height: 1.78; }
  @media (max-width: 1050px) {
    .sh-article[data-variant="annotated"] .sh-article-layout { grid-template-columns: 125px minmax(0, 700px); }
    .sh-article[data-variant="annotated"] .sh-margin-rail { display: none; }
  }
  @media (max-width: 800px) {
    .sh-article[data-variant="annotated"] .sh-article-layout,
    .sh-article[data-variant="documents"] .sh-article-layout { grid-template-columns: minmax(0, 720px); }
    .sh-article .sh-document-index { position: static; }
    .sh-article .sh-desktop-toc { display: none; }
  }
  @media (max-width: 560px) {
    .sh-article .sh-evidence-row { grid-template-columns: 1fr; gap: 5px; }
    .sh-article .sh-reading-copy { font-size: 18px; }
  }
`;

function Contents({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Article contents" className={`sh-toc ${compact ? '' : 'sh-desktop-toc'}`}>
      <p className="sh-kicker mb-3">In this record</p>
      {sectionLinks.map(([id, label]) => (
        <a href={`#${id}`} key={id}>{label}</a>
      ))}
    </nav>
  );
}

function MarginNotes() {
  return (
    <aside className="sh-margin-rail pt-2" aria-label="Margin citations">
      <p className="sh-kicker mb-4">Margin notes</p>
      <div className="sh-margin-note">
        <span className="sh-mono text-[var(--sh-red)]">[1] Official record</span>
        <p className="mt-2">The constitutional text is the primary source for Articles 15(6) and 16(6).</p>
        <a href={policyRecord.sources[0].href} className="sh-link mt-2 inline-block">Open Constitution</a>
      </div>
      <div className="sh-margin-note">
        <span className="sh-mono text-[var(--sh-red)]">[2] Court status</span>
        <p className="mt-2">The supplied Supreme Court judgment records the outcome in Janhit Abhiyan.</p>
        <a href={policyRecord.sources[1].href} className="sh-link mt-2 inline-block">Open judgment</a>
      </div>
    </aside>
  );
}

function SourceDocuments({ compact = false }: { compact?: boolean }) {
  return (
    <div id="source-documents" className={`grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
      {policyRecord.sources.map((source, index) => (
        <SourceCard
          key={source.href}
          title={source.title}
          publisher={source.publisher}
          type={source.type}
          href={source.href}
          date={index === 1 ? policyRecord.judgmentDate : undefined}
        />
      ))}
    </div>
  );
}

function SnapshotLine() {
  return (
    <aside className="border-y border-[var(--sh-rule)] py-4" aria-label={`Live desk snapshot, ${deskSnapshot.date}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="sh-kicker">Live desk snapshot · {deskSnapshot.date}</p>
        <dl className="flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-baseline gap-2"><dt className="sh-mono text-[9px] text-[var(--sh-muted)]">Published focused records</dt><dd className="sh-mono text-sm">{deskSnapshot.publishedFocusedRecords}</dd></div>
          <div className="flex items-baseline gap-2"><dt className="sh-mono text-[9px] text-[var(--sh-muted)]">External leads</dt><dd className="sh-mono text-sm">{deskSnapshot.externalLeads}</dd></div>
          <div className="flex items-baseline gap-2"><dt className="sh-mono text-[9px] text-[var(--sh-muted)]">Jurisdiction contexts</dt><dd className="sh-mono text-sm">{deskSnapshot.jurisdictions}</dd></div>
        </dl>
      </div>
      <p className="mt-2 text-[11px] text-[var(--sh-muted)]">A desk snapshot, not cumulative outcomes or a count of this record’s effects.</p>
    </aside>
  );
}

export function Article() {
  const requestedVariant = new URLSearchParams(window.location.search).get('variant');
  const variant: ArticleVariant =
    requestedVariant === 'documents' || requestedVariant === 'mobile'
      ? requestedVariant
      : 'annotated';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawerCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        return;
      }
      if (event.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      returnFocus?.focus();
    };
  }, [drawerOpen]);

  const documentLead = sourceLeads[6];
  const recruitmentLead = sourceLeads[3];

  return (
    <AppShell active="Explainers">
      <style>{articleStyles}</style>
      <div className="signal-hub sh-article" data-variant={variant}>
        <div className="sh-container pt-7 sm:pt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="sh-kicker">Policy record / Constitutional change</p>
            <div className="flex items-center gap-3">
              <ReadTime />
              {variant === 'mobile' && (
                <button
                  type="button"
                  className="sh-button sh-button--outline !min-h-[38px] !px-3"
                  aria-expanded={drawerOpen}
                  aria-controls="sh-evidence-drawer"
                  onClick={() => setDrawerOpen(true)}
                >
                  <PanelRightOpen size={14} />
                  Evidence drawer
                </button>
              )}
            </div>
          </div>

          <header className={`sh-title-block py-8 sm:py-12 ${variant === 'documents' ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end' : ''}`}>
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="sh-tag sh-tag--red">Official record</span>
                <span className="sh-tag sh-tag--blue">Court status documented</span>
              </div>
              <p className="sh-kicker">The Constitution · Articles 15(6) and 16(6)</p>
              <h1 className="sh-serif sh-article-title mt-4 max-w-5xl leading-[.91]">
                {policyRecord.title}
              </h1>
              <p className="sh-intro mt-6 max-w-3xl text-[var(--sh-muted)]">
                What the constitutional change authorized, what the Supreme Court decided in <em>Janhit Abhiyan</em>, and what this record cannot tell us about outcomes.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="sh-mono text-[9px] text-[var(--sh-muted)]">Authority / {policyRecord.authority}</span>
                <span className="sh-mono text-[9px] text-[var(--sh-muted)]">In force / {policyRecord.effectiveDate}</span>
                <a href="#sources" className="sh-link sh-mono inline-flex items-center gap-1 text-[9px]">Go to source documents <ArrowDown size={11} /></a>
              </div>
            </div>
            {variant === 'documents' && (
              <aside className="border-l-2 border-[var(--sh-amber)] pl-4">
                <p className="sh-kicker">Start with the documents</p>
                <p className="sh-serif mt-2 text-2xl leading-tight">Text first. Interpretation second.</p>
                <a className="sh-link sh-mono mt-4 inline-flex items-center gap-1 text-[9px]" href="#sources">Open the two primary sources <ArrowDown size={11} /></a>
              </aside>
            )}
          </header>

          <SnapshotLine />

          <div className="sh-article-layout mt-9 sm:mt-12">
            {variant === 'annotated' && (
              <aside className="sh-desktop-toc self-start pt-1">
                <Contents />
              </aside>
            )}
            {variant === 'documents' && (
              <aside className="sh-document-index">
                <div className="border-y-2 border-[var(--sh-ink)] py-4">
                  <p className="sh-kicker">Document index</p>
                  <p className="sh-serif mt-2 text-2xl leading-tight">Two primary sources anchor this record.</p>
                </div>
                <div className="mt-4"><SourceDocuments compact /></div>
                <div className="mt-8"><Contents compact /></div>
                <p className="mt-6 border-l-2 border-[var(--sh-amber)] pl-3 text-xs leading-relaxed text-[var(--sh-muted)]">Source-linked explainer. The external leads below are not Signal Hub reporting.</p>
              </aside>
            )}

            <article className="min-w-0">
              {variant !== 'documents' && (
                <details className="mb-7 border-y border-[var(--sh-rule)] py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span className="sh-mono text-[10px]">Article contents</span>
                    <BookOpen size={15} aria-hidden="true" />
                  </summary>
                  <div className="mt-3 grid grid-cols-2 gap-x-4">
                    <Contents compact />
                  </div>
                </details>
              )}
              <section id="key-fact" className="sh-key-fact px-5 py-5 sm:px-7 sm:py-6">
                <p className="sh-kicker">Key fact / Official record</p>
                <p className="sh-serif mt-3 text-2xl leading-[1.2] sm:text-3xl">
                  The 103rd Amendment inserted Articles 15(6) and 16(6), creating a constitutional framework for special provisions for economically weaker sections in education and public employment.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--sh-muted)]">
                  The amendment took effect on {policyRecord.effectiveDate}. In {policyRecord.judgment}, the Supreme Court upheld it on {policyRecord.judgmentDate}.
                </p>
              </section>

              <section id="what-changed" className="mt-11 scroll-mt-6">
                <SectionTitle index="01" eyebrow="Official record" title="What changed" note="Read the clauses as an authorization in the constitutional text—not as a count of admissions or appointments." />
                <div className="sh-reading-copy mt-6">
                  <p>
                    The {policyRecord.legalBasis} added clauses 15(6) and 16(6) to the Constitution. Together, they provide for special measures for economically weaker sections in education and public employment.<a className="sh-inline-cite" href={policyRecord.sources[0].href} aria-label="Citation 1: Constitution of India">1</a>
                  </p>
                  <p>
                    The effective date in this record is {policyRecord.effectiveDate}. The legal basis is the amendment itself; the Constitution of India is the primary text linked here for the relevant provisions.
                  </p>
                </div>
              </section>

              <section id="why-it-matters" className="mt-12 scroll-mt-6">
                <SectionTitle index="02" eyebrow="Analysis" title="Why it matters" note="A legal framework answers what may be provided for. It does not, on its own, measure who received a seat or post." />
                <div className="sh-reading-copy mt-6">
                  <p>
                    The amendment is a constitutional change about the authority to make special provisions. Keeping that legal question separate from implementation outcomes matters: this record contains the legal text and court status, not admissions or recruitment data.
                  </p>
                  <p>
                    “Open category” describes seats open to all candidates who meet the applicable qualifying rules. It is not an exclusive pool for upper-caste applicants. This terminology note is separate from the amendment’s EWS framework.
                  </p>
                </div>
                <aside className="mt-6 border-y border-[var(--sh-rule)] py-4">
                  <p className="sh-kicker">What this record does not establish</p>
                  <p className="mt-2 text-sm leading-relaxed">It does not measure outcomes, quantify migration, or quantify decision pressure. No such estimates are presented here.</p>
                </aside>
              </section>

              <section id="documented-evidence" className="mt-12 scroll-mt-6">
                <SectionTitle index="03" eyebrow="Evidence ledger" title="Documented evidence" note="Official text, court status, analysis and litigant claims are different evidence classes. Only the first two are summarized here." />
                <div className="mt-3">
                  <div className="sh-evidence-row">
                    <div><span className="sh-tag sh-tag--blue">Official record</span></div>
                    <div>
                      <h3 className="sh-serif text-2xl">The constitutional text</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">The amendment and the Constitution are the primary sources for the provisions and effective date.</p>
                    </div>
                  </div>
                  <div className="sh-evidence-row">
                    <div><span className="sh-tag sh-tag--amber">Court status</span></div>
                    <div>
                      <h3 className="sh-serif text-2xl">Upheld in Janhit Abhiyan</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">The Supreme Court judgment dated {policyRecord.judgmentDate} upheld the 103rd Amendment.<a className="sh-inline-cite" href={policyRecord.sources[1].href} aria-label="Citation 2: Janhit Abhiyan judgment">2</a></p>
                    </div>
                  </div>
                  <div className="sh-evidence-row">
                    <div><span className="sh-tag">Litigant claims</span></div>
                    <div>
                      <h3 className="sh-serif text-2xl">Not summarized in this record</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">This explainer reports the court’s status, not party arguments or claims.</p>
                    </div>
                  </div>
                  <div className="sh-evidence-row">
                    <div><span className="sh-tag sh-tag--red">Analysis</span></div>
                    <div>
                      <h3 className="sh-serif text-2xl">Authorization is not an outcome measure</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">No outcome dataset is included; the record does not measure outcomes.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="timeline" className="mt-12 scroll-mt-6">
                <SectionTitle index="04" eyebrow="Record chronology" title="Two dates in the file" note="Dates shown here are limited to the amendment’s effective date and the judgment date supplied in the source record." />
                <ol className="mt-5 border-l border-[var(--sh-rule)] pl-5 sm:pl-7">
                  {policyTimeline.map((event) => (
                    <li key={event.date} className="relative border-b border-[var(--sh-rule)] py-5 last:border-b-0">
                      <span className="absolute -left-[27px] top-[27px] h-2 w-2 rounded-full border border-[var(--sh-red)] bg-[var(--sh-paper)] sm:-left-[35px]" aria-hidden="true" />
                      <time className="sh-mono text-[10px] text-[var(--sh-red)]">{event.date}</time>
                      <h3 className="sh-serif mt-2 text-2xl leading-tight">{event.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--sh-muted)]">{event.context}</p>
                      <a href={event.href} target="_blank" rel="noreferrer" className="sh-link sh-mono mt-3 inline-flex items-center gap-1 text-[9px]">{event.source} <ArrowUpRight size={11} /></a>
                    </li>
                  ))}
                </ol>
              </section>

              {variant !== 'documents' && (
                <section id="sources" className="mt-12 scroll-mt-6">
                  <SectionTitle index="05" eyebrow="Primary sources" title="Source documents" note="The two source links used for the official record and court status." />
                  <div className="mt-5"><SourceDocuments /></div>
                </section>
              )}

              <section id="related-leads" className="mt-12 scroll-mt-6">
                <div className="border-y-2 border-[var(--sh-ink)] py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="sh-kicker">06 / Adjacent desk context</p>
                    <SourceStatus />
                  </div>
                  <h2 className="sh-serif mt-3 text-4xl leading-[.98] sm:text-5xl">Related leads, clearly separate</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sh-muted)]">These are adjacent external source leads for editorial review, not sources for the 103rd Amendment’s outcome and not Signal Hub reporting.</p>
                </div>
                <div className="mt-2">
                  {[documentLead, recruitmentLead].map((lead) => (
                    <LeadRow key={lead.href} lead={lead} compact />
                  ))}
                </div>
              </section>

              <section id="research-desk" className="mt-12 border-t-2 border-[var(--sh-ink)] py-5">
                <div className="flex items-start gap-3">
                  <FileText size={17} className="mt-1 text-[var(--sh-red)]" aria-hidden="true" />
                  <div>
                    <p className="sh-kicker">Research desk / Signal Hub</p>
                    <p className="sh-serif mt-2 text-2xl">Source-led record. No individual author attribution is supplied.</p>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sh-muted)]">Built from the linked constitutional text and Supreme Court judgment. External leads remain separately labeled for review. The record does not measure outcomes.</p>
                  </div>
                </div>
              </section>
            </article>

            {variant === 'annotated' && <MarginNotes />}
          </div>

          {variant === 'documents' && (
            <section id="sources" className="mx-auto mt-12 max-w-[1030px] scroll-mt-6">
              <SectionTitle index="05" eyebrow="Source file" title="Primary documents" note="Open the original constitutional source and judgment. These are the only primary-source links in this record." />
              <div className="mt-5"><SourceDocuments /></div>
            </section>
          )}
        </div>

        {drawerOpen && variant === 'mobile' && (
          <>
            <button className="sh-mobile-drawer-backdrop" aria-label="Close evidence drawer" onClick={() => setDrawerOpen(false)} />
            <aside
              id="sh-evidence-drawer"
              className="sh-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sh-evidence-title"
              ref={drawerRef}
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--sh-rule)] pb-4">
                <div>
                  <p className="sh-kicker">Evidence drawer</p>
                  <h2 id="sh-evidence-title" className="sh-serif mt-2 text-3xl">The source file</h2>
                </div>
                <button type="button" className="sh-icon-button" ref={drawerCloseRef} onClick={() => setDrawerOpen(false)} aria-label="Close evidence drawer">
                  <PanelRightClose size={19} />
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--sh-muted)]">Primary sources for the official record and the court status. Open links in their original source.</p>
              <div className="mt-5"><SourceDocuments compact /></div>
              <div className="mt-7 border-t border-[var(--sh-rule)] pt-4">
                <p className="sh-kicker">Evidence labels</p>
                <ul className="mt-3 space-y-3 text-sm">
                  <li><span className="sh-tag sh-tag--blue">Official record</span><span className="ml-2">Constitutional text</span></li>
                  <li><span className="sh-tag sh-tag--amber">Court status</span><span className="ml-2">Janhit Abhiyan judgment</span></li>
                  <li><span className="sh-tag sh-tag--red">Analysis</span><span className="ml-2">Does not measure outcomes</span></li>
                </ul>
              </div>
              <button type="button" className="sh-button mt-7 w-full" onClick={() => setDrawerOpen(false)}>Return to article</button>
            </aside>
          </>
        )}
      </div>
    </AppShell>
  );
}