# 01 — Repository understanding

> Status: Local repository reading, evidence-bound discovery and provider-neutral
> schema selection are implemented. Arbitrary remote query-time cloning remains
> outside the product boundary.

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

Graphs are created or reused only when a workflow needs exact source. Hub-only
overview questions do not build a graph, and ordinary query never clones a
remote repository automatically. A Hub-authoring workflow may materialize its
explicitly authorized exact source snapshot without modifying the user's
checkout or credentials.

## Evidence before knowledge

The Code Graph locates files, symbols, dependencies and flows; it is not final
evidence. Claims must resolve to authorized code, configuration, infrastructure
or documentation. Source roles remain visible, sensitive content is excluded or
redacted and incomplete access produces a limitation rather than a guess.

Discovery is broad enough to expose important system, runtime, interface,
integration and operational signals, but publication remains selective. Each
important signal must have a visible outcome; repository-wide completeness and
concept count are not success metrics.

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
one useful parent even when it contains several provider resources. A small
repository with one runtime normally contributes one Repository plus one
Function or Component. Independently deployed frontend and backend runtimes
remain separate Components; consolidation never hides a real impact, security,
compatibility or failure boundary. File and concept counts are diagnostics, not
product success metrics.

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

## Failure and recovery

- Ambiguous repository selection asks the user instead of guessing.
- Missing, malformed, redacted or unauthorized source remains a visible
  limitation and cannot be presented as complete discovery.
- Source changes during a run invalidate the affected evidence boundary.
- A failed graph/cache operation does not mutate source or create Hub knowledge.
- Retrying the same exact source must not create duplicate concepts merely
  because transient candidate state was lost.

## Non-goals

- One combined graph for a multi-repository workspace.
- Background indexing, a watcher or daemon.
- A permanent candidate database or separate candidate-review product.
- Provider-specific concept taxonomies.
- Automatic remote cloning for ordinary query.
- Publishing every discovered signal for coverage.

## Downstream Capability Contracts

- [Repository reading](../capabilities/01-repository-reading/README.md)
- [Concept discovery](../capabilities/03-concept-discovery/README.md)
- [Schema selection](../capabilities/04-schema-selection/README.md)
