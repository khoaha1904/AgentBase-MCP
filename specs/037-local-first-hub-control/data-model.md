# Data Model: Local-first Hub Control

## Hub Profile

- `id`: digest of normalized kind/host/repository/branch, or stable local-only ID
- `kind`: local-only or remote
- `localRoot`, `baseCommit`, `catalogVersion`
- remote only: `host`, `repository`, `targetBranch`
- invariant: one profile identity owns one checkout; no profile shares drafts

## Active Hub Pointer

- format version and exactly one profile ID
- replacement occurs only after the target profile is fully admitted
- failure leaves the prior pointer byte-exact

## Hub Credential

- one secret value owned by one remote profile ID
- absent for local-only profiles
- stored separately from profile metadata with owner-private admission rules

## Git State

- `refs/heads/main`: active Published tree plus Local Draft chain
- `refs/agentbase/published`: last successfully synchronized remote target
- private candidate refs: latest fetched/previewed remote state only

```text
remote observed -> candidate
candidate + drafts -> validated synchronized tree
validated tree -> active main + published ref (atomic admission)
conflict -> unchanged active main + published ref
```

## Hub Status

- always: configuration kind and local state/error
- remote profile: host/repository/branch, credential state, remote state/head,
  bounded open PR count/error
- synchronization: ready, blocked or recovery-required with bounded identifiers
- every remote/optional section may degrade independently
