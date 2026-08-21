# Bug Assessment: Resource promotion repeats semantic evidence

- **Slug**: v15-resource-promotion-evidence
- **Created**: 2026-08-21
- **Source**: benchmark probe `2026-08-21T161342Z`
- **Verdict**: valid
- **Severity**: low

## Report

`get_okf_authoring_schemas` rejected a Resource candidate that carried an exact
candidate-owned semantic observation because `promotion.evidence_ids` named
only the candidate's structured Terraform observations.

## Symptom

An otherwise valid Interface/Resource request fails unless the semantic
observation ID is duplicated inside the nested promotion evidence list. The
candidate-level evidence list should establish semantic support; the promotion
list should only evidence the stated promotion basis.

## Reproduction

1. Submit a Resource candidate with compatible `promotion.basis`.
2. Include candidate-owned structured and semantic observations in
   `candidate.evidence_ids`.
3. Put the structured observation ID in `promotion.evidence_ids`.
4. Observe `Interface/Resource promotion requires semantic evidence`.

## Suspected Code Paths

- `src/core/knowledge/schemas/guidance.ts:validateRequest()` — searches only
  `promotion.evidenceIds` for semantic evidence.
- `src/core/knowledge/schemas/guidance.test.ts` — covers missing semantic
  evidence but not semantic evidence supplied at candidate scope.

## Root Cause Hypothesis

High confidence. The validator retained the older nested-list requirement after
AB-SCHEMA-042 was simplified to require a compatible promotion basis and exact
candidate-owned semantic evidence. Candidate ownership is already validated,
so requiring the same ID in both lists is redundant request shape.

## Proposed Remediation

**Preferred**: Check for a semantic observation among the candidate's evidence
IDs, regardless of which candidate-owned evidence IDs support the promotion
basis. Preserve the compatible-basis check and rejection when semantic evidence
is genuinely absent.

**Files likely to change**:

- `src/core/knowledge/schemas/guidance.ts`
- `src/core/knowledge/schemas/guidance.test.ts`
- `docs/contracts/okf.md`
- `specs/022-single-repository-ingest/spec.md`

**Tests to add or update**:

- Extend the existing AB-SCHEMA-042 test with the exact benchmark request shape.

## Risks & Considerations

- No schema, API field or persistence change.
- Source ownership and the requirement for real semantic evidence remain hard.

## Open Questions

None.
