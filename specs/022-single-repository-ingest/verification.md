# Verification: Single-Repository Initial Ingest

**Status**: Offline implementation accepted; external qualification pending.

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

## External qualification

Authorized but not yet run. A usable host account was confirmed before the V13
offline gate. Run exactly three sequential representative Initial Ingest
benchmarks, record validity, owner-review usefulness, elapsed time, limitations
and correction count here, and do not rebuild or publish a Hub PR.
