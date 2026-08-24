# Verification: Published-only Hub Query

## Outcome

Capability 038 is complete. Public Hub query reads exact synchronized
`remoteBase`; Local Draft remains proposal-review state. The public MCP/CLI
query surface is search plus exact Markdown read, while Questions and internal
Hub CI freshness remain intact.

## Evidence

- Remote fixture: Published match/read succeeds at `remoteBase`; Draft-only term
  is absent; Published Question remains searchable.
- Local-only fixture: search/read fail with an explicit Published-unavailable
  message while authoring, Accept and Question governance still work.
- MCP tool inventory omits traversal, observed-value and freshness query tools.
- Initial Ingest keeps one index entry when wording differs but link target is
  identical.
- Removed unused traversal and observed-query formatting code; no dependency,
  cache, index, router or format was added.

## Gate

`npm run verify` passes, including specification checks, generated Hub validator
parity, TypeScript, dependency rules, unused-code checks, Gitleaks and the 49/49
design-level tests. Test inventory decreased by one obsolete traversal test.

