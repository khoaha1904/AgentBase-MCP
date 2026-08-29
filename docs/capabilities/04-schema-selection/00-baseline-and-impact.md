# 04 — Current baseline and impact

> Status: Catalog 7 implementation is the current authority.

## Current baseline

- Catalog version: `7.0.0`.
- Initial Ingest roles: Repository, Domain, System, Component, Function,
  Interface, Flow and Resource.
- Entity/Metric are enrichment-only; Question/Guidance are workflow-managed.
- Guidance separates technology detection, standalone/embedded disposition and
  schema selection.
- The OKF parser remains open-world: foreign/legacy types are read and
  preserved.

## Changes from the original design

Catalog 6 defined more than 20 roles such as Server, Queue, Database Table and
Infrastructure Module. Benchmarking showed that a broad catalog made the Agent
spend effort choosing schemas and promoted implementation details into concept
files. Catalog 7 replaces it with eight general boundaries; queue/table/bucket/
host usually become embedded knowledge with technology metadata and exact parent
evidence.

This is a clean cutover because no catalog-6 concept was Published. Code Graph,
the OKF document model, relationships and Hub lifecycle remain unchanged.

## Remaining gap

Azure/GCP profiles, the SAM/CloudFormation detector, provider verification and
semantic profile migration are not in the current MVP.
