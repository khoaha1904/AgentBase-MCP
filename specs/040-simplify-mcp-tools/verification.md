# Verification: Simplify MCP Tools

## Outcome

Capability 040 is complete. The released MCP surface is 42 goal-level tools:
29 Hub, four schema/authoring and nine Code Graph actions. Current Initial
Ingest, Refresh, Batch, Domain Enrichment, Hub and graph workflows retain every
tool they name.

## Evidence

- Official MCP listing contains exactly 42 tools and omits the seven retired
  raw/legacy names.
- `index_repository` exposes only `repo_path`, safe mode and optional name; its
  descriptor contains no hidden persistence, target-project or cross-repository
  option.
- The pinned provider descriptor remains separate from the curated public
  descriptor, so upstream schema drift is still checked exactly.
- The seven installed product skills name bounded released tool sets and no
  longer instruct agents to pass hidden indexing arguments.
- Descriptor payload decreased from approximately 49.8 KB to 43.0 KB (about
  14%) without changing the 29-tool Hub surface.

## Gate

`npm run verify` passes specification checks, generated Hub validator parity,
TypeScript, dependency rules, unused-code checks, Gitleaks, `git diff --check`
and all 50 design-level tests. No dependency or test was added, and no model
benchmark ran.
