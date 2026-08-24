# Research: Simplify MCP Tools

- **Decision**: Retain nine goal-level Code Graph tools. **Rationale**: Raw
  Cypher, provider schema introspection and global project inventory are absent
  from released skills and conflict with the one-repository connection model.
- **Decision**: Retain four schema tools. **Rationale**: Current workflows use
  bounded authoring guidance and changed-set validation; catalog list/read stay
  useful for Refresh and inspection. The four removed tools duplicate these
  paths and only support historical benchmark prompts.
- **Decision**: Curate only the public indexing descriptor. **Rationale**: The
  gateway already rejects persistence and cross-repository options, so exposing
  them is misleading. Provider drift checks still use captured source schemas.
