# Current capability

Active capability: [`043-converge-product-contracts`](043-converge-product-contracts/spec.md).
Most recent completed: [`042-correct-tool-guidance`](042-correct-tool-guidance/spec.md).

Capability 043 reviews the twelve current product areas sequentially with the
owner, aligns high-level and low-level authority, and defers runtime changes
until one post-review implementation-gap audit. Part 01 now defines lazy
per-Git-repository graphs and treats a multi-repository workspace directory as
routing scope rather than one combined graph.

Capability 042 keeps the released 42-tool surface unchanged while correcting
public Code Graph guidance and safety hints, and assigns the existing Question
review actions to the public Hub workflow.

Capability 041 standardizes the released product-skill catalog into six public
user-goal workflows and two internal supporting workflows. It adds one
read-only `agentbase-query` owner for ordinary Hub/Code Graph questions, keeps
canonical `agentbase-*` names across clients and adds no MCP tool or `abs-*`
alias.

Capability 040 reduces the released MCP surface from 49 to 42 tools: 29 Hub,
four schema/authoring and nine Code Graph actions. It removes raw provider and
legacy fine-grained adapters, curates `index_repository` to AgentBase's actual
one-repository boundary and keeps every current MVP workflow unchanged.

Capability 039 installs the seven released AgentBase product skills into the
user scope of each interactively selected client. A fixed allowlist excludes
repository-development Spec Kit skills; exact copies are no-op, conflicts fail
before mutation and a later MCP-registration failure removes only skills
created by that installer run.

Capability 038 simplifies ordinary Hub query to the exact synchronized
Published commit. Search plus exact Markdown read replace separate traversal,
observed-value and freshness query actions; Questions remain ordinary knowledge
with their existing governance workflow, and Hub CI retains its internal
freshness projection.

Capability 037 makes Hub operation explicitly local-first and remote-optional.
Each GitHub.com or GitHub Enterprise repository/branch identity owns isolated
local and credential state, one profile is active, compact status degrades
safely, and synchronization distinguishes last admitted Published state from a
new remote candidate. It also qualifies every currently released MVP journey
sequentially before release.

Capability 036 enriches the standard Hub README for human onboarding without
turning it into a second knowledge index. New Hubs explain AgentBase-MCP, the
OKF boundary, current layout, review lifecycle and CI; the already-initialized
production Hub receives the same bytes through one reviewed README-only PR.
Production [Hub PR #15](https://github.com/khoaha1904/AgentBase-Hub/pull/15)
changes only README and passes Hub CI.

Capability 035 generalizes the CI-only upgrade into exact remote-main Hub
Initialization: add the standard README only when missing, install/repair CI
only when non-current, preserve existing support files and never replay Local
Draft knowledge. The current production target already has CI and lacks README,
so its real [Hub PR #14](https://github.com/khoaha1904/AgentBase-Hub/pull/14)
is README-only and passes the existing Hub CI.

Capability 034 replaces the invalid public-release assumption with a
self-contained Hub CI bundle. The workflow, standalone validator and checksum
manifest enter a new Hub base together or an existing Hub through one reviewed
CI-only PR; Hub execution requires no registry, sibling checkout or install.

Capability 033 composes blocking Hub integrity/obvious-sensitive validation and
warning-only Repository freshness into one offline command. New Hubs receive a
pinned read-only GitHub Actions workflow; existing Hubs receive it only through
an explicit MCP-created CI PR. Its public-release checkout assumption failed in
real GitHub and is superseded by capability 034.

Capability 032 adds the first warning-only OKF freshness report before any Hub
CI workflow: one bounded offline Repository projection through CLI and MCP,
with exact age/revision and explicit Published or Local Draft attribution. It
defines no stale threshold, source probe, Refresh action, persisted report or
CI. The canonical offline gate passes 50/50 tests.

Capability 030 implements the first Batch Initial Ingest slice: 2..32 explicit local
repositories, one confirmed Domain, sequential isolated single-repository
authoring and one atomic proposal/Accept/PR unit. It adds exact retry and
membership-revision recovery, but excludes Batch Refresh, parallel execution,
workspace scanning, Domain Enrichment during Ingest, model qualification and
real publication. The complete deterministic offline gate passes 50/50 without
production dependency or test-count growth.

Capability 031 is complete. V5 run `2026-08-22T143631Z` exposed one
AB-BATCH-006 Domain-navigation composition defect after completing both members.
The coordinator now derives member navigation from parsed concepts and exact
repository provenance rather than authored Markdown suffixes. The post-fix run
`2026-08-22T150414Z` completes the same seven-role shape with both Repository and
System rows, no repair, runtime failure or benchmark finding, and no forbidden
operation. No third probe ran.

Capability 029 designs the first post-MVP Domain Enrichment slice: one bounded,
sequential AWS verification run over explicitly selected Published repositories,
candidates and Questions in one confirmed Domain. It creates one atomic review
proposal without reading credentials, scanning provider scope, merging concepts,
Accepting, Publishing or mutating cloud resources. Application implementation
now covers exact AWS CLI v2 STS/SQS profiles, immutable manifests/checkpoints,
three-tier Question resolution, explicit retry/revision, safe provider snapshots,
external identities and independent main-based Enrichment PR publication. The
deterministic offline gate passes 50/50 without dependency or test-count growth; real AWS and model qualification
remain separately authorized checkpoints.

Capability 028 replaces the unpublished private Question ledger/sidecar with
bounded shared Question Markdown in the ordinary Hub proposal tree. Exact-
revision answers propose Guidance plus Question transition atomically; accepted
state remains unchanged until ordinary Accept. Another state root rebuilds the
same Question view from Hub, stale answers and orphan Guidance fail before
mutation, and generic Ingest/Refresh cannot edit Question bytes outside exact
dedicated-renderer paths. The complete 50-test offline gate passes.

Capability 027 clean-cuts the unpublished live-reference contract into small,
readable repository observed-value snapshots. Finalize owns deterministic IDs,
exact source state and the Markdown view; Refresh reconciles per Repository and
Questions use natural observation references. Snapshot query labels exact Hub
layer/age without probing source access and redacts an unsafe historical scalar
without hiding safe siblings. Provider observations, automated freshness and
shared Question documents remain deferred. The complete 50-test offline gate
passes.

Capability 026 separates local draft storage order from publication dependency.
Independent Repository Init proposals may be reviewed in parallel against the
current Published `main`; Refresh remains chained only to the preceding proposal
for the same Repository. Publication replays exact proposal patches instead of
  leaking unrelated earlier local drafts into a PR. When Published `main`
  advances, compatible open proposal branches are merged forward sequentially
  and keep the same PR; conflict stops before push. Append-only shared indexes
  publish only selected navigation and exclude earlier unrelated Local Draft
  entries. The complete 50-test offline gate passes.

Capability 025 makes MCP-created Hub PRs maintainer-readable and adds an exact
Init/Refresh stack for a same-Repository selected prefix while preserving one
batch PR for other dependency-safe selections. It passes the complete offline
gate with deterministic partial-retry recovery and explicit GitHub base/head
identity. MCP still never merges, force-pushes, deletes or independently
rebases unrelated Init proposals.

Production publication proof now exists through MCP's dedicated Hub credential:
ECS Init [Hub PR #8](https://github.com/khoaha1904/AgentBase-Hub/pull/8)
targets `main`, and Refresh
[Hub PR #9](https://github.com/khoaha1904/AgentBase-Hub/pull/9) targets the exact
Init branch. Neither PR is merged. A valid legacy Hub root without README is
now attachable while new MCP-created Hubs still include README; the production
reproduction and full 50-test gate pass.

The separately versioned Sol Initial-Ingest operations probe
`2026-08-22T044534Z` and replica `2026-08-22T045041Z` are both `review_ready`
with 100% applicable reference coverage and clean owner review. Their 5/4
concept difference is optional EventBridge Interface promotion versus embedded
knowledge, matching accepted granularity variance rather than hallucination.
No third run or unrelated-Init batch PR was created.

Capability 024 qualifies a structurally different AWS/Terraform full-stack ECS
repository. Initial Ingest uses `gpt-5.6-sol` to establish the reviewed baseline;
Refresh uses `gpt-5.6-terra` to reconcile one exact application/ALB health-check
contract change. Runs remain sequential and stop on the first clear blocker.

Capability 023 is implemented and passes the complete offline and model-backed
gates. It adds one normal Refresh for one canonical Repository, reconciling
accepted knowledge through changed source, known gaps and one bounded discovery
pass. Missing
evidence never deletes knowledge; destructive changes are explicit, evidenced
and review-only. Refresh V2 probe `2026-08-21T191712Z` and replica
`2026-08-21T191905Z` are both `review_ready`; their changed Function bytes are
identical and the exact five-minute mutation gate passes.

Capability 022 is the first implementation slice of the approved AgentBase
knowledge design. It connects one authorized local repository to a bounded,
evidence-backed, provider-neutral OKF proposal preview. It includes stable Hub
repository identity, Domain confirmation, catalog 7.0 guidance and safe partial
outcomes, but stops before Accept, Publish, Refresh, Batch and Domain Enrichment.

The catalog-7 Detect → Promote → Render implementation passes the complete
deterministic gate: specification checks, TypeScript, dependency rules, Knip,
Gitleaks, 50 design-level tests and `git diff --check`. Initial Ingest targets eight roles;
cloud resources embed in their useful parent by default, Function remains the
exact independent-runtime specialization, and VM workloads become Components
rather than one Server file.

The owner-authorized first V15 run (`2026-08-21T122847Z`, Health Aware) failed
after 95,965 ms during proposal preparation. Guidance produced the intended
small-catalog candidates, but the deterministic skeleton renderer omitted the
Flow schema's required `flow_steps`; its own validator rejected the generated
draft before author editing. The trace also exposes a non-causal diagnostic
wording issue for failed required calls and a secondary embedded-knowledge gap
for semantic-only CloudFormation evidence. No replacement run, Accept, Publish,
provider CLI or Hub PR occurred. The current MVP qualification manifest is now Terraform-only; prior
SAM/Shopping Cart artifacts remain historical and are not selectable.

The blocking Flow preparation defect from that run is now verified offline.
Preparation emits an explicit empty Flow step edit point without inventing
endpoints; ordinary changed-set/final validation still requires real linked,
evidenced steps. Failed required benchmark calls are now distinguished from
calls that never occurred. Superseded prompt prose/existence tests were removed
while representative runner generations remain covered; homogeneous case
matrices now use table-driven contracts. The early-development gate now passes
50 spec, design-contract and end-to-end tests.

The owner-authorized V15 requalification `2026-08-21T132954Z` completed the
entire lifecycle in 183,391 ms with no tool failure. Its four authored concepts
are valid and reviewable with 100% schema agreement and metadata completeness.
It remains `needs_revision`: the Flow probe is missing, the confirmed Domain
does not navigate to the System and its body is shallow. Embedded DynamoDB,
schedule and delivery knowledge is present in the Function prose, but the
Terraform-only scorer reports 0% because the agent cited CloudFormation and
handler paths from the mixed-source repository rather than the expected
Terraform file. V15 is therefore not yet accepted; no Accept, Publish, provider
CLI or Hub PR operation occurred.

The mixed-source finding is now corrected offline at the trust boundary.
Structured evidence supports Terraform (`.tf`/`.tf.json`) and Terragrunt
(`terragrunt.hcl`) with truthful source metadata. Terragrunt directly evidences
module orchestration; provider resources cite the referenced Terraform file.
SAM/CloudFormation/YAML is rejected instead of being relabeled as Terraform.
This correction adds no parser, provider CLI, schema type or model benchmark.

Owner-authorized V15 run `2026-08-21T135125Z` then confirmed the source-truth
correction but failed before Finalize after 217,552 ms. The agent used exact
Terraform resources and drafted Repository, System, Function, Interface and
Flow knowledge with embedded DynamoDB/schedule details. Flow schema guidance
did not expose the validator's exact `order/source/target` field shape, so the
agent guessed incompatible keys across three validation calls and exhausted the
one-repair lifecycle. No bundle was finalized or scored. This is an MCP
authoring-contract defect, separate from OKF quality and benchmark scoring.

AB-SCHEMA-041 now fixes that deterministic contract: released Flow guidance
publishes `order/source/action/target/mode/evidence`, and malformed steps name
the required scalar fields. The complete offline gate passes 50/50 tests with
no new parser, dependency or test case count. Model requalification is the next
separately authorized evidence.

Owner-authorized run `2026-08-21T142407Z` confirms AB-SCHEMA-041: all four Flow
steps parsed with the published shape. The proposal remains invalid. It used
unpromoted embedded labels as Flow endpoints and omitted visible links for
several canonical relations. The agent recognized the diagnostic but retained
the schedule endpoint in its single repair; Finalize correctly rejected it and
Inspect did not run. This is an OKF authoring/repair failure plus a remaining
guidance-usability gap, not a scorer defect.

That guidance gap is now corrected under AB-SCHEMA-041. The released Flow
schema states that `source` and `target` must resolve to concepts in the changed
set or supplied targets; embedded knowledge and free text are forbidden, and
implementation detail is not promoted merely to complete a Flow. Validator and
concept granularity remain unchanged.

Owner-authorized run `2026-08-21T143803Z` then passes the complete lifecycle in
225,128 ms. Its valid reviewable bundle reaches 100% reference concept, schema,
metadata, relationship and embedded-knowledge coverage with 83% provenance.
It is not accepted yet: Domain navigation/body remains weak, the Flow omits its
Terraform trigger source, and manual review identifies likely over-promotion of
a delivery Interface with no single shared contract and an internally used
DynamoDB Resource without independent-boundary evidence. Lifecycle and scorer
behaved correctly; these are OKF authoring/granularity findings.

The focused semantic correction after expert review is now implemented
offline. AB-SCHEMA-042 prevents `suggested_type` or resource declaration alone
from promoting Interface/Resource; a compatible promotion basis must cite
candidate-owned semantic observations that select the role. AB-INGEST-012 makes
new Domain skeletons navigate every prepared System, and Flow guidance now
requires sources for trigger, outcome and described interactions. AB-BENCH-047
reports ratios with numerator/denominator and `n/a` for 0/0, names unjudged
identities, requires the last changed-set validation to cover the finalized
bundle and removes required Flow from the single-runtime fixture. Offline
verification is the current gate; no replacement model benchmark has run.

Owner-authorized run `2026-08-21T150816Z` then stopped at schema guidance after
76,380 ms because the agent attached candidate-owned operational promotion
evidence to Function intent. DynamoDB and delivery destinations were correctly
kept embedded, but MCP rejected the complete request before Prepare. This is a
new contract-usability defect, not scored OKF quality. AB-SCHEMA-042 now permits
promotion evidence on other suggested roles as non-authoritative intent while
retaining the strict Interface/Resource gate. Replacement qualification remains
separately authorized.

Replacement run `2026-08-21T151424Z` proved the role restriction was removed
but exposed a second over-strict layer: Function promotion evidence was still
forced to be semantic even when its candidate-owned structured evidence was
appropriate. That restriction is removed for other roles; Interface/Resource
still require semantic evidence. The run also mislabeled CloudFormation YAML as
Terraform, which remains a real source-truth authoring error.

Run `2026-08-21T151815Z` then passed guidance with exact Terraform DynamoDB
evidence, embedded endpoint configuration and no promoted Resource, but Prepare
rejected the unchanged request because its parser lacked the new promotion
field. That MCP adapter drift is corrected. Qualification now follows
AB-BENCH-048: sequential probe, stop on hard/obvious failure, one replica only
after an unblocked valid run, and a third run only for final acceptance.

Sequential probe `2026-08-21T152548Z` then completed Prepare, Validate,
Finalize and Inspect in 216,851 ms. It produced the intended four concepts,
used truthful Terraform evidence, embedded DynamoDB/schedule/delivery details,
omitted an artificial Flow and scored 100% on every applicable reference
ratio. It is not replica-qualified: the agent appended entries already emitted
by Prepare, duplicating every category-index row, and the deterministic
validator/scorer failed to detect that defect. The Domain body also remains
shallow. AB-BENCH-048 stopped the sequence; no replica ran.

AB-INGEST-013 corrects that finding offline at the shared OKF boundary. Every
index now rejects a repeated normalized Markdown target, and authoring guidance
states that Prepare has already populated required navigation. The first Domain
is intentionally navigation-first: it may summarize only the scope contributed
by current evidence and build up over later ingests, without fabricated domain
claims. The existing Initial Ingest lifecycle test covers the exact duplicate
reproduction; no new test case or dependency is added.

Owner-authorized post-fix probe `2026-08-21T154146Z` completed the lifecycle in
192,735 ms and confirms that no category entry is duplicated. All four reference
concepts and all three reference relationships are present with 100% schema
agreement. It regresses semantically versus `2026-08-21T152548Z`: the model
again promoted an optional Flow, cited CloudFormation/handler paths instead of
the Terraform qualification source, reached only 75% provenance and 25%
embedded coverage, and left the prepared Domain body unchanged. These are OKF
source/granularity findings rather than lifecycle or scorer failures.
AB-BENCH-048 stopped the sequence before a replica.

AB-SCHEMA-043/044 now correct those two findings offline. Mixed-source
investigation must submit available supported Terraform/Terragrunt observations
for retained runtime/infrastructure knowledge; unsupported IaC may only add
semantic context. Released Flow guidance requires two independently useful
endpoint boundaries and explicitly excludes a System plus its single contained
Function. This is guidance clarification, not a repository scanner, Flow
inference engine, candidate-count heuristic or new schema.

Owner-authorized probe `2026-08-21T155217Z` completed the lifecycle in 175,109
ms and verifies AB-SCHEMA-043/044 behavior: it uses exact Terraform resource
observations, reaches 100% embedded coverage and authors no Flow. It exposes a
different semantic-selection usability gap. The model proposed a System but
phrased its observation as “the repository describes” the capability; schema
selection matched only Repository, marked the suggested System ambiguous and
Prepare omitted it. Reference concept/provenance coverage is 75% and reference
relationship coverage is 33%; missing Domain → System navigation is downstream
of that omitted System. AB-BENCH-048 stopped before a replica.

That interpretation is superseded by the anti-overfit correction. Initial
Ingest now reports `invalid`, `valid_partial` or `review_ready`; truthful sparse
output is accepted even when reference coverage is incomplete. Semantic
keywords, exact-source completeness and Flow endpoint counts are diagnostics or
authoring heuristics, not validity gates. Hard gates remain source truth, shape,
safety, identity and declared-relation integrity. No replacement model run has
been executed for this correction.

Owner-authorized probe `2026-08-21T161342Z` then stopped after 83,382 ms at
schema guidance, before any OKF draft existed. The Resource candidate carried a
compatible operational basis plus exact candidate-owned semantic evidence, but
MCP additionally required that semantic observation ID to be repeated inside
`promotion.evidence_ids`; the agent listed its structured Terraform evidence
there instead. This is a redundant MCP request-shape restriction, not an OKF or
scorer result. AB-BENCH-048 stopped before a replica.

That restriction is fixed offline under AB-SCHEMA-042. Candidate-level semantic
evidence now establishes semantic support while promotion evidence independently
proves its compatible basis. The exact reproduction and the full 50-test gate
pass; a new model probe remains separate.

Replacement probe `2026-08-21T162053Z` confirms that fix in real execution:
guidance and Prepare passed and six concepts were authored. It stopped after
238,773 ms because System schema guidance does not judge the otherwise
source-backed canonical `implemented-in -> Repository` relation. Finalize
correctly rejected it, no OKF artifact was scored and no replica ran. This is a
separate schema-relation consistency issue, not a recurrence of the promotion
bug or a benchmark failure.

AB-SCHEMA-045 fixes that deterministic inconsistency offline by allowing only
the evidenced canonical `System implemented-in Repository` direction. The
focused reproduction and full 50-test gate pass; no other relationship rule was
relaxed.

Probe `2026-08-21T163001Z` did not reach that relation: it stopped after 85,541
ms because embedded candidates also carried redundant standalone hints. This
exposed a separate AB-SCHEMA-036 inconsistency—disposition was documented as
authoritative but request shape failed first. Embedded now wins safely, produces
no concept and reports ignored hints while parent/evidence/shape checks stay
strict. No bundle was scored and no replica ran.

Replacement probe `2026-08-21T163552Z` then completed the lifecycle and produced
the intended four-concept sparse bundle with 100% applicable concept, schema,
provenance, relationship and embedded-knowledge coverage plus clean owner
review. It remains invalid because one source cites `handler.py#L1042-L1114`
while the pinned file has only 1065 lines. The scorer caught this hard
provenance error, but MCP Validate/Finalize did not; that source-span trust
boundary is the next blocker. No replica ran.

AB-INGEST-014 closes that trust-boundary gap offline. The authorized source
checkout is retained only in private session state; Finalize now rejects a new
current-repository citation when its path is missing, escapes the checkout, is
not a regular file or exceeds the real file. Foreign-repository citations are
not dereferenced without separate authorization, and no scanner, parser,
completeness rule or provider-specific behavior was added. The exact
reject-repair-retry lifecycle and full 50-test gate pass. A sequential model
probe is the next qualification step; no replica has run.

Post-fix probe `2026-08-21T164926Z` is `review_ready`: source validation passes,
all four reference concepts and three reference relationships are present, and
all applicable schema, provenance and embedded ratios are 100%. It also authors
a reviewable DynamoDB Resource and Function-to-Resource Flow; duplicated body
headings are minor presentation debt.

Sequential replica `2026-08-21T165314Z` did not reproduce the complete
lifecycle. Schema guidance rejected a cross-boundary Flow because it reused a
Function-owned supporting observation even though its promotion evidence was
Flow-owned. This is a remaining MCP attribution-contract usability issue, not a
source-span regression or scorer defect. No code change or third run has been
made pending owner approval of the narrow Flow exception.

AB-SCHEMA-046 implements that owner-approved exception offline. Only a
standalone cross-boundary Flow may reuse supporting evidence from another
standalone concept candidate; Flow promotion evidence remains Flow-owned and
all other ownership/source/relation gates remain strict. The exact replica
shape and two negative guards pass within the existing 50-test gate. A fresh
sequential probe is next; no post-fix model result exists yet.

Post-fix probe `2026-08-21T170242Z` confirms the Flow exception was not the
blocker. It stopped at schema guidance because a Function reused its direct
embedded schedule child's Terraform observation as lifecycle evidence. Uniform
ownership rejected this even though embedded knowledge has no standalone
identity and belongs in that Function. This is a separate MCP attribution
question; no draft was scored and no replica ran.

AB-SCHEMA-047 closes that direct parent/embedded-child gap offline. A standalone
parent may reuse supporting or promotion evidence owned by a direct embedded
child that explicitly names it. Unrelated reuse remains invalid and Flow
promotion stays Flow-owned. The exact reproduction and full 50-test gate pass;
a fresh sequential probe is next.

Post-fix probe `2026-08-21T171202Z` confirms direct embedded-child reuse is no
longer the blocker. Schema guidance instead rejected a System that cited its
Function candidate's exact Terraform Lambda observation as evidence of the
cooperating runtime. This demonstrates that exclusive observation ownership is
the unstable rule: one attributable source fact may support several standalone
concepts. No draft was scored and no replica ran; a general simplification is
pending owner approval rather than another System-specific exception.

AB-SCHEMA-048 implements the approved simplification and supersedes narrow
046/047 ownership exceptions. `candidate_id` now preserves primary attribution
without making evidence exclusive; standalone concepts may share known
supporting or promotion observations. Embedded candidates remain self-owned,
Interface/Resource promotion retains candidate-owned semantic evidence, and all
source/schema/relation gates remain unchanged. The simplified code and full
50-test gate pass; a fresh sequential probe is next.

Post-fix probe `2026-08-21T172146Z` confirms standalone sharing now passes for
System, Function and Flow. It stopped on the remaining embedded self-only rule:
configured delivery had its own README anchor and added the Flow's EventBridge
source, but MCP rejected that second source. No draft was scored and no replica
ran. The proposed final attribution adjustment requires one own embedded anchor
while permitting additional shared observations.

AB-INGEST-003 now permits one explicit pre-state correction only after
retryable `INVALID_ARGUMENT` guidance, independently of the existing one
post-state validation repair. Sparse ambiguity continues without retry;
Prepare, Finalize and uncertain state failures still stop safely. V15 lifecycle
accounting retains first-attempt diagnostics and correction usage. The complete
offline gate passes 50/50 tests; no replacement model probe has run.

Recovery probe `2026-08-21T174630Z` and sequential replica
`2026-08-21T175143Z` both complete the lifecycle as `review_ready` with 100% on
every applicable reference ratio. The probe demonstrates one failed retryable
guidance request followed by one successful correction; the replica passes
guidance first time. Both remain truthful, but optional granularity varies: six
concepts with standalone Resource/Flow versus four concepts with those details
embedded. This is a stability diagnostic, not a hard failure, and no third run
was started. Because recovery prose changed under the existing V15 prompt name,
these runs are mutually comparable but not prompt-identical to older V15 runs;
future prompt behavior changes require a new AB-BENCH-024 identity.
