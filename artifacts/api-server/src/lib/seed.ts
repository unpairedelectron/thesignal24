import { asc, eq, inArray } from "drizzle-orm";
import {
  db,
  issuesTable,
  policyRecordsTable,
  policySourcesTable,
  storiesTable,
  storyRevisionsTable,
} from "@workspace/db";

const reservationStories = [
  {
    topic: "Latest",
    kind: "Article",
    state: "National",
    source: "Starter editorial record",
    sourceUrl: null,
    publishedOn: new Date().toISOString().slice(0, 10),
    eyebrow: "Start here",
    title: "The reservation question is bigger than a headline",
    dek: "A calm guide to the constitutional promise, the policy arguments, and the lived realities that shape this national conversation.",
    body: "Reservation is not one policy and it is not one argument. It sits at the intersection of constitutional guarantees, representation, access to education and employment, and the long afterlife of caste discrimination.\n\nThis record is an editorial starting point for readers who want the terms, timelines and primary sources before entering the debate. It is intentionally framed as context rather than a verdict.",
    time: "Today",
    read: 7,
    tone: "from-[#263d56] via-[#536b69] to-[#d3b56a]",
    number: 1,
    sortOrder: 0,
  },
  {
    topic: "Courts & Policy",
    kind: "Explainer",
    state: "National",
    source: "Constitution of India, Articles 15 and 16",
    sourceUrl: null,
    publishedOn: "1950-01-26",
    eyebrow: "The constitutional frame",
    title: "What the Constitution actually says about equality",
    dek: "The text begins with equality, then makes room for measures designed to address exclusion and under-representation.",
    body: "Articles 15 and 16 are often cited in the reservation debate, but they do different work. Article 15 addresses discrimination and permits special provisions in defined areas. Article 16 addresses equality of opportunity in public employment and includes provisions for under-represented classes.\n\nReading the text matters because the policy debate is not outside the Constitution. It is a continuing argument about how constitutional equality should work in an unequal society.",
    time: "Constitutional record",
    read: 8,
    tone: "from-[#263d56] via-[#627c72] to-[#becb83]",
    number: 2,
    sortOrder: 1,
  },
  {
    topic: "History",
    kind: "Archive",
    state: "Tamil Nadu",
    source: "Historical record / Madras Presidency",
    sourceUrl: null,
    publishedOn: "1921-09-16",
    eyebrow: "Before the Republic",
    title: "The older history of representation in public institutions",
    dek: "Reservation debates did not begin in 1950. Earlier provincial policies are part of the history that shaped the constitutional settlement.",
    body: "Public representation policies in the Madras Presidency are part of the longer history behind affirmative action in India. The details, categories and legal settings have changed over time, but the central question — who has access to public institutions — is older than the Republic.\n\nA useful archive keeps this history visible without treating it as a simple origin story. It should be read alongside the social conditions and political movements of its time.",
    time: "1921 / archive",
    read: 6,
    tone: "from-[#5e493c] via-[#9b7c58] to-[#d9c58a]",
    number: 3,
    sortOrder: 2,
  },
  {
    topic: "Courts & Policy",
    kind: "Paper note",
    state: "National",
    source: "Supreme Court of India / Indra Sawhney v. Union of India",
    sourceUrl: null,
    publishedOn: "1992-11-16",
    eyebrow: "The case file",
    title: "Indra Sawhney made the ceiling part of the conversation",
    dek: "The 1992 judgment remains a reference point for backward-class reservations, the creamy layer, and the debate over limits.",
    body: "Indra Sawhney v. Union of India is one of the central judgments in India’s reservation jurisprudence. The decision is regularly discussed alongside the 50 percent ceiling, the exclusion of the creamy layer in certain contexts, and the relationship between equality and affirmative action.\n\nThe judgment is not a slogan. It is a long legal record with multiple opinions and subsequent developments. Any serious explainer should point readers to the primary text.",
    time: "1992 / case file",
    read: 9,
    tone: "from-[#3c4058] via-[#6f6880] to-[#c59f8a]",
    number: 4,
    sortOrder: 3,
  },
  {
    topic: "Courts & Policy",
    kind: "Paper note",
    state: "National",
    source: "Supreme Court of India / M. Nagaraj v. Union of India",
    sourceUrl: null,
    publishedOn: "2006-10-19",
    eyebrow: "The case file",
    title: "Promotion policy brought evidence to the foreground",
    dek: "The court’s reasoning made data, representation and administrative review central to how reservation in promotion is discussed.",
    body: "M. Nagaraj is often read through the requirements it placed on the state when extending reservation in promotion. The case brought questions of backwardness, inadequate representation and administrative efficiency into the same frame.\n\nThe important habit for readers is to separate the original judgment from later decisions and amendments. Legal meaning changes through that sequence, not through a single quotation.",
    time: "2006 / case file",
    read: 8,
    tone: "from-[#2e4851] via-[#52716e] to-[#d0b777]",
    number: 5,
    sortOrder: 4,
  },
  {
    topic: "States",
    kind: "Article",
    state: "Maharashtra",
    source: "Starter state record / source link pending",
    sourceUrl: null,
    publishedOn: "2024-02-20",
    eyebrow: "State watch",
    title: "Why every state story needs its own timeline",
    dek: "State quotas sit inside different social histories, commissions, court orders and political promises. A national summary can hide the differences.",
    body: "A useful state archive does not treat India as one uniform case. The categories, surveys, commissions and court proceedings that shape reservation policy vary across states.\n\nThis record is a placeholder for a sourced Maharashtra timeline. The public version should attach the relevant notification, committee report, court order or legislative document before it is described as current reporting.",
    time: "2024 / state watch",
    read: 5,
    tone: "from-[#59414a] via-[#996c60] to-[#e5bd79]",
    number: 6,
    sortOrder: 5,
  },
  {
    topic: "States",
    kind: "Article",
    state: "Karnataka",
    source: "Starter state record / source link pending",
    sourceUrl: null,
    publishedOn: "2023-11-01",
    eyebrow: "State watch",
    title: "The state map is where policy becomes personal",
    dek: "For students, applicants and families, a reservation rule is experienced through forms, cut-offs, certificates and changing notices.",
    body: "State-level policy is where constitutional language meets a person’s next application, exam or promotion. That makes clarity especially important: readers need the rule, the date it changed, the authority behind it and the document that proves it.\n\nThis record is a placeholder for a sourced Karnataka timeline. It stays clearly marked until primary documents and reputable reporting are attached.",
    time: "2023 / state watch",
    read: 5,
    tone: "from-[#314a3e] via-[#6d805c] to-[#d5ba75]",
    number: 7,
    sortOrder: 6,
  },
  {
    topic: "Ground Reports",
    kind: "Article",
    state: "Uttar Pradesh",
    source: "Starter field record / reporting needed",
    sourceUrl: null,
    publishedOn: "2022-08-14",
    eyebrow: "On the ground",
    title: "The paperwork behind a public promise",
    dek: "Certificates, verification and access to information often decide whether a policy can be used in practice.",
    body: "The experience of reservation is not only shaped by the rule on paper. It also depends on whether a person can obtain the required certificate, understand the notification, meet a deadline and challenge an error.\n\nA field report should follow that chain carefully, with consent, documentation and a clear distinction between one person’s experience and a broader claim.",
    time: "2022 / field record",
    read: 6,
    tone: "from-[#4a4850] via-[#7b766d] to-[#d5b789]",
    number: 8,
    sortOrder: 7,
  },
  {
    topic: "Data & Notes",
    kind: "Paper note",
    state: "National",
    source: "Data desk / methodology note",
    sourceUrl: null,
    publishedOn: "2021-07-01",
    eyebrow: "Read the method",
    title: "A number needs a denominator",
    dek: "Claims about representation become clearer when the source, population, time period and definition are visible beside the percentage.",
    body: "Data can sharpen the reservation debate, but only when its frame is visible. Readers should be able to ask: representation of whom, in which institution, over what period, measured by which category, and compared with what baseline?\n\nThis is a methodology note, not a finding. It is a reminder to publish the table, not just the number.",
    time: "2021 / method note",
    read: 4,
    tone: "from-[#2f4652] via-[#638077] to-[#c8ca86]",
    number: 9,
    sortOrder: 8,
  },
  {
    topic: "History",
    kind: "Archive",
    state: "National",
    source: "Mandal Commission report / public record",
    sourceUrl: null,
    publishedOn: "1980-12-31",
    eyebrow: "The record",
    title: "How a commission changed the vocabulary",
    dek: "The Mandal Commission report remains essential to understanding how backward-class representation entered a new phase of national policy.",
    body: "The Second Backward Classes Commission, chaired by B. P. Mandal, produced a report that became a major reference point in the later national reservation debate. Its categories, methods and recommendations should be read as a historical document, alongside the political and legal events that followed.\n\nAn archive should preserve the report and its context without flattening every later question into the language of the 1980 report.",
    time: "1980 / archive",
    read: 7,
    tone: "from-[#4c4553] via-[#756d78] to-[#d0ad89]",
    number: 10,
    sortOrder: 9,
  },
] as const;

const starterEditorialMetadata = {
  workflowStatus: "published",
  verificationStatus: "unverified",
  verificationNotes:
    "Starter record; editorially reviewed for context, not presented as live verified reporting.",
  lastVerifiedAt: null,
  reviewedAt: new Date(),
  scheduledFor: null,
  aiDisclosure: null,
  correctionNote: null,
} as const;

async function ensurePolicyLedgerData() {
  const [existing] = await db
    .select({ id: policyRecordsTable.id })
    .from(policyRecordsTable)
    .limit(1);
  if (existing) return;

  const [policy] = await db
    .insert(policyRecordsTable)
    .values({
      slug: "103rd-constitutional-amendment-ews-reservation",
      title: "The 103rd Amendment added an EWS reservation framework",
      summary:
        "The constitutional amendment created a separate framework for economically weaker sections in education and public employment, followed by a Supreme Court challenge.",
      state: "National",
      sector: "Education and public employment",
      status: "current",
      authority: "Parliament of India",
      previousFramework:
        "Articles 15 and 16 did not contain an express economically weaker sections reservation provision.",
      newFramework:
        "Articles 15(6) and 16(6) permit special provisions, including up to 10% reservation, for economically weaker sections subject to the constitutional framework.",
      legalBasis: "Constitution (One Hundred and Third Amendment) Act, 2019",
      courtStatus:
        "Upheld by the Supreme Court of India in Janhit Abhiyan v. Union of India (2022).",
      effectiveDate: "2019-01-14",
      publishedOn: "2026-09-23",
      workflowStatus: "published",
    })
    .returning();

  await db.insert(policySourcesTable).values([
    {
      policyRecordId: policy.id,
      title: "Constitution of India",
      sourceType: "constitutional text",
      publisher: "Legislative Department, Government of India",
      url: "https://legislative.gov.in/constitution-of-india/",
      publishedOn: null,
      retrievedOn: "2026-09-23",
      isPrimary: true,
    },
    {
      policyRecordId: policy.id,
      title: "Janhit Abhiyan v. Union of India judgment",
      sourceType: "court judgment",
      publisher: "Supreme Court of India",
      url: "https://main.sci.gov.in/supremecourt/2022/20936/20936_2022_1_1501_39685_Judgement_07-Nov-2022.pdf",
      publishedOn: "2022-11-07",
      retrievedOn: "2026-09-23",
      isPrimary: true,
    },
  ]);
}

export async function ensureSeedData() {
  await ensurePolicyLedgerData();
  const existingIssues = await db
    .select({ id: issuesTable.id, title: issuesTable.title })
    .from(issuesTable)
    .orderBy(asc(issuesTable.id));

  const reservationIssue = existingIssues.find((issue) =>
    issue.title.toLowerCase().includes("reservation"),
  );
  if (reservationIssue) {
    const existingStories = await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.issueId, reservationIssue.id));
    const needsWorkflowBackfill = existingStories.some(
      (story) => story.workflowStatus === "draft" && story.reviewedAt === null,
    );
    if (needsWorkflowBackfill) {
      await db
        .update(storiesTable)
        .set({
          ...starterEditorialMetadata,
          updatedAt: new Date(),
        })
        .where(eq(storiesTable.issueId, reservationIssue.id));
    }
    const revisionStories = needsWorkflowBackfill
      ? await db
          .select()
          .from(storiesTable)
          .where(eq(storiesTable.issueId, reservationIssue.id))
      : existingStories.filter((story) => story.workflowStatus !== "draft");
    if (revisionStories.length > 0) {
      const existingRevisions = await db
        .select({ storyId: storyRevisionsTable.storyId })
        .from(storyRevisionsTable)
        .where(
          inArray(
            storyRevisionsTable.storyId,
            revisionStories.map((story) => story.id),
          ),
        );
      const revisionIds = new Set(
        existingRevisions.map((revision) => revision.storyId),
      );
      const storiesWithoutRevisions = revisionStories.filter(
        (story) => !revisionIds.has(story.id),
      );
      if (storiesWithoutRevisions.length > 0) {
        await db.insert(storyRevisionsTable).values(
          storiesWithoutRevisions.map((story) => ({
            storyId: story.id,
            revisionNumber: 1,
            changeNote: "Initial publication record",
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
    }
    return;
  }

  const issueDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const [issue] = await db
    .insert(issuesTable)
    .values({
      issueDate,
      issueNumber: 101,
      status: "published",
      title: "The reservation record",
      intro:
        "A source-first guide to the law, history, policy and lived reality behind caste-based reservation across India.",
      publishedAt: new Date(),
    })
    .returning();

  const insertedStories = await db.insert(storiesTable).values(
    reservationStories.map((story) => ({
      ...story,
      issueId: issue.id,
      ...starterEditorialMetadata,
    })),
  ).returning();
  await db.insert(storyRevisionsTable).values(
    insertedStories.map((story) => ({
      storyId: story.id,
      revisionNumber: 1,
      changeNote: "Initial publication record",
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