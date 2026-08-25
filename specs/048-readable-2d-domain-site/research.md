# Research: Readable 2D Domain site

## Decision 1 — Replace rather than retain 3D

**Decision:** Ship one 2D Domain map and remove the 3D renderer.

**Rationale:** Hub relations are semantic and directional; depth adds occlusion,
camera work and label instability without adding meaning. Two renderers would
double maintenance.

## Decision 2 — Use Cytoscape.js core

**Decision:** Pin `cytoscape@3.34.2` and copy its local minified browser asset.

**Rationale:** It is a mature MIT graph visualization library with no external
dependencies, built-in layouts, arrows, labels, filtering, selection, pan and
zoom. It avoids both a custom graph engine and a React/Vite application.

**Alternatives:** Codebase Memory remains 3D and repository-scoped; Potpie's
React Force Graph adds React/build dependencies; GitNexus's Sigma/Graphology
stack targets much larger graphs and adds several runtime packages; native SVG
would repeat the custom-layout mistake.

## Decision 3 — Keep presentation replaceable

**Decision:** Projection JSON, OKF and tool contracts remain unchanged.

**Rationale:** The rejected UI is a presentation problem, not a knowledge-model
problem. Future presentation changes must not require Hub migration.
