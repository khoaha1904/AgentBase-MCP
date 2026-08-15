Created and validated the OKF bundle in [okf](<OUTPUT_ROOT>/okf).

Canonical concepts:

- `systems/serverless-shopping-cart`
- `repositories/aws-serverless-shopping-cart`
- `components/shopping-cart-service`, `product-mock-service`, `vue-frontend`
- `components/cart-migration-function`, `cart-deletion-worker`, `cart-total-projector`
- `interfaces/cart-api`, `product-api`
- `resources/shopping-cart-table`, `cart-deletion-queue`
- `infrastructure/shopping-cart-sam-stack`, `product-mock-sam-stack`
- `flows/cart-migration`, `cart-total-projection`

Validation passed for all 16 canonical concepts, their relationships, and the two ordered flows.

Key limitations recorded include absence of deployed AWS-instance evidence, missing ownership/SLO data, unspecified API schemas/rate limits, and undocumented stream retry/idempotency behavior. The table also records an evidence-backed TTL disagreement: README says seven days for logged-in carts, while migration code writes 30 days.

Unresolved maintainer questions: actual deployment/account/region details, production product-catalog boundary, API contract/versioning policy, and recovery semantics for partial migration or repeated DynamoDB Stream delivery.