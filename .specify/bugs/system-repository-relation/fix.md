# Bug Fix: System repository relation is unjudged

- **Slug**: system-repository-relation
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

System schema guidance now judges the canonical, evidenced
`implemented-in -> Repository` source-ownership relation.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/definitions/foundation.ts` | modified | Added one System relationship rule. |
| `src/core/knowledge/schemas/catalog.test.ts` | updated test | Pins the exact Repository target. |
| `docs/contracts/okf.md` | added AB-SCHEMA-045 | Records current relation truth. |
| `specs/022-single-repository-ingest/spec.md` | added AB-SCHEMA-045 | Aligns the active capability. |

## Tests Added or Updated

- Existing catalog boundary test now asserts System `implemented-in` targets only Repository.

## Local Verification

- `node --test --experimental-strip-types src/core/knowledge/schemas/catalog.test.ts` → 5/5 passed.

## Deviations from Assessment

None.

## Follow-ups

- Run the complete repository gate and one model probe.
