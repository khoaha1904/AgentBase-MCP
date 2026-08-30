# 03 — Knowledge lifecycle

> Status: Single-repository Initial Ingest and Refresh, Batch Initial Ingest,
> explicit review/Accept, pull-request publication and synchronization are
> implemented. Batch Refresh remains deferred.

## Outcome

AgentBase converts bounded repository evidence into reviewable team knowledge
without publishing automatically.

```text
Scan/select
    ↓
Initial Ingest or Refresh
    ↓
editable proposal → Finalize → review → Accept
    ↓
Local Draft → pull request → merge → explicit sync → Published
```

Without an active Remote Hub, AgentBase may scan local repositories and use the
Code Graph, but it has no authority to create OKF Drafts or query Hub knowledge.

## Choosing a workflow

Workspace Scan inventories bounded Git roots and compares strong identity with
the synchronized Published Hub. It suggests Initial Ingest for new repositories,
Refresh for known repositories whose source advanced, or review/wait when Draft
or pull-request work already exists. It never starts a suggested workflow
without user selection.

Initial Ingest creates the first selective proposal for a canonical repository.
Refresh starts from existing knowledge and exact source change, updating only
the contribution it can attribute to that repository. Absence in a later scan
is not deletion evidence. A correction or removal must state the reason and
source in the reviewable proposal.

Batch Initial Ingest isolates evidence and failure per repository, then produces
one atomic proposal only after every selected member completes. Batch Refresh
and mixed Init/Refresh batches are outside the current boundary.

## Proposal and publication states

| State | Meaning |
|---|---|
| Proposal | Editable candidate knowledge, not accepted or queryable |
| Local Draft | Exact reviewed proposal accepted locally, not ordinary query authority |
| In Review | Local Draft represented by a matching open pull request |
| Published | Proposal merged and recognized by explicit Hub synchronization |

These are lifecycle states, not truth labels. Published knowledge still carries
provenance, uncertainty and Questions. Ordinary query reads only synchronized
Published knowledge; proposal inspection owns pending content.

The user may edit items before Finalize. Finalize locks one dependency-safe
proposal; Accept authorizes that exact reviewed content as a Local Draft. If a
locked proposal is wrong, the workflow returns to authoring and creates a new
finalized bundle instead of silently trimming accepted content.

## Review and authority

A pull request explains purpose, repository/Domain scope, added/updated/removed
knowledge, uncertainty, important evidence and validation. Git diff and
maintainer review are the final publication gate.

AgentBase may create proposal branches and pull requests through its dedicated
MCP authority. It never merges, approves or closes a pull request, changes
repository settings or substitutes ambient/personal credentials. The sole
direct target-branch exception is an explicitly confirmed empty-Hub bootstrap
containing only the released navigation/README/CI baseline and no knowledge.

Each Hub profile is identified by exact host, repository and target branch and
keeps separate Published/Draft state. Switching profiles never copies or merges
their knowledge. `abs hub connect` validates and activates a profile;
`abs hub sync` is the explicit synchronization action. Connection and sync are
separate authority boundaries.

## Failure and recovery

- A failed member remains retryable and prevents an incomplete batch from
  exposing an acceptable proposal.
- Stale source, Hub base or authority is reported before unsafe mutation.
- Retry reuses retained identity and safe completed work without duplicating
  knowledge or publication.
- Closed/rejected pull requests return proposals to Local Draft.
- Publication conflicts stop before push and preserve pending drafts.
- Network/status failure affects only remote comparison; local state remains
  visible and explicit sync never discards it.
- A duplicate Initial Ingest is reconciled back through Refresh rather than
  creating a second canonical Repository.

## Non-goals

- Automatic Accept, Publish, merge or background synchronization.
- A second publication-status database independent of Git.
- Hub creation or repository-setting management.
- Global atomic publication of unrelated repositories.
- Treating freshness warnings as automatic Refresh triggers.

## Downstream Capability Contracts

- [Knowledge entry](../capabilities/05-knowledge-entry/README.md)
- [Ingest and Refresh](../capabilities/09-ingest-and-refresh/README.md)
- [Review and Publish](../capabilities/11-review-and-publish/README.md)
