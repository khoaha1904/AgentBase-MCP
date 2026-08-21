# Bug Assessment: Parent concept cannot reuse its embedded child's evidence

- **Slug**: parent-embedded-evidence
- **Created**: 2026-08-22
- **Source**: post-AB-SCHEMA-046 probe `2026-08-21T170242Z`
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

The post-fix probe proposed a Function plus embedded DynamoDB, schedule and
endpoint-configuration candidates. The Function cited the schedule observation
as lifecycle evidence while the embedded schedule also owned it. Schema
guidance rejected the request because the Function cited evidence owned by
another candidate.

## Symptom

Knowledge explicitly classified as embedded in one parent cannot support that
parent's identity or promotion. The caller must duplicate the same observation
under the parent or omit relevant evidence, even though the embedded item has no
standalone concept and will be rendered inside that parent.

## Reproduction

1. Submit one standalone Function parent and one direct embedded schedule child.
2. Let the child own the exact schedule observation.
3. Cite the schedule observation from the parent as lifecycle evidence.
4. Observe schema guidance fail with `cites evidence owned by another candidate`.

## Root Cause Hypothesis

Confidence: high. Strict candidate ownership does not account for the explicit
parent-child ownership relationship already required for embedded knowledge.

## Proposed Remediation

Allow a standalone concept candidate to reuse supporting or promotion evidence
owned by its direct embedded children in the same bounded request. Keep the
embedded child's own evidence list strict. Do not allow evidence from an
unrelated embedded candidate, sibling, standalone concept or transitive child.
Keep the separately approved cross-boundary Flow rule unchanged.

## Risks & Considerations

- The exception must use the exact `parentCandidateId`; disposition alone is
  insufficient.
- This does not promote the embedded child or create a new identity/relation.
- Interface/Resource semantic-promotion rules continue to require evidence for
  their own standalone boundary.

## Open Questions

- Owner approval is required before changing parent promotion attribution.

