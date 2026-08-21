# Bug Fix: Resource promotion repeats semantic evidence

- **Slug**: v15-resource-promotion-evidence
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Interface/Resource validation now finds semantic support in the candidate's
evidence list instead of requiring the same observation ID in the nested
promotion evidence list.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/guidance.ts` | modified | Changed one evidence-list predicate. |
| `src/core/knowledge/schemas/guidance.test.ts` | updated test | Covers structured promotion evidence plus candidate semantic evidence. |
| `docs/contracts/okf.md` | clarified | Defines the two evidence-list responsibilities. |
| `specs/022-single-repository-ingest/spec.md` | clarified | Aligns active AB-SCHEMA-042 wording. |

## Tests Added or Updated

- `[AB-SCHEMA-033][AB-SCHEMA-036][AB-SCHEMA-042]` — preserves genuine missing-semantic rejection and accepts the retained benchmark shape.

## Local Verification

- `node --test --experimental-strip-types src/core/knowledge/schemas/guidance.test.ts` → 8/8 passed.

## Deviations from Assessment

None.

## Follow-ups

- Run the complete repository gate before model requalification.
