# Research: Product Skill Catalog

## Canonical invocation

- **Decision**: Keep `agentbase-*` canonical names. Document explicit invocation
  as `$agentbase-query` in Codex and `/agentbase-query` in Claude Code.
- **Rationale**: Official clients expose different invocation affordances;
  natural-language matching works in both. A fabricated `/abs_*` alias would
  require duplicate client-specific artifacts and would not work uniformly.
- **Alternatives considered**: Rename every skill to `abs-*`; install legacy
  command aliases; create a universal MCP tool.

## Public versus internal

- **Decision**: Release eight artifacts classified as six public user goals and
  two internal supporting workflows.
- **Rationale**: Existing Ingest/Refresh/Batch workflows already reuse graph and
  OKF authoring policy. Keeping those owners avoids duplication while one public
  Query owner removes source-selection burden from users.
- **Alternatives considered**: Duplicate internal rules into every public
  skill; package a new plugin; remove the supporting artifacts.

## Query routing owner

- **Decision**: Implement routing entirely as skill instructions over existing
  MCP primitives.
- **Rationale**: Current design already assigns semantic routing to the host
  agent and keeps MCP deterministic. The 42 tools contain all required actions.
- **Alternatives considered**: Server classifier, model call, joined answer tool
  or user-selected mode.

## Compatibility

- **Decision**: Add `agentbase-query` without renaming or removing the seven
  existing directories; exact reruns and conflict behavior remain unchanged.
- **Rationale**: This avoids destructive migration. Internal classification is
  a product ownership boundary, not a promise that every client hides every
  technical artifact from its selector.
- **Alternatives considered**: Delete installed legacy skills or manage
  client-specific visibility state.
