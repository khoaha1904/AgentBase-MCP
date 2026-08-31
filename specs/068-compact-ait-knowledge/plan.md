# Implementation Plan: Compact AIT knowledge

**Branch**: `feature/refresh-change-accounting` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

## Summary

Reuse the existing catalog, embedded-knowledge renderer, Hub search, Published
projection and AIT harness. Tighten authoring guidance, remove generated
architecture category indexes, add meaningful runtime edge guidance, make
Refresh scoring placement independent and expand concrete embedded rows only in
the visualization projection. Do not migrate concept paths or redesign provider
observations.

## Upstream Contracts

- **Product Contract**: Repository Understanding, Knowledge Model and AI SDLC
  Context named in `spec.md`.
- **Architecture Contract**: existing Published Hub → Phase 1 and local source →
  Phase 2 direction remains unchanged.
- **Capability Contract**: Knowledge Entry, Query and Benchmark routes named in
  `spec.md`.
- **Affected Requirements**: `AB-SCHEMA-057..060`, `AB-BENCH-091..095`,
  `AB-VIS-015..019` and `AB-CONTEXT-VIS-009`.
- **Baseline Commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Technical Context

**Language/Version**: TypeScript and Node.js 24.12; benchmark manifests are JSON

**Dependencies**: existing OKF parser, schema catalog, search and benchmark
runner; no new package

**State**: generated pre-release Hub data is disposable, but reset occurs only
after code and verification pass

**Testing**: focused schema/skeleton/benchmark tests, then `npm run verify`

## Implementation Decisions

| Concern | Choice | Reason |
|---|---|---|
| Consolidation | Runtime/ownership parent plus embedded rows | Smallest useful human/AIT unit |
| Full-stack | Separate independently deployed Components | Preserves impact and compatibility boundaries |
| Navigation | Root entrypoints only; derive category views | Removes maintained noise without path migration |
| Runtime edges | Add publish/read/write guidance | Fewer nodes need more meaningful edges |
| Refresh scoring | Placement-independent semantic obligations | Prevents fixture shape from becoming product design |
| AIT label | Reserve for actual AIT comparison | Keyword recall is not downstream usefulness |
| Provider metadata | Leave envelope unchanged | No evidence yet justifies a second broad migration |
| Embedded visualization | Parse the standardized Markdown table into presentation-only Resource references | Richer map without new concept files or YAML |
| Embedded containment | Retain `embedded-in` in projection but hide it in the default site | Parent context stays queryable without a misleading line |
| Embedded runtime edges | Parse one bounded evidence-backed Markdown table | Useful arrows without new concepts or canonical OKF relations |
| Identity grouping | Exact normalized ARN only across parents | Strong match without name-based false merges |
| Evidence drawer | Group repository citations by file with exact disclosure | Keeps auditability without a wall of line spans |
| Domain/Repository layout | Domain in page header; compact Repository cards inside fixed renderer regions | Keeps repository content selectable without making the whole boundary a node |
| Interaction | Constrain normal-node dragging to ownership zones; keep Repository cards/regions fixed and resettable | Lets reviewers untangle arrows without misrepresenting ownership |
| Flow presentation | Show step arrows initially and render the Flow concept as a compact label | Makes ordered behavior visible without an isolated duplicate node |
| System selection | Highlight direct `part-of` members from Published parent identities | Exposes membership on demand without drawing structural arrows |
| Outside-node placement | Derive Repository affinity from visible edge endpoints; place beside one region, between several or in the fallback lane | Shortens real arrows without changing knowledge membership |

## Validation Mapping

| Requirement | Evidence |
|---|---|
| `AB-SCHEMA-057..059` | authoring guidance and three-shape skeleton/schema tests |
| `AB-SCHEMA-060` | root-only navigation regression |
| `AB-BENCH-091..095` | profile/semantic-assessment tests and corrected prompt fixture |
| `AB-VIS-008`, `AB-VIS-015..023`, `AB-CONTEXT-VIS-009` | embedded projection, identity, relation and static-site presentation tests |

## Complexity Tracking

No taxonomy migration, new Hub field, concept file, tool, dependency, model SDK,
durable evaluator state or automatic publication. Projection schema advances
for disposable generated output. Only the disposable qualification fixtures add
the optional evidence-backed relation table; no Hub schema or migration changes.
