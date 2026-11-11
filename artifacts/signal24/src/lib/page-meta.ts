/**
 * Titles and descriptions of the site's fixed pages, in both editions. The pages
 * (useSeo) and the page server (server/render.ts) both read them, so the HTML a
 * crawler receives first always matches what the app renders.
 */
import type { Bilingual } from './key-figures';

export type PageMeta = { title: Bilingual; description: Bilingual };

export const PAGE_META = {
  home: {
    title: { en: "The Signal 24 — Power, on the record", hi: "द सिग्नल 24 — सत्ता, दस्तावेज़ों के आईने में" },
    description: { en: "India’s governments promise. We check the paperwork. A ruthlessly sourced newsroom on reservation, courts and the state, in English and Hindi.", hi: "भारत की सरकारें वादे करती हैं। हम काग़ज़ जाँचते हैं। आरक्षण, अदालतों और सरकार पर बेरहमी से स्रोत-आधारित न्यूज़रूम, हिंदी और अंग्रेज़ी में।" },
  },
  archive: {
    title: { en: "The archive — The Signal 24", hi: "अभिलेखागार — द सिग्नल 24" },
    description: { en: "Search published reporting, court rulings, policy changes, historical documents and state records.", hi: "प्रकाशित रिपोर्टिंग, अदालती फ़ैसले, नीतिगत बदलाव, ऐतिहासिक दस्तावेज़ और राज्यों के रिकॉर्ड खोजें।" },
  },
  policies: {
    title: { en: "Policy ledger — The Signal 24", hi: "नीति रजिस्टर — द सिग्नल 24" },
    description: { en: "Search every recorded change in reservation policy: the old rule, the new rule, the legal basis, the court status and the primary sources.", hi: "आरक्षण नीति के हर दर्ज बदलाव को खोजें: पुराना नियम, नया नियम, क़ानूनी आधार, अदालत में स्थिति और मूल स्रोत।" },
  },
  opinion: {
    title: { en: "Opinion — The Signal 24", hi: "राय — द सिग्नल 24" },
    description: { en: "Signed opinion from The Signal 24: where the record leads us to take a position on how India’s governments and institutions handle reservation and representation.", hi: "द सिग्नल 24 की हस्ताक्षरित राय: जहाँ रिकॉर्ड हमें इस पर पक्ष लेने को मजबूर करता है कि भारत की सरकारें और संस्थाएँ आरक्षण और प्रतिनिधित्व को कैसे संभालती हैं।" },
  },
  topics: {
    title: { en: "Topics — The Signal 24", hi: "विषय — द सिग्नल 24" },
    description: { en: "Six desks, one record: courts, states, history, data, ground reports and the latest. Every topic file carries its brief, its dated evidence and its sources.", hi: "छह डेस्क, एक रिकॉर्ड: अदालतें, राज्य, इतिहास, आंकड़े, ज़मीनी रिपोर्टें और ताज़ा। हर विषय फ़ाइल के साथ उसका ब्रीफ़, तारीख़वार सबूत और स्रोत।" },
  },
  openCategory: {
    title: { en: "Open-category competition — The Signal 24", hi: "खुली श्रेणी की प्रतिस्पर्धा — द सिग्नल 24" },
    description: { en: "Open-category competition, UGC equity rules and EWS eligibility: what the law says, what was claimed, and what the courts actually decided.", hi: "खुली श्रेणी की प्रतिस्पर्धा, यूजीसी समता नियम और ईडब्ल्यूएस पात्रता: क़ानून क्या कहता है, क्या दावा किया गया, और अदालतों ने असल में क्या फ़ैसला दिया।" },
  },
  timeline: {
    title: { en: "Timeline — The Signal 24", hi: "समयरेखा — द सिग्नल 24" },
    description: { en: "A dated index of policy changes, court rulings and Signal 24 records, with outside leads labelled separately.", hi: "नीतिगत बदलावों, अदालती फ़ैसलों और द सिग्नल 24 के रिकॉर्ड की तारीख़वार सूची, बाहरी सुराग अलग से चिह्नित।" },
  },
  events: {
    title: { en: "Events and evidence — The Signal 24", hi: "घटनाएँ और सबूत — द सिग्नल 24" },
    description: { en: "Published events connected to The Signal 24 articles and source documents.", hi: "द सिग्नल 24 की रिपोर्टों और स्रोत दस्तावेज़ों से जुड़ी प्रकाशित घटनाएँ।" },
  },
  data: {
    title: { en: "Data room — The Signal 24", hi: "आंकड़ा कक्ष — द सिग्नल 24" },
    description: { en: "Source-linked data on reservation and representation in India, every number with its frame, and an honest account of the data the state has not released.", hi: "भारत में आरक्षण और प्रतिनिधित्व पर स्रोत-आधारित आंकड़े, हर संख्या अपने संदर्भ के साथ, और उन आंकड़ों का ईमानदार हिसाब जो सरकार ने जारी नहीं किए।" },
  },
  about: {
    title: { en: "About — The Signal 24", hi: "परिचय — The Signal 24" },
    description: { en: "The Signal 24 is a public-interest newsroom that holds India’s governments, courts, commissions and agencies to their own records on reservation and representation. We read the judgments, notifications and reports that officials assume nobody will read, so you don’t have to take anyone’s word for it. Including ours.", hi: "द सिग्नल 24 एक जनहित न्यूज़रूम है, जो आरक्षण और प्रतिनिधित्व के सवाल पर भारत की सरकारों, अदालतों, आयोगों और एजेंसियों को उनके अपने दस्तावेज़ों पर परखता है। हम वे फ़ैसले, अधिसूचनाएँ और रिपोर्टें पढ़ते हैं जिनके बारे में अफ़सर मानकर चलते हैं कि कोई नहीं पढ़ेगा, ताकि आपको किसी की बात पर आँख मूँदकर भरोसा न करना पड़े। हमारी बात पर भी नहीं।" },
  },
  standards: {
    title: { en: "Editorial standards — The Signal 24", hi: "संपादकीय मानक — The Signal 24" },
    description: { en: "Sarcasm is cheap. Being right is not. These are the rules we follow before we mock anyone else for breaking theirs.", hi: "व्यंग्य सस्ता है। सही होना नहीं। किसी और के नियम तोड़ने पर तंज़ कसने से पहले, हम इन नियमों का पालन करते हैं।" },
  },
  methodology: {
    title: { en: "Methodology — The Signal 24", hi: "कार्यप्रणाली — The Signal 24" },
    description: { en: "Numbers change meaning when their definitions disappear, which is usually why the definitions disappear. Every record here keeps its source type, date, jurisdiction and verification status attached.", hi: "परिभाषा हटते ही आंकड़ों का अर्थ बदल जाता है, और अक्सर इसीलिए परिभाषाएँ हटाई जाती हैं। यहाँ हर रिकॉर्ड के साथ उसके स्रोत का प्रकार, तारीख़, क्षेत्राधिकार और सत्यापन स्थिति जुड़ी रहती है।" },
  },
  editorialDesk: {
    title: { en: "Editorial desk — The Signal 24", hi: "संपादकीय डेस्क — द सिग्नल 24" },
    description: { en: "The desk that sources, checks and publishes every Signal 24 record, and answers for the mistakes.", hi: "वह डेस्क जो द सिग्नल 24 के हर रिकॉर्ड का स्रोत खोजती है, जाँचती है, प्रकाशित करती है, और ग़लतियों की ज़िम्मेदारी लेती है।" },
  },
  answers: {
    title: { en: "Answers: ask the state — The Signal 24", hi: "जवाब: सरकार से पूछिए — द सिग्नल 24" },
    description: { en: "Plain, sourced answers to what people actually ask about the Indian state: RTI, reservation, courts, Parliament, data and complaints. With the hard truth, and what you can do.", hi: "भारतीय राज्य के बारे में लोग जो असल में पूछते हैं, उसके सीधे, स्रोत-आधारित जवाब: आरटीआई, आरक्षण, अदालतें, संसद, आंकड़े और शिकायतें। कड़वे सच के साथ, और यह कि आप क्या कर सकते हैं।" },
  },
  states: {
    title: { en: "State by state — The Signal 24", hi: "राज्य-दर-राज्य — द सिग्नल 24" },
    description: { en: "Every Indian state and Union Territory: its reservation laws, court cases and records where we have them, and an honest gap where we don’t.", hi: "भारत का हर राज्य और केंद्रशासित प्रदेश: जहाँ हमारे पास हैं, उसके आरक्षण क़ानून, अदालती मामले और रिकॉर्ड, और जहाँ नहीं हैं, वहाँ ईमानदार कमी।" },
  },
  community: {
    title: { en: "Community: ask anything, anonymously — The Signal 24", hi: "समुदाय: गुमनाम रूप से कुछ भी पूछिए — द सिग्नल 24" },
    description: { en: "Ask questions about the Indian government and answer others, anonymously. No account, no email. Hard on institutions, never on communities.", hi: "भारत सरकार के बारे में सवाल पूछिए और दूसरों के जवाब दीजिए, गुमनाम रूप से। न खाता, न ईमेल। संस्थाओं पर सख़्त, समुदायों पर कभी नहीं।" },
  },
  search: {
    title: { en: "Search the archive — The Signal 24", hi: "अभिलेखागार खोजें — द सिग्नल 24" },
    description: { en: "Search published Signal 24 records and clearly labelled outside leads.", hi: "द सिग्नल 24 के प्रकाशित रिकॉर्ड और साफ़ चिह्नित बाहरी सुराग खोजें।" },
  },
  evidenceSearch: {
    title: { en: "Search the evidence — The Signal 24", hi: "सबूत खोजें — द सिग्नल 24" },
    description: { en: "Search published articles, events, and source documents as separate record types.", hi: "प्रकाशित रिपोर्ट, घटनाएँ और स्रोत दस्तावेज़ अलग-अलग प्रकार के रिकॉर्ड के रूप में खोजें।" },
  },
  notFound: {
    title: { en: "Page not found — The Signal 24", hi: "पेज नहीं मिला — द सिग्नल 24" },
    description: { en: "The requested page could not be found on The Signal 24.", hi: "The requested page could not be found on The Signal 24." },
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof PAGE_META;
