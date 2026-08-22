# Bug Fix: Batch Domain omits descriptively labeled Systems

- **Slug**: batch-domain-system-navigation
- **Fixed**: 2026-08-22
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Batch Domain composition now derives each member's Repository and confirmed-
Domain Systems from parsed concepts and exact repository provenance instead of
depending on authored navigation prose.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/batch-ingest/composition.ts` | modified | Retains prior coordinator rows and renders canonical current-member concept rows. |
| `src/app/hub-okf/workspace/local-only-e2e.test.ts` | updated test | Uses descriptive authored System rows and asserts all member Systems survive composition. |

## Tests Added or Updated

- Existing `[AB-BATCH-006]` local-Hub E2E test now reproduces the V5 prose
  variance across three members without adding a top-level test.

## Local Verification

- `node --test src/app/hub-okf/workspace/local-only-e2e.test.ts` → 1/1 passed.

## Deviations from Assessment

None.

## Follow-ups

- Run the complete repository gate before the authorized stability replica.
