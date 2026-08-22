# Verification: Shared Question Documents

**Date**: 2026-08-22

## Acceptance evidence

- Finalize renders `questions/<stable-id>.md` and `questions/index.md` into the
  ordinary proposal tree; no `questions.json` attachment is created.
- Accept performs only the existing Git tree transaction. A second MCP state
  root lists the accepted Question from Hub without a private ledger.
- Exact-revision Answer prepares one Guidance create plus one Question update.
  Accepted list/read remains `open` before Accept and becomes `resolved` after.
- Stale revision and orphan accepted Guidance stop before mutation with explicit
  recovery wording.
- Initial Ingest/Refresh reject Question-byte changes unless the exact path was
  supplied by the dedicated renderer.

## Gates

- `npm run spec:check`: pass.
- `npm run typecheck`: pass.
- Dependency architecture: 133 modules / 463 dependencies, zero violations.
- Dead-code check: pass.
- Secret scan: pass.
- Tests: 50/50 pass; canonical test count unchanged.
- `git diff --check`: pass.
- `npm run verify`: pass.

## Scope confirmation

No database, daemon, cache authority, model call, provider, credential boundary,
network dependency or compatibility layer was added. Batch resolution, automatic
conflict inference, broad Guidance and Domain Enrichment remain deferred in
`docs/design/12-version-scope/07-deferred-capabilities.md`.
