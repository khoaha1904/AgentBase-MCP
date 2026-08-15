---
okf_version: "0.2"
---
# AWS Serverless Shopping Cart

* [Repository](repositories/aws-serverless-shopping-cart.md) - Source-specific structure and build contract.
* [Shopping Cart System](systems/serverless-shopping-cart.md) - Serverless cart sample and its client-facing boundaries.
* [Shopping Cart Service](components/shopping-cart-service.md) - Cart operations and persistence behavior.
* [Product Mock Service](components/product-mock-service.md) - Read-only product catalog mock.
* [Vue Shopping Cart Client](components/vue-shopping-cart-client.md) - Browser client using Amplify.
* [Cart API](interfaces/cart-api.md) - Cart REST operations.
* [Product API](interfaces/product-api.md) - Product REST operations.
* [Cart Table](resources/cart-table.md) - DynamoDB cart state and aggregate records.
* [Cart Deletion Queue](resources/cart-deletion-queue.md) - Deferred cart-item deletion messages.
* [Anonymous Cart Migration Lambda](components/anonymous-cart-migration-lambda.md) - Moves anonymous cart entries after login.
* [Cart Deletion Worker Lambda](components/cart-deletion-worker-lambda.md) - Processes deferred deletions.
* [Cart Aggregate Lambda](components/cart-aggregate-lambda.md) - Maintains per-product totals from DynamoDB Streams.
* [Shopping Cart SAM Definition](infrastructure/shopping-cart-sam.md) - Desired-state cart stack definition.
* [Product Mock SAM Definition](infrastructure/product-mock-sam.md) - Desired-state product stack definition.
* [Authentication SAM Definition](infrastructure/authentication-sam.md) - Desired-state Cognito resources definition.
