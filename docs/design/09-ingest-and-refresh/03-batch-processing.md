# 09.03 — Batch processing

> Status: Batch Initial Ingest is implemented offline; Batch Refresh is deferred.

## Input and confirmation

The Batch command receives explicit repository roots and a proposed Domain. The
skill reads bounded README/documentation from each repository, warns about
outliers and asks for Domain confirmation once per batch instead of repeating
the same question.

## Execution

Repositories are processed sequentially:

```text
preflight batch
  → repo A isolated run
  → repo B isolated run
  → repo C isolated run
  → batch review output
```

- Each repository has its own source identity, graph namespace, candidates,
  evidence and outcome.
- Agent context does not mix raw source/graph data from multiple repositories.
- A repository failure does not roll back completed repository staging.
- A recoverable member-local failure proceeds to the next sibling after cleanup
  is confirmed; uncertain cleanup, process or shared-authority failure stops the Batch.
- Cross-repository discovery/provider verification does not run during batch
  Ingest; Domain Enrichment runs afterward.

Capability 046 Preflight resolves each member's exact remote default commit on
the active Hub host before Discover. A clean exact-matching checkout may be
reused; feature/dirty/different revisions use an AgentBase-private mirror and
detached worktree. Batch never checkout/stash/restore user worktrees or use SSH/
ambient Git credentials. Each member builds/reuses a graph only after source
selection and owns its own Seed/Receipt.

## Why processing is not parallel

Parallel graph/Agent runs increase process/account load and add Hub base/rebase
coordination. The first version prioritizes deterministic ordering and recovery.
Consider parallel discovery only after a benchmark proves sequential processing
is a bottleneck; authoring/finalization must still be serialized.

## Atomic batch output

The user confirms membership before execution. One batch creates exactly one
mutable workspace, one atomic proposal, one Accept and one pull request:

```text
confirmed repos 1, 2, 3
       ↓ sequential isolated work
one batch workspace
       ↓ validation/review
one proposal → one Accept → one PR
```

- Membership can be edited in preview before execution/finalization; after the
  confirmed run starts, changing membership requires explicit cancellation/restart
  or a failure decision.
- To publish repositories 1 and 3 separately from repository 2, create Batch A
  `[1,3]` and Batch B `[2]` from the start.
- Knowledge items retain repository-specific evidence/ownership inside the
  batch; atomicity applies only to the publication boundary.

## Failure membership

A repository failure makes the batch Incomplete; completed repository staging is
retained and later siblings may still complete. The user retries the failed
repository or confirms its removal and finalizes a new batch membership. When a
repository is removed from an existing draft, AI removes attributable contributions,
repairs hard dangling dependencies or asks the user when meaning is ambiguous;
MCP then performs deterministic Finalize over the remaining membership. The
system does not silently drop a repository or publish partial membership.

A Batch is not split after Accept, does not reorder items into multiple pull
requests and does not auto-Accept. This design retains the proposal/change set as
the publication unit established in Sections 05 and 11.
