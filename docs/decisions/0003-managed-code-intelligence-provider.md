# ADR 0003: Use a Managed, Pinned Code Intelligence Provider

- **Status:** Accepted ownership model; Codebase Memory conformance remains under
  Capability 002 evaluation
- **Date:** 2026-08-11

## Context

Building and maintaining a competitive multi-language graph engine is expensive
and is not AgentBase's differentiator. Users may already have their own version
of the selected tool installed.

## Decision

Put Code Intelligence behind an AgentBase-owned adapter and conformance suite.
Evaluate Codebase Memory MCP as the leading first provider. If accepted, pin an
exact tested release and upgrade deliberately rather than following upstream on
every release.

AgentBase manages its supported executable and versioned cache without changing
or silently reusing a user's global installation. A new provider version builds
new state, passes conformance, then switches atomically with rollback retained.

For the first provider, AgentBase pins the official
`codebase-memory-mcp@0.10.1` npm package exactly. The dependency's maintained
wrapper owns checksum-verified platform bootstrap into its private package
directory; AgentBase owns selection, admission, invocation and upgrade policy.
Users do not provide an executable path.

## Consequences

- Upstream improvements can be adopted without coupling OKF to upstream schema.
- Two installations may coexist safely.
- Package integrity, native identity, licensing and process lifecycle remain
  explicit conformance work.
- The adapter must expose capabilities and limitations rather than pretending
  all providers behave identically.
