# Feature Specification: Evidence-First Benchmark Readiness

**Feature Branch**: `main`

**Created**: 2026-08-15

**Status**: Completed 2026-08-15

**Input**: Decide whether AgentBase MCP produces an honest, evidence-backed OKF
draft that is useful for human review. An initial draft may be incomplete. The
benchmark must not force hidden-answer completeness, encourage guessing or tune
authoring instructions to one repository.

## Owner Decisions

- A conformant, evidence-backed but incomplete OKF draft can be good enough for
  review. It is not required to know every concept, field or relationship.
- Missing reference concepts, metadata, evidence paths or relationships remain
  visible coverage diagnostics; they do not independently fail reviewability.
- Facts already authored must pass structural/schema policy, use valid bounded
  provenance and avoid known contradictions. Unsupported certainty is worse
  than an explicit limitation or omission.
- Curated fixture expectations are non-exhaustive reference evidence, not a
  hidden answer sheet. Unmatched output is `unjudged`, not automatically false.
- Prompts remain general and gold expectations remain hidden. No fixture-specific
  hint will be added merely to improve a benchmark score.
- Initial generalization uses both existing structurally different fixtures:
  Terraform/Python `aws-health-aware` and SAM/Vue multi-service
  `aws-serverless-shopping-cart`. This is bounded evidence, not a universal claim.
- Quality and efficiency remain separate. A reviewable draft can still be too
  expensive; no context-saving claim is allowed without supporting measurements.
- The retained v2 Health Aware artifact proves a general workflow gap: per-file
  validation did not catch a declared relationship missing its Markdown link.
  The correction must be bounded, content-only relationship-set validation; it
  must not read arbitrary caller-selected paths or encode fixture identities.
- Changed authoring behavior uses immutable v3 prompts. Both repositories must
  be measured with the same v3 contract before capability completion.
- Structured unresolved questions, future `/abs-questions` review, external
  evidence requests and explicitly authorized AWS CLI enrichment are recorded as
  future product direction only. They are not implemented in capability 014.

## User Scenarios & Testing

### User Story 1 - Produce an honest reviewable draft (Priority: P1)

As the benchmark owner, I want the MCP arm judged on whether its authored facts
are safe and reviewable, so that an incomplete draft is not pressured to invent
knowledge.

**Why this priority**: The product is a human-reviewed, cumulative knowledge
workflow rather than an automatic claim of complete truth.

**Independent Test**: Score conformant fixtures that omit reference concepts or
metadata and verify they remain reviewable, while malformed, ungrounded or
known-contradictory authored facts fail.

**Acceptance Scenarios**:

1. **Given** a conformant draft whose authored concepts and relationships pass
   policy and provenance checks, **When** it omits a reference concept, **Then**
   assessment is reviewable and the omission appears only in coverage.
2. **Given** a draft with invalid OKF, unsafe provenance, a broken relationship
   or a known schema contradiction, **When** it is assessed, **Then** it is
   invalid and every hard failure is named.
3. **Given** evidence cannot support a detail, **When** the agent omits it or
   records a limitation, **Then** the benchmark does not reward guessing.

---

### User Story 2 - Separate truth, uncertainty and completeness (Priority: P2)

As the benchmark owner, I want reference matches, contradictions, unjudged
output and missing coverage reported separately so that one percentage cannot
hide what the agent actually did.

**Why this priority**: Gold precision/recall currently treats valid extra output
as false and missing optional knowledge as a product failure.

**Independent Test**: Score deterministic bundles containing confirmed,
contradicted, unjudged and omitted concepts/relationships and verify each lands
in exactly one visible category.

**Acceptance Scenarios**:

1. **Given** an authored concept not present in the non-exhaustive reference,
   **When** no contradiction is known, **Then** it is unjudged and does not lower
   reviewability.
2. **Given** a matched concept uses the wrong concrete schema, **When** reference
   evidence establishes the correct schema, **Then** it is a known contradiction
   and invalidates the draft.
3. **Given** reference knowledge was not authored, **When** coverage is reported,
   **Then** recall, metadata, provenance and relationship gaps remain diagnostic
   and never masquerade as hallucination.

---

### User Story 3 - Check general behavior across unlike repositories (Priority: P3)

As the benchmark owner, I want the same immutable prompt and scorer applied to
structurally different repositories so that improvement cannot be explained by
fixture-specific wording.

**Why this priority**: No two real repositories expose identical concepts,
frameworks, deployment models or available evidence.

**Independent Test**: Run offline fixtures and one explicit current-model MCP
benchmark on each existing repository without changing the prompt between them.

**Acceptance Scenarios**:

1. **Given** both fixture types, **When** authoring prompts render, **Then** no
   repository-specific key, path, framework answer or expected relationship is
   present.
2. **Given** the same general MCP workflow, **When** both repositories are
   assessed, **Then** each produces a reviewable draft or exposes a general hard
   failure that can be fixed without teaching the prompt that fixture's answer.
3. **Given** reviewable quality, **When** efficiency is compared with direct,
   **Then** token/time results are reported separately and may honestly conclude
   that MCP is not yet efficient enough.

### Edge Cases

- A draft contains no concepts but is conformant: it is structurally valid but
  not useful. Reviewability reports an explicit empty-draft hard failure.
- A concept has normalized sources but their semantic relevance cannot be proven
  deterministically: it remains reviewable with a benchmark limitation and
  requires human review; the scorer does not claim semantic certainty.
- An unmatched concept is valid but redundant: it is unjudged review burden,
  not a false positive.
- A relationship exists in frontmatter without a resolving Markdown link or
  target concept: it is a hard failure.
- One arm is invalid: its efficiency remains recorded, but no quality-equivalent
  efficiency conclusion is made.

## Requirements

### Functional Requirements

- **AB-BENCH-018**: Both arms MUST receive one equivalent general authoring
  contract for sparse identity, concrete schema choice, metadata, normalized
  provenance, linked relationships, limitations and final consistency review.
- **AB-BENCH-019**: The authoring contract MUST define strict root-index grammar
  and every scored draft MUST pass OKF conformance to be reviewable.
- **AB-BENCH-020**: The agent MUST author only evidence-supported concepts at a
  stable resource or business-behavior granularity, omit speculative/duplicate
  concepts and leave unavailable knowledge incomplete rather than invent it.
- **AB-BENCH-021**: Every authored relationship MUST target an authored concept,
  resolve through Markdown, follow the selected schema's relationship guidance
  and retain supporting concept provenance.
- **AB-BENCH-022**: Prompts and agent-visible inputs MUST NOT expose fixture
  expectations, expected keys, types, evidence paths or relationships.
- **AB-BENCH-023**: Finalization MUST declare a per-arm authoring assessment as
  `reviewable` or `invalid`. Hard failures are lifecycle failure, empty output,
  OKF/policy/schema validation failure, unsafe provenance, broken/unsupported
  authored relationships and curated known contradictions. Missing reference
  coverage alone MUST NOT make a draft invalid.
- **AB-BENCH-024**: Changed prompt behavior MUST use a new immutable prompt
  identity; no fixture-specific prompt change is allowed solely to raise scores.
- **AB-BENCH-025**: The same prompt/scoring contract MUST be proven offline and
  exercised on at least two structurally different pinned repositories before
  declaring MCP authoring quality good enough for broader review.
- **AB-BENCH-026**: Fixture expectations MUST be treated as non-exhaustive.
  Scoring MUST distinguish confirmed matches, known contradictions, unjudged
  authored output and missing reference coverage.
- **AB-BENCH-027**: Concept recall, expected metadata/provenance/relationship
  coverage and unjudged counts MUST remain visible diagnostics but MUST NOT be
  combined into an automatic completeness threshold or overall winner.
- **AB-BENCH-028**: Efficiency MUST remain separate from reviewability. Token or
  elapsed comparisons are actionable only between arms whose quality status is
  stated, and a slower/larger MCP result MUST be reported without reinterpretation.
- **AB-BENCH-029**: Reports MUST state that deterministic validation and curated
  references cannot prove the semantic relevance of every source-backed claim;
  accepted OKF still requires human review.
- **AB-BENCH-030**: The MCP authoring workflow MUST expose bounded content-only
  relationship-set validation that checks unique caller-supplied identities,
  declared targets, resolving Markdown links and known-schema guidance without
  reading an arbitrary output path.
- **AB-BENCH-031**: A v3 MCP benchmark arm MUST call relationship-set validation
  after authoring and repair every reported failure. Missing or failed use MUST
  fail the arm visibly. The direct arm retains the equivalent authoring contract
  without receiving AgentBase MCP tools.

### Key Entities

- **Authoring assessment**: `reviewable` or `invalid`, with explicit hard
  failures and benchmark limitations.
- **Reference classification**: confirmed, contradicted, unjudged or missing
  coverage for concepts and relationships.
- **Coverage diagnostics**: recall, expected metadata/provenance/relationship
  coverage and review burden; never a completeness gate.
- **Prompt identity**: immutable agent-visible authoring behavior shared across
  unlike repositories without fixture answers.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every invalid lifecycle, conformance, policy, provenance,
  relationship and known-schema fixture produces `invalid` with the exact hard
  failure; no invalid fixture is `reviewable`.
- **SC-002**: A conformant evidence-backed fixture remains `reviewable` when any
  or all non-safety coverage diagnostics are below 80%, including zero missing-
  reference recall.
- **SC-003**: Unmatched authored concepts/relationships are reported 100% as
  unjudged unless a curated contradiction applies; they are never automatically
  counted as false positives.
- **SC-004**: The retained v2 MCP artifact for `aws-health-aware` remains invalid
  for its exact missing relationship link; low coverage is not reported as the
  failure.
- **SC-005**: The same general v3 prompt and relationship validator produce
  reviewable current-model MCP drafts on both `aws-health-aware` and
  `aws-serverless-shopping-cart`, or expose another general hard failure without
  adding either fixture's answer.
- **SC-006**: Reports preserve exact token/time evidence and make no context-
  saving claim while MCP remains more expensive on measured reviewable runs.

## Assumptions

- Deterministic checks can establish structure, policy, bounded provenance,
  link integrity and known reference contradictions, but not exhaustive semantic
  truth. Human review remains authoritative.
- The two existing fixtures provide an initial heterogeneity check only. More
  ecosystems can be added later without changing the readiness definition.
- v2 prompts expressed the desired evidence-first behavior but per-concept
  validation missed a cross-document relationship error. This measured general
  gap justifies immutable v3 prompts and relationship-set validation.

## Explicit Non-Goals

- Requiring complete discovery of hidden gold concepts or a universal ontology.
- Adding a fixture-specific Business Flow hint or any repository answer to a
  prompt.
- Implementing question persistence, `/abs-questions`, answer review, AWS CLI,
  cloud credentials, external evidence collection or cross-repository enrichment.
- Automatically accepting a reviewable draft into AgentBase-Hub.
- Claiming that two repositories prove universal generalization.
- Optimizing MCP tool payloads or token use before reviewability is established.
