---
okf_version: "0.2"
---
# AWS Serverless Shopping Cart

* [Cart API](cart-api.md) - REST API for shopping-cart operations.
* [Product API](product-api.md) - Mock product catalog REST API.
* [Cognito user pool](cognito-user-pool.md) - User authentication pool.
* [Shopping cart table](shopping-cart-table.md) - DynamoDB cart and aggregate storage.
* [Cart deletion queue](cart-deletion-queue.md) - Asynchronous anonymous-cart deletion queue.
* [Cart deletion dead-letter queue](cart-deletion-dead-letter-queue.md) - Failed deletion messages.
* [List cart](list-cart.md) - GET /cart behavior.
* [Add to cart](add-to-cart.md) - POST /cart behavior.
* [Update cart item](update-cart-item.md) - PUT /cart/{product_id} behavior.
* [Migrate anonymous cart](migrate-anonymous-cart.md) - POST /cart/migrate behavior.
* [Checkout cart](checkout-cart.md) - POST /cart/checkout behavior.
* [Get product cart total](get-product-cart-total.md) - GET /cart/{product_id}/total behavior.
* [List products](list-products.md) - GET /product behavior.
* [Get product](get-product.md) - GET /product/{product_id} behavior.
* [Cart deletion worker](cart-deletion-worker.md) - SQS-triggered DynamoDB deletion handler.
* [Cart quantity aggregator](cart-quantity-aggregator.md) - DynamoDB-stream quantity aggregation handler.
