# MCP protocol requirements

Current wire-level behavior for the AgentBase MCP composition boundary. Product
direction remains in
[`docs/product/00-product-scope-and-authority.md`](../../product/00-product-scope-and-authority.md#mcp-protocol-direction),
while [the Architecture Contract](../../architecture/runtime.md) owns the
system boundary between business tools and protocol adapters.

## Supported protocol and transport behavior

- **AB-MCPMOD-001** — Stdio auto-negotiates the modern `2026-07-28` MCP era and
  retains `2025-11-25` compatibility. The supported-era policy is explicit and
  independently testable.
- **AB-MCPMOD-002** — High-level AgentBase tool registration remains independent
  of wire versions, transport negotiation and HTTP request handling. Business
  capabilities do not import protocol-adapter internals.
- **AB-MCPMOD-003** — Modern stdio, modern stateless Streamable HTTP and legacy
  compatibility expose the same admitted business tool contracts. Protocol
  modernization does not rename or remove a tool.
- **AB-MCPMOD-004** — Every advertised tool input declares JSON Schema 2020-12
  through the official SDK registration path. Conservative private tool-list
  caching and additive structured results must not change existing text or
  argument contracts.
- **AB-MCPMOD-005** — The repository exposes a reusable HTTP handler but does not
  open a production port or silently enable remote deployment, OAuth/OIDC or
  Tasks. Each requires a separately accepted Product, Architecture, Capability
  and Implementation Contract.
- **AB-MCPMOD-006** — The web-standard Streamable HTTP handler constructs an
  isolated server per request, serves modern requests without a protocol
  session, advertises only the modern era during modern discovery and retains
  the SDK stateless legacy fallback. Response selection preserves related
  protocol notifications through the appropriate JSON or event-stream form.

## Acceptance evidence

Focused protocol-policy, stdio and HTTP tests verify both eras, sessionless
modern discovery/listing, legacy initialization, JSON Schema declarations,
cache hints and unchanged business tool registration. The canonical repository
gate remains `npm run verify`; remote authorization and Tasks are not part of
that offline evidence.
