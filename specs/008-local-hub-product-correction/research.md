# Research: Local-First AgentBase Product Correction

## Decision 1 — Local Hub `main` is active knowledge

**Decision**: Use one owned persistent AgentBase-Hub clone. Remote `main` is the
shared accepted base; local `main` is that base plus accepted pending proposal
commits and is the source for Hub queries.

**Rationale**: It gives immediate local value, preserves ordinary Git/OKF
portability and matches the owner's mental model.

**Alternatives considered**:

- Temporary proposal directories only: rejected because pending knowledge is
  invisible to ordinary Hub queries.
- Separate staging branch per proposal: rejected as the primary local model
  because several repositories should accumulate into one active view.
- Non-Git database overlay: rejected because it duplicates Git state and makes
  portable knowledge dependent on proprietary storage.

## Decision 2 — Proposal commits carry portable identity

**Decision**: Accepted commits use stable AgentBase proposal trailers for ID,
subject, evidence digest and diff identity, plus an atomic external runtime
receipt for recovery details. Pending state is derived from admitted ancestry.

**Rationale**: Commit metadata travels through normal merge history; external
state can remain private and recoverable without adding non-OKF sidecars to the
Hub tree.

**Alternatives considered**:

- A queue JSON file inside Hub: rejected as editable shared data that can drift
  from ancestry.
- Git notes: rejected for the baseline because notes are not normally cloned or
  merged with repository history.
- External state only: rejected because another installation could not identify
  proposal commits from Git history.

## Decision 3 — Publish a contiguous pending prefix

**Decision**: The first batch-publication version accepts one or more proposals
forming a contiguous prefix after remote base. The last selected commit becomes
the publication branch head.

**Rationale**: This preserves exact reviewed commits and dependencies without
hidden cherry-pick/recomposition semantics.

**Alternatives considered**:

- Arbitrary subset cherry-pick: deferred because proposal diffs may depend on
  prior indexes or concepts.
- Squash all proposals: rejected because it erases portable proposal identities.
- One PR per proposal: rejected because the user explicitly wants accumulated
  batch publication.

## Decision 4 — Synchronize in a candidate worktree

**Decision**: Fetch without changing local `main`, build a transaction manifest,
rebase remaining pending commits in an owned candidate worktree, validate the
full OKF tree, then atomically advance local `main`.

**Rationale**: It provides a recoverable boundary and preserves the original
active knowledge until the replacement is admitted.

**Alternatives considered**:

- Rebase local `main` in place: rejected because conflicts leave the active
  query tree half-transitioned.
- Hard reset to remote and recreate proposals: rejected as implicit data loss.
- Always merge remote main locally: rejected because it obscures the ordered
  pending proposal set.

## Decision 5 — Concrete schema catalog with common internal rules

**Decision**: Version the corrected catalog as a breaking producer vocabulary.
Common provenance/lifecycle requirements are reusable internal definitions;
emitted OKF uses concrete types when evidence supports them.

**Rationale**: Lambda, SQS, Server and similar types need distinct investigation
guidance and relationships. A generic `Infrastructure Resource` does not tell an
agent which evidence matters.

**Alternatives considered**:

- Keep only the existing generic 11 types: rejected as insufficiently specific.
- Port every legacy schema immediately: rejected because unmeasured catalog
  breadth creates unused policy and repeats legacy complexity.
- Encode subtype only in arbitrary extension fields: rejected because authoring
  and validation cannot reliably select the right evidence requirements.

## Decision 6 — Query routing remains agent-visible

**Decision**: Expose separate Code Graph and Hub query tools plus concise routing
guidance. The coding agent chooses based on the question and may combine both.

**Rationale**: This is transparent, inspectable and avoids an extra opaque model
or intent-classification subsystem inside MCP.

**Alternatives considered**:

- Automatic MCP-side classifier: deferred until evidence proves the need.
- Query both stores for every question: rejected as wasteful and noisy.

## Decision 7 — Canonical repository migration is additive

**Decision**: Create canonical directories `AgentBase-MCP` and `AgentBase-Hub`
only after preflight, keep original worktrees untouched, and separate local path
migration from GitHub repository rename and MCP registration changes.

**Rationale**: Both current repositories carry important history; the Hub legacy
worktree is dirty and AgentBase-MCP currently has no configured remote. Additive
migration gives an exact rollback path.

**Alternatives considered**:

- Rename directories in place: rejected because current launchers and dirty
  worktrees may be disrupted with no independent verification target.
- Copy `.git` directories directly: rejected because it risks shared mutable
  object/state mistakes and ambiguous ownership.
- Delete old repositories after copy: rejected until canonical qualification and
  an explicit later cleanup approval.
