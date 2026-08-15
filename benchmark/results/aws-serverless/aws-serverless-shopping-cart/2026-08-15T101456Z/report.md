# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 4.0.0 / okf-author-v6
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: invalid
- Owner review: needs_revision
- Reference concept coverage: 100%
- Recognized schema agreement: 86%
- Metadata completeness: 75%
- Provenance coverage: 55%
- Reference relationship coverage: 43%
- Unjudged concepts / relationships: 8 / 47
- Missing reference concepts / relationships: 0 / 4

## Hard failures

- Reference authenticated-cart-migration matched components/anonymous-cart-migration-lambda but expected schema Business Flow, found AWS Lambda

## Owner-review findings

- components/cart-aggregate-lambda.md: owner review needs an explicit Limitations section

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
