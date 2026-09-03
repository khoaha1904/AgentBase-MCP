# 07 — AI SDLC context

> Status: Product direction, bounded qualification and an explicit manual
> context workflow are accepted. Automatic host-workflow integration remains
> deferred.

## Outcome

AgentBase supplies concise, sourced system context to external AI workflows
without taking ownership of their lifecycle.

```text
Published Hub → business/system overview for Feature Discovery
Published Hub → scope → local source/Code Graph for developer Task Planning
```

A BA, PO or DM can understand existing systems and cross-repository relations
without a source checkout. A developer can add authorized local source when
exact implementation, impact and tests matter.

## Manual, on-demand context

The first released composition is explicit: the user invokes
`$agentbase-context` beside the primary workflow skill when Published system
context is wanted. For example:

```text
$fpt-discover $agentbase-context Clarify this Feature into User Stories ...
```

The primary workflow still owns its lifecycle and final deliverable;
`agentbase-context` contributes only bounded evidence. It does not prefetch the
entire Hub, push unsolicited context or create a prepared context store.
The standalone `agentbase-query` workflow must not substitute for this explicit
modifier or take over the primary workflow's output.

Returned context prioritizes:

- related capability, System, Interface or Resource;
- owning Repository and Domain;
- evidenced relations, dependencies and Flows;
- important Published constraints and source/document references;
- conflicts, Questions, freshness limitations and missing knowledge.

Published Markdown groups internal infrastructure with the runtime or ownership
boundary that gives it meaning. Phase 1 promotes only boundaries that a Feature
Discovery answer or impact view must identify independently. Phase 2 obtains
files, symbols, calls and tests from current source/Code Graph rather than
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
visuals may use authorized local Code Graph/source evidence and must stay
revision-bound, derived and session-local. A missing or untraceable edge is an
explicit limitation, not a reason to substitute a Published relation or an
invented source path.

## Authority and degradation

Feature Discovery uses Published Hub knowledge only. Missing source is not a BA
or product-owner failure, and AgentBase does not ask them to clone repositories.
Task Planning may read local source/Code Graph only when the developer has that
source and exact implementation evidence is needed.

Every returned fact retains provenance and limitations. If AgentBase or the Hub
is unavailable, the primary workflow may continue with its own sources, but it
must not receive a result that silently appears complete. An old snapshot is not
described as current implementation.

The context boundary adds no credential or read permission. Local Draft and
unaccepted relations never enter ordinary context.

## Productization gate

Qualification compares the same workflow with and without AgentBase. Adoption
requires no critical quality regression, no unsupported claims and at least one
meaningful improvement in impact coverage, questions or traceability. Time,
token use and tool-result size are diagnostics rather than substitutes for
quality or owner review.

Phase 2 Task Planning always starts with a two-arm audit: the realistic baseline
reads the same pinned source normally and the second arm adds Code Graph. A
third exact-Published-Hub arm is admitted only for a named cross-repository,
ownership or accepted-contract gap; it is not run merely to repeat local
implementation terms. No Phase 2 product claim is accepted from a control that
lacks source or from a comparison that changes the User Story, source revision,
model, output contract or read-only boundary between comparable arms.

Implementation is qualified separately in two editable disposable copies of
the same pinned repository. Normal source reading remains the default. Code
Graph is added only when unfamiliar structure, callers, dependency paths or
coverage create a concrete navigation need; Hub remains absent unless the work
has a named cross-repository knowledge gap. A graph-assisted patch must pass the
same focused, hidden-semantic and repository verification as the control before
time or token savings count.

The first three-repository Phase 3 incident replay gave both arms identical
source authority. Hub returned the correct cross-repository route but produced
no quality, source-command or first-root-evidence gain and added time and model
tokens. Incident use therefore remains selective and unproductized; another
qualification is justified only by a harder routing problem, not by repeating
the same small source set.

Qualification harnesses, prompts, fixtures, tool traces, timestamps and model
results are Validation Evidence. They belong to the relevant Capability
Contract and AgentBase-Benchmark, not this Product Contract.

The accepted first productization step is one small, explicit-only integration
skill backed by the qualified one-search profile. Automatic invocation from a
host workflow requires separate evidence and owner approval. Productization
does not require a Hub schema migration or ownership of an external workflow.

## Value and trade-offs

Prepared Published knowledge can reduce repeated repository discovery, narrow
source reading and expose relationships a single repository cannot show. The
trade-off is that teams must Ingest, review, Publish and Refresh knowledge; an
old or sparse Hub cannot guarantee current implementation coverage.

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
- Route an explicitly selected discovery or planning deliverable through the
  standalone AgentBase question workflow.

## Downstream Capability Contract

- [Context for AI SDLC workflows](../capabilities/14-ai-sdlc-context/README.md)
