---
name: OpenAPI date-only fields
description: Keep date-only API values from becoming timestamps during generated Zod validation.
---

For date-only API fields that pass through generated Zod validation, describe the value as a string with a `YYYY-MM-DD` pattern rather than OpenAPI `format: date`. The generated schema may coerce `format: date` into a `Date`, so response parsing can turn a date-only value into an ISO timestamp at midnight.

**Why:** Evidence search initially returned date-only values as `YYYY-MM-DDT00:00:00.000Z` after generated response validation, which blurred the difference between calendar dates and publication timestamps.

**How to apply:** Use a date-time format for actual instants; use pattern-constrained strings for calendar dates in request and response schemas that are parsed by generated Zod code.