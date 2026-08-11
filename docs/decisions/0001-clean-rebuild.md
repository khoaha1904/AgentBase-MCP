# ADR 0001: Start a Clean AgentBase Repository

- **Status:** Accepted
- **Date:** 2026-08-11

## Context

The previous AgentBase repositories accumulated implementation and documents
from several incomplete product directions. Continued refactoring would spend
time preserving accidental structure before the new product boundary was clear.

## Decision

Create an independent repository temporarily named `agentbase-next`. Keep the
intended product name AgentBase. Treat sibling repositories as read-only
historical references and reimplement only behaviors justified by a current
specification and test.

## Consequences

- The project pays a small bootstrap cost but gains a clean dependency graph.
- No bulk code migration is allowed.
- Legacy tests may be consulted as behavioral evidence, not copied by default.
- Repository-local decisions and specs become the new source of truth.
