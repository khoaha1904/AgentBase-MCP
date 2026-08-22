# Feature Specification: Independent Hub Pull Requests

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Complete

## Owner Decisions

- Open PRs for different Repositories do not depend on each other.
- Every Repository Init is reviewed as if the current Published `main` were the
  only base, even when other Init PRs are still open.
- Refresh depends only on the preceding Init/Refresh for the same Repository.
- After `main` advances, MCP preserves existing PRs and reconciles their branches
  sequentially; it does not replace the PR merely because another PR merged.
- First Hub bootstrap remains one explicit batch transaction.

## User Scenarios & Testing

### User Story 1 - Open independent Init PRs (Priority: P1)

As a Hub maintainer, I can review several Repository Init PRs simultaneously
without one PR containing or depending on another Repository's draft.

**Independent Test**: Accept two Init proposals consecutively in local Git and
publish each through disposable Git/fake GitHub; both PRs target `main`, and each
diff contains only its selected proposal.

**Acceptance Scenarios**:

1. **Given** an earlier Repository Init PR is open, **When** another Repository
   Init is submitted, **Then** the new PR independently targets current `main`.
2. **Given** the second accepted commit has the first proposal in local ancestry,
   **When** it is published, **Then** no first-Repository files enter its branch.
3. **Given** multiple independent Init IDs are submitted together, **When** MCP
   publishes them, **Then** it creates one review unit and PR per Repository.

### User Story 2 - Keep Refresh dependency local to one Repository (Priority: P2)

As a maintainer, I see a Refresh diff only against its own Repository's prior
proposal, regardless of unrelated open Init PRs.

**Independent Test**: Publish Init/Refresh for one Repository plus another Init;
assert only the Refresh targets its same-Repository predecessor.

### User Story 3 - Preserve open PRs after main advances (Priority: P3)

As a maintainer, I keep the same PR URL after another proposal merges and the
Published base changes.

**Independent Test**: Advance fake remote `main`, reconcile an open compatible
proposal branch, and assert its existing PR is updated rather than duplicated;
a conflict stops before remote branch mutation.

## Requirements

- **AB-PUBLISH-006**: Publication dependency MUST be derived per source
  Repository, not from global accepted-commit order.
- **AB-PUBLISH-007**: Every selected independent Init MUST publish as its own PR
  against the admitted Published `main`; bootstrap batch behavior MUST remain.
- **AB-PUBLISH-008**: Each publication branch MUST contain the exact accepted
  contribution for its proposal and MUST NOT contain unrelated pending proposal
  changes. For governed append-only shared indexes, that contribution is the
  selected proposal's added navigation applied to the publication base; earlier
  Local Draft navigation is context, not part of the selected contribution.
- **AB-PUBLISH-009**: Retry and partial failure MUST reuse exact branches and
  matching open PRs without duplicate PR creation.
- **AB-PUBLISH-010**: Canonical proof MUST remain offline with disposable Git and
  fake GitHub HTTP.
- **AB-PUBLISH-011**: After `main` advances, MCP MUST update compatible remaining
  branches on their existing PRs sequentially and MUST stop before push on an
  unresolved conflict. A Refresh whose predecessor is Published MUST become
  directly reviewable against `main` without creating a replacement PR.

## Edge Cases

- A selected Refresh omits or cannot find its same-Repository predecessor.
- A deterministic publication branch exists with a conflicting head.
- Remote `main` changes between admission and push.
- A proposal patch conflicts with its publication base.
- A selected Init appends navigation to a category index that exists only because
  an unrelated earlier Local Draft created it.
- A predecessor Init merges while its Refresh PR remains open.

## Success Criteria

- **SC-001**: Two consecutive different-Repository Init proposals produce two
  PRs against `main`, each with zero unrelated proposal paths.
- **SC-002**: Same-Repository Init/Refresh preserves the exact stack while an
  unrelated Init remains independent.
- **SC-003**: Retry creates zero duplicate PRs, and reconciliation preserves the
  existing PR number/URL on every compatible path.
- **SC-004**: Conflict scenarios leave remote `main` and the proposal branch at
  their previously admitted commits.

## Non-Goals

- Automatically merge, approve, close or delete a PR or branch.
- Infer semantic dependencies between different Repositories.
- Automatically choose a winner for a content conflict.
- Add a queue, daemon, background poller or publication database.
