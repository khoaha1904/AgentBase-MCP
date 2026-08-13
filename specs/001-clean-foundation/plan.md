# Plan: Clean Foundation

- **Status:** Implemented and verified
- **Feature:** `001-clean-foundation`

## Technical context

- Runtime: Node.js `>=24.12 <25`; local evidence is `v24.18.0`.
- Language: directly executed erasable TypeScript with ES modules.
- Static checking: TypeScript `--noEmit`.
- Tests: `node:test` through a recursive standard-library runner.
- Production dependencies: none.
- Development dependencies: TypeScript and Node type definitions only.
- Storage: deterministic in-memory fake data and checked-in fixture source.
- Network, credentials, daemon and external engine: none.

The runtime ADR remains proposed until the owner approves the Implementation
Preview. No dependency is installed during planning.

## Architecture compliance

The plan follows the repository guide and accepted architecture:

- modular monolith with capability ownership;
- core has no provider or application dependency;
- providers implement core contracts and contain no product policy;
- application composition imports only public capability entrypoints;
- tests are colocated with owners;
- no legacy runtime code is ported;
- no Codebase Memory binary, package or process is introduced;
- detailed graph data remains local and no observation/OKF type is created.

No architecture exception or review-baseline allowance is planned.

## Capability map

```text
src/
  core/
    code-intelligence/
      index.ts                    # only public core entrypoint
      contract.ts
      normalize.ts
      contract.test.ts
  providers/
    fake-code-intelligence/
      index.ts                    # only public fake entrypoint
      fake-provider.ts
      fixture-snapshot.ts
      fake-provider.test.ts
  app/
    foundation-demo/
      index.ts                    # public application flow
      run-demo.ts
      run-demo.test.ts
  cli.ts                          # explicit root composition entrypoint
```

Deferred folders `core/observations`, `core/knowledge` and
`providers/codebase-memory` are not created.

## Documentation and support layout

```text
docs/specs/project-foundation.md
fixtures/typescript-modular-monolith/
  fixture.json                    # expected task evidence and revision label
  src/                            # exactly 12 authored TypeScript files
scripts/
  module-boundaries.json
  architecture-baseline.json
  check-architecture.mjs
  check-architecture.test.mjs
  check-specs.mjs
  check-specs.test.mjs
  run-tests.mjs
  run-tests.test.mjs
```

`docs/specs/project-foundation.md` becomes the living contract. The numbered
feature directory remains the change record and becomes historical when closed.

## Dependency direction

```text
src/cli.ts -> app/foundation-demo public entrypoint
app/foundation-demo -> core/code-intelligence public entrypoint
app/foundation-demo -> fake provider public entrypoint for composition
providers/fake-code-intelligence -> core/code-intelligence public entrypoint
core/code-intelligence -> Node.js/platform only
```

The application selects the fake; core never discovers or imports providers.
The architecture registry treats `src/cli.ts` as the sole composition exception.

## Provider-neutral contract

The core public surface defines:

- repository and snapshot identities;
- normalized code nodes and edges;
- complete or explicit partial repository maps;
- bounded relevant-neighborhood queries;
- a closed result union for found, missing snapshot, unknown subject and invalid
  query outcomes;
- a reusable conformance scenario builder.

The fake owns its insertion order and storage. Normalization and validation live
in core because they are provider-neutral guarantees.

## Representative fixture and benchmark

The fixture contains exactly 12 TypeScript files across three capabilities. Its
manifest declares:

- the repository and revision identity;
- the accepted query subject and task description;
- all expected task-critical node and edge IDs;
- the maximum three referenced files;
- one isolated known subject for the empty-neighborhood scenario.

The fake snapshot corresponds to the fixture but is explicit test data; no
parser is implemented. The product-flow test runs the accepted query five times,
normalizes the result and proves byte-equivalent serialization.

## Architecture verification

`scripts/module-boundaries.json` exhaustively registers authored `src/**/*.ts`
files, including colocated tests, with exactly one capability owner. It also
records public entrypoints and `src/cli.ts` composition.

The checker resolves relative imports and rejects:

- unknown, overlapping or stale ownership;
- invalid or missing public entrypoints;
- external imports of private capability files;
- core-to-provider/application and provider-to-application dependencies;
- dependency cycles with exact paths;
- source/test files exceeding separate review budgets;
- invalid, growing or stale exact baseline records.

The clean baseline begins with no file or edge exception. Checker tests use
temporary repositories and stable requirement IDs.

## Verification commands

The package scripts expose:

- `spec:check`: current selector, living requirement IDs and unresolved-marker
  checks;
- `typecheck`: TypeScript static checking without emitted output;
- `architecture:check`: complete ownership/dependency/review gate;
- `architecture:changed`: focused reviewability check for changed files while
  retaining complete graph/registry validation;
- `test`: recursively run script and source tests;
- focused capability test commands listed in `quickstart.md`;
- `demo`: run the visible offline flow;
- `verify`: compose all required checks and `git diff --check`.

CI and packaging remain out of scope for this first slice. When added, CI must
call the same `verify` command rather than redefine readiness.

## Implementation sequence

1. Accept ADR 0004 after owner approval and add minimal runtime configuration.
2. Add the test runner and specification checks with their own tests.
3. Implement and test the architecture checker before the source tree expands.
4. Add the representative fixture and provider-neutral contract tests.
5. Implement the smallest core contract and normalization surface.
6. Add the fake provider behind the public contract and run conformance.
7. Add the foundation demo and five-run quality evidence.
8. Register exact ownership, establish the clean empty-exception baseline and
   run the complete offline gate.
9. Create the living foundation requirement, update README/handoff and close
   the feature only when all evidence agrees.

## Safety and recovery

- Planning and tests do not inspect `.env`, credentials or external caches.
- Temporary architecture fixtures use OS temporary directories and clean only
  their exact created paths.
- The demo is read-only and uses checked-in fake data.
- Failure returns typed diagnostics and non-zero CLI status; it does not mutate
  a cache or fall back to a user-installed engine.
- Before a real provider exists, rollback is source-only: revert the focused
  foundation slice without deleting user state because no user state is created.

## Explicit non-goals

- real parsing, indexing, incremental refresh or performance claims;
- Codebase Memory installation or adapter code;
- observations, OKF lifecycle or persistence;
- network, AI inference, credentials or infrastructure enrichment;
- distribution packaging, CI, daemon, MCP server or remote service;
- complete work/commit/push/deploy workflow automation.

## Risks and mitigations

- **Native TypeScript limitations:** enforce erasable syntax and explicit type
  imports through `tsconfig` and type tests.
- **Contract shaped around the fake:** keep conformance scenarios in core and
  prohibit provider-private public fields.
- **Arbitrary review thresholds:** start with clean files, separate source/test
  budgets and no exception; revisit only with measured evidence.
- **Fixture mistaken for parser evidence:** label the fake snapshot explicitly
  and defer real-engine benchmarks to Phase 1.
- **AgentDocks copied mechanically:** keep AgentBase names, requirement IDs and
  scripts independently implemented from the recorded mechanisms.
