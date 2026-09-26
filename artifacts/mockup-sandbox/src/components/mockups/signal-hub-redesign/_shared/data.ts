export type SourceLead = {
  title: string;
  publisher: string;
  date: string;
  lane: string;
  place: string;
  summary: string;
  href: string;
};

// These are external links already listed in the live source desk. They are
// framed as leads for review, never as Signal Hub reporting.
export const sourceLeads: SourceLead[] = [
  {
    title: 'Centre tells Supreme Court it is reconsidering the UGC equity regulations',
    publisher: 'The Indian Express',
    date: '20 Aug 2026',
    lane: 'UGC rules',
    place: 'National · higher education',
    summary:
      'The Centre told the Court the 2026 regulations were under reconsideration. Petitioners’ objections remain litigant positions, not a final court finding.',
    href: 'https://indianexpress.com/article/legal-news/centre-reviewing-ugc-anti-discrimination-rules-sc-10841851/',
  },
  {
    title: 'Why petitioners challenged the 2026 UGC equity regulations',
    publisher: 'Supreme Court Observer',
    date: '29 Jan 2026',
    lane: 'UGC rules',
    place: 'National · Supreme Court',
    summary:
      'A case analysis explains the challenge and the interim stay. Check the latest court order before treating the status as final.',
    href: 'https://www.scobserver.in/journal/supreme-court-stays-2026-ugc-equity-regulations',
  },
  {
    title: 'Maharashtra Maratha quota case set for another rehearing',
    publisher: 'Bar & Bench',
    date: '18 Sep 2026',
    lane: 'State quota disputes',
    place: 'Maharashtra · education and public jobs',
    summary:
      'The report says the Bombay High Court will rehear challenges from 9 October. The open-category impact depends on the applicable rules and current court record.',
    href: 'https://www.barandbench.com/news/new-bench-old-battle-maratha-reservation-case-to-be-reheard-for-third-time-by-bombay-high-court',
  },
  {
    title: 'Madhya Pradesh Group-5 recruitment vacancy schedule',
    publisher: 'Madhya Pradesh Employees Selection Board',
    date: '18 Sep 2026',
    lane: 'Open competition',
    place: 'Madhya Pradesh · recruitment data',
    summary:
      'The official schedule lists category-wise vacancies, including UR. Read the allocation for the specific exam and post rather than inferring a statewide share.',
    href: 'https://esb.mp.gov.in/statistical_information/Schedule_2026.pdf',
  },
  {
    title: 'Delhi High Court questions a blanket ban on an anti-reservation protest',
    publisher: 'Scroll.in',
    date: '17 Sep 2026',
    lane: 'Public action',
    place: 'Delhi · protest permissions',
    summary:
      'A report on the Court’s questions to police about withdrawing permission for a proposed protest concerning reservation and UGC regulations.',
    href: 'https://scroll.in/latest/1095802/scroll_in',
  },
  {
    title: 'Bihar protest seeks a 65% reservation framework',
    publisher: 'The Indian Express',
    date: '9 Sep 2026',
    lane: 'Open competition',
    place: 'Bihar · quota ceiling debate',
    summary:
      'The report covers a demand to raise reservation to 65%. A demand is not a rule in force; the practical effect depends on the legal framework and allocation.',
    href: 'https://indianexpress.com/article/india/bihar-patna-protest-reservation-quota-dalit-obc-activists-10868808/lite/',
  },
  {
    title: 'Bihar changes creamy-layer eligibility rules',
    publisher: 'The Indian Express',
    date: '4 Sep 2026',
    lane: 'EWS / eligibility',
    place: 'Bihar · OBC eligibility',
    summary:
      'The report concerns which income sources count in creamy-layer assessment. It is an eligibility-rule change, not a direct measure of open seats.',
    href: 'https://indianexpress.com/article/india/bihar-creamy-layer-rules-parents-salary-farm-income-quota-10863023/',
  },
];

export const policyRecord = {
  title: 'The 103rd Amendment added an EWS reservation framework',
  summary:
    'The constitutional amendment created a separate framework for economically weaker sections in education and public employment, followed by a Supreme Court challenge.',
  authority: 'Parliament of India',
  legalBasis: 'Constitution (One Hundred and Third Amendment) Act, 2019',
  effectiveDate: '14 Jan 2019',
  judgmentDate: '7 Nov 2022',
  judgment: 'Janhit Abhiyan v. Union of India',
  sources: [
    {
      title: 'Constitution of India',
      publisher: 'Legislative Department, Government of India',
      type: 'Constitutional text · primary source',
      href: 'https://legislative.gov.in/constitution-of-india/',
    },
    {
      title: 'Janhit Abhiyan v. Union of India judgment',
      publisher: 'Supreme Court of India',
      type: 'Court judgment · primary source',
      href: 'https://main.sci.gov.in/supremecourt/2022/20936/20936_2022_1_1501_39685_Judgement_07-Nov-2022.pdf',
    },
  ],
};

export const deskSnapshot = {
  date: '26 Sep 2026',
  publishedFocusedRecords: 0,
  externalLeads: 13,
  jurisdictions: 6,
};

export const policyTimeline = [
  {
    date: '14 Jan 2019',
    title: 'The 103rd Amendment takes effect',
    context:
      'The amendment adds provisions for special measures for economically weaker sections in education and public employment.',
    source: 'Constitution (One Hundred and Third Amendment) Act, 2019',
    href: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    date: '7 Nov 2022',
    title: 'Supreme Court issues the Janhit Abhiyan judgment',
    context:
      'The Court upholds the amendment in Janhit Abhiyan v. Union of India.',
    source: 'Supreme Court of India · judgment',
    href: 'https://main.sci.gov.in/supremecourt/2022/20936/20936_2022_1_1501_39685_Judgement_07-Nov-2022.pdf',
  },
];