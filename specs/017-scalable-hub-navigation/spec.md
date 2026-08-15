# Feature Specification: Scalable Hub Navigation

**Feature Branch**: `main`

**Created**: 2026-08-15

**Status**: Approved

**Input**: Make AgentBase-Hub sufficient as the durable knowledge source for
domain-scoped retrieval, cross-repository business-flow navigation and bounded
re-ingest without loading or validating the whole Hub in an agent context.

## Owner Decisions

- AgentBase-Hub remains the only durable knowledge store. No embeddings, vector
  database, daemon, background indexer or second knowledge database is added.
- Markdown indexes, canonical concepts and evidence-backed relationships are
  the portable navigation model. MCP may parse accepted Markdown transiently
  inside one request but MUST NOT persist a second canonical graph.
- A broad retrieval question is normally scoped to a Domain. If matching
  knowledge spans several domains and no scope is supplied, AgentBase asks for
  clarification instead of scanning or presenting the whole Hub as one answer.
- Exact concept, resource or repository identity is sufficient scope by itself.
  An explicitly requested global search remains possible and visibly broad.
- Relationships are stored once in one canonical direction. Reverse navigation
  is derived by MCP and MUST NOT be persisted as a duplicate inverse edge.
- Every new AgentBase relationship used for navigation carries source evidence.
  Missing or contradictory evidence stays unresolved rather than being guessed.
- Lambda, Server and other technologies do not determine document granularity.
  A concept is split when it has an independently useful contract, trigger,
  lifecycle, ownership, failure, operational or graph boundary.
- Re-ingest reads the source repository's prior contributions, their canonical
  subject and a bounded relevant neighborhood. It does not send the full Hub to
  the authoring agent or whole-bundle validation tool.
- Governed question persistence and `/abs-questions` remain a later capability.
  This capability preserves conflicts as explicit limitations but adds no
  question ledger.

## User Scenarios & Testing

### User Story 1 - Navigate one domain without loading the Hub (Priority: P1)

As an agent investigating a business or operational question, I want to scope
search to one domain and traverse a bounded relationship neighborhood so that I
can find relevant concepts without receiving unrelated Hub knowledge.

**Independent Test**: In a Hub with several domains and duplicate generic
terms, a scoped query returns only the selected domain, an unscoped ambiguous
query requests clarification, and traversal returns exact accepted paths and
evidence at a bounded depth.

### User Story 2 - Author a machine-navigable cross-repository graph (Priority: P1)

As an OKF authoring agent, I want one canonical relationship vocabulary with
edge evidence and ordered business-flow steps so that humans and MCP derive the
same producer, consumer and impact paths.

**Independent Test**: Validate a flow spanning components, an API, a queue and
a table from several repository sources; canonical edges pass, inverse or
unsupported AgentBase-authored predicates fail, and foreign unknown OKF
predicates remain readable as unjudged extensions.

### User Story 3 - Re-ingest one repository with bounded continuity (Priority: P1)

As a maintainer refreshing one repository, I want the authoring session to name
only prior contributions and relevant canonical neighbors so that the agent
updates shared knowledge without reading or resending the entire Hub.

**Independent Test**: Prepare a refresh in a Hub larger than the per-call
authoring bound and verify the continuity manifest contains the current source,
subject and immediate neighbors, validation accepts only changed concepts plus
target summaries, and unrelated accepted content remains protected.

### User Story 4 - Review a scalable Markdown layout (Priority: P2)

As a Hub maintainer, I want root, domain and system navigation to disclose
knowledge progressively so that a Hub containing many teams and domains stays
readable without making Repository, System and Domain duplicate knowledge trees.

**Independent Test**: A generated multi-domain Hub root links only navigation
entrypoints; Domain pages link systems and critical flows; System pages link
their useful nodes; every entity still has one canonical concept path.

## Requirements

- **AB-SCHEMA-019**: The active catalog MUST define one canonical persisted
  direction for `part-of`, `provides`, `consumes`, `depends-on`, `triggered-by`,
  `publishes-to`, `reads-from`, `writes-to`, `implemented-in`, `declared-by`
  and `deployed-as`. Newly authored known AgentBase schemas MUST reject other
  predicates while legacy or foreign extensions remain readable and unjudged.
- **AB-SCHEMA-020**: Every newly authored canonical relationship MUST reference
  one or more stable `sources[].id` values. Business Flow concepts MUST provide
  ordered source, action, target, mode and evidence for each structured step.
- **AB-SCHEMA-021**: Authoring validation MUST accept a bounded changed concept
  set plus bounded target summaries. Its validity MUST NOT depend on the total
  number of accepted Hub concepts, while every individual call retains byte and
  item bounds.
- **AB-QUERY-002**: Hub search MUST support an optional exact Domain scope and
  type filter, rank deterministic exact metadata matches ahead of body matches,
  and return a scope-required result when unscoped matches span domains.
- **AB-QUERY-003**: Hub query MUST traverse accepted canonical relationships in
  outbound, inbound or both directions with explicit kind, depth and result
  bounds. Derived inbound traversal MUST NOT require a stored inverse edge.
- **AB-QUERY-004**: Query results MUST identify the exact accepted Hub commit,
  concept path and type and MUST return only bounded summaries or exact requested
  content. Internal Markdown parsing MUST NOT create durable shared state.
- **AB-LOCAL-HUB-014**: Prepare MUST return a bounded continuity manifest made
  from the exact accepted base: current-source concepts, logical subject,
  immediate canonical neighbors and required navigation paths. Full Hub content
  MUST remain local lifecycle state rather than returned authoring context.
- **AB-SCHEMA-022**: Authoring guidance MUST distinguish architecture nodes from
  useful knowledge units. A Lambda or worker with independent trigger,
  permission, retry, failure, deployment, owner or flow role is separate; an
  implementation-only handler stays in its parent. A Server MAY link smaller
  capability concepts instead of growing one unbounded document.
- **AB-QUERY-005**: Root navigation MUST remain bounded to Domain and canonical
  entrypoint indexes. Domain concepts MUST navigate to Systems and critical
  Business Flows; System concepts MUST navigate to relevant components,
  interfaces, flows, resources and infrastructure without copying them.
- **AB-BENCH-039**: Offline qualification MUST cover ten domains and at least
  one thousand concepts, proving scoped search,
  clarification, exact traversal, collision-safe identity and changed-set
  validation without a full-Hub prompt payload.
- **AB-BENCH-040**: A sequential multi-repository qualification MUST prove that
  cross-repository flow evidence is retained, re-ingest continuity is bounded,
  missing evidence is not guessed and primary quality is retrieval correctness,
  provenance and honest uncertainty rather than token count.

## Success Criteria

- **SC-001**: A Hub with ten domains and at least one thousand concepts can be
  queried and incrementally validated without any agent call containing every
  accepted concept.
- **SC-002**: An unscoped term matching at least two domains returns those
  domains as clarification candidates and no concept bodies.
- **SC-003**: A scoped search returns no unrelated-domain match unless the
  result is an explicit cross-domain neighbor reached by traversal.
- **SC-004**: Bounded traversal returns correct direction, kind, evidence IDs,
  path and commit for every emitted edge and stops at configured limits.
- **SC-005**: New AgentBase concepts have no unjudged relationship predicate;
  historical unknown predicates still round-trip without rewrite.
- **SC-006**: A refresh manifest remains bounded when unrelated Hub concepts
  are multiplied and retains every foreign evidence source on accepted shared
  concepts.
- **SC-007**: Root navigation size grows with domains and entrypoints rather
  than with every Lambda, resource or repository in the Hub.
- **SC-008**: The rebuilt Shopping Cart bundle exposes its System, useful
  components, interfaces, business flows and operational resources through
  progressive navigation, canonical evidenced edges and explicit evidence
  conflicts without creating question concepts.

## Edge Cases

- A Hub without evidenced Domain concepts can navigate from root System and
  Repository indexes without inventing a Domain.
- A concept may be connected to more than one Domain or System. Domain search
  includes it when a canonical relationship reaches the requested Domain.
- Same-name concepts in different systems retain collision-safe canonical paths
  and produce separate scoped matches.
- An exact concept path can be read or traversed without a Domain parameter.
- Unknown third-party concept types and predicates remain portable but are not
  silently promoted into canonical AgentBase navigation edges.
- A changed concept may target unchanged concepts outside the continuity
  neighborhood when their exact summaries are explicitly supplied.
- Broad global search is explicit and bounded; absence of scope is not treated
  as permission to load all matching documents into model context.

## Explicit Non-Goals

- Embeddings, vector databases, semantic RAG infrastructure or background
  indexing processes.
- A durable cache or raw graph database committed to AgentBase-Hub.
- Question ledger persistence, question resolution or `/abs-questions`.
- Automatic local checkout discovery for every repository identity.
- Migrating arbitrary human or third-party Hub content.
- A fixed maximum number of Hub concepts or domains.
