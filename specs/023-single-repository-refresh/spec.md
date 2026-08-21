# Feature Specification: Single-Repository Refresh

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Draft — awaiting implementation approval

**Input**: Refresh the accepted and local-draft OKF contribution of one
authorized repository using changed source, known knowledge gaps and one small
discovery pass. Produce a reviewable Local Draft without accepting, publishing
or silently deleting knowledge.

## Proposed Owner Decisions

- This capability handles one normal Refresh for one canonical Repository.
  Batch Refresh, Domain Enrichment, provider CLI enrichment, scheduled stale
  reporting and an explicit broad/full-refresh mode remain later work.
- Refresh is cumulative rather than completeness-driven. It checks changed
  source first, known Questions/limitations/broken or aging references second,
  and one bounded discovery pass last.
- A valid no-change result is success. A valid partial result is reviewable.
  Neither result implies that the repository was fully understood.
- Missing graph/search evidence never means deletion. Remove, supersede or
  retract is allowed only as an explicit proposal item backed by exact current
  repository evidence and an owner-visible reason.
- Refresh may modify only the current repository's contribution. Evidence from
  another repository, Maintainer Guidance, human-verified content and unknown
  extensions remain protected.
- A shared concept is one flat document, so MVP Refresh may change only
  structured entries with exact current-Repository ownership. Ambiguous shared
  prose or metadata is preserved and reported as a Question/limitation.
- Refresh uses active local `main`: the Published Hub base plus knowledge
  already accepted locally but not yet Published. It never absorbs an
  unaccepted proposal implicitly. An explicit retry resumes/replaces its own
  repairable session rather than creating duplicate knowledge.
- The host agent owns semantic investigation and one bounded correction/repair
  loop. MCP owns repository authority, deterministic validation, source truth,
  protected-content preservation and proposal inspection.

## User Scenarios & Testing

### User Story 1 - Refresh changed knowledge (Priority: P1)

As a maintainer, I want AgentBase to refresh one known repository from its last
observed source revision so useful knowledge changes become a concise Local
Draft without re-ingesting the repository from scratch.

**Why this priority**: It is the smallest useful follow-up to Initial Ingest and
keeps existing Hub knowledge current without interrupting normal repository work.

**Independent Test**: Refresh a known fixture after one source change and
inspect a proposal containing only evidence-backed changes plus preserved
unrelated knowledge.

**Acceptance Scenarios**:

1. **Given** a canonical Repository with a prior observed revision, **When** its
   authorized checkout changes, **Then** Refresh investigates changed paths and
   affected known concepts before any small discovery pass.
2. **Given** changed source supports an update or new useful concept, **When**
   Refresh completes, **Then** one inspectable Local Draft shows the exact
   added/updated knowledge and evidence without Accept or Publish.
3. **Given** no useful knowledge change is found, **When** Refresh completes,
   **Then** it reports successful no-change and creates no duplicate proposal.

---

### User Story 2 - Reconcile gaps without inventing completeness (Priority: P2)

As a maintainer, I want Refresh to revisit known Questions, limitations and
stale or broken references so knowledge can improve gradually even when source
files did not change materially.

**Why this priority**: OKF is cumulative knowledge, not a source snapshot;
known gaps are often more valuable than an unconditional full scan.

**Independent Test**: Refresh an unchanged fixture with one known Question and
one resolvable reference, then inspect a bounded proposal or a truthful partial
result that records what remains unresolved.

**Acceptance Scenarios**:

1. **Given** unresolved Questions or limitations for the repository, **When**
   Refresh runs, **Then** they are prioritized after changed-source impact and
   may produce updates, new evidence or retained Questions.
2. **Given** graph coverage or evidence remains incomplete, **When** useful
   changes are valid, **Then** Refresh produces a partial reviewable draft with
   exact limitations rather than fabricating missing knowledge.
3. **Given** an accepted claim is old, **When** Refresh sees no exact evidence
   that it changed, **Then** it preserves the claim and may report age or an
   unresolved Question; age alone does not authorize mutation.

---

### User Story 3 - Propose explicit removals safely (Priority: P2)

As a reviewer, I want every removal, supersession or retraction to be explicit,
evidenced and grouped in the preview so absence or an agent mistake cannot
silently destroy shared knowledge.

**Why this priority**: Destructive reconciliation is the primary risk that
distinguishes Refresh from Initial Ingest.

**Independent Test**: Refresh a fixture with an exact deletion/replacement and
a second concept missing only from graph results; inspect an explicit lifecycle
proposal for the first and full preservation plus a Question for the second.

**Acceptance Scenarios**:

1. **Given** an exact current-source diff proves a repository contribution was
   removed, **When** Refresh proposes deletion, **Then** the preview names the
   affected concept/contribution, reason, source revision/diff, related
   navigation and any replacement.
2. **Given** foreign-repository evidence still supports the same concept,
   **When** the current repository contribution is removed, **Then** only that
   contribution changes and the shared concept remains.
3. **Given** only graph/search absence or ambiguous evidence, **When** Refresh
   completes, **Then** accepted knowledge is preserved and uncertainty becomes
   a Question or limitation.
4. **Given** a replacement preserves historical value, **When** Refresh
   reconciles it, **Then** the proposal uses explicit superseded/retracted
   lifecycle metadata instead of erasing history.

### Edge Cases

- The repository was renamed, moved or transferred but has one strong canonical
  Repository match.
- Git lineage matches more than one fork or mirror.
- The active Hub has accepted knowledge and an unpublished Local Draft for the
  same repository.
- The working tree is dirty or changes while Refresh is running.
- A source path was renamed while its semantic identity stayed the same.
- A concept contains evidence from both the current and another repository.
- A concept disappears from graph results but its source file is outside the
  graph's supported coverage.
- A prior source reference no longer resolves, but no exact replacement exists.
- One validation repair succeeds while Finalize later detects source mutation.
- Refresh finds no useful change.

## Requirements

### Functional Requirements

- **AB-REFRESH-001**: Refresh MUST bind exactly one authorized local checkout
  to one unambiguous canonical Repository identity. No match MUST route to
  Initial Ingest; ambiguous fork/mirror lineage MUST require owner choice.
- **AB-REFRESH-002**: Normal Refresh MUST investigate in this order: source
  paths/symbols changed since the last observed repository revision, known
  Questions/limitations/broken or aging references, then one bounded discovery
  pass. It MUST NOT require a full repository scan or claim completeness.
- **AB-REFRESH-003**: Refresh MUST use active local `main`, which contains the
  Published Hub base plus locally accepted unpublished knowledge. It MUST NOT
  absorb an unaccepted proposal implicitly. An explicit retry MUST resume or
  replace only its own repairable session and MUST NOT append duplicate knowledge.
- **AB-REFRESH-004**: Refresh MUST change only the current Repository's
  contribution. It MUST preserve foreign-repository evidence, Maintainer
  Guidance, human-verified content, accepted live-claim identities and unknown
  extensions unless a separately governed operation authorizes change.
- **AB-REFRESH-005**: Missing graph/search evidence, an omitted authored file or
  elapsed time MUST NOT authorize deletion. Every proposed removal,
  supersession or retraction MUST carry an explicit lifecycle action, reason and
  exact current-source evidence.
- **AB-REFRESH-006**: A removal preview MUST identify the affected concept or
  source contribution, evidence revision/diff, affected relationships and
  navigation, and replacement when present. If foreign evidence remains, only
  the current Repository contribution MAY be removed.
- **AB-REFRESH-007**: A valid no-change result MUST be successful and MUST NOT
  create a duplicate proposal. A valid partial result MUST expose exact
  limitations and remain reviewable. Integrity, authority, cleanup or source
  mutation failure MUST be Incomplete and not acceptable.
- **AB-REFRESH-008**: Every newly added or changed current-repository source span
  MUST resolve beneath the authorized checkout to a current regular file and
  valid line range. Foreign-repository sources MUST NOT be dereferenced without
  separate authority.
- **AB-REFRESH-009**: Refresh MAY correct one retryable pre-state guidance
  request and MAY perform one independent post-state content repair. It MUST NOT
  blindly retry Prepare, Finalize, integrity, authority, transport or uncertain
  state failures.
- **AB-REFRESH-010**: A completed Refresh MUST output either successful
  no-change or one reviewable Local Draft grouped as Added, Updated, Removed,
  Superseded/Retracted and Questions/Limitations. It MUST NOT Accept, Publish,
  run provider CLI enrichment or mutate remote Hub state.
- **AB-REFRESH-011**: Only a successful Refresh contribution MAY advance that
  Repository's observed source revision and observed time in the proposal.
  Freshness metadata is a warning aid, not an automatic action or truth score.
- **AB-REFRESH-012**: The public Refresh workflow MUST be agent-operated through
  a packaged skill and bounded MCP operations. Canonical verification MUST be
  deterministic and offline; a model-backed qualification remains explicit.

### Key Entities

- **Refresh Target**: The canonical Repository, authorized checkout, current
  source state and last successfully observed contribution state.
- **Refresh Baseline**: The accepted Hub tree combined with the related current
  Local Draft that the new proposal builds upon.
- **Contribution Change**: An evidence-backed addition, update, removal,
  supersession, retraction, Question or limitation owned by the current Repository.
- **Refresh Result**: Successful no-change, reviewable Local Draft, or
  Incomplete run with exact diagnostics and recovery boundary.

## Success Criteria

### Measurable Outcomes

- **SC-001**: In deterministic scenarios, 100% of normal Refresh investigations
  follow Changed Source → Known Gaps → Bounded Discovery and never require a
  full scan to finish successfully.
- **SC-002**: 100% of removal/supersession/retraction preview entries include an
  explicit action, reason and exact evidence; zero are inferred only from
  omission or search absence.
- **SC-003**: 100% of shared-concept scenarios preserve foreign-repository,
  human and unknown-extension content byte-for-byte outside the authorized
  current contribution.
- **SC-004**: Deterministic verification covers useful change, valid no-change,
  partial success, explicit replacement/removal, ambiguous absence, invalid
  source span and failed-repair recovery without network or model calls.
- **SC-005**: A representative model-backed Refresh qualification, when
  separately authorized, finishes in no more than 10 minutes and produces a
  truthful reviewable/no-change result without Accept or Publish.

## Assumptions

- Capability 022 Initial Ingest, canonical Repository identity, Local Draft,
  Questions, catalog 7 guidance and proposal inspection remain available.
- The authorized checkout and local Hub are readable; remote publication and
  provider credentials are unnecessary.
- Normal Refresh is the MVP. Broad/full Refresh, multi-repository batches,
  Domain Enrichment, provider CLI enrichment and scheduled freshness reports
  are intentionally deferred.
- Existing whole-subject omission deletion is legacy behavior to replace, not
  an accepted product shortcut.
