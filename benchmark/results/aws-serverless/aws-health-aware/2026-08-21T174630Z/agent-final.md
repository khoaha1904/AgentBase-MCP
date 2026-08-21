Prepared and validated proposal `d1e82bca63a43e2142430bdb` (preview only).

Canonical identities:

- `repositories/aws-health-aware`
- `domains/health-operations`
- `systems/aws-health-aware`
- `components/aha-scheduled-alert-processor`
- `resources/aha-event-state-table`
- `flows/scheduled-health-alert-processing`

Embedded knowledge: optional notification endpoint secrets, EventBridge schedule infrastructure, and the conditional secondary-region Lambda.

Partial limitations: Terraform proves desired configuration only—not deployed accounts, regions, ARNs, schedules, or endpoint selections. CloudFormation coverage remains deferred.

Questions: none.

Finalized bundle: [okf](<OUTPUT_ROOT>/okf)