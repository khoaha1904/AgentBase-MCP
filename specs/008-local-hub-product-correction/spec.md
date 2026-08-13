# Feature Specification: Local-First AgentBase Product Correction

**Feature Branch**: `008-local-hub-product-correction`

**Created**: 2026-08-12

**Status**: Approved — implementation in progress

**Input**: Correct the product definition and both repositories around the official names `AgentBase-MCP` and `AgentBase-Hub`; make the local Hub the immediately queryable knowledge store, accept proposals as local commits, select concrete OKF schemas from graph and related evidence, batch pending commits into a remote PR, and synchronize safely after merge.

## Owner decisions treated as settled

- The official application name is `AgentBase-MCP`.
- The official OKF repository name is `AgentBase-Hub`.
- `agentbase-next` is a temporary development repository name, not a product or automatic OKF subject.
- AgentBase-Hub stores OKF data only; AgentBase-MCP owns graph, schemas, authoring, queries and synchronization.
- A reviewed proposal is accepted as a commit on local Hub `main` and becomes queryable immediately.
- Several accepted local proposals may accumulate before selected proposals are published in one remote pull request.
- Remote publication never writes directly to remote `main` and never merges a PR.
- After remote merge, local synchronization fetches and safely rebases remaining pending proposals.
- The schema catalog contains concrete OKF concept types such as Lambda, SQS and Server where evidence supports them; schemas are not one-per-repository checklists.

## User Scenarios & Testing

### User Story 1 - Accept and query local OKF (Priority: P1)

While working in a source repository, a user asks the coding agent to build OKF. The agent investigates the Code Graph and related authorized evidence, selects relevant schemas, shows a proposal, and accepts the reviewed result as one commit on local AgentBase-Hub `main`. Business and system queries immediately see that knowledge without a remote push or PR.

**Why this priority**: This is the core local product value and corrects the current temporary-workspace lifecycle.

**Independent Test**: Start from a local Hub synchronized to a remote base, create one reviewed proposal from a fixture repository, accept it locally with network publication disabled, and query a concept that exists only in the pending commit.

**Acceptance Scenarios**:

1. **Given** a source repository with a current graph and an initialized local Hub, **When** the user prepares and accepts a valid OKF proposal, **Then** exactly one identifiable commit is added to local Hub `main` and no remote ref or PR changes.
2. **Given** an accepted but unpublished local proposal, **When** the user asks a business or system question covered by it, **Then** AgentBase-MCP queries the local Hub view and returns the pending knowledge with provenance.
3. **Given** a proposal that has not been accepted, **When** the user queries the Hub, **Then** unaccepted workspace bytes are not treated as active knowledge.

---

### User Story 2 - Author concrete evidence-selected concepts (Priority: P2)

The coding agent uses AgentBase-MCP's OKF concept schema catalog to decide which concrete knowledge types fit observed evidence. A repository may produce several Lambda concepts, queues or flows, while irrelevant schemas produce no files.

**Why this priority**: Useful shared knowledge requires schemas that guide investigation and preserve domain meaning rather than a generic repository summary.

**Independent Test**: Provide fixture evidence containing a server, two Lambdas and one SQS relationship; verify the agent can select only the applicable catalog schemas, author multiple conformant concepts, and expose unsupported or missing evidence as limitations instead of fabricated claims.

**Acceptance Scenarios**:

1. **Given** evidence identifying AWS Lambda and SQS resources, **When** schemas are selected, **Then** concrete Lambda and SQS schemas are available and generic infrastructure is not the only representation.
2. **Given** one selected schema with several observed instances, **When** OKF is authored, **Then** it may produce several canonical concept files from that schema.
3. **Given** a catalog schema with no supporting evidence, **When** OKF is authored, **Then** no empty concept or directory is created for it.
4. **Given** a valid unknown Google OKF type already in the Hub, **When** a proposal is refreshed, **Then** it remains readable and protected according to ownership rules.

---

### User Story 3 - Publish selected pending proposals (Priority: P3)

After accumulating local Hub proposals from several repositories, the user lists pending commits, selects one or more, and submits them together. AgentBase-MCP pushes one publication branch and opens one PR into remote Hub `main` without changing local knowledge visibility.

**Why this priority**: Remote publication is the collaboration boundary, but local knowledge remains useful without it.

**Independent Test**: Accumulate four ordered local proposals, submit a selected contiguous set through a disposable remote and fake PR API, and verify one branch/PR contains the exact selected commits while unselected commits remain pending locally.

**Acceptance Scenarios**:

1. **Given** several pending local proposal commits, **When** the user lists them, **Then** each has a stable ID, subject, source identity, commit, diff summary and publication state.
2. **Given** selected pending proposals based on the current remote base, **When** the user submits them, **Then** one non-target branch and one PR contain exactly the selected accepted knowledge.
3. **Given** remote drift or a non-contiguous unsafe selection, **When** submit is attempted, **Then** publication stops without dropping or rewriting local commits and explains the required synchronization or selection change.

---

### User Story 4 - Synchronize after collaboration (Priority: P4)

After a publication PR or another contributor's PR is merged, the user synchronizes AgentBase-Hub. AgentBase-MCP updates the remote accepted base, recognizes already-published proposals and rebases remaining pending commits without silent loss.

**Why this priority**: A local-first Git model is incomplete without safe convergence and recovery.

**Independent Test**: Merge selected commits into a disposable remote, add a separate remote change, then synchronize a local Hub that still has pending commits; verify published proposals are recognized, remaining commits are rebased, and conflicts stop with recoverable state.

**Acceptance Scenarios**:

1. **Given** a merged publication PR and no conflict, **When** synchronization runs, **Then** local Hub incorporates remote `main`, recognizes published proposals and preserves remaining pending commits in order.
2. **Given** a content conflict with a pending proposal, **When** synchronization runs, **Then** it stops with exact conflict state and recovery instructions without reset, force push or proposal loss.
3. **Given** an interrupted synchronization, **When** recovery runs, **Then** it resumes or restores the last admitted local/remote state deterministically.

---

### User Story 5 - Use official product repositories (Priority: P5)

The owner and future agents work from clearly named canonical repositories and directories, so temporary names cannot leak into configuration, documentation or generated OKF.

**Why this priority**: Naming confusion caused an incorrect Hub subject and will continue causing errors unless migration is explicit.

**Independent Test**: Resolve the installed application and Hub from their canonical directories, run documentation and configuration checks, and verify no active product path or generated subject defaults to `agentbase-next` or `knowledger-hub`.

**Acceptance Scenarios**:

1. **Given** the existing development and legacy directories, **When** migration is approved and executed, **Then** canonical working directories named `AgentBase-MCP` and `AgentBase-Hub` exist with preserved Git history and verified remotes.
2. **Given** user-owned dirty legacy worktrees, **When** canonical directories are created, **Then** those worktrees are not cleaned, reset, overwritten or deleted.
3. **Given** an explicit source repository name, **When** OKF is created, **Then** the Hub subject uses that admitted source identity and never the MCP application's temporary directory name by accident.

### Edge Cases

- The local Hub is absent, corrupt, on the wrong remote or contains a symlinked control path.
- The local Hub has uncommitted manual edits when a proposal is accepted or synchronization starts.
- A pending proposal depends on an earlier pending proposal that the user does not select for publication.
- Remote `main` already contains equivalent tree changes under different commit IDs.
- A publication PR is closed without merge, partially merged through cherry-pick, or merged after its local state was interrupted.
- Several source repositories use the same display name but different source identities.
- Concrete schema evidence is incomplete, contradictory or belongs to two repositories.
- Canonical target directories already exist or a source worktree contains uncommitted user changes.

## Requirements

### Functional Requirements

- **FR-001 / AB-PRODUCT-001**: Product documentation and active user-facing surfaces MUST use `AgentBase-MCP` for the application and `AgentBase-Hub` for the OKF repository; development or legacy names MUST NOT become default product or subject identities.
- **FR-002 / AB-LOCAL-HUB-001**: AgentBase-MCP MUST maintain one explicitly configured, owner-private local AgentBase-Hub clone whose local `main` represents active queryable knowledge.
- **FR-003 / AB-LOCAL-HUB-002**: Preparing a proposal MUST remain non-mutating; accepting a reviewed proposal MUST commit the exact reviewed OKF tree to local Hub `main` without remote mutation.
- **FR-004 / AB-LOCAL-HUB-003**: Each accepted local proposal MUST retain stable identity, subject, source/evidence identity, parent/base, exact commit, tree/diff digest and publication state.
- **FR-005 / AB-LOCAL-HUB-004**: Hub knowledge queries MUST read the admitted local active tree and include accepted pending commits while excluding unaccepted workspaces.
- **FR-006 / AB-SCHEMA-006**: AgentBase-MCP MUST expose a versioned OKF concept schema catalog distinct from MCP tool schemas and provider-private Code Graph schemas.
- **FR-007 / AB-SCHEMA-007**: The catalog MUST support common lifecycle/provenance rules plus concrete evidence-bearing concept types; the first corrected catalog MUST include at least Repository, Service, Server, API Endpoint, Event, Database Table, Queue, AWS Lambda, AWS SQS Queue, Terraform Module, Business Flow, Cross-Repository Relationship, Open Question and Maintainer Guidance.
- **FR-008 / AB-SCHEMA-008**: Schema selection MUST be sparse and evidence-driven; one schema MAY create multiple concepts, and irrelevant schemas MUST create no placeholder file or directory.
- **FR-009 / AB-SCHEMA-009**: Concrete concepts MUST use the most specific admitted type supported by evidence, preserve provenance and limitations, and MUST NOT fabricate required semantic fields when evidence is absent.
- **FR-010 / AB-LOCAL-HUB-005**: AgentBase-MCP MUST list pending proposal commits with enough identity and diff information for the user to select publication scope.
- **FR-011 / AB-LOCAL-HUB-006**: Submission MUST accept one or more dependency-safe pending proposals, push one non-target publication branch and open one PR against remote Hub `main`; it MUST NOT merge or write directly to remote `main`.
- **FR-012 / AB-LOCAL-HUB-007**: Submission MUST publish existing accepted commits or an identity-preserving composition of them; it MUST NOT regenerate reviewed OKF or make local knowledge contingent on publication success.
- **FR-013 / AB-LOCAL-HUB-008**: Synchronization MUST fetch exact remote state, recognize published proposals, and safely rebase remaining pending commits; conflicts and interruption MUST preserve recoverable state without reset, force push or silent loss.
- **FR-014 / AB-QUERY-001**: AgentBase-MCP MUST route code-structure questions primarily to the current Code Graph and business, domain, system or cross-repository questions primarily to local AgentBase-Hub, with combined use permitted when provenance remains visible.
- **FR-015 / AB-MIGRATION-001**: Migration MUST create canonical `AgentBase-MCP` and `AgentBase-Hub` working directories from admitted source repositories only after exact preflight; it MUST preserve Git history and leave existing dirty legacy/development worktrees untouched.
- **FR-016 / AB-MIGRATION-002**: GitHub repository renames, remote rewrites, deletion of old directories and replacement of installed MCP configuration MUST remain separate owner-approved migration steps with exact rollback points.
- **FR-017 / AB-LOCAL-HUB-009**: All local accept, publish, synchronize and recovery operations MUST reject wrong remote identity, unsafe paths, unadmitted dirty Hub state and ambiguous commit ancestry before mutation.
- **FR-018 / AB-LOCAL-HUB-010**: Canonical offline verification MUST cover local acceptance, pending queries, multi-proposal publication, synchronization, conflicts, interruption recovery, concrete schema selection and naming guards without requiring a real GitHub mutation.
- **FR-019 / AB-LOCAL-HUB-011**: Local Hub accept, publication and synchronization mutations MUST be serialized under one owner lock; concurrent or manually dirty state MUST fail before ref or working-tree mutation.

### Key Entities

- **Local Hub**: The AgentBase-MCP-owned Git clone containing remote accepted base plus pending local proposal commits.
- **Remote Accepted Base**: The exact remote `main` commit last admitted during synchronization.
- **Local Proposal**: A reviewed OKF diff accepted as an immutable commit on local Hub `main`.
- **Pending Proposal Set**: Ordered local proposals not yet recognized as present in remote accepted history.
- **Publication**: One selected dependency-safe group of pending proposals represented by a branch and PR receipt.
- **Schema Catalog**: Versioned AgentBase-MCP authoring definitions for concrete OKF concept types.
- **Source Subject**: Stable admitted repository or domain identity to which evidence and canonical concepts belong.
- **Synchronization Transaction**: Recoverable state transition from one admitted remote/local ancestry to another.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can prepare, review, accept and query one local OKF proposal with zero remote ref or PR changes.
- **SC-002**: Four proposals from at least three source repositories remain individually inspectable, and any dependency-safe selected group can be represented by exactly one publication PR.
- **SC-003**: A no-conflict synchronization preserves 100% of unmerged pending proposal tree changes and order while recognizing all selected proposals already merged remotely.
- **SC-004**: Every simulated conflict or interrupted state retains an exact recovery path with zero silently dropped local commits.
- **SC-005**: A fixture with two Lambdas, one SQS queue and one server produces only applicable concrete concept types, multiple files from repeated types, and zero placeholder concepts for unused schemas.
- **SC-006**: Active documentation, configuration fixtures and generated-subject tests contain zero accidental `agentbase-next` or `knowledger-hub` product identities.
- **SC-007**: The canonical repository gate passes all requirement-linked tests with no unreviewed architecture exception, no metric-driven file fragmentation and no real GitHub dependency.

## Assumptions

- One local Hub clone is owned by one AgentBase-MCP runtime/user profile; multi-process serialization remains required.
- Local proposal commits form an ordered ancestry. Publication selection includes required ancestor proposals or fails visibly rather than silently flattening dependencies.
- Manual Hub edits must be committed through an explicit governed path or moved aside by the user before AgentBase mutation.
- Concrete catalog types will evolve version by version; the first corrected set is a useful software/AWS baseline, not a universal taxonomy.
- Existing `agentbase-next` and dirty `agentbase-hub` directories remain migration sources/references until the owner approves cleanup after canonical repositories are verified.
- Renaming GitHub repositories is desirable for official identity but is an external administrative migration, not implied by approving application code implementation.

## Explicit non-goals

- Automatic remote PR merge, approval or branch deletion.
- Immediate publication after every local proposal.
- Copying raw Codebase Memory graph data into AgentBase-Hub.
- Creating every catalog type or directory for every repository.
- Automatically resolving semantic Git conflicts.
- Deleting old directories or rewriting shared Git history during the initial correction.
