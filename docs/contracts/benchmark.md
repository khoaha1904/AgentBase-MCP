# Agent-driven OKF benchmark contract

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
  prescribing prose, paths or slugs.
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
  `validate_okf_bundle`. The legacy fine-grained tools remain compatible but are
  not required by v4.
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
