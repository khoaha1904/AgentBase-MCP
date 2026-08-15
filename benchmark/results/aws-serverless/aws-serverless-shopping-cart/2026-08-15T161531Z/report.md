# aws-serverless-shopping-cart — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.147.0
- Catalog/prompt: 5.0.0 / okf-author-v8
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: invalid
- Owner review: needs_revision
- Reference concept coverage: 86%
- Recognized schema agreement: 83%
- Metadata completeness: 25%
- Provenance coverage: 64%
- Reference relationship coverage: 0%
- Source-conflict visibility: 0%
- Unjudged concepts / relationships: 13 / 0
- Missing reference concepts / relationships: 1 / 6

## Hard failures

- Reference shopping-cart-service matched components/add-to-cart-function but expected schema Service, found AWS Lambda
- components/add-to-cart-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/add-to-cart-function.md: relationship triggered-by targets missing concept api-surface:shopping-cart-api
- components/add-to-cart-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/add-to-cart-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/cart-db-stream-handler.md: relationship part-of targets missing concept system:shopping-cart-application
- components/cart-db-stream-handler.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/cart-db-stream-handler.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/checkout-cart-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/checkout-cart-function.md: relationship triggered-by targets missing concept api-surface:shopping-cart-api
- components/checkout-cart-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/checkout-cart-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/delete-from-cart-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/delete-from-cart-function.md: relationship triggered-by targets missing concept aws-sqs-queue:cart-deletion-queue
- components/delete-from-cart-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/delete-from-cart-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/get-cart-total-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/get-cart-total-function.md: relationship triggered-by targets missing concept api-surface:shopping-cart-api
- components/get-cart-total-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/get-cart-total-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/get-product-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/get-product-function.md: relationship triggered-by targets missing concept api-surface:product-mock-api
- components/get-product-function.md: relationship declared-by targets missing concept infra-definition:product-mock-sam
- components/get-product-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/get-products-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/get-products-function.md: relationship triggered-by targets missing concept api-surface:product-mock-api
- components/get-products-function.md: relationship declared-by targets missing concept infra-definition:product-mock-sam
- components/get-products-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/list-cart-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/list-cart-function.md: relationship triggered-by targets missing concept api-surface:shopping-cart-api
- components/list-cart-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/list-cart-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/migrate-cart-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/migrate-cart-function.md: relationship triggered-by targets missing concept api-surface:shopping-cart-api
- components/migrate-cart-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/migrate-cart-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- components/update-cart-function.md: relationship part-of targets missing concept system:shopping-cart-application
- components/update-cart-function.md: relationship triggered-by targets missing concept api-surface:shopping-cart-api
- components/update-cart-function.md: relationship declared-by targets missing concept infra-definition:shopping-cart-sam
- components/update-cart-function.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- infrastructure/authentication-sam.md: relationship part-of targets missing concept system:shopping-cart-application
- infrastructure/authentication-sam.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- infrastructure/product-mock-sam.md: relationship part-of targets missing concept system:shopping-cart-application
- infrastructure/product-mock-sam.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart
- infrastructure/shopping-cart-sam.md: relationship part-of targets missing concept system:shopping-cart-application
- infrastructure/shopping-cart-sam.md: relationship implemented-in targets missing concept repository:aws-serverless-shopping-cart

## Owner-review findings

- root index links directly to systems/shopping-cart-application.md instead of a bounded role index
- root index links directly to repositories/aws-serverless-shopping-cart.md instead of a bounded role index
- cart-retention-ttl: source conflict is not visible with its evidence in a Limitations section
- components/delete-from-cart-function.md: owner review needs an explicit Limitations section
- components/migrate-cart-function.md: owner review needs an explicit Limitations section

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
