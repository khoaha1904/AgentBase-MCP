# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 5.0.0 / okf-author-v10
- Agent outcome: succeeded
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Reference concept coverage: 100%
- Recognized schema agreement: 100%
- Metadata completeness: 75%
- Provenance coverage: 73%
- Reference relationship coverage: 100%
- Source-conflict visibility: 0%
- Unjudged concepts / relationships: 6 / 19
- Missing reference concepts / relationships: 0 / 0

## Hard failures

- OKF conformance failed: domains/index.md: invalid index line: - [Commerce](commerce.md)

## Owner-review findings

- cart-retention-ttl: source conflict is not visible with its evidence in a Limitations section

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
