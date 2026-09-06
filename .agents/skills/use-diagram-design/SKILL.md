---
name: use-diagram-design
description: Internal explicit delegation only. Use $use-diagram-design only after explicitly invoked $agentbase-diagram supplies a ready Published Hub packet; never select it for an ordinary diagram request, topology discovery, or Domain-site generation.
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
