# Implementation Plan: AgentBase Hub PR Lifecycle

**Branch**: `main` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

## Summary

Add a credential-aware Hub boundary that maintains one private local clone of a fixed GitHub repository, prepares immutable `new` or `refresh` OKF proposals without remote writes, and submits only an exact reviewed proposal as a non-force-pushed branch and pull request. Reuse the existing OKF bundle/proposal/schema logic and Node/Git runtime; add no dependency.

## Technical Context

**Language/Version**: JavaScript ESM / erasable TypeScript on Node.js 24

**Primary Dependencies**: Node standard library and built-in `fetch`; existing `yaml`; host Git executable; existing MCP SDK

**Storage**: Owner-private local Hub clone, isolated proposal worktrees and atomic non-secret manifests outside source repositories

**Testing**: `node:test`, disposable bare Git remotes, fake GitHub HTTP boundary, token canaries, existing OKF fixture helpers

**Target Platform**: Linux x64 VPS, GitHub HTTPS remote

**Project Type**: Modular-monolith MCP/CLI application

**Performance Goals**: One bounded fetch per prepare/submit; no duplicate clone when an admitted checkout is reusable; no hidden retry loop

**Constraints**: No token persistence or exposure; no arbitrary remote; no force push/merge/target write; offline canonical gate; no new dependency or architecture exception

**Scale/Scope**: One configured Hub, one target branch, multiple isolated proposal IDs, one PR per proposal branch

## Constitution Check

### Pre-design

- **Evidence Before Abstraction**: Pass. Git safety and GitHub API contracts are exercised through disposable/fake boundaries before real qualification.
- **Local-First Explicit Authority**: Pass. `prepare` and `submit` are distinct; remote writes occur only on submit.
- **Agent-Navigable Ownership**: Pass. New provider-neutral Hub policy, GitHub adapter and app workflow each have one owner and public entrypoint.
- **Cumulative Knowledge**: Pass. Refresh reuses protected-content rules and never interprets absence as deletion.
- **Specification and Deterministic Verification**: Pass. AB-HUB IDs and recovery cases precede code.

### Post-design

Pass with no exception. The token/process/external lifecycle is isolated behind explicit contracts; no dependency, daemon, migration or baseline growth is planned.

## Design Decisions

1. Create `src/core/hub` for provider-neutral Hub identities, immutable proposal/publication state and transition validation.
2. Create `src/providers/github-hub` for exact Git process admission, authenticated fetch/push and GitHub REST calls. It receives a token per operation and never persists it.
3. Create `src/app/hub-okf` for prepare/inspect/submit/recover composition and MCP presentation. It reuses `src/core/knowledge`, observations and schema catalog through public entrypoints.
4. Use a temporary owner-private `GIT_ASKPASS` executable plus fixed environment to authenticate Git without embedding credentials in URLs, arguments or repository config; remove it after each bounded operation.
5. Disable hooks, submodule recursion, URL rewrites and interactive credential fallback. Admit the effective remote URL and exact target ref before use.
6. Derive proposal branch and commit metadata deterministically from proposal identity; never amend or force-push after publication begins.
7. GitHub API adapter accepts only expected repository/target/head identities and maps exact existing PR state to idempotent success.

## Project Structure

```text
src/
├── core/
│   └── hub/
│       ├── index.ts
│       ├── identity.ts
│       ├── proposal.ts
│       └── *.test.ts
├── providers/
│   └── github-hub/
│       ├── index.ts
│       ├── git-process.ts
│       ├── github-api.ts
│       └── *.test.ts
└── app/
    └── hub-okf/
        ├── index.ts
        ├── configuration.ts
        ├── checkout.ts
        ├── prepare.ts
        ├── submit.ts
        ├── recovery.ts
        ├── mcp-tools.ts
        └── *.test.ts

docs/specs/agentbase-hub.md
specs/007-agentbase-hub-pr-lifecycle/
```

**Structure Decision**: Hub policy is independent of both Codebase Memory graph semantics and GitHub mechanics. The app composes existing OKF knowledge policy with the new Hub core and provider. MCP exposes workflow actions but does not own domain rules.

## No-Change Boundaries

- The 12 Codebase Memory graph tools and their provider remain unchanged.
- Existing local repository OKF rehearsal remains historical evidence, not the Hub storage model.
- Google OKF v0.2 and schema catalog `1.0.0` remain the authored bundle contracts.
- No real Hub, token, branch or PR is touched before explicit implementation approval and later real-integration authorization.
