# Bug Assessment: Batch Domain omits descriptively labeled Systems

- **Slug**: batch-domain-system-navigation
- **Created**: 2026-08-22
- **Source**: benchmark V5 `2026-08-22T143631Z`
- **Verdict**: valid
- **Severity**: medium

## Report

The valid two-member batch proposal contains both System concepts, but the
confirmed Domain navigation lists only the first System and two Repository
rows. The second member's System is omitted.

## Symptom

Batch composition is expected by AB-BATCH-006 to regenerate confirmed-Domain
navigation from exact member-owned targets. It silently misses a System when
the agent changes the generated Markdown row suffix from the literal
`- System` to a human-readable description.

## Reproduction

1. Prepare two Initial Ingest members in one new confirmed Domain.
2. Give each member one valid System and replace its generated Domain row role
   suffix with descriptive prose.
3. Record both members and finalize the batch.
4. Observe that the composed Domain navigation omits member Systems.

## Suspected Code Paths

- `src/app/hub-okf/batch-ingest/composition.ts:mergeNewDomain()` — discovers
  member targets by matching presentation text with a literal role suffix.
- `src/app/hub-okf/workspace/local-only-e2e.test.ts` — batch coverage asserts
  Repository navigation only and does not exercise authored System row prose.

## Root Cause Hypothesis

High confidence. The coordinator treats a Markdown presentation row as the
ownership registry. Valid agent enrichment changes that prose without changing
the underlying System concept, so the regular expression drops the target.

## Proposed Remediation

**Preferred**: Derive the current member's Repository and confirmed-Domain
Systems from parsed concepts and exact repository provenance. Preserve only
coordinator-generated prior Batch Navigation rows, then append canonical rows
for the current member. Do not infer ownership from authored prose.

**Files likely to change**:

- `src/app/hub-okf/batch-ingest/composition.ts`
- `src/app/hub-okf/workspace/local-only-e2e.test.ts`

**Tests to add or update**:

- Extend the existing AB-BATCH lifecycle test with one descriptively labeled
  System per member and assert both canonical System targets after composition.

## Risks & Considerations

- Do not include unrelated existing Hub Systems from the same Domain.
- Preserve deterministic member order and reject no additional content.
- No schema, migration, dependency or public API change is required.

## Open Questions

None.
