# Verification: Single-Repository Initial Ingest

**Status**: Offline implementation accepted; V13 lifecycle stable, semantic external qualification failed.

## Suggested semantic guidance correction — 2026-08-21

- Added released provider-neutral `suggested_type` as explicit evidence-bound
  agent intent and the distinct `suggested` guidance status.
- Exact structured mapping remains `exact`; structured mapping overrides a
  suggestion, while semantic disagreement or multiple roles is `ambiguous`.
- Initial Ingest renders suggested skeletons with a visible proposal-review
  limitation. A System skeleton carries the owner-evidenced confirmed-Domain
  relation so inbound Domain navigation is derivable.
- Immutable V14 prompts and the fake lifecycle harness are prepared. Historical
  V13 prompts/results remain unchanged; no V14 model benchmark was run.
- Canonical `npm run verify` passed: 391/391 offline tests, specification check,
  TypeScript, dependency architecture, dead-code/dependency health, redacted
  secret scan and `git diff --check` all passed.

## Offline evidence — 2026-08-21

- Focused quickstart: 43/43 tests passed in 1.74 seconds.
- End-to-end fixture: Repository preflight and Terraform/AWS guidance produced
  generic Repository, Function and Queue drafts, retained an explicit partial
  limitation and ended at an applicable `prepared` proposal. Pending accepted
  commits remained zero; no network, provider CLI, Accept or Publish ran.
- Canonical gate: `npm run verify` passed.
  - specification checks passed;
  - TypeScript passed;
  - dependency-cruiser found 0 violations across 190 modules/789 dependencies;
  - Knip passed;
  - Gitleaks scanned about 13.54 MB and found no leaks;
  - 376/376 offline tests passed;
  - `git diff --check` passed.

The gate initially identified one fake access-key-shaped test value and stale
spec-check fixture counts. The value was assembled only at runtime so the
secret scanner remains strict, and the fixture generator was updated to the
new living-contract ranges. The complete gate then passed without an allowlist.

## V13 offline qualification — 2026-08-21

- Focused V13 and Initial Ingest gate: 73/73 tests passed.
- Canonical gate: `npm run verify` passed.
  - specification checks, TypeScript, Knip and `git diff --check` passed;
  - dependency-cruiser found 0 violations across 190 modules/790 dependencies;
  - Gitleaks scanned about 13.57 MB and found no leaks;
  - 379/379 offline tests passed.
- AB-INGEST-010 now requires the confirmed primary Domain on the Repository
  relation and derives new-proposal evidence identity from validated guidance
  plus exact source state.
- The immutable V13 harness uses catalog `6.0.0`, isolates local Hub runtime
  state, requires Preflight through Inspect, permits at most one validation
  repair, and rejects Accept, bootstrap, submit and synchronize operations.

## V13 external qualification — 2026-08-21

Exactly three model-backed runs executed sequentially through one isolated
AgentDocks account runtime. No replacement run was added after a failure.

| Run | Repository | Elapsed | Outcome | Validation / finalize attempts |
|---|---|---:|---|---:|
| `2026-08-21T010900Z` | Health Aware | 83,058 ms | invalid; no preview | 0 / 0 |
| `2026-08-21T011800Z` | Shopping Cart | 361,368 ms | invalid; no preview | 4 / 3 |
| `2026-08-21T013000Z` | Health Aware | 360,518 ms | invalid; no preview | 2 / 7 |

Median elapsed time was 360,518 ms, below the ten-minute timing target, but the
validity/reviewability requirement failed at 0/3. No run reached Inspect, Accept
or Publish, and no Hub PR was created or rebuilt.

The runs identified these concrete gaps:

- run 1 exposed an empty provider `HOME`, non-isolated MCP XDG state and an
  unclear candidate `evidence_ids` contract; the benchmark-created ambient
  `hub.json` and empty local Hub were moved to Trash without touching the
  existing credential file;
- run 2 proved Hub isolation, then exposed a non-private temp ancestor,
  omission of the mandatory Repository schema, unbounded legacy schema calls
  and missing SAM/CloudFormation detector coverage;
- run 3 proved isolated graph indexing and architecture retrieval (240 nodes,
  537 edges), but the agent still lacked one exact machine-followable OKF
  document template and session-aware pre-final validation. It authored invalid
  frontmatter, exhausted its repair budget and retried finalization seven times.

The first two runtime/integration defects were corrected and the complete
offline gate remained 379/379. The remaining acceptance blocker is not concept
coverage: Initial Ingest needs a deterministic authoring surface that emits or
validates exact document bytes before finalization, plus a later scoped decision
on SAM/CloudFormation mapping. Capability 022 remains active and SC-005 is not
accepted. Another model-backed run requires a new owner authorization.

## Post-V13 deterministic authoring correction — 2026-08-21

- AB-INGEST-011 separates Concept Schema (knowledge meaning), the shared OKF
  document renderer (encoding) and the concrete editable skeleton in the
  proposal workspace.
- New Initial Ingest preparation now renders Repository, confirmed Domain and
  every exact candidate recommendation with canonical paths, valid draft and
  generation fields, normalized repository sources, generic concept types,
  technology metadata and required navigation.
- The representative offline Initial Ingest now obtains Repository, Domain,
  Function and Queue skeletons from preparation and finalizes them directly
  into one applicable partial preview without handwritten frontmatter.
- Focused authoring/runtime/local-Hub tests passed, followed by the complete
  `npm run verify` gate: specification checks, TypeScript, dependency rules,
  Knip, Gitleaks, 379 offline tests and `git diff --check` passed.
- No model-backed benchmark, provider CLI, Accept, Publish or Hub PR operation
  was run. SAM/CloudFormation mapping remains outside this correction, and a
  new external qualification still requires explicit owner authorization.

## Post-correction V13 requalification — 2026-08-21

The owner authorized exactly three sequential model-backed reruns with the
unchanged V13 prompt and lifecycle criteria. The machine's reviewed Codex CLI
pin was updated from `0.147.0` to `0.149.0`; model, effort, fixtures and prompt
were unchanged. No replacement run was added after failure.

| Run | Repository | Elapsed | Finalize | Gate outcome |
|---|---|---:|---:|---|
| `2026-08-21T071606Z` | Health Aware | 183,215 ms | 1 | failed: Inspect called twice |
| `2026-08-21T071929Z` | Shopping Cart | 185,583 ms | 1 | failed: Inspect called twice; validation called three times |
| `2026-08-21T072249Z` | Health Aware | 176,141 ms | 1 | failed: Inspect called twice |

Official qualification remains **0/3** because no run satisfied the exact MCP
lifecycle gate. Median elapsed time was 183,215 ms (about 3.1 minutes), well
below the ten-minute target and about half the previous V13 median.

The correction nevertheless resolved the prior packaging blocker: all three
runs prepared valid skeleton-backed bundles and finalized exactly once into an
applicable prepared proposal. The prior repeated-finalize/frontmatter failure
did not recur. The remaining common failure is deterministic tool-contract
drift: `inspect_hub_okf_proposal` advertises required input `transaction_id`,
while its call adapter requires `proposal_id`. Each agent first obeyed the
published schema, received `proposal_id is required`, then tried the runtime
name and was rejected by MCP input validation, producing two failed calls.
Shopping Cart additionally exceeded the one-repair ceiling with three
changed-set validations.

SAM/CloudFormation coverage was intentionally not added for this rerun. Missing
provider-neutral mappings produced explicit partial limitations rather than an
OKF integrity failure. Because the lifecycle failure prevented artifact
admission, semantic benchmark scoring was not claimed. No Accept, Publish,
provider CLI or Hub PR operation occurred; the isolated AgentDocks runtime was
synchronized and removed after the third run.

## Post-requalification contract correction — 2026-08-21

- `inspect_hub_okf_proposal` now advertises the same required `proposal_id`
  consumed by its dispatcher; a regression test proves one schema-conformant
  call reaches inspection exactly once.
- Changed-set validation and the OKF authoring skill now state that relationship
  guidance follows the exact frontmatter `type`; display names and prose do not
  inherit another schema's rules.
- Focused MCP/schema/skill/spec-check tests passed, followed by the complete
  `npm run verify` gate: specification checks, TypeScript, dependency rules,
  Knip, Gitleaks, 380 offline tests and `git diff --check` passed.
- No model benchmark was rerun. The inspect defect is reproduced and fixed
  deterministically; whether the guidance prevents the Shopping Cart model's
  extra validation cycle remains external qualification evidence, not an
  offline claim.

## Post-contract-fix V13 qualification — 2026-08-21

The owner authorized exactly three more sequential V13 runs with the same
prompt, model, effort, fixtures and Codex `0.149.0`. No replacement run was
added after failure.

| Run | Repository | Elapsed | Inspect | Lifecycle outcome |
|---|---|---:|---:|---|
| `2026-08-21T083416Z` | Health Aware | 181,924 ms | 1 | failed: changed-set validation called three times |
| `2026-08-21T083731Z` | Shopping Cart | 178,728 ms | 1 | failed: schema guidance and validation did not complete; prepare called twice |
| `2026-08-21T084052Z` | Health Aware | 240,433 ms | 1 | passed |

The inspect contract correction is confirmed by all three real runs: Inspect
completed exactly once every time. Official lifecycle qualification improved
from 0/3 to **1/3**, but still fails the three-run stability requirement. Median
elapsed time was 181,924 ms (about 3.0 minutes).

The lifecycle-passing run finalized three concepts: confirmed Domain,
Repository and health-event state Database Table. Final scoring exposed a
separate deterministic harness defect: the scorer checked provenance against
the source checkout identity `repository-aws-health-aware-779eb7e1bc7a`, while
the proposal correctly used the durable Hub-assigned Repository identity
`repository-aws-health-aware-ef3e83846625`. A read-only score using the proposal
identity produced a conformant `reviewable` assessment with 3/8 reference
concept coverage (38%), 100% recognized-schema agreement, 100% metadata, 22%
reference provenance coverage and 13% reference-relationship coverage. Owner
review still reported sparse Domain substance/navigation, so this output needs
later enrichment rather than being treated as complete knowledge.

Run 1 spent two repair attempts converting invalid submitted document content
before its third validation passed. Run 2 first supplied cross-candidate-owned
evidence, causing schema guidance and prepare failures, then prepared a reduced
bundle without a successful validation repair. These are model-facing workflow
stability gaps; the prior Service-title/System-type confusion did not recur.

No Accept, Publish, provider CLI or Hub PR operation occurred. The isolated
AgentDocks runtime was synchronized and removed after the third run. Capability
022 remains active; no harness fix or additional model run is authorized by
this qualification.

## Post-qualification stability correction — 2026-08-21

Two distinct issue classes were corrected without another model run:

- **OKF/MCP issue** — Public tool schemas and shared Ingest/OKF skills now state
  that each candidate may cite only observations with the same `candidate_id`,
  and each changed `content` value must contain the complete Markdown document,
  not a path or wrapper. Existing validators remain the enforcement boundary;
  no retry state, counter or workflow engine was added. Offline tests prove the
  contracts are exposed, not that every model execution will obey them.
- **Benchmark-only issue** — New V13 run artifacts derive and retain the durable
  Hub Repository ID from the isolated source identity hints. Final scoring uses
  that ID for provenance and falls back to `sourceRepositoryId` for historical
  artifacts. This fixes measurement only and changes no OKF or Hub behavior;
  retained run artifacts were not rewritten.

Focused MCP/skill/benchmark tests passed, followed by `npm run verify`:
specification checks, TypeScript, dependency rules, Knip, Gitleaks, 382 offline
tests and `git diff --check` passed. Capability 022 remains external
qualification pending.

## Post-stability V13 qualification — 2026-08-21

The owner authorized exactly three sequential V13 runs after the shared
authoring-contract and durable-provenance scoring corrections. The runs used
the same catalog `6.0.0`, immutable `okf-author-v13` prompt, Codex `0.149.0`,
`gpt-5.6-terra`, medium effort and pinned fixtures. No replacement run was
added.

| Run | Repository | Elapsed | Validation calls | Lifecycle | Semantic assessment |
|---|---|---:|---:|---|---|
| `2026-08-21T090301Z` | Health Aware | 189,024 ms | 2 | passed | invalid; owner review needs revision |
| `2026-08-21T090620Z` | Shopping Cart | 262,805 ms | 2 | passed | invalid; owner review needs revision |
| `2026-08-21T091059Z` | Health Aware | 156,213 ms | 1 | passed | invalid; owner review needs revision |

The exact Initial Ingest lifecycle is now stable at **3/3**. Every run called
status/setup, Preflight, index, architecture, guidance, prepare, search,
validation, finalize and Inspect in the required order. The first two runs
repaired missing Markdown links after one failed validation; the third passed
its first validation. No Accept, Publish, provider CLI or Hub PR operation
occurred. Median elapsed time was 189,024 ms (about 3.2 minutes), below the
ten-minute target. The isolated AgentDocks runtime was synchronized and
removed; pre-existing runtimes were untouched.

The semantic qualification nevertheless remains failed because SC-005 requires
valid reviewable previews, not lifecycle completion alone. The bundles authored
3-5 concepts with 38%, 56% and 38% non-exhaustive reference-concept coverage;
100% metadata; 0%, 42% and 11% reference provenance; and 13% reference
relationship coverage. Coverage itself is diagnostic, but all three drafts
omitted a System boundary and therefore did not provide progressive Domain →
System navigation. One Health root linked concepts directly instead of using
bounded role indexes, and every Domain page remained too shallow for owner
review.

Two issue classes remain separate:

- **OKF/MCP quality issue** — role guidance is sensitive to agent phrasing. A
  Shopping Cart system candidate was recommended as `Service`; another explicit
  Health system candidate was reported unsupported. Strong Terraform evidence
  for Lambda and DynamoDB candidates also became ambiguous when generic
  semantic text mentioned scheduling or events. This leads the agent to omit
  the overview System boundary or choose a lower-level role, producing sparse,
  poorly connected Hub knowledge even though changed-set validation passes.
- **Benchmark-only issue** — the semantic matcher searches identity terms in a
  concept's full body. A Function, Service or Object Storage page that merely
  links to the named repository can therefore be assigned to the missing
  System reference and reported as a hard schema contradiction. This
  overstates the authored defect: the reliable finding is a missing System and
  weak navigation, while the reported wrong-schema hard failures are not clean
  evidence. The durable Repository-ID correction itself is confirmed: every
  new run records and scores the Hub-assigned identity; low provenance scores
  now reflect omitted reference paths rather than checkout-ID mismatch.

Capability 022 remains active. No additional model run, Accept, Publish or PR
operation is authorized by this evidence.

## Post-stability semantic correction — 2026-08-21

The two independently reproduced qualification defects were corrected without
another model run:

- **OKF/MCP** — one exact supported Terraform/provider mapping now outranks
  incidental semantic role words for the same candidate. Multiple distinct
  structured mappings remain ambiguous. The public tool and Ingest skill also
  require a separate System candidate supported by a recognizable capability
  plus cooperating entities; they never force System from one keyword or
  rename a Repository/Service.
- **Benchmark** — a wrong-schema contradiction now requires all reference
  identity terms in canonical identity or title. Contextual descriptions,
  bodies and Repository links may support a same-schema match but cannot convert
  missing reference knowledge into a hard contradiction.

Focused guidance/MCP/benchmark regressions passed 48/48. A read-only corrected
score, which did not rewrite retained metrics, changed both Health assessments
from `invalid` to `reviewable` with the absent System reported as missing
reference knowledge. Shopping remains correctly `invalid`: its explicit
`components/shopping-cart-system` identity is authored as `Service`. All three
owner reviews still need revision because System/Domain navigation is absent or
shallow, so SC-005 and capability 022 remain open.

## Post-semantic-correction V13 qualification — 2026-08-21

The owner authorized exactly three more sequential V13 runs with unchanged
prompt, catalog, model, effort, CLI and pinned fixtures. No replacement run was
added.

| Run | Repository | Elapsed | Lifecycle | Semantic | Owner review |
|---|---|---:|---|---|---|
| `2026-08-21T094822Z` | Health Aware | 195,159 ms | passed | reviewable | needs revision |
| `2026-08-21T095147Z` | Shopping Cart | 214,048 ms | passed | invalid | needs revision |
| `2026-08-21T095531Z` | Health Aware | 198,023 ms | passed | reviewable | needs revision |

Lifecycle remains stable at **3/3** with a 198,023 ms median (about 3.3
minutes). Every required MCP stage completed exactly once; validation used two,
one and two calls respectively. No Accept, Publish, provider CLI or Hub PR
operation occurred, and the isolated AgentDocks runtime was synchronized and
removed without touching existing runtimes.

The structured-evidence correction is confirmed. Both Health runs received
exact Function and Database Table guidance despite event-oriented prose; their
bundles are conformant, `reviewable` and have 100% recognized-schema agreement.
The corrected scorer reports System as missing rather than manufacturing a
wrong-schema contradiction. Shopping's contradiction is real: its candidate
and authored identity describe `shopping-cart-service`, which is correctly
typed Service but was used in place of the missing System.

SC-005 still fails at owner review. All three Domain pages lack progressive
System navigation and reviewable substance. Trace evidence locates the remaining
product gap at semantic role selection: the agents did create separate Health
System candidates with capability/cooperating-entity rationale, but guidance
selects only literal semantic-observation signals. Source-faithful sentences
such as “automated notification tool sends alerts” do not contain the catalog
phrase `system capability`, so the candidates remain unsupported. Trusting the
candidate rationale as exact truth, keeping it unsupported, or introducing an
explicit advisory/suggested semantic result is an owner-visible policy choice;
no further implementation or model run is authorized by this qualification.

There is no new benchmark-only defect in these runs. The scorer correctly
classifies both missing and genuine wrong-schema cases.

## V14 external qualification — 2026-08-21

The owner authorized exactly three sequential V14 runs after the suggested-role
implementation: Health → Shopping → Health. All used catalog `6.0.0`, immutable
`okf-author-v14`, Codex `0.149.0`, `gpt-5.6-terra` at medium effort and the same
pinned fixtures. No replacement run was added.

| Run | Repository | Elapsed | Lifecycle | Semantic/owner result |
|---|---|---:|---|---|
| `2026-08-21T112529Z` | Health Aware | 203,914 ms | failed | no finalized bundle |
| `2026-08-21T112911Z` | Shopping Cart | 237,518 ms | failed | lifecycle-invalid bundle excluded from scoring |
| `2026-08-21T113328Z` | Health Aware | 184,168 ms | passed | reviewable; owner review needs revision |

Lifecycle qualification failed at **1/3**. Median elapsed time was 203,914 ms
(about 3.4 minutes), below the ten-minute target. No Accept, Publish, provider
CLI or Hub PR operation occurred.

The issues remain separated:

- **OKF/MCP authoring issue** — The first Health run proves that `suggested`
  can return and render a review-limited System with owner-evidenced Domain
  membership. The agent nevertheless added inverse `contains` relationships,
  which are not canonical predicates; Finalize correctly rejected them. The
  Shopping run sent `suggested_type: Component` instead of the released
  `Software Component`, so guidance correctly rejected the complete request.
  The final Health run passed lifecycle and produced five valid concepts with
  100% recognized-schema agreement and metadata completeness, but its System
  candidate became ambiguous because broad semantic roles also matched Event
  and Repository. It therefore omitted System, retained only 38% reference
  concept coverage and 13% reference relationship coverage, and left the
  Domain page without System navigation or reviewable substance.
- **Benchmark issue** — No new scorer or harness defect explains the failed
  qualification. It correctly rejected unsuccessful required calls and the
  duplicate Finalize, and it scored the sole lifecycle-valid bundle as
  reviewable with System missing. Its failure wording says a required tool was
  “not observed” when the trace contains a failed call; this is imprecise
  diagnostic wording only, not the cause of failure or a scoring error.

V14 is not accepted and SC-005 remains open. The evidence supports one common
correction round before any new model run: publish exact released schema names
and canonical relationship direction more directly to the host agent; make a
failed guidance request terminate as Incomplete instead of being silently
changed; keep Finalize exactly once; and prevent unrelated semantic role words
from overriding an otherwise evidence-bound System suggestion. No such
correction or further qualification is authorized by this run.

## Catalog 7 simplification offline verification — 2026-08-21

The owner-approved Detect → Promote → Render cutover is implemented. Initial
Ingest now has eight provider-neutral roles: Repository, Domain, System,
Component, Function, Interface, Flow and Resource. Entity and Metric remain
enrichment-only. Provider mappings describe technology; only a separately
evidenced useful boundary becomes a concept. Small resources such as an SQS
queue default to bounded embedded knowledge under a promoted parent, while a
Lambda may map exactly to Function. EC2 is hosting evidence rather than a
standalone Server concept.

The authoring boundary rejects retired AgentBase catalog-6 roles for new
drafts, retains foreign open-world types, requires an explicit concept versus
embedded disposition and refuses an embedded item without a promoted parent.
Skeleton rendering creates files only for promoted candidates and groups
embedded items into one compact, source-linked table without graph identity.
V15 fixtures and scoring require useful concepts plus embedded knowledge; they
do not reward one file per cloud resource.

Focused catalog, guidance, MCP, authoring, skill and benchmark tests passed
97/97. Compatibility regressions found by the first full gate were limited to
catalog-6 test fixtures; after converting them, their focused suites passed
33/33. The final `npm run verify` passed specification checks, TypeScript,
dependency rules (191 modules and 796 dependencies), Knip, Gitleaks, all
390 tests and `git diff --check`.

No model benchmark, Accept, Publish, provider CLI or Hub PR operation occurred
during this offline verification. Exactly one V15 model qualification remains
authorized as T045.

## First V15 qualification — 2026-08-21

The owner-authorized first and only V15 run in this round is retained at
`benchmark/results/aws-serverless/aws-health-aware/2026-08-21T122847Z/`.
It used catalog `7.0.0`, prompt `okf-author-v15`, Codex `0.149.0`,
`gpt-5.6-terra` at medium effort and the pinned Health fixture. It completed in
95,965 ms with 486,142 input tokens (426,752 cached), 2,868 output tokens and
746 reasoning-output tokens. No replacement run was made.

The run failed during `prepare_hub_okf`. Guidance successfully suggested a
System, Function, Interface and Flow, and the agent proposed DynamoDB state and
delivery secrets as embedded knowledge. The deterministic renderer then
generated the Flow skeleton without its schema-required `flow_steps` field;
its own validation rejected the skeleton. The agent correctly stopped
Incomplete after the single failed prepare, so there was no finalized bundle
to score and no validate/finalize/inspect call.

Issue classes remain separate:

- **OKF/MCP defect (blocking)** — the generated skeleton contract cannot render
  a valid promoted Flow even though catalog guidance requires `flow_steps`.
  This is a real product gate, not a prose-quality problem.
- **OKF/MCP coverage gap (non-blocking for this failure)** — semantic-only
  CloudFormation evidence for the proposed embedded DynamoDB/secrets items was
  returned as unsupported because current technology detection is limited to
  released structured mappings. Those items would not have appeared in the
  parent even if Flow preparation had succeeded.
- **Benchmark diagnostic defect (non-causal)** — the trace contains one failed
  `prepare_hub_okf` call, while the lifecycle summary says the required call was
  “not observed” because only successful calls count. The invalid/no-output
  result is correct; the wording is not.

The model followed the fail-closed lifecycle and did not call Accept, Publish,
provider CLI or create a Hub PR. V15 is not accepted from this run. Further
implementation or another model benchmark requires a new owner decision.

## Terraform-only MVP benchmark scope — 2026-08-21

The owner removed SAM/CloudFormation and mixed frontend/backend qualification
from the current MVP. The V15 manifest now exposes only the pinned Terraform
Health Aware fixture. Its V15 Shopping Cart expectation was removed; older
Shopping Cart prompts, expectations and retained run artifacts remain unchanged
as historical evidence. No source fixture or historical benchmark result was
deleted.

Focused benchmark coverage passed 53/53, then `npm run verify` passed all 390
tests plus the complete deterministic repository gate. No model was invoked.

## V15 Flow preparation correction — 2026-08-21

Bug `v15-authoring-gates` is verified offline. Preparation now returns a
promoted Flow skeleton with an explicit `flow_steps: []` edit point instead of
failing or inventing endpoints. The ordinary changed-set/final gate rejects
that skeleton until the agent authors a non-empty linked and evidenced step
sequence. The same regression retains the existing Terraform SQS item as
embedded knowledge under its Function parent, without a standalone Resource
file or a new detector.

Benchmark diagnostics now distinguish a required tool that was observed but
failed from a tool that was never called. Focused verification passed 23/23;
the complete `npm run verify` gate passed specification checks, TypeScript,
dependency rules, Knip, Gitleaks, all 391 tests and `git diff --check`. The V15
prompt and retained failed run remain immutable. No model benchmark, Accept,
Publish, provider CLI or Hub PR operation occurred.

## Repository test simplification — 2026-08-21

Superseded prompt versions no longer repeat detailed prose assertions or receive
an existence test that only duplicates Git history. Detailed semantic assertions
remain on current V15, and fake execution retains one representative for each
runtime tool-contract generation still handled by the runner: V3, V4, V8 and
V15.

The repository now follows an early-development test policy: retain only
specification flows, public design contracts and a small number of end-to-end
boundaries. Function-level behavior, prose/meta checks, thin routing,
historical scorer regressions and exhaustive failure matrices are intentionally
not locked while requirements and low-level design are still moving.

The suite decreased from 391 tests in the feature peak to 50 tests, from 82 to
15 test files, and from 9,472 baseline test lines to 1,698. The focused test run
decreased from about 30 seconds to about 5.2 seconds. `npm run verify` passes with
all specification, TypeScript, dependency, Knip, Gitleaks, test and diff gates.
No production source or model benchmark behavior changed.

## V15 Terraform Health requalification — 2026-08-21

Owner-authorized run `2026-08-21T132954Z` completed the complete Initial Ingest
lifecycle in 183,391 ms with no required-tool failure. Deterministic finalization
passed OKF validation and classified the bundle as `reviewable`: four matched
concepts, 80% reference concept coverage, 100% schema agreement, 100% metadata
completeness, 50% provenance coverage and 75% relationship coverage.

Owner review remains `needs_revision`. The output omits the expected alerting
Flow, the confirmed Domain does not navigate to the System and the Domain prose
is shallow. DynamoDB state, the EventBridge schedule and delivery integrations
are present as embedded Function knowledge. Their benchmark coverage is 0%
because the agent cited CloudFormation/handler evidence from the same repository
while the current expectation requires the Terraform path. This is a
qualification-scope mismatch, distinct from the real navigation and Flow gaps.
No Accept, Publish, provider CLI or Hub PR operation occurred.

## Terraform-family source-truth correction — 2026-08-21

AB-SCHEMA-040 now accepts Terraform and Terragrunt only when their labels match
the exact source path. Terraform observations cite `.tf`/`.tf.json`;
Terragrunt module orchestration cites `terragrunt.hcl`; provider resources
reached through Terragrunt cite their referenced Terraform module. The focused
design test rejects the V15 failure mode in which CloudFormation YAML was
submitted as Terraform and also rejects a provider resource attributed directly
to Terragrunt.

`npm run verify` passes specification checks, TypeScript, dependency rules,
Knip, Gitleaks, 50/50 design-level tests and `git diff --check`. No parser,
dependency, SAM/CloudFormation support or model benchmark was added or run.

## V15 Terraform source-truth qualification — 2026-08-21

Owner-authorized run `2026-08-21T135125Z` retained exact Terraform `.tf`
observations and no longer mislabeled CloudFormation. It drafted Repository,
System, Function, Interface and Flow knowledge plus embedded DynamoDB and
schedule details. The run failed before Finalize after 217,552 ms because the
Flow schema response did not publish the validator's exact
`order/source/action/target/mode/evidence` shape. The agent tried incompatible
`from/to` and `sequence` keys across three failed changed-set validations,
exhausting the one-repair lifecycle. No proposal was finalized, inspected or
scored; no Accept, Publish, provider CLI or Hub PR operation occurred.

Classification: source provenance correction passed; OKF semantic scoring was
unavailable; MCP authoring contract failed; benchmark scorer did not cause the
failure. A further model run requires the Flow contract/diagnostic correction
and separate owner authorization.

## Flow-step authoring contract correction — 2026-08-21

AB-SCHEMA-041 adds the exact
`order/source/action/target/mode/evidence` field list to released Flow guidance
and replaces the generic malformed-step message with the required scalar
fields. The retained `from/to` failure mode is covered inside the existing
Initial Ingest design test; the catalog contract checks the public field list.

`npm run verify` passes all specification, TypeScript, dependency, Knip,
Gitleaks, 50/50 test and diff gates. No test count, parser, dependency or
runtime workflow was added.

## V15 Flow-shape requalification — 2026-08-21

Owner-authorized run `2026-08-21T142407Z` completed in 267,429 ms. The exact
Flow field-shape correction worked: changed-set validation parsed four ordered
steps. The authored proposal was nevertheless invalid because those steps used
unpromoted embedded labels (schedule, AWS Health API, DynamoDB state and
notification endpoints) instead of existing concept identities, while several
canonical relations lacked resolving Markdown links. The agent identified the
diagnostics but retained the schedule endpoint during its one repair. Finalize
correctly failed, Inspect did not run and no bundle was scored.

Classification: AB-SCHEMA-041 passed; OKF authoring/repair failed; MCP guidance
could make the concept-only endpoint rule more explicit; benchmark lifecycle
and scorer were not the cause. No Accept, Publish, provider CLI or Hub PR
operation occurred, and no replacement run was started.

## Flow endpoint guidance correction — 2026-08-21

AB-SCHEMA-041 now publishes one concept-only endpoint rule alongside the exact
Flow field shape. `source` and `target` must resolve to the changed concept set
or supplied target summaries; embedded knowledge and free text are excluded,
and implementation details are not promoted merely to make a Flow valid. The
existing catalog design test covers the additive response contract without
increasing the test count.

`npm run verify` passes specification, TypeScript, dependency, Knip, Gitleaks,
50/50 test and diff gates. No model benchmark was run.

## V15 concept-endpoint qualification — 2026-08-21

Owner-authorized run `2026-08-21T143803Z` completed Preflight through Inspect in
225,128 ms with no tool failure. Its seven-concept bundle is valid and
reviewable: 100% reference concept coverage, schema agreement, metadata,
reference relationships, conflict visibility, live references and embedded
knowledge; provenance is 83%.

The concept-only endpoint guidance succeeded mechanically. Owner acceptance is
still `needs_revision`. The confirmed Domain is shallow and does not navigate
to the System, and the Flow omits the Terraform source supporting its schedule
trigger. Manual review additionally flags two unjudged concepts as likely
over-promotion: the notification Interface states that no single shared payload
contract exists, while the DynamoDB Resource is supported by declaration and
internal usage without independent ownership/lifecycle/failure evidence. They
appear to have been promoted to provide Flow endpoints despite the explicit
granularity rule. These are OKF authoring findings, not benchmark defects.

No Accept, Publish, provider CLI or Hub PR operation occurred. No replacement
run was started.

## V15 semantic correction — 2026-08-21

Expert review of `2026-08-21T143803Z` confirmed that the main OKF defect was
over-promotion, while benchmark 0/0 percentages and the required Flow overstated
quality. AB-SCHEMA-042 now requires standalone Interface/Resource intent to
carry a compatible promotion basis backed by candidate-owned semantic evidence
that selects that schema. Exact Lambda-to-Function mapping is unchanged; IaC
declaration or `suggested_type` alone returns no standalone schema.

AB-INGEST-012 makes a new confirmed Domain skeleton list every System prepared
in the same proposal, without rewriting an existing Domain. Released Flow
guidance requires source evidence for trigger, outcome and each described
interaction while retaining concept-only endpoints.

AB-BENCH-047 records numerator/denominator for every ratio, returns unavailable
for 0/0, lists unjudged identities and rejects a lifecycle when the last
successful changed-set validation omits a finalized concept. The current
single-Lambda Terraform expectation no longer requires Flow; alert processing
is measured as embedded knowledge under System/Function. Focused tests pass
19/19 and `npm run verify` passes specification, TypeScript, dependency, Knip,
Gitleaks, 50/50 design-level test and diff gates.
No model benchmark, Accept, Publish, provider CLI or Hub PR operation ran.

## V15 promotion-field qualification — 2026-08-21

Owner-authorized run `2026-08-21T150816Z` stopped after 76,380 ms at its single
guidance call. The agent correctly kept DynamoDB state and notification
destinations embedded, but supplied candidate-owned operational promotion
evidence for its Function intent. MCP rejected the whole request because the
new field was accepted only for Interface/Resource. No proposal or OKF bundle
was created, so this run measures a guidance-contract usability defect rather
than OKF quality.

AB-SCHEMA-042 is clarified minimally: other suggested concept roles may retain
candidate-owned promotion evidence as transparent intent, while only
Interface/Resource use it as a mandatory promotion gate and it never overrides
schema selection. No benchmark replacement is included in this correction.

Owner-authorized replacement `2026-08-21T151424Z` again stopped at its one
guidance call after 78,512 ms. The earlier role restriction was gone, but the
validator still required every Function promotion source to be semantic. The
agent cited candidate-owned structured Lambda/schedule evidence, exposing a
second over-strict layer. It also mislabeled CloudFormation YAML observations
as Terraform; that separate source-truth error remains correctly unsupported.

AB-SCHEMA-042 now permits other roles to cite candidate-owned semantic or
structured promotion evidence as non-authoritative intent. Interface/Resource
still require at least one semantic promotion source and a semantic role match.

Owner-authorized run `2026-08-21T151815Z` progressed through guidance in
103,448 ms. It used the exact Terraform file for DynamoDB, kept endpoint
configuration embedded and received `unsupported` for standalone Resource, so
the promotion gate behaved as designed. Prepare then rejected the required
unchanged request because its duplicated parser had not added the new
`promotion` field. This is MCP adapter drift, not model/OKF quality.

Prepare now parses the same bounded promotion record as guidance. AB-BENCH-048
also records the owner decision: run one sequential probe; stop on a hard or
obvious blocker; run an identical replica only after a valid unblocked result;
reserve the third run for final acceptance.

Post-fix verification passed `npm run verify`: specification checks, typecheck,
dependency/unused-code/secret gates and all 50 design-level tests passed.

## V15 sequential stability probe — 2026-08-21

Owner-authorized probe `2026-08-21T152548Z` completed the entire lifecycle in
216,851 ms. Its four-concept bundle passes validation and is reviewable. All
applicable reference ratios report 100%: concept and relationship coverage,
schema agreement, provenance and embedded knowledge. The Function cites exact
Terraform Lambda and schedule spans; DynamoDB state and delivery configuration
remain embedded; no standalone Interface, Resource or artificial Flow was
authored. This is a material improvement over `2026-08-21T151815Z`, which never
passed Prepare.

Manual inspection found a new authoring defect hidden by those scores. Prepare
had already emitted one entry in each category index, but the agent appended
the same entry again after checking only file sizes. Components, Domains,
Repositories and Systems therefore each contain a duplicate row. The Domain
body also remains too shallow for owner acceptance. Duplicate navigation is an
OKF quality defect; validation/scoring accepting it is a separate benchmark
blind spot. Under AB-BENCH-048 this clear blocker stops qualification, so no
sequential replica ran.

AB-INGEST-013 fixes the observed blocker at the shared bundle loader. A repeated
normalized Markdown target in any index now raises `INDEX_DUPLICATE`; the
Initial Ingest and V15 instructions state that Prepare already populated the
navigation. The existing lifecycle test reproduces the exact append and proves
bundle loading rejects it, then restores the valid bundle and completes
Finalize. Domain guidance remains sparse/evidence-bound rather than adding a
minimum word count that would reward fabricated scope.

Offline verification passes specification checks, TypeScript, dependency
rules, Knip, Gitleaks, `git diff --check` and all 50 design-level tests. No
model benchmark, Accept, Publish, provider CLI or Hub PR operation ran.

## V15 post-navigation probe — 2026-08-21

Owner-authorized probe `2026-08-21T154146Z` completed the full lifecycle in
192,735 ms. AB-INGEST-013 behaved correctly: every root/category index contains
one target row and no duplicate survived. The four reference concepts, three
reference relationships and recognized schemas remain at 100%.

Compared with `2026-08-21T152548Z`, the probe introduced a new optional Flow and
changed source strategy from exact Terraform evidence to semantic
CloudFormation/handler spans. The resulting bundle remains truthful and
reviewable, but it no longer qualifies the Terraform-only target: provenance
fell from 100% to 75% and embedded knowledge from 100% to 25%. Its prepared
Domain body also remains unchanged and below the owner-review usefulness
heuristic. These are OKF granularity/source-selection findings; lifecycle and
scoring operated correctly. AB-BENCH-048 therefore stopped before a replica.

AB-SCHEMA-043/044 correct the two variance paths in product, released-schema
and V15 qualification guidance. Supported Terraform/Terragrunt observations
must be retained when available, and a standalone Flow now requires two
independently useful endpoint boundaries rather than a System plus one contained
runtime. The existing catalog/guidance suite passes 13/13 without a new test
case. Model behavior remains unqualified until a later sequential probe.

`npm run verify` passes specification checks, TypeScript, dependency rules,
Knip, Gitleaks, `git diff --check` and all 50 design-level tests.

## V15 source/Flow correction probe — 2026-08-21

Owner-authorized probe `2026-08-21T155217Z` completed the full lifecycle in
175,109 ms. Compared with `2026-08-21T154146Z`, it restores exact Terraform
resource observations, raises embedded coverage from 25% to 100%, removes the
optional Flow and retains unique navigation. AB-SCHEMA-043/044 therefore behave
as intended.

A new semantic-selection gap blocks a replica. The agent still proposed an AWS
Health Aware System, but its observation signal said “the repository describes”
the notification capability. Selection matched only the Repository role,
conflicted with `suggested_type: System` and returned `ambiguous`; Prepare
correctly omitted that candidate. The bundle consequently has 75% reference
concept/provenance coverage, 33% relationship coverage and no Domain → System
navigation. This is semantic-guidance/selection usability, not an OKF lifecycle
or scorer defect. AB-BENCH-048 stopped the sequence before a replica.

## Partial-acceptance and anti-overfit correction — 2026-08-21

Cross-role review found that repeated corrections were optimizing one fixture
instead of the Initial Ingest product boundary. AB-BENCH-049 now distinguishes
`invalid`, `valid_partial` and `review_ready`; truthful sparse output passes as
`valid_partial`, while missing reference coverage stays diagnostic. Sparse
owner-confirmed Domains may navigate directly to a Repository when no separate
System is justified.

AB-BENCH-050 prevents one model run's wording variance from becoming a hard
cross-repository rule. Semantic keyword matching is advisory, exact supported
Terraform is high-priority rather than mandatory completeness, and Flow
endpoint count is an authoring heuristic rather than schema validity. Structural
source, shape, safety, identity and declared-relation checks remain hard gates.
This correction is verified offline; no new model qualification was run.

## V15 partial-acceptance probe — 2026-08-21

Owner-authorized probe `2026-08-21T161342Z` stopped after 83,382 ms at
`get_okf_authoring_schemas`; no proposal was prepared, finalized or scored. The
agent proposed System, Function and Resource candidates and supplied an exact
candidate-owned semantic observation for the Resource. MCP nevertheless
rejected the request because the Resource's `promotion.evidence_ids` repeated
only its structured Terraform observations rather than also repeating that
semantic observation.

This is an MCP request-shape restriction, not an OKF quality finding or scorer
failure. Candidate ownership, compatible operational promotion basis and exact
semantic evidence were present; the remaining requirement concerns which
nested evidence-ID list repeats the already supplied observation. AB-BENCH-048
therefore stopped the sequence before a replica.

AB-SCHEMA-042 now checks semantic support across the candidate's evidence list;
the promotion evidence list may independently cite candidate-owned structured
evidence proving its basis. The exact retained request shape passes, genuine
missing-semantic input remains rejected and `npm run verify` passes 50/50 tests.

## V15 Resource-promotion replacement probe — 2026-08-21

Owner-authorized probe `2026-08-21T162053Z` confirms the AB-SCHEMA-042 fix in
real execution: schema guidance and Prepare accepted System, Function, Resource
and Interface candidates. The agent authored six source-backed concepts and
used its one repair to add resolving Markdown links for declared relations.

The proposal remained invalid after 238,773 ms because released System guidance
does not judge `System implemented-in Repository`, although Repository is an
allowed System link and `implemented-in` is canonical for other source-backed
concepts. Finalize correctly rejected the relation and no artifact was scored.
This is a schema-relation consistency question, distinct from the fixed Resource
promotion gate and from benchmark/scorer behavior. AB-BENCH-048 stopped before
a replica.

AB-SCHEMA-045 now adds the canonical source-ownership direction to released
System guidance. Repository is the only allowed target and ordinary exact
evidence plus resolving-link validation remains unchanged. The focused catalog
check and full 50-test gate pass offline.

## V15 System-relation replacement probe — 2026-08-21

Owner-authorized probe `2026-08-21T163001Z` stopped after 85,541 ms at schema
guidance and did not exercise AB-SCHEMA-045. The agent explicitly marked the
DynamoDB table and schedule as embedded but redundantly attached standalone
Resource suggestions and promotion records. MCP rejected the whole request
before Prepare.

AB-SCHEMA-036 says disposition is authoritative, so the fatal response was a
deterministic contract inconsistency rather than OKF quality or scorer behavior.
Guidance now keeps the items embedded, reports the ignored standalone hints and
creates no standalone identity. Parent, evidence ownership, valid field shape
and exact source checks remain hard. The focused reproduction passes.

## V15 embedded-precedence replacement probe — 2026-08-21

Owner-authorized probe `2026-08-21T163552Z` completed the full lifecycle in
186,275 ms. It authored the intended sparse Domain, Repository, System and
Function, kept DynamoDB/schedule/delivery knowledge embedded, avoided artificial
Flow/Resource/Interface concepts and scored 100% on every applicable reference,
provenance, relationship and embedded-knowledge ratio. Owner review found no
usability issue.

The bundle is nevertheless `invalid`: the Function cites
`handler.py#L1042-L1114`, while the pinned file has only 1065 lines. The
benchmark source-span check correctly rejected it, but MCP changed-set and
final proposal validation allowed the impossible source range through. This is
a hard OKF provenance defect and an MCP trust-boundary blind spot, not a scorer
or completeness issue. AB-BENCH-048 stopped before a replica.

## Current-repository source-span correction — 2026-08-21

AB-INGEST-014 now keeps the authorized source checkout only in private
authoring-session state and verifies newly authored citations for that
repository during Finalize. Each cited path must resolve beneath the checkout
to a regular file and its end line must be within the current file. Citations
to other repositories are not dereferenced without separate authorization, and
the local path does not enter Hub knowledge or proposal metadata.

The existing Initial Ingest lifecycle test reproduces an impossible
`main.tf#L1-L99` citation against a six-line file, observes Finalize reject it,
repairs the draft and Finalizes the same session successfully. `npm run verify`
passes specification checks, TypeScript, dependency boundaries, Knip, Gitleaks,
50/50 design-level tests and `git diff --check`.
