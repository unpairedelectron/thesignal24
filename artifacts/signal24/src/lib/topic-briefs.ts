/**
 * Editorial briefs for each topic desk. Every dated line restates a fact already
 * sourced in a published record, ledger entry or evidence event; nothing here is
 * new reporting. Update TOPIC_BRIEFS_CHECKED_ON when the state of play is re-checked.
 */
import type { Bilingual } from './key-figures';

export type TopicKey = 'Latest' | 'Courts & Policy' | 'States' | 'History' | 'Ground Reports' | 'Data & Notes' | 'open-category-competition';

export type TopicBrief = {
  desk: Bilingual;
  headline: Bilingual;
  accent: Bilingual;
  standfirst: Bilingual;
  stateOfPlay: Array<{ when: string; text: Bilingual; status?: 'pending' | 'decided' | 'withheld' }>;
  questions: Bilingual[];
  figures: string[];
  policies: string[];
  illustration: string;
};

export const TOPIC_BRIEFS_CHECKED_ON = '2026-11-10';

export const TOPIC_BRIEFS: Record<TopicKey, TopicBrief> = {
  Latest: {
    desk: { en: 'The latest desk', hi: 'ताज़ा डेस्क' },
    headline: { en: 'What moved this week,', hi: 'इस हफ़्ते क्या हिला,' },
    accent: { en: 'and what was hoped you’d miss.', hi: 'और क्या उम्मीद थी कि आप चूक जाएँगे।' },
    standfirst: {
      en: 'Notifications that appear on a Friday evening, affidavits that quietly reverse last year’s affidavit, committees announced instead of decisions. This desk files them the day they happen, with the document attached.',
      hi: 'शुक्रवार शाम को निकलने वाली अधिसूचनाएँ, पिछले साल के हलफ़नामे को चुपचाप पलटने वाले हलफ़नामे, फ़ैसलों की जगह घोषित होने वाली समितियाँ। यह डेस्क उन्हें उसी दिन दर्ज करता है, दस्तावेज़ के साथ।',
    },
    stateOfPlay: [
      { when: '2026-11-05', status: 'pending', text: { en: 'The Centre tells the Supreme Court it may form a committee to re-examine the stayed UGC equity rules. No revised draft yet.', hi: 'केंद्र ने सुप्रीम कोर्ट से कहा कि वह रोके गए यूजीसी समता नियमों की दोबारा जाँच के लिए समिति बना सकता है। संशोधित मसौदा अब तक नहीं।' } },
      { when: '2026-04-01', status: 'pending', text: { en: 'Census 2027 houselisting begins. Caste is recorded in the February 2027 enumeration; the classification method is unpublished.', hi: 'जनगणना 2027 का मकान सूचीकरण शुरू। जाति फ़रवरी 2027 की गणना में दर्ज होगी; वर्गीकरण का तरीक़ा अप्रकाशित।' } },
      { when: '2023-07-31', status: 'withheld', text: { en: 'The Rohini Commission submits its report on OBC sub-categorisation. It remains unpublished.', hi: 'रोहिणी आयोग ने ओबीसी उप-वर्गीकरण पर रिपोर्ट सौंपी। वह अब भी अप्रकाशित है।' } },
    ],
    questions: [
      { en: 'When will a revised Regulation 3(1)(c) be published for comment?', hi: 'संशोधित विनियम 3(1)(c) टिप्पणी के लिए कब प्रकाशित होगा?' },
      { en: 'Will the Rohini Commission report be tabled in Parliament?', hi: 'क्या रोहिणी आयोग की रिपोर्ट संसद में रखी जाएगी?' },
      { en: 'Will Census 2027 caste tables come with a release date and a published method?', hi: 'क्या जनगणना 2027 की जाति तालिकाएँ जारी करने की तारीख़ और प्रकाशित तरीक़े के साथ आएँगी?' },
    ],
    figures: ['rohini-extensions', 'eight-lakh', 'since-1931'],
    policies: ['ugc-equity-regulations-2026', 'census-2027-caste-enumeration'],
    illustration: 'magnifier-hero',
  },
  'Courts & Policy': {
    desk: { en: 'The courts and policy desk', hi: 'अदालत और नीति डेस्क' },
    headline: { en: 'The law gets made twice:', hi: 'क़ानून दो बार बनता है:' },
    accent: { en: 'once by government, once by the court cleaning up.', hi: 'एक बार सरकार बनाती है, फिर अदालत सफ़ाई करती है।' },
    standfirst: {
      en: 'Judgments, amendments and office memoranda, read in full rather than in press-release summary. We separate what a court held from what a judge observed, and an interim order from a final one.',
      hi: 'फ़ैसले, संशोधन और कार्यालय ज्ञापन, प्रेस विज्ञप्ति के सार में नहीं, पूरे पढ़े गए। हम अलग करते हैं कि अदालत ने क्या तय किया और किसी जज ने क्या टिप्पणी की, और अंतरिम आदेश को अंतिम फ़ैसले से।',
    },
    stateOfPlay: [
      { when: '2026-01-29', status: 'pending', text: { en: 'UGC equity regulations stayed as prima facie vague; the 2012 rules continue under Article 142.', hi: 'यूजीसी समता विनियमों पर प्रथम दृष्टया अस्पष्ट मानकर रोक; अनुच्छेद 142 के तहत 2012 के नियम जारी।' } },
      { when: '2024-08-01', status: 'decided', text: { en: 'Seven judges allow sub-classification of SCs and STs, 6:1, on the basis of data.', hi: 'सात जजों ने 6:1 से आंकड़ों के आधार पर एससी और एसटी के उप-वर्गीकरण की इजाज़त दी।' } },
      { when: '2022-11-07', status: 'decided', text: { en: 'The 10% EWS quota is upheld 3:2 in Janhit Abhiyan.', hi: 'जनहित अभियान मामले में 10% ईडब्ल्यूएस कोटा 3:2 से बरक़रार।' } },
      { when: '1992-11-16', status: 'decided', text: { en: 'Indra Sawhney sets the 50% ceiling and the creamy-layer exclusion.', hi: 'इंद्रा साहनी ने 50% की सीमा और क्रीमी लेयर का बहिष्कार तय किया।' } },
    ],
    questions: [
      { en: 'Does the four-judge creamy-layer observation in Davinder Singh bind governments?', hi: 'क्या दविंदर सिंह मामले में चार जजों की क्रीमी लेयर वाली टिप्पणी सरकारों पर बाध्यकारी है?' },
      { en: 'Which states have collected the cadre-wise data that promotion quotas require?', hi: 'किन राज्यों ने पदोन्नति कोटे के लिए ज़रूरी कैडर-वार आंकड़े जुटाए हैं?' },
    ],
    figures: ['ceiling', 'ews-10', 'sub-classification'],
    policies: ['ugc-equity-regulations-2026', 'sc-st-sub-classification-2024', 'reservation-in-promotion-77th-amendment', '103rd-constitutional-amendment-ews-reservation'],
    illustration: 'court-stamp',
  },
  States: {
    desk: { en: 'The states desk', hi: 'राज्य डेस्क' },
    headline: { en: 'One Constitution, many quota laws,', hi: 'एक संविधान, आरक्षण के कई क़ानून,' },
    accent: { en: 'and one ceiling they all knew about.', hi: 'और एक सीमा जिसके बारे में सबको पता था।' },
    standfirst: {
      en: 'States legislate reservation in election season and defend it in court in the off-season. We track each law from bill to judgment, and ask the question courts ask first: where is the representation data?',
      hi: 'राज्य चुनावी मौसम में आरक्षण का क़ानून बनाते हैं और उसके बाद अदालत में उसका बचाव करते हैं। हम हर क़ानून को विधेयक से फ़ैसले तक देखते हैं, और वही सवाल पूछते हैं जो अदालत सबसे पहले पूछती है: प्रतिनिधित्व के आंकड़े कहाँ हैं?',
    },
    stateOfPlay: [
      { when: '2024-06-20', status: 'pending', text: { en: 'Patna High Court strikes down Bihar’s 65% law. The Supreme Court refused a stay; appeal pending.', hi: 'पटना हाई कोर्ट ने बिहार का 65% क़ानून रद्द किया। सुप्रीम कोर्ट ने रोक से इनकार किया; अपील लंबित।' } },
      { when: '2024-02-20', status: 'pending', text: { en: 'Maharashtra passes its third Maratha quota law (10%). Challenge before a Bombay High Court full bench.', hi: 'महाराष्ट्र ने तीसरा मराठा आरक्षण क़ानून (10%) पास किया। बॉम्बे हाई कोर्ट की पूर्ण पीठ के सामने चुनौती।' } },
      { when: '2021-05-05', status: 'decided', text: { en: 'The Supreme Court strikes down Maharashtra’s 2018 Maratha quota for breaching the ceiling.', hi: 'सुप्रीम कोर्ट ने सीमा तोड़ने के कारण महाराष्ट्र का 2018 का मराठा कोटा रद्द किया।' } },
    ],
    questions: [
      { en: 'Will Bihar publish representation data, not just population data, in its appeal?', hi: 'क्या बिहार अपनी अपील में सिर्फ़ आबादी नहीं, प्रतिनिधित्व के आंकड़े भी पेश करेगा?' },
      { en: 'Does the Shukre Commission report show the extraordinary situation the 2021 judgment required?', hi: 'क्या शुक्रे आयोग की रिपोर्ट वह असाधारण हालात दिखाती है जो 2021 के फ़ैसले ने माँगे थे?' },
    ],
    figures: ['bihar-65', 'bihar-ebc', 'ceiling'],
    policies: ['bihar-reservation-amendments-2023', 'maharashtra-sebc-act-2024'],
    illustration: 'ceiling-gauge',
  },
  History: {
    desk: { en: 'The history desk', hi: 'इतिहास डेस्क' },
    headline: { en: 'Before the slogans,', hi: 'नारों से पहले,' },
    accent: { en: 'there were orders, pacts and amendments.', hi: 'आदेश, समझौते और संशोधन थे।' },
    standfirst: {
      en: 'Reservation did not begin in 1950 and it did not begin as one idea. The archive keeps the documents in order, so nobody gets to rewrite the sequence to suit this week’s argument.',
      hi: 'आरक्षण 1950 में शुरू नहीं हुआ, और एक विचार के रूप में शुरू नहीं हुआ। अभिलेखागार दस्तावेज़ों को क्रम में रखता है, ताकि कोई इस हफ़्ते की बहस के हिसाब से क्रम दोबारा न लिख सके।',
    },
    stateOfPlay: [
      { when: '1990-08-13', status: 'decided', text: { en: 'A decade after the Mandal report, 27% of central posts are reserved for backward classes.', hi: 'मंडल रिपोर्ट के दस साल बाद केंद्र के 27% पद पिछड़े वर्गों के लिए आरक्षित।' } },
      { when: '1951-06-18', status: 'decided', text: { en: 'The First Amendment inserts Article 15(4), ten weeks after the Champakam judgment.', hi: 'चंपकम फ़ैसले के दस हफ़्ते बाद पहले संशोधन ने अनुच्छेद 15(4) जोड़ा।' } },
      { when: '1951-04-09', status: 'decided', text: { en: 'The Supreme Court strikes down Madras’s communal admissions order.', hi: 'सुप्रीम कोर्ट ने मद्रास का सांप्रदायिक दाख़िला आदेश रद्द किया।' } },
    ],
    questions: [
      { en: 'Why did the Mandal report wait a decade, and the Rohini report wait still?', hi: 'मंडल रिपोर्ट दस साल क्यों रुकी, और रोहिणी रिपोर्ट अब भी क्यों रुकी है?' },
    ],
    figures: ['obc-27', 'since-1931'],
    policies: ['first-amendment-article-15-4-1951', 'mandal-office-memorandum-1990'],
    illustration: 'archive-history',
  },
  'Ground Reports': {
    desk: { en: 'The ground desk', hi: 'ज़मीनी डेस्क' },
    headline: { en: 'Where policy meets', hi: 'जहाँ नीति मिलती है' },
    accent: { en: 'a tehsil counter.', hi: 'तहसील की खिड़की से।' },
    standfirst: {
      en: 'We publish field reports only with consent and documents. Until a report meets that bar, this desk works from the paperwork applicants actually face, and says plainly which is which.',
      hi: 'हम ज़मीनी रिपोर्टें केवल सहमति और दस्तावेज़ों के साथ छापते हैं। जब तक कोई रिपोर्ट इस कसौटी पर खरी न उतरे, यह डेस्क उन काग़ज़ों से काम करता है जिनसे उम्मीदवार असल में जूझते हैं, और साफ़ बताता है कि कौन-सा क्या है।',
    },
    stateOfPlay: [
      { when: '2019-01-31', status: 'decided', text: { en: 'DoPT fixes the EWS tests: income below ₹8 lakh, plus land and housing exclusions.', hi: 'डीओपीटी ने ईडब्ल्यूएस की कसौटियाँ तय कीं: ₹8 लाख से कम आय, साथ में ज़मीन और मकान से जुड़े बहिष्कार।' } },
      { when: '2017-09-01', status: 'withheld', text: { en: 'The OBC creamy-layer ceiling is set at ₹8 lakh. Unrevised since.', hi: 'ओबीसी क्रीमी लेयर की सीमा ₹8 लाख तय। तब से अपरिवर्तित।' } },
    ],
    questions: [
      { en: 'How many applications are rejected each year for certificate defects? Nobody is required to say.', hi: 'हर साल प्रमाणपत्र की कमी के कारण कितने आवेदन ख़ारिज होते हैं? किसी को यह बताना ज़रूरी नहीं।' },
      { en: 'Have you been rejected over a certificate date? Send us the notice through the community noticeboard.', hi: 'क्या प्रमाणपत्र की तारीख़ के कारण आपका आवेदन ख़ारिज हुआ? सामुदायिक नोटिसबोर्ड से हमें सूचना भेजिए।' },
    ],
    figures: ['eight-lakh', 'ews-10'],
    policies: ['obc-creamy-layer-8-lakh-2017', '103rd-constitutional-amendment-ews-reservation'],
    illustration: 'frozen-meter',
  },
  'Data & Notes': {
    desk: { en: 'The data desk', hi: 'आंकड़ा डेस्क' },
    headline: { en: 'The numbers that would settle it,', hi: 'वे आंकड़े जो बहस सुलझा देते,' },
    accent: { en: 'and who is sitting on them.', hi: 'और उन पर कौन बैठा है।' },
    standfirst: {
      en: 'A number appears here only with its unit, year, geography, definition and source. Most of this desk’s work is documenting the numbers that were collected with public money and never released.',
      hi: 'यहाँ कोई आंकड़ा तभी दिखता है जब उसके साथ इकाई, वर्ष, भूगोल, परिभाषा और स्रोत हो। इस डेस्क का ज़्यादातर काम उन आंकड़ों को दर्ज करना है जो जनता के पैसे से जुटाए गए और कभी जारी नहीं हुए।',
    },
    stateOfPlay: [
      { when: '2026-04-01', status: 'pending', text: { en: 'Census 2027 begins; caste to be enumerated in February 2027.', hi: 'जनगणना 2027 शुरू; जाति की गणना फ़रवरी 2027 में।' } },
      { when: '2023-10-02', status: 'decided', text: { en: 'Bihar publishes its caste survey, the only recent count any government has released.', hi: 'बिहार ने जाति सर्वेक्षण प्रकाशित किया, किसी सरकार की इकलौती हालिया जारी गणना।' } },
      { when: '2021-09-23', status: 'withheld', text: { en: 'The Centre tells the Supreme Court the SECC 2011 caste data is unusable.', hi: 'केंद्र ने सुप्रीम कोर्ट से कहा कि SECC 2011 के जाति आंकड़े बेकार हैं।' } },
    ],
    questions: [
      { en: 'Will the Census publish its caste code list before enumeration, not after?', hi: 'क्या जनगणना अपनी जाति कोड सूची गणना से पहले प्रकाशित करेगी, बाद में नहीं?' },
      { en: 'Will SECC 2011 raw data ever be released with its error audit?', hi: 'क्या SECC 2011 के कच्चे आंकड़े कभी अपनी त्रुटि-जाँच के साथ जारी होंगे?' },
    ],
    figures: ['secc-error-free', 'since-1931', 'bihar-ebc', 'rohini-extensions'],
    policies: ['census-2027-caste-enumeration'],
    illustration: 'census-clipboard',
  },
  'open-category-competition': {
    desk: { en: 'Topic file', hi: 'विषय फ़ाइल' },
    headline: { en: 'Open-category', hi: 'खुली श्रेणी की' },
    accent: { en: 'competition.', hi: 'प्रतिस्पर्धा।' },
    standfirst: {
      en: 'Open seats are open to every eligible candidate, from every category. They are not a reserved pool for any caste group, whatever a headline implies. Rules, selection lists and court orders must be read on their own terms.',
      hi: 'खुली सीटें हर श्रेणी के हर पात्र उम्मीदवार के लिए खुली हैं। वे किसी जाति समूह का आरक्षित कोटा नहीं हैं, सुर्ख़ियाँ चाहे जो इशारा करें। नियम, चयन सूचियाँ और अदालती आदेश उनकी अपनी शर्तों पर पढ़े जाने चाहिए।',
    },
    stateOfPlay: [
      { when: '2026-01-29', status: 'pending', text: { en: 'UGC equity rules stayed after petitioners argued the caste clause left general-category students unprotected.', hi: 'याचिकाकर्ताओं के इस तर्क के बाद यूजीसी समता नियमों पर रोक कि जाति वाली धारा सामान्य वर्ग के छात्रों को असुरक्षित छोड़ती है।' } },
      { when: '2022-11-07', status: 'decided', text: { en: 'The 10% EWS quota for those outside SC, ST and OBC is upheld 3:2.', hi: 'एससी, एसटी और ओबीसी से बाहर के लोगों के लिए 10% ईडब्ल्यूएस कोटा 3:2 से बरक़रार।' } },
    ],
    questions: [
      { en: 'Will a revised UGC definition protect every student from caste discrimination, without weakening protection for those it was written for?', hi: 'क्या यूजीसी की संशोधित परिभाषा हर छात्र को जातिगत भेदभाव से बचाएगी, उनकी सुरक्षा कमज़ोर किए बिना जिनके लिए यह लिखी गई थी?' },
    ],
    figures: ['ews-10', 'eight-lakh', 'ceiling'],
    policies: ['ugc-equity-regulations-2026', '103rd-constitutional-amendment-ews-reservation'],
    illustration: 'court-stamp',
  },
};

export function topicBrief(topic: string): TopicBrief | undefined {
  return TOPIC_BRIEFS[topic as TopicKey];
}
