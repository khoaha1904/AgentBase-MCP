# Implementation Plan: Codebase Memory MCP Surface

**Branch**: `005-codebase-memory-mcp-surface` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

**Status**: Implemented and exact-provider qualified

## Summary

Add one local stdio AgentBase gateway that exposes a pinned safe subset of the
managed Codebase Memory MCP. It starts unbound, lazily binds one client
connection to one explicitly indexed repository and forwards upstream-compatible
tools/results through a bounded exact provider session. Add one concise
`use-codebase-memory` skill shim. Do not add OKF tools, repository discovery,
global installers, watchers or an AgentBase graph implementation.

## Technical Context

**Language/Version**: TypeScript 5.9 executed directly by Node.js `>=24.12 <25`
**Primary Dependencies**: existing exact `codebase-memory-mcp@0.10.1`,
`@modelcontextprotocol/client@2.0.0`, `yaml@2.9.0`; proposed exact new
`@modelcontextprotocol/server@2.0.0`
**Storage**: existing AgentBase private state root and provider cache outside
source; no new shared/persistent domain data
**Testing**: colocated `node:test`, fake provider session, captured exact tool
manifest/results, opt-in fresh official-client qualification
**Target Platform**: accepted Linux x64 local stdio walking skeleton
**Project Type**: local-first modular-monolith CLI/MCP tooling application
**Performance Goals**: no provider child before first index; one provider child
serves the bound client connection; no per-query native restart
**Constraints**: exact binary; one repo per connection; read-only source; private
cache; bounded lifecycle; protocol-only stdout; offline canonical verification
**Scale/Scope**: 12 tools, one connection, one selected repo and one concise skill

## Constitution Check

*GATE: Passed for design; dependency/runtime implementation awaits approval.*

- **Evidence Before Abstraction**: exact binary probes establish the 15-tool
  surface, restricted profiles, schemas, installer behavior and skill synthesis.
- **Local-First Explicit Authority**: exact path selection is explicit; no
  recursive scan, global install, user binary, source persistence or background
  process is introduced.
- **Agent-Navigable Ownership**: a new `src/app/codebase-memory-mcp` application
  owner composes the existing provider public entrypoint; graph internals stay
  with Codebase Memory and OKF stays in `repository-okf`.
- **Cumulative Knowledge**: raw MCP graph results remain private working state
  and never enter OKF by implication.
- **Specification and Deterministic Verification**: `AB-MCP-*`, offline fake
  tests, exact captured schemas and isolated opt-in qualification precede
  promotion.
- **Material approval**: the official server SDK and a new public process
  lifecycle require owner-visible approval before dependency/source changes.

Post-design check: passed. No architecture exception is planned. The single new
dependency and module are the minimum enforcement boundary; hand-written MCP
framing or publishing unsafe tools would be worse fits.

## Project Structure

### Documentation

```text
specs/005-codebase-memory-mcp-surface/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── mcp-tools.md
│   └── skill.md
├── checklists/
│   ├── requirements.md
│   └── simplicity-lifecycle.md
└── tasks.md
```

### Source and skill

```text
src/app/codebase-memory-mcp/
├── tool-manifest.ts
├── tool-policy.ts
├── gateway-session.ts
├── server.ts
├── index.ts
└── *.test.ts

.agents/skills/use-codebase-memory/
├── SKILL.md
└── agents/openai.yaml
```

Existing `src/providers/codebase-memory` remains the only concrete provider
owner. It may gain generic raw-tool/session support through its public entrypoint
but must not import the new application module.

**Structure Decision**: one application module owns public MCP composition and
policy. Do not place server concerns in provider or repository-OKF modules, and
do not create a generic gateway framework.

## Phase 0: Evidence and dependency admission

1. Preserve exact surface/profile/installer probes as evidence and capture the
   sanitized 12-tool manifest fixture.
2. After owner approval, install exact official server SDK and verify lockfile,
   type compatibility and Node support before application code.
3. Stop if the official SDK requires another framework adapter or cannot provide
   bounded stdio lifecycle cleanly; do not implement protocol framing manually.

## Phase 1: Safe gateway contract

1. Implement immutable manifest and schema-drift admission.
2. Implement pre-provider index request policy and one-root connection binding.
3. Compose lazy exact provider session, raw forwarding and idempotent cleanup.
4. Register the stdio entrypoint without installing it into any client config.

The gateway does not reuse repository-OKF evidence normalization or freshness
receipt. Those are OKF evidence-round concerns; the public graph tool remains
upstream-compatible and explicit.

## Phase 2: Skill shim

Use the skill initializer from the `skill-creator` workflow after runtime
contract tests pass. Keep only `SKILL.md` and generated `agents/openai.yaml`;
add no scripts/references unless validation proves they are required. Validate
structure and test the workflow against the fake/isolated MCP client.

## Phase 3: Qualification and closure

Launch a fresh official client and AgentBase MCP as separate processes from an
unrelated cwd. Index/query a disposable fixture, compare source before/after,
exercise rejection and disconnect paths and confirm cleanup. Then update living
Part 1 requirements, architecture, README, roadmap and handoff; capture a
reusable AgentStack lesson only if implementation proves something new.

## Complexity Tracking

No constitution violation is planned. Complexity is capped at one 12-tool
manifest, one repository binding, one provider child and one skill. Multi-repo
connections, installer generation, HTTP transport and OKF tools are deferred.
