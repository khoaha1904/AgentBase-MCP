# Feature Specification: Converge Product Contracts

**Feature Branch**: `043-converge-product-contracts`

**Created**: 2026-08-24

**Status**: Product Review

**Input**: Review all twelve AgentBase product areas with the owner, align the
high-level and low-level contracts, then audit implementation against the
accepted result before making runtime changes.

## User Scenarios & Testing

### User Story 1 - Trust one current product contract (Priority: P1)

As the product owner, I can read a high-level outcome and its low-level design
without encountering an older behavior presented as current.

**Acceptance Scenarios**:

1. Each numbered product area is reviewed sequentially and records the owner's
   accepted behavior once at the appropriate level.
2. Superseded baselines and requirement IDs are retired or clearly historical;
   they do not contradict current requirements.
3. Implementation status is stated honestly as implemented, deferred or an
   implementation gap.

### User Story 2 - Reconcile implementation after design (Priority: P1)

As the product owner, I can finish product decisions before code is changed,
then receive one bounded implementation-gap report derived from the accepted
contracts.

**Acceptance Scenarios**:

1. No runtime behavior changes while the twelve-part contract review is active.
2. After all parts are accepted, existing code and requirement-linked tests are
   checked against the resulting contracts.
3. Only confirmed implementation gaps become implementation tasks; matching
   behavior is preserved.

## Requirements

- **FR-001**: Review MUST proceed one numbered product area at a time with owner
  approval before advancing.
- **FR-002**: Each accepted area MUST align its high-level outcome, low-level
  design, current requirements and implementation-status wording.
- **FR-003**: Historical feature and benchmark evidence MUST remain historical
  and MUST NOT override current living contracts.
- **FR-004**: Runtime code MUST NOT change until the twelve-area product review
  is complete and the resulting implementation gaps are reported.
- **FR-005**: Broad behavior, authority, lifecycle or data-model gaps discovered
  during reconciliation MUST return to owner review before implementation.
- **FR-006**: The Repository-reading contract MUST treat a Git repository as one
  graph unit, create or reuse its graph lazily only when exact source is needed,
  and inspect multiple repositories sequentially without a combined graph.
- **FR-007**: A directory containing independent repositories MUST be a routing
  scope rather than a graph identity. Repository selection MUST use explicit or
  unambiguous context and ask the user when ambiguity remains; it MUST NOT scan
  an arbitrary workspace or prebuild every graph.
- **FR-008**: One Git repository MUST have exactly one owner-confirmed primary
  Domain. Monorepo subprojects inherit it; links to another Domain MUST NOT add
  a second Domain membership.
- **FR-009**: A parent directory grouping independent repositories MUST NOT
  become a Repository or Domain automatically. Single and Batch Ingest MAY use
  one user-proposed Domain, but MUST inspect bounded root documentation per
  repository, show material outliers and wait for confirmation before authoring.
- **FR-010**: Concept discovery MUST remain sparse and Agent-reasoned. A
  candidate becomes a concept only when exact evidence supports a stable enough
  identity and independent query or link value; otherwise it becomes embedded
  knowledge, a Question when material, or is omitted from that run.
- **FR-011**: Omission MUST NOT permanently suppress later discovery. Matching
  during authoring MUST use synchronized Published knowledge and the current
  proposal, not unrelated Local Drafts, and candidates MUST remain transient
  rather than becoming a persisted registry or separate review UI.
- **FR-012**: AgentBase MUST author one provider-neutral schema per concept from
  the released Repository, Domain, System, Component, Function, Interface, Flow
  and Resource catalog. Cloud products and source tools MUST remain technology
  metadata rather than multiplying schema types.
- **FR-013**: Internal infrastructure MUST default to embedded knowledge. It MAY
  be promoted to Interface or Resource only when evidence supports independent
  contract, ownership, lifecycle, operational or query value; ambiguous schema
  selection MUST preserve a limitation or Question rather than force a type.
- **FR-014**: Ordinary Hub search/read MUST use only the exact synchronized
  Published state of the active remote Hub profile. Proposal and accepted Local
  Draft state MUST remain available only to review and publication workflows.
- **FR-015**: Without a configured remote Hub, AgentBase MUST remain usable for
  local Code Graph questions but MUST expose no Hub query, Ingest, Refresh or
  OKF Draft authority. Each configured normalized remote URL plus branch MUST
  own an isolated Published clone and Draft workspace that is restored when the
  profile becomes active and never mixed with another profile.
- **FR-016**: A reviewed proposal/change set MUST be the atomic Accept and
  publication unit. Knowledge-item selection occurs before Accept; an accepted
  Local Draft commit is immutable and later correction uses another proposal.
- **FR-017**: A canonical relationship MUST require sufficiently identified
  endpoints plus independent evidence for the interaction. Weak identity or
  incomplete interaction evidence MUST remain a Question/candidate and MUST NOT
  become a dangling or inferred graph edge.
- **FR-018**: Relation discovery during Ingest MUST remain bounded to the
  authorized repository, Published Hub and current proposal. Broader
  cross-repository reconciliation and released provider verification belong to
  explicit Domain Enrichment and MUST NOT run implicitly.
- **FR-019**: The MVP MUST NOT merge or redirect two already-Published concepts.
  A strong duplicate match remains a reviewed Question/merge candidate. Same-
  proposal duplicates MAY coalesce before Accept, and new evidence MAY enrich
  one already-Published canonical concept when no second Published identity is
  being removed.
- **FR-020**: Conflicting source-backed positions MUST coexist with provenance
  until evidence or explicit maintainer direction justifies a change. The MVP
  MUST NOT implement per-item `superseded`/`retracted` states or tombstones;
  reviewed correction/removal MUST use an ordinary proposal whose preview and
  PR identify the exact change, reason and evidence, with Git retaining history.
- **FR-021**: Question governance MUST use only Open, Resolved and Needs Review.
  A maintainer answer MUST remain attributed evidence scoped to the exact
  Question/subject in the MVP. Broader policy changes MUST edit the relevant
  Domain/System knowledge through a normal proposal rather than invoke a broad
  Guidance scope engine.
- **FR-022**: Hub values MUST be snapshot-first: only small, useful,
  non-sensitive observed scalars with exact source and revision/time MAY be
  stored. References remain file-level provenance, not executable locators, and
  ordinary Hub query MUST NOT probe source or provider state.
- **FR-023**: Exact current-source reading MUST occur only when the user asks or
  the snapshot cannot answer the request. It MUST use already-authorized local
  source tools or a separately released bounded repository read with the active
  MCP-managed token, never hidden cloning, `gh`, provider lookup or write-back.
  Freshness remains warning-only and MUST NOT trigger Refresh or deletion.
- **FR-024**: The public `agentbase-scan` workflow MUST inventory Git repository
  roots only inside one explicitly selected workspace, with deterministic
  bounds and no Code Graph indexing. With an active Hub it classifies each
  strong identity as not in Hub, Published unchanged, Published source-advanced
  or ambiguous and shows last-observed context plus suggested next workflows.
- **FR-025**: Scan MUST NOT execute a suggestion automatically. User selection
  routes new repositories to single or Batch Initial Ingest and Published
  repositories to sequential single Refresh. Batch Refresh and mixed Init/
  Refresh execution remain outside MVP. Without a remote Hub, Scan MAY list
  local repositories but MUST state that Hub classification is unavailable.
- **FR-026**: Remote repository file reading is explicitly outside the MVP but
  MUST be retained as the first post-phase query priority. Its later capability
  uses only the active MCP-managed GitHub.com/GitHub Enterprise token, canonical
  Repository identity and bounded file/revision reference; it MUST NOT expose
  credentials, use ambient `gh`, clone repositories or make machine-local paths
  the shared source authority.
- **FR-027**: Scan/status MAY inspect profile-local proposal, Local Draft and
  matching PR metadata solely to prevent duplicate work and suggest review,
  submit, wait or reconcile. These states MUST NOT enter ordinary Hub search or
  read. Independent Repository Init PRs MAY coexist from Published base, while
  same-Repository unpublished proposals retain their exact dependency chain.
- **FR-028**: Installation MUST register MCP and the released seven public plus
  two internal product skills without choosing a Hub or collecting a token. Hub
  URL, target branch and token MUST be configured later through the public Hub
  workflow, with token entry confined to an owner-private terminal flow.
- **FR-029**: Connecting an exactly empty authorized remote repository MAY, only
  after explicit preview/confirmation, perform one direct bootstrap write to
  the configured target branch containing the complete released baseline:
  valid root `index.md`, standard README and exact Hub CI bundle. No knowledge
  proposal is replayed into that bootstrap commit.
- **FR-030**: The empty-remote bootstrap is the only direct target-branch write.
  After it, all knowledge changes use PRs. A non-empty existing Hub that lacks
  or has outdated README/CI receives a support-only Initialization PR and MUST
  NOT be repaired by a direct target-branch write.

## Non-goals

- No model benchmark, remote publication or source-repository mutation during
  contract review.
- No workspace registry, combined multi-repository graph, background indexing,
  daemon or speculative prewarming.
- No attempt to make historical numbered specifications read like current
  living documentation.

## Success Criteria

- **SC-001**: All twelve areas receive explicit owner approval with no known
  contradiction between their high-level and low-level current contracts.
- **SC-002**: Every behavior described as implemented is either supported by
  current implementation evidence or recorded as an implementation gap.
- **SC-003**: The post-review implementation report contains no unresolved
  requirement identity collision or competing current authority.
- **SC-004**: Canonical offline verification passes after any approved
  implementation reconciliation.

## Assumptions

- Existing implementation is evidence, not automatic product authority.
- The current dirty worktree for capabilities 040–042 is preserved.
- Product decisions are recorded as they are accepted; implementation planning
  begins only after the twelve-area review.
