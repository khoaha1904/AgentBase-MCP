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
- Live-claim IDs are bundle-unique and refresh cannot remove an accepted ID.
  A later reviewed proposal may move the same semantic reference while all
  protected knowledge and human guidance keep their normal lifecycle rules.

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
- **AB-SCHEMA-007** — The compatible vocabulary contains Repository, Domain,
  Domain Entity, System, Software Component, Service, Server, API Surface, API
  Endpoint, Event, Metric, Database Table, Queue, AWS Lambda, AWS SQS Queue,
  Infrastructure Definition, Terraform Module, Deployment, Business Flow,
  Cross-Repository Relationship, legacy Open Question and Maintainer Guidance.
- **AB-SCHEMA-008** — Selection recommends the smallest independently useful
  type supported by evidence. Concrete implementation detail remains inside its
  useful parent unless an independent contract, ownership, lifecycle, failure,
  operational, audience or graph boundary is evidenced.
- **AB-SCHEMA-009** — Concrete concepts preserve provenance and important
  uncertainty. Cross-repository relationships need evidence for both endpoints
  and the relationship.
- **AB-SCHEMA-010** — Current catalog `5.1.0` provides bounded investigation,
  semantic metadata, relationship and optional-enrichment guidance. AWS Lambda,
  Terraform and Business Flow guidance connects identity and infrastructure to
  runtime and observable outcomes.
- **AB-SCHEMA-011** — Guidance distinguishes evidence-required metadata from
  optional enrichment; absent or contradictory evidence never authorizes an
  invented value.
- **AB-SCHEMA-012** — MCP validates a bounded caller-supplied concept set without
  reading caller-selected filesystem paths. Each supplied relationship identity
  is unique; every declared target exists and has a resolving relative or
  absolute bundle-relative Markdown link. A catalog-unknown relationship stays
  portable and is reported unjudged rather than rejected.
- **AB-SCHEMA-013** — MCP can select and return complete guidance for only the
  schemas matched by a bounded set of repository evidence signals in one
  advisory call. Listing the whole catalog and reading each selected schema are
  compatible fine-grained operations, not required authoring steps.
- **AB-SCHEMA-014** — MCP can validate up to 64 caller-supplied concepts, 256 KiB
  each and 4 MiB total, in one content-only bundle call. It reports per-concept
  draft/schema failures together with cross-document relationship failures and
  never reads a caller-selected output path.
- **AB-SCHEMA-015** — Advisory selection matches normalized rule words anywhere
  in one natural-language evidence signal while retaining word boundaries,
  deterministic order and evidence-local specific-type shadowing. A
  specialization shadows its fallback only when it covers every signal that
  selected the fallback; distinct evidence for a parent and specialization
  retains both. Catalog phrases include admitted singular/plural wording;
  repository names or benchmark identities are never selection rules.
- **AB-SCHEMA-016** — Canonical Domain, Domain Entity, System, Component,
  Interface, Flow, Metric, Resource, Infrastructure, Deployment and Repository
  paths classify one identity per entity; links express containment,
  implementation and evidence.
- **AB-SCHEMA-017** — Related operations share an API Surface; implementation-
  only handlers stay in their useful parent; infrastructure definition,
  reusable module and evidenced deployment remain distinct.
- **AB-SCHEMA-018** — Domain is optional and never inferred from a repository
  name. Repository concepts retain source-specific knowledge and link to
  canonical entities without copying their contracts. Existing Open Question
  concepts remain readable but are not recommended for new authoring.
- **AB-SCHEMA-019** — Newly authored known AgentBase schemas store only one
  canonical direction for `part-of`, `provides`, `consumes`, `depends-on`,
  `triggered-by`, `publishes-to`, `reads-from`, `writes-to`, `implemented-in`,
  `declared-by` and `deployed-as`. MCP derives inbound navigation rather than
  persisting inverse duplicates. Legacy and foreign predicates remain readable
  and unjudged.
- **AB-SCHEMA-020** — Every new canonical relationship references one or more
  stable source IDs from the owning concept. Business Flow `flow_steps` identify
  contiguous order, exact endpoints, one canonical action, sync/async mode and
  evidence. Invalid endpoints, modes, evidence or known-schema predicates fail
  authoring validation.
- **AB-SCHEMA-021** — `validate_okf_changes` accepts 1–64 full changed concepts
  and at most 512 unchanged identity/path/type target summaries. Validation has
  no dependency on total Hub size and receives no unchanged concept body.
- **AB-SCHEMA-022** — Architecture nodes and useful knowledge units are not
  forced into one technology-shaped granularity. Operationally independent
  Lambda/workers remain concepts; implementation-only handlers stay in their
  parent; a Server may link smaller evidenced capability concepts rather than
  grow one unrelated document.
- **AB-SCHEMA-023** — A persisted concept identity is its normalized path
  relative to the OKF root with `.md` removed. Changed concepts and unchanged
  target summaries MUST use that identity, and validation rejects ephemeral
  type-prefixed aliases or paths beginning with the outer `okf/` directory.
- **AB-SCHEMA-024** — Hub prepare accepts at most one optional owner-confirmed
  Domain with exact `domains/<slug>` identity and title. It validates before
  session creation, selects Domain guidance and returns deterministic
  `agentbase://owner-guidance/<identity>` evidence. Finalization requires the
  Domain plus a current-source System `part-of` edge citing that owner evidence;
  absent input never authorizes Domain inference.
- **AB-SCHEMA-025** — Product and authoring language distinguishes a reusable
  catalog Concept Schema from a repository-specific Concept Instance. One
  schema may yield many instances; each instance declares one concrete type.
- **AB-SCHEMA-026** — `Domain Entity` represents a stable evidenced business
  object or value identity shared across useful contracts, flows or systems.
  An implementation class or data structure without that boundary remains in
  its useful parent.
- **AB-SCHEMA-027** — `Metric` represents a stable named measure and evidenced
  definition, producer or calculation. A current change-prone numeric
  observation is not required and remains a live reference rather than
  timeless Metric prose.
- **AB-SCHEMA-028** — One evidence signal selects the most concrete supported
  specialization instead of its fallback for the same entity. Distinct evidence
  may retain both recommendations for separate useful instances; schemas are
  not merged onto one instance.
- **AB-SCHEMA-029** — Catalog 5.1 is additive over 5.0. Existing known concepts
  require no migration, and unknown valid OKF types remain portable, protected
  and semantically unjudged by AgentBase.
