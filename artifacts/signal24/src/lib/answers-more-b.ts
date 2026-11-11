/**
 * Answers added for search demand (batch B): Parliament seats, the Mandal and Rohini
 * commissions, court case status, free legal aid, certificates across states, and the
 * creamy layer for SCs and STs. See answers-more-a.ts for how these are merged.
 */
import type { Answer } from './answers';
import type { AnswerDepth } from './answers-depth';

const CONSTITUTION = { name: 'Constitution of India', url: 'https://legislative.gov.in/constitution-of-india/' };
const DOPT = { name: 'Department of Personnel and Training', url: 'https://dopt.gov.in/' };
const SCI = { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/' };
const SANSAD = { name: 'Digital Sansad (Parliament)', url: 'https://sansad.in/' };
const ECI = { name: 'Election Commission of India', url: 'https://www.eci.gov.in/' };
const SOCIAL_JUSTICE = { name: 'Ministry of Social Justice and Empowerment', url: 'https://socialjustice.gov.in/' };
const NCBC = { name: 'National Commission for Backward Classes', url: 'https://ncbc.nic.in/' };
const ECOURTS = { name: 'eCourts Services (district and High Courts)', url: 'https://services.ecourts.gov.in/' };
const NJDG = { name: 'National Judicial Data Grid', url: 'https://njdg.ecourts.gov.in/' };
const NALSA = { name: 'National Legal Services Authority', url: 'https://nalsa.gov.in/' };

export const ANSWERS_MORE_B: Answer[] = [
  {
    id: 'reserved-seats-parliament',
    category: 'parliament',
    question: { en: 'How many seats in Parliament are reserved for SCs and STs?', hi: 'संसद में एससी और एसटी के लिए कितनी सीटें आरक्षित हैं?' },
    short: {
      en: 'In the Lok Sabha, 84 of the 543 elected seats are reserved for Scheduled Castes and 47 for Scheduled Tribes, under Article 330, as fixed by the 2008 delimitation on 2001 census figures. State assemblies have reserved seats under Article 332. There is no caste reservation in the Rajya Sabha. In a reserved seat only SC or ST candidates can stand, but every voter in the constituency votes.',
      hi: 'लोकसभा की 543 निर्वाचित सीटों में से 84 अनुसूचित जातियों और 47 अनुसूचित जनजातियों के लिए आरक्षित हैं, अनुच्छेद 330 के तहत, जैसा 2001 की जनगणना के आंकड़ों पर 2008 के परिसीमन ने तय किया। राज्य विधानसभाओं में अनुच्छेद 332 के तहत आरक्षित सीटें हैं। राज्यसभा में जाति आधारित आरक्षण नहीं है। आरक्षित सीट पर सिर्फ़ एससी या एसटी उम्मीदवार खड़े हो सकते हैं, पर क्षेत्र का हर मतदाता वोट देता है।',
    },
    truth: {
      en: 'The seat numbers rest on a census that is now a quarter of a century old, because the total has been frozen until after the first census taken after 2026. Reserved MPs are elected by everyone in the constituency, which is the compromise of the 1932 Poona Pact, and still argued over.',
      hi: 'सीटों की संख्या एक चौथाई सदी पुरानी जनगणना पर टिकी है, क्योंकि कुल संख्या 2026 के बाद की पहली जनगणना तक जमा दी गई है। आरक्षित सीटों के सांसद क्षेत्र के सभी लोग चुनते हैं, जो 1932 के पूना पैक्ट का समझौता है, और जिस पर बहस आज भी जारी है।',
    },
    steps: {
      en: ['Check whether your constituency is reserved on the Election Commission’s constituency lists.', 'Read Articles 330, 332 and 334 for the rules and the time limit.', 'Follow Census 2027 and the next Delimitation Commission: that is when reserved seats are redrawn.', 'Ask your MP for the government’s timetable for the next delimitation through a parliamentary question.'],
      hi: ['चुनाव आयोग की निर्वाचन क्षेत्र सूचियों में देखिए कि आपका क्षेत्र आरक्षित है या नहीं।', 'नियम और समय-सीमा के लिए अनुच्छेद 330, 332 और 334 पढ़िए।', 'जनगणना 2027 और अगले परिसीमन आयोग पर नज़र रखिए: तभी आरक्षित सीटें दोबारा तय होंगी।', 'संसदीय सवाल के ज़रिए अपने सांसद से अगले परिसीमन की सरकारी समय-सारिणी पूछिए।'],
    },
    sources: [CONSTITUTION, ECI, SANSAD],
    related: ['women-reservation-act', 'caste-census-when', 'ask-your-mp'],
  },
  {
    id: 'rohini-commission',
    category: 'data',
    question: { en: 'What is the Rohini Commission, and where is its report?', hi: 'रोहिणी आयोग क्या है, और उसकी रिपोर्ट कहाँ है?' },
    short: {
      en: 'A commission set up under Article 340 on 2 October 2017, chaired by Justice G. Rohini, retired Chief Justice of the Delhi High Court, to examine how the benefits of the 27% OBC quota are spread among the communities in the Central List and how the list could be sub-categorised. After more than a dozen extensions it submitted its report to the President on 31 July 2023. The report has not been made public.',
      hi: 'अनुच्छेद 340 के तहत 2 अक्टूबर 2017 को बना आयोग, जिसकी अध्यक्ष दिल्ली हाई कोर्ट की सेवानिवृत्त मुख्य न्यायाधीश जस्टिस जी. रोहिणी थीं, यह जाँचने के लिए कि 27% ओबीसी आरक्षण का फ़ायदा केंद्र की सूची के समुदायों में कैसे बँटता है और सूची का उप-वर्गीकरण कैसे हो सकता है। एक दर्जन से ज़्यादा बार कार्यकाल बढ़ने के बाद इसने 31 जुलाई 2023 को राष्ट्रपति को रिपोर्ट सौंपी। रिपोर्ट सार्वजनिक नहीं की गई है।',
    },
    truth: {
      en: 'Six years of work, paid for by the public, on the one question that could settle who in the OBC list actually gets the quota, and the answer sits unpublished. The silence is a decision.',
      hi: 'जनता के पैसे से छह साल का काम, उस इकलौते सवाल पर जो तय कर सकता था कि ओबीसी सूची में असल में आरक्षण किसे मिलता है, और जवाब अप्रकाशित पड़ा है। यह चुप्पी भी एक फ़ैसला है।',
    },
    steps: {
      en: ['Ask the Ministry of Social Justice under RTI when the report will be tabled, and whether it has been considered.', 'If refused, appeal: a commission report is not automatically exempt, and the public interest is strong.', 'Ask your MP to put a question on its status; written answers are on sansad.in.', 'Read the commission’s terms of reference to see what the report was required to answer.'],
      hi: ['आरटीआई के तहत सामाजिक न्याय मंत्रालय से पूछिए कि रिपोर्ट कब सदन में रखी जाएगी, और क्या उस पर विचार हुआ है।', 'इनकार हो तो अपील कीजिए: आयोग की रिपोर्ट अपने आप छूट में नहीं आती, और जनहित मज़बूत है।', 'अपने सांसद से इसकी स्थिति पर सवाल उठवाइए; लिखित जवाब sansad.in पर होते हैं।', 'आयोग के कार्य-क्षेत्र को पढ़िए, ताकि पता चले कि रिपोर्ट को किन सवालों का जवाब देना था।'],
    },
    sources: [SOCIAL_JUSTICE, NCBC, SANSAD],
    related: ['mandal-commission', 'what-rti-can-refuse', 'creamy-layer'],
  },
  {
    id: 'mandal-commission',
    category: 'reservation',
    question: { en: 'What was the Mandal Commission?', hi: 'मंडल आयोग क्या था?' },
    short: {
      en: 'The Second Backward Classes Commission, set up in 1979 under B.P. Mandal. It reported in December 1980, identified 3,743 castes as backward using eleven social, educational and economic indicators, estimated that OBCs made up about 52% of the population using 1931 census data, and recommended 27% reservation in central posts. A decade later the government implemented it by an office memorandum of 13 August 1990, and the Supreme Court upheld it in Indra Sawhney (1992).',
      hi: 'दूसरा पिछड़ा वर्ग आयोग, जो 1979 में बी. पी. मंडल की अध्यक्षता में बना। इसने दिसंबर 1980 में रिपोर्ट दी, ग्यारह सामाजिक, शैक्षणिक और आर्थिक संकेतकों से 3,743 जातियों को पिछड़ा माना, 1931 की जनगणना के आंकड़ों से अनुमान लगाया कि ओबीसी आबादी का लगभग 52% हैं, और केंद्रीय पदों में 27% आरक्षण की सिफ़ारिश की। एक दशक बाद सरकार ने 13 अगस्त 1990 के कार्यालय ज्ञापन से इसे लागू किया, और सुप्रीम कोर्ट ने इंद्रा साहनी (1992) में इसे बरक़रार रखा।',
    },
    truth: {
      en: 'The report waited ten years for a government willing to act on it, and the 52% estimate still rests on a census from 1931, because no government since has counted OBCs. Census 2027 is the first chance to replace it.',
      hi: 'रिपोर्ट को दस साल उस सरकार का इंतज़ार करना पड़ा जो उस पर अमल करे, और 52% का अनुमान आज भी 1931 की जनगणना पर टिका है, क्योंकि तब से किसी सरकार ने ओबीसी की गिनती नहीं की। जनगणना 2027 इसे बदलने का पहला मौक़ा है।',
    },
    steps: {
      en: ['Read the 1990 office memorandum and the 1992 judgment together: the judgment changed how the policy works.', 'Check the policy ledger record for the 1990 memorandum on this site for the sources.', 'Compare the 52% estimate with what Census 2027 publishes, when it does.', 'For the current list, use the Central List on the NCBC website, not the 1980 report.'],
      hi: ['1990 का कार्यालय ज्ञापन और 1992 का फ़ैसला साथ पढ़िए: फ़ैसले ने नीति के काम करने का तरीक़ा बदला।', 'स्रोतों के लिए इस साइट पर 1990 के ज्ञापन का नीति रजिस्टर रिकॉर्ड देखिए।', 'जब जनगणना 2027 आंकड़े प्रकाशित करे, तो 52% के अनुमान से तुलना कीजिए।', 'मौजूदा सूची के लिए 1980 की रिपोर्ट नहीं, एनसीबीसी की वेबसाइट पर केंद्र की सूची देखिए।'],
    },
    sources: [DOPT, SCI, NCBC],
    related: ['rohini-commission', 'fifty-percent-ceiling', 'creamy-layer'],
  },
  {
    id: 'check-court-case-status',
    category: 'courts',
    question: { en: 'How do I check the status of a court case?', hi: 'अदालत में मुक़दमे की स्थिति कैसे देखें?' },
    short: {
      en: 'For district courts and High Courts, use the eCourts Services website or app: search by the case’s CNR number, the case number, a party’s name or the advocate’s name. For the Supreme Court, use the case status page on sci.gov.in with the diary number or case number. The same pages list hearing dates and let you download daily orders and judgments.',
      hi: 'ज़िला अदालतों और हाई कोर्ट के लिए ई-कोर्ट्स सर्विसेज़ की वेबसाइट या ऐप इस्तेमाल कीजिए: मुक़दमे की सीएनआर संख्या, मुक़दमा संख्या, किसी पक्ष के नाम या वकील के नाम से खोजिए। सुप्रीम कोर्ट के लिए sci.gov.in पर डायरी संख्या या मुक़दमा संख्या से मुक़दमे की स्थिति वाला पेज देखिए। इन्हीं पेजों पर सुनवाई की तारीख़ें होती हैं और रोज़ के आदेश व फ़ैसले डाउनलोड किए जा सकते हैं।',
    },
    truth: {
      en: 'A case can be “listed” for years without being heard; the next date tells you when it is listed, not when anything will happen. The National Judicial Data Grid shows how long cases like yours are waiting.',
      hi: 'कोई मुक़दमा सालों तक “सूचीबद्ध” रह सकता है बिना सुने; अगली तारीख़ बताती है कि वह कब सूची में है, यह नहीं कि उस दिन कुछ होगा। राष्ट्रीय न्यायिक डेटा ग्रिड दिखाता है कि आप जैसे मुक़दमे कितने समय से इंतज़ार में हैं।',
    },
    steps: {
      en: ['Find the CNR number on any order or summons in the case, or ask the court’s filing counter for it.', 'Search eCourts Services (or the High Court’s own site) by CNR, and save the case to the app to follow it.', 'Read the latest daily order, not just the next date: it says what happened at the last hearing.', 'For a judgment you need to rely on, apply for a certified copy from the court.'],
      hi: ['मुक़दमे के किसी आदेश या समन पर सीएनआर संख्या देखिए, या अदालत के फ़ाइलिंग काउंटर से पूछिए।', 'ई-कोर्ट्स सर्विसेज़ (या हाई कोर्ट की अपनी साइट) पर सीएनआर से खोजिए, और ऐप में मुक़दमा सहेजकर नज़र रखिए।', 'सिर्फ़ अगली तारीख़ नहीं, ताज़ा रोज़ का आदेश पढ़िए: उसमें लिखा होता है कि पिछली सुनवाई में क्या हुआ।', 'जिस फ़ैसले पर आपको भरोसा करना है, उसकी प्रमाणित प्रति के लिए अदालत में आवेदन कीजिए।'],
    },
    sources: [ECOURTS, SCI, NJDG],
    related: ['read-a-judgment', 'stay-vs-struck-down', 'file-a-pil'],
  },
  {
    id: 'free-legal-aid',
    category: 'complaints',
    question: { en: 'How do I get free legal aid?', hi: 'मुफ़्त क़ानूनी मदद कैसे मिले?' },
    short: {
      en: 'Under the Legal Services Authorities Act, 1987, members of Scheduled Castes and Scheduled Tribes, women, children, persons with disabilities, victims of trafficking or of disasters and caste atrocities, industrial workers, people in custody, and people whose income is below the limit set by their state are entitled to free legal services, including a lawyer and court fees. Apply to your District Legal Services Authority, the taluka legal services committee, or call the national legal aid helpline 15100.',
      hi: 'विधिक सेवा प्राधिकरण अधिनियम, 1987 के तहत अनुसूचित जातियों और जनजातियों के सदस्य, महिलाएँ, बच्चे, दिव्यांग, तस्करी या आपदाओं और जातिगत अत्याचार के पीड़ित, औद्योगिक कामगार, हिरासत में रखे लोग, और वे लोग जिनकी आय राज्य की तय सीमा से कम है, मुफ़्त क़ानूनी सेवाओं के हक़दार हैं, जिनमें वकील और अदालती शुल्क शामिल हैं। अपने ज़िला विधिक सेवा प्राधिकरण, तालुका विधिक सेवा समिति में आवेदन कीजिए, या राष्ट्रीय विधिक सहायता हेल्पलाइन 15100 पर कॉल कीजिए।',
    },
    truth: {
      en: 'The right is wide and the use is narrow: most people who qualify never hear of it, and many first meet a legal-aid lawyer only after they have been in custody for a while. Ask early, and ask in writing.',
      hi: 'हक़ बड़ा है और इस्तेमाल कम: इसके हक़दार ज़्यादातर लोग इसके बारे में कभी सुनते ही नहीं, और कई लोगों की विधिक सहायता वकील से पहली मुलाक़ात तब होती है जब वे कुछ समय हिरासत में रह चुके होते हैं। जल्दी माँगिए, और लिखकर माँगिए।',
    },
    steps: {
      en: ['Call 15100 or visit the District Legal Services Authority, usually at the district court complex.', 'Fill in the application (it can also be made online through NALSA), stating which category you belong to.', 'Carry proof of the category: a caste certificate, a disability certificate or an income certificate.', 'If you or a relative is arrested, ask the magistrate at the first hearing for a legal-aid lawyer.'],
      hi: ['15100 पर कॉल कीजिए या ज़िला विधिक सेवा प्राधिकरण जाइए, जो आम तौर पर ज़िला अदालत परिसर में होता है।', 'आवेदन भरिए (यह नालसा के ज़रिए ऑनलाइन भी हो सकता है), और बताइए कि आप किस श्रेणी में आते हैं।', 'श्रेणी का सबूत साथ रखिए: जाति प्रमाणपत्र, दिव्यांगता प्रमाणपत्र या आय प्रमाणपत्र।', 'अगर आप या कोई रिश्तेदार गिरफ़्तार हो, तो पहली सुनवाई में मजिस्ट्रेट से विधिक सहायता वकील माँगिए।'],
    },
    sources: [NALSA, CONSTITUTION],
    related: ['file-a-pil', 'report-caste-discrimination', 'check-court-case-status'],
  },
  {
    id: 'caste-certificate-other-state',
    category: 'reservation',
    question: { en: 'Is my caste certificate valid in another state?', hi: 'क्या मेरा जाति प्रमाणपत्र दूसरे राज्य में मान्य है?' },
    short: {
      en: 'For Scheduled Castes and Scheduled Tribes, reservation is tied to the state where your community is listed. If you move, you generally cannot claim reservation in your new state’s jobs or seats, though you keep it in your state of origin and for central government posts. The Supreme Court settled this in Marri Chandra Shekhar Rao (1990), and a Constitution Bench reaffirmed it in Bir Singh (2018). OBC lists differ from state to state; central posts use the Central List.',
      hi: 'अनुसूचित जातियों और जनजातियों के लिए आरक्षण उस राज्य से बँधा है जहाँ आपका समुदाय सूचीबद्ध है। अगर आप दूसरे राज्य जाते हैं, तो आम तौर पर वहाँ की नौकरियों या सीटों में आरक्षण का दावा नहीं कर सकते, हालाँकि अपने मूल राज्य में और केंद्र सरकार के पदों के लिए यह बना रहता है। सुप्रीम कोर्ट ने मर्री चंद्रशेखर राव (1990) में यह तय किया, और बीर सिंह (2018) में संविधान पीठ ने इसकी पुष्टि की। ओबीसी सूचियाँ राज्य-दर-राज्य अलग हैं; केंद्रीय पद केंद्र की सूची मानते हैं।',
    },
    truth: {
      en: 'Millions of families move for work, and the rule means a child born and schooled in Delhi or Mumbai to migrant parents may have no claim in the only state they have ever lived in. The courts have kept the rule because the lists are drawn state by state.',
      hi: 'करोड़ों परिवार काम के लिए दूसरे राज्य जाते हैं, और इस नियम का मतलब है कि प्रवासी माता-पिता का जो बच्चा दिल्ली या मुंबई में पैदा हुआ और पढ़ा, उसका उस इकलौते राज्य में कोई दावा न हो जहाँ वह हमेशा रहा। अदालतों ने यह नियम इसलिए बनाए रखा है क्योंकि सूचियाँ राज्य-दर-राज्य बनती हैं।',
    },
    steps: {
      en: ['Keep your parent’s certificate from the state of origin: certificates for migrants are usually issued on that basis.', 'For central government posts and central institutions, use the certificate showing your state of origin.', 'For state jobs and seats in the state you live in, check its rules on migrants before applying in a reserved category.', 'For OBC status, check both the Central List and the new state’s list for your community.'],
      hi: ['मूल राज्य का माता-पिता का प्रमाणपत्र सँभालकर रखिए: प्रवासियों के प्रमाणपत्र आम तौर पर उसी आधार पर बनते हैं।', 'केंद्र सरकार के पदों और केंद्रीय संस्थानों के लिए वह प्रमाणपत्र लगाइए जिसमें आपका मूल राज्य दर्ज है।', 'जिस राज्य में आप रहते हैं, वहाँ की नौकरियों और सीटों के लिए आरक्षित श्रेणी में आवेदन से पहले प्रवासियों पर उसके नियम देखिए।', 'ओबीसी दर्जे के लिए केंद्र की सूची और नए राज्य की सूची, दोनों में अपना समुदाय देखिए।'],
    },
    sources: [CONSTITUTION, SCI, NCBC],
    related: ['get-a-caste-certificate', 'who-decides-reservation', 'check-central-obc-list'],
  },
  {
    id: 'creamy-layer-sc-st',
    category: 'reservation',
    question: { en: 'Is there a creamy layer for SCs and STs?', hi: 'क्या एससी और एसटी के लिए क्रीमी लेयर है?' },
    short: {
      en: 'Not in jobs or admissions today. The creamy-layer exclusion applies to OBCs. In the 2024 sub-classification judgment four Supreme Court judges said states should evolve a creamy-layer policy for SCs and STs, but that was not the court’s binding holding, and on 9 August 2024 the Union Cabinet said the Constitution has no provision for one. In the promotions case, Jarnail Singh (2018), the court said the creamy-layer principle can be applied to SCs and STs; no such rule has been notified.',
      hi: 'आज नौकरियों या दाख़िलों में नहीं। क्रीमी लेयर का बहिष्कार ओबीसी पर लागू होता है। 2024 के उप-वर्गीकरण फ़ैसले में सुप्रीम कोर्ट के चार जजों ने कहा कि राज्य एससी और एसटी के लिए क्रीमी लेयर नीति बनाएँ, पर यह अदालत का बाध्यकारी निर्णय नहीं था, और 9 अगस्त 2024 को केंद्रीय कैबिनेट ने कहा कि संविधान में इसका प्रावधान नहीं है। पदोन्नति वाले मामले, जरनैल सिंह (2018), में अदालत ने कहा कि क्रीमी लेयर का सिद्धांत एससी और एसटी पर लागू हो सकता है; ऐसा कोई नियम अधिसूचित नहीं हुआ।',
    },
    truth: {
      en: 'The debate is loud and the data is missing: no government publishes how the SC and ST quotas are actually shared within those lists, which is the one fact that would show whether the benefit is concentrated.',
      hi: 'बहस ज़ोरदार है और आंकड़े ग़ायब: कोई सरकार यह प्रकाशित नहीं करती कि एससी और एसटी आरक्षण उन सूचियों के भीतर असल में कैसे बँटता है, जबकि यही वह इकलौता तथ्य है जो दिखाता कि फ़ायदा कुछ हाथों में सिमटा है या नहीं।',
    },
    steps: {
      en: ['Read what the judgments actually held, not commentary: Davinder Singh (2024) and Jarnail Singh (2018).', 'Check your recruitment notice: if it does not ask SC or ST candidates for a non-creamy-layer certificate, none is required.', 'Watch for any notification by the Union or your state government; only that would change the rule.', 'Ask under RTI for community-wise data on SC and ST appointments if you want to test the argument.'],
      hi: ['टिप्पणियाँ नहीं, फ़ैसलों ने असल में क्या तय किया वह पढ़िए: दविंदर सिंह (2024) और जरनैल सिंह (2018)।', 'अपनी भर्ती अधिसूचना देखिए: अगर उसमें एससी या एसटी उम्मीदवारों से नॉन-क्रीमी लेयर प्रमाणपत्र नहीं माँगा गया, तो उसकी ज़रूरत नहीं।', 'केंद्र या अपनी राज्य सरकार की किसी अधिसूचना पर नज़र रखिए; सिर्फ़ वही नियम बदलेगी।', 'अगर तर्क परखना हो, तो आरटीआई के तहत एससी और एसटी नियुक्तियों के समुदाय-वार आंकड़े माँगिए।'],
    },
    sources: [SCI, DOPT],
    related: ['sc-sub-classification', 'creamy-layer', 'reservation-in-promotions'],
  },
];

export const DEPTH_MORE_B: Record<string, AnswerDepth> = {
  'reserved-seats-parliament': {
    law: {
      en: 'Article 330 reserves Lok Sabha seats for SCs and STs in proportion to their share of the population of each state, and Article 332 does the same for state assemblies. The Delimitation Commission decides which constituencies are reserved; the 2008 delimitation, on 2001 census figures, produced the current 84 SC and 47 ST seats. Article 334 sets a time limit on this reservation, which Parliament has extended repeatedly; the 104th Amendment in 2019 extended it to January 2030 and ended the nomination of Anglo-Indian members. The total number of seats per state stays frozen until the figures of the first census taken after 2026 are published.',
      hi: 'अनुच्छेद 330 हर राज्य की आबादी में उनके हिस्से के अनुपात में लोकसभा की सीटें एससी और एसटी के लिए आरक्षित करता है, और अनुच्छेद 332 राज्य विधानसभाओं के लिए यही करता है। कौन-से क्षेत्र आरक्षित होंगे, यह परिसीमन आयोग तय करता है; 2001 की जनगणना के आंकड़ों पर 2008 के परिसीमन से मौजूदा 84 एससी और 47 एसटी सीटें बनीं। अनुच्छेद 334 इस आरक्षण की समय-सीमा तय करता है, जिसे संसद बार-बार बढ़ाती रही है; 2019 के 104वें संशोधन ने इसे जनवरी 2030 तक बढ़ाया और एंग्लो-इंडियन सदस्यों का नामांकन ख़त्म किया। हर राज्य की कुल सीटों की संख्या 2026 के बाद की पहली जनगणना के आंकड़े प्रकाशित होने तक जमी रहेगी।',
    },
    mistakes: {
      en: [
        'Thinking only SC or ST voters vote in a reserved seat. Reservation limits who can stand, not who can vote.',
        'Expecting reserved seats to rotate every election. In the Lok Sabha they change only with a new delimitation.',
        'Looking for caste reservation in the Rajya Sabha. There is none.',
      ],
      hi: [
        'यह सोचना कि आरक्षित सीट पर सिर्फ़ एससी या एसटी मतदाता वोट देते हैं। आरक्षण यह तय करता है कि कौन खड़ा हो सकता है, यह नहीं कि कौन वोट दे सकता है।',
        'हर चुनाव में आरक्षित सीटें बदलने की उम्मीद करना। लोकसभा में वे सिर्फ़ नए परिसीमन से बदलती हैं।',
        'राज्यसभा में जाति आधारित आरक्षण खोजना। वहाँ ऐसा नहीं है।',
      ],
    },
  },
  'rohini-commission': {
    law: {
      en: 'Article 340 lets the President appoint a commission to investigate the conditions of socially and educationally backward classes. The Rohini Commission’s terms of reference asked it to examine how unevenly the benefits of reservation are distributed among the castes in the Central List of OBCs, to work out a method and criteria for sub-categorising them, and to identify the castes for each sub-category; a later term asked it to correct repetitions, ambiguities and spelling errors in the list. Article 340(3) requires the President to have a commission’s report laid before each House of Parliament with a memorandum on the action taken.',
      hi: 'अनुच्छेद 340 राष्ट्रपति को सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों की स्थिति की जाँच के लिए आयोग नियुक्त करने देता है। रोहिणी आयोग के कार्य-क्षेत्र में यह जाँचना था कि केंद्र की ओबीसी सूची की जातियों में आरक्षण का फ़ायदा कितना असमान बँटा है, उनके उप-वर्गीकरण का तरीक़ा और मानदंड बनाना, और हर उप-श्रेणी की जातियाँ पहचानना; बाद में जोड़े गए एक बिंदु में सूची की दोहराई गई, अस्पष्ट और ग़लत वर्तनी वाली प्रविष्टियाँ सुधारना शामिल था। अनुच्छेद 340(3) राष्ट्रपति से अपेक्षा करता है कि आयोग की रिपोर्ट, की गई कार्रवाई के ज्ञापन के साथ, संसद के दोनों सदनों के सामने रखवाई जाए।',
    },
    mistakes: {
      en: [
        'Confusing the Rohini Commission with the National Commission for Backward Classes. One was a one-off inquiry; the other is a permanent constitutional body.',
        'Assuming the report was rejected. It was submitted; what happens to it has not been announced.',
        'Treating a refusal under RTI as final. Appeal it, citing Article 340(3) and the public interest.',
      ],
      hi: [
        'रोहिणी आयोग को राष्ट्रीय पिछड़ा वर्ग आयोग समझना। एक बार की जाँच थी; दूसरा स्थायी संवैधानिक निकाय है।',
        'यह मान लेना कि रिपोर्ट ख़ारिज हो गई। रिपोर्ट सौंपी गई; उसका क्या होगा, इसकी घोषणा नहीं हुई।',
        'आरटीआई में इनकार को आख़िरी मान लेना। अनुच्छेद 340(3) और जनहित का हवाला देकर अपील कीजिए।',
      ],
    },
  },
  'mandal-commission': {
    law: {
      en: 'The Mandal Commission was appointed under Article 340. The office memorandum of 13 August 1990 reserved 27% of central civil posts for socially and educationally backward classes; a further memorandum of 25 September 1991 added preference for the poorer sections among them and a 10% quota for other economically backward sections. In Indra Sawhney (1992) a nine-judge bench upheld the 27%, required the creamy layer to be excluded, capped total reservation at 50% save in extraordinary situations, barred reservation in promotions, and struck down the 10% economic quota. The 27% was set at that figure so that, with 22.5% for SCs and STs, the total stayed within 50%.',
      hi: 'मंडल आयोग अनुच्छेद 340 के तहत नियुक्त हुआ था। 13 अगस्त 1990 के कार्यालय ज्ञापन ने केंद्रीय सिविल पदों का 27% सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों के लिए आरक्षित किया; 25 सितंबर 1991 के एक और ज्ञापन ने उनमें ग़रीब तबक़ों को वरीयता और दूसरे आर्थिक रूप से पिछड़े वर्गों के लिए 10% कोटा जोड़ा। इंद्रा साहनी (1992) में नौ जजों की पीठ ने 27% को बरक़रार रखा, क्रीमी लेयर को बाहर रखना ज़रूरी किया, असाधारण हालात छोड़कर कुल आरक्षण 50% पर सीमित किया, पदोन्नति में आरक्षण रोका, और 10% आर्थिक कोटा रद्द किया। 27% इसलिए रखा गया कि एससी और एसटी के 22.5% के साथ कुल 50% के भीतर रहे।',
    },
    mistakes: {
      en: [
        'Thinking the 52% estimate is a census count. It is a 1980 estimate built on 1931 data.',
        'Thinking Mandal created the creamy layer. The Supreme Court did, in Indra Sawhney.',
        'Using the 1980 list of castes today. The Central List, kept by the government with the NCBC, is the operative one.',
      ],
      hi: [
        'यह मानना कि 52% का आंकड़ा जनगणना की गिनती है। यह 1931 के आंकड़ों पर बना 1980 का अनुमान है।',
        'यह मानना कि क्रीमी लेयर मंडल ने बनाई। इसे सुप्रीम कोर्ट ने इंद्रा साहनी में बनाया।',
        'आज 1980 की जातियों की सूची इस्तेमाल करना। लागू सूची वह केंद्रीय सूची है जिसे सरकार एनसीबीसी के साथ रखती है।',
      ],
    },
  },
  'check-court-case-status': {
    law: {
      en: 'Court orders and judgments are public records, and each court’s rules let anyone apply for certified copies. Under Section 12(2) of the Limitation Act, 1963, the time taken to obtain a certified copy of the judgment or order is excluded when counting the period for filing an appeal, so apply for it promptly. Every case in the district courts and High Courts gets a CNR (Case Number Record), a unique identifier that stays with it through every hearing. The National Judicial Data Grid publishes pendency figures by court, case type and age, from the same eCourts data.',
      hi: 'अदालती आदेश और फ़ैसले सार्वजनिक रिकॉर्ड हैं, और हर अदालत के नियम किसी को भी प्रमाणित प्रतियों के लिए आवेदन करने देते हैं। परिसीमा अधिनियम, 1963 की धारा 12(2) के तहत फ़ैसले या आदेश की प्रमाणित प्रति पाने में लगा समय अपील दायर करने की अवधि गिनते समय नहीं जोड़ा जाता, इसलिए इसके लिए जल्दी आवेदन कीजिए। ज़िला अदालतों और हाई कोर्ट के हर मुक़दमे को एक सीएनआर (केस नंबर रिकॉर्ड) मिलता है, एक अनोखी पहचान जो हर सुनवाई में उसके साथ रहती है। राष्ट्रीय न्यायिक डेटा ग्रिड इन्हीं ई-कोर्ट्स आंकड़ों से अदालत, मुक़दमे के प्रकार और उम्र के हिसाब से लंबित मामलों के आंकड़े प्रकाशित करता है।',
    },
    mistakes: {
      en: [
        'Reading the next date as a decision date. It is when the case is listed; many listed cases are not reached that day.',
        'Relying on a downloaded copy for an appeal. Courts generally want a certified copy.',
        'Searching by a party’s name alone. Common names return hundreds of cases; use the CNR or case number.',
      ],
      hi: [
        'अगली तारीख़ को फ़ैसले की तारीख़ समझना। उस दिन मुक़दमा सूची में होता है; कई सूचीबद्ध मुक़दमों की बारी उस दिन नहीं आती।',
        'अपील के लिए डाउनलोड की गई प्रति पर भरोसा करना। अदालतें आम तौर पर प्रमाणित प्रति माँगती हैं।',
        'सिर्फ़ किसी पक्ष के नाम से खोजना। आम नामों पर सैकड़ों मुक़दमे निकलते हैं; सीएनआर या मुक़दमा संख्या इस्तेमाल कीजिए।',
      ],
    },
  },
  'free-legal-aid': {
    law: {
      en: 'Article 39A, added in 1976, directs the state to provide free legal aid so that no citizen is denied justice for economic or other disabilities. Section 12 of the Legal Services Authorities Act, 1987 lists who is entitled, and Section 13 says entitlement on the stated grounds is enough, on an affidavit of income where income is the ground. Legal services include a lawyer, court fees and the cost of documents, at every level up to the Supreme Court. In Khatri v State of Bihar (1981) the Supreme Court held that the duty to provide legal aid begins when an accused is first produced before a magistrate. The Act also sets up Lok Adalats, whose awards are final and binding (Section 21).',
      hi: '1976 में जोड़ा गया अनुच्छेद 39क राज्य को निर्देश देता है कि मुफ़्त क़ानूनी मदद दे, ताकि कोई नागरिक आर्थिक या दूसरी कमज़ोरी की वजह से न्याय से वंचित न रहे। विधिक सेवा प्राधिकरण अधिनियम, 1987 की धारा 12 बताती है कि कौन हक़दार है, और धारा 13 कहती है कि बताए गए आधार पर हक़ बनना काफ़ी है, और जहाँ आय आधार हो वहाँ आय का हलफ़नामा। क़ानूनी सेवाओं में वकील, अदालती शुल्क और दस्तावेज़ों का ख़र्च शामिल है, सुप्रीम कोर्ट तक हर स्तर पर। खत्री बनाम बिहार राज्य (1981) में सुप्रीम कोर्ट ने कहा कि विधिक सहायता देने का कर्तव्य तब शुरू होता है जब आरोपी पहली बार मजिस्ट्रेट के सामने पेश होता है। अधिनियम लोक अदालतें भी बनाता है, जिनके फ़ैसले अंतिम और बाध्यकारी होते हैं (धारा 21)।',
    },
    mistakes: {
      en: [
        'Thinking it is only for criminal cases. It covers civil, family, labour and other matters too.',
        'Waiting until trial. Ask at the first production before the magistrate, or as soon as a dispute begins.',
        'Accepting a Lok Adalat settlement you do not agree with. Its award is final, so settle only on terms you accept.',
      ],
      hi: [
        'यह सोचना कि यह सिर्फ़ आपराधिक मामलों के लिए है। यह दीवानी, पारिवारिक, श्रम और दूसरे मामलों पर भी लागू है।',
        'मुक़दमे की सुनवाई तक इंतज़ार करना। मजिस्ट्रेट के सामने पहली पेशी पर या विवाद शुरू होते ही माँगिए।',
        'लोक अदालत में ऐसा समझौता मान लेना जिससे आप सहमत नहीं। उसका फ़ैसला अंतिम होता है, इसलिए सिर्फ़ उन्हीं शर्तों पर समझौता कीजिए जो आपको मंज़ूर हों।',
      ],
    },
  },
  'caste-certificate-other-state': {
    law: {
      en: 'Articles 341 and 342 specify Scheduled Castes and Scheduled Tribes “in relation to” each state. In Marri Chandra Shekhar Rao v Dean, Seth G.S. Medical College (1990) a Constitution Bench held that a person recognised as SC or ST in one state cannot claim that status in another state to which they move. A Constitution Bench reaffirmed this in Bir Singh v Delhi Jal Board (2018), while upholding the rule that in services under the Union Territory of Delhi, SC and ST candidates from any state can benefit. Central government guidelines allow a migrant to get a certificate where they live, on the basis of the certificate issued in the state of origin, with benefits limited to that state and to central posts.',
      hi: 'अनुच्छेद 341 और 342 हर राज्य के “संबंध में” अनुसूचित जातियाँ और जनजातियाँ निर्दिष्ट करते हैं। मर्री चंद्रशेखर राव बनाम डीन, सेठ जी. एस. मेडिकल कॉलेज (1990) में संविधान पीठ ने कहा कि एक राज्य में एससी या एसटी माना गया व्यक्ति उस दूसरे राज्य में यह दर्जा नहीं माँग सकता जहाँ वह जाकर बसता है। बीर सिंह बनाम दिल्ली जल बोर्ड (2018) में संविधान पीठ ने इसकी पुष्टि की, और साथ ही यह नियम बरक़रार रखा कि दिल्ली केंद्रशासित प्रदेश की सेवाओं में किसी भी राज्य के एससी और एसटी उम्मीदवार फ़ायदा पा सकते हैं। केंद्र सरकार के दिशानिर्देश प्रवासी को वहाँ प्रमाणपत्र लेने देते हैं जहाँ वह रहता है, मूल राज्य में जारी प्रमाणपत्र के आधार पर, और फ़ायदे उसी राज्य और केंद्रीय पदों तक सीमित रहते हैं।',
    },
    mistakes: {
      en: [
        'Getting a fresh certificate in the new state and claiming its reserved seats. Such claims are challenged and certificates can be cancelled.',
        'Assuming migration ends all reservation. It continues in the state of origin and for central posts.',
        'Applying the Delhi rule elsewhere. The 2018 ruling on Delhi concerns Union Territory services, not other states.',
      ],
      hi: [
        'नए राज्य में नया प्रमाणपत्र बनवाकर वहाँ की आरक्षित सीटों का दावा करना। ऐसे दावों को चुनौती मिलती है और प्रमाणपत्र रद्द हो सकते हैं।',
        'यह मान लेना कि प्रवास से सारा आरक्षण ख़त्म हो जाता है। यह मूल राज्य में और केंद्रीय पदों के लिए जारी रहता है।',
        'दिल्ली वाला नियम दूसरी जगह लागू करना। दिल्ली पर 2018 का फ़ैसला केंद्रशासित प्रदेश की सेवाओं से जुड़ा है, दूसरे राज्यों से नहीं।',
      ],
    },
  },
  'creamy-layer-sc-st': {
    law: {
      en: 'The creamy-layer exclusion comes from Indra Sawhney (1992), which applied it to the backward classes, and the Department of Personnel and Training’s rules apply it to OBCs only. In Jarnail Singh v Lachhmi Narain Gupta (2018) a Constitution Bench, reviewing M. Nagaraj on reservation in promotions, said the principle of excluding the creamy layer can be applied to SCs and STs. In State of Punjab v Davinder Singh (2024) four of the seven judges said states should develop a policy to identify a creamy layer among SCs and STs; the majority’s holding was about sub-classification. No central or state rule currently excludes a creamy layer from SC or ST reservation in recruitment or admission.',
      hi: 'क्रीमी लेयर का बहिष्कार इंद्रा साहनी (1992) से आया, जिसने इसे पिछड़े वर्गों पर लागू किया, और कार्मिक और प्रशिक्षण विभाग के नियम इसे सिर्फ़ ओबीसी पर लागू करते हैं। जरनैल सिंह बनाम लच्छी नारायण गुप्ता (2018) में संविधान पीठ ने, पदोन्नति में आरक्षण पर एम. नागराज की समीक्षा करते हुए, कहा कि क्रीमी लेयर को बाहर रखने का सिद्धांत एससी और एसटी पर लागू हो सकता है। पंजाब राज्य बनाम दविंदर सिंह (2024) में सात में से चार जजों ने कहा कि राज्य एससी और एसटी में क्रीमी लेयर पहचानने की नीति बनाएँ; बहुमत का निर्णयाधार उप-वर्गीकरण पर था। फ़िलहाल कोई केंद्रीय या राज्य नियम भर्ती या दाख़िले में एससी या एसटी आरक्षण से क्रीमी लेयर को बाहर नहीं करता।',
    },
    mistakes: {
      en: [
        'Being asked for a non-creamy-layer certificate as an SC or ST candidate. Unless a notified rule requires it, it does not apply.',
        'Treating judges’ observations as law. Only the holding binds; the 2024 creamy-layer remarks were not it.',
        'Confusing sub-classification with a creamy layer. One divides the quota among communities; the other would exclude better-off families.',
      ],
      hi: [
        'एससी या एसटी उम्मीदवार के तौर पर नॉन-क्रीमी लेयर प्रमाणपत्र माँगे जाने को मान लेना। जब तक कोई अधिसूचित नियम न कहे, यह लागू नहीं होता।',
        'जजों की टिप्पणियों को क़ानून मानना। सिर्फ़ निर्णयाधार बाध्यकारी है; 2024 की क्रीमी लेयर वाली टिप्पणियाँ वह नहीं थीं।',
        'उप-वर्गीकरण को क्रीमी लेयर समझना। एक आरक्षण को समुदायों में बाँटता है; दूसरा संपन्न परिवारों को बाहर करता।',
      ],
    },
  },
};
