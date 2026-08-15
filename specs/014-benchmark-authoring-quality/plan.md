# Implementation Plan: Evidence-First Benchmark Readiness

**Branch**: `main` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

## Summary

Replace the implemented all-metrics-at-80% readiness gate with a deterministic
`reviewable`/`invalid` assessment. Structural, provenance, relationship and known
contradiction failures remain hard gates; missing non-exhaustive reference
coverage becomes diagnostic. Re-score the retained v2 evidence, then use the
same v2 prompt on the existing structurally different shopping-cart fixture.
Do not add fixture hints, question storage, AWS access, dependencies or MCP tools.

## Technical Context

**Language/Version**: Node.js 24 JavaScript benchmark scripts and JSON/Markdown
artifacts

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

**Scale/Scope**: One scorer/report owner, existing v2 prompts, two pinned
structurally different repositories

## Constitution Check

- **Evidence Before Abstraction — PASS**: the redesign follows measured v2
  evidence and explicitly limits what deterministic scoring can prove.
- **Local-First Explicit Authority — PASS**: all canonical checks are offline;
  one new model run remains opt-in and no AWS/cloud authority is added.
- **Agent-Navigable Ownership — PASS**: benchmark scoring remains in
  `scripts/benchmark-okf.mjs` with colocated tests.
- **Cumulative Knowledge — PASS**: raw prompts, traces and authored OKF remain
  immutable; only deterministic derived metrics may be regenerated visibly.
- **Specification and Verification — PASS**: owner amendments are captured in
  active capability 014 before the new implementation slice.

Post-design re-check: **PASS**. No dependency, provider, process lifecycle,
credential, migration or architecture exception is planned.

## Project Structure

```text
scripts/
├── benchmark-okf.mjs          # classification, assessment and reports
└── benchmark-okf.test.mjs     # hard-gate and non-exhaustive-reference tests

benchmark/
├── prompts/okf-author-v2.md
├── prompts/okf-author-direct-v2.md
├── repos/aws-serverless/expected/
└── results/aws-serverless/<repository>/<run-id>/

docs/
├── PRODUCT.md                 # future question-management intent only
└── contracts/benchmark.md     # living behavior after acceptance
```

**Structure Decision**: Reuse the scorer and existing fixtures. No new runtime
module or prompt version is justified unless a general failure appears on both
offline evidence and the unlike repository.

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

First prove all assessment branches offline. Re-score `aws-health-aware` and
confirm it becomes reviewable with incomplete coverage visible. Then run the
same immutable v2 MCP/direct pair on `aws-serverless-shopping-cart`. If it fails,
fix only a general hard-gate/tool issue reproducible without fixture answers.

### 6. Efficiency boundary

Always retain usage and elapsed evidence. Compare efficiency only alongside
quality status. This capability may conclude “quality reviewable, efficiency not
good enough”; it does not optimize tool payloads.

## Complexity Tracking

No constitutional violations or complexity exceptions.
