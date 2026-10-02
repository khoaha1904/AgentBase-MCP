# 10.07 — Capability requirements

> Status: AB-QUERY-001..020 implemented; AB-QUERY-021 is the owner-approved
> unified explicit-use routing boundary. Profile Domain projection requirements are
> owned by [10.08](08-profile-domain-projection-requirements.md). G5-C1 compact
> requirements are implemented and verified; G5-C2
> draft-quality probes are deferred and add no current query behavior.

These `AB-QUERY-*` requirements are the normative Query Routing Capability
Contract.

- **AB-QUERY-001** — Code questions primarily use the host's source read/search tools; business/system/
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
- **AB-QUERY-005** — Root navigation links bounded compact Domain and fallback
  Repository entrypoints. A Domain `index.md` links its Repository dossiers,
  independently useful `knowledge/` and Questions directly. Query determines
  semantic role from frontmatter and relations without copying knowledge or
  relying on a type-shaped directory.
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
  threshold, Question, Refresh or write. Public Published search/read instead
  carry the additive warning-only envelope defined by `AB-FRESH-001..012`.
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
- **AB-QUERY-021** — `agentbase-query` activates only when the user explicitly
  names that skill, or its installed `agentbase-context` compatibility entry,
  for a read-only answer or contribution to an active primary workflow. An
  ordinary request to inspect, explain, research or modify a repository MUST
  NOT select it. The primary workflow retains its deliverable and approvals;
  no second invocation is required to contribute context.

## Group 8 unified-use delivery

G8-C1 owns installed skill routing, not a new runtime router. `agentbase-query`
is the canonical entry; `agentbase-context` is a shipped compatibility wrapper
linking to its exact installed instructions. Both remain explicit-only. The
installer/release keep ten public entry names (one is compatibility-only), three
internal skills and the existing 44 MCP tools. No retrieval, schema, authority or
permission API changes are required.

- **AB-USE-001** — Both installed entries MUST resolve the same read guidance
  for Codex and Claude Code. Standalone use returns an answer; an active host
  workflow receives only relevant evidence without duplicate output or ownership
  takeover. Missing intent asks one clarification before retrieval. Invoking
  both names MUST NOT cause two retrieval passes.
- **AB-USE-002** — Start with a bounded Published search (`limit <= 5`), scoped
  to the supplied canonical Domain or explicitly global. Stop when sufficient;
  exact concept reads or another targeted search require a concrete evidence
  need. Feature/business context stays snapshot-only. Current implementation
  questions MAY reuse source only in the user's authorized local
  repository; a Hub reference never authorizes cloning or workspace scanning.
  Missing source returns the supported answer and a visible unverified boundary.
  Preserve Published provenance, freshness, omissions and host tool authority.
- **AB-USE-003** — Use remains read-only until an explicitly approved handoff.
  Missing/incorrect knowledge alone MUST NOT
  trigger preparation, a Question backlog, provider lookup, Sync or Publish.
  The scoped repair handoff requires the G8-C2 authorization below.
  No query-history or persistent context store is introduced.

Verification combines installed-link/packaging tests, existing Published
search/read and degradation tests, and manual instruction scenario review
(standalone, host-owned output, both names, absent source, unrelated request).
Static skill/package tests do not claim real-model behavioral qualification.

## Group 8 scoped repair handoff

G8-C2 reuses installed Ingest, Refresh, Domain Enrichment and exact-revision
Question authoring. The conversation carries scope/evidence, not a new tool
input, persistent task, queue or authorization token. No source permission or
Publish admission is weakened. Skill instructions enforce conversational
consent; existing runtime admission validates source/content, not natural-language
agreement. No new server-side consent ledger is claimed.

- **AB-USE-004** — A repair offer MUST name the exact known subject/Hub,
  missing or contradicted claim, available Published/source evidence and needed
  repository/provider scope. A search miss alone is not proof of missing data.
  Decline, cancellation or ambiguity MUST NOT start preparation. An accepted
  concrete offer may enter its named authoring instructions without another
  exact skill invocation, but no unrelated lifecycle action is authorized.
- **AB-USE-005** — Authoring MUST revalidate the selected Hub, Repository/source
  identity and revision before using carried evidence. Missing source returns
  the supported answer and blocker, not a clone or invented correction. A changed
  target or broader required scope needs renewed agreement. Refresh reuses Delta
  for changed-source work and explicit bounded Coverage for unchanged omissions;
  its accounting and campaign bounds remain unchanged. Unknown Repository
  identity requires Ingest/home confirmation, not duplicate Refresh. Provider
  access and human Question answers retain their own confirmations.
- **AB-USE-006** — Preparation ends at the existing validated proposal preview,
  showing how the specific gap was addressed or remains unresolved. Publish
  requires a subsequent exact proposal/digest/mode confirmation. Cancellation
  after preparation preserves private work, with no deletion or sharing. Query
  still reads Published before Publish and can read the correction afterward.

Verification: installed handoff links resolve for both clients; existing
Ingest/Refresh integration verifies a concrete correction stays absent from
Published reads and remote Git until a separate Publish call, then becomes
readable. Manual skill review covers decline, ambiguity, missing source,
cancellation, scope changes and no inherited Publish. These are instruction
and runtime-boundary checks, not real-model consent/routing qualification.

G8-C2 is implemented and verified: all five changed skills pass validation;
installed links resolve for both clients, the correction-isolation integration
passes, and `npm run verify` passes with 244/244 tests. No real Hub was modified
and no model campaign was run. Group 8 is closed for the current scope.

G8-C1 is implemented and verified: both skill validators, installed-link tests
for both clients, contract checks and `npm run verify` pass (244/244 tests).
Manual instruction review covers standalone output, host ownership, duplicate
invocation, absent source and unrelated requests. This is not a real-model
forward-test or proof of autonomous routing reliability.
