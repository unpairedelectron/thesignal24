# The Signal 24

The Signal 24 is a public-interest editorial site and API. This repository is the
full pnpm workspace: the web app, API server, shared API/database packages, and
Replit artifact configuration.

## Recover the project

1. Clone the repository:

   ```sh
   git clone https://github.com/unpairedelectron/thesignal24.git
   cd thesignal24
   ```

2. Install **Node.js 24**, **pnpm 10.26.1**, and **PostgreSQL 16**.

3. Install workspace dependencies:

   ```sh
   npm install --global pnpm@10.26.1
   pnpm install
   ```

4. Create a PostgreSQL database and provide the environment variables below
   through Replit Secrets or another secure environment-variable manager.
   Never commit secret values or a populated `.env` file.

5. Apply the database schema:

   ```sh
   pnpm --filter @workspace/db run push
   ```

   Back up any existing database before applying schema changes. This repository
   contains the schema, not a backup of production records.

6. Start both services. In Replit, the `web` and `API Server` workflows are
   configured by the checked-in artifact manifests:

   ```sh
   pnpm --filter @workspace/signal24 run dev
   pnpm --filter @workspace/api-server run dev
   ```

   The web app is served at `/` and the API at `/api`. Outside Replit, set
   `PORT` for each process and use a local reverse proxy to route `/api` to the
   API server; the separate development ports do not provide that path routing
   by themselves. The web app also requires `BASE_PATH` (use `/` for a root
   deployment).

## Environment variables

Set these outside the repository:

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by the API and schema tools |
| `SESSION_SECRET` | Signing API session cookies |
| `CLERK_SECRET_KEY` | Server-side Clerk authentication |
| `CLERK_PUBLISHABLE_KEY` | Server-side Clerk configuration |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk configuration for the web app |
| `VITE_CLERK_PROXY_URL` | Optional Clerk proxy URL, if the deployment uses one |
| `EDITOR_EMAILS` | Comma-separated editor email allowlist |

The web dev server and API server require `PORT`. The web app also requires
`BASE_PATH`; Replit supplies both through the artifact configuration.

## Checks

```sh
pnpm run typecheck
pnpm --filter @workspace/signal24 run test
pnpm --filter @workspace/api-server run test:content-desk:adapters
pnpm --filter @workspace/api-server run test:content-desk:routes
pnpm run build
```

## Keep GitHub in sync

After making changes:

```sh
git status
git add <files>
git commit -m "Describe the change"
git push
```

Before working from another clone, run `git pull --ff-only` to get the latest
`main` branch.

## What this repository does not back up

GitHub stores the source code and Git history. It does not contain production
database records, Replit Secrets, Clerk account configuration, domain/DNS
settings, or deployment settings stored in external services. Back those up
separately so the site can be fully restored.
