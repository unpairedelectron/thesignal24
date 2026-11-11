/**
 * The people whose names go on Signal 24 records. Pure data and helpers: the web app
 * and the page server (server/render.ts) both read this file.
 *
 * A story's byline is stored in the database (stories.byline) and must equal an
 * author's English name exactly to link to their profile. The API assigns pack
 * stories by desk in artifacts/api-server/src/lib/authors.ts, and lists the profile
 * URLs in the sitemap; keep the names and slugs there in sync with this file.
 *
 * Bios describe each person's beat and method at The Signal 24 only. Do not add
 * degrees, past employers, awards or other claims unless they are true and checkable.
 */
import type { Bilingual } from './key-figures';

export type Author = {
  slug: string;
  name: Bilingual;
  role: Bilingual;
  /** One line: what this person covers. */
  beat: Bilingual;
  bio: Bilingual;
  /** What they check before a record goes out under their name. */
  method: Bilingual;
  /** Desks (API topic values) this person writes for. */
  topics: string[];
  knowsAbout: string[];
};

export const AUTHORS: Author[] = [
  {
    slug: 'ishaan-mishra',
    name: { en: 'Ishaan Mishra', hi: 'इशान मिश्रा' },
    role: { en: 'Courts and policy correspondent', hi: 'अदालत और नीति संवाददाता' },
    beat: { en: 'The Supreme Court, the High Courts and the orders that decide who gets a seat.', hi: 'सुप्रीम कोर्ट, हाई कोर्ट और वे आदेश जो तय करते हैं कि सीट किसे मिलेगी।' },
    bio: {
      en: 'Ishaan Mishra reads the judgments so readers do not have to take a press release’s word for them. The beat runs from Indra Sawhney to the EWS case and the sub-classification bench, and every interim stay is followed until it is lifted, decided or quietly forgotten.',
      hi: 'इशान मिश्रा फ़ैसले पढ़ते हैं, ताकि पाठकों को किसी प्रेस विज्ञप्ति की बात पर भरोसा न करना पड़े। यह बीट इंद्रा साहनी से लेकर ईडब्ल्यूएस मामले और उप-वर्गीकरण वाली पीठ तक जाती है, और हर अंतरिम रोक पर तब तक नज़र रहती है जब तक वह हटे, तय हो या चुपचाप भुला न दी जाए।',
    },
    method: {
      en: 'Quotes the operative paragraph, not the headnote. Names the bench, the case number and the date, and says plainly whether an order is final, interim or stayed.',
      hi: 'हेडनोट नहीं, आदेश का असली पैराग्राफ़ उद्धृत करते हैं। पीठ, मामला संख्या और तारीख़ बताते हैं, और साफ़ लिखते हैं कि आदेश अंतिम है, अंतरिम है या उस पर रोक है।',
    },
    topics: ['Courts & Policy'],
    knowsAbout: ['Supreme Court of India', 'Reservation in India', 'Indian constitutional law', 'Judicial review'],
  },
  {
    slug: 'meera-pandey',
    name: { en: 'Meera Pandey', hi: 'मीरा पांडे' },
    role: { en: 'States correspondent', hi: 'राज्य संवाददाता' },
    beat: { en: 'State quota laws, the 50% ceiling, and what happens when a state tests it.', hi: 'राज्यों के आरक्षण क़ानून, 50% की सीमा, और जब कोई राज्य उसे परखता है तो क्या होता है।' },
    bio: {
      en: 'Meera Pandey covers reservation where it is legislated most often: in the states. From Bihar’s 65% law to Maharashtra’s three Maratha statutes and Tamil Nadu’s Ninth Schedule shield, the work is to put each law next to the data it claimed and the court that tested it.',
      hi: 'मीरा पांडे आरक्षण को वहाँ कवर करती हैं जहाँ उस पर सबसे ज़्यादा क़ानून बनते हैं: राज्यों में। बिहार के 65% क़ानून से लेकर महाराष्ट्र के तीन मराठा क़ानूनों और तमिलनाडु की नौवीं अनुसूची की ढाल तक, काम यह है कि हर क़ानून को उस डेटा के साथ रखा जाए जिसका उसने दावा किया, और उस अदालत के साथ जिसने उसे परखा।',
    },
    method: {
      en: 'Works from the state gazette and the assembly record. Every state figure carries its year and source, and a law is never described as in force while a court has stayed it.',
      hi: 'राज्य के राजपत्र और विधानसभा के रिकॉर्ड से काम करती हैं। राज्य का हर आंकड़ा अपने वर्ष और स्रोत के साथ आता है, और जिस क़ानून पर अदालत की रोक है उसे कभी लागू नहीं बताया जाता।',
    },
    topics: ['States'],
    knowsAbout: ['State reservation laws in India', 'Bihar', 'Maharashtra', 'Tamil Nadu', 'Maratha reservation'],
  },
  {
    slug: 'anurag-dubey',
    name: { en: 'Anurag Dubey', hi: 'अनुराग दुबे' },
    role: { en: 'Data editor', hi: 'डेटा संपादक' },
    beat: { en: 'The census, the SECC, and the numbers the state collects and then sits on.', hi: 'जनगणना, एसईसीसी, और वे आंकड़े जिन्हें सरकार जमा करती है और फिर दबाकर बैठ जाती है।' },
    bio: {
      en: 'Anurag Dubey edits the data room. That means the caste census, the unpublished SECC 2011 tables, the creamy-layer and EWS income lines, and representation figures that only mean something with their denominator attached.',
      hi: 'अनुराग दुबे आंकड़ा कक्ष का संपादन करते हैं। यानी जाति जनगणना, एसईसीसी 2011 की अप्रकाशित तालिकाएँ, क्रीमी लेयर और ईडब्ल्यूएस की आय सीमाएँ, और प्रतिनिधित्व के वे आंकड़े जिनका मतलब तभी बनता है जब उनके साथ उनका आधार जुड़ा हो।',
    },
    method: {
      en: 'No number without its unit, year, geography, definition and source. Population share, reserved seats and actual representation are kept apart, and missing data is reported as missing.',
      hi: 'कोई आंकड़ा अपनी इकाई, वर्ष, भूगोल, परिभाषा और स्रोत के बिना नहीं। आबादी का हिस्सा, आरक्षित सीटें और असल प्रतिनिधित्व अलग रखे जाते हैं, और जो डेटा नहीं है उसे ‘नहीं है’ ही लिखा जाता है।',
    },
    topics: ['Data & Notes'],
    knowsAbout: ['Census of India', 'Socio-Economic and Caste Census 2011', 'Public data in India', 'Creamy layer'],
  },
  {
    slug: 'tanvi-mishra',
    name: { en: 'Tanvi Mishra', hi: 'तन्वी मिश्रा' },
    role: { en: 'History and archives editor', hi: 'इतिहास और अभिलेखागार संपादक' },
    beat: { en: 'The orders, pacts and amendments that came before the slogans.', hi: 'वे आदेश, समझौते और संशोधन जो नारों से पहले आए।' },
    bio: {
      en: 'Tanvi Mishra works the archive: the Kolhapur order of 1902, the Madras communal orders, the Poona Pact, the First Amendment and the long wait for Mandal. The aim is simple, to show what the documents said at the time, before anyone started quoting them for a speech.',
      hi: 'तन्वी मिश्रा अभिलेखागार पर काम करती हैं: 1902 का कोल्हापुर आदेश, मद्रास के सांप्रदायिक आदेश, पूना पैक्ट, पहला संशोधन और मंडल का लंबा इंतज़ार। मक़सद सीधा है: दिखाना कि दस्तावेज़ों ने उस समय क्या कहा था, इससे पहले कि कोई उन्हें भाषण के लिए उद्धृत करने लगे।',
    },
    method: {
      en: 'Cites the original order, act or debate with its date, and marks where a later account disagrees with the record.',
      hi: 'मूल आदेश, अधिनियम या बहस को उसकी तारीख़ के साथ उद्धृत करती हैं, और बताती हैं कि कहाँ बाद का कोई विवरण रिकॉर्ड से मेल नहीं खाता।',
    },
    topics: ['History'],
    knowsAbout: ['History of reservation in India', 'Poona Pact', 'Mandal Commission', 'Constitution of India'],
  },
  {
    slug: 'kunal-pandey',
    name: { en: 'Kunal Pandey', hi: 'कुणाल पांडे' },
    role: { en: 'News and ground reports correspondent', hi: 'ख़बर और ज़मीनी रिपोर्ट संवाददाता' },
    beat: { en: 'What moved this week, and what it costs the person standing at the counter.', hi: 'इस हफ़्ते क्या बदला, और काउंटर पर खड़े व्यक्ति को उसकी क्या क़ीमत चुकानी पड़ती है।' },
    bio: {
      en: 'Kunal Pandey covers the week’s notifications, stays and U-turns, and follows them down to the tehsil office: caste certificates, validity checks, RTI replies and the deadlines that decide whether a reserved seat is actually filled.',
      hi: 'कुणाल पांडे हफ़्ते की अधिसूचनाएँ, रोक और पलटाव कवर करते हैं, और उन्हें तहसील दफ़्तर तक ले जाते हैं: जाति प्रमाणपत्र, वैधता जाँच, आरटीआई के जवाब और वे समय-सीमाएँ जो तय करती हैं कि आरक्षित सीट सच में भरी जाती है या नहीं।',
    },
    method: {
      en: 'Links the notification or order behind every development, gives the date it took effect, and says what an applicant has to do next.',
      hi: 'हर घटनाक्रम के पीछे की अधिसूचना या आदेश का लिंक देते हैं, लागू होने की तारीख़ बताते हैं, और लिखते हैं कि आवेदक को आगे क्या करना है।',
    },
    topics: ['Latest', 'Ground Reports'],
    knowsAbout: ['Caste certificates in India', 'Right to Information Act', 'University Grants Commission', 'Public services in India'],
  },
];

/** Bylines that belong to the publication rather than a person. */
export const EDITORIAL_BOARD_BYLINE = 'The Signal 24 editorial board';
export const EDITORIAL_DESK_BYLINE = 'The Signal 24 editorial desk';

export function authorBySlug(slug?: string | null) {
  return AUTHORS.find((author) => author.slug === slug);
}

export function authorByName(name?: string | null) {
  if (!name) return undefined;
  return AUTHORS.find((author) => author.name.en === name || author.name.hi === name);
}

export function authorPath(author: Author) {
  return `/authors/${author.slug}`;
}

/** Page title and description, shared by the client page and the page server. */
export function authorMeta(author: Author, lang: 'en' | 'hi') {
  return {
    title: `${author.name[lang]} — ${lang === 'hi' ? 'द सिग्नल 24' : 'The Signal 24'}`,
    description: `${author.role[lang]}, ${lang === 'hi' ? 'द सिग्नल 24' : 'The Signal 24'}. ${author.beat[lang]}`,
  };
}
