# Data Model: Scoped Graph Session

These values are local diagnostics and orchestration state. They do not change
the durable OKF schema or enter the deterministic repository-evidence digest.

## GraphRoundRequest

- `repositoryRoot`: selected local repository, resolved before provider work.
- `task`: existing bounded task-context request.
- `transport`: `one-shot` or `scoped-session`; never implicit after a failure.
- `roundTimeoutMs`: total work budget.
- `stageLimits`: connection/request/output/shutdown bounds.

Validation:

- repository root exists and resolves to the exact provider allow root;
- task retains the existing maximum fact/file bounds;
- transport is explicit at the provider factory boundary;
- every time/byte limit is a positive safe integer.

## ScopedProviderSession

- `transport`: always `scoped-session`.
- `engine`: admitted exact managed-package identity.
- `project`: deterministic provider project for this repository/cache arm.
- `pid`: direct stdio provider PID for diagnostics only.
- `state`: `created`, `connecting`, `ready`, `closing`, `closed` or `failed`.
- `startedAtMonotonicMs`: injected monotonic time.
- `failure`: optional typed lifecycle failure.

State transitions:

```text
created -> connecting -> ready -> closing -> closed
             |           |         |
             +-----------+---------+-> failed -> closing -> closed
```

No call is accepted before `ready` or after closing begins. `close` is
idempotent.

## GraphRoundDiagnostics

- `transport`: selected lifecycle.
- `engine`: exact provider/package/executable/adapter identity.
- `source`: repository ID, commit/dirty identity captured for the round.
- `stages`: monotonic `admissionMs`, `indexMs`, `queryMs`, `cleanupMs` and
  `totalMs`.
- `factIds`: ordered normalized fact identities.
- `sourcePaths`: ordered unique repository-relative files.
- `sourceUnchanged`: mutation/source-state result.
- `processCleanup`: `clean` or `failed`.
- `outcome`: `complete` or one typed failure code.
- `limitations`: explicit diagnostic limitations.

Validation:

- all successful stages are finite non-negative values;
- `totalMs` is no less than any individual stage;
- a complete arm has an evidence bundle and clean source/process results;
- a failed arm never carries a successful evidence bundle.

## BenchmarkArm

- `pair`: 1, 2 or 3.
- `order`: position within the pair.
- `outcome`: `complete` or `failed`.
- complete arms carry one GraphRoundDiagnostics and the accepted deterministic
  `evidenceDigest`;
- failed arms carry one typed failure code and no evidence or evidence digest.

Each arm gets a separate cache namespace. Benchmark ordering alternates to
reduce systematic first-arm warming bias. A failed arm does not stop the
remaining measurements, but it makes medians unavailable when a transport has
fewer than three complete arms and prevents parity/promotion.

## GraphLifecycleBenchmark

- `provider`: exact shared provider identity.
- `source`: exact shared source identity.
- `task`: exact shared task.
- `arms`: six ordered BenchmarkArm values.
- `oneShotMedianMs`: median of three totals.
- `scopedSessionMedianMs`: median of three totals.
- `speedRatio`: one-shot median divided by session median.
- `parity`: fact and repository-source equivalence result.
- `promotionEligible`: true only when all safety/parity gates pass and ratio is
  at least `2`.
- `limitations`: fixture/host scope and any rejected-gate explanation.

Benchmark values are evidence records, not configuration that silently changes
runtime behavior.
