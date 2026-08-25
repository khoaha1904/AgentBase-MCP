# Validation quickstart — Initial Ingest discovery quality

This guide becomes executable as the implementation slices land. Use disposable
fixtures/fake GitHub boundaries until the final explicit model qualification.

## Prerequisites

- Node.js `>=24.12 <25`
- repository dependencies installed from the configured registry
- owned Codebase Memory artifact already prepared/admitted
- no real Hub token or network for offline verification

## 1. Focused provider and MCP contracts

```sh
node --test src/app/codebase-memory-mcp/server.test.ts
node --test src/providers/codebase-memory/owned-runtime.test.ts
```

Expected:

- scan does not create a graph;
- captured provider fixtures produce stable Seed groups;
- malformed/partial Seed-driving output fails or records an explicit limitation;
- tool list count/names remain unchanged.

## 2. Initial Ingest authoring contracts

```sh
node --test src/app/hub-okf/authoring/initial-ingest.test.ts
node --test src/app/hub-okf/authoring/canonical-graph-e2e.test.ts
```

Expected:

- guidance rejects missing/duplicate P0 dispositions;
- successful guidance returns one Receipt ID;
- new Prepare rejects mutable guidance replay and consumes the Receipt once;
- Finalize checks materialization and creates valid Repository activity log;
- P1/P2 limitations remain review-ready.

## 3. Source and Batch isolation

```sh
node --test src/app/hub-okf/workspace/local-only-e2e.test.ts
```

Expected fixture coverage:

- exact clean default checkout is reused;
- dirty/feature checkout bytes and branch remain unchanged while a detached
  default-commit worktree is analyzed;
- default-head/source/Hub drift invalidates unsafe state;
- Batch members keep distinct Seed/Receipt/evidence state and one failed member
  leaves the atomic batch Incomplete.

## 4. Canonical offline gate

```sh
npm run verify
```

Expected: specification, upstream foundation, Hub validator, type, dependency,
dead-code, secret and focused test gates all pass with a clean diff check.

## 5. Explicit released-skill qualification

Only after the offline gate passes, run the capability suite added by the
implementation:

```sh
npm run benchmark:okf -- run initial-ingest-discovery-v1 <repository>
npm run benchmark:okf -- finalize initial-ingest-discovery-v1 <UTC-run-id> <repository>
```

The prompt supplies owner input and invokes the installed `agentbase-ingest`
skill; it does not duplicate workflow instructions. Stop after a hard blocker.
If the probe is valid without a clear quality blocker, run one identical
sequential replica.

The report must include:

- P0/P1/P2 coverage without exact concept inventory scoring;
- change versus the prior accepted run and any new regression;
- OKF/MCP defects separated from benchmark defects;
- elapsed time and token usage;
- confirmation that no Accept, Publish, provider CLI or fixture mutation ran.
