# 09.04 — Repository identity

> Status: Canonical identity/aliases are implemented for the qualified path; edge cases remain.

## Goal

A repository that is renamed, transferred to another organization, given a new
remote alias or checked out at a different path is still recognized as the same
repository and runs Refresh.

## Canonical identity

Initial Ingest assigns an AgentBase Repository ID exactly once and stores it in
the Hub's Repository concept. Source references, proposals and contributions use
this ID thereafter.

```text
repository-vehicle-crawler-a1b2c3d4e5f6
```

The ID is not recalculated from the current folder name or origin URL on each run.

## Identity hints

Checkout discovery returns hints for finding the canonical Repository concept:

- normalized current remote URLs;
- display/repository names;
- Git root commit/lineage hints;
- an optional immutable forge/provider repository ID when evidence is available;
- known aliases stored in the Hub.

Remote URL, name and root commit are evidence/aliases, not the canonical ID. A
root commit alone cannot reliably distinguish a repository from a fork.

## Resolution

1. Search active Hub Repository concepts using strong hints/aliases.
2. Exact strong match: reuse the canonical ID and select Refresh.
3. Ambiguous fork/mirror/copy lineage: ask the user before selecting a mode.
4. No match: Initial Ingest creates a new ID.

A rename/organization transfer only adds alias/evidence. An independent fork gets
a new ID and may retain `forked-from`; a mirror uses the same ID only when lineage
is confirmed.

## Duplicate Initial Ingest

Do not add a remote claim/lock. If two duplicate Initial Ingest runs occur, the
proposal published first retains the canonical identity. The owner cancels the
other proposal, pulls the Hub and reruns its contribution with Refresh as the
high-level design establishes.

## Implementation delta

Initial Ingest currently derives a durable Repository ID from admitted identity
hints and stores remotes/root commits as aliases; Refresh obtains the canonical
ID from the Hub Repository concept and updates `observed_source`. Full ambiguous
fork/mirror/provider identity recovery has not yet been qualified as a separate workflow.

There is no remote claim/lock for duplicate Initial Ingest, as decided by the owner.
