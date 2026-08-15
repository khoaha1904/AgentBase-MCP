# MCP Contract: Scalable Hub Navigation

## Search accepted Hub

`search_hub_okf` accepts:

- `query`: required literal query text;
- `domain`: optional exact Domain identity or path;
- `types`: optional bounded exact type list;
- `limit`: optional result bound.

It returns either bounded exact-commit matches or `scope_required` with Domain
candidates. It does not claim semantic answers and does not return all matched
concept bodies.

## Traverse accepted Hub

`traverse_hub_okf` accepts:

- `start`: exact canonical identity/path;
- `direction`: `outbound`, `inbound` or `both`;
- `kinds`: optional canonical predicate filter;
- `max_depth`: 1–3;
- `limit`: 1–100 nodes.

It returns exact-commit node summaries, evidenced edges and `truncated`.

## Validate changed concepts

`validate_okf_changes` accepts:

- `changes`: 1–64 full concept documents, using existing per-document and
  aggregate byte bounds;
- `targets`: 0–512 unchanged identity/path/type summaries.

It validates draft/schema policy, canonical relationship/flow-step shape,
evidence references, target existence/type and resolving Markdown links. It
does not read caller-selected paths.

## Prepare authoring continuity

`prepare_hub_okf` retains its current inputs and adds a bounded `continuity`
result. The result never embeds unrelated concept bodies. The exact full Hub
checkout remains private proposal lifecycle state.
