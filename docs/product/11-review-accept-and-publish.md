# 11 — Review and Publish

> Status: Init/Refresh stack, Capability 046 receipt-bound inspection/log,
> atomic Batch Initial Ingest and independent Domain Enrichment PR are
> implemented offline.

## Short answer

AgentBase does not modify the remote Hub automatically. The user edits knowledge
items in an editable draft before Finalize; Finalize locks one atomic proposal
for review and Accept as a whole. Local Draft commits can then be grouped into
a dependency-safe PR; Git review/merge is the final publication gate.

```text
Proposal ──preview + Accept──→ Local Draft ──PR──→ In Review ──sync──→ Published
```

## Review and create a PR

- Preview groups authoring items by repository and the Ingest/Refresh run.
- While the draft is editable, the user can add, edit or remove a knowledge
  item. After Finalize, the proposal cannot be selectively trimmed.
- If review finds a locked proposal incorrect, the Agent returns to authoring,
  applies the edits and Finalizes a new dependency-safe bundle; Accept always
  accepts the exact reviewed proposal in full.
- Accept locks exactly the reviewed content as an immutable Local Draft commit.
- A Local Draft commit can accumulate across repositories and be inspected or
  reviewed; ordinary Hub query reads Published only.
- Unresolved Questions and limitations may be published when their provenance
  remains clear.
- Resolving a Question or correcting/removing content creates only a new Local
  Draft; it does not publish automatically.
- Domain Enrichment can group updates from multiple repositories, Questions and
  cross-repository relations into one dependency-safe Local Draft/PR.
- A finalized Batch Initial Ingest is one proposal/Accept/PR unit; its member or
  item cannot be excluded after Finalize.
- A profile upgrade with a semantic mapping change groups every affected
  Published concept into one Hub Migration Draft and migration PR. Upgrade does
  not publish automatically; items lacking evidence retain their current state
  and carry a Question.

The PR must explain enough for a reviewer to understand it before reading the
file diff:

- the proposal's purpose and related repository/Domain;
- knowledge that is added, updated or removed;
- Questions, limitations and primary source revision/evidence;
- coverage of the five discovery lanes, embedded groups and ignored
  counts/reasons;
- validation/qualification that ran and what remains unverified.

Git diff remains the final evidence, but reviewers must not have to infer the
entire meaning from a list of changed Markdown files.

MVP review uses a structured preview and exact before/after content through MCP.
A local HTML page with a concept/relation diagram and change groups is an
optional post-MVP enhancement. If built, it renders only the same immutable
inspection data, does not become a knowledge authority, needs no separate
service/database and cannot Accept or Publish automatically.

Before a PR, MCP confirms the latest Published Hub and requires Git conflicts to
be resolved. Hub Init also confirms that the proposal remains bound to the exact
remote default-branch source commit used during Discover. A new commit on the
remote default branch creates a `source-advanced` warning; the exact old
snapshot can still be reviewed/published. Only a missing/changed authority or
snapshot requires returning to the appropriate step. Local Draft commit order
is only local storage order, not an implicit publication dependency. Each
Repository Init can open its own PR from Published `main` concurrently; Refresh
depends only on that Repository's prior proposal.

## When a PR ends

- A proposal commit with a matching open PR is shown as `In Review`, but that is
  a derived state; the proposal remains a Local Draft until merge and sync.
- A closed/rejected PR returns the proposal to `Local Draft` for another try.
- After merge, MCP pulls the Hub and identifies each proposal by commit,
  proposal and diff identity. A Published proposal leaves pending ancestry;
  another proposal is rebased and retained locally.

The workflow must be retryable without losing drafts or publishing duplicates.
Branch, commit, change ID and concrete retry mechanics belong to the low level.

There is no separate publication-status database. Local Draft derives from
pending Git ancestry, In Review from an exact matching open PR and Published
from a proposal identified in remote `main`; the Receipt exists only for
retry/recovery.

## Dependencies and publish access

Before Accept, MCP checks that selected items have sufficient content
dependencies. For example, a relation must point to a Published concept or a
concept selected in the same proposal. Before a PR, MCP checks dependencies per
Repository publication chain instead of requiring every proposal to form one
global pending prefix. MCP does not silently add items or create an invalid
proposal/PR.

The AI edits the draft and mechanically repairs dangling dependencies before
calling Finalize; it asks the user only when several valid business choices
exist. Finalize is deterministic and does not call a model: broken structure
fails, while incomplete knowledge can proceed with an explicit
Question/Limitation.

A person with source/workspace access can create and review a Local Draft. Git
permissions decide who can create a PR; maintainer review/merge is the final
authority for knowledge to become Published. Hub read access does not imply Hub
write access, and the first AgentBase version adds no separate write ACL layer.

## Current publication boundary

The `submit_hub_okf_proposals` tool uses an MCP-owned token. Each Init creates an
independent branch and PR from Published `main`; a chain for one Repository is
`main ← Init ← Refresh`, with each PR showing only that proposal's delta.

Creating a Hub branch and PR is **exclusively an MCP permission** in this
workflow. The Agent only asks MCP to submit proposal IDs; it must not use `gh`, a
personal GitHub token, ambient Git credentials or another publisher instead.
This permission does not include merging, approving, closing PRs or changing
repository settings.

The PR body is generated deterministically from the accepted proposal,
inspection and Git metadata; missing optional metadata is recorded as
unavailable. MCP does not use `gh`, merge, approve, close or delete branches.
When Published `main` changes, open proposals are reconciled sequentially and
updated on their existing branch/PR; conflicts must be resolved before that
branch is updated.

A successful proposal also updates a concise human-readable activity summary.
Repository logs cover Init/Refresh/correction/Question resolution. The Domain
log covers Domain Enrichment, cross-repository relation/Flow and explicit
Domain correction; routine membership is not written to either log. Capability
046 writes only a Repository Init entry. Git/PR/diff remains the history
authority; logs do not record queries, raw Inventory, tool calls or failed/
Incomplete attempts.

An entirely empty Remote Hub uses one explicit Bootstrap exception: after
preview and confirmation, MCP writes the target branch directly with a complete
baseline containing the root `index.md`, standard README and CI. This commit
contains no Local Draft/knowledge and is the only time MCP writes directly to
the target branch.

For a Hub that already has a branch, Initialization is a support-only PR: add a
README when missing and add/update exactly the three CI files when CI is not
current; an existing README and current CI are preserved. If the baseline is
already complete, no PR is created. The Hub runs the reviewed validator itself
without downloading npm packages, checking out MCP or requiring an MCP token.

The standard README is a short onboarding page for GitHub readers: it introduces
the Hub and AgentBase-MCP, links to `index.md`, explains that the Hub stores
knowledge/evidence rather than source/Code Graph copies, and summarizes layout,
PR lifecycle and CI. It does not list every concept or replace `index.md` as
knowledge navigation.

Remote Hub identity consists of the exact GitHub host, repository and target
branch. Each identity has its own local checkout/configuration; one private
Hub-owner token is shared; only one identity is active at a time. GitHub.com uses
the public API, while GitHub Enterprise uses the standard API on that enterprise
host. Switching the active Hub does not replay or merge Local Drafts between
Hubs.

## Connect or switch Hub

The user runs `abs hub connect --url <repository-url> --branch <branch>` with a
credential-free repository URL and exact branch. The command requests the token
through a hidden prompt; entering a new token replaces the shared token, while
an empty input reuses the old token. The command then checks the remote/OKF and
atomically switches the active profile. The user does not need to call an
internal credential helper and then call MCP a second time.

`abs status` only reads status; `abs hub sync` is an explicit pull. Prepare,
finalize, accept, submit and recover remain internal skill/MCP workflows and are
not part of public `abs --help`.

The token does not pass through chat/tool arguments, is never printed and is
stored only owner-private in the shared credential. If the token lacks access
or the Hub is invalid, the active Hub and old token remain; a replacement token
from a normally reported failure is rolled back. If the process is killed or
power is lost immediately after staging a new token, only private state may
remain; the active Hub is unchanged. Connect does not synchronize, copy Local
Drafts or mix knowledge between Hubs.

Status always reports local state first, then best-effort checks the remote head
and count of open PRs targeting the branch. Network loss, missing permissions,
pending errors or a sync conflict make only the affected part unavailable or
blocked. Pull remains explicit. The last synchronized Published commit and a
newly fetched remote commit are distinct states; a conflict must not discard the
local draft base.
