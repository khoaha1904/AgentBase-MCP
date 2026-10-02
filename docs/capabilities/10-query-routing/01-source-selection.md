# 10.01 — Source selection

> Status: Implemented through the public `agentbase-query` skill; MCP has no
> reasoning router or combined-answer tool.

## Outcome

The Agent understands the question's intent and invokes the correct query
primitive. MCP does not classify questions automatically, create a combined-answer
tool or read source for a question that needs only Hub knowledge.

## Routing table

| User intent | Start with | Add the other source when |
|---|---|---|
| Domain, system, purpose, ownership, known behavior | Hub search/read | The user needs to compare the current implementation. |
| Cross-repository or cross-domain relation | Hub search/read links | Code detail is needed from a local, authorized repository. |
| Symbol, caller/callee, execution path, impact, exact implementation | Host source read/search | Business intent, an accepted constraint or a relation outside the repository is needed. |
| “Why” an implementation exists | Hub | The current code must be checked against the knowledge. |
| “What is the known value?” | Hub concept snapshot | Do not add a source read automatically. |
| “What is the current value?” | Hub concept snapshot | After presenting the snapshot and provenance, read exact authorized local source through a normal graph/file tool to verify the current value. |

This is a starting priority, not exclusivity. The Agent invokes the second source
only when the missing part of the answer genuinely requires it.

## Snapshot-default stopping rule

The snapshot/Hub is the default answer, not merely the first stage of a pipeline.
If it sufficiently answers user intent, the Agent stops even when source is local,
authorized or easy to read.

Source is added only when at least one condition holds:

1. the user explicitly requests the current value, source verification or exact code;
2. implementation, change, debugging or impact-analysis work requires exact code;
3. the Hub/snapshot is insufficient to complete the request safely and an exact
   authorized source route.

Snapshot age, source availability, an existing conflict/Question or a desire to
make data “more complete” is not a trigger. Query does not read source merely to
break a tie between claims.

## Hub route

1. Use `search_hub_okf` to find a concept by Domain/type scope.
2. Use `read_hub_okf_concept` for complete knowledge and provenance.
3. When a relation is needed, read Markdown links in the concept and continue
   with those two tools. Snapshots and Questions also reside in exact concept Markdown.

These two actions read only the exact Published commit synchronized locally.
Local Draft is inspected/reviewed separately; without a remote profile, Hub query
is unavailable.

Search ambiguity asks for a Domain/repository only when that choice materially
changes the result. Do not require the user to select “Hub mode” or know tool names.

For a value question, routing is always snapshot-default when the concept has an
observed value. The snapshot gives the Agent an answer and exact provenance; if
that is sufficient, no source read follows. Only when the Hub lacks a suitable
snapshot does an explicit current-value request go directly to normal source
tools; query does not create a snapshot automatically.

## Source route

Select the exact authorized local repository and use the host agent's existing
read/search tools. Qualify claims against current source paths and spans. Do not
clone remote source or scan a workspace from a Hub reference alone. AgentBase
provides no graph/indexing/symbol/call-path API.

## Combined route

A combined query is Agent orchestration, not joined storage:

```text
Hub concept + exact Hub commit
        ↓ identifies intent/relation/repository reference
authorized local source
        ↓ verifies current implementation
one answer with the two provenances kept separate
```

The Agent does not copy raw graph rows into the Hub or describe a source result
as Published knowledge. If the Hub and source differ, the response follows the
Part 10.04 conflict presentation; query does not Refresh or write back automatically.

## Failure and degradation

- Hub unavailable/unconfigured: a code question can still use the current local
  repository; a shared-knowledge question states that the Hub is unavailable.
- Source unavailable: return what the Hub knows and state that implementation
  is unverified; investigate only within the authorized source scope.
- Referenced repository not local/readable: return Hub knowledge/snapshot; do
  not clone, start a remote source workflow or guess at code.
- No source is sufficient: ask one short clarification about the Domain/repository
  or state what evidence is missing.

A read failure does not create a Question, proposal or Refresh automatically.
Those actions always use a separate reviewed workflow.

## Requirement mapping

- Reuses AB-QUERY-001 for Hub-versus-source priority.
- Reuses AB-QUERY-002..004 and AB-QUERY-012..013 for bounded exact-Published reads.
- Reuses AB-QUERY-006..009 for snapshot/current-source separation.
- Capability 041 implements this routing in `agentbase-query`; the current
  released MCP surface contains 36 tools. Visualization remains an explicit
  separate workflow and ordinary query does not generate an artifact.
