/**
 * Every state and Union Territory, with bilingual profiles grounded in linked sources.
 * Items whose status could not be confirmed are labeled as pending or evidence gaps.
 */
import type { Bilingual } from './key-figures';
import { ADDITIONAL_STATE_PROFILES, RECENT_STATE_FACTS } from './state-research-profiles';

export type Region = { name: string; hi: string; kind: 'state' | 'ut' };
export type StateFact = {
  when: string;
  text: Bilingual;
  source?: { label: string; url: string };
  review?: { checkedOn: string; nextCheck: Bilingual };
};

export const REGIONS: Region[] = [
  { name: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', kind: 'state' },
  { name: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश', kind: 'state' },
  { name: 'Assam', hi: 'असम', kind: 'state' },
  { name: 'Bihar', hi: 'बिहार', kind: 'state' },
  { name: 'Chhattisgarh', hi: 'छत्तीसगढ़', kind: 'state' },
  { name: 'Goa', hi: 'गोवा', kind: 'state' },
  { name: 'Gujarat', hi: 'गुजरात', kind: 'state' },
  { name: 'Haryana', hi: 'हरियाणा', kind: 'state' },
  { name: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश', kind: 'state' },
  { name: 'Jharkhand', hi: 'झारखंड', kind: 'state' },
  { name: 'Karnataka', hi: 'कर्नाटक', kind: 'state' },
  { name: 'Kerala', hi: 'केरल', kind: 'state' },
  { name: 'Madhya Pradesh', hi: 'मध्य प्रदेश', kind: 'state' },
  { name: 'Maharashtra', hi: 'महाराष्ट्र', kind: 'state' },
  { name: 'Manipur', hi: 'मणिपुर', kind: 'state' },
  { name: 'Meghalaya', hi: 'मेघालय', kind: 'state' },
  { name: 'Mizoram', hi: 'मिज़ोरम', kind: 'state' },
  { name: 'Nagaland', hi: 'नगालैंड', kind: 'state' },
  { name: 'Odisha', hi: 'ओडिशा', kind: 'state' },
  { name: 'Punjab', hi: 'पंजाब', kind: 'state' },
  { name: 'Rajasthan', hi: 'राजस्थान', kind: 'state' },
  { name: 'Sikkim', hi: 'सिक्किम', kind: 'state' },
  { name: 'Tamil Nadu', hi: 'तमिलनाडु', kind: 'state' },
  { name: 'Telangana', hi: 'तेलंगाना', kind: 'state' },
  { name: 'Tripura', hi: 'त्रिपुरा', kind: 'state' },
  { name: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', kind: 'state' },
  { name: 'Uttarakhand', hi: 'उत्तराखंड', kind: 'state' },
  { name: 'West Bengal', hi: 'पश्चिम बंगाल', kind: 'state' },
  { name: 'Andaman and Nicobar Islands', hi: 'अंडमान और निकोबार द्वीपसमूह', kind: 'ut' },
  { name: 'Chandigarh', hi: 'चंडीगढ़', kind: 'ut' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', hi: 'दादरा और नगर हवेली और दमन और दीव', kind: 'ut' },
  { name: 'Delhi', hi: 'दिल्ली', kind: 'ut' },
  { name: 'Jammu and Kashmir', hi: 'जम्मू और कश्मीर', kind: 'ut' },
  { name: 'Ladakh', hi: 'लद्दाख', kind: 'ut' },
  { name: 'Lakshadweep', hi: 'लक्षद्वीप', kind: 'ut' },
  { name: 'Puducherry', hi: 'पुडुचेरी', kind: 'ut' },
];

export type StateProfile = {
  status: Bilingual;
  tone: 'struck' | 'challenged' | 'protected' | 'history';
  summary: Bilingual;
  facts: StateFact[];
  questions: Bilingual[];
  ledger: string[];
};

/** Existing profiles tied to the site's published archive and policy ledger. */
const BASE_STATE_PROFILES: Record<string, StateProfile> = {
  Bihar: {
    status: { en: '65% law struck down · appeal pending', hi: '65% क़ानून रद्द · अपील लंबित' },
    tone: 'struck',
    summary: {
      en: 'The only state to publish a recent caste count, and the latest to lose in court for skipping the representation evidence.',
      hi: 'हाल की जाति गणना प्रकाशित करने वाला इकलौता राज्य, और प्रतिनिधित्व के सबूत को छोड़ने के कारण अदालत में हारने वाला ताज़ा राज्य।',
    },
    facts: [
      { when: '2023-10-02', text: { en: 'Caste survey published: EBC 36.01%, BC 27.12%, SC 19.65%, ST 1.68%, unreserved 15.52%.', hi: 'जाति सर्वेक्षण प्रकाशित: ईबीसी 36.01%, बीसी 27.12%, एससी 19.65%, एसटी 1.68%, अनारक्षित 15.52%।' } },
      { when: '2023-11-21', text: { en: 'Reservation for SC, ST, EBC and BC raised from 50% to 65% (75% with EWS).', hi: 'एससी, एसटी, ईबीसी और बीसी का आरक्षण 50% से 65% (ईडब्ल्यूएस के साथ 75%)।' } },
      { when: '2024-06-20', text: { en: 'Patna High Court strikes both amendments down under Articles 14, 15 and 16.', hi: 'पटना हाई कोर्ट ने अनुच्छेद 14, 15 और 16 के तहत दोनों संशोधन रद्द किए।' } },
      { when: '2024-07-29', text: { en: 'Supreme Court refuses a stay and grants leave to appeal; the appeal is pending.', hi: 'सुप्रीम कोर्ट ने रोक से इनकार किया और अपील की अनुमति दी; अपील लंबित।' } },
    ],
    questions: [
      { en: 'Why has Bihar not published caste-wise representation in its own services?', hi: 'बिहार ने अपनी सेवाओं में जाति-वार प्रतिनिधित्व प्रकाशित क्यों नहीं किया?' },
      { en: 'Will the state file that evidence when the Supreme Court hears its appeal?', hi: 'क्या सुप्रीम कोर्ट में अपील की सुनवाई पर राज्य वह सबूत पेश करेगा?' },
    ],
    ledger: ['bihar-reservation-amendments-2023'],
  },
  Maharashtra: {
    status: { en: '10% Maratha quota under challenge', hi: '10% मराठा आरक्षण चुनौती में' },
    tone: 'challenged',
    summary: {
      en: 'Two earlier laws were struck down; the 2024 10% law is now back before the Bombay High Court, while representation data remains unpublished.',
      hi: 'पहले के दो क़ानून रद्द हुए; 2024 का 10% क़ानून अब बॉम्बे हाई कोर्ट में फिर सुनवाई के लिए है, जबकि प्रतिनिधित्व के आंकड़े अप्रकाशित हैं।',
    },
    facts: [
      { when: '1902-07-26', text: { en: 'In princely Kolhapur, now in Maharashtra, an order reserves half of state posts for backward classes.', hi: 'रियासत कोल्हापुर में, जो अब महाराष्ट्र में है, एक आदेश राज्य के आधे पद पिछड़े वर्गों के लिए आरक्षित करता है।' } },
      { when: '2021-05-05', text: { en: 'Supreme Court strikes down the 2018 SEBC Act for breaching the 50% ceiling.', hi: 'सुप्रीम कोर्ट ने 50% सीमा तोड़ने के कारण 2018 का एसईबीसी अधिनियम रद्द किया।' } },
      { when: '2024-02-20', text: { en: 'SEBC Act, 2024 grants Marathas 10% on the Shukre Commission’s report.', hi: 'शुक्रे आयोग की रिपोर्ट पर एसईबीसी अधिनियम, 2024 मराठों को 10% देता है।' } },
    ],
    questions: [
      { en: 'What did the Shukre Commission find that the Gaikwad Commission did not, and where is its data?', hi: 'शुक्रे आयोग ने ऐसा क्या पाया जो गायकवाड़ आयोग ने नहीं, और उसका डेटा कहाँ है?' },
      { en: 'What happens to candidates admitted under the 2024 Act if it falls?', hi: 'अगर 2024 का अधिनियम गिरा, तो उसके तहत दाख़िल उम्मीदवारों का क्या होगा?' },
    ],
    ledger: ['maharashtra-sebc-act-2024'],
  },
  'Tamil Nadu': {
    status: { en: '69% protected by the Ninth Schedule', hi: '69% नौवीं अनुसूची से सुरक्षित' },
    tone: 'protected',
    summary: {
      en: 'Where India’s first reservation case began, and where the one quota above 50% that has lasted is shielded by Parliament, not proof.',
      hi: 'जहाँ भारत का पहला आरक्षण मुक़दमा शुरू हुआ, और जहाँ 50% से ऊपर का इकलौता टिका हुआ कोटा सबूत से नहीं, संसद से सुरक्षित है।',
    },
    facts: [
      { when: '1921-09-16', text: { en: 'Madras Presidency issues its first communal order on representation in public services.', hi: 'मद्रास प्रेसीडेंसी सरकारी सेवाओं में प्रतिनिधित्व पर अपना पहला सांप्रदायिक आदेश जारी करती है।' } },
      { when: '1951-04-09', text: { en: 'Supreme Court strikes down the Madras communal admissions order (Champakam Dorairajan).', hi: 'सुप्रीम कोर्ट मद्रास का सांप्रदायिक दाख़िला आदेश रद्द करता है (चंपकम दोरैराजन)।' } },
      { when: '1951-06-18', text: { en: 'The First Amendment inserts Article 15(4) in response.', hi: 'जवाब में पहला संशोधन अनुच्छेद 15(4) जोड़ता है।' } },
      { when: '1994-08-31', text: { en: 'The 76th Amendment places the state’s 69% reservation law in the Ninth Schedule.', hi: '76वाँ संशोधन राज्य के 69% आरक्षण क़ानून को नौवीं अनुसूची में रखता है।' } },
    ],
    questions: [
      { en: 'Why has the challenge to the 69% law stayed undecided for so long?', hi: '69% क़ानून की चुनौती इतने समय से अनिर्णीत क्यों है?' },
    ],
    ledger: ['first-amendment-article-15-4-1951'],
  },
  Punjab: {
    status: { en: 'Where SC sub-classification began', hi: 'जहाँ एससी उप-वर्गीकरण शुरू हुआ' },
    tone: 'history',
    summary: {
      en: 'A 2006 Punjab law set aside half the SC quota for the least-represented groups. Struck down in 2010, it led to the 2024 ruling that let every state do the same, with data.',
      hi: 'पंजाब के 2006 के क़ानून ने एससी कोटे का आधा हिस्सा सबसे कम प्रतिनिधित्व वाले समूहों के लिए रखा। 2010 में रद्द होकर, यह 2024 के उस फ़ैसले तक पहुँचा जिसने हर राज्य को, आंकड़ों के साथ, ऐसा करने दिया।',
    },
    facts: [
      { when: '2024-08-01', text: { en: 'Seven-judge bench holds 6:1 in State of Punjab v. Davinder Singh that states may sub-classify SCs and STs.', hi: 'पंजाब राज्य बनाम दविंदर सिंह में सात जजों की पीठ 6:1 से कहती है कि राज्य एससी और एसटी का उप-वर्गीकरण कर सकते हैं।' } },
    ],
    questions: [
      { en: 'Has Punjab published the representation data the 2024 judgment requires?', hi: 'क्या पंजाब ने 2024 के फ़ैसले के मुताबिक़ ज़रूरी प्रतिनिधित्व आंकड़े प्रकाशित किए?' },
    ],
    ledger: ['sc-st-sub-classification-2024'],
  },
  'Andhra Pradesh': {
    status: { en: 'SC sub-classification win; local BC quota struck down', hi: 'SC उप-वर्गीकरण की जीत; स्थानीय BC कोटा रद्द' },
    tone: 'challenged',
    summary: {
      en: 'The 2024 ruling reopened SC sub-classification, while the separate 34% BC local-body quota was struck down in 2026 and not restored on appeal.',
      hi: '2024 के फ़ैसले ने SC उप-वर्गीकरण का रास्ता खोला; अलग 34% BC स्थानीय निकाय कोटा 2026 में रद्द हुआ और अपील पर बहाल नहीं हुआ।',
    },
    facts: [
      { when: '2024-08-01', text: { en: 'Davinder Singh overrules E.V. Chinnaiah, which had held the SC list to be one indivisible class.', hi: 'दविंदर सिंह ने ई.वी. चिन्नैया को पलटा, जिसने एससी सूची को एक अविभाज्य वर्ग माना था।' } },
    ],
    questions: [
      { en: 'Will the state now publish community-wise representation within its SC list?', hi: 'क्या राज्य अब अपनी एससी सूची के भीतर समुदाय-वार प्रतिनिधित्व प्रकाशित करेगा?' },
    ],
    ledger: ['sc-st-sub-classification-2024'],
  },
};

const combinedProfiles: Record<string, StateProfile> = {
  ...BASE_STATE_PROFILES,
  ...ADDITIONAL_STATE_PROFILES,
};

export const STATE_PROFILES: Record<string, StateProfile> = Object.fromEntries(
  Object.entries(combinedProfiles).map(([name, profile]) => [
    name,
    {
      ...profile,
      facts: [...profile.facts, ...(RECENT_STATE_FACTS[name] ? [RECENT_STATE_FACTS[name]] : [])],
    },
  ]),
);

export function regionSlug(name: string) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function regionBySlug(slug: string | undefined) {
  return REGIONS.find((region) => regionSlug(region.name) === slug);
}
