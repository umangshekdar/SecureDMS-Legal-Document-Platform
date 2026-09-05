---
name: Orval integer schemas
description: Compatibility note for OpenAPI numeric types and the generated Zod package.
---

Use `type: number` for numeric fields in OpenAPI contracts in this workspace when the generated validation code must compile against the installed Zod 3 runtime.

**Why:** Orval 8 generated `zod.int()` for OpenAPI `integer`, but the installed `zod` package exposed to the generated library did not provide that API, causing library typecheck failures after otherwise successful code generation.

**How to apply:** Prefer number schemas for prototype counts and scores unless the generated Zod dependency is upgraded in a coordinated workspace change.