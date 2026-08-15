Created and validated the OKF bundle at [okf/index.md](<OUTPUT_ROOT>/okf/index.md).

Concept keys:

- Endpoints: `cart-get-endpoint`, `cart-post-endpoint`, `cart-product-put-endpoint`, `cart-migrate-post-endpoint`, `cart-checkout-post-endpoint`, `cart-product-total-get-endpoint`, `product-get-endpoint`, `products-get-endpoint`
- Lambdas: `list-cart-lambda`, `add-to-cart-lambda`, `update-cart-lambda`, `migrate-cart-lambda`, `checkout-cart-lambda`, `get-cart-total-lambda`, `delete-from-cart-lambda`, `cart-db-stream-lambda`, `get-product-lambda`, `get-products-lambda`
- Resources: `shopping-cart-dynamodb-table`, `cart-delete-sqs-queue`

Limitations recorded: authentication details, SSM-configured product-service dependency, packaged product JSON, and DynamoDB stream trigger have no selected concrete target schema. The queue DLQ has no direct producer/consumer evidence.