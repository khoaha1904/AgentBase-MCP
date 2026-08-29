# Verification: documentation contract normalization

## Phase 1 result

The current-path governance slice is complete. It changes documentation and
agent workflow only; no runtime behavior, tool contract, provider, credential
or storage path changed.

## Baseline and landed snapshot

- Baseline before this slice: `e9d04dd`
- Landed commits: `5bb1365`, `7e6bf77`
- Mapping/reference follow-up: current commit after this verification update
- Existing completed specs and `docs/present/` / `docs/design/` paths were not
  moved, deleted or rewritten.

## Evidence

- `npm run spec:check` — passed.
- `npm run verify` — passed.
- Full test suite — 137 passed, 0 failed.
- Dependency cruiser — no violations (188 modules, 745 dependencies).
- Gitleaks — no leaks found.
- `git diff --check` — passed.

## Covered requirements

- AB-DOC-001 through AB-DOC-005 are documented and enforced by the current
  docs/AGENTS workflow.
- AB-DOC-006 is recorded as a future migration rule; no rename was attempted in
  this slice.
- Existing numbered areas are mapped without moving or rewriting historical
  files. Spec 062 records current references plus baseline SHAs.

## Remaining work

Phase 2 must map existing numbered documents and correct the current-authority
wording in `docs/design/README.md` before any optional directory rename.
