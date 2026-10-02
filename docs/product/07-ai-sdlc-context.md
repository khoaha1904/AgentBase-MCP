# 07 — AI SDLC context

> Status: Product direction, bounded qualification and an explicit manual
> context workflow are accepted. Automatic host-workflow integration remains
> deferred. Group 3 Product design is accepted and narrows product proof to
> cross-repository impact and requirement clarification before any broader
> claim; G3-C1 uniform freshness and G3-C2 proposal impact are implemented,
> while G3-C3 real-model usefulness qualification is deferred and does not
> block the current internal enterprise release.

## Accepted composition target — Group 8

G8-C1 is implemented and verified: use the single explicit
AgentBase entry defined in [Query and context](05-query-and-context.md#accepted-unified-use-target--group-8)
for both standalone answers and support within an active primary workflow.
The `agentbase-context` invocation remains a compatibility entry, not a
required choice. G8-C2 scoped repair handoff is implemented and verified for
the current scope. Preserve host-workflow
ownership, read-only defaults and source-access boundaries.

A concrete knowledge gap discovered during use may offer an owner-approved
repair handoff under that contract. It never silently ingests a Feature, Task
or generated answer. Technical knowledge helps stakeholders ask better
questions; existing implementation alone does not establish business intent,
customer commitments or desired policy. The product promise is known impact
and next checks, not exhaustive impact or autonomous requirement approval.

## Outcome

AgentBase supplies concise, sourced system context to external AI workflows
without taking ownership of their lifecycle.

```text
Published Hub → business/system overview for Feature Discovery
Published Hub → scope → local source for developer Task Planning
```

A BA, PO or DM can understand existing systems and cross-repository relations
without a source checkout. A developer can add authorized local source when
exact implementation, impact and tests matter.

## Current product wedge

The next product claim is intentionally narrow: AgentBase helps a BA/PO/DM or
developer clarify the impact of a change whose ownership, interface, dependency
or failure boundary spans repositories. It is not a general promise that Hub or
AgentBase improves every planning, implementation, incident or onboarding
task.

The deferred product-proof campaign qualifies this wedge in at least two
materially different Domains, one multi-product monorepo/shared-platform
boundary and one longitudinal Refresh cycle. A small onboarding study asks
business, ownership and data-lineage questions without expanding knowledge
until a decision-critical gap is found. These cases remain the accepted future
evidence boundary, not a gate or claim for the current release.

## Manual, on-demand context

Composition is explicit: the user invokes
`$agentbase-query` beside the primary workflow skill when Published system
context is wanted. For example:

```text
$fpt-discover $agentbase-query Clarify this Feature into User Stories ...
```

The primary workflow still owns its lifecycle and final deliverable;
AgentBase contributes only bounded evidence. It does not prefetch the
entire Hub, push unsolicited context or create a prepared context store.
The same entry answers standalone questions when no primary workflow exists;
it never takes over a primary workflow's output. Existing `agentbase-context`
invocations resolve the shared guidance without a separate read workflow.

Returned context prioritizes:

- related capability, System, Interface or Resource;
- owning Repository and Domain;
- evidenced relations, dependencies and Flows;
- important Published constraints and source/document references;
- conflicts, Questions, freshness limitations and missing knowledge.

Published Markdown groups internal infrastructure with the runtime or ownership
boundary that gives it meaning. Phase 1 promotes only boundaries that a Feature
Discovery answer or impact view must identify independently. Phase 2 obtains
files, symbols, calls and tests from current source rather than
expanding Hub metadata into a stale implementation inventory.

A Phase 1 impact view may expand a concrete, exactly sourced embedded resource
as a presentation-only dependency reference without promoting it to a Hub
concept. The view must label that distinction, preserve its parent context and
must not infer a runtime relation or merge equal display names.

The result remains bounded to the caller's question. Search/read data lives only
in the host AI session under its policy; it is not written to Hub or Local Draft.

## Decision-useful visual context

AIT admits a visual only when it helps a named decision in one of its two
phases. More diagrams are not better by themselves.

| Phase | Priority | Visual | Decision it supports |
|---|---:|---|---|
| Feature Discovery | P0 | Discovery Impact Map | Which accepted systems, components, interfaces, resources and repositories are affected, how are they related, and which important Questions remain? |
| Feature Discovery | P1, conditional | Existing Flow | How does the accepted journey work today when the proposed Feature actually changes that journey? |
| Task Planning | P0 | Implementation Impact Map | Which exact files, symbols, dependency/call paths and tests bound the implementation work? |
| Task Planning | P1, conditional | Exact trace/flow lens | In what runtime or delivery order must source changes and verification be reasoned about when order materially matters? |

The Feature or User Story is session focus, not an AgentBase-owned Hub concept.
Dependency edges are a lens within an impact map rather than a separate AIT
deliverable. AgentBase does not own or render a Task dependency DAG because it
does not own the Task lifecycle.

Phase 1 visuals use the exact Published Hub boundary. Phase 2 implementation
visuals may use authorized local source evidence and must stay
revision-bound, derived and session-local. A missing or untraceable edge is an
explicit limitation, not a reason to substitute a Published relation or an
invented source path.

## Authority and degradation

Feature Discovery uses Published Hub knowledge only. Missing source is not a BA
or product-owner failure, and AgentBase does not ask them to clone repositories.
Task Planning may read local source only when the developer has that
source and exact implementation evidence is needed.

Every returned fact retains provenance and limitations. If AgentBase or the Hub
is unavailable, the primary workflow may continue with its own sources, but it
must not receive a result that silently appears complete. An old snapshot is not
described as current implementation.

The context boundary adds no credential or read permission. Local Draft and
unaccepted relations never enter ordinary context.

## Evaluation boundary

Model runners, graph comparisons and benchmark orchestration are retired from
AgentBase. Historical evidence belongs to AgentBase-Benchmark and Git history.
It does not establish general semantic usefulness, scale or cost savings.

Future evaluation starts from a concrete owner question and an approved bounded
real-use campaign. Focused offline tests remain the current implementation gate.
Generated Domain sites are presentation, not Hub or evaluation authority.

## Value and trade-offs

Prepared Published knowledge can reduce repeated repository discovery, narrow
source reading and expose relationships a single repository cannot show. The
trade-off is that teams must Ingest, review, Publish and Refresh knowledge; an
old or sparse Hub cannot guarantee current implementation coverage.

Group 3 reports outcome quality first, then retrieval omission/unsupported
claims, freshness visibility, reviewer/steward effort, source fallback, tokens
and latency. Token or time savings never compensate for a critical quality
regression, and one positive fixture never authorizes automatic invocation.

## Non-goals

- Replace trackers, discovery, planning, delivery or approval workflows.
- Generate or own Features, Issues, User Stories, acceptance criteria or Tasks.
- Store every SDLC event, prompt or artifact in the Hub.
- Ingest temporary tickets as shared knowledge automatically.
- Scan an entire repository for each context request.
- Promise improvement for every AI workflow without qualification.
- Produce diagrams that have no named decision in the current AIT phase.
- Automatically invoke AgentBase from an external discovery workflow in this
  release.
- Replace an explicitly selected discovery or planning deliverable with an
  AgentBase report.

## Downstream Capability Contract

- [Context for AI SDLC workflows](../capabilities/14-ai-sdlc-context/README.md)
