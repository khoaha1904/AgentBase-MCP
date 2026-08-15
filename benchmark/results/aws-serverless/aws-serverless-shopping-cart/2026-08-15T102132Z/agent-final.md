Created and validated the OKF bundle at [okf/index.md](<OUTPUT_ROOT>/okf/index.md).

Canonical identities include:

- `repositories/aws-serverless-shopping-cart`
- `systems/shopping-cart`
- `components/shopping-cart-service`, `components/product-mock-service`
- `interfaces/cart-api`, `interfaces/product-api`
- `flows/cart-migration`, `flows/cart-total-maintenance`
- `resources/shopping-cart-table`, `resources/cart-deletion-queue`
- `infrastructure/shopping-cart-sam`, `infrastructure/product-mock-sam`

Limitations recorded in the concepts include mock-product scope, absent real payment integration, incomplete API error/versioning evidence, and no evidence of deployed infrastructure state.

Unresolved items a maintainer could answer later:

- Whether either SAM definition has a deployed stack or endpoint.
- Migration idempotency/replay and delayed-deletion behavior.
- Aggregate reconciliation and duplicate-stream-record handling.
- The intended authorization policy for cart routes other than migration and checkout.