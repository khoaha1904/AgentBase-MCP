# 08.04 — Snapshot query and current-source reads

> Trạng thái: Snapshot query đã implement; explicit current-source read tiếp tục dùng normal authorized tools.

## Snapshot action

`read_hub_observed_values` replaces `read_hub_live_evidence`. It reads one exact
Published/Local Draft Hub view and returns bounded entries with concept path,
ID, subject, property, role, value, source resource, observed revision/time,
exact age and `source_access: not-checked`. It performs no repository access,
credential probe, graph indexing or write-back.

Part 10 supplies the exact query view. Every result retains
`publication_layer: published|local-draft` plus the exact Published commit or
Local Draft proposal identity; overlay may group one concept but never collapses
layer attribution or provenance.

## Explicit current-value flow

Only when user asks for the current value:

1. read the observed entry and file reference;
2. confirm the referenced Repository equals the current authorized MCP binding;
3. use existing graph/search/snippet tools with the file and property as context;
4. return evidenced current value, qualified ambiguity or unavailable;
5. keep Hub unchanged unless a later Refresh/Enrichment proposal is accepted.

The host does not need an exact symbol locator. A file may contain many values;
unclear matching is an honest ambiguous result, not a reason to guess or build a
parser.

Different-repository source reading remains unavailable unless a separately
released bounded MCP repository action can use the MCP-managed token. Agent
does not clone a remote repository or use `gh`/personal credentials. Snapshot
query still succeeds when current-source reading is unauthorized/unavailable.

## Output safety

Current-source output passes the same sensitive-value guard as authoring. Known
secret-bearing paths are not read for value lookup; an unsafe candidate value
is redacted while safe concept knowledge remains available.
