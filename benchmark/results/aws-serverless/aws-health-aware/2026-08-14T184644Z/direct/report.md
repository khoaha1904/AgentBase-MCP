# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 3.0.0 / okf-author-direct-v2
- Agent outcome: succeeded
- OKF validation: failed
- Authoring assessment: invalid
- Reference concept coverage: 40%
- Recognized schema agreement: 0%
- Metadata completeness: 0%
- Provenance coverage: 0%
- Reference relationship coverage: 0%
- Unjudged concepts / relationships: 7 / 8
- Missing reference concepts / relationships: 3 / 6

## Hard failures

- infrastructure/aha-health-event-state-store.md: generated.by must identify agentbase/<version>
- infrastructure/aha-health-event-state-store.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-health-event-state-store.md: every source requires resource
- infrastructure/aha-lambda-execution-role.md: generated.by must identify agentbase/<version>
- infrastructure/aha-lambda-execution-role.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-lambda-execution-role.md: every source requires resource
- infrastructure/aha-lambda-function.md: generated.by must identify agentbase/<version>
- infrastructure/aha-lambda-function.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-lambda-function.md: every source requires resource
- infrastructure/aha-lambda-schedule.md: generated.by must identify agentbase/<version>
- infrastructure/aha-lambda-schedule.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-lambda-schedule.md: every source requires resource
- infrastructure/amazon-chime-webhook-secret.md: generated.by must identify agentbase/<version>
- infrastructure/amazon-chime-webhook-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/amazon-chime-webhook-secret.md: every source requires resource
- infrastructure/eventbridge-bus-name-secret.md: generated.by must identify agentbase/<version>
- infrastructure/eventbridge-bus-name-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/eventbridge-bus-name-secret.md: every source requires resource
- infrastructure/management-account-role-arn-secret.md: generated.by must identify agentbase/<version>
- infrastructure/management-account-role-arn-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/management-account-role-arn-secret.md: every source requires resource
- infrastructure/microsoft-teams-webhook-secret.md: generated.by must identify agentbase/<version>
- infrastructure/microsoft-teams-webhook-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/microsoft-teams-webhook-secret.md: every source requires resource
- infrastructure/slack-webhook-secret.md: generated.by must identify agentbase/<version>
- infrastructure/slack-webhook-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/slack-webhook-secret.md: every source requires resource
- Reference aha-dynamodb-table matched aha-health-event-state-store but expected schema Database Table, found aws-dynamodb-table
- Reference aha-lambda-schedule-primary-region matched aha-lambda-schedule but expected schema Event, found amazon-eventbridge-schedule

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
