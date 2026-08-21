# Bug Fix: Duplicate category index entries pass validation

- **Slug**: v15-duplicate-index-entries
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The shared OKF bundle loader now rejects repeated Markdown navigation targets,
and Initial Ingest guidance tells agents to preserve navigation already emitted
by Prepare.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/documents/okf-bundle.ts` | modified | Raises `INDEX_DUPLICATE` for a repeated target in one index. |
| `src/app/hub-okf/authoring/initial-ingest.test.ts` | updated test | Reproduces the observed append, asserts rejection, restores the bundle and completes the lifecycle. |
| `.agents/skills/agentbase-ingest/SKILL.md` | modified | Makes prepared-navigation ownership explicit. |
| `.agents/skills/agentbase-okf/references/navigation-and-boundaries.md` | modified | Records navigation and sparse-Domain authoring rules. |
| `benchmark/prompts/okf-author-v15.md` | modified | Applies the same instruction to qualification. |
| `docs/contracts/okf.md` | modified | Adds AB-INGEST-013 to current truth. |

## Tests Added or Updated

- `[AB-INGEST-013] preparation renders one generic inspectable skeleton bundle and stops` — repeated `publisher.md` navigation is rejected before the restored proposal finalizes.

## Local Verification

- `node --test --experimental-strip-types src/app/hub-okf/authoring/initial-ingest.test.ts` → 1/1 passed.
- `git diff --check` → passed.

## Deviations from Assessment

The active spec, plan, checklist, task/verification records, current checkpoint
and V15 qualification prompt were also updated so the accepted requirement and
next model run use the same rule. Runtime scope did not expand.

## Follow-ups

- Run the repository gate, then use one separately authorized sequential probe;
  do not run a replica unless that probe has no clear blocker.
