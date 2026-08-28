# Capability 055 — Benchmark storage normalization

> Status: complete; migration is additive and preserves historical evidence.

## Objective

Make benchmark data easy to locate and reproducible by giving it one sibling
repository, while keeping the MCP runtime, `npm run demo` and the offline
verification gate independent from model-backed benchmark data.

## Owner decisions

- `AgentBase-Benchmark` is the canonical sibling repository for benchmark data.
- AgentBase-MCP keeps the runner/scorer and small deterministic product fixtures.
- Source checkouts are centralized under the Benchmark repository and pinned by
  a tracked registry; nested checkout Git histories are not copied into the
  Benchmark repository history.
- Existing prompts and results remain immutable historical evidence.
- The active qualification baseline is selected explicitly by suite; stale or
  missing-source suites are not active by default.
- Expected probes use `critical`, `important` and `optional` priorities.
- Durable evidence lives below Benchmark `results/`; per-run workspaces and
  graph/runtime caches remain owned temporary state and are cleaned.

## Acceptance criteria

1. A sibling Benchmark repository contains the canonical prompts, suites,
   expectations, source registry/checkouts and results.
2. MCP benchmark commands resolve an explicit root, validate that every source
   is clean and pinned, and reject paths outside that root.
3. `npm run demo` and `npm run verify` continue to work without the Benchmark
   checkout or a model process.
4. Historical benchmark bytes remain available and unchanged after migration;
   active suites are explicit and missing fixtures are reported before run.
5. Expected probes expose three-tier coverage and weighted diagnostics while
   preserving separate lifecycle/conformance and owner-review decisions.
6. No durable benchmark or graph data is written to `tmp/`; temporary run state
   is cleaned after success and failure.
7. Focused benchmark tests, spec checks and the full MCP verification gate pass.

## Implementation evidence

- Created sibling `AgentBase-Benchmark` with centralized prompts, suites,
  expected probes, results and a pinned 16-entry repository registry.
- Moved active Crawler checkout to the sibling and archived the old
  `AgentBase/fixtures/source-repos` tree without deleting it. Historical
  benchmark bytes were copied byte-for-byte under `suites/legacy` and
  `results/`.
- Added explicit benchmark-root resolution, registry/clean-commit preflight,
  path containment and three-tier priority diagnostics to the existing MCP
  engine. Temporary benchmark workspaces remain OS-temporary and are cleaned.
- `npm run demo`, focused benchmark/qualification tests and the full
  `npm run verify` gate pass.

## Non-goals

- Moving the benchmark runner/scorer into a second runtime repository.
- Adding a model SDK, vector database, dashboard or background benchmark job.
- Recreating missing historical source repositories or rewriting old results.
- Treating benchmark expectations as a complete inventory of repository truth.
