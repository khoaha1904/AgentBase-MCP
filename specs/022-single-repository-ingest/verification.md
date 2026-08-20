# Verification: Single-Repository Initial Ingest

**Status**: Offline implementation accepted; V13 external qualification failed.

## Offline evidence — 2026-08-21

- Focused quickstart: 43/43 tests passed in 1.74 seconds.
- End-to-end fixture: Repository preflight and Terraform/AWS guidance produced
  generic Repository, Function and Queue drafts, retained an explicit partial
  limitation and ended at an applicable `prepared` proposal. Pending accepted
  commits remained zero; no network, provider CLI, Accept or Publish ran.
- Canonical gate: `npm run verify` passed.
  - specification checks passed;
  - TypeScript passed;
  - dependency-cruiser found 0 violations across 190 modules/789 dependencies;
  - Knip passed;
  - Gitleaks scanned about 13.54 MB and found no leaks;
  - 376/376 offline tests passed;
  - `git diff --check` passed.

The gate initially identified one fake access-key-shaped test value and stale
spec-check fixture counts. The value was assembled only at runtime so the
secret scanner remains strict, and the fixture generator was updated to the
new living-contract ranges. The complete gate then passed without an allowlist.

## V13 offline qualification — 2026-08-21

- Focused V13 and Initial Ingest gate: 73/73 tests passed.
- Canonical gate: `npm run verify` passed.
  - specification checks, TypeScript, Knip and `git diff --check` passed;
  - dependency-cruiser found 0 violations across 190 modules/790 dependencies;
  - Gitleaks scanned about 13.57 MB and found no leaks;
  - 379/379 offline tests passed.
- AB-INGEST-010 now requires the confirmed primary Domain on the Repository
  relation and derives new-proposal evidence identity from validated guidance
  plus exact source state.
- The immutable V13 harness uses catalog `6.0.0`, isolates local Hub runtime
  state, requires Preflight through Inspect, permits at most one validation
  repair, and rejects Accept, bootstrap, submit and synchronize operations.

## V13 external qualification — 2026-08-21

Exactly three model-backed runs executed sequentially through one isolated
AgentDocks account runtime. No replacement run was added after a failure.

| Run | Repository | Elapsed | Outcome | Validation / finalize attempts |
|---|---|---:|---|---:|
| `2026-08-21T010900Z` | Health Aware | 83,058 ms | invalid; no preview | 0 / 0 |
| `2026-08-21T011800Z` | Shopping Cart | 361,368 ms | invalid; no preview | 4 / 3 |
| `2026-08-21T013000Z` | Health Aware | 360,518 ms | invalid; no preview | 2 / 7 |

Median elapsed time was 360,518 ms, below the ten-minute timing target, but the
validity/reviewability requirement failed at 0/3. No run reached Inspect, Accept
or Publish, and no Hub PR was created or rebuilt.

The runs identified these concrete gaps:

- run 1 exposed an empty provider `HOME`, non-isolated MCP XDG state and an
  unclear candidate `evidence_ids` contract; the benchmark-created ambient
  `hub.json` and empty local Hub were moved to Trash without touching the
  existing credential file;
- run 2 proved Hub isolation, then exposed a non-private temp ancestor,
  omission of the mandatory Repository schema, unbounded legacy schema calls
  and missing SAM/CloudFormation detector coverage;
- run 3 proved isolated graph indexing and architecture retrieval (240 nodes,
  537 edges), but the agent still lacked one exact machine-followable OKF
  document template and session-aware pre-final validation. It authored invalid
  frontmatter, exhausted its repair budget and retried finalization seven times.

The first two runtime/integration defects were corrected and the complete
offline gate remained 379/379. The remaining acceptance blocker is not concept
coverage: Initial Ingest needs a deterministic authoring surface that emits or
validates exact document bytes before finalization, plus a later scoped decision
on SAM/CloudFormation mapping. Capability 022 remains active and SC-005 is not
accepted. Another model-backed run requires a new owner authorization.
