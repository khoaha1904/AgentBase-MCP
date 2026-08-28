# Implementation plan: Crawler Domain qualification

**Branch**: `054-crawler-domain-qualification`
**Spec**: [spec.md](spec.md)

## Sequence

1. Align high-level Crawler qualification, visualization and query boundaries;
   add `AB-BATCH-014..015`, `AB-QUERY-020` and `AB-VIS-016`.
2. Create two minimal clean Git source fixtures with explicit publisher/worker
   Lambda and shared SQS declarations.
3. Build a deterministic ephemeral Published OKF fixture from those source
   commits plus the existing pipeline repository, preserving per-member
   provenance and accepted relations.
4. Exercise MiniSearch query and visualization projection/site generation,
   asserting independent Resource-node coverage and bounded relation context.
5. Exercise the existing mock SQS Domain Enrichment candidate for `crawler-jobs`
   and assert proposal-only behavior and unchanged Published bytes.
6. Write the generated static snapshot to `AgentBase/domain-hub/crawler`, then
   reconcile docs/spec/tasks and run all repository gates.

## Trade-offs

- Two small fixture repos add a few local Git commits and review surface, but
  make cross-repository evidence reproducible without credentials or model
  variance.
- The generated site is a disposable qualification snapshot; it does not add a
  second Hub authority or alter production ingest latency.
- Only SQS is covered in this slice. Broader AWS coverage remains a later,
  measured expansion rather than speculative resource promotion.
