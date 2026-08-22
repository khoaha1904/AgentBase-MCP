# Verification: Batch Initial Ingest

## Canonical offline gate — 2026-08-22

`npm run verify` passed after convergence:

- specification checks passed;
- TypeScript passed;
- dependency-cruiser passed with 147 modules, 528 dependencies and 0 violations;
- Knip passed;
- Gitleaks scanned about 25.11 MB with no leaks;
- all 50 design-level tests passed;
- `git diff --check` passed.

The existing test inventory remains 50 and production dependencies are
unchanged. The expanded lifecycle proves three isolated repositories, blocked
confirmation, one failed member plus explicit retry, source drift rejection,
membership removal/recomposition, one atomic proposal, exact per-member/shared
review attribution, Local Accept and `batch-new` pending reconstruction. The
publication fixture proves one independent main-based Batch Init PR and readable
member/shared scope using fake GitHub HTTP.

## Retained checkpoints

- No model-backed Batch Ingest benchmark was run.
- No real Hub PR, Accept outside disposable fixtures, AWS CLI or provider call
  was performed.
- Batch Refresh, mixed Init/Refresh membership, parallel execution, workspace
  scanning and visual review remain deferred.
