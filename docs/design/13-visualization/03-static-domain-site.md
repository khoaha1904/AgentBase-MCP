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
│   └── three.module.min.js
├── data/
│   └── domain.json
└── agentbase-build.json
```

The receipt binds source Hub identity, exact commit, Domain ID, projection
version and generated-file digests. Generated files contain no timestamp,
token, machine-local source path or live MCP endpoint, so the same inputs remain
reproducible.

## First view

- one Domain per site;
- Domain, System and Repository nodes visible first;
- other concepts expand lazily from the selected node;
- direct cross-Domain endpoints appear as non-expandable boundary nodes;
- search, type/repository filters, 1–2 hop focus and a readable sidebar;
- deterministic seeded 3D positions derived at build time;
- open Question counts as badges, not default nodes;
- directed runtime edges and visually distinct structural links.

The site uses bundled local assets and system fonts. It works from a static web
host with no Hub/MCP access. Local preview is allowed with a warning that this
is a fixed snapshot. AgentBase does not create a Domain-Hub repo, push, publish
Pages, watch Hub changes or refresh the site automatically.

Before generation, the skill warns that repository/Pages visibility must be at
least as restricted as the Published knowledge being copied.
