# Owned upstream source

This directory contains attributed, immutable source inputs used by AgentBase.
It is not a package cache and contains no nested Git repository.

- `*/upstream/` is copied byte-for-byte from one approved local checkout.
- `*/UPSTREAM.md` records the exact upstream identity and selection boundary.
- `*/inventory.sha256` binds every retained upstream file.
- `codebase-memory/agentbase/` is the only AgentBase-owned overlay.
- Native binaries and patched build trees belong under ignored `build/`, never
  under `vendor/`.

Import and verification are local-only:

```sh
node scripts/upstream/manage-upstreams.mjs import codebase-memory /approved/checkout
node scripts/upstream/manage-upstreams.mjs import diagram-design /approved/checkout
node scripts/upstream/manage-upstreams.mjs verify codebase-memory
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
3. qualify the pristine revision against the currently accepted behavior;
4. import from that local checkout and review `UPSTREAM.md`, licenses/notices,
   the deterministic inventory and retained size;
5. apply every AgentBase patch with zero fuzz in disposable staging, resolving
   changes by reviewing the patch rather than editing `upstream/`;
6. run profile, tool-surface and representative evidence qualification;
7. build and qualify native artifacts independently on Linux x64 and macOS
   arm64 through approved toolchains and registries; and
8. request explicit owner approval for the migration.

Graph UI and diagram-design are source foundations only. Capability 044 does
not install or start either one. The future diagram boundary is self-contained
static HTML/SVG with system fonts; browser downloads, Playwright/Chromium, PNG
automation, remote fonts/assets and URL onboarding are excluded.
