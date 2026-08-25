# Research: Visualize Published Hub

## Decision 1 — Reuse the current Hub graph parser

**Decision:** Extend the existing Published `loadHubGraph` boundary with a
separate visualization projection.

**Rationale:** It already owns bounded Markdown parsing, exact commit input,
canonical edges and Domain derivation. A second parser or graph store would
create competing authority.

**Alternatives considered:** A new graph database, GitNexus/Potpie runtime, and
agent-only Markdown traversal. They add state or leave topology nondeterministic.

## Decision 2 — Keep OKF presentation-neutral

**Decision:** Add a predicate descriptor registry and derived projection; do
not add visualization fields or a separate YAML schema to OKF.

**Rationale:** Relations and Flow steps are knowledge. Layout and color are not.

**Alternatives considered:** Persist coordinates/layout in Hub or infer every
direction in each renderer. Both make presentation a second authority.

## Decision 3 — Split two user workflows

**Decision:** Release `agentbase-diagram` for focused diagrams and
`agentbase-domain-site` for explicit one-shot site builds, sharing one tool.

**Rationale:** Diagram is lightweight and conversational; a Domain site is
heavy, persistent output for a separate hosting repository.

**Alternatives considered:** One broad visualization skill or a permanent Hub
UI. Both make ordinary questions unpredictable and expand lifecycle authority.

## Decision 4 — Use diagram-design through a narrow wrapper

**Decision:** Install an internal `use-diagram-design` wrapper containing only
the offline HTML/SVG instructions/assets needed for Architecture, Dependency and
Sequence.

**Rationale:** It preserves the mature upstream rendering grammar while keeping
AgentBase topology and direction authoritative.

**Alternatives considered:** Rebuild diagrams from scratch or publish the full
upstream skill. The first loses maturity; the second exposes unrelated diagram
types and workflows.

## Decision 5 — Build a small static 3D renderer

**Decision:** Use pinned `three@0.183.0`, native browser controls and a seeded
layout. Copy the local Three module into each build; use no React, Vite,
force-graph library, remote asset or live server.

**Rationale:** This is the smallest dependency surface that satisfies the
approved 3D presentation and works on GitHub Pages.

**Alternatives considered:** Codebase Memory Graph UI, 2D full-Hub UI, raw WebGL
and a React/force-graph stack. They are respectively wrong scope, rejected
product behavior, costly custom code or unnecessary dependency weight.

## Decision 6 — Qualify with a richer stable Domain

**Decision:** After implementation, rebuild Sock Shop knowledge from carts,
catalogue, orders, front-end, user, payment, shipping and queue-master. Add the
deployment repository only if needed after the service batch.

**Rationale:** Eight related service repositories provide understandable
cross-repository data and remain a stable archived benchmark.

**Alternatives considered:** Keep the current three repositories or reset Hub
before implementation. The first is too sparse; the second risks losing useful
baseline before the new contract can be checked.
