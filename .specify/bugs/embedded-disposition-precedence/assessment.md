# Bug Assessment: Embedded disposition does not take precedence

- **Slug**: embedded-disposition-precedence
- **Created**: 2026-08-21
- **Source**: benchmark probe `2026-08-21T163001Z`
- **Verdict**: valid
- **Severity**: low

## Report

Schema guidance rejected embedded DynamoDB and schedule candidates because the
agent also supplied standalone `suggested_type` and `promotion` fields.

## Symptom

AB-SCHEMA-036 states that detection never overrides disposition, but request
validation rejects contradictory standalone hints before the embedded
disposition can win.

## Reproduction

1. Submit a source-backed candidate with `disposition: embedded` and a valid
   concept parent.
2. Also supply a standalone suggested type and promotion record.
3. Observe `embedded candidate cannot request a standalone schema` instead of
   an embedded recommendation.

## Suspected Code Paths

- `src/core/knowledge/schemas/guidance.ts:validateRequest()` — treats redundant
  standalone hints as a fatal request-shape conflict.
- `src/core/knowledge/schemas/guidance.test.ts` — currently pins the fatal behavior.

## Root Cause Hypothesis

High confidence. Strict shape validation predates the explicit disposition
precedence contract. The embedded recommendation path already creates no schema
or graph identity, so it can safely ignore standalone hints.

## Proposed Remediation

**Preferred**: Keep validating all evidence ownership and promotion fields, but
let `embedded` disposition override `suggested_type` and `promotion`. Return a
visible limitation explaining that the standalone hints were ignored. Preserve
the requirement for a valid concept parent.

**Files likely to change**:

- `src/core/knowledge/schemas/guidance.ts`
- `src/core/knowledge/schemas/guidance.test.ts`
- `docs/contracts/okf.md`
- `specs/022-single-repository-ingest/spec.md`

**Tests to add or update**:

- Replace the embedded standalone-hint rejection assertion with an embedded
  precedence assertion and preserve parent/evidence validation.

## Risks & Considerations

- No standalone concept can be created because the returned disposition remains embedded.
- Malformed fields, missing parents and foreign evidence remain invalid.

## Open Questions

None.
