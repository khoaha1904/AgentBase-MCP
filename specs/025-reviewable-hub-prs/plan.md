# Implementation Plan: Reviewable Hub Pull Requests

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing `submit_hub_okf_proposals` path rather than creating a new
publisher. Add deterministic review-summary rendering from accepted proposal,
inspection and Git metadata. Teach the GitHub adapter to verify an explicit PR
base branch, then let publication choose either the existing single batch PR or
an exact same-Repository Init/Refresh stack. Keep token loading, branch push,
locking, receipts and fake-GitHub verification in their current owners.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing Node standard library, `yaml@2.9.0` and
GitHub HTTP adapter; no new dependency

**Storage**: Existing accepted local Hub Git commits, retained proposal
directories and atomic publication receipt JSON

**Testing**: One cohesive `node:test` publication scenario with disposable Git
and fake GitHub; canonical `npm run verify`

**Target Platform**: Existing local stdio MCP server on Node.js

**Project Type**: TypeScript modular monolith

**Performance Goals**: At most 100 selected proposals; bounded PR body and
GitHub response sizes; no extra model/provider process

**Constraints**: Dedicated token never enters tool arguments or output; no
merge, force-push, delete, retarget, repository creation or real-network gate

**Scale/Scope**: One dependency-safe pending prefix; one batch PR or one exact
linear same-Repository Init/Refresh stack

## Constitution Check

- **Evidence Before Abstraction — PASS**: PR prose is computed from exact
  accepted Git/proposal metadata and labels absent optional detail.
- **Local-First Explicit Authority — PASS**: Local authoring remains offline;
  only explicit Submit loads the existing dedicated token and uses GitHub.
- **Agent-Navigable Ownership — PASS**: `app/hub-okf/publication` owns summary
  and orchestration; `providers/github-hub` owns HTTP/base identity.
- **Cumulative Knowledge — PASS**: Publication moves already accepted commits;
  it does not rewrite OKF or infer deletion.
- **Specification and Verification — PASS**: `AB-PUBLISH-001..010` map to one
  fake-GitHub publication test covering success, fallback and recovery.
- **Dependency/schema/architecture gate — PASS**: No dependency, OKF schema,
  daemon, credential location or top-level ownership change.

Post-design re-check: **PASS**. Explicit base-branch support is a bounded
extension of the existing GitHub adapter, not a new provider or auth boundary.

## Design Decisions

### 1. Preserve the public action

`submit_hub_okf_proposals` keeps the same selected-prefix input. The action
returns a publication receipt containing one or more explicit units. Existing
non-stack selections retain one batch unit against `main`; first bootstrap
explicitly forces this batch path to preserve its one-PR contract. Legacy
top-level branch/head/PR receipt fields summarize the final unit.

### 2. Record mode in immutable accepted commits

Add the proposal mode trailer for newly accepted commits. Pending parsing treats
it as optional so previously accepted commits remain publishable through batch
mode. A stack is eligible only when every mode is present, the first is `new`,
all later modes are `refresh`, and every source Repository ID matches.

### 3. Render bounded review prose once

A small publication-owned renderer loads retained exact proposal metadata when
available and validates it against accepted IDs/digests. It groups inspection
paths, Questions and limitations; Git/proposal metadata is the fallback. Every
section has fixed item/byte bounds. Token and local roots are never inputs.

### 4. Make PR base explicit in the provider call

GitHub list/create methods receive an explicit base branch and validate the
response against it. The Hub target remains `main`; only a Refresh PR may use a
verified deterministic AgentBase proposal branch as its base.

### 5. Reuse exact accepted commits for a stack

For an eligible chain, each accepted commit already has the preceding commit as
its parent. Push each exact commit to `agentbase/okf-<proposal-id>` and open its
PR against `main` or the preceding branch. No cherry-pick/rebase is required.
Unrelated Init commits are not split; doing so would require a new conflict and
recovery design.

### 6. Recover by identity, not hidden retries

Each unit first admits an existing exact branch and matching open PR before
creating anything. A partial failure leaves completed remote units intact; a
retry repeats identity checks and continues. Conflicting refs/PRs stop visibly.

## Project Structure

```text
src/core/hub/proposal.ts                  accepted mode trailer
src/providers/github-hub/github-api.ts    explicit PR base identity
src/app/hub-okf/
├── review/pending.ts                     optional mode parsing
└── publication/
    ├── publish.ts                        batch/stack orchestration and receipts
    └── review-summary.ts                 deterministic bounded PR title/body
```

**Structure Decision**: Extend current publication ownership. Add one cohesive
renderer file; no new top-level module, queue, database or workflow engine.

## Complexity Tracking

No constitution violation or exception.
