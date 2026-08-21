# Bug Fix: V15 authoring gates reject generated Flow skeletons

- **Slug**: v15-authoring-gates
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Initial Ingest now returns an editable Flow skeleton without inventing step
endpoints, while final validation still requires the agent to author real
linked and evidenced steps. Benchmark diagnostics now distinguish failed calls
from calls that never occurred.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/authoring/initial-ingest-skeleton.ts` | modified | Emits `flow_steps: []` and defers only generated Flow semantic validation. |
| `src/app/hub-okf/authoring/initial-ingest.test.ts` | updated test | Proves Prepare succeeds, Terraform SQS stays embedded, empty steps fail validation and authored steps Finalize. |
| `scripts/benchmark/benchmark-agent.mjs` | modified | Reports observed failed required tools separately from absent tools. |
| `scripts/benchmark/benchmark-agent.test.mjs` | added test | Pins the two diagnostic messages. |
| `specs/022-single-repository-ingest/spec.md` | clarified | Records the editable Flow skeleton/final validation boundary. |
| `docs/contracts/okf.md` | clarified | Makes AB-INGEST-011 current behavior explicit. |

## Tests Added or Updated

- `[AB-INGEST-004..006][AB-INGEST-008][AB-INGEST-011]` — promoted Flow plus
  existing Terraform embedded resource passes preparation and requires authored
  steps before Finalize.
- `[AB-BENCH-043] required-tool diagnostics distinguish failed calls from absent calls`.

## Local Verification

- Commands run: `node --test src/app/hub-okf/authoring/initial-ingest.test.ts scripts/benchmark/benchmark-agent.test.mjs` → 23/23 passed.
- Manual checks: immutable V15 prompt and retained run artifacts were not edited.

## Deviations from Assessment

None. No new embedded-resource implementation was added because the existing
Terraform path already passed and is exercised by the expanded regression.

## Follow-ups

- Run the complete offline repository gate.
- Review test-suite size separately after this bug is verified; do not combine
  test deletion with the correctness fix.
