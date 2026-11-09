/**
 * Accountability Watch: questions the state has not answered, each tied to a
 * public source. Wording stays inside what the cited reporting establishes;
 * where we could not confirm something, the text says so instead of asserting it.
 * Update `checkedOn` whenever an item is re-verified.
 */
export type AccountabilityItem = {
  id: string;
  status: { en: string; hi: string };
  since: string;
  question: { en: string; hi: string };
  record: { en: string; hi: string };
  ask: { en: string; hi: string };
  sources: Array<{ name: string; url: string }>;
};

export const ACCOUNTABILITY_CHECKED_ON = '2026-11-09';

export const ACCOUNTABILITY_ITEMS: AccountabilityItem[] = [
  {
    id: 'rohini-commission',
    status: { en: 'In a drawer since 2023', hi: '2023 से दराज़ में' },
    since: '2023-07-31',
    question: {
      en: 'Where is the Rohini Commission report on OBC sub-categorisation?',
      hi: 'ओबीसी उप-वर्गीकरण पर रोहिणी आयोग की रिपोर्ट कहाँ है?',
    },
    record: {
      en: 'The commission was set up in 2017 to examine how the 27% OBC quota is shared among more than 2,600 listed communities. After 14 extensions it submitted its report to the President on 31 July 2023. Its findings have not been made public. In 2024, ThePrint described the report as in “cold storage”. Almost six years, fourteen extensions, zero pages released. The freezer, at least, is working.',
      hi: 'यह आयोग 2017 में यह जाँचने के लिए बना था कि 27% ओबीसी आरक्षण 2,600 से ज़्यादा सूचीबद्ध समुदायों में कैसे बँट रहा है। 14 बार कार्यकाल बढ़ने के बाद इसने 31 जुलाई 2023 को राष्ट्रपति को रिपोर्ट सौंपी। इसके निष्कर्ष आज तक सार्वजनिक नहीं किए गए। 2024 में ‘द प्रिंट’ ने लिखा कि रिपोर्ट “ठंडे बस्ते” में है। लगभग छह साल, चौदह विस्तार, और एक भी पन्ना सार्वजनिक नहीं। ठंडा बस्ता, कम से कम, ठीक काम कर रहा है।',
    },
    ask: {
      en: 'Table the report in Parliament and publish the data it relied on.',
      hi: 'रिपोर्ट संसद में रखी जाए और जिन आंकड़ों पर वह टिकी है, वे सार्वजनिक हों।',
    },
    sources: [
      { name: 'ThePrint', url: 'https://theprint.in/india/governance/rohini-commission-report-on-obc-sub-categorisation-in-cold-storage-as-sc-gives-nod-to-sc-st-sub-quota/2202938' },
      { name: 'SCC Online', url: 'https://scconline.com/blog/?p=321457' },
    ],
  },
  {
    id: 'secc-2011',
    status: { en: 'Collected, then “unusable”', hi: 'जुटाए, फिर “बेकार”' },
    since: '2021-12-15',
    question: {
      en: 'Why was the caste data from the 2011 Socio-Economic and Caste Census never released?',
      hi: '2011 की सामाजिक-आर्थिक और जाति जनगणना (SECC) के जाति आंकड़े कभी जारी क्यों नहीं हुए?',
    },
    record: {
      en: 'Public money was spent collecting caste data from households across India. In 2016, the government told a parliamentary committee that 98.87% of individual caste and religion data was error-free. In 2021, it told the Supreme Court the same caste data was “unusable”, and the Court declined to order its release. The data was 98.87% fine, it seems, right up until someone asked to read it.',
      hi: 'जनता के पैसे से देश भर के घरों से जाति के आंकड़े जुटाए गए। 2016 में सरकार ने संसदीय समिति से कहा कि व्यक्तियों की जाति और धर्म से जुड़े 98.87% आंकड़े त्रुटिरहित हैं। 2021 में उसी सरकार ने सुप्रीम कोर्ट से कहा कि ये जाति आंकड़े “इस्तेमाल लायक नहीं” हैं, और अदालत ने इन्हें जारी करने का आदेश देने से इनकार कर दिया। लगता है आंकड़े तब तक 98.87% ठीक थे, जब तक किसी ने उन्हें पढ़ना नहीं चाहा।',
    },
    ask: {
      en: 'Publish the raw data with its error audit, so the public can judge it.',
      hi: 'कच्चे आंकड़े उनकी त्रुटि-जाँच के साथ जारी किए जाएँ, ताकि जनता ख़ुद परख सके।',
    },
    sources: [
      { name: 'The Leaflet', url: 'https://theleaflet.in/centre-tells-sc-that-it-did-not-make-results-of-2011-caste-census-public-because-it-is-flawed/' },
      { name: 'Verdictum', url: 'https://www.verdictum.in/top-stories/supreme-court-dismisses-maharashtras-plea-to-direct-centre-to-disclose-secc-2011-raw-caste-data-of-obcs-1343960' },
    ],
  },
  {
    id: 'census-2027-caste',
    status: { en: 'Promised loudly, notified quietly', hi: 'वादा ज़ोर से, अधिसूचना चुपके से' },
    since: '2025-06-16',
    question: {
      en: 'Will Census 2027 actually count caste, and will the tables be published?',
      hi: 'क्या जनगणना 2027 में सच में जाति गिनी जाएगी, और क्या उसकी तालिकाएँ प्रकाशित होंगी?',
    },
    record: {
      en: 'The government has said the next census, with a reference date of 1 March 2027, will enumerate caste for the first time since 1931. The Wire reported that the 16 June 2025 gazette notification for the census did not mention caste enumeration, and officials did not explain why. A caste census whose own notification forgets to mention caste is, at minimum, an innovative format.',
      hi: 'सरकार ने कहा है कि अगली जनगणना, जिसकी संदर्भ तिथि 1 मार्च 2027 है, 1931 के बाद पहली बार जाति गिनेगी। ‘द वायर’ के मुताबिक़ 16 जून 2025 की जनगणना अधिसूचना में जाति गणना का ज़िक्र ही नहीं था, और अधिकारियों ने इसकी कोई वजह नहीं बताई। जाति जनगणना, जिसकी अपनी अधिसूचना जाति का ज़िक्र करना भूल जाए, कम से कम एक अनोखा प्रयोग ज़रूर है।',
    },
    ask: {
      en: 'Publish the caste schedule, the category list and a release date for the tables.',
      hi: 'जाति प्रश्नावली, श्रेणियों की सूची और तालिकाएँ जारी करने की तारीख़ सार्वजनिक की जाए।',
    },
    sources: [
      { name: 'The Wire', url: 'https://m.thewire.in/article/caste/census-gazette-notification-with-no-mention-of-promised-caste-enumeration-raises-questions' },
      { name: 'The Wire', url: 'https://thewire.in/government/census-2027-caste-enumeration-population-amit-shah-delay' },
    ],
  },
  {
    id: 'creamy-layer-ceiling',
    status: { en: 'Untouched since 2017', hi: '2017 से अछूती' },
    since: '2017-09-13',
    question: {
      en: 'Why has the OBC creamy-layer income limit not been revised since 2017?',
      hi: 'ओबीसी क्रीमी लेयर की आय सीमा 2017 से क्यों नहीं बदली गई?',
    },
    record: {
      en: 'The ₹8 lakh ceiling was set in September 2017 and is meant to be reviewed periodically. In August 2025, Parliament’s committee on OBC welfare called revision the “need of the hour”. The Ministry of Social Justice told the committee there was no proposal under consideration. Prices have risen every year since 2017. The ceiling has shown admirable restraint.',
      hi: '₹8 लाख की सीमा सितंबर 2017 में तय हुई थी और इसकी समय-समय पर समीक्षा होनी थी। अगस्त 2025 में ओबीसी कल्याण पर संसदीय समिति ने संशोधन को “समय की ज़रूरत” बताया। सामाजिक न्याय मंत्रालय ने समिति से कहा कि ऐसा कोई प्रस्ताव विचाराधीन नहीं है। 2017 से महँगाई हर साल बढ़ी है। सीमा ने ग़ज़ब का संयम दिखाया है।',
    },
    ask: {
      en: 'Publish the inflation and income data behind keeping the ceiling where it is.',
      hi: 'सीमा न बदलने के फ़ैसले के पीछे के महँगाई और आय के आंकड़े सार्वजनिक किए जाएँ।',
    },
    sources: [
      { name: 'Business Standard', url: 'https://www.business-standard.com/india-news/need-of-the-hour-to-revise-creamy-layer-ceiling-for-obcs-parl-panel-125080800995_1.html' },
    ],
  },
  {
    id: 'ews-eight-lakh',
    status: { en: 'Number? What number?', hi: 'गिनती? कौन-सी गिनती?' },
    since: '2021-12-31',
    question: {
      en: 'How many families does the ₹8 lakh EWS line actually cover?',
      hi: 'ईडब्ल्यूएस की ₹8 लाख की रेखा असल में कितने परिवारों को कवर करती है?',
    },
    record: {
      en: 'After the Supreme Court questioned the basis for the EWS income limit, a government-appointed committee reported on 31 December 2021 that ₹8 lakh struck a “fine balance”, and the Centre told the Court it would keep it. We could not find any official estimate of how many families fall under the line. A “fine balance”, it turns out, does not need to know what it is balancing.',
      hi: 'सुप्रीम कोर्ट ने जब ईडब्ल्यूएस आय सीमा का आधार पूछा, तो सरकार की बनाई समिति ने 31 दिसंबर 2021 को कहा कि ₹8 लाख “संतुलित” सीमा है, और केंद्र ने अदालत को बताया कि वह इसे बनाए रखेगा। कितने परिवार इस रेखा के भीतर आते हैं, इसका कोई आधिकारिक अनुमान हमें नहीं मिला। पता चला कि “संतुलित” सीमा को यह जानने की ज़रूरत नहीं कि वह तौल क्या रही है।',
    },
    ask: {
      en: 'Publish the eligible-population estimate and how it was calculated.',
      hi: 'पात्र आबादी का अनुमान और उसे निकालने का तरीक़ा सार्वजनिक किया जाए।',
    },
    sources: [
      { name: 'ThePrint', url: 'https://theprint.in/india/centre-tells-sc-that-it-has-decided-to-retain-rs-8-lakh-income-criteria-for-determining-ews/793409' },
    ],
  },
];
