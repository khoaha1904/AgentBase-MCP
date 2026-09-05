# Local writer and Git concurrency requirements

> Status: Implemented and verified for profile-scoped local writers, legacy
> lock compatibility and Git pull-request synchronization.
>
> Release evidence: Required

Product Contracts:
[Scope and authority](../../product/00-scope-and-authority.md) and
[Knowledge lifecycle](../../product/03-knowledge-lifecycle.md)

Architecture Contracts:
[State and trust boundaries](../../architecture/state-and-trust.md),
[Flows](../../architecture/flows.md), and
[Ownership](../../architecture/ownership.md)

## Boundary

This capability serializes accepted local Hub and remote workflow mutations for
one exact Hub profile and keeps cross-machine coordination in Git pull requests.
It owns no central service, distributed lock, background worker or knowledge
merge policy.

Prepared authoring, Batch and Enrichment workspaces are isolated candidates,
not admitted Hub state. They may coexist and use exact base/digest checks;
Accept, Maintainer-answer proposal creation, Publish, Synchronize, recovery,
bootstrap and Hub Initialization are admitted writers and use the profile lock.

## Requirements

- **AB-CONCURRENCY-001** — Every admitted writer acquires one create-exclusive
  owner-private lock keyed by the exact Hub profile identity before changing
  accepted local refs, governed proposal state or remote workflow state.
- **AB-CONCURRENCY-002** — A live owner for one profile blocks another writer
  for that profile with a visible retryable error. Locks for distinct profiles
  under the same `AGENTBASE_HOME` do not block each other.
- **AB-CONCURRENCY-003** — Lock metadata has one strict versioned schema with
  profile, operation owner, local PID, acquisition time and unpredictable
  ownership nonce. The directory is mode `0700`, metadata is `0600`, and
  symbolic-link, wrong-owner, malformed or extra lock content fails closed.
- **AB-CONCURRENCY-004** — Acquisition may reclaim a stale current-format lock
  only after valid metadata identifies a local PID proven absent. A valid live
  PID, unreadable metadata or ambiguous process state is never removed.
- **AB-CONCURRENCY-005** — The first upgraded writer also admits the former
  global `mutation.lock`: a live or malformed legacy owner blocks; a valid dead
  local PID is removed before profile-lock acquisition. This prevents old and
  new application versions from writing concurrently during cutover.
- **AB-CONCURRENCY-006** — Release verifies the exact profile, owner and nonce
  before removing a lock. Changed or replaced ownership fails and preserves the
  other owner's lock.
- **AB-CONCURRENCY-007** — Read-only status, pending inventory, Published query
  and projection do not acquire a writer lock. They remain bound to an exact
  admitted commit and may report an active writer or recovery state without
  reading partial candidate bytes.
- **AB-CONCURRENCY-008** — Accept and Synchronize continue to use clean isolated
  candidates, exact expected refs and atomic compare-and-swap ref updates.
  Failure preserves the last admitted Published and active heads plus durable
  recovery state.
- **AB-CONCURRENCY-009** — Synchronize admits only remote ancestry containing
  the prior Published boundary, recognizes already-published proposal identity,
  then replays remaining accepted commits sequentially. Conflict records exact
  paths and stops before advancing refs or pushing a branch.
- **AB-CONCURRENCY-010** — Different machines coordinate through deterministic
  proposal branches and pull requests. Retry adopts only exact branch/PR state;
  AgentBase never resolves conflict by last-writer-wins, force-pushes a changed
  branch, merges a PR or mutates the target branch after empty-Hub bootstrap.
- **AB-CONCURRENCY-011** — Hub-profile activation remains an independent atomic
  configuration transition. Switching the active profile copies no knowledge,
  transaction, lock or pending proposal between profiles.
- **AB-CONCURRENCY-012** — Focused isolated-root tests cover same-profile
  exclusion, distinct-profile independence, live/stale/malformed and legacy
  lock handling, exact release ownership, Git ancestry/replay, conflict and
  recovery without real credentials or remote mutation.

## Validation evidence

The profile-lock tests own local exclusion and compatibility evidence. Existing
disposable-Git publication tests own branch, pull-request, ancestry, replay,
conflict and recovery evidence. The canonical repository gate runs both; no
durable lock report or parallel concurrency registry is retained.

## Deferred boundary

Cross-machine locking, a central coordination server, automatic semantic
conflict resolution and a background synchronization worker remain outside the
trusted-enterprise product. Git hosting and human review stay the shared
coordination boundary.
