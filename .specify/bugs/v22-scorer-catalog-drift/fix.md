# Bug Fix: V22 scorer catalog drift

- **Slug**: v22-scorer-catalog-drift
- **Fixed**: 2026-08-25
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The scorer no longer assigns a shared Question to a required concept probe and
now recognizes current catalog Flow/Component documents as useful parents.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `scripts/benchmark/benchmark-okf.mjs` | modified | Corrected concept assignment and parent-role heuristic. |
| `scripts/benchmark/benchmark-okf.test.mjs` | modified | Added requirement-linked regressions without increasing test count. |

## Tests Added or Updated

- `[AB-BENCH-004][AB-BENCH-005]` — generic Question terms cannot create a wrong-schema contradiction.
- `[AB-BENCH-023]` — a current-catalog Flow prevents the stale Function-fragmentation finding.

## Local Verification

- `node --test scripts/benchmark/benchmark-okf.test.mjs` → 6/6 passed.
- V22 `2026-08-25T162253Z` re-finalization → `valid_partial`, no hard failures.

## Deviations from Assessment

None.

## Follow-ups

- Keep the missing Glue crawler source probe visible as non-blocking owner-review evidence.
