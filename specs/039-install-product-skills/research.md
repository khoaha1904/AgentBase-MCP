# Research: Install Product Skills

- **Decision**: Copy skills to client-supported user-scope directories.
  **Rationale**: Skills remain available outside the MCP checkout and follow
  the clients' ordinary discovery model. **Alternative**: Symlinks were rejected
  because client discovery and moved-checkout behavior need not depend on links.
- **Decision**: Use a fixed seven-name allowlist. **Rationale**: Exclusion of
  development skills is true by construction. **Alternative**: Parsing README
  or scanning directories would make prose/naming accidental release authority.
- **Decision**: Preserve differing destinations. **Rationale**: A user-owned
  skill must not be overwritten. Managed upgrades are deferred until a real
  release migration requires them.
