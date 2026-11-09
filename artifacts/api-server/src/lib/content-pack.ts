import { desc, eq, inArray } from "drizzle-orm";
import {
  db,
  issuesTable,
  policyRecordsTable,
  storiesTable,
  storyRevisionsTable,
  type PolicyTranslation,
} from "@workspace/db";
import { CONTENT_PACK_A } from "./content-pack-a";
import { CONTENT_PACK_B } from "./content-pack-b";
import { CONTENT_PACK_C } from "./content-pack-c";
import { CONTENT_PACK_OPINION } from "./content-pack-opinion";
import type { ContentPackStory } from "./content-pack-types";

export const CONTENT_PACK: ContentPackStory[] = [
  ...CONTENT_PACK_A,
  ...CONTENT_PACK_B,
  ...CONTENT_PACK_C,
  ...CONTENT_PACK_OPINION,
];

const CONTENT_PACK_ISSUE_TITLE = "The accountability record";

const AI_DISCLOSURE =
  "Drafted with AI assistance from the cited public sources, and translated into Hindi with AI assistance. An editor must verify every claim against its source, and a Hindi-speaking editor must review the translation, before publication.";

/** Hindi edition of the existing 103rd Amendment policy ledger record. */
const EWS_POLICY_HINDI: PolicyTranslation = {
  title: "103वें संशोधन ने ईडब्ल्यूएस आरक्षण का ढाँचा जोड़ा",
  summary:
    "इस संविधान संशोधन ने शिक्षा और सरकारी नौकरियों में आर्थिक रूप से कमज़ोर वर्गों के लिए अलग ढाँचा बनाया, जिसके बाद सुप्रीम कोर्ट ने इसकी समीक्षा की।",
  sector: "शिक्षा और सरकारी नौकरियाँ",
  authority: "भारत की संसद",
  previousFramework: "अनुच्छेद 15 और 16 में आर्थिक रूप से कमज़ोर वर्गों के आरक्षण का कोई स्पष्ट प्रावधान नहीं था।",
  newFramework:
    "अनुच्छेद 15(6) और 16(6) आर्थिक रूप से कमज़ोर वर्गों के लिए 10% तक आरक्षण समेत विशेष प्रावधानों की अनुमति देते हैं, संवैधानिक ढाँचे के अधीन।",
  legalBasis: "संविधान (एक सौ तीसरा संशोधन) अधिनियम, 2019",
  courtStatus: "सुप्रीम कोर्ट ने जनहित अभियान बनाम भारत संघ (2022) में 3:2 के बहुमत से बरक़रार रखा।",
};

function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/**
 * Inserts the bilingual content pack for editorial review. Idempotent: records whose
 * title already exists are skipped, nothing already in the database is overwritten,
 * and nothing is published. Editors review, verify and publish from the desk.
 */
export async function ensureContentPack() {
  await ensurePolicyTranslations();

  const titles = CONTENT_PACK.map((story) => story.title);
  const existing = await db
    .select({ title: storiesTable.title })
    .from(storiesTable)
    .where(inArray(storiesTable.title, titles));
  const existingTitles = new Set(existing.map((story) => story.title));
  const pending = CONTENT_PACK.filter((story) => !existingTitles.has(story.title));
  if (pending.length === 0) return;

  const issueId = await ensureContentPackIssue();
  const today = new Date().toISOString().slice(0, 10);
  const reviewedAt = new Date();
  const inserted = await db
    .insert(storiesTable)
    .values(
      pending.map((story, index) => ({
        issueId,
        topic: story.topic,
        kind: story.kind,
        state: story.state,
        source: story.source,
        sourceUrl: story.sourceUrl,
        publishedOn: today,
        eyebrow: story.eyebrow,
        title: story.title,
        dek: story.dek,
        body: story.body,
        time: `${story.read} min`,
        read: story.read,
        tone: story.tone,
        number: null,
        sortOrder: index + 1,
        workflowStatus: "review",
        verificationStatus: "source-linked",
        verificationNotes: story.verificationNotes,
        sourcePublishedOn: story.sourcePublishedOn,
        sourceRetrievedOn: today,
        lastVerifiedAt: null,
        reviewedAt,
        scheduledFor: null,
        aiDisclosure: AI_DISCLOSURE,
        correctionNote: null,
        byline: story.byline ?? null,
        hi: story.hi,
      })),
    )
    .returning();

  await db.insert(storyRevisionsTable).values(
    inserted.map((story) => ({
      storyId: story.id,
      revisionNumber: 1,
      changeNote: "Content pack draft added for editorial review",
      snapshot: {
        title: story.title,
        workflowStatus: story.workflowStatus,
        verificationStatus: story.verificationStatus,
        source: story.source,
        sourceUrl: story.sourceUrl,
      },
    })),
  );
}

async function ensureContentPackIssue() {
  const [existingIssue] = await db
    .select({ id: issuesTable.id })
    .from(issuesTable)
    .where(eq(issuesTable.title, CONTENT_PACK_ISSUE_TITLE))
    .limit(1);
  if (existingIssue) return existingIssue.id;

  const [latest] = await db
    .select({ issueDate: issuesTable.issueDate, issueNumber: issuesTable.issueNumber })
    .from(issuesTable)
    .orderBy(desc(issuesTable.issueDate))
    .limit(1);
  const today = new Date().toISOString().slice(0, 10);
  const issueDate = latest && latest.issueDate >= today ? addDays(latest.issueDate, 1) : today;
  const [highest] = await db
    .select({ issueNumber: issuesTable.issueNumber })
    .from(issuesTable)
    .orderBy(desc(issuesTable.issueNumber))
    .limit(1);

  const [issue] = await db
    .insert(issuesTable)
    .values({
      issueDate,
      issueNumber: (highest?.issueNumber ?? 100) + 1,
      status: "draft",
      title: CONTENT_PACK_ISSUE_TITLE,
      intro:
        "Sourced, bilingual explainers on what India's governments, courts and commissions have done on reservation, and what they have withheld. For editorial review before publication.",
      publishedAt: null,
    })
    .returning();
  return issue.id;
}

async function ensurePolicyTranslations() {
  const [policy] = await db
    .select({ id: policyRecordsTable.id, hi: policyRecordsTable.hi })
    .from(policyRecordsTable)
    .where(eq(policyRecordsTable.slug, "103rd-constitutional-amendment-ews-reservation"))
    .limit(1);
  if (!policy || policy.hi) return;
  await db
    .update(policyRecordsTable)
    .set({ hi: EWS_POLICY_HINDI })
    .where(eq(policyRecordsTable.id, policy.id));
}
