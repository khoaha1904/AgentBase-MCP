# Verification: Published visualization

## Deterministic checkpoint — 2026-08-25

- `npm run verify`: pass, 62/62 tests.
- Fresh-process MCP qualification: pass, exactly 44 tools; Code Graph source
  remained unchanged and repository-local persistence remained absent.
- Projection fixture: byte-stable for the same commit/Domain; governance nodes
  excluded, active Questions attached, resolved Questions excluded, direct
  cross-Domain boundary retained and display direction descriptor-derived.
- Diagram packets: Architecture, Dependency and Sequence ready cases pass;
  missing runtime edges/Flow steps return `insufficient-data` without Hub
  mutation.
- Static generation: two builds are byte-equivalent, receipt digests pass,
  unsafe/non-empty targets fail, interrupted staging recovers, and generated
  text contains no token, local absolute path or live AgentBase endpoint.
- Static-host smoke used Published `domains/retail` at commit
  `9717e9e6e92828b832557943025c6f4a5d786d21`: 10 nodes, 15 accepted edges;
  `index.html`, app, local Three.js, Domain JSON and receipt each returned HTTP
  200 from a directory-only local server.

## Published multi-repository qualification — 2026-08-25

- Knowledge-only reset preserved README, bundled CI and Git history. Batch
  Initial Ingest then Published all eight selected Sock Shop repositories under
  `domains/retail`.
- A source-backed Refresh Published two Flows and four exact
  `System consumes Interface` runtime relations. Hub CI passed and the final
  qualification commit is `07750f50f8ec84818505b82d0e8848fc8b8b6f3f`.
- `agentbase-diagram` produced one self-contained artifact for each supported
  type. Architecture contains nine nodes and eight supplied edges; Dependency
  contains five nodes and four directed runtime edges; Sequence contains one
  Flow, three actors and two ordered synchronous steps. No topology was added.
- The one-shot Domain site contains 24 nodes, 40 edges, two Flows and no active
  Questions. All six receipt digests match; `index.html`, app, both pinned local
  Three.js modules and Domain JSON return HTTP 200 from a static local server.
- Real qualification exposed and fixed three bounded implementation gaps: Git
  identity was absent during synchronized replay, existing PR branch fetch did
  not populate a remote-tracking ref in main-only clones, and Three.js 0.183
  required its separate core module in the static bundle. Regression coverage
  is included and `npm run verify` passes 62/62 tests.

Capability 045 meets SC-001 through SC-007. SC-008 remains fixture-qualified;
the selected Retail data contains no accepted direct cross-Domain relation, so
the implementation does not invent one merely to exercise the real site.
