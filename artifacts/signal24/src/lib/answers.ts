/**
 * Answers: plain-language, sourced answers to the questions people actually ask about
 * the Indian state. Each has a short answer, the hard truth, what you can do, and the
 * official sources. Statutory details (sections, deadlines, fees) restate the Acts and
 * official portals linked; re-check them whenever ANSWERS_CHECKED_ON changes.
 */
import type { Bilingual } from './key-figures';
import { ANSWERS_MORE_A } from './answers-more-a';
import { ANSWERS_MORE_B } from './answers-more-b';

export type AnswerCategory = 'rti' | 'reservation' | 'courts' | 'parliament' | 'data' | 'complaints';

export type Answer = {
  id: string;
  category: AnswerCategory;
  question: Bilingual;
  short: Bilingual;
  truth: Bilingual;
  steps: { en: string[]; hi: string[] };
  sources: Array<{ name: string; url: string }>;
  related?: string[];
};

export const ANSWERS_CHECKED_ON = '2026-11-10';

export const ANSWER_CATEGORIES: Array<{ id: AnswerCategory; label: Bilingual; blurb: Bilingual }> = [
  { id: 'rti', label: { en: 'Right to information', hi: 'सूचना का अधिकार' }, blurb: { en: 'Make the state show you its files.', hi: 'सरकार से उसकी फ़ाइलें दिखवाइए।' } },
  { id: 'reservation', label: { en: 'Reservation, plainly', hi: 'आरक्षण, सीधी भाषा में' }, blurb: { en: 'Who decides, who qualifies, and where the limits are.', hi: 'कौन तय करता है, कौन पात्र है, और सीमाएँ कहाँ हैं।' } },
  { id: 'courts', label: { en: 'Courts, decoded', hi: 'अदालतें, आसान भाषा में' }, blurb: { en: 'What an order actually means, and how to go to court.', hi: 'किसी आदेश का असल मतलब, और अदालत कैसे जाएँ।' } },
  { id: 'parliament', label: { en: 'Parliament and laws', hi: 'संसद और क़ानून' }, blurb: { en: 'How rules are made, and how to make your MP ask.', hi: 'नियम कैसे बनते हैं, और अपने सांसद से कैसे पुछवाएँ।' } },
  { id: 'data', label: { en: 'Data and the census', hi: 'आंकड़े और जनगणना' }, blurb: { en: 'Where the numbers are, and which ones are missing.', hi: 'आंकड़े कहाँ हैं, और कौन-से ग़ायब हैं।' } },
  { id: 'complaints', label: { en: 'Complaints and remedies', hi: 'शिकायत और उपाय' }, blurb: { en: 'Where to go when the system fails you.', hi: 'जब व्यवस्था साथ न दे, तो कहाँ जाएँ।' } },
];

const RTI_ONLINE = { name: 'RTI Online (central public authorities)', url: 'https://rtionline.gov.in/' };
const CIC = { name: 'Central Information Commission', url: 'https://cic.gov.in/' };
const CONSTITUTION = { name: 'Constitution of India', url: 'https://legislative.gov.in/constitution-of-india/' };
const DOPT = { name: 'Department of Personnel and Training', url: 'https://dopt.gov.in/' };
const SCI = { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/' };
const SANSAD = { name: 'Digital Sansad (Parliament)', url: 'https://sansad.in/' };

/** The original twenty answers; ANSWERS below adds the later batches. */
const ANSWERS_BASE: Answer[] = [
  {
    id: 'how-to-file-an-rti',
    category: 'rti',
    question: { en: 'How do I file an RTI application?', hi: 'आरटीआई आवेदन कैसे दाख़िल करें?' },
    short: {
      en: 'Write to the Public Information Officer of the office that holds the information. For central government bodies you can file online at rtionline.gov.in with a ₹10 fee; states set their own fees and portals. Applicants below the poverty line pay no fee, and you never have to say why you want the information.',
      hi: 'जिस दफ़्तर के पास जानकारी है, उसके जन सूचना अधिकारी को लिखिए। केंद्र सरकार के निकायों के लिए rtionline.gov.in पर ₹10 शुल्क के साथ ऑनलाइन आवेदन कर सकते हैं; राज्य अपने शुल्क और पोर्टल तय करते हैं। गरीबी रेखा से नीचे के आवेदकों को शुल्क नहीं देना होता, और आपको कभी यह बताना ज़रूरी नहीं कि जानकारी क्यों चाहिए।',
    },
    truth: {
      en: 'The Act is strong; the habit of answering is weak. Vague questions get vague replies, and offices count on you giving up. Ask for specific documents and file notings, not opinions.',
      hi: 'क़ानून मज़बूत है; जवाब देने की आदत कमज़ोर। अस्पष्ट सवालों पर अस्पष्ट जवाब मिलते हैं, और दफ़्तर मानकर चलते हैं कि आप थक जाएँगे। राय नहीं, ठोस दस्तावेज़ और फ़ाइल नोटिंग माँगिए।',
    },
    steps: {
      en: ['Identify the exact office (ministry, department, university) that holds the file.', 'Ask for documents: “certified copies of…”, “file notings on…”, “the number of…”, with dates.', 'File online for central bodies, or by post to the PIO with the fee for states.', 'Keep the registration number or postal receipt. The 30-day clock starts on receipt.'],
      hi: ['ठीक वह दफ़्तर पहचानिए (मंत्रालय, विभाग, विश्वविद्यालय) जिसके पास फ़ाइल है।', 'दस्तावेज़ माँगिए: “…की प्रमाणित प्रतियाँ”, “…पर फ़ाइल नोटिंग”, “…की संख्या”, तारीख़ों के साथ।', 'केंद्रीय निकायों के लिए ऑनलाइन, राज्यों के लिए शुल्क के साथ डाक से जन सूचना अधिकारी को भेजिए।', 'पंजीकरण संख्या या डाक रसीद सँभालिए। 30 दिन की गिनती आवेदन मिलने से शुरू होती है।'],
    },
    sources: [RTI_ONLINE, CIC],
    related: ['rti-no-reply', 'what-rti-can-refuse'],
  },
  {
    id: 'rti-no-reply',
    category: 'rti',
    question: { en: 'They didn’t reply to my RTI in 30 days. Now what?', hi: '30 दिन में आरटीआई का जवाब नहीं आया। अब क्या?' },
    short: {
      en: 'No reply within 30 days counts as refusal. File a first appeal with the First Appellate Authority, a senior officer in the same office, within 30 days. If that fails, file a second appeal with the Central or State Information Commission within 90 days. For information about someone’s life or liberty, the deadline is 48 hours.',
      hi: '30 दिन में जवाब न आना इनकार माना जाता है। 30 दिन के भीतर उसी दफ़्तर के वरिष्ठ अधिकारी, यानी प्रथम अपीलीय अधिकारी, के पास पहली अपील कीजिए। उससे बात न बने तो 90 दिन के भीतर केंद्रीय या राज्य सूचना आयोग में दूसरी अपील कीजिए। किसी के जीवन या स्वतंत्रता से जुड़ी जानकारी के लिए समय-सीमा 48 घंटे है।',
    },
    truth: {
      en: 'Information commissions can fine an officer up to ₹25,000 for refusing without reason, but appeals can take months, and several commissions have run for long periods with vacant posts. The law gives you leverage only if you keep using it.',
      hi: 'सूचना आयोग बिना कारण इनकार करने पर अधिकारी पर ₹25,000 तक जुर्माना लगा सकते हैं, पर अपीलों में महीनों लग सकते हैं, और कई आयोग लंबे समय तक ख़ाली पदों के साथ चलते रहे हैं। क़ानून तभी ताक़त देता है जब आप उसका इस्तेमाल करते रहें।',
    },
    steps: {
      en: ['Write the first appeal: your application date, registration number, what you asked, and that no reply came.', 'Send it to the First Appellate Authority named on the office’s RTI page.', 'If the appeal is ignored or rejected, file the second appeal with the Information Commission and ask for a penalty.', 'Keep copies of everything. The paper trail is your case.'],
      hi: ['पहली अपील लिखिए: आवेदन की तारीख़, पंजीकरण संख्या, क्या माँगा था, और कि जवाब नहीं आया।', 'दफ़्तर के आरटीआई पेज पर नामित प्रथम अपीलीय अधिकारी को भेजिए।', 'अपील अनसुनी या ख़ारिज हो तो सूचना आयोग में दूसरी अपील कीजिए और जुर्माने की माँग कीजिए।', 'हर चीज़ की प्रति रखिए। काग़ज़ों की कड़ी ही आपका मुक़दमा है।'],
    },
    sources: [CIC, RTI_ONLINE],
    related: ['how-to-file-an-rti', 'what-rti-can-refuse'],
  },
  {
    id: 'what-rti-can-refuse',
    category: 'rti',
    question: { en: 'What can the government refuse to tell me under RTI?', hi: 'आरटीआई में सरकार क्या बताने से मना कर सकती है?' },
    short: {
      en: 'Section 8 of the RTI Act lists the exemptions: national security, information a court has forbidden, breach of legislative privilege, commercial confidence, information held in trust, information that would endanger someone or impede an investigation, Cabinet papers until a decision is taken, and personal information with no public interest. Even then, Section 8(2) allows disclosure when the public interest outweighs the harm.',
      hi: 'आरटीआई अधिनियम की धारा 8 छूटें गिनाती है: राष्ट्रीय सुरक्षा, अदालत द्वारा रोकी गई जानकारी, विधायी विशेषाधिकार का उल्लंघन, व्यावसायिक गोपनीयता, भरोसे में रखी गई जानकारी, किसी की जान को ख़तरा या जाँच में बाधा डालने वाली जानकारी, फ़ैसला होने तक कैबिनेट काग़ज़, और बिना जनहित वाली निजी जानकारी। तब भी धारा 8(2) जनहित नुक़सान से भारी होने पर जानकारी देने की इजाज़त देती है।',
    },
    truth: {
      en: '“Fiduciary relationship” and “personal information” are the most stretched words in Indian administration. A refusal must name the specific exemption and explain it. A bare section number is grounds for appeal.',
      hi: '“भरोसे का संबंध” और “निजी जानकारी” भारतीय प्रशासन के सबसे ज़्यादा खींचे जाने वाले शब्द हैं। इनकार में ठीक कौन-सी छूट लागू है और क्यों, यह बताना होता है। सिर्फ़ धारा संख्या लिख देना अपील का आधार है।',
    },
    steps: {
      en: ['Read the refusal: does it name a clause of Section 8 and explain how it applies?', 'If a decision has already been taken, Cabinet papers are disclosable under Section 8(1)(i). Say so.', 'Argue public interest under Section 8(2) in your appeal.', 'Ask for partial disclosure under Section 10: exempt parts can be removed and the rest released.'],
      hi: ['इनकार पढ़िए: क्या उसमें धारा 8 का कोई खंड और उसके लागू होने की वजह बताई गई है?', 'अगर फ़ैसला हो चुका है, तो धारा 8(1)(i) के तहत कैबिनेट काग़ज़ दिए जा सकते हैं। यह लिखिए।', 'अपील में धारा 8(2) के तहत जनहित की दलील दीजिए।', 'धारा 10 के तहत आंशिक जानकारी माँगिए: छूट वाले हिस्से हटाकर बाक़ी दिया जा सकता है।'],
    },
    sources: [CIC, RTI_ONLINE],
    related: ['rti-no-reply'],
  },
  {
    id: 'who-decides-reservation',
    category: 'reservation',
    question: { en: 'Who decides which communities get reservation?', hi: 'कौन तय करता है कि किन समुदायों को आरक्षण मिलेगा?' },
    short: {
      en: 'Scheduled Caste and Scheduled Tribe lists are notified by the President under Articles 341 and 342 and can be changed only by Parliament. The central OBC list is maintained by the Union government with the National Commission for Backward Classes. Since the 105th Amendment in 2021, states again keep their own backward-class lists. Central quotas are 15% for SC, 7.5% for ST, 27% for OBC and up to 10% for EWS; states set their own.',
      hi: 'अनुसूचित जाति और जनजाति की सूचियाँ राष्ट्रपति अनुच्छेद 341 और 342 के तहत अधिसूचित करते हैं और उन्हें केवल संसद बदल सकती है। केंद्रीय ओबीसी सूची केंद्र सरकार राष्ट्रीय पिछड़ा वर्ग आयोग के साथ रखती है। 2021 के 105वें संशोधन के बाद राज्य फिर से अपनी पिछड़ा वर्ग सूचियाँ रखते हैं। केंद्र में कोटा एससी 15%, एसटी 7.5%, ओबीसी 27% और ईडब्ल्यूएस 10% तक है; राज्य अपना तय करते हैं।',
    },
    truth: {
      en: 'The lists are changed often and reviewed rarely. There is no annual public report on who in each list actually benefits, which is why the Rohini Commission was needed, and why its unpublished report matters.',
      hi: 'सूचियाँ अक्सर बदली जाती हैं और शायद ही कभी जाँची जाती हैं। हर सूची में असल में किसे लाभ मिलता है, इस पर कोई वार्षिक सार्वजनिक रिपोर्ट नहीं है, इसीलिए रोहिणी आयोग की ज़रूरत पड़ी, और इसीलिए उसकी अप्रकाशित रिपोर्ट अहम है।',
    },
    steps: {
      en: ['Check the central OBC list for your state on the NCBC website.', 'Check your state’s own list in its official gazette or social welfare department website.', 'Remember: the central list decides central jobs and institutions; the state list decides state ones.'],
      hi: ['एनसीबीसी की वेबसाइट पर अपने राज्य की केंद्रीय ओबीसी सूची देखिए।', 'राज्य के राजपत्र या समाज कल्याण विभाग की वेबसाइट पर उसकी अपनी सूची देखिए।', 'याद रखिए: केंद्रीय सूची केंद्र की नौकरियाँ और संस्थान तय करती है; राज्य सूची राज्य वाले।'],
    },
    sources: [CONSTITUTION, { name: 'National Commission for Backward Classes', url: 'https://ncbc.nic.in/' }],
    related: ['creamy-layer', 'fifty-percent-ceiling', 'check-central-obc-list', 'mandal-commission'],
  },
  {
    id: 'creamy-layer',
    category: 'reservation',
    question: { en: 'What is the creamy layer, and am I in it?', hi: 'क्रीमी लेयर क्या है, और क्या मैं उसमें हूँ?' },
    short: {
      en: 'The creamy layer is the better-off section of OBC families, excluded from the OBC quota. Under the Department of Personnel and Training’s rules, a family is in it if its gross annual income is ₹8 lakh or more for three consecutive years, not counting income from salaries and agricultural land; separate tests apply by the rank of parents in government service.',
      hi: 'क्रीमी लेयर ओबीसी परिवारों का संपन्न हिस्सा है, जो ओबीसी कोटे से बाहर रहता है। कार्मिक एवं प्रशिक्षण विभाग के नियमों के तहत परिवार इसमें है अगर लगातार तीन साल उसकी सकल वार्षिक आय ₹8 लाख या ज़्यादा है, वेतन और कृषि भूमि से आय गिने बिना; सरकारी सेवा में माता-पिता के पद के हिसाब से अलग कसौटियाँ लागू होती हैं।',
    },
    truth: {
      en: 'The ₹8 lakh line was set in 2017 and has not moved since, though a parliamentary committee called revision the need of the hour in 2025. Every year it is not revised, inflation quietly pushes more families out of the quota.',
      hi: '₹8 लाख की रेखा 2017 में तय हुई और तब से नहीं हिली, जबकि 2025 में एक संसदीय समिति ने संशोधन को समय की ज़रूरत बताया। हर साल जब यह नहीं बदलती, महँगाई चुपचाप और परिवारों को कोटे से बाहर धकेल देती है।',
    },
    steps: {
      en: ['Work out gross income for each of the last three years, excluding salary and agricultural income.', 'Check your parents’ service rank against the DoPT criteria if either is a government servant.', 'Get a non-creamy-layer certificate in the central format if you apply for central posts or institutions.', 'Check the certificate date against the recruitment notice’s cut-off.'],
      hi: ['पिछले तीन साल में हर साल की सकल आय निकालिए, वेतन और कृषि आय को छोड़कर।', 'अगर माता-पिता में कोई सरकारी कर्मचारी है, तो उनके पद को डीओपीटी कसौटियों से मिलाइए।', 'केंद्रीय पदों या संस्थानों में आवेदन के लिए केंद्रीय प्रारूप में नॉन-क्रीमी लेयर प्रमाणपत्र लीजिए।', 'प्रमाणपत्र की तारीख़ को भर्ती सूचना की कट-ऑफ़ से मिलाइए।'],
    },
    sources: [DOPT],
    related: ['ews-eligibility', 'who-decides-reservation', 'non-creamy-layer-certificate', 'creamy-layer-sc-st'],
  },
  {
    id: 'ews-eligibility',
    category: 'reservation',
    question: { en: 'Who qualifies for the EWS quota?', hi: 'ईडब्ल्यूएस कोटे के लिए कौन पात्र है?' },
    short: {
      en: 'People not covered by SC, ST or OBC reservation whose family income from all sources was below ₹8 lakh in the previous financial year, and whose family does not own 5 acres or more of agricultural land, a residential flat of 1,000 sq ft or more, or a residential plot of the set size or more (100 sq yards in notified municipalities, 200 sq yards elsewhere). The certificate comes from a designated revenue officer.',
      hi: 'वे लोग जो एससी, एसटी या ओबीसी आरक्षण में नहीं आते, जिनके परिवार की पिछले वित्त वर्ष में सभी स्रोतों से आय ₹8 लाख से कम थी, और जिनके परिवार के पास 5 एकड़ या ज़्यादा कृषि भूमि, 1,000 वर्ग फ़ुट या बड़ा आवासीय फ़्लैट, या तय आकार या उससे बड़ा आवासीय प्लॉट (अधिसूचित नगरपालिकाओं में 100 वर्ग गज़, दूसरी जगह 200 वर्ग गज़) नहीं है। प्रमाणपत्र नामित राजस्व अधिकारी देता है।',
    },
    truth: {
      en: 'The government has never published an estimate of how many families meet this test, even though the size of the quota rests on it. The Supreme Court upheld the quota 3:2; the dissent objected to excluding poor SC, ST and OBC families from it.',
      hi: 'सरकार ने कभी यह अनुमान प्रकाशित नहीं किया कि कितने परिवार यह कसौटी पूरी करते हैं, जबकि कोटे का आकार इसी पर टिका है। सुप्रीम कोर्ट ने कोटा 3:2 से बरक़रार रखा; असहमति ने गरीब एससी, एसटी और ओबीसी परिवारों को इससे बाहर रखने पर आपत्ति की।',
    },
    steps: {
      en: ['Check income for the financial year before your application year, from all sources.', 'Check every family-owned property against the asset exclusions.', 'Apply to the Tehsildar or designated officer with income and property documents.', 'Match the certificate’s financial year to the one your recruitment notice asks for.'],
      hi: ['आवेदन वाले साल से पहले के वित्त वर्ष की, सभी स्रोतों से, आय देखिए।', 'परिवार की हर संपत्ति को संपत्ति बहिष्कारों से मिलाइए।', 'आय और संपत्ति के दस्तावेज़ों के साथ तहसीलदार या नामित अधिकारी को आवेदन कीजिए।', 'प्रमाणपत्र का वित्त वर्ष भर्ती सूचना में माँगे गए वित्त वर्ष से मिलाइए।'],
    },
    sources: [DOPT, SCI],
    related: ['creamy-layer', 'ews-certificate'],
  },
  {
    id: 'get-a-caste-certificate',
    category: 'reservation',
    question: { en: 'How do I get a caste certificate?', hi: 'जाति प्रमाणपत्र कैसे बनवाएँ?' },
    short: {
      en: 'Caste certificates are issued by your state’s revenue authorities, usually a Tehsildar, Sub-Divisional Magistrate or other designated officer, and most states now take applications through their online public-service portals. You typically need proof of residence and proof of your family’s caste, such as a parent’s certificate or school records. For central jobs and institutions, OBC candidates need the certificate in the central format, which also covers non-creamy-layer status.',
      hi: 'जाति प्रमाणपत्र आपके राज्य के राजस्व अधिकारी जारी करते हैं, आम तौर पर तहसीलदार, उप-मंडल मजिस्ट्रेट या कोई और नामित अधिकारी, और ज़्यादातर राज्य अब अपने ऑनलाइन जन-सेवा पोर्टलों से आवेदन लेते हैं। आम तौर पर निवास का सबूत और परिवार की जाति का सबूत चाहिए, जैसे माता-पिता का प्रमाणपत्र या स्कूल रिकॉर्ड। केंद्र की नौकरियों और संस्थानों के लिए ओबीसी उम्मीदवारों को केंद्रीय प्रारूप में प्रमाणपत्र चाहिए, जिसमें नॉन-क्रीमी लेयर स्थिति भी शामिल होती है।',
    },
    truth: {
      en: 'The rules are the state’s; the delays are the applicant’s problem. Verification can take weeks, and a certificate in the wrong format or from the wrong year is a common reason applications are rejected. Apply long before any deadline.',
      hi: 'नियम राज्य के हैं; देरी उम्मीदवार की समस्या बन जाती है। सत्यापन में हफ़्ते लग सकते हैं, और ग़लत प्रारूप या ग़लत साल का प्रमाणपत्र आवेदन ख़ारिज होने का आम कारण है। किसी भी समय-सीमा से बहुत पहले आवेदन कीजिए।',
    },
    steps: {
      en: ['Find your state’s online service portal or visit the Tehsil office.', 'Gather proof of residence and of your family’s caste (a parent’s certificate is the strongest).', 'Ask which format you need: state or central. They are not interchangeable.', 'Keep the application number; if it stalls past the state’s service guarantee period, escalate in writing.'],
      hi: ['अपने राज्य का ऑनलाइन सेवा पोर्टल ढूँढ़िए या तहसील कार्यालय जाइए।', 'निवास और परिवार की जाति का सबूत जुटाइए (माता-पिता का प्रमाणपत्र सबसे मज़बूत है)।', 'पूछिए कि कौन-सा प्रारूप चाहिए: राज्य या केंद्रीय। दोनों एक-दूसरे की जगह नहीं चलते।', 'आवेदन संख्या सँभालिए; अगर राज्य की सेवा गारंटी अवधि से ज़्यादा अटके, तो लिखित में ऊपर शिकायत कीजिए।'],
    },
    sources: [DOPT, { name: 'National Commission for Backward Classes', url: 'https://ncbc.nic.in/' }],
    related: ['creamy-layer', 'ews-eligibility', 'caste-certificate-other-state', 'check-central-obc-list'],
  },
  {
    id: 'fifty-percent-ceiling',
    category: 'reservation',
    question: { en: 'Can reservation go above 50%?', hi: 'क्या आरक्षण 50% से ऊपर जा सकता है?' },
    short: {
      en: 'Normally not. In Indra Sawhney (1992) the Supreme Court held that reservation should not exceed 50% except in extraordinary situations the state must prove. The 10% EWS quota sits outside that ceiling, the court held in 2022. Tamil Nadu’s 69% law is protected by being placed in the Ninth Schedule. Maharashtra’s 2018 Maratha quota and Bihar’s 2023 increase to 65% were struck down.',
      hi: 'सामान्य तौर पर नहीं। 1992 के इंद्रा साहनी फ़ैसले में सुप्रीम कोर्ट ने कहा कि आरक्षण 50% से ज़्यादा नहीं होना चाहिए, सिवाय उन असाधारण हालात के जिन्हें सरकार को साबित करना होगा। 2022 में अदालत ने कहा कि 10% ईडब्ल्यूएस कोटा इस सीमा से बाहर है। तमिलनाडु का 69% क़ानून नौवीं अनुसूची में रखे जाने से सुरक्षित है। महाराष्ट्र का 2018 का मराठा कोटा और बिहार का 2023 में 65% तक बढ़ाया गया कोटा रद्द हुए।',
    },
    truth: {
      en: 'No state has won a case for crossing 50% by proving an extraordinary situation with published representation data. The route that has worked is political protection, not evidence.',
      hi: 'किसी राज्य ने प्रकाशित प्रतिनिधित्व आंकड़ों से असाधारण हालात साबित करके 50% पार करने का मुक़दमा नहीं जीता। जो रास्ता चला है, वह राजनीतिक सुरक्षा है, सबूत नहीं।',
    },
    steps: {
      en: ['Read the state law and the judgment on it, not just the announcement.', 'Ask what representation data the state published with the law.', 'Check whether the law is in force, stayed, struck down or pending appeal before relying on it.'],
      hi: ['सिर्फ़ घोषणा नहीं, राज्य का क़ानून और उस पर आया फ़ैसला पढ़िए।', 'पूछिए कि राज्य ने क़ानून के साथ प्रतिनिधित्व के कौन-से आंकड़े प्रकाशित किए।', 'भरोसा करने से पहले देखिए कि क़ानून लागू है, उस पर रोक है, रद्द हुआ है, या अपील लंबित है।'],
    },
    sources: [SCI, CONSTITUTION],
    related: ['stay-vs-struck-down', 'who-decides-reservation', 'ninth-schedule'],
  },
  {
    id: 'reservation-in-promotions',
    category: 'reservation',
    question: { en: 'Is there reservation in promotions?', hi: 'क्या पदोन्नति में आरक्षण है?' },
    short: {
      en: 'For Scheduled Castes and Tribes, yes, under Article 16(4A), added in 1995, provided the government has quantifiable data showing inadequate representation in the specific cadre. For OBCs, no: Indra Sawhney ruled out reservation in promotions, and Parliament reversed that only for SC and ST.',
      hi: 'अनुसूचित जातियों और जनजातियों के लिए हाँ, 1995 में जोड़े गए अनुच्छेद 16(4A) के तहत, बशर्ते सरकार के पास उस ख़ास कैडर में अपर्याप्त प्रतिनिधित्व दिखाने वाले मापने योग्य आंकड़े हों। ओबीसी के लिए नहीं: इंद्रा साहनी ने पदोन्नति में आरक्षण ख़ारिज किया था, और संसद ने उसे केवल एससी और एसटी के लिए पलटा।',
    },
    truth: {
      en: 'Every judgment since 2006 has asked governments for cadre-wise data. Governments keep returning to court without it, while promotions in many services wait.',
      hi: '2006 के बाद हर फ़ैसले ने सरकारों से कैडर-वार आंकड़े माँगे हैं। सरकारें उनके बिना बार-बार अदालत लौटती हैं, और कई सेवाओं में पदोन्नतियाँ इंतज़ार करती रहती हैं।',
    },
    steps: {
      en: ['Ask your department for the reservation roster for your cadre.', 'Ask, by RTI, for the cadre-wise representation data the department relied on.', 'Read Jarnail Singh (2022) for what courts now require.'],
      hi: ['अपने विभाग से अपने कैडर का आरक्षण रोस्टर माँगिए।', 'आरटीआई से वे कैडर-वार प्रतिनिधित्व आंकड़े माँगिए जिन पर विभाग टिका।', 'अदालतें अब क्या माँगती हैं, इसके लिए जरनैल सिंह (2022) पढ़िए।'],
    },
    sources: [CONSTITUTION, SCI],
    related: ['fifty-percent-ceiling', 'creamy-layer-sc-st'],
  },
  {
    id: 'stay-vs-struck-down',
    category: 'courts',
    question: { en: 'What is the difference between “stayed”, “struck down” and “upheld”?', hi: '“रोक”, “रद्द” और “बरक़रार” में क्या फ़र्क़ है?' },
    short: {
      en: 'A stay is temporary: the court pauses a law or rule until it decides the case, without ruling on whether it is valid. Struck down means the court has held it invalid; it is no longer in force unless a higher court reverses that. Upheld means the court has found it valid. “Pending” means no final decision yet; an interim order can still change what applies in the meantime.',
      hi: 'रोक अस्थायी है: अदालत मामले का फ़ैसला होने तक किसी क़ानून या नियम को रोक देती है, उसकी वैधता पर फ़ैसला दिए बिना। रद्द का मतलब अदालत ने उसे अवैध माना; ऊपरी अदालत के पलटे बिना वह लागू नहीं रहता। बरक़रार का मतलब अदालत ने उसे वैध माना। “लंबित” का मतलब अभी अंतिम फ़ैसला नहीं हुआ; अंतरिम आदेश बीच में लागू नियम बदल सकता है।',
    },
    truth: {
      en: 'Politicians routinely describe a stay as a victory or defeat on the merits. It is neither. Ask what the final order says, and whether there is one.',
      hi: 'नेता अक्सर रोक को गुण-दोष पर जीत या हार बताते हैं। यह दोनों में से कुछ नहीं। पूछिए कि अंतिम आदेश क्या कहता है, और क्या कोई अंतिम आदेश है भी।',
    },
    steps: {
      en: ['Find the actual order on the court’s website and read its last paragraphs, where the operative directions are.', 'Check the date: a later order may have changed it.', 'For an appeal, check the higher court’s case status too.'],
      hi: ['अदालत की वेबसाइट पर असली आदेश ढूँढ़िए और उसके आख़िरी अनुच्छेद पढ़िए, जहाँ असली निर्देश होते हैं।', 'तारीख़ देखिए: बाद के किसी आदेश ने उसे बदला हो सकता है।', 'अपील हो तो ऊपरी अदालत का केस स्टेटस भी देखिए।'],
    },
    sources: [SCI, { name: 'eCourts Services', url: 'https://ecourts.gov.in/' }],
    related: ['read-a-judgment', 'file-a-pil'],
  },
  {
    id: 'file-a-pil',
    category: 'courts',
    question: { en: 'How can an ordinary person take the government to court?', hi: 'आम नागरिक सरकार को अदालत में कैसे ले जा सकता है?' },
    short: {
      en: 'For a violation of fundamental rights, you can petition a High Court under Article 226 or the Supreme Court under Article 32. A public interest litigation (PIL) is for a wrong affecting the public, not a purely personal grievance. Free legal aid is available through Legal Services Authorities for eligible people, including SC and ST members, women, children and people with low incomes.',
      hi: 'मौलिक अधिकारों के उल्लंघन पर आप अनुच्छेद 226 के तहत हाई कोर्ट या अनुच्छेद 32 के तहत सुप्रीम कोर्ट में याचिका दे सकते हैं। जनहित याचिका जनता को प्रभावित करने वाले ग़लत के लिए है, पूरी तरह निजी शिकायत के लिए नहीं। पात्र लोगों, जिनमें एससी और एसटी सदस्य, महिलाएँ, बच्चे और कम आय वाले लोग शामिल हैं, के लिए विधिक सेवा प्राधिकरणों के ज़रिए मुफ़्त क़ानूनी सहायता उपलब्ध है।',
    },
    truth: {
      en: 'Courts are open; they are not fast. A PIL can take years, and the government often uses that time. Documents and RTI replies filed with a petition make it much harder to ignore.',
      hi: 'अदालतें खुली हैं; तेज़ नहीं। जनहित याचिका में बरसों लग सकते हैं, और सरकार अक्सर उस समय का इस्तेमाल करती है। याचिका के साथ लगाए गए दस्तावेज़ और आरटीआई जवाब उसे नज़रअंदाज़ करना बहुत मुश्किल बना देते हैं।',
    },
    steps: {
      en: ['Collect documents first: orders, notices, RTI replies.', 'Contact your District Legal Services Authority for free legal aid if you are eligible.', 'Start with the High Court of your state unless the issue is national in scale.'],
      hi: ['पहले दस्तावेज़ जुटाइए: आदेश, सूचनाएँ, आरटीआई जवाब।', 'पात्र हों तो मुफ़्त क़ानूनी सहायता के लिए अपने ज़िला विधिक सेवा प्राधिकरण से संपर्क कीजिए।', 'मुद्दा राष्ट्रीय स्तर का न हो तो अपने राज्य के हाई कोर्ट से शुरू कीजिए।'],
    },
    sources: [CONSTITUTION, { name: 'National Legal Services Authority', url: 'https://nalsa.gov.in/' }],
    related: ['stay-vs-struck-down', 'free-legal-aid'],
  },
  {
    id: 'read-a-judgment',
    category: 'courts',
    question: { en: 'Where do I find a judgment, and how do I read it?', hi: 'कोई फ़ैसला कहाँ मिलेगा, और उसे कैसे पढ़ें?' },
    short: {
      en: 'Supreme Court judgments are on sci.gov.in; High Court and district court orders through eCourts services; free searchable copies on Indian Kanoon. Read the last part first: the operative order says what the court actually decided. In a bench with several opinions, check which view had the majority.',
      hi: 'सुप्रीम कोर्ट के फ़ैसले sci.gov.in पर हैं; हाई कोर्ट और ज़िला अदालतों के आदेश ई-कोर्ट्स सेवाओं पर; मुफ़्त खोजने लायक प्रतियाँ इंडियन कानून पर। पहले आख़िरी हिस्सा पढ़िए: असली आदेश बताता है कि अदालत ने असल में क्या तय किया। कई रायों वाली पीठ में देखिए कि बहुमत किस राय के साथ था।',
    },
    truth: {
      en: 'Most news coverage quotes observations, not holdings. An observation is what a judge said; a holding is what the court decided. Only the second binds anyone.',
      hi: 'ज़्यादातर ख़बरें टिप्पणियाँ उद्धृत करती हैं, फ़ैसले नहीं। टिप्पणी वह है जो किसी जज ने कहा; फ़ैसला वह है जो अदालत ने तय किया। केवल दूसरा किसी पर बाध्यकारी है।',
    },
    steps: {
      en: ['Search by case name and year, or by the parties.', 'Read the operative order, then the headnote, then the reasoning.', 'Note the bench size: a larger bench’s ruling overrides a smaller one’s.'],
      hi: ['मामले के नाम और साल, या पक्षकारों के नाम से खोजिए।', 'पहले असली आदेश, फिर सार, फिर तर्क पढ़िए।', 'पीठ का आकार नोट कीजिए: बड़ी पीठ का फ़ैसला छोटी पीठ के फ़ैसले पर भारी पड़ता है।'],
    },
    sources: [SCI, { name: 'eCourts Services', url: 'https://ecourts.gov.in/' }, { name: 'Indian Kanoon', url: 'https://indiankanoon.org/' }],
    related: ['stay-vs-struck-down', 'check-court-case-status'],
  },
  {
    id: 'how-a-bill-becomes-law',
    category: 'parliament',
    question: { en: 'How does a bill become law?', hi: 'कोई विधेयक क़ानून कैसे बनता है?' },
    short: {
      en: 'A bill is introduced in either House, debated, often sent to a parliamentary committee for scrutiny, passed by both Houses, and becomes law when the President gives assent under Article 111. Money bills can only start in the Lok Sabha; the Rajya Sabha can recommend changes within 14 days but cannot block them. Constitutional amendments need special majorities under Article 368.',
      hi: 'विधेयक किसी भी सदन में पेश होता है, उस पर बहस होती है, अक्सर जाँच के लिए संसदीय समिति को भेजा जाता है, दोनों सदनों से पास होता है, और अनुच्छेद 111 के तहत राष्ट्रपति की मंज़ूरी से क़ानून बनता है। धन विधेयक केवल लोकसभा में शुरू हो सकते हैं; राज्यसभा 14 दिन में बदलाव सुझा सकती है पर रोक नहीं सकती। संविधान संशोधनों के लिए अनुच्छेद 368 के तहत विशेष बहुमत चाहिए।',
    },
    truth: {
      en: 'Committee scrutiny is where bills are actually read line by line, and PRS Legislative Research has documented a steep fall in the share of bills sent to committees. A law passed in two days was not examined; it was approved.',
      hi: 'समिति की जाँच वह जगह है जहाँ विधेयक सचमुच पंक्ति-दर-पंक्ति पढ़े जाते हैं, और पीआरएस लेजिस्लेटिव रिसर्च ने समितियों को भेजे जाने वाले विधेयकों के हिस्से में भारी गिरावट दर्ज की है। दो दिन में पास हुआ क़ानून जाँचा नहीं गया; मंज़ूर किया गया।',
    },
    steps: {
      en: ['Track bills and committee reports at sansad.in or prsindia.org.', 'Read the Statement of Objects and Reasons at the end of a bill: it says what the government claims the bill is for.', 'Committees invite public comments on bills under scrutiny. Send yours.'],
      hi: ['sansad.in या prsindia.org पर विधेयक और समिति रिपोर्टें देखिए।', 'विधेयक के अंत में उद्देश्यों और कारणों का कथन पढ़िए: उसमें सरकार का दावा होता है कि विधेयक किस लिए है।', 'समितियाँ जाँच में चल रहे विधेयकों पर सार्वजनिक टिप्पणियाँ माँगती हैं। अपनी भेजिए।'],
    },
    sources: [SANSAD, { name: 'PRS Legislative Research', url: 'https://prsindia.org/' }],
    related: ['ordinance', 'ask-your-mp'],
  },
  {
    id: 'ordinance',
    category: 'parliament',
    question: { en: 'What is an ordinance, and can the government rule by them?', hi: 'अध्यादेश क्या है, और क्या सरकार उनसे राज कर सकती है?' },
    short: {
      en: 'Under Article 123 the President, on the government’s advice, can issue an ordinance with the force of law when Parliament is not in session. It lapses six weeks after Parliament reassembles unless approved. In 2017 the Supreme Court held that re-promulgating ordinances again and again, without placing them before the legislature, is a fraud on the Constitution.',
      hi: 'अनुच्छेद 123 के तहत, संसद सत्र में न हो तो राष्ट्रपति सरकार की सलाह पर क़ानून की ताक़त वाला अध्यादेश जारी कर सकते हैं। संसद दोबारा बैठने के छह हफ़्ते बाद, मंज़ूरी न मिलने पर, वह समाप्त हो जाता है। 2017 में सुप्रीम कोर्ट ने कहा कि अध्यादेशों को विधायिका के सामने रखे बिना बार-बार दोबारा जारी करना संविधान के साथ धोखा है।',
    },
    truth: {
      en: 'Ordinances were meant for emergencies. They are often used to avoid debate. When a major change arrives by ordinance, ask why it could not wait for the House.',
      hi: 'अध्यादेश आपात स्थितियों के लिए थे। अक्सर इनका इस्तेमाल बहस से बचने के लिए होता है। जब कोई बड़ा बदलाव अध्यादेश से आए, तो पूछिए कि वह सदन का इंतज़ार क्यों नहीं कर सका।',
    },
    steps: {
      en: ['Find the ordinance text in the Gazette at egazette.gov.in.', 'Check whether a bill to replace it was introduced when Parliament met.', 'Count re-promulgations: each one is on the record.'],
      hi: ['egazette.gov.in पर राजपत्र में अध्यादेश का पाठ देखिए।', 'देखिए कि संसद बैठने पर उसकी जगह लेने वाला विधेयक पेश हुआ या नहीं।', 'कितनी बार दोबारा जारी हुआ, गिनिए: हर बार रिकॉर्ड पर है।'],
    },
    sources: [CONSTITUTION, { name: 'e-Gazette of India', url: 'https://egazette.gov.in/' }],
    related: ['how-a-bill-becomes-law', 'find-the-gazette'],
  },
  {
    id: 'find-the-gazette',
    category: 'parliament',
    question: { en: 'Where do I find the official version of a law or notification?', hi: 'किसी क़ानून या अधिसूचना का आधिकारिक रूप कहाँ मिलेगा?' },
    short: {
      en: 'Central Acts, rules and notifications are published in the Gazette of India at egazette.gov.in; consolidated Acts are on the India Code portal. States publish their own gazettes. The gazette version is the legal one; a press release is not.',
      hi: 'केंद्रीय अधिनियम, नियम और अधिसूचनाएँ egazette.gov.in पर भारत के राजपत्र में प्रकाशित होते हैं; समेकित अधिनियम इंडिया कोड पोर्टल पर हैं। राज्य अपने राजपत्र प्रकाशित करते हैं। राजपत्र वाला रूप क़ानूनी है; प्रेस विज्ञप्ति नहीं।',
    },
    truth: {
      en: 'Big announcements and their notifications often say different things, and the notification is what applies. Read the gazette before you believe the headline.',
      hi: 'बड़ी घोषणाएँ और उनकी अधिसूचनाएँ अक्सर अलग बातें कहती हैं, और लागू अधिसूचना होती है। सुर्ख़ी पर भरोसा करने से पहले राजपत्र पढ़िए।',
    },
    steps: {
      en: ['Search egazette.gov.in by ministry, date or subject.', 'Use indiacode.nic.in for the current consolidated text of an Act.', 'Note whether it is an “Extraordinary” gazette: urgent notifications appear there.'],
      hi: ['egazette.gov.in पर मंत्रालय, तारीख़ या विषय से खोजिए।', 'किसी अधिनियम के मौजूदा समेकित पाठ के लिए indiacode.nic.in देखिए।', 'देखिए कि वह “असाधारण” राजपत्र है या नहीं: ज़रूरी अधिसूचनाएँ वहीं छपती हैं।'],
    },
    sources: [{ name: 'e-Gazette of India', url: 'https://egazette.gov.in/' }, { name: 'India Code', url: 'https://www.indiacode.nic.in/' }],
    related: ['ordinance'],
  },
  {
    id: 'ask-your-mp',
    category: 'parliament',
    question: { en: 'How do I get my MP to ask the government a question?', hi: 'अपने सांसद से सरकार से सवाल कैसे पुछवाएँ?' },
    short: {
      en: 'MPs can ask ministers questions that get a written or oral answer on the record. Write to your MP with a precise question, the ministry it concerns, and the documents behind it. Answers to past questions are searchable at sansad.in.',
      hi: 'सांसद मंत्रियों से ऐसे सवाल पूछ सकते हैं जिनका लिखित या मौखिक जवाब रिकॉर्ड पर आता है। अपने सांसद को एक सटीक सवाल, संबंधित मंत्रालय, और उसके पीछे के दस्तावेज़ों के साथ लिखिए। पुराने सवालों के जवाब sansad.in पर खोजे जा सकते हैं।',
    },
    truth: {
      en: 'Ministers’ written answers are often evasive, but they are on the record, and an evasive answer to a precise question is itself news.',
      hi: 'मंत्रियों के लिखित जवाब अक्सर गोलमोल होते हैं, पर रिकॉर्ड पर होते हैं, और सटीक सवाल का गोलमोल जवाब अपने आप में ख़बर है।',
    },
    steps: {
      en: ['Search sansad.in first: someone may already have asked.', 'Draft one precise question with numbers and dates.', 'Send it to your MP’s official email and constituency office.', 'Follow up when the session begins.'],
      hi: ['पहले sansad.in पर खोजिए: शायद किसी ने पहले ही पूछा हो।', 'संख्याओं और तारीख़ों के साथ एक सटीक सवाल लिखिए।', 'उसे अपने सांसद के आधिकारिक ईमेल और क्षेत्र कार्यालय भेजिए।', 'सत्र शुरू होने पर याद दिलाइए।'],
    },
    sources: [SANSAD],
    related: ['how-a-bill-becomes-law', 'reserved-seats-parliament'],
  },
  {
    id: 'caste-census-when',
    category: 'data',
    question: { en: 'Will India count caste, and when will we see the numbers?', hi: 'क्या भारत जाति गिनेगा, और आंकड़े कब दिखेंगे?' },
    short: {
      en: 'Census 2027 will record caste in its population enumeration in February 2027, the first full caste count since 1931. The houselisting phase ran from April to September 2026. No release date for caste tables, and no classification method, has been published.',
      hi: 'जनगणना 2027 फ़रवरी 2027 की जनसंख्या गणना में जाति दर्ज करेगी, 1931 के बाद पहली पूरी जाति गणना। मकान सूचीकरण अप्रैल से सितंबर 2026 तक चला। जाति तालिकाएँ जारी करने की कोई तारीख़, और वर्गीकरण का कोई तरीक़ा, प्रकाशित नहीं हुआ।',
    },
    truth: {
      en: 'India has collected caste data before, in 2011, and never published it. A count is not the same as a release.',
      hi: 'भारत पहले भी, 2011 में, जाति के आंकड़े जुटा चुका है और कभी प्रकाशित नहीं किए। गिनती और जारी करना एक बात नहीं।',
    },
    steps: {
      en: ['Follow the Registrar General’s notifications at censusindia.gov.in.', 'Ask for the caste code directory by RTI to the Office of the Registrar General.', 'Keep the promised dates; compare them with what happens.'],
      hi: ['censusindia.gov.in पर महापंजीयक की अधिसूचनाएँ देखिए।', 'महापंजीयक कार्यालय को आरटीआई भेजकर जाति कोड निर्देशिका माँगिए।', 'वादा की गई तारीख़ें सँभालिए; जो होता है, उससे मिलाइए।'],
    },
    sources: [{ name: 'Census of India', url: 'https://censusindia.gov.in/' }],
    related: ['find-government-data', 'rohini-commission'],
  },
  {
    id: 'find-government-data',
    category: 'data',
    question: { en: 'Where can I find official government data?', hi: 'सरकारी आंकड़े आधिकारिक रूप से कहाँ मिलेंगे?' },
    short: {
      en: 'Start with data.gov.in, the national open data portal; the Ministry of Statistics (mospi.gov.in) for surveys such as labour force and consumption; censusindia.gov.in for census tables; and each ministry’s annual report. Parliamentary answers at sansad.in often contain data published nowhere else.',
      hi: 'शुरुआत data.gov.in, राष्ट्रीय खुले आंकड़ों के पोर्टल से कीजिए; श्रम बल और उपभोग जैसे सर्वेक्षणों के लिए सांख्यिकी मंत्रालय (mospi.gov.in); जनगणना तालिकाओं के लिए censusindia.gov.in; और हर मंत्रालय की वार्षिक रिपोर्ट। sansad.in पर संसदीय जवाबों में अक्सर ऐसे आंकड़े होते हैं जो कहीं और प्रकाशित नहीं होते।',
    },
    truth: {
      en: 'The data that would settle the reservation debate, representation by caste in each cadre, mostly exists in government files and is mostly not on any portal.',
      hi: 'जो आंकड़े आरक्षण की बहस सुलझा देते, यानी हर कैडर में जाति-वार प्रतिनिधित्व, वे ज़्यादातर सरकारी फ़ाइलों में मौजूद हैं और ज़्यादातर किसी पोर्टल पर नहीं।',
    },
    steps: {
      en: ['Search data.gov.in and the ministry’s own site.', 'Search sansad.in for written answers on your subject.', 'If it is not published, ask for it by RTI.'],
      hi: ['data.gov.in और मंत्रालय की अपनी साइट पर खोजिए।', 'sansad.in पर अपने विषय पर लिखित जवाब खोजिए।', 'प्रकाशित न हो तो आरटीआई से माँगिए।'],
    },
    sources: [{ name: 'Open Government Data Platform India', url: 'https://data.gov.in/' }, { name: 'Ministry of Statistics and Programme Implementation', url: 'https://mospi.gov.in/' }],
    related: ['caste-census-when', 'how-to-file-an-rti'],
  },
  {
    id: 'complain-about-a-government-service',
    category: 'complaints',
    question: { en: 'Where do I complain about a central government office?', hi: 'केंद्र सरकार के किसी दफ़्तर की शिकायत कहाँ करें?' },
    short: {
      en: 'File it on CPGRAMS, the Centralised Public Grievance Redress and Monitoring System, at pgportal.gov.in. You get a registration number to track it and can appeal if you are unhappy with the result. Most states run their own grievance portals for state departments.',
      hi: 'पीजी पोर्टल (pgportal.gov.in) पर केंद्रीकृत लोक शिकायत निवारण और निगरानी प्रणाली (सीपीग्राम्स) में दर्ज कीजिए। ट्रैक करने के लिए पंजीकरण संख्या मिलती है, और नतीजे से असंतुष्ट हों तो अपील कर सकते हैं। ज़्यादातर राज्य अपने विभागों के लिए अपने शिकायत पोर्टल चलाते हैं।',
    },
    truth: {
      en: 'A grievance marked “disposed” is not always a grievance solved. Use the appeal, and keep the registration number.',
      hi: '“निपटाई गई” लिखी शिकायत हमेशा सुलझी हुई शिकायत नहीं होती। अपील का इस्तेमाल कीजिए, और पंजीकरण संख्या सँभालिए।',
    },
    steps: {
      en: ['Register on pgportal.gov.in and pick the right ministry.', 'Describe the problem with dates, reference numbers and documents.', 'If the reply does not solve it, file an appeal from the same portal.'],
      hi: ['pgportal.gov.in पर पंजीकरण कीजिए और सही मंत्रालय चुनिए।', 'समस्या तारीख़ों, संदर्भ संख्याओं और दस्तावेज़ों के साथ बताइए।', 'जवाब से हल न हो तो उसी पोर्टल से अपील कीजिए।'],
    },
    sources: [{ name: 'CPGRAMS (Public Grievance portal)', url: 'https://pgportal.gov.in/' }],
    related: ['report-caste-discrimination'],
  },
  {
    id: 'report-caste-discrimination',
    category: 'complaints',
    question: { en: 'I faced caste discrimination. Where can I go?', hi: 'मुझे जातिगत भेदभाव झेलना पड़ा। कहाँ जाऊँ?' },
    short: {
      en: 'For atrocities against Scheduled Castes and Tribes, file an FIR under the SC/ST (Prevention of Atrocities) Act, 1989; police must register it. You can also complain to the National Commission for Scheduled Castes or Scheduled Tribes, and OBC members to the National Commission for Backward Classes. On campus, the anti-discrimination mechanism under the UGC’s 2012 regulations is the current route. Free legal aid is available from your District Legal Services Authority.',
      hi: 'अनुसूचित जातियों और जनजातियों पर अत्याचार के लिए एससी/एसटी (अत्याचार निवारण) अधिनियम, 1989 के तहत एफ़आईआर दर्ज कराइए; पुलिस को उसे दर्ज करना होगा। आप राष्ट्रीय अनुसूचित जाति या अनुसूचित जनजाति आयोग में, और ओबीसी सदस्य राष्ट्रीय पिछड़ा वर्ग आयोग में भी शिकायत कर सकते हैं। कैंपस पर, यूजीसी के 2012 के विनियमों के तहत भेदभाव-विरोधी व्यवस्था मौजूदा रास्ता है। मुफ़्त क़ानूनी सहायता अपने ज़िला विधिक सेवा प्राधिकरण से मिलती है।',
    },
    truth: {
      en: 'The law is clear; enforcement often is not. Put everything in writing, keep copies, and note the names of every officer you deal with.',
      hi: 'क़ानून साफ़ है; उसका अमल अक्सर नहीं। सब कुछ लिखित में दीजिए, प्रतियाँ रखिए, और हर उस अधिकारी का नाम नोट कीजिए जिससे आपका वास्ता पड़े।',
    },
    steps: {
      en: ['Write down what happened, when, where, and who was present, as soon as you can.', 'File the FIR or complaint in writing and get a copy or acknowledgement.', 'If police refuse, write to the Superintendent of Police and the relevant national commission.', 'Contact the District Legal Services Authority for free legal support.'],
      hi: ['जितनी जल्दी हो सके लिखिए कि क्या हुआ, कब, कहाँ, और कौन मौजूद था।', 'एफ़आईआर या शिकायत लिखित में दीजिए और प्रति या पावती लीजिए।', 'पुलिस मना करे तो पुलिस अधीक्षक और संबंधित राष्ट्रीय आयोग को लिखिए।', 'मुफ़्त क़ानूनी मदद के लिए ज़िला विधिक सेवा प्राधिकरण से संपर्क कीजिए।'],
    },
    sources: [{ name: 'National Commission for Scheduled Castes', url: 'https://ncsc.nic.in/' }, { name: 'National Commission for Backward Classes', url: 'https://ncbc.nic.in/' }, { name: 'National Legal Services Authority', url: 'https://nalsa.gov.in/' }],
    related: ['file-a-pil', 'complain-about-a-government-service'],
  },
];

export const ANSWERS: Answer[] = [...ANSWERS_BASE, ...ANSWERS_MORE_A, ...ANSWERS_MORE_B];

/**
 * Answers shown under articles on each desk ("Answers on this"): the practical questions
 * a reader of that desk is most likely to have next.
 */
export const ANSWERS_FOR_TOPIC: Record<string, string[]> = {
  'Courts & Policy': ['stay-vs-struck-down', 'read-a-judgment', 'check-court-case-status'],
  States: ['fifty-percent-ceiling', 'ninth-schedule', 'caste-certificate-other-state'],
  'Data & Notes': ['caste-census-when', 'find-government-data', 'rohini-commission'],
  History: ['mandal-commission', 'who-decides-reservation', 'ninth-schedule'],
  Latest: ['how-to-file-an-rti', 'report-caste-discrimination', 'free-legal-aid'],
  'Ground Reports': ['get-a-caste-certificate', 'non-creamy-layer-certificate', 'ews-certificate'],
};

export function answerById(id: string | undefined) {
  return ANSWERS.find((answer) => answer.id === id);
}
