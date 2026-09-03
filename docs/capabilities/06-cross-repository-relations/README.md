# 06 — Cross-repository relations

> Status: AWS/SQS runtime slice implemented offline; Published merge/redirect is
> deferred beyond MVP; separate real-provider qualification remains.

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — reusable parts,
  gaps and the impact checkpoint before deeper design.
- [`01-relation-discovery.md`](01-relation-discovery.md) — canonical relation,
  unresolved candidate and source evidence.
- [`02-resource-identity-matching.md`](02-resource-identity-matching.md) —
  provider-neutral external identity, scope and strong match candidate.
- [`03-domain-enrichment-reconciliation.md`](03-domain-enrichment-reconciliation.md)
  — reconcile multiple Published repositories into one atomic Enrichment Draft.
- [`04-provider-verification.md`](04-provider-verification.md) — verify exact
  candidates read-only through released provider CLI profiles.
- [`05-concept-merge-and-history.md`](05-concept-merge-and-history.md) — MVP
  duplicate boundary; Published merge/redirect is a separate post-MVP capability.
- [`06-multi-region-resources.md`](06-multi-region-resources.md) — logical
  concept, regional deployment references and split boundary.
- [`07-runtime-requirements.md`](07-runtime-requirements.md) — stable
  `AB-ENRICH-*` requirements for bounded Domain Enrichment runtime.
- [`08-mock-provider-qualification.md`](08-mock-provider-qualification.md) —
  fixture-only mock CLI/provider path for cross-repository candidates without
  creating fake provider truth in the Published Hub.

## Current dependency

Relation candidates and external identity underpin reconciliation, provider
verification and multi-region handling. Published merge/redirect is removed from
the MVP and returns only as a separate capability when real need appears.
