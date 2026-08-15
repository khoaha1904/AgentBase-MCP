---
okf_version: "0.2"
---
# Serverless Shopping Cart
* [Repository](repositories/aws-serverless-shopping-cart.md) - Source-specific development contract
* [Shopping Cart System](systems/shopping-cart.md) - Canonical application boundary
* [Shopping Cart Service](components/shopping-cart-service.md) - Cart API and asynchronous workers
* [Product Mock Service](components/product-mock-service.md) - Demonstration product catalog API
* [Cart API](interfaces/cart-api.md) - Cart HTTP contract
* [Product API](interfaces/product-api.md) - Product HTTP contract
* [Cart Migration](flows/cart-migration.md) - Anonymous-cart handoff after sign-in
* [Cart Total Maintenance](flows/cart-total-maintenance.md) - Stream-driven aggregate update
* [Shopping Cart SAM Definition](infrastructure/shopping-cart-sam.md) - Desired state for cart resources
* [Product Mock SAM Definition](infrastructure/product-mock-sam.md) - Desired state for product resources
* [Shopping Cart Table](resources/shopping-cart-table.md) - Cart and aggregate persistence
* [Cart Deletion Queue](resources/cart-deletion-queue.md) - Deferred anonymous-cart deletion
