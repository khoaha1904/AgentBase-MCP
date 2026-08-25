# Agent-driven OKF benchmark requirements

The benchmark measures whether a real explicit host coding agent can use
AgentBase MCP graph/schema tools to investigate pinned repositories and author
useful Google OKF v0.2. Manual bundles and observation-only runs are not agent
benchmarks.

- **AB-BENCH-001** — Comparable runs pin source commits, expectations, schema
  catalog, prompt, agent executable/version, model and reasoning effort.
- **AB-BENCH-002** — A model-backed run is explicit opt-in and starts one bounded
  non-interactive host-agent process per repository in an isolated result
  workspace with AgentBase MCP required. AgentBase stores no model credentials
  and contains no model SDK.
- **AB-BENCH-003** — The agent indexes once, uses graph and admitted schema/
  validation tools, may inspect authorized source/docs/Git, writes only sparse
  OKF and records limitations instead of inventing evidence.
- **AB-BENCH-004** — Expectations define semantic concept identity, concrete
  schema, required metadata/evidence paths and directed relationships without
  prescribing prose, paths or slugs. A wrong-schema contradiction requires the
  reference identity in the concept's canonical identity or title; a contextual
  description, body mention or navigation link cannot turn missing coverage
  into a contradiction.
- **AB-BENCH-005** — Finalization reports OKF conformance, non-exhaustive
  concept/relationship classifications, recognized-schema agreement, reference
  coverage, metadata completeness and provenance separately.
- **AB-BENCH-006** — Each run starts/ends on the same clean pinned source;
  missing output, agent/MCP failure, timeout, malformed artifacts or source drift
  fails visibly and cannot produce a passing result.
- **AB-BENCH-007** — Results retain exact prompt/configuration, JSONL events,
  final message, OKF tree, metrics and report under repository plus UTC run ID.
- **AB-BENCH-008** — Canonical verification uses a fake executable and
  deterministic scoring offline; real model execution is always separate.
- **AB-BENCH-009** — A context comparison binds exactly one MCP-assisted arm
  and one direct-source arm to the same fixture commit, expectation, catalog,
  agent version, model, reasoning effort and semantic authoring goal.
- **AB-BENCH-010** — The direct arm receives no AgentBase MCP configuration and
  investigates only the authorized source, documentation and Git history with
  ordinary host-agent capabilities.
- **AB-BENCH-011** — The MCP arm retains the graph, schema, validation and
  bounded source-investigation lifecycle required by AB-BENCH-002/003.
- **AB-BENCH-012** — Every arm records its prompt, trace, output, status,
  duration, agent identity, fixture identity and safe AgentBase source identity;
  pair artifacts keep both arms under one UTC comparison identity.
- **AB-BENCH-013** — Usage preserves the final completed-turn input, cached
  input, cache-write input, uncached input, output and reasoning-output token
  values. Missing values remain unavailable rather than becoming zero.
- **AB-BENCH-014** — Investigation activity reports directly observed MCP and
  shell-command events. It does not claim complete source-file or byte volume
  without deterministic telemetry.
- **AB-BENCH-015** — Pair reports keep semantic quality and efficiency in
  separate sections, use MCP-minus-direct deltas only for comparable values and
  never emit an automatic overall winner.
- **AB-BENCH-016** — Either arm may fail, time out, drift source state or emit
  malformed artifacts without losing already available evidence. Ordinary
  failures continue to the other arm; source drift blocks a contaminated next
  execution. The pair remains explicitly incomplete.
- **AB-BENCH-017** — Paired lifecycle, isolation, measurement and recovery are
  covered offline with a fake executable. A real pair remains an explicit
  opt-in product-evidence command.
- **AB-BENCH-018** — Both arms receive one equivalent general authoring contract
  for sparse identity, concrete schema choice, metadata, normalized provenance,
  linked relationships and final consistency review.
- **AB-BENCH-019** — The authoring contract defines root `index.md` as only
  `okf_version: "0.2"` frontmatter, one heading and Markdown list entries that
  link to authored concepts; arbitrary root prose is forbidden.
- **AB-BENCH-020** — Before writing, the agent identifies the smallest
  independently useful candidates, chooses an evidence-supported boundary and
  omits speculative, duplicate or implementation-only concepts.
- **AB-BENCH-021** — Every candidate is assessed against applicable relationship
  guidance. Declared relationships require an existing target and resolving
  Markdown link; catalog-unknown combinations remain visible as unjudged rather
  than being rejected or invented.
- **AB-BENCH-022** — Agent-visible inputs never expose benchmark expectations,
  expected keys, types, paths or relationships.
- **AB-BENCH-023** — Each scored arm declares `reviewable` or `invalid`.
  Lifecycle/conformance failure, empty output, unsafe provenance, a recognized
  identity with a contradictory schema, or a malformed or broken authored
  relationship is invalid. Missing reference
  concepts, metadata, provenance or relationships remain diagnostics and never
  become invalid solely because coverage is low.
- **AB-BENCH-024** — Changed prompt behavior receives a new immutable prompt
  identity; historical prompts and recorded results remain unchanged.
- **AB-BENCH-025** — Equivalent v2 behavior is proven with fake paired execution
  before real opt-in pairs on at least two structurally different repositories.
  Assessment precedes efficiency interpretation and never becomes an automatic
  overall winner.
- **AB-BENCH-026** — Curated expectations are non-exhaustive. Recognized output
  is classified as confirmed or contradicted; valid unmatched output is
  unjudged; absent probes are missing reference knowledge.
- **AB-BENCH-027** — Reference concept, metadata, provenance and relationship
  coverage are diagnostics only. No completeness percentage is an authoring
  pass/fail threshold.
- **AB-BENCH-028** — Token and elapsed-time efficiency remain separate from OKF
  authoring quality; neither implies the other.
- **AB-BENCH-029** — Reports state that deterministic path matching cannot prove
  semantic support for every claim and that human review is required.
- **AB-BENCH-030** — MCP relationship-set validation accepts only a bounded
  caller-supplied `{ identity, path, content }` set. It reads no caller-selected
  output directory and checks unique identities, declared targets, resolving
  Markdown links and known-schema guidance.
- **AB-BENCH-031** — v3 MCP arms must complete relationship-set validation after
  authoring and repair failures. Direct arms retain the equivalent shared
  contract without receiving AgentBase MCP capability.
- **AB-BENCH-032** — v4 MCP arms replace catalog list/select/per-schema reads and
  per-concept/relationship validation with `get_okf_authoring_schemas` and
  `validate_okf_bundle`. This records the historical v4 interaction shape;
  released-surface compatibility is superseded by AB-BENCH-069.
- **AB-BENCH-033** — Each trace reports completed schema/validation calls and
  serialized supplied/result bytes, including per-tool detail. These payload
  diagnostics remain distinct from model token usage.
- **AB-BENCH-034** — v4 retains the exact v3 shared evidence-first authoring
  contract and hidden-reference boundary; only the MCP interaction shape changes.
- **AB-BENCH-035** — Efficiency improvement requires the same v4 workflow to
  remain reviewable and reduce schema/validation calls by at least 50% against
  retained v3 MCP baselines on both heterogeneous repositories. Token and
  elapsed changes are still reported honestly and need not improve.
- **AB-BENCH-036** — V5 reports production validity and
  `useful_for_owner_review` as independent judgments. Low reference coverage or
  an incomplete evidence-backed draft does not by itself fail either judgment.
- **AB-BENCH-037** — V5 keeps reference identities in hidden expectations and
  forbids benchmark-only metadata in production proposals. Usefulness checks
  canonical identity, useful boundaries, Markdown substance, pinned source
  evidence and fragmentation without requiring a fixed inventory size.
- **AB-BENCH-038** — Offline qualification applies frontend, backend and
  infrastructure repository contributions sequentially to one canonical system
  graph and proves that earlier source evidence and identities survive.
- **AB-BENCH-039** — Generated qualification covers ten domains and more than
  one thousand concepts. Scoped search, ambiguity clarification, exact
  traversal and changed-set validation operate without sending the full Hub to
  an agent.
- **AB-BENCH-040** — Sequential multi-repository qualification retains prior
  evidence and bounded continuity. V8 real-run scoring treats canonical
  evidenced relationships as integrity requirements and progressive navigation
  plus source-conflict visibility as owner-review findings. Retrieval quality,
  provenance and honest uncertainty are primary; token use remains diagnostic.
- **AB-BENCH-041** — Confirmed-Domain qualification requires exact owner input,
  valid shared navigation and preservation of all prior nonblank index lines.
- **AB-BENCH-042** — Observed-value qualification scores only useful bounded
  snapshots with file provenance, revision/time, role-separated conflict
  presentation, unavailable-source degradation and sensitive/coverage bounds.
  An explicit current-value probe may use normal authorized source reading, but
  ordinary Hub query performs no access probe or resolver call and no score
  requires complete configuration capture or an evidence winner.
- **AB-BENCH-043** — V13 historically qualified catalog `6.0.0` through the
  then-current single-repository Initial Ingest lifecycle in an isolated
  local-only Hub. It
  requires status/setup, Preflight, one index/architecture pass,
  evidence-bearing guidance, prepare, changed-set validation, finalize and
  inspect; it fails on missing stages or any Accept, bootstrap, submit or
  synchronize call. Only the finalized proposal bundle becomes a scored
  artifact and the source plus owner-native Hub remain unchanged. Current
  qualification instead uses an isolated admitted remote-profile fixture without
  real network or credentials; historical V13 bytes remain unchanged.
- **AB-BENCH-044** — V14 preserves the V13 lifecycle and catalog while making
  semantic-only role intent explicit through evidence-bound `suggested_type`.
  It requires structured mappings to remain `exact`, semantic roles to remain
  reviewable suggestions and immutable V13 prompts/results to remain unchanged.
- **AB-BENCH-045** — V15 preserves the Initial Ingest lifecycle but qualifies
  catalog `7.0.0` through Detect → Promote → Render. Expectations separate
  `requiredConcepts` from `embeddedKnowledge`: ordinary internal queues, topics,
  tables, buckets, infrastructure definitions and hosts receive credit only when
  an allowed useful parent records the knowledge with exact repository evidence;
  they are not required as standalone concept files. Guidance failure is
  Incomplete except for one failed retryable `INVALID_ARGUMENT` followed by one
  successful pre-state correction. The trace retains both attempts. Finalize
  runs exactly once without retry, and only released type names plus canonical
  relationship directions are valid.
- **AB-BENCH-046** — The current MVP qualification suites contain only pinned
  Terraform/Terragrunt repositories. Application frontend/backend source may be
  qualified when Terraform is the structured infrastructure evidence.
  SAM/CloudFormation remains outside scope and cannot be relabeled as Terraform.
  Historical prompts, expectations and results remain immutable.
- **AB-BENCH-047** — Every scored ratio reports numerator and denominator; a
  zero denominator is unavailable rather than 100%. Reports name unjudged
  concepts/relationships and the final successful `validate_okf_changes` call
  must cover every finalized changed concept. A single-runtime fixture does not
  require Flow or endpoint concepts merely for reference coverage; its bounded
  behavior may be scored as embedded knowledge.
- **AB-BENCH-048** — Qualification runs are sequential. Run one probe first;
  stop without a replica on any hard lifecycle/deterministic failure or clear
  quality blocker. Only a valid run without a clear blocker authorizes one
  identical sequential replica for stability comparison. Compare promotion,
  identities, sources and relations across both runs. A third consecutive run
  is reserved for final acceptance evidence, never routine debugging.
- **AB-BENCH-049** — Initial Ingest reports one categorical outcome:
  `invalid`, `valid_partial` or `review_ready`. A source-truthful, structurally
  valid `valid_partial` proposal passes Initial Ingest even when expected
  concepts or details are missing. Coverage ratios and missing references remain
  diagnostics. `review_ready` additionally has useful owner navigation and
  content, without requiring a fixed concept inventory.
- **AB-BENCH-051** — Refresh qualification uses its own immutable prompt
  identity and an expectation tied to the exact synthetic source mutation. A
  structurally valid bundle still fails the run when expected replacement
  knowledge is absent or superseded literal knowledge remains. Probe and
  replica compare the changed concept bytes separately from per-run Repository
  observation commits.
- **AB-BENCH-050** — One model run's semantic variance does not become a hard
  product rule. A deterministic offline contract breach may be fixed directly;
  a semantic miss justifies a new cross-repository rule only after the same
  failure appears in at least two structurally distinct repositories.
- **AB-BENCH-052** — ECS full-stack qualification pins the public fixture by
  exact commit and rejects source drift or a dirty fixture.
- **AB-BENCH-053** — Initial Ingest qualification uses `gpt-5.6-sol`; Refresh
  qualification uses `gpt-5.6-terra`. This is explicit benchmark configuration,
  not a model credential/router inside AgentBase-MCP.
- **AB-BENCH-054** — Full-stack Initial Ingest reuses catalog 7 and evaluates
  useful workload/contract boundaries without requiring a complete inventory or
  provider-specific schema.
- **AB-BENCH-055** — A Refresh baseline must be structurally valid, reviewable
  and contain exact source-backed health-contract knowledge. A high aggregate
  score alone cannot admit it.
- **AB-BENCH-056** — The ECS Refresh mutation changes `/status` to `/health` in
  the backend route/Swagger text and both Terraform server target groups in one
  synthetic commit.
- **AB-BENCH-057** — ECS Refresh additionally requires `GET /health` plus exact
  Terraform evidence in the API concept and rejects retained `GET /status`.
- **AB-BENCH-058** — Runs remain sequential: one Sol Init probe, one Terra
  Refresh probe and at most one Terra replica after an unblocked probe. These
  qualification runs never deploy, call provider CLI, Accept, Publish or open a
  Hub PR.
- **AB-BENCH-059** — Reports separate OKF/MCP defects, benchmark defects and
  truthful partial coverage. Equivalent evidence that misses an overly exact
  scorer probe remains a benchmark finding, not an automatic OKF defect.
- **AB-BENCH-060** — Batch Initial Ingest qualification pins two distinct clean
  Terraform repositories, one owner-confirmed semantic Domain, catalog `7.0.0`,
  Codex version, `gpt-5.6-sol` and reasoning effort. Provider similarity alone
  is not a valid Domain assignment.
- **AB-BENCH-061** — One isolated host-agent process executes batch Prepare and
  confirmation, then indexes, investigates, authors and records each member
  sequentially before one batch Finalize and Inspect. Member evidence remains
  rooted in its own repository and no provider CLI is available.
- **AB-BENCH-062** — A batch run succeeds only with exactly one structurally
  valid `batch-new` proposal covering every pinned Repository ID and the
  confirmed Domain. Missing/extra lifecycle calls, source drift, failed members,
  missing attribution or any Accept/Publish/provider call fail visibly.
- **AB-BENCH-063** — Batch artifacts retain one portable prompt, exact manifest
  and fixture states, JSONL trace, final message, combined OKF tree, proposal
  attribution and a report separating OKF quality, MCP/runtime defects and
  benchmark defects. Truthful partial knowledge is not failed for incompleteness.
- **AB-BENCH-064** — Qualification runs one probe first. Only a valid proposal
  without a clear quality blocker authorizes one identical sequential replica;
  routine debugging never runs a third attempt.
- **AB-BENCH-065** — A failed batch member caused by an agent-visible tool schema
  omitting an enforced input grammar is an MCP contract defect, not an OKF
  quality failure. The correction receives a new immutable prompt identity and
  preserves the failed run before another single probe.
- **AB-BENCH-066** — Sequential graph rebinding receives immutable Batch prompt
  V3. V1 retains the Question-contract failure and V2 retains the one-repository
  connection-binding failure; neither historical run or prompt is rewritten.
- **AB-BENCH-067** — Batch schema guidance matches the qualified Initial Ingest
  recovery contract: each member calls once, or corrects exactly one retryable
  `INVALID_ARGUMENT` request defect and succeeds on one retry. Batch V3 retains
  the contradictory no-retry failure; V4 carries the corrected contract.
- **AB-BENCH-068** — Batch V4 retains the member-one record failure caused by
  removing generated Domain repository provenance after changed-set validation.
  V5 preserves generated skeleton provenance explicitly and does not weaken the
  final trust gate. A failed run never authorizes a replica.
- **AB-BENCH-069** — Historical v1–v7 prompts and results remain immutable
  evidence but their retired fine-grained MCP authoring tools are no longer a
  released compatibility surface. Current MVP Initial Ingest, Refresh and Batch
  qualification use authoring guidance plus `validate_okf_changes` and remain
  runnable. Removing legacy tools never authorizes a replacement model run.
- **AB-BENCH-070** — Cross-repository MVP qualification pins a six-repository
  AWS Terraform/Terragrunt suite spanning crawler/data pipeline,
  recommendation, multi-account infrastructure, Lambda platform, ECS workload
  and one intentionally sparse tutorial. Reference expectations contain only
  representative important probes, never a complete required inventory.
  Repositories run sequentially under AB-BENCH-048; SAM/CloudFormation remains
  excluded and historical suites/results remain immutable.
- **AB-BENCH-071** — The first diverse-suite probe retains its V15 failure: the
  obsolete prompt requested removed local-only Hub setup and no OKF was
  authored. V16 instead seeds one isolated admitted remote-profile fixture in
  the runner, forbids configuration/publication/network actions and otherwise
  preserves the Initial Ingest lifecycle. This corrects benchmark setup only;
  it does not restore local-only Hub authority or change MCP runtime behavior.
- **AB-BENCH-072** — Diverse-suite V16 is superseded before any model run
  because its standalone authoring prompt duplicated the released product
  workflow. V17 installs the exact released AgentBase skill set into the
  isolated Codex workspace and explicitly invokes `$agentbase-ingest`; its
  prompt supplies only owner input, benchmark isolation and artifact capture.
  The run records skill-tree digests and validates that the installed copies do
  not change. Lifecycle scoring follows the skill contract beginning at
  `preflight_hub_ingest`, rather than requiring the obsolete prompt-only
  `get_hub_status` step.
- **AB-BENCH-073** — The first V17 skill-backed run remains immutable evidence.
  It completed one valid finalized proposal but exposed two contract defects:
  the agent-visible Prepare schema omitted the Initial Ingest
  `repositories/<slug>` grammar, and benchmark coverage incorrectly expected a
  Question generated by Finalize to have existed during earlier changed-set
  validation. The correction makes the subject grammar visible to the skill
  and excludes Finalize-generated Questions only from that pre-Finalize
  coverage comparison; neither final OKF validation nor Question governance is
  weakened.
- **AB-BENCH-074** — Capability 046 qualification invokes the exact released
  `agentbase-ingest` skill against exact clean remote-default fixture revisions.
  The harness independently proves representative source evidence entered the
  machine Seed before separately checking its proposal disposition. P0 scoring
  gates repository identity, runtime/entrypoint, interface/trigger,
  deploy evidence, explicit outbound dependency acknowledgement and proposal
  integrity. P1 useful Flow/data/integration/limitations may remain partial;
  P2 CRUD/helper/test details are diagnostics, not completeness requirements.
  No scorer requires an exact concept count, concept name or one exact source
  combination when another source-truthful representation satisfies the role.
- **AB-BENCH-075** — Capability 046 runs one sequential probe and stops on a hard
  lifecycle/integrity/coverage blocker. A valid run without a clear blocker may
  run one identical sequential replica to compare semantic stability. Every
  report separates OKF/MCP defects from benchmark defects and states improvement,
  regression, elapsed time and token use versus the prior accepted run. Token
  cost is measured before setting a product budget or narrowing discovery.

## Context A/B interpretation

`pair` runs MCP first and direct-source second, sequentially, so concurrent
resource contention does not distort elapsed time. `compare` finalizes both
with the same semantic expectation and writes raw per-arm metrics plus
MCP-minus-direct efficiency deltas.

This compares the complete AgentBase-assisted workflow with an unassisted
source baseline. It does not isolate graph retrieval from schema guidance.
Codex token events are the primary context-cost evidence; command counts are
observations only and cannot prove every file or byte read.

## Historical v1 baseline

Suite `aws-serverless` pins two repositories with catalog `3.0.0`, prompt
`okf-author-v1`, Codex CLI `0.147.0`, model `gpt-5.6-terra` and medium effort.

The completed real run `aws-health-aware/2026-08-14T113246Z` found all five
expected concepts but added one repository concept. It scored 83% concept/schema
precision, 100% concept/schema recall, 100% metadata, 86% provenance and 100%
expected relationships. It is intentionally non-passing because root
`index.md` included prose outside the accepted heading/link grammar.

`aws-serverless-shopping-cart` has not yet received a current model-backed
authoring run. Earlier `2026-08-14T091540Z` data is observation smoke evidence,
not a comparable agent baseline.

## First real context A/B evidence

Pair `aws-health-aware/2026-08-14T181910Z` is complete evidence for the pinned
fixture, Codex CLI `0.147.0`, model `gpt-5.6-terra` and medium effort:

| Measure | MCP | Direct | MCP minus direct |
|---|---:|---:|---:|
| Elapsed | 155,167 ms | 205,359 ms | -50,192 ms |
| Input tokens | 674,260 | 675,861 | -1,601 |
| Cached input | 615,424 | 617,728 | -2,304 |
| Uncached input | 58,836 | 58,133 | +703 |
| Output tokens | 6,023 | 9,359 | -3,336 |
| Reasoning output | 895 | 2,153 | -1,258 |
| Concept precision / recall | 60% / 60% | 22% / 40% | — |
| Schema precision / recall | 40% / 40% | 0% / 0% | — |
| Metadata completeness | 25% | 0% | — |
| Provenance coverage | 29% | 0% | — |
| Expected relationship coverage | 0% | 100% | — |
| OKF conformance | failed | failed | — |

MCP was 50 seconds (24%) faster and emitted 36% fewer output tokens, but total
input differed by only 0.2% and MCP used 1.2% more uncached input. This run
therefore does **not** establish context-token savings. MCP produced materially
better concept, schema, metadata and provenance scores than the direct baseline,
but 60% concept recall, 0% expected relationships and failed conformance are not
good enough for a trustworthy authoring workflow.

The direct arm's 100% relationship coverage is conditional on its two matched
concepts and sits beside seven unexpected concepts and eight unexpected
relationships; it is not evidence of complete relationship understanding.

Capability 014 introduces immutable `okf-author-v2` and
`okf-author-direct-v2` prompts with an equivalent general quality contract. It
does not expose gold expectations or add an MCP tool. Its evidence-first
assessment rejects proven authoring faults while retaining incomplete,
source-backed drafts for human review.

## First v2 authoring-quality evidence

Pair `aws-health-aware/2026-08-14T184644Z` completed on the same fixture, CLI,
model and effort. Under the corrected evidence-first scorer, MCP is conformant,
confirms four of five reference concepts with 100% recognized-schema agreement,
provides 75% metadata, 71% reference provenance and confirms five of six
reference relationships. The missing Business Flow is only a diagnostic gap.
However, its Lambda declares `declared-by` without a resolving Markdown link,
so the arm is correctly `invalid` under AB-BENCH-021/023. Direct is invalid
because its bundle is non-conformant and contains recognized schema
contradictions; unmatched authored concepts and relationships remain unjudged
instead of being counted as false positives.

MCP used 964,879 input tokens versus direct's 524,356 and took 241,227 ms versus
166,371 ms. v2 provides no context-token or elapsed-time saving evidence. The
remaining MCP gap is one missing evidence-supported Business Flow: the agent
authored a Repository concept instead, so the flow's metadata, cross-file
provenance and expected flow relationship were absent. Deterministic checks do
not prove semantic support for every authored claim; human review is still
required. The shopping-cart model pair is deferred until the general bundle
consistency gap is fixed; no fixture-specific hint is justified. Immutable v3
prompts add only a required bounded relationship-set validation step to the MCP
workflow.

## v3 heterogeneous evidence

The unchanged v3 workflow completed current-model pairs on both pinned fixture
types. Both MCP arms called `validate_okf_relationships`, passed conformance and
are reviewable; this is bounded two-repository evidence, not universal proof.

| MCP quality | Health Aware `2026-08-15T040000Z` | Shopping cart `2026-08-15T041000Z` |
|---|---:|---:|
| Assessment | reviewable | reviewable |
| Reference concepts | 80% | 100% |
| Recognized schema agreement | 100% | 100% |
| Metadata | 83% | 100% |
| Provenance | 86% | 80% |
| Reference relationships | 67% | 100% |
| Unjudged concepts | 0 | 1 |

Health Aware omitted the DynamoDB table and related edges; shopping cart added a
source-backed deletion Lambda outside the non-exhaustive reference. These are
visible review/coverage items, not hard failures. Human review is still required
because path checks cannot establish semantic support for every claim.

| MCP-minus-direct efficiency | Health Aware | Shopping cart |
|---|---:|---:|
| Elapsed | +11,400 ms | +33,661 ms |
| Input tokens | +210,649 | +466,574 |
| Uncached input | +3,289 | +13,966 |
| Output tokens | -879 | +400 |
| Reasoning output | -775 | -362 |

Both direct arms were invalid, so the table is not a quality-equivalent speed
contest. It nevertheless shows that MCP consumed more input and elapsed time in
both measured pairs. AgentBase therefore claims reviewable authoring quality,
not context-token or runtime savings.

## v4 batch-authoring checkpoint

Retained v3 traces show 20 schema/validation calls for Health Aware and 27 for
shopping cart. The immutable v4 workflow keeps the shared authoring contract but
uses one selected-schema guidance call and whole-bundle validation calls. Fake
execution proves the required batch lifecycle and records argument/result bytes.
Initial catalog-3.0.0 runs reduced these calls to two on both repositories, but
shopping cart exposed a general natural-phrase selector fault and is retained as
invalid evidence. Catalog 3.1.0 fixes separated evidence-word selection without
fixture rules.

Corrected runs `aws-health-aware/2026-08-15T083649Z` and
`aws-serverless-shopping-cart/2026-08-15T083940Z` are both reviewable, have 100%
recognized-schema agreement and contain no contradicted reference concepts or
relationships. Health confirms 60% of reference concepts and 50% of reference
relationships; shopping cart confirms 80% and 60%, including the concrete AWS
SQS Queue that previously failed. Shopping also contains 16 unjudged concepts
and 33 unjudged relationships requiring human review. These non-exhaustive
coverage diagnostics are lower than retained v3 measurements, so batching does
not establish better discovery quality.

Both corrected runs use two authoring/schema-validation calls, reductions of
90% and 93% from v3. Health records 506,541 input tokens and 155,919 ms; shopping
records 808,385 input tokens and 290,240 ms. Call reduction proves interaction
batching only. Token/time remain supporting telemetry and do not outweigh
evidence coverage, unresolved knowledge or later owner review.

## v5 offline qualification

The active suite now pins catalog `4.0.0` and immutable `okf-author-v5` /
`okf-author-direct-v5` prompts. V5 removes scorer probe keys from authored OKF,
checks cited paths and line bounds against the pinned repository, and reports
owner-review usefulness independently from validity and reference coverage.
Deterministic tests distinguish a compact canonical graph from thin per-route or
per-handler inventories and reject benchmark-only metadata at the Hub boundary.

A three-source lifecycle test applies frontend, backend and infrastructure
evidence sequentially to the same Shopping Cart system. It preserves all three
repository sources while retaining one system identity and separate component
and infrastructure identities. This lifecycle evidence is offline and remains
separate from model-output evidence.

The first V5 Shopping Cart run produced useful canonical content but failed root
conformance because the prompt permitted a generic Markdown list while the
bundle contract requires `*` entries. Immutable V6 changes only that shared
grammar instruction and retains the V5 quality/scoring model.

The V6 rerun passed conformance but substituted a Lambda concept for an
evidenced Business Flow and omitted one required Limitations section, so it was
not publishable. Immutable V7 adds the general boundary rule that implementation
concepts do not replace behavior concepts and requires schema-recommended
Limitations sections; it does not name a fixture or expected identity.

V7 Shopping Cart run `2026-08-15T102132Z` is conformant, reviewable and
`useful_for_owner_review`. Its 12-concept canonical graph confirms all seven
semantic probes with 100% recognized-schema agreement and no contradiction.
Metadata, reference provenance and relationship coverage are 25%, 64% and 43%;
these remain visible diagnostics, not evidence that missing knowledge is known.
The run used 690,476 input tokens (623,616 cached), 8,998 output tokens and
213,567 ms. No token-efficiency claim follows from this single MCP arm.

Immutable V8 moves the suite to catalog 5.0.0. It validates only authored
changes against explicit targets, requires one canonical evidenced direction
per edge and structured ordered flow steps, and evaluates progressive
Domain/System/Repository navigation. The Shopping Cart expectation also checks
whether its source-level TTL disagreement is surfaced for owner review; absence
is a review finding rather than a claim that the whole OKF draft is invalid.

The first V8 Shopping Cart run exposed an artifact-boundary defect: the agent
validated ephemeral type-prefixed identities and paths beginning with `okf/`,
which did not survive loading the emitted bundle. The run is retained as failed
evidence. Immutable V9 requires path-derived durable identities, obtains schema
guidance after evidence discovery, preserves evidenced parent components, names
exact progressive category indexes and explicitly compares documented numeric
policies with implementation.

V9 Shopping Cart run `2026-08-15T163041Z` reloads as a valid, reviewable
16-concept bundle. It confirms all seven reference concepts with 100% schema
agreement, all six canonical relationship probes, all required semantic
metadata and 73% reference provenance. It adds frontend, parent services,
independent workers, two ordered flows and progressive category indexes. Owner
review remains `needs_revision`: the TTL disagreement is visible in the table
body, but the concept does not cite the migration source that supports its
30-day statement and does not place the conflict in Limitations. Authentication
infrastructure, a separate DLQ identity and explicit operation-to-handler maps
also remain useful enrichment rather than inferred facts.

The exact V9 bundle was accepted from remote Hub `main` as new subject
`systems/serverless-shopping-cart` and published without merge as
[`AgentBase-Hub` PR #7](https://github.com/khoaha1904/AgentBase-Hub/pull/7).
Proposal `1825cee818828dd7e60cfb3f` has accepted commit
`faaf8569452699a9405c062ca90042a499546b71`; the PR remains human-review input,
not proof that the visible owner-review findings are resolved. Governed
questions are deliberately not represented as OKF concepts in this capability.

## Confirmed-Domain qualification

Capability 018 added owner-confirmed `domains/commerce` input and shared-index
preservation. V10 run `2026-08-15T171650Z` found all eight reference concepts
but is retained as invalid evidence because its generated category entries used
unsupported `-` markers. Immutable V11 corrected only that general index
grammar.

V11 run `2026-08-15T172701Z` is valid and reviewable. It preserves the
`AgentBase-Hub` root, provides Commerce → Serverless Shopping Cart navigation,
finds all eight reference concepts with 100% recognized-schema agreement and
reports 88% metadata, 82% provenance and 86% reference relationship coverage.
It is accepted as the real AB-BENCH-041 Domain/navigation qualification.

Owner review does not treat its literal TTL diagnostic as durable truth. The
bundle mentions incompatible seven-day documentation and 30-day migration
behavior but lacks complete source coverage and retains volatile numeric
snapshots. Capability 019 then superseded that scoring model with governed
questions and portable live source references. The current Part 08 design
supersedes that resolver direction again with bounded observed snapshots,
shared file-level source references and ordinary authorized source reads.
Open Hub PR #7 remains the earlier V9 proposal and
is not rebuilt, replaced or merged until capability 019 separately qualifies
publication.

AB-BENCH-042 was covered offline by expectation format v8 and deterministic
live-resolution cases. V12 run `2026-08-17T063359Z` is retained as invalid
historical evidence: it authored live references but used target kinds outside the portable
contract, added forbidden category-index frontmatter and omitted the required
cart-retention documentation/implementation reference set. It scored 0% live-
evidence reference coverage and is not publication evidence. At that time the
next prompt needed the exact portable target kinds and root-only frontmatter
rule. These V12 findings explain that historical contract;
they do not reintroduce a live-reference resolver into the current design.
Qualification and publication remain separately opt-in.

## V13 Initial Ingest qualification

Three authorized sequential V13 runs on 2026-08-21 produced zero valid
previews. Timing passed in isolation (median 360,518 ms), but validity and owner
review failed because no run reached Inspect. The sequence exposed and then
verified fixes for private provider HOME, MCP XDG isolation, mandatory
Repository selection and bounded tool exposure. The final Health Aware run
successfully indexed 240 nodes and 537 edges, then failed because the agent had
no exact machine-followable OKF document template and retried finalization
instead of stopping after its validation repair. Shopping Cart additionally
exposed missing SAM/CloudFormation detector coverage. These results are retained
as failed evidence; AB-BENCH-043 and SC-005 are not accepted, and no Hub PR was
created or rebuilt.
