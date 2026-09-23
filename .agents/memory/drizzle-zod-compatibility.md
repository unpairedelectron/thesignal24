---
name: Drizzle Zod compatibility
description: The workspace uses two Zod entrypoints for different generated schema layers.
---

Drizzle-Zod 0.8's generated types are based on `zod/v4`, while Orval's generated API schemas in this workspace use the root `zod` entrypoint. Keep those imports aligned with the library that owns the schema instead of mixing the inferred types across layers.

**Why:** The two entrypoints ship different type identities even though they are installed from the same Zod package, so using the root `zod` import for Drizzle-Zod schemas creates incompatible `z.infer` errors.

**How to apply:** Use `zod/v4` only where `drizzle-zod` schemas are inferred; use `@workspace/api-zod` for API request validation in the server and the generated client package for browser types.

API schemas generated with `coerce.date()` arrive in server handlers as `Date` values even when the Drizzle column uses `date(..., { mode: "string" })`. Normalize those values at the route boundary before inserts or updates.

**Why:** Mixing the generated API date type with Drizzle's string-mode date column produces misleading insert/update overload errors.

**How to apply:** Keep date normalization helpers next to API route serialization and do not spread parsed request objects directly into Drizzle writes when date modes differ.