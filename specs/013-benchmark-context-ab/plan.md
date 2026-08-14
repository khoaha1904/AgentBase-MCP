# Implementation Plan: Benchmark Context A/B

**Branch**: `013-benchmark-context-ab` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-benchmark-context-ab/spec.md`

## Summary

Extend the existing OKF benchmark with one paired execution command. A pair
runs the current MCP-assisted arm and a direct-source arm into sibling result
directories, finalizes each with the existing semantic scorer, then writes a
side-by-side comparison whose quality and efficiency sections remain separate.
The change stays inside the existing Node scripts, JSON artifacts and prompt
catalog; no provider framework, SDK, dependency or operating-system file tracer
is added.

## Technical Context

**Language/Version**: Node.js 24.12-24.x, JavaScript ESM; existing TypeScript 5.9 repository code is reused only through public entrypoints

**Primary Dependencies**: Node standard library, existing Codex CLI process contract, existing AgentBase MCP and OKF scorer

**Storage**: Versioned JSON/Markdown benchmark inputs and ignored filesystem result artifacts

**Testing**: `node:test` with a fake Codex executable; canonical `npm run verify`

**Target Platform**: Local Linux/macOS host with Node; real runs additionally require the pinned Codex CLI and host authentication

**Project Type**: Modular-monolith CLI benchmark tooling

**Performance Goals**: Offline paired tests complete within the existing test budget; real arm timeout remains bounded by the manifest

**Constraints**: Source fixtures remain unchanged; real model work is opt-in; missing measurements remain unknown; historical single-arm artifacts and commands remain readable

**Scale/Scope**: One two-arm pair for one selected repository; two existing scripts, one added prompt, focused tests and living benchmark docs

## Constitution Check

### Pre-design gate

- **Evidence Before Abstraction — PASS**: extends the proven single Codex adapter
  for one concrete comparison; no generalized provider or experiment framework.
- **Local-First Explicit Authority — PASS**: real paired execution is an explicit
  command, bounded by existing timeouts, and canonical verification stays offline.
- **Agent-Navigable Ownership — PASS**: benchmark lifecycle remains in
  `scripts/benchmark-agent.mjs` and `scripts/benchmark-okf.mjs`; the living
  behavior contract remains `docs/contracts/benchmark.md`.
- **Cumulative Knowledge — PASS**: pair artifacts are additive and historical
  single-arm results are untouched.
- **Specification and Deterministic Verification — PASS**: requirements
  `AB-BENCH-009` through `AB-BENCH-017` have an active capability and planned
  fake-process acceptance coverage before implementation.

### Post-design gate

- **PASS**: design adds no production dependency, credential boundary, daemon,
  provider or irreversible operation. It preserves exact artifacts on partial
  failure and explicitly labels incomplete or unavailable evidence.

## Project Structure

### Documentation (this feature)

```text
specs/013-benchmark-context-ab/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── benchmark-comparison.md
├── checklists/
└── tasks.md
```

### Source Code (repository root)

```text
benchmark/
├── prompts/
│   ├── okf-author-v1.md
│   └── okf-author-direct-v1.md
└── results/<suite>/<repository>/<UTC-pair-id>/
    ├── pair.json
    ├── mcp/
    ├── direct/
    ├── comparison.json
    └── report.md

scripts/
├── benchmark-agent.mjs
├── benchmark-agent.test.mjs
├── benchmark-okf.mjs
└── benchmark-okf.test.mjs

docs/contracts/benchmark.md
benchmark/README.md
```

**Structure Decision**: Keep paired orchestration beside the existing benchmark
runner and scorer. Reuse one arm runner with an explicit `mcp` or `direct` mode;
do not create a new source subsystem or provider interface. Existing single-arm
result layout and commands remain supported.

## Complexity Tracking

No constitution violations or complexity exceptions.
