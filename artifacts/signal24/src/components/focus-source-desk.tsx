import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

type FocusLane =
  | 'UGC rules'
  | 'State quota disputes'
  | 'Open competition'
  | 'EWS / eligibility'
  | 'Public action';

type FocusSource = {
  title: string;
  publisher: string;
  date: string;
  lane: FocusLane;
  place: string;
  summary: string;
  href: string;
};

export const FOCUS_SOURCES: FocusSource[] = [
  {
    title: 'Centre tells Supreme Court it is reconsidering the UGC equity regulations',
    publisher: 'The Indian Express',
    date: '2026-08-20',
    lane: 'UGC rules',
    place: 'National / higher education',
    summary:
      'The Centre told the Court the 2026 regulations were under reconsideration. Petitioners have argued that the rules do not adequately protect general and non-reserved students; that remains a litigant position, not a final court finding.',
    href: 'https://indianexpress.com/article/legal-news/centre-reviewing-ugc-anti-discrimination-rules-sc-10841851/',
  },
  {
    title: 'Why petitioners challenged the 2026 UGC equity regulations',
    publisher: 'Supreme Court Observer',
    date: '2026-01-29',
    lane: 'UGC rules',
    place: 'National / Supreme Court',
    summary:
      'A case analysis explains the challenge to the regulations and the Supreme Court’s interim stay. Check the latest court order before treating the stay or reconsideration as the final status.',
    href: 'https://www.scobserver.in/journal/supreme-court-stays-2026-ugc-equity-regulations',
  },
  {
    title: 'Maharashtra Maratha quota case set for another rehearing',
    publisher: 'Bar & Bench',
    date: '2026-09-18',
    lane: 'State quota disputes',
    place: 'Maharashtra / education and public jobs',
    summary:
      'The report says the Bombay High Court will rehear challenges to the additional 10% Maratha quota from October 9. The open-category impact depends on the applicable recruitment or admission rules and the current court record.',
    href: 'https://www.barandbench.com/news/new-bench-old-battle-maratha-reservation-case-to-be-reheard-for-third-time-by-bombay-high-court',
  },
  {
    title: 'MP OBC quota dispute and recruitment posts on hold',
    publisher: 'Dainik Jagran',
    date: '2026-07-20',
    lane: 'State quota disputes',
    place: 'Madhya Pradesh / public recruitment',
    summary:
      'The report describes the 27% OBC quota litigation, an interim 87:13 recruitment formula, and regular High Court hearings beginning July 15. It is a dated status report, not a substitute for the latest cause list or order.',
    href: 'https://www.thedailyjagran.com/india/mp-obc-quota-row-8713-formula-leaves-nearly-10000-govt-jobs-on-hold-jabalpur-hc-begins-daily-hearings-10321400',
  },
  {
    title: 'Madhya Pradesh Group-5 recruitment vacancy schedule',
    publisher: 'Madhya Pradesh Employees Selection Board',
    date: '2026-09-18',
    lane: 'Open competition',
    place: 'Madhya Pradesh / recruitment data',
    summary:
      'The official schedule lists category-wise vacancies, including UR, for the Group-5 recruitment. Read the allocation for the specific exam and post rather than inferring a single statewide open-seat share.',
    href: 'https://esb.mp.gov.in/statistical_information/Schedule_2026.pdf',
  },
  {
    title: 'Delhi High Court questions a blanket ban on an anti-reservation protest',
    publisher: 'Scroll.in',
    date: '2026-09-17',
    lane: 'Public action',
    place: 'Delhi / protest permissions',
    summary:
      'A report on the court’s questions to police about withdrawing permission for a proposed protest concerning reservation and the UGC regulations.',
    href: 'https://scroll.in/latest/1095802/scroll_in',
  },
  {
    title: 'Upper-caste groups protest UGC and reservation rules in Greater Noida',
    publisher: 'NDTV India',
    date: '2026-09-16',
    lane: 'Public action',
    place: 'Uttar Pradesh / public protest',
    summary:
      'A report on a protest over UGC rules and reservation policy. Protest demands are presented as reported, not as evidence of how all general-category applicants feel.',
    href: 'https://ndtv.in/uttar-pradesh-news/greater-noida-upper-caste-community-protests-over-ugc-and-reservation-issues-protesters-climb-water-tank-12056369',
  },
  {
    title: 'Agra protest seeks UGC rollback and economic criteria',
    publisher: 'ABP News',
    date: '2026-09-20',
    lane: 'Public action',
    place: 'Uttar Pradesh / public protest',
    summary:
      'The report describes protest demands around the UGC regulations and reservation criteria. These are attributed demands, not a settled policy outcome.',
    href: 'https://www.abplive.com/states/up-uk/agra-upper-caste-people-protest-on-yamuna-expressway-demanding-a-ugc-rollback-ann-3191478',
  },
  {
    title: 'Bihar protest seeks a 65% reservation framework',
    publisher: 'The Indian Express',
    date: '2026-09-09',
    lane: 'Open competition',
    place: 'Bihar / quota ceiling debate',
    summary:
      'The report covers a demand to raise reservation to 65%. The practical effect on open competition depends on the legal framework and how open seats are allocated; the demand itself is not a rule in force.',
    href: 'https://indianexpress.com/article/india/bihar-patna-protest-reservation-quota-dalit-obc-activists-10868808/lite/',
  },
  {
    title: 'Bihar changes creamy-layer eligibility rules',
    publisher: 'The Indian Express',
    date: '2026-09-04',
    lane: 'EWS / eligibility',
    place: 'Bihar / OBC eligibility',
    summary:
      'The report concerns which income sources count in creamy-layer assessment. This is an eligibility-rule change for OBC benefits, not a direct measure of open-category seats.',
    href: 'https://indianexpress.com/article/india/bihar-creamy-layer-rules-parents-salary-farm-income-quota-10863023/',
  },
  {
    title: 'Government restates the EWS framework under the 103rd Amendment',
    publisher: 'Press Information Bureau / Government of India',
    date: '2026-08-05',
    lane: 'EWS / eligibility',
    place: 'National / constitutional amendment',
    summary:
      'The official reply describes the EWS framework created by the Constitution (103rd Amendment) Act, 2019 and says no proposal to amend the existing EWS provisions was under consideration at that time.',
    href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2295093&lang=1&reg=6',
  },
  {
    title: 'JP Nadda meets a group seeking income-based quotas',
    publisher: 'Hindustan Times',
    date: '2026-08-28',
    lane: 'Public action',
    place: 'National / political engagement',
    summary:
      'A report on a meeting with a group seeking income-based criteria in place of caste-based reservation. It records political engagement, not a government decision.',
    href: 'https://www.hindustantimes.com/india-news/union-minister-jp-nadda-meets-protesters-to-discuss-income-based-reservation-demands-101787883193765.html/',
  },
  {
    title: 'Reservation pressure and the political response',
    publisher: 'Hindustan Times',
    date: '2026-09-03',
    lane: 'Public action',
    place: 'National / political context',
    summary:
      'A political analysis of organised upper-caste demands and party messaging. Treat this as reported political context, not a measure of public opinion.',
    href: 'https://www.hindustantimes.com/india-news/bjp-seeks-to-reset-political-narrative-with-spotlight-on-development-model-economy-101788376366536.html',
  },
];

const LANES: Array<'All focus' | FocusLane> = [
  'All focus',
  'UGC rules',
  'State quota disputes',
  'Open competition',
  'EWS / eligibility',
  'Public action',
];

export function FocusSourceDesk() {
  const [activeLane, setActiveLane] = useState<(typeof LANES)[number]>('All focus');
  const visibleSources =
    activeLane === 'All focus'
      ? FOCUS_SOURCES
      : FOCUS_SOURCES.filter((source) => source.lane === activeLane);

  return (
    <section id="focus-desk" className="signal-container pt-20 sm:pt-28" aria-labelledby="focus-desk-title">
      <div className="border-y-2 border-primary py-6">
        <p className="signal-kicker text-accent">02 / Editorial focus</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <h2 id="focus-desk-title" className="max-w-4xl font-display text-5xl leading-[.88] tracking-[-.055em] sm:text-7xl">
            Rules, rulings<br /><em className="font-normal text-accent">and open competition.</em>
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            A focused reading list on the UGC equity regulations, state quota disputes, eligibility rules and the open-category question. These are external sources supplied or checked for this desk—not Signal 24 reporting. Each item still needs editorial review before its claims are adopted.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter focus sources">
        {LANES.map((lane) => (
          <button
            key={lane}
            type="button"
            onClick={() => setActiveLane(lane)}
            aria-pressed={activeLane === lane}
            className={`border px-3 py-2 signal-kicker transition-colors ${activeLane === lane ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 hover:border-accent hover:text-accent'}`}
            data-testid={`button-focus-lane-${lane.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            {lane}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSources.map((source) => (
          <article key={source.href} className="signal-home-panel flex min-w-0 flex-col p-5" data-testid="card-focus-source">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="signal-kicker text-accent">{source.lane}</span>
              <time className="signal-kicker text-muted-foreground" dateTime={source.date}>
                {new Date(`${source.date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </time>
            </div>
            <p className="mt-3 signal-kicker text-muted-foreground">{source.place}</p>
            <h3 className="mt-2 font-display text-2xl leading-tight">{source.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{source.summary}</p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-foreground/15 pt-4">
              <span className="signal-kicker text-muted-foreground">{source.publisher}</span>
              <a href={source.href} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 signal-kicker text-accent hover:underline">
                Source <ExternalLink size={12} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted-foreground">
        Terminology note: “open” seats are generally open to eligible candidates of all categories; they are not a reserved pool for upper-caste applicants. “Modi Act” is not used as a legal title here; the identified constitutional source is the 103rd Amendment and EWS framework.
      </p>
    </section>
  );
}