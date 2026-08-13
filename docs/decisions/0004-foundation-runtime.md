# ADR 0004: Use Node.js 24 with Direct Erasable TypeScript

- **Status:** Accepted
- **Date:** 2026-08-11

## Context

The clean foundation needs explicit provider-neutral contracts, deterministic
offline tests, local process/stream support for a future MCP adapter and minimal
generated output. The runtime must be selected for AgentBase rather than copied
from a legacy repository or AgentDocks by convention.

## Decision

Use Node.js 24 LTS, requiring `>=24.12 <25`, with TypeScript limited to syntax
that Node can erase and execute directly. Use TypeScript separately for static
checking with no emitted build tree.

Capability 001 has no production dependency. Its only proposed development
dependencies are TypeScript and Node type definitions. Tests use `node:test`.

The owner approved this decision on 2026-08-11 before runtime implementation
started.

## Consequences

- Public contracts remain explicit and statically checked.
- Development and tests execute source directly; no `dist/` ownership or stale
  generated output exists in the foundation.
- The project cannot use TypeScript syntax requiring code transformation,
  `tsconfig` path aliases or implicit type imports.
- Packaging may later add an explicit build without changing core contracts.
- Upgrading the Node major line is a deliberate ADR and verification event.

## Evidence

See `specs/001-clean-foundation/research.md` for runtime comparison, local
toolchain evidence and official runtime references.
