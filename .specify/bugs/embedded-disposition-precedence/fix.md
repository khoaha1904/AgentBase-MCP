# Bug Fix: Embedded disposition does not take precedence

- **Slug**: embedded-disposition-precedence
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Embedded disposition now overrides redundant standalone hints and returns a
visible limitation instead of failing the whole guidance request.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/guidance.ts` | modified | Preserves embedded precedence and warning. |
| `src/core/knowledge/schemas/guidance.test.ts` | updated test | Covers exact contradictory-hint shape. |
| `docs/contracts/okf.md` | clarified AB-SCHEMA-036 | Keeps parent/evidence/shape strict. |
| `specs/022-single-repository-ingest/spec.md` | clarified AB-SCHEMA-036 | Aligns active behavior. |

## Tests Added or Updated

- Existing AB-SCHEMA-036 test now proves embedded output, no schema and a visible ignored-hint limitation.

## Local Verification

- Focused guidance tests → 8/8 passed.
- `npm run typecheck` → passed.

## Deviations from Assessment

None.

## Follow-ups

- Run the complete gate before another model probe.
