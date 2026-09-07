# 01 — Repository understanding

> Status: Local repository reading, evidence-bound discovery and provider-neutral
> schema selection are implemented. Group 1 dynamic repository selection and
> the later monorepo qualification have accepted Product design; real-model
> qualification is deferred and does not block the current internal enterprise
> release. Arbitrary remote query-time cloning remains outside the product
> boundary. G5-C1 compact Repository dossiers are implemented and verified;
> G5-C2 semantic-quality admission is deferred and is
> not a current release requirement.

## Accepted follow-up — Groups 7 and 9

Publication follows the simplified
[Knowledge lifecycle](03-knowledge-lifecycle.md#accepted-simplification-target--group-7).
G9-C1 implements Add repository and Update knowledge in installed guidance;
Initial Ingest, Delta and Coverage remain bounded internal strategies.
Evidence selection, sparse promotion and source authority remain unchanged.
Coverage's no-new-knowledge stop and three-pass cap bound effort, not proof of
completeness. No mandatory semantic reviewer is part of this horizon; the
required-review failure bullet in the baseline below is deferred, not an
active admission requirement.

## Coverage expansion

The working source implements the following owner-approved bounded follow-up.
This does not change the already tagged 0.1.0 release:

| Scope | Approved outcome | Delivery boundary |
|---|---|---|
| Discovery selection | Prioritize manifests, deployment evidence and evidenced entrypoints while reserving room for ordinary source. Default `standard`; offer `expanded` only for a concrete important coverage gap and after explicit user approval. | Two bounded modes, not arbitrary budgets, AI ranking or automatic escalation. Reuse the graph. Census limits are not whole-graph limits. |
| SAM/basic CloudFormation | Source-backed functions, APIs, common API/SQS/schedule triggers, supported Globals inheritance and direct same-template references. | No build/deploy, macro expansion, nested-stack download, cross-stack resolution or live cloud verification. Unresolved expressions remain limitations. |
| Backend languages | Enable and qualify C# and Kotlin in addition to the existing parser profile. | No other new languages; parser admission does not prove complete .NET/Spring/framework understanding or macOS qualification. |
| Terraform mappings | Add bounded ECS service/task-definition, API Gateway and Lambda event-source-mapping support, with shared semantic roles across IaC formats. | No resource-per-concept rule, broad AWS catalog, Azure/GCP expansion or relation inference from classification alone. |

Existing Published
knowledge, public skill names, proposal approval and publication boundaries stay
unchanged. No automatic re-ingest or reclassification follows an upgrade.

Detailed scope belongs to [Discovery](../capabilities/03-concept-discovery/01-candidate-discovery.md),
[Schema selection](../capabilities/04-schema-selection/README.md) and
[Version scope](../capabilities/12-version-scope/README.md).
CDK/Pulumi/Helm execution, broader cloud enrichment and automatic AI review are
deferred to [company-environment evaluation](../capabilities/12-version-scope/07-deferred-capabilities.md#company-environment-evaluation-only).

## Outcome

AgentBase turns a repository into a selective, evidence-backed system overview.
It uses a private Code Graph as a map, returns to original source for proof and
proposes only concepts that have independent identity and query or relationship
value.

```text
exact repository snapshot
        ↓
private Code Graph and bounded source discovery
        ↓
evidence-backed candidates
        ↓
concept, embedded knowledge, relation, Question or ignored signal
```

AgentBase does not send an entire repository to AI, copy the raw graph into the
Hub or turn every file, function and cloud declaration into shared knowledge.

## Repository and workspace boundary

One Git repository is one graph and source-identity unit. A monorepo uses one
graph with child paths as evidence scopes. A directory containing several Git
repositories is only routing scope: AgentBase selects repositories explicitly
and reads them sequentially instead of merging their graphs.

In the trusted enterprise profile, a user, client or active workflow may select
any local path readable by the current process. AgentBase resolves the exact Git
repository root and pins its source state for that workflow. Switching to a
repository elsewhere on the machine requires no installation, persistent root
allowlist or AgentBase reconfiguration.

Graphs are created or reused only when a workflow needs exact source. Hub-only
overview questions do not build a graph, and ordinary query never clones a
remote repository automatically. A Hub-authoring workflow may materialize its
selected exact source snapshot without modifying the user's checkout or
credentials.

## Evidence before knowledge

The Code Graph locates files, symbols, dependencies and flows; it is not final
evidence. Claims must resolve to authorized code, configuration, infrastructure
or documentation. Source roles remain visible, sensitive content is excluded or
redacted and incomplete access produces a limitation rather than a guess.

Discovery is broad enough to expose important system, runtime, interface,
integration and operational signals, but publication remains selective. Each
important signal must have a visible outcome; repository-wide completeness and
concept count are not success metrics.

Discovery signals are a bounded map, not a completeness certificate. An empty
heuristic result means not detected, not verified absent. File/entry limits,
oversized admitted files and sampled evidence stay visible. Distinct evidenced
runtime/entrypoint locations must remain individually accountable even when
they eventually share one dossier; a directory alone does not prove a service.
Initial Ingest carries unresolved discovery limits into the existing Repository
coverage debt so later Refresh can recover them without re-ingesting or adding
a reviewer, skill or quality-score subsystem.

Every Initial Ingest produces a semantic coverage account over the exact
discovery input. Applicable product/runtime boundaries, capabilities,
interfaces or triggers, data/integrations, important flows, operations and
known gaps must resolve to Repository-dossier content, independently justified
knowledge, a Question/limitation or an explicit ignored reason. This is a
provider- and language-neutral obligation, not a framework checklist or a claim
that every possible fact was discovered.

## Concept boundary

A candidate becomes a standalone concept only when it has:

- stable, evidence-backed identity; and
- independent query, navigation, ownership, lifecycle or relationship value.

Internal implementation details remain source evidence or embedded knowledge in
a useful parent. Technology names are metadata, not concepts by default. An
uncertain candidate becomes a Question or explicit limitation; AgentBase does
not use a numeric confidence score or silently merge a name/prose match with an
existing concept.

Knowledge that shares one runtime, deployment and ownership boundary stays in
one useful parent even when it contains several provider resources. The default
parent for repository-local understanding is a rich Repository dossier covering
its applicable purpose, boundaries, capabilities, interfaces/triggers,
dependencies/data, operations, evidence and limitations. A separate knowledge
document exists only when its subject has independent lifecycle/ownership,
cross-document reference or relationship value, or an independently useful
Flow/contract. Consolidation never hides a real impact, security,
compatibility or failure boundary. File length, file count and concept count are
diagnostics, not product success metrics; padding a thin concept is not a fix.

## Provider-neutral representation

A schema describes a reusable knowledge role; a concept is one concrete
evidence-backed instance. AgentBase uses provider-neutral roles such as
Repository, Domain, System, Component, Function, Interface, Flow and Resource.
Provider, product and source tool remain technology metadata.

One concept declares one schema. A queue, topic, table, bucket or host normally
stays embedded unless evidence proves an independent contract or operational
boundary. Unsupported or ambiguous technology remains readable as evidence and
does not disappear merely because a provider profile cannot classify it.

An independently shared transport may remain a Resource. Internal persistence,
dead-letter handling and alarms stay in the runtime's Dependencies, Operations
or Failure and Recovery sections unless they have separate ownership, lifecycle,
runbook or independent query value.

Profile and catalog changes never authorize silent reclassification of
Published knowledge. A semantic change requires a reviewable migration proposal;
missing evidence preserves current knowledge and records a Question.

Under the accepted Group 4 Domain Capsule model, Initial Ingest proposes one
grouped home plan after its bounded candidates are known: one Repository home,
the same default for its new concepts and explicit exceptions where evidence
supports another Domain Capsule or `shared/`. The user confirms the complete
plan once rather than answering per-document prompts. Placement controls
stewardship and navigation; evidenced `part-of` relations separately describe
Domain participation. A monorepo remains one Repository identity even when its
scoped evidence contributes documents or relations to several Domains.

Group 5 retains that home/participation distinction but removes type-shaped
placement inside a home. Domain `index.md` is the Domain concept and navigation
entry, Repository documents are dossiers under `repositories/`, and other
independently useful concepts share `knowledge/` regardless of schema type.
Questions retain a lifecycle-owned collection. Knowledge that fails independent
promotion stays embedded in the dossier rather than receiving a thin file.

For the current release, deterministic discovery coverage, evidence/Profile
validation and material-change preview before explicit Publish remain the quality boundary. An
operator may ask a separate fresh-context agent to review an editable draft,
but that advice creates no product state, Finalize gate, automatic repair or
override path. A product-integrated semantic reviewer remains deferred until
observed defects justify the additional workflow.

Repository understanding is allowed to improve after Initial Ingest. Default
Refresh remains change-first and cheap. An explicit Coverage Refresh reruns a
broad but bounded provider-neutral investigation against the same exact source
authority and existing knowledge, then proposes only newly evidenced or
corrected knowledge. It is a recovery mode of `agentbase-refresh`, not another
skill, completeness claim or re-ingest. A partial pass remains visible as
Repository coverage debt and never authorizes deletion by absence. Coverage
stops early after the first non-partial pass that adds no knowledge. A pass
that finds knowledge keeps the debt for another reviewable pass, up to three
passes in one convergence campaign; reaching the cap leaves owner-visible debt
and returns ordinary work to Delta rather than claiming completeness.

## Failure and recovery

- Ambiguous repository selection asks the user instead of guessing.
- Missing, malformed, redacted or unreadable source remains a visible
  limitation and cannot be presented as complete discovery.
- Source changes during a run invalidate the affected evidence boundary.
- A failed graph/cache operation does not mutate source or create Hub knowledge.
- Retrying the same exact source must not create duplicate concepts merely
  because transient candidate state was lost.
- A required semantic review that cannot obtain bounded source evidence or a
  fresh review context stops as Incomplete unless the owner explicitly
  overrides the exact finding with a retained reason.

## Deferred product evidence gate

This gate is not part of the current internal enterprise release. Before
Repository understanding is generalized or promoted with a benchmark-proven
scale claim, qualification covers at least one multi-product monorepo and one
shared platform/infrastructure repository. It measures source omission,
unsupported claims, repository-selection ambiguity and whether one graph plus
scoped child paths still preserves the boundaries needed by downstream users.
A failing identity or scope assumption returns to this Product Contract instead
of being patched with hidden path heuristics.

## Non-goals

- One combined graph for a multi-repository workspace.
- Requiring per-repository installation or a persistent local source allowlist
  in the trusted enterprise profile.
- Background indexing, a watcher or daemon.
- A permanent candidate database or separate candidate-review product.
- Provider-specific concept taxonomies.
- Automatic remote cloning for ordinary query.
- Publishing every discovered signal for coverage.
- Creating one Markdown document per detected schema, technology, endpoint or
  infrastructure resource.

## Downstream Capability Contracts

- [Repository reading](../capabilities/01-repository-reading/README.md)
- [Concept discovery](../capabilities/03-concept-discovery/README.md)
- [Schema selection](../capabilities/04-schema-selection/README.md)
