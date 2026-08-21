# aws-health-aware — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v15
- Agent outcome: succeeded
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: useful_for_owner_review
- Initial Ingest acceptance: invalid
- Reference concept coverage: 100% (4/4)
- Recognized schema agreement: 100% (4/4)
- Metadata completeness: n/a (0/0)
- Provenance coverage: 100% (4/4)
- Reference relationship coverage: 100% (3/3)
- Source-conflict visibility: n/a (0/0)
- Live-evidence reference coverage: n/a (0/0)
- Embedded-knowledge coverage: 100% (4/4)
- Unjudged concepts / relationships: 0 / 1
- Missing reference concepts / relationships: 0 / 0

## Unjudged relationships

- components/aws-health-aware-alert-processor|implemented-in|repositories/aws-health-aware

## Hard failures

- components/aws-health-aware-alert-processor.md: source span exceeds handler.py (1065 lines)

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
