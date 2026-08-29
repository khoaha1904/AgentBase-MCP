# 08.04 — Snapshot query and current-source reads

> Status: Snapshot query is implemented; explicit current-source reads continue to use normal authorized tools.

## Snapshot read

`read_hub_okf_concept` returns exact Published Markdown containing bounded
observed entries with subject, property, role, value, source resource and
observed revision/time. It performs no repository access, credential probe,
graph indexing or write-back. Local Draft snapshots remain in proposal review,
not ordinary query.

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
secret-bearing paths are not read for value lookup. Published concept read is
exact; authoring/publication/CI must prevent unsafe values from entering it.
