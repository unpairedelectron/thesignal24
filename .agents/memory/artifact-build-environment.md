---
name: Artifact build environment
description: The environment values required when building the Signal 24 Vite artifact outside its managed workflow
---

Standalone builds of the Signal 24 web artifact must provide the same `PORT` and `BASE_PATH` values that the managed artifact workflow injects. The dev workflow already supplies them automatically.

**Why:** The Vite config intentionally fails fast when either value is absent, so an otherwise healthy application can look like a build failure when invoked directly from the shell.

**How to apply:** Use the artifact's configured values for local verification, while leaving the managed workflow and artifact routing unchanged.