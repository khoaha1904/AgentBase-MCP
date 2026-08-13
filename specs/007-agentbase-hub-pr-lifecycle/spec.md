# Feature Specification: AgentBase Hub PR Lifecycle

**Feature Branch**: `main`

**Created**: 2026-08-12

**Status**: Approved for planning; implementation requires preview approval

**Input**: Explicit `new`/`refresh` Google OKF proposals against a configured private AgentBase Hub, followed by separately authorized branch push and pull-request creation through an MCP-owned GitHub token.

## Owner Decisions

- AgentBase Hub is one explicitly configured GitHub `owner/repository` plus target branch; commands never accept an arbitrary Hub URL.
- MCP owns a dedicated token restricted to Contents and Pull requests on that Hub only, without merge, administration or settings authority.
- `prepare` may authenticate only to clone/fetch the private Hub and create a local proposal. It never pushes or opens a PR.
- `submit` is a separate explicit action that pushes the exact reviewed proposal branch and opens one PR; it never merges.
- Every proposal binds the exact Hub base commit. Base drift stops submission and requires a new refresh/review.
- If push succeeds but PR creation fails, retry opens the PR for the same branch and commit. It does not force-push, amend or create another commit.
- "Create OKF" is one coding-agent action, not one self-authoring MCP call. The agent orchestrates MCP primitives to prepare a private workspace, authors Markdown from Codebase Memory observations using selected schemas, finalizes and inspects the immutable proposal, then explicitly submits it. MCP contains no model SDK and does not infer prose from the private graph.

## User Scenarios & Testing

### User Story 1 - Prepare and review a new Hub proposal (Priority: P1)

The user explicitly requests `new` for a source repository. AgentBase refreshes a private local Hub checkout and opens an owned authoring workspace. The coding agent creates sparse multi-file Google OKF using evidence-relevant schemas, then finalizes and displays the exact diff without publishing it.

**Why this priority**: This produces the first safely reviewable Hub change while keeping remote mutation outside preparation.

**Independent Test**: Against disposable local Git remotes, prepare a new repository bundle and prove the base commit, evidence, schema selection and proposed bytes are locked while the remote remains unchanged.

**Acceptance Scenarios**:

1. **Given** a configured Hub and an absent repository subject, **When** the user explicitly prepares `new`, **Then** AgentBase opens private local proposal state and the coding agent creates only evidence-relevant OKF concepts and necessary indexes before finalize.
2. **Given** the subject already exists, **When** `new` is requested, **Then** preparation fails visibly and recommends `refresh` without changing local accepted or remote Hub state.
3. **Given** preparation completes, **When** the user inspects it, **Then** the tree/content diff, exact Hub base commit, source evidence digest, schema catalog version and proposal digest are available.

---

### User Story 2 - Prepare a non-destructive refresh (Priority: P2)

The user explicitly requests `refresh`. AgentBase reads current Hub knowledge plus new evidence and prepares an incremental proposal that preserves reviewed or ambiguously owned knowledge.

**Why this priority**: Refresh makes Hub knowledge cumulative rather than a destructive latest-scan export.

**Independent Test**: Refresh a disposable bundle containing reviewed, unknown-extension and AgentBase-draft concepts; prove protected bytes survive and every permitted modification, deletion, conflict or supersession is explicit in the diff.

**Acceptance Scenarios**:

1. **Given** an existing Hub subject, **When** refresh runs, **Then** accepted state and new evidence are both provided to authoring and prior generated prose is not treated as independent evidence.
2. **Given** reviewed or ambiguously owned knowledge, **When** a refresh omits or contradicts it, **Then** AgentBase preserves it or proposes a visible conflict/supersession instead of silently overwriting or deleting it.
3. **Given** an absent subject, **When** `refresh` is requested, **Then** preparation fails visibly and recommends `new`.

---

### User Story 3 - Submit exactly the reviewed proposal as a PR (Priority: P3)

After reviewing a prepared proposal, the user explicitly submits its ID. AgentBase validates the locked state, creates one deterministic proposal commit, pushes one branch and opens one PR against the configured target.

**Why this priority**: It is the credentialed publishing boundary and must not be implicit in preparation.

**Independent Test**: Use a disposable Git remote and fake GitHub API to prove exact commit/branch/PR behavior, drift rejection, token redaction and idempotent retry after a simulated PR failure.

**Acceptance Scenarios**:

1. **Given** an unchanged reviewed proposal and unchanged Hub base, **When** the user submits it, **Then** exactly its locked bytes are committed, pushed to a non-target branch and included in one PR.
2. **Given** Hub target drift, proposal-byte drift, wrong remote identity or existing conflicting branch state, **When** submit runs, **Then** it fails before unsafe publication and identifies the required recovery.
3. **Given** push succeeds and PR creation fails, **When** the same proposal is retried, **Then** AgentBase verifies the exact remote branch commit and creates the missing PR without rewriting history.
4. **Given** an existing PR for the exact branch and commit, **When** submit is retried, **Then** AgentBase returns that PR and performs no duplicate push or PR creation.

### Edge Cases

- Missing, malformed or over-broad Hub configuration fails before token use.
- A token, authenticated URL, authorization header or credential helper output never enters logs, errors, proposal files, Git config or process arguments.
- Local checkout symlinks, unexpected remotes, dirty accepted worktrees, submodules and hooks fail closed.
- Target branch is never checked out for authored mutation, force-pushed, deleted or merged.
- Concurrent proposals use separate owned worktrees/branches and cannot replace each other's manifests.
- Cancellation or process failure leaves enough non-secret phase state for deterministic retry or cleanup.
- A PR response that names another repository, branch or commit is rejected.

## Requirements

### Functional Requirements

- **FR-001 / AB-HUB-001**: Hub identity MUST be fixed by MCP configuration as one GitHub repository and target branch; user commands MUST NOT accept a remote URL override.
- **FR-002 / AB-HUB-002**: The dedicated Hub token MUST remain memory-only, scoped to the configured Hub, excluded from arguments/logs/files/Git config, and used only for authenticated Hub Git or PR requests.
- **FR-003 / AB-HUB-003**: The coding-agent `Create OKF` action MUST explicitly orchestrate `prepare -> author -> finalize -> inspect -> submit`; prepare/finalize MUST NOT push, create a PR, merge or mutate remote Hub state.
- **FR-004 / AB-HUB-004**: Preparation MUST use an AgentBase-owned private local clone/worktree, disable repository hooks and submodules, verify the exact remote identity and resolve the target to an exact base commit.
- **FR-005 / AB-HUB-005**: A proposal MUST bind mode, Hub identity, target branch/base commit, source identity/evidence digest, schema catalog version, selected schemas, complete proposed tree digest and visible diff.
- **FR-006 / AB-HUB-006**: `new` MUST require an absent repository subject and create only evidence-relevant concepts plus necessary indexes.
- **FR-007 / AB-HUB-007**: `refresh` MUST require an existing subject, preserve protected/unknown content, and expose modifications, permitted deletions, conflicts and supersessions explicitly.
- **FR-008 / AB-HUB-008**: OKF output MUST pass Google OKF v0.2, AgentBase draft, selected schema, link and protected-content validation before it can become submittable.
- **FR-009 / AB-HUB-009**: `submit <proposal-id>` MUST be a separate explicit action and MUST revalidate proposal bytes, Hub identity, exact target base and publication state before mutation.
- **FR-010 / AB-HUB-010**: Submission MUST create one deterministic non-target branch and commit containing exactly the reviewed proposal diff, push without force and open one PR against the configured target.
- **FR-011 / AB-HUB-011**: AgentBase MUST NOT merge, approve, close or edit unrelated PRs; write target/default branches; change settings; or delete remote branches.
- **FR-012 / AB-HUB-012**: Push-success/PR-failure MUST persist a non-secret recoverable phase and retry only the exact branch/commit; mismatches fail closed.
- **FR-013 / AB-HUB-013**: Exact existing branch/commit/PR retries MUST be idempotent; duplicate or conflicting state MUST not create another proposal identity silently.
- **FR-014 / AB-HUB-014**: Every failure or cancellation MUST preserve accepted Hub bytes and return no false successful PR receipt.
- **FR-015 / AB-HUB-015**: Canonical verification MUST be offline with fake Git/GitHub boundaries; real private-Hub qualification requires separate explicit owner authorization.

### Key Entities

- **Hub Configuration**: Fixed repository owner/name, canonical HTTPS identity, target branch and token capability boundary.
- **Hub Checkout**: AgentBase-owned private clone plus isolated proposal worktrees; rebuildable local state, not knowledge authority.
- **Hub Proposal**: Immutable reviewed intent binding `new|refresh`, exact base/evidence/schema/tree identities and publication phase.
- **Publication Receipt**: Exact branch, commit, PR number/URL, Hub identity and target branch; never contains credentials.

## Success Criteria

- **SC-001**: Preparation scenarios make zero remote writes while producing one complete inspectable proposal and diff.
- **SC-002**: New/refresh acceptance covers created, modified, preserved, conflict/supersession and prohibited deletion behavior without protected-byte loss.
- **SC-003**: Submission tests prove one branch, one exact commit and one PR, with zero target-branch writes and zero merge calls.
- **SC-004**: Token canaries are absent from all captured arguments, environment diagnostics, Git config, files, errors and receipts.
- **SC-005**: Exact retry after simulated push-success/PR-failure produces one PR and no history rewrite; every mismatch fails closed.
- **SC-006**: Full offline verification passes with no new architecture exception or dependency.

## Assumptions

- Git is already available on the deployment host; no daemon or package installation is added.
- GitHub HTTPS and REST are the first supported remote/API pair.
- The MCP process receives the dedicated token and fixed Hub configuration from its operator; AgentBase does not mint or persist credentials.
- Human PR review and merge happen outside AgentBase.
- Real Hub qualification is deferred until the owner explicitly supplies a disposable test repository or authorizes the configured Hub.

## Explicit Non-Goals

- Creating/configuring the GitHub repository, token or branch protection.
- GitHub App installation, OAuth or credential rotation UX.
- Automatic/scheduled OKF generation or submission.
- Direct writes or merges to the target branch.
- Hub-wide reconciliation, cloud enrichment or cross-repository inference beyond storing valid concepts proposed by the authoring agent.
- Supporting non-GitHub remotes in this capability.
