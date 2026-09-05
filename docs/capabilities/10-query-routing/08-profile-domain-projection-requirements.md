# 10.08 — Profile Domain projection

> Status: G4-C4 and the G5-C1 compact Profile projection are implemented and
> verified.
>
> Release evidence: Required

Product Contracts:
[Query and context](../../product/05-query-and-context.md) and
[Visualization](../../product/06-visualization.md).

Architecture Contracts:
[Ownership](../../architecture/ownership.md),
[flows](../../architecture/flows.md),
[runtime](../../architecture/runtime.md) and
[dependency direction](../../architecture/dependencies.md).

## Current to target

Profile authoring stores the Domain concept/navigation at
`domains/<slug>/index.md` with canonical identity equal to the external
`domains/<slug>` selector. All other standalone roles are discovered from
frontmatter under `knowledge/`.

G4-C4 extends the existing exact-commit Hub graph projection. It classifies the
Published Markdown snapshot through the shared Profile rules, maps the stable
external selector to the actual Domain concept, and derives separate physical
home, semantic participation and one-hop boundary roles. Query and
visualization consume that same result.

This is a contained projection change. It adds no tool, query language, durable
index, migration, registry, database, watcher or service. Exact concept read
remains a one-document operation. Legacy Domain scope keeps its current
eligibility behavior; additive profile metadata makes the snapshot kind
visible.

## Projection model

- Physical `home` comes only from an admitted Profile path.
- `participant` comes only from accepted `part-of` or the existing bounded
  structural association to a Repository that participates in the Domain.
- `boundary` remains one directly connected accepted relation or Flow endpoint.
- Home never creates a relation, and participation never moves a document.
- A concept may be both physically homed and semantically participating in the
  selected Domain; the roles are retained separately rather than collapsed.

`domains/<slug>` remains the MCP selector and compact Domain identity. Legacy
results retain their admitted identity. Visualization nodes add physical home
and selected-Domain roles while keeping the existing primary/boundary rendering
contract; former type folders provide no role or membership signal.

## Requirements

- **AB-PROFILE-READ-001** — Graph-backed Published search and visualization
  classify one exact Markdown snapshot as Profile 1.0, legacy-unprofiled or
  unsupported through the shared Profile implementation. Invalid/unknown
  Profile declarations and invalid Profile layout fail visibly; absence alone
  remains the supported legacy state.
- **AB-PROFILE-READ-002** — In Profile 1.0, the external
  `domains/<slug>` selector resolves only to the exact
  `domains/<slug>/index.md` concept with identity `domains/<slug>`. Exact
  identity/path input remains accepted;
  a missing or non-Domain target fails without fallback. Legacy selector
  resolution is unchanged.
- **AB-PROFILE-READ-003** — The commit-bound graph derives each Profile
  concept's physical Domain or shared home only from the admitted concept path.
  It derives semantic Domain participation only from accepted relations and
  keeps home and participation separately observable.
- **AB-PROFILE-READ-004** — Profile Domain eligibility includes concepts homed
  in the selected capsule plus semantic participants, including the existing
  bounded Repository association. One direct accepted relation/Flow endpoint
  may enter as boundary; no external Domain neighborhood is imported.
- **AB-PROFILE-READ-005** — Scoped Profile search returns the actual Domain
  identity, stable external selector and deterministic `home`, `participant`
  and `boundary` role detail. Physical home alone never appears as canonical
  `part-of`, and an unscoped multi-Domain match still requests clarification.
- **AB-PROFILE-READ-006** — Domain summaries expose the Profile selector
  additively, and graph-backed search exposes the snapshot profile kind. Search
  ranking, type/document/result bounds, freshness, Published-only authority and
  in-memory commit cache remain unchanged.
- **AB-PROFILE-READ-007** — Published visualization resolves the same selected
  Domain and scope projection as query. Its deterministic nodes expose actual
  identity/path, physical home, semantic Domain IDs and selected-Domain roles;
  current accepted edges, Flows, Questions, omissions and bounds are unchanged.
- **AB-PROFILE-READ-008** — The static Domain site visibly labels Profile node
  roles and snapshot profile kind. Presentation labels never change home,
  participation, identity or topology, and generated output remains local,
  exact-commit and disposable.
- **AB-PROFILE-READ-009** — Legacy graph-backed query/visualization retains its
  current Domain eligibility, node membership and paths. The profile-kind field
  is additive; MCP tool names and input schemas, exact Markdown read and
  diagram selection behavior do not change.
- **AB-PROFILE-READ-010** — Profile Enrichment, rehoming, legacy migration and
  final all-mutation admission remain separate Group 4 capability owners. This
  query slice alone makes no compatibility claim. The prior development
  declaration is superseded; G5-C1 compact read/author/query/visualization has
  passed as one release boundary while retaining `qualified_scale: null`.

## Implementation and verification map

- `core/knowledge/documents` owns the reusable snapshot Profile classifier.
- `core/knowledge/query` owns selector resolution and the shared
  home/participation/boundary projection.
- `core/knowledge/visualization` and `app/hub-okf/visualization` consume that
  projection and add presentation labels only.
- Focused Profile, query, visualization and MCP compatibility tests own
  `AB-PROFILE-READ-001..010`; canonical full verification remains the release
  gate.
