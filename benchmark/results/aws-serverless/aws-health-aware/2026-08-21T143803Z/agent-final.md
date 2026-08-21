Prepared and inspected proposal `45a85189cf84e2cb1c9b9c69` (applicable, phase `prepared`). Final bundle: [okf](<OUTPUT_ROOT>/okf).

Canonical identities:

- `repositories/aws-health-aware`
- `systems/aws-health-aware`
- `components/aws-health-aware-health-poller`
- `flows/aws-health-aware-health-alert-processing`
- `interfaces/aws-health-aware-notification-delivery`
- `resources/aws-health-aware-health-event-state`
- `domains/health-operations`

Embedded knowledge includes the EventBridge schedule, Lambda permission, secrets/configuration, and other non-promoted infrastructure.

Partial limitations: desired-state IaC does not prove deployed values; external endpoint consumers, credentials, regions, accounts, and ARNs remain unasserted.

Questions: none.