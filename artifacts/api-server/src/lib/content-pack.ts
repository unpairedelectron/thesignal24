import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  db,
  issuesTable,
  policyRecordsTable,
  policySourcesTable,
  storiesTable,
  storyRevisionsTable,
  type PolicyTranslation,
} from "@workspace/db";
import { CONTENT_PACK_A } from "./content-pack-a";
import { CONTENT_PACK_B } from "./content-pack-b";
import { CONTENT_PACK_C } from "./content-pack-c";
import { CONTENT_PACK_D } from "./content-pack-d";
import { CONTENT_PACK_OPINION } from "./content-pack-opinion";
import type { ContentPackStory } from "./content-pack-types";
import { POLICY_LEDGER_PACK } from "./policy-ledger-pack";
import { EDITORIAL_DESK_BYLINE, packByline } from "./authors";
import { ADDENDA_A } from "./content-pack-addenda-a";
import { ADDENDA_B } from "./content-pack-addenda-b";

const ADDENDA = { ...ADDENDA_A, ...ADDENDA_B };

/** The full published body: the original pack text plus its addendum (deeper record, hard questions, check it yourself). */
function fullBody(story: ContentPackStory) {
  const addendum = ADDENDA[story.key];
  return addendum ? `${story.body}\n\n${addendum.en}` : story.body;
}

function fullHindi(story: ContentPackStory) {
  const addendum = ADDENDA[story.key];
  return addendum && story.hi.body ? { ...story.hi, body: `${story.hi.body}\n\n${addendum.hi}` } : story.hi;
}

/** Reading time at roughly 200 words a minute, never less than the pack's own estimate. */
function readMinutes(story: ContentPackStory) {
  const words = fullBody(story).split(/\s+/).filter(Boolean).length;
  return Math.max(story.read, Math.round(words / 200));
}

/** Newest reporting first: array position becomes the story's sort order. */
export const CONTENT_PACK: ContentPackStory[] = [
  ...CONTENT_PACK_D,
  ...CONTENT_PACK_A,
  ...CONTENT_PACK_B,
  ...CONTENT_PACK_C,
  ...CONTENT_PACK_OPINION,
];

const CONTENT_PACK_ISSUE_TITLE = "The accountability record";

const AI_DISCLOSURE =
  "Drafted with AI assistance from the cited public sources and translated into Hindi with AI assistance. Labelled source-linked: every claim is tied to a linked document, but this record has not yet been verified line by line by an editor. Corrections are logged in public.";

/**
 * Placeholder records from the original seed. They carry no source and say so in their
 * own text; once the sourced pack is live they are archived (not deleted), and only if
 * no editor has attached a source to them.
 */
const STARTER_TITLES = [
  "The reservation question is bigger than a headline",
  "What the Constitution actually says about equality",
  "The older history of representation in public institutions",
  "Indra Sawhney made the ceiling part of the conversation",
  "Promotion policy brought evidence to the foreground",
  "Why every state story needs its own timeline",
  "The state map is where policy becomes personal",
  "The paperwork behind a public promise",
  "A number needs a denominator",
  "How a commission changed the vocabulary",
];

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
 * Publishes the bilingual, source-linked content pack. Idempotent and conservative:
 * - records whose title already exists are not re-inserted or overwritten;
 * - a pack record still in "review" is published only if no editor has revised it;
 * - starter placeholders are archived only while they still have no source.
 */
export async function ensureContentPack() {
  await ensurePolicyTranslations();
  await ensurePolicyLedgerPack();

  const titles = CONTENT_PACK.map((story) => story.title);
  const sortOrderByTitle = new Map(titles.map((title, index) => [title, index + 1]));
  const existing = await db
    .select({ id: storiesTable.id, title: storiesTable.title, workflowStatus: storiesTable.workflowStatus })
    .from(storiesTable)
    .where(inArray(storiesTable.title, titles));
  const existingTitles = new Set(existing.map((story) => story.title));
  const pending = CONTENT_PACK.filter((story) => !existingTitles.has(story.title));

  const issueId = await ensureContentPackIssue();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  if (pending.length > 0) {
    const inserted = await db
      .insert(storiesTable)
      .values(
        pending.map((story) => ({
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
          body: fullBody(story),
          time: `${readMinutes(story)} min`,
          read: readMinutes(story),
          tone: story.tone,
          number: null,
          sortOrder: sortOrderByTitle.get(story.title) ?? 999,
          workflowStatus: "published",
          verificationStatus: "source-linked",
          verificationNotes: story.verificationNotes,
          sourcePublishedOn: story.sourcePublishedOn,
          sourceRetrievedOn: today,
          lastVerifiedAt: null,
          reviewedAt: now,
          scheduledFor: null,
          aiDisclosure: AI_DISCLOSURE,
          correctionNote: null,
          byline: packByline(story),
          hi: fullHindi(story),
        })),
      )
      .returning();

    await db.insert(storyRevisionsTable).values(
      inserted.map((story) => ({
        storyId: story.id,
        revisionNumber: 1,
        changeNote: "Published from the source-linked content pack",
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

  await publishUntouchedReviewRecords(
    existing.filter((story) => story.workflowStatus === "review"),
    sortOrderByTitle,
    today,
  );
  await retireStarterPlaceholders();
  await upgradeUntouchedBodies();
  await assignPackBylines();
}

/**
 * Give pack reporting a named byline. Only stories still carrying no byline or the
 * generic desk byline are changed, so a byline an editor has set is never overwritten.
 * Idempotent: once assigned, a story no longer matches.
 */
async function assignPackBylines() {
  const byTitle = new Map(CONTENT_PACK.map((story) => [story.title, story]));
  const rows = await db
    .select()
    .from(storiesTable)
    .where(inArray(storiesTable.title, [...byTitle.keys()]));
  for (const row of rows) {
    const story = byTitle.get(row.title);
    if (!story || (row.byline !== null && row.byline !== EDITORIAL_DESK_BYLINE)) continue;
    const byline = packByline({ topic: row.topic, kind: row.kind, byline: story.byline });
    if (byline === row.byline) continue;
    const [latest] = await db
      .select({ revisionNumber: storyRevisionsTable.revisionNumber })
      .from(storyRevisionsTable)
      .where(eq(storyRevisionsTable.storyId, row.id))
      .orderBy(desc(storyRevisionsTable.revisionNumber))
      .limit(1);
    const [updated] = await db
      .update(storiesTable)
      .set({ byline, updatedAt: new Date() })
      .where(and(eq(storiesTable.id, row.id), eq(storiesTable.title, row.title)))
      .returning();
    await db.insert(storyRevisionsTable).values({
      storyId: row.id,
      revisionNumber: (latest?.revisionNumber ?? 0) + 1,
      changeNote: `Byline assigned to ${byline}`,
      snapshot: {
        title: updated.title,
        workflowStatus: updated.workflowStatus,
        verificationStatus: updated.verificationStatus,
        source: updated.source,
        sourceUrl: updated.sourceUrl,
      },
    });
  }
}

/**
 * Bring stories inserted by an earlier release up to the current pack text. A body is
 * replaced only while it is still exactly the original pack text, so anything an editor
 * has changed is left alone; the Hindi edition follows the same rule independently.
 */
async function upgradeUntouchedBodies() {
  const byTitle = new Map(CONTENT_PACK.map((story) => [story.title, story]));
  const rows = await db
    .select()
    .from(storiesTable)
    .where(inArray(storiesTable.title, [...byTitle.keys()]));
  for (const row of rows) {
    const story = byTitle.get(row.title);
    if (!story) continue;
    const nextBody = fullBody(story);
    const nextHi = fullHindi(story);
    const bodyUntouched = row.body === story.body && row.body !== nextBody;
    const hiUntouched = Boolean(row.hi?.body) && row.hi?.body === story.hi.body && story.hi.body !== nextHi.body;
    if (!bodyUntouched && !hiUntouched) continue;
    const [latest] = await db
      .select({ revisionNumber: storyRevisionsTable.revisionNumber })
      .from(storyRevisionsTable)
      .where(eq(storyRevisionsTable.storyId, row.id))
      .orderBy(desc(storyRevisionsTable.revisionNumber))
      .limit(1);
    const [updated] = await db
      .update(storiesTable)
      .set({
        ...(bodyUntouched ? { body: nextBody, read: readMinutes(story), time: `${readMinutes(story)} min` } : {}),
        ...(hiUntouched && row.hi ? { hi: { ...row.hi, body: nextHi.body ?? row.hi.body } } : {}),
        updatedAt: new Date(),
      })
      .where(eq(storiesTable.id, row.id))
      .returning();
    await db.insert(storyRevisionsTable).values({
      storyId: row.id,
      revisionNumber: (latest?.revisionNumber ?? 0) + 1,
      changeNote: "Expanded from the content pack: the deeper record, the hard questions, and how to check it yourself",
      snapshot: {
        title: updated.title,
        workflowStatus: updated.workflowStatus,
        verificationStatus: updated.verificationStatus,
        source: updated.source,
        sourceUrl: updated.sourceUrl,
      },
    });
  }
}

/** Promote pack records left in review by the previous release, unless an editor has revised them. */
async function publishUntouchedReviewRecords(
  candidates: Array<{ id: number; title: string }>,
  sortOrderByTitle: Map<string, number>,
  today: string,
) {
  if (candidates.length === 0) return;
  const revisionCounts = await db
    .select({ storyId: storyRevisionsTable.storyId, count: sql<number>`count(*)::int` })
    .from(storyRevisionsTable)
    .where(inArray(storyRevisionsTable.storyId, candidates.map((story) => story.id)))
    .groupBy(storyRevisionsTable.storyId);
  const countById = new Map(revisionCounts.map((row) => [row.storyId, row.count]));
  for (const story of candidates) {
    const revisions = countById.get(story.id) ?? 0;
    if (revisions > 1) continue;
    const [updated] = await db
      .update(storiesTable)
      .set({
        workflowStatus: "published",
        publishedOn: today,
        sortOrder: sortOrderByTitle.get(story.title) ?? 999,
        aiDisclosure: AI_DISCLOSURE,
        updatedAt: new Date(),
      })
      .where(and(eq(storiesTable.id, story.id), eq(storiesTable.workflowStatus, "review")))
      .returning();
    if (!updated) continue;
    await db.insert(storyRevisionsTable).values({
      storyId: updated.id,
      revisionNumber: revisions + 1,
      changeNote: "Published from the source-linked content pack",
      snapshot: {
        title: updated.title,
        workflowStatus: updated.workflowStatus,
        verificationStatus: updated.verificationStatus,
        source: updated.source,
        sourceUrl: updated.sourceUrl,
      },
    });
  }
}

async function retireStarterPlaceholders() {
  const starters = await db
    .select()
    .from(storiesTable)
    .where(
      and(
        inArray(storiesTable.title, STARTER_TITLES),
        eq(storiesTable.workflowStatus, "published"),
        eq(storiesTable.verificationStatus, "unverified"),
        isNull(storiesTable.sourceUrl),
      ),
    );
  for (const story of starters) {
    const [latest] = await db
      .select({ revisionNumber: storyRevisionsTable.revisionNumber })
      .from(storyRevisionsTable)
      .where(eq(storyRevisionsTable.storyId, story.id))
      .orderBy(desc(storyRevisionsTable.revisionNumber))
      .limit(1);
    await db
      .update(storiesTable)
      .set({ workflowStatus: "archived", updatedAt: new Date() })
      .where(eq(storiesTable.id, story.id));
    await db.insert(storyRevisionsTable).values({
      storyId: story.id,
      revisionNumber: (latest?.revisionNumber ?? 0) + 1,
      changeNote: "Archived: unsourced starter placeholder, superseded by source-linked reporting",
      snapshot: {
        title: story.title,
        workflowStatus: "archived",
        verificationStatus: story.verificationStatus,
        source: story.source,
        sourceUrl: story.sourceUrl,
      },
    });
  }
}

/** Insert ledger records by slug; never overwrite one that already exists. */
async function ensurePolicyLedgerPack() {
  const slugs = POLICY_LEDGER_PACK.map((record) => record.slug);
  const existing = await db
    .select({ slug: policyRecordsTable.slug })
    .from(policyRecordsTable)
    .where(inArray(policyRecordsTable.slug, slugs));
  const existingSlugs = new Set(existing.map((row) => row.slug));
  const today = new Date().toISOString().slice(0, 10);
  for (const record of POLICY_LEDGER_PACK) {
    if (existingSlugs.has(record.slug)) continue;
    const { sources, ...fields } = record;
    const [policy] = await db
      .insert(policyRecordsTable)
      .values({ ...fields, publishedOn: today, workflowStatus: "published" })
      .returning({ id: policyRecordsTable.id });
    await db.insert(policySourcesTable).values(
      sources.map((source) => ({ ...source, policyRecordId: policy.id, retrievedOn: today })),
    );
  }
}

async function ensureContentPackIssue() {
  const [existingIssue] = await db
    .select({ id: issuesTable.id })
    .from(issuesTable)
    .where(eq(issuesTable.title, CONTENT_PACK_ISSUE_TITLE))
    .limit(1);
  if (existingIssue) {
    await db
      .update(issuesTable)
      .set({
        status: "published",
        publishedAt: new Date(),
        intro:
          "Sourced, bilingual reporting on what India's governments, courts and commissions have done on reservation, and what they have withheld.",
      })
      .where(and(eq(issuesTable.id, existingIssue.id), eq(issuesTable.status, "draft")));
    return existingIssue.id;
  }

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
      status: "published",
      title: CONTENT_PACK_ISSUE_TITLE,
      intro:
        "Sourced, bilingual reporting on what India's governments, courts and commissions have done on reservation, and what they have withheld.",
      publishedAt: new Date(),
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
