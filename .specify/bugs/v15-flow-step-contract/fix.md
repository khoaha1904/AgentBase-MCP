# Bug Fix: V15 Flow step contract is incomplete

- **Slug**: v15-flow-step-contract
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The released Flow schema now publishes the exact serialized field list used by
validation, and malformed steps receive an actionable required-field message.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/definition.ts` | modified | Added exact required Flow fields to guidance. |
| `src/core/knowledge/schemas/definitions/infrastructure.ts` | modified | Published the validator-compatible field order. |
| `src/core/knowledge/documents/okf-relationships.ts` | modified | Named required malformed-step fields. |
| Existing catalog/Initial Ingest tests | modified | Covered public guidance and repair diagnostic. |
| Current OKF/capability contracts | modified | Recorded AB-SCHEMA-041. |

## Tests Added or Updated

- Existing catalog test asserts `order/source/action/target/mode/evidence`.
- Existing Initial Ingest E2E rejects `from/to` with an actionable diagnostic.

## Local Verification

- `node --test --experimental-strip-types src/core/knowledge/schemas/catalog.test.ts src/app/hub-okf/authoring/initial-ingest.test.ts` → 6/6 pass.
- `npm run typecheck` → pass.
- `git diff --check` → pass.

## Deviations from Assessment

None.

## Follow-ups

- Run the complete offline gate, then the separately authorized V15 benchmark.
