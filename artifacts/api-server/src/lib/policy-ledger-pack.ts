import type { PolicyTranslation } from "@workspace/db";

export type PolicyPackSource = {
  title: string;
  sourceType: string;
  publisher: string;
  url: string;
  publishedOn: string | null;
  isPrimary: boolean;
};

export type PolicyPackRecord = {
  slug: string;
  title: string;
  summary: string;
  state: string;
  sector: string;
  /** Legal status: current, historical, proposed, challenged, stayed, struck down. */
  status: string;
  authority: string;
  previousFramework: string;
  newFramework: string;
  legalBasis: string;
  courtStatus: string;
  effectiveDate: string | null;
  hi: PolicyTranslation;
  sources: PolicyPackSource[];
};

const CONSTITUTION: PolicyPackSource = {
  title: "Constitution of India",
  sourceType: "constitutional text",
  publisher: "Legislative Department, Government of India",
  url: "https://legislative.gov.in/constitution-of-india/",
  publishedOn: null,
  isPrimary: true,
};

/**
 * Policy ledger records shipped with the codebase. Each states the old rule, the new
 * rule, who decided, and where it stands in court, with the date we last checked.
 * Inserted once by slug; nothing an editor has changed is overwritten.
 */
export const POLICY_LEDGER_PACK: PolicyPackRecord[] = [
  {
    slug: "ugc-equity-regulations-2026",
    title: "UGC equity regulations, 2026: binding campus anti-discrimination rules, stayed by the Supreme Court",
    summary:
      "The UGC replaced its advisory 2012 rules with binding equity committees and helplines. The Supreme Court stayed them sixteen days later over a narrow definition of caste-based discrimination; the Centre says it is reconsidering.",
    state: "National",
    sector: "Higher education",
    status: "stayed",
    authority: "University Grants Commission",
    previousFramework:
      "UGC (Promotion of Equity in Higher Educational Institutions) Regulations, 2012: largely advisory, with limited enforcement.",
    newFramework:
      "Mandatory equity committees and 24-hour equity helplines in every institution; Regulation 3(1)(c) defined caste-based discrimination as discrimination against SC, ST and OBC members.",
    legalBasis: "UGC (Promotion of Equity in Higher Education Institutions) Regulations, 2026, notified 13 January 2026",
    courtStatus:
      "Stayed by the Supreme Court on 29 January 2026; the 2012 regulations continue under Article 142. On 5 November 2026 the Centre said it may form a committee to re-examine them. Last checked 10 November 2026.",
    effectiveDate: "2026-01-13",
    hi: {
      title: "यूजीसी समता विनियम, 2026: कैंपस भेदभाव के ख़िलाफ़ बाध्यकारी नियम, जिन पर सुप्रीम कोर्ट ने रोक लगाई",
      summary:
        "यूजीसी ने 2012 के सलाहकारी नियमों की जगह बाध्यकारी समता समितियाँ और हेल्पलाइन लाईं। जातिगत भेदभाव की संकरी परिभाषा के कारण सोलह दिन बाद सुप्रीम कोर्ट ने इन पर रोक लगा दी; केंद्र का कहना है कि वह पुनर्विचार कर रहा है।",
      sector: "उच्च शिक्षा",
      authority: "विश्वविद्यालय अनुदान आयोग",
      previousFramework: "यूजीसी (उच्च शिक्षण संस्थानों में समता संवर्धन) विनियम, 2012: ज़्यादातर सलाहकारी, सीमित अमल।",
      newFramework:
        "हर संस्थान में अनिवार्य समता समितियाँ और 24 घंटे की समता हेल्पलाइन; विनियम 3(1)(c) ने जाति-आधारित भेदभाव को एससी, एसटी और ओबीसी सदस्यों के ख़िलाफ़ भेदभाव के रूप में परिभाषित किया।",
      legalBasis: "यूजीसी (उच्च शिक्षा संस्थानों में समता संवर्धन) विनियम, 2026, 13 जनवरी 2026 को अधिसूचित",
      courtStatus:
        "29 जनवरी 2026 को सुप्रीम कोर्ट ने रोक लगाई; अनुच्छेद 142 के तहत 2012 के विनियम लागू हैं। 5 नवंबर 2026 को केंद्र ने कहा कि वह इनकी दोबारा जाँच के लिए समिति बना सकता है। आख़िरी जाँच 10 नवंबर 2026।",
    },
    sources: [
      {
        title: "Explainer: UGC's 2026 regulations for tackling discrimination in colleges",
        sourceType: "legal reporting",
        publisher: "LiveLaw",
        url: "https://www.livelaw.in/top-stories/supreme-court-ugc-promotion-of-equity-in-higher-education-institutions-regulations-2026-sc-st-obc-caste-discrimination-equity-committees-520913",
        publishedOn: "2026-01-29",
        isPrimary: false,
      },
      {
        title: "Centre to review UGC equity rules, tells Supreme Court it may form panel",
        sourceType: "news report",
        publisher: "Business Today",
        url: "https://www.businesstoday.in/india/story/centre-to-review-ugc-equity-rules-tells-supreme-court-it-may-form-panel-565970-2026-11-05",
        publishedOn: "2026-11-05",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "census-2027-caste-enumeration",
    title: "Census 2027 will enumerate caste, for the first time since 1931",
    summary:
      "The Union Cabinet decided in April 2025 to include caste in the next census. Houselisting ran from April to September 2026; caste is recorded in the population enumeration of February 2027.",
    state: "National",
    sector: "Census and statistics",
    status: "current",
    authority: "Union Cabinet; Registrar General and Census Commissioner of India",
    previousFramework:
      "Censuses since 1951 enumerated only Scheduled Castes and Scheduled Tribes. The last published full caste count was from 1931.",
    newFramework:
      "Two-phase digital census: houselisting (1 April–30 September 2026), then population enumeration in February 2027 with a 1 March 2027 reference date for most of India, including caste.",
    legalBasis: "Census Act, 1948; census notifications of the Registrar General of India",
    courtStatus:
      "Not under challenge. The caste classification method and the release timetable for caste tables have not been published. Last checked 10 November 2026.",
    effectiveDate: "2026-04-01",
    hi: {
      title: "जनगणना 2027 में जाति की गणना होगी, 1931 के बाद पहली बार",
      summary:
        "केंद्रीय कैबिनेट ने अप्रैल 2025 में अगली जनगणना में जाति शामिल करने का फ़ैसला किया। मकान सूचीकरण अप्रैल से सितंबर 2026 तक चला; जाति फ़रवरी 2027 की जनसंख्या गणना में दर्ज होगी।",
      sector: "जनगणना और आंकड़े",
      authority: "केंद्रीय कैबिनेट; भारत के महापंजीयक और जनगणना आयुक्त",
      previousFramework:
        "1951 से जनगणनाओं में केवल अनुसूचित जातियों और जनजातियों की गिनती हुई। पूरी जाति गणना आख़िरी बार 1931 में प्रकाशित हुई।",
      newFramework:
        "दो चरणों की डिजिटल जनगणना: मकान सूचीकरण (1 अप्रैल–30 सितंबर 2026), फिर फ़रवरी 2027 में जाति सहित जनसंख्या गणना, देश के ज़्यादातर हिस्से के लिए संदर्भ तिथि 1 मार्च 2027।",
      legalBasis: "जनगणना अधिनियम, 1948; भारत के महापंजीयक की जनगणना अधिसूचनाएँ",
      courtStatus:
        "कोई चुनौती नहीं। जाति वर्गीकरण का तरीक़ा और जाति तालिकाएँ जारी करने की समय-सारणी प्रकाशित नहीं हुई। आख़िरी जाँच 10 नवंबर 2026।",
    },
    sources: [
      {
        title: "Initial phase of Census 2027 to begin on April 1, houselisting within 30-day period",
        sourceType: "news report",
        publisher: "Business Today",
        url: "https://www.businesstoday.in/india/story/initial-phase-of-census-2027-to-begin-on-april-1-houselisting-to-be-done-within-30-day-period-509920-2026-01-08",
        publishedOn: "2026-01-08",
        isPrimary: false,
      },
      {
        title: "Census gazette notification with no mention of promised caste enumeration raises questions",
        sourceType: "news report",
        publisher: "The Wire",
        url: "https://m.thewire.in/article/caste/census-gazette-notification-with-no-mention-of-promised-caste-enumeration-raises-questions",
        publishedOn: "2025-06-16",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "maharashtra-sebc-act-2024",
    title: "Maharashtra’s SEBC Act, 2024 grants Marathas 10%, the state’s third attempt in ten years",
    summary:
      "Passed in a special session on 20 February 2024 on the Shukre Commission’s report. Petitions challenging it are before a full bench of the Bombay High Court, whose hearing has restarted more than once.",
    state: "Maharashtra",
    sector: "Education and public employment",
    status: "challenged",
    authority: "Maharashtra Legislature",
    previousFramework:
      "The SEBC Act, 2018 (16%, cut to 12–13% by the High Court) was struck down by the Supreme Court on 5 May 2021 for breaching the 50% ceiling without an extraordinary situation.",
    newFramework: "10% reservation for the Maratha community as a socially and educationally backward class in state education and public jobs.",
    legalBasis: "Maharashtra State Reservation for Socially and Educationally Backward Classes Act, 2024",
    courtStatus:
      "Under challenge before a full bench of the Bombay High Court; a fresh hearing began in October 2026. No final judgment as of 10 November 2026.",
    effectiveDate: "2024-02-20",
    hi: {
      title: "महाराष्ट्र का एसईबीसी अधिनियम, 2024 मराठों को 10% देता है, दस साल में राज्य की तीसरी कोशिश",
      summary:
        "शुक्रे आयोग की रिपोर्ट पर 20 फ़रवरी 2024 को विशेष सत्र में पास हुआ। इसे चुनौती देने वाली याचिकाएँ बॉम्बे हाई कोर्ट की पूर्ण पीठ के सामने हैं, जिसकी सुनवाई एक से ज़्यादा बार शुरू से हुई है।",
      sector: "शिक्षा और सरकारी नौकरियाँ",
      authority: "महाराष्ट्र विधानमंडल",
      previousFramework:
        "एसईबीसी अधिनियम, 2018 (16%, हाई कोर्ट ने 12–13% किया) को सुप्रीम कोर्ट ने 5 मई 2021 को असाधारण हालात के बिना 50% सीमा तोड़ने के कारण रद्द किया।",
      newFramework: "राज्य की शिक्षा और सरकारी नौकरियों में सामाजिक और शैक्षणिक रूप से पिछड़े वर्ग के रूप में मराठा समुदाय को 10% आरक्षण।",
      legalBasis: "महाराष्ट्र राज्य सामाजिक और शैक्षणिक रूप से पिछड़ा वर्ग आरक्षण अधिनियम, 2024",
      courtStatus:
        "बॉम्बे हाई कोर्ट की पूर्ण पीठ के सामने चुनौती; अक्टूबर 2026 में नए सिरे से सुनवाई शुरू हुई। 10 नवंबर 2026 तक कोई अंतिम फ़ैसला नहीं।",
    },
    sources: [
      {
        title: "Bombay HC begins fresh hearing on petitions challenging 10 per cent Maratha quota",
        sourceType: "news report",
        publisher: "Free Press Journal",
        url: "https://www.freepressjournal.in/mumbai/bombay-hc-begins-fresh-hearing-on-petitions-challenging-10-per-cent-maratha-quota",
        publishedOn: null,
        isPrimary: false,
      },
      {
        title: "Supreme Court strikes down Maratha reservation law, upholds 50 percent cap",
        sourceType: "legal reporting",
        publisher: "Bar & Bench",
        url: "https://www.barandbench.com/news/litigation/supreme-court-strikes-down-maratha-reservation-law-upholds-50-percent-cap-indra-sawhney",
        publishedOn: "2021-05-05",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "sc-st-sub-classification-2024",
    title: "States may sub-classify Scheduled Castes and Tribes, a seven-judge bench holds",
    summary:
      "In State of Punjab v. Davinder Singh, the Supreme Court held 6:1 that states can reserve a share within the SC and ST quota for the least-represented groups, on the basis of data.",
    state: "National",
    sector: "Education and public employment",
    status: "current",
    authority: "Supreme Court of India (Constitution Bench)",
    previousFramework: "E.V. Chinnaiah v. State of Andhra Pradesh (2004): the SC list was a single homogeneous class and could not be divided.",
    newFramework:
      "States may sub-classify SCs and STs, based on quantifiable data on inadequate representation. Four judges said a creamy-layer exclusion should be evolved; the Union Cabinet said on 9 August 2024 there was no such provision.",
    legalBasis: "State of Punjab v. Davinder Singh, decided 1 August 2024",
    courtStatus: "Binding Constitution Bench judgment. Implementation is state by state.",
    effectiveDate: "2024-08-01",
    hi: {
      title: "राज्य अनुसूचित जातियों और जनजातियों का उप-वर्गीकरण कर सकते हैं: सात जजों की पीठ",
      summary:
        "पंजाब राज्य बनाम दविंदर सिंह मामले में सुप्रीम कोर्ट ने 6:1 से कहा कि राज्य आंकड़ों के आधार पर एससी और एसटी कोटे के भीतर सबसे कम प्रतिनिधित्व वाले समूहों के लिए हिस्सा तय कर सकते हैं।",
      sector: "शिक्षा और सरकारी नौकरियाँ",
      authority: "भारत का सर्वोच्च न्यायालय (संविधान पीठ)",
      previousFramework: "ई.वी. चिन्नैया बनाम आंध्र प्रदेश (2004): एससी सूची एक समरूप वर्ग है और बाँटी नहीं जा सकती।",
      newFramework:
        "राज्य अपर्याप्त प्रतिनिधित्व के मापने योग्य आंकड़ों के आधार पर एससी और एसटी का उप-वर्गीकरण कर सकते हैं। चार जजों ने क्रीमी लेयर बाहर करने की नीति बनाने को कहा; केंद्रीय कैबिनेट ने 9 अगस्त 2024 को कहा कि ऐसा कोई प्रावधान नहीं है।",
      legalBasis: "पंजाब राज्य बनाम दविंदर सिंह, 1 अगस्त 2024 को फ़ैसला",
      courtStatus: "बाध्यकारी संविधान पीठ फ़ैसला। अमल राज्य-दर-राज्य।",
    },
    sources: [
      {
        title: "Validity of sub-classification within reserved categories",
        sourceType: "court case tracker",
        publisher: "Supreme Court Observer",
        url: "https://www.scobserver.in/court-case/scheduled-castes-preferential-treatment",
        publishedOn: "2024-08-01",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "bihar-reservation-amendments-2023",
    title: "Bihar raised reservation to 65% after its caste survey. The High Court struck it down",
    summary:
      "The 2023 amendments raised SC, ST, EBC and BC reservation from 50% to 65% in state jobs and education. The Patna High Court quashed them on 20 June 2024; the state’s appeal is pending.",
    state: "Bihar",
    sector: "Education and public employment",
    status: "struck down",
    authority: "Bihar Legislature",
    previousFramework: "50% reservation for SC, ST, EBC and BC in state posts and education, plus 10% EWS.",
    newFramework: "65% for SC, ST, EBC and BC (75% including EWS), based on the October 2023 caste survey.",
    legalBasis:
      "Bihar Reservation of Vacancies in Posts and Services (Amendment) Act, 2023; Bihar (In Admission in Educational Institutions) Reservation (Amendment) Act, 2023",
    courtStatus:
      "Struck down by the Patna High Court on 20 June 2024 (Articles 14, 15, 16). The Supreme Court refused a stay on 29 July 2024; appeals pending, no final judgment found as of 10 November 2026.",
    effectiveDate: "2023-11-21",
    hi: {
      title: "जाति सर्वेक्षण के बाद बिहार ने आरक्षण 65% किया। हाई कोर्ट ने इसे रद्द कर दिया",
      summary:
        "2023 के संशोधनों ने राज्य की नौकरियों और शिक्षा में एससी, एसटी, ईबीसी और बीसी का आरक्षण 50% से 65% किया। पटना हाई कोर्ट ने 20 जून 2024 को इन्हें रद्द किया; राज्य की अपील लंबित है।",
      sector: "शिक्षा और सरकारी नौकरियाँ",
      authority: "बिहार विधानमंडल",
      previousFramework: "राज्य के पदों और शिक्षा में एससी, एसटी, ईबीसी और बीसी के लिए 50%, साथ में 10% ईडब्ल्यूएस।",
      newFramework: "अक्टूबर 2023 के जाति सर्वेक्षण के आधार पर एससी, एसटी, ईबीसी और बीसी के लिए 65% (ईडब्ल्यूएस मिलाकर 75%)।",
      legalBasis: "बिहार पदों और सेवाओं की रिक्तियों में आरक्षण (संशोधन) अधिनियम, 2023; बिहार (शैक्षणिक संस्थानों में प्रवेश में) आरक्षण (संशोधन) अधिनियम, 2023",
      courtStatus:
        "पटना हाई कोर्ट ने 20 जून 2024 को रद्द किया (अनुच्छेद 14, 15, 16)। सुप्रीम कोर्ट ने 29 जुलाई 2024 को रोक से इनकार किया; अपीलें लंबित, 10 नवंबर 2026 तक कोई अंतिम फ़ैसला नहीं मिला।",
    },
    sources: [
      {
        title: "What is the Bihar government’s 65 percent reservation quota challenge in the Supreme Court?",
        sourceType: "court case tracker",
        publisher: "Supreme Court Observer",
        url: "https://www.scobserver.in/journal/what-is-the-bihar-governments-65-percent-reservation-quota-challenge-in-the-supreme-court/",
        publishedOn: "2024-07-29",
        isPrimary: false,
      },
      {
        title: "Supreme Court refuses stay on Patna High Court decision quashing Bihar reservation law",
        sourceType: "legal reporting",
        publisher: "Bar & Bench",
        url: "https://www.barandbench.com/news/litigation/supreme-court-refuses-stay-patna-high-court-decision-quash-bihar-reservation-law",
        publishedOn: "2024-07-29",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "obc-creamy-layer-8-lakh-2017",
    title: "The OBC creamy-layer ceiling was raised to ₹8 lakh in 2017, and has not moved since",
    summary:
      "The income limit that decides which OBC families are excluded from the quota was raised from ₹6 lakh to ₹8 lakh in 2017. A parliamentary committee in 2025 called its revision the need of the hour.",
    state: "National",
    sector: "Central government employment and education",
    status: "current",
    authority: "Department of Personnel and Training, Government of India",
    previousFramework: "Creamy-layer income ceiling of ₹6 lakh a year (fixed in 2013).",
    newFramework:
      "Creamy-layer income ceiling of ₹8 lakh a year. The same figure was later adopted as the EWS income limit in 2019, though the two tests count income differently.",
    legalBasis: "DoPT Office Memorandum of September 2017, under Indra Sawhney v. Union of India (1992)",
    courtStatus:
      "Not under challenge. In August 2025 a parliamentary committee said revising the ceiling was the need of the hour; no revision has been notified as of 10 November 2026.",
    effectiveDate: "2017-09-01",
    hi: {
      title: "ओबीसी क्रीमी लेयर की सीमा 2017 में ₹8 लाख की गई, और तब से नहीं हिली",
      summary:
        "कौन-से ओबीसी परिवार आरक्षण से बाहर होंगे, यह तय करने वाली आय सीमा 2017 में ₹6 लाख से ₹8 लाख की गई। 2025 में एक संसदीय समिति ने इसके संशोधन को समय की ज़रूरत बताया।",
      sector: "केंद्र सरकार की नौकरियाँ और शिक्षा",
      authority: "कार्मिक एवं प्रशिक्षण विभाग, भारत सरकार",
      previousFramework: "क्रीमी लेयर की आय सीमा ₹6 लाख सालाना (2013 में तय)।",
      newFramework:
        "क्रीमी लेयर की आय सीमा ₹8 लाख सालाना। यही आंकड़ा 2019 में ईडब्ल्यूएस की आय सीमा के रूप में भी अपनाया गया, हालाँकि दोनों कसौटियाँ आय को अलग-अलग तरह गिनती हैं।",
      legalBasis: "सितंबर 2017 का डीओपीटी कार्यालय ज्ञापन, इंद्रा साहनी बनाम भारत संघ (1992) के तहत",
      courtStatus:
        "कोई चुनौती नहीं। अगस्त 2025 में संसदीय समिति ने सीमा के संशोधन को समय की ज़रूरत बताया; 10 नवंबर 2026 तक कोई संशोधन अधिसूचित नहीं।",
    },
    sources: [
      {
        title: "Need of the hour to revise creamy layer ceiling for OBCs: Parliamentary panel",
        sourceType: "news report",
        publisher: "Business Standard",
        url: "https://www.business-standard.com/india-news/need-of-the-hour-to-revise-creamy-layer-ceiling-for-obcs-parl-panel-125080800995_1.html",
        publishedOn: "2025-08-08",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "reservation-in-promotion-77th-amendment",
    title: "The 77th Amendment allowed reservation in promotions, on conditions the courts keep restating",
    summary:
      "After Indra Sawhney barred reservation in promotions, Parliament inserted Article 16(4A) in 1995. Courts have since required quantifiable data on inadequate representation, cadre by cadre.",
    state: "National",
    sector: "Public employment",
    status: "current",
    authority: "Parliament of India",
    previousFramework: "Indra Sawhney (1992) held that Article 16(4) did not permit reservation in promotions, prospectively after five years.",
    newFramework:
      "Article 16(4A) permits reservation in promotion for SCs and STs who are not adequately represented in the services, later extended to consequential seniority (85th Amendment, 2001).",
    legalBasis: "Constitution (Seventy-seventh Amendment) Act, 1995",
    courtStatus:
      "Upheld in M. Nagaraj (2006) subject to quantifiable data; Jarnail Singh (2018) dropped the backwardness-data requirement for SCs and STs; Jarnail Singh (2022) required data cadre by cadre.",
    effectiveDate: "1995-06-17",
    hi: {
      title: "77वें संशोधन ने पदोन्नति में आरक्षण की इजाज़त दी, उन शर्तों पर जिन्हें अदालतें बार-बार दोहराती हैं",
      summary:
        "इंद्रा साहनी ने पदोन्नति में आरक्षण रोका, तो संसद ने 1995 में अनुच्छेद 16(4A) जोड़ा। तब से अदालतें कैडर-दर-कैडर अपर्याप्त प्रतिनिधित्व के मापने योग्य आंकड़े माँगती रही हैं।",
      sector: "सरकारी नौकरियाँ",
      authority: "भारत की संसद",
      previousFramework: "इंद्रा साहनी (1992) ने कहा कि अनुच्छेद 16(4) पदोन्नति में आरक्षण की इजाज़त नहीं देता, पाँच साल बाद से लागू।",
      newFramework:
        "अनुच्छेद 16(4A) सेवाओं में अपर्याप्त प्रतिनिधित्व वाली अनुसूचित जातियों और जनजातियों के लिए पदोन्नति में आरक्षण की इजाज़त देता है, जिसे बाद में परिणामी वरिष्ठता तक बढ़ाया गया (85वाँ संशोधन, 2001)।",
      legalBasis: "संविधान (सतहत्तरवाँ संशोधन) अधिनियम, 1995",
      courtStatus:
        "एम. नागराज (2006) में मापने योग्य आंकड़ों की शर्त पर बरक़रार; जरनैल सिंह (2018) ने एससी/एसटी के लिए पिछड़ेपन के आंकड़ों की शर्त हटाई; जरनैल सिंह (2022) ने कैडर-दर-कैडर आंकड़े माँगे।",
    },
    sources: [
      CONSTITUTION,
      {
        title: "Reservation in promotion: the 6 issues settled by the Supreme Court on quantifiable data",
        sourceType: "legal reporting",
        publisher: "SCC Online",
        url: "https://www.scconline.com/blog/post/2022/01/31/reservation-in-promotion-the-6-issues-settled-by-supreme-court-on-collection-of-quantifiable-data-showing-inadequacy-of-representation/",
        publishedOn: "2022-01-31",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "mandal-office-memorandum-1990",
    title: "The 1990 office memorandum that brought 27% OBC reservation to central government jobs",
    summary:
      "A decade after the Mandal Commission reported, the V.P. Singh government reserved 27% of central civil posts for socially and educationally backward classes. The Supreme Court upheld it in 1992, with conditions.",
    state: "National",
    sector: "Central government employment",
    status: "current",
    authority: "Department of Personnel and Training, Government of India",
    previousFramework: "Central government reservation for SCs (15%) and STs (7.5%) only; the Mandal report (1980) unimplemented.",
    newFramework: "27% reservation for socially and educationally backward classes in central civil posts and services.",
    legalBasis: "DoPT Office Memorandum of 13 August 1990, on the Second Backward Classes Commission report",
    courtStatus:
      "Upheld in Indra Sawhney v. Union of India (16 November 1992), with a creamy-layer exclusion and a 50% ceiling on total reservation.",
    effectiveDate: "1990-08-13",
    hi: {
      title: "1990 का वह कार्यालय ज्ञापन जिसने केंद्र सरकार की नौकरियों में 27% ओबीसी आरक्षण लाया",
      summary:
        "मंडल आयोग की रिपोर्ट के दस साल बाद वी.पी. सिंह सरकार ने केंद्र के सिविल पदों का 27% सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों के लिए आरक्षित किया। सुप्रीम कोर्ट ने 1992 में शर्तों के साथ इसे बरक़रार रखा।",
      sector: "केंद्र सरकार की नौकरियाँ",
      authority: "कार्मिक एवं प्रशिक्षण विभाग, भारत सरकार",
      previousFramework: "केंद्र सरकार में केवल अनुसूचित जातियों (15%) और जनजातियों (7.5%) के लिए आरक्षण; मंडल रिपोर्ट (1980) लागू नहीं।",
      newFramework: "केंद्र के सिविल पदों और सेवाओं में सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों के लिए 27% आरक्षण।",
      legalBasis: "13 अगस्त 1990 का डीओपीटी कार्यालय ज्ञापन, दूसरे पिछड़ा वर्ग आयोग की रिपोर्ट पर",
      courtStatus: "इंद्रा साहनी बनाम भारत संघ (16 नवंबर 1992) में क्रीमी लेयर को बाहर रखने और कुल आरक्षण पर 50% सीमा के साथ बरक़रार।",
    },
    sources: [
      {
        title: "Indra Sawhney v. Union of India (16 November 1992)",
        sourceType: "court judgment",
        publisher: "Supreme Court of India, via Indian Kanoon",
        url: "https://indiankanoon.org/search/?formInput=Indra%20Sawhney%20vs%20Union%20of%20India%2016%20November%201992",
        publishedOn: "1992-11-16",
        isPrimary: true,
      },
      {
        title: "The Mandal Commission decoded: how OBC reservation came into effect",
        sourceType: "news report",
        publisher: "Business Standard",
        url: "https://business-standard.com/india-news/the-mandal-commission-decoded-how-obc-reservation-came-into-effect-123102000445_1.html",
        publishedOn: "2023-10-20",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "first-amendment-article-15-4-1951",
    title: "The First Amendment inserted Article 15(4) after a Madras admissions case",
    summary:
      "The Supreme Court struck down Madras’s communal admissions order in April 1951. Parliament added Article 15(4) ten weeks later, the foundation for reservation in education.",
    state: "National",
    sector: "Education",
    status: "current",
    authority: "Provisional Parliament of India",
    previousFramework:
      "Article 15 prohibited discrimination; State of Madras v. Champakam Dorairajan (9 April 1951) held it did not permit community-wise allocation of college seats.",
    newFramework:
      "Article 15(4): the state may make special provisions for socially and educationally backward classes and for Scheduled Castes and Scheduled Tribes.",
    legalBasis: "Constitution (First Amendment) Act, 1951",
    courtStatus: "Part of the Constitution; the basis of later education reservation laws.",
    effectiveDate: "1951-06-18",
    hi: {
      title: "मद्रास के एक दाख़िला मामले के बाद पहले संशोधन ने अनुच्छेद 15(4) जोड़ा",
      summary:
        "सुप्रीम कोर्ट ने अप्रैल 1951 में मद्रास का सांप्रदायिक दाख़िला आदेश रद्द किया। दस हफ़्ते बाद संसद ने अनुच्छेद 15(4) जोड़ा, जो शिक्षा में आरक्षण की नींव है।",
      sector: "शिक्षा",
      authority: "भारत की अंतरिम संसद",
      previousFramework:
        "अनुच्छेद 15 भेदभाव रोकता था; मद्रास राज्य बनाम चंपकम दोरैराजन (9 अप्रैल 1951) ने कहा कि यह कॉलेज सीटों के समुदायवार बँटवारे की इजाज़त नहीं देता।",
      newFramework:
        "अनुच्छेद 15(4): सरकार सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों और अनुसूचित जातियों व जनजातियों के लिए विशेष प्रावधान कर सकती है।",
      legalBasis: "संविधान (पहला संशोधन) अधिनियम, 1951",
      courtStatus: "संविधान का हिस्सा; शिक्षा में बाद के आरक्षण क़ानूनों का आधार।",
    },
    sources: [
      CONSTITUTION,
      {
        title: "State of Madras v. Srimathi Champakam Dorairajan, [1951] 1 SCR 525",
        sourceType: "court judgment",
        publisher: "Supreme Court of India",
        url: "https://main.sci.gov.in/jonew/judis/1194.pdf",
        publishedOn: "1951-04-09",
        isPrimary: true,
      },
    ],
  },
];
