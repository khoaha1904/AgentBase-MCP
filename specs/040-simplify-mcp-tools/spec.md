# Feature Specification: Simplify MCP Tools

**Feature Branch**: `040-simplify-mcp-tools`

**Created**: 2026-08-24

**Status**: Complete

**Input**: Reduce the released MCP tool surface without weakening current
Initial Ingest, Refresh, Batch, Domain Enrichment, Hub or Code Graph workflows.

## User Scenarios & Testing

### User Story 1 - Choose from a smaller tool surface (Priority: P1)

As a coding agent, I see only the tools required by released AgentBase
workflows, so tool selection is cheaper and less ambiguous.

**Acceptance Scenarios**:

1. The MCP lists 42 tools: 29 Hub, 4 schema/authoring and 9 Code Graph tools.
2. Raw graph-query/schema/project inventory tools and deprecated fine-grained
   schema validators are absent.
3. Current released workflow tool sets remain fully available.

### User Story 2 - Receive truthful indexing guidance (Priority: P1)

As an agent indexing one repository, I see only supported arguments and never
receive cross-repository or source-persistence options that AgentBase rejects.

**Acceptance Scenarios**:

1. `index_repository` advertises one repository path, an optional safe mode and
   optional name.
2. Persistence, target projects and cross-repository mode are absent from its
   public schema and description.
3. The gateway still forces private non-persistent state defensively.

## Requirements

- **FR-001**: The public Code Graph surface MUST remove `query_graph`,
  `get_graph_schema` and `list_projects` while retaining indexing, architecture,
  search, trace, snippets, status, coverage and change detection.
- **FR-002**: The public schema surface MUST retain only `list_okf_schemas`,
  `get_okf_schema`, `get_okf_authoring_schemas` and `validate_okf_changes`.
- **FR-003**: The Hub surface MUST remain unchanged at 29 actions.
- **FR-004**: `index_repository` MUST expose only arguments accepted by the
  one-connection/one-repository AgentBase boundary.
- **FR-005**: Provider manifest drift checks MUST continue covering every
  released forwarded graph tool against the pinned provider.
- **FR-006**: Product skills MUST name the bounded public tools used by their
  workflow and MUST NOT instruct agents to send hidden index arguments.
- **FR-007**: Historical benchmark artifacts MUST remain unchanged; deprecated
  v1–v7 MCP authoring prompts MAY cease to be runnable, while current MVP
  qualification workflows MUST remain runnable.

## Non-goals

- No Hub-tool consolidation or generic action router.
- No graph, schema, OKF, Hub or provider behavior rewrite.
- No model benchmark run and no new dependency, cache or compatibility adapter.

## Success Criteria

- **SC-001**: Official MCP listing returns exactly 42 tools and omits all seven
  retired names.
- **SC-002**: The public indexing schema contains none of the three rejected
  fields/modes while controlled indexing and sequential repository switching
  still pass.
- **SC-003**: Canonical verification and all current workflow contracts pass
  without increasing the test inventory.
