---
name: Browser test services
description: Service prerequisites for the Signal 24 browser test suite.
---

Run both the Signal 24 web and API artifact workflows before starting the state-map browser test.

**Why:** The test reads the archive through the development proxy before it launches Chromium. If either managed service is stopped, the initial request can return 502 and no browser interactions are exercised.

**How to apply:** Start or restart the existing managed web and API workflows, then run the browser test. Treat an initial archive-fetch failure as a service setup problem rather than a keyboard interaction regression.