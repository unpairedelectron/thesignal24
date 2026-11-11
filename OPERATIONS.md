# Running The Signal 24

The runbook for keeping the site current, correct and healthy. Scheduled Claude sessions follow it twice a week; a person can follow it too. `replit.md` describes how the code is built. This file is about what to publish and how.

## What the site is

A bilingual (English and Hindi) public-interest newsroom on how India’s governments, courts and commissions handle reservation and representation. The voice is sarcastic and hard on power, and every jibe sits on a sourced fact. Never punch down. No community, caste, religion or region is ever the target, and neither is any private citizen.

## Rules that are never broken

1. **Every fact has a primary source.** A judgment, gazette notification, Act, parliamentary answer, commission report or official dataset, linked with `https`. Use other outlets' reporting only for context, and name them. If you cannot find the primary source, leave the fact out.
2. **Nothing invented.** No made-up quotes, figures, dates, case numbers, officials or reactions. If something is unknown, write that it is unknown; “no release date has been published” is a finding.
3. **Status words mean what they mean.** *Stayed* is not *struck down*; *pending* is not *decided*. A law under a court stay is never described as in force.
4. **Labels stay honest.** Records are drafted with AI assistance and checked automatically, so they are labelled `source-linked`, never `verified`. Bylines are the desk pen names in `artifacts/signal24/src/lib/authors.ts`, and the site says they are pen names. Never add personal biography, credentials or photos to them.
5. **Corrections are public.** If a published fact is wrong, add a dated update that says what was wrong and what is right. Do not silently rewrite a published sentence.
6. **Hindi is not optional.** Every new record, update, answer and analysis ships in both languages, with the same facts.

## Where content lives

| What | File | How it reaches the site |
|---|---|---|
| Articles, explainers, paper notes, opinion | `artifacts/api-server/src/lib/content-pack-*.ts` (one array per pack, listed in `CONTENT_PACK` in `content-pack.ts`) | Inserted and published on API start, matched by title. Byline comes from the desk (`packByline`). |
| Deeper sections for existing articles | `content-pack-addenda-a.ts` / `-b.ts` | Appended once, while the stored body is still the original pack text. |
| Dated follow-ups to published articles | `STORY_UPDATES` in `content-pack-updates.ts` | Appended once as `## Update: <date>`. |
| Court-status changes on ledger records | `POLICY_UPDATES` in `content-pack-updates.ts` | Applied once; the newest update per record wins. |
| New policy-ledger records | `policy-ledger-pack.ts` (+ analysis in `artifacts/signal24/src/lib/policy-notes.ts`) | Inserted on API start by slug. |
| Answers | `artifacts/signal24/src/lib/answers.ts` (original 20) and `answers-more-a.ts` / `answers-more-b.ts` (later batches, each with its depth entry); add a new batch file the same way. Add the id to `SITEMAP_ANSWER_IDS` in `artifacts/api-server/src/routes/publication.ts`, and consider listing it in `ANSWERS_FOR_TOPIC` so articles link to it | Shipped with the web app. |
| Self-check tools (creamy layer, EWS, which certificate) | `artifacts/signal24/src/lib/tools.ts`; a new tool also goes in `SITEMAP_TOOL_IDS` in `publication.ts`. Re-check the rules against the DoPT memoranda and update `TOOLS_CHECKED_ON` | Shipped with the web app. |
| Glossary terms | `artifacts/signal24/src/lib/glossary.ts` (definition in both languages, official source, `match` patterns) | Shipped with the web app; articles list the terms they use. |
| Dated evidence events | `artifacts/api-server/src/lib/evidence-pack.ts` | Inserted on API start. |
| Key figures and running clocks | `artifacts/signal24/src/lib/key-figures.ts` | Shipped with the web app. |
| State and UT profiles (facts with sources, open questions) | `artifacts/signal24/src/lib/states.ts` and `state-research-profiles.ts`; a profiled state must be listed in `SITEMAP_STATE_SLUGS` in `publication.ts` (the content check enforces it) | Shipped with the web app. |

A new article needs: a unique `key` and `title`; `topic` and `kind`; `source`, an `https` `sourceUrl` to the primary document, and `sourcePublishedOn`; a `dek` of at least 40 characters; a body of at least 550 words (use `##` subheads, a `::: [questions]` panel of the questions power has not answered, and a `::: [check]` panel telling readers how to verify it themselves); a full Hindi edition (`hi.title`, `hi.dek`, `hi.body`, `hi.eyebrow`); and `verificationNotes` saying what was checked against what.

## The two weekly runs

**Monday: the news run.**
1. Search for what moved since the last run on the beats: Supreme Court and High Court orders on reservation; UGC and education rules; Census 2027 and caste data; state quota laws (Bihar, Maharashtra, Tamil Nadu, Karnataka, Telangana and any new one); creamy layer and EWS limits; Rohini Commission; parliamentary answers.
2. For each development that is confirmed by a primary source: if it changes a story or ledger record we have, add a `STORY_UPDATES` or `POLICY_UPDATES` entry; if it is new and significant, write one new article (at most two a run). Prefer one excellent piece to two adequate ones.
3. If nothing moved, publish nothing new. Do not manufacture news.

**Thursday: the maintenance run.**
1. Freshness: find the oldest “Last checked” dates in ledger court statuses, topic briefs (`TOPIC_BRIEFS_CHECKED_ON`), answers (`ANSWERS_CHECKED_ON`), tools (`TOOLS_CHECKED_ON`), the glossary (`GLOSSARY_CHECKED_ON`) and key figures. If a creamy-layer or EWS limit changes, update the tools, the answers and the glossary together. Re-check the oldest few against their sources. Update what changed with a dated entry; refresh the date only on what you actually re-checked.
2. Depth: pick the thinnest indexable page (the content check prints counts; event and source pages are deliberately `noindex`) and make it more useful, for example a new answer to a question people search for, or a deeper analysis. Do not pad.
3. Health: run `pnpm run check:site`. Fix what fails. Look for broken outbound links in the files you touched.
4. Community: the API hides posts reported three times. Nothing to do unless the check or a test shows a problem; there is no moderator access from a scheduled run.

## How new pages reach search engines

- `/sitemap.xml` lists every indexable URL; `/news-sitemap.xml` lists records first published in the last 48 hours, for Google News. Both are generated from the database on request, so nothing needs regenerating.
- When the API starts in production it submits new and changed URLs to IndexNow (Bing, Yandex and partners) and remembers what it sent (`indexnow_submissions`). A deploy is therefore enough to announce a run's new articles and updates.
- Article `dateModified` comes from the record's `updatedAt`, so a dated update or edit shows as a modification.
- Addresses from the sites that used to live on this domain (`/analysis/…`, `/topic/…`, `/explained/…`, `/article/…`, `*.jsp`) answer 410 Gone, or 301 where there is a real equivalent (`artifacts/signal24/server/legacy.ts`). Never start a new section under one of those prefixes.

## Publishing a run

1. `pnpm run check:site` must pass. It checks content rules (sources, bylines, length floors, Hindi present, lists in sync), both typechecks, the web tests and both production builds. Never weaken a check to make it pass.
2. Commit on a branch named `auto/<yyyy-mm-dd>-<news|maintenance>`, with a message that lists each change and its primary source.
3. Open a pull request with the same summary, then merge it yourself (the owner chose fully automatic publishing). If the check fails and you cannot fix it properly, open the pull request as a draft, say what is blocked, and do not merge.
4. Merging updates GitHub only. The live site changes when the Replit project pulls `main` and redeploys.

## What a run cannot do

It cannot see Google Search Console or analytics, cannot sign in to the editorial desk, cannot moderate community posts, and cannot reach the live site unless the cloud environment allows `thesignal24.com`. Report anything that needs the owner in the pull request description.
