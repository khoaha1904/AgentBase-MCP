# 12.07 — Deferred capabilities

## Post-MVP product capabilities

- Batch Ingest and recoverable batch checkpoints.
- Domain Enrichment with bounded provider CLI verification.
- Question-governance enrichment: batch resolution, automatic conflict-to-
  `needs-review` inference and Repository/Domain/Hub-wide Guidance scope.
- Full conflict-aware query composition across competing claims, Questions and
  applicable Guidance; MVP only preserves and exposes the governed documents.
- Published/Local Draft query overlay and freshness presentation/CI report.
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
