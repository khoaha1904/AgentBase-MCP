# 14.08 — AIT application report

> Status: Working product assessment, 2026-09-03. Phase 1 has two bounded Feature
> qualifications in the Crawler Domain and owner approval for a manual-only
> context skill. Phase 2 has one fair Crawler Task-Planning triad and one fair
> conventional ECS source/graph pair. One real AgentDocks implementation pair
> is qualified with a separate evaluator-v2 patch replay. Phase 3 has one fair
> three-repository Crawler incident pair with no measured Hub gain. All phases remain
> governed by the
> current [AI SDLC Product Contract](../../product/07-ai-sdlc-context.md)
> and [`AB-CONTEXT-*` requirements](02-runtime-requirements.md). Phase 3 remains
> an owner-directed application hypothesis, not an accepted runtime workflow.

## Read selectively

This page is not required startup context. Use the relevant section below;
follow its linked owner rather than loading unrelated sections.

- [Purpose](#purpose)
- [Executive assessment](#executive-assessment)
- [Shared AgentBase flow](#shared-agentbase-flow)
- [Phase 1 — Requirement Discovery](#phase-1--requirement-discovery)
- [Phase 2 — Implementation](#phase-2--implementation)
- [Phase 3 — Cross-repository investigation and onboarding](#phase-3--cross-repository-investigation-and-onboarding)
- [Knowledge investment by value](#knowledge-investment-by-value)
- [Recommended qualification order](#recommended-qualification-order)
- [Product decision summary](#product-decision-summary)

## Purpose

This report separates AIT use by the evidence available to the person doing the
work. It evaluates what AgentBase should contribute, which diagrams can support
the decision, what it cannot establish, and what still requires controlled
qualification.

The three phases are:

| Phase | Primary user | Available authority | Primary decision |
|---|---|---|---|
| 1. Requirement Discovery | BA, PO or DM | Tracker plus synchronized Published Hub | Turn a Feature into clear User Stories, or clarify an existing User Story. |
| 2. Implementation | Developer | Tracker, Published Hub, authorized local source and one-repository Code Graph sessions | Bound Tasks, implement safely and verify the change. |
| 3. Investigation and Onboarding | Developer, support engineer or new team member | Published Hub first; authorized source, graph, logs or provider evidence only when needed | Trace a problem across repositories or learn the business/system model. |

Phase 3 is not a mandatory chronological step after implementation. It is an
ongoing use mode and the clearest expression of AgentBase's multi-repository
value.

## Executive assessment

1. **Phase 1 is useful on two bounded Crawler-Domain Feature shapes.** Published Hub adds
   accepted system boundaries, repository ownership, shared interfaces,
   relations, failure behavior and unresolved Questions without source access.
   A one-search profile retained every critical path in both the cross-Repository
   job-visibility and ordered/branching pipeline-run scenarios while reducing
   incremental Hub tokens by `64.8%` from the earlier admitted profile. It
   cannot establish current implementation or live state, and generalization
   outside this Domain remains unproven.
2. **Phase 2 Task Planning does not justify default graph or Hub use.** In the
   larger Crawler scenario, source plus Code Graph kept the same measured Task
   quality while using `130,653` fewer tokens and `18.588 s` less wall time.
   In a conventional ECS backend/infrastructure change, graph retained equal
   measured quality but added `3,173` tokens and `45.941 s`. Hub produced no
   critical or important Crawler gain and added `219,801` tokens over graph.
   Graph is therefore a selective planning aid. A separate AgentDocks edit pair
   found one graph quality edge and lower cost, but only for that fixture, so
   implementation graph use also remains selective.
3. **Phase 3 remains the strongest hypothesis, but its first replay found no
   measured Hub gain.** Both arms diagnosed the same three-repository payload
   mismatch with complete critical/important coverage and no unsupported claim.
   The Hub search returned the right publisher, worker and Glue boundaries, but
   did not reduce source commands or the command position of the first correct
   cause; it added `50,745` tokens and `17.769 s`. Source, graph, logs and runtime
   observations still prove the actual cause.
4. **Diagram count is not a success measure.** Each diagram is admitted only
   when it improves a named decision and every material edge is supported by the
   authority allowed in that phase.

## Shared AgentBase flow

`abs` establishes Hub access; it does not itself create AIT context. A user
connects and synchronizes the Hub once:

```sh
abs hub connect --url <hub-repository-url> --branch main
abs hub sync
```

For the first productized workflow, the user explicitly opts into AgentBase in
the same request as the primary AIT skill:

```text
User Feature, User Story or question
        ↓
User invokes the primary workflow plus $agentbase-context
        ↓
AgentBase performs one Feature-shaped search at the exact Published Hub commit
        ↓
Host agent uses bounded, sourced context in its own workflow
        ↓
Optional decision-focused diagram
```

The skill names below illustrate composition. The accepted first release
keeps AgentBase explicit, for example `$fpt-discover $agentbase-context ...`.
Automatic invocation from `fpt-discover`, `/discover`, `/plan` or another host
workflow remains deferred until the manual workflow proves useful beyond the
current Crawler-Domain qualification.

Published Hub and source permissions remain separate. A Hub relation can name a
repository without granting access to its code. Local Draft, unaccepted
relations and presentation coordinates never enter ordinary AIT context.

## Phase 1 — Requirement Discovery

### Goal and user flow

The BA starts from a Feature and drafts User Stories, or starts from an existing
User Story and removes ambiguity. The expected output is clearer scope,
acceptance intent, affected business/system boundaries, dependencies,
constraints, Questions and known unknowns. It is not an implementation plan.

```text
User: $fpt-discover $agentbase-context
      "Give Support an end-to-end crawler job-status view"
        ↓
Discovery agent reads Feature and tracker context
        ↓
One Feature-shaped AgentBase Hub search
        ↓
Agent drafts or clarifies User Stories with affected boundaries,
relations, constraints, Questions, unknowns and Published evidence
        ↓
User: $agentbase-diagram "Show the Discovery Impact Map for this Feature"
        ↓
AgentBase renders a focused Published-Hub view for human review
```

The Feature or User Story remains session focus. It does not become a Hub
concept merely because it appears in a discovery or diagram request.

### Hub knowledge needed

| Priority | Knowledge | Why Discovery needs it |
|---:|---|---|
| P0 | Domain and System purpose | Keeps the requirement aligned with the accepted business/system boundary. |
| P0 | Components or independently deployed runtimes | Identifies material affected areas without exposing source internals. |
| P0 | Repository ownership | Shows which teams or independently maintained codebases may be involved. |
| P0 | Interfaces and shared Resources | Exposes contracts and cross-repository handoffs such as queues or APIs. |
| P0 | Accepted directed relations | Distinguishes producer, consumer, dependency and persistence effects without guessing topology. |
| P0 | Constraints, failure behavior, Questions and limitations | Prevents the agent from turning missing evidence into a requirement assumption. |
| P0 | Exact Published commit and provenance | Makes every system-specific claim reviewable and identifies snapshot limits. |
| P1 | Accepted Flow steps | Explains an existing journey when sequence materially changes the requirement. |
| P2 | Provider-enriched stable identity | Improves confidence when two repositories refer to the same external resource; it is not required for every discovery. |

Hub does not need every cloud resource as a separate concept. Internal S3,
DynamoDB, alarm or event-source details may remain compact Embedded Knowledge
under the runtime that gives them meaning. A diagram may show an exactly sourced
embedded resource as presentation-only context, while structured AIT output
must not pretend that display row is a canonical Hub identity.

### Useful Phase 1 diagrams

| Priority | Diagram | Usefulness | Current boundary |
|---:|---|---|---|
| P0 | **Discovery Impact Map** | Very high. Shows the Feature-focused Systems, Components, Interfaces, Resources, Repositories, directed relations, important Questions and omissions. | The Published projection and focused Architecture rendering exist. Feature-driven concept selection still requires qualification; a visually correct full-Domain map is not proof of discovery value. |
| P1 | **Existing Flow** | High when the requirement changes an accepted journey. Helps a BA verify current steps, handoffs and failure points. | Sequence rendering requires accepted ordered Flow steps. Missing steps remain missing; relations are not converted into an invented sequence. |
| P1 | **Repository/ownership lens** | High for multi-repository scope and coordination. | It is a lens inside the impact map or Domain site, not a separate knowledge model. Repository regions show ownership, not execution order. |
| P2 | **Dependency lens** | Medium and conditional. Useful when one accepted dependency materially changes scope. | It reuses accepted relation edges and should remain part of the impact decision, not become a generic topology dump. |
| P2 | **Domain overview site** | Low for a single Feature, higher for Phase 3 onboarding. | It is a static Published snapshot, not a live operational dashboard. |
| Unsupported | File, symbol, call or test map | Not truthful in Phase 1. | BA users have no authorized source or Code Graph. |

### What Phase 1 can and cannot support

Phase 1 can support:

- Feature-to-User-Story scoping and User Story clarification;
- affected system, component, repository and interface identification;
- accepted cross-repository paths and ownership boundaries;
- existing constraints and failure behavior;
- missing product, operational and ownership questions;
- Published evidence and explicit snapshot limitations.

Phase 1 cannot establish:

- exact files, symbols, callers, tests or implementation effort;
- whether the source has changed since the Published snapshot;
- live deployment, queue, database, alarm or runtime health;
- a relationship absent from accepted Hub evidence;
- complete coverage when a relevant repository has not been ingested;
- implementation Tasks or a Task dependency DAG.

### Current Phase 1 evidence

Four bounded Crawler A/B pairs cover two Features at the same pinned Hub commit.
The first two used the same job-visibility Feature, model and quality
expectations. The first admitted pair
`2026-08-31T16-54-55Z` allowed two searches and three exact reads:

- the tracker-only arm asked useful correlation and ownership questions but
  could not identify any canonical technical boundary;
- the Hub-assisted arm identified both critical paths: publisher → queue →
  worker and publisher → Glue crawler initiation;
- it also identified failure-visibility controls and preserved the important
  distinction between declared source configuration and deployed state;
- it emitted no scored unsupported claim and passed deterministic admission,
  and was initially held for owner review;
- it did not identify all three Repository concepts or preserve the exact
  display names for both persistence effects, so coverage is useful but not
  complete.

That assisted arm cost an additional `84,315 ms`, `62,910` reported tokens and
`53,507` Hub tool-result bytes. Inspection showed that the exact reads repeated
context already supplied by search.

The follow-up pair `2026-08-31T17-46-30Z` used one global search, no exact reads
and a `32 KiB` result cap. It retained both critical paths, identified all three
Repository boundaries, made no scored unsupported claim and used `25,729` Hub
result bytes. The assisted arm used `52,269` total tokens versus `92,923` in the
earlier profile. Incremental Hub tokens fell from `62,910` to `22,142`, a
`64.8%` reduction. Assisted wall time only fell from `116.850 s` to `113.769 s`,
so interactive latency remains a concern even after token efficiency improves.

The second Feature pair `2026-08-31T18-24-00Z` exercised an ordered and branching
pipeline-run journey. Its generated query used only Feature/Tracker anchors,
stages, outcome and the failure/ownership lenses; it added no guessed
technology. All five ranked results were useful. The assisted draft recovered
both critical paths, all System/Flow/Repository and failure-behavior probes, and
made no scored unsupported claim. It used `23,071` Hub result bytes and `52,426`
total tokens, only `157` tokens above the first one-search assisted run. Its
incremental Hub cost was `21,969` tokens and `71.980 s` over the direct arm.

An unisolated diagnostic run on 2026-09-01 exposed that an operator-global
`agentbase-query` skill could be selected before the fixed workflow and make an
otherwise useful arm inadmissible. This was harness contamination, not missing
Hub knowledge. After `AB-QUERY-021`, `AB-CONTEXT-017..018` and `AB-BENCH-096`,
the built-in isolated rerun `2026-09-01T07-42-57Z` passed both arms without a
skill-file or shell call. It retained `2/2` critical and `5/5` important probes,
made no scored unsupported claim, used one search, no exact read and `22,767`
Hub result bytes. The assisted arm added `21,054` tokens and `33.896 s` over its
direct control. Comparable runs no longer depend on the operator remembering a
manual temporary-home wrapper.

Human semantic review finds the newer output at least as useful as the earlier
one: it covers retry/redrive behavior and S3/DynamoDB persistence while adding
the missing Repository ownership boundary. The current lexical probes miss some
of that value because they require exact words such as `DLQ` or exact embedded
resource display names. Probe matches are therefore diagnostics; deterministic
admission plus semantic owner review remains the gate.

The corresponding self-contained Discovery Impact Map preserves the exact Hub
commit, three Repository regions, eight selected nodes and eleven supplied
edges. It is useful for scope and ownership review without claiming source
detail or live state. The durable benchmark assessment and map remain under
`AgentBase-Benchmark/results/crawler/feature-discovery-*`.

This evidence supports **“bounded Hub context improves these two Discovery
decisions at a repeatable token cost.”** It does not yet support enabling Hub on
every Discovery request or claiming general performance outside the Crawler
Domain. Owner review remains required for each further Domain or materially
different application shape.

### Phase 1 qualification gate

Admit the workflow only when the Hub-assisted result:

1. has no critical regression against the same tracker-only workflow;
2. adds at least one meaningful affected boundary, relation, Question or
   traceability improvement;
3. makes no unsupported system or live-state claim;
4. resolves its claims to the exact Published trace;
5. stays within a bounded retrieval budget; and
6. helps the BA make a clearer requirement decision during owner review.

## Phase 2 — Implementation

### Goal and user flow

The developer has an authorized local checkout. Hub provides the accepted
system and cross-repository frame; source and Code Graph provide current exact
implementation evidence.

```text
User: /plan <User Story>
        ↓
Hub identifies purpose, constraints, affected repositories and shared contracts
        ↓
Agent resolves one exact local Git root
        ↓
Code Graph indexes or reuses that repository lazily
        ↓
Architecture/search/trace/snippet queries identify files, symbols,
dependency paths, configuration boundaries and nearby tests
        ↓
Agent drafts evidence-backed Tasks and explicit unknowns
        ↓
User: /implement
        ↓
Agent reuses graph/source evidence while editing and verifying code
```

For work across multiple repositories, Hub selects the route and the agent
switches through explicit local repositories sequentially. AgentBase currently
does not combine them into one cross-repository Code Graph.

### Responsibility split

| Question | Authority |
|---|---|
| Why does the capability exist? | Published Hub |
| Which systems, repositories and shared contracts are affected? | Published Hub, with source verification when current behavior matters |
| Which file or symbol implements it now? | Local source and Code Graph |
| Which callers, dependencies or tests are nearby? | Local source and Code Graph |
| Is the deployed system currently healthy? | Neither Hub nor Code Graph; explicit runtime/provider evidence is required |
| What should the Tasks be? | Host planning workflow, informed by evidence; AgentBase does not own Task lifecycle |

### Current Task-breaking evidence

The earlier tracker-only versus source-plus-graph comparison was not a fair
product baseline. The current audit instead uses three arms so each contribution
is attributable:

| Arm | Access | Measures |
|---|---|---|
| S0 — source-native | Tracker and the same pinned local source, with ordinary bounded file/text search and reads | Realistic current AI baseline. |
| S1 — source plus graph | Same input and source, plus Code Graph | Incremental value of graph navigation and traces. |
| S2 — source plus graph plus Hub | Same as S1, plus exact Published Hub | Incremental value of business constraints, repository routing and cross-repository knowledge. |

All arms use the same Feature/User Story, source commit, model, reasoning
effort, timeout, read-only source access and task schema. The control is not
intentionally weakened.

Measure quality before efficiency:

- correct implementation and configuration boundaries;
- exact, existing file and symbol references;
- required consumers and compatibility decisions;
- relevant test and verification neighbors;
- useful Task granularity, ordering and acceptance conditions;
- explicit unknowns instead of invented deployment behavior;
- critical omissions and unsupported claims.

Then measure cost:

- cold graph index time and warm exact-reuse time separately;
- end-to-end wall time;
- model input/output tokens;
- tool-result bytes and number of graph/source calls;
- number of source files or bytes read;
- retries, incomplete runs and trace-admission failures.

Run `2026-09-01T09-00-00Z` plans correlated pipeline-run visibility against
source commit `1483d3869ecc148195bce092900d8556332db609` and Published Hub commit
`45228292aa9ed56ebeb1e42a5216cf6a07133a3c`:

| Arm | Quality result | Time | Tokens | Retrieval |
|---|---|---:|---:|---|
| S0 — source-native | `3/3` critical, `2/5` important, no unsupported claim | `180.319 s` | `375,371` | 7 source commands / 73,996 bytes |
| S1 — source plus graph | Same measured quality and no unsupported claim | `161.731 s` | `244,718` | 5 source commands / 70,270 bytes; 5 graph calls / 11,923 bytes |
| S2 — graph plus Hub | Same critical/important quality; adds Published provenance only | `152.037 s` | `464,519` | 7 source commands; 2 graph calls; 1 Hub search / 22,343 bytes |

S1 is an owner-review efficiency candidate: it preserved the same critical
boundaries while reducing total reported tokens by `34.8%` and wall time by
`10.3%`. This single run does not establish repeatable savings. Human review
finds both S0 and S1 useful five-Task plans; graph mainly narrows navigation and
reports that the Scala subtree is outside graph coverage rather than adding a
new implementation decision.

S2 adds the exact Published snapshot and a useful question about an external
`crawler-publisher`, but its broad Feature-shaped search mostly repeats local
pipeline knowledge. It does not recover the complete publisher → queue → worker
handoff or improve a critical/important Task decision, while adding `219,801`
tokens over S1. Hub therefore should not be a default Phase 2 planning step.
If source leaves a cross-repository owner or shared-contract gap, a later
qualification should search specifically for that unresolved gap rather than
repeat local implementation terms.

Run `2026-09-01T11-56-03Z` then planned a conventional backend readiness change
against ECS full-stack source commit
`98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`. No cross-repository knowledge gap
was named, so the fair comparison stopped after source and graph:

| Arm | Quality result | Time | Tokens | Retrieval |
|---|---|---:|---:|---|
| S0 — source-native | `2/2` critical, `3/4` important, no unsupported claim | `80.340 s` | `192,470` | 3 source commands / 36,790 bytes |
| S1 — source plus graph | Same deterministic quality and no unsupported claim | `126.281 s` | `195,643` | 4 source commands / 47,325 bytes; 3 graph calls / 31,832 bytes |

Human review finds both plans implementation-ready at the planning level. S1
adds useful detail about separating Express construction from the listener,
Swagger and the boundary between CodeDeploy rollback and a Terraform health-path
change. S0 already identifies the current route, both server target groups, ALB
matcher, tests, compatibility decision and safe rollout order. The deterministic
`verification-task` probe undercounts both outputs because they use test,
validation and verification wording without its exact `test` + `verify` lexical
pair; this does not create an arm difference. Graph therefore has no meaningful
net planning gain on this small, directly searchable change and increases wall
time by `57.2%`.

Two earlier diagnostic triads are retained as invalid evidence because a prior
Code Graph audit session held the provider's per-account daemon at a different
cache root. `AB-BENCH-098` now performs a disposable graph preflight before any
model arm, so the same infrastructure conflict fails in seconds without model
token spend.

Accept graph-assisted Task Planning only if it has no critical quality
regression and either adds a meaningful quality improvement or retains equal
quality with a meaningful time/token reduction. Crawler meets the owner-review
gate as an efficiency candidate; ECS does not. Use ordinary source reading by
default and add graph when repository size, unfamiliar structure, callers,
coverage or dependency tracing creates a concrete navigation need. API,
infrastructure/configuration and cross-repository contract changes cannot be
collapsed into one universal claim.

### Actual implementation outcome

Run `2026-09-01T13-12-00Z` gave two agents independent editable clones of
AgentDocks commit `b6aa2cd2281cedfc1075e605aa60afa5ddaf4a00`. Both implemented the same
bounded JSON-RPC diagnostic fix under the same project instructions and path
scope; only the assisted arm received one local Code Graph. Hub was unavailable.

| Arm | Independent verification | Time | Tokens | Patch/retrieval |
|---|---|---:|---:|---|
| S0 — source-native | focused `7/7`, hidden v1 `2/2`, full repository `357/357` | `279.983 s` | `1,193,331` | `+49/-1`; 17 commands |
| S1 — source plus graph | focused `7/7`, hidden v1 `2/2`, full repository `357/357` | `247.303 s` | `975,402` | `+36/-1`; 14 commands; 2 graph calls / 3,412 bytes |

S1 reduced wall time by `32.680 s` (`11.7%`) and total tokens by `217,929`
(`18.3%`). Manual patch review then found a real evaluator-v1 blind spot: S0
did not return the generic fallback when the provider message consisted only of
removable control characters, while S1 did. A new immutable evaluator v2
replayed the retained patches and failed S0 while passing S1; it did not alter
the original v1 qualification.

This is a graph quality-and-cost candidate for one unfamiliar shared protocol
path. It is not evidence to index every implementation task. Both arms spent
most of their cost following the repository workflow and running complete
verification; S1 used only one graph search after indexing. Source remains the
default, with graph admitted for a named navigation, caller, dependency or
impact question.

### Code Graph value during implementation

Code Graph can help the implementation agent:

- map the repository before opening many files;
- locate exact entry points, symbols and implementation neighbors;
- trace caller/callee, import and dependency paths supported by the provider;
- find route, configuration, infrastructure and package boundaries;
- identify nearby tests and verification surfaces;
- narrow source snippets before editing;
- re-check affected paths against the pinned source revision;
- disclose coverage or unsupported-language gaps instead of silently claiming a
  complete impact set.

It does not understand product intent by itself, prove runtime state, guarantee
complete static analysis, combine independent repository graphs or replace
exact source inspection before editing.

### Useful Phase 2 diagrams

| Priority | Diagram | Usefulness | Current boundary |
|---:|---|---|---|
| P0 | **Implementation Impact Map** | Potentially very high. Shows exact files, symbols, dependency/call paths, configuration boundaries and relevant tests for one planned change. | Required Code Graph data can be queried, but the Code Graph → bounded diagram projection is not implemented. |
| P1 | **Exact trace/flow lens** | High when runtime or delivery order changes Task boundaries or verification order. | Exact trace retrieval is partly available; truthful visual normalization is deferred. |
| P1 | **Discovery Impact Map as scope prelude** | Medium. Reminds the developer of the accepted system and repository boundary before source analysis. | Available from Published Hub, but it cannot prove implementation edges. |
| Excluded | **Task dependency DAG** | Not owned by AgentBase. | The host planning workflow owns Task dependencies after Tasks exist. |

Do not build the Phase 2 visual path until the fair Task Planning audit shows
that graph-derived evidence improves the actual planning decision.

## Phase 3 — Cross-repository investigation and onboarding

### Why this phase matters

Hub's distinctive value is not storing more code detail. It is preserving a
reviewed map between business concepts, independently maintained repositories,
shared contracts and flows so an agent knows where to investigate next.

The owner reports a prior real investigation in which a failure appeared at the
final repository that persisted data, while the actual cause was in the first
repository because an upstream Google response omitted the expected data. A
predecessor of AgentBase Hub successfully exposed the upstream path. This is
strong product-direction evidence, but it is one owner-reported case and not a
reproducible benchmark result yet.

### Cross-repository bug investigation

```text
User reports downstream symptom in Repository C / database
        ↓
Hub query identifies the accepted upstream flow and Repositories C ← B ← A
        ↓
Focused cross-repository impact/flow view exposes likely handoff boundaries
        ↓
Agent inspects authorized local source or Code Graph in C, then B, then A
        ↓
Logs/provider evidence is added only when runtime behavior must be proven
        ↓
Agent reports the evidenced cause, uncertainty and affected contracts
```

Hub is a routing and hypothesis-narrowing layer, not causal proof. A missing
edge, stale snapshot or non-ingested repository must remain visible. Exact root
cause still requires current source and, when the bug depends on actual
execution or external responses, logs, traces, payloads or provider evidence.

Qualify this use case by replaying a fixed multi-repository defect with and
without Hub. Measure:

- whether the correct upstream repository and handoff are reached;
- time to the first correct root-cause candidate;
- repositories/files/tool-result bytes inspected;
- correctness of the end-to-end causal chain;
- unsupported causal or live-state claims;
- whether Hub prevents a local downstream symptom from being mistaken for the
  origin.

The baseline should receive the same authorized source repositories. The Hub
arm must win by navigation quality or cost, not because the baseline is denied
the code.

### First reproducible incident evidence

The real pair `incident-crawler-glue-contract/2026-09-03T12-02-17Z` used three
clean pinned repositories and Published Hub commit
`45228292aa9ed56ebeb1e42a5216cf6a07133a3c`. The reported symptom was that the
worker result object and DynamoDB row existed while the analytics Glue catalog
did not refresh.

Both arms correctly found the complete source-level chain:

1. `crawler-publisher` invokes the upstream Lambda asynchronously with
   `{bucket, key}` instead of its required `CRAWLER_NAME` input;
2. `glue_crawler_initiation` raises before `start_crawler`;
3. asynchronous invocation lets the publisher continue to SQS;
4. `crawler-worker` can therefore persist S3 and DynamoDB results independently.

Each arm matched `3/3` critical and `2/2` important probes and made no scored
unsupported live-state claim. The control used five source commands, reached
the first exact root evidence in command two, took `107.560 s` and used
`149,694` tokens. The Hub arm also used five source commands and reached the
root in command two; it took `125.329 s` and used `200,439` tokens. Its source
output was `33,276` bytes smaller, but the `21,291`-byte Hub result left total
tool output only `11,985` bytes (`10.8%`) smaller while model tokens rose
`33.9%` and time rose `16.5%`.

The one Domain-scoped search was relevant: all five results covered the
publisher, worker or Glue boundary and exposed the publisher → Glue relation.
The agent nevertheless repeated broad source discovery, so correct Hub routing
did not become navigation or quality gain in this setup. The case is easy for
the source baseline because only three small repositories are authorized and
the symptom already names Glue. The result therefore rejects default Hub use
for this incident shape; it does not reject the broader Phase 3 hypothesis.

The first admission replay also corrected a harness-only identity mismatch:
the prompt presented source roots as `repositories/<id>` while the validator
initially accepted only `<id>`. The corrected validator accepts only those two
exact equivalent forms and replayed the retained model output; no model rerun
or semantic reinterpretation was used.

### Onboarding and system learning

```text
New team member connects and synchronizes the Hub
        ↓
Asks business-first questions about a Domain, capability or data journey
        ↓
Hub explains purpose, systems, repositories, interfaces, Flows,
ownership, constraints and known Questions
        ↓
Domain site or focused diagram provides the shared mental model
        ↓
Source is opened later only for exact implementation learning
```

Onboarding can use current Hub search/read and the static Domain site without a
local source checkout. A useful evaluation asks a fixed set of business,
ownership and data-lineage questions, then compares Hub-assisted answers with
manual repository documentation browsing for correctness, time, source reads
and retained misconceptions.

### Useful Phase 3 diagrams

| Priority | Diagram | Usefulness | Current boundary |
|---:|---|---|---|
| P0 | **Cross-repository impact/path map** | Very high for locating upstream and downstream handoffs around a symptom. | Published Architecture/Dependency views can show accepted relations. They cannot prove one causal execution or join source graphs. |
| P0 | **Existing end-to-end Flow** | Very high when accepted Flow steps describe data movement or request order. | Available only where Published Flow evidence exists. |
| P0 | **Business-oriented Domain map/site** | Very high for onboarding and broad navigation. | The static Domain site exists and remains an exact Published snapshot, not a live mirror. |
| P1 | **Repository ownership lens** | High for deciding whom to ask and which checkout to inspect next. | Repository regions show membership/ownership only. |
| Unsupported | **Live incident timeline or distributed trace** | Would be valuable but is not Hub knowledge. | Requires explicit runtime telemetry authority and a separate product decision. |

## Knowledge investment by value

Collect or improve Hub data only when it supports one of the decisions above.

### P0 — maintain first

- stable Domain/System purpose;
- independently useful runtime/component boundaries;
- canonical Repository ownership;
- shared Interface/Resource identities when they cross ownership boundaries;
- directed, evidenced cross-repository relations;
- important failure behavior, constraints, Questions and limitations;
- accepted Flows for journeys that materially affect requirements,
  investigation or onboarding;
- exact Published provenance and honest freshness.

### P1 — add when a real scenario needs it

- correlation identifiers and status semantics used across handoffs;
- operational owner or escalation boundaries;
- provider-enriched identity needed to prove that two references are the same
  shared resource;
- additional Flow steps required by a concrete discovery or defect replay.

### Avoid as Hub scope

- every file, symbol, call or test;
- every internal infrastructure resource as a standalone concept;
- temporary Features, User Stories, Tasks or prompts;
- inferred relationships based only on equal names;
- live deployment state, logs or telemetry presented as Published knowledge;
- presentation coordinates or a durable copy of the private Code Graph.

## Recommended qualification order

1. **Ship Phase 1 as manual composition.** Keep `agentbase-context` explicit and
   pair it with the user's primary discovery skill; do not integrate it into
   that host skill yet.
2. **Keep Phase 1 retrieval bounded.** Default this qualified scenario to one
   Feature-shaped search, at most five relevant results and no full Markdown
   reads.
3. **Retain the completed implementation outcome audit.** Keep its v1 result
   and v2 exact-patch replay separate; do not generalize one JavaScript case.
4. **Keep incident use selective.** The first fair replay is complete and found
   no measured gain. A second replay is justified only with a realistically
   larger repository set or a downstream symptom that does not already name the
   upstream technology; retain equal source authority in both arms.
5. **Run a small onboarding study.** Use business, ownership and data-lineage
   questions plus the current Domain site; do not ingest more data unless a
   decision-critical gap is observed.

## Product decision summary

| Application | Current confidence | Decision |
|---|---|---|
| Phase 1 Hub-assisted requirement clarification | Useful and deterministically admitted for two bounded Feature shapes in one Domain. One-search retrieval costs about `22k` incremental tokens in both; latency and cross-Domain generalization remain under review. | Release as explicit `$agentbase-context` composition; do not add automatic host integration, a context store or schema. |
| Phase 1 Discovery Impact Map | The job-visibility Feature's pinned artifact is truthful and useful for scope/ownership review. A second query scenario passed without requiring another diagram. | Keep diagrams optional and decision-focused; validate another visual only when its decision shape differs materially. |
| Phase 2 graph-assisted Task breaking | Crawler kept equal measured quality while reducing tokens `34.8%` and time `10.3%`; conventional ECS kept equal quality but added `1.6%` tokens and `57.2%` time. | Keep normal source reading as default. Add graph only for a concrete navigation/trace need; do not productize an Implementation Impact Map from planning evidence. |
| Phase 2 Hub-assisted Task breaking | The same run added exact provenance and one external-publisher question, but no critical/important gain and `219,801` tokens over graph. | Do not call Hub by default during planning; retest only with a gap-focused cross-repository query. |
| Phase 2 Code Graph during implementation | One AgentDocks pair passed full verification in both arms; graph was `11.7%` faster, used `18.3%` fewer tokens and alone passed the repaired control-only-message evaluator. | Treat graph as a selective quality/cost candidate for named navigation or impact needs; source remains default and one fixture is not a release-wide claim. |
| Phase 3 cross-repository defect investigation | Both arms solved the first three-repository replay completely. Hub returned the right route but added `50,745` tokens and `17.769 s` without reducing five source commands or command-two root discovery. | Do not enable Hub by default for this shape. Retest only on a harder downstream-only or larger-repository incident where routing could materially narrow source work. |
| Phase 3 onboarding | Existing Published query and Domain site already fit the authority boundary. | Validate with a small question set before expanding knowledge scope. |
