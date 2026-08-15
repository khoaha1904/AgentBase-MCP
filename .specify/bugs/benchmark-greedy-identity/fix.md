# Bug Fix: Greedy semantic identity misassignment

- **Slug**: benchmark-greedy-identity
- **Fixed**: 2026-08-15
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Semantic matching now admits a same-schema candidate supported by expected
evidence even when wording varies, and ranks schema/evidence above a weak text
collision. A wrong-schema candidate still matches when it is the only complete
identity-term match, preserving honest schema scoring.

## Changes

| File | Change | Notes |
|---|---|---|
| `scripts/benchmark-okf.mjs` | modified | Added schema/evidence candidate admission and deterministic ranking priority. |
| `scripts/benchmark-okf.test.mjs` | added regression | Reproduces the schedule/Lambda/Business Flow collision. |

## Tests Added or Updated

- `[AB-BENCH-004][AB-BENCH-005] schema and evidence outrank a greedy identity collision`
  pins the real failure shape.
- The existing wrong-schema test proves the fix does not hide a schema error.

## Local Verification

- `node --test scripts/benchmark-okf.test.mjs` → 15 passed, 0 failed.

## Deviations from Assessment

None.

## Follow-ups

- Re-score the observed MCP bundle without overwriting its retained pair
  artifacts to distinguish corrected measurement from remaining authoring gaps.
