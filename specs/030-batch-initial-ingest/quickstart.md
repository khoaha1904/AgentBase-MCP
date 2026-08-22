# Quickstart: Validate Batch Initial Ingest

## Deterministic offline checkpoint

Use a disposable Hub and three local Terraform repositories in one Domain.

1. Prepare preflight with one Domain outlier and prove confirmation is blocked.
2. Correct the matrix, confirm one immutable ordered manifest and prove no
   authoring or accepted-state mutation occurred during preflight.
3. Run existing Initial Ingest authoring sequentially for each repository and
   record exact completed member checkpoints.
4. Finalize one batch proposal and inspect per-repository changes, shared indexes,
   Questions, limitations and zero duplicate targets.
5. Repeat with the middle repository failing; retry only that member and prove
   unchanged sibling checkpoints are reused.
6. Repeat with explicit membership removal; prove attributable output is removed
   or a dangling dependency blocks finalization.
7. Accept and publish in a disposable remote; prove one PR targets `main` and
   the atomic batch cannot be split.
8. Exercise source drift, Hub drift, duplicate/nested roots, existing Repository,
   path overlap and stale manifest/session inputs.

Run:

```sh
npm run verify
```

Expected: all 50 tests pass, no production dependency or test-count growth, and
single-repository Ingest/Refresh plus Domain Enrichment remain unchanged.

## Mandatory checkpoint

Stop after offline convergence. Do not run a model-backed batch benchmark or
create a real Hub PR without separate owner approval.
