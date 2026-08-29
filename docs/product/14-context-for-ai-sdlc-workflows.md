# 14 — Providing Context for AI SDLC Workflows

> Status: The high-level direction and low-level qualification were accepted by
> the owner; the first paired model run passed the deterministic gate and awaits
> owner review before runtime productization.

## Short answer

AgentBase is a shared system-context layer for AI workflows. A BA, PO or DM
using Feature Discovery can ask the Published Hub what the existing system has,
which components are related and where evidence lives without a source
checkout. A developer using Task Planning can add a local Code Graph/source to
find the exact implementation.

AgentBase does not replace those workflows. It returns bounded, sourced context
and clearly states what remains unknown.

## Problem to solve

An AI workflow commonly receives a Feature, ticket or business document from an
internal tracker. A BA, PO or DM should not have to clone a repository or wait
for AI to read source just to understand a system overview. A developer may have
local source, but giving AI only a User Story often produces generic task
breakdowns that do not match the current implementation.

AgentBase turns that repeated discovery into prepared knowledge:

```text
Repositories ──ingest/review/refresh──> Published Hub
                                             │
BA/PO/DM: Feature Discovery ─────────────────┘──> overview context

Developer: User Story/Bug ──> Hub scope ──> local Code Graph/source
                                             └──> task-planning context
```

The Hub returns reviewed overview and multi-repository relationships to both
phases. Feature Discovery stops at the Hub; missing source is not a failure and
BA/PO/DM are not asked to clone a repository. Task Planning uses Code
Graph/source because the developer has a local checkout and needs the current
implementation. This is the existing snapshot-default query boundary, not a
second query system.

## How to use it

Discovery remains the primary workflow and calls AgentBase only when it meets a
system or repository gap. Phase 1 directly uses the two existing capabilities,
Published Hub search and exact concept read; it does not prefetch, prepare
context or store an intermediate artifact. If qualification proves host-agent
orchestration insufficiently stable, a small integration skill such as
`agentbase-add-context` may be considered later.

```text
Feature Discovery (BA/PO/DM)       Task Planning (Developer)
            ↓                                 ↓
     Published Hub                    Hub identifies scope
            ↓                                 ↓
  overview + evidence               local Code Graph/source
            └──────── context + gaps ─────────┘
                              ↓
              primary workflow continues its own lifecycle
```

Feature Discovery uses the Hub at one point in time: **on demand**, after the
workflow encounters a concrete gap about a capability, repository, dependency,
flow or constraint. AgentBase does not guess what a Feature needs or push an
overview into the workflow before being asked.

Task Planning uses the Hub to find scope first, then local Code Graph/source for
symbols, callers/callees, execution paths, impact, tests and configuration. Task
generation remains the developer workflow's responsibility, not AgentBase's.

AgentBase does not need to call or modify a particular discovery skill directly.
The host agent orchestrates skills and uses MCP as ordinary tools.

## Context returned

A context result prioritizes exactly what lets the workflow continue:

- the related capability, System, Interface or Resource;
- the Repository and Domain that own them;
- evidenced relations, dependencies and Flows;
- important Published constraints or knowledge;
- source/document references for deeper investigation;
- conflicts, Questions, freshness limitations and anything not found.

The result is concise and scoped to the Feature. AgentBase does not dump the
entire Hub, raw Code Graph or all Markdown into the context window. The caller
can query/read further from suitable results.

Search/read results exist only in the AI session context under the host policy.
They are not written to the Hub, Local Draft or a new context store. Qualification
may retain a tool trace in Benchmark `results/` as test evidence; it is not a
knowledge authority.

AgentBase supplies facts and evidence; it does not turn them into Issues,
Requirements, User Stories, Acceptance Criteria or Tasks automatically. Creating
and approving those artifacts remains the calling workflow's responsibility.

## Authority, failure and recovery

- Ordinary context reads the synchronized Published Hub only; Local Draft is
  never mixed into an answer.
- Every fact retains its source/provenance and related limitation. An un-
  Published relation is not presented as fact.
- In Feature Discovery, if the Hub is insufficient, AgentBase states the gap and
  stops; it does not shift source setup to the BA/PO/DM.
- In Task Planning, Source/Code Graph is read only when the developer has
  permitted local source and the question needs that accuracy.
- If AgentBase is unavailable, the primary workflow can continue with its own
  sources; it must not receive a context result that appears complete while
  silently missing data.
- An old Hub snapshot is not described as the current source state. The workflow
  may request Refresh or a separate selective source verification.
- Hub and source access retain the current trust boundary; the context skill
  does not broaden credentials or read permissions.

## Value and trade-offs

Expected value:

- reduce the time AI spends rediscovering a repository in each workflow;
- reduce irrelevant source sent to the context window;
- reuse the same system understanding across multiple AI skills;
- add cross-repository relationships that one repository link cannot show;
- let users verify output through evidence and provenance.

In return, the team must Ingest, review, Publish and Refresh knowledge before it
can be reused. AgentBase cannot answer what the Hub does not cover and cannot
guarantee the current source when only an old snapshot exists. Exact
implementation questions still require source reading; the goal is to narrow
where it is needed, not remove source investigation altogether.

## First qualification scope

Feature Discovery is the first use case because it has a real failure mode: AI
receives a repository link but spends a long time reading source without getting
useful context. This phase must prove Hub-only context valuable before adding
runtime behavior or expanding the Hub schema.

The first qualification uses a simulated Feature grounded in Published Domain
knowledge. Two arms run the same discovery workflow, model, Feature input,
tracker context and limits. The discovery-only arm has no AgentBase; the assisted
arm may call exactly two Published Hub search/read tools when it needs more
system context. Because the fixed scenario requires an existing system surface
that the tracker lacks, the shared prompt requires at least one targeted Hub
search when the tool is present; the workflow still chooses the query and exact
documents. Neither arm uses AgentBase Code Graph/application source in Phase 1,
and no context is prepared in advance.

Qualification uses two AWS/Terraform fixtures in the development environment.
Crawler is a small fixture for cross-repository Lambda/SQS queries. The real
fixture is `aws-samples/amazon-ecs-fullstack-app-terraform`, an ECS application
with frontend/backend, DynamoDB, S3, SNS and CodePipeline; it has source-backed
OKF results in historical benchmark data. The two fixtures are test data only:
they do not create primary/secondary Hub concepts in the product and must not be
inferred from access to a generated Domain Hub page.

The ECS paired run on `2026-08-29T03-56-31Z` reached `needs_review`: assisted
preserved the critical backend interface and added two important outcomes
(frontend consumer and blue/green delivery), with no unsupported claim. The
increase in cost is diagnostic only; owner review must confirm interpretation
quality before treating it as product evidence.

Additional Crawler cross-repository and ECS compatibility variants were run.
Crawler again reached `needs_review`, with assisted adding the critical
publisher → SQS → worker path and two important publisher/storage outcomes. The
ECS compatibility variant was `incomplete` because the model made one command
outside the allowlist and used an undeclared evidence ID; this is workflow
compliance failure, not missing Hub data. After the runner blocked direct shell
access and the scenario received a three-search budget under the common cap, the
rerun at `2026-08-29T04-21-39Z` reached `needs_review`: assisted preserved the
critical backend interface and added important blue/green delivery, with no
unsupported claim.

Because the private Discovery skill is not a project input, the test uses one
common, immutable Feature Discovery prompt and the same output schema for both
arms. The result proves AgentBase context value in a controlled workflow only;
it must not be advertised as an integration or proof of the private skill.

High-level success must show that:

- the workflow receives useful system context without BA/PO/DM source local;
- the workflow recognizes a gap and queries the Hub instead of receiving
  prefetched context;
- context finds the right capability/repository/important relation with
  evidence;
- when Hub search exposes a relevant direct flow, the workflow keeps all
  important endpoints and immediate effects instead of describing only part of
  the topology;
- gaps and limitations are visible, without invented facts;
- discovery output loses no critical information, adds no incorrect claims and
  is not bloated by irrelevant context;
- the assisted arm improves at least one important outcome, such as a discovery
  question, impact coverage or traceability. Time and token/context cost are
  reference diagnostics only and cannot create a pass.

The result is valuable only through a no-worse gate: no critical-quality
regression against discovery-only and at least one meaningful improvement. If
AgentBase makes output worse or changes nothing, fix query guidance/Hub coverage
and rerun; do not continue building on expectation alone.

Since then, a Phase 2 task-planning A/B on the same US and a Phase 3 end-to-end
`Feature → US → Tasks` run have also been completed. The ECS end-to-end pair at
`2026-08-29T05-45-00Z` preserved both critical outcomes in both arms, while full
AgentBase added two important outcomes: a source-specific task boundary and
compatibility `/status`; the comparison is `needs_review`. This is promising
directional evidence, not a conclusion that every AI workflow improves
similarly.

Planning, implementation, review and testing reuse the same boundary; task
generation remains the developer workflow's responsibility. AgentBase supplies
only evidenced context and limitations and does not become an SDLC orchestrator.

## Compatibility and adoption

This is an additive capability on the existing Hub query, Code Graph and skill
installation. It does not require a Hub migration, OKF schema change, edits to
Published knowledge or behavior changes in current AgentBase workflows. An AI
client without the context skill continues using AgentBase as before.

Phase 1 qualification uses an isolated harness and a pinned Published Hub
revision; installing a context skill is not required. If productization is
approved after evidence, minimum adoption requires only a client registered with
AgentBase MCP and read access to the Published Hub. BA/PO/DM do not need a
source checkout or Code Graph. Later Task Planning requires the developer's
corresponding local source. An integration skill or change to an external
discovery skill is considered only if qualification proves that tool availability
and the common prompt are insufficient.

## Non-goals

- Replace Rally, the tracker, discovery skills or existing internal MCP.
- Standardize another company's Feature → Issue → User Story lifecycle.
- Store every SDLC event, prompt or artifact in the Hub.
- Ingest a temporary Feature/ticket into shared knowledge automatically.
- Scan an entire repository for every context request.
- Add a vector database, combined graph, daemon or background index for this use
  case.
- Promise support for every SDLC workflow before discovery qualification is
  complete.
