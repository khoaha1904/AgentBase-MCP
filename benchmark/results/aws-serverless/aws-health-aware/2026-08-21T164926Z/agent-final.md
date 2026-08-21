Prepared proposal `f673dbdd1a8be0c109080910` and copied its finalized bundle to [okf](<OUTPUT_ROOT>/okf).

Canonical identities:

- `repositories/aws-health-aware`
- `domains/health-operations`
- `systems/aws-health-aware`
- `components/aws-health-alert-poller`
- `resources/aws-health-event-state`
- `flows/aws-health-alerting-flow`

Embedded knowledge covers optional Secrets Manager-backed notification configuration and outbound Slack, Teams, Chime, EventBridge, and email delivery behavior.

Partial limitations: Terraform desired state does not prove deployment/runtime facts; secondary-region variants, optional endpoint resources, S3 inputs, and CloudFormation alternatives were not independently modeled.

Questions: none.