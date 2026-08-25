# Capability 048 — Readable 2D Domain site

> Status: implemented and qualified.

## Objective

Replace the custom 3D Domain-site presentation with a readable 2D knowledge map
without changing Published projection truth, OKF, MCP tools or publication
authority.

## User scenarios

### US1 — Understand a Domain at a glance (P1)

A maintainer opens one generated Domain site and can read the important nodes,
accepted relations and direction without rotating a 3D scene.

**Acceptance:** The initial view is two-dimensional, fits the visible graph and
shows readable type-distinct nodes and directed runtime relations.

### US2 — Find and inspect knowledge (P1)

A maintainer searches or filters the map, focuses one or two hops and reads the
selected concept's description, provenance, Questions and direct relations.

**Acceptance:** Search, type/repository/membership filters, node selection,
1–2 hop focus, reset and the detail panel remain available by mouse and
keyboard-operated controls.

### US3 — Inspect flows without clutter (P2)

A maintainer can reveal or hide Flow-step edges independently from accepted
structural and runtime relations.

**Acceptance:** Flow-step edges are hidden in the default overview, can be
enabled explicitly and remain visibly directed.

## Requirements

- **FR-001** — Domain-site output MUST use one interactive 2D map and MUST NOT
  include a 3D renderer, orbit controls or a second visualization mode.
- **FR-002** — The exact Published projection, Domain boundary behavior,
  provenance and Question metadata remain the only data authority.
- **FR-003** — The default view MUST fit the visible map and distinguish Domain,
  System, Repository, Flow, other concepts and external boundary nodes.
- **FR-004** — Accepted runtime direction MUST remain visible; the renderer MUST
  NOT invent edges or direction.
- **FR-005** — Search, filters, lazy neighborhood expansion, 1–2 hop focus,
  reset and readable details MUST remain available.
- **FR-006** — Flow-step edges MUST be an explicit display toggle and hidden by
  default; open Questions remain badges rather than default nodes.
- **FR-007** — Generated output MUST remain a fixed, self-contained static
  snapshot with local assets, deterministic receipt digests and no Hub, MCP,
  credential or source access at runtime.
- **FR-008** — Failure to initialize the visual renderer MUST expose a readable
  fallback pointing to the included Published JSON snapshot.
- **FR-009** — The change MUST add no MCP tool, skill, live service, graph store,
  watcher, React application or build pipeline.

## Edge cases

- A Domain with no accepted runtime relation still shows its structural map.
- A Domain with no Flow keeps the Flow control disabled and reports zero flows.
- Filtering to zero nodes preserves controls and offers Reset.
- Direct cross-Domain endpoints remain non-expandable boundary nodes.

## Assumptions

- Domain sites remain bounded by the existing projection limits.
- The generated-site repository visibility decision remains outside MCP.
- Existing generated 3D snapshots are replaced only by an explicit rebuild.

## Success criteria

- **SC-001** — Both qualification Domains generate byte-valid static sites whose
  graph, data and local renderer assets return HTTP 200 without external calls.
- **SC-002** — A user can select a known node, focus one hop and return to the
  complete overview using visible controls.
- **SC-003** — Generated output contains no Three.js asset or 3D/WebGL UI text.
- **SC-004** — Existing Published projection, focused diagram and MCP tool
  contract checks remain unchanged and pass the repository gate.

## Non-goals

- Full-Hub navigation, Draft overlay or automatic Pages publication.
- A second 3D mode, custom layout editor or persisted coordinates.
- Replacing focused Architecture, Dependency or Sequence diagrams.
