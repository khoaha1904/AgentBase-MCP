# 13.04 — Runtime requirements

- **AB-VIS-001** — Visualization reads one exact synchronized Published commit
  and never mixes Local Draft or proposal bytes.
- **AB-VIS-002** — One deterministic projection owns nodes, accepted edges,
  render directions, Flow steps, Question metadata and omissions for both
  visualization workflows.
- **AB-VIS-003** — Governance documents are not default graph nodes; open and
  needs-review Questions attach as metadata and relation candidates never become
  accepted edges.
- **AB-VIS-004** — The predicate descriptor registry and `flow_steps` are the
  only direction authorities. Rendering must not infer missing topology.
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
- **AB-VIS-008** — Domain sites expose search, filters, 1–2 hop focus, node
  details, lazy concept expansion and a default-off Flow-step toggle while
  Questions remain badges by default.
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
