# 13.00 — Baseline and impact

## Reuse

- `loadHubGraph` already parses bounded Markdown from an exact Published commit,
  resolves canonical relationships and derives Domain membership.
- OKF relationship validation already owns canonical predicates and `flow_steps`.
- shared Question Markdown already exposes exact subject and state.
- Hub configuration already isolates and synchronizes one Published checkout.
- diagram-design `2.6.5` is retained with an offline static HTML/SVG profile.

## Gaps

- Query graph currently includes governance documents as normal concepts and
  has no presentation projection.
- Predicate names do not yet have one render-direction descriptor registry.
- No bounded diagram packet, static Domain snapshot or visualization build
  receipt exists.
- No released visualization skills or tool exist.

## Impact classification

**Contained change.** Add one read-only projection boundary, one goal-level MCP
tool, two public skills and one internal renderer wrapper. Reuse current OKF and
Published checkout. Do not add an OKF schema, graph database, watcher, server or
general UI framework.

The static 3D site needs one pinned `three` runtime (`0.183.0`, already present
in the audited upstream dependency set) bundled into generated output through
the existing build toolchain. React, Vite and force-graph libraries are not
needed.
