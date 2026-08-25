# 13.00 — Baseline and impact

## Reuse

- `loadHubGraph` already parses bounded Markdown from an exact Published commit,
  resolves canonical relationships and derives Domain membership.
- OKF relationship validation already owns canonical predicates and `flow_steps`.
- shared Question Markdown already exposes exact subject and state.
- Hub configuration already isolates and synchronizes one Published checkout.
- diagram-design `2.6.5` is retained with an offline static HTML/SVG profile.

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

The static 3D site needs one pinned `three` runtime (`0.183.0`, already present
in the audited upstream dependency set) bundled into generated output through
the existing build toolchain. React, Vite and force-graph libraries are not
needed.
