# Feature Specification: Published-only Hub Query

**Feature Branch**: `038-published-only-hub-query`

**Created**: 2026-08-24

**Status**: Complete

**Input**: Simplify Hub search/query to synchronized Published knowledge only,
keep Questions as knowledge, and remove query tools that duplicate concept read.

## User Scenarios & Testing

### User Story 1 - Query shared knowledge without Draft leakage (Priority: P1)

As a Hub reader, I search and read the exact Published state synchronized to my
machine. Accepted but unpublished Local Draft changes never alter the answer.

**Acceptance Scenarios**:

1. A term present in Published is returned with the exact Published commit.
2. A term present only in Local Draft is absent from search and its path cannot
   be read through the public Hub query surface.
3. A local-only Hub reports that Published knowledge is unavailable.

### User Story 2 - Use a small query surface (Priority: P1)

As an agent, I use search to find a concept and read to retrieve its Markdown,
including relationships, snapshots, provenance and Questions.

**Acceptance Scenarios**:

1. The public Hub query surface contains only `search_hub_okf` and
   `read_hub_okf_concept`.
2. There is no separate traversal, observed-value or freshness query action.
3. Question governance actions remain available and Published Question
   documents remain normal searchable/readable knowledge.

## Requirements

- **FR-001**: Public Hub search and read MUST use exact `remoteBase`, never
  `activeHead`, working-tree bytes or a remote fetch.
- **FR-002**: A local-only Hub MUST fail clearly because it has no Published
  authority; it MUST NOT expose accepted Local Draft as Published knowledge.
- **FR-003**: The MCP and ordinary Hub CLI query surface MUST expose search and
  exact Markdown read only.
- **FR-004**: Relationships and snapshots MUST remain available through concept
  Markdown; agents MAY follow its links with repeated search/read calls.
- **FR-005**: Question documents and their governance lifecycle MUST remain.
- **FR-006**: Hub CI MAY continue using the internal freshness projection, but
  ordinary MCP/CLI query MUST NOT expose a dedicated freshness action.
- **FR-007**: Initial Ingest index appends MUST deduplicate by Markdown link
  target as well as exact wording.

## Non-goals

- No Published/Local Draft overlay or query view selector.
- No new index, cache, traversal engine, router, dependency or Hub format.
- No change to Accept, proposal inspection, publication, synchronization,
  Question answering or Hub CI validation.

## Success Criteria

- **SC-001**: One remote fixture proves Published results remain stable while
  `activeHead` contains a Draft-only term.
- **SC-002**: The listed MCP tools omit all three redundant query actions while
  retaining search, read and Question governance.
- **SC-003**: The canonical verification gate passes without increasing the
  test inventory or adding a dependency.
