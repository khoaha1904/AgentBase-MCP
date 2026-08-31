# 13.03 — Static Domain site

`agentbase-domain-site` is an explicit one-shot build for one Published Domain.
It must not be inferred from an ordinary query.

## Build result

The tool writes atomically into a new or empty caller-selected directory:

```text
domain-site/
├── index.html
├── assets/
│   ├── app.js
│   ├── app.css
│   └── cytoscape.min.js
├── data/
│   └── domain.json
└── agentbase-build.json
```

The receipt binds source Hub identity, exact commit, Domain ID, projection
version and generated-file digests. Generated files contain no timestamp,
token, machine-local source path or live MCP endpoint, so the same inputs remain
reproducible.

## First view

- one Domain per site, represented by the page rather than a duplicate graph
  node;
- every other non-governance concept admitted by the Domain scope is visible
  first; Repository concepts are compact selectable cards inside fixed labeled
  regions, with owned nodes placed inside while shared, multi-repository and
  external nodes are visibly labeled and remain outside; relation endpoints
  place one-Repository outside nodes beside that region, multi-Repository nodes
  between related regions and unassociated nodes in a fallback external lane;
- promoted `Resource` nodes (for example a shared queue/topic) are visible as
  normal concepts; concrete evidence-backed embedded resources may appear as
  smaller dashed presentation-only references without creating concept files;
- direct cross-Domain endpoints appear as non-expandable boundary nodes;
- circular nodes use labels below the node; search, type/repository filters,
  1–2 hop focus and a readable right-side selection drawer;
- the drawer exposes overview, direct relation context and a text-only document
  overview overlay;
- the drawer summarizes evidence by repository file and keeps exact citations
  behind an explicit disclosure instead of listing every line span by default;
- deterministic resettable 2D layout with readable labels, pan and zoom; normal
  nodes may be repositioned only within their ownership zone while Repository
  cards and region boundaries remain fixed;
- Flow-step edges visible by default behind one explicit toggle, with each Flow
  rendered as a compact label rather than an isolated circular node;
- selecting a System highlights its direct Published members without exposing
  structural containment arrows;
- open Question counts as badges, not default nodes;
- directed canonical and evidence-backed embedded runtime edges; structural
  links already represented by repository containment are hidden by default.

The site uses bundled local Cytoscape.js and system fonts. It works from a static web
host with no Hub/MCP access. Local preview is allowed with a warning that this
is a fixed snapshot. AgentBase does not create a Domain-Hub repo, push, publish
Pages, watch Hub changes or refresh the site automatically.

Before generation, the skill warns that repository/Pages visibility must be at
least as restricted as the Published knowledge being copied.
