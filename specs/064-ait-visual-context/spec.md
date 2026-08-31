# Feature Specification: AIT useful visual context

**Feature Branch**: `064-ait-visual-context`

**Created**: 2026-08-30

**Status**: Complete

**Input**: Prioritize only diagrams that materially help the two AIT phases,
assess AgentBase data readiness for each, and normalize mock AWS CLI
qualification so `hub-3` accepts its output as ordinary fixture truth.

## Contract Delta

- **Change classification**: architecture boundary and qualification workflow.
- **Product Contract**: `docs/product/07-ai-sdlc-context.md` adds a deliberately
  small visual-context portfolio tied to decisions in each AIT phase.
- **Architecture Contract**: `docs/architecture/flows.md` separates Published
  Phase 1 visual context from revision-bound, session-local Phase 2 source
  projections. Existing enrichment review/publication transitions are reused.
- **Capability Contract**:
  `docs/capabilities/14-ai-sdlc-context/07-useful-visual-context.md` owns diagram
  priorities and readiness; `docs/capabilities/09-ingest-and-refresh/07-domain-enrichment.md`
  owns development fixture publication through the ordinary enrichment lifecycle.
- **Stable requirements**: `AB-CONTEXT-VIS-001..008`, `AB-ENRICH-015..018` and
  the clarified `AB-QUESTION-003` renderer/state consistency rule.
- **Current-contract updates**: the Product, Architecture and Capability paths
  above must be current before runtime implementation or fixture publication.
- **Baseline commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Owner Decisions

- Diagram count is not a success metric. A diagram is admitted only when it
  helps a named decision in one of the two AIT phases.
- Phase 1 has one P0 Discovery Impact Map. Phase 2 has one P0 Implementation
  Impact Map. An Existing Flow view is P1 and conditional in either phase.
- Dependency views are lenses of the impact maps, not a separate AIT product.
  AgentBase does not own a Task dependency DAG.
- The fake exists only at the AWS CLI process boundary. The real AWS adapter,
  reconciliation, Question governance, proposal, Accept and Publish paths see
  ordinary provider output and do not carry a mock marker.
- This qualification may advance fixture truth only in the workspace's
  disposable development Hub `khoaha1904/hub-3`. It must never target
  `khoaha1904/AgentBase-Hub` or create a general product hierarchy of Hubs.
- Provider evidence may automatically resolve a factual provider-identity or
  relation Question. It cannot answer a maintainer ownership/intent Question;
  that Question remains open unless the owner supplies guidance.
- The owner has authorized the bounded `hub-3` fixture run through ordinary
  Accept, pull-request publication, merge and synchronization.

## User Scenarios & Testing

### User Story 1 - Useful Feature Discovery visual (Priority: P1)

As a BA, PO or DM, I can inspect one focused current-system impact map and see
the systems, components, interfaces, resources, repositories, evidenced
relations and important Questions relevant to the Feature.

**Why this priority**: It supports the first AIT decision: understanding scope
and discovering missing knowledge before a User Story is committed.

**Independent Test**: Use one fixed Feature and pinned Published Hub revision;
the map is useful only if a reviewer can identify affected areas, relations and
unknowns without opening source code.

**Acceptance Scenarios**:

1. **Given** a Feature and sufficient Published Crawler knowledge, **When** the
   Discovery Impact Map is prepared, **Then** it contains only relevant current
   concepts and shows provider/ownership Questions without inventing answers.
2. **Given** a Feature that changes an accepted runtime journey, **When** a Flow
   view materially clarifies the change, **Then** the optional P1 view may be
   added; otherwise no Flow diagram is produced.

---

### User Story 2 - Bound the developer planning visual (Priority: P1)

As the AgentBase maintainer, I can see exactly what a useful developer planning
visual must contain, which current Code Graph data supports it and which missing
projection prevents a truthful diagram today.

**Why this priority**: It supports the second AIT decision: splitting a User
Story into source-grounded implementation and verification work.

**Independent Test**: For the fixed ECS health scenario, the readiness assessment
maps backend-route, ECS/ALB wiring, compatibility and test boundaries to current
Code Graph tools, and names the missing Code Graph-to-diagram packet without
claiming the map is already implemented.

**Acceptance Scenarios**:

1. **Given** authorized local source and current Code Graph tools, **When** Phase
   2 readiness is assessed, **Then** every required file/symbol/dependency/test
   input is mapped to an existing tool or an explicit missing projection.
2. **Given** no Code Graph diagram packet exists, **When** readiness is reported,
   **Then** Phase 2 is classified as data available but diagram path not ready,
   with no substitution from Hub relations or invented source paths.

---

### User Story 3 - Publish realistic provider fixture truth (Priority: P1)

As the AgentBase maintainer, I can run a bounded fake AWS CLI process against
the existing Crawler Published data and advance the resulting ordinary
enrichment proposal into `hub-3` so AIT qualification uses richer accepted
fixture knowledge.

**Why this priority**: It closes an actual Phase 1 data gap without teaching
AgentBase a second mock-specific truth model.

**Independent Test**: The real AWS adapter verifies the deterministic queue,
the factual queue Question resolves, the maintainer ownership Question stays
open, and the accepted result is merged and synchronized in `hub-3` with no
mock marker in OKF.

**Acceptance Scenarios**:

1. **Given** `hub-3` at the admitted Published revision and a deterministic AWS
   CLI fixture, **When** Enrichment runs, **Then** AgentBase records a normal
   provider observation and verified SQS ARN through the existing adapter.
2. **Given** the verified factual Question and an unrelated maintainer-decision
   Question, **When** Finalize runs, **Then** only the factual Question resolves.
3. **Given** a reviewed valid proposal, **When** the authorized qualification
   advances it, **Then** it uses the normal Accept, PR, merge and synchronize
   transitions and never mutates the real owner Hub.

### Edge Cases

- Sparse Published knowledge produces a smaller map plus explicit omissions,
  not filler nodes or an unsupported complete-system claim.
- A Feature focus is session input/title metadata; it is not persisted as an
  AgentBase-owned Feature concept.
- A single verified ARN matching multiple concepts remains a duplicate-identity
  review issue rather than being merged automatically.
- Failed, partial or stale provider runs do not Accept or Publish anything and
  retain the last admitted Published revision.
- A mock response may be deterministic, but it is still recorded as a
  time-bound provider observation, not timeless current truth.

## Requirements

### Functional Requirements

- **FR-001**: Phase 1 MUST admit only the P0 Discovery Impact Map and the
  conditional P1 Existing Flow view defined by `AB-CONTEXT-VIS-001..004`.
- **FR-002**: Phase 2 MUST admit only the P0 Implementation Impact Map and the
  conditional P1 trace/flow lens defined by `AB-CONTEXT-VIS-005..008`.
- **FR-003**: Each admitted diagram MUST state its AIT decision, exact data
  authority, omissions and evidence revision; visual completeness alone MUST
  NOT make it pass.
- **FR-004**: Phase 1 MUST use Published Hub only. Phase 2 exact implementation
  nodes and edges MUST use authorized local Code Graph/source evidence.
- **FR-005**: Existing Published Architecture, Dependency and Sequence packets
  MAY be reused only as views that satisfy an admitted AIT decision.
- **FR-006**: The development AWS fixture MUST replace only the bounded process
  runner beneath the real `AwsCliAdapter`; no mock flag, provider fork or mock
  metadata may enter Hub knowledge.
- **FR-007**: The fixture workflow MUST use the exact ordinary Enrichment
  manifest, reconciliation, Question, proposal, Accept and Publish lifecycle.
- **FR-008**: Fixture publication MUST fail closed unless the active remote Hub
  is exactly `khoaha1904/hub-3` on `main` and its Published base is current.
- **FR-009**: Only evidence-resolvable factual provider Questions may transition
  automatically. Maintainer-decision Questions MUST remain open without exact
  owner guidance.
- **FR-010**: No application runtime, public MCP tool, durable context store,
  OKF schema, dependency or general Hub role is added by this qualification.

### Key Entities

- **AIT diagram decision**: phase, priority, user decision, admitted view,
  authority, evidence revision, omissions and pass/fail value criteria.
- **Development provider fixture**: deterministic process responses for one
  explicitly named AWS account/region/resource set; it is not an OKF entity.
- **Enrichment proposal**: the ordinary governed change produced from provider
  evidence and reviewed through existing Hub transitions.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The accepted portfolio contains exactly two P0 diagrams, one per
  AIT phase, plus at most one conditional P1 Flow view per phase.
- **SC-002**: Every admitted diagram has a named phase decision and a reviewer
  can trace every material node/edge to its pinned authority.
- **SC-003**: The data-readiness assessment classifies every admitted diagram as
  ready, partially ready or not ready and names the minimum missing input/path.
- **SC-004**: The `hub-3` fixture run resolves the queue provider-identity
  Question, keeps the operational-ownership Question open and publishes no
  mock marker or unsupported owner assertion.
- **SC-005**: Focused tests cover target guard, real-adapter reuse, Question
  selectivity and failure-before-Accept; the canonical repository gate passes.

## Assumptions

- The existing Crawler Publisher/Queue/Worker/storage knowledge is sufficient
  for a useful Phase 1 impact map even before every unknown is resolved.
- The deterministic fixture identity is account `123456789012`, region
  `ap-southeast-1`, queue `crawler-jobs`; these values are fixture truth only in
  the disposable development Hub.
- The current Code Graph toolset can retrieve Phase 2 evidence, but a truthful
  Code Graph-to-diagram packet is not implemented and remains a separate slice.
- External GitHub merge remains a distinct publication transition even when the
  development fixture run is authorized end to end.

## Implementation Evidence

- The guarded qualification script used four exact bounded calls through the
  real adapter: version, STS identity, SQS URL and SQS attributes. It issued no
  list/scan call and supplied no maintainer answer.
- The reviewed proposal modified only `resources/crawler-jobs.md` and the
  factual queue Question. It added the verified ARN and time-bound observed
  values, resolved that Question and left operational ownership open.
- Review exposed a stale resolved-Question body and missing-evidence list. The
  renderer now derives readable body text from Question state and clears current
  missing evidence on resolution; the self-contained Hub validator was rebuilt.
- Hub CI repair [PR #5](https://github.com/khoaha1904/hub-3/pull/5) passed and
  merged before Enrichment [PR #4](https://github.com/khoaha1904/hub-3/pull/4)
  was replayed, passed and merged.
- Synchronization admitted Published commit
  `521f5bfffccb7918076f5b287bbfd78d052ed0fc`, recognized proposal
  `81672883934732e8e1bf4720`, and left zero Local Drafts/open PRs. Published
  knowledge contains no `mock`/`synthetic` marker.
- Focused tests pass 5/5, the complete repository suite passes 149/149 and
  `npm run verify` passes.
