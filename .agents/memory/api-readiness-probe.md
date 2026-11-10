---
name: API artifact readiness probe
description: Deployment startup probes may target the API artifact mount path in addition to its configured health endpoint.
---

When changing API startup health checks, keep the API artifact's public mount path (`/api`) returning a lightweight 200 health response before authentication middleware, in addition to the explicit `/api/healthz` route.

**Why:** A failed publish's startup logs showed `/api` returning HTTP 500 while `/api/healthz` later returned 200; the deployment's readiness check was hitting the mount path.

**How to apply:** For API services mounted under a path, validate both the mount path and the configured health endpoint without credentials before considering publishing ready.
