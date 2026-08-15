# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 3.0.0 / okf-author-direct-v3
- Agent outcome: succeeded
- OKF validation: failed
- Authoring assessment: invalid
- Reference concept coverage: 60%
- Recognized schema agreement: 0%
- Metadata completeness: 0%
- Provenance coverage: 0%
- Reference relationship coverage: 0%
- Unjudged concepts / relationships: 13 / 24
- Missing reference concepts / relationships: 2 / 5

## Hard failures

- add-to-cart.md: generated.by must identify agentbase/<version>
- add-to-cart.md: generated.at must be an ISO 8601 datetime
- add-to-cart.md: every source requires resource
- cart-api.md: generated.by must identify agentbase/<version>
- cart-api.md: generated.at must be an ISO 8601 datetime
- cart-api.md: every source requires resource
- cart-deletion-dead-letter-queue.md: generated.by must identify agentbase/<version>
- cart-deletion-dead-letter-queue.md: generated.at must be an ISO 8601 datetime
- cart-deletion-dead-letter-queue.md: every source requires resource
- cart-deletion-queue.md: generated.by must identify agentbase/<version>
- cart-deletion-queue.md: generated.at must be an ISO 8601 datetime
- cart-deletion-queue.md: every source requires resource
- cart-deletion-worker.md: generated.by must identify agentbase/<version>
- cart-deletion-worker.md: generated.at must be an ISO 8601 datetime
- cart-deletion-worker.md: every source requires resource
- cart-quantity-aggregator.md: generated.by must identify agentbase/<version>
- cart-quantity-aggregator.md: generated.at must be an ISO 8601 datetime
- cart-quantity-aggregator.md: every source requires resource
- checkout-cart.md: generated.by must identify agentbase/<version>
- checkout-cart.md: generated.at must be an ISO 8601 datetime
- checkout-cart.md: every source requires resource
- cognito-user-pool.md: generated.by must identify agentbase/<version>
- cognito-user-pool.md: generated.at must be an ISO 8601 datetime
- cognito-user-pool.md: every source requires resource
- get-product.md: generated.by must identify agentbase/<version>
- get-product.md: generated.at must be an ISO 8601 datetime
- get-product.md: every source requires resource
- get-product-cart-total.md: generated.by must identify agentbase/<version>
- get-product-cart-total.md: generated.at must be an ISO 8601 datetime
- get-product-cart-total.md: every source requires resource
- list-cart.md: generated.by must identify agentbase/<version>
- list-cart.md: generated.at must be an ISO 8601 datetime
- list-cart.md: every source requires resource
- list-products.md: generated.by must identify agentbase/<version>
- list-products.md: generated.at must be an ISO 8601 datetime
- list-products.md: every source requires resource
- migrate-anonymous-cart.md: generated.by must identify agentbase/<version>
- migrate-anonymous-cart.md: generated.at must be an ISO 8601 datetime
- migrate-anonymous-cart.md: every source requires resource
- product-api.md: generated.by must identify agentbase/<version>
- product-api.md: generated.at must be an ISO 8601 datetime
- product-api.md: every source requires resource
- shopping-cart-table.md: generated.by must identify agentbase/<version>
- shopping-cart-table.md: generated.at must be an ISO 8601 datetime
- shopping-cart-table.md: every source requires resource
- update-cart-item.md: generated.by must identify agentbase/<version>
- update-cart-item.md: generated.at must be an ISO 8601 datetime
- update-cart-item.md: every source requires resource
- Reference post-cart-migrate matched migrate-anonymous-cart but expected schema API Endpoint, found api_endpoint
- Reference dynamodb-shopping-cart-table matched shopping-cart-table but expected schema Database Table, found database
- Reference cart-delete-sqs-queue matched cart-deletion-dead-letter-queue but expected schema AWS SQS Queue, found queue
- cart-deletion-queue.md: relationship dead_letters_to -> cart-deletion-dead-letter-queue has no resolving Markdown link

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
