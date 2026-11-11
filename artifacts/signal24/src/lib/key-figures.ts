/**
 * The Signal 24 key figures: the handful of numbers the reservation debate actually
 * turns on. Each carries its unit, definition, year, geography and a public source,
 * because a number without its frame is just a slogan. Re-check whenever
 * KEY_FIGURES_CHECKED_ON changes.
 */
export type Bilingual = { en: string; hi: string };

export type KeyFigure = {
  id: string;
  /** Display value, kept as text so formatting (₹, lakh, ratios) stays exact. */
  value: string;
  /** Numeric part animated on reveal; omitted for values that should not count up. */
  numeric?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: Bilingual;
  definition: Bilingual;
  year: string;
  geography: Bilingual;
  status: Bilingual;
  source: { name: string; url: string };
  /** Visual family: legal rule, court outcome, published data, or withheld/frozen. */
  tone: 'law' | 'court' | 'data' | 'withheld';
};

export const KEY_FIGURES_CHECKED_ON = '2026-11-10';

const INDRA = { name: 'Supreme Court of India: Indra Sawhney v. Union of India, judgment of 16 November 1992 (full text)', url: 'https://indiankanoon.org/doc/1363234/' };

export const KEY_FIGURES: KeyFigure[] = [
  {
    id: 'ceiling',
    value: '50%',
    numeric: 50,
    suffix: '%',
    label: { en: 'The ceiling', hi: 'सीमा' },
    definition: {
      en: 'Maximum share of seats or posts that may normally be reserved, save in extraordinary situations the state must prove.',
      hi: 'सीटों या पदों का अधिकतम हिस्सा जो सामान्य तौर पर आरक्षित हो सकता है, उन असाधारण हालात को छोड़कर जिन्हें सरकार को साबित करना होगा।',
    },
    year: '1992',
    geography: { en: 'All India', hi: 'पूरा भारत' },
    status: { en: 'Binding precedent', hi: 'बाध्यकारी नज़ीर' },
    source: INDRA,
    tone: 'court',
  },
  {
    id: 'obc-27',
    value: '27%',
    numeric: 27,
    suffix: '%',
    label: { en: 'OBC quota, central posts', hi: 'केंद्रीय पदों में ओबीसी कोटा' },
    definition: {
      en: 'Share of central civil posts reserved for socially and educationally backward classes since the August 1990 office memorandum.',
      hi: 'अगस्त 1990 के कार्यालय ज्ञापन के बाद से सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों के लिए आरक्षित केंद्रीय सिविल पदों का हिस्सा।',
    },
    year: '1990',
    geography: { en: 'Central government', hi: 'केंद्र सरकार' },
    status: { en: 'In force', hi: 'लागू' },
    source: INDRA,
    tone: 'law',
  },
  {
    id: 'ews-10',
    value: '10%',
    numeric: 10,
    suffix: '%',
    label: { en: 'EWS quota', hi: 'ईडब्ल्यूएस कोटा' },
    definition: {
      en: 'Maximum reservation for economically weaker sections outside SC, ST and OBC, added by the 103rd Amendment and upheld 3:2 in November 2022.',
      hi: 'एससी, एसटी और ओबीसी से बाहर के आर्थिक रूप से कमज़ोर वर्गों के लिए अधिकतम आरक्षण, 103वें संशोधन से जोड़ा गया और नवंबर 2022 में 3:2 से बरक़रार।',
    },
    year: '2019',
    geography: { en: 'All India', hi: 'पूरा भारत' },
    status: { en: 'In force', hi: 'लागू' },
    source: { name: 'Supreme Court of India: Janhit Abhiyan v. Union of India, record of 7 November 2022', url: 'https://api.sci.gov.in/supremecourt/2019/1827/1827_2019_1_1501_39619_Order_07-Nov-2022.pdf' },
    tone: 'law',
  },
  {
    id: 'eight-lakh',
    value: '₹8 lakh',
    numeric: 8,
    prefix: '₹',
    suffix: ' lakh',
    label: { en: 'One income line, two tests', hi: 'एक आय रेखा, दो कसौटियाँ' },
    definition: {
      en: 'Annual family income limit for the OBC creamy layer (since 2017) and for EWS eligibility (since 2019). Unrevised since; a parliamentary panel called revision the need of the hour in 2025.',
      hi: 'ओबीसी क्रीमी लेयर (2017 से) और ईडब्ल्यूएस पात्रता (2019 से) की सालाना पारिवारिक आय सीमा। तब से नहीं बदली; 2025 में एक संसदीय समिति ने संशोधन को समय की ज़रूरत बताया।',
    },
    year: '2017',
    geography: { en: 'Central government', hi: 'केंद्र सरकार' },
    status: { en: 'Frozen since 2017', hi: '2017 से जमी हुई' },
    source: { name: 'DoPT Office Memorandum No. 36033/1/2013-Estt.(Res), 13 September 2017 (NCBC copy)', url: 'https://www.ncbc.nic.in/Writereaddata/OM8Lakha.pdf' },
    tone: 'withheld',
  },
  {
    id: 'rohini-extensions',
    value: '14',
    numeric: 14,
    label: { en: 'Extensions for one commission', hi: 'एक आयोग, इतनी मोहलतें' },
    definition: {
      en: 'Times the Rohini Commission on OBC sub-categorisation was extended before submitting its report on 31 July 2023. The report has not been published.',
      hi: 'ओबीसी उप-वर्गीकरण पर रोहिणी आयोग को 31 जुलाई 2023 को रिपोर्ट सौंपने से पहले इतनी बार मोहलत मिली। रिपोर्ट प्रकाशित नहीं हुई।',
    },
    year: '2017–23',
    geography: { en: 'Central government', hi: 'केंद्र सरकार' },
    status: { en: 'Unpublished', hi: 'अप्रकाशित' },
    source: { name: 'ThePrint', url: 'https://theprint.in/india/governance/rohini-commission-report-on-obc-sub-categorisation-in-cold-storage-as-sc-gives-nod-to-sc-st-sub-quota/2202938' },
    tone: 'withheld',
  },
  {
    id: 'secc-error-free',
    value: '98.87%',
    numeric: 98.87,
    decimals: 2,
    suffix: '%',
    label: { en: '“Error-free”, then “unusable”', hi: 'पहले “त्रुटिहीन”, फिर “बेकार”' },
    definition: {
      en: 'Share of individual caste and religion data from SECC 2011 the government told a parliamentary committee was error-free in 2016, before telling the Supreme Court in 2021 the caste data was unusable.',
      hi: 'SECC 2011 के व्यक्तिगत जाति और धर्म आंकड़ों का वह हिस्सा जिसे सरकार ने 2016 में संसदीय समिति के सामने त्रुटिहीन बताया, और 2021 में सुप्रीम कोर्ट से कहा कि जाति आंकड़े बेकार हैं।',
    },
    year: '2016',
    geography: { en: 'All India', hi: 'पूरा भारत' },
    status: { en: 'Withheld', hi: 'रोका गया' },
    source: { name: 'The Leaflet', url: 'https://theleaflet.in/centre-tells-sc-that-it-did-not-make-results-of-2011-caste-census-public-because-it-is-flawed/' },
    tone: 'withheld',
  },
  {
    id: 'bihar-ebc',
    value: '36.01%',
    numeric: 36.01,
    decimals: 2,
    suffix: '%',
    label: { en: 'Bihar’s largest group', hi: 'बिहार का सबसे बड़ा समूह' },
    definition: {
      en: 'Extremely Backward Classes as a share of Bihar’s population in the state caste survey released on 2 October 2023. The only recent caste count any government has published.',
      hi: '2 अक्टूबर 2023 को जारी बिहार जाति सर्वेक्षण में राज्य की आबादी में अत्यंत पिछड़े वर्गों का हिस्सा। किसी सरकार द्वारा प्रकाशित इकलौती हालिया जाति गणना।',
    },
    year: '2023',
    geography: { en: 'Bihar', hi: 'बिहार' },
    status: { en: 'Published', hi: 'प्रकाशित' },
    source: { name: 'Supreme Court Observer', url: 'https://www.scobserver.in/journal/what-is-the-bihar-governments-65-percent-reservation-quota-challenge-in-the-supreme-court/' },
    tone: 'data',
  },
  {
    id: 'bihar-65',
    value: '65%',
    numeric: 65,
    suffix: '%',
    label: { en: 'Bihar’s quota, struck down', hi: 'बिहार का कोटा, रद्द' },
    definition: {
      en: 'Reservation for SC, ST, EBC and BC under Bihar’s 2023 amendments, struck down by the Patna High Court on 20 June 2024. Appeal pending.',
      hi: 'बिहार के 2023 संशोधनों के तहत एससी, एसटी, ईबीसी और बीसी का आरक्षण, जिसे पटना हाई कोर्ट ने 20 जून 2024 को रद्द किया। अपील लंबित।',
    },
    year: '2023',
    geography: { en: 'Bihar', hi: 'बिहार' },
    status: { en: 'Struck down', hi: 'रद्द' },
    source: { name: 'Patna High Court: Gaurav Kumar v. State of Bihar, judgment of 20 June 2024 (full text)', url: 'https://indiankanoon.org/doc/19048737/' },
    tone: 'court',
  },
  {
    id: 'sub-classification',
    value: '6:1',
    label: { en: 'Sub-classification allowed', hi: 'उप-वर्गीकरण को हरी झंडी' },
    definition: {
      en: 'Vote of the seven-judge bench in State of Punjab v. Davinder Singh (1 August 2024) allowing states to sub-classify SCs and STs on the basis of data.',
      hi: 'पंजाब राज्य बनाम दविंदर सिंह (1 अगस्त 2024) में सात जजों की पीठ का फ़ैसला, जिसने राज्यों को आंकड़ों के आधार पर एससी और एसटी के उप-वर्गीकरण की इजाज़त दी।',
    },
    year: '2024',
    geography: { en: 'All India', hi: 'पूरा भारत' },
    status: { en: 'Binding precedent', hi: 'बाध्यकारी नज़ीर' },
    source: { name: 'Supreme Court of India: State of Punjab v. Davinder Singh, judgment of 1 August 2024', url: 'https://api.sci.gov.in/supremecourt/2010/25536/25536_2010_1_1501_54462_Judgement_01-Aug-2024.pdf' },
    tone: 'court',
  },
  {
    id: 'since-1931',
    value: '1931',
    label: { en: 'Last full caste count', hi: 'आख़िरी पूरी जाति गणना' },
    definition: {
      en: 'The last census to publish a full caste count. Census 2027 is to record caste in its February 2027 population enumeration; the classification method and release date are unpublished.',
      hi: 'पूरी जाति गणना प्रकाशित करने वाली आख़िरी जनगणना। जनगणना 2027 फ़रवरी 2027 की जनसंख्या गणना में जाति दर्ज करेगी; वर्गीकरण का तरीक़ा और जारी करने की तारीख़ अप्रकाशित।',
    },
    year: '1931',
    geography: { en: 'All India', hi: 'पूरा भारत' },
    status: { en: 'Count due 2027', hi: 'गणना 2027 में' },
    source: { name: 'Press Information Bureau: Census 2027, India’s first digital enumeration exercise', url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2255461' },
    tone: 'data',
  },
];

/** Running clocks for the front-page stage. Each counts whole days from a sourced date. */
export type RunningClock = {
  id: string;
  since: string;
  label: Bilingual;
  unit: Bilingual;
  href: string;
};

export const RUNNING_CLOCKS: RunningClock[] = [
  {
    id: 'rohini',
    since: '2023-07-31',
    label: { en: 'Rohini Commission report, submitted and unpublished', hi: 'रोहिणी आयोग रिपोर्ट, सौंपी गई पर अप्रकाशित' },
    unit: { en: 'days in a drawer', hi: 'दिन से दराज़ में' },
    href: '/#accountability',
  },
  {
    id: 'ugc-stay',
    since: '2026-01-29',
    label: { en: 'UGC equity rules, stayed and “under reconsideration”', hi: 'यूजीसी समता नियम, रोक के बाद “पुनर्विचार के अधीन”' },
    unit: { en: 'days and counting', hi: 'दिन, और गिनती जारी' },
    href: '/policies/ugc-equity-regulations-2026',
  },
  {
    id: 'creamy-layer',
    since: '2017-09-01',
    label: { en: 'OBC creamy-layer ceiling, unrevised at ₹8 lakh', hi: 'ओबीसी क्रीमी लेयर सीमा, ₹8 लाख पर अपरिवर्तित' },
    unit: { en: 'days frozen', hi: 'दिन से जमी हुई' },
    href: '/policies/obc-creamy-layer-8-lakh-2017',
  },
];

export function daysSince(date: string, now = new Date()) {
  const start = new Date(`${date}T00:00:00+05:30`).getTime();
  return Math.max(0, Math.floor((now.getTime() - start) / 86_400_000));
}
