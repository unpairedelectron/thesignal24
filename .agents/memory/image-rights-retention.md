---
name: Image-rights retention
description: Retention rules for image candidate records and their rights-change history.
---

Image candidate removal is archival, not physical deletion. Candidate rights history remains linked to its candidate; deleting a discovery lead detaches the candidate, and the editor can still inspect its attribution and history in the archive. Hard deletion of a candidate with rights history must be blocked.

**Why:** Rights changes support later verification and disputes, so candidate cleanup must not erase the history or its identifying context.

**How to apply:** Preserve the candidate row and identity, record editor removal attribution, and keep archived candidates read-only. If parent leads are removed, retain candidates with a nullable lead reference and expose them in the editor archive.
