# 03 — Knowledge lifecycle

> Status: Single-repository Initial Ingest and Refresh, Batch Initial Ingest,
> explicit review/Accept, pull-request publication and synchronization are
> implemented. G3-C2 review-impact evidence is implemented and verified;
> stewardship qualification is deferred and does not block the current internal
> enterprise release. G5-C1 compact/no-log lifecycle behavior is implemented
> and verified; G5-C2 pre-Finalize semantic quality
> admission is deferred and inactive.
> Batch Refresh remains deferred.

## Outcome

AgentBase converts bounded repository evidence into reviewable team knowledge
without publishing automatically.

```text
Scan/select
    ↓
Initial Ingest or Refresh
    ↓
editable proposal → deterministic Finalize → Inspect/review → Accept
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

Refresh has two scopes within the same workflow. `delta` is the default and
prioritizes changed source plus known gaps and a small discovery pass.
`coverage` is explicit recovery after weak Initial Ingest, a skill/model upgrade
or owner concern; it repeats broad bounded discovery without recreating the
Repository or requiring every source file. Both retain the same proposal,
review and publication lifecycle. A partial delta or coverage pass leaves one
compact current coverage debt on the Repository. An explicit non-partial
Coverage pass clears debt only when it adds no knowledge. If it adds knowledge,
the reviewed proposal keeps debt for another convergence pass. The campaign
stops early on that clean confirmation or after three passes; a capped remainder
stays visible while ordinary work returns to Delta.

For the bounded changed paths exposed to Refresh, Finalize also requires one
reviewable knowledge outcome per path. The outcome may be an evidenced concept
update/new concept, embedded knowledge, an unresolved Question or an explicit
ignored reason. This accounting makes processed change visible; it is not a
claim that the bounded delta or the Hub is a complete model of the repository.

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

Finalize uses the implemented deterministic discovery coverage, source,
evidence, OKF and Profile checks and never invokes a model. The user reviews the
exact finalized proposal through Inspect before Accept. An optional external AI
review may help the operator edit a draft, but its report is not product state
and does not add an automatic repair, override or admission workflow.

## Review and authority

A pull request explains purpose, repository/Domain scope, added/updated/removed
knowledge, uncertainty, important evidence and validation. Git diff and
maintainer review are the final publication gate.

AgentBase may create proposal branches and pull requests through the explicit
Publish workflow using the operator's configured enterprise or local Git
identity. It never merges, approves or closes a pull request or changes
repository settings. The sole
direct target-branch exception is an explicitly confirmed empty-Hub bootstrap
containing only the released navigation/README/CI baseline and no knowledge.

Each Hub profile is identified by exact host, repository and target branch and
keeps separate Published/Draft state. Credential resolution may be shared where
the configured provider policy permits, but switching profiles never copies or
merges their knowledge. `abs hub connect` validates and activates a profile;
`abs hub sync` is the explicit synchronization action. Connection and sync are
separate authority boundaries.

## Review impact and stewardship gate

Git diff remains the publication authority, but reviewers also need a bounded
derived summary of concept, relation, Question and navigation additions,
updates and removals. Group 3 adds a deterministic before/after impact preview
for the exact finalized proposal, including affected Domains/Repositories,
dangling references, duplicate candidates and visible omissions. The preview
is review evidence only; it never becomes Hub knowledge or substitutes for the
exact diff/digest.

Optional operator review notes are not persisted as AgentBase proposal or Hub
state. Git/PR history replaces AgentBase-authored Repository or Domain activity
logs in Published Hub content.

The deferred adoption campaign measures who prepares, reviews, publishes and
refreshes knowledge; median review effort; escaped semantic defects; Refresh
effort per repository; Question backlog; and the share of queries that must fall
back to source. It is not a current release gate. AgentBase does not claim
low-maintenance shared knowledge until a longitudinal team workflow demonstrates
those costs are acceptable.

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

Group 4 profile/path changes are explicit migration work, not ordinary Refresh.
A real Hub receives an impact preview, reviewable path/link updates and an exact
rollback point. The owner-authorized Crawler test corpus may instead be reset
and re-ingested because it carries no durable production knowledge.
Legacy unprofiled knowledge remains readable while migration is prepared, but
new authoring stops rather than mixing type-first and Domain Capsule layouts.
The migration is an ordinary proposal and must pass the same semantic-impact,
Accept, Publish and synchronization boundaries as other knowledge changes.

## Non-goals

- Automatic Accept, Publish, merge or background synchronization.
- A second publication-status database independent of Git.
- Hub creation or repository-setting management.
- Global atomic publication of unrelated repositories.
- Treating freshness warnings as automatic Refresh triggers.
- Automatic semantic approval or treating a visual impact preview as review
  authority.
- Publishing discovery inventories, AI reviewer reports or activity logs into
  the Hub knowledge tree.

## Downstream Capability Contracts

- [Knowledge entry](../capabilities/05-knowledge-entry/README.md)
- [Ingest and Refresh](../capabilities/09-ingest-and-refresh/README.md)
- [Review and Publish](../capabilities/11-review-and-publish/README.md)
