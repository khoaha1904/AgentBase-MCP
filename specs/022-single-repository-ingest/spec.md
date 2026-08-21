# Feature Specification: Single-Repository Initial Ingest

**Feature Branch**: `main`

**Created**: 2026-08-20

**Status**: In progress — catalog 7.0 simplification approved

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
- Catalog `7.0.0` contains a small provider-neutral authoring core. AWS and the
  Terraform family (Terraform plus Terragrunt) classify technology evidence but
  do not decide whether a resource deserves a standalone concept.
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
Terraform-family evidence, then inspect a valid proposal that uses generic roles,
retains exact source references and contains no copied source or graph dump.

**Acceptance Scenarios**:

1. **Given** a repository with a documented purpose, architecture boundaries
   and exact source evidence, **When** Ingest completes, **Then** it proposes
   only candidates that pass both identity and query/link-value gates.
2. **Given** Terraform declares an AWS Lambda, internal SQS queue and EC2 host,
   **When** authoring guidance is requested, **Then** the Lambda may become a
   `Function`, the queue is searchable embedded knowledge in its consumer and
   EC2 remains hosting evidence while independently evidenced workloads become
   `Component` concepts.
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
6. **Given** a resource observation labels its source as Terraform or
   Terragrunt, **When** guidance validates it, **Then** the exact source path
   must match that source tool; CloudFormation/SAM/YAML cannot be relabeled as
   Terraform, and provider resources reached through Terragrunt cite their
   referenced Terraform module file.

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
- **AB-INGEST-010**: A confirmed primary Domain MUST be persisted as one
  owner-evidenced `Repository part-of Domain` relation. Initial Ingest MUST
  derive its proposal evidence digest from the validated guidance request and
  exact repository source state rather than requiring the agent to invent or
  supply an opaque digest.
- **AB-INGEST-011**: For a new Initial Ingest, proposal preparation MUST turn
  each promoted exact or advisory suggested candidate recommendation into an editable OKF skeleton with a
  canonical path, valid document frontmatter and normalized evidence sources.
  It MUST also prepare the Repository, confirmed Domain and required navigation
  without asking the agent to reconstruct OKF document syntax. The concept
  schema defines what knowledge belongs in the concept; the OKF document
  template defines how that knowledge is encoded; the generated skeleton is
  the proposal file the agent enriches before changed-set validation.
  A generated Flow skeleton MUST contain an explicit empty `flow_steps` edit
  point and MUST NOT invent endpoints; normal changed-set validation MUST reject
  it until the agent supplies a non-empty linked, evidenced step sequence.
  A prepared System skeleton MUST carry the confirmed primary-Domain relation
  with owner evidence so canonical inbound Domain navigation is derivable.
- **AB-SCHEMA-030**: Catalog `7.0.0` MUST expose eight provider-neutral Initial
  Ingest roles: `Repository`, `Domain`, `System`, `Component`, `Function`,
  `Interface`, `Flow` and `Resource`. `Entity` and `Metric` remain
  enrichment-only roles; governance documents are workflow-owned rather than
  Initial Ingest choices. Legacy and foreign OKF types remain readable and
  protected, but new authoring MUST use the catalog 7 roles.
- **AB-SCHEMA-031**: One bounded guidance operation MUST accept
  provenance-bearing semantic and structured resource observations, run source
  detector mapping, provider mapping, promotion and generic schema selection,
  and return `exact`, `suggested`, `embedded`, `ambiguous` or `unsupported`.
  A candidate MAY declare one released provider-neutral `suggested_type` as
  transparent intent and MUST declare whether it is proposed as a standalone
  concept or embedded knowledge; embedded knowledge MUST identify its parent.
  The caller MUST NOT supply provider, product or an exact schema assertion.
- **AB-SCHEMA-032**: AWS Profile `2.0.0` MUST classify EC2, Lambda, SQS, SNS,
  EventBridge, S3, RDS and DynamoDB observations as technology evidence without
  automatically turning each resource into a concept or asserting deployed
  state, account, region, ARN or runtime values.
- **AB-SCHEMA-033**: Terraform-family Detector `1.0.0` MUST validate bounded
  source-native resource/module observations, retain exact evidence references
  and treat unresolved type/address indirection as ambiguous rather than
  inventing identity. Detection MUST NOT decide standalone concept promotion.
  A deployable function with exact handler/trigger or lifecycle evidence MAY be
  promoted deterministically to `Function`; other cloud resources default to
  embedded knowledge unless independent boundary evidence supports promotion.
- **AB-SCHEMA-034**: Guidance results MUST identify the catalog, detector and
  provider-profile versions independently, matched evidence, missing evidence,
  technology metadata, promotion outcome and complete selected-schema guidance.
  Semantic-only selection MUST remain advisory. System guidance MUST require a
  separate capability candidate with cooperating concepts; Component MUST
  represent an independently useful workload/build/ownership unit rather than
  the host on which it happens to run.
- **AB-SCHEMA-035**: New AgentBase drafts using a retired vendor/source-tool
  type MUST fail with replacement guidance; arbitrary foreign unknown types
  MUST remain portable, readable and protected.
- **AB-SCHEMA-036**: Promotion MUST be evaluated before rendering. Lambda-like
  independently deployed functions MAY return `exact`; other evidence-bound
  standalone roles MAY return `suggested`; non-promoted cloud resources MUST
  return `embedded` with their parent and sources. Unsupported or conflicting
  promotion evidence MUST remain `ambiguous`/`unsupported`. Suggested skeletons
  require proposal review and MUST NOT be auto-accepted or published.
- **AB-SCHEMA-037**: SQS queues, SNS topics, event buses, tables, buckets,
  databases and compute hosts MUST default to embedded knowledge in the
  Function, Component or System that uses them. A resource MAY become a
  standalone `Interface` when it represents a shared message/API contract, or
  `Resource` when it has cross-boundary use or independently evidenced
  ownership, lifecycle, failure, security or operational value. A declaration
  alone is insufficient promotion evidence.
- **AB-SCHEMA-038**: EC2, VM or physical-host evidence MUST describe hosting and
  technology, not create a `Server` concept. Independently useful services,
  workers or processes evidenced on that host become `Component` concepts. If
  no workload boundary is evidenced, Initial Ingest MUST retain the host as a
  Repository/System reference or limitation rather than inventing a component.
- **AB-SCHEMA-039**: Embedded knowledge MUST remain human-readable and
  searchable in its parent with role, provider-neutral kind, technology and
  exact source references. It MUST NOT receive a concept identity, graph edge
  or standalone Markdown document until later promotion.
- **AB-SCHEMA-040**: Structured observations MUST identify `terraform` or
  `terragrunt` truthfully from their exact source. Terraform observations MUST
  cite `.tf` or `.tf.json`; Terragrunt observations MUST cite
  `terragrunt.hcl`. Terragrunt may evidence module orchestration, but an exact
  provider resource reached through that module MUST cite the referenced
  Terraform file with `source_tool: terraform`. SAM/CloudFormation/YAML is
  unsupported and MUST NOT be accepted under either source-tool label.
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
- **Guidance Result**: Promotion outcome, optional generic schema recommendation,
  parent identity for embedded knowledge, technology metadata, mapping versions
  and matched/missing evidence.
- **Observed Snapshot**: Optional small human-readable value with claim,
  evidence, revision, time and non-current semantics.
- **Initial Ingest Outcome**: Valid partial/full no-change or proposal preview,
  or an Incomplete failure with exact recovery diagnostics.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Supported application/Terraform-family fixtures produce a valid proposal
  preview in which 100% of attributed claims and canonical relations cite at
  least one exact authorized source or explicit owner guidance.
- **SC-002**: Five repeated runs over identical fixed evidence produce the same
  normalized promotion outcomes, schema recommendations, embedded knowledge and
  proposed knowledge tree, excluding declared run IDs and timestamps.
- **SC-003**: Fixture coverage demonstrates all eight Initial Ingest roles,
  enrichment isolation, supported AWS technology classifications, Terraform-family
  exact/embedded/ambiguous/unsupported outcomes and rejection of legacy
  AgentBase authoring types.
- **SC-004**: Partial-coverage, no-change, source-mutation, cleanup-failure,
  first-repair-success and repair-exhausted scenarios each produce the specified
  distinct outcome with zero implicit Accept or Publish operations.
- **SC-005**: On the accepted representative repository and qualified host-agent
  environment, three consecutive opt-in runs produce valid reviewable previews
  with a median elapsed time no greater than 10 minutes. Measurement records
  limitations and is not part of the offline gate. The first catalog 7 run uses
  the real isolated local-Hub Preflight through Inspect lifecycle, requires the
  packaged Initial Ingest tool sequence and never Accepts or publishes.
- **SC-007**: A serverless fixture with internal messaging MUST produce its
  Function/System knowledge without orphan Queue, Topic, Table, Bucket or
  Server concepts, while retaining their searchable exact evidence in a parent.
  A VM fixture with multiple evidenced workloads MUST produce Components for
  those workloads rather than one oversized Server concept.
- **SC-006**: The canonical offline repository verification passes without
  network access, provider credentials, provider CLI calls, model calls or
  source-repository mutation.

## Non-Goals

- Refresh, source-diff reconciliation, removal proposals or OKF freshness.
- Multi-repository Batch Ingest, batch checkpoints or batch PR membership.
- SAM/CloudFormation or mixed frontend/backend benchmark qualification; the
  current MVP accepts Terraform/Terragrunt repositories and keeps qualification
  pinned to the existing Terraform fixture.
- Domain Enrichment, AWS CLI execution, cloud login or deployed-state proof.
- Accept, local Hub commit, PR creation, publication, synchronization or merge.
- Cross-repository discovery, automatic repository clone or remote Code Graph.
- Full repository coverage, a completeness score or a persistent candidate
  database.
- Azure/GCP production profiles, a provider documentation scraper or a second
  source parser.
- Automatic conversion of accepted legacy concepts or dual authoring catalogs.

## Assumptions

- The user supplies an existing local repository and can answer one Domain
  confirmation; the Hub may be local-only or remote-attached.
- The current managed Codebase Memory provider, Hub workspace, proposal
  validation, inspection and recovery boundaries remain reusable unless focused
  tests prove replacement is simpler or safer.
- Existing obsolete proposals can be discarded by the owner; no Published
  concept depends on catalog `5.x` or `6.x`, so catalog 7 is a clean authoring
  cutover without a Hub migration PR.
- Host-agent reasoning is available during real Ingest, but deterministic
  fixtures and canonical verification remain model-free.
- Real benchmark execution requires a separately authorized usable agent
  account and is not run during specification or implementation planning.
