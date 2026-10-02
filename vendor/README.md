# Owned upstream source

This directory contains attributed, immutable source inputs used by AgentBase.
It is not a package cache and contains no nested Git repository.

- `*/upstream/` is copied byte-for-byte from one approved local checkout.
- `*/UPSTREAM.md` records the exact upstream identity and selection boundary.
- `*/inventory.sha256` binds every retained upstream file.
- `diagram-design/agentbase/` contains the AgentBase-owned offline diagram profile.

Import and verification are local-only:

```sh
node scripts/upstream/manage-upstreams.mjs import diagram-design /approved/checkout
node scripts/upstream/manage-upstreams.mjs verify diagram-design
```

The command rejects the wrong commit, unsafe paths, nested repositories,
unexpected links and files at or above 100 MiB. It never contacts a remote.
An existing `agentbase/` overlay is preserved when the pristine snapshot is
re-imported.

## Explicit update procedure

There is no automatic updater. For a proposed upstream revision:

1. obtain and approve a local upstream checkout through the company's normal
   source-review process;
2. update the exact revision and selection in `manage-upstreams.mjs`;
3. import from that local checkout and review `UPSTREAM.md`, licenses/notices,
   the deterministic inventory and retained size;
4. verify the offline HTML/SVG profile and run the product gate; and
5. review any changed diagram behavior before adopting the revision.

Only diagram-design remains vendored. Its upstream skill is not installed;
AgentBase uses the narrow `use-diagram-design` wrapper for self-contained static
HTML/SVG with system fonts. Browser downloads, Playwright/Chromium, PNG automation,
remote fonts/assets and URL onboarding are excluded. Repository source discovery
has no vendored engine, native binary or build overlay.
