# Feature Specification: Single-Repository Initial Ingest

**Feature Branch**: `main`

**Created**: 2026-08-20

**Status**: Implemented — external qualification pending

**Input**: Build the first independently useful AgentBase Ingest slice: read one
authorized local repository, confirm its primary Domain, discover a sparse set
of useful concepts from exact evidence, select provider-neutral schemas and
produce one reviewable Hub proposal without accepting or publishing it.

## Owner Decisions

- The new high-level and low-level AgentBase design is the intended product
  contract. Existing code is reusable evidence, not a constraint; cohesive
  replacement is allowed when it gives a simpler long-term boundary.
- Phase 1 handles exactly one local repository. Batch Ingest, Refresh, Domain
  Enrichment and OKF freshness reporting are later capabilities.
- A public Ingest skill orchestrates the workflow. MCP tools provide bounded
  graph, source, guidance, Hub and validation operations; AgentBase does not add
  a model SDK or ask the user to write an authoring prompt.
- The user confirms one primary Domain after a bounded README/document check.
  Repository evidence may warn about a mismatch, but neither AI nor user input
  silently overrides the confirmation boundary.
- Concept discovery is sparse and cumulative. A useful valid proposal may be
  incomplete; later Refresh can build more knowledge.
- A candidate needs stable identity and independent query/link value. There is
  no numeric confidence or completeness score.
- Catalog `6.0.0` contains provider-neutral architectural roles. AWS and
  Terraform knowledge are separately versioned mapping profiles used in one
  deterministic guidance operation.
- Hub knowledge stores claims, evidence and references, not a second source
  tree or Code Graph. A small non-sensitive value may be shown only as an
  attributed observation, never as timeless current truth.
- Ingest may perform at most one automatic repair after validation and always
  stops at proposal preview. Accept and Publish remain separate authorizations.
- There are no Published concepts to migrate. The owner will discard obsolete
  local/remote proposals, so this is a clean cutover with no dual catalog or
  content converter.

## User Scenarios & Testing

### User Story 1 - Confirm repository and Domain (Priority: P1)

As a maintainer, I want Ingest to identify the selected local repository, read
only its main introductory documents and ask me to confirm its primary Domain
before expensive investigation begins.

**Why this priority**: Repository identity and Domain are the stable anchors
for every concept and source contribution produced later.

**Independent Test**: Run preflight against a fixture repository and an active
Hub containing zero, one or ambiguous matching Domains; inspect the proposed
assignment, evidence and warning without creating a proposal.

**Acceptance Scenarios**:

1. **Given** a local repository whose root documentation supports an existing
   Hub Domain, **When** Ingest starts, **Then** the user sees that exact Domain,
   supporting repository paths and a request to confirm or correct it.
2. **Given** the supplied Domain conflicts with repository documentation,
   **When** preflight runs, **Then** the mismatch is visible and investigation
   does not begin until the user explicitly confirms a final Domain.
3. **Given** no strong prior Repository match exists, **When** the user confirms
   Domain, **Then** one new canonical Repository identity is assigned for Hub
   knowledge while checkout names, paths and remotes remain identity hints.

---

### User Story 2 - Produce a sparse evidence-backed proposal (Priority: P1)

As a maintainer, I want Ingest to map the repository, investigate only useful
candidates, and produce linked OKF knowledge that is concise enough to review
and still tells me where each claim came from.

**Why this priority**: This is the first end-to-end product outcome and replaces
the current manual gap between Code Graph use and OKF proposal authoring.

**Independent Test**: Ingest a supported fixture containing application and
Terraform evidence, then inspect a valid proposal that uses generic roles,
retains exact source references and contains no copied source or graph dump.

**Acceptance Scenarios**:

1. **Given** a repository with a documented purpose, architecture boundaries
   and exact source evidence, **When** Ingest completes, **Then** it proposes
   only candidates that pass both identity and query/link-value gates.
2. **Given** Terraform declares an AWS Lambda, SQS queue and EC2 instance,
   **When** authoring guidance is requested, **Then** the proposed concept types
   are `Function`, `Queue` and `Server`, with separately attributed AWS,
   product, Terraform and source-resource metadata.
3. **Given** a claim discovered through the Code Graph, **When** it enters the
   proposal, **Then** it cites an exact authorized repository source; a graph
   summary without source evidence remains a signal, limitation or Question.
4. **Given** a directly visible, small non-sensitive scalar or identifier is
   useful to a human reader, **When** the agent includes it, **Then** it is
   labeled as an observation with source revision and time; omitting it remains
   valid and no secret, source block, config dump or provider response is stored.
5. **Given** the authored change is valid, **When** Ingest exits, **Then** the
   user receives one bounded proposal preview with added/updated knowledge,
   Questions and limitations, and no local Accept or remote publication occurs.

---

### User Story 3 - Finish safely with partial evidence (Priority: P2)

As a maintainer, I want useful knowledge to survive limited graph coverage while
integrity or validation failures stop safely and tell me what can be retried.

**Why this priority**: Requiring complete discovery would make Ingest slow and
fragile, while treating runtime failure as partial success would make the Hub
untrustworthy.

**Independent Test**: Exercise one fixture with an unsupported source area and
one fixture with source mutation or invalid output; the first produces a valid
partial preview and the second produces an Incomplete result that cannot be
accepted.

**Acceptance Scenarios**:

1. **Given** graph coverage is incomplete but bounded direct source evidence
   supports useful candidates, **When** Ingest finishes, **Then** the proposal
   is marked partial with exact limitations and remains reviewable.
2. **Given** an important ambiguity cannot be resolved within the investigation
   budget, **When** Ingest finishes, **Then** it becomes a bounded Question or
   limitation rather than an invented claim or another unbounded reasoning loop.
3. **Given** source changes during the run, repository authority is invalid,
   provider cleanup is uncertain or proposal integrity fails, **When** the
   failure is detected, **Then** the run is Incomplete and exposes no
   queryable, acceptable or publishable result.
4. **Given** deterministic validation fails, **When** the one allowed repair
   attempt also fails, **Then** the repairable workspace and exact diagnostics
   are retained for explicit retry without automatic Accept or Publish.

### Edge Cases

- A checkout is renamed, moved or transferred to another organization but has
  a strong alias match to an existing Repository identity.
- A fork or mirror shares Git lineage but cannot be identified uniquely.
- Root documentation is absent, contradictory, future-facing or links to a
  large documentation tree.
- Two candidates have the same display name but different strong source-native
  identities, or only a weak prose/name similarity.
- One source observation maps to an unsupported provider product while its
  generic architectural role is still evidenced.
- Terraform variable indirection hides a name, ARN, account or region.
- A graph query is truncated or one language is unsupported, but exact bounded
  source remains available.
- The repository has no useful knowledge change within the bounded run.
- A candidate resembles an existing protected Hub concept but evidence is not
  strong enough to merge it.
- A proposed observed value is multiline, large, secret-like or lacks exact
  provenance.

## Requirements

### Functional Requirements

- **AB-INGEST-001**: Initial Ingest MUST bind exactly one explicit existing
  local repository root, MUST stay inside that authority and MUST NOT clone or
  investigate another repository implicitly.
- **AB-INGEST-002**: Preflight MUST read a bounded set of root introductory
  documents, compare a proposed primary Domain with active Hub Domains, show
  supporting paths and mismatches, and require explicit user confirmation
  before full investigation.
- **AB-INGEST-003**: Initial Ingest MUST execute the ordered stages Preflight,
  Discover, Investigate, Author and Validate, with deterministic boundaries and
  no more than one automatic validation-repair attempt.
- **AB-INGEST-004**: Discovery MUST use the private disposable Code Graph as a
  map and MUST resolve attributed claims and relations to exact authorized
  repository evidence. Raw graph records, source blocks and private cache state
  MUST NOT enter Hub knowledge.
- **AB-INGEST-005**: Every promoted candidate MUST have a stable identity and
  independent query/link value. Missing either gate MUST result in bounded
  further evidence, a Question/limitation or discard, never a numeric score or
  fabricated claim.
- **AB-INGEST-006**: Initial Ingest MUST perform one bounded existing-concept
  match pass over the current proposal and active local Hub. Only strong
  identity evidence may reuse an existing concept; name or prose similarity
  alone MUST NOT auto-merge.
- **AB-INGEST-007**: A successful run MAY be explicitly partial and MUST report
  concrete coverage limitations. Source/authority mutation, cleanup uncertainty
  or unresolved integrity failure MUST produce an Incomplete result that cannot
  be queried, accepted or published.
- **AB-INGEST-008**: A valid no-change result MUST be successful. A valid change
  MUST end in one inspectable proposal preview and MUST NOT Accept, publish,
  invoke a provider CLI or request provider credentials.
- **AB-INGEST-009**: The public Ingest workflow MUST be agent-operated through a
  packaged skill and bounded MCP operations; users MUST NOT have to construct
  an authoring prompt and canonical verification MUST NOT require a model call.
- **AB-SCHEMA-030**: Catalog `6.0.0` MUST expose exactly the 22 approved
  provider-neutral roles: `Repository`, `Domain`, `Domain Entity`, `System`,
  `Metric`, `Business Flow`, `Maintainer Guidance`, `Software Component`,
  `Service`, `Function`, `API Surface`, `API Endpoint`, `Event`, `Server`,
  `Database`, `Database Table`, `Queue`, `Object Storage`, `Infrastructure
  Definition`, `Infrastructure Module`, `Deployment` and `Cross-Repository
  Relationship`. It MUST retire `AWS Lambda`, `AWS SQS Queue` and `Terraform
  Module` from new AgentBase authoring while preserving readable unknown
  foreign OKF types.
- **AB-SCHEMA-031**: One bounded guidance operation MUST accept
  provenance-bearing semantic and structured resource observations, run source
  detector mapping, provider mapping and generic schema selection, and return
  exact/ambiguous/unsupported results without trusting caller-supplied provider,
  product or schema guesses.
- **AB-SCHEMA-032**: AWS Profile `1.0.0` MUST map EC2, Lambda, SQS, S3, RDS and
  DynamoDB table observations to generic roles and technology metadata without
  asserting deployed state, account, region, ARN or runtime values.
- **AB-SCHEMA-033**: Terraform Detector `1.0.0` MUST validate bounded
  source-native resource/module observations, retain exact evidence references
  and treat unresolved type/address indirection as ambiguous rather than
  inventing identity.
- **AB-SCHEMA-034**: Guidance results MUST identify the catalog, detector and
  provider-profile versions independently, matched evidence, missing evidence,
  technology metadata and complete selected-schema guidance.
- **AB-SCHEMA-035**: New AgentBase drafts using a retired vendor/source-tool
  type MUST fail with replacement guidance; arbitrary foreign unknown types
  MUST remain portable, readable and protected.
- **AB-CLAIM-005**: A small directly evidenced non-sensitive scalar or
  identifier MAY be retained as an optional observed snapshot only with its
  claim, exact source, source revision and observed time. It MUST be bounded,
  labeled non-current and omitted when secret-like, uncertain or unnecessary.
  A snapshot MUST be one scalar or single-line identifier whose UTF-8 encoding
  is at most 256 bytes; proposal review remains the final sensitivity guard.
- **AB-LOCAL-HUB-016**: Hub MUST assign a canonical Repository ID once and reuse
  it through strong stored aliases or source-native identity evidence. Current
  checkout path, display name, remote URL and root commit MUST remain hints and
  MUST NOT be recomputed as canonical Hub identity on each run.

### Key Entities

- **Repository Identity Resolution**: One canonical Hub Repository ID plus
  current checkout hints, match outcome and ambiguity.
- **Domain Preflight**: Proposed/confirmed Domain, source paths, existing-Hub
  match and mismatch warnings.
- **Evidence Observation**: A semantic or structured resource fact bound to an
  evidence ID and exact repository reference.
- **Candidate**: Temporary proposed identity, supporting evidence, independent
  query/link value and unresolved ambiguity; never a Hub entity.
- **Guidance Result**: Generic schema recommendation, technology metadata,
  mapping versions, matched/missing evidence and selection status.
- **Observed Snapshot**: Optional small human-readable value with claim,
  evidence, revision, time and non-current semantics.
- **Initial Ingest Outcome**: Valid partial/full no-change or proposal preview,
  or an Incomplete failure with exact recovery diagnostics.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Supported application/Terraform fixtures produce a valid proposal
  preview in which 100% of attributed claims and canonical relations cite at
  least one exact authorized source or explicit owner guidance.
- **SC-002**: Five repeated runs over identical fixed evidence produce the same
  normalized candidate outcomes, schema recommendations and proposed knowledge
  tree, excluding declared run IDs and timestamps.
- **SC-003**: Fixture coverage demonstrates all 22 authorable catalog roles,
  all six AWS mappings, Terraform exact/ambiguous/unsupported outcomes and 100%
  rejection of the three retired AgentBase authoring types.
- **SC-004**: Partial-coverage, no-change, source-mutation, cleanup-failure,
  first-repair-success and repair-exhausted scenarios each produce the specified
  distinct outcome with zero implicit Accept or Publish operations.
- **SC-005**: On the accepted representative repository and qualified host-agent
  environment, three consecutive opt-in runs produce valid reviewable previews
  with a median elapsed time no greater than 10 minutes. Measurement records
  limitations and is not part of the offline gate.
- **SC-006**: The canonical offline repository verification passes without
  network access, provider credentials, provider CLI calls, model calls or
  source-repository mutation.

## Non-Goals

- Refresh, source-diff reconciliation, removal proposals or OKF freshness.
- Multi-repository Batch Ingest, batch checkpoints or batch PR membership.
- Domain Enrichment, AWS CLI execution, cloud login or deployed-state proof.
- Accept, local Hub commit, PR creation, publication, synchronization or merge.
- Cross-repository discovery, automatic repository clone or remote Code Graph.
- Full repository coverage, a completeness score or a persistent candidate
  database.
- Azure/GCP production profiles, a provider documentation scraper or a second
  source parser.
- Conversion of existing drafts, dual catalog compatibility or automatic Hub
  migration.

## Assumptions

- The user supplies an existing local repository and can answer one Domain
  confirmation; the Hub may be local-only or remote-attached.
- The current managed Codebase Memory provider, Hub workspace, proposal
  validation, inspection and recovery boundaries remain reusable unless focused
  tests prove replacement is simpler or safer.
- Existing obsolete proposals can be discarded by the owner; no Published
  concept depends on catalog `5.x` vendor-specific types.
- Host-agent reasoning is available during real Ingest, but deterministic
  fixtures and canonical verification remain model-free.
- Real benchmark execution requires a separately authorized usable agent
  account and is not run during specification or implementation planning.
