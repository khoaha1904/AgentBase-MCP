# Tasks: Refresh preflight topology

## Contract foundation

- [x] T001 Close measurement capability 066 and activate capability 067.
- [x] T002 Record `AB-SCHEMA-056` and `AB-REFRESH-017..018` in current contracts.

## Implementation

- [x] T003 Add failing source-ID and isolated-new-concept regression tests.
- [x] T004 Share session draft validation with Finalize.
- [x] T005 Bind optional `session_id` through `validate_okf_changes` and runtime actions.
- [x] T006 Update the Refresh and OKF authoring instructions.

## Verification

- [x] T007 Run focused tests and the full repository gate.
- [x] T008 Run one fresh isolated C1 and audit lifecycle, recall and topology.
- [x] T009 Correct the schema-specific Resource relation instruction exposed by
  the first C1 without widening the schema.
- [x] T010 Run one revised isolated C1 and audit lifecycle, recall and topology.
- [x] T011 Make preflight return changed-set and session defects together, and
  reject revision-reused source IDs even when the source span changes.
- [x] T012 Run the full gate and the corrected isolated C1.
- [x] T013 Record verification and close capability 067 only if C1 passes.
