# Bug Assessment: System repository relation is unjudged

- **Slug**: system-repository-relation
- **Created**: 2026-08-21
- **Source**: benchmark probe `2026-08-21T162053Z`
- **Verdict**: valid
- **Severity**: low

## Report

Finalize rejected `systems/aws-health-aware implemented-in
repositories/aws-health-aware` because released System schema guidance did not
judge the relation.

## Symptom

A System can link to Repository and `implemented-in` is a canonical
source-ownership predicate, but System guidance permits only `part-of Domain`.
An exactly evidenced System-to-Repository relation therefore fails strict
proposal validation.

## Reproduction

1. Author a System and Repository in one changed set.
2. Add a resolving Markdown link and an evidenced `implemented-in` relation from
   the System to the Repository.
3. Run strict changed-set validation.
4. Observe that System guidance leaves the relation unjudged.

## Suspected Code Paths

- `src/core/knowledge/schemas/definitions/foundation.ts` — System relationship
  guidance omits canonical source ownership.
- `src/core/knowledge/schemas/catalog.test.ts` — does not pin the System relation.

## Root Cause Hypothesis

High confidence. System already allows Repository links and asks which
repository sources prove its boundary, but its relationship guidance was not
updated alongside other source-backed concept schemas.

## Proposed Remediation

**Preferred**: Add `implemented-in -> Repository` with source ownership evidence
to System relationship guidance. Extend the existing catalog boundary test.

**Files likely to change**:

- `src/core/knowledge/schemas/definitions/foundation.ts`
- `src/core/knowledge/schemas/catalog.test.ts`
- `docs/contracts/okf.md`
- `specs/022-single-repository-ingest/spec.md`

**Tests to add or update**:

- Assert that System judges `implemented-in` only for Repository targets.

## Risks & Considerations

- No new predicate, schema type, migration or inverse relation.
- Evidence and resolving-link validation remain mandatory.

## Open Questions

None.
