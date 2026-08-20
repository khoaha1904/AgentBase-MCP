# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 5.0.0 / okf-author-v12
- Agent outcome: succeeded
- OKF validation: failed
- Authoring assessment: invalid
- Owner review: needs_revision
- Reference concept coverage: 88%
- Recognized schema agreement: 100%
- Metadata completeness: 0%
- Provenance coverage: 64%
- Reference relationship coverage: 86%
- Source-conflict visibility: 100%
- Live-evidence reference coverage: 0%
- Unjudged concepts / relationships: 8 / 26
- Missing reference concepts / relationships: 1 / 1

## Hard failures

- OKF conformance failed: domains/index.md: only the root index may have frontmatter
- infrastructure/auth-sam.md: live claim 1 target kind is invalid
- infrastructure/shopping-cart-sam.md: live claim 1 target kind is invalid
- interfaces/cart-api.md: live claim 1 target kind is invalid
- resources/cart-deletion-queue.md: live claim 1 target kind is invalid
- resources/shopping-cart-table.md: live claim 1 target kind is invalid
- resources/shopping-cart-table.md: live claim 2 target kind is invalid

## Owner-review findings

- cart-retention-ttl: live evidence references or source roles are incomplete

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
