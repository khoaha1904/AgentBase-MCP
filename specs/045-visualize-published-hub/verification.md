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

## Explained pending qualification

- Knowledge-only Hub reset: pass at Published commit
  `06455633f72f6faf9e5bcdc2c8e68643670e7e0c`; README, bundled validator,
  workflow and Git history were preserved.
- Eight-repository Batch Initial Ingest is resumable at manifest
  `batch-ingest-6746445e0de76358affbcb38`; carts and catalogue have completed
  member checkpoints. This is progress evidence, not final qualification.

The current Published Hub contains three repositories and structural relations
only. It has no accepted runtime edge or Flow, so it can truthfully qualify the
site and partial Architecture but cannot qualify Dependency or Sequence.
Model-backed `agentbase-diagram` runs are therefore intentionally scheduled
after the eight-repository Sock Shop rebuild; no synthetic relation is used to
claim success.
