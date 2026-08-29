# 10.07 — Runtime requirements

> Status: AB-QUERY-001..016 implemented and covered by capability 049 evidence;
> AB-QUERY-017..018 are the approved Capability 051 hardening additions.

- **AB-QUERY-001** — Code questions primarily use Code Graph; business/system/
  cross-repository questions primarily use local Hub; combined answers retain
  both source kinds and limitations.
- **AB-QUERY-002** — Published-Hub search supports exact Domain and type scopes,
  deterministic multi-term full-text relevance over the approved searchable
  surface and heading-aware sections, using an established version-bound local
  engine rather than a public custom query grammar or handwritten scorer, and
  Domain clarification instead of concept bodies when an unscoped broad query
  spans several Domains. Exact identity/path/title precedence and explicit
  bounded global search remain available.
- **AB-QUERY-003** — Search may use portable OKF links plus accepted AgentBase
  canonical relation predicates, endpoints and Flow steps. Selected results may
  return bounded link/backlink/direct-relation context with direction, evidence
  and omitted count. It never invents topology, types a portable link or
  converts Flow steps into another predicate. Full navigation remains repeated
  bounded search/read; MCP exposes no dedicated traversal action.
- **AB-QUERY-004** — Search and read identify exact admitted `remoteBase` and
  return bounded summaries or one exact Markdown document. They never read
  Local Draft, working-tree bytes or remote state and create no durable index,
  cache, graph database or second knowledge source. One complete in-memory
  search projection may be reused only for its exact commit; changed commits
  rebuild lazily and replace it atomically, never by stale fallback.
- **AB-QUERY-005** — Root navigation links bounded Domain and fallback System/
  Repository entrypoints. Domain concepts navigate Systems and critical flows;
  System concepts navigate useful entities without copying their knowledge.
- **AB-QUERY-006** — Exact Published concept Markdown includes bounded
  `agentbase.observed_values` with value, role, source resource and observed
  source state/time. Ordinary query performs no credential/access probe.
  Repository current-source reading may return `available`, `unavailable` or
  `unauthorized`; provider observations require a new Domain Enrichment and are
  never live-read by query. It labels every value observed and never emits an
  automatic winner.
- **AB-QUERY-007** — An explicit current-value question may use ordinary
  authorized MCP graph/search/snippet reads from the referenced source file.
  There is no dedicated live resolver, semantic target registry or automatic
  write-back; unclear current source returns ambiguity/unavailable.
- **AB-QUERY-008** — Without source access, query returns the observed snapshot
  with provenance and degradation. Historical-integrity failure preserves the
  value and may create a shared Question through a reviewed proposal;
  current-path-unavailable, age, source advance, permission loss or temporary
  unavailability alone never changes knowledge state.
- **AB-QUERY-009** — Snapshot metadata is read through
  `read_hub_okf_concept`; the former dedicated observed/live-value actions are
  removed. Query performs no repository/provider access, credential probe,
  indexing or write-back.
- **AB-QUERY-010** — Authoring, publication validation and Hub CI reject obvious
  sensitive content before it becomes Published. Exact concept read performs no
  field-level rewrite; known secret-bearing paths are not used for explicit
  current-value lookup.
- **AB-QUERY-011** — The bounded Repository freshness projection remains an
  internal Hub CI/reporting primitive. Ordinary MCP and Hub CLI query expose no
  dedicated freshness action and perform no source/provider/network probe,
  threshold, Question, Refresh or write.
- **AB-QUERY-012** — An active remote profile's public Hub search/read uses only
  exact synchronized `remoteBase`. No-profile access fails clearly because no
  Published authority exists; accepted Local Draft never becomes queryable
  before publication and synchronization.
- **AB-QUERY-013** — Public Hub query has two primitives: bounded search and
  exact Markdown read. Relationships, snapshots, provenance and Published
  Questions are read from those documents; Question governance actions remain
  separate and unchanged.
- **AB-QUERY-014** — Exact Domain scope distinguishes canonical `part-of`
  membership, bounded structural association to a Repository in the Domain and
  one directly connected external boundary endpoint. Query never rewrites
  stored membership or traverses the external Domain neighborhood.
- **AB-QUERY-015** — One search result represents one concept with the best
  matching transient Markdown section and bounded match evidence. Any returned
  body excerpt is cut from original section text, identifies its heading path,
  surrounds a real term and is non-empty; repeated section hits collapse with
  an omitted count, and a high-degree result exposes relation omissions.
- **AB-QUERY-016** — Query qualification covers exact/single-term compatibility,
  established lexical multi-term ranking, tags and heading-aware section
  collapse, two-Domain scope, portable links, accepted relation/Flow direction,
  insufficient topology, exact Published isolation and a deterministic
  1,000-concept latency/bounds benchmark. It adds no persisted search metadata,
  Hub migration or background lifecycle; any full-text dependency is exact,
  reviewed and replaces custom relevance logic.

- **AB-QUERY-017** — Query MUST NOT present an incomplete Published graph as a
  complete result. Invalid Published concept Markdown MUST fail the affected
  search/read operation with a bounded error; oversized documents MAY be omitted
  only under the existing document bound and MUST remain observable as an
  omission/limitation. Local Draft or remote candidate bytes are never fallback.
- **AB-QUERY-018** — Query failure/omission behavior MUST remain deterministic for
  one exact Published commit. No new query language, durable index, semantic
  fallback, or public traversal tool is introduced by this hardening.
- **AB-QUERY-019** — Search indexes provider/product/resource-type metadata from
  standalone concepts when present, while embedded resource text remains
  searchable through its parent. Promoted Resource concepts return as independent
  results with their accepted relation context; embedded rows never become
  synthetic search identities.
- **AB-QUERY-020** — Crawler qualification proves a source-backed SQS Resource
  is independently discoverable by lexical search and retains bounded directed
  producer/consumer relation context; a mock provider ARN is never required for
  query eligibility and never enters the Published search corpus.
