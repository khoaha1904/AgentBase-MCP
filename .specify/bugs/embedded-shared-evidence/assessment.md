# Bug Assessment: Embedded knowledge cannot add shared supporting evidence

- **Slug**: embedded-shared-evidence
- **Created**: 2026-08-22
- **Source**: post-AB-SCHEMA-048 probe `2026-08-21T172146Z`
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

The first shared-evidence probe passed System, Function and Flow sharing but
stopped because the embedded configured-delivery candidate cited its own README
observation plus an EventBridge implementation observation primarily attributed
to the Flow. MCP rejected the additional shared evidence before Prepare.

## Symptom

Embedded knowledge often summarizes a supporting resource/configuration using
multiple real sources. Strict self-only evidence rejects a candidate even when
it has its own attributable anchor and merely adds another known source.

## Reproduction

1. Submit a Function parent, Flow and embedded delivery configuration.
2. Give the embedded candidate one own README observation.
3. Add the Flow's EventBridge observation as a second supporting source.
4. Observe schema guidance reject the embedded candidate for foreign evidence.

## Root Cause Hypothesis

Confidence: high. AB-SCHEMA-048 correctly makes observations attributable and
shareable for standalone concepts, but preserves the same exclusive-use
assumption for embedded knowledge. Multiple source roles remain useful even
when the knowledge receives no standalone identity.

## Proposed Remediation

Require every embedded candidate to cite at least one observation whose primary
`candidate_id` is itself, then allow it to cite additional known observations
from the same bounded request. Keep the explicit parent requirement, no-concept
disposition, unknown-ID rejection, technology detection from own structured
observations and final source validation unchanged.

## Risks & Considerations

- The own-evidence anchor prevents creating embedded knowledge entirely from
  unrelated borrowed observations.
- Shared sources retain their original attribution and exact provenance.
- This is simpler and more stable than duplicating observations or adding
  source-role exceptions.

## Open Questions

- Owner approval is required because AB-SCHEMA-048 currently says embedded
  candidates are self-owned.

