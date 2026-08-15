---
title: Get product cart total
type: api_endpoint
status: draft
benchmark_key: get-product-cart-total
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L297-L314
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/get_cart_total.py#L18-L33
relationships:
  - kind: exposed_by
    target: cart-api
  - kind: reads_from
    target: shopping-cart-table
---

`GET /cart/{product_id}/total` on the [cart API](cart-api.md) returns the stored aggregate quantity for a product from the [shopping cart table](shopping-cart-table.md).
