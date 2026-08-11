# ADR 0003: Use a Managed, Pinned Code Intelligence Provider

- **Status:** Proposed; engine choice requires benchmark acceptance
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

## Consequences

- Upstream improvements can be adopted without coupling OKF to upstream schema.
- Two installations may coexist safely.
- Distribution, licensing, integrity and process lifecycle need explicit work.
- The adapter must expose capabilities and limitations rather than pretending
  all providers behave identically.
