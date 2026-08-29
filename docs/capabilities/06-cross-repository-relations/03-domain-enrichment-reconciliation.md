# 06.03 — Domain Enrichment reconciliation

> Status: Published-only AWS/SQS slice is implemented offline; merge/redirect is
> deferred.

## Short decision

Domain Enrichment processes only knowledge merged into Published Hub `main`. The
user selects one Domain with specific repositories/candidates; the workflow
checks them sequentially and creates exactly one Local Draft/PR for that
enrichment run.

```text
Published Hub main
  + confirmed Domain
  + selected repositories/candidates/questions
        ↓ sequential bounded reconciliation
one Enrichment proposal → review → Accept → one PR to main
```

A Local Draft or repository still in an unmerged Init/Refresh PR is not an
Enrichment member. Git has no clean common base for multiple independent PRs;
waiting for merge preserves understandable dependencies and review.

Local `main` may contain unrelated accepted Local Drafts. Finalize applies the
enrichment patch to the local head so Accept does not lose them, but stops if a
pending draft changed a concept or Question in the manifest. Evidence and
membership are read only from the exact Published base.

## Run manifest

Before execution, a private run manifest binds:

- exact Published Hub commit;
- one primary Domain identity;
- exact selected Published Repository identities;
- exact relation/identity candidate and Question revisions;
- user-confirmed provider/account/region scope when needed;
- catalog, detector and provider-profile versions.

Each selected Repository needs primary `part-of` membership in the confirmed
Domain. Published concepts in another Domain may be read-only relation targets;
this does not make the current repository multi-Domain.

Membership may change during preview. Once execution starts, adding/removing a
member requires explicit cancel/reconfirmation so output cannot silently differ
from what the user selected.

## Sequential reconciliation

Each candidate runs in isolation and sequence:

1. load bounded Published summaries/evidence at the exact Hub commit;
2. compare endpoint identities and interaction evidence;
3. optionally verify that exact candidate through a read-only provider CLI;
4. classify the outcome;
5. persist a private deterministic checkpoint, not Hub knowledge.

Allowed outcomes are `confirmed`, `rejected`, `unresolved` and `failed`.
`unresolved` is valid and retains a Question/limitation; `failed` makes the run
Incomplete because integrity, protocol or state makes the attempt unreliable.

## Atomic boundary

Atomicity applies to publication, not to confirming every candidate:

- retain completed checkpoints when another candidate fails;
- Incomplete staging never appears in normal Hub query;
- retry runs only failed/stale candidates when manifest and evidence digest
  match;
- create a final proposal only after every selected member has a trusted terminal
  outcome;
- a valid partial proposal may contain confirmed changes with unresolved
  Questions/limitations;
- after Accept, do not split the proposal into multiple PRs.

To exclude a failed candidate, the user confirms new membership and then
finalizes/retries. The system does not silently drop an item to turn failure into
success.

## Outputs and publication dependency

A proposal may add verified external identity, canonical cross-repository/
cross-Domain relations, Question evidence/state, or an explicit rejected/
unresolved outcome. It retains source repository/revision, evidence IDs,
provider observation time and limitations; raw provider dumps do not enter it.

An Enrichment proposal is a Domain-scoped publication unit, not per-Repository
Init/Refresh units. Its base is the exact Published `main`, its source scope is a
bounded Repository set, and it targets `main` through one PR. If remote `main`
advances, MCP reconciles/revalidates the PR or stops on conflict; it never
auto-merges, approves, force-pushes or changes membership.

Implementation uses explicit `enrichment` mode with a bounded repository set;
it must not overload a fake Repository ID or create one PR per repository.

## Not in this workflow

- Ingest/Refresh source repositories.
- Clone repositories or build a cross-repository Code Graph.
- Read Local Draft/open PR as the knowledge baseline.
- Scan provider account, service or regions to discover candidates.
- Automatically Accept/Publish after successful verification.
- Expand beyond the bounded AWS/SQS provider slice; source-only API/hostname
  relations remain embedded/Questions until a future source-only profile.

## Baseline impact

Reuse proposal/validation/Git lifecycle and add private atomic checkpoints with
explicit Domain/multi-Repository scope. No service, database, background worker
or parallel execution is required.
