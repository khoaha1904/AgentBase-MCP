---
name: use-diagram-design
description: Internal AgentBase renderer for a ready Published Hub diagram packet. Use only when agentbase-diagram delegates a truthful Architecture, Dependency, or Sequence packet; never discover topology or handle Domain-site generation.
---

# Render an AgentBase diagram

Render only the supplied `ready` packet as one self-contained local HTML file
with inline SVG. Start from [`assets/template.html`](assets/template.html) and read
[`references/rendering-contract.md`](references/rendering-contract.md).

The packet owns every node, edge, direction and Flow step. Choose layout,
grouping, labels and at most two visual accents, but never add, reverse or infer
topology. Show active Questions and packet omissions as compact annotations,
not graph nodes. If the packet is unreadably broad, ask the caller to narrow the
selection instead of silently dropping knowledge.

Use system fonts and local inline assets only. Do not call Hub, source, browser,
network, image-generation or publication tools. Return the output path and the
Published commit represented by the artifact.
