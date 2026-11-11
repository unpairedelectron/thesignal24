/**
 * Plain definitions of the terms the site's reporting keeps using, in both editions.
 * Each restates the law or official record it names, and links its official source.
 * Articles list the terms they use ("Terms in this record"), matched by `match`.
 */
import type { Bilingual } from './key-figures';

export const GLOSSARY_CHECKED_ON = '2026-11-11';

export type GlossaryTerm = {
  id: string;
  term: Bilingual;
  definition: Bilingual;
  /** Patterns that find the term in English and Hindi text. */
  match: { en: RegExp; hi: RegExp };
  source: { name: string; url: string };
  answer?: string;
};

const CONSTITUTION = { name: 'Constitution of India', url: 'https://legislative.gov.in/constitution-of-india/' };
const DOPT = { name: 'Department of Personnel and Training', url: 'https://dopt.gov.in/' };
const NCBC = { name: 'National Commission for Backward Classes', url: 'https://ncbc.nic.in/' };
const SCI = { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/' };
const RTI = { name: 'RTI Online (Government of India)', url: 'https://rtionline.gov.in/' };
const GAZETTE = { name: 'e-Gazette of India', url: 'https://egazette.gov.in/' };
const ECI = { name: 'Election Commission of India', url: 'https://eci.gov.in/' };
const INDIA_CODE = { name: 'India Code (Acts of Parliament)', url: 'https://www.indiacode.nic.in/' };

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'reservation',
    term: { en: 'Reservation', hi: 'आरक्षण' },
    definition: {
      en: 'A share of government jobs, seats in public educational institutions and seats in legislatures set aside for groups the Constitution allows the state to favour, chiefly Scheduled Castes, Scheduled Tribes, Other Backward Classes and, since 2019, economically weaker sections. The power comes from Articles 15, 16, 330 and 332.',
      hi: 'सरकारी नौकरियों, सार्वजनिक शिक्षण संस्थानों की सीटों और विधायिकाओं की सीटों का वह हिस्सा जो उन समूहों के लिए अलग रखा जाता है जिन्हें संविधान सरकार को प्राथमिकता देने की अनुमति देता है, मुख्य रूप से अनुसूचित जातियाँ, अनुसूचित जनजातियाँ, अन्य पिछड़ा वर्ग और 2019 से आर्थिक रूप से कमज़ोर वर्ग। यह शक्ति अनुच्छेद 15, 16, 330 और 332 से आती है।',
    },
    match: { en: /\breservations?\b/i, hi: /आरक्षण/ },
    source: CONSTITUTION,
    answer: 'who-decides-reservation',
  },
  {
    id: 'scheduled-castes',
    term: { en: 'Scheduled Castes (SC)', hi: 'अनुसूचित जातियाँ (एससी)' },
    definition: {
      en: 'Communities listed by a Presidential order under Article 341, state by state. Only Parliament can add a community to or remove it from the list. The list for each state is separate, which is why SC status does not travel when a family moves.',
      hi: 'अनुच्छेद 341 के तहत राष्ट्रपति के आदेश से राज्यवार सूचीबद्ध समुदाय। किसी समुदाय को सूची में जोड़ने या हटाने का अधिकार केवल संसद को है। हर राज्य की सूची अलग है, इसीलिए परिवार के दूसरे राज्य जाने पर एससी दर्जा साथ नहीं जाता।',
    },
    match: { en: /\bScheduled Castes?\b/i, hi: /अनुसूचित जाति/ },
    source: CONSTITUTION,
    answer: 'caste-certificate-other-state',
  },
  {
    id: 'scheduled-tribes',
    term: { en: 'Scheduled Tribes (ST)', hi: 'अनुसूचित जनजातियाँ (एसटी)' },
    definition: {
      en: 'Communities listed by a Presidential order under Article 342, state by state. As with Scheduled Castes, only Parliament can change the list.',
      hi: 'अनुच्छेद 342 के तहत राष्ट्रपति के आदेश से राज्यवार सूचीबद्ध समुदाय। अनुसूचित जातियों की तरह, सूची केवल संसद बदल सकती है।',
    },
    match: { en: /\bScheduled Tribes?\b/i, hi: /अनुसूचित जनजाति/ },
    source: CONSTITUTION,
  },
  {
    id: 'obc',
    term: { en: 'Other Backward Classes (OBC)', hi: 'अन्य पिछड़ा वर्ग (ओबीसी)' },
    definition: {
      en: 'Socially and educationally backward classes other than Scheduled Castes and Tribes. There are two kinds of list: the Central List, used for central jobs and institutions, and each state’s own list, used for that state’s jobs and seats.',
      hi: 'अनुसूचित जातियों और जनजातियों के अलावा सामाजिक और शैक्षिक रूप से पिछड़े वर्ग। इनकी दो तरह की सूचियाँ हैं: केंद्रीय सूची, जो केंद्र की नौकरियों और संस्थानों के लिए है, और हर राज्य की अपनी सूची, जो उस राज्य की नौकरियों और सीटों के लिए है।',
    },
    match: { en: /\bOBCs?\b|Other Backward Class/i, hi: /ओबीसी|अन्य पिछड़ा वर्ग/ },
    source: NCBC,
    answer: 'check-central-obc-list',
  },
  {
    id: 'central-list',
    term: { en: 'Central List of OBCs', hi: 'ओबीसी की केंद्रीय सूची' },
    definition: {
      en: 'The list of OBC communities, state by state, that counts for central government jobs and central institutions. It is published by the National Commission for Backward Classes and can differ from a state’s own OBC list.',
      hi: 'राज्यवार ओबीसी समुदायों की वह सूची जो केंद्र सरकार की नौकरियों और केंद्रीय संस्थानों के लिए मान्य है। इसे राष्ट्रीय पिछड़ा वर्ग आयोग प्रकाशित करता है, और यह किसी राज्य की अपनी ओबीसी सूची से अलग हो सकती है।',
    },
    match: { en: /\bCentral List\b/i, hi: /केंद्रीय सूची/ },
    source: NCBC,
    answer: 'check-central-obc-list',
  },
  {
    id: 'creamy-layer',
    term: { en: 'Creamy layer', hi: 'क्रीमी लेयर' },
    definition: {
      en: 'The better-off section of OBC families, excluded from the OBC quota. The tests, set by the Department of Personnel and Training in office memorandum No. 36012/22/93-Estt.(SCT) of 8 September 1993, look at the parents’ posts and at income other than salary and farm income; the income limit has been ₹8 lakh a year since 1 September 2017.',
      hi: 'ओबीसी परिवारों का संपन्न हिस्सा, जो ओबीसी कोटे से बाहर रहता है। कार्मिक एवं प्रशिक्षण विभाग के 8 सितंबर 1993 के कार्यालय ज्ञापन सं. 36012/22/93-Estt.(SCT) में तय कसौटियाँ माता-पिता के पद और वेतन व खेती से इतर आय देखती हैं; आय सीमा 1 सितंबर 2017 से ₹8 लाख सालाना है।',
    },
    match: { en: /\bcreamy[- ]layer\b/i, hi: /क्रीमी लेयर/ },
    source: DOPT,
    answer: 'creamy-layer',
  },
  {
    id: 'non-creamy-layer-certificate',
    term: { en: 'Non-creamy-layer certificate', hi: 'नॉन-क्रीमी लेयर प्रमाणपत्र' },
    definition: {
      en: 'The OBC certificate that also states the holder is outside the creamy layer. Central jobs and institutions ask for it in the central format, issued by the state’s revenue authority.',
      hi: 'वह ओबीसी प्रमाणपत्र जो यह भी बताता है कि धारक क्रीमी लेयर से बाहर है। केंद्र की नौकरियाँ और संस्थान इसे केंद्रीय प्रारूप में माँगते हैं, जो राज्य का राजस्व प्राधिकारी जारी करता है।',
    },
    match: { en: /\bnon[- ]creamy[- ]layer\b/i, hi: /नॉन-क्रीमी/ },
    source: DOPT,
    answer: 'non-creamy-layer-certificate',
  },
  {
    id: 'ews',
    term: { en: 'Economically Weaker Sections (EWS)', hi: 'आर्थिक रूप से कमज़ोर वर्ग (ईडब्ल्यूएस)' },
    definition: {
      en: 'People not covered by SC, ST or OBC reservation who meet income and property limits. Up to 10% of seats and posts can be reserved for them under Articles 15(6) and 16(6), added by the 103rd Amendment in 2019. The Supreme Court upheld the quota 3:2 in Janhit Abhiyan v Union of India on 7 November 2022.',
      hi: 'एससी, एसटी या ओबीसी आरक्षण के दायरे से बाहर के वे लोग जो आय और संपत्ति की सीमाएँ पूरी करते हैं। 2019 में 103वें संशोधन से जोड़े गए अनुच्छेद 15(6) और 16(6) के तहत उनके लिए 10% तक सीटें और पद आरक्षित किए जा सकते हैं। सुप्रीम कोर्ट ने 7 नवंबर 2022 को जनहित अभियान बनाम भारत संघ में 3:2 से कोटे को सही ठहराया।',
    },
    match: { en: /\bEWS\b|economically weaker/i, hi: /ईडब्ल्यूएस|आर्थिक रूप से कमज़ोर/ },
    source: DOPT,
    answer: 'ews-eligibility',
  },
  {
    id: 'income-and-asset-certificate',
    term: { en: 'Income and Asset Certificate', hi: 'आय और संपत्ति प्रमाणपत्र' },
    definition: {
      en: 'The official name of the EWS certificate. It covers one financial year and, for central jobs and institutions, must be in the central format and issued by an officer of the rank of Tehsildar or above.',
      hi: 'ईडब्ल्यूएस प्रमाणपत्र का आधिकारिक नाम। यह एक वित्तीय वर्ष के लिए होता है और केंद्र की नौकरियों और संस्थानों के लिए केंद्रीय प्रारूप में, तहसीलदार या उससे ऊपर के अधिकारी द्वारा जारी होना चाहिए।',
    },
    match: { en: /Income and Asset Certificate/i, hi: /आय और संपत्ति प्रमाणपत्र/ },
    source: DOPT,
    answer: 'ews-certificate',
  },
  {
    id: 'fifty-percent-ceiling',
    term: { en: 'The 50% ceiling', hi: '50% की सीमा' },
    definition: {
      en: 'The rule from Indra Sawhney (1992) that reservation should not normally exceed half the seats or posts, save in extraordinary situations. The Supreme Court reaffirmed it unanimously when it struck down the Maratha quota in Jaishri Laxmanrao Patil on 5 May 2021; after Janhit Abhiyan (7 November 2022), the EWS quota sits outside it.',
      hi: 'इंद्रा साहनी (1992) से निकला नियम कि असाधारण स्थितियों को छोड़कर आरक्षण सामान्यतः आधी सीटों या पदों से ज़्यादा नहीं होना चाहिए। सुप्रीम कोर्ट ने 5 मई 2021 को जयश्री लक्ष्मणराव पाटिल मामले में मराठा कोटा रद्द करते हुए इसे सर्वसम्मति से दोहराया; जनहित अभियान (7 नवंबर 2022) के बाद ईडब्ल्यूएस कोटा इसके बाहर है।',
    },
    match: { en: /50\s?(%|per ?cent) (ceiling|cap|limit)|fifty per ?cent/i, hi: /50% की (सीमा|हद)/ },
    source: SCI,
    answer: 'fifty-percent-ceiling',
  },
  {
    id: 'indra-sawhney',
    term: { en: 'Indra Sawhney judgment (1992)', hi: 'इंद्रा साहनी फ़ैसला (1992)' },
    definition: {
      en: 'The nine-judge Supreme Court judgment of 16 November 1992 that upheld OBC reservation in central jobs after the Mandal Commission, required the creamy layer to be excluded, and set the 50% ceiling. It is still the starting point for almost every reservation case.',
      hi: 'सुप्रीम कोर्ट की नौ जजों की पीठ का 16 नवंबर 1992 का फ़ैसला, जिसने मंडल आयोग के बाद केंद्र की नौकरियों में ओबीसी आरक्षण को सही ठहराया, क्रीमी लेयर को बाहर करना ज़रूरी किया और 50% की सीमा तय की। लगभग हर आरक्षण मामले की शुरुआत आज भी यहीं से होती है।',
    },
    match: { en: /Indra Sawhney/i, hi: /इंद्रा साहनी/ },
    source: SCI,
  },
  {
    id: 'mandal-commission',
    term: { en: 'Mandal Commission', hi: 'मंडल आयोग' },
    definition: {
      en: 'The Second Backward Classes Commission, chaired by B. P. Mandal, which reported in 1980 and recommended 27% reservation for OBCs in central jobs. The government implemented it by an office memorandum of 13 August 1990, and the Supreme Court upheld it in Indra Sawhney.',
      hi: 'बी. पी. मंडल की अध्यक्षता वाला दूसरा पिछड़ा वर्ग आयोग, जिसने 1980 में रिपोर्ट दी और केंद्र की नौकरियों में ओबीसी के लिए 27% आरक्षण की सिफ़ारिश की। सरकार ने इसे 13 अगस्त 1990 के कार्यालय ज्ञापन से लागू किया, और सुप्रीम कोर्ट ने इंद्रा साहनी में इसे सही ठहराया।',
    },
    match: { en: /\bMandal\b/i, hi: /मंडल/ },
    source: NCBC,
    answer: 'mandal-commission',
  },
  {
    id: 'rohini-commission',
    term: { en: 'Rohini Commission', hi: 'रोहिणी आयोग' },
    definition: {
      en: 'The commission set up under Article 340 on 2 October 2017, chaired by Justice G. Rohini, to examine sub-categorisation of the Central List of OBCs. It submitted its report to the President on 31 July 2023; the report has not been made public.',
      hi: '2 अक्टूबर 2017 को अनुच्छेद 340 के तहत गठित आयोग, जिसकी अध्यक्षता जस्टिस जी. रोहिणी ने की, ताकि ओबीसी की केंद्रीय सूची के उप-वर्गीकरण की जाँच हो सके। उसने 31 जुलाई 2023 को राष्ट्रपति को रिपोर्ट सौंपी; रिपोर्ट सार्वजनिक नहीं की गई है।',
    },
    match: { en: /Rohini/i, hi: /रोहिणी/ },
    source: NCBC,
    answer: 'rohini-commission',
  },
  {
    id: 'sub-classification',
    term: { en: 'Sub-classification', hi: 'उप-वर्गीकरण' },
    definition: {
      en: 'Dividing a reserved category into groups so that a share of its quota goes to the less advantaged within it. In State of Punjab v Davinder Singh, decided on 1 August 2024, a seven-judge bench held 6:1 that states may sub-classify Scheduled Castes, overruling E. V. Chinnaiah (2005).',
      hi: 'किसी आरक्षित श्रेणी को समूहों में बाँटना ताकि उसके कोटे का एक हिस्सा उसके भीतर के कम सुविधा-प्राप्त लोगों को मिले। 1 अगस्त 2024 को पंजाब राज्य बनाम दविंदर सिंह में सात जजों की पीठ ने 6:1 से कहा कि राज्य अनुसूचित जातियों का उप-वर्गीकरण कर सकते हैं, और ई. वी. चिन्नैया (2005) का फ़ैसला पलट दिया।',
    },
    match: { en: /sub-?classif|sub-?categori/i, hi: /उप-वर्गीकरण/ },
    source: { name: 'Supreme Court of India: judgment in State of Punjab v Davinder Singh (1 August 2024)', url: 'https://api.sci.gov.in/supremecourt/2010/25536/25536_2010_1_1501_54462_Judgement_01-Aug-2024.pdf' },
    answer: 'sc-sub-classification',
  },
  {
    id: 'ninth-schedule',
    term: { en: 'Ninth Schedule', hi: 'नौवीं अनुसूची' },
    definition: {
      en: 'A list of laws in the Constitution that Article 31B shields from challenge for violating fundamental rights. In I. R. Coelho, decided on 11 January 2007, a nine-judge bench of the Supreme Court held that laws placed there after 24 April 1973 can still be tested against the basic structure.',
      hi: 'संविधान में क़ानूनों की एक सूची, जिन्हें अनुच्छेद 31B मौलिक अधिकारों के उल्लंघन की चुनौती से बचाता है। 11 जनवरी 2007 को आई. आर. कोएल्हो मामले में सुप्रीम कोर्ट की नौ जजों की पीठ ने कहा कि 24 अप्रैल 1973 के बाद वहाँ रखे गए क़ानूनों को मूल ढाँचे की कसौटी पर अब भी परखा जा सकता है।',
    },
    match: { en: /Ninth Schedule/i, hi: /नौवीं अनुसूची/ },
    source: { name: 'Supreme Court Reports: I. R. Coelho v State of Tamil Nadu (11 January 2007)', url: 'https://digiscr.sci.gov.in/admin/judgement_file/judgement_pdf/2007/volume%201/Part%20I/I.%20R.%20Coelho%20%28dead%29%20By%20Lrs.%20_%20State%20Of%20Tamil%20Nadu_1701772013.pdf' },
    answer: 'ninth-schedule',
  },
  {
    id: 'stay',
    term: { en: 'Stay (court order)', hi: 'रोक (अदालती आदेश)' },
    definition: {
      en: 'A temporary court order that stops a law, rule or decision from operating while the case is heard. A stayed law is not struck down: it is suspended, and can return if the stay is lifted.',
      hi: 'अदालत का अस्थायी आदेश, जो मामले की सुनवाई के दौरान किसी क़ानून, नियम या फ़ैसले को लागू होने से रोकता है। रोका गया क़ानून रद्द नहीं होता: वह निलंबित रहता है, और रोक हटने पर लौट सकता है।',
    },
    match: { en: /\bstayed\b|\bstay (order|on|of)\b/i, hi: /रोक लगा|रोक दी|रोक आदेश|स्थगन|रोका गया/ },
    source: SCI,
    answer: 'stay-vs-struck-down',
  },
  {
    id: 'struck-down',
    term: { en: 'Struck down', hi: 'रद्द (असंवैधानिक घोषित)' },
    definition: {
      en: 'Declared unconstitutional or invalid by a court in its final decision, so that the law or rule has no effect. Only a later judgment or a new law can change that.',
      hi: 'अदालत के अंतिम फ़ैसले में असंवैधानिक या अमान्य घोषित, जिससे क़ानून या नियम का कोई असर नहीं रहता। इसे केवल बाद का फ़ैसला या नया क़ानून बदल सकता है।',
    },
    match: { en: /struck down|strike down/i, hi: /रद्द कर|असंवैधानिक घोषित/ },
    source: SCI,
    answer: 'stay-vs-struck-down',
  },
  {
    id: 'constitution-bench',
    term: { en: 'Constitution Bench', hi: 'संविधान पीठ' },
    definition: {
      en: 'A Supreme Court bench of at least five judges, which Article 145(3) requires for cases involving a substantial question of interpreting the Constitution.',
      hi: 'सुप्रीम कोर्ट की कम से कम पाँच जजों की पीठ, जो अनुच्छेद 145(3) के तहत संविधान की व्याख्या के महत्वपूर्ण सवाल वाले मामलों के लिए ज़रूरी है।',
    },
    match: { en: /Constitution Bench/i, hi: /संविधान पीठ/ },
    source: SCI,
  },
  {
    id: 'pil',
    term: { en: 'Public interest litigation (PIL)', hi: 'जनहित याचिका (पीआईएल)' },
    definition: {
      en: 'A case filed in a High Court (Article 226) or the Supreme Court (Article 32) to protect the rights of the public or a group, by someone who need not be personally affected.',
      hi: 'किसी हाई कोर्ट (अनुच्छेद 226) या सुप्रीम कोर्ट (अनुच्छेद 32) में जनता या किसी समूह के अधिकारों की रक्षा के लिए दायर मामला, जिसे दायर करने वाले का ख़ुद प्रभावित होना ज़रूरी नहीं।',
    },
    match: { en: /\bPIL\b|public interest litigation/i, hi: /जनहित याचिका/ },
    source: SCI,
    answer: 'file-a-pil',
  },
  {
    id: 'rti',
    term: { en: 'Right to Information (RTI)', hi: 'सूचना का अधिकार (आरटीआई)' },
    definition: {
      en: 'The right, under the Right to Information Act, 2005, to ask a public authority for information it holds. It must normally reply within 30 days, and can refuse only on the grounds the Act lists.',
      hi: 'सूचना का अधिकार अधिनियम, 2005 के तहत किसी सार्वजनिक प्राधिकरण से उसके पास मौजूद जानकारी माँगने का अधिकार। उसे आमतौर पर 30 दिनों में जवाब देना होता है, और वह केवल अधिनियम में गिनाए गए आधारों पर इनकार कर सकता है।',
    },
    match: { en: /\bRTI\b|Right to Information/i, hi: /आरटीआई|सूचना का अधिकार/ },
    source: RTI,
    answer: 'how-to-file-an-rti',
  },
  {
    id: 'gazette-notification',
    term: { en: 'Gazette notification', hi: 'राजपत्र अधिसूचना' },
    definition: {
      en: 'Publication in the official Gazette of India or a state gazette. Many Acts, rules and orders take legal effect only from the date they are notified there.',
      hi: 'भारत के राजपत्र या किसी राज्य के राजपत्र में आधिकारिक प्रकाशन। कई अधिनियम, नियम और आदेश वहाँ अधिसूचित होने की तारीख़ से ही क़ानूनी रूप से लागू होते हैं।',
    },
    match: { en: /\bgazette\b|\bnotified\b/i, hi: /राजपत्र|अधिसूचित/ },
    source: GAZETTE,
    answer: 'find-the-gazette',
  },
  {
    id: 'office-memorandum',
    term: { en: 'Office memorandum (OM)', hi: 'कार्यालय ज्ञापन' },
    definition: {
      en: 'An executive instruction issued by a ministry or department. Most of the detailed rules on central reservation, such as the creamy-layer and EWS tests, are set by office memoranda of the Department of Personnel and Training, not by Acts of Parliament.',
      hi: 'किसी मंत्रालय या विभाग का कार्यकारी निर्देश। केंद्र के आरक्षण के ज़्यादातर विस्तृत नियम, जैसे क्रीमी लेयर और ईडब्ल्यूएस की कसौटियाँ, संसद के अधिनियमों से नहीं, कार्मिक एवं प्रशिक्षण विभाग के कार्यालय ज्ञापनों से तय होते हैं।',
    },
    match: { en: /office memorand/i, hi: /कार्यालय ज्ञापन/ },
    source: DOPT,
  },
  {
    id: 'ordinance',
    term: { en: 'Ordinance', hi: 'अध्यादेश' },
    definition: {
      en: 'A temporary law made by the President (Article 123) or a Governor (Article 213) when the legislature is not in session. It lapses six weeks after the legislature reassembles unless replaced by an Act.',
      hi: 'राष्ट्रपति (अनुच्छेद 123) या राज्यपाल (अनुच्छेद 213) द्वारा बनाया गया अस्थायी क़ानून, जब विधायिका का सत्र न चल रहा हो। विधायिका के दोबारा बैठने के छह हफ़्ते बाद यह समाप्त हो जाता है, जब तक कि इसकी जगह कोई अधिनियम न आ जाए।',
    },
    match: { en: /\bordinances?\b/i, hi: /अध्यादेश/ },
    source: CONSTITUTION,
    answer: 'ordinance',
  },
  {
    id: 'delimitation',
    term: { en: 'Delimitation', hi: 'परिसीमन' },
    definition: {
      en: 'Redrawing the boundaries of parliamentary and assembly constituencies and deciding which are reserved for SCs and STs. The current constituencies come from the 2008 delimitation, based on the 2001 census.',
      hi: 'संसदीय और विधानसभा क्षेत्रों की सीमाएँ दोबारा खींचना और तय करना कि कौन-से क्षेत्र एससी और एसटी के लिए आरक्षित होंगे। मौजूदा क्षेत्र 2001 की जनगणना पर आधारित 2008 के परिसीमन से बने हैं।',
    },
    match: { en: /delimitation/i, hi: /परिसीमन/ },
    source: ECI,
    answer: 'reserved-seats-parliament',
  },
  {
    id: 'caste-census',
    term: { en: 'Caste census', hi: 'जातिगत जनगणना' },
    definition: {
      en: 'Counting the population by caste in the national census. Censuses since 1951 have counted only Scheduled Castes and Tribes; the 2011 Socio Economic and Caste Census collected caste data whose caste tables were never released. The government has announced that the next census will enumerate caste.',
      hi: 'राष्ट्रीय जनगणना में आबादी की जाति के हिसाब से गिनती। 1951 से जनगणनाओं ने केवल अनुसूचित जातियों और जनजातियों की गिनती की है; 2011 की सामाजिक-आर्थिक और जाति जनगणना ने जाति के आँकड़े जुटाए, जिनकी जाति तालिकाएँ कभी जारी नहीं हुईं। सरकार ने घोषणा की है कि अगली जनगणना में जाति की गिनती होगी।',
    },
    match: { en: /caste census|caste enumeration|count caste/i, hi: /जातिगत जनगणना|जाति जनगणना|जाति की गिनती/ },
    source: { name: 'Census of India (Office of the Registrar General)', url: 'https://censusindia.gov.in/' },
    answer: 'caste-census-when',
  },
  {
    id: 'act-of-parliament',
    term: { en: 'Act of Parliament', hi: 'संसद का अधिनियम' },
    definition: {
      en: 'A law passed by both Houses of Parliament and assented to by the President. Acts can be read in full on India Code; many take effect only when the government notifies a start date.',
      hi: 'संसद के दोनों सदनों से पारित और राष्ट्रपति की स्वीकृति प्राप्त क़ानून। अधिनियम इंडिया कोड पर पूरे पढ़े जा सकते हैं; कई तभी लागू होते हैं जब सरकार उनकी शुरुआत की तारीख़ अधिसूचित करती है।',
    },
    match: { en: /\bAct, (19|20)\d\d\b|Act of Parliament/, hi: /अधिनियम, (19|20)\d\d|संसद (का|के) अधिनियम/ },
    source: INDIA_CODE,
    answer: 'how-a-bill-becomes-law',
  },
];

/** Terms in alphabetical order for one edition; shared by the app and the page server. */
export function glossarySorted(lang: 'en' | 'hi') {
  return [...GLOSSARY].sort((a, b) => a.term[lang].localeCompare(b.term[lang], lang));
}

export const glossaryTerm = (id: string) => GLOSSARY.find((item) => item.id === id);

/** The glossary terms a text uses, in glossary order. */
export function termsIn(text: string, lang: 'en' | 'hi', limit = 8) {
  return GLOSSARY.filter((item) => item.match[lang].test(text)).slice(0, limit);
}
