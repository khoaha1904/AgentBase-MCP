# 02.04 — Monorepo and source scopes

> Status: Owner-approved boundary; subproject-scope runtime is deferred.

## Identity

The Git worktree root is the Repository identity boundary. Selecting a subfolder
does not create a Repository ID or Repository concept; current source-state
normalization continues to resolve it to the Git root.

```text
company-repo                 Repository / Primary Domain: Crawler
├── services/api             evidence/query scope
└── jobs/importer            evidence/query scope
```

Every scope inherits the repository's primary Domain. A scope only limits
discovery, Code Graph queries and source references; the evidence URI still uses
the same Repository ID with the complete relative path.

## Independent repositories in one workspace

A parent folder such as `crawler-repos/` is not a Repository when its children
are independent Git repositories. Each child has its own Repository ID and
Domain assignment; the parent is only routing/batch/workspace grouping and does
not create a Hub concept. Several children may share one Domain, but each
assignment is confirmed from that repository's evidence rather than inferred
from the parent name.

## Unsupported in version one

- A separate Repository ID for an arbitrary subfolder.
- Multiple primary Domains in one Git repository.
- Automatically splitting a monorepo into synthetic repositories.

If preflight requests a subproject Domain different from the primary Domain,
the skill warns that the assignment is unsupported. Cross-Domain
concepts/relations remain represented under section 06; they do not create a
subproject Repository identity.
