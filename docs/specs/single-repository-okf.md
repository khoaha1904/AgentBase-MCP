# Living Requirements: Single-Repository OKF Walking Skeleton

- **Status:** Active
- **Established by:** Capability `002-single-repo-okf-walking-skeleton`
- **Last updated:** 2026-08-12

This is the current contract for one local TypeScript repository. It proves a
small evidence-to-knowledge loop; it does not promise semantic completeness,
interactive graph latency, cloud enrichment or cross-repository reasoning.

## Managed Code Intelligence

### AB-MVP-001 — AgentBase-owned provider

AgentBase owns exact dependency `codebase-memory-mcp@0.10.1`, resolves only its
package-private executable and never requests a user path or searches `PATH`.

### AB-MVP-002 — Admitted identity

Real use binds package integrity, executable SHA-256 and reported version before
indexing. Unsupported, missing, offline or corrupt state fails closed.

### AB-MVP-003 — Bounded one-shot lifecycle

The adapter uses shell-free one-shot CLI processes with timeout and output
limits. It never invokes native install/update/config, a standing daemon or a
watcher. Its private disposable cache remains outside the selected repository.

### AB-MVP-004 — Captured provider contract

Sanitized `v0.10.1` architecture, search, trace, snippet, error, mutation and
lifecycle evidence defines the offline adapter contract.

### AB-MVP-005 — Task-directed context

The first surface is index, full-aspect architecture, bounded function search,
depth-bounded call trace and exact source snippets. It does not materialize the
entire provider graph in AgentBase memory.

### AB-MVP-006 — Repository evidence identity

Local evidence records engine identity, commit plus safe dirty digest, explicit
query inputs, normalized facts, repository-relative sources, limitations and a
deterministic digest without checkout/cache roots.

### AB-MVP-007 — Offline canonical verification

Canonical verification replays captured output and fake process behavior. The
real managed binary runs only through an opt-in integration command.

## OKF proposal

### AB-MVP-008 — Host-agent synthesis

The active coding agent performs semantic synthesis through the repository-local
`agentbase-okf` skill. AgentBase adds no model SDK, key or hosted AI service.

### AB-MVP-009 — Complete non-mutating proposal

Shared knowledge is an OKF `v0.2` directory named `okf/`. Prepare byte-copies
the current bundle into local proposal state and never mutates current knowledge.

### AB-MVP-010 — Base OKF conformance

Every concept has bounded parseable YAML frontmatter and a non-empty `type`;
reserved `index.md` and `log.md` files follow their v0.2 structures.

### AB-MVP-011 — Progressive disclosure

AgentBase output has a root index declaring `okf_version: "0.2"`; concept IDs
are bundle-relative paths and the index links useful concepts.

### AB-MVP-012 — Honest generated drafts

New AgentBase concepts use `status: draft`, `generated.by: agentbase/<version>`,
a generation time, no invented verification, and normalized repository sources.

### AB-MVP-013 — Permissive consumption

Unknown types and extension values remain consumable and round-trip safely;
ordinary Markdown expresses links and broken links are warnings.

### AB-MVP-014 — Continuity is not evidence

Previous generated concepts may guide a rebuild but cannot be cited as an
independent source or increase trust without current evidence or verification.

### AB-MVP-015 — Bound validation and visible diff

A proposal binds base/evidence digests, becomes `generated` only after separate
conformance and producer validation, locks its generated tree digest, and shows
created, modified, preserved, owned-draft deletion and prohibited deletion.

## Human guidance and recovery

### AB-MVP-016 — Maintainer guidance

Durable correction is a linked, stable `Maintainer Guidance` concept authored
by `human:<id>`, not an invisible sidecar or protected text marker.

### AB-MVP-017 — Persistent defer and explicit reopen

A stable directive ID, action and subject suppress a question until the same
maintainer directive is removed or changed explicitly to `reopen`. Unrelated
evidence does not resurface it automatically.

### AB-MVP-018 — Conservative mutability

Only an explicit unverified `agentbase/` draft is mutable. Every other existing
concept is protected byte-for-byte; modified owned drafts preserve unknown
frontmatter values.

### AB-MVP-019 — Validate before apply

Apply rejects stale base, changed generated tree, invalid proposal, protected
mutation and prohibited deletion. An explicitly diffed owned-draft deletion is
allowed.

### AB-MVP-020 — Serialized recoverable switch

State-changing work uses one atomic repository-local lock, a complete sibling
next bundle and an exact phase manifest. Declared interruption checkpoints have
deterministic recovery; sudden power-loss durability is not claimed.

## Value evidence

### AB-MVP-021 — Walking-skeleton rehearsal

The accepted fixture covers five critical graph facts within three of 12 source
files, linked first proposal, human guidance, persistent defer, owned-draft
deletion, stale rejection and checkpoint recovery.

### AB-MVP-022 — Optional benchmark

Graph-assisted and direct-source arms may record time, presented files/bytes,
fact coverage and maintainer corrections. No unmeasured speed threshold blocks
this release.
