# Bug Assessment: Flow endpoint guidance permits embedded labels

- **Slug**: v15-flow-endpoint-guidance
- **Created**: 2026-08-21
- **Source**: retained benchmark run `2026-08-21T142407Z`
- **Verdict**: valid
- **Severity**: high

## Report

The agent used an EventBridge schedule, AWS Health API, embedded DynamoDB state,
and notification endpoints as Flow `source`/`target` values. Validation correctly
rejected them because they were not promoted concept identities.

## Symptom

The schema publishes Flow field names but does not state in the same guidance
object that both endpoints must resolve to concepts supplied in the changed set
or target summaries. Embedded knowledge and free text therefore look usable.

## Reproduction

1. Request the released Flow schema.
2. Observe that `flowStepGuidance` names fields, actions and modes but not the
   concept-only endpoint rule.
3. Use an embedded label as `source`; validation reports a missing concept.

## Suspected Code Paths

- `src/core/knowledge/schemas/definition.ts` — public guidance shape.
- `src/core/knowledge/schemas/definitions/infrastructure.ts` — Flow guidance.
- `src/core/knowledge/schemas/catalog.test.ts` — released contract coverage.

## Root Cause Hypothesis

High confidence: the validator already enforces the correct graph invariant,
but the advisory schema omits that invariant at authoring time.

## Proposed Remediation

**Preferred**: add one endpoint rule to the existing Flow guidance stating that
`source` and `target` must be identities of supplied concepts, never embedded
knowledge or free text. Keep validator and concept granularity unchanged.

**Files likely to change**:

- `src/core/knowledge/schemas/definition.ts`
- `src/core/knowledge/schemas/definitions/infrastructure.ts`
- `src/core/knowledge/schemas/catalog.test.ts`
- current AB-SCHEMA-041 documentation

**Tests to add or update**:

- Extend the existing catalog contract test; do not add a test case.

## Risks & Considerations

- The response change is additive.
- The rule must not encourage promotion of implementation details merely to
  create Flow endpoints.

## Open Questions

None.
