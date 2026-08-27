# Feature Specification: Hub Query Quality

**Feature Branch**: `049-hub-query-quality`

**Created**: 2026-08-26

**Status**: Implemented

**Input**: Improve Published Hub query as the primary knowledge-discovery
surface before continuing Domain-site presentation work. Treat OKF as a
structured Markdown knowledge base and reuse established document-retrieval
patterns rather than defining an AgentBase-specific search method.

## Owner Decisions

- Query quality is the first slice; circular Domain-site nodes, drawers and
  document overlays remain a later capability.
- OKF defines the corpus contract, not query infrastructure. Existing identity,
  `title`, `description`, `type`, `tags`, Markdown body/heading structure,
  links, canonical relationships and Flow steps remain the knowledge input.
- `description` is the OKF-standard summary used by indexes, snippets and
  previews. No duplicate persisted `summary`, aliases or search-only field is
  introduced without measured retrieval evidence.
- Public Hub query remains read-only and Published-only with search plus exact
  Markdown read, following the established search-then-lookup retrieval
  pattern. The slice adds no reasoning router, traversal tool, embedding,
  vector database, durable index or daemon.
- Lexical relevance uses an established local full-text implementation selected
  and version-bound in the implementation plan; it is not a new public query
  language or a hand-authored AgentBase scoring formula.
- The first query for an exact synchronized Published commit builds one bounded
  in-memory index lazily. Later queries in the same process may reuse it; a new
  commit invalidates it atomically and process restart rebuilds it on demand.
- Domain-scoped discovery includes canonical Domain members, concepts associated
  with a Repository in that Domain and directly related external boundary
  endpoints, without importing an unrelated Domain neighborhood.

## User Scenarios & Testing

### User Story 1 - Find the right concept with ordinary terms (Priority: P1)

As a maintainer asking about shared knowledge, I can use several ordinary terms
from a question and receive the most relevant Published concepts without knowing
their exact title or path.

**Why this priority**: Concept discovery is the entrypoint for every later exact
read or relation question; poor ranking makes the rest of Hub knowledge hard to
use.

**Independent Test**: A curated multi-term query set over one deterministic Hub
returns every expected concept in the top five while preserving exact identity,
path and title precedence.

**Acceptance Scenarios**:

1. **Given** terms distributed across a concept title, description, headings and body,
   **When** the user searches those terms, **Then** the concept is returned ahead
   of concepts matching fewer or lower-value terms.
2. **Given** an exact identity, path or title, **When** the user searches it,
   **Then** exact matching retains precedence over partial content matches.
3. **Given** a body-only match after substantial Markdown whitespace, **When**
   search returns the concept, **Then** it includes the matching heading path
   and a non-empty excerpt around the matched text.

---

### User Story 2 - Search the complete Domain context (Priority: P1)

As a maintainer investigating one Domain, I can discover concepts implemented
in its repositories even when canonical Domain membership is not expressed by a
direct `part-of` chain.

**Why this priority**: The current Crawler view and Domain-scoped query omit or
misclassify repository-associated Functions and Components, producing an
incomplete Domain answer.

**Independent Test**: A two-Domain fixture proves that one scoped query includes
canonical members, repository-associated concepts and direct boundary endpoints
while excluding the unrelated Domain neighborhood.

**Acceptance Scenarios**:

1. **Given** a Repository that is part of a Domain and a Function implemented in
   that Repository, **When** search is scoped to the Domain, **Then** the Function
   is eligible for matching and its repository association is visible.
2. **Given** an accepted relation to an external concept, **When** that endpoint
   matches the scoped query, **Then** the direct endpoint may be returned as a
   boundary result without expanding its Domain.
3. **Given** an unrelated Domain with similar terminology, **When** search is
   scoped, **Then** unrelated concepts are excluded.

---

### User Story 3 - Discover accepted relations without guessing documents (Priority: P2)

As a maintainer asking who consumes, provides, triggers, reads or writes a
concept, I can discover accepted direct relations from bounded search results
before choosing which exact documents to read.

**Why this priority**: Canonical relations already exist but current search
ignores their structured predicates and endpoints, forcing repeated speculative
reads.

**Independent Test**: Predicate-and-endpoint queries return the correct direct
inbound or outbound relation with direction and evidence, and return no invented
edge when accepted topology is absent.

**Acceptance Scenarios**:

1. **Given** an accepted directed relation, **When** query terms identify its
   predicate and endpoint, **Then** the related concept is discoverable with the
   stored direction and evidence identifiers.
2. **Given** an ordered Flow step, **When** query terms identify its participants
   or action, **Then** the relevant Flow is discoverable without converting the
   step into another predicate.
3. **Given** no accepted relation, **When** the user asks a relation-shaped query,
   **Then** search returns no invented topology and exact read remains available
   for manual investigation.

### Edge Cases

- Empty, whitespace-only, oversized and over-limit requests retain explicit
  validation failures.
- Punctuation, repeated terms and case differences do not make ranking
  nondeterministic.
- A term may occur in metadata, body and relation text for the same concept;
  one concept result is returned with bounded match evidence rather than
  duplicates.
- A concept may be associated with several repositories or Domains; scope
  evidence remains explicit and does not rewrite canonical relationships.
- Invalid or oversized Published documents retain current safe omission/failure
  behavior; query never substitutes Local Draft bytes.
- A high-degree concept returns bounded direct relations plus an omitted count,
  never an unbounded response.
- A failed index build for a new Published commit returns an explicit query
  failure and MUST NOT serve the previous commit's index as current knowledge.

## Requirements

### Functional Requirements

- **FR-001**: Search MUST evaluate multiple normalized query terms with an
  established deterministic full-text relevance model; AgentBase MUST NOT
  expose or maintain a new general-purpose query grammar or scoring formula.
- **FR-002**: Exact identity, exact path and exact title MUST retain precedence
  over partial metadata, relation and Markdown content matches.
- **FR-003**: Searchable content MUST be limited to existing identity, path,
  title, type, description, tags, Markdown heading/body text, portable links,
  accepted canonical relationships and recorded Flow steps; arbitrary
  frontmatter MUST NOT become implicit search authority.
- **FR-004**: Every content match that returns an excerpt MUST return bounded,
  readable text surrounding a real matched term and identify the matching
  Markdown heading path when one exists.
- **FR-005**: Exact Domain scope MUST include canonical members,
  repository-associated concepts and direct accepted boundary endpoints while
  excluding unrelated Domain neighborhoods.
- **FR-006**: Search results MUST distinguish canonical Domain membership,
  repository association and boundary inclusion without changing stored Hub
  relationships.
- **FR-007**: Relation-aware results MUST preserve accepted predicate,
  direction, endpoint and evidence identifiers and MUST expose bounded omission
  when a result has more direct relations than can be returned.
- **FR-008**: Ordered Flow steps MUST remain their own direction authority and
  MUST NOT be inferred or converted into canonical relationship predicates.
- **FR-009**: Search and exact read MUST continue to identify one exact
  synchronized Published commit and MUST NOT read Local Draft, working-tree or
  remote candidate bytes.
- **FR-010**: Public query MUST remain bounded search plus exact Markdown read;
  no new public query action, mutation, source probe or write-back is added.
- **FR-011**: The feature MUST add no persisted summary/search field, Hub
  migration, durable cache, graph store, embedding, vector database or daemon.
  Any local full-text dependency MUST be version-bound, reviewed and replace
  handwritten relevance logic rather than add a second knowledge authority.
- **FR-012**: Existing exact and single-term searches MUST remain compatible;
  additive result detail MUST not require callers to adopt a new query mode.
- **FR-013**: Any in-memory search index MUST be keyed to one exact Published
  commit, built lazily, reused only for that commit and replaced only after a
  complete successful rebuild; no stale index may answer for a newer commit.

### Key Entities

- **Query terms**: Normalized user terms and any exact phrase used to discover
  knowledge; they are request state only.
- **Markdown section**: One transient heading-aware part of a concept body used
  for retrieval evidence; it is not a persisted concept or knowledge authority.
- **Search match**: One Published concept summary, its deterministic relevance,
  best matching section, bounded match evidence and exact commit attribution.
- **Domain scope evidence**: Why a concept is eligible for one Domain query:
  canonical membership, repository association or direct boundary relation.
- **Direct relation match**: One accepted relation or Flow step relevant to a
  result, preserving stored endpoints, direction and evidence.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every expected concept in the curated multi-term qualification set
  appears within the first five results, and exact identity/path/title queries
  retain their current first result.
- **SC-002**: The two-Domain qualification returns 100% of expected
  repository-associated concepts and 0 unrelated-Domain concepts.
- **SC-003**: Every accepted relation and Flow-step qualification returns the
  correct stored direction and evidence; insufficient topology produces zero
  invented relations.
- **SC-004**: Every returned body excerpt is non-empty, bounded and contains at
  least one matched term.
- **SC-005**: At least 95% of a representative search set over 1,000 concepts
  completes within one second on the repository qualification environment while
  returning no more than the requested result and relation bounds.
- **SC-006**: Published-only, ambiguity, exact-read and Local-Draft isolation
  acceptance evidence remains unchanged and passes with the complete repository
  gate.
- **SC-007**: Qualification proves one build for repeated queries on the same
  commit, one rebuild after commit change, lazy rebuild after process restart
  and zero results attributed to a different commit than their index.

### Implementation Evidence

- Focused section, ranking, Domain, relation and Published-isolation tests pass.
- The deterministic 1,000-concept qualification achieved 100/100 top-five
  recall; build time was 845.539 ms and query p95 was 31.542 ms over 100 cases.
- Public bounds remained five results, eight direct contexts and 256 KiB per
  admitted document during qualification.

## Assumptions

- Published Hub Markdown remains the sole durable knowledge authority.
- Existing concept `description` quality may be improved by later
  Ingest/Refresh work, but this feature does not rewrite accepted knowledge.
- Query remains deterministic lexical and relationship-aware retrieval, not
  semantic inference. Managed or vector-backed semantic search requires a later
  evidence and authority decision.
- Domain-site interaction changes consume this query/scope design in a later
  capability and are not acceptance evidence for this feature; static-site
  engines such as Pagefind are evaluated there, not added here.
