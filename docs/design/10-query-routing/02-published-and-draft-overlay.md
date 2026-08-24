# 10.02 — Published-only query boundary

> Trạng thái: Capability 038 supersedes the unimplemented overlay design.

## Outcome

Ordinary Hub search/read sees exactly one layer: the last Published commit that
the active profile synchronized successfully. Local Draft remains review state,
not query state.

## Exact anchor

- Attached remote Hub: read exact `remoteBase`.
- Local Draft: `remoteBase..activeHead`, available only through proposal
  inspection, review and publication workflows.
- Local-only Hub: no Published authority, so ordinary search/read returns a
  clear unavailable error.

Query never fetches remote, reads working-tree bytes or falls back to
`activeHead`. Synchronization is the only operation that advances the local
Published boundary.

## Public query shape

```text
search_hub_okf(query, scope?)
  -> bounded summaries at exact Published commit

read_hub_okf_concept(path)
  -> exact Published Markdown with knowledge, links, snapshots and provenance
```

There is no view selector and no dedicated traversal, observed-value or
freshness query action. Relationships are ordinary evidenced links in Markdown;
the agent follows them with another search/read only when useful. Questions are
ordinary Hub documents and remain searchable/readable after publication.

The internal Repository freshness projection remains available to Hub CI. It
does not justify a separate ordinary-query tool.

## Failure behavior

- Local-only profile: explicit Published-unavailable error.
- Missing path at `remoteBase`: ordinary not-found error even if Draft added it.
- Invalid Published document: fail that read/search; never substitute Draft.
- Remote advanced but not synchronized: continue reading the admitted
  `remoteBase` and let status/synchronization report the candidate separately.

## Minimal implementation

Reuse the existing `HubQueryReader` with an explicit commit. Public search/read
construct it at `remoteBase`; authoring continuity continues using
`activeHead`. Remove only redundant adapters—no new storage, cache, index,
router, dependency or OKF format.
