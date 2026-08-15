# Implementation Plan: Evidence-First Benchmark Readiness

**Branch**: `main` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

## Summary

Replace the implemented all-metrics-at-80% readiness gate with a deterministic
`reviewable`/`invalid` assessment. Structural, provenance, relationship and known
contradiction failures remain hard gates; missing non-exhaustive reference
coverage becomes diagnostic. Re-score the retained v2 evidence, add one bounded
content-only relationship-set validator for the proven cross-document gap, then
exercise the same immutable v3 behavior on both structurally different fixtures.
Do not add fixture hints, question storage, AWS access or dependencies.

## Technical Context

**Language/Version**: Node.js 24 TypeScript runtime plus JavaScript benchmark
scripts and JSON/Markdown artifacts

**Primary Dependencies**: Existing Node.js standard library and AgentBase OKF
parser/schema catalog only

**Storage**: Existing immutable prompt/run artifacts plus regenerated
deterministic metrics/reports

**Testing**: `node:test`, fake agent execution, retained real artifacts and
canonical `npm run verify`

**Target Platform**: Local CLI; real model execution remains explicit opt-in

**Project Type**: Repository-owned benchmark inside the modular monolith

**Performance Goals**: No efficiency target in this slice; preserve exact usage
and report regressions honestly

**Constraints**: No gold leakage, no fixture-specific prompt, no automatic OKF
acceptance, no external authority, no historical raw-agent-output rewrite

**Scale/Scope**: One core relationship validator, one MCP tool adapter, scorer
reuse, immutable v3 prompts and two pinned structurally different repositories

## Constitution Check

- **Evidence Before Abstraction — PASS**: the redesign follows measured v2
  evidence and explicitly limits what deterministic scoring can prove.
- **Local-First Explicit Authority — PASS**: all canonical checks are offline;
  one new model run remains opt-in and no AWS/cloud authority is added.
- **Agent-Navigable Ownership — PASS**: generic relationship validation belongs
  to `core/knowledge`; MCP exposure remains in `app/codebase-memory-mcp`; the
  benchmark consumes the public core entrypoint.
- **Cumulative Knowledge — PASS**: raw prompts, traces and authored OKF remain
  immutable; only deterministic derived metrics may be regenerated visibly.
- **Specification and Verification — PASS**: owner amendments are captured in
  active capability 014 before the new implementation slice.

Post-design re-check: **PASS**. The safe MCP surface gains one bounded
content-only tool; no dependency, provider, credential, migration, persistence
or arbitrary filesystem authority is added.

## Project Structure

```text
scripts/
├── benchmark-okf.mjs          # classification, assessment and reports
└── benchmark-okf.test.mjs     # hard-gate and non-exhaustive-reference tests

src/
├── core/knowledge/             # reusable relationship-set validation
└── app/codebase-memory-mcp/    # bounded MCP tool adapter

benchmark/
├── prompts/okf-author-v3.md
├── prompts/okf-author-direct-v3.md
├── repos/aws-serverless/expected/
└── results/aws-serverless/<repository>/<run-id>/

docs/
├── PRODUCT.md                 # future question-management intent only
└── contracts/benchmark.md     # living behavior after acceptance
```

**Structure Decision**: The retained v2 bundle proves the general failure. Reuse
one core validator from both scorer and MCP rather than maintaining benchmark-
only relationship logic. Historical prompts and raw results remain immutable.

## Design

### 1. Reviewability hard gates

Derive one assessment after semantic scoring:

- `invalid` for failed arm lifecycle, empty bundle, OKF/draft/schema validation
  failure, repository-identity/provenance violation, declared relationship with
  missing target/link or a kind unsupported by the authored source schema, or a
  curated recognized concept with a contradictory concrete schema;
- `reviewable` when none of those hard failures exist, even if reference coverage
  is incomplete or some valid authored output remains unjudged.

The report must state that reviewable means suitable for human review, not true,
complete or accepted.

### 2. Non-exhaustive reference classification

Keep deterministic semantic matching and classify:

- `confirmed`: authored identity matches a curated reference and its concrete
  schema agrees;
- `contradicted`: a recognized identity conflicts with a curated hard fact;
- `unjudged`: authored output has no curated match and no known contradiction;
- `missing`: curated reference knowledge was not authored.

Do not compute concept/schema “precision” by treating unjudged output as false.
Retain reference recall, metadata, provenance and relationship coverage as
diagnostics. Preserve raw lists so a human can inspect review burden.

### 3. Relationship and provenance integrity

Reuse parsed bundle data to check that each declared relationship has a target
concept, a resolving Markdown link and a kind listed by the authored concept's
known schema guidance. Existing normalized repository-source validation remains
the provenance hard gate. Do not claim that path validity proves semantic
relevance.

### 4. Existing evidence migration

Do not touch v2 prompt, trace, final message or OKF bytes. Regenerate only
`metrics.json`, arm `report.md`, `comparison.json`, pair `report.md` and final
pair status using the accepted scorer. Record that the scoring contract changed.

### 5. Heterogeneity evidence

First prove all assessment branches offline. Retain the exact v2 Health Aware
failure, then run the same immutable v3 MCP/direct pair on Health Aware and
shopping cart. If either fails, fix only a general hard-gate/tool issue
reproducible without fixture answers.

### 6. Efficiency boundary

Always retain usage and elapsed evidence. Compare efficiency only alongside
quality status. This capability may conclude “quality reviewable, efficiency not
good enough”; it does not optimize tool payloads.

### 7. General relationship-set validation

Accept a bounded array of `{ identity, path, content }`; never accept an output
directory or read caller-selected files. Parse content with existing OKF bounds,
require unique identities, and check each declared relationship against the
target identity/path, Markdown resolution and known source-schema guidance.
Unknown schemas remain portable and their linked relationships are not rejected.

Expose this as `validate_okf_relationships`. The v3 MCP prompt calls it once
after per-concept validation and repairs failures. Benchmark lifecycle requires
the call. The direct arm receives the same shared rules but no MCP capability.

### 8. v3 heterogeneous evidence

After offline verification and a phase commit, run fresh v3 pairs for Health
Aware and shopping cart. Preserve exact quality/efficiency evidence and stop on
another general hard failure instead of tuning repository answers.

## Complexity Tracking

No constitutional violations or complexity exceptions.
