# Evidence and OKF contract

Current contract for explicit observations, repository-local OKF proposals and
the AgentBase concept schema catalog. Google OKF v0.2 is the portable format;
AgentBase lifecycle fields and types are producer conventions.

Normative OKF source is pinned to commit
`3fcbb9f828c2f23d109c855ee403c3a4c81f3a96`:
<https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md>.

## Repository proposal lifecycle

- **AB-MVP-008** — The current host coding agent performs synthesis through the
  repository `agentbase-okf` skill; AgentBase adds no model SDK or model key.
- **AB-MVP-009** — `okf prepare` byte-copies current knowledge into an isolated
  proposal and never mutates the shared `okf/` bundle.
- **AB-MVP-010, AB-MVP-011** — Concept files have bounded parseable YAML
  frontmatter and non-empty `type`; reserved files follow OKF v0.2, root
  `index.md` declares `okf_version: "0.2"`, IDs are bundle-relative paths and
  ordinary Markdown links provide progressive disclosure.
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
- **AB-MVP-021** — The accepted 12-file rehearsal proves five facts within
  three source files, linked drafts, guidance/defer, allowed deletion, stale
  rejection and recovery.
- **AB-MVP-022** — Graph/direct-source comparison may record time, presented
  context, fact coverage and correction count; no unmeasured speed threshold is
  a product claim.
- **AB-MVP-023** — Only root `index.md` carries OKF frontmatter. Category
  indexes are navigation Markdown without frontmatter; host-agent guidance MUST
  state this distinction before authoring.

## Explicit observations

- **AB-OBS-001, AB-OBS-004** — `observe` is a separate user action for one
  repository/symbol. It never starts implicitly and never creates, validates,
  changes or applies OKF; OKF needs another explicit command.
- **AB-OBS-002** — Exact managed Codebase Memory owns indexing, graph structure,
  graph semantics and graph queries; AgentBase owns no parallel canonical graph.
- **AB-OBS-003** — Only normalized evidence crosses the bridge: exact engine and
  source identity, bounded queries, facts, relative sources, completeness,
  limitations and digest. Provider-private graph records do not.
- **AB-OBS-005** — Equivalent evidence has stable order/digest; source or engine
  changes remain visible.
- **AB-OBS-006** — Invalid input, provider failure, source mutation or cleanup
  failure returns a distinct failure and no partial observation.
- **AB-OBS-007** — Observation preserves package-private admission, private
  cache, bounded process/session, source integrity and confirmed cleanup.

## Live claims

- **AB-CLAIM-001** — Distinct claims about one subject/property retain their
  own stable identity, role and provenance. Conflict never silently merges the
  claims or selects a canonical winner.
- **AB-CLAIM-002** — A newly authored volatile implementation/configuration
  value is an `agentbase.live_claims` reference, not a durable scalar. Each
  reference binds one same-concept repository source, semantic target and the
  clean commit or dirty digest observed during authoring; `value` is forbidden.
- **AB-CLAIM-003** — Durable policy and explicit human decisions may contain a
  literal only as separately attributed Maintainer Guidance. They remain
  distinguishable from documentation, implementation and configuration claims.
- **AB-CLAIM-004** — `agentbase.live_claims[].target.kind` is exactly one of
  `symbol`, `function`, `config-field` or `text`. Concept type names are not
  live-reference target kinds, and host-agent guidance enumerates the complete
  vocabulary.
- **AB-CLAIM-005** — A claim observation may carry one optional non-current
  `snapshot` only with exact source revision and RFC3339 observed time. It is
  one scalar or single-line identifier of at most 256 UTF-8 bytes. Multiline,
  oversized and obviously secret-like values fail validation; proposal review
  remains the final sensitivity guard.
- Live-claim IDs are bundle-unique and refresh cannot remove an accepted ID.
  A later reviewed proposal may move the same semantic reference while all
  protected knowledge and human guidance keep their normal lifecycle rules.

## Refresh contribution lifecycle

- A Repository concept may carry `agentbase.repository.observed_source` with the
  exact clean commit or dirty digest and observation time. It is a continuity
  checkpoint and freshness warning aid, not a truth score or copied source.
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
- **AB-SCHEMA-003** — Create only observed useful instances and required indexes.
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
  operational, audience or graph boundary is evidenced.
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
- **AB-SCHEMA-016** — Canonical Domain, System, Component, Function, Interface,
  Flow, Resource and Repository paths classify one identity per useful entity;
  links express relationships and evidence. Entity/Metric paths are added only
  during enrichment.
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
- **AB-INGEST-011** — Initial Ingest preparation renders editable skeletons for
  promoted candidates. A Flow skeleton contains `flow_steps: []` as an explicit
  edit point because endpoints cannot be inferred safely; preparation may return
  that skeleton, but normal changed-set/final proposal validation rejects it
  until the agent supplies non-empty linked and evidenced steps.
- **AB-SCHEMA-021** — `validate_okf_changes` accepts 1–64 full changed concepts
  and at most 512 unchanged identity/path/type target summaries. Validation has
  no dependency on total Hub size and receives no unchanged concept body.
- **AB-SCHEMA-022** — Architecture nodes and useful knowledge units are not
  forced into technology-shaped granularity. Operationally independent
  Functions remain concepts; implementation-only handlers stay in their
  parent. Compute hosts are hosting evidence; evidenced workloads become
  Components, not children of an automatically authored Server concept.
- **AB-SCHEMA-023** — A persisted concept identity is its normalized path
  relative to the OKF root with `.md` removed. Changed concepts and unchanged
  target summaries MUST use that identity, and validation rejects ephemeral
  type-prefixed aliases or paths beginning with the outer `okf/` directory.
- **AB-SCHEMA-024** — Hub prepare accepts at most one optional owner-confirmed
  Domain with exact `domains/<slug>` identity and title. It validates before
  session creation, selects Domain guidance and returns deterministic
  `agentbase://owner-guidance/<identity>` evidence. Finalization requires the
  Domain plus a current-source Repository `part-of` edge citing that owner evidence;
  absent input never authorizes Domain inference.
- **AB-SCHEMA-025** — Product and authoring language distinguishes a reusable
  catalog Concept Schema/template from a repository-specific Concept Instance.
  One schema may yield many instances; each instance declares one catalog type.
- **AB-SCHEMA-026** — Enrichment-only `Entity` represents a stable evidenced business
  object or value identity shared across useful contracts, flows or systems.
  An implementation class or data structure without that boundary remains in
  its useful parent.
- **AB-SCHEMA-027** — `Metric` represents a stable named measure and evidenced
  definition, producer or calculation. A current change-prone numeric
  observation is not required and remains a live reference rather than
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
- **AB-SCHEMA-032** — Terraform-family Detector v1 and AWS Profile v2 are independently
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
  evidence defaults to a searchable evidence table inside its Function,
  Component or System parent. It may promote to Interface for an independent
  shared contract, or Resource for cross-boundary/independently operated value.
  A declaration alone is insufficient promotion evidence.
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
  SAM/CloudFormation/YAML is unsupported and cannot be relabeled as either
  source tool.
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
  introductory documents and requires explicit primary-Domain confirmation
  after showing evidence and mismatches.
- **AB-INGEST-003, AB-INGEST-004** — The host skill runs Preflight, Discover,
  Investigate, Author and Validate. Code Graph is a private map; promoted claims
  and relations resolve to exact source. Before proposal state exists, one
  retryable `INVALID_ARGUMENT` guidance request may be corrected; after state
  exists, at most one separate changed-document validation repair runs. Sparse
  ambiguous/unsupported guidance continues without retry, while authority,
  integrity, internal or uncertain-mutation failures stop Incomplete.
- **AB-INGEST-005, AB-INGEST-006** — Every candidate needs stable identity and
  independent query/link value. One bounded Hub match pass reuses identity only
  from strong evidence; name/prose similarity never auto-merges.
- **AB-INGEST-007** — Limited graph/language evidence may produce a valid
  explicitly partial proposal with concrete limitations. Source mutation,
  cleanup uncertainty or integrity failure is Incomplete and exposes no
  acceptable proposal.
- **AB-INGEST-008, AB-INGEST-009** — No-change is success; change stops at one
  inspectable proposal preview. The agent-operated workflow never calls a
  provider CLI, clones another repository, Accepts or Publishes.
- **AB-INGEST-010** — Confirmed ownership is stored as one owner-evidenced
  `Repository part-of Domain` relation. New preparation derives its evidence
  digest from the validated guidance request and exact repository source state;
  the agent does not supply an opaque digest.
- **AB-INGEST-011** — Concept Schema defines what knowledge belongs in a
  concept; the shared OKF document template defines its encoding. New Initial
  Ingest preparation renders editable skeleton files for exact and suggested recommendations,
  Repository, confirmed Domain and navigation with canonical paths, valid
  lifecycle fields and normalized sources. Suggested files state that their
  role requires proposal review. A prepared System carries the owner-evidenced
  primary-Domain relation so inbound Domain navigation is derivable. The agent
  enriches these files rather than reconstructing OKF frontmatter.
- **AB-INGEST-012** — A new confirmed Domain skeleton lists every System newly
  prepared under it. Preparation never rewrites an existing Domain document.
  Its initial overview stays sparse and describes only current owner/repository
  evidence; later ingests may build it up without inventing a complete domain.
- **AB-INGEST-013** — Initial Ingest Prepare owns and pre-populates required
  root/category navigation. Agent authoring preserves those rows rather than
  appending known targets, and bundle validation rejects a repeated normalized
  navigation target within one index.
- **AB-INGEST-014** — Initial Ingest Finalize checks every new citation for the
  authorized current repository against its private local checkout. The path
  resolves beneath that checkout to a regular file and the cited end line is
  within the file. Failure rejects the proposal but leaves the session
  repairable. Foreign-repository citations are not dereferenced without a
  separately authorized checkout, and local checkout paths never enter Hub
  knowledge or proposal metadata.
- **AB-SCHEMA-043** — Exact supported Terraform/Terragrunt observations are
  high-priority when readily available. Their omission is a coverage diagnostic,
  not an invalidity condition for an otherwise truthful partial proposal.
  Unsupported IaC must not be relabeled as supported structured evidence.
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
