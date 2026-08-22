Initial Ingest completed and validated. Finalized bundle: [okf](<OUTPUT_ROOT>/okf).

Canonical identities:

- `domains/health-operations`
- `repositories/aws-health-aware` — repository ID `repository-aws-health-aware-ef3e83846625`
- `systems/aws-health-aware`
- `components/aha-alert-processor` — Function
- `interfaces/aha-eventbridge-event`

Embedded knowledge includes DynamoDB state, EventBridge schedules, Secrets Manager configuration, optional S3 exclusion inputs, Lambda IAM permissions, regional deployment variants, and the cross-account health-access role.

Partial limitations: IaC proves desired state only; CloudFormation was not exhaustively modeled; deployed values, downstream consumers, and third-party endpoint ownership remain unknown.

Questions: none.

Prepared proposal: `367270cf3c35c58edd087874` (`agentbase/okf-367270cf3c35c58edd087874`), inspected as applicable and still prepared.