# 05.06 — Capability requirements

This file contains normative requirements enforced by the shared OKF authoring
runtime. Capability-specific indexes in Schema Selection, Concept Discovery and
Observed Snapshots route to the relevant groups without copying their IDs.
Google OKF v0.2 is the portable format; AgentBase lifecycle fields and types are
producer conventions.

Normative OKF source is pinned to commit
`3fcbb9f828c2f23d109c855ee403c3a4c81f3a96`:
<https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md>.

## Read selectively

This page is not required startup context. Use the relevant section below;
follow its linked owner rather than loading unrelated sections.

- [Repository proposal lifecycle](#repository-proposal-lifecycle)
- [Observed values](#observed-values)
- [Refresh contribution lifecycle](#refresh-contribution-lifecycle)
- [Concrete schema catalog](#concrete-schema-catalog)
- [Single-repository Initial Ingest](#single-repository-initial-ingest)

## Repository proposal lifecycle

- **AB-MVP-008** — The current host coding agent performs synthesis through the
  internal supporting `agentbase-okf` skill after a public workflow prepares
  the exact workspace; AgentBase adds no model SDK or model key.
- **AB-MVP-009** — Hub Prepare byte-copies current knowledge into an isolated
  proposal and never mutates the shared `okf/` bundle.
- **AB-MVP-010, AB-MVP-011** — Concept files have bounded parseable YAML
  frontmatter and non-empty `type`; reserved files follow OKF v0.2, root
  `index.md` declares `okf_version: "0.2"`, and ordinary Markdown links provide
  progressive disclosure. IDs are bundle-relative paths except the compact
  Profile Domain concept at `domains/<slug>/index.md`, whose canonical identity
  is the external selector `domains/<slug>`.
- **AB-MVP-012** — New generated concepts are honest drafts with
  `generated.by: agentbase/<version>`, meaningful generation time, normalized
  sources and no invented verification.
- **AB-MVP-013** — Unknown types/extensions round-trip; broken links warn rather
  than authorize invented concepts.
- **AB-MVP-014** — Previous generated knowledge may guide continuity but is not
  independent evidence and cannot increase trust by repetition.
- **AB-MVP-015** — Finalization binds base/evidence/tree digests, validates
  conformance/producer rules and reports created, modified, preserved, allowed
  owned-draft deletions and prohibited deletions.
- **AB-MVP-016** — Durable correction/defer is a linked `Maintainer Guidance`
  concept authored by `human:<id>`, never a hidden sidecar or text marker.
- **AB-MVP-017** — A stable defer remains active until the same maintainer
  directive is removed or explicitly set to `reopen`.
- **AB-MVP-018** — Only an explicit unverified `agentbase/` draft is mutable;
  every other concept is protected byte-for-byte and unknown values survive
  owned-draft rewrites.
- **AB-MVP-019** — Apply rejects stale base, changed generated tree, invalid
  proposal, protected mutation and prohibited deletion; only an explicitly
  diffed owned-draft deletion is allowed.
- **AB-MVP-020** — State changes use one repository-local atomic lock, a complete
  sibling next bundle and phase manifest with deterministic checkpoint recovery.
- **AB-MVP-021** — Focused proposal tests prove evidence-backed linked changes, linked drafts, guidance/defer, allowed deletion, stale
  rejection and recovery.
- **AB-MVP-022** — Historical comparisons may record cost and fact coverage; no unmeasured speed threshold is
  a product claim.
- **AB-MVP-023** — Root `index.md` carries base OKF frontmatter; under compact
  Profile 1.0 each Domain `index.md` carries its Domain concept frontmatter and
  navigation body. `shared/index.md` is navigation only. Repository,
  `knowledge/` and `questions/` category indexes are not authored Hub files.
  Legacy and foreign valid indexes remain readable under their admitted profile.

## Observed values

- **AB-CLAIM-001 (retired)** — Legacy distinct live-claim identity; superseded
  by AB-VALUE-001 without reassigning this stable ID.
- **AB-CLAIM-002 (retired)** — Legacy scalar-forbidden semantic live locator;
  superseded by snapshot-first AB-VALUE-002/004.
- **AB-CLAIM-003 (retired)** — Legacy live-claim policy separation; superseded
  by AB-VALUE-003.
- **AB-CLAIM-004 (retired)** — Legacy target-kind vocabulary; removed by the
  clean cutover and not reassigned.
- **AB-CLAIM-005 (retired)** — Legacy optional live-claim snapshot; superseded
  by the first-class bounded contract AB-VALUE-002/005.
- **AB-VALUE-001** — Distinct observed values about one subject/property retain
  their own stable identity, role and provenance. Conflict never silently merges
  observations or selects a canonical winner.
- **AB-VALUE-002** — A useful non-sensitive implementation/configuration or
  provider-observed operational value
  may be stored in `agentbase.observed_values` as one bounded scalar/single-line
  identifier. It binds a source, exact source revision/digest and
  RFC3339 observation time and is always presented as observed, never current.
- **AB-VALUE-003** — Durable policy and explicit human decisions may contain a
  literal only as separately attributed Maintainer Guidance. They remain
  distinguishable from documentation, implementation, configuration and
  provider observations.
- **AB-VALUE-004** — One normalized file-level Repository source may support
  multiple observed values; an optional line span is evidence at the observed
  revision, not a durable locator. The contract has no symbol/function/config
  target or resolver instruction. Explicit current-value requests use ordinary
  authorized MCP source reading.
- **AB-VALUE-005** — Observed values are finite number/boolean/string scalars of
  at most 256 UTF-8 bytes and one line. Multiline, oversized and obviously
  secret-like candidates are filtered with a warning while safe authoring
  continues; an unsafe entry present in an authored bundle fails proposal
  validation. Query redacts only that value. Proposal review remains the final
  sensitivity gate. Values without query value are omitted rather than copied
  for coverage.
- **AB-VALUE-006** — An observed value belongs to the concept containing it;
  `subject` must equal that concept's canonical identity. MCP deterministically
  creates new IDs and Refresh/Enrichment preserves a matched stream ID,
  including reviewed source-file moves and later provider observations.
- **AB-VALUE-007** — Clean repository evidence requires a commit with
  `dirty: false` and null digest. Dirty evidence requires a digest plus current
  HEAD when one exists; an unborn repository uses null commit plus digest.
  Observation time is always required.
- **AB-VALUE-008** — Provider-derived values enter only a confirmed Domain
  Enrichment proposal. One normalized provider-observation source may support
  multiple bounded operational values with role `provider` and retains released profile version, confirmed
  authority/location, native resource identity, observation time and evidence
  digest without raw response or credential context. Canonical external identity
  fields remain solely in Part 06 metadata and are not duplicated as values.
  Source scope remains stable across observations; evidence digest/time update
  and are recomputable from persisted normalized source metadata plus associated
  observed entries.
- **AB-VALUE-009** — An Ingest/Refresh Question declaration may reference only
  an existing `agentbase.observed_values` entry on the same subject using its
  exact token-shaped property, role and source ID. MCP tool schemas expose this
  grammar and binding requirement. When no matching observed value exists, the
  agent omits the declaration and keeps the uncertainty as concept prose or a
  limitation; it does not invent an observed value merely to create a Question.
- Observed-value IDs are bundle-unique and Refresh omission cannot remove an
  accepted ID. A reviewed Refresh may update exact attributable value/source
  state; protected knowledge and human Guidance keep normal lifecycle rules.

## Refresh contribution lifecycle

- A Repository concept may carry `agentbase.repository.observed_source` with the
  exact clean commit or dirty digest and observation time. It is a continuity
  checkpoint and freshness warning aid, not a truth score or copied source.
- A Repository may also carry one MCP-owned
  `agentbase.repository.refresh_coverage` value while Refresh coverage is
  partial. It contains only partial status, bounded omitted-path count,
  current-campaign Coverage pass count, limitations and observation time.
  Refresh may change this governed lifecycle field without making other unknown
  `agentbase.repository` fields mutable.
- Refresh validates every added or changed current-repository source span
  against the authorized checkout. Foreign sources stay as references and are
  not dereferenced without separate authority.
- Shared concepts retain foreign evidence and ambiguous human-readable prose.
  Only structured, exactly attributable contributions may be reconciled; any
  unresolved ownership or evidence gap remains a Question or limitation.

## Concrete schema catalog

- **AB-SCHEMA-001** — MCP exposes one explicit catalog version and target OKF
  version. Every schema gives purpose, specificity, evidence criteria, path hint,
  required frontmatter, body guidance, limitations and allowed links.
- **AB-SCHEMA-002** — Selection is advisory and matches graph plus authorized
  manifests, infrastructure, documentation and source evidence; it exposes
  matched/missing evidence and never fabricates a fact.
- **AB-SCHEMA-003** — Create only observed useful instances and required root
  navigation.
  One schema may yield many concepts and unused schemas yield no scaffolds.
- **AB-SCHEMA-004** — Validation layers base OKF conformance, common AgentBase
  draft/provenance rules and the selected concrete schema. Missing evidence is a
  limitation or failure, never a placeholder claim.
- **AB-SCHEMA-005, AB-SCHEMA-006** — Unknown OKF types/extensions remain valid
  and protected. The catalog is distinct from MCP input schemas and provider
  graph schemas; raw graph data is never copied wholesale into Hub.
- **AB-SCHEMA-007** — Catalog 7.0 contains eight Initial Ingest roles:
  Repository, Domain, System, Component, Function, Interface, Flow and Resource.
  Entity and Metric are enrichment-only roles. Maintainer Guidance and Question
  are workflow-owned governance documents, not architecture choices. Legacy and
  foreign types remain readable through open-world OKF compatibility.
- **AB-SCHEMA-008** — Selection recommends the smallest independently useful
  type supported by evidence. Concrete implementation detail remains inside its
  useful parent unless an independent contract, ownership, lifecycle, failure,
  operational, audience, reading or graph boundary is evidenced. Under compact
  Profile 1.0 the Repository dossier is the default parent for repository-local
  knowledge.
- **AB-SCHEMA-009** — Concrete concepts preserve provenance and important
  uncertainty. Cross-repository relationships need evidence for both endpoints
  and the relationship.
- **AB-SCHEMA-010** — Current catalog `7.0.0` provides bounded investigation,
  semantic metadata, relationship and optional-enrichment guidance without
  provider or source-tool schema types.
- **AB-SCHEMA-011** — Guidance distinguishes evidence-required metadata from
  optional enrichment; absent or contradictory evidence never authorizes an
  invented value.
- **AB-SCHEMA-012** — MCP validates a bounded caller-supplied concept set without
  reading caller-selected filesystem paths. Each supplied relationship identity
  is unique; every declared target exists and has a resolving relative or
  absolute bundle-relative Markdown link. A catalog-unknown relationship stays
  portable and is reported unjudged rather than rejected.
- **AB-SCHEMA-013** — Initial Ingest requests complete guidance once with
  bounded candidates and exact semantic/resource observations. Source-less
  signals remain a legacy fine-grained/Refresh aid and are not accepted by the
  new Initial Ingest preparation path.
- **AB-SCHEMA-014** — MCP can validate up to 64 caller-supplied concepts, 256 KiB
  each and 4 MiB total, in one content-only bundle call. It reports per-concept
  draft/schema failures together with cross-document relationship failures and
  never reads a caller-selected output path.
- **AB-SCHEMA-015** — Guidance separates technology detection from promotion.
  Semantic evidence may support one advisory catalog-7 role but incidental role
  words never override the standalone/embedded boundary or reject an explicit
  evidence-bound suggested role. Keyword matches are diagnostics, not validity
  gates. Repository names and benchmark identities are never selection rules.
- **AB-SCHEMA-016** — Compact canonical placement distinguishes Domain
  `domains/<slug>`, Repository `<home>/repositories/<slug>`, Question
  `<home>/questions/<id>` and all other standalone types
  `<home>/knowledge/<slug>`. Frontmatter type classifies role; links express
  relationships and evidence. Entity/Metric remain enrichment-only roles.
- **AB-SCHEMA-017** — Related operations and events share one Interface when
  they form a consumer or cross-boundary contract. Implementation-only handlers,
  routes and infrastructure declarations stay in their useful parent.
- **AB-SCHEMA-018** — Domain is optional and never inferred from a repository
  name. Repository concepts retain source-specific knowledge and link to
  canonical entities without copying their contracts. Existing Open Question
  concepts remain readable but are not recommended for new authoring.
- **AB-SCHEMA-019** — Newly authored known AgentBase schemas store only one
  canonical direction for `part-of`, `provides`, `consumes`, `depends-on`,
  `triggered-by`, `publishes-to`, `reads-from`, `writes-to`, `implemented-in`,
  `declared-by`, `deployed-as` and `runs-on`. MCP derives inbound navigation rather than
  persisting inverse duplicates. Legacy and foreign predicates remain readable
  and unjudged.
- **AB-SCHEMA-020** — Every new canonical relationship references one or more
  stable source IDs from the owning concept. Business Flow `flow_steps` identify
  contiguous order, exact endpoints, one canonical action, sync/async mode and
  evidence. Released Flow guidance exposes the exact
  `order/source/action/target/mode/evidence` serialized shape. Invalid endpoints,
  modes, evidence or known-schema predicates fail authoring validation with an
  actionable diagnostic. Guidance states that `source` and `target` are
  identities of supplied concepts; embedded knowledge and free text are not
  endpoints and are not promoted merely to complete a Flow.
- Flow-specific clarification for `AB-INGEST-011`: Initial Ingest preparation renders editable skeletons for
  promoted candidates. A Flow skeleton contains `flow_steps: []` as an explicit
  edit point because endpoints cannot be inferred safely; preparation may return
  that skeleton, but normal changed-set/final proposal validation rejects it
  until the agent supplies non-empty linked and evidenced steps.
- **AB-SCHEMA-021** — `validate_okf_changes` accepts 1–64 full changed concepts
  and at most 512 unchanged identity/path/type target summaries. Validation has
  no dependency on total Hub size and receives no unchanged concept body.
- **AB-SCHEMA-022** — Architecture nodes and useful knowledge units are not
  forced into technology-shaped granularity. Operationally independent
  Functions may remain concepts when they pass the compact independent-reading
  gate; implementation-only handlers stay in their dossier/parent. Compute
  hosts are hosting evidence; evidenced workloads do not become children of an
  automatically authored Server concept.
- **AB-SCHEMA-023** — A persisted concept identity is its normalized path
  relative to the OKF root with `.md` removed, except compact Domain
  `domains/<slug>/index.md` normalizes to `domains/<slug>`. Changed concepts and
  unchanged target summaries MUST use the canonical identity; validation rejects
  ephemeral type-prefixed aliases or paths beginning with the outer `okf/`
  directory.
- **AB-SCHEMA-024** — Legacy `confirmed_domain` accepts at most one exact
  owner-confirmed `domains/<slug>` identity/title and translates to the grouped
  one-Domain home/participation form. Profile authoring uses the bounded home
  plan. Owner guidance is deterministic; absent input never authorizes Domain
  home or participation inference.
- **AB-SCHEMA-025** — Product and authoring language distinguishes a reusable
  catalog Concept Schema/template from a repository-specific Concept Instance.
  One schema may yield many instances; each instance declares one catalog type.
- **AB-SCHEMA-026** — Enrichment-only `Entity` represents a stable evidenced business
  object or value identity shared across useful contracts, flows or systems.
  An implementation class or data structure without that boundary remains in
  its useful parent.
- **AB-SCHEMA-027** — `Metric` represents a stable named measure and evidenced
  definition, producer or calculation. A current change-prone numeric
  observation is not required and remains a bounded observed value rather than
  timeless Metric prose.
- **AB-SCHEMA-028** — Promotion precedes schema selection. One detected resource
  may be embedded in a parent, or promoted once to the smallest supported role;
  detection never creates parallel parent/specialization concepts by itself.
- **AB-SCHEMA-029** — Catalog 7.0 is a clean authoring cutover because no
  catalog-6 concepts were Published. Unknown and legacy valid OKF types remain
  portable, protected and semantically unjudged by AgentBase.
- **AB-SCHEMA-030** — Catalog roles describe provider-neutral architecture;
  provider, product, source tool and source resource type are technology
  metadata attached to evidence-backed recommendations.
- **AB-SCHEMA-031** — One bounded guidance call requires each candidate's stable
  identity basis, query/link value, concept/embedded disposition, embedded
  parent when applicable and exact owned observations.
  Caller-supplied provider, product, exact schema assertions and unknown fields
  are rejected; optional `suggested_type` is limited to a released
  catalog-7 role and exposes evidence-bound agent intent only.
- **AB-SCHEMA-032** — Terraform-family and CloudFormation-family Detectors v1 and AWS Profile v2.1 are independently
  versioned data contracts, not cloud SDKs or new concept taxonomies.
- **AB-SCHEMA-033** — AWS EC2/VM, Lambda, SQS, SNS, EventBridge, S3, RDS and
  DynamoDB observations map deterministically to technology metadata. A
  concept-disposition Lambda with independent runtime evidence may map exactly
  to Function. Other cloud resources default to embedded knowledge and do not
  select Server, Queue, Table, Bucket or Database concepts. Indirection or
  unsupported input remains ambiguous/unsupported rather than guessed.
- **AB-SCHEMA-034** — Guidance returns catalog/detector/provider-profile
  versions, exact matched and missing evidence, technology metadata,
  limitations, promotion outcome and the complete selected generic schema when
  standalone. Semantic-only guidance remains advisory. A System candidate is
  separate from Repository/Component candidates and needs a recognizable
  capability plus cooperating concepts; no keyword alone forces a System.
- **AB-SCHEMA-035** — New AgentBase drafts using catalog-6 or vendor-specific
  authoring types fail with catalog-7 re-ingest/replacement guidance. Queue,
  Server, Table and similar types are not blindly aliased to Resource because
  they may need embedding instead. Arbitrary foreign types remain protected.
- **AB-SCHEMA-036** — Guidance status is `exact`, `suggested`, `embedded`,
  `ambiguous` or `unsupported`. Detection never overrides disposition.
  Evidence-bound standalone roles may return suggested; internal resource
  evidence returns embedded; conflicts remain ambiguous. Suggested skeletons
  retain a proposal-review limitation and receive no confidence score or
  automatic Accept/Publish authority. An explicit `embedded` disposition also
  overrides redundant standalone suggested-type or promotion hints; guidance
  reports those ignored hints without creating a standalone identity. Parent,
  evidence ownership and field-shape validation remain strict.
- **AB-SCHEMA-037** — Queue, topic, event-bus, table, bucket, database and host
  evidence defaults to a searchable evidence table inside its Repository dossier
  or another independently useful parent. It may promote to Interface for an
  independent shared contract, or Resource for cross-boundary/independently
  operated value. A declaration alone is insufficient promotion evidence.
- **AB-SCHEMA-038** — EC2, VM and physical-host evidence describes hosting.
  Independently evidenced services, workers and processes running there become
  Component concepts. If no workload is evidenced, retain a reference or
  limitation and do not invent a Component or Server.
- **AB-SCHEMA-039** — Embedded knowledge stores display name, concise role,
  provider-neutral kind, optional technology metadata and exact sources in its
  parent. It has no concept identity, standalone document or graph edge until a
  later reviewed promotion.
- **AB-SCHEMA-040** — A structured observation identifies `terraform` or
  `terragrunt` and its source path must agree: Terraform uses `.tf`/`.tf.json`,
  Terragrunt uses `terragrunt.hcl`. Terragrunt directly evidences module
  orchestration; exact provider resources cite the referenced Terraform file.
  SAM/native CloudFormation uses its own detector under AB-SCHEMA-062 and
  cannot be relabeled as either Terraform-family source tool.
- **AB-SCHEMA-042** — Standalone Interface/Resource intent requires a compatible
  promotion basis plus exact candidate-owned semantic observations supporting
  the candidate boundary. Declaration evidence, caller prose and `suggested_type`
  alone return no standalone schema; insufficient knowledge remains suitable
  for embedding in a useful parent. Other suggested roles may carry the same
  candidate-owned semantic or structured evidence as transparent agent intent,
  but it never overrides schema selection. The Interface/Resource candidate
  must include at least one candidate-owned semantic observation; the nested
  promotion evidence list may cite any candidate-owned evidence that proves its
  compatible basis. Keyword-based semantic role selection is advisory and
  never a validity gate.

## Single-repository Initial Ingest

- **AB-INGEST-001, AB-INGEST-002** — Ingest binds one explicit authorized local
  root, resolves its durable Hub Repository identity, reads at most five/256 KiB
  introductory documents and requires explicit grouped-home confirmation after
  showing Domain/shared evidence and mismatches.
- **AB-INGEST-003, AB-INGEST-004** — The host skill runs Preflight, Discover,
  Investigate, Author, semantic Quality Admission and deterministic Validate.
  Source census is a bounded map; promoted claims and relations resolve to exact
  source. Before proposal state exists, one
  retryable `INVALID_ARGUMENT` guidance request may be corrected; after state
  exists, at most one separate changed-document validation repair runs. Sparse
  ambiguous/unsupported guidance continues without retry, while authority,
  integrity, internal or uncertain-mutation failures stop Incomplete.
- **AB-INGEST-005, AB-INGEST-006** — Every standalone candidate needs stable
  identity, independent query/link value and independent reading/boundary value.
  Evidence lacking the third gate remains in a Repository dossier/useful parent.
  One bounded Hub match pass reuses identity only from strong evidence;
  name/prose similarity never auto-merges.
- **AB-INGEST-007** — Limited source/discovery evidence may produce a valid
  explicitly partial proposal with concrete limitations. Source mutation,
  cleanup uncertainty or integrity failure is Incomplete and exposes no
  acceptable proposal.
- **AB-INGEST-008, AB-INGEST-009** — No-change is success; change stops at one
  inspectable proposal preview. The agent-operated workflow never calls a
  provider CLI, clones another repository, Accepts or Publishes.
- **AB-INGEST-010** — Confirmed physical home and semantic Domain participation
  remain separate. Participation is stored only as an evidenced
  `Repository part-of Domain` relation. New preparation derives its evidence
  digest from validated guidance and exact repository source state; the agent
  does not supply an opaque digest.
- **AB-INGEST-011** — Concept Schema defines what knowledge belongs in a
  concept; the shared OKF document template defines its encoding. New Initial
  Ingest preparation renders one editable Repository dossier, compact Domain
  index/navigation when needed and skeleton files only for independently
  promoted recommendations. Paths follow AB-COMPACT; lifecycle fields and
  normalized sources remain canonical. Suggested files state that their role
  requires proposal review. The agent enriches these files rather than
  reconstructing OKF frontmatter.
- **AB-INGEST-012** — A new confirmed Domain `index.md` is both sparse Domain
  concept and capsule navigation. It describes only current owner/repository
  evidence and links useful dossiers/knowledge/Questions; later ingests may
  build it up without inventing a complete Domain.
- **AB-INGEST-013** — Initial Ingest Prepare owns and pre-populates required root,
  shared and Domain navigation. It creates no category index. Agent authoring
  preserves exact known rows, and bundle validation rejects a repeated
  normalized navigation target within one index.
- **AB-INGEST-014** — Initial Ingest Finalize checks every new citation for the
  authorized current repository against its private local checkout. The path
  resolves beneath that checkout to a regular file and the cited end line is
  within the file. Failure rejects the proposal but leaves the session
  repairable. Foreign-repository citations are not dereferenced without a
  separately authorized checkout, and local checkout paths never enter Hub
  knowledge or proposal metadata.
- **AB-INGEST-015** — New Initial Ingest Prepare explicitly returns the editing
  constraint for its generated skeletons. Agent authoring may enrich prose and
  add evidence, but preserves generated sources, relationships, Repository
  identity metadata and navigation. Final validation remains the trust gate.
- **AB-INGEST-016** — Capability 046 Init/Refresh validates repository evidence
  against its exact remote-default SourceSnapshot. Every authored repository
  `sources[]` entry has a 40-hex `observed_revision`; source identity is
  `(resource, observed_revision)`, so a newer observation uses a distinct source
  ID and cannot relabel a retained claim. This supersedes AB-INGEST-014's
  current-checkout wording for Hub-bound authoring only.
- **AB-INGEST-017** — Receipt-bound Initial Ingest QuestionPlan input selects
  only `candidate_key + evidence_id` already present in the same bounded
  guidance request. MCP verifies candidate membership and derives the normalized
  repository source resource plus active SourceSnapshot revision before Receipt
  freeze. Unknown/mismatched selections return the ordinary one-correction
  `INVALID_ARGUMENT` contract; the Agent never constructs provenance URIs or
  revisions. Final SharedQuestion candidate-evidence shape is unchanged.
- **AB-INGEST-018** — Agent-facing Discovery Inventory has only three group
  outcomes: `materialized`, `question` and `ignored`. A materialized item names
  candidate IDs; MCP derives candidate standalone/dossier disposition, embedded
  parent, Inventory/QuestionPlan IDs and canonical internal references from the
  active Seed plus the same guidance request. Inventory items do not repeat
  candidate evidence IDs. Bounded Seed source samples remain review context,
  not an exhaustive evidence allowlist. Known candidate evidence remains
  source-validated at guidance/Question/Finalize boundaries. Multiple groups
  that contribute evidence to one knowledge boundary materialize the same
  candidate IDs; downstream candidate identity remains unique. P0 ignored is
  reserved for a group that adds no distinct evidence and requires exact reason
  `duplicate-covered` against a materialized origin group. MCP returns all
  bounded caller-correctable Inventory defects found in one retryable
  `INVALID_ARGUMENT`. Old private Receipts may be discarded and re-ingested;
  no Published Hub/OKF migration is introduced.
- **AB-INGEST-019** — Receipt-bound embedded materialization is proven by at
  least one exact candidate-owned repository evidence resource remaining in the
  resolved parent concept. Candidate-owned embedded evidence is retained in the
  parent's frontmatter sources so Published query and visualization can resolve
  it; body-only evidence text is insufficient. Agent-authored human-readable
  label/prose may differ from the candidate identity hint and is not a Finalize
  gate. Missing Receipt evidence is never silently accepted; AB-INGEST-020 owns
  its normalization.
- **AB-INGEST-020** — Before Receipt materialization validation, Finalize keeps
  an existing embedded row that retains exact candidate-owned evidence and
  deterministically restores a missing canonical row and missing frontmatter
  source record from the frozen Receipt into its resolved parent. This
  normalization uses no source reread and does not consume the Agent
  repair budget. A row that still cannot be resolved to a valid parent/evidence
  remains an integrity failure.
- **AB-INGEST-021** — Discovery and authoring preserve bounded limitations when
  provider output is partial, malformed or redacted. A high-value signal is
  materialized, represented as a Question, or recorded with an explicit ignored
  reason; it is never silently dropped to make a proposal appear complete.
- **AB-INGEST-022** — Initial Ingest census selects at most 256 (`standard`)
  or 1,024 (`expanded`) safe files after a bounded 4,096-entry enumeration.
  Priority goes to manifests and deployment/operations files; reserve one quarter of the file budget for ordinary source when
  available, then fill unused capacity. Selection is deterministic. The 64 KiB
  per-file cap, denied paths, symlink exclusion remain unchanged. Report mode, budget, selected/eligible counts, known omitted
  priority files and entry truncation separately; these are census bounds, not completeness claims.
- **AB-INGEST-023** — Existing `discover_repository` admits `discovery_mode` with
  default `standard`. `expanded` requires `discovery_confirmation` containing
  the current standard `seed_id`, `user_confirmed: true` and a bounded concrete
  `reason` for missing important coverage. It is admitted only on the same
  armed Initial Ingest source with file omissions, before its
  Receipt is frozen, once per armed run. Standard rejects confirmation fields.
  Invalid/stale requests fail before source reads. Expansion reruns census on the same armed source; it replaces the Seed and invalidates
  old Inventory input. Record budget evidence in the Seed and Receipt. The
  confirmation is the calling agent's attestation, not independent proof of
  human consent; installed guidance must obtain that consent. It grants no
  source expansion, Refresh, cloud access or Publish permission.
- **AB-SCHEMA-043** — Exact supported Terraform/Terragrunt observations are
  high-priority when readily available. Their omission is a coverage diagnostic,
  not an invalidity condition for an otherwise truthful partial proposal.
  Unsupported IaC must not be relabeled as supported structured evidence.
- **AB-SCHEMA-061** — AWS Profile 2.1 admits the bounded Terraform ECS and API
  Gateway mappings listed in section 04.03 and Lambda event-source mappings.
  Mapping supplies metadata, not promotion or relations. Exact Function
  selection requires `runtime-function`, not merely product `lambda`; trigger
  declarations stay distinct. Verify embedded and standalone candidates and
  regression coverage for existing Lambda/resource behavior.
- **AB-SCHEMA-062** — SAM/native CloudFormation resource observations retain
  their original Type and logical ID with exact template source attribution.
  Source-format and AWS technology mappings are separate; unsupported Types
  remain visible. SAM Function and native Lambda Function share runtime-function
  semantics, never event-source-mapping semantics. No classifier evaluates a
  template or establishes deployed identity. Legacy Receipt mapping versions
  are not silently rewritten.
  A candidate mixing detector families returns ambiguous without claiming one
  exact detector profile. The bounded census preserves source lines, scalar
  Function Globals with local override, supported API/SQS/schedule events and
  direct same-template Ref/GetAtt as defined in section 04.04. Unsupported or
  malformed declarations, conditions and unresolved expressions remain visible
  limitations; no template execution or physical identity resolution occurs.
- **AB-SCHEMA-044** — Usually keep one runtime's internal trigger, state and
  delivery sequence embedded. Create a standalone Flow when it adds independent
  query or navigation value across evidenced concept identities. Endpoint count
  is an authoring heuristic, not a schema-validity rule.
- **AB-SCHEMA-045** — A source-backed System may declare the canonical
  `implemented-in -> Repository` direction with exact source-ownership evidence
  and a resolving Markdown link. Validation still rejects missing evidence,
  missing links, inverse duplicates and non-Repository targets.
- **AB-SCHEMA-046, AB-SCHEMA-047** — The earlier narrow Flow and direct-child
  exceptions are superseded by AB-SCHEMA-048.
- **AB-SCHEMA-048** — `candidate_id` records an observation's primary
  attribution, not exclusive ownership. Standalone concepts may share any known
  observation in one bounded request as supporting or promotion evidence.
  Embedded candidates remain self-owned. Interface/Resource promotion still
  needs candidate-owned semantic boundary evidence. Unknown evidence and
  source, schema and relationship gates remain strict.
- **AB-SCHEMA-049** — The released MCP schema surface is exactly catalog list,
  exact schema read, evidence-bearing authoring guidance and changed-set
  validation. Fine-grained signal selection, per-concept validation, separate
  relationship validation and whole-bundle validation are internal policy or
  retired historical adapters, not public tools.
- **AB-SCHEMA-050** — A service-level `System` may declare canonical
  `consumes -> Interface` with exact runtime call or subscription evidence and
  resolving Markdown links. This supports truthful cross-repository dependency
  knowledge without requiring a duplicate `Component`. It does not authorize a
  generic System-to-System `depends-on` relation or inferred topology.
- **AB-SCHEMA-051** — An explicit embedded candidate with a valid concept parent
  and candidate-owned evidence remains `embedded` even when no released
  detector/provider profile maps its technology. Guidance returns provider-
  neutral metadata plus a limitation; `unsupported` is reserved for standalone
  schema intent that cannot be safely selected. Detection never overrides the
  Agent's validated embedded boundary.
- **AB-SCHEMA-052** — A standalone Resource candidate requires stable identity,
  independent query/link value and candidate-owned evidence of an operational or
  integration boundary. Terraform declaration, technology mapping, keyword or
  display name alone never promotes a Resource.
- **AB-SCHEMA-053** — Messaging transport (queue, topic or event bus) is modeled
  as provider-neutral `Resource` when independently operated/shared; an
  API/event/message contract is `Interface` only when its contract value also
  passes the standalone gates. Transport and contract are never silently merged.
  Resource admits `part-of -> Domain` with owner-confirmed participation evidence;
  cross-boundary promotion at a confirmed Domain home records that participation
  without requiring `implemented-in` to the ingesting Repository.
- **AB-SCHEMA-054** — The common AWS profile may classify Lambda, SQS, SNS,
  EventBridge, S3, DynamoDB and RDS using existing generic roles and technology
  metadata. EC2/VM remains hosting evidence unless an independently evidenced
  workload is promoted to Component/Function.
- **AB-SCHEMA-055** — Provider extensions reuse the catalog roles, canonical
  relationship vocabulary, external-identity envelope and evidence ownership.
  A provider profile may add mapping, identity normalization and evidence
  adapters, but may not introduce provider-specific concept types or predicates.
- **AB-SCHEMA-056** — `validate_okf_changes` may bind one prepared authoring
  `session_id`. Session-bound validation checks the exact editable bundle against
  its frozen base and authorized source before Finalize, including repository
  source revision/identity rules and newly authored structural reachability. The
  session check still runs when the supplied changed-set has content or relation
  failures so one diagnostic exposes all repairable preflight defects. A source
  ID reused at a different revision is rejected even when its source span also
  changes. The session field is optional so standalone changed-set schema
  validation retains its bounded, total-Hub-independent behavior.
- **AB-SCHEMA-057** — Knowledge sharing one runtime, deployment and ownership
  boundary remains in one Repository dossier or independently justified useful
  parent. Provider resource count never forces standalone concepts. A
  one-runtime repository normally needs no duplicate runtime document unless it
  independently passes the compact promotion gate.
- **AB-SCHEMA-058** — Consolidation preserves independently deployed frontend,
  backend, worker and shared integration boundaries. Interface, Flow and
  Resource promotion still requires independent contract, ordered-behavior,
  ownership, lifecycle, failure, operation or AIT query value; no fixed concept
  count is valid across repository shapes.
- **AB-SCHEMA-059** — Component and Function may declare evidence-backed
  `publishes-to`, `reads-from` and `writes-to` relations to independently
  promoted Interface or Resource targets. Internal embedded items remain
  searchable parent content and never become relation endpoints merely to
  complete a graph or diagram.
- **AB-SCHEMA-060** — New Initial Ingest skeletons add direct compact Domain
  entrypoints to root navigation and direct Repository/knowledge/Question links
  to the owning home index. Category listings are derived presentation and not
  authored proposal files.
