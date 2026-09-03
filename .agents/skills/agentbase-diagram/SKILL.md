---
name: agentbase-diagram
description: Explicit-only AgentBase diagram. Use only when the user names $agentbase-diagram to draw a focused Architecture, Dependency, or Sequence diagram from Published Hub knowledge; never for an ordinary visualization request, Local Draft, Domain-site export, or Hub mutation.
---

# Draw from Published AgentBase knowledge

Keep this workflow lightweight and read-only.

1. Use `search_hub_okf` and exact `read_hub_okf_concept` calls to identify one
   Domain and a small useful concept selection. Ask one short clarification only
   when the Domain or diagram purpose materially changes the result.
2. Choose `architecture`, `dependency`, or `sequence`. Sequence selection must
   include exactly one Published Flow. Prefer 4–9 concepts; never exceed 64.
3. Call `prepare_hub_visualization` once with `mode: diagram`, the exact Domain,
   type and concept IDs.
4. If it returns `insufficient-data`, explain the missing Published topology and
   stop. Do not repair it from memory, Local Draft or source code.
5. For a `ready` packet, follow internal `use-diagram-design` and create one
   self-contained local HTML/SVG artifact. Report its path and exact Published
   commit.

Do not update Hub, invoke Domain-site generation, publish the artifact, or add
topology beyond the packet. Ordinary knowledge questions remain with
`agentbase-query`.
