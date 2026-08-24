# 12.07 — Deferred capabilities

## Post-MVP product capabilities

- Batch Refresh and mixed Init/Refresh batches.
- Additional Domain Enrichment profiles beyond exact AWS SQS, plus provider
  account discovery/scan and background enrichment.
- Question-governance enrichment beyond the implemented AWS/SQS three-tier
  packet: automatic conflict-to-`needs-review` inference and Repository/Domain/
  Hub-wide Guidance scope.
- Strong-identity concept merge/redirect and history migration.
- Full conflict-aware query composition across competing claims, Questions and
  applicable Guidance; MVP only preserves and exposes the governed documents.
- Freshness marks in ordinary search/read and persisted freshness reports.
  Local reporting and scheduled CI are implemented; query overlay is not an MVP
  direction.
- Static local HTML/graph review, only if structured review proves insufficient.
- Remote repository file reader through MCP-managed authority.
- Azure/GCP profiles and additional released detectors.
- Semantic profile migration when real Published knowledge is affected.
- Safe cleanup of Published proposal artifacts after shared Questions become
  fully rebuildable from Hub documents.

## Explicitly not implied

Deferred does not mean scaffolding now. MVP adds no empty adapter, database,
daemon, scheduler, generic resolver, feature flag or compatibility layer for
these capabilities. Mỗi capability quay lại SDD khi có concrete user flow và
evidence cần nó.
