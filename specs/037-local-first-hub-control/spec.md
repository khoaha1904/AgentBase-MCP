# Feature Specification: Local-first Hub Control

**Feature Branch**: `037-local-first-hub-control`

**Created**: 2026-08-23

**Status**: Approved

**Input**: Make every released MVP journey reliable around a local-first,
remote-optional Hub with isolated profiles, compact status, explicit sync and
GitHub.com/GitHub Enterprise connectivity.

## User Scenarios & Testing

### User Story 1 - Work locally without a remote Hub (Priority: P1)

As a newly installed user, I can use Code Graph without Hub state and create,
accept and query OKF locally without choosing or contacting a remote Hub.

**Independent Test**: In an isolated home with no token or configuration, run
Code Graph, then perform the first OKF authoring lifecycle and restart.

**Acceptance Scenarios**:

1. Given a fresh install, Code Graph and status create no Hub and make no
   network call.
2. Given the first OKF authoring mutation, one local-only Hub is created and the
   proposal can be reviewed, accepted, queried and reopened after restart.

### User Story 2 - Connect and switch isolated Hub profiles (Priority: P1)

As a user, I can connect a GitHub.com or GitHub Enterprise repository and exact
branch using separately stored credentials, then later activate a different
Hub without mixing their local knowledge.

**Independent Test**: Connect two fake-host repositories/branches, create a
draft in one, switch twice and prove each profile retains only its own state.

**Acceptance Scenarios**:

1. A valid URL, branch and matching credential stages/clones the exact target
   and activates it atomically.
2. Switching profiles preserves the inactive checkout and drafts; no concept or
   commit crosses identities.
3. Missing/invalid credentials, branch or repository leave the prior profile
   active and reveal no secret.

### User Story 3 - Understand status and synchronize safely (Priority: P1)

As a user, I can see a short local/remote status and explicitly pull Published
updates without losing remaining Local Drafts.

**Independent Test**: Advance a remote with merged and unrelated changes,
exercise success/conflict/recovery, and inspect status throughout.

**Acceptance Scenarios**:

1. Status reports the active Hub, target branch, local drafts, remote update
   state, open PR count, credential and recovery state.
2. A local parsing, network or permission failure degrades only its own status
   section and never mutates state.
3. Successful sync recognizes merged proposals and keeps remaining drafts;
   conflict preserves the prior Published base and active local tree.

### User Story 4 - Complete released MVP journeys (Priority: P2)

As the product owner, I can run every advertised journey sequentially against
the corrected lifecycle and distinguish real, captured-provider and deferred
qualification.

**Independent Test**: Execute the release quickstart from local-only through
remote publication/query/Refresh/Questions, then Batch, captured Enrichment and
support CI.

### Edge Cases

- Active profile has a valid local tree but pending inventory is malformed.
- Remote is unreachable, credential is absent/denied, or open-PR listing fails.
- Remote advances after status but before explicit synchronization.
- A sync fetch succeeds and replay conflicts.
- The same repository uses two target branches or two GitHub hosts use the same
  owner/repository path.
- A prior single-profile installation is migrated with unfinished drafts and a
  failed synchronization transaction.

## Requirements

### Functional Requirements

- **FR-001**: Installation and Code Graph MUST remain Hub-independent; the first
  authoring mutation MUST lazily establish local-only knowledge.
- **FR-002**: Every remote Hub MUST have a stable identity from normalized host,
  repository and branch, with isolated reusable local and credential state.
- **FR-003**: Exactly one profile MUST be active; activation MUST NOT copy or
  merge knowledge and MUST preserve the previous profile on failure.
- **FR-004**: Credentials MUST be entered outside model/tool arguments, bound to
  one Hub identity, permission-checked and never exposed in output or Git URLs.
- **FR-005**: GitHub.com and standard GitHub Enterprise HTTPS repositories MUST
  use their matching Git, API and pull-request origins.
- **FR-006**: All remote workflows MUST target the configured branch while local
  accepted ancestry MAY retain one internal branch name.
- **FR-007**: Status MUST preserve useful local output under partial failure and
  MUST perform no state mutation.
- **FR-008**: Status MUST distinguish the last successfully admitted Published
  state from current remote state and report bounded PR/recovery context.
- **FR-009**: Synchronization MUST require explicit intent, recognize merged
  proposals, preserve remaining drafts and atomically admit a validated result.
- **FR-010**: Fetch, conflict and failed recovery MUST NOT advance the admitted
  Published boundary or delete/reset local knowledge.
- **FR-011**: Existing single-profile state MUST migrate without losing its
  active checkout, drafts, credential or recovery evidence.
- **FR-012**: One packaged Hub control skill MUST guide profile setup, compact
  status and explicit synchronization without adding a daemon or hidden pull.
- **FR-013**: Released MVP qualification MUST cover local-only, connection,
  status, Init, Accept, publication, merge/sync/query, Refresh, Questions, Batch,
  captured provider Enrichment and Hub support CI sequentially.

### Key Entities

- **Hub profile**: One host/repository/branch identity, local checkout,
  credential reference and activation state.
- **Published boundary**: Last remote commit fully admitted into the active
  local lifecycle.
- **Remote candidate**: Latest observed target-branch commit, never authority
  until synchronization succeeds.
- **Local Draft chain**: Accepted unpublished proposals above one Published
  boundary inside exactly one profile.
- **Hub status**: Partial-result view of local, credential, remote, PR and
  synchronization/recovery health.

## Success Criteria

- **SC-001**: Fresh local-only authoring completes with zero remote calls and
  remains queryable after restart.
- **SC-002**: Switching between two profiles twice yields zero cross-profile
  files, commits or credentials.
- **SC-003**: Every tested status failure still returns the active identity and
  a specific degraded section instead of failing the whole request.
- **SC-004**: A merge followed by sync removes the merged proposal from Local
  Draft inventory while preserving its knowledge as Published and retaining
  every unrelated draft.
- **SC-005**: The existing production conflict is recoverable without deleting
  or resetting any Local Draft.
- **SC-006**: GitHub.com and Enterprise-shaped fixtures complete equivalent
  branch, API and PR identity checks with no secret in output.
- **SC-007**: The canonical offline gate remains 50/50, and release evidence
  explicitly labels each real, captured-provider or deferred external journey.

## Assumptions

- Enterprise uses standard GitHub Enterprise Server HTTPS and REST `/api/v3`.
- Custom certificate trust is provided by the operating environment; AgentBase
  never disables TLS verification.
- Only one profile is queried/authored at once; simultaneous multi-Hub search
  and cross-Hub merge are outside this MVP.
- Remote checks and synchronization occur only on explicit status/sync flows;
  there is no daily timer or hidden first-command pull.
