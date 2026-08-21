# Bug Fix: V15 source and Flow selection variance

- **Slug**: v15-source-flow-variance
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Initial Ingest now tells agents to retain available supported IaC observations,
and released Flow guidance excludes a System plus its single contained runtime
from standalone Flow promotion.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `.agents/skills/agentbase-ingest/SKILL.md` | modified | Requires available supported structured evidence and independent Flow endpoints. |
| `.agents/skills/agentbase-okf/references/navigation-and-boundaries.md` | modified | Records the same source and boundary rules. |
| `benchmark/prompts/okf-author-v15.md` | modified | Applies the rules to Terraform-only qualification. |
| `src/core/knowledge/schemas/definitions/infrastructure.ts` | modified | Publishes the minimum Flow endpoint boundary. |
| `src/core/knowledge/schemas/catalog.test.ts` | updated test | Pins AB-SCHEMA-044 wording in released guidance. |
| `docs/contracts/okf.md` | modified | Adds AB-SCHEMA-043/044 current truth. |

## Tests Added or Updated

- `[AB-SCHEMA-044] schemas describe useful boundaries rather than cloud products` — requires two independent endpoint boundaries and excludes a single contained Function.

## Local Verification

- `node --test --experimental-strip-types src/core/knowledge/schemas/catalog.test.ts src/core/knowledge/schemas/guidance.test.ts` → 13/13 passed.
- `git diff --check` → passed.

## Deviations from Assessment

The active spec, plan, checklist and task record were updated for traceability.
No runtime inference or extra test case was added.

## Follow-ups

- Run the full offline gate, then one sequential model probe. Run a replica only
  if the probe has no clear lifecycle or quality blocker.
