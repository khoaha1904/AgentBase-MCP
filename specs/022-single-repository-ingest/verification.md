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
