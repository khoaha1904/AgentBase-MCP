Prepared proposal `4a5e186cd7699bebe471c6b7` was finalized and inspected as applicable; the exact bundle is at [okf](<OUTPUT_ROOT>/okf).

Canonical identities:

- `repositories/aws-health-aware`
- `domains/health-operations`
- `systems/aws-health-aware`
- `components/aha-scheduled-alert-processor`
- `flows/scheduled-aws-health-alert-delivery`

Embedded knowledge: EventBridge schedule, DynamoDB event state/TTL, and Secrets Manager-backed notification configuration.

Partial limitations: no assertion of deployed accounts, regions, ARNs, endpoints, runtime state, or delivery outcomes. The state table and notification secrets were not promoted as Resources under catalog guidance.

Questions: none.