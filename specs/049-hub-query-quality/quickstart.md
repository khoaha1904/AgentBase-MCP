# Quickstart: Validate Hub Query Quality

This guide is runnable after implementation and dependency approval.

## Prerequisites

- Node.js version accepted by `package.json`.
- Repository dependencies installed from the exact lockfile.
- Capability 049 remains selected in `specs/CURRENT.md`.

## 1. Focused section and ranking tests

```sh
node --test \
  src/core/knowledge/query/hub-markdown-sections.test.ts \
  src/core/knowledge/query/hub-query-graph.test.ts \
  src/core/knowledge/query/hub-query-search-index.test.ts \
  src/core/knowledge/query/hub-query.test.ts
```

Expected:

- exact identity/path/title stays ahead of lexical results;
- title/description/tags/heading/body multi-term matches are deterministic;
- several matching sections collapse to one concept;
- the returned excerpt is non-empty and names the real heading path;
- no prefix/fuzzy expansion occurs.

## 2. Domain and relation qualification

Run the focused query test fixture and verify:

- a Repository-associated concept is eligible inside its Domain;
- one direct external boundary endpoint may be returned;
- the unrelated Domain neighborhood is absent;
- portable links stay untyped;
- canonical relations and Flow steps preserve stored direction/evidence;
- context bounds expose omitted counts.

## 3. Published-only integration

```sh
node --test src/app/hub-okf/query/query.test.ts
```

Expected: search and read report the same exact synchronized Published commit;
working-tree and Local Draft changes do not affect results.

## 4. Deterministic scale qualification

```sh
npm run benchmark:okf
```

Expected query-quality evidence:

- 1,000 deterministic concepts;
- every curated expected concept appears in the top five;
- at least 95% of representative searches finish within one second;
- result, section, context and document bounds hold;
- index construction time is recorded separately from matching time.

## 5. Canonical repository gate

```sh
npm run verify
```

Expected: specification, architecture, dependency, type, test, secret and diff
checks all pass.

## Manual contract check

Invoke `search_hub_okf` with a multi-term Domain-scoped query, select one
returned `path`, then invoke `read_hub_okf_concept`. Compare the response with
[contracts/hub-query-mcp.md](contracts/hub-query-mcp.md).
