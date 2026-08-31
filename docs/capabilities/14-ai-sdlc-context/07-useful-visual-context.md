# 14.07 — Decision-useful visual context

> Status: Portfolio and data-readiness decision accepted. The Published Phase 1
> path can be qualified now; the Phase 2 Code Graph diagram packet is deferred.

## Admission rule

A diagram passes only when it makes a named AIT decision easier and keeps every
material claim traceable to the authority allowed in that phase. Visual polish,
node count and coverage of every available concept cannot compensate for an
irrelevant or unsupported diagram.

## Phase 1 — Feature Discovery

### P0: Discovery Impact Map

**Decision:** identify the accepted current-system surface affected by a
Feature, the important relations across that surface and the Questions that
must shape discovery.

**Required content:** a query-focused subset of Domain, System, component,
Interface, Resource and Repository concepts; structural/runtime relations;
Question badges; exact Published commit; explicit omissions. The Feature is
title/focus metadata and never becomes a persisted Hub node.

**Current readiness: projection correction in progress.** The Published Crawler
knowledge contains queue, worker, storage and failure evidence, but the prior
projection hid embedded storage/failure rows and produced an overly abstract
Domain → Repository → Function → Queue map. Evidence-backed embedded resource
references are the minimum correction; they keep the Hub compact while making
storage and failure dependencies visible as presentation-only context.

**Minimum improvement:** select the focused concept set from the Discovery
question/Feature rather than treating a manually chosen diagram as proof of
relevance. Enriching the queue's provider identity improves confidence but is
not required to make the current map useful.

### P1, conditional: Existing Flow

**Decision:** explain the accepted current journey only when the proposed
Feature changes that journey.

**Current readiness: partially ready.** Accepted `flow_steps` can produce the
existing Sequence packet. Crawler's queue path is represented through
component/resource relations rather than one accepted Flow, so the P0 impact
map remains the useful view today. A new Flow should be collected only if the
journey itself is important to a concrete Feature; it is not required merely to
increase diagram coverage.

## Phase 2 — developer Task Planning

### P0: Implementation Impact Map

**Decision:** identify exact implementation boundaries and evidence-backed
dependency order across files, symbols and nearby tests before drafting Tasks.

**Required content:** pinned repository revision; files and symbols; call,
import or dependency paths; relevant configuration/deployment boundaries;
consumer compatibility; test/verification neighbors; coverage and trace
limitations. Hub concepts may focus the query but cannot prove an exact source
edge.

**Current readiness: data available, diagram path not ready.** Existing Code
Graph tools can retrieve architecture, search, traces and snippets. The current
visualization pipeline accepts only Published Hub projections, so AgentBase has
no truthful Code Graph → bounded diagram packet for exact file/symbol evidence.

**Minimum improvement:** add one on-demand, disposable projection over the
retained Code Graph query result. It must normalize only the selected
file/symbol nodes and exact edges, attach repository revision plus path/symbol
provenance, include nearby tests, and expose incomplete coverage. It must not
add a durable store, generic graph UI or Hub schema.

### P1, conditional: Exact trace/flow lens

**Decision:** expose request, runtime or delivery order when that order changes
how Tasks and verification must be split.

**Current readiness: retrieval partially available, diagram path not ready.**
`trace_path` and source snippets can provide exact evidence, but the result is
not normalized into a visual packet. Implement this only as a lens of the P0
Implementation Impact Map after the P0 packet proves useful.

## Excluded standalone diagrams

- A generic Dependency diagram duplicates edges already present in the impact
  maps and has no independent AIT decision.
- A Task dependency DAG belongs to the external planning workflow after Tasks
  exist; AgentBase does not own it.
- Organization, infrastructure inventory and complete-Domain maps are excluded
  unless a later concrete AIT scenario demonstrates a decision they improve.

## Requirements

- **AB-CONTEXT-VIS-001** — Phase 1 P0 is one query-focused Discovery Impact Map
  over the exact synchronized Published commit; it names affected areas,
  relations, important Questions, omissions and evidence revision.
- **AB-CONTEXT-VIS-002** — Phase 1 never reads source/Code Graph or persists the
  Feature as Hub knowledge to complete a diagram.
- **AB-CONTEXT-VIS-003** — Phase 1 Existing Flow is P1 and produced only when a
  Feature changes an accepted journey and the view adds discovery value.
- **AB-CONTEXT-VIS-004** — Phase 1 qualification fails when the map is visually
  correct but does not improve the fixed discovery decision, hides a material
  Question or includes an unsupported relation.
- **AB-CONTEXT-VIS-005** — Phase 2 P0 is one Implementation Impact Map over an
  authorized pinned repository revision, with exact file/symbol/dependency and
  test evidence plus explicit coverage limitations.
- **AB-CONTEXT-VIS-006** — Hub context may select Phase 2 scope but cannot prove
  exact implementation edges; untraceable Code Graph/source claims are omitted
  or marked unknown.
- **AB-CONTEXT-VIS-007** — The Phase 2 projection is on-demand, bounded,
  disposable and session-local; it adds no Hub schema, durable graph artifact,
  watcher, generic Graph UI or prepared context store.
- **AB-CONTEXT-VIS-008** — Phase 2 trace/flow is P1 and conditional. Dependency
  is a lens of an admitted map, and AgentBase does not own a Task DAG.
- **AB-CONTEXT-VIS-009** — A Phase 1 map may expand an exactly sourced embedded
  resource as visibly presentation-only context without promoting it, inferring
  a canonical runtime relation or merging a name-only match. Evidence remains
  available from its Published parent.

## Qualification order

1. Qualify the Phase 1 P0 map against the current Crawler Feature Discovery
   scenario and owner review criteria.
2. Do not collect more Hub data unless the map exposes a decision-critical gap.
3. Design and qualify the Phase 2 Code Graph packet against the existing ECS
   health Task Planning scenario.
4. Add a conditional Flow lens only after a fixed scenario shows that ordering
   information improves the phase result.
