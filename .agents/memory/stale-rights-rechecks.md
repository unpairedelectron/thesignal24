---
name: Stale rights rechecks
description: Concurrency rule for source-sourced image-rights updates.
---

A source recheck apply is based on both the saved rights terms and review state observed before its provider lookup. If either changes before the locked update, return a conflict and do not write history or clear the newer review.

**Why:** Applying terms fetched before a newer editor decision could silently reset that decision, even when the saved metadata itself had not changed.

**How to apply:** When adding or changing a source-recheck path, compare its original terms and review snapshot with the locked candidate before updating or inserting history.
