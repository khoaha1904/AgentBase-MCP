# Bug Fix: Canonical Hub clone is rejected by runtime admission

- **Slug**: hub-migration-remote-identity
- **Fixed**: 2026-08-13
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Canonical Hub migration now accepts the same `owner/name` identity as runtime
configuration and derives the one admitted HTTPS remote. It can no longer
produce an SSH-origin clone that runtime rejects.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `scripts/migrate-product-repositories.mjs` | modified | Derive canonical HTTPS from `createHubIdentity`; replace raw `--hub-remote` with `--hub-repository` |
| `scripts/migrate-product-repositories.test.mjs` | tests added | Pin derived HTTPS origin and pre-mutation rejection of SSH/raw URL authority |
| `README.md` | modified | Update the operator command |
| `specs/008-local-hub-product-correction/quickstart.md` | modified | State the shared migration/runtime identity rule |

## Tests Added or Updated

- `[AB-MIGRATION-001] canonical Hub clone uses the runtime-admitted HTTPS identity`
- `[AB-MIGRATION-001] canonical Hub rejects raw remote authority before mutation`

## Local Verification

- `node --test scripts/migrate-product-repositories.test.mjs` → 5 passed, 0 failed.
- `npm run typecheck` → passed.
- `git diff --check` → passed.

## Deviations from Assessment

`README.md` was also updated because it exposes the affected operator command;
this is the same contract change, not expanded runtime scope.

## Follow-ups

- Normalize the already-created canonical Hub origin to the derived HTTPS URL
  and rerun the original MCP query reproduction.
