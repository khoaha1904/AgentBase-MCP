# Code Intelligence Engine Shortlist

- **Research snapshot:** 2026-08-11
- **Purpose:** inform a benchmark, not permanently select an engine

Public project activity and capabilities change. Re-verify upstream release,
license, platform and security information before integration.

## Leading candidate: Codebase Memory MCP

Repository: <https://github.com/DeusData/codebase-memory-mcp>

Why it currently matches Part 1:

- local static analysis with no built-in LLM requirement;
- broad language coverage and MCP query surface;
- compact deployment model and local database;
- repository indexing, relationship graph and incremental/watch behavior;
- strong recent community adoption.

Risks:

- young project with a rapidly changing pre-1.0 surface;
- recent implementation rewrites increase upgrade risk;
- Terraform and infrastructure semantics may not match AgentBase's high-level
  observation needs;
- upstream graph schema must not become the OKF schema.

## Other candidates

- CodeGraphContext: <https://github.com/CodeGraphContext/CodeGraphContext>
  offers Tree-sitter/SCIP-based indexing and broad language support but carries
  a heavier graph-backend footprint.
- CodeGraph: <https://github.com/codegraph-ai/CodeGraph> has a broad MCP tool
  surface but materially lower adoption at the snapshot date.
- Joern: <https://github.com/joernio/joern> is a mature code property graph
  platform with strong security-analysis depth, but is heavier than the desired
  coding-navigation baseline.
- SCIP: <https://github.com/sourcegraph/scip> is a useful indexing protocol and
  ecosystem component, not by itself the complete AgentBase Part 1 product.

## Required benchmark before adoption

The provider must be tested on representative public/local fixtures for:

- index time, refresh time, memory and disk use;
- relevant-subgraph quality for realistic coding tasks;
- deterministic or acceptably stable normalized observations;
- unsupported-language and partial-index behavior;
- repository isolation and cache/version isolation;
- coexistence with a user-managed installation;
- upgrade and rollback behavior;
- license and redistribution constraints.
