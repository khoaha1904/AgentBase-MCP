# 13.04 — Capability requirements

These `AB-VIS-*` requirements are the normative Visualization Capability
Contract. The neighboring pages explain the behavior and supporting rationale.

- **AB-VIS-001** — Visualization reads one exact synchronized Published commit
  and never mixes Local Draft or proposal bytes.
- **AB-VIS-002** — One deterministic projection owns nodes, accepted edges,
  render directions, Flow steps, Question metadata and omissions for both
  visualization workflows.
- **AB-VIS-003** — Governance documents are not default graph nodes; open and
  needs-review Questions attach as metadata and relation candidates never become
  accepted edges.
- **AB-VIS-004** — The predicate descriptor registry and `flow_steps` remain
  canonical direction authorities. A valid evidence-backed `Embedded
  Relations` row is the sole additional presentation-only direction authority.
  Rendering must not infer missing topology.
- **AB-VIS-005** — `agentbase-diagram` supports Architecture, Dependency and
  Sequence from one bounded packet and returns visible insufficiency instead of
  hallucinating required edges or steps.
- **AB-VIS-006** — `agentbase-domain-site` requires explicit invocation and
  builds one static 2D site for exactly one Domain and Published commit. It has
  no second 3D mode.
- **AB-VIS-007** — Generated Domain sites include local assets and a digest-bound
  build receipt, contain no credential/live endpoint/local source path, and need
  no MCP or network source after generation. Browser resource URLs bind the
  exact generator version and Published commit so one rendered page never mixes
  files from different builds.
- **AB-VIS-008** — Domain sites expose all non-governance concept nodes except
  the selected page-context Domain, plus admitted embedded resource references,
  on first render, search, filters, 1–2
  hop focus, a right-side node-details drawer, text-only document overview, and
  a default-on Flow-step toggle while Questions remain badges by default. A
  Flow remains searchable and inspectable but renders as the compact label for
  its ordered step arrows rather than an isolated circular node. Selecting a
  System highlights its direct Published members without displaying hidden
  structural edges as runtime topology.
- **AB-VIS-009** — AgentBase adds at most one goal-level visualization MCP tool,
  two public skills and one internal renderer skill; no raw traversal/layout
  tools, database, watcher, daemon or live server are added.
- **AB-VIS-010** — Domain site output is local only. AgentBase does not create,
  push or publish a Domain-Hub repository and warns about repository/Pages
  visibility before generation.
- **AB-VIS-011** — OKF stores knowledge and evidence only; presentation layout,
  color, coordinates and renderer settings never enter Hub.
- **AB-VIS-012** — Same accepted input produces byte-equivalent projection data;
  configured size limits fail visibly instead of silently dropping topology.
- **AB-VIS-013** — Capability qualification covers truthful partial
  Architecture, Dependency with accepted edges, Sequence with real Flow steps,
  static offline site operation and explicit insufficient-data cases.
- **AB-VIS-014** — One-Domain views retain directly related Published external
  endpoints as non-expandable boundary nodes without changing repository/Domain
  membership or traversing the external Domain.
- **AB-VIS-015** — Visualization distinguishes admitted Published concept nodes
  from presentation-only embedded resource references. A promoted
  provider-neutral Resource is a normal node; an embedded row may expand only
  when it has a concrete kind and resolved Published evidence, retains its owner
  and is connected by the non-canonical `embedded-in` presentation link plus
  any separately evidenced embedded runtime relations.
- **AB-VIS-016** — Crawler qualification site is generated only from the exact
  Published qualification projection after source-backed resource/relation
  checks; its receipt records deterministic node/edge counts and the snapshot
  remains disposable review output, not a second knowledge authority.
- **AB-VIS-017** — Embedded references are parent-scoped unless Published data
  supplies the same exact normalized strong external identity. Exact ARN matches
  may coalesce while names, technology labels and source-local addresses never
  merge references across parents.
- **AB-VIS-018** — Domain-site evidence is summarized by repository file by
  default and every exact citation remains available through an explicit
  disclosure; presentation grouping never removes projection provenance.
- **AB-VIS-019** — Projection bounds and deterministic ordering include derived
  embedded references and links. Malformed, generic or unresolved embedded rows
  are omitted without becoming unsupported topology.
- **AB-VIS-020** — The static Domain site represents the selected Domain as page
  context rather than a graph node. Each Repository concept renders as a compact
  selectable card inside a fixed labeled region; singly owned nodes appear
  inside while visibly labeled shared, multi-repository and external nodes
  remain outside. Repository and Domain documents remain inspectable without
  changing Published projection authority.
- **AB-VIS-021** — Normal Domain-site nodes may be repositioned only within
  their ownership zone. Repository cards and region boundaries remain fixed;
  regions never resize, and reset or reload restores the deterministic layout.
  Pan, zoom, selection, filters and focus remain interactive.
- **AB-VIS-022** — Structural links already expressed by repository containment
  are hidden by default. Runtime arrows render only from canonical accepted
  relations, Flow steps or valid evidence-backed `Embedded Relations`; an
  `embedded-in` link alone never becomes a runtime arrow.
- **AB-VIS-023** — An `Embedded Relations` row resolves `self`, one exact
  admitted concept identity or one unique same-parent embedded name, uses only
  the bounded runtime predicate set, and cites evidence resolved by the parent
  Published concept. Invalid rows are deterministically omitted with warnings
  and valid rows count toward projection bounds.
