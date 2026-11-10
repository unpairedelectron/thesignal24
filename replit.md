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

## Bilingual edition (English and Hindi)

- English lives at `/`, Hindi at `/hi/...` (wouter nested route in `artifacts/signal24/src/App.tsx`). Language context, labels and the switch are in `src/lib/i18n.tsx`; URL localization, canonicals and hreflang are in `src/lib/seo.ts`.
- UI copy is inline: `t('English', 'हिंदी')`. Fixed API values (topics, kinds, states, statuses) are translated by `useLabel()`.
- Record translations are stored in the `hi` jsonb column on stories and policy records and edited in the editorial desk. A Hindi page without a translation shows the English text with a notice and is `noindex`; the sitemap only lists `/hi` URLs that are translated.
- Devanagari typography rules are scoped with `:lang(hi)` at the end of `src/index.css`. Never letter-space Devanagari, never use `::first-letter` on it, and keep display line-height at 1.25 or more.
- Story bodies support a small Markdown subset (`## `, `? `, `> `, `- `, `::: Key facts`, `**bold**`, links), rendered by `src/components/rich-body.tsx`.
- `artifacts/api-server/src/lib/content-pack*.ts` holds bilingual, source-linked reporting, explainers and labelled opinion (part D is the 2026 record: UGC equity rules, Census 2027, Bihar and Maratha litigation). On startup they are published once, labelled `source-linked` with an AI-assistance disclosure, in the issue "The accountability record". Records an editor has already revised are never overwritten or auto-published. The unsourced starter placeholders from `seed.ts` are archived (not deleted) once the pack is live, unless an editor has attached a source to them.
- `artifacts/api-server/src/lib/policy-ledger-pack.ts` adds bilingual policy ledger records (inserted once by slug); `evidence-pack.ts` adds dated evidence events with their source documents and links them to the stories that rely on them. Pending court matters carry a "last checked" date in their text; re-check them before each update.
- The front page opens with a theatrical 3D stage (`src/components/home-stage.tsx`): curtains, a spotlight, a ring of the latest case files and running "days since" clocks from `src/lib/key-figures.ts`. All motion is removed under `prefers-reduced-motion`. Key figures (`src/components/key-figures.tsx`) appear on the front page and in the data room; update `KEY_FIGURES_CHECKED_ON` whenever they are re-verified.
- Topic files (`/topics`, `/topics/:topic`, `/topics/open-category-competition`) reuse the stage (`src/components/topic-stage.tsx`): the index is a cabinet of 3D hanging files, and each topic page shows its desk brief (`src/lib/topic-briefs.ts`: dated state of play and open questions), its key figures, records, an evidence spine built from published evidence events, related ledger records and every source. Brief lines only restate facts already sourced on the site; update `TOPIC_BRIEFS_CHECKED_ON` when re-checked. Unknown topic slugs return the 404 page.
- Opinion (`/opinion`) and the data room (`/data`) use the same stage. Opinion leads with the newest editorial and its pull quote (the first `> ` line of its body), lists every signed piece, and shows the demand board (`src/components/opinion-data.tsx`): the Accountability Watch questions with live day counts that turn over to show the demand. The data room adds the "Against the ceiling" chart (figures already stated in published records; colours validated for colour-vision separation, status always repeated as text, with a table view), the withheld datasets with day counts, and the Data & Notes evidence timeline.
- The front-page Accountability Watch lives in `src/lib/accountability.ts`; update `ACCOUNTABILITY_CHECKED_ON` whenever items are re-verified.

## Product

The publication provides a current briefing, a source-linked archive, a policy ledger, court and state coverage, a data room, editorial standards, and a public participant noticeboard. The private editorial desk manages publication records and revision history.

## Operational Notes

- Do not treat a `scheduled` story status as an automatic publication promise until a production scheduler is configured and verified.
- Keep production database changes separate from development schema pushes.
- Check the source URL and verification status on each record before describing it as reporting or a finding.