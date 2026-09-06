# 11 — Review and Publish

> Status: Direct/PR prepared publication, exact-content review, recovery and
> profile-scoped writer exclusion are implemented. Optional visual review and
> semantic-quality admission remain deferred.

Product Contract:
[Knowledge lifecycle](../../product/03-knowledge-lifecycle.md)

## Contract map

- [`12-direct-publication-requirements.md`](12-direct-publication-requirements.md)
  — Group 7 shared Direct/PR publication and CLI/MCP/skill public replacement.
  Candidate cleanup/recovery is implemented.
- [`01-runtime-requirements.md`](01-runtime-requirements.md) — current Local Hub,
  setup, publication and synchronization `AB-*` requirements. Query authority
  lives in [`../10-query-routing/07-runtime-requirements.md`](../10-query-routing/07-runtime-requirements.md).
- [`02-review-preview.md`](02-review-preview.md) — editing items before Finalize,
  atomic pre-Publish review and optional static HTML after the MVP.
- [`03-dependency-validation.md`](03-dependency-validation.md) — hard structure
  gates, allowed incompleteness and AI/MCP responsibilities.
- [`04-git-and-pr-workflow.md`](04-git-and-pr-workflow.md) — policy-bound transport,
  exact proposal branches and separate support initialization.
- [`05-publication-state-machine.md`](05-publication-state-machine.md) — state
  derived from Git/matching pull requests, without a second state store.
- [`06-verification-and-cleanup.md`](06-verification-and-cleanup.md) — reusing
  three validation gates and cleaning only safe temporary state in the MVP.
- [`07-failure-recovery-and-permissions.md`](07-failure-recovery-and-permissions.md) — retry, partial outcomes and Git authority.
- [`08-domain-enrichment-changes.md`](08-domain-enrichment-changes.md) — an atomic proposal containing updates
  from multiple repositories in the same Domain.
- [`09-profile-migration-changes.md`](09-profile-migration-changes.md) — the
  report-first legacy-to-Profile workspace, reviewed Migration proposal and
  common final mutation admission gate.
- [`10-concurrency-requirements.md`](10-concurrency-requirements.md) — exact
  profile-scoped local writer exclusion and Git-based team coordination.
- [`11-proposal-impact-requirements.md`](11-proposal-impact-requirements.md) —
  exact before/after semantic impact retained with newly finalized proposals.
- [Deferred semantic quality design](../09-ingest-and-refresh/11-semantic-quality-admission-requirements.md)
  — retained future design; no current inspection/publication behavior.

## Internal authoring organization

Internal authoring code follows the responsibility split in
[Architecture ownership](../../architecture/ownership.md): the session owner
orchestrates existing validation and Receipt-materialization modules. This is a
behavior-preserving organization change, not a new workflow, public API or state
schema. Source/reachability, Receipt evidence, coverage debt, retry and Publish
tests remain the verification boundary.

## Cross-section decision from Refresh

Pull-request review must group `Added`, `Updated`, `Removed` and
`Questions/Limitations`. Destructive changes show the reason, source revision/
diff evidence, affected relations and replacement; a Git diff alone is
insufficient to explain why the Agent proposes deletion.

## PR review template requirement

MCP—not the calling agent or `gh`—owns branch push and PR creation with the
dedicated MCP Hub token. A created PR must summarize:

1. **Purpose** — why this proposal exists and its Init/Refresh/Batch Init/Enrichment mode.
2. **Scope** — Domain, repositories, source revisions and proposal IDs.
3. **Knowledge changes** — Added, Updated, Removed.
4. **Uncertainty** — Questions, Limitations, conflicts and unresolved evidence.
5. **Evidence and validation** — important sources, catalog/profile versions and
   deterministic validation.
6. **Reviewer action** — what needs confirmation and what was intentionally not
   verified/published.

The body is derived from immutable proposal/inspection metadata; it must not
invent a model narrative or include credentials/local paths.
