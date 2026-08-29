# Feature Specification: MCP modern protocol readiness

**Status**: Phases 1–4 implemented; remote authorization remains deferred.

## Objective

Standardize AgentBase-MCP on the official MCP `2026-07-28` protocol while
preserving interoperability with the legacy `2025-11-25` era used by existing
stdio clients.

## Requirements

- **AB-MCPMOD-001**: The AgentBase server advertises an explicit supported
  protocol set containing the legacy compatibility era and `2026-07-28`.
- **AB-MCPMOD-002**: High-level AgentBase tools remain independent of wire
  protocol, transport and version negotiation code.
- **AB-MCPMOD-003**: Existing stdio clients and the current tool surface remain
  compatible; no tool is renamed or removed by this migration slice.
- **AB-MCPMOD-004**: Tool schemas remain JSON-Schema based and are validated by
  the official SDK registration path.
- **AB-MCPMOD-005**: Modern Streamable HTTP, stateless deployment, OAuth
  hardening and Tasks are separate follow-up slices and are not silently
  enabled by the stdio migration.
- **AB-MCPMOD-006**: A reusable web-standard Streamable HTTP handler serves
  modern requests without a protocol session and keeps legacy requests on the
  SDK stateless compatibility leg.

## Success criteria

The server factory has one low-level protocol configuration boundary, a
reusable HTTP handler serves a modern `tools/list` request without a session,
and all existing tests plus `npm run verify` pass.
