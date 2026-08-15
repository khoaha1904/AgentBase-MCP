# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 3.0.0 / okf-author-direct-v3
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

- infrastructure/aha-chime-webhook-secret.md: generated.by must identify agentbase/<version>
- infrastructure/aha-chime-webhook-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-chime-webhook-secret.md: every source requires resource
- infrastructure/aha-event-state-store.md: generated.by must identify agentbase/<version>
- infrastructure/aha-event-state-store.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-event-state-store.md: every source requires resource
- infrastructure/aha-eventbridge-bus-name-secret.md: generated.by must identify agentbase/<version>
- infrastructure/aha-eventbridge-bus-name-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-eventbridge-bus-name-secret.md: every source requires resource
- infrastructure/aha-health-event-schedule.md: generated.by must identify agentbase/<version>
- infrastructure/aha-health-event-schedule.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-health-event-schedule.md: every source requires resource
- infrastructure/aha-lambda-execution-role.md: generated.by must identify agentbase/<version>
- infrastructure/aha-lambda-execution-role.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-lambda-execution-role.md: every source requires resource
- infrastructure/aha-management-role-secret.md: generated.by must identify agentbase/<version>
- infrastructure/aha-management-role-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-management-role-secret.md: every source requires resource
- infrastructure/aha-microsoft-teams-webhook-secret.md: generated.by must identify agentbase/<version>
- infrastructure/aha-microsoft-teams-webhook-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-microsoft-teams-webhook-secret.md: every source requires resource
- infrastructure/aha-notification-lambda.md: generated.by must identify agentbase/<version>
- infrastructure/aha-notification-lambda.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-notification-lambda.md: every source requires resource
- infrastructure/aha-slack-webhook-secret.md: generated.by must identify agentbase/<version>
- infrastructure/aha-slack-webhook-secret.md: generated.at must be an ISO 8601 datetime
- infrastructure/aha-slack-webhook-secret.md: every source requires resource
- Reference aha-dynamodb-table matched aha-event-state-store but expected schema Database Table, found aws-dynamodb-table
- Reference aha-lambda-schedule-primary-region matched aha-health-event-schedule but expected schema Event, found aws-eventbridge-rule

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
