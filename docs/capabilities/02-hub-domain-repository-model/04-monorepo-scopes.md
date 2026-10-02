# 02.04 — Monorepo and source scopes

> Status: Owner-approved boundary; subproject-scope runtime is deferred.

## Identity

The Git worktree root is the Repository identity boundary. Selecting a subfolder
does not create a Repository ID or Repository concept; current source-state
normalization continues to resolve it to the Git root.

```text
company-repo                 one Repository identity and physical home
├── services/api             evidence/query scope
└── jobs/importer            evidence/query scope
```

Every scope retains the Repository's identity and physical home. A scope only
limits discovery, source investigation and source references; its evidence URI
still uses the same Repository ID with the complete relative path. Evidence from
a scope may justify another Domain participation or a concept home exception,
but it never creates a second Repository or silently rehomes the dossier.

## Independent repositories in one workspace

A parent folder such as `crawler-repos/` is not a Repository when its children
are independent Git repositories. Each child has its own Repository ID and
grouped home/participation decision; the parent is only routing/batch/workspace
grouping and does not create a Hub concept. Several children may share one home
or Domain participation, but each decision is confirmed from that repository's
evidence rather than inferred from the parent name.

## Unsupported in version one

- A separate Repository ID for an arbitrary subfolder.
- Automatically splitting a monorepo into synthetic repositories.

If preflight evidence spans Domains, the skill keeps one Repository identity and
proposes explicit participation/home exceptions through the normal grouped plan.
It does not create a subproject Repository identity.
