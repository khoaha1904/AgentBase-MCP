# Verification: AgentBase Hub PR Lifecycle

**Date:** 2026-08-12
**Scope:** Offline implementation plus separately authorized private-Hub qualification

## Focused acceptance

- Core Hub identity/proposal tests pass with normalized source repository,
  SHA-256 evidence/tree/diff identities and deterministic non-target branch.
- Git boundary tests pass for allowlisted environment, memory-only temporary
  askpass, hooks/submodule/protocol controls, token canary redaction, symlink
  rejection and repository-local URL rewrite rejection.
- New and refresh tests pass for subject preconditions, sparse schema selection,
  shared relationship concepts, protected byte preservation, unknown extension
  preservation, anti-feedback, conflicts, supersessions and bounded inspection.
- Submission tests pass for reviewed-byte drift, target drift, effective origin,
  deterministic branch validation, non-force push, target-write prohibition,
  conflicting ref/PR identity and pre-publication cancellation.
- Recovery tests pass for push-success/PR-failure: phase remains `pushed`, retry
  performs no second push and opens exactly one PR for the exact commit.
- MCP and CLI tests prove the fixed four-action surface and reject token, remote,
  target, force and merge arguments.

Focused Hub result after convergence hardening and agent-orchestrated authoring wiring: **35 passed, 0 failed**.

## Disposable Git end-to-end

The `local-e2e.test.ts` acceptance creates a temporary bare Git repository and
a real base commit, authors a conformant new OKF bundle, creates a real
deterministic proposal commit, and pushes through the submission state machine.
GitHub PR behavior alone is fake.

Observed invariants:

- target `refs/heads/main` remains at the exact original base commit;
- exactly one additional `refs/heads/agentbase/okf-<proposal-id>` exists;
- the remote proposal ref equals the receipt commit;
- exactly one admitted PR receipt is created;
- all temporary repositories are removed by the test;
- no network or real GitHub credential is used.

## Canonical repository gate

Final `npm run verify` passed on 2026-08-12:

- specification checks: pass;
- TypeScript typecheck: pass;
- architecture: 0 errors, 2 unchanged review-size warnings in pre-existing
  `repository-okf/graph-round.ts` and `codebase-memory/session.ts`;
- tests: **179 passed, 0 failed**;
- `git diff --check`: pass.

## Requirement reconciliation

AB-HUB-001..015 have offline code and focused evidence. T026 also has the
separately authorized real qualification evidence below.

## Resolved convergence item

The owner selected the recommended agent-level Create OKF action on 2026-08-12.
The coding agent orchestrates lower-level MCP prepare/workspace/finalize
primitives; the MCP process does not contain a model SDK or receive one opaque
Markdown payload. T032 is complete: configured MCP/CLI runtime now prepares an
owned workspace, derives source identity, finalizes repairably, and connects
inspect/submit/recover to exact local proposal state.

## Real private-Hub qualification

The owner separately authorized GitHub mutation on 2026-08-12. Qualification
used the private repository `khoaha1904/knowledger-hub` without editing its
dirty legacy checkout. Legacy `main` was preserved exactly at
`archive/legacy-hub-2026-08-12` before a reviewed bootstrap path was created.

Exact remote state after qualification:

- unchanged `main`: `35e0ab746c251f52cf034597749bbf28a6ff7bc1`;
- legacy archive: `archive/legacy-hub-2026-08-12` at that same commit;
- clean OKF v0.2 bootstrap target: `agentbase/bootstrap-okf-v2` at
  `0f2da38d6f31209dd08989ad157977996054d085`;
- bootstrap PR: <https://github.com/khoaha1904/knowledger-hub/pull/2>, open and
  unmerged against `main`;
- Codebase Memory evidence digest:
  `sha256:a9c12b1c89f371fc21a1921376d5f93bca1e4784eac7c617a6116aaa80568b7f`;
- source repository identity: `repository-agentbase-next-93cefe724453`;
- selected schema: `Software Repository` only;
- proposal `7dfd51381de77bcc4803598a`, reviewed diff digest
  `sha256:05aa71fb7dd39840684645e88a8f853ff45d5bff5889fb71a6c3a8e69ef088e4`;
- proposal branch `agentbase/okf-7dfd51381de77bcc4803598a` at
  `f1b4effd8594b02e1961b5e0685d290cc2c1dffe`;
- AgentBase-created PR: <https://github.com/khoaha1904/knowledger-hub/pull/3>,
  open and unmerged against the exact bootstrap target.

The authored proposal created two files and modified one index, with zero
deletions, conflicts or supersessions. `main` remained unchanged and neither PR
was merged. The successful proposal runtime state remains owner-private at
`/tmp/agentbase-hub-qualification.iaWhih` so exact recovery remains possible
until review completes. The bootstrap clone, read-only export and failed retry
state were removed. No askpass directory remains, and no token was written to
proposal state, output or Git configuration.

Qualification exposed and then verified bug `hub-partial-checkout-auth`: a
partial-clone checkout could lazily fetch blobs without receiving askpass
authentication. The fixed checkout passes the memory-only token to that bounded
subprocess. Focused tests pass 3/3 and the post-fix canonical gate passes 179/179.

Credential deviation: the available authenticated GitHub credential was the
existing broad `gh` credential, injected directly into the child environment
without printing it. Runtime secret handling passed, but this credential is
broader than AB-HUB-002's intended exact-Hub fine-grained scope. Replace it with
the dedicated Hub token before routine use.
