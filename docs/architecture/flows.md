# Cross-capability flows

> Status: Accepted sequencing and authority baseline; update when a
> cross-capability flow or authority transfer changes.

These flows define system sequencing and authority transfer. Detailed behavior,
bounds and failure recovery remain in the linked Capability Contracts.

## Repository knowledge flow

```text
Repository Reading
        ↓ bounded source evidence
Concept Discovery
        ↓ qualified candidates
Schema Selection
        ↓ provider-neutral roles
Knowledge Entry
        ↓ local proposal
Ingest / Refresh
        ↓ reviewable change
Review and Publish
```

Repository Reading never writes shared knowledge. Discovery and Schema
Selection classify evidence without acquiring publication authority. Knowledge
Entry renders a local proposal; only Review and Publish may advance shared Hub
state.

Refresh freezes its bounded source-change set in the authoring session. Finalize
checks one outcome for every returned path and retains that accounting in the
proposal inspection beside omitted counts and source-diff limitations. The
accounting is review context, not an OKF concept or independent state authority.

Routes: [Repository Reading](../capabilities/01-repository-reading/README.md),
[Concept Discovery](../capabilities/03-concept-discovery/README.md),
[Schema Selection](../capabilities/04-schema-selection/README.md),
[Knowledge Entry](../capabilities/05-knowledge-entry/README.md),
[Ingest/Refresh](../capabilities/09-ingest-and-refresh/README.md), and
[Review/Publish](../capabilities/11-review-and-publish/README.md).

## Query and context flow

```text
Exact Published Hub commit
        ↓ commit-bound projection
Query Routing
        ├─→ bounded answer context
        ├─→ Phase 1 AI-SDLC context / impact view
        └─→ Published Visualization projection

Authorized local Repository revision
        ↓ bounded Code Graph/source queries
Phase 2 AI-SDLC context
        └─→ session-local implementation impact view
```

Query and presentation consume accepted knowledge; they do not overlay Local
Draft or mutate Hub state. AI-SDLC and visualization outputs remain derived and
rebuildable. The Phase 2 implementation view is owned by AI-SDLC context rather
than Published Visualization: exact files, symbols and source edges retain the
authorized repository revision and are never written to Hub or a durable graph
artifact.

The Published Visualization branch may expand standardized, evidence-backed
embedded resource rows into presentation-only references. Those references
remain owned by their Published parent, use only an `embedded-in` presentation
link and never become accepted OKF concepts or canonical runtime relations.

Routes: [Query Routing](../capabilities/10-query-routing/README.md),
[AI-SDLC Context](../capabilities/14-ai-sdlc-context/README.md), and
[Visualization](../capabilities/13-visualization/README.md).

## Enrichment flow

```text
Published Domain knowledge + bounded provider observation
        ↓
Cross-repository relation reconciliation
        ↓
Questions / Guidance when evidence is unresolved
        ↓
local enrichment proposal
        ↓
Review and Publish
```

Provider adapters own observation transport, not knowledge decisions.
Enrichment reconciles only admitted Published inputs and produces a proposal;
unresolved evidence stays explicit rather than becoming an inferred fact.

Routes: [Relations and Enrichment](../capabilities/06-cross-repository-relations/README.md),
[Questions and Guidance](../capabilities/07-conflicts-and-questions/README.md), and
[Review/Publish](../capabilities/11-review-and-publish/README.md).

## Publication flow

```text
Local proposal
    ↓ inspect
Review
    ↓ explicit accept
Accepted local change
    ↓ submit
Git branch / pull request
    ↓ external merge + explicit synchronization
Published Hub commit
```

Prepare, review, accept, submit, external merge and synchronization remain
distinct transitions. Failure preserves the last admitted state and exposes a
recovery action; no lower layer silently skips a transition.
