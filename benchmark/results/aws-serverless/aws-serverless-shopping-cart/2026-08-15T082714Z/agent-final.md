Created and validated the OKF bundle at [okf/index.md](<OUTPUT_ROOT>/okf/index.md).

Concept keys:

- `dynamodb-shopping-cart-table`
- `cart-delete-sqs-queue`
- `get-cart`, `post-cart`, `put-cart-product-id`
- `post-cart-migrate`, `post-cart-checkout`, `get-cart-product-id-total`
- `get-product`, `get-product-product-id`

Limitations: the selected schemas did not include an AWS Lambda concept type, so handler/storage relationships are described but not linked as separate concepts. Queue producer identity was not concretely bound to a handler in its queue declaration.