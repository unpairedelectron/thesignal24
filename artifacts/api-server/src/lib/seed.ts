import { asc, eq } from "drizzle-orm";
import { db, issuesTable, storiesTable } from "@workspace/db";

const seedStories = [
  {
    topic: "World",
    eyebrow: "The long view",
    title: "The map is being redrawn at sea",
    dek: "A new chain of shipping detours is quietly changing the cost, speed and politics of everything on the shelf.",
    body: "Trade routes are never just lines on a map. When a vessel takes the long way around, the change moves through fuel bills, delivery windows, insurance premiums and the political choices that shape them. The pattern is worth watching because it shows how a small change in movement can become a large change in leverage.",
    time: "8:42 AM",
    read: 6,
    tone: "from-[#314b62] via-[#546c70] to-[#c3c970]",
    number: 1,
    sortOrder: 0,
  },
  {
    topic: "Technology",
    eyebrow: "The useful bit",
    title: "Computing is moving closer to the edge",
    dek: "The next wave of devices will make fewer trips to the cloud. That is less about speed than control.",
    body: "The most interesting shift in computing is not a new screen. It is the quiet movement of useful decisions closer to where the work happens. That can mean faster responses, less data leaving a room and a clearer sense of who is responsible when a system gets something wrong.",
    time: "7:18 AM",
    read: 4,
    tone: "from-[#23394b] via-[#476a68] to-[#b4c47e]",
    number: 2,
    sortOrder: 1,
  },
  {
    topic: "Business",
    eyebrow: "Signals & noise",
    title: "The soft landing has a strange shape",
    dek: "Jobs are steady, prices are easing, and households are still cautious. Three charts explain the tension.",
    body: "The headline numbers look calmer than they did a year ago, but calm is not the same thing as confidence. Households are still making careful tradeoffs, businesses are still choosing where to spend, and the next phase will be defined by what people believe will happen next.",
    time: "6:03 AM",
    read: 5,
    tone: "from-[#593d45] via-[#9d6856] to-[#edb069]",
    number: 3,
    sortOrder: 2,
  },
  {
    topic: "Culture",
    eyebrow: "After hours",
    title: "Why the night is becoming a public space again",
    dek: "From late libraries to 24-hour bakeries, a new kind of city culture is making room for people who work off-clock.",
    body: "A city reveals its priorities after sunset. The return of late libraries, bakeries and shared rooms is not only about convenience; it is a response to the people whose work and lives do not fit a nine-to-five day. The night is becoming a design question again.",
    time: "Yesterday",
    read: 7,
    tone: "from-[#2e334f] via-[#5c5472] to-[#cc8372]",
    number: 4,
    sortOrder: 3,
  },
  {
    topic: "World",
    eyebrow: "Field notes",
    title: "The new politics of a full glass",
    dek: "Cities are learning that water resilience is a design problem before it is an engineering one.",
    body: "Water resilience begins with the ordinary places where people meet a city: a tap, a park, a street that floods, a building that stores rain. The most durable plans connect infrastructure to the daily choices residents can actually see and use.",
    time: "Yesterday",
    read: 3,
    tone: "from-[#2e5663] via-[#53818a] to-[#d7d08e]",
    sortOrder: 4,
  },
  {
    topic: "Technology",
    eyebrow: "The useful bit",
    title: "Small models are getting interesting",
    dek: "The rush toward bigger systems has left an opening for tools that are cheaper, narrower and easier to trust.",
    body: "Smaller systems are useful when the task is specific and the boundaries are clear. They can run closer to the work, cost less to operate and make it easier for a team to understand what a tool is meant to do.",
    time: "Yesterday",
    read: 5,
    tone: "from-[#394b3e] via-[#70815a] to-[#d9ba75]",
    sortOrder: 5,
  },
  {
    topic: "Business",
    eyebrow: "On the ground",
    title: "The repair economy is having a good year",
    dek: "A growing market of fixers is turning broken things into local knowledge, and making “new” less automatic.",
    body: "Repair is becoming a service, a skill and a neighborhood signal. The businesses doing well are not selling nostalgia; they are offering a practical alternative when replacement costs more money, more time or more trust than a careful fix.",
    time: "Mon",
    read: 4,
    tone: "from-[#5b4b38] via-[#9d865a] to-[#d5b96d]",
    sortOrder: 6,
  },
  {
    topic: "Culture",
    eyebrow: "The slower read",
    title: "A case for having fewer tabs open",
    dek: "Attention is not a personality trait. It is an environment we build, one small ritual at a time.",
    body: "Attention improves when the environment stops asking for it every few seconds. A smaller set of open loops creates room for the work that needs continuity, and for the kind of thinking that cannot be completed between notifications.",
    time: "Mon",
    read: 9,
    tone: "from-[#3b3f4b] via-[#7a7268] to-[#c6a891]",
    sortOrder: 7,
  },
] as const;

export async function ensureSeedData() {
  const [existingIssue] = await db
    .select({ id: issuesTable.id })
    .from(issuesTable)
    .orderBy(asc(issuesTable.id))
    .limit(1);

  if (existingIssue) {
    return;
  }

  const issueDate = new Date().toISOString().slice(0, 10);
  const [issue] = await db
    .insert(issuesTable)
    .values({
      issueDate,
      issueNumber: 24,
      status: "published",
      title: "The signal beneath the noise.",
      intro:
        "The important story, with enough context to know why it matters. A calm, curious briefing for people who have a lot to do.",
      publishedAt: new Date(),
    })
    .returning();

  await db.insert(storiesTable).values(
    seedStories.map((story) => ({
      ...story,
      issueId: issue.id,
    })),
  );
}