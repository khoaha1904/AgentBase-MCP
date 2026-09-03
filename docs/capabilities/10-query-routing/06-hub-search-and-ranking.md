# 10.06 — Hub Markdown retrieval

> Status: Implemented in capability 049; deterministic qualification passes.

## Outcome

`search_hub_okf` queries a structured Markdown knowledge base using a widely
adopted flow: scoped and bounded discovery returns the best section/snippet,
then `read_hub_okf_concept` hydrates the full document. OKF determines corpus
shape; MCP determines the tool contract; the full-text library determines lexical
relevance. AgentBase does not create a new query language or scoring algorithm.

## Upstream contracts reused

- OKF `description` is the official one-line summary for `index.md`, snippets and
  previews; `tags` provide cross-cutting categorization; structured Markdown
  supports Agent retrieval; `index.md` provides progressive disclosure.
- Google's local Markdown-KB sample uses `list → search content → read file`.
- Google Knowledge Catalog MCP uses bounded `search_entries`, followed by
  `lookup_context`/`lookup_entry` to retrieve rich content.
- MCP standardizes resources/tools and bounds, not document relevance.
- Markdown retrieval libraries preserve heading hierarchy when splitting sections.

Therefore, do not add `summary`, put the entire Hub into one MCP result or treat
a browser/static-site index as query authority.

## Public retrieval contract

The public surface still has only two knowledge primitives:

1. `search_hub_okf(query, domain?, types?, global?, limit?)` for discovery;
2. `read_hub_okf_concept(path)` for exact full Markdown.

Domain/type/global are existing typed MCP arguments. Capability 049 does not
parse mini-Lucene syntax from `query`; free text remains free text. Exact identity,
path or title is checked before lexical search because these are stable addresses,
not relevance weights.

Search returns basic concept information, the exact Published commit, the best
matching section/snippet and bounded context. The caller selects a result before
reading the full file.

## Transient search projection

One exact synchronized Published commit is projected in memory into two units:

### Concept record

- identity and Markdown path;
- title, type, description and tags;
- portable outbound Markdown-link targets;
- AgentBase accepted canonical relation/Flow context;
- Domain eligibility evidence.

### Section record

- parent concept identity;
- ordered heading path (`H1 > H2 > H3`);
- section text preserving enough original whitespace for excerpts;
- deterministic ordinal within the document.

The frontmatter boundary or body before the first heading may form the document
root section. Empty sections are omitted. Sections are request-local retrieval
records, not new OKF concepts, files or persistent chunks.

At the current scale, section boundaries follow Markdown headings only. Blind fixed
character/token chunks and overlap are deferred until an oversized-section
qualification demonstrates a recall or response-bound problem.

## Searchable authority

The allowlist is:

1. identity/path/title;
2. type, description and tags;
3. heading path and section body;
4. portable link target identity/title;
5. accepted AgentBase relation predicate/endpoint and Flow step fields.

Arbitrary YAML extensions, source URIs, evidence payloads and generated actor
metadata do not become general search text. They remain readable in the exact
document. No duplicate `summary`, alias list or search-only metadata is stored.

Portable OKF links are untyped upstream. AgentBase canonical predicates and
Flows are an explicit extension and never redefine portable link semantics.

## Established lexical relevance

The engine is version-bound `minisearch@7.2.0`, used as a transient
in-memory BM25+ index. It supplies multi-term scoring, field boosts and match
metadata instead of AgentBase maintaining a bespoke relevance ladder. The
first query for one exact Published commit builds the complete projection
lazily; later queries in the same process reuse it until the commit changes.

Initial configuration remains conservative:

- exact address/title pre-pass stays ahead of the index;
- title/description/heading fields may receive documented boosts;
- body and relation context remain searchable at ordinary weight;
- prefix, fuzzy matching, stemming and query-syntax passthrough are disabled;
- same Published input and normalized request produce stable ordering, with
  canonical path as the final tie-break.

Every boost/configuration value belongs to one checked-in qualification, not an
unexplained product rule. If the library result cannot satisfy the curated
qualification without extensive tuning, planning returns to owner review rather
than growing custom scoring code.

The owner approved the exact MIT-licensed dependency. It is pinned and adds no
transitive runtime dependency.

## Section result collapse and excerpts

The lexical engine may return several section records for one concept. Query
collapses them to one concept result using its highest-scoring section. Match
detail includes:

- matched fields/terms reported by the engine;
- heading path and section ordinal;
- bounded excerpt cut from the original section around a real matched term;
- an omitted-section count when more sections matched.

This fixes the current whitespace-offset bug and prevents a large document from
occupying several top result slots. Full section/body content remains behind
exact read.

## Domain scope and relationship context

Canonical Domain membership remains derived only from accepted `part-of` and
is never rewritten by query. Scoped eligibility carries one explicit reason:

- `member`: canonical membership reaches the selected Domain;
- `repository-associated`: accepted structural association reaches a Repository
  whose canonical membership reaches the Domain;
- `boundary`: one direct accepted relation/Flow step connects an eligible
  concept to this external endpoint.

Structural Repository association follows only accepted `part-of`,
`implemented-in` and `declared-by` direction toward a Repository. Boundary
expansion stops after one endpoint and never imports its Domain neighborhood.

Portable links, backlinks and accepted direct relations enrich the selected
result after lexical retrieval. They do not recursively expand the candidate
set or invent relation types. Returned relation context preserves stored
direction/evidence and has an omitted count.

## Bounds and failure

- Existing query/type/result/document bounds remain.
- Section count/bytes per document and relation detail per result are explicit.
- Invalid Published concepts fail the affected search/read operation with a
  bounded error; oversized documents may be omitted only under the existing
  document bound and remain observable as omission metadata. Local Draft and
  remote candidate bytes are never fallback.
- Index state is keyed to one exact Published commit and exists only in process
  memory. A changed commit builds a complete replacement before atomic swap;
  build failure returns an error rather than serving the old commit. Restart
  rebuilds lazily. There is no durable cache, migration, watcher, daemon or
  second source of truth.
- Search performs no source/provider probe, mutation, Refresh, Question or
  write-back.

## Semantic and static-site escalation

Google Knowledge Catalog demonstrates semantic + keyword + structured-predicate
search at managed-catalog scale. AgentBase does not adopt it by default because
mandatory query must remain local and credential-free. A semantic provider is a
later measured escalation, not a hidden fallback.

Pagefind is the preferred library to evaluate for the later static Domain Hub
because it builds chunked browser indexes and accepts custom content records.
That decision belongs to the site capability. Browser search artifacts never
become MCP query authority.

## Verification

Focused tests cover exact precedence, standard multi-term relevance, tags,
heading-aware section collapse, excerpt correctness, type/Domain/global scope
and deterministic tie-breaking. Two-Domain fixtures cover Repository association
and direct boundary stopping. Relation fixtures cover portable links,
inbound/outbound accepted edges, Flow direction and insufficient topology.

A deterministic 1,000-concept qualification records top-five recall, latency,
result bounds and index construction cost. Semantic search, fuzzy matching or a
durable index require new evidence after this baseline.

The capability-049 qualification on 2026-08-26 indexed 1,000 concepts in
845.539 ms, achieved 100/100 top-five recall, and measured 31.542 ms p95 across
100 public searches with five-result/eight-context bounds.

## Requirement mapping

- Amends `AB-QUERY-002..004` for standard lexical discovery and section evidence.
- Adds `AB-QUERY-014..016` for scoped context, excerpts and qualification.
- Preserves `AB-QUERY-009..013` Published/read-only/public-surface boundaries.
