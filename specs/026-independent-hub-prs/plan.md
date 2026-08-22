# Implementation Plan: Independent Hub Pull Requests

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing Hub publisher. Select pending proposals by exact ID, group
their dependency only by `sourceRepositoryId`, and replay each accepted patch in
an isolated Git worktree onto its publication base. Keep deterministic branch
names, rich PR summaries, receipts, token ownership and fake-GitHub verification.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Dependencies**: Existing standard library, Git process runner and GitHub API;
no new dependency

**Storage**: Existing local Hub Git and atomic publication receipts

**Testing**: Extend the one cohesive publication `node:test`; keep 50 tests

## Constitution Check

- Evidence: exact accepted patch and exact Git base are the only replay inputs.
- Local-first: network remains limited to explicit MCP Submit/Synchronize.
- Ownership: publication orchestration stays in `app/hub-okf/publication`; HTTP
  remains in `providers/github-hub`.
- Cumulative knowledge: accepted local commits are not rewritten or removed.
- Verification: requirements map to the existing disposable-Git/fake-GitHub test.

No dependency, schema, daemon, credential location or architecture exception is
introduced. Post-design check: pass.

## Design Decisions

1. Local first-parent order remains pending storage, not publication dependency.
2. Auto mode creates one proposal branch per selected proposal. Init replays on
   remote `main`; Refresh replays on its nearest prior same-Repository branch.
3. `publicationMode: batch` remains only for first bootstrap compatibility.
4. Replay uses an isolated worktree plus deterministic cherry-pick timestamp;
   accepted commit identity remains in the receipt, publication head may differ.
5. Retry reconstructs the same head from exact base + exact patch and reuses the
   matching branch/PR. Conflicts fail before push.
6. Reconciliation advances an existing branch/PR rather than creating another;
   semantic conflict resolution remains an explicit repair, not an MCP guess.

## Changed Ownership

- `src/app/hub-okf/review/pending.ts`: exact selection and per-Repository order.
- `src/app/hub-okf/publication/publish.ts`: replay and independent units.
- `src/providers/github-hub/github-api.ts`: bounded existing-PR update needed for
  post-merge base reconciliation.
- `src/app/hub-okf/publication/publish.test.ts`: one end-to-end contract.

## Complexity Tracking

No exception. The publisher remains one synchronous operation; no new service or
persistent workflow graph is added.
