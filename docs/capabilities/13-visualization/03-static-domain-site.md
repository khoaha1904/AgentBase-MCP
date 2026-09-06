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

## Interaction hierarchy

The default System map uses recorded runtime/Flow edges, hides Repository cards
and regions, and initially shows embedded references with an option to collapse them. Unconnected visible
concepts are placed below connected components with a visible count; no layout
edge is inferred. By repository restores all embedded references and fixed source
regions. The grouping is source ownership, never deployment. Repository dossiers
remain available in search/details in both views. The embedded toggle affects
System map only. Reset preserves the selected view and restores its defaults.

Search and Repository scope are primary controls. Search lists matching titles
and types without automatically selecting the first result; zero matches are
explicit. Type, boundary scope and Flow display are secondary options. A selected
node offers direct connections or a wider two-step neighborhood; these controls
are disabled without an eligible graph selection. Fit preserves view state;
Reset view restores the generated layout and clears filtering/focus. Selection
preserves the viewport instead of fitting the entire map after every click.
Keyboard users can select search results and dismiss details with Escape.
On narrow screens, search precedes the map and provenance remains visible.
Light/dark selection defaults to the OS preference and persists locally when
browser storage is available; storage failure never blocks rendering. Both the
selection drawer and expanded overview show purpose, navigable relation cards,
open Questions, evidence, then collapsed identity/home metadata. Relation cards
retain the exact predicate and direction; missing connections are explicitly
unrecorded, not proof of absence. Embedded references link to their recorded
parents. The reader labels snapshot and partial-content authority visibly.

The site uses bundled local Cytoscape.js and system fonts. It works from a static web
host. Its CSP admits only local assets and the exact SHA-256 of the pinned
Cytoscape container-position style; arbitrary inline styles/scripts remain blocked.
It requires no runtime model, external UI library service or Hub/MCP access.
Local preview is allowed with a warning that this
is a fixed snapshot. AgentBase does not create a Domain-Hub repo, push, publish
Pages, watch Hub changes or refresh the site automatically.

Before generation, the skill warns that repository/Pages visibility must be at
least as restricted as the Published knowledge being copied.
