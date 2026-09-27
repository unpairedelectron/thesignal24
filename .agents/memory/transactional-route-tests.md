---
name: Transactional route tests
description: Avoid leaving PostgreSQL rollback-based route tests in an aborted transaction after deliberately testing duplicate writes.
---

When a route test runs its HTTP requests through a database transaction that will be rolled back, test duplicate inserts with conflict-safe writes such as `ON CONFLICT DO NOTHING`. Catching a unique-constraint exception does not clear PostgreSQL's failed-transaction state; later requests in the same test transaction will fail.

**Why:** A duplicate-source test returned the expected conflict response, but subsequent requests in the same transaction failed because the database transaction remained aborted.

**How to apply:** Prefer idempotent conflict handling for uniqueness races in editor CRUD routes. If an exception must be exercised, isolate it behind a savepoint or in a separate transaction instead of continuing in the same rollback fixture.