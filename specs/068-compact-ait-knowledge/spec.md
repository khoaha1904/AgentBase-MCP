# Feature Specification: Compact AIT knowledge

**Feature Branch**: `feature/refresh-change-accounting`

**Created**: 2026-08-31

**Status**: Active

**Input**: Consolidate over-fragmented Hub knowledge around independently useful
runtime, ownership and contract boundaries; make navigation derived where
possible; and stop benchmark fixtures from prescribing exact concept paths.

## Contract Delta

- **Change classification**: pre-release knowledge-boundary, navigation and
  benchmark-evaluation change.
- **Product Contract**:
  `docs/product/01-repository-understanding.md`,
  `docs/product/02-knowledge-model-and-relations.md` and
  `docs/product/06-visualization.md` and `docs/product/07-ai-sdlc-context.md`.
- **Architecture Contract**: `docs/architecture/flows.md` reviewed; authority
  and Phase 1/Phase 2 direction remain unchanged.
- **Capability Contract**:
  `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`,
  `docs/capabilities/10-query-routing/06-hub-search-and-ranking.md` and
  `docs/capabilities/12-version-scope/03-benchmark-requirements.md`,
  `docs/capabilities/13-visualization/04-runtime-requirements.md` and
  `docs/capabilities/14-ai-sdlc-context/07-useful-visual-context.md`.
- **Stable requirements**: `AB-SCHEMA-057..060`, `AB-BENCH-091..095`,
  `AB-VIS-015..023` and `AB-CONTEXT-VIS-009`.
- **Baseline commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.
- **Supersedes**: capability 066's exact DLQ/alarm output expectations and
  capability 067's conclusion that those two candidates must be standalone.

## Owner Decisions

- Consolidation follows runtime, deployment, ownership, contract and failure
  boundaries; it is not Lambda-specific and is not a fixed concept-count rule.
- A one-runtime repository normally has one Repository and one Function or
  Component. Internal infrastructure remains embedded in that runtime page.
- Independently deployed frontend and backend runtimes remain separate
  Components. Their Interface or Flow is separate only when it has independent
  consumer, compatibility, lifecycle or ordered-behavior value.
- A cross-repository shared transport may remain a Resource. Internal tables,
  buckets, queues, DLQs and alarms do not become standalone merely because they
  are concrete provider resources or diagram candidates.
- Keep the current provider-neutral taxonomy and role-oriented path namespaces
  in this slice. Reduce concept instances and maintained indexes rather than
  performing a cosmetic path migration.
- Root navigation is Hub authority. Architecture category indexes are optional
  derived presentation; workflow-owned Question navigation remains allowed.
- Benchmark fixtures state source-grounded semantic obligations and forbidden
  claims, not expected concept paths, slugs, counts or topology.
- Deterministic validation owns integrity. Semantic assessment must not label a
  result `useful_for_ait`; that label requires the separate downstream AIT
  comparison.
- Do not redesign the observed-value/external-identity envelope in this slice.
  Compact promotion removes most metadata-only documents; further normalization
  requires evidence from the rebuilt Hub.
- Knowledge compaction and visual density are separate decisions. Concrete,
  exactly sourced embedded resources may become presentation-only references
  without acquiring a concept or Markdown file.
- Embedded visual references remain parent-scoped unless the same exact strong
  external identity is Published; equal names never merge.
- Domain-site evidence is summarized by repository file by default while exact
  citations remain available on demand.
- The Domain is page context, not a duplicate graph node. Each Repository is a
  compact selectable card inside a fixed grouping region; singly owned nodes
  stay inside while visibly labeled shared, multi-repository and external nodes
  stay outside.
- Normal nodes may be repositioned only within their ownership zone. Repository
  cards and regions remain fixed, regions never grow, and reset or reload
  restores the deterministic generated layout.
- Structural containment links are hidden by default. Runtime arrows require an
  accepted relation, Flow step or an evidence-backed `Embedded Relations` row;
  containment alone never implies direction.
- Embedded relation endpoints are `self`, an exact admitted concept identity or
  one unique same-parent embedded name. Presentation-only `monitors` and
  `redrives-to` are allowed alongside canonical runtime predicates.

## User Scenarios & Testing

### User Story 1 - Maintain one useful runtime page (Priority: P1)

As a Hub maintainer, I review one runtime page containing its internal storage,
messaging and failure behavior instead of maintaining one thin file per cloud
resource.

**Independent Test**: Initial Ingest renders a single Function plus Repository
for a one-Lambda candidate set and retains S3, DynamoDB, DLQ and alarm evidence
as readable embedded rows with no standalone identities.

### User Story 2 - Preserve real full-stack boundaries (Priority: P1)

As an AIT consumer, I can distinguish independently deployed frontend and
backend runtimes without receiving files for their internal implementation
details.

**Independent Test**: A full-stack candidate set keeps two Component concepts;
an API becomes Interface only when independent consumer/compatibility evidence
is present.

### User Story 3 - Evaluate meaning rather than layout (Priority: P1)

As a product developer, I can change the compact representation without
rewriting every benchmark fixture as long as the resulting knowledge remains
truthful and useful.

**Independent Test**: The retry/DLQ suite passes when all obligations are
evidenced in the worker page and contains no expected Resource identity or
relationship path.

### User Story 4 - Review compact knowledge as a useful map (Priority: P1)

As an AIT reviewer, I can see concrete storage and failure dependencies from a
compact runtime page without opening many files or reading a wall of citations.

**Independent Test**: A Published runtime with evidence-backed embedded S3,
DynamoDB, DLQ and alarm rows produces visibly embedded resource references and
parent links, while a generic mapping row stays unexpanded. Two exact matching
ARNs coalesce; equal names without identity remain separate. The detail drawer
groups citations by file and exposes the exact values on demand.

### User Story 5 - Read a stable ownership and runtime map (Priority: P1)

As an AIT reviewer, I see repository ownership as a stable region and only
evidence-backed runtime arrows, without redundant Domain/Repository circles or
direction inferred from containment.

**Independent Test**: The Domain is absent from graph elements, a Repository is
a compact card inside a fixed region containing its singly owned nodes, shared
nodes are labeled and remain outside, normal nodes snap back into their valid
ownership zone after dragging, reset restores deterministic positions,
structural edges are hidden, and valid embedded writes, monitoring and redrive
rows render directed arrows.

## Requirements

- **FR-001**: Authoring guidance MUST keep evidence within one runtime/ownership
  parent unless an independently useful boundary is evidenced.
- **FR-002**: Consolidation MUST preserve independently deployed frontend,
  backend, worker and cross-repository shared-resource boundaries.
- **FR-003**: Embedded knowledge MUST remain searchable, human-readable and
  exactly sourced without requiring a standalone identity or graph edge.
- **FR-004**: New Initial Ingest output MUST require only root architecture
  navigation; category navigation MUST be optional or derived.
- **FR-005**: Component and Function schemas MUST admit source-evidenced
  publish/read/write relations to independently promoted Interface/Resource
  targets.
- **FR-006**: Refresh semantic probes MUST match source-grounded obligations in
  any changed concept and MUST NOT require exact concept identities or paths.
- **FR-007**: Deterministic Refresh assessment MUST distinguish contract
  validity and knowledge recall from downstream AIT usefulness.
- **FR-008**: Evaluation configuration MUST carry an explicit versioned profile;
  a profile change must be visible rather than silently changing old results.
- **FR-009**: File count, concept count, word count, YAML/body ratio, elapsed
  time and tokens MUST remain diagnostics rather than quality pass thresholds.
- **FR-010**: The slice MUST add no dependency, public MCP tool, provider call,
  Accept, Publish or automatic Hub reset.
- **FR-011**: Published visualization MUST distinguish concept nodes from
  evidence-backed embedded resource references without creating concept files
  or canonical runtime relations.
- **FR-012**: Embedded references MUST be parent-scoped unless an exact strong
  external identity matches; display names MUST NOT merge references.
- **FR-013**: Generic or unresolved embedded rows MUST NOT enter topology, and
  derived references/links MUST count toward deterministic projection bounds.
- **FR-014**: The static site MUST summarize evidence by repository file and
  retain every exact citation behind an explicit disclosure.
- **FR-015**: The static site MUST render the Domain as page context and each
  Repository as a compact selectable card inside a fixed grouping region
  without changing projection identity or membership.
- **FR-016**: Normal nodes MUST be draggable only within their ownership zone;
  Repository cards and regions MUST remain fixed, reset MUST restore generated
  positions, and pan, zoom, selection, filters and focus MUST continue to work.
- **FR-017**: Structural containment links MUST be hidden by default and MUST NOT
  be converted into runtime arrows.
- **FR-018**: Evidence-backed embedded runtime relations MUST resolve only
  bounded endpoints and predicates, omit invalid rows visibly, and count toward
  deterministic projection limits.

## Success Criteria

- **SC-001**: Focused tests cover one Lambda, independent frontend/backend and a
  cross-repository shared queue without provider-resource over-promotion.
- **SC-002**: New skeleton generation writes no architecture category index and
  retains exact root entrypoint navigation.
- **SC-003**: Retry/DLQ assessment accepts compact placement, reports semantic
  recall without `useful_for_ait`, and retains exact change accounting.
- **SC-004**: The active Feature Discovery prompt contains no patch residue.
- **SC-005**: `npm run verify` passes before any Hub data is reset or rebuilt.
- **SC-006**: The Crawler C0/C1 sites retain the same compact Markdown concepts
  while exposing their concrete embedded resource difference in the map.
- **SC-007**: Focused tests prove exact-ARN coalescing, name-only separation,
  generic-row omission, evidence disclosure and byte-equivalent projection.
- **SC-008**: Focused tests prove stable repository regions, compact Repository
  cards, hidden Domain and structural graph elements, ownership-constrained
  dragging, labeled outside placement for shared nodes, resettable positions
  and evidence-backed embedded arrows without unsupported topology.
