# Feature Specification: Visualize Published Hub

**Feature Branch**: `045-visualize-published-hub`

**Created**: 2026-08-25

**Status**: Approved design; implementation pending

**Input**: Add two separate visualization workflows over one truthful,
deterministic Published Hub projection: lightweight query-scoped diagrams and
an explicit one-shot static 3D Domain site.

## User Scenarios & Testing

### User Story 1 - Draw a focused diagram (Priority: P1)

As a developer asking about one part of a system, I can request a useful
Architecture, Dependency or Sequence diagram without reading the whole Hub or
trusting invented relationships.

**Why this priority**: A focused diagram is the smallest useful visualization
and directly improves ordinary understanding work.

**Independent Test**: From one exact Published commit, select bounded concepts
and produce a self-contained diagram artifact. Architecture truthfully shows a
partial view, Dependency refuses a selection with no accepted edges, and
Sequence refuses a Flow with no ordered steps.

**Acceptance Scenarios**:

1. **Given** a Published selection with concepts and accepted relations,
   **When** the user requests Architecture, **Then** the result shows only
   recorded nodes/edges and lists any omissions.
2. **Given** no accepted dependency edge, **When** Dependency is requested,
   **Then** the workflow returns `insufficient-data` and does not invent an edge.
3. **Given** a Flow with contiguous recorded steps, **When** Sequence is
   requested, **Then** the displayed order and direction match those steps.
4. **Given** an ordinary knowledge question without a diagram request,
   **When** AgentBase answers it, **Then** no diagram or Domain site is generated.

---

### User Story 2 - Generate a static Domain site (Priority: P2)

As a Domain maintainer, I can explicitly generate a polished 3D website from
one Published Domain, review it locally, and copy it to a separate repository
for static hosting without keeping MCP or Hub credentials attached.

**Why this priority**: The site communicates cross-repository structure and is
valuable for presentation, but it is heavier and less frequent than a diagram.

**Independent Test**: Build one Domain into a new output directory, serve the
directory with network source access disabled, and use search, filters, focus
and node details without MCP, token or Hub access.

**Acceptance Scenarios**:

1. **Given** one exact Published Domain, **When** generation is explicitly
   requested, **Then** AgentBase creates a self-contained site plus a receipt
   bound to that Hub commit and Domain.
2. **Given** the generated files only, **When** they are hosted statically,
   **Then** the graph remains usable without MCP, token or source repository.
3. **Given** internal Published knowledge, **When** generation starts, **Then**
   the user receives a visibility warning before any output is written.
4. **Given** an existing non-empty output directory, **When** generation is
   requested, **Then** AgentBase stops without overwriting it.

### Edge Cases

- The requested Domain does not exist in the synchronized Published commit.
- A concept belongs to no Domain or more than one Domain.
- A relationship endpoint is missing, outside the selected Domain or malformed.
- A Question targets a missing concept or has already been resolved.
- The selected diagram exceeds packet limits or the Domain exceeds site limits.
- A browser cannot provide WebGL for the 3D view.
- Local Draft contains newer knowledge than the exact Published commit.
- Site output would reveal an MCP token, machine-local path or live endpoint.

## Requirements

### Functional Requirements

- **FR-001**: Both workflows MUST derive from one deterministic visualization
  projection of one exact synchronized Published Hub commit.
- **FR-002**: The projection MUST include accepted concept nodes, accepted
  canonical relations, ordered Flow steps, provenance references, Domain
  membership, active Question metadata and explicit omissions.
- **FR-003**: The projection MUST exclude Local Draft, proposal state, resolved
  Questions as badges, Maintainer Guidance as graph nodes and unaccepted
  relation candidates as edges.
- **FR-004**: One canonical descriptor set MUST define structural versus runtime
  relationships and their display direction; renderers MUST NOT reinterpret it.
- **FR-005**: Presentation layout, color, coordinates and renderer preferences
  MUST NOT be stored in OKF or treated as knowledge.
- **FR-006**: Query diagram preparation MUST require one Domain, one diagram type
  and an explicit bounded concept selection.
- **FR-007**: The first diagram slice MUST support Architecture, Dependency and
  Sequence as separate truthful outcomes.
- **FR-008**: Architecture MAY be partial with visible omissions; Dependency
  MUST require at least one usable accepted edge; Sequence MUST require one Flow
  with contiguous recorded `flow_steps`.
- **FR-009**: Diagram rendering MAY choose presentation and grouping but MUST
  NOT create or reverse endpoints, relations, directions or Flow steps.
- **FR-010**: Diagram output MUST be self-contained local HTML/SVG and MUST NOT
  mutate Hub.
- **FR-011**: Domain site generation MUST require explicit invocation, exactly
  one Domain and a new or empty caller-selected output directory.
- **FR-012**: The Domain site MUST initially show Domain, System and Repository
  structure and allow other concepts to expand from a selected node.
- **FR-013**: The Domain site MUST provide search, node/type/repository filters,
  one- or two-hop focus and readable node details.
- **FR-014**: Active Questions MUST appear as counts/badges by default rather
  than ordinary nodes.
- **FR-015**: The Domain site MUST contain local assets and a build receipt that
  binds Hub identity, commit, Domain, projection version and generated-file
  digests.
- **FR-016**: Generated output MUST contain no credential, machine-local source
  path, live MCP endpoint, remote font or network-loaded runtime asset.
- **FR-017**: The generated site MUST operate from a static host without Hub,
  MCP or source access and MUST make its fixed-snapshot commit visible.
- **FR-018**: AgentBase MUST warn about target repository/Pages visibility
  before site generation and MUST NOT create, push or publish a Domain-Hub
  repository.
- **FR-019**: The feature MUST add no full-Hub 2D UI, graph database, watcher,
  daemon, live refresh or automatic site regeneration.
- **FR-020**: The released product surface MUST add exactly two public skills,
  at most one internal renderer skill and at most one goal-level MCP tool.
- **FR-021**: Fixed bounds MUST fail visibly and identify the exceeded dimension;
  topology MUST NOT be silently truncated.
- **FR-022**: Current Published knowledge MUST be preserved until the projection
  and rendering contracts pass; later qualification MAY reset only knowledge
  through an explicit recoverable Hub commit before re-ingesting the selected
  multi-repository Domain.

### Key Entities

- **Published Visualization Projection**: Deterministic, presentation-neutral
  nodes, accepted edges, Flow steps, Question metadata and omissions for one
  Domain at one Published commit.
- **Diagram Packet**: Bounded projection slice for one diagram type and explicit
  concept selection.
- **Domain Snapshot**: Complete bounded projection for one Published Domain.
- **Build Receipt**: Identity and digests needed to audit one generated static
  site without retaining credentials or live connections.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Repeating the same projection request for the same commit produces
  byte-equivalent ordered data in 100% of deterministic qualification runs.
- **SC-002**: All rendered topology and direction in the qualification diagrams
  maps to accepted relation or Flow-step records; invented topology count is zero.
- **SC-003**: The three diagram types each pass one positive case and their
  defined incomplete-data cases without mutating Hub.
- **SC-004**: A generated site for the qualification Domain works from static
  files after Hub, MCP, token and source access are removed.
- **SC-005**: The site exposes search, filtering, one- and two-hop focus and node
  details across at least eight related service repositories in the selected
  qualification Domain.
- **SC-006**: Secret/path/live-endpoint scanning finds zero prohibited values in
  generated artifacts.
- **SC-007**: The official MCP listing grows by no more than one tool and the
  canonical offline verification remains green.

## Assumptions

- The active Hub profile has already synchronized one valid Published commit.
- Static hosting and repository creation remain owner-managed outside AgentBase.
- WebGL is normally available; an unsupported browser receives a readable
  fallback message rather than a second 2D visualization product.
- The first qualification Domain is the Sock Shop service ecosystem. Existing
  three-repository knowledge is insufficient for Sequence and will be rebuilt
  only after the implementation is ready.
