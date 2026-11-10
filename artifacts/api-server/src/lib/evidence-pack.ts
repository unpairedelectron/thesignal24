import { and, eq, inArray } from "drizzle-orm";
import {
  articleEventsTable,
  articleSourcesTable,
  db,
  evidenceEventsTable,
  eventSourcesTable,
  sourceDocumentsTable,
  storiesTable,
} from "@workspace/db";
import { CONTENT_PACK } from "./content-pack";

type DocType = "official-document" | "court-record" | "government-data" | "report" | "news-report" | "other";
type Role = "primary" | "secondary";

type PackSource = { title: string; publisher: string; publicationDate: string | null; documentType: DocType; url: string };

const S = {
  constitution: { title: "Constitution of India", publisher: "Legislative Department, Government of India", publicationDate: null, documentType: "official-document", url: "https://legislative.gov.in/constitution-of-india/" },
  champakam: { title: "State of Madras v. Srimathi Champakam Dorairajan, [1951] 1 SCR 525", publisher: "Supreme Court of India", publicationDate: "1951-04-09", documentType: "court-record", url: "https://main.sci.gov.in/jonew/judis/1194.pdf" },
  indraSawhney: { title: "Indra Sawhney v. Union of India (1992)", publisher: "Supreme Court of India, via Indian Kanoon", publicationDate: "1992-11-16", documentType: "court-record", url: "https://indiankanoon.org/search/?formInput=Indra%20Sawhney%20vs%20Union%20of%20India%2016%20November%201992" },
  mandal: { title: "The Mandal Commission decoded: how OBC reservation came into effect", publisher: "Business Standard", publicationDate: "2023-10-20", documentType: "news-report", url: "https://business-standard.com/india-news/the-mandal-commission-decoded-how-obc-reservation-came-into-effect-123102000445_1.html" },
  janhit: { title: "Janhit Abhiyan v. Union of India, judgment", publisher: "Supreme Court of India", publicationDate: "2022-11-07", documentType: "court-record", url: "https://main.sci.gov.in/supremecourt/2022/20936/20936_2022_1_1501_39685_Judgement_07-Nov-2022.pdf" },
  ewsTracker: { title: "Reservations for economically weaker sections", publisher: "Supreme Court Observer", publicationDate: null, documentType: "report", url: "https://www.scobserver.in/court-case/reservations-for-economically-weaker-sections" },
  rohini: { title: "Rohini Commission report on OBC sub-categorisation in cold storage", publisher: "ThePrint", publicationDate: null, documentType: "news-report", url: "https://theprint.in/india/governance/rohini-commission-report-on-obc-sub-categorisation-in-cold-storage-as-sc-gives-nod-to-sc-st-sub-quota/2202938" },
  biharTracker: { title: "What is the Bihar government’s 65 percent reservation quota challenge in the Supreme Court?", publisher: "Supreme Court Observer", publicationDate: "2024-07-29", documentType: "report", url: "https://www.scobserver.in/journal/what-is-the-bihar-governments-65-percent-reservation-quota-challenge-in-the-supreme-court/" },
  biharStay: { title: "Supreme Court refuses stay on Patna High Court decision quashing Bihar reservation law", publisher: "Bar & Bench", publicationDate: "2024-07-29", documentType: "news-report", url: "https://www.barandbench.com/news/litigation/supreme-court-refuses-stay-patna-high-court-decision-quash-bihar-reservation-law" },
  maratha2021: { title: "Supreme Court strikes down Maratha reservation law, upholds 50 percent cap", publisher: "Bar & Bench", publicationDate: "2021-05-05", documentType: "news-report", url: "https://www.barandbench.com/news/litigation/supreme-court-strikes-down-maratha-reservation-law-upholds-50-percent-cap-indra-sawhney" },
  maratha2026: { title: "Bombay HC begins fresh hearing on petitions challenging 10 per cent Maratha quota", publisher: "Free Press Journal", publicationDate: null, documentType: "news-report", url: "https://www.freepressjournal.in/mumbai/bombay-hc-begins-fresh-hearing-on-petitions-challenging-10-per-cent-maratha-quota" },
  subClass: { title: "Validity of sub-classification within reserved categories", publisher: "Supreme Court Observer", publicationDate: "2024-08-01", documentType: "report", url: "https://www.scobserver.in/court-case/scheduled-castes-preferential-treatment" },
  ugcExplainer: { title: "Explainer: UGC's 2026 regulations for tackling discrimination in colleges", publisher: "LiveLaw", publicationDate: "2026-01-29", documentType: "news-report", url: "https://www.livelaw.in/top-stories/supreme-court-ugc-promotion-of-equity-in-higher-education-institutions-regulations-2026-sc-st-obc-caste-discrimination-equity-committees-520913" },
  ugcCommittee: { title: "Centre to review UGC equity rules, tells Supreme Court it may form panel", publisher: "Business Today", publicationDate: "2026-11-05", documentType: "news-report", url: "https://www.businesstoday.in/india/story/centre-to-review-ugc-equity-rules-tells-supreme-court-it-may-form-panel-565970-2026-11-05" },
  census: { title: "Initial phase of Census 2027 to begin on April 1, houselisting within 30-day period", publisher: "Business Today", publicationDate: "2026-01-08", documentType: "news-report", url: "https://www.businesstoday.in/india/story/initial-phase-of-census-2027-to-begin-on-april-1-houselisting-to-be-done-within-30-day-period-509920-2026-01-08" },
  secc: { title: "Centre tells SC it did not make results of 2011 caste census public because it is flawed", publisher: "The Leaflet", publicationDate: null, documentType: "news-report", url: "https://theleaflet.in/centre-tells-sc-that-it-did-not-make-results-of-2011-caste-census-public-because-it-is-flawed/" },
  ewsOm: { title: "DoPT OM No. 36039/1/2019-Estt (Res) on EWS reservation, 31 January 2019", publisher: "SCC Online", publicationDate: "2019-02-02", documentType: "news-report", url: "https://www.scconline.com/blog/post/2019/02/02/economically-weaker-section-ews-reservation-for-ewss-in-direct-recruitment-in-civil-posts-and-services-in-government-of-india/" },
  promotionData: { title: "Reservation in promotion: the 6 issues settled by the Supreme Court on quantifiable data", publisher: "SCC Online", publicationDate: "2022-01-31", documentType: "news-report", url: "https://www.scconline.com/blog/post/2022/01/31/reservation-in-promotion-the-6-issues-settled-by-supreme-court-on-collection-of-quantifiable-data-showing-inadequacy-of-representation/" },
} satisfies Record<string, PackSource>;

type SourceKey = keyof typeof S;

type PackEvent = {
  title: string;
  topic: string;
  recordDate: string;
  summary: string;
  sources: Array<[SourceKey, Role]>;
  /** Content-pack story keys this event is evidence for. */
  articles: string[];
};

/** Dated events on the public record, each tied to its documents and to the stories that rely on it. */
export const EVIDENCE_PACK: PackEvent[] = [
  { title: "Supreme Court strikes down the Madras communal admissions order", topic: "History", recordDate: "1951-04-09", summary: "State of Madras v. Champakam Dorairajan: Directive Principles must run subsidiary to fundamental rights; community-wise allocation of college seats fails Articles 15(1) and 29(2).", sources: [["champakam", "primary"]], articles: ["first-amendment-1951", "before-1950-history"] },
  { title: "First Amendment inserts Article 15(4)", topic: "Courts & Policy", recordDate: "1951-06-18", summary: "Parliament permits special provisions for socially and educationally backward classes, Scheduled Castes and Scheduled Tribes, ten weeks after the Champakam judgment.", sources: [["constitution", "primary"], ["champakam", "secondary"]], articles: ["first-amendment-1951", "constitution-article-by-article", "start-here-reservation-record"] },
  { title: "Centre reserves 27% of central posts for backward classes", topic: "History", recordDate: "1990-08-13", summary: "The DoPT office memorandum implementing the Mandal Commission’s recommendation, a decade after the report was submitted.", sources: [["mandal", "secondary"]], articles: ["mandal-to-rohini"] },
  { title: "Indra Sawhney: OBC quota upheld, 50% ceiling and creamy layer set", topic: "Courts & Policy", recordDate: "1992-11-16", summary: "A nine-judge bench upholds 27% OBC reservation, excludes the creamy layer, caps total reservation at 50% save in extraordinary situations, and bars reservation in promotions.", sources: [["indraSawhney", "primary"]], articles: ["indra-sawhney-1992", "start-here-reservation-record", "states-quota-regimes", "bihar-65-percent-law", "maratha-quota-third-attempt"] },
  { title: "Supreme Court strikes down Maharashtra’s 2018 Maratha quota", topic: "States", recordDate: "2021-05-05", summary: "Jaishri Laxmanrao Patil: no extraordinary situation justified breaching the 50% ceiling; the court declines to revisit Indra Sawhney.", sources: [["maratha2021", "secondary"]], articles: ["maratha-quota-third-attempt", "states-quota-regimes", "opinion-quota-laws-built-to-fail"] },
  { title: "Centre tells Supreme Court SECC 2011 caste data is unusable", topic: "Data & Notes", recordDate: "2021-09-23", summary: "The Union government’s affidavit says the caste data collected in the 2011 Socio-Economic and Caste Census is flawed and cannot be used.", sources: [["secc", "secondary"]], articles: ["counting-caste-secc-census", "opinion-governing-by-withholding", "census-2027-caste-count"] },
  { title: "DoPT sets the EWS eligibility tests", topic: "Ground Reports", recordDate: "2019-01-31", summary: "Office memorandum fixing the EWS tests: family income below ₹8 lakh in the preceding financial year, and exclusion for owners of 5 acres of farmland, a 1,000 sq ft flat or specified residential plots.", sources: [["ewsOm", "primary"]], articles: ["certificate-paper-chase", "eight-lakh-line", "ews-judgment-2022"] },
  { title: "Jarnail Singh (2022): promotion quotas need data cadre by cadre", topic: "Courts & Policy", recordDate: "2022-01-28", summary: "The Supreme Court declines to lay down a yardstick for adequacy of representation and holds that quantifiable data must be collected for each cadre, not for a whole service.", sources: [["promotionData", "secondary"]], articles: ["promotions-quantifiable-data"] },
  { title: "EWS quota upheld 3:2", topic: "Courts & Policy", recordDate: "2022-11-07", summary: "Janhit Abhiyan v. Union of India: the 103rd Amendment’s 10% reservation for economically weaker sections does not violate the basic structure.", sources: [["janhit", "primary"], ["ewsTracker", "secondary"]], articles: ["ews-judgment-2022", "eight-lakh-line"] },
  { title: "Rohini Commission submits its report; it is not published", topic: "Latest", recordDate: "2023-07-31", summary: "After 14 extensions, the commission on OBC sub-categorisation submits its report to the President. Its findings have not been made public.", sources: [["rohini", "secondary"]], articles: ["mandal-to-rohini", "opinion-governing-by-withholding"] },
  { title: "Bihar publishes its caste survey", topic: "States", recordDate: "2023-10-02", summary: "EBC 36.01%, BC 27.12%, SC 19.65%, ST 1.68%, unreserved 15.52% of the state’s population.", sources: [["biharTracker", "secondary"]], articles: ["bihar-65-percent-law"] },
  { title: "Patna High Court strikes down Bihar’s 65% quota", topic: "States", recordDate: "2024-06-20", summary: "The 2023 amendments are quashed as violating Articles 14, 15 and 16. The Supreme Court later refuses a stay and grants leave to appeal.", sources: [["biharTracker", "secondary"], ["biharStay", "secondary"]], articles: ["bihar-65-percent-law", "states-quota-regimes", "opinion-quota-laws-built-to-fail"] },
  { title: "Seven-judge bench allows sub-classification of SCs and STs", topic: "Courts & Policy", recordDate: "2024-08-01", summary: "State of Punjab v. Davinder Singh, 6:1, overruling E.V. Chinnaiah. Four judges call for a creamy-layer policy; the Union Cabinet rejects it on 9 August.", sources: [["subClass", "secondary"]], articles: ["sc-sub-classification-2024"] },
  { title: "UGC notifies the 2026 equity regulations", topic: "Latest", recordDate: "2026-01-13", summary: "Binding equity committees and 24-hour helplines replace the advisory 2012 framework. Regulation 3(1)(c) defines caste-based discrimination as discrimination against SC, ST and OBC members.", sources: [["ugcExplainer", "secondary"]], articles: ["ugc-equity-regulations-2026", "opinion-sixteen-days"] },
  { title: "Supreme Court stays the UGC equity regulations", topic: "Latest", recordDate: "2026-01-29", summary: "The court calls the framework prima facie vague and capable of misuse, and keeps the 2012 regulations in force under Article 142.", sources: [["ugcExplainer", "secondary"]], articles: ["ugc-equity-regulations-2026", "opinion-sixteen-days"] },
  { title: "Census 2027 houselisting phase begins", topic: "Data & Notes", recordDate: "2026-04-01", summary: "The first phase of India’s first digital census runs to 30 September 2026. Caste is to be recorded in the February 2027 population enumeration.", sources: [["census", "secondary"]], articles: ["census-2027-caste-count"] },
  { title: "Centre says it may form a committee on the UGC equity rules", topic: "Latest", recordDate: "2026-11-05", summary: "Ten months after the stay, the Centre tells the Supreme Court it is considering a special committee to re-examine the 2026 regulations.", sources: [["ugcCommittee", "secondary"]], articles: ["ugc-equity-regulations-2026", "opinion-sixteen-days"] },
];

/** Stories cite these documents directly (in addition to the documents of their events). */
const ARTICLE_SOURCES: Record<string, Array<[SourceKey, Role]>> = {
  "certificate-paper-chase": [["ewsOm", "primary"]],
  "eight-lakh-line": [["ewsOm", "secondary"]],
  "maratha-quota-third-attempt": [["maratha2026", "secondary"]],
};

const CREATED_BY = "content-pack";

/**
 * Inserts the evidence graph once: events by title, documents by URL, links with
 * conflict-skipping. Existing rows edited in the desk are never overwritten.
 */
export async function ensureEvidencePack() {
  const titleByKey = new Map(CONTENT_PACK.map((story) => [story.key, story.title]));
  const stories = await db
    .select({ id: storiesTable.id, title: storiesTable.title })
    .from(storiesTable)
    .where(inArray(storiesTable.title, [...titleByKey.values()]));
  const storyIdByTitle = new Map(stories.map((story) => [story.title, story.id]));
  const storyId = (key: string) => {
    const title = titleByKey.get(key);
    return title ? storyIdByTitle.get(title) : undefined;
  };

  const urls = Object.values(S).map((source) => source.url);
  const existingSources = await db
    .select({ id: sourceDocumentsTable.id, url: sourceDocumentsTable.sourceUrl })
    .from(sourceDocumentsTable)
    .where(inArray(sourceDocumentsTable.sourceUrl, urls));
  const sourceIdByUrl = new Map(existingSources.map((row) => [row.url ?? "", row.id]));
  for (const source of Object.values(S)) {
    if (sourceIdByUrl.has(source.url)) continue;
    const [row] = await db
      .insert(sourceDocumentsTable)
      .values({
        title: source.title,
        publisher: source.publisher,
        publicationDate: source.publicationDate,
        documentType: source.documentType,
        sourceUrl: source.url,
        status: "unverified",
        createdBy: CREATED_BY,
        updatedBy: CREATED_BY,
      })
      .returning({ id: sourceDocumentsTable.id });
    sourceIdByUrl.set(source.url, row.id);
  }
  const sourceId = (key: SourceKey) => sourceIdByUrl.get(S[key].url)!;

  for (const event of EVIDENCE_PACK) {
    let [existing] = await db
      .select({ id: evidenceEventsTable.id })
      .from(evidenceEventsTable)
      .where(and(eq(evidenceEventsTable.title, event.title), eq(evidenceEventsTable.recordDate, event.recordDate)))
      .limit(1);
    if (!existing) {
      [existing] = await db
        .insert(evidenceEventsTable)
        .values({
          title: event.title,
          topic: event.topic,
          recordDate: event.recordDate,
          summary: event.summary,
          workflowStatus: "published",
          createdBy: CREATED_BY,
          updatedBy: CREATED_BY,
        })
        .returning({ id: evidenceEventsTable.id });
    }
    const eventId = existing.id;
    await db
      .insert(eventSourcesTable)
      .values(event.sources.map(([key, role]) => ({ eventId, sourceDocumentId: sourceId(key), sourceRole: role, createdBy: CREATED_BY })))
      .onConflictDoNothing();
    const articleIds = event.articles.map(storyId).filter((id): id is number => typeof id === "number");
    if (articleIds.length > 0) {
      await db
        .insert(articleEventsTable)
        .values(articleIds.map((articleId) => ({ articleId, eventId, createdBy: CREATED_BY })))
        .onConflictDoNothing();
    }
  }

  for (const [key, sources] of Object.entries(ARTICLE_SOURCES)) {
    const articleId = storyId(key);
    if (!articleId) continue;
    await db
      .insert(articleSourcesTable)
      .values(sources.map(([sourceKey, role]) => ({ articleId, sourceDocumentId: sourceId(sourceKey), sourceRole: role, createdBy: CREATED_BY })))
      .onConflictDoNothing();
  }
}
