# Quickstart: verify Refresh change accounting

## Focused validation

```sh
npm test -- --test-name-pattern='AB-REFRESH'
```

Expected scenarios:

1. Missing, duplicate and extra path accounting fail and retain the session.
2. Unsupported materialized outcomes fail.
3. A corrected evidenced outcome succeeds and appears in inspection.
4. An ignored-only changed delta still creates a reviewable observed-source proposal.
5. A true zero-delta/no-edit session remains `no_change`.

## Repository gate

```sh
npm run verify
git diff --check
```

Do not merge the feature branch unless both commands pass and the owner accepts the resulting behavior and latency trade-off.
