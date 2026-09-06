# 03 — Knowledge lifecycle

> Status: Single-repository Initial Ingest and Refresh, Batch Initial Ingest,
> explicit preview/Publish, per-Hub Direct/PR publication and synchronization are
> implemented. G3-C2 review-impact evidence is implemented and verified;
> stewardship qualification is deferred and does not block the current internal
> enterprise release. G5-C1 compact/no-log lifecycle behavior is implemented
> and verified; G5-C2 pre-Finalize semantic quality
> admission is deferred and inactive.
> Batch Refresh remains deferred.

## Accepted simplification target — Group 7

Status: owner-approved Product design; the direct-publication application
primitive, per-Hub policy and unified Direct/PR CLI/MCP are implemented. Shipped
skills no longer require Accept. Production legacy helpers are retired;
cleanup/recovery and authorized old test-state disposal are implemented. The
mandatory Accept → Local Draft → PR path is retired. Architecture and Capability
Contracts are linked from [Direct publication](../capabilities/11-review-and-publish/12-direct-publication-requirements.md).

**Current → Target:** Replace multiple user-managed approval states with one
prepared change, one bounded review and one Publish confirmation. Keep a
recoverable private authoring workspace; remove Local Draft as a required
user-managed state. Direct publication is the default for Hubs whose configured
policy and remote permissions allow it. PR publication remains a per-Hub option
for teams that require it.

**Benefit → Impact:** Reduce publication effort without exposing partially
authored knowledge. This changes publication authority, local state, recovery,
installed workflows and compatibility; it does not change the OKF layout or
make Published a semantic-verification label.

```text
Add repository / Update knowledge
    → prepare in a recoverable private workspace
    → deterministic validation + material-change preview
    → one explicit Publish confirmation
    → one complete remote commit, or a PR under the Hub's publication policy
```

The user may revise, save for later or discard a prepared change. Saving is
resumable work, not acceptance into a second canonical knowledge layer. The
workspace, validation, exact-content binding and recoverable publication receipt
remain implementation responsibilities. Ordinary query never reads it.

### Review meaning

The owner approves scope and material changes for sharing, not a claim that
every sentence or omitted dependency was independently checked. Initial Ingest
shows a result preview; Refresh shows change from the prior Published boundary.
The default preview covers:

- selected repositories and evidence scope;
- added or changed boundaries, relations and ownership;
- removals, conflicts, important uncertainty and source limitations;
- access to the complete diff and exact evidence when needed.

Summaries must not hide destructive or material changes. Existing deterministic
validation remains required, but no model reviewer, completeness certification
or additional approval layer is introduced. Published means authorized for
sharing at recorded revisions; it does not mean complete or currently deployed.

### Publication and recovery

- Confirmed direct publication authorizes AgentBase to write one complete,
  validated commit to the configured remote branch. Never stream partial
  authoring output into that branch or force-push over another writer.
- A changed remote base is reconciled or reported as conflict before writing.
  A changed material result requires a refreshed preview and confirmation;
  it must not inherit approval for different content.
- Retrying an uncertain network outcome must determine whether the exact
  publication already succeeded before attempting another write. Preserve
  recoverable work and avoid duplicate commits or false success reports.
- A successful direct Publish includes recognizing that exact remote commit
  locally for ordinary query; it does not require a second routine sync action.
  If local recognition fails after remote success, report that distinction and
  permit recovery. Explicit sync still obtains other writers' changes and
  merged PRs; background synchronization remains out of scope.
- PR policy uses the same preparation and preview, then submits a PR for team
  review. AgentBase does not approve/merge it or bypass branch protection.
  A rejected direct write reports the policy conflict; no silent switch or
  repository-setting change is authorized.
- Each publication is a recoverable Git commit. Correction/revert preserves
  shared history and intervening work; no reset or implicit destructive undo.
- Private preparation is resumable. There is no legacy Accept/stacked-draft
  compatibility workflow or permission for upgrades to discard owner data.

### Use-driven repair — Group 8

G8-C2 permits an explicitly approved Query repair offer to enter an existing
authoring workflow for the named gap. It reuses normal source/identity checks,
private preparation and proposal inspection. Agreement to prepare never grants
Publish; cancellation preserves private work without sharing or deleting it.
No new authoring engine, repair queue or query-history store is introduced.

### Accepted follow-up — Group 9

Release hardening before Group 9 preserves Initial Ingest discovery limitations
as current Repository coverage debt, visible to later Update/Refresh. A complete
Delta does not clear that debt. Coverage's clean stop is an account of the
bounded investigation, not proof that all repository knowledge exists.

Expose two authoring intentions: **Add repository** and **Update knowledge**.
G9-C1 implements these labels and scoped handoffs in existing installed skills;
runtime strategies and command identities remain unchanged. Installation tests
verify delivery, not real-model routing reliability.
Delta, Coverage and bounded Domain Enrichment remain internal strategies rather
than separate concepts the user must understand before starting. Preserve
source/repository scope, coverage limits and provider authorization. A normal
update never silently becomes a provider-account scan. Simplifying the entry
surface does not require merging independent runtime implementations or adding
Batch Refresh.

## Outcome

AgentBase converts bounded repository evidence into reviewable team knowledge
without publishing automatically.

```text
Scan/select
    ↓
Initial Ingest or Refresh
    ↓
editable proposal → deterministic Finalize → material-change preview
    ↓
explicit Publish → direct commit + local recognition → Published
                 → PR + external merge + explicit sync → Published
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
| Prepared proposal | Immutable validated bundle awaiting exact-content Publish confirmation |
| In Review | Prepared proposal submitted under PR policy, awaiting external merge |
| Published | Complete remote commit recognized locally through direct Publish or explicit sync |

These are lifecycle states, not truth labels. Published knowledge still carries
provenance, uncertainty and Questions. Ordinary query reads only synchronized
Published knowledge; proposal inspection owns pending content.

The user may edit items before Finalize. Finalize locks one dependency-safe
proposal; Publish authorizes that exact reviewed content under Hub policy. If a
locked proposal is wrong, the workflow returns to authoring and creates a new
finalized bundle instead of silently trimming accepted content.

Finalize uses the implemented deterministic discovery coverage, source,
evidence, OKF and Profile checks and never invokes a model. The user reviews the
exact finalized proposal through Inspect before Publish. An optional external AI
review may help the operator edit a draft, but its report is not product state
and does not add an automatic repair, override or admission workflow.

## Review and authority

A pull request explains purpose, repository/Domain scope, added/updated/removed
knowledge, uncertainty, important evidence and validation. Git diff and
exact-content confirmation bind publication; PR policy additionally requires team merge.

AgentBase may create proposal branches and pull requests through the explicit
Publish workflow using the operator's configured enterprise or local Git
identity. Direct policy writes one complete commit to the target branch; PR
policy creates a proposal branch and pull request. It never merges, approves or
closes a pull request or changes repository settings in ordinary operation.

Each Hub profile is identified by exact host, repository and target branch and
keeps separate Published/private-proposal state. Credential resolution may be shared where
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
- Closed/rejected pull requests leave work unpublished and require explicit recovery.
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
preview and policy-bound Publish boundaries as other knowledge changes.

## Non-goals

- Automatic Publish, merge or background synchronization.
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
