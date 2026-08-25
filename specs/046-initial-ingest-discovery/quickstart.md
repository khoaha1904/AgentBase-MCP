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
- fixed post-index calls produce stable Seed groups independently of Agent call
  order; `file_tree`, `cycles`, search and trace do not enter the Seed;
- only an exact Init/Batch-member Preflight-armed root creates a Seed; ordinary
  query and normal Refresh keep their existing graph/change-first behavior;
- provider index blocks remain intact and one bounded AgentBase Seed summary
  exposes every group ID that requires an outcome;
- malformed/partial Seed-driving output fails or records an explicit limitation;
- paging reaches terminal coverage; P0 overflow cannot be silently dropped;
- secret-like paths never appear in Seed or provider-visible census input;
- tool list count/names remain unchanged.

## 2. Initial Ingest authoring contracts

```sh
node --test src/app/hub-okf/authoring/initial-ingest.test.ts
node --test src/app/hub-okf/authoring/canonical-graph-e2e.test.ts
```

Expected:

- MCP—not caller input—derives lane status and P0; guidance rejects
  missing/duplicate P0 outcomes, merged origin groups and any P0 ignored
  reason except a valid `duplicate-covered` target;
- successful guidance returns one Receipt ID;
- new Prepare rejects mutable guidance replay; identical retry returns the same
  persisted authoring session and mismatched reuse fails;
- Finalize renders existing SharedQuestions from Receipt-bound QuestionPlans,
  checks exact-revision materialization and creates a Repository activity log;
- P1/P2 limitations remain review-ready.

## 3. Source and Batch isolation

```sh
node --test src/app/hub-okf/workspace/local-only-e2e.test.ts
```

Expected fixture coverage:

- exact clean default checkout is reused;
- dirty/feature checkout bytes and branch remain unchanged while a detached
  default-commit worktree is analyzed;
- private source materialization uses same-host token-only HTTPS outside the
  source repo and rejects ambiguous/cross-host/TOCTOU-mismatched identity;
- source integrity/authority drift invalidates unsafe state while default-head
  advance yields a freshness warning;
- Init Hub-base advance before Finalize issues a new Receipt/replacement session
  without rerunning unchanged source discovery; Refresh reruns its existing
  base-bound preparation without a Receipt;
- Batch members keep distinct Seed/Receipt/evidence state; a recoverable failed
  member does not stop siblings but leaves the atomic Batch Incomplete.

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

- independent representative source-to-Seed P0 coverage followed by
  Seed-to-proposal outcome, without exact concept inventory scoring;
- change versus the prior accepted run and any new regression;
- OKF/MCP defects separated from benchmark defects;
- elapsed time and token usage;
- confirmation that no Accept, Publish, provider CLI or fixture mutation ran.
