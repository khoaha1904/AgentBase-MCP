# Owner Decision: AgentBase-Managed Code Intelligence Provider

- **Captured:** 2026-08-12
- **Status:** Accepted; supersedes the owner-supplied executable deviation in
  the first Capability 002 preview
- **Scope:** Codebase Memory distribution and version ownership

## Owner direction

An AgentBase user does not supply a Codebase Memory binary path. The AgentBase
MCP owns the provider version so different repositories and users do not depend
on an arbitrary global installation.

## Product interpretation

“The binary belongs to the MCP” means AgentBase owns acquisition, exact version,
admission and invocation. It does not require embedding every operating-system
binary byte in one large AgentBase package.

For Capability 002:

- AgentBase pins exact runtime dependency `codebase-memory-mcp@0.10.1`;
- the official npm wrapper chooses the platform artifact, verifies the upstream
  release checksum and stores the executable inside its package directory;
- AgentBase resolves that private dependency path and validates package,
  reported-version and executable identities before indexing;
- no user path, `PATH` search or global installation is accepted;
- AgentBase never invokes Codebase Memory's native install/update/config commands
  or registers a second MCP;
- provider upgrade requires a reviewed AgentBase dependency/lockfile change;
- missing/offline/integrity failure is visible and fails closed before indexing;
- canonical offline verification does not download or execute the native tool.

## Why reuse the official wrapper

Read-only inspection of the `codebase-memory-mcp@0.10.1` npm tarball showed an
existing security boundary for HTTPS-only bounded download, checksum-manifest
validation, archive-member allowlisting, platform selection, executable version
probe and staged publication. Reimplementing those mechanisms in AgentBase would
add security-sensitive duplicate code without improving the MVP outcome.

The package metadata and immutable upstream release remain the primary evidence:

- <https://www.npmjs.com/package/codebase-memory-mcp/v/0.10.1>
- <https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.10.1>

## Deferred hardening

- keeping and switching between multiple native provider versions;
- automatic garbage collection of old packages/caches;
- offline redistribution bundles;
- enterprise mirrors or air-gapped package sources;
- provider selection beyond the first accepted Codebase Memory version.
