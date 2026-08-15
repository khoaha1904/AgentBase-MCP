# Implementation Plan: Scalable Hub Navigation

**Branch**: `main` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

## Summary

Keep Git-backed Markdown as the complete durable Hub. Normalize newly authored
relationships into one evidenced direction, add ordered flow steps, replace
whole-bundle author validation with changed concepts plus target summaries, and
add domain-aware deterministic search and bounded relationship traversal. Make
root, Domain and System documents the progressive navigation layer, qualify the
behavior at multi-domain scale, then rebuild the Shopping Cart proposal.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript

**Dependencies**: Existing standard library, YAML parser, OKF parser, Git-backed
Hub reader and proposal lifecycle only

**Testing**: `node:test`, generated multi-domain Markdown bundles, disposable
local Hub repositories, deterministic sequential-source fixtures and explicit
real-model qualification after offline gates

**Constraints**: no dependency, daemon, vector store, durable derived graph,
global semantic-answer promise, question ledger, automatic checkout registry or
full-Hub model payload

## Constitution Check

- **Evidence Before Abstraction — PASS**: every canonical edge and flow step
  identifies supporting sources; conflicts remain limitations.
- **Local-First Explicit Authority — PASS**: read/query stays at exact accepted
  local commits and existing proposal review remains the only mutation path.
- **Agent-Navigable Ownership — PASS**: core owns schema/query policy;
  `app/hub-okf` owns Git-backed runtime composition; no second graph service.
- **Cumulative Knowledge — PASS**: re-ingest reads a bounded relevant view while
  the existing lifecycle preserves the full accepted base and foreign sources.
- **Specification and Verification — PASS**: relationship, retrieval, scale and
  failure behavior receive requirement-linked tests before runtime changes.

Post-design re-check: **PASS**. The design adds one core traversal model and one
changed-set validation contract. It reuses current Markdown parsing, Git reads,
Hub transactions and MCP composition without dependency or architecture
exception.

## Design

### Persisted knowledge and navigation

The root index links only `domains/index.md`, `systems/index.md` and
`repositories/index.md` when those entrypoints exist. A Domain concept links
Systems and critical Business Flows; a System concept links its relevant
components, interfaces, flows, resources and infrastructure. Concepts remain
under role-oriented canonical roots with collision-safe qualified slugs. Index
files are navigation, never duplicate concepts.

### Canonical relationships

Store only the canonical direction listed by AB-SCHEMA-019. Each relationship
contains `evidence`, a non-empty list resolving to `sources[].id`. Known newly
authored schemas are strict; unknown types/predicates remain open-world for read
compatibility. MCP derives inbound edges at query time. Business Flow adds a
bounded `flow_steps` extension with ordered endpoints, action, sync/async mode
and evidence.

### Query boundary

For one exact Hub commit, parse bounded Markdown files into transient summaries
and edges inside the request. Search ranks path/title/type/description before
body text and optionally filters by type and Domain reachability. If unscoped
matches belong to several domains, return `scope_required` plus candidate
Domain paths and no bodies. Traversal accepts an exact start, direction, kinds,
depth and result limit and returns summaries and evidenced edges.

### Re-ingest and validation

The authoring checkout still contains the exact full base for proposal safety,
but `prepare` returns only a continuity manifest. It includes current-source
concept summaries, the logical subject, one-hop neighbors and relevant root or
category indexes. A new changed-set validator receives full changed Markdown
and unchanged target summaries; local finalize continues validating exact disk
state and protecting unrelated bytes.

### Qualification

Generated scale fixtures exercise ten domains and at least one thousand
concepts without model cost. Sequential source fixtures prove preservation and bounded
continuity. The Shopping Cart rerun verifies real authoring quality and repairs
the missing frontend/operational boundaries and TTL conflict only where pinned
source evidence supports them. Tokens remain diagnostic.

## Delivery Phases

1. Specification, contracts, checklist, tasks and cross-artifact analysis.
2. Catalog 5.0.0 canonical relationship and flow-step validation.
3. Domain-scoped search, bounded traversal and progressive index policy.
4. Changed-set validation and bounded re-ingest continuity.
5. Generated scale/sequential qualification and Shopping Cart rerun.
6. Convergence, full verification, current docs and replacement Hub PR.

Each completed phase is committed independently.

## Complexity Tracking

No new dependency, process, persistence engine or architecture exception. The
intentional compatibility cost is dual behavior: strict canonical predicates
for newly authored AgentBase drafts while historical/foreign predicates remain
readable and unjudged.
