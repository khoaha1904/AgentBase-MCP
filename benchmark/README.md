# Agent-driven OKF benchmarks

This directory measures whether a real host coding agent can investigate pinned
repositories and author useful Google OKF v0.2. Single runs exercise AgentBase
MCP graph/schema tools. Paired runs compare that complete assisted workflow with
an unassisted agent reading the authorized source directly.

```text
benchmark/
  prompts/<version>.md
  repos/<suite>/
    manifest.json
    expected/<repository>.json
  results/<suite>/<repository>/<UTC-run-id>/
    run.json
    prompt.md
    agent-events.jsonl
    agent-final.md
    okf/
    metrics.json
    report.md

  results/<suite>/<repository>/<UTC-pair-id>/
    pair.json
    mcp/<single-arm artifacts>
    direct/<single-arm artifacts>
    comparison.json
    report.md
```

The detailed Codebase Memory graph stays private and disposable. Each agent run
indexes once through the AgentBase MCP and may inspect repository source, docs
and Git history when graph evidence is incomplete. Source fixtures are pinned,
clean and read-only to the agent sandbox.

Run one explicit model-backed benchmark:

```bash
npm run benchmark:okf -- run aws-serverless aws-health-aware
```

The command prints the UTC run ID. Finalization is deterministic and model-free:

```bash
npm run benchmark:okf -- finalize aws-serverless <UTC-run-id> aws-health-aware
```

Run one explicit two-arm context comparison:

```bash
npm run benchmark:okf -- pair aws-serverless aws-health-aware
npm run benchmark:okf -- compare aws-serverless <UTC-pair-id> aws-health-aware
```

`pair` runs MCP first and direct-source second with the same pinned fixture,
model, reasoning effort, expectation and semantic goal. The direct arm has no
AgentBase MCP configuration. `compare` reports existing semantic metrics,
tokens and elapsed time side by side. Deltas are MCP minus direct; no overall
winner is generated.

Both current prompts share the same quality contract without receiving the
hidden expectation. They author one canonical entity graph, promote only useful
boundaries, keep implementation detail and ordinary internal resources inside
useful parents and surface uncertainty as limitations. V8 introduced canonical
evidenced edge directions, ordered evidenced flow steps and progressive
Domain/System/Repository navigation. The MCP arm additionally uses graph tools,
one batch-selected schema-guidance call and changed-set validation; the direct
arm investigates source without them. V9 makes durable path-derived identity,
parent service/component boundaries, schema selection after investigation,
exact category indexes and numeric-policy conflict review explicit. Prompt
behavior is immutable: v1-v8 files and recorded results remain historical. V6 made the
exact root-index list grammar explicit after the first V5 real run exposed an
otherwise-useful bundle using unsupported hyphen bullets. V7 additionally
clarifies that implementation concepts do not replace an evidenced Business
Flow and that every schema-recommended Limitations section must be present. V8
applies catalog 5.0 graph semantics and bounded re-ingest validation.
V12 replaces volatile numeric snapshots with validated `agentbase.live_claims`
source references and retains conflicting evidence roles without selecting a
winner. V13 measures the actual catalog-6.0 Initial Ingest lifecycle in an
isolated local-only Hub: status/setup, Preflight, one graph pass, guidance,
prepare, validation, finalize and Inspect. It stops before Accept or Publish.
The first retained 2026-08-21 V13 qualification is failed evidence: all three
runs stopped before Inspect. A later owner-authorized three-run requalification
proved skeleton-backed bundles and one successful Finalize per run, but still
failed 0/3 because the published Inspect input name disagreed with its runtime
adapter; Shopping Cart also exceeded the one-repair validation ceiling.
After that contract was corrected, the next exact three-run qualification
confirmed one successful Inspect per run and improved lifecycle stability to
1/3. Its lifecycle-passing output exposed a scorer mismatch between the source
checkout identity and the durable Hub-assigned Repository identity. New V13
runs now record the durable identity for scoring; historical artifacts retain
their original checkout-ID fallback and are not rewritten.

The next owner-authorized exact three-run qualification (`090301Z`, `090620Z`,
`091059Z`) passed the complete lifecycle 3/3 with a 189,024 ms median and no
Accept or Publish operation. Semantic qualification still failed: all three
drafts omitted a System boundary and progressive Domain → System navigation,
and owner review required revision. Durable Repository-ID scoring worked as
intended. A separate matcher defect remains: full-body identity matching can
assign a missing System reference to a lower-level concept that merely links to
the repository, incorrectly escalating missing coverage into a schema
contradiction. Retained metrics therefore preserve the raw result, while the
qualification interpretation treats missing System/navigation as the reliable
OKF finding and the hard contradiction as benchmark-only noise.

The matcher correction now requires wrong-schema reference identity in the
concept's canonical identity or title, not contextual description/body text.
Read-only scoring leaves retained artifacts untouched: both Health bundles are
`reviewable` with System correctly missing, while Shopping remains `invalid`
because `components/shopping-cart-system` explicitly declares `type: Service`.
All three still require owner revision for missing or shallow System/Domain
navigation.

The subsequent exact runs `094822Z`, `095147Z` and `095531Z` again passed the
V13 lifecycle 3/3 with a 198,023 ms median. Both Health outputs are now
conformant `reviewable` bundles with 100% recognized-schema agreement; Shopping
remains correctly invalid because a Service is used in place of System. All
three still fail owner review for missing Domain → System navigation. Trace
evidence shows no new scorer defect: the remaining gap is product policy for a
source-backed semantic capability candidate whose literal observation does not
contain the catalog's System selection phrase.

V14 is the next immutable qualification contract. It adds explicit
evidence-bound `suggested_type` for semantic-only candidates: exact structured
mapping still wins, semantic disagreement is ambiguous and suggested skeletons
remain review-limited drafts. The owner-authorized runs `112529Z`, `112911Z`
and `113328Z` completed the immutable Health → Shopping → Health sequence with
a 203,914 ms median, but passed the lifecycle only 1/3. One Health run reached
the suggested System path and then failed Finalize on a noncanonical `contains`
relationship. Shopping first supplied the unreleased shorthand `Component` and
then called Finalize twice. The lifecycle-passing Health output remained
reviewable but omitted System after its semantic observations conflicted with
the System suggestion. These are authoring/guidance-contract failures, not a
new scorer defect; V14 is not accepted.

V15 is the immutable catalog `7.0.0` qualification contract. It keeps the V14
Initial Ingest lifecycle but uses Detect → Promote → Render and the small fixed
Initial Ingest catalog. Its new expectations distinguish required concept files
from embedded knowledge: internal queues, topics, tables, buckets,
infrastructure definitions and hosts are scored inside an allowed useful parent
with exact evidence instead of being required as standalone files. V14 prompts,
expectations and retained results remain unchanged.

The current MVP manifest qualifies only the pinned Terraform-based Health
Aware repository. SAM/CloudFormation and mixed frontend/backend qualification
is deferred. Earlier Shopping Cart prompts, expectations and results remain
historical evidence, but Shopping Cart is no longer selectable from the current
suite.

The first V15 run, Health `2026-08-21T122847Z`, is retained as failed evidence.
It reached the intended System/Function/Interface/Flow plus embedded-resource
candidate set, then `prepare_hub_okf` rejected its own generated Flow skeleton
because `flow_steps` was absent. No bundle was finalized or scored. The summary
also describes that failed prepare as “not observed”; this is imprecise harness
wording, not the cause of the product failure. No replacement run was made.

The Flow preparation and diagnostic defects are subsequently fixed offline:
Prepare now returns an editable empty Flow-step slot, final validation still
requires real steps, and failed calls are reported as failed rather than absent.
This correction is not a new model qualification.

The owner-authorized requalification, Health `2026-08-21T132954Z`, completed the
V15 lifecycle with no tool failure and produced a valid `reviewable` bundle in
183,391 ms. It authored Domain, Repository, System and Function with 100% schema
agreement and metadata completeness. Owner review remains `needs_revision`:
the Flow probe is absent, the Domain does not navigate to the System and its
body is shallow. The Function prose contains DynamoDB state, schedule and
delivery knowledge, but embedded coverage scores 0% because the agent cited
CloudFormation/handler evidence while the Terraform-only expectation requires
the Terraform path. The retained result separates this qualification-scope
mismatch from the real OKF navigation and missing-Flow findings.

The next owner-authorized Health run `2026-08-21T135125Z` is retained as failed
evidence. The Terraform source-truth correction worked: structured observations
and authored technology metadata cite the exact `.tf` resources rather than
CloudFormation. The agent drafted Repository, System, Function, Interface and
Flow knowledge, including the expected embedded DynamoDB and schedule details,
but could not validate the Flow. Schema guidance exposed actions, modes and a
prose requirement for source/target identities without the exact serialized
field shape; the validator expected `order`, `source` and `target` and returned
only `flow_steps entry is malformed`. The agent guessed `order/from/to`, then
`sequence/from/to`, exceeded the one-repair lifecycle and correctly did not
Finalize or Inspect. No OKF bundle was scored. This is an MCP authoring-contract
defect, not an OKF semantic or benchmark-scorer finding.

Owner-authorized run `2026-08-21T142407Z` verifies the exact Flow field-shape
correction: the validator parsed all four steps and no longer reported malformed
entries. The authored bundle was still invalid. The Flow used unpromoted
embedded labels (EventBridge schedule, AWS Health API, DynamoDB state and
notification endpoints) as step endpoints, and several canonical relations
lacked resolving Markdown links. The agent recognized those diagnostics but
retained the schedule as an endpoint during its single repair, then Finalize
correctly rejected it. No Inspect or scorable bundle followed. This is an OKF
authoring/repair failure with a remaining guidance-usability gap around concept
endpoint identities; the benchmark scorer did not cause the failure.

Expectations do not prescribe prose or agent slugs. Bounded identity terms and
evidence match concept instances; the scorer then evaluates concrete schema
choices, required semantic metadata, source provenance and directed concept
relationships. Expectations are non-exhaustive probes: recognized items are
classified as confirmed or contradicted, valid output outside the reference is
unjudged, and absent probes are missing reference knowledge. Reference concept,
metadata, provenance and relationship coverage remain diagnostics; they do not
claim the reference is a complete repository inventory.

Each arm declares an authoring assessment of `reviewable` or `invalid`.
Lifecycle/conformance failures, empty output, unsafe provenance, known schema
contradictions and malformed or broken relationships are invalid. Missing
concepts, metadata, evidence or relationships do not invalidate
an otherwise evidence-backed draft, even below 80%; they remain visible for
human review and later enrichment.

V5 separately reports `ownerReview.status` as `useful_for_owner_review` or
`needs_revision`. This assessment catches duplicate identities, repository-tree
copies, thin Markdown bodies and route/handler fragmentation. V8 additionally
checks progressive navigation and whether curated source contradictions are
visible with their evidence in a concept Limitations section. It does not turn
reference coverage, concept count, token use or elapsed time into quality gates.
Reference probe keys remain scorer-only and production Hub proposals reject
benchmark-only metadata.

Deterministic source-path checks prove that a cited path is present in the
curated probe, not that every authored sentence is semantically supported.
Reports state this limitation and require human review.

Token values come from the final completed-turn event emitted by the pinned
Codex CLI. Missing fields stay unavailable. MCP/shell counts and serialized
authoring-tool argument/result bytes are direct trace observations, not complete
telemetry for every source file or model-context byte.

`npm run verify` uses a fake Codex process and never invokes a model. Real runs
use existing host Codex authentication; AgentBase does not read or persist it.
