#!/usr/bin/env bash
# The gate every change passes before it is published (see OPERATIONS.md).
# Content rules, both typechecks, unit tests, and both production builds.
# API route tests run too when DATABASE_URL points at a database.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Content check"
scripts/node_modules/.bin/tsx scripts/content-check.ts

echo "== Typecheck"
pnpm --filter @workspace/signal24 run typecheck
pnpm --filter @workspace/api-server run typecheck

echo "== Web tests"
pnpm --filter @workspace/signal24 run test

if [ -n "${DATABASE_URL:-}" ]; then
  echo "== API tests"
  pnpm --filter @workspace/api-server run test:evidence
  pnpm --filter @workspace/api-server run test:content-desk
else
  echo "== API tests skipped (no DATABASE_URL)"
fi

echo "== Build"
PORT="${PORT:-22481}" BASE_PATH="${BASE_PATH:-/}" pnpm --filter @workspace/signal24 run build
pnpm --filter @workspace/api-server run build

echo "Site check passed."
