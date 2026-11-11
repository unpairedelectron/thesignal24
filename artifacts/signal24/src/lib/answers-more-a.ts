/**
 * Answers added for search demand (batch A): certificates, lists, Parliament, disability
 * and private-sector reservation, sub-classification, the Ninth Schedule. Each entry has
 * its "what the law says" and "where people get caught out" depth alongside. Merged into
 * ANSWERS (answers.ts) and ANSWER_DEPTH (answers-depth.ts). Statutory details restate
 * the Acts, rules and judgments named; re-check when ANSWERS_CHECKED_ON changes.
 */
import type { Answer } from './answers';
import type { AnswerDepth } from './answers-depth';

const CONSTITUTION = { name: 'Constitution of India', url: 'https://legislative.gov.in/constitution-of-india/' };
const DOPT = { name: 'Department of Personnel and Training', url: 'https://dopt.gov.in/' };
const NCBC = { name: 'National Commission for Backward Classes (Central List of OBCs)', url: 'https://ncbc.nic.in/' };
const SERVICES = { name: 'National Government Services Portal (state certificate services)', url: 'https://services.india.gov.in/' };
const SCI = { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/' };
const SANSAD = { name: 'Digital Sansad (Parliament)', url: 'https://sansad.in/' };
const INDIA_CODE = { name: 'India Code (Acts of Parliament)', url: 'https://www.indiacode.nic.in/' };
const DEPWD = { name: 'Department of Empowerment of Persons with Disabilities', url: 'https://depwd.gov.in/' };
const UDID = { name: 'Unique Disability ID (UDID) portal', url: 'https://www.swavlambancard.gov.in/' };

export const ANSWERS_MORE_A: Answer[] = [
  {
    id: 'ews-certificate',
    category: 'reservation',
    question: { en: 'How do I get an EWS certificate?', hi: 'ईडब्ल्यूएस प्रमाणपत्र कैसे बनवाएँ?' },
    short: {
      en: 'Apply to your state’s revenue authority, usually through the state’s e-district or public-services portal or at the tehsil office. You need proof of identity and residence, your family’s income from all sources for the previous financial year, and details of land and residential property. The document is called an Income and Asset Certificate. For central government jobs and central institutions it must be in the central format and issued by an authorised officer, of the rank of Tehsildar or above.',
      hi: 'अपने राज्य के राजस्व प्राधिकरण को आवेदन दीजिए, आम तौर पर राज्य के ई-डिस्ट्रिक्ट या लोक सेवा पोर्टल पर या तहसील दफ़्तर में। पहचान और निवास का सबूत, पिछले वित्त वर्ष में सभी स्रोतों से परिवार की आय, और ज़मीन व आवासीय संपत्ति का ब्योरा चाहिए। इस दस्तावेज़ को आय और संपत्ति प्रमाणपत्र कहते हैं। केंद्र सरकार की नौकरियों और केंद्रीय संस्थानों के लिए यह केंद्र के प्रारूप में और तहसीलदार या उससे ऊपर के अधिकृत अधिकारी का जारी किया होना चाहिए।',
    },
    truth: {
      en: 'There is no national portal: every state runs its own process, and recruiters reject certificates in the wrong format or for the wrong year every admission season. The ₹8 lakh income line has not been revised since the quota began in 2019.',
      hi: 'कोई राष्ट्रीय पोर्टल नहीं है: हर राज्य अपनी प्रक्रिया चलाता है, और हर दाख़िले के मौसम में ग़लत प्रारूप या ग़लत साल के प्रमाणपत्र ख़ारिज होते हैं। ₹8 लाख की आय सीमा 2019 में आरक्षण शुरू होने के बाद से नहीं बदली।',
    },
    steps: {
      en: ['Check which format your recruiter or institution wants: central posts and central institutions need the central format.', 'Collect proof of identity and residence, income proof for every family member for the previous financial year, and land and property records.', 'Apply on your state’s e-district or public-services portal, or at the tehsil office, and keep the application number.', 'When it arrives, check the name, the financial year, the issuing officer’s rank and that it is titled an Income and Asset Certificate.'],
      hi: ['देखिए कि भर्ती करने वाला या संस्थान कौन-सा प्रारूप माँगता है: केंद्रीय पदों और केंद्रीय संस्थानों के लिए केंद्र का प्रारूप चाहिए।', 'पहचान और निवास का सबूत, परिवार के हर सदस्य की पिछले वित्त वर्ष की आय का सबूत, और ज़मीन व संपत्ति के काग़ज़ जुटाइए।', 'राज्य के ई-डिस्ट्रिक्ट या लोक सेवा पोर्टल पर या तहसील दफ़्तर में आवेदन कीजिए, और आवेदन संख्या सँभालिए।', 'प्रमाणपत्र मिलने पर नाम, वित्त वर्ष, जारी करने वाले अधिकारी का पद और यह कि उस पर “आय और संपत्ति प्रमाणपत्र” लिखा है, जाँच लीजिए।'],
    },
    sources: [DOPT, SERVICES],
    related: ['ews-eligibility', 'get-a-caste-certificate', 'non-creamy-layer-certificate'],
  },
  {
    id: 'non-creamy-layer-certificate',
    category: 'reservation',
    question: { en: 'How do I get an OBC non-creamy-layer certificate?', hi: 'ओबीसी नॉन-क्रीमी लेयर प्रमाणपत्र कैसे बनवाएँ?' },
    short: {
      en: 'Apply to your state’s revenue authority, usually a Tehsildar or Sub-Divisional Magistrate, through the state portal or the tehsil office. For central jobs and central institutions you need the central-format OBC certificate: it states that your community is in the Central List of OBCs and that you do not belong to the creamy layer. Check the Central List on the National Commission for Backward Classes website before you apply.',
      hi: 'अपने राज्य के राजस्व प्राधिकरण को, आम तौर पर तहसीलदार या उप-मंडल मजिस्ट्रेट को, राज्य पोर्टल या तहसील दफ़्तर के ज़रिए आवेदन दीजिए। केंद्रीय नौकरियों और केंद्रीय संस्थानों के लिए केंद्र के प्रारूप वाला ओबीसी प्रमाणपत्र चाहिए: उसमें लिखा होता है कि आपका समुदाय केंद्र की ओबीसी सूची में है और आप क्रीमी लेयर में नहीं आते। आवेदन से पहले राष्ट्रीय पिछड़ा वर्ग आयोग की वेबसाइट पर केंद्र की सूची देख लीजिए।',
    },
    truth: {
      en: 'The certificate is about your family’s status at a point in time, so recruiters keep asking for a recent one. And because the ₹8 lakh income line has not moved since 2017, more families cross it every year without becoming any better off.',
      hi: 'यह प्रमाणपत्र किसी समय विशेष पर आपके परिवार की स्थिति बताता है, इसलिए भर्ती करने वाले बार-बार ताज़ा प्रमाणपत्र माँगते हैं। और क्योंकि ₹8 लाख की आय सीमा 2017 से नहीं बदली, हर साल ज़्यादा परिवार बिना ज़्यादा संपन्न हुए इसके पार चले जाते हैं।',
    },
    steps: {
      en: ['Confirm your community is in the Central List for your state on the NCBC website, under its exact name or a listed synonym.', 'Gather your caste proof (a parent’s certificate or records), residence proof, and your parents’ income and, if they are in government service, their posts.', 'Apply through your state portal or tehsil office, asking specifically for the central-format OBC (non-creamy-layer) certificate.', 'Check the issue date against the date your recruitment notice requires, and reapply if it is too old.'],
      hi: ['एनसीबीसी की वेबसाइट पर पक्का कीजिए कि आपका समुदाय आपके राज्य के लिए केंद्र की सूची में उसी नाम से या किसी दर्ज पर्याय के साथ है।', 'जाति का सबूत (माता-पिता का प्रमाणपत्र या रिकॉर्ड), निवास का सबूत, और माता-पिता की आय और, अगर वे सरकारी सेवा में हैं, तो उनका पद जुटाइए।', 'राज्य पोर्टल या तहसील दफ़्तर से आवेदन कीजिए, और साफ़ तौर पर केंद्र के प्रारूप वाला ओबीसी (नॉन-क्रीमी लेयर) प्रमाणपत्र माँगिए।', 'जारी होने की तारीख़ को भर्ती की अधिसूचना में माँगी गई तारीख़ से मिलाइए, और पुराना हो तो दोबारा आवेदन कीजिए।'],
    },
    sources: [NCBC, DOPT],
    related: ['creamy-layer', 'check-central-obc-list', 'get-a-caste-certificate'],
  },
  {
    id: 'check-central-obc-list',
    category: 'reservation',
    question: { en: 'How do I check if my caste is in the central OBC list?', hi: 'कैसे पता करें कि मेरी जाति केंद्र की ओबीसी सूची में है?' },
    short: {
      en: 'The National Commission for Backward Classes publishes the Central List of OBCs state by state on its website. Open your state’s list and search for your community’s name and its synonyms and sub-groups; each entry has a number and the government resolution that added it. State OBC lists are separate and are kept by each state government.',
      hi: 'राष्ट्रीय पिछड़ा वर्ग आयोग अपनी वेबसाइट पर केंद्र की ओबीसी सूची राज्यवार प्रकाशित करता है। अपने राज्य की सूची खोलिए और अपने समुदाय का नाम, उसके पर्याय और उप-समूह खोजिए; हर प्रविष्टि की एक संख्या होती है और वह सरकारी संकल्प भी जिससे उसे जोड़ा गया। राज्यों की ओबीसी सूचियाँ अलग हैं और हर राज्य सरकार उन्हें ख़ुद रखती है।',
    },
    truth: {
      en: 'Being OBC in your state does not make you OBC for central jobs. The two lists overlap but are not the same, and requests to add a community to the Central List can take years.',
      hi: 'अपने राज्य में ओबीसी होने से आप केंद्रीय नौकरियों के लिए ओबीसी नहीं हो जाते। दोनों सूचियाँ कुछ हद तक मिलती हैं पर एक नहीं हैं, और किसी समुदाय को केंद्र की सूची में जुड़वाने की माँग में सालों लग सकते हैं।',
    },
    steps: {
      en: ['Open the Central List on ncbc.nic.in and choose your state.', 'Search for your community’s name, alternative spellings, synonyms and sub-castes; entries often list several names.', 'Note the entry number and resolution: the central-format certificate cites them.', 'If your community is only in the state list, use the state certificate for state jobs and do not claim OBC status in central recruitment.'],
      hi: ['ncbc.nic.in पर केंद्र की सूची खोलिए और अपना राज्य चुनिए।', 'अपने समुदाय का नाम, दूसरी वर्तनी, पर्याय और उप-जातियाँ खोजिए; प्रविष्टियों में अक्सर कई नाम होते हैं।', 'प्रविष्टि संख्या और संकल्प नोट कीजिए: केंद्र के प्रारूप वाला प्रमाणपत्र इन्हीं का हवाला देता है।', 'अगर आपका समुदाय सिर्फ़ राज्य की सूची में है, तो राज्य की नौकरियों के लिए राज्य का प्रमाणपत्र इस्तेमाल कीजिए और केंद्रीय भर्ती में ओबीसी दर्जे का दावा मत कीजिए।'],
    },
    sources: [NCBC, CONSTITUTION],
    related: ['who-decides-reservation', 'non-creamy-layer-certificate', 'creamy-layer'],
  },
  {
    id: 'women-reservation-act',
    category: 'parliament',
    question: { en: 'When will women’s reservation in Parliament start?', hi: 'संसद में महिला आरक्षण कब लागू होगा?' },
    short: {
      en: 'The Constitution (One Hundred and Sixth Amendment) Act, 2023 reserves one-third of seats in the Lok Sabha, the state assemblies and the Delhi assembly for women, including one-third of the seats already reserved for SCs and STs. It takes effect only after a delimitation based on the first census published after the Act, so not before the 2027 Census figures are published and seats are redrawn. It lasts fifteen years unless Parliament extends it.',
      hi: 'संविधान (एक सौ छठा संशोधन) अधिनियम, 2023 लोकसभा, राज्य विधानसभाओं और दिल्ली विधानसभा की एक-तिहाई सीटें महिलाओं के लिए आरक्षित करता है, जिसमें एससी और एसटी के लिए पहले से आरक्षित सीटों का एक-तिहाई भी शामिल है। यह अधिनियम के बाद प्रकाशित पहली जनगणना पर आधारित परिसीमन के बाद ही लागू होगा, यानी 2027 की जनगणना के आंकड़े प्रकाशित होने और सीटें दोबारा तय होने से पहले नहीं। संसद न बढ़ाए तो यह पंद्रह साल चलेगा।',
    },
    truth: {
      en: 'Parliament passed it almost unanimously in September 2023, then tied its start to two events, a census and a delimitation, that have no fixed timetable. There is also no separate share for OBC women.',
      hi: 'संसद ने सितंबर 2023 में इसे लगभग सर्वसम्मति से पास किया, फिर इसकी शुरुआत को दो ऐसी घटनाओं से बाँध दिया, जनगणना और परिसीमन, जिनकी कोई तय समय-सारिणी नहीं है। ओबीसी महिलाओं के लिए अलग हिस्सा भी नहीं है।',
    },
    steps: {
      en: ['Follow the publication of Census 2027 figures: delimitation cannot start before them.', 'Watch for a Delimitation Act and the appointment of a Delimitation Commission, which decides which seats are reserved.', 'Ask your MP, through a parliamentary question, for the government’s timetable.', 'Read the amendment itself (Articles 330A, 332A and 334A) on India Code rather than summaries.'],
      hi: ['जनगणना 2027 के आंकड़ों के प्रकाशन पर नज़र रखिए: उनसे पहले परिसीमन शुरू नहीं हो सकता।', 'परिसीमन अधिनियम और परिसीमन आयोग की नियुक्ति पर नज़र रखिए, जो तय करता है कि कौन-सी सीटें आरक्षित होंगी।', 'अपने सांसद से संसदीय सवाल के ज़रिए सरकार की समय-सारिणी पूछिए।', 'सार नहीं, इंडिया कोड पर संशोधन ख़ुद पढ़िए (अनुच्छेद 330क, 332क और 334क)।'],
    },
    sources: [INDIA_CODE, SANSAD],
    related: ['reserved-seats-parliament', 'how-a-bill-becomes-law', 'caste-census-when'],
  },
  {
    id: 'disability-reservation',
    category: 'reservation',
    question: { en: 'Is there reservation for persons with disabilities in government jobs?', hi: 'क्या सरकारी नौकरियों में दिव्यांगों के लिए आरक्षण है?' },
    short: {
      en: 'Yes. Section 34 of the Rights of Persons with Disabilities Act, 2016 requires every government establishment to reserve at least 4% of vacancies in each group of posts for persons with benchmark disabilities, meaning 40% or more. Section 32 requires at least 5% of seats in government and government-aided higher education institutions. The reservation is horizontal: a candidate is counted within their own category, whether SC, ST, OBC, EWS or unreserved.',
      hi: 'हाँ। दिव्यांगजन अधिकार अधिनियम, 2016 की धारा 34 हर सरकारी प्रतिष्ठान से पदों के हर समूह की कम से कम 4% रिक्तियाँ मानक दिव्यांगता, यानी 40% या उससे ज़्यादा, वाले लोगों के लिए आरक्षित करने को कहती है। धारा 32 सरकारी और सरकारी सहायता प्राप्त उच्च शिक्षा संस्थानों में कम से कम 5% सीटें माँगती है। यह आरक्षण क्षैतिज है: उम्मीदवार अपनी ही श्रेणी में गिना जाता है, चाहे एससी हो, एसटी, ओबीसी, ईडब्ल्यूएस या अनारक्षित।',
    },
    truth: {
      en: 'The quota exists on paper far more than in posts: reserved disability vacancies are routinely carried forward, and posts are left “unidentified” as suitable, which shrinks the pool before anyone applies.',
      hi: 'यह आरक्षण पदों से ज़्यादा काग़ज़ों पर है: दिव्यांगों की आरक्षित रिक्तियाँ अक्सर आगे खिसका दी जाती हैं, और पदों को उपयुक्त के रूप में “चिह्नित” ही नहीं किया जाता, जिससे आवेदन से पहले ही दायरा सिकुड़ जाता है।',
    },
    steps: {
      en: ['Get a disability certificate and Unique Disability ID (UDID) through the national UDID portal.', 'Check that the percentage on it is 40% or more, which is what “benchmark disability” requires.', 'Read the recruitment notice for which disability categories each post is identified for.', 'If a notice reserves nothing for persons with disabilities, ask under RTI for the establishment’s roster and identified posts.'],
      hi: ['राष्ट्रीय यूडीआईडी पोर्टल से दिव्यांगता प्रमाणपत्र और विशिष्ट दिव्यांगता पहचान पत्र (यूडीआईडी) बनवाइए।', 'देखिए कि उस पर प्रतिशत 40% या उससे ज़्यादा है, जो “मानक दिव्यांगता” के लिए ज़रूरी है।', 'भर्ती अधिसूचना में देखिए कि हर पद किन दिव्यांगता श्रेणियों के लिए चिह्नित है।', 'अगर अधिसूचना में दिव्यांगों के लिए कुछ आरक्षित नहीं है, तो आरटीआई के तहत प्रतिष्ठान का रोस्टर और चिह्नित पद माँगिए।'],
    },
    sources: [DEPWD, UDID, INDIA_CODE],
    related: ['how-to-file-an-rti', 'reservation-in-promotions', 'complain-about-a-government-service'],
  },
  {
    id: 'reservation-private-sector',
    category: 'reservation',
    question: { en: 'Is there reservation in private jobs or private colleges?', hi: 'क्या निजी नौकरियों या निजी कॉलेजों में आरक्षण है?' },
    short: {
      en: 'Private jobs: no national law requires it. Reservation under Article 16 applies to public employment, and no central law extends caste reservation to private employers. Private colleges: Article 15(5), added in 2005, allows the state to make reservation in private educational institutions, aided or unaided, except minority institutions, and the Supreme Court upheld it in 2014. Whether it applies to a given college depends on a law or rule made by the government concerned.',
      hi: 'निजी नौकरियाँ: कोई राष्ट्रीय क़ानून इसकी माँग नहीं करता। अनुच्छेद 16 का आरक्षण सरकारी रोज़गार पर लागू होता है, और कोई केंद्रीय क़ानून जाति आधारित आरक्षण को निजी नियोक्ताओं तक नहीं ले जाता। निजी कॉलेज: 2005 में जोड़ा गया अनुच्छेद 15(5) राज्य को निजी शिक्षण संस्थानों में, सहायता प्राप्त हों या न हों, अल्पसंख्यक संस्थानों को छोड़कर, आरक्षण की अनुमति देता है, और सुप्रीम कोर्ट ने 2014 में इसे बरक़रार रखा। किसी ख़ास कॉलेज पर यह लागू है या नहीं, यह संबंधित सरकार के क़ानून या नियम पर निर्भर है।',
    },
    truth: {
      en: 'Most new jobs are in the private sector, which is exactly where reservation does not reach, and the debate about extending it has run for decades without a bill. The one recent attempt at a state quota in private jobs, Haryana’s 75% for local candidates, was about domicile, not caste, and the High Court struck it down in 2023.',
      hi: 'ज़्यादातर नई नौकरियाँ निजी क्षेत्र में हैं, ठीक वहीं जहाँ आरक्षण नहीं पहुँचता, और इसे वहाँ तक ले जाने की बहस दशकों से बिना किसी विधेयक के चल रही है। निजी नौकरियों में राज्य के कोटे की हाल की इकलौती कोशिश, हरियाणा का स्थानीय उम्मीदवारों के लिए 75%, जाति नहीं निवास पर आधारित थी, और हाई कोर्ट ने 2023 में उसे रद्द कर दिया।',
    },
    steps: {
      en: ['For a private college, check the state’s admission rules or fee-regulation law for whether reservation applies.', 'For a deemed or private university, check the regulator’s and the state’s rules, not just the university’s prospectus.', 'Ask the institution in writing which rule it follows, and keep the reply.', 'For private employers, look for the company’s own diversity or affirmative-action policy; it is voluntary, not legally required.'],
      hi: ['निजी कॉलेज के लिए राज्य के दाख़िला नियम या फ़ीस नियमन क़ानून देखिए कि आरक्षण लागू है या नहीं।', 'डीम्ड या निजी विश्वविद्यालय के लिए सिर्फ़ विश्वविद्यालय का विवरणिका नहीं, नियामक और राज्य के नियम देखिए।', 'संस्थान से लिखकर पूछिए कि वह कौन-सा नियम मानता है, और जवाब सँभालिए।', 'निजी नियोक्ताओं के लिए कंपनी की अपनी विविधता या सकारात्मक कार्रवाई नीति देखिए; यह स्वैच्छिक है, क़ानूनन ज़रूरी नहीं।'],
    },
    sources: [CONSTITUTION, INDIA_CODE],
    related: ['who-decides-reservation', 'fifty-percent-ceiling', 'ews-eligibility'],
  },
  {
    id: 'sc-sub-classification',
    category: 'courts',
    question: { en: 'What does SC sub-classification mean?', hi: 'एससी उप-वर्गीकरण का क्या मतलब है?' },
    short: {
      en: 'On 1 August 2024, in State of Punjab v Davinder Singh, a seven-judge bench of the Supreme Court held 6:1 that states may divide the Scheduled Caste and Scheduled Tribe quota so that the least-represented groups get a reserved share of it, on the basis of data on their backwardness and representation. It overruled E.V. Chinnaiah (2004), which had treated each state’s SC list as one indivisible class. It is a power states may use, not a duty.',
      hi: '1 अगस्त 2024 को पंजाब राज्य बनाम दविंदर सिंह में सुप्रीम कोर्ट की सात जजों की पीठ ने 6:1 से कहा कि राज्य अनुसूचित जाति और अनुसूचित जनजाति के कोटे को बाँट सकते हैं, ताकि सबसे कम प्रतिनिधित्व वाले समूहों को उसमें आरक्षित हिस्सा मिले, उनके पिछड़ेपन और प्रतिनिधित्व के आंकड़ों के आधार पर। इसने ई. वी. चिन्नैया (2004) को पलटा, जिसने हर राज्य की एससी सूची को एक अविभाज्य वर्ग माना था। यह राज्यों के लिए एक अधिकार है, ज़िम्मेदारी नहीं।',
    },
    truth: {
      en: 'The judgment hands states a tool that only works with data most of them have never published: representation of each community, cadre by cadre. Without it, a sub-classification law is an invitation to the next court challenge.',
      hi: 'फ़ैसला राज्यों को ऐसा औज़ार देता है जो उन आंकड़ों के बिना काम नहीं करता जिन्हें ज़्यादातर राज्यों ने कभी प्रकाशित नहीं किया: हर समुदाय का कैडर-दर-कैडर प्रतिनिधित्व। उनके बिना उप-वर्गीकरण का क़ानून अगली अदालती चुनौती का न्योता है।',
    },
    steps: {
      en: ['Read the judgment on the Supreme Court website rather than summaries: there are several opinions.', 'Check whether your state has announced or passed a sub-classification law, and on what data.', 'Ask your state under RTI for community-wise representation in its services.', 'Follow any challenge to a state law in the High Court using the case-status tools.'],
      hi: ['सार नहीं, सुप्रीम कोर्ट की वेबसाइट पर फ़ैसला पढ़िए: इसमें कई राय हैं।', 'देखिए कि आपके राज्य ने उप-वर्गीकरण का क़ानून घोषित या पारित किया है या नहीं, और किन आंकड़ों पर।', 'आरटीआई के तहत अपने राज्य से उसकी सेवाओं में समुदाय-वार प्रतिनिधित्व माँगिए।', 'राज्य के क़ानून को हाई कोर्ट में चुनौती मिले तो मुक़दमे की स्थिति देखने वाले साधनों से उस पर नज़र रखिए।'],
    },
    sources: [SCI, CONSTITUTION],
    related: ['creamy-layer-sc-st', 'read-a-judgment', 'who-decides-reservation'],
  },
  {
    id: 'ninth-schedule',
    category: 'courts',
    question: { en: 'What is the Ninth Schedule, and does it protect a law from the courts?', hi: 'नौवीं अनुसूची क्या है, और क्या यह क़ानून को अदालत से बचाती है?' },
    short: {
      en: 'The Ninth Schedule was added by the First Amendment in 1951, together with Article 31B, which says that laws listed in it cannot be struck down for violating fundamental rights. Since I.R. Coelho (2007), laws added to it after 24 April 1973 can still be tested against the Constitution’s basic structure. Tamil Nadu’s 69% reservation law was placed in it by the 76th Amendment in 1994.',
      hi: 'नौवीं अनुसूची 1951 में पहले संशोधन के साथ अनुच्छेद 31ख के साथ जोड़ी गई, जो कहता है कि इसमें दर्ज क़ानूनों को मौलिक अधिकारों के उल्लंघन के आधार पर रद्द नहीं किया जा सकता। आई. आर. कोएल्हो (2007) के बाद से, 24 अप्रैल 1973 के बाद इसमें जोड़े गए क़ानूनों को भी संविधान के मूल ढाँचे की कसौटी पर परखा जा सकता है। तमिलनाडु का 69% आरक्षण क़ानून 1994 में 76वें संशोधन से इसमें डाला गया।',
    },
    truth: {
      en: 'It was meant to protect land reform. It became a place to park laws that might not survive scrutiny, and states still ask for it, Bihar for its 65% law most recently, because it is easier than proving the case in court.',
      hi: 'इसका मक़सद भूमि सुधार को बचाना था। यह ऐसे क़ानूनों को रखने की जगह बन गई जो जाँच में शायद न टिकें, और राज्य अब भी इसकी माँग करते हैं, हाल में बिहार ने अपने 65% क़ानून के लिए, क्योंकि यह अदालत में बात साबित करने से आसान है।',
    },
    steps: {
      en: ['Check whether a law is in the Ninth Schedule by reading the Schedule itself in the Constitution.', 'Note the amendment that added it and its date: 24 April 1973 is the dividing line.', 'For a later entry, look for challenges on basic-structure grounds such as equality.', 'Remember that only Parliament, by constitutional amendment, can add a law to it.'],
      hi: ['संविधान में अनुसूची ख़ुद पढ़कर देखिए कि कोई क़ानून नौवीं अनुसूची में है या नहीं।', 'उसे जोड़ने वाला संशोधन और उसकी तारीख़ नोट कीजिए: 24 अप्रैल 1973 विभाजन रेखा है।', 'उसके बाद की प्रविष्टि के लिए समानता जैसे मूल ढाँचे के आधार पर दी गई चुनौतियाँ खोजिए।', 'याद रखिए कि इसमें क़ानून सिर्फ़ संसद, संविधान संशोधन से, जोड़ सकती है।'],
    },
    sources: [CONSTITUTION, SCI],
    related: ['fifty-percent-ceiling', 'how-a-bill-becomes-law', 'read-a-judgment'],
  },
];

export const DEPTH_MORE_A: Record<string, AnswerDepth> = {
  'ews-certificate': {
    law: {
      en: 'For central government posts and admissions, the Department of Personnel and Training’s office memorandum No. 36039/1/2019-Estt.(Res) of 31 January 2019 sets both the criteria and the certificate format. It lists the officers who may issue the certificate: a District Magistrate, Collector or Deputy Commissioner and their additional officers, a Sub-Divisional Magistrate or Taluka or Executive Magistrate, and a revenue officer not below the rank of Tehsildar, among others. Income is counted from all sources, salary, agriculture, business and profession, for the financial year before the year of application, for the applicant, parents, siblings under 18, spouse and children under 18. States set their own process, and can set their own criteria for state jobs.',
      hi: 'केंद्र सरकार के पदों और दाख़िलों के लिए कार्मिक और प्रशिक्षण विभाग का 31 जनवरी 2019 का कार्यालय ज्ञापन सं. 36039/1/2019-Estt.(Res) मानदंड और प्रमाणपत्र का प्रारूप, दोनों तय करता है। इसमें प्रमाणपत्र जारी कर सकने वाले अधिकारियों की सूची है: ज़िला मजिस्ट्रेट, कलेक्टर या उपायुक्त और उनके अपर अधिकारी, उप-मंडल मजिस्ट्रेट या तालुका या कार्यकारी मजिस्ट्रेट, और तहसीलदार से नीचे न होने वाला राजस्व अधिकारी, आदि। आय सभी स्रोतों से, वेतन, खेती, कारोबार और पेशा, आवेदन वाले साल से पहले के वित्त वर्ष की गिनी जाती है, आवेदक, माता-पिता, 18 साल से कम के भाई-बहन, जीवनसाथी और 18 साल से कम के बच्चों की। राज्य अपनी प्रक्रिया तय करते हैं, और राज्य की नौकरियों के लिए अपने मानदंड भी तय कर सकते हैं।',
    },
    mistakes: {
      en: [
        'Submitting a state-format certificate for a central post or institution. Central recruiters ask for the format in the 2019 memorandum.',
        'Using a certificate for the wrong financial year. Income is for the year before the year of application, and many notices fix a date by which it must be valid.',
        'Leaving out property held elsewhere. Land and residential property the family owns in different places are added together for the asset test.',
      ],
      hi: [
        'केंद्रीय पद या संस्थान के लिए राज्य के प्रारूप वाला प्रमाणपत्र जमा करना। केंद्रीय भर्तियाँ 2019 के ज्ञापन वाला प्रारूप माँगती हैं।',
        'ग़लत वित्त वर्ष का प्रमाणपत्र लगाना। आय आवेदन वाले साल से पहले के साल की होती है, और कई अधिसूचनाएँ तय करती हैं कि किस तारीख़ तक प्रमाणपत्र वैध होना चाहिए।',
        'दूसरी जगहों की संपत्ति छोड़ देना। परिवार की अलग-अलग जगहों पर मौजूद ज़मीन और आवासीय संपत्ति संपत्ति-जाँच में जोड़ी जाती है।',
      ],
    },
  },
  'non-creamy-layer-certificate': {
    law: {
      en: 'The creamy-layer rule comes from Indra Sawhney (1992), and the Department of Personnel and Training set the criteria in its office memorandum No. 36012/22/93-Estt.(SCT) of 8 September 1993, revised since; the income limit has been ₹8 lakh a year since 1 September 2017, under office memorandum No. 36033/1/2013-Estt.(Res) of 13 September 2017. For children of government employees the parents’ post decides, not their salary: children of Group A officers, or of parents who are both Group B officers, are in the creamy layer. For others, income from sources other than salary and agricultural land counts, and the family is in the creamy layer if it reaches ₹8 lakh in each of three consecutive years. Recruiters generally test non-creamy-layer status as on the closing date of the application.',
      hi: 'क्रीमी लेयर का नियम इंद्रा साहनी (1992) से आया, और कार्मिक और प्रशिक्षण विभाग ने 8 सितंबर 1993 के कार्यालय ज्ञापन सं. 36012/22/93-Estt.(SCT) में मानदंड तय किए, जिनमें बाद में बदलाव हुए; 13 सितंबर 2017 के कार्यालय ज्ञापन सं. 36033/1/2013-Estt.(Res) के तहत आय सीमा 1 सितंबर 2017 से ₹8 लाख सालाना है। सरकारी कर्मचारियों के बच्चों के लिए माता-पिता का पद तय करता है, वेतन नहीं: ग्रुप ए अधिकारियों के बच्चे, या उन माता-पिता के बच्चे जो दोनों ग्रुप बी अधिकारी हैं, क्रीमी लेयर में हैं। बाक़ियों के लिए वेतन और खेती की ज़मीन छोड़कर दूसरे स्रोतों की आय गिनी जाती है, और अगर यह लगातार तीन साल हर साल ₹8 लाख तक पहुँचे तो परिवार क्रीमी लेयर में है। भर्ती करने वाले आम तौर पर आवेदन की आख़िरी तारीख़ के हिसाब से नॉन-क्रीमी लेयर दर्जा देखते हैं।',
    },
    mistakes: {
      en: [
        'Using a state OBC certificate for a central post. If your community is not in the Central List, central recruitment does not treat you as OBC.',
        'Relying on an old certificate. A parent’s promotion into Group A can change your status, and recruiters check the date.',
        'Counting salary towards the ₹8 lakh. For government employees’ children the post decides; salary is not added to the income test.',
      ],
      hi: [
        'केंद्रीय पद के लिए राज्य का ओबीसी प्रमाणपत्र लगाना। अगर आपका समुदाय केंद्र की सूची में नहीं है, तो केंद्रीय भर्ती आपको ओबीसी नहीं मानती।',
        'पुराने प्रमाणपत्र पर भरोसा करना। माता-पिता की ग्रुप ए में पदोन्नति आपका दर्जा बदल सकती है, और भर्ती करने वाले तारीख़ देखते हैं।',
        '₹8 लाख में वेतन जोड़ना। सरकारी कर्मचारियों के बच्चों के लिए पद तय करता है; आय-जाँच में वेतन नहीं जुड़ता।',
      ],
    },
  },
  'check-central-obc-list': {
    law: {
      en: 'Article 342A, added by the 102nd Amendment in 2018, lets the President specify the socially and educationally backward classes in the Central List, and only a law made by Parliament can then include or exclude a community. After the Supreme Court’s Maratha reservation judgment in 2021 read that amendment as removing the states’ power to identify backward classes, the 105th Amendment the same year restored it: states and Union Territories keep their own lists for their own purposes. Article 338B gives the National Commission for Backward Classes constitutional status.',
      hi: '2018 के 102वें संशोधन से जोड़ा गया अनुच्छेद 342क राष्ट्रपति को केंद्र की सूची में सामाजिक और शैक्षणिक रूप से पिछड़े वर्ग निर्दिष्ट करने देता है, और उसके बाद किसी समुदाय को जोड़ने या हटाने का काम सिर्फ़ संसद का क़ानून कर सकता है। 2021 में सुप्रीम कोर्ट के मराठा आरक्षण फ़ैसले ने इस संशोधन को पिछड़े वर्गों की पहचान का राज्यों का अधिकार छीनने वाला माना, तो उसी साल 105वें संशोधन ने वह अधिकार लौटाया: राज्य और केंद्रशासित प्रदेश अपने कामों के लिए अपनी सूचियाँ रखते हैं। अनुच्छेद 338ख राष्ट्रीय पिछड़ा वर्ग आयोग को संवैधानिक दर्जा देता है।',
    },
    mistakes: {
      en: [
        'Assuming the state list decides central eligibility. Central jobs and central institutions use only the Central List.',
        'Searching one spelling. Entries often carry synonyms and sub-castes; a name missing in one spelling may appear in another.',
        'A certificate whose community name does not match the list entry. Mismatches are a common reason for rejection at document verification.',
      ],
      hi: [
        'यह मान लेना कि राज्य की सूची केंद्र की पात्रता तय करती है। केंद्रीय नौकरियाँ और केंद्रीय संस्थान सिर्फ़ केंद्र की सूची मानते हैं।',
        'सिर्फ़ एक वर्तनी खोजना। प्रविष्टियों में अक्सर पर्याय और उप-जातियाँ होती हैं; एक वर्तनी में न मिलने वाला नाम दूसरी में मिल सकता है।',
        'ऐसा प्रमाणपत्र जिसमें समुदाय का नाम सूची की प्रविष्टि से मेल न खाए। दस्तावेज़ जाँच में यह ख़ारिज होने की आम वजह है।',
      ],
    },
  },
  'women-reservation-act': {
    law: {
      en: 'The 106th Amendment inserted Article 330A (Lok Sabha), Article 332A (state assemblies) and a matching provision for the Delhi assembly, reserving as nearly as possible one-third of seats for women, including one-third of the seats reserved for Scheduled Castes and Scheduled Tribes. Article 334A says the reservation comes into effect after the relevant figures of the first census taken after the amendment have been published and a delimitation has been undertaken on them; it lasts fifteen years from then, subject to extension by Parliament, and reserved seats rotate after each delimitation. It does not cover the Rajya Sabha or the state legislative councils.',
      hi: '106वें संशोधन ने अनुच्छेद 330क (लोकसभा), अनुच्छेद 332क (राज्य विधानसभाएँ) और दिल्ली विधानसभा के लिए इसी तरह का प्रावधान जोड़ा, जो जहाँ तक संभव हो एक-तिहाई सीटें महिलाओं के लिए आरक्षित करते हैं, जिसमें अनुसूचित जातियों और जनजातियों के लिए आरक्षित सीटों का एक-तिहाई भी शामिल है। अनुच्छेद 334क कहता है कि आरक्षण संशोधन के बाद हुई पहली जनगणना के संबंधित आंकड़े प्रकाशित होने और उन पर परिसीमन होने के बाद लागू होगा; तब से यह पंद्रह साल चलेगा, संसद चाहे तो बढ़ा सकती है, और हर परिसीमन के बाद आरक्षित सीटें बदलेंगी। यह राज्यसभा या राज्यों की विधान परिषदों पर लागू नहीं होता।',
    },
    mistakes: {
      en: [
        'Assuming it applies at the next general election. It applies only once delimitation on the new census is complete.',
        'Expecting it in the Rajya Sabha. It covers the Lok Sabha, the state assemblies and the Delhi assembly only.',
        'Expecting an OBC share. The Act reserves within SC and ST seats but has no separate share for OBC women.',
      ],
      hi: [
        'यह मान लेना कि यह अगले आम चुनाव में लागू होगा। यह नई जनगणना पर परिसीमन पूरा होने के बाद ही लागू होगा।',
        'राज्यसभा में इसकी उम्मीद करना। यह सिर्फ़ लोकसभा, राज्य विधानसभाओं और दिल्ली विधानसभा पर लागू है।',
        'ओबीसी हिस्से की उम्मीद करना। अधिनियम एससी और एसटी सीटों के भीतर आरक्षण देता है, पर ओबीसी महिलाओं के लिए अलग हिस्सा नहीं।',
      ],
    },
  },
  'disability-reservation': {
    law: {
      en: 'Section 34 of the Rights of Persons with Disabilities Act, 2016 reserves at least 4% of vacancies in each group of posts: 1% each for blindness and low vision; deafness and hard of hearing; and locomotor disability, including cerebral palsy, leprosy cured, dwarfism, acid attack survivors and muscular dystrophy; and 1% together for autism, intellectual disability, specific learning disability, mental illness, and multiple disabilities. “Benchmark disability” means at least 40% of a specified disability (Section 2(r)). Section 32 reserves at least 5% of seats in government and aided higher education and allows five years’ age relaxation. In Siddaraju v State of Karnataka (2020) the Supreme Court held that the reservation applies in promotions too.',
      hi: 'दिव्यांगजन अधिकार अधिनियम, 2016 की धारा 34 पदों के हर समूह की कम से कम 4% रिक्तियाँ आरक्षित करती है: 1-1% दृष्टिहीनता और कम दृष्टि; बधिरता और कम सुनना; और चलने-फिरने की दिव्यांगता, जिसमें सेरेब्रल पाल्सी, ठीक हुआ कुष्ठ, बौनापन, तेज़ाब हमले के पीड़ित और मस्कुलर डिस्ट्रॉफ़ी शामिल हैं, के लिए; और 1% मिलाकर ऑटिज़्म, बौद्धिक दिव्यांगता, विशिष्ट अधिगम दिव्यांगता, मानसिक बीमारी और बहु-दिव्यांगता के लिए। “मानक दिव्यांगता” का मतलब किसी निर्दिष्ट दिव्यांगता का कम से कम 40% है (धारा 2(द))। धारा 32 सरकारी और सहायता प्राप्त उच्च शिक्षा में कम से कम 5% सीटें आरक्षित करती है और उम्र में पाँच साल की छूट देती है। सिद्धाराजू बनाम कर्नाटक राज्य (2020) में सुप्रीम कोर्ट ने कहा कि यह आरक्षण पदोन्नति में भी लागू होता है।',
    },
    mistakes: {
      en: [
        'Applying with a certificate below 40%. Reservation is for benchmark disabilities, and recruiters check the percentage.',
        'Thinking it replaces your category. It is horizontal: you are counted within SC, ST, OBC, EWS or unreserved as well.',
        'Assuming a post is open to every disability. Each post is identified for particular categories; check before you apply.',
      ],
      hi: [
        '40% से कम वाले प्रमाणपत्र से आवेदन करना। आरक्षण मानक दिव्यांगता के लिए है, और भर्ती करने वाले प्रतिशत जाँचते हैं।',
        'यह मानना कि यह आपकी श्रेणी की जगह लेता है। यह क्षैतिज है: आप एससी, एसटी, ओबीसी, ईडब्ल्यूएस या अनारक्षित में भी गिने जाते हैं।',
        'यह मान लेना कि हर पद हर दिव्यांगता के लिए खुला है। हर पद ख़ास श्रेणियों के लिए चिह्नित होता है; आवेदन से पहले देख लीजिए।',
      ],
    },
  },
  'reservation-private-sector': {
    law: {
      en: 'Article 16(4) permits reservation in appointments to posts under the state; it does not reach private employers, and no central law does. Article 15(5), inserted by the 93rd Amendment in 2005, lets the state make special provisions, including admission, for socially and educationally backward classes, SCs and STs in educational institutions, including private ones, aided or unaided, except minority institutions. The Supreme Court upheld it in Pramati Educational and Cultural Trust v Union of India (2014). The Central Educational Institutions (Reservation in Admission) Act, 2006 applies to central institutions. In November 2023 the Punjab and Haryana High Court struck down Haryana’s law reserving 75% of private jobs for local residents.',
      hi: 'अनुच्छेद 16(4) राज्य के अधीन पदों पर नियुक्ति में आरक्षण की अनुमति देता है; यह निजी नियोक्ताओं तक नहीं पहुँचता, और न ही कोई केंद्रीय क़ानून। 2005 के 93वें संशोधन से जोड़ा गया अनुच्छेद 15(5) राज्य को सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों, एससी और एसटी के लिए शिक्षण संस्थानों में, निजी संस्थानों समेत, सहायता प्राप्त हों या न हों, अल्पसंख्यक संस्थानों को छोड़कर, दाख़िले समेत विशेष प्रावधान करने देता है। सुप्रीम कोर्ट ने प्रमति एजुकेशनल एंड कल्चरल ट्रस्ट बनाम भारत संघ (2014) में इसे बरक़रार रखा। केंद्रीय शैक्षणिक संस्थान (दाख़िले में आरक्षण) अधिनियम, 2006 केंद्रीय संस्थानों पर लागू होता है। नवंबर 2023 में पंजाब और हरियाणा हाई कोर्ट ने हरियाणा का वह क़ानून रद्द किया जो निजी नौकरियों का 75% स्थानीय निवासियों के लिए आरक्षित करता था।',
    },
    mistakes: {
      en: [
        'Assuming every private college must follow the central quotas. It depends on the state’s law or rules for that institution.',
        'Confusing domicile quotas with caste reservation. A local-resident quota is a different thing, tested on different grounds.',
        'Treating a company’s diversity pledge as a legal right. Private-sector affirmative action is voluntary unless a law says otherwise.',
      ],
      hi: [
        'यह मान लेना कि हर निजी कॉलेज को केंद्र का आरक्षण मानना होगा। यह उस संस्थान के लिए राज्य के क़ानून या नियमों पर निर्भर है।',
        'निवास आधारित कोटे को जाति आधारित आरक्षण समझना। स्थानीय निवासी कोटा अलग चीज़ है, जिसकी परख अलग आधारों पर होती है।',
        'किसी कंपनी के विविधता वादे को क़ानूनी हक़ मानना। जब तक कोई क़ानून न कहे, निजी क्षेत्र में सकारात्मक कार्रवाई स्वैच्छिक है।',
      ],
    },
  },
  'sc-sub-classification': {
    law: {
      en: 'Davinder Singh held that sub-classification within the Scheduled Castes does not violate Article 14 or Article 341, because the SC list is not a homogeneous class. A state that sub-classifies must base it on quantifiable, empirical data showing inadequate representation of the sub-group, and the court said a state cannot set aside the entire quota for one sub-group. Four judges said the state should also evolve a policy to identify a creamy layer among SCs and STs; that was not part of the majority’s holding, and on 9 August 2024 the Union Cabinet said the Constitution as framed by Dr Ambedkar has no provision for a creamy layer among SCs and STs.',
      hi: 'दविंदर सिंह फ़ैसले ने कहा कि अनुसूचित जातियों के भीतर उप-वर्गीकरण अनुच्छेद 14 या अनुच्छेद 341 का उल्लंघन नहीं है, क्योंकि एससी सूची एक समरूप वर्ग नहीं है। उप-वर्गीकरण करने वाले राज्य को इसे उप-समूह के अपर्याप्त प्रतिनिधित्व दिखाने वाले मापने योग्य, ठोस आंकड़ों पर आधारित करना होगा, और अदालत ने कहा कि कोई राज्य पूरा कोटा किसी एक उप-समूह के लिए अलग नहीं कर सकता। चार जजों ने कहा कि राज्य को एससी और एसटी में क्रीमी लेयर पहचानने की नीति भी बनानी चाहिए; यह बहुमत के निर्णयाधार का हिस्सा नहीं था, और 9 अगस्त 2024 को केंद्रीय कैबिनेट ने कहा कि डॉ. आंबेडकर के बनाए संविधान में एससी और एसटी के लिए क्रीमी लेयर का कोई प्रावधान नहीं है।',
    },
    mistakes: {
      en: [
        'Thinking a creamy layer now applies to SCs and STs. The remarks on it were not the court’s binding holding, and no such rule has been notified.',
        'Thinking sub-classification is automatic. Nothing changes until a state makes a law or rule, backed by data.',
        'Thinking a state can give the whole quota to one group. The judgment rules that out.',
      ],
      hi: [
        'यह मानना कि अब एससी और एसटी पर क्रीमी लेयर लागू है। इस पर की गई टिप्पणियाँ अदालत का बाध्यकारी निर्णय नहीं थीं, और ऐसा कोई नियम अधिसूचित नहीं हुआ।',
        'यह मानना कि उप-वर्गीकरण अपने आप हो जाता है। जब तक राज्य आंकड़ों के साथ क़ानून या नियम न बनाए, कुछ नहीं बदलता।',
        'यह मानना कि राज्य पूरा कोटा एक समूह को दे सकता है। फ़ैसला इसकी इजाज़त नहीं देता।',
      ],
    },
  },
  'ninth-schedule': {
    law: {
      en: 'Article 31B protects the Acts listed in the Ninth Schedule from being declared void for inconsistency with fundamental rights. In Kesavananda Bharati (decided 24 April 1973) the Supreme Court held that Parliament cannot amend the Constitution’s basic structure; Waman Rao (1981) made that date the cut-off for Ninth Schedule protection; and I.R. Coelho (2007), a nine-judge bench, held that laws added after it can be struck down if they damage the basic structure, which includes the equality code of Articles 14, 15 and 16. Only a constitutional amendment passed by Parliament can add a law to the Schedule.',
      hi: 'अनुच्छेद 31ख नौवीं अनुसूची में दर्ज अधिनियमों को मौलिक अधिकारों से टकराव के आधार पर शून्य घोषित किए जाने से बचाता है। केशवानंद भारती (24 अप्रैल 1973 को तय) में सुप्रीम कोर्ट ने कहा कि संसद संविधान के मूल ढाँचे को नहीं बदल सकती; वामन राव (1981) ने यह तारीख़ नौवीं अनुसूची की सुरक्षा की कट-ऑफ़ बनाई; और आई. आर. कोएल्हो (2007) में नौ जजों की पीठ ने कहा कि इसके बाद जोड़े गए क़ानून मूल ढाँचे को नुक़सान पहुँचाएँ तो रद्द किए जा सकते हैं, जिसमें अनुच्छेद 14, 15 और 16 की समानता संहिता शामिल है। अनुसूची में क़ानून सिर्फ़ संसद से पास संविधान संशोधन ही जोड़ सकता है।',
    },
    mistakes: {
      en: [
        'Thinking a state can put its own law in the Schedule. Only Parliament can, by constitutional amendment.',
        'Thinking inclusion ends all challenges. Since 2007, post-1973 entries can be tested against the basic structure.',
        'Treating a request for inclusion as inclusion. Several states have asked; until Parliament amends the Constitution, nothing changes.',
      ],
      hi: [
        'यह मानना कि राज्य अपना क़ानून अनुसूची में डाल सकता है। सिर्फ़ संसद, संविधान संशोधन से, ऐसा कर सकती है।',
        'यह मानना कि शामिल होने से हर चुनौती ख़त्म हो जाती है। 2007 से, 1973 के बाद की प्रविष्टियों को मूल ढाँचे की कसौटी पर परखा जा सकता है।',
        'शामिल करने की माँग को शामिल होना मान लेना। कई राज्यों ने माँग की है; जब तक संसद संविधान न बदले, कुछ नहीं बदलता।',
      ],
    },
  },
};
