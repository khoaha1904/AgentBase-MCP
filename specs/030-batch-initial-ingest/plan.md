# Implementation Plan: Batch Initial Ingest

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Add one bounded coordinator that locks explicit repositories and one Domain,
reuses existing single-repository Initial Ingest sessions sequentially, records
exact member checkpoints and composes them into one atomic multi-repository
proposal. Reuse current OKF validators, inspection, Accept and GitHub publication;
do not add Batch Refresh, model orchestration or a generic workflow engine.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Dependencies**: Existing standard library, code-intelligence provider and
Git-backed Hub; no new production dependency

**Storage**: Private atomic JSON batch manifests/checkpoints under the existing
MCP state root plus ordinary proposal workspaces

**Testing**: Expand existing design-level E2E cases without increasing the
50-test inventory

**Scale**: One Domain, 2..32 explicit repositories, sequential execution

**Constraints**: Same exact Hub base, local read-only sources, no model inside
MCP, no provider CLI, no automatic Accept/Publish, no partial proposal

## Constitution Check

- **Evidence Before Abstraction**: Reuse qualified per-repository evidence and
  compose exact diffs; do not introduce a generic batch framework.
- **Local-First Explicit Authority**: Only explicit roots are read; no recursive
  workspace scan, network or credential boundary is added.
- **Agent-Navigable Ownership**: `app/hub-okf/batch-ingest` owns coordination;
  existing authoring/review/publication public entrypoints remain owners.
- **Cumulative Knowledge**: Sparse success is valid; missing evidence never
  deletes accepted knowledge and membership removal is explicit.
- **Specification and Verification**: AB-BATCH-001..010 map to one disposable
  E2E lifecycle and the canonical offline gate.

Full Feature is required because this adds multi-repository lifecycle, durable
recovery and a new atomic proposal scope. No dependency, migration, credential,
provider or architecture exception is introduced. Post-design re-check: pass.

## Design Decisions

1. Add `src/app/hub-okf/batch-ingest/` for manifest, checkpoint and composition.
2. Preflight stays deterministic; bounded README/docs interpretation remains in
   a new host skill and is supplied back as confirmed Domain evidence.
3. Existing authoring sessions remain repository-owned and start from the same
   manifest base. The coordinator records sessions; it does not author concepts.
4. Composition applies member diffs in manifest order. Concept/Question file
   overlap fails except the one confirmed Domain: its non-navigation content is
   preserved and its navigation is regenerated from exact member-owned targets.
   Shared index files likewise accept only unique append-only targets and are
   regenerated once from the composed tree.
5. A member checkpoint binds source state, guidance/evidence, session and staged
   tree/diff. Retry replaces one failed checkpoint; exact completed siblings are
   reused only after revalidation.
6. Membership revision is a new manifest revision. It reuses exact unaffected
   members and refuses dangling relations, Questions or navigation.
7. Extend the core proposal discriminant with `batch-new` carrying Domain,
   ordered Repository IDs and manifest digest. It never masquerades as one
   source Repository or reuse the existing multi-proposal publication `batch`
   mode.
8. Batch proposals are independent main-based publication units. Existing
   same-Repository Init/Refresh stacking remains unchanged.
9. Add one `agentbase-batch-ingest` skill that drives preflight, sequential
   existing ingest stages, retry/revision and final inspection.
10. Stop after deterministic offline convergence; model qualification and real
   Hub PRs require separate approval.

## Project Structure

```text
src/app/hub-okf/batch-ingest/
├── manifest.ts
├── composition.ts
├── workflow.ts
└── index.ts

src/core/hub/proposal.ts
src/app/hub-okf/mcp/{mcp-tools,mcp-tool-call,mcp-tool-actions}.ts
src/app/hub-okf/{review,publication}/ existing lifecycle extensions
.agents/skills/agentbase-batch-ingest/SKILL.md
```

## Verification Strategy

- Expand one existing Hub lifecycle E2E for three isolated member sessions,
  one atomic proposal and zero pre-Accept mutation.
- Expand the same case for outlier blocking, failure/retry, source/base drift,
  membership removal, index merging and overlap rejection.
- Extend existing publication coverage for one indivisible main-based batch PR.
- Run `npm run depcruise`, focused tests and `npm run verify`.

## Explicit Deferrals

Batch Refresh, mixed modes, parallelism, workspace discovery, enrichment during
ingest, HTML review, real PR creation and model-backed qualification.
