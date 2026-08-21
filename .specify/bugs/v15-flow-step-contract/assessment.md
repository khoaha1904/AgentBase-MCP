# Bug Assessment: V15 Flow step contract is incomplete

- **Slug**: v15-flow-step-contract
- **Created**: 2026-08-21
- **Source**: retained benchmark run `2026-08-21T135125Z`
- **Verdict**: valid
- **Severity**: high

## Report

The agent drafted a valid Flow meaning but changed-set validation rejected all
steps as malformed. It tried `order/from/to` and then `sequence/from/to` because
schema guidance did not expose the validator's exact serialized field names.

## Symptom

Flow guidance publishes actions and modes but not the required
`order/source/action/target/mode/evidence` shape. Validation returns only
`flow_steps entry is malformed`, so one bounded repair cannot reliably fix it.

## Reproduction

1. Request the released Flow schema through authoring guidance.
2. Observe that `flowStepGuidance` lacks required field names.
3. Validate a step using `from` and `to`; observe the generic malformed error.

## Suspected Code Paths

- `src/core/knowledge/schemas/definition.ts` — public schema guidance shape.
- `src/core/knowledge/schemas/definitions/infrastructure.ts` — Flow guidance.
- `src/core/knowledge/documents/okf-relationships.ts` — malformed-step diagnostic.

## Root Cause Hypothesis

High confidence: validator and schema guidance evolved separately. The
validator has an exact shape, while the public authoring contract exposes only
allowed values and prose.

## Proposed Remediation

**Preferred**: add the exact required field list to existing Flow guidance and
make malformed validation name the required shape. Reuse the current data
contract; add no template engine or abstraction.

**Files likely to change**:

- `src/core/knowledge/schemas/definition.ts`
- `src/core/knowledge/schemas/definitions/infrastructure.ts`
- `src/core/knowledge/documents/okf-relationships.ts`
- existing catalog/Initial Ingest tests and current requirement documentation

**Tests to add or update**:

- Existing catalog contract asserts the complete field list.
- Existing Initial Ingest flow verifies the actionable malformed diagnostic.

## Risks & Considerations

- Additive MCP response data is compatible with existing callers.
- Exact validation semantics remain unchanged.

## Open Questions

None.
