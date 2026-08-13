# Feature Specification: Lazy Hub Configuration and Bootstrap

**Feature Branch**: `009-lazy-hub-bootstrap`

**Created**: 2026-08-13

**Status**: Complete

**Input**: Install only one global GitHub token; keep Code Graph independent of any Hub; ask the user to select an existing Hub or create a local-only Hub only when OKF work first needs one; bootstrap a user-created empty GitHub repository with an explicit choice between publishing all local history to `main` or publishing only the Hub base to `main` and the accumulated knowledge through a pull request.

## Owner Decisions Treated as Settled

- One AgentBase-MCP installation has at most one active Hub configuration.
- Installation stores only the one global GitHub token and does not require or invent a Hub.
- Code Graph indexing and queries never require Hub configuration.
- The first OKF action that needs a Hub exposes two choices: attach an existing AgentBase-Hub or create a new local-only Hub.
- AgentBase-MCP never creates a GitHub repository. The user creates it and supplies its GitHub URL.
- A new local Hub has an identifiable base commit containing only introductory Hub structure and guidance. Accepted OKF proposals remain separately identifiable knowledge commits.
- The first remote publication to an empty user-created repository may write `main` only as an explicit bootstrap operation.
- Bootstrap offers two choices: publish base plus all accumulated knowledge directly, or publish only base to `main` and place the accumulated knowledge on one reviewable pull request. The second choice is recommended but not silently selected.
- One global token is used for all GitHub Hub operations. Insufficient access fails with a request to update that token; token bytes never enter tool arguments, repository configuration, receipts or error text.

## User Scenarios & Testing

### User Story 1 - Work Without a Hub (Priority: P1)

A new user installs AgentBase-MCP and uses local Code Graph features before choosing any shared knowledge repository.

**Why this priority**: Hub setup must not block the primary local code-intelligence value or force an early repository decision.

**Independent Test**: Start with a global token but no Hub configuration, then index and query a repository while Hub status remains unconfigured and no Hub path or remote is created.

**Acceptance Scenarios**:

1. **Given** a fresh installation with no Hub, **When** the user builds or queries Code Graph, **Then** the action succeeds without asking for or creating a Hub.
2. **Given** no Hub configuration, **When** the user asks for Hub status, **Then** the result is `unconfigured` and explains that OKF setup is deferred.
3. **Given** no Hub configuration, **When** the user begins a Hub OKF build, **Then** no proposal is created and the agent receives the two explicit setup choices.

---

### User Story 2 - Attach an Existing Hub When Needed (Priority: P1)

When OKF work first needs a Hub, the user may provide the GitHub URL of an existing AgentBase-Hub and continue against a private local clone.

**Why this priority**: Existing teams must resume shared knowledge without reinstalling MCP or changing Code Graph configuration.

**Independent Test**: From an unconfigured disposable home, attach an admitted existing GitHub Hub, prove exact local clone/configuration, then prepare and query local OKF.

**Acceptance Scenarios**:

1. **Given** no active Hub, **When** the user supplies an admitted existing Hub URL, **Then** MCP clones it to owned local storage, validates its identity/base and persists it as the active Hub.
2. **Given** an invalid host, malformed URL, non-Hub content or inaccessible repository, **When** attach is attempted, **Then** no active configuration is persisted and the failure identifies the corrective action without exposing credentials.
3. **Given** an active Hub, **When** another attach/create is requested, **Then** MCP preserves the current Hub and requires a separate future switch workflow.

---

### User Story 3 - Create and Grow a Local-Only Hub (Priority: P1)

The user may create a new Hub locally, understand its purpose from its base documents and accumulate accepted OKF knowledge before any GitHub repository exists.

**Why this priority**: Durable local knowledge must not depend on remote setup or network access.

**Independent Test**: Create a local-only Hub with no remote, inspect its base commit/documents, accept two knowledge proposals, and query both while no network action occurs.

**Acceptance Scenarios**:

1. **Given** no active Hub, **When** the user creates a new local Hub, **Then** MCP creates one private Git repository on `main` with one identifiable base commit and explanatory `README.md`/OKF root index.
2. **Given** a local-only Hub, **When** proposals are prepared and accepted, **Then** each becomes a separately identifiable knowledge commit above the base and is immediately queryable.
3. **Given** a local-only Hub, **When** publication or synchronization is requested without an attached remote, **Then** no Git mutation occurs and MCP asks for a user-created empty GitHub repository URL.

---

### User Story 4 - Bootstrap a New Remote Deliberately (Priority: P2)

After accumulating local knowledge, the user creates an empty GitHub repository, supplies its URL and chooses how much history becomes initial remote `main`.

**Why this priority**: First publication is the only accepted exception to the normal no-direct-remote-main rule and must preserve the user's intended review boundary.

**Independent Test**: From one base plus two knowledge commits, exercise both bootstrap choices against disposable empty remotes and prove exact refs, commit classification and receipts.

**Acceptance Scenarios**:

1. **Given** base `B0` plus knowledge `K1` and `K2`, **When** the user chooses publish-all, **Then** remote `main` advances exactly to `K2`, no PR is created and all three commits are recorded as bootstrapped.
2. **Given** the same local history, **When** the user chooses base-only-plus-PR, **Then** remote `main` advances exactly to `B0` and one deterministic branch/PR contains exactly `K1` and `K2` in order.
3. **Given** a remote whose `main` or any other ref is already populated, **When** new-Hub bootstrap is attempted, **Then** MCP refuses before push and directs the user to attach it as an existing Hub or supply an empty repository.
4. **Given** base bootstrap succeeds but branch push or PR creation fails, **When** the user retries, **Then** MCP reuses the exact recorded bootstrap/base/branch state without pushing `main` again or losing local knowledge.

---

### User Story 5 - Recover From Missing GitHub Access (Priority: P2)

If the single global token cannot read, push or open a PR on the supplied repository, the user gets a bounded instruction to extend its access and retry.

**Why this priority**: Permission failure is expected when a user attaches a new repository and must not corrupt local work or encourage unsafe token handling.

**Independent Test**: Inject read, contents-write and pull-request permission failures at each remote phase and prove stable local/configuration state plus secret-free retry guidance.

**Acceptance Scenarios**:

1. **Given** insufficient token access, **When** attach or bootstrap reaches the denied operation, **Then** MCP identifies the required repository access category and asks the user to update the one global token.
2. **Given** a permission failure, **When** the token is replaced and the exact action is retried, **Then** the operation resumes from its admitted checkpoint rather than recreating local Hub history.
3. **Given** any error or receipt, **When** output is inspected, **Then** it contains no token bytes, credential path contents or authenticated Git URL.

### Edge Cases

- The configured local root, configuration file, repository content or control path is a symlink.
- Existing-Hub attach is interrupted after clone but before configuration commit.
- New-Hub initialization is interrupted before or after its base commit.
- A supplied URL includes credentials, query/fragment data, a non-GitHub host, extra path segments or an unsupported scheme.
- An empty GitHub repository reports no default branch or returns `404` for `main`.
- The remote gains a ref between empty-state validation and bootstrap push.
- A local-only Hub contains a non-proposal commit above the identified base.
- The user requests base-only-plus-PR when there are zero knowledge commits.
- Base bootstrap succeeds and the process stops before the remote identity is persisted locally.
- An already bootstrapped Hub is mistakenly sent through bootstrap again.
- Existing global Hub configuration has unsafe permissions, unknown fields or points outside owned storage.

## Requirements

### Functional Requirements

- **FR-001 / AB-HUB-SETUP-001**: Installation and Code Graph actions MUST remain fully usable with no Hub repository, local root or remote identity configured.
- **FR-002 / AB-HUB-SETUP-002**: AgentBase-MCP MUST expose Hub status as one of `unconfigured`, `local-only` or `remote`, without deriving configuration from an arbitrary current directory.
- **FR-003 / AB-HUB-SETUP-003**: A Hub-dependent OKF action in `unconfigured` state MUST perform no proposal or Git mutation and MUST return the two setup choices: attach existing or create local.
- **FR-004 / AB-HUB-SETUP-004**: Attaching an existing Hub MUST accept only an exact credential-free GitHub repository URL, clone and validate exact `main` identity/content in owned private storage, then atomically persist it as the one active Hub.
- **FR-005 / AB-HUB-SETUP-005**: Failed or interrupted attach MUST leave no admitted active configuration; an already active Hub MUST never be silently replaced.
- **FR-006 / AB-HUB-SETUP-006**: Creating a local Hub MUST make no network request and MUST create one owner-private Git repository on `main` with an identifiable base commit containing explanatory `README.md` and OKF v0.2 root `index.md` content.
- **FR-007 / AB-HUB-SETUP-007**: Base commit identity MUST be explicit and distinct from accepted knowledge proposal identity; pending knowledge MUST derive only from valid proposal commits above the exact base/admitted remote commit.
- **FR-008 / AB-HUB-SETUP-008**: A local-only Hub MUST support the existing prepare, finalize, inspect, accept, query and pending workflows without a fake remote or repository identity.
- **FR-009 / AB-HUB-SETUP-009**: First publication MUST require an exact user-supplied empty GitHub repository URL; AgentBase-MCP MUST NOT create the GitHub repository or accept a populated remote as a new-Hub bootstrap target.
- **FR-010 / AB-HUB-SETUP-010**: New-Hub bootstrap MUST require one explicit mode: `all-to-main` or `base-to-main-knowledge-pr`; it MUST report the exact base and knowledge commits before mutation.
- **FR-011 / AB-HUB-SETUP-011**: `all-to-main` MUST push the exact local active head to remote `main` once and create no PR; the resulting remote state MUST admit every included proposal as published bootstrap history.
- **FR-012 / AB-HUB-SETUP-012**: `base-to-main-knowledge-pr` MUST push only the exact base to remote `main`, then publish all current contiguous proposal commits through one deterministic non-target branch and one PR; with zero knowledge commits it MUST bootstrap base and report that no PR was needed.
- **FR-013 / AB-HUB-SETUP-013**: Bootstrap MUST persist exact non-secret phase/remote/base/head/branch/PR receipts so interruption or partial failure retries cannot repush a changed `main`, regenerate knowledge or lose local commits.
- **FR-014 / AB-HUB-SETUP-014**: After successful bootstrap, MCP MUST atomically persist the remote Hub identity, establish the admitted remote base appropriate to the selected mode and use the normal publication/synchronization lifecycle thereafter.
- **FR-015 / AB-HUB-SETUP-015**: The single global token MUST remain outside tool arguments, Git URLs, repositories, configuration and receipts; permission failures MUST preserve local/configuration state and direct the user to update token access before retry.
- **FR-016 / AB-HUB-SETUP-016**: Active Hub configuration and bootstrap mutations MUST use owner-private, non-symlink, atomic storage plus the existing serialized Hub mutation boundary; malformed or ambiguous state MUST fail before ref mutation.
- **FR-017 / AB-HUB-SETUP-017**: Canonical verification MUST cover no-Hub graph operation, lazy setup choices, existing attach, local-only OKF, both bootstrap modes, empty-remote races, permission failures and every bootstrap recovery checkpoint without real GitHub mutation.

### Key Entities

- **Active Hub Configuration**: The optional one-per-installation pointer to an admitted local-only or remote Hub, including local root, lifecycle kind, exact base and optional GitHub identity; contains no credential.
- **Hub Base Commit**: The immutable first commit of a newly created Hub, explicitly classified as base and containing only introductory Hub structure/guidance.
- **Knowledge Commit**: An accepted, proposal-identified OKF commit above the Hub base or admitted remote base.
- **Bootstrap Intent**: The reviewed repository URL, mode, exact base, active head and ordered knowledge commits approved for first publication.
- **Bootstrap Receipt**: Atomic non-secret recovery state recording completed phases and exact remote refs/PR identity.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All Code Graph acceptance journeys pass from an installation with zero Hub configuration and create zero Hub files, refs or network calls.
- **SC-002**: An unconfigured user reaches either a queryable existing Hub or a queryable new local Hub through one explicit setup action, with zero partial admitted configuration across every simulated failure.
- **SC-003**: A new local Hub with two accepted proposals remains fully queryable while having zero Git remotes and exactly one base plus two knowledge commits.
- **SC-004**: For both first-publication modes, remote refs and pull-request count match the reviewed base/knowledge split exactly, with zero regenerated or silently omitted commits.
- **SC-005**: Every simulated interruption after base push can retry to the same final refs and at most one PR without a second changed `main` push.
- **SC-006**: Every invalid URL, populated remote, unsafe path and insufficient-permission fixture fails before unauthorized mutation and exposes zero token bytes.
- **SC-007**: The canonical repository gate passes all requirement-linked tests with no real GitHub dependency, unreviewed architecture exception or metric-driven file fragmentation.

## Assumptions

- One active Hub is sufficient for this capability; switching between Hubs is a separate user-visible feature.
- Existing Hub URLs target GitHub repositories with `main` and conformant AgentBase-Hub content.
- New-Hub bootstrap targets a user-created repository with no refs. Repository creation, visibility, collaborators and settings remain user-owned.
- The current one-token credential contract remains authoritative. Permission guidance names required access categories but cannot alter GitHub token permissions.
- The coding agent owns the conversational question; MCP exposes structured state and explicit setup/bootstrap actions rather than attempting interactive terminal input inside a tool call.

## Explicit Non-goals

- Creating, deleting, renaming or changing settings on GitHub repositories.
- Managing multiple simultaneous active Hubs or switching/deleting an active Hub.
- Automatically choosing a bootstrap mode.
- Importing arbitrary Git hosts or credential-bearing URLs.
- Installing/reconfiguring Codex or Claude Code MCP clients in this capability.
- Changing Code Graph storage, indexing, schemas or query behavior.
