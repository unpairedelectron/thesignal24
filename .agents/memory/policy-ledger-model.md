---
name: Policy ledger record model
description: Durable modeling decision for source-linked policy changes.
---

Policy changes are modeled as dedicated ledger records with separate first-class source rows, rather than as story records with policy fields embedded in narrative content.

**Why:** A policy reference needs stable identity, before/after framework fields, legal and court context, and independently traceable publication and retrieval metadata.

**How to apply:** Keep future policy-specific filters, permanent URLs, source metadata, and editorial workflows on the ledger model; use story records for publication narratives and briefings.