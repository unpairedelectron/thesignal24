---
name: Vite static canonical handling
description: The Signal 24 uses runtime canonical metadata because Vite treats a literal root canonical URL as an asset during production builds.
---

For this artifact, canonical metadata belongs in the client-side SEO helper rather than as a literal `href="/"` link in `index.html`.

**Why:** Vite’s HTML asset transform attempted to read the workspace root directory when the static entry document contained a root canonical URL, causing the production build to fail with `EISDIR`.

**How to apply:** Keep the static entry document’s title and fallback description/robots metadata, and let route-aware client code create or remove the canonical link after navigation.