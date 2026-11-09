---
name: Node test suite filters
description: Separate subsets of the Node test runner without accidentally running every test.
---

Use explicit positive prefixes in Node test names and select suites with positive `--test-name-pattern` expressions. Negative-lookahead filters did not reliably exclude the intended tests in this workspace; route and adapter labels selected their subsets as expected.

**Why:** The route-only command initially still ran provider tests when using a negative pattern, making suite results misleading.

**How to apply:** When a package command filters tests by name, give every relevant test a stable positive suite prefix and verify reported test counts for each command.
