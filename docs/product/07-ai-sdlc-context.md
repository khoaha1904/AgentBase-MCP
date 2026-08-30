# 07 — AI SDLC context

> Status: Product direction and bounded qualification are accepted; AgentBase
> context is not yet a separately productized runtime workflow.

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

## On-demand context

The primary workflow asks AgentBase only after it encounters a concrete gap
about a capability, repository, dependency, Flow or constraint. AgentBase does
not prefetch the entire Hub, push unsolicited context or create a new prepared
context store.

Returned context prioritizes:

- related capability, System, Interface or Resource;
- owning Repository and Domain;
- evidenced relations, dependencies and Flows;
- important Published constraints and source/document references;
- conflicts, Questions, freshness limitations and missing knowledge.

The result remains bounded to the caller's question. Search/read data lives only
in the host AI session under its policy; it is not written to Hub or Local Draft.

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

Qualification harnesses, prompts, fixtures, tool traces, timestamps and model
results are Validation Evidence. They belong to the relevant Capability
Contract and AgentBase-Benchmark, not this Product Contract.

If host-agent orchestration is insufficient after qualification, a small
integration skill may be considered. Productization does not require a Hub
schema migration or ownership of an external workflow.

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

## Downstream Capability Contract

- [Context for AI SDLC workflows](../capabilities/14-ai-sdlc-context/README.md)
