# Bug Assessment: Cross-boundary Flow cannot reuse endpoint evidence

- **Slug**: flow-cross-candidate-evidence
- **Created**: 2026-08-21
- **Source**: sequential replica `2026-08-21T165314Z`
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

The first post-AB-INGEST-014 probe completed with `review_ready`. Its sequential
replica stopped at `get_okf_authoring_schemas`: a proposed cross-boundary Flow
cited one Function-owned observation together with its own schedule and event
processing evidence. MCP rejected the whole request because every candidate
evidence ID currently must be owned by that same candidate.

## Symptom

A Flow that exists to connect independently useful concepts cannot reuse their
already submitted observations as supporting evidence. The caller must duplicate
the same source observation under another ID and candidate solely to satisfy the
request shape, or abandon the Flow.

## Reproduction

1. Submit standalone Function, Resource and Flow candidates.
2. Give the Flow an explicit `cross-boundary` promotion basis with Flow-owned
   evidence.
3. Include one Function-owned observation in the Flow's supporting
   `evidence_ids`.
4. Observe schema guidance fail with `cites evidence owned by another candidate`.

## Root Cause Hypothesis

Confidence: high. Candidate evidence ownership was designed for attribution but
is applied uniformly to Flow, whose purpose is to describe behavior across
other concept boundaries. The contract has no separate endpoint-evidence field,
so strict single ownership forces duplicate observations.

## Proposed Remediation

Allow only a standalone `Flow` with `promotion.basis: cross-boundary` to cite
supporting observations owned by other standalone concept candidates in the
same bounded request. Keep the Flow's promotion evidence candidate-owned. Keep
all other candidates, embedded candidates, unknown evidence and source-shape
checks unchanged.

## Risks & Considerations

- Broad cross-candidate reuse would weaken attribution and is out of scope.
- Reused evidence supports the Flow narrative; it does not prove a new endpoint
  identity or bypass final relation/source validation.
- The first probe's optional Flow/Resource and duplicated body headings remain
  review observations, not hard validity failures.

## Open Questions

- Owner approval is required before changing the attribution contract.
