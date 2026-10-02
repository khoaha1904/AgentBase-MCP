# 13.00 — Baseline and impact

## Reuse

- `loadHubGraph` already parses bounded Markdown from an exact Published commit,
  resolves canonical relationships and derives Domain membership.
- OKF relationship validation already owns canonical predicates and `flow_steps`.
- shared Question Markdown already exposes exact subject and state.
- Hub configuration already isolates and synchronizes one Published checkout.
- The internal renderer owns an adapted offline HTML/SVG template derived from
  diagram-design `2.6.5`; its asset NOTICE retains upstream provenance and the
  complete MIT license. No upstream source snapshot is shipped.

## Baseline gaps addressed by capability 045

- The shared projection now filters governance documents and attaches active
  Questions as metadata.
- One predicate descriptor registry now owns presentation direction.
- Bounded diagram packets and reproducible static Domain build receipts now
  exist.
- Two public visualization skills, one internal renderer skill and one shared
  goal-level MCP tool are released.

## Impact classification

**Contained change.** Add one read-only projection boundary, one goal-level MCP
tool, two public skills and one internal renderer wrapper. Reuse current OKF and
Published checkout. Do not add an OKF schema, graph database, watcher, server or
general UI framework.

Capability 048 replaces the custom 3D presentation with pinned
`cytoscape@3.34.2`, copied into generated output through the existing build
toolchain. It removes `three`; React, Vite, Sigma/Graphology and force-graph
libraries remain unnecessary.
