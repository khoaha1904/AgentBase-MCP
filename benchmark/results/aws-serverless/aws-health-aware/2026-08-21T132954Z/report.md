# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v15
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: reviewable
- Owner review: needs_revision
- Reference concept coverage: 80%
- Recognized schema agreement: 100%
- Metadata completeness: 100%
- Provenance coverage: 50%
- Reference relationship coverage: 75%
- Source-conflict visibility: 100%
- Live-evidence reference coverage: 100%
- Embedded-knowledge coverage: 0%
- Unjudged concepts / relationships: 0 / 0
- Missing reference concepts / relationships: 1 / 1

## Owner-review findings

- domains/health-operations.md: confirmed Domain does not navigate to a System
- aha-terraform-definition: embedded knowledge is missing from an allowed parent with exact evidence
- aha-dynamodb-state-table: embedded knowledge is missing from an allowed parent with exact evidence
- aha-lambda-schedule: embedded knowledge is missing from an allowed parent with exact evidence
- domains/health-operations.md: Markdown body lacks reviewable substance

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
