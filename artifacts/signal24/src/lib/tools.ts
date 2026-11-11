/**
 * Self-check tools: the central creamy-layer test, the central EWS test and a guide to
 * which certificate to ask for. Every rule restates an official order linked in
 * `sources`; the tools give an indication, never a decision. The issuing officer decides.
 * Shared by the app (tools-pages.tsx) and the page server (server/render.tsx), so the
 * HTML a crawler sees carries the same rules the reader clicks through.
 *
 * Re-check against the sources whenever TOOLS_CHECKED_ON changes.
 */
import type { Bilingual } from './key-figures';

export const TOOLS_CHECKED_ON = '2026-11-11';

export type ToolSource = { name: string; url: string };
/** An order or judgment the tool restates, cited exactly so a reader can quote it. */
export type Citation = { title: Bilingual; reference: string; date: string };
const DOPT = { name: 'Department of Personnel and Training (office memoranda on OBC and EWS reservation)', url: 'https://dopt.gov.in/' };
const NCBC = { name: 'National Commission for Backward Classes (Central List of OBCs)', url: 'https://ncbc.nic.in/' };
const SERVICES = { name: 'National Government Services Portal (state certificate services)', url: 'https://services.india.gov.in/' };
const SCI = { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/' };

/** A yes/no question. `exclusion` is shown when the answer is the excluding one. */
export type ToolQuestion = {
  id: string;
  text: Bilingual;
  help?: Bilingual;
  /** Which answer excludes: a "yes" usually means the rule applies to you. */
  excludesOn: 'yes' | 'no';
  exclusion: Bilingual;
  /** Allow "Not sure": the result then says what to check instead of deciding. */
  unsure?: Bilingual;
};

export type CheckTool = {
  kind: 'check';
  id: 'creamy-layer-check' | 'ews-check';
  title: Bilingual;
  description: Bilingual;
  intro: Bilingual;
  basis: Bilingual;
  questions: ToolQuestion[];
  /** Shown when no question excludes. */
  clear: Bilingual;
  /** Shown when a question excludes, before the reason. */
  excluded: Bilingual;
  caveats: Bilingual[];
  sources: ToolSource[];
  citations: Citation[];
  answers: string[];
};

export type Category = 'sc' | 'st' | 'obc' | 'ews';
export type Purpose = 'central' | 'state';
export type CertificateAdvice = { name: Bilingual; issuer: Bilingual; checks: Bilingual[]; answers: string[] };

export type GuideTool = {
  kind: 'guide';
  id: 'which-certificate';
  title: Bilingual;
  description: Bilingual;
  intro: Bilingual;
  basis: Bilingual;
  categories: Array<{ id: Category; label: Bilingual }>;
  purposes: Array<{ id: Purpose; label: Bilingual }>;
  advice: (category: Category, purpose: Purpose) => CertificateAdvice;
  caveats: Bilingual[];
  sources: ToolSource[];
  citations: Citation[];
  answers: string[];
};

export type Tool = CheckTool | GuideTool;

const OM_1993: Citation = { title: { en: 'DoPT office memorandum setting the creamy-layer tests (the Schedule of exclusions)', hi: 'क्रीमी लेयर कसौटियाँ तय करने वाला कार्मिक विभाग का कार्यालय ज्ञापन (बहिष्करणों की अनुसूची)' }, reference: 'No. 36012/22/93-Estt.(SCT)', date: '1993-09-08' };
const OM_2017: Citation = { title: { en: 'DoPT office memorandum raising the income limit from ₹6 lakh to ₹8 lakh, with effect from 1 September 2017', hi: 'आय सीमा ₹6 लाख से बढ़ाकर ₹8 लाख करने वाला कार्मिक विभाग का कार्यालय ज्ञापन, 1 सितंबर 2017 से प्रभावी' }, reference: 'No. 36033/1/2013-Estt.(Res)', date: '2017-09-13' };
const OM_EWS: Citation = { title: { en: 'DoPT office memorandum on EWS reservation in central posts, for direct-recruitment vacancies notified on or after 1 February 2019', hi: 'केंद्र के पदों में ईडब्ल्यूएस आरक्षण पर कार्मिक विभाग का कार्यालय ज्ञापन, 1 फ़रवरी 2019 या उसके बाद अधिसूचित सीधी भर्ती की रिक्तियों के लिए' }, reference: 'No. 36039/1/2019-Estt.(Res)', date: '2019-01-31' };
const INDRA_SAWHNEY: Citation = { title: { en: 'Indra Sawhney v Union of India (nine judges): creamy layer and the 50% rule', hi: 'इंद्रा साहनी बनाम भारत संघ (नौ जज): क्रीमी लेयर और 50% का नियम' }, reference: '1992 Supp (3) SCC 217', date: '1992-11-16' };
const JANHIT_ABHIYAN: Citation = { title: { en: 'Janhit Abhiyan v Union of India: the 103rd Amendment upheld 3:2', hi: 'जनहित अभियान बनाम भारत संघ: 103वाँ संशोधन 3:2 से सही ठहराया गया' }, reference: '2022 INSC 1175', date: '2022-11-07' };
const MADHURI_PATIL: Citation = { title: { en: 'Kumari Madhuri Patil v Additional Commissioner: how SC and ST claims are verified', hi: 'कुमारी माधुरी पाटिल बनाम अतिरिक्त आयुक्त: एससी और एसटी दावों की जाँच कैसे हो' }, reference: '(1994) 6 SCC 241', date: '1994' };
const BIR_SINGH: Citation = { title: { en: 'Bir Singh v Delhi Jal Board (Constitution Bench): SC and ST status is tied to the state of origin', hi: 'बीर सिंह बनाम दिल्ली जल बोर्ड (संविधान पीठ): एससी और एसटी दर्जा मूल राज्य से जुड़ा है' }, reference: '2018 INSC 766', date: '2018' };

const INDICATIVE: Bilingual = {
  en: 'This is an indication based on the central government’s published rules, not a certificate or legal advice. The officer who issues the certificate decides, and state governments can apply their own rules to state jobs and seats.',
  hi: 'यह केंद्र सरकार के प्रकाशित नियमों पर आधारित एक संकेत है, प्रमाणपत्र या क़ानूनी सलाह नहीं। फ़ैसला प्रमाणपत्र जारी करने वाला अधिकारी करता है, और राज्य सरकारें राज्य की नौकरियों और सीटों पर अपने नियम लागू कर सकती हैं।',
};

export const CREAMY_LAYER_TOOL: CheckTool = {
  kind: 'check',
  id: 'creamy-layer-check',
  title: { en: 'Am I in the OBC creamy layer? A step-by-step check', hi: 'क्या मैं ओबीसी क्रीमी लेयर में हूँ? क़दम-दर-क़दम जाँच' },
  description: {
    en: 'Answer seven questions about your community and your parents to see whether the central creamy-layer rules would exclude you from the OBC quota. Every test is taken from the DoPT’s office memoranda, with the source linked.',
    hi: 'अपने समुदाय और माता-पिता के बारे में सात सवालों के जवाब दीजिए और देखिए कि क्या केंद्र के क्रीमी लेयर नियम आपको ओबीसी कोटे से बाहर करेंगे। हर कसौटी कार्मिक एवं प्रशिक्षण विभाग के कार्यालय ज्ञापनों से ली गई है, स्रोत के लिंक के साथ।',
  },
  intro: {
    en: 'The creamy layer is decided by your parents’ position, not your own income or your spouse’s. Answer for your parents. One “yes” to an exclusion is enough to put a family in the creamy layer.',
    hi: 'क्रीमी लेयर आपके माता-पिता की स्थिति से तय होती है, आपकी अपनी या आपके जीवनसाथी की आय से नहीं। जवाब अपने माता-पिता के बारे में दीजिए। किसी एक बहिष्करण पर “हाँ” परिवार को क्रीमी लेयर में डालने के लिए काफ़ी है।',
  },
  basis: {
    en: 'The creamy layer comes from the Supreme Court’s Indra Sawhney judgment of 16 November 1992. The Department of Personnel and Training set the tests in office memorandum No. 36012/22/93-Estt.(SCT) of 8 September 1993, and its office memorandum of 13 September 2017 raised the income limit to ₹8 lakh a year from 1 September 2017. The tests exclude the children of people in constitutional posts, of Group A (Class I) officers, of parents who are both Group B (Class II) officers, and of officers of the rank of Colonel and above; everyone else faces an income test on income other than salary and agricultural land.',
    hi: 'क्रीमी लेयर सुप्रीम कोर्ट के 16 नवंबर 1992 के इंद्रा साहनी फ़ैसले से आई। कार्मिक एवं प्रशिक्षण विभाग ने 8 सितंबर 1993 के कार्यालय ज्ञापन सं. 36012/22/93-Estt.(SCT) में कसौटियाँ तय कीं, और 13 सितंबर 2017 के कार्यालय ज्ञापन ने 1 सितंबर 2017 से आय सीमा ₹8 लाख सालाना कर दी। ये कसौटियाँ संवैधानिक पदों पर बैठे लोगों, ग्रुप ए (क्लास I) अधिकारियों, ऐसे माता-पिता जो दोनों ग्रुप बी (क्लास II) अधिकारी हों, और कर्नल या उससे ऊपर के अधिकारियों के बच्चों को बाहर करती हैं; बाक़ी सब पर वेतन और कृषि भूमि को छोड़कर अन्य आय की कसौटी लागू होती है।',
  },
  questions: [
    {
      id: 'central-list',
      text: { en: 'Is your community in the Central List of OBCs for your state?', hi: 'क्या आपका समुदाय आपके राज्य के लिए ओबीसी की केंद्रीय सूची में है?' },
      help: { en: 'The Central List is kept by the National Commission for Backward Classes and differs from your state’s own OBC list.', hi: 'केंद्रीय सूची राष्ट्रीय पिछड़ा वर्ग आयोग रखता है, और यह आपके राज्य की अपनी ओबीसी सूची से अलग होती है।' },
      excludesOn: 'no',
      exclusion: { en: 'Your community is not in the Central List, so the central OBC quota is not open to you, whatever your family’s income. Your state’s own OBC list may still cover you for state jobs and seats.', hi: 'आपका समुदाय केंद्रीय सूची में नहीं है, इसलिए परिवार की आय जो भी हो, केंद्र का ओबीसी कोटा आपके लिए नहीं है। राज्य की नौकरियों और सीटों के लिए राज्य की अपनी ओबीसी सूची में आप फिर भी हो सकते हैं।' },
      unsure: { en: 'Check the Central List for your state first: the whole question turns on it.', hi: 'पहले अपने राज्य की केंद्रीय सूची देखिए: पूरा सवाल इसी पर टिका है।' },
    },
    {
      id: 'constitutional',
      text: { en: 'Does either parent hold a constitutional post, such as President, Vice-President, judge of the Supreme Court or a High Court, chair or member of the UPSC or a State Public Service Commission, Chief Election Commissioner or Comptroller and Auditor General?', hi: 'क्या माता-पिता में से कोई संवैधानिक पद पर है, जैसे राष्ट्रपति, उपराष्ट्रपति, सुप्रीम कोर्ट या हाई कोर्ट के न्यायाधीश, यूपीएससी या राज्य लोक सेवा आयोग के अध्यक्ष या सदस्य, मुख्य चुनाव आयुक्त या नियंत्रक एवं महालेखा परीक्षक?' },
      excludesOn: 'yes',
      exclusion: { en: 'Children of people in constitutional posts are in the creamy layer, whatever the family’s income.', hi: 'संवैधानिक पदों पर बैठे लोगों के बच्चे क्रीमी लेयर में हैं, परिवार की आय चाहे जो हो।' },
    },
    {
      id: 'group-a',
      text: { en: 'Was either parent directly recruited to a Group A (Class I) post in central or state government, for example the IAS, IPS or a central Group A service?', hi: 'क्या माता-पिता में से किसी की सीधी भर्ती केंद्र या राज्य सरकार के ग्रुप ए (क्लास I) पद पर हुई थी, जैसे आईएएस, आईपीएस या केंद्र की कोई ग्रुप ए सेवा?' },
      help: { en: 'If that parent died or was permanently incapacitated, different rules apply; tell the issuing officer.', hi: 'अगर उस अभिभावक की मृत्यु हो गई या वे स्थायी रूप से अक्षम हो गए, तो अलग नियम लागू होते हैं; जारी करने वाले अधिकारी को बताइए।' },
      excludesOn: 'yes',
      exclusion: { en: 'Children of a parent directly recruited to Group A (Class I) are in the creamy layer. For government servants it is the post that counts, not the salary.', hi: 'ग्रुप ए (क्लास I) में सीधी भर्ती वाले अभिभावक के बच्चे क्रीमी लेयर में हैं। सरकारी कर्मचारियों के लिए पद मायने रखता है, वेतन नहीं।' },
    },
    {
      id: 'group-b-both',
      text: { en: 'Were both parents directly recruited to Group B (Class II) posts?', hi: 'क्या माता-पिता दोनों की सीधी भर्ती ग्रुप बी (क्लास II) पदों पर हुई थी?' },
      excludesOn: 'yes',
      exclusion: { en: 'Children of parents who are both Group B (Class II) officers are in the creamy layer.', hi: 'जिनके माता-पिता दोनों ग्रुप बी (क्लास II) अधिकारी हैं, उनके बच्चे क्रीमी लेयर में हैं।' },
    },
    {
      id: 'group-b-promoted',
      text: { en: 'Is only one parent a Group B (Class II) officer, and was that parent promoted to Group A (Class I) at the age of 40 or earlier?', hi: 'क्या केवल एक अभिभावक ग्रुप बी (क्लास II) अधिकारी हैं, और क्या उन्हें 40 साल या उससे कम उम्र में ग्रुप ए (क्लास I) में पदोन्नति मिली?' },
      help: { en: 'The 1993 memorandum words this test about the husband; ask the issuing officer how it is applied to your family.', hi: '1993 का ज्ञापन यह कसौटी पति के बारे में कहता है; जारी करने वाले अधिकारी से पूछिए कि आपके परिवार पर यह कैसे लागू होती है।' },
      excludesOn: 'yes',
      exclusion: { en: 'Where only one parent is a Group B (Class II) officer and reached Group A (Class I) by the age of 40, the children are in the creamy layer.', hi: 'जहाँ केवल एक अभिभावक ग्रुप बी (क्लास II) अधिकारी हों और 40 की उम्र तक ग्रुप ए (क्लास I) में पहुँच गए हों, वहाँ बच्चे क्रीमी लेयर में हैं।' },
    },
    {
      id: 'armed-forces',
      text: { en: 'Does either parent hold the rank of Colonel or above in the Army, or an equivalent rank in the Navy or Air Force?', hi: 'क्या माता-पिता में से कोई थल सेना में कर्नल या उससे ऊपर के पद पर है, या नौसेना या वायु सेना में समकक्ष पद पर?' },
      excludesOn: 'yes',
      exclusion: { en: 'Children of officers of the rank of Colonel and above, or the equivalent in the Navy and Air Force, are in the creamy layer.', hi: 'कर्नल और उससे ऊपर के अधिकारियों, या नौसेना और वायु सेना में समकक्ष अधिकारियों, के बच्चे क्रीमी लेयर में हैं।' },
    },
    {
      id: 'income',
      text: { en: 'Leaving out salary and income from agricultural land, was your parents’ gross annual income ₹8 lakh or more in each of the last three consecutive years?', hi: 'वेतन और कृषि भूमि से आय को छोड़कर, क्या पिछले लगातार तीन सालों में से हर साल आपके माता-पिता की सकल वार्षिक आय ₹8 लाख या ज़्यादा थी?' },
      help: { en: 'Count income from business, profession, rent, interest and other sources. Salary and farm income are left out of this test.', hi: 'व्यापार, पेशे, किराए, ब्याज और दूसरे स्रोतों की आय गिनिए। इस कसौटी में वेतन और खेती की आय नहीं गिनी जाती।' },
      excludesOn: 'yes',
      exclusion: { en: 'Income of ₹8 lakh or more, outside salary and farm income, in each of three consecutive years puts the family in the creamy layer.', hi: 'वेतन और खेती की आय के बाहर, लगातार तीन साल हर साल ₹8 लाख या ज़्यादा आय परिवार को क्रीमी लेयर में डाल देती है।' },
    },
  ],
  clear: {
    en: 'On your answers, none of the central creamy-layer tests applies. You can apply for an OBC non-creamy-layer certificate in the central format from your state’s revenue authority.',
    hi: 'आपके जवाबों के आधार पर केंद्र की कोई भी क्रीमी लेयर कसौटी लागू नहीं होती। आप अपने राज्य के राजस्व प्राधिकारी से केंद्रीय प्रारूप में ओबीसी नॉन-क्रीमी लेयर प्रमाणपत्र के लिए आवेदन कर सकते हैं।',
  },
  excluded: {
    en: 'On your answers, the central rules would put your family in the creamy layer, or outside the central OBC quota. You can still compete in the open category.',
    hi: 'आपके जवाबों के आधार पर केंद्र के नियम आपके परिवार को क्रीमी लेयर में, या केंद्र के ओबीसी कोटे से बाहर, रखेंगे। आप खुली श्रेणी में प्रतिस्पर्धा फिर भी कर सकते हैं।',
  },
  caveats: [
    INDICATIVE,
    {
      en: 'If a parent works in a public-sector undertaking, bank, university or private company, how the post is treated depends on equivalence rules this check cannot settle. Families with large irrigated landholdings face a separate land test. Ask the issuing officer.',
      hi: 'अगर कोई अभिभावक सार्वजनिक उपक्रम, बैंक, विश्वविद्यालय या निजी कंपनी में काम करते हैं, तो उनके पद को कैसे देखा जाएगा, यह समकक्षता के नियमों पर निर्भर है, जिन्हें यह जाँच तय नहीं कर सकती। बड़ी सिंचित ज़मीन वाले परिवारों पर अलग भूमि कसौटी लागू होती है। जारी करने वाले अधिकारी से पूछिए।',
    },
  ],
  sources: [DOPT, NCBC, SCI],
  citations: [OM_1993, OM_2017, INDRA_SAWHNEY],
  answers: ['creamy-layer', 'non-creamy-layer-certificate', 'check-central-obc-list', 'creamy-layer-sc-st'],
};

export const EWS_TOOL: CheckTool = {
  kind: 'check',
  id: 'ews-check',
  title: { en: 'Do I qualify for the EWS quota? A step-by-step check', hi: 'क्या मैं ईडब्ल्यूएस कोटे के योग्य हूँ? क़दम-दर-क़दम जाँच' },
  description: {
    en: 'Answer six questions about your family’s income and property to see whether you meet the central government’s EWS criteria. Every test is taken from the DoPT office memorandum of 31 January 2019, with the source linked.',
    hi: 'परिवार की आय और संपत्ति के बारे में छह सवालों के जवाब दीजिए और देखिए कि क्या आप केंद्र सरकार की ईडब्ल्यूएस शर्तें पूरी करते हैं। हर कसौटी कार्मिक एवं प्रशिक्षण विभाग के 31 जनवरी 2019 के कार्यालय ज्ञापन से ली गई है, स्रोत के लिंक के साथ।',
  },
  intro: {
    en: 'For this test, “family” means you, your parents, your brothers and sisters under 18, your spouse and your children under 18. Property held by the family in different places is added together. One “yes” to an exclusion is enough to rule you out.',
    hi: 'इस कसौटी में “परिवार” का मतलब है आप, आपके माता-पिता, 18 साल से कम उम्र के भाई-बहन, आपका जीवनसाथी और 18 साल से कम उम्र के बच्चे। अलग-अलग जगहों पर परिवार की संपत्ति जोड़कर गिनी जाती है। किसी एक बहिष्करण पर “हाँ” आपको बाहर करने के लिए काफ़ी है।',
  },
  basis: {
    en: 'The EWS quota rests on Articles 15(6) and 16(6), added by the Constitution (One Hundred and Third Amendment) Act, 2019, which allow up to 10% reservation for economically weaker sections not covered by the SC, ST or OBC quotas. The Department of Personnel and Training set the central criteria in office memorandum No. 36039/1/2019-Estt.(Res) of 31 January 2019, for vacancies notified on or after 1 February 2019. The Supreme Court upheld the amendment 3:2 in Janhit Abhiyan v Union of India on 7 November 2022.',
    hi: 'ईडब्ल्यूएस कोटा अनुच्छेद 15(6) और 16(6) पर टिका है, जो संविधान (एक सौ तीसरा संशोधन) अधिनियम, 2019 से जोड़े गए, और एससी, एसटी या ओबीसी कोटे से बाहर के आर्थिक रूप से कमज़ोर वर्गों को 10% तक आरक्षण की अनुमति देते हैं। कार्मिक एवं प्रशिक्षण विभाग ने 31 जनवरी 2019 के कार्यालय ज्ञापन सं. 36039/1/2019-Estt.(Res) में केंद्र की शर्तें तय कीं, जो 1 फ़रवरी 2019 या उसके बाद अधिसूचित रिक्तियों पर लागू हैं। सुप्रीम कोर्ट ने 7 नवंबर 2022 को जनहित अभियान बनाम भारत संघ में 3:2 से संशोधन को सही ठहराया।',
  },
  questions: [
    {
      id: 'reserved-category',
      text: { en: 'Is your community listed as a Scheduled Caste, Scheduled Tribe or OBC?', hi: 'क्या आपका समुदाय अनुसूचित जाति, अनुसूचित जनजाति या ओबीसी के रूप में सूचीबद्ध है?' },
      help: { en: 'The EWS quota is for people not covered by the SC, ST and OBC reservation schemes. If you are an OBC in the creamy layer, ask the issuing authority how this applies to you.', hi: 'ईडब्ल्यूएस कोटा उन लोगों के लिए है जो एससी, एसटी और ओबीसी आरक्षण योजनाओं के दायरे में नहीं आते। अगर आप क्रीमी लेयर वाले ओबीसी हैं, तो जारी करने वाले प्राधिकारी से पूछिए कि यह आप पर कैसे लागू होता है।' },
      excludesOn: 'yes',
      exclusion: { en: 'The EWS quota is only for people not covered by SC, ST or OBC reservation.', hi: 'ईडब्ल्यूएस कोटा केवल उन लोगों के लिए है जो एससी, एसटी या ओबीसी आरक्षण के दायरे में नहीं आते।' },
    },
    {
      id: 'income',
      text: { en: 'Was your family’s gross income from all sources, including salary, agriculture, business and profession, ₹8 lakh or more in the financial year before you apply?', hi: 'क्या आवेदन से पहले वाले वित्तीय वर्ष में परिवार की सभी स्रोतों से सकल आय, जिसमें वेतन, खेती, व्यापार और पेशा शामिल हैं, ₹8 लाख या ज़्यादा थी?' },
      help: { en: 'Unlike the OBC creamy-layer test, salary and farm income count here.', hi: 'ओबीसी क्रीमी लेयर की कसौटी से उलट, यहाँ वेतन और खेती की आय गिनी जाती है।' },
      excludesOn: 'yes',
      exclusion: { en: 'Family income of ₹8 lakh or more from all sources in the previous financial year rules you out.', hi: 'पिछले वित्तीय वर्ष में सभी स्रोतों से ₹8 लाख या ज़्यादा पारिवारिक आय आपको बाहर कर देती है।' },
    },
    {
      id: 'farm-land',
      text: { en: 'Does your family own 5 acres or more of agricultural land?', hi: 'क्या आपके परिवार के पास 5 एकड़ या ज़्यादा कृषि भूमि है?' },
      excludesOn: 'yes',
      exclusion: { en: 'Agricultural land of 5 acres or more rules you out.', hi: '5 एकड़ या ज़्यादा कृषि भूमि आपको बाहर कर देती है।' },
    },
    {
      id: 'flat',
      text: { en: 'Does your family own a residential flat of 1,000 square feet or more?', hi: 'क्या आपके परिवार के पास 1,000 वर्ग फ़ुट या उससे बड़ा आवासीय फ़्लैट है?' },
      excludesOn: 'yes',
      exclusion: { en: 'A residential flat of 1,000 square feet or more rules you out.', hi: '1,000 वर्ग फ़ुट या उससे बड़ा आवासीय फ़्लैट आपको बाहर कर देता है।' },
    },
    {
      id: 'plot-municipal',
      text: { en: 'Does your family own a residential plot of 100 square yards or more in a notified municipality?', hi: 'क्या आपके परिवार के पास अधिसूचित नगरपालिका क्षेत्र में 100 वर्ग गज़ या उससे बड़ा आवासीय प्लॉट है?' },
      excludesOn: 'yes',
      exclusion: { en: 'A residential plot of 100 square yards or more in a notified municipality rules you out.', hi: 'अधिसूचित नगरपालिका क्षेत्र में 100 वर्ग गज़ या उससे बड़ा आवासीय प्लॉट आपको बाहर कर देता है।' },
    },
    {
      id: 'plot-other',
      text: { en: 'Does your family own a residential plot of 200 square yards or more outside notified municipalities?', hi: 'क्या आपके परिवार के पास अधिसूचित नगरपालिका क्षेत्रों के बाहर 200 वर्ग गज़ या उससे बड़ा आवासीय प्लॉट है?' },
      excludesOn: 'yes',
      exclusion: { en: 'A residential plot of 200 square yards or more outside notified municipalities rules you out.', hi: 'अधिसूचित नगरपालिका क्षेत्रों के बाहर 200 वर्ग गज़ या उससे बड़ा आवासीय प्लॉट आपको बाहर कर देता है।' },
    },
  ],
  clear: {
    en: 'On your answers, you meet the central EWS criteria. Apply for an Income and Asset Certificate from your state’s revenue authority, issued by an officer of the rank of Tehsildar or above, for the financial year your application asks for.',
    hi: 'आपके जवाबों के आधार पर आप केंद्र की ईडब्ल्यूएस शर्तें पूरी करते हैं। अपने राज्य के राजस्व प्राधिकारी से आय और संपत्ति प्रमाणपत्र के लिए आवेदन कीजिए, जो तहसीलदार या उससे ऊपर के अधिकारी द्वारा, उसी वित्तीय वर्ष के लिए जारी हो जो आपका आवेदन माँगता है।',
  },
  excluded: {
    en: 'On your answers, you do not meet the central EWS criteria. You can still compete in the open category.',
    hi: 'आपके जवाबों के आधार पर आप केंद्र की ईडब्ल्यूएस शर्तें पूरी नहीं करते। आप खुली श्रेणी में प्रतिस्पर्धा फिर भी कर सकते हैं।',
  },
  caveats: [
    INDICATIVE,
    {
      en: 'The ₹8 lakh limit has not been revised since the quota began in 2019, and some states use different criteria for state jobs and seats.',
      hi: '₹8 लाख की सीमा 2019 में कोटा शुरू होने के बाद से नहीं बदली, और कुछ राज्य अपनी नौकरियों और सीटों के लिए अलग शर्तें इस्तेमाल करते हैं।',
    },
  ],
  sources: [DOPT, SCI, SERVICES],
  citations: [OM_EWS, JANHIT_ABHIYAN],
  answers: ['ews-eligibility', 'ews-certificate', 'creamy-layer'],
};

const CENTRAL_FORMAT: Bilingual = {
  en: 'Ask for the central-government format by name. State and central formats are not interchangeable, and recruiters reject the wrong one.',
  hi: 'नाम लेकर केंद्र सरकार का प्रारूप माँगिए। राज्य और केंद्र के प्रारूप एक-दूसरे की जगह नहीं चलते, और भर्ती करने वाले ग़लत प्रारूप ख़ारिज कर देते हैं।',
};
const DATE_CHECK: Bilingual = {
  en: 'Check the date or financial year your recruitment or admission notice asks for, and apply well before the deadline.',
  hi: 'देखिए कि आपकी भर्ती या दाख़िले की सूचना कौन-सी तारीख़ या वित्तीय वर्ष माँगती है, और समय-सीमा से काफ़ी पहले आवेदन कीजिए।',
};

export const CERTIFICATE_TOOL: GuideTool = {
  kind: 'guide',
  id: 'which-certificate',
  title: { en: 'Which reservation certificate do I need?', hi: 'मुझे कौन-सा आरक्षण प्रमाणपत्र चाहिए?' },
  description: {
    en: 'Pick your category and whether you are applying for a central or a state job or seat, and see which certificate to ask for, who issues it and the checks that most often get applications rejected.',
    hi: 'अपनी श्रेणी चुनिए और बताइए कि आप केंद्र या राज्य की नौकरी या सीट के लिए आवेदन कर रहे हैं, और देखिए कि कौन-सा प्रमाणपत्र माँगना है, कौन जारी करता है और कौन-सी जाँचें सबसे ज़्यादा आवेदन ख़ारिज करवाती हैं।',
  },
  intro: {
    en: 'There is no single national certificate. Every state issues its own, through officers it designates, and central posts and institutions ask for formats prescribed by the Department of Personnel and Training.',
    hi: 'कोई एक राष्ट्रीय प्रमाणपत्र नहीं है। हर राज्य अपने नामित अधिकारियों के ज़रिए अपना प्रमाणपत्र जारी करता है, और केंद्र के पद और संस्थान कार्मिक एवं प्रशिक्षण विभाग के तय प्रारूप माँगते हैं।',
  },
  basis: {
    en: 'Caste certificates are issued under each state’s rules, usually by a Tehsildar, Sub-Divisional Magistrate or District Magistrate. The Supreme Court’s judgment in Kumari Madhuri Patil (1994) set out how SC and ST claims should be verified, including by state scrutiny committees. SC and ST status is tied to the state where your community is listed (Marri Chandra Shekhar Rao, 1990; Bir Singh, 2018).',
    hi: 'जाति प्रमाणपत्र हर राज्य के नियमों के तहत जारी होते हैं, आमतौर पर तहसीलदार, उप-मंडल मजिस्ट्रेट या ज़िला मजिस्ट्रेट द्वारा। सुप्रीम कोर्ट के कुमारी माधुरी पाटिल (1994) फ़ैसले ने तय किया कि एससी और एसटी दावों की जाँच कैसे हो, जिसमें राज्य की जाँच समितियाँ भी शामिल हैं। एससी और एसटी का दर्जा उस राज्य से जुड़ा है जहाँ आपका समुदाय सूचीबद्ध है (मर्री चंद्रशेखर राव, 1990; बीर सिंह, 2018)।',
  },
  categories: [
    { id: 'sc', label: { en: 'Scheduled Caste (SC)', hi: 'अनुसूचित जाति (एससी)' } },
    { id: 'st', label: { en: 'Scheduled Tribe (ST)', hi: 'अनुसूचित जनजाति (एसटी)' } },
    { id: 'obc', label: { en: 'Other Backward Class (OBC)', hi: 'अन्य पिछड़ा वर्ग (ओबीसी)' } },
    { id: 'ews', label: { en: 'Economically Weaker Section (EWS)', hi: 'आर्थिक रूप से कमज़ोर वर्ग (ईडब्ल्यूएस)' } },
  ],
  purposes: [
    { id: 'central', label: { en: 'A central government job or central institution', hi: 'केंद्र सरकार की नौकरी या केंद्रीय संस्थान' } },
    { id: 'state', label: { en: 'A state government job or state institution', hi: 'राज्य सरकार की नौकरी या राज्य का संस्थान' } },
  ],
  advice(category, purpose) {
    const central = purpose === 'central';
    if (category === 'sc' || category === 'st') {
      const label = category === 'sc' ? { en: 'Scheduled Caste', hi: 'अनुसूचित जाति' } : { en: 'Scheduled Tribe', hi: 'अनुसूचित जनजाति' };
      return {
        name: central
          ? { en: `${label.en} certificate in the central-government format`, hi: `केंद्र सरकार के प्रारूप में ${label.hi} प्रमाणपत्र` }
          : { en: `${label.en} certificate in your state’s format`, hi: `आपके राज्य के प्रारूप में ${label.hi} प्रमाणपत्र` },
        issuer: { en: 'Your state’s revenue authority, usually a Tehsildar, Sub-Divisional Magistrate or District Magistrate, often through the state’s online public-service portal.', hi: 'आपके राज्य का राजस्व प्राधिकारी, आमतौर पर तहसीलदार, उप-मंडल मजिस्ट्रेट या ज़िला मजिस्ट्रेट, अक्सर राज्य के ऑनलाइन लोक-सेवा पोर्टल के ज़रिए।' },
        checks: [
          central ? CENTRAL_FORMAT : { en: 'Some states also require the claim to be verified by a caste scrutiny committee before a job or seat is confirmed. Ask whether yours does.', hi: 'कुछ राज्यों में नौकरी या सीट पक्की होने से पहले जाति जाँच समिति से दावे की पुष्टि भी ज़रूरी है। पूछिए कि आपके राज्य में है या नहीं।' },
          { en: 'The certificate is tied to the state where your community is listed. If you have moved, you generally keep the benefit in your state of origin and for central posts, not in your new state.', hi: 'प्रमाणपत्र उस राज्य से जुड़ा है जहाँ आपका समुदाय सूचीबद्ध है। अगर आप दूसरे राज्य में चले गए हैं, तो आमतौर पर लाभ मूल राज्य में और केंद्र के पदों पर मिलता है, नए राज्य में नहीं।' },
          { en: 'Proof of your community is the core of the application; a parent’s certificate is usually the strongest evidence.', hi: 'आवेदन का मूल आपके समुदाय का सबूत है; माता-पिता का प्रमाणपत्र आमतौर पर सबसे मज़बूत सबूत होता है।' },
        ],
        answers: ['get-a-caste-certificate', 'caste-certificate-other-state', 'sc-sub-classification'],
      };
    }
    if (category === 'obc') {
      return {
        name: central
          ? { en: 'OBC certificate in the central-government format, including non-creamy-layer status', hi: 'केंद्र सरकार के प्रारूप में ओबीसी प्रमाणपत्र, नॉन-क्रीमी लेयर दर्जे के साथ' }
          : { en: 'OBC certificate in your state’s format, under your state’s list and rules', hi: 'आपके राज्य के प्रारूप में ओबीसी प्रमाणपत्र, राज्य की सूची और नियमों के तहत' },
        issuer: { en: 'Your state’s revenue authority, usually a Tehsildar or Sub-Divisional Magistrate, through the state portal or the tehsil office.', hi: 'आपके राज्य का राजस्व प्राधिकारी, आमतौर पर तहसीलदार या उप-मंडल मजिस्ट्रेट, राज्य पोर्टल या तहसील कार्यालय के ज़रिए।' },
        checks: central
          ? [
              { en: 'Your community must be in the Central List of OBCs for your state, which the National Commission for Backward Classes publishes. Being on the state list is not enough.', hi: 'आपका समुदाय आपके राज्य के लिए ओबीसी की केंद्रीय सूची में होना चाहिए, जिसे राष्ट्रीय पिछड़ा वर्ग आयोग प्रकाशित करता है। सिर्फ़ राज्य की सूची में होना काफ़ी नहीं।' },
              { en: 'You must be outside the creamy layer under the central rules; run the creamy-layer check first.', hi: 'केंद्र के नियमों के तहत आपको क्रीमी लेयर से बाहर होना चाहिए; पहले क्रीमी लेयर जाँच कीजिए।' },
              CENTRAL_FORMAT,
              DATE_CHECK,
            ]
          : [
              { en: 'State OBC lists are kept by each state and can differ from the Central List.', hi: 'राज्य की ओबीसी सूचियाँ हर राज्य रखता है, और ये केंद्रीय सूची से अलग हो सकती हैं।' },
              { en: 'States can set their own creamy-layer rules for state jobs and seats; ask what yours uses.', hi: 'राज्य अपनी नौकरियों और सीटों के लिए अपने क्रीमी लेयर नियम तय कर सकते हैं; पूछिए कि आपका राज्य कौन-से नियम मानता है।' },
              DATE_CHECK,
            ],
        answers: ['non-creamy-layer-certificate', 'check-central-obc-list', 'creamy-layer'],
      };
    }
    return {
      name: central
        ? { en: 'Income and Asset Certificate (EWS) in the central-government format', hi: 'केंद्र सरकार के प्रारूप में आय और संपत्ति प्रमाणपत्र (ईडब्ल्यूएस)' }
        : { en: 'EWS certificate in your state’s format, under your state’s criteria', hi: 'आपके राज्य के प्रारूप में ईडब्ल्यूएस प्रमाणपत्र, राज्य की शर्तों के तहत' },
      issuer: central
        ? { en: 'A designated revenue officer of the rank of Tehsildar or above in your state.', hi: 'आपके राज्य में तहसीलदार या उससे ऊपर के पद का नामित राजस्व अधिकारी।' }
        : { en: 'Your state’s revenue authority, through the state portal or the tehsil office.', hi: 'आपके राज्य का राजस्व प्राधिकारी, राज्य पोर्टल या तहसील कार्यालय के ज़रिए।' },
      checks: central
        ? [
            { en: 'You must meet the central income and property tests; run the EWS check first.', hi: 'आपको केंद्र की आय और संपत्ति की कसौटियाँ पूरी करनी होंगी; पहले ईडब्ल्यूएस जाँच कीजिए।' },
            { en: 'The certificate is for one financial year: the one before the year you apply. Match it to what the notice asks for.', hi: 'प्रमाणपत्र एक वित्तीय वर्ष के लिए होता है: आवेदन वाले साल से पहले वाला। इसे सूचना की माँग से मिलाइए।' },
            CENTRAL_FORMAT,
          ]
        : [
            { en: 'Some states use different income or property limits for state jobs and seats; ask what yours uses.', hi: 'कुछ राज्य अपनी नौकरियों और सीटों के लिए अलग आय या संपत्ति सीमाएँ इस्तेमाल करते हैं; पूछिए कि आपका राज्य कौन-सी मानता है।' },
            DATE_CHECK,
          ],
      answers: ['ews-certificate', 'ews-eligibility'],
    };
  },
  caveats: [
    {
      en: 'This guide sums up the published rules; the officer who issues the certificate and the body that recruits or admits you have the final word.',
      hi: 'यह गाइड प्रकाशित नियमों का सार है; अंतिम शब्द प्रमाणपत्र जारी करने वाले अधिकारी और भर्ती या दाख़िला देने वाली संस्था का है।',
    },
  ],
  sources: [DOPT, NCBC, SERVICES, SCI],
  citations: [MADHURI_PATIL, BIR_SINGH, OM_1993, OM_EWS],
  answers: ['get-a-caste-certificate', 'non-creamy-layer-certificate', 'ews-certificate'],
};

export const TOOLS: Tool[] = [CREAMY_LAYER_TOOL, EWS_TOOL, CERTIFICATE_TOOL];
export const toolById = (id: string | undefined) => TOOLS.find((tool) => tool.id === id);
export const TOOL_IDS = TOOLS.map((tool) => tool.id);

/** "8 Sep 1993" (or a bare year) for a citation date, in either edition. */
export function citationDate(date: string, lang: 'en' | 'hi') {
  if (/^\d{4}$/.test(date)) return date;
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

/** The page title for /tools/:id, shared by the app and the page server. */
export function toolTitle(tool: Tool, lang: 'en' | 'hi') {
  return `${tool.title[lang]} — ${lang === 'hi' ? 'द सिग्नल 24' : 'The Signal 24'}`;
}

/** Which answers link to which tool ("Check it yourself" on answer pages). */
export const TOOL_FOR_ANSWER: Record<string, Tool['id']> = {
  'creamy-layer': 'creamy-layer-check',
  'non-creamy-layer-certificate': 'creamy-layer-check',
  'check-central-obc-list': 'creamy-layer-check',
  'ews-eligibility': 'ews-check',
  'ews-certificate': 'ews-check',
  'get-a-caste-certificate': 'which-certificate',
  'caste-certificate-other-state': 'which-certificate',
};

export type CheckAnswer = 'yes' | 'no' | 'unsure';
export type CheckOutcome =
  | { state: 'incomplete' }
  | { state: 'excluded'; question: ToolQuestion }
  | { state: 'unsure'; questions: ToolQuestion[] }
  | { state: 'clear' };

/**
 * The verdict for a set of answers, in question order: the first excluding answer
 * decides; an "unsure" never decides but stops a clear result.
 */
export function evaluateCheck(tool: CheckTool, answers: Partial<Record<string, CheckAnswer>>): CheckOutcome {
  const unsure: ToolQuestion[] = [];
  for (const question of tool.questions) {
    const answer = answers[question.id];
    if (!answer) return { state: 'incomplete' };
    if (answer === 'unsure') { unsure.push(question); continue; }
    if (answer === question.excludesOn) return { state: 'excluded', question };
  }
  return unsure.length ? { state: 'unsure', questions: unsure } : { state: 'clear' };
}
