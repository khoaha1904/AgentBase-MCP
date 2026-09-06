# 05 — Baseline and impact checkpoint

> Status: The owner accepted the proposal/change set as the publication unit and
> the Published-only remote-profile query boundary.

## High-level before the impact checkpoint

The high level originally described publication status per knowledge item:
concept, claim, relation, Question or evidence update. Users could accumulate a
Local Draft, select individual items before a PR and clean up only items that
were actually Published.

## Current baseline

The historical baseline already had a complete Git lifecycle:

```text
reviewed proposal
      ↓ accept atomically
one accepted Local Draft commit
      ↓ ordered pending ancestry
one contiguous prefix → one PR     ← remote publication
      ↓ synchronize
recognized commits are removed from pending ancestry
```

- `accept` commits the entire reviewed proposal as exactly one commit and
  fast-forwards local `main`.
- The old baseline queried `activeHead`, including remote knowledge and pending
  local changes; this was replaced by Published-only query.
- `remoteBase..activeHead` is the ordered pending proposal chain.
- Publish accepts only a contiguous prefix to preserve dependencies and avoid
  rewriting/reordering history.
- Proposal ID, source repository, evidence/diff digest and commit identity exist;
  accept/sync use locks, candidate worktrees and safe recovery.

Baseline sources:

- [Hub requirements](../11-review-and-publish/01-runtime-requirements.md)
- [Historical local-accept fixture](../../../../src/app/hub-okf/review/test-support/accept.ts) (test-only after Group 7)
- [Pending ancestry and prefix selection](../../../src/app/hub-okf/review/pending.ts)
- [Active-head query](../../../src/app/hub-okf/query/query.ts)
- [Historical stacked-publication fixture](../../../../src/app/hub-okf/publication/test-support.ts) (test-only after Group 7)
- [Synchronization](../../../src/app/hub-okf/publication/synchronize.ts)

## Reusable parts

- Git state continues to keep the Published anchor and Local Draft ancestry
  separate; no database or second temporary Hub is needed.
- `remoteBase` and pending ancestry already distinguish Published from
  unaccepted local proposal commits in each remote profile.
- A proposal commit is atomic, carries identity/provenance and has good recovery.
- One PR can already group proposals from multiple repositories.

## Decided boundary

Publication remains at **proposal commit** level, not each item inside Markdown:

- a concept path has identity, but a prose/evidence update is not an independent
  item;
- claims and some relations have IDs but no separate publication state;
- ordinary query reads only the exact synchronized Published anchor;
- an accepted proposal is immutable in pending history;
- publication cannot skip a proposal in the middle or select a relation/claim
  inside an accepted commit.

Each normalized remote URL + branch has its own Published clone and Draft
workspace. Without a remote configuration there is no Hub/OKF authority; only
Code Graph operates.

## Impact assessment

- Keeping Git/proposal commit as publication unit: **Contained change**.
- Keeping Published/Local Draft/In Review for proposal review while ordinary
  query reads Published only: **Contained change**.
- Keeping item-level selection/status after local Accept: **Broad change** across
  OKF identity, accept, pending, query, publish and synchronize.
- This is not a near rewrite because the Git lifecycle remains reusable, but it
  would significantly replace the stable Hub area with existing recovery tests.

## Minimal proposal

Adjust the high level so a **reviewed proposal/change set** is the publication
unit:

1. The user selects/removes individual knowledge items before local Accept.
2. Accept creates one immutable Local Draft commit for inspection/publication;
   ordinary query sees it only after merge and synchronization.
3. One PR groups consecutive pending proposals from multiple repositories.
4. Query reads the exact remote base; proposal review states whether a commit is
   local or in review.
5. After merge, synchronize recognizes Published proposals and retains the rest.

With this direction, items still carry identity/provenance for query and
conflict, but publication state belongs to the containing proposal. If a file
contains both remote and local edits, the Agent says the concept has pending
local changes instead of pretending every field has independent state.

## Decided

The proposal/change set is the publication unit. Item selection happens before
local Accept. After Accept, the immutable proposal commit passes through Local
Draft, In Review and Published as one unit. High-level sections 05 and 11 were
updated accordingly.

Ordinary query reads only Published state from the active remote profile. Without
remote configuration there is no competing Hub authority and only Code Graph is
used.

Impact after the decision: **Contained change**; no broad Hub redesign remains.
