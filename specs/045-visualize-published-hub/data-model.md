# Data Model: Published visualization

## PublishedVisualizationProjection

- `schemaVersion`: exact projection contract version.
- `hub`: remote identity and exact Published commit.
- `domain`: exact Domain concept ID, path and title.
- `nodes`: ordered `VisualizationNode[]`.
- `edges`: ordered `VisualizationEdge[]`.
- `flows`: ordered `VisualizationFlow[]`.
- `questions`: ordered `QuestionBadge[]`.
- `omissions`: ordered `ProjectionOmission[]`.

Validation: one Domain only; concept IDs and endpoints resolve within the
projection; fixed bounds fail instead of truncating.

## VisualizationNode

- existing concept ID/path/type/title/description;
- Domain IDs and structural parent IDs;
- repository/system grouping IDs when derivable;
- safe provenance references suitable for display.

No coordinates, colors or renderer settings.

## VisualizationEdge

- stable ID derived from declared subject, predicate and object;
- canonical predicate and declared endpoints;
- descriptor-derived display endpoints;
- `structural` or `runtime` direction class;
- evidence source IDs.

## VisualizationFlow

- Flow concept ID;
- ordered steps with source, action, target, mode and evidence IDs.

Steps are contiguous from one. Projection does not synthesize missing steps.

## QuestionBadge

- Question ID, subject concept ID, state, kind and property.

Only `open` and `needs-review` attach. Questions remain metadata, not nodes.

## DiagramPacket

- projection identity;
- `architecture`, `dependency` or `sequence` type;
- bounded selected nodes/edges/flow;
- visible omissions and insufficiency outcome.

Limits: 64 nodes, 256 edges and 64 Flow steps.

## DomainSiteBuildReceipt

- receipt schema and generator versions;
- Hub identity, exact commit and Domain ID;
- projection version;
- node/edge/flow counts;
- relative generated paths and SHA-256 digests.

The receipt contains no generated timestamp, credential, live endpoint or local
absolute path so identical source/build inputs remain reproducible.

## State transitions

```text
Published commit
  -> validated projection
     -> diagram packet -> presentation artifact
     -> Domain snapshot -> staged site -> atomic output directory
```

No transition writes back to Hub. A failed site build removes staging and leaves
an existing output untouched.
