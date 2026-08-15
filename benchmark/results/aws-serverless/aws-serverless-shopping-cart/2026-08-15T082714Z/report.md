# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 3.0.0 / okf-author-v4
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: invalid
- Reference concept coverage: 60%
- Recognized schema agreement: 67%
- Metadata completeness: 38%
- Provenance coverage: 30%
- Reference relationship coverage: 0%
- Unjudged concepts / relationships: 7 / 0
- Missing reference concepts / relationships: 2 / 5

## Hard failures

- Reference cart-delete-sqs-queue matched cart-delete-sqs-queue but expected schema AWS SQS Queue, found Queue

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
