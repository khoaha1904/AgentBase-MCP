# 06.00 — Baseline and impact

> Status: AWS/SQS relation/enrichment slice implemented; Published concept
> merge/redirect explicitly deferred beyond MVP.

## Outcome

Section 06 extends the current knowledge graph so a relation can connect
concepts in the same repository, another repository or another Domain without
turning Ingest into a Hub/provider-wide scan. Uncertain matching remains for
Domain Enrichment or review and must not become a canonical edge.

## Reusable baseline

- Concept identity is a normalized OKF path; relation identity is
  `source + predicate + target`.
- `relationships` keeps canonical direction and evidence IDs owned by the source
  concept. The validator requires an existing target and a resolvable Markdown
  link.
- Hub query loads canonical edges, derives inbound traversal and uses only
  `part-of` to derive Domain membership. A cross-Domain edge therefore does not
  make a repository or concept multi-Domain.
- Initial Ingest/Refresh binds one authorized local repository, validates exact
  source evidence and runs one bounded Hub match pass. It does not clone another
  repository, call a provider CLI or investigate an entire Domain.
- Proposal/Accept/Publish provides an atomic review unit; Domain Enrichment can
  reuse that publication lifecycle instead of a separate data store.
- Repository identity has forge ID, remote aliases and Git lineage. This is Git
  repository identity, not cloud-resource/concept identity.

## Remaining gap

Provider-neutral external identity, bounded AWS/SQS verification, Domain
Enrichment and multi-region rules are designed and implemented offline. Real AWS
qualification and other providers remain deferred.

Two Published concepts with strong duplicate identity create only a
Question/merge candidate. Merge/redirect runtime is outside the MVP and is not a
release-blocking gap.

## Impact checkpoint

| Boundary | Impact | Reason |
|---|---|---|
| Relation discovery and one-sided evidence | Contained change | Reuse relation/evidence model; distinguish canonical edge from unresolved candidate. |
| External resource identity and matching | Broad change | Add portable metadata/validation across Ingest, Enrichment and query. |
| Domain Enrichment reconciliation | Broad change | Connect knowledge, provider evidence, Questions and publication across repositories. |
| Provider verification | Broad change | Add adapter, CLI permissions, account/region boundary and recovery. |
| Concept merge/redirect/history | Post-MVP broad change | MVP keeps a Question and two identities; no redirect. |
| Multi-region representation | Contained after identity model | Do not decide encoding before external identity. |

There is no reason to rewrite the relationship graph, OKF documents, Git-backed
Hub or publication lifecycle. Runtime stops at a bounded enrichment proposal;
merging Published identities is not on the critical path.

## Deferred from section 06

- Question lifecycle and conflict presentation belong to section 07.
- Live-value resolution belongs to section 08.
- Ingest/Refresh/Domain Enrichment orchestration belongs to section 09.
- Query response composition belongs to section 10.
- PR mechanics and publication state belong to section 11.

Section 06 defines the contract those workflows use; it does not repeat their
full lifecycle.
