# Feature Specification: Live Evidence Questions

**Feature Branch**: `main`

**Created**: 2026-08-16

**Status**: Approved

**Input**: Preserve conflicting evidence without choosing a truth, represent
change-prone repository values by live source references instead of durable
numeric snapshots, and let maintainers resolve governed questions by adding
their own provenance-bearing guidance.

## Owner Decisions

- Conflicting source claims may coexist. AgentBase reports their sources and
  limitations and never silently chooses one as canonical truth.
- A maintainer answer is additional user evidence and guidance. It does not
  erase, rewrite or prove the correctness of repository or documentation
  claims.
- Resolving a question ends the pending human decision. It does not delete the
  question history or the evidence conflict that caused it.
- Change-prone scalar values from configuration or implementation are retained
  as source references, not timeless literal facts in portable OKF. A durable
  business policy or explicit maintainer decision may retain its literal value
  as a separately sourced claim.
- A query resolves a source reference against the current explicitly admitted
  repository source and identifies the observed source revision. It reports an
  unavailable or stale reference rather than presenting an old value as current.
- Governed question state is separate from portable OKF concepts. A maintainer
  answer can produce a bounded Maintainer Guidance proposal, but normal Hub
  review and acceptance remain required before that guidance becomes accepted
  knowledge.
- No query, question answer or re-ingest deletes accepted claims merely because
  newer evidence is missing or disagrees.
- Capability 018's V11 remains qualification evidence for confirmed Domain and
  shared navigation. This capability replaces literal-value conflict scoring
  with evidence-reference and live-resolution behavior; it does not require a
  V12 run under the earlier numeric-snapshot contract.

## User Scenarios & Testing

### User Story 1 - Query current source-backed values (Priority: P1)

As a maintainer, I want a knowledge query to resolve volatile configuration and
implementation references from current source so that an old OKF snapshot does
not present a stale number as current behavior.

**Why this priority**: A precise but stale value is more misleading than an
explicitly unavailable value, especially for TTL, timeout, concurrency and
other frequently changed settings.

**Independent Test**: Accept knowledge that references a repository setting,
change that setting in the admitted source without re-ingesting OKF, and query
it again. The answer reports the new observed value and current source identity,
while the accepted OKF remains unchanged.

**Acceptance Scenarios**:

1. **Given** accepted knowledge referencing a resolvable configuration symbol,
   **When** a maintainer queries the setting, **Then** the answer reports its
   current observed value, source location and source revision without creating
   a durable numeric OKF claim.
2. **Given** the referenced source value changed after the last authoring run,
   **When** the same query is repeated before re-ingest, **Then** the answer
   reflects the current source and does not return the earlier value as current.
3. **Given** a reference whose repository, path or semantic target cannot be
   resolved, **When** it is queried, **Then** the answer reports the reference as
   unavailable or stale and does not substitute a cached literal.

---

### User Story 2 - Review and answer conflicting evidence (Priority: P1)

As a maintainer, I want incompatible source claims to remain visible as one
governed question so that I can state intended policy without destroying the
evidence of what documentation and implementation currently say.

**Why this priority**: Human guidance is useful only when readers can still see
what it responds to and distinguish intended policy from observed behavior.

**Independent Test**: Present documentation and implementation references that
resolve to incompatible values, list the resulting question, answer it with an
identified maintainer, and verify that the answer becomes proposed guidance
while both original claims remain visible.

**Acceptance Scenarios**:

1. **Given** two admitted sources that make incompatible claims about the same
   subject and property, **When** conflict review runs, **Then** exactly one
   pending question links those claims and no claim is selected as truth.
2. **Given** a pending question, **When** an identified maintainer answers it,
   **Then** the question records the answer as maintainer evidence, becomes
   resolved and retains every linked source claim.
3. **Given** a resolved question and accepted maintainer guidance, **When** a
   user queries the subject, **Then** the answer distinguishes documented
   claims, currently observed implementation and maintainer guidance.
4. **Given** an agent suggestion without an explicit maintainer answer, **When**
   question state is inspected, **Then** the question remains pending and no
   human guidance is invented.

---

### User Story 3 - Preserve history as evidence changes (Priority: P2)

As a maintainer, I want questions, source claims and guidance to survive
re-ingest and source change so that knowledge evolution remains reviewable
without freezing old runtime values.

**Why this priority**: Current answers need fresh source values, while review
and audit need the history of why a question was raised and how it was answered.

**Independent Test**: Resolve a question, change or remove one referenced
source, perform a later ingest with incomplete evidence, and verify that the
question history and guidance remain while current resolution reports the
source's new state honestly.

**Acceptance Scenarios**:

1. **Given** a resolved question, **When** a later ingest omits one earlier
   source, **Then** the earlier claim, question and maintainer guidance are not
   implicitly deleted.
2. **Given** a source reference whose semantic target moved, **When** later
   authoring provides evidence for the replacement target, **Then** the proposed
   reference change is reviewable and does not rewrite accepted history before
   acceptance.
3. **Given** current source that now disagrees with accepted maintainer
   guidance, **When** queried, **Then** both are reported as a current mismatch;
   the query does not silently change question state or guidance.

### Edge Cases

- Multiple sources resolve to the same value; no conflict question is required,
  but every independently useful source may remain visible.
- A value is computed dynamically and cannot be determined from bounded source
  evidence; the reference remains unresolved rather than receiving a guessed
  value.
- A source checkout is dirty or cannot be bound to an unambiguous revision; the
  answer exposes that limitation and does not promote the observation to
  accepted knowledge.
- Two maintainers provide incompatible guidance; both guidance records remain
  sourced and the disagreement remains unresolved rather than being ordered by
  arrival time.
- A source reference resolves but its value has a different type or unit than
  earlier evidence; the answer reports the incompatible representation instead
  of coercing it silently.
- A question is answered while an accepted Hub proposal changes concurrently;
  stale review state must fail without losing the pending question or answer.

## Requirements

### Functional Requirements

- **AB-CLAIM-001**: AgentBase MUST preserve distinct provenance-bearing claims
  about the same subject and property when their values or meanings conflict.
  It MUST NOT silently merge them or select one as canonical truth.
- **AB-CLAIM-002**: Newly authored knowledge MUST represent a change-prone
  configuration or implementation scalar with a bounded source reference that
  identifies the admitted repository, source location, semantic target and
  observed source identity. It MUST NOT store that observed scalar as an
  unqualified timeless OKF fact.
- **AB-CLAIM-003**: A durable business policy or explicit maintainer decision
  MAY retain a literal value only as a separately identified claim with its own
  provenance and authority. It MUST remain distinguishable from currently
  observed implementation.
- **AB-QUESTION-001**: AgentBase MUST create or reuse one governed pending
  question for an equivalent unresolved conflict and link every relevant claim
  and source reference without creating an Open Question OKF concept.
- **AB-QUESTION-002**: A maintainer MUST be able to list pending questions and
  inspect each question's subject, conflicting claim roles, evidence sources,
  missing evidence and resolution history.
- **AB-QUESTION-003**: Only an explicit answer attributed to a non-empty
  maintainer identity MAY resolve a question. Resolution MUST retain the
  original claims and record the answer, attribution and time as maintainer
  evidence.
- **AB-QUESTION-004**: Answering a question MUST create a bounded Maintainer
  Guidance proposal through the existing review lifecycle. It MUST NOT directly
  mutate accepted Hub knowledge or treat the answer as proof that source code
  already matches the guidance.
- **AB-QUESTION-005**: Question identity, pending/resolved state, linked claims
  and resolution history MUST survive ordinary process restarts and later
  incomplete ingests. Missing evidence MUST NOT implicitly clear a question.
- **AB-QUERY-006**: An explicit combined knowledge query MUST resolve applicable
  source references against the current authorized repository source and return
  the observed value, source location, source identity and resolution status in
  bounded output.
- **AB-QUERY-007**: When source claims or maintainer guidance disagree, a query
  MUST present each role separately and state that the conflict remains. It MUST
  NOT emit an unlabeled single-value answer or an automatic winner.
- **AB-QUERY-008**: If a current source reference cannot be resolved safely, the
  query MUST report it as stale, unavailable or indeterminate and MUST NOT use a
  previously observed scalar as though it were current.
- **AB-REFRESH-013**: Re-ingest MAY propose updated source references when
  current evidence supports a moved or changed semantic target, but it MUST
  preserve accepted claims, question history and maintainer guidance until a
  governed proposal explicitly changes them.
- **AB-BENCH-042**: Qualification MUST evaluate evidence-reference coverage,
  current-value resolution, conflict presentation, maintainer-guidance
  separation and unavailable-source behavior without requiring volatile
  numeric literals to be persisted in authored OKF.

### Key Entities

- **Claim**: One sourced statement about a subject and property, classified by
  role such as documented policy, observed implementation or maintainer
  guidance; it is evidence, not universal truth.
- **Source Reference**: A bounded pointer to an admitted repository location and
  semantic target with the source identity observed when it was authored. Its
  current value is resolved when needed rather than persisted as a timeless
  scalar.
- **Governed Question**: Durable review state linking incompatible or incomplete
  claims, evidence still needed and pending/resolved history. It is workflow
  state, not a portable OKF concept.
- **Maintainer Guidance**: An explicitly attributed human answer that expresses
  intended policy or interpretation and enters accepted knowledge only through
  normal proposal review.
- **Live Observation**: A bounded query-time result from current authorized
  source, labeled with source identity and never silently promoted to accepted
  knowledge.

## Success Criteria

### Measurable Outcomes

- **SC-001**: In every qualification case where a referenced source scalar
  changes without re-ingest, the next explicit query reports the new current
  value and does not report the earlier value as current.
- **SC-002**: Every tested conflict response includes all relevant source claim
  roles and maintainer guidance, with zero automatic truth selections.
- **SC-003**: Every tested missing, moved or indeterminate source reference
  returns a visible unavailable/stale result and zero stale scalar fallbacks.
- **SC-004**: Answering a question creates exactly one attributed guidance
  proposal, marks exactly one equivalent question resolved and preserves 100%
  of its linked source claims and history.
- **SC-005**: Later incomplete ingest and ordinary restart preserve all tested
  pending/resolved questions and accepted guidance without implicit deletion.
- **SC-006**: Qualification demonstrates that volatile configuration values are
  absent as unqualified durable OKF facts while durable sourced policy and
  maintainer guidance remain queryable.
- **SC-007**: Canonical offline verification covers conflict, resolution,
  freshness, unavailable-source and recovery scenarios without a background
  watcher, automatic network access or model call.

## Non-Goals

- Determining one universal truth, confidence score or source-priority order.
- Automatically changing source code to match maintainer guidance.
- Watching repositories or refreshing values in the background.
- Storing every source symbol, configuration field or query result in Hub.
- Treating a human answer as evidence of deployed runtime state.
- Adding external cloud inspection, credentials or deployment discovery.
- Rebuilding or replacing Hub PR #7 before this capability's qualification and
  publication behavior are separately approved.

## Assumptions

- Queries can resolve live values only when the relevant repository is locally
  available, explicitly authorized and bound to a safe source identity.
- Semantic source targets may be functions, variables, configuration fields or
  another bounded location; exact locator syntax is a planning decision.
- Question storage and source-reference resolution reuse existing local-first
  lifecycle, authorization and recovery guarantees; they add no daemon or
  automatic retry.
- Maintainer identity is supplied through an explicit local action. Agent
  identity or generated prose cannot stand in for human attribution.
- Stable policy values remain useful durable claims; the volatile-reference
  rule applies to observed configuration and implementation values whose
  current value is expected to change with source.
