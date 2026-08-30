# Runtime boundaries

> Status: Accepted runtime composition baseline; update when a runtime adapter,
> process boundary or external authorization boundary changes.

| Boundary | Architecture ownership | Capability Contract |
|---|---|---|
| MCP composition and wire protocol | `app/codebase-memory-mcp` registers business tools; protocol adapters own version and transport negotiation | [MCP protocol](../capabilities/12-version-scope/09-mcp-protocol-requirements.md) and [Code Graph runtime](../capabilities/01-repository-reading/05-runtime-requirements.md) |
| Code Intelligence | `core/code-intelligence` owns neutral values; provider adapters own engine lifecycle and translation | [Repository Reading](../capabilities/01-repository-reading/README.md) |
| Knowledge authoring | `core/knowledge` owns portable documents and policy; `app/repository-okf` composes repository evidence | [Knowledge Entry](../capabilities/05-knowledge-entry/README.md) and [Ingest/Refresh](../capabilities/09-ingest-and-refresh/README.md) |
| Hub governance and publication | `core/hub` owns identity/transitions; `app/hub-okf` owns local workflows; `providers/github-hub` owns transport | [Review and Publish](../capabilities/11-review-and-publish/README.md) |
| Provider enrichment | provider adapters own bounded observations; `app/hub-okf/enrichment` owns reconciliation | [Cross-repository Relations](../capabilities/06-cross-repository-relations/README.md) |
| Query and visualization | `core/knowledge/query` owns accepted reads; application projections remain derived and commit-bound | [Query Routing](../capabilities/10-query-routing/README.md) and [Visualization](../capabilities/13-visualization/README.md) |
| CLI, installation and local storage | `src/cli.ts` dispatches; application owners and installation scripts own transactions | [Version Scope](../capabilities/12-version-scope/README.md) |
| Benchmark and AI-SDLC qualification | scripts own isolated measurement; production runtime contains no model execution authority | [Benchmark](../capabilities/12-version-scope/03-benchmark-requirements.md) and [AI-SDLC Context](../capabilities/14-ai-sdlc-context/README.md) |

The high-level MCP server factory owns tool registration. Low-level protocol
adapters own wire versions and transport negotiation. Business capabilities do
not import transport internals, and transport adapters do not acquire product
authority.

External authorization, provider credentials and network access stay behind
their explicit adapter/workflow boundary. Reusable adapters do not themselves
open a production service, discover arbitrary executables or acquire ambient
credentials.
