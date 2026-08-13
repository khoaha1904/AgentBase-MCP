# Living Requirements: AgentBase-Hub

- **Status:** Active; supersedes Capability 007's submit-from-temporary-workspace lifecycle
- **Established by:** Capability `008-local-hub-product-correction`
- **Last updated:** 2026-08-12

Creating or refreshing OKF is an explicit user action. Code indexing, graph
queries and ordinary coding never create Hub commits or remote publications as
side effects.

## Local active knowledge

### AB-LOCAL-HUB-001 — One admitted persistent clone

AgentBase-MCP owns one explicitly configured private local AgentBase-Hub clone.
Its remote identity and remote `main` are fixed by operator configuration. Its
local `main` is the active knowledge tree used for Hub queries.

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

Pending proposals are the ordered first-parent proposal commits after the last
admitted remote-main base. Listing exposes proposal ID, subject, source,
parent, commit, bounded diff summary and publication state. Metadata sidecars
cannot invent a pending commit absent from Git ancestry.

## Publication and synchronization

### AB-LOCAL-HUB-006 — Publish one safe pending prefix

The initial multi-proposal submit accepts a non-empty contiguous prefix of the
ordered pending set. It publishes the already accepted commits on one
deterministic non-target branch and opens or recovers exactly one PR against
remote `main`. It never makes local knowledge contingent on publication.

### AB-LOCAL-HUB-007 — Remote authority is intentionally narrow

Only explicit publication and synchronization may use the dedicated Hub token.
AgentBase-MCP never writes remote `main`, merges or approves a PR, force-pushes,
deletes branches, changes repository settings or accepts a target override from
a tool call.

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
