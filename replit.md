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
- `artifacts/api-server/src/lib/content-pack*.ts` holds bilingual sourced explainers and labelled opinion. On startup they are inserted once, in `review` status, into a draft issue titled "The accountability record"; nothing is published automatically.
- The front-page Accountability Watch lives in `src/lib/accountability.ts`; update `ACCOUNTABILITY_CHECKED_ON` whenever items are re-verified.

## Product

The publication provides a current briefing, a source-linked archive, a policy ledger, court and state coverage, a data room, editorial standards, and a public participant noticeboard. The private editorial desk manages publication records and revision history.

## Operational Notes

- Do not treat a `scheduled` story status as an automatic publication promise until a production scheduler is configured and verified.
- Keep production database changes separate from development schema pushes.
- Check the source URL and verification status on each record before describing it as reporting or a finding.