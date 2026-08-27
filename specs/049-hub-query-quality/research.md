# Phase 0 Research: Hub Query Quality

**Date**: 2026-08-26

## Decision summary

Treat the Hub as a structured Markdown knowledge base, not as a new search
format. Reuse three established patterns:

1. OKF progressive disclosure and recommended metadata for corpus discovery.
2. Search-then-lookup as the MCP/agent retrieval contract.
3. Established full-text relevance and Markdown-heading sections for local
   content retrieval.

Capability 049 will not define a new query language or a hand-tuned scoring
formula. It will keep the existing structured MCP arguments, use an exact
identity lookup before an established lexical scorer, and return the best
matching Markdown section as bounded evidence before exact document read. One
in-memory index is built lazily and reused only while its exact Published commit
remains current.

## Primary-source findings

### OKF defines the corpus, not the query engine

The [OKF v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
explicitly lists storage, serving and query infrastructure as non-goals. It
does define the discovery inputs a consumer can rely on:

- `type` is required;
- `title`, `description`, `resource` and `tags` are recommended;
- `description` is the one-sentence summary intended for generated indexes,
  search snippets and previews;
- structured Markdown headings aid agent retrieval;
- `index.md` provides progressive disclosure;
- Markdown links form directed, untyped graph edges for portable OKF
  consumers.

Decision: do not add a second `summary` field. Index `description` and existing
content. AgentBase typed relationships and Flows remain an explicitly local OKF
extension; portable Markdown links remain the baseline.

The official [OKF README](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md)
also names static file readers, LLM context loading, search indexes and graph
viewers as equally valid consumers. The bundled viewer searches title, concept
ID and tags, renders the complete Markdown body and derives backlinks from
links. It is a proof of concept, not a required search implementation.

### Google's local Markdown-KB sample uses list, search, read

The official enrichment sample's
[`kb-search` skill](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/samples/enrichment/sample/config/skills/kb-search/SKILL.md)
exposes three operations:

- list the Markdown directory hierarchy;
- regex-search Markdown content and return file, line and snippet;
- read the complete selected file.

Its
[`fileskb` MCP implementation](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/samples/enrichment/src/tools/fileskb/main.py)
is deliberately simple and scans `.md` files. This confirms that body content
is intended to be searchable and that discovery should precede full-document
hydration. It does not provide relevance ranking, metadata filters or a durable
index, so it is a baseline rather than the final AgentBase implementation.

### Google Knowledge Catalog separates discovery from rich lookup

Google Cloud's [Knowledge Catalog search model](https://docs.cloud.google.com/dataplex/docs/about-search)
distinguishes targeted lookup, broad discovery and scoped programmatic
retrieval. It combines free text with explicit structured predicates and keeps
results bounded because search is optimized for discovery rather than complete
enumeration.

The official Knowledge Catalog MCP server exposes
[`search_entries`](https://docs.cloud.google.com/dataplex/docs/reference/mcp/tools_list/search_entries)
for bounded basic results, followed by `lookup_context` or `lookup_entry` for
rich content. Its agent guidance recommends specific filters and small page
sizes during exploration.

Decision: retain `search_hub_okf` followed by `read_hub_okf_concept`. Keep
Domain, type and result bounds as typed MCP arguments instead of introducing a
new text query grammar. Search result summaries may add section and relation
evidence, but full Markdown remains an explicit second read.

Google Cloud can ingest OKF and offers semantic, keyword and predicate search,
but that managed service requires cloud identity, permissions and a remote
catalog. It is a valid future provider profile, not the local-first mandatory
runtime for AgentBase.

### MCP transports retrieval but does not standardize search relevance

The [MCP resources specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
standardizes listing and reading URI-addressed resources and explicitly leaves
search/filter UI behavior to applications. The
[MCP tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
supports model-controlled query tools and structured or resource-linked
results, but defines no universal document search algorithm.

Decision: MCP is the public contract boundary, not the ranking engine. A search
tool plus exact Markdown resource read follows MCP correctly; adding a custom
MCP traversal primitive is unnecessary for this slice.

### Markdown knowledge retrieval benefits from section-aware units

The official
[LangChain Markdown splitter](https://docs.langchain.com/oss/python/integrations/splitters/markdown_header_metadata_splitter)
groups content by heading hierarchy and retains headings as chunk metadata.
The pattern avoids blind fixed-character chunks and preserves the section that
made a result relevant.

Decision: parse transient Markdown sections by heading for match evidence and
excerpt selection. Search still returns one result per concept, with only the
best section, so sections do not become new Hub concepts or durable files.
Fixed-size splitting is deferred unless real oversized sections require it.

### Reuse a local full-text scorer instead of inventing weights

[MiniSearch](https://github.com/lucaong/minisearch) is an MIT-licensed,
dependency-free in-memory JavaScript full-text engine for Node and browsers. It
provides BM25+ scoring, multi-field indexing, field boosts, exact/prefix/fuzzy
matching, term match metadata and deterministic filters. Version 7.2.0 is the
current evaluated release.

Alternatives considered:

- [Lunr](https://lunrjs.com/guides/searching.html) also provides BM25 and field
  boosts, but its current package is older and its default query syntax would
  create a larger public grammar surface.
- [FlexSearch](https://github.com/nextapps-de/flexsearch) is optimized for speed
  and flexible tokenization, but is a larger and more configurable dependency
  than this 1,000-concept local corpus needs.
- handwritten substring/coverage scoring preserves zero dependencies but is
  exactly the new ranking design this research is intended to avoid.

Decision: propose MiniSearch 7.2.0 as one reviewed production dependency for
the transient lexical index. Exact identity/path/title lookup remains an
AgentBase pre-pass because those values are stable addresses, not relevance
signals. Prefix and fuzzy search remain disabled until qualification proves
they improve recall without unacceptable false positives.

This dependency is not installed during planning. Repository constitution
requires owner-visible approval before implementation.

### Static Domain Hub search is a separate delivery concern

[Pagefind](https://pagefind.app/docs/) is designed to build a chunked search
index after a static site build. Its Node API can
[add custom records](https://pagefind.app/docs/node-api/) with content,
metadata and filters, and its browser API returns page/heading excerpts. This
is a strong established option when the Domain Hub HTML needs independent
browser search.

Decision: do not add Pagefind to capability 049. The current feature owns MCP
query over Published Markdown. The later Domain-site capability should compare
Pagefind custom records with reusing the core search-record projection; it must
not make browser search state authoritative for MCP query.

## Adopted retrieval flow

1. Resolve one exact synchronized Published commit and reuse its complete
   in-memory projection when already available.
2. Otherwise parse each OKF concept into metadata, heading-aware sections and accepted
   AgentBase relationship context.
3. Apply exact address lookup and explicit Domain/type filters.
4. Run established lexical relevance over the remaining transient records.
5. Collapse section hits to one concept, returning the best section/excerpt and
   bounded direct-context evidence.
6. Publish the new in-memory projection only after the complete build succeeds;
   never answer the new commit from an older index.
7. Read the exact Markdown document only after the caller selects a result.

## Deferred by evidence

- Semantic embeddings, vector databases and managed Google Knowledge Catalog
  search remain optional escalation paths for demonstrated natural-language
  recall gaps.
- Fuzzy/prefix matching requires a curated evaluation set before enablement.
- Durable indexes require measured load/latency evidence beyond the current
  1,000-concept qualification target.
- Pagefind belongs to the later static Domain-site capability.
