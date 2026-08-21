# Bug Assessment: Standalone concepts cannot share supporting evidence

- **Slug**: shared-concept-evidence
- **Created**: 2026-08-22
- **Source**: post-AB-SCHEMA-047 probe `2026-08-21T171202Z`
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

After Flow and direct embedded-child exceptions were verified offline, the next
probe stopped because a System cited its Function candidate's Terraform Lambda
observation as evidence of the cooperating runtime. MCP rejected that shared
evidence before Prepare.

## Symptom

The validator treats `observation.candidate_id` as exclusive evidence ownership.
In practice it identifies the observation's primary subject, while the same
source-backed fact may legitimately support a parent System, a Function and a
cross-boundary Flow. Callers must duplicate observations or encounter a new
role-specific rejection.

## Reproduction

1. Submit standalone System and Function candidates.
2. Give the Function an exact Terraform Lambda observation.
3. Cite that observation from the System together with System-owned capability
   documentation.
4. Observe schema guidance reject the System for foreign evidence.

## Root Cause Hypothesis

Confidence: high. The exclusive-ownership invariant is stricter than the OKF
provenance model and the product's multi-source knowledge design. The previous
narrow Flow and embedded-child exceptions demonstrate that role-by-role
exceptions do not form a stable general contract.

## Proposed Remediation

Treat observations as globally attributable records within one bounded request:

- any standalone concept may cite any known observation as supporting evidence;
- embedded candidates remain strictly self-owned and attached to one parent;
- Interface/Resource promotion still requires a semantic observation whose
  primary `candidate_id` is that Interface/Resource candidate;
- unknown evidence, exact structured detection, source validation and final
  schema/relationship validation remain unchanged;
- remove role-specific supporting-evidence exceptions made obsolete by this
  simpler rule.

For promotion evidence, permit the same shared cited evidence for Repository,
Domain, System, Component, Function and Flow. Keep Interface/Resource boundary
promotion anchored by their existing candidate-owned semantic gate.

## Risks & Considerations

- Sharing evidence does not rewrite its original `candidate_id` or provenance.
- A source can support several concepts, but final proposal review still decides
  whether each interpretation is useful and justified.
- Embedded knowledge must not become a back door for unrelated candidates.
- This supersedes the brittle notion that every evidence use has one owner; it
  does not weaken real-file, schema, identity or relation gates.

## Open Questions

- Owner approval is required because this simplifies the general attribution
  contract rather than adding another role exception.

