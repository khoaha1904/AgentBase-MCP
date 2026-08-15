---
okf_version: "0.2"
---
# Serverless Shopping Cart: Cart Migration

* [Cart Migration API](api/cart-migration.md) - POST /cart/migrate
* [Cart Migration Lambda](infrastructure/aws/lambda/cart-migration.md) - migrates anonymous carts
* [Cart Deletion Queue](infrastructure/aws/sqs/cart-deletion.md) - asynchronous deletion work
* [Cart Deletion Lambda](infrastructure/aws/lambda/cart-deletion.md) - consumes deletion work
* [Shopping Cart Table](data/tables/shopping-cart.md) - DynamoDB cart storage
* [Anonymous Cart Migration](flows/anonymous-cart-migration.md) - moves anonymous cart items to a signed-in user
