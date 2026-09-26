import { ArrowDownRight, ArrowUpRight, BookOpen, FileText, Scale } from 'lucide-react';
import './_group.css';
import { AppShell } from './_shared/AppShell';
import { LeadRow, SectionTitle, SourceStatus } from './_shared/Editorial';
import { deskSnapshot, policyRecord, policyTimeline, sourceLeads } from './_shared/data';

export function Home() {
  return (
    <AppShell active="Investigations">
      <div className="sh-home">
        <style>{`
          .sh-home { padding-bottom: 4rem; }
          .sh-home .sh-container { width: min(1320px, calc(100% - 64px)); }
          .sh-home-hero { display:grid; grid-template-columns:minmax(0,1.16fr) minmax(280px,.84fr); gap:clamp(32px,6vw,90px); align-items:center; padding:clamp(44px,7vw,100px) 0 58px; }
          .sh-home-title { max-width:900px; margin:22px 0 0; font-size:clamp(62px,9.2vw,132px); line-height:.82; }
          .sh-home-title em { color:var(--sh-red); font-weight:400; }
          .sh-home-dek { max-width:590px; margin:30px 0 0; font-size:17px; line-height:1.7; }
          .sh-home-hero-image { position:relative; min-height:370px; overflow:hidden; background:#d7d0c5; }
          .sh-home-hero-image img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:saturate(.72); }
          .sh-home-image-caption { position:absolute; right:0; bottom:0; left:0; padding:32px 17px 14px; color:#fffdf8; background:linear-gradient(transparent,rgba(32,38,51,.86)); }
          .sh-home-index { display:flex; flex-wrap:wrap; align-items:center; gap:12px 18px; border-block:1px solid var(--sh-rule); padding:13px 0; }
          .sh-home-main { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(250px,.65fr); gap:clamp(34px,6vw,92px); margin-top:82px; }
          .sh-home-side { border-left:1px solid var(--sh-rule); padding-left:clamp(20px,3vw,40px); }
          .sh-home-metric { display:grid; grid-template-columns:54px 1fr; gap:12px; padding:17px 0; border-bottom:1px solid var(--sh-rule); }
          .sh-home-metric strong { font-family:var(--sh-serif); font-size:42px; font-weight:500; line-height:1; letter-spacing:-.06em; }
          .sh-home-feature { display:grid; grid-template-columns:minmax(0,1fr) 235px; gap:32px; padding:28px 0; border-bottom:1px solid var(--sh-rule); }
          .sh-home-feature-source { border-left:1px solid var(--sh-rule); padding-left:22px; }
          .sh-home-timeline { display:grid; grid-template-columns:1fr 1fr; gap:0 34px; margin-top:20px; }
          .sh-home-event { position:relative; padding:20px 0 20px 22px; border-top:1px solid var(--sh-rule); }
          .sh-home-event:before { position:absolute; top:27px; left:0; width:7px; height:7px; border:1px solid var(--sh-red); border-radius:50%; background:var(--sh-paper); content:''; }
          .sh-home-evidence { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); margin-top:24px; border-block:1px solid var(--sh-ink); }
          .sh-home-evidence > div { padding:18px 15px 20px 0; }
          .sh-home-evidence > div + div { border-left:1px solid var(--sh-rule); padding-left:15px; }
          .sh-home-note { border-left:3px solid var(--sh-amber); margin-top:22px; padding:14px 17px; background:#f0eadb; }
          .sh-home-section { margin-top:88px; }
          .sh-home-leads { margin-top:20px; }
          @media(max-width:820px) {
            .sh-home .sh-container { width:min(100% - 40px,680px); }
            .sh-home-hero { grid-template-columns:1fr; gap:30px; padding-top:48px; }
            .sh-home-title { font-size:clamp(58px,14vw,96px); }
            .sh-home-hero-image { min-height:290px; }
            .sh-home-main { grid-template-columns:1fr; margin-top:60px; }
            .sh-home-side { border-left:0; border-top:2px solid var(--sh-ink); padding:25px 0 0; }
            .sh-home-evidence { grid-template-columns:1fr 1fr; }
            .sh-home-evidence > div:nth-child(odd) { border-left:0; padding-left:0; }
            .sh-home-evidence > div:nth-child(n+3) { border-top:1px solid var(--sh-rule); }
          }
          @media(max-width:520px) {
            .sh-home .sh-container { width:calc(100% - 32px); }
            .sh-home-hero { padding:39px 0 35px; }
            .sh-home-title { font-size:clamp(54px,15vw,74px); }
            .sh-home-dek { margin-top:22px; font-size:15px; }
            .sh-home-hero-image { min-height:230px; }
            .sh-home-index { gap:8px 12px; }
            .sh-home-main,.sh-home-section { margin-top:58px; }
            .sh-home-feature { grid-template-columns:1fr; gap:20px; }
            .sh-home-feature-source { border-top:1px solid var(--sh-rule); border-left:0; padding:15px 0 0; }
            .sh-home-timeline { grid-template-columns:1fr; }
            .sh-home-evidence { grid-template-columns:1fr; }
            .sh-home-evidence > div + div { border-top:1px solid var(--sh-rule); border-left:0; padding-left:0; }
            .sh-home-evidence > div { padding:15px 0; }
          }
        `}</style>

        <div className="sh-container">
          <div className="sh-home-index">
            <span className="sh-kicker">Signal Hub / India</span>
            <span className="sh-mono sh-muted">Reservation rules</span>
            <span className="sh-mono sh-muted">Court decisions</span>
            <span className="sh-mono sh-muted">Education + public employment</span>
          </div>

          <section className="sh-home-hero" aria-labelledby="home-title">
            <div>
              <p className="sh-kicker">Current focus / source-first investigation</p>
              <h1 id="home-title" className="sh-serif sh-home-title">
                Who gets to<br /><em>compete</em> in the open?
              </h1>
              <p className="sh-home-dek">
                A careful reading of reservation rules, court decisions and the routes into
                education and public employment. We keep the official record, court status,
                litigant claims and analysis visibly distinct.
              </p>
              <a className="sh-button mt-7" href="#latest-signals">
                Enter the source desk <ArrowDownRight size={15} />
              </a>
              <p className="sh-mono sh-muted mt-5 text-[9px]">The open category is open to every candidate who qualifies—not an upper-caste-only pool.</p>
            </div>
            <figure className="sh-home-hero-image">
              <img src="/__mockup/images/supreme-court.jpg" alt="The Supreme Court of India building" />
              <figcaption className="sh-home-image-caption">
                <span className="sh-mono text-[9px]">Archive image · Supreme Court of India</span>
                <span className="sh-mono mt-1 block text-[8px]">Wikimedia Commons</span>
              </figcaption>
            </figure>
          </section>

          <section className="sh-home-main" aria-label="Desk snapshot and featured policy record">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4 border-y-2 border-[var(--sh-ink)] py-5">
                <div>
                  <p className="sh-kicker">Featured policy record</p>
                  <h2 className="sh-serif mt-2 max-w-3xl text-4xl leading-[.98] sm:text-5xl">{policyRecord.title}</h2>
                </div>
                <span className="sh-tag sh-tag--blue">Official record</span>
              </div>
              <div className="sh-home-feature">
                <div>
                  <p className="mt-1 max-w-3xl text-[15px] leading-relaxed text-[var(--sh-muted)]">{policyRecord.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="sh-tag sh-tag--amber">Effective · {policyRecord.effectiveDate}</span>
                    <span className="sh-tag sh-tag--red">Judgment · {policyRecord.judgmentDate}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">
                    The Supreme Court judgment is <em>{policyRecord.judgment}</em>. The constitutional text and the judgment are linked below as primary sources.
                  </p>
                </div>
                <div className="sh-home-feature-source">
                  <p className="sh-kicker">Primary sources</p>
                  {policyRecord.sources.map((source) => (
                    <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="sh-source-panel block">
                      <span className="sh-mono text-[9px] text-[var(--sh-muted)]">{source.type}</span>
                      <span className="sh-serif mt-2 block text-xl leading-tight">{source.title}</span>
                      <span className="sh-mono mt-3 inline-flex items-center gap-1 text-[9px] text-[var(--sh-blue)]">
                        {source.publisher} <ArrowUpRight size={11} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <Scale size={17} className="text-[var(--sh-red)]" aria-hidden="true" />
                  <p className="sh-kicker">Source-linked timeline preview</p>
                </div>
                <div className="sh-home-timeline">
                  {policyTimeline.map((event) => (
                    <article className="sh-home-event" key={event.date}>
                      <p className="sh-mono text-[10px]">{event.date}</p>
                      <h3 className="sh-serif mt-2 text-2xl leading-tight">{event.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--sh-muted)]">{event.context}</p>
                      <a className="sh-link sh-mono mt-3 inline-flex items-center gap-1 text-[9px]" href={event.href} target="_blank" rel="noreferrer">
                        {event.source} <ArrowUpRight size={11} />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <aside className="sh-home-side" aria-labelledby="snapshot-title">
              <p className="sh-kicker">The Numbers</p>
              <h2 id="snapshot-title" className="sh-serif mt-2 text-3xl leading-tight">Desk snapshot</h2>
              <p className="sh-mono mt-2 text-[9px] text-[var(--sh-muted)]">As of {deskSnapshot.date} · snapshot, not cumulative outcomes</p>
              <div className="mt-5">
                <div className="sh-home-metric">
                  <strong>{deskSnapshot.publishedFocusedRecords}</strong>
                  <div><p className="sh-kicker">Published focused records</p><p className="mt-1 text-xs text-[var(--sh-muted)]">Signal Hub records</p></div>
                </div>
                <div className="sh-home-metric">
                  <strong>{deskSnapshot.externalLeads}</strong>
                  <div><p className="sh-kicker">External leads</p><p className="mt-1 text-xs text-[var(--sh-muted)]">For editorial review; not Signal Hub reporting</p></div>
                </div>
                <div className="sh-home-metric">
                  <strong>{deskSnapshot.jurisdictions}</strong>
                  <div><p className="sh-kicker">Jurisdiction contexts</p><p className="mt-1 text-xs text-[var(--sh-muted)]">Contexts represented at this snapshot</p></div>
                </div>
              </div>
              <div className="sh-home-note">
                <p className="sh-kicker">Reading the snapshot</p>
                <p className="mt-2 text-sm leading-relaxed">These figures describe the live desk on {deskSnapshot.date}. They are not totals of outcomes, people, seats or movement.</p>
              </div>
            </aside>
          </section>

          <section id="latest-signals" className="sh-home-section">
            <SectionTitle
              index="01"
              eyebrow="Latest Signals"
              title={<>Items for<br />editorial review.</>}
              note="External source leads are not Signal Hub reporting. A lead is a starting point for checking the source and the underlying record—not a verified finding."
            />
            <div className="sh-home-leads">
              {sourceLeads.slice(0, 4).map((lead, index) => (
                <LeadRow key={lead.href} lead={lead} compact number={`0${index + 1}`} />
              ))}
            </div>
            <p className="sh-mono mt-5 text-[9px] text-[var(--sh-muted)]">
              Showing selected leads from the desk snapshot. Each item remains an external lead for editorial review.
            </p>
          </section>

          <section className="sh-home-section">
            <SectionTitle
              index="02"
              eyebrow="Evidence framing"
              title={<>Know what kind<br />of record you’re reading.</>}
              note="A claim, a court order and an official rule have different evidentiary status. Presentation should make that difference obvious."
            />
            <div className="sh-home-evidence">
              <div>
                <span className="sh-tag">Official record</span>
                <p className="mt-3 text-sm leading-relaxed">Text issued by a legislature or public authority. Read the document, date and scope.</p>
              </div>
              <div>
                <span className="sh-tag sh-tag--blue">Court status</span>
                <p className="mt-3 text-sm leading-relaxed">Orders and judgments are linked to the court record. An interim status is not a final decision.</p>
              </div>
              <div>
                <span className="sh-tag sh-tag--amber">Litigant claims</span>
                <p className="mt-3 text-sm leading-relaxed">Arguments made by parties remain attributed positions unless the court adopts them.</p>
              </div>
              <div>
                <span className="sh-tag sh-tag--red">Analysis</span>
                <p className="mt-3 text-sm leading-relaxed">Interpretation is identified as analysis, with its basis made available to readers.</p>
              </div>
              <div>
                <SourceStatus />
                <p className="mt-3 text-sm leading-relaxed">A link gathered for review—not original Signal Hub reporting or a published finding.</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--sh-rule)] pt-5">
              <BookOpen size={17} className="text-[var(--sh-blue)]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-[var(--sh-muted)]">
                When the public record does not establish an outcome or a trend, the page leaves that gap visible rather than filling it with inference.
              </p>
              <FileText size={16} className="ml-auto text-[var(--sh-muted)]" aria-hidden="true" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

export default Home;