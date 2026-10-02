# 08.00 — Baseline and impact

> Status: The repository snapshot-first runtime is implemented and verified offline.

## Outcome

The Hub retains a small number of observed values with file-level provenance for
immediate human and MCP reading. When the user needs a current value, the Agent
uses normal MCP source reading on an authorized repository; AgentBase does not
own a separate symbol/configuration resolver or live-value state machine.

## Current runtime

- `agentbase.observed_values` retains subject/property/role, a useful scalar,
  repository source and exact source state/time. Finalize generates the stable ID
  and owned Markdown table; the model/host does not hash IDs or record source
  state itself.
- A Repository evidence URI retains the canonical Repository ID, normalized
  relative path and optional exact line evidence.
- `read_hub_okf_concept` reads exact Published Markdown containing the snapshot
  and provenance; it does not bind or probe a repository.
- Refresh reconciles per item: omission preserves an item, the current Repository
  modifies only its contribution, foreign observations must remain unchanged and
  exact reviewed correction/removal owns deletion.
- A shared obvious-secret guard blocks authoring/publication/Hub CI. Exact
  Published Markdown reads do not create a separate field-level transformation layer.
- Host read/search tools already read authorized local source; no
  new resolver/cache/parser is needed.
- Repository observed-source metadata and Section 09 define exact age/revision
  warnings without using a threshold as truth.
- Section 06 defines provider observations; Section 07 defines Shared Questions.

## Completed clean cutover

The legacy `agentbase.live_claims` model carried a semantic target for the host to
resolve against current source. The runtime removed that contract and action,
with no dual read or dual write:

- the snapshot is the primary shared value;
- one file source may support multiple values;
- a line range is only an optional evidence hint;
- current-value lookup uses the host agent's ordinary source read/search when explicitly requested;
- a historical-integrity failure may propose a Shared Question; a moved current
  path only degrades lookup and does not run moved-symbol recovery.

No Published concept uses the old contract, so no migration layer is needed.

## Deferred capabilities

1. Remote repository file reads through an MCP-managed token are a post-MVP priority.
2. Provider profiles beyond the current bounded AWS/SQS Domain Enrichment.
3. Ordinary answer wording/markers for snapshot age belong to Part 10; the Hub CI
   freshness projection is implemented as warning-only.

## Impact checkpoint

| Boundary | Impact | Reason |
|---|---|---|
| Observed-value/file-source contract | Contained clean cutover | Removes semantic locator fields and reuses existing snapshot/source validation. |
| Snapshot query/freshness | Implemented foundation | Read exact Published bytes; CI derives age/revision separately. |
| Explicit local current-source read | Reuse | Existing graph/search/snippet tools; no live resolver. |
| Historical integrity + shared Question | Contained after Part 07 | Dedicated proposal; current-path move only degrades lookup. |
| Remote repository read | Broad change | MCP GitHub token, exact file authorization and degradation. |
| Sensitive-value filtering | Broad safety boundary | Shared guard across authoring/query/publication. |
| Provider observations | Broad but already scoped | Domain Enrichment only, reuse 06.04. |

Overall, this is a simplification: remove a concept/runtime responsibility rather
than add a subsystem. No symbol registry, source mirror, watcher, TTL scheduler
or background resolver is needed.

## Dependency boundaries

- Exact local source reading belongs to Section 01.
- Shared Question/conflict semantics belong to Section 07.
- Freshness and Domain Enrichment orchestration belong to Section 09.
- Snapshot/current-source response composition belongs to Section 10.
- GitHub/provider credentials belong to Sections 06 and 11.
