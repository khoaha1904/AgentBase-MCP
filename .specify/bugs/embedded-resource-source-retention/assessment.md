# Bug Assessment: Embedded resource evidence is not retained in frontmatter

- **Slug**: embedded-resource-source-retention
- **Created**: 2026-08-31
- **Source**: post-publish Crawler Domain visualization at Hub commit `f2f6529ea9ad19ede18a2fbcec24d1f1ae019195`
- **Verdict**: valid
- **Severity**: medium

## Report

Initial Ingest rendered embedded S3, Glue crawler and Athena workgroup rows with
exact evidence in Markdown, but did not retain those evidence records in the
parent concept's frontmatter `sources`. Published visualization therefore
omitted the S3 node and reported unresolved embedded relation endpoints.

## Symptom

The accepted Hub documents are schema-valid and retain readable evidence
bullets, yet `prepare_hub_visualization` cannot resolve embedded resource
evidence because Published projection intentionally trusts frontmatter sources.

## Reproduction

1. Ingest an embedded candidate with candidate-owned resource observations.
2. Materialize and publish its parent concept.
3. Build the Domain site.
4. Observe `embedded-resource-warning: <resource> has no resolved Published evidence`.

## Suspected Code Paths

- `src/app/hub-okf/authoring/initial-ingest-skeleton.ts` — embedded rows and
  evidence bullets are rendered, but only parent candidate sources enter the
  parent frontmatter.
- `src/app/hub-okf/authoring/authoring-session.ts` — Finalize restores embedded
  body rows without restoring their frontmatter source records.
- `src/app/hub-okf/authoring/receipt-authoring.test.ts` — verifies embedded body
  restoration but not retained frontmatter evidence.
- `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md` —
  AB-INGEST-019 does not state that resolved parent sources are part of retained
  embedded evidence.

## Root Cause Hypothesis

Confidence is high. Both skeleton generation and Finalize normalization treat
embedded evidence as body-only presentation. Published projection resolves an
evidence ID through `frontmatter.sources`, so the two contracts are
inconsistent.

## Proposed Remediation

**Preferred**: Add candidate-owned embedded observation sources to the parent
skeleton frontmatter, deduplicated by stable source ID. During Finalize
normalization, restore both missing body rows and missing frontmatter source
records from the frozen Receipt. Extend the existing Receipt authoring test to
prove the parent retains all embedded IDs exactly once.

Do not make projection trust free-form evidence bullets, weaken evidence
resolution or special-case S3/AWS.

**Files likely to change**:

- `src/app/hub-okf/authoring/initial-ingest-skeleton.ts`
- `src/app/hub-okf/authoring/authoring-session.ts`
- `src/app/hub-okf/authoring/receipt-authoring.test.ts`
- `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`

**Tests to add or update**:

- Assert initial and finalized parent frontmatter include embedded resource
  evidence IDs once, including structured and semantic embedded evidence.

## Risks & Considerations

- Source ID ordering must stay deterministic so proposal digests remain stable.
- Existing published documents are not mutated by the code fix and need one
  explicit data repair before their visualization changes.
- Generic embedded kinds still follow projection policy; retaining evidence
  does not automatically promote every provider-neutral row into a node.

## Open Questions

- None.
