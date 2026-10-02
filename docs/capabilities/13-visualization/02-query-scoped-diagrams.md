# 13.02 — Query-scoped diagrams

`agentbase-diagram` starts from a user question or explicit concept selection.
It uses Hub search/read to establish scope, asks the shared visualization tool
for one bounded packet, then delegates rendering to internal
`use-diagram-design`.

The renderer uses its own adapted inline-SVG template with local assets and
system fonts. Repository verification checks that shipped template for network
URLs and requires its adjacent upstream NOTICE; no vendored upstream tree or
upstream inventory is required.

## Supported first slice

- **Architecture:** nodes plus structural/runtime edges; may render partial data
  with an omissions note.
- **Dependency:** requires at least one accepted dependency/runtime edge. Zero
  usable edges returns `insufficient-data`. A service-level System may supply
  such an edge through an accepted `consumes -> Interface` relation; the
  renderer does not derive dependency edges from prose or Flow steps.
- **Sequence:** requires one Flow with contiguous `flow_steps`. Missing steps
  returns `insufficient-data`.

The renderer may choose title, grouping, visual hierarchy and layout. It may not
create endpoints, topology, direction, evidence or sequence steps. Output is a
self-contained local HTML/SVG presentation artifact and never updates Hub.

The public skill is lightweight and appropriate during an ordinary question.
It must not trigger the Domain site workflow or read Local Draft.
