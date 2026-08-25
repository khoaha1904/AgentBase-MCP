# MCP Contract: `prepare_hub_visualization`

One goal-level tool serves both visualization skills. It reads Published Hub in
both modes; only `domain-site` writes an explicit local output directory.

## Input

```json
{
  "mode": "diagram | domain-site",
  "domain": "domains/<slug>",
  "diagram_type": "architecture | dependency | sequence",
  "concept_ids": ["systems/example"],
  "output_directory": "/explicit/local/path",
  "visibility_acknowledged": true
}
```

Rules:

- `diagram_type` and `concept_ids` are required only for `diagram`.
- `output_directory` and `visibility_acknowledged: true` are required only for
  `domain-site`. The path must identify a new or empty non-root directory
  explicitly selected by the caller; acknowledgment proves the visibility
  warning was presented before the write-capable call.
- Diagram selection accepts at most 64 unique IDs.
- Unknown fields, arbitrary cross-Domain selections and Local Draft identity are
  rejected. Direct external endpoints already present as projection boundary
  nodes may be included only with their accepted connecting edge.

## Diagram result

```json
{
  "status": "ready | insufficient-data",
  "mode": "diagram",
  "commit": "<sha>",
  "domain": "domains/<slug>",
  "packet": {},
  "reasons": []
}
```

`insufficient-data` is a successful truthful outcome and carries no invented
packet topology.

## Domain-site result

```json
{
  "status": "built",
  "mode": "domain-site",
  "commit": "<sha>",
  "domain": "domains/<slug>",
  "output_directory": "/explicit/local/path",
  "receipt": "agentbase-build.json",
  "warnings": ["Static snapshot; regenerate to update"]
}
```

The tool never creates a repository, pushes Git, configures Pages or overwrites
a non-empty directory.

## Failure classes

- Published Hub unavailable or changed during the operation;
- Domain/selection invalid;
- projection or output bounds exceeded;
- output target unsafe/non-empty;
- local renderer dependency unavailable or drifted;
- staged generation or digest verification failed.
