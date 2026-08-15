# Implementation Plan: Canonical OKF Graph

**Branch**: `main` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

## Summary

Make proposal subject a logical review label rather than a directory ownership
boundary. Permit validated current-source changes to canonical generated
concepts, retain protected/foreign knowledge, revise the schema catalog and
authoring skill around useful entity boundaries, then add a v5 usefulness
assessment and sequential multi-repository qualification.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript

**Dependencies**: Existing standard library, YAML parser, OKF bundle/proposal
logic and Git-backed Hub transaction only

**Testing**: `node:test`, disposable local Hub repositories, deterministic
benchmark fixtures and `npm run verify`

**Constraints**: no dependency, migration rewrite, question sidecar, cloud
authority, fixture-specific authoring rule or hidden model call

## Constitution Check

- **Evidence Before Abstraction — PASS**: canonical paths are selected only for
  source-backed useful entities; unknown boundaries remain limitations.
- **Local-First Explicit Authority — PASS**: proposal review and the existing
  atomic local accept transaction remain the only mutation authority.
- **Agent-Navigable Ownership — PASS**: core owns schema/relationship policy;
  `app/hub-okf` owns proposal scope; benchmark remains under `scripts/`.
- **Cumulative Knowledge — PASS**: foreign evidence and protected bytes survive
  later repository contributions; no automatic migration is introduced.
- **Specification and Verification — PASS**: requirements and failure behavior
  are recorded before runtime changes and receive requirement-linked tests.

Post-design re-check: **PASS**. The minimal architecture change reuses the
existing proposal digest, review and Git transaction. It changes only admission
of concept/index diffs and does not add a new storage or transaction engine.

## Design

### Canonical graph

Concept paths use stable entity categories: `domains/`, `systems/`,
`components/`, `interfaces/`, `flows/`, `resources/`, `infrastructure/`,
`deployments/` and `repositories/`. Containment and implementation are links,
not duplicated directory trees. Existing unknown and historical paths continue
to load unchanged.

### Proposal scope

`subject` identifies the logical review focus and may name any admitted
canonical category. `sourceRepositoryId` independently identifies evidence.
New proposals may add selected concepts across canonical roots. Refresh may
modify an existing mutable AgentBase draft only when the proposed concept cites
the current source; sources owned by other repositories must remain. Existing
indexes outside a legacy subject are additive-only. Protected concepts and
non-index ancillary files remain byte-preserved.

### Catalog and authoring

Catalog 4.0.0 adds the general architectural types and changes path guidance.
Fine-grained endpoint, Lambda and resource schemas remain compatible, but
ordinary route evidence selects API Surface and reusable/deployed
infrastructure is distinguished. `Open Question` remains known for round-trip
compatibility but is absent from active selection guidance.

### Benchmark v5

V5 removes `benchmark_key` from authored OKF. Reference identities live only in
the hidden expectation and are matched using stable semantic anchors. The
scorer retains validity and coverage diagnostics, and adds owner-review
usefulness findings for duplicate identity, fragmentation and body substance.
An offline three-source Hub scenario proves sequential preservation; real model
runs remain explicit after offline gates pass.

## Complexity Tracking

No dependency or architecture-baseline exception. The only intentional
compatibility cost is retaining legacy concrete schema types and proposal
subjects while changing their recommendation and write-scope semantics.
