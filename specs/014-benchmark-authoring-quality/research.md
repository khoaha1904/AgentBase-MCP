# Research: Evidence-First Benchmark Readiness

## Decision: reviewability, not hidden completeness

**Rationale**: AgentBase produces human-reviewed cumulative knowledge. Missing
knowledge is acceptable; unsupported certainty is not. An 80% threshold over
gold recall/metadata/provenance incorrectly made omission equivalent to error.

**Alternatives considered**: Lowering the threshold or adding a fixture-specific
Business Flow hint was rejected because both preserve the wrong objective.

## Decision: curated expectations are non-exhaustive

**Rationale**: A valid Repository concept demonstrated that output absent from
gold is not necessarily false. Unmatched output needs human judgment, while
recognized contradictions can fail deterministically.

**Alternatives considered**: Treating every unmatched concept as a false
positive was rejected. Removing references entirely was rejected because they
still provide useful coverage and known-schema evidence.

## Decision: hard gates cover what automation can prove

**Rationale**: The repository can deterministically prove conformance, policy,
source authority, link/target integrity, schema relationship guidance and known
reference contradictions. It cannot prove that every cited line semantically
supports every prose sentence.

**Alternatives considered**: A model judge would add cost, variability and a
second source of hallucination. Claim-level human gold would be expensive and
still non-exhaustive. Human review remains explicit.

## Decision: v2 exposed a general cross-document validation gap

**Rationale**: The v2 MCP bundle is conformant and schema-correct for recognized
concepts, but one declared relationship lacks its required Markdown link.
Per-concept validation could not see the target set, so the authoring workflow
needs deterministic relationship-set validation rather than stronger fixture
wording.

**Alternatives considered**: Ignoring the missing link would weaken the accepted
contract. Letting MCP read an arbitrary output directory would broaden local
authority. A bounded caller-supplied content set keeps validation deterministic
and portable.

## Decision: use the existing second fixture

**Rationale**: Terraform/Python and SAM/Vue multi-service repositories provide a
bounded heterogeneity check without adding fixture maintenance.

**Alternatives considered**: One repository permits overfitting. Adding a third
ecosystem now is unnecessary before the readiness contract itself is proven.

## Decision: defer governed questions and external enrichment

**Rationale**: Structured unresolved questions, `/abs-questions`, human answers
and permissioned AWS CLI evidence are a valuable future workflow but introduce
new persistence, Hub lifecycle and credential/authority decisions.

**Alternatives considered**: Folding placeholder JSON into this benchmark slice
was rejected as premature and unsafe.
