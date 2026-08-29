# 09 — Ingest and Refresh

> Status: Initial Ingest/Refresh, Batch Initial Ingest, Capability 046
> broad-discovery runtime and Capability 051 reliability hardening are
> implemented; released-skill qualification remains pending.

## Short answer

```text
Initial Ingest → creates initial knowledge as a Local Draft
Refresh        → compares the source with existing knowledge
               → creates a Local Draft update
```

`Initial Ingest` is the first ingest of a canonical repository. From then on,
the repository uses Refresh. Both workflows require an active Remote Hub
profile; without a configured Hub, AgentBase uses Code Graph only.

## Scan the workspace before choosing a workflow

`agentbase-scan` inventories bounded Git repositories in the workspace selected
by the user without building a Code Graph. It compares strong repository
identity with the Published Hub and displays a short summary:

| State | Suggested action |
|---|---|
| Not in Hub | Initial Ingest |
| Published, source advanced | Refresh |
| Published, source unchanged | No action |
| Init/Refresh Local Draft | Review or submit |
| Init/Refresh open PR | Wait or reconcile |
| Ambiguous fork/mirror/identity | Confirm |

The result includes the last-observed date/revision, then waits for the user to
select all repositories or a subset. Scan does not run suggestions
automatically. Multiple new repositories enter Batch Initial Ingest; published
repositories run a single Refresh sequentially. Without a Remote Hub, Scan
only lists local repositories and reports that Hub classification is
unavailable.

## Initial Ingest

- Read the repository for the first time to find concepts, relations and
  evidence.
- Ask only for the minimum owner decisions, such as Domain; do not require
  provider login or stop to investigate another repository.
- Batch Ingest still isolates discovery per repository and automatically creates
  concepts, internal relations, limitations and Questions.
- Uncertain matches create only candidates/Questions; they do not auto-merge or
  auto-create cross-repository relations.
- Discover checks five lanes: identity, runtime, interface/event,
  integration/data/channel and deploy/operations. Important signals must be
  handled as `materialized`, a Question or an ignored item with a reason.
  Concept versus embedded is a property of the selected candidate, not a
  repeated decision in the Seed group.
- Repository-wide completeness and concept count are not success gates.
  Proposals remain selective, but high-value signals must not be omitted
  without being recorded.
- MCP prepares embedded knowledge in the parent. The Agent may rewrite labels
  or prose for readability; Finalize confirms that it still exists with exact
  Receipt evidence and does not require the wording to match the original
  identity hint. If the Agent removes the entire row, Finalize restores the
  canonical row from the Receipt instead of using the repair budget.

Hub Init preflight binds the exact remote default-branch commit before Discover.
The current checkout is reused only when it is clean and matches that exact
commit; if the repository is on a feature branch, dirty or at a different
commit, MCP uses a detached temporary AgentBase worktree/cache outside the
source repository and does not checkout, stash or modify the workspace. Every
Hub-bound Init/Batch/Refresh uses the Hub token on the same host over HTTPS; it
does not use SSH or ambient Git credentials. Scan does not build a graph.
Without an active Remote Hub, AgentBase only scans and uses source/Code Graph;
it does not create an OKF Draft.

Each canonical repository is Initial Ingested only once. There is no remote
lock because the risk of two machines doing this simultaneously is very low. If
duplication occurs, the first published version remains canonical; the other
version is cancelled, pulls the Hub and recreates its changes through Refresh.

## Refresh

- Start from existing knowledge/evidence to find parts that are new, changed or
  no longer visible in the source.
- Update only the contribution of the repository being read; do not delete
  evidence from another repository.
- Do not automatically delete old knowledge merely because one discovery pass
  cannot find it. Git/source diff may support an explicit correction/removal
  proposal, but the PR must present the reason/evidence for reviewer decision.
- Refresh reconciles one repository with the Published Hub and that repository's
  exact pending proposal/publication chain when the workflow permits it;
  unrelated Local Drafts are excluded from ordinary matching. The other
  repository does not need to be present on the machine.
- Every result remains a Local Draft and goes through the publication lifecycle
  in [section 11](11-review-accept-and-publish.md).

Refresh does not rebuild the Hub, publish automatically or treat “not found” as
conclusive evidence that knowledge is wrong. Correction/removal follows the
rules in [section 07](07-conflicts-questions-and-maintainer-guidance.md).

## Current qualification status

- Initial Ingest uses a bounded five-stage lifecycle, a catalog of 7
  skeletons/templates and stops at an inspectable proposal. The Sol ECS
  full-stack benchmark creates 7 useful concepts without promoting every AWS
  resource.
- Capability 046 keeps the lifecycle/catalog but moves from candidate-only
  validation to `Discovery Seed → Inventory Receipt → OKF`, and qualifies the
  released skill by signal tier instead of an exact concept inventory.
- When a Question needs source evidence, the AI selects only candidates and
  evidence submitted in the same Inventory. MCP binds the repository URI and
  exact revision to the Receipt; the AI does not assemble a provenance string.
- Inventory retains only meaningful decisions: origin group, candidate outputs,
  a Question or an ignored reason. MCP generates item/QuestionPlan IDs, parent
  mappings and internal references; bounded Seed source samples support review
  and are not a complete allowlist of repository evidence.
- Refresh uses the exact commit diff before known gaps/discovery, preserves
  foreign evidence and stops at a proposal. Two consecutive Terra runs update
  the health contract consistently from `/status` to `/health` in code and
  Terraform.
- This is the benchmark's policy model, not a model that MCP selects or
  requires in production.

## Domain Enrichment

After multiple repositories in a Domain have been Published, the user can run a
separate batch workflow to:

- read knowledge and Questions from selected repositories;
- verify bounded resource candidates through a provider CLI that is already
  logged in;
- reconcile identity and add cross-repository relations;
- answer Questions or move them to the appropriate state.

This workflow is not Ingest or Refresh and does not edit the Published Hub
directly. It creates a shared Local Draft, then goes through review, PR and
merge like every other knowledge change. Provider calls target only related
candidates; they do not blindly scan the whole account or every region.

## Qualification Domain Crawler

Before using real data to expand the Crawler, AgentBase has a three-repository
qualification dataset: the existing pipeline and two small fixture repositories
that model a publisher/worker pair sharing an SQS queue. This dataset is
temporary test data, not the canonical Hub, and does not record fake provider
identity.

Qualification uses the same Published projection, query, Domain site and mock
Domain Enrichment boundaries as production; the three members' Batch Initial
Ingest lifecycle is kept in the existing deterministic E2E, while this harness
materializes a source-backed Published fixture from those exact commits to
measure topology/resource coverage. The mock provider returns deterministic CLI
results to test identity matching, retry and proposal safety; it does not turn
hypotheses into Published facts. SNS and other providers remain outside this
slice.

Success is measured by source-backed node/resource/relation coverage, query
hits, the HTML build receipt and the fact that the canonical Hub is not mutated.
If evidence is missing, the report must state the limitation instead of
inferring topology.

## OKF Freshness

Freshness is a warning about the age of a repository/source contribution, not a
judgment that knowledge is wrong and not graph-cache freshness.

- MCP query may display the source revision, observed time and age.
- When the current local source has advanced, MCP warns that knowledge was
  observed at an older revision.
- Local MCP/CLI and scheduled Hub CI use the same derived Repository freshness
  report.
- The warning does not trigger Refresh, hide/delete knowledge or block Publish.
- The report is not a source of truth; if stored in the Hub Git repository, it
  goes through a PR and does not push directly to `main`.

## When a run fails

Failure is isolated per repository. In a batch, the checkpoint for a completed
repository is retained for retry, but the overall batch remains `Incomplete`:
there is no atomic proposal available for query, Accept or Publish.

A member-specific error does not stop later members once cleanup is confirmed
safe. A shared authority, process or uncertain-cleanup error stops the entire
batch. Finalize opens only after every member completes or the user repairs the
membership.

The user can retry or abandon a failed run. Retry updates the same old draft and
does not create duplicate concepts/relations; after success, MCP reruns the
necessary reconciliation.

For Init, if the Hub base changes before Finalize, MCP rematches, issues a new
Receipt/session and reuses the Seed/Inventory from the same source. Normal
Refresh has no Receipt; it reruns prepare/guidance on the new base. It does not
re-index when the source is unchanged; after Finalize it uses publication
reconciliation. A P0 signal that was not processed because of a
source/authority/adapter failure leaves the run `Incomplete`; missing P1/P2
signals may still be `Ready for review` with a Question/limitation.

Capability 051 adds an operational rule: discovery must not treat a lane or
document as complete when provider output is missing, malformed or redacted.
Ingest remains bounded and selective; restricted information must appear as a
limitation/Question rather than silently disappearing.

## Canonical repository

Initial Ingest creates a stable `Repository ID` in the Hub. The folder name and
remote URL are not the primary identity; they are retained as aliases/evidence.

- Renaming, moving an organization or cloning the same repository into another
  workspace still uses the old Repository ID and runs Refresh when
  lineage/provider ID is verified.
- An independently developed fork is a new repository and may keep a
  `forked-from` relation.
- A mirror or copy with ambiguous lineage must ask the user before choosing
  Initial Ingest or Refresh.

## Not implemented yet

- Batch Refresh or a batch mixing Init/Refresh.
- Provider profiles beyond the current bounded AWS/SQS Domain Enrichment.
- Persisted freshness reports and ordinary-query freshness marks; the local
  report and CI already exist.
- Full repository-identity recovery for every rename/fork/mirror edge case.
