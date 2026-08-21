# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 6.0.0 / okf-author-v13
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: invalid
- Owner review: needs_revision
- Reference concept coverage: 44%
- Recognized schema agreement: 75%
- Metadata completeness: 100%
- Provenance coverage: 17%
- Reference relationship coverage: 13%
- Source-conflict visibility: 100%
- Live-evidence reference coverage: 0%
- Unjudged concepts / relationships: 0 / 2
- Missing reference concepts / relationships: 5 / 7

## Hard failures

- Reference shopping-cart-system matched components/shopping-cart-service but expected schema System, found Service

## Owner-review findings

- domains/commerce.md: confirmed Domain does not navigate to a System
- cart-retention-ttl: live evidence references or source roles are incomplete
- domains/commerce.md: Markdown body lacks reviewable substance

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
