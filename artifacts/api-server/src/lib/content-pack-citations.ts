/**
 * Exact citations for published records: the orders, Acts and judgments each one rests
 * on, with their dates and numbers, so a reader can quote and find them.
 *
 * - STORY_CITATIONS appends a "## Citations" section to a pack story, once, and can
 *   replace its primary source with the original document. Both are logged as a revision.
 * - POLICY_CITATIONS adds official documents to a ledger record's sources (by URL, once)
 *   and can apply a dated correction to a field, which the record page shows in public.
 *
 * Every date and number here was checked against the document or, where the official
 * site could not be read, against at least two independent reports of it. A citation
 * without a `url` names a document whose official copy could not be linked reliably.
 */

export type Citation = { en: string; hi: string; url?: string };

export type StoryCitations = {
  /** The pack story's `key`. */
  key: string;
  /** YYYY-MM-DD, the day the citations were added. */
  on: string;
  /** Replace the record's primary source with the original document. */
  primary?: { source: string; sourceUrl: string; sourcePublishedOn: string | null };
  items: Citation[];
};

export type PolicyCitations = {
  slug: string;
  on: string;
  sources: Array<{ title: string; sourceType: string; publisher: string; url: string; publishedOn: string | null; isPrimary: boolean }>;
  correction?: { field: 'effectiveDate'; value: string; en: string; hi: string };
};

const INDRA_SAWHNEY: Citation = {
  en: '**Indra Sawhney v Union of India**, 1992 Supp (3) SCC 217; AIR 1993 SC 477. Nine judges, decided 16 November 1992: upheld 27% OBC reservation, required the creamy layer to be excluded, and set the 50% rule.',
  hi: '**इंद्रा साहनी बनाम भारत संघ**, 1992 Supp (3) SCC 217; AIR 1993 SC 477। नौ जज, फ़ैसला 16 नवंबर 1992: 27% ओबीसी आरक्षण सही ठहराया, क्रीमी लेयर को बाहर करना ज़रूरी किया, और 50% का नियम तय किया।',
  url: 'https://indiankanoon.org/doc/1363234/',
};
const MARATHA_2021: Citation = {
  en: '**Jaishri Laxmanrao Patil v Chief Minister, Maharashtra**, [2021] 15 SCR 715. Five judges, decided 5 May 2021: struck down the Maharashtra SEBC Act, 2018 and declined to revisit the 50% rule.',
  hi: '**जयश्री लक्ष्मणराव पाटिल बनाम मुख्यमंत्री, महाराष्ट्र**, [2021] 15 SCR 715। पाँच जज, फ़ैसला 5 मई 2021: महाराष्ट्र एसईबीसी अधिनियम, 2018 रद्द किया और 50% के नियम पर पुनर्विचार से इनकार किया।',
};
const JANHIT_ABHIYAN: Citation = {
  en: '**Janhit Abhiyan v Union of India**, 2022 INSC 1175; [2022] 14 SCR 1. Five judges, decided 7 November 2022 by 3:2: upheld the Constitution (One Hundred and Third Amendment) Act, 2019 and the 10% EWS quota.',
  hi: '**जनहित अभियान बनाम भारत संघ**, 2022 INSC 1175; [2022] 14 SCR 1। पाँच जज, 7 नवंबर 2022 को 3:2 से फ़ैसला: संविधान (एक सौ तीसरा संशोधन) अधिनियम, 2019 और 10% ईडब्ल्यूएस कोटा सही ठहराया।',
  url: 'https://api.sci.gov.in/supremecourt/2019/1827/1827_2019_1_1501_39619_Order_07-Nov-2022.pdf',
};
const DAVINDER_SINGH: Citation = {
  en: '**State of Punjab v Davinder Singh**, 2024 INSC 562. Seven judges, decided 1 August 2024 by 6:1: states may sub-classify Scheduled Castes and Scheduled Tribes; overruled E. V. Chinnaiah.',
  hi: '**पंजाब राज्य बनाम दविंदर सिंह**, 2024 INSC 562। सात जज, 1 अगस्त 2024 को 6:1 से फ़ैसला: राज्य अनुसूचित जातियों और जनजातियों का उप-वर्गीकरण कर सकते हैं; ई. वी. चिन्नैया का फ़ैसला पलटा।',
  url: 'https://api.sci.gov.in/supremecourt/2010/25536/25536_2010_1_1501_54462_Judgement_01-Aug-2024.pdf',
};
const CHINNAIAH: Citation = {
  en: '**E. V. Chinnaiah v State of Andhra Pradesh**, (2005) 1 SCC 394. Five judges, decided 5 November 2004: held that the Scheduled Castes list could not be sub-divided; overruled in 2024.',
  hi: '**ई. वी. चिन्नैया बनाम आंध्र प्रदेश राज्य**, (2005) 1 SCC 394। पाँच जज, फ़ैसला 5 नवंबर 2004: कहा कि अनुसूचित जातियों की सूची को बाँटा नहीं जा सकता; 2024 में पलटा गया।',
};
const CABINET_2024: Citation = {
  en: '**Union Cabinet briefing of 9 August 2024**: the government said the Constitution has no provision for a creamy layer in SC and ST reservation.',
  hi: '**9 अगस्त 2024 की केंद्रीय मंत्रिमंडल ब्रीफ़िंग**: सरकार ने कहा कि संविधान में एससी और एसटी आरक्षण में क्रीमी लेयर का कोई प्रावधान नहीं है।',
};
const OM_1993: Citation = {
  en: '**DoPT Office Memorandum No. 36012/22/93-Estt.(SCT), 8 September 1993**: set the creamy-layer tests (the Schedule of exclusions) for central posts.',
  hi: '**कार्मिक विभाग कार्यालय ज्ञापन सं. 36012/22/93-Estt.(SCT), 8 सितंबर 1993**: केंद्र के पदों के लिए क्रीमी लेयर की कसौटियाँ (बहिष्करणों की अनुसूची) तय कीं।',
};
const OM_2017: Citation = {
  en: '**DoPT Office Memorandum No. 36033/1/2013-Estt.(Res), 13 September 2017**: raised the creamy-layer income limit from ₹6 lakh to ₹8 lakh a year, with effect from 1 September 2017.',
  hi: '**कार्मिक विभाग कार्यालय ज्ञापन सं. 36033/1/2013-Estt.(Res), 13 सितंबर 2017**: क्रीमी लेयर की आय सीमा ₹6 लाख से बढ़ाकर ₹8 लाख सालाना की, 1 सितंबर 2017 से प्रभावी।',
  url: 'https://www.ncbc.nic.in/Writereaddata/OM8Lakha.pdf',
};
const OM_EWS: Citation = {
  en: '**DoPT Office Memorandum No. 36039/1/2019-Estt.(Res), 31 January 2019**: EWS criteria and certificate format for central posts, for direct-recruitment vacancies notified on or after 1 February 2019.',
  hi: '**कार्मिक विभाग कार्यालय ज्ञापन सं. 36039/1/2019-Estt.(Res), 31 जनवरी 2019**: केंद्र के पदों के लिए ईडब्ल्यूएस शर्तें और प्रमाणपत्र प्रारूप, 1 फ़रवरी 2019 या उसके बाद अधिसूचित सीधी भर्ती की रिक्तियों के लिए।',
};
const PANDEY_2021: Citation = {
  en: '**Report of the committee on EWS criteria** (Ajay Bhushan Pandey, V. K. Malhotra, Sanjeev Sanyal), 31 December 2021, filed with the Supreme Court the same day: recommended keeping the ₹8 lakh family-income limit.',
  hi: '**ईडब्ल्यूएस मानदंडों पर समिति की रिपोर्ट** (अजय भूषण पांडेय, वी. के. मल्होत्रा, संजीव सान्याल), 31 दिसंबर 2021, उसी दिन सुप्रीम कोर्ट में दाख़िल: ₹8 लाख की पारिवारिक आय सीमा बनाए रखने की सिफ़ारिश।',
};
const OBC_PANEL_2025: Citation = {
  en: '**Parliamentary Committee on the Welfare of Other Backward Classes**, action-taken report tabled on 8 August 2025: called revising the creamy-layer income ceiling “the need of the hour”; the ministry said no proposal was under consideration.',
  hi: '**अन्य पिछड़े वर्गों के कल्याण पर संसदीय समिति**, 8 अगस्त 2025 को पेश की गई कार्रवाई रिपोर्ट: क्रीमी लेयर आय सीमा में संशोधन को “समय की ज़रूरत” बताया; मंत्रालय ने कहा कि ऐसा कोई प्रस्ताव विचाराधीन नहीं है।',
};
const MANDAL_OM: Citation = {
  en: '**Office Memorandum of 13 August 1990**: reserved 27% of central government posts for Socially and Educationally Backward Classes on the Second Backward Classes (Mandal) Commission’s report of December 1980.',
  hi: '**13 अगस्त 1990 का कार्यालय ज्ञापन**: दूसरे पिछड़ा वर्ग (मंडल) आयोग की दिसंबर 1980 की रिपोर्ट पर केंद्र सरकार के 27% पद सामाजिक और शैक्षिक रूप से पिछड़े वर्गों के लिए आरक्षित किए।',
};
const ROHINI: Citation = {
  en: '**Commission to examine sub-categorisation of OBCs** (Justice G. Rohini), set up under Article 340 on 2 October 2017; report submitted to the President on 31 July 2023 after 14 extensions; not published.',
  hi: '**ओबीसी के उप-वर्गीकरण की जाँच के लिए आयोग** (जस्टिस जी. रोहिणी), अनुच्छेद 340 के तहत 2 अक्टूबर 2017 को गठित; 14 विस्तार के बाद 31 जुलाई 2023 को राष्ट्रपति को रिपोर्ट सौंपी; प्रकाशित नहीं।',
};
const CHAMPAKAM: Citation = {
  en: '**State of Madras v Srimathi Champakam Dorairajan**, [1951] 1 SCR 525. Decided 9 April 1951: struck down the Madras communal G.O. on admissions.',
  hi: '**मद्रास राज्य बनाम श्रीमती चंपकम दोराइराजन**, [1951] 1 SCR 525। फ़ैसला 9 अप्रैल 1951: दाख़िलों पर मद्रास का सांप्रदायिक जी.ओ. रद्द किया।',
  url: 'https://main.sci.gov.in/jonew/judis/1194.pdf',
};
const FIRST_AMENDMENT: Citation = {
  en: '**Constitution (First Amendment) Act, 1951**, in force from 18 June 1951: inserted Article 15(4) and the Ninth Schedule.',
  hi: '**संविधान (पहला संशोधन) अधिनियम, 1951**, 18 जून 1951 से लागू: अनुच्छेद 15(4) और नौवीं अनुसूची जोड़ी।',
  url: 'https://legislative.gov.in/constitution-of-india/',
};
const COELHO: Citation = {
  en: '**I. R. Coelho v State of Tamil Nadu**, (2007) 2 SCC 1. Nine judges, decided 11 January 2007: laws placed in the Ninth Schedule after 24 April 1973 can be tested against the basic structure.',
  hi: '**आई. आर. कोएल्हो बनाम तमिलनाडु राज्य**, (2007) 2 SCC 1। नौ जज, फ़ैसला 11 जनवरी 2007: 24 अप्रैल 1973 के बाद नौवीं अनुसूची में रखे गए क़ानूनों को मूल ढाँचे की कसौटी पर परखा जा सकता है।',
  url: 'https://digiscr.sci.gov.in/admin/judgement_file/judgement_pdf/2007/volume%201/Part%20I/I.%20R.%20Coelho%20%28dead%29%20By%20Lrs.%20_%20State%20Of%20Tamil%20Nadu_1701772013.pdf',
};
const NAGARAJ: Citation = {
  en: '**M. Nagaraj v Union of India**, (2006) 8 SCC 212. Five judges, decided 19 October 2006: upheld reservation in promotion subject to data on backwardness, inadequate representation and efficiency.',
  hi: '**एम. नागराज बनाम भारत संघ**, (2006) 8 SCC 212। पाँच जज, फ़ैसला 19 अक्टूबर 2006: पदोन्नति में आरक्षण सही ठहराया, बशर्ते पिछड़ेपन, अपर्याप्त प्रतिनिधित्व और दक्षता के आंकड़े हों।',
};
const JARNAIL_2018: Citation = {
  en: '**Jarnail Singh v Lachhmi Narain Gupta**, (2018) 10 SCC 396. Five judges, 2018: dropped the requirement of data on the backwardness of SCs and STs; the data on inadequate representation stays.',
  hi: '**जरनैल सिंह बनाम लच्छी नारायण गुप्ता**, (2018) 10 SCC 396। पाँच जज, 2018: एससी और एसटी के पिछड़ेपन के आंकड़ों की शर्त हटाई; अपर्याप्त प्रतिनिधित्व के आंकड़ों की शर्त बनी रही।',
};
const JARNAIL_2022: Citation = {
  en: '**Jarnail Singh v Lachhmi Narain Gupta**, Civil Appeal No. 629 of 2022 (from SLP (C) No. 30621 of 2011), decided 28 January 2022 by Justices L. Nageswara Rao, Sanjiv Khanna and B. R. Gavai: data must be collected cadre by cadre; the court declined to set a yardstick for adequacy.',
  hi: '**जरनैल सिंह बनाम लच्छी नारायण गुप्ता**, सिविल अपील सं. 629 / 2022 (एसएलपी (सी) सं. 30621 / 2011 से), फ़ैसला 28 जनवरी 2022, जस्टिस एल. नागेश्वर राव, संजीव खन्ना और बी. आर. गवई: आंकड़े कैडर-दर-कैडर जुटाने होंगे; अदालत ने पर्याप्तता का पैमाना तय करने से इनकार किया।',
  url: 'https://api.sci.gov.in/supremecourt/2011/34614/34614_2011_35_1501_32956_Judgement_28-Jan-2022.pdf',
};
const MADHURI_PATIL: Citation = {
  en: '**Kumari Madhuri Patil v Additional Commissioner, Tribal Development**, (1994) 6 SCC 241: set out how SC and ST claims are verified, including by state scrutiny committees.',
  hi: '**कुमारी माधुरी पाटिल बनाम अपर आयुक्त, जनजातीय विकास**, (1994) 6 SCC 241: तय किया कि एससी और एसटी दावों की जाँच कैसे हो, जिसमें राज्य की जाँच समितियाँ भी शामिल हैं।',
};
const BIR_SINGH: Citation = {
  en: '**Bir Singh v Delhi Jal Board**, 2018 INSC 766. Five judges, 2018: SC and ST status is tied to the state where the community is listed.',
  hi: '**बीर सिंह बनाम दिल्ली जल बोर्ड**, 2018 INSC 766। पाँच जज, 2018: एससी और एसटी का दर्जा उस राज्य से जुड़ा है जहाँ समुदाय सूचीबद्ध है।',
};
const BIHAR_HC: Citation = {
  en: '**Gaurav Kumar v State of Bihar**, Patna High Court, CWJC No. 16760 of 2023; 2024 SCC OnLine Pat 2308. Decided 20 June 2024: struck down the Bihar reservation amendment Acts of 2023 that raised the quota to 65%.',
  hi: '**गौरव कुमार बनाम बिहार राज्य**, पटना हाई कोर्ट, सीडब्ल्यूजेसी सं. 16760 / 2023; 2024 SCC OnLine Pat 2308। फ़ैसला 20 जून 2024: कोटा 65% करने वाले बिहार के 2023 के आरक्षण संशोधन अधिनियम रद्द किए।',
  url: 'https://indiankanoon.org/doc/19048737/',
};
const BIHAR_SC: Citation = {
  en: '**Supreme Court order of 29 July 2024** in the State of Bihar’s appeals: refused to stay the Patna High Court judgment and listed the appeals for hearing.',
  hi: '**29 जुलाई 2024 का सुप्रीम कोर्ट आदेश**, बिहार राज्य की अपीलों में: पटना हाई कोर्ट के फ़ैसले पर रोक से इनकार किया और अपीलें सुनवाई के लिए सूचीबद्ध कीं।',
};
const SEBC_2024: Citation = {
  en: '**Maharashtra State Reservation for Socially and Educationally Backward Classes Act, 2024** (Maharashtra Act No. XVI of 2024): passed on 20 February 2024; Governor’s assent and publication in the Maharashtra Government Gazette on 26 February 2024, the day it came into force.',
  hi: '**महाराष्ट्र राज्य सामाजिक और शैक्षिक रूप से पिछड़े वर्गों के लिए आरक्षण अधिनियम, 2024** (महाराष्ट्र अधिनियम सं. XVI / 2024): 20 फ़रवरी 2024 को पारित; राज्यपाल की स्वीकृति और महाराष्ट्र सरकार राजपत्र में प्रकाशन 26 फ़रवरी 2024 को, उसी दिन से लागू।',
  url: 'https://www.sndt.ac.in/pdf/special-cell/admission/2024/sebc-reservation-act-2024.pdf',
};
const UGC_2026: Citation = {
  en: '**University Grants Commission (Promotion of Equity in Higher Education Institutions) Regulations, 2026**, notified in the Gazette of India (Extraordinary, Part III, Section 4) on 13 January 2026, replacing the 2012 regulations.',
  hi: '**विश्वविद्यालय अनुदान आयोग (उच्च शिक्षा संस्थानों में समता का संवर्धन) विनियम, 2026**, 13 जनवरी 2026 को भारत के राजपत्र (असाधारण, भाग III, खंड 4) में अधिसूचित, 2012 के विनियमों की जगह।',
  url: 'https://www.ugc.gov.in/pdfnews/1881254_UGC-Promotion-of-Equity-in-HEIs-Regulations-2026.pdf',
};
const UGC_STAY: Citation = {
  en: '**Supreme Court interim order of 29 January 2026** in Mritunjay Tiwari v Union of India, W.P.(C) No. 101 of 2026 and connected petitions (Chief Justice Surya Kant and Justice Joymalya Bagchi): kept the 2026 regulations in abeyance and, under Article 142, continued the 2012 regulations.',
  hi: '**29 जनवरी 2026 का सुप्रीम कोर्ट का अंतरिम आदेश**, मृत्युंजय तिवारी बनाम भारत संघ, रिट याचिका (सिविल) सं. 101 / 2026 और जुड़ी याचिकाओं में (मुख्य न्यायाधीश सूर्यकांत और जस्टिस जॉयमाल्य बागची): 2026 के विनियम स्थगित रखे और अनुच्छेद 142 के तहत 2012 के विनियम जारी रखे।',
};
const CENSUS_ACT: Citation = {
  en: '**Census Act, 1948**, and the notification of 16 June 2025 under its section 3 fixing 1 March 2027 as the reference date for most of India (1 October 2026 for snow-bound areas); the notification itself did not mention caste.',
  hi: '**जनगणना अधिनियम, 1948**, और इसकी धारा 3 के तहत 16 जून 2025 की अधिसूचना, जिसने देश के ज़्यादातर हिस्से के लिए संदर्भ तिथि 1 मार्च 2027 तय की (बर्फ़ से घिरे क्षेत्रों के लिए 1 अक्टूबर 2026); अधिसूचना में जाति का ज़िक्र नहीं था।',
  url: 'https://www.indiacode.nic.in/',
};
const CCPA_2025: Citation = {
  en: '**Cabinet Committee on Political Affairs decision of 30 April 2025**: caste to be enumerated in the next census.',
  hi: '**राजनीतिक मामलों की मंत्रिमंडलीय समिति का 30 अप्रैल 2025 का फ़ैसला**: अगली जनगणना में जाति की गणना होगी।',
  url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202983',
};
const SECC_2021: Citation = {
  en: '**Union of India’s affidavit in the Supreme Court, September 2021**, in Maharashtra’s petition for SECC 2011 caste data: called the caste data unusable for official purposes. The court dismissed the petition on 15 December 2021.',
  hi: '**सितंबर 2021 में सुप्रीम कोर्ट में भारत सरकार का हलफ़नामा**, एसईसीसी 2011 के जाति आंकड़ों के लिए महाराष्ट्र की याचिका में: जाति आंकड़ों को आधिकारिक इस्तेमाल के लायक़ नहीं बताया। अदालत ने 15 दिसंबर 2021 को याचिका ख़ारिज कर दी।',
};
const POONA_PACT: Citation = {
  en: '**Poona Pact**, agreed at Yerwada Central Jail, Poona, on 24 September 1932: replaced separate electorates for the Depressed Classes with seats reserved for them within joint electorates.',
  hi: '**पूना पैक्ट**, 24 सितंबर 1932 को यरवदा सेंट्रल जेल, पूना में तय: दलित वर्गों के लिए अलग निर्वाचक मंडलों की जगह संयुक्त निर्वाचक मंडलों के भीतर आरक्षित सीटें।',
  url: 'https://constitutionofindia.net/historical-constitution/poona-pact-1932-b-r-ambedkar-and-m-k-gandhi',
};
const KOLHAPUR_1902: Citation = {
  en: '**Kolhapur State notification of 26 July 1902** (Shahu Chhatrapati): reserved half of the vacancies in state service for the backward classes. The gazette text is cited from secondary accounts; no official digitised copy was found.',
  hi: '**26 जुलाई 1902 की कोल्हापुर राज्य अधिसूचना** (शाहू छत्रपति): राज्य सेवा की आधी रिक्तियाँ पिछड़े वर्गों के लिए आरक्षित कीं। राजपत्र का पाठ द्वितीयक स्रोतों से उद्धृत है; कोई आधिकारिक डिजिटल प्रति नहीं मिली।',
};
const CONSTITUTION: Citation = {
  en: '**Constitution of India**, Articles 15(4), 15(5), 15(6), 16(4), 16(4A), 16(4B), 16(6), 330, 332, 334, 338, 338A, 338B, 340, 341, 342 and 342A, as amended.',
  hi: '**भारत का संविधान**, अनुच्छेद 15(4), 15(5), 15(6), 16(4), 16(4A), 16(4B), 16(6), 330, 332, 334, 338, 338A, 338B, 340, 341, 342 और 342A, संशोधित रूप में।',
  url: 'https://legislative.gov.in/constitution-of-india/',
};

const ON = '2026-11-11';

export const STORY_CITATIONS: StoryCitations[] = [
  { key: 'ugc-equity-regulations-2026', on: ON, primary: { source: 'University Grants Commission: UGC (Promotion of Equity in Higher Education Institutions) Regulations, 2026, Gazette of India notification of 13 January 2026', sourceUrl: 'https://www.ugc.gov.in/pdfnews/1881254_UGC-Promotion-of-Equity-in-HEIs-Regulations-2026.pdf', sourcePublishedOn: '2026-01-13' }, items: [UGC_2026, UGC_STAY] },
  { key: 'opinion-sixteen-days', on: ON, items: [UGC_2026, UGC_STAY, FIRST_AMENDMENT] },
  { key: 'census-2027-caste-count', on: ON, primary: { source: 'Press Information Bureau: Cabinet approves the scheme for the Census of India 2027', sourceUrl: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202983', sourcePublishedOn: null }, items: [CENSUS_ACT, CCPA_2025, SECC_2021] },
  { key: 'counting-caste-secc-census', on: ON, items: [SECC_2021, CCPA_2025, CENSUS_ACT, ROHINI] },
  { key: 'bihar-65-percent-law', on: ON, primary: { source: 'Patna High Court: Gaurav Kumar v. State of Bihar, CWJC No. 16760 of 2023, judgment of 20 June 2024 (full text)', sourceUrl: 'https://indiankanoon.org/doc/19048737/', sourcePublishedOn: '2024-06-20' }, items: [BIHAR_HC, BIHAR_SC, INDRA_SAWHNEY] },
  { key: 'maratha-quota-third-attempt', on: ON, primary: { source: 'Maharashtra State Reservation for Socially and Educationally Backward Classes Act, 2024 (Maharashtra Act No. XVI of 2024), text as published (copy hosted by SNDT Women’s University)', sourceUrl: 'https://www.sndt.ac.in/pdf/special-cell/admission/2024/sebc-reservation-act-2024.pdf', sourcePublishedOn: '2024-02-26' }, items: [SEBC_2024, MARATHA_2021, INDRA_SAWHNEY] },
  { key: 'states-quota-regimes', on: ON, items: [BIHAR_HC, BIHAR_SC, SEBC_2024, MARATHA_2021, COELHO, INDRA_SAWHNEY] },
  { key: 'opinion-quota-laws-built-to-fail', on: ON, items: [MARATHA_2021, BIHAR_HC, INDRA_SAWHNEY] },
  { key: 'certificate-paper-chase', on: ON, items: [OM_EWS, OM_1993, OM_2017, MADHURI_PATIL, BIR_SINGH] },
  { key: 'first-amendment-1951', on: ON, items: [CHAMPAKAM, FIRST_AMENDMENT, COELHO] },
  { key: 'start-here-reservation-record', on: ON, items: [CONSTITUTION, CHAMPAKAM, INDRA_SAWHNEY, JANHIT_ABHIYAN, DAVINDER_SINGH] },
  { key: 'constitution-article-by-article', on: ON, items: [CONSTITUTION, FIRST_AMENDMENT, CHAMPAKAM, INDRA_SAWHNEY, MARATHA_2021, JANHIT_ABHIYAN] },
  { key: 'before-1950-history', on: ON, primary: { source: 'Text of the Poona Pact, 24 September 1932 (Constitution of India project, Centre for Law and Policy Research)', sourceUrl: 'https://constitutionofindia.net/historical-constitution/poona-pact-1932-b-r-ambedkar-and-m-k-gandhi', sourcePublishedOn: '1932-09-24' }, items: [KOLHAPUR_1902, POONA_PACT, CHAMPAKAM] },
  { key: 'indra-sawhney-1992', on: ON, primary: { source: 'Supreme Court of India: Indra Sawhney v. Union of India, judgment of 16 November 1992 (full text)', sourceUrl: 'https://indiankanoon.org/doc/1363234/', sourcePublishedOn: '1992-11-16' }, items: [INDRA_SAWHNEY, MANDAL_OM, OM_1993, MARATHA_2021] },
  { key: 'promotions-quantifiable-data', on: ON, primary: { source: 'Supreme Court of India: Jarnail Singh v. Lachhmi Narain Gupta, Civil Appeal No. 629 of 2022, judgment of 28 January 2022', sourceUrl: 'https://api.sci.gov.in/supremecourt/2011/34614/34614_2011_35_1501_32956_Judgement_28-Jan-2022.pdf', sourcePublishedOn: '2022-01-28' }, items: [NAGARAJ, JARNAIL_2018, JARNAIL_2022] },
  { key: 'sc-sub-classification-2024', on: ON, primary: { source: 'Supreme Court of India: State of Punjab v. Davinder Singh, judgment of 1 August 2024', sourceUrl: 'https://api.sci.gov.in/supremecourt/2010/25536/25536_2010_1_1501_54462_Judgement_01-Aug-2024.pdf', sourcePublishedOn: '2024-08-01' }, items: [DAVINDER_SINGH, CHINNAIAH, CABINET_2024] },
  { key: 'eight-lakh-line', on: ON, primary: { source: 'DoPT Office Memorandum No. 36033/1/2013-Estt.(Res), 13 September 2017 (copy on the National Commission for Backward Classes website)', sourceUrl: 'https://www.ncbc.nic.in/Writereaddata/OM8Lakha.pdf', sourcePublishedOn: '2017-09-13' }, items: [OM_1993, OM_2017, OM_EWS, PANDEY_2021, OBC_PANEL_2025] },
  { key: 'mandal-to-rohini', on: ON, items: [MANDAL_OM, INDRA_SAWHNEY, ROHINI] },
  { key: 'ews-judgment-2022', on: ON, primary: { source: 'Supreme Court of India: Janhit Abhiyan v. Union of India, record of 7 November 2022 (judgment pronounced)', sourceUrl: 'https://api.sci.gov.in/supremecourt/2019/1827/1827_2019_1_1501_39619_Order_07-Nov-2022.pdf', sourcePublishedOn: '2022-11-07' }, items: [JANHIT_ABHIYAN, OM_EWS, PANDEY_2021, INDRA_SAWHNEY] },
  { key: 'opinion-governing-by-withholding', on: ON, items: [ROHINI, SECC_2021, OBC_PANEL_2025] },
];

const SCI = 'Supreme Court of India';

export const POLICY_CITATIONS: PolicyCitations[] = [
  {
    slug: 'sc-st-sub-classification-2024',
    on: ON,
    sources: [{ title: 'State of Punjab v. Davinder Singh, judgment of 1 August 2024 (2024 INSC 562)', sourceType: 'court', publisher: SCI, url: 'https://api.sci.gov.in/supremecourt/2010/25536/25536_2010_1_1501_54462_Judgement_01-Aug-2024.pdf', publishedOn: '2024-08-01', isPrimary: true }],
  },
  {
    slug: 'obc-creamy-layer-8-lakh-2017',
    on: ON,
    sources: [{ title: 'DoPT Office Memorandum No. 36033/1/2013-Estt.(Res), 13 September 2017 (₹8 lakh from 1 September 2017)', sourceType: 'government', publisher: 'Department of Personnel and Training (copy hosted by the National Commission for Backward Classes)', url: 'https://www.ncbc.nic.in/Writereaddata/OM8Lakha.pdf', publishedOn: '2017-09-13', isPrimary: true }],
  },
  {
    slug: 'mandal-office-memorandum-1990',
    on: ON,
    sources: [{ title: 'Indra Sawhney v. Union of India, judgment of 16 November 1992 (full text)', sourceType: 'court', publisher: 'Supreme Court of India, via Indian Kanoon', url: 'https://indiankanoon.org/doc/1363234/', publishedOn: '1992-11-16', isPrimary: true }],
  },
  {
    slug: 'maharashtra-sebc-act-2024',
    on: ON,
    sources: [{ title: 'Maharashtra State Reservation for Socially and Educationally Backward Classes Act, 2024 (Maharashtra Act No. XVI of 2024), text as published', sourceType: 'law', publisher: 'Government of Maharashtra (copy hosted by SNDT Women’s University)', url: 'https://www.sndt.ac.in/pdf/special-cell/admission/2024/sebc-reservation-act-2024.pdf', publishedOn: '2024-02-26', isPrimary: true }],
    correction: {
      field: 'effectiveDate',
      value: '2024-02-26',
      en: 'This record gave the Act’s effective date as 20 February 2024, the day the legislature passed it. The Act came into force on 26 February 2024, when the Governor’s assent was published in the Maharashtra Government Gazette.',
      hi: 'इस रिकॉर्ड में अधिनियम के लागू होने की तारीख़ 20 फ़रवरी 2024 दी गई थी, जिस दिन विधानमंडल ने इसे पारित किया। अधिनियम 26 फ़रवरी 2024 को लागू हुआ, जब राज्यपाल की स्वीकृति महाराष्ट्र सरकार राजपत्र में प्रकाशित हुई।',
    },
  },
  {
    slug: 'ugc-equity-regulations-2026',
    on: ON,
    sources: [{ title: 'UGC (Promotion of Equity in Higher Education Institutions) Regulations, 2026, Gazette of India notification of 13 January 2026', sourceType: 'regulation', publisher: 'University Grants Commission', url: 'https://www.ugc.gov.in/pdfnews/1881254_UGC-Promotion-of-Equity-in-HEIs-Regulations-2026.pdf', publishedOn: '2026-01-13', isPrimary: true }],
  },
  {
    slug: 'census-2027-caste-enumeration',
    on: ON,
    sources: [{ title: 'Cabinet approves the scheme for the Census of India 2027', sourceType: 'government', publisher: 'Press Information Bureau, Government of India', url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2202983', publishedOn: null, isPrimary: true }],
  },
  {
    slug: 'bihar-reservation-amendments-2023',
    on: ON,
    sources: [{ title: 'Gaurav Kumar v. State of Bihar, CWJC No. 16760 of 2023, judgment of 20 June 2024 (full text)', sourceType: 'court', publisher: 'Patna High Court, via Indian Kanoon', url: 'https://indiankanoon.org/doc/19048737/', publishedOn: '2024-06-20', isPrimary: true }],
  },
  {
    slug: 'reservation-in-promotion-77th-amendment',
    on: ON,
    sources: [{ title: 'Jarnail Singh v. Lachhmi Narain Gupta, Civil Appeal No. 629 of 2022, judgment of 28 January 2022', sourceType: 'court', publisher: 'Supreme Court of India', url: 'https://api.sci.gov.in/supremecourt/2011/34614/34614_2011_35_1501_32956_Judgement_28-Jan-2022.pdf', publishedOn: '2022-01-28', isPrimary: true }],
  },
  {
    slug: '103rd-constitutional-amendment-ews-reservation',
    on: ON,
    sources: [{ title: 'Janhit Abhiyan v. Union of India, record of 7 November 2022 (judgment pronounced)', sourceType: 'court', publisher: 'Supreme Court of India', url: 'https://api.sci.gov.in/supremecourt/2019/1827/1827_2019_1_1501_39619_Order_07-Nov-2022.pdf', publishedOn: '2022-11-07', isPrimary: true }],
  },

];
