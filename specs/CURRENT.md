# Current capability

Active capability: [`022-single-repository-ingest`](022-single-repository-ingest/spec.md).

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

Most recent completed capability: `021-agentstack-foundation`.
