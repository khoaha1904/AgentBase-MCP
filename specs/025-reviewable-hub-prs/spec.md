# Feature Specification: Reviewable Hub Pull Requests

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Complete

**Input**: Let AgentBase-MCP publish accepted local OKF proposals through
maintainer-readable GitHub pull requests. The PR must explain its purpose,
scope, knowledge changes, uncertainty, evidence and required reviewer action.
An Initial Ingest followed by Refresh for the same Repository may be published
as a stack where Refresh targets the Init branch.

## Owner Decisions

- MCP owns branch push and PR creation with the dedicated Hub token. The calling
  agent does not invoke `gh`, merge, approve, force-push or delete branches.
- The existing dependency-safe pending-prefix selection remains the public
  publication entrypoint.
- One ordinary selection remains one PR against configured `main`.
- A selected contiguous chain beginning with one Init and followed only by
  Refresh proposals for the same Repository becomes a PR stack: Init targets
  `main`; each Refresh targets the preceding proposal branch.
- PR prose is deterministic and derived from accepted proposal/inspection
  metadata. Missing optional metadata is shown as unavailable, never invented.
- Independent Init proposals are not rebased into separate PRs in this slice;
  they continue to use one dependency-safe batch PR.

## User Scenarios & Testing

### User Story 1 - Review a publication without reading every file (Priority: P1)

As a Hub maintainer, I want each publication PR to summarize why it exists and
what changed so I can decide where to inspect the Git diff.

**Why this priority**: A raw file diff is insufficient for reviewing knowledge,
uncertainty and destructive lifecycle changes.

**Independent Test**: Publish a selected accepted proposal through fake GitHub
and inspect the exact PR title/body and identity without network access.

**Acceptance Scenarios**:

1. **Given** one dependency-safe selection, **When** MCP publishes it, **Then**
   the PR body contains Purpose, Scope, Knowledge Changes, Uncertainty,
   Evidence and Validation, and Reviewer Action sections.
2. **Given** added, updated, removed or superseded knowledge and retained
   Questions/limitations, **When** the body is rendered, **Then** each available
   category is named with bounded paths/reasons and missing categories say none.
3. **Given** retained local inspection metadata is unavailable, **When** MCP
   publishes an older accepted proposal, **Then** it uses exact Git/proposal
   metadata and labels unavailable detail instead of failing or inventing it.

---

### User Story 2 - Review Init and Refresh as a small stack (Priority: P2)

As a maintainer, I want Refresh to target its corresponding Init branch so the
Refresh PR shows only later knowledge changes while neither PR is merged.

**Why this priority**: It makes benchmark and early knowledge review legible
without flattening Init and Refresh into one large diff.

**Independent Test**: Publish one accepted Init followed by two accepted
Refresh proposals for the same Repository and assert exact branch/base/head
identity for all three fake GitHub PRs.

**Acceptance Scenarios**:

1. **Given** a selected chain of Init then Refresh for one Repository, **When**
   MCP publishes it, **Then** Init targets `main` and Refresh targets the Init
   branch at its exact commit.
2. **Given** more than one consecutive Refresh, **When** the stack is published,
   **Then** each Refresh targets the immediately preceding proposal branch.
3. **Given** mixed repositories, missing mode metadata, changed base branch or
   conflicting remote branch identity, **When** publication evaluates stacking,
   **Then** it either uses the ordinary batch path or stops safely; it never
   silently retargets a Refresh.

### Edge Cases

- An older pending commit has no publication-mode trailer.
- A deterministic publication branch already exists at the expected commit.
- One matching PR already exists after an interrupted retry.
- More than one open PR exists for the same head/base pair.
- Init PR creation succeeds but a later Refresh PR call fails.
- Proposal-local inspection metadata was removed after acceptance.
- Questions or changed-path lists exceed the PR presentation bound.
- A token, local absolute path or credential-like value appears in an error or
  optional local metadata field.

## Requirements

### Functional Requirements

- **AB-PUBLISH-001**: The existing MCP publication action MUST remain the only
  public path that pushes accepted Hub knowledge and creates GitHub PRs.
- **AB-PUBLISH-002**: Every newly created publication PR MUST contain bounded
  Purpose, Scope, Knowledge Changes, Uncertainty, Evidence and Validation, and
  Reviewer Action sections derived from exact accepted metadata.
- **AB-PUBLISH-003**: Scope MUST identify proposal IDs, source Repository IDs,
  subjects, available Domains and source revisions without inventing missing
  values. Evidence MUST include exact accepted commits, evidence digests and
  schema catalog versions.
- **AB-PUBLISH-004**: Knowledge Changes MUST distinguish Added, Updated,
  Removed and Superseded/Retracted entries. Uncertainty MUST expose retained
  Questions, limitations and unavailable-detail notices.
- **AB-PUBLISH-005**: PR title/body and publication receipts MUST NOT contain a
  token, credential, local absolute path or unbounded authored/model narrative.
- **AB-PUBLISH-006**: A selected contiguous chain whose first proposal is Init
  and remaining proposals are Refresh for the same Repository MUST publish one
  exact branch per proposal. Init targets configured `main`; each Refresh
  targets the immediately preceding proposal branch.
- **AB-PUBLISH-007**: A selection that is not an eligible Init/Refresh chain
  MUST preserve the existing one-branch, one-PR batch behavior against `main`.
  First bootstrap MUST also preserve its one-PR batch contract. This feature
  MUST NOT independently rebase unrelated Init proposals.
- **AB-PUBLISH-008**: Before creating each PR, MCP MUST verify repository,
  target/base branch, head branch and exact commit identity. Conflicting refs,
  multiple matching PRs or base drift MUST fail without force-push, merge,
  deletion or target mutation.
- **AB-PUBLISH-009**: Retry MUST recover exact existing branches and matching
  open PRs. A partial stack failure MUST retain already-created branches/PRs
  and return enough bounded receipt information to retry safely.
- **AB-PUBLISH-010**: Canonical verification MUST use disposable Git and fake
  GitHub HTTP. Real credentials, pushes and PR creation remain explicit opt-in.

### Key Entities

- **Publication Selection**: One dependency-safe prefix of accepted local
  proposal commits selected by exact proposal IDs.
- **Review Summary**: Bounded deterministic PR title/body derived from accepted
  proposal, inspection and Git metadata.
- **Publication Unit**: One remote head branch, exact head commit, base branch
  and PR receipt. A batch has one unit; an eligible stack has one per proposal.
- **Stack**: One Init publication unit followed by same-Repository Refresh units.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of newly created fake-GitHub publication PRs contain all six
  required review sections and exact proposal/commit identities.
- **SC-002**: 100% of eligible deterministic Init/Refresh scenarios produce the
  expected base/head chain; zero Refresh PRs silently target `main`.
- **SC-003**: 100% of conflict, drift and interrupted-retry scenarios preserve
  remote `main` and never force-push, merge or delete a branch.
- **SC-004**: Canonical offline verification detects any token/local-path leak
  or PR identity mismatch without making a real network call.

## Assumptions

- Local proposals have already passed Inspect and Accept; publication does not
  reinterpret or modify their knowledge.
- New accepted commits can record publication mode in their immutable trailers.
  Older commits without it remain publishable through batch mode.
- Exact proposal directories normally remain available locally for richer
  summaries; Git metadata is the safe compatibility fallback.
- Independent Init rebasing, cross-batch dependency graphs, PR merge/close
  management and post-merge branch cleanup remain out of scope.
