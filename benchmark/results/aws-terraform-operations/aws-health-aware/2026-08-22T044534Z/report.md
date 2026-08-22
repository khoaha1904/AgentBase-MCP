# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v15
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: reviewable
- Owner review: useful_for_owner_review
- Initial Ingest acceptance: review_ready
- Reference concept coverage: 100% (4/4)
- Recognized schema agreement: 100% (4/4)
- Metadata completeness: n/a (0/0)
- Provenance coverage: 100% (4/4)
- Reference relationship coverage: 100% (3/3)
- Source-conflict visibility: n/a (0/0)
- Live-evidence reference coverage: n/a (0/0)
- Embedded-knowledge coverage: 100% (4/4)
- Unjudged concepts / relationships: 1 / 5
- Missing reference concepts / relationships: 0 / 0

## Unjudged concepts

- interfaces/aha-eventbridge-event

## Unjudged relationships

- components/aha-alert-processor|implemented-in|repositories/aws-health-aware
- components/aha-alert-processor|provides|interfaces/aha-eventbridge-event
- interfaces/aha-eventbridge-event|part-of|systems/aws-health-aware
- interfaces/aha-eventbridge-event|implemented-in|repositories/aws-health-aware
- systems/aws-health-aware|implemented-in|repositories/aws-health-aware

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
