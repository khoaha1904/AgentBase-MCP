# Implementation Plan: Hub Query Quality

**Branch**: `049-hub-query-quality` | **Date**: 2026-08-26 |
**Spec**: [spec.md](spec.md)

**Input**: Feature specification from
`/specs/049-hub-query-quality/spec.md`

## Summary

Replace whole-query substring matching with an upstream-based Markdown
retrieval pipeline over one exact Published Hub commit. Parse recommended OKF
metadata and heading-aware body sections, keep exact identity/path/title as a
pre-pass, use version-bound MiniSearch BM25+ for transient lexical relevance,
collapse section hits to one concept, cache one complete in-memory projection by
exact Published commit, and add bounded link/relation/scope evidence. Preserve
the public `search_hub_okf → read_hub_okf_concept` flow, Published-only authority
and existing MCP input shape.

The owner approved `minisearch@7.2.0` on 2026-08-26. It is pinned under the MIT
license and has zero runtime dependencies.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js `>=24.12 <25`

**Primary Dependencies**: Existing `yaml@2.9.0`,
`@modelcontextprotocol/server@2.0.0`; proposed exact
`minisearch@7.2.0` (MIT, zero runtime dependencies, owner approved)

**Storage**: Exact synchronized Published AgentBase-Hub Markdown; one transient
in-memory graph, section record set and lexical index keyed by Published commit

**Testing**: Node.js test runner with colocated `*.test.ts`; repository
`npm run verify`; deterministic generated 1,000-concept qualification

**Target Platform**: Local Linux/macOS/Windows Node MCP server; no browser or
static-site runtime in this capability

**Project Type**: Modular-monolith MCP server and core TypeScript library

**Performance Goals**: At least 95% of representative searches over 1,000
concepts finish within one second in repository qualification; top-five recall
meets the curated expected set

**Constraints**: Published-only, read-only, bounded documents/results/relations,
offline after dependency installation, no model/cloud credential, no durable
index/cache/daemon, atomic commit-keyed in-memory replacement, no new query
grammar, no Hub migration

**Scale/Scope**: Up to 1,000 concepts for qualification, at most 256 KiB per
document, at most 100 public results, one exact Published commit per request

## Constitution Check

### Before Phase 0

- **Evidence Before Abstraction — PASS**: current query probes identified
  content support and the excerpt defect; research uses official OKF, Google
  Knowledge Catalog, MCP and Markdown retrieval sources.
- **Local-First Explicit Authority — PASS WITH IMPLEMENTATION GATE**:
  MiniSearch is local and in-process, but its exact production dependency needs
  owner-visible approval before package files change.
- **Agent-Navigable Ownership — PASS**: core search records/scoring stay under
  `src/core/knowledge/query/`; the existing app wrapper and MCP tool schema
  remain thin.
- **Cumulative Knowledge — PASS**: no Published or Draft Markdown is mutated;
  sections/indexes are transient projections.
- **Specification and Deterministic Verification — PASS**: capability 049 is
  sole active capability with `AB-QUERY-*` requirements and focused,
  qualification and full-gate evidence.

### After Phase 1

- **PASS**: data model gives every transient value a Published commit and parent
  concept; no second durable authority is introduced.
- **PASS**: MCP contract is additive and retains existing request fields,
  validation and exact-read behavior.
- **PASS**: the owner explicitly approved `minisearch@7.2.0`; the exact package
  is pinned and adds no runtime dependency beneath it.

## Project Structure

### Documentation (this feature)

```text
specs/049-hub-query-quality/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hub-query-mcp.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code

```text
src/core/knowledge/
├── documents/
│   ├── okf-document.ts
│   └── okf-relationships.ts
└── query/
    ├── hub-markdown-sections.ts       # new heading-aware transient sections
    ├── hub-markdown-sections.test.ts
    ├── hub-query-graph.ts             # concept metadata, links, validated topology
    ├── hub-query-search-index.ts       # new MiniSearch adapter/projection/cache
    ├── hub-query-search-index.test.ts
    ├── hub-query.ts                    # public search/read orchestration
    └── hub-query.test.ts

src/app/hub-okf/
├── query/query.ts                      # unchanged thin Published reader wrapper
└── mcp/
    ├── mcp-query-tools.ts              # additive description/schema only if needed
    └── mcp-tool-call.ts                # existing input forwarding

scripts/benchmark/
└── benchmark-okf.mjs                   # add deterministic query-quality scenario
```

**Structure Decision**: Keep query behavior in the existing core owner. Add
one Markdown-section parser and one library adapter rather than mixing parsing,
ranking and MCP serialization in `hub-query.ts`. Reuse validated relationship
logic instead of adding another predicate parser. Tests remain colocated.

## Design sequence

### Phase 0 — Research

Completed in [research.md](research.md). Key decisions:

1. OKF is a structured Markdown corpus and intentionally does not prescribe a
   query engine.
2. Use official `description`, tags, headings/body and portable links; do not
   add `summary`.
3. Preserve search-then-lookup and explicit typed scope/bounds.
4. Use heading-aware transient sections.
5. Propose MiniSearch BM25+ instead of handwritten relevance.
6. Defer semantic retrieval and Pagefind to evidence/later capability.

### Phase 1 — Data and contracts

1. Parse concept metadata and original body into bounded section records.
2. Build a transient search document per section, carrying parent concept and
   explicit scope/context identifiers.
3. Reuse one complete cached projection only when its exact commit matches;
   otherwise build fully before replacing the previous in-memory value.
4. Exact-address matches bypass lexical scoring; other matches use the library
   adapter and deterministic path tie-break.
5. Collapse section hits per concept and compose an additive public match.
6. Reuse accepted relationship/Flow validation and portable-link resolution for
   bounded context and Domain eligibility.
7. Keep exact Markdown read unchanged.

Interface details are in [contracts/hub-query-mcp.md](contracts/hub-query-mcp.md);
entities and invariants are in [data-model.md](data-model.md).

## Complexity Tracking

| Decision | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| One new production dependency | Established BM25+ and match metadata avoid a bespoke relevance implementation | Current substring matching cannot rank multi-term content; custom coverage weights recreate a search engine |
| Two transient record levels | Heading section gives precise retrieval evidence while concept stays the public unit | Whole-document scoring produces weak excerpts; persisted chunks duplicate Hub structure |

## Verification Evidence

Completed on 2026-08-26:

- focused section, graph, search-index and query tests: 12/12 passed;
- Published-only app integration: 1/1 passed;
- deterministic qualification: 1,000 concepts, 100/100 top-five recall,
  915.038 ms index build and 22.669 ms query p95 over 100 searches;
- `npm run verify`: passed after rebuilding the canonical Hub validator artifact,
  including specification, dependency architecture, type, dead-code, secret,
  82-test and diff gates.
