# AgentBase diagram rendering contract

This profile adapts the pinned MIT Diagram Design architecture, dependency and
sequence grammars for offline AgentBase output.

## Shared rules

- Keep density moderate; prefer a focused 4–9 node selection.
- Draw groups, then connectors, then nodes, so connectors never cover labels.
- Use right-angle connectors for off-axis nodes and visibly separate shared
  attachment points. Labels need an opaque paper mask.
- Use the accent color for one or two focal elements only. No shadows, glow,
  remote fonts or remote assets.
- Boundary nodes use a muted dashed treatment and never imply that their
  external Domain was traversed.
- A Question is a badge or note on its subject. An omission is a visible note.

## Architecture

Group by the packet's structural parents and primary/boundary membership. Show
both structural and runtime edges exactly as supplied. Undirected structural
edges have no arrowhead; directed runtime edges follow `displaySource` to
`displayTarget`.

## Dependency

Rank nodes by the supplied directed runtime edges. Highlight fan-in only when it
is derivable from those edges. Do not invent versions, external dependencies or
cycles. If the graph is visually tree-shaped, it may be laid out as a tree but
must retain the Dependency title and exact edge directions.

## Sequence

Use the one supplied Flow. Actors are its step endpoints; time runs top to
bottom by exact step order. `asynchronous` messages use a dashed line and open
arrowhead; other messages use a solid line and filled arrowhead. Do not add
returns, branches, activation spans or missing messages.

## Output check

Before returning, confirm that every rendered node/edge/step maps one-to-one to
the packet, the HTML has no `http://` or `https://` asset dependency, and the
SVG has an accessible title and description.
