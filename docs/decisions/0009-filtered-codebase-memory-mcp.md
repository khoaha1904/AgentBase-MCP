# ADR 0009: Filter the Managed Codebase Memory MCP Surface

- **Status:** Accepted and qualified by Capability 005
- **Date:** 2026-08-12

## Context

The exact provider already owns a capable MCP server, but its full 15-tool
surface includes source-local persistence and provider mutations outside the
Part 1 requirement. Its restricted analysis profile omits indexing entirely,
and its installer modifies broad client/global configuration.

## Decision

AgentBase exposes one small stdio gateway using the official exact MCP server
SDK. It publishes the 11 pinned upstream analysis tools plus one controlled
`index_repository`, preserves names/schemas/raw results and excludes mutation
tools. The first index lazily binds one connection to one exact repository root,
forces `persistence:false`, uses private cache and opens one exact-root provider child. Another root
requires reconnect.

AgentBase also owns one concise graph-use skill shim because the upstream
package synthesizes client-specific instructions rather than shipping a stable
standalone skill. The shim delegates graph semantics and corrects only
AgentBase-specific lifecycle/safety differences.

## Consequences

- agents receive familiar Codebase Memory behavior without a user binary;
- policy is enforced at the tool boundary rather than left to skill prose;
- caller cwd is irrelevant and broad root authority is unnecessary;
- one new exact SDK dependency and one connection-scoped process boundary are
  owned by AgentBase;
- global installation, multi-repo connections, HTTP transport, watcher and OKF
  tools remain deferred.
