# Living Requirements: AgentBase-Hub

- **Status:** Active; Capability 009 makes Hub configuration lazy and preserves Capability 008's local-first lifecycle
- **Established by:** Capabilities `008-local-hub-product-correction` and `009-lazy-hub-bootstrap`
- **Last updated:** 2026-08-13

Creating or refreshing OKF is an explicit user action. Code indexing, graph
queries and ordinary coding never create Hub commits or remote publications as
side effects.

## Local active knowledge

### AB-LOCAL-HUB-001 — At most one admitted persistent Hub

AgentBase-MCP may have no Hub, one private local-only Hub, or one private clone
of an attached AgentBase-Hub. When present, local `main` is the active knowledge
tree used for Hub queries. A remote identity becomes fixed only after attach or
first bootstrap; switching is a separate future action.

### AB-LOCAL-HUB-002 — Prepare and accept are separate

`prepare` creates a private proposal workspace from an exact local active
commit and makes no Hub commit or remote write. After authoring, validation and
inspection, `accept` commits the exact reviewed tree once to local Hub `main`.
Acceptance performs no fetch, push or GitHub API request.

A `refresh` may remove an entire subject only when the authored workspace
deletes that subject, every non-index file in it is a mutable AgentBase draft,
and the root index changes solely by removing the exact link to that subject.
Reserved indexes and reviewed or externally owned knowledge remain protected
in every other case.

### AB-LOCAL-HUB-003 — Stable proposal commits

Every accepted commit records stable proposal ID, mode, subject, source and
evidence identity, parent/base, selected catalog version and types, tree and
visible-diff digests, and creation time. Proposal trailers and atomic external
state make interrupted acceptance recoverable without recreating prose.

### AB-LOCAL-HUB-004 — Query accepted bytes only

Bounded Hub search and exact-path reads use the admitted local `main` tree.
They include accepted commits that have not been published remotely and exclude
unaccepted workspace bytes. Results identify the local commit and concept path.

### AB-LOCAL-HUB-005 — Pending state derives from ancestry

Pending proposals are the ordered first-parent proposal commits after the exact
local Hub base or last admitted remote-main base. Listing exposes proposal ID, subject, source,
parent, commit, bounded diff summary and publication state. Metadata sidecars
cannot invent a pending commit absent from Git ancestry.

## Publication and synchronization

### AB-LOCAL-HUB-006 — Publish one safe pending prefix

The initial multi-proposal submit accepts a non-empty contiguous prefix of the
ordered pending set. It publishes the already accepted commits on one
deterministic non-target branch and opens or recovers exactly one PR against
remote `main`. It never makes local knowledge contingent on publication.

### AB-LOCAL-HUB-007 — Remote authority is intentionally narrow

Only explicit attach, first bootstrap, publication and synchronization may use
the one global Hub token. First bootstrap may create remote `main` in an empty
user-created repository under an explicitly reviewed mode. Normal operation
never writes remote `main`, merges or approves a PR, force-pushes, deletes
branches, changes repository settings or accepts a target override.

### AB-LOCAL-HUB-008 — Transactional synchronization

Synchronization fetches exact remote `main`, recognizes published proposal
identity by admitted ancestry, trailers or exact patch/tree equivalence, then
rebases remaining pending commits in an isolated candidate worktree. The
original local ref advances only after validation. Conflict or interruption
preserves the original ref, candidate state and deterministic recovery data.

### AB-LOCAL-HUB-009 — Fail closed before mutation

Accept, publish, synchronize and recovery reject wrong remote/ref identity,
unsafe or symlinked control paths, unadmitted dirty Hub state, ambiguous
ancestry, stale reviewed bytes and conflicting transaction ownership before
mutating refs or the active tree.

### AB-LOCAL-HUB-010 — Offline lifecycle proof

Canonical verification uses disposable local Git repositories and fake GitHub
HTTP. It proves acceptance, pending query, multi-proposal publication,
synchronization, conflict and interruption recovery without mutating a real
GitHub repository.

### AB-LOCAL-HUB-011 — One serialized owner

All local Hub accept, publication, synchronization and recovery mutations use
one atomic owner lock. Concurrent mutation and manually dirty state fail
visibly; cancellation never silently resets or drops a proposal commit.

## Query responsibility

### AB-QUERY-001 — Graph and Hub are complementary

Code structure, symbols, callers and exact source questions primarily use the
current repository's Code Graph. Business, domain, system and cross-repository
questions primarily use local AgentBase-Hub. An agent may combine both when it
keeps source paths, Hub concept paths and limitations visible.

## Lazy setup and first bootstrap

### AB-HUB-SETUP-001 — Hub is optional at install and for Code Graph

Installation stores only the optional global GitHub token. Code Graph indexing and queries require no Hub URL, local root or remote identity and create no Hub state.

### AB-HUB-SETUP-002 — Three explicit Hub states

Hub status is exactly `unconfigured`, `local-only` or `remote`, resolved from owner-private global configuration rather than the caller's current directory.

### AB-HUB-SETUP-003 — Setup begins only on a Hub-dependent action

An unconfigured OKF action performs no proposal or Git mutation and returns the two choices: attach an existing Hub or create a new local-only Hub.

### AB-HUB-SETUP-004 — Existing Hub attach is exact and staged

Attach accepts one credential-free GitHub HTTPS repository URL, clones `main` into owned staging, validates clean conformant Hub content and exact base/head, then atomically admits the local clone and global configuration.

### AB-HUB-SETUP-005 — Setup failure preserves absence

Failed or interrupted setup leaves no active configuration or partial admitted checkout. An active Hub is never silently replaced.

### AB-HUB-SETUP-006 — New Hub starts locally

Creating a Hub makes no network request. It creates one private Git repository on local `main` whose base commit contains explanatory `README.md` and OKF v0.2 root `index.md`.

### AB-HUB-SETUP-007 — Base and knowledge identities are distinct

The base commit has explicit Hub identity. Every accepted knowledge commit has proposal trailers, and pending ancestry rejects any unclassified commit above the exact base.

### AB-HUB-SETUP-008 — Full local OKF lifecycle needs no remote

Prepare, finalize, inspect, accept, query and pending inventory work against a local-only Hub without a fake GitHub repository or origin.

### AB-HUB-SETUP-009 — MCP never creates the GitHub repository

For first publication, the user creates and supplies an exact empty GitHub repository. Any existing ref rejects bootstrap before mutation and must be handled as an existing Hub or replaced by another empty repository.

### AB-HUB-SETUP-010 — Bootstrap mode is always explicit

Preview reports exact base, active head and ordered knowledge commits. Execute requires `all-to-main` or `base-to-main-knowledge-pr`; the latter is recommended by product guidance but is never silently selected.

### AB-HUB-SETUP-011 — Publish-all bootstrap

`all-to-main` creates remote `main` at the exact local active head once and opens no pull request.

### AB-HUB-SETUP-012 — Base-only plus one knowledge PR

`base-to-main-knowledge-pr` creates remote `main` at the exact base and publishes all current contiguous knowledge commits on one deterministic branch and one PR. With no knowledge, it creates only base `main` and no PR.

### AB-HUB-SETUP-013 — Bootstrap is checkpointed and retryable

Non-secret intent and phase receipts bind repository, mode, base, head and knowledge commits. A retry after main, branch or PR failure reuses the exact state and never pushes a changed `main` again.

### AB-HUB-SETUP-014 — Normal remote lifecycle resumes after bootstrap

After remote `main` is fetched and admitted, configuration atomically becomes `remote`; later knowledge uses the ordinary PR publication and synchronization workflow.

### AB-HUB-SETUP-015 — One secret, outside every public contract

The one global token never enters tool arguments, Git URLs, repositories, configuration, receipts or error output. Missing read/Contents/Pull-request access preserves local work and asks the user to update that token, then retry.

### AB-HUB-SETUP-016 — Private atomic control state

Hub configuration and bootstrap receipts are owner-private, non-symlink and atomic. Setup/bootstrap share the serialized Hub mutation boundary and reject malformed or ambiguous state before unauthorized ref mutation.

### AB-HUB-SETUP-017 — Offline canonical proof

Verification covers no-Hub graph use, both setup choices, local-only OKF, both bootstrap modes, empty-remote races, permission failure and checkpoint recovery using disposable Git and fake GitHub only.
