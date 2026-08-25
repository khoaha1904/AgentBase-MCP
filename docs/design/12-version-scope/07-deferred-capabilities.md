# 12.07 — Deferred capabilities

## Confirmed sequence after the owned-runtime migration

Capability 044 changes supply-chain ownership only. It vendors and qualifies
the selected Codebase Memory and diagram-design sources but activates no new
visual product surface. Later work stays split into independently reviewable
capabilities:

1. **Bounded remote repository reader** — read a specific file or small source
   range through the active MCP-managed GitHub.com/GitHub Enterprise authority
   when Published snapshots are insufficient or the user explicitly requests
   current source. It does not clone or build a remote repository graph.
2. **Published Hub graph review** — derive a read-only local graph from existing
   Published OKF concepts and relations and render it on demand for domain-level
   navigation. The graph is a rebuildable view, not another authority, database
   or continuous service. Local Draft remains in proposal review and is not
   mixed into ordinary Hub visualization.
3. **Query-scoped diagrams** — let the agent use the owned diagram-design skill
   to turn an explicit Hub query/result selection into self-contained local
   HTML/SVG. A generated diagram is a presentation artifact, not new knowledge;
   it never updates Hub unless the user starts the ordinary proposal workflow.

The Hub graph and query diagram solve different jobs and must not be combined
into one UI framework. A future Hub graph capability may evaluate Cytoscape.js
for interactive rendering only when specified; capability 044 adds no such
dependency. GitNexus and Potpie remain architectural references, not AgentBase
runtime dependencies or alternative authorities.

## Post-MVP product capabilities

- Batch Refresh and mixed Init/Refresh batches.
- Additional Domain Enrichment profiles beyond exact AWS SQS, plus provider
  account discovery/scan and background enrichment.
- Automatic conflict-to-`needs-review` inference beyond current exact typed
  evidence. Broad Guidance scope is not planned; broad decisions update the
  relevant Domain/System concept through normal proposals.
- Strong-identity concept merge/redirect and history migration.
- Richer deterministic conflict presentation beyond the current
  `agentbase-query` host composition, only if real use shows it is insufficient.
- Freshness marks in ordinary search/read and persisted freshness reports.
  Local reporting and scheduled CI are implemented; query overlay is not an MVP
  direction.
- Richer graph review interactions beyond the bounded Published Hub view above,
  only if real use proves the first read-only view insufficient.
- Azure/GCP profiles and additional released detectors.
- Semantic profile migration when real Published knowledge is affected.
- Safe cleanup of Published proposal artifacts after shared Questions become
  fully rebuildable from Hub documents.

## Explicitly not implied

Deferred does not mean scaffolding now. MVP adds no empty adapter, database,
daemon, scheduler, generic resolver, feature flag or compatibility layer for
these capabilities. Mỗi capability quay lại SDD khi có concrete user flow và
evidence cần nó.
