# Bug Fix: Body-only reference collision

- **Slug**: v13-reference-body-collision
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Wrong-schema contradictions now require reference identity terms in canonical
identity or title. Contextual descriptions and Markdown bodies can still support
same-schema matching but cannot manufacture a hard contradiction.

## Changes

| File | Change | Notes |
|---|---|---|
| `scripts/benchmark/benchmark-okf.mjs` | modified | Separates name identity from contextual description/body matching. |
| `scripts/benchmark/benchmark-okf.test.mjs` | added/updated regressions | Preserves genuine wrong-schema detection and rejects body-only collisions. |
| `docs/contracts/benchmark.md` | clarified | Updates AB-BENCH-004 matching semantics. |

## Tests Added or Updated

- `[AB-BENCH-004][AB-BENCH-023] body-only repository links do not create schema contradictions`.
- Existing genuine wrong-schema test now carries the identity claim in its
  primary name rather than only its body.

## Local Verification

- Focused 48-test command passed.
- Read-only scoring of retained runs changed both Health assessments from
  `invalid` to `reviewable`; Shopping remains correctly invalid because
  `components/shopping-cart-system` is explicitly typed `Service`.

## Deviations from Assessment

- The assessment included description in the strong primary identity. Read-only
  scoring showed descriptions are also contextual (`Product API` mentions the
  Shopping Cart parent), so the fix correctly narrows hard contradictions to
  canonical identity and title.

## Follow-ups

- Historical metrics remain unchanged. Apply corrected scoring only to new or
  explicitly read-only interpretations.
