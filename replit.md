# The Signal 24

A source-first public-interest publication and research archive covering UGC equity rules, open-category competition, EWS eligibility, and state reservation disputes in India.

## Run & Operate

- The `artifacts/signal24: web` workflow runs `pnpm --filter @workspace/signal24 run dev`; Replit injects `PORT` and `BASE_PATH`.
- The `artifacts/api-server: API Server` workflow runs `pnpm --filter @workspace/api-server run dev` and serves the same-origin `/api` routes.
- `pnpm run typecheck` — typecheck workspace libraries and artifacts.
- `pnpm run build` — typecheck and build all workspace packages.
- `pnpm --dir lib/api-spec codegen` — regenerate API clients and Zod schemas from the OpenAPI contract.
- `pnpm --filter @workspace/db run push` — apply schema changes to the development database only.
- Required runtime configuration includes `DATABASE_URL` and `SESSION_SECRET`. The canonical public origin defaults to `https://thesignal24.com`; override it with `VITE_SITE_URL` (web build) and `SITE_URL` (API sitemap) only if the domain changes. Editor access also requires Clerk configuration and an `EDITOR_EMAILS` allowlist; provide values through Replit Secrets, not source files.

## Stack

- pnpm workspace, Node.js 24, TypeScript 5.9
- Web: React 19, Vite, Tailwind CSS, Wouter, TanStack Query
- Authentication: Clerk; editor mutations are protected by server-side verified-email authorization
- API: Express 5, PostgreSQL, Drizzle ORM, Zod, OpenAPI-generated client and schemas
- Production: static web artifact with SPA rewrites plus a separate API service mounted under `/api`

## Where Things Live

- `artifacts/signal24/src/App.tsx` — public routes, editorial desk, and route-aware metadata
- `artifacts/signal24/src/components/` — reusable visual components
- `artifacts/signal24/src/index.css` — design tokens, typography, layout, and motion
- `artifacts/signal24/public/` — static images, icons, robots rules, and sitemap index
- `artifacts/api-server/src/routes/` — publication, policy, newsletter, community, and health endpoints
- `artifacts/api-server/src/middlewares/editorAuth.ts` — editor authorization boundary
- `lib/api-spec/openapi.yaml` — source of truth for generated API contracts
- `lib/db/src/schema/` — Drizzle database schema

## Architecture Decisions

- Unreviewed external feed items are leads, not Signal 24 reporting; source-linked publication records remain a separate editorial workflow.
- Public participant contributions are labeled separately from verified editorial records.
- Production web and API requests share one origin; the browser calls `/api` rather than a hard-coded API host.
- Canonical metadata is generated at runtime because a literal root canonical in the Vite HTML entry can break production builds. Canonicals, `og:url`, share images and sitemap URLs always use the fixed site origin (`artifacts/signal24/src/lib/seo.ts`, `SITE_ORIGIN` in `artifacts/api-server/src/routes/publication.ts`), never the request host, so mirror hosts such as `*.replit.app` don't create duplicate content.

## Search engines: server-rendered pages

- Production does not serve the app as static files. The web artifact runs `artifacts/signal24/server/index.ts` (built by `vite.server.config.ts` to `dist/server/index.mjs`, one self-contained file). It serves `dist/public` and renders every page URL with its real status (404 for unknown addresses, 301 for `/stories/:id`, non-canonical slugs and trailing slashes), the same `<head>` tags the app sets, and the page's text, so crawlers can index pages without running JavaScript. If the API cannot answer it serves the plain app shell with a 503.
- The server and the app compute titles, descriptions, canonicals and structured data from the same modules: `src/lib/page-meta.ts` (fixed pages), `src/lib/stories.ts` (story visuals, paths, `storySeo`), `src/lib/states.ts` (`stateMeta`), `src/lib/authors.ts`, `src/lib/structured-data.ts`. `server/html.ts` `buildHead` mirrors `useSeo` rule for rule; change them together.
- The server reads the API at `API_ORIGIN` (default `http://127.0.0.1:8080`, falling back to the public site origin) with a 30-second cache, and embeds the responses it rendered from in `<script id="signal-data">`; `primeFromServer` in `App.tsx` seeds React Query with them so the first render needs no fetch. Community responses are never embedded (they are per visitor).
- `robots.txt` must not block `/api/`: pages load their records from it and Googlebot obeys robots.txt for those requests. The API sends `X-Robots-Tag: noindex` on everything except `/api/sitemap.xml`.
- Court explainers (`Courts & Policy`, not paper notes) live under `/articles/`; `/policies/:slug` belongs to the policy ledger. Old `/policies/<title>-<id>` story URLs redirect to the article.
- Named authors: profiles in `src/lib/authors.ts`, pages at `/authors/:slug`, listed on About and in the sitemap. Pack reporting is bylined by desk (`artifacts/api-server/src/lib/authors.ts`); a byline an editor set is never overwritten. Bios state beat and method only — add credentials only if they are true.

## Operations and content quality

- `OPERATIONS.md` is the runbook for publishing: the never-break rules (primary sources, nothing invented, honest labels, public corrections, Hindi always), where each kind of content lives, the twice-weekly scheduled runs, and how a run publishes.
- `pnpm run check:site` (`scripts/site-check.sh`) is the gate before any publish: `scripts/content-check.ts` (sources, bylines, length floors for stubs, Hindi present, author/sitemap lists in sync, update entries valid), both typechecks, web tests, API tests when `DATABASE_URL` is set, and both production builds.
- Published records are updated without touching the database by hand: `STORY_UPDATES` and `POLICY_UPDATES` in `artifacts/api-server/src/lib/content-pack-updates.ts` are applied once on API start (dated `## Update` sections; newest court status per ledger record, never over a later editor change).
- Answers carry a "what the law says" section and common mistakes (`src/lib/answers-depth.ts`); ledger records carry "why it matters" and open questions (`src/lib/policy-notes.ts`); About, Editorial standards and Methodology text lives in `src/lib/info-pages.ts`. All are rendered by the app and the page server.
- Bylines are disclosed as pen names of the desk (`PEN_NAME_NOTE` in `src/lib/authors.ts`), and the standards page says records are AI-assisted, checked automatically and labelled source-linked. Keep those statements true.
- Search pages are rendered by the page server, not prerendered at build time: there is no build-time prerender step or per-route static rewrite, and the build does not need the API running. State pages are indexable when the state has a profile; `SITEMAP_STATE_SLUGS` in the API must list exactly those (enforced by the content check).
- Single event and source pages are `noindex, follow` and not in the sitemap (short reference entries); `/events` and `/timeline` carry them.

## Bilingual edition (English and Hindi)

- English lives at `/`, Hindi at `/hi/...` (wouter nested route in `artifacts/signal24/src/App.tsx`). Language context, labels and the switch are in `src/lib/i18n.tsx`; URL localization, canonicals and hreflang are in `src/lib/seo.ts`.
- UI copy is inline: `t('English', 'हिंदी')`. Fixed API values (topics, kinds, states, statuses) are translated by `useLabel()`.
- Record translations are stored in the `hi` jsonb column on stories and policy records and edited in the editorial desk. A Hindi page without a translation shows the English text with a notice and is `noindex`; the sitemap only lists `/hi` URLs that are translated.
- Devanagari typography rules are scoped with `:lang(hi)` at the end of `src/index.css`. Never letter-space Devanagari, never use `::first-letter` on it, and keep display line-height at 1.25 or more.
- Story bodies support a small Markdown subset (`## `, `? `, `> `, `- `, `::: Key facts`, `**bold**`, links), rendered by `src/components/rich-body.tsx`.
- `artifacts/api-server/src/lib/content-pack*.ts` holds bilingual, source-linked reporting, explainers and labelled opinion (part D is the 2026 record: UGC equity rules, Census 2027, Bihar and Maratha litigation). On startup they are published once, labelled `source-linked` with an AI-assistance disclosure, in the issue "The accountability record". Records an editor has already revised are never overwritten or auto-published. The unsourced starter placeholders from `seed.ts` are archived (not deleted) once the pack is live, unless an editor has attached a source to them.
- `artifacts/api-server/src/lib/policy-ledger-pack.ts` adds bilingual policy ledger records (inserted once by slug); `evidence-pack.ts` adds dated evidence events with their source documents and links them to the stories that rely on them. Pending court matters carry a "last checked" date in their text; re-check them before each update.
- The front page opens with a theatrical 3D stage (`src/components/home-stage.tsx`): curtains, a spotlight, a ring of the latest case files and running "days since" clocks from `src/lib/key-figures.ts`. All motion is removed under `prefers-reduced-motion`. Key figures (`src/components/key-figures.tsx`) appear on the front page and in the data room; update `KEY_FIGURES_CHECKED_ON` whenever they are re-verified.
- Below the stage, the front page runs in one order with no repeats (`Home()` in `src/App.tsx`, sections in `src/components/home-sections.tsx`, styles under `hp-*` in `index.css`): the lead, a second lead with a numbered rail of six more records, the accountability demand cards (`DemandBoard`), six desks, key figures, the three latest ledger entries, an Answers band with search, the states map, a sideways-scrolling timeline of dated events, opinion, and the anonymous community floor. The live desk shows only when it has on-focus leads; the newsletter form lives in the global footer (`#newsletter`). On phones the figures and desks become swipeable rows.
- Topic files (`/topics`, `/topics/:topic`, `/topics/open-category-competition`) reuse the stage (`src/components/topic-stage.tsx`): the index is a cabinet of 3D hanging files, and each topic page shows its desk brief (`src/lib/topic-briefs.ts`: dated state of play and open questions), its key figures, records, an evidence spine built from published evidence events, related ledger records and every source. Brief lines only restate facts already sourced on the site; update `TOPIC_BRIEFS_CHECKED_ON` when re-checked. Unknown topic slugs return the 404 page.
- Opinion (`/opinion`) and the data room (`/data`) use the same stage. Opinion leads with the newest editorial and its pull quote (the first `> ` line of its body), lists every signed piece, and shows the demand board (`src/components/opinion-data.tsx`): the Accountability Watch questions with live day counts that turn over to show the demand. The data room adds the "Against the ceiling" chart (figures already stated in published records; colours validated for colour-vision separation, status always repeated as text, with a table view), the withheld datasets with day counts, and the Data & Notes evidence timeline.
- Site shell: `src/components/site-chrome.tsx` holds the header (topline, Topics mega-menu, Explore menu, search, phone drawer) and the one footer. The footer is rendered once by `GlobalFooter` after every public route in `AppRoutes`; pages must not render their own.
- Article pages put reading first: headline and art, then contents / body / at-a-glance rail, then evidence and related reading. Record bodies support `::: [questions] Title` (the hard-questions panel) and `::: [check] Title` (check-it-yourself steps) in addition to the existing Markdown subset.
- Content-pack addenda (`artifacts/api-server/src/lib/content-pack-addenda-*.ts`) append the deeper record, the hard questions and check-it-yourself steps to each pack story. On startup a stored body is upgraded only while it is still exactly the original pack text, separately for English and Hindi, with a revision logged.
- Answers (`/answers`, `/answers/:id`; `src/lib/answers.ts`): sourced answers to what citizens ask about the state (RTI, reservation, courts, Parliament, data, complaints). Update `ANSWERS_CHECKED_ON` when re-checked, and keep `SITEMAP_ANSWER_IDS` in `artifacts/api-server/src/routes/publication.ts` in step with the ids.
- States (`/states`, `/state/:slug`; `src/lib/states.ts`, `src/components/states-pages.tsx`): all 36 states and UTs on an interactive map. Full profiles exist only where published records establish the facts; other states say so and are noindex until they have a record. Keep `SITEMAP_STATE_SLUGS` in step with the profiled states.
- Community (`/community`; `src/components/community-pages.tsx`, `artifacts/api-server/src/routes/community.ts`): anonymous questions and discussion with stable per-browser handles, helpful votes on answers, reports (three different reporters hide an item), rate limits, and an optional `COMMUNITY_BLOCKED_TERMS` environment variable (comma-separated) that moderators can set without a deploy. The new columns and tables are created idempotently at startup by `lib/community-schema.ts`, so production keeps working before a schema push; run the push afterwards to keep Drizzle in step. Participant threads are noindex.
- The timeline is built from dated evidence events and ledger entries (real dates since 1951), with external leads labelled separately.
- The front-page Accountability Watch lives in `src/lib/accountability.ts`; update `ACCOUNTABILITY_CHECKED_ON` whenever items are re-verified.

## Product

The publication provides a current briefing, a source-linked archive, a policy ledger, court and state coverage, a data room, editorial standards, and a public participant noticeboard. The private editorial desk manages publication records and revision history.

## Operational Notes

- Do not treat a `scheduled` story status as an automatic publication promise until a production scheduler is configured and verified.
- Keep production database changes separate from development schema pushes.
- Check the source URL and verification status on each record before describing it as reporting or a finding.