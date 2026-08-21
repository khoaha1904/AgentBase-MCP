# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
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
- Unjudged concepts / relationships: 2 / 6
- Missing reference concepts / relationships: 0 / 0

## Unjudged concepts

- flows/aws-health-alerting-flow
- resources/aws-health-event-state

## Unjudged relationships

- components/aws-health-alert-poller|implemented-in|repositories/aws-health-aware
- components/aws-health-alert-poller|depends-on|resources/aws-health-event-state
- flows/aws-health-alerting-flow|part-of|systems/aws-health-aware
- resources/aws-health-event-state|part-of|systems/aws-health-aware
- resources/aws-health-event-state|implemented-in|repositories/aws-health-aware
- systems/aws-health-aware|implemented-in|repositories/aws-health-aware

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
