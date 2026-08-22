# Feature Specification: Shared Question Documents

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Complete

## Owner Decisions

- Question is shared Hub knowledge, not machine-private state.
- Use one clean cutover because the private ledger has never been Published;
  do not dual-write, migrate drafts or retain a compatibility layer.
- Question documents live at `questions/<question-id>.md`; navigation lives at
  `questions/index.md` and both participate in the ordinary proposal diff.
- MCP owns Question identity, structured fields, revisions and transitions.
  Generic Ingest/Refresh may declare Questions but cannot freely edit their bytes.
- Answering an exact Question revision creates one proposal containing both a
  Maintainer Guidance revision and the linked Question update. Nothing becomes
  accepted before ordinary Accept.
- MVP Guidance scope is exact `subject-property`. Repository, Domain and Hub
  scopes remain designed but deferred.
- Reuse one existing lifecycle test; do not grow the canonical test count.

## User Scenarios & Testing

### User Story 1 - Share an unresolved Question through Hub (Priority: P1)

As a maintainer, I can review and Accept an Ingest/Refresh proposal containing a
Question, then another machine can discover that Question from the synchronized
Hub without private recovery files.

**Independent Test**: Finalize one proposal with a Question, inspect its Markdown
and index entry, Accept it, remove machine-private Question state, and list/read
the same Question from the exact Hub commit.

**Acceptance Scenarios**:

1. **Given** an evidenced Question declaration, **When** Finalize succeeds,
   **Then** the proposal tree contains one validated Question document and one
   unique navigation target.
2. **Given** the proposal is accepted, **When** Question state is read without
   private ledger files, **Then** the accepted Hub document is the complete
   authority.

### User Story 2 - Answer without changing accepted state early (Priority: P1)

As a maintainer, I can answer an exact Question revision and review one atomic
proposal that creates attributed Guidance and resolves the Question.

**Independent Test**: Prepare an answer proposal, prove the accepted Question
remains open before Accept, inspect both changed documents, Accept, then read the
Question as resolved with its Guidance link.

**Acceptance Scenarios**:

1. **Given** an open Question at revision N, **When** `human:*` answers revision
   N, **Then** one reviewable proposal contains Guidance plus Question revision
   N+1 and no accepted Hub mutation occurs.
2. **Given** that proposal is accepted, **When** the Question is read, **Then**
   it is resolved and links the accepted Guidance.
3. **Given** an answer targets a stale revision, **When** it is submitted,
   **Then** no proposal or Hub mutation is produced.

### User Story 3 - Fail safely at the clean-cutover boundary (Priority: P2)

As an operator, I receive a clear blocking error if accepted Guidance refers to
a Question document that does not exist, rather than silently losing context.

**Independent Test**: Use a Hub fixture with orphan accepted Guidance and assert
that Question preflight stops with regenerate/migrate instructions.

## Requirements

- **AB-QUESTION-001**: Each Question MUST be a bounded MCP-rendered shared Hub
  document at `questions/<stable-id>.md`, indexed once in `questions/index.md`
  and included in ordinary proposal tree/diff/digest review.
- **AB-QUESTION-002**: Stable ID MUST be `question-<24 lowercase hex>` derived
  from SHA-256 of canonical JSON `[1, kind, origin_subject, origin_property,
  scope_key]`; machine-local Hub identity, wording, evidence and timestamps MUST
  NOT affect identity.
- **AB-QUESTION-003**: Dedicated validation MUST own exact fields, bounds, typed
  references and transitions among `open`, `resolved` and `needs-review`.
  Every accepted document edit increments revision exactly once. Generic
  authoring MUST NOT gain broad permission to edit Question bytes.
- **AB-QUESTION-004**: An exact-revision `human:*` answer MUST atomically propose
  an exact-scope Maintainer Guidance revision and the Question update. Accepted
  state MUST remain unchanged until ordinary Accept.
- **AB-QUESTION-005**: Reading/listing Questions MUST be reconstructible from one
  exact Hub commit with no private ledger authority. Cutover MUST reject orphan
  accepted Guidance with explicit recovery direction.
- A new Question MUST have at least one typed owned-item/candidate-evidence
  reference or an explicit human decision request.
- Question documents MUST NOT store raw source, provider dumps, secrets, a
  duplicated concept body or an append-only event ledger.
- Existing proposal, inspection, Accept, Git recovery and secret-detection
  boundaries MUST be reused without a new database, daemon or dependency.

## Key Entities

- **Question Document**: Shared current governance state, immutable origin,
  current subject/property, typed references, limitations and Guidance links.
- **Question Index**: Deterministically rendered navigation with each Question
  target exactly once.
- **Maintainer Guidance**: Attributed exact-scope answer linked to one Question
  revision and created in the same proposal as its transition.

## Edge Cases

- Two declarations derive the same Question ID in one proposal.
- A declaration repeats an existing open Question without changing it.
- A referenced source/item cannot resolve at the proposal's exact Hub tree.
- Question path, frontmatter ID and index target disagree.
- An answer arrives after the Question revision or Hub head changes.
- Guidance creation succeeds in staging but Question transition validation fails.
- Accepted Guidance exists without its referenced Question at clean cutover.
- Machine-private state is missing or contains obsolete ledger files.

## Success Criteria

- **SC-001**: A Question accepted on one machine is fully listable/readable from
  synchronized Hub Markdown on another machine with zero private-ledger recovery.
- **SC-002**: Every accepted answer changes exactly two governed documents in one
  proposal: one Guidance revision and its Question; before Accept, accepted state
  is byte-for-byte unchanged.
- **SC-003**: Duplicate IDs/paths/index targets, invalid references/transitions,
  stale answers and orphan Guidance are rejected before accepted mutation.
- **SC-004**: Private ledger/sidecar authority has zero runtime caller/export;
  the canonical offline gate remains at 50 tests and passes without a new
  dependency, provider, credential boundary or process.

## Non-Goals

- Batch Question resolution or Domain Enrichment orchestration.
- Automatic provider/AWS CLI verification.
- Full conflict-aware answer composition or automatic `needs-review` inference.
- Repository/Domain/Hub-wide Guidance scope.
- Semantic merge, universal claim database, cache service or event ledger.
- Migrating unaccepted private Questions or historical benchmark drafts.
