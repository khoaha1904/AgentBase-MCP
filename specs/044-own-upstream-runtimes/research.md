# Research: Own Upstream Runtimes

## Accepted upstream revisions

| Project | Accepted identity | Evidence |
|---|---|---|
| Codebase Memory MCP | tag `v0.10.8`, commit `46ae198fc11cda80e817acbc5f5908d7c2de7032` | Official immutable release plus local source audit; qualify against AgentBase's current `v0.10.1` capture before import. |
| diagram-design | plugin version `2.6.5`, commit `648c2a597839301e06df1e7434a08bde9f42eed3` | Local pinned checkout; repository has no release tag for this identity. |

Both projects are MIT licensed. Imported snapshots must retain their license and
third-party notices; deleting nested Git history does not remove attribution.

`v0.10.8` supersedes the old runtime pin because its official release includes
graph-correctness fixes for aggregate completeness, Python aliased imports,
semantic-only search ghosts and persisted coverage reporting, plus release-
pipeline hardening. Its build still compiles grammar shims through the same
wildcard/static-registration shape, so the bounded parser-profile approach
remains valid. The version change is qualified as its own phase before source
ownership changes; this prevents a version regression from being misdiagnosed
as a vendoring or build regression.

## Registry and runtime evidence

- The company audit found every required exact npm package/version in its
  internal registry.
- The public `codebase-memory-mcp` package remains unsuitable for enterprise
  installation: its postinstall executes `install.js`, which downloads a native
  binary from GitHub Releases. AgentBase therefore builds the accepted source
  directly and does not depend on registry availability of the provider package.
- Current company Node is `22.22.3`; AgentBase requires `>=24.12 <25`. The target
  environment must use an approved Node 24 source/mirror.
- Playwright/Chromium availability was not proven and is unnecessary for static
  HTML/SVG output, so it is excluded.

## Parser-profile feasibility

The audited Codebase Memory checkout excluding `.git` is approximately 1.3 GB;
about 1.2 GB is generated source for 159 grammars. The largest generated parser
is approximately 104 MB. The upstream Makefile compiles every
`internal/cbm/grammar_*.c` and `lang_specs.c` statically references every grammar
factory. Therefore deleting grammar directories alone cannot work.

The upstream extractor already represents an absent spec/grammar as
`unsupported language`/`no tree-sitter grammar`. The profile patch can safely:

1. limit Makefile grammar sources;
2. retain table entries only for accepted languages; and
3. filter recognized omitted languages during discovery so they become explicit
   skipped coverage rather than per-file extraction errors.

This is a bounded overlay, not a rewrite of graph/search/trace behavior.

## Accepted language profile

HCL/Terraform, JavaScript, TypeScript, TSX, Python, Go, Java, YAML, JSON,
Dockerfile, Markdown and Bash. SQL is deferred because its generated parser
alone is about 40 MB and no current MVP fixture requires it.

Measured estimate from the audited checkout:

- core source excluding grammar directories: about 81 MiB;
- accepted parser set including Bash: about 41 MiB;
- diagram-design: about 10 MiB;
- expected tracked total before final inventory overhead: about 132 MiB.

Final sizes are qualification evidence, not assumed guarantees.

## Alternatives rejected

### Keep the npm package and mirror only the release binary

Rejected because no internal binary mirror/package has been approved, the
postinstall remains a downloader, and source ownership/auditability is lost.

### Vendor the currently integrated v0.10.1 without an upgrade gate

Rejected because it would freeze known upstream graph-correctness defects into
AgentBase-owned source. Upgrading and qualifying `v0.10.8` first adds one clean
comparison boundary: current package behavior versus new upstream behavior,
followed by qualified upstream behavior versus the owned source build.

### Import all 159 generated parsers

Rejected because it adds roughly 1.2 GB, includes a >100 MB file and makes the
repository harder to clone, review and transfer for languages AgentBase does not
currently need.

### Reimplement Codebase Memory or diagram-design behavior

Rejected because it expands scope, loses upstream test maturity and makes future
bug fixes dependent on recreating upstream features from prompts.

### Replace AgentBase-Hub with GitNexus or Potpie

Rejected because these products validate useful graph and context-engine
patterns but own a different canonical result. GitNexus primarily derives
detailed code relationships and cross-repository contracts for agent analysis.
Potpie persists a broader living context graph over code and SDLC sources.
AgentBase instead publishes sparse, provenance-bearing OKF Markdown through Git
review so a team can read, correct and strengthen shared knowledge over time.

AgentBase may adopt bounded upstream techniques, especially code indexing,
identity matching and evidence-ranked relation proposals. It does not adopt a
second canonical graph database, daemon or complete SDLC event store. Detailed
graphs remain rebuildable inputs; reviewed OKF and Git history remain the shared
product.

References:

- <https://github.com/abhigyanpatwari/GitNexus>
- <https://github.com/potpie-ai/potpie>
- <https://github.com/potpie-ai/potpie/blob/main/docs/context-graph/architecture.md>

### Git submodule, subtree history or runtime clone

Rejected because the enterprise import must be self-contained, public network
may be unavailable, and the user intends to remove external Git history.

### Commit native binaries

Rejected for the first migration because two platform binaries create opaque
review artifacts and update friction. Build locally from admitted source and
retain exact generated manifests instead.

## Security boundary

The build may use the configured company registry and approved compiler tools;
it may not fall back to public hosts. Runtime admits one exact repository-owned
artifact and never searches `PATH`. Graph UI frontend source is excluded and
diagram source is inert in this capability, so no server/browser/remote-asset
behavior is granted runtime authority.
