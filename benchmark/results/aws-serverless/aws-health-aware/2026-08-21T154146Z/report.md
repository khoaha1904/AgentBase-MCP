# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v15
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: reviewable
- Owner review: needs_revision
- Reference concept coverage: 100% (4/4)
- Recognized schema agreement: 100% (4/4)
- Metadata completeness: n/a (0/0)
- Provenance coverage: 75% (3/4)
- Reference relationship coverage: 100% (3/3)
- Source-conflict visibility: n/a (0/0)
- Live-evidence reference coverage: n/a (0/0)
- Embedded-knowledge coverage: 25% (1/4)
- Unjudged concepts / relationships: 1 / 2
- Missing reference concepts / relationships: 0 / 0

## Unjudged concepts

- flows/scheduled-aws-health-alert-delivery

## Unjudged relationships

- components/aha-scheduled-alert-processor|implemented-in|repositories/aws-health-aware
- flows/scheduled-aws-health-alert-delivery|part-of|systems/aws-health-aware

## Owner-review findings

- aha-terraform-definition: embedded knowledge is missing from an allowed parent with exact evidence
- aha-dynamodb-state-table: embedded knowledge is missing from an allowed parent with exact evidence
- aha-lambda-schedule: embedded knowledge is missing from an allowed parent with exact evidence
- domains/health-operations.md: Markdown body lacks reviewable substance

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
