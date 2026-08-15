---
title: Shopping Cart SAM Definition
type: Infrastructure Definition
description: AWS SAM desired-state definition for the cart API, cart functions, table, and cleanup queue.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
configuration_root: backend/shoppingcart-service.yaml
declared_resources:
  - CartApi
  - ListCartFunction
  - AddToCartFunction
  - UpdateCartFunction
  - MigrateCartFunction
  - CheckoutCartFunction
  - GetCartTotalFunction
  - DeleteFromCartFunction
  - CartDBStreamHandler
  - DynamoDBShoppingCartTable
  - CartDeleteSQSQueue
sources:
  - id: cart-sam-api-and-functions
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L21-L295
  - id: cart-sam-data-and-async
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L297-L434
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [cart-sam-api-and-functions]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [cart-sam-api-and-functions]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Shopping Cart SAM Definition

This SAM template defines the regional cart API, Python 3.8 Lambda runtime defaults, cart handlers, a DynamoDB cart table, and SQS-based deletion. It also configures API tracing, CORS, and a Cognito authorizer for selected cart actions.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md) and [Repository](../repositories/aws-serverless-shopping-cart.md).

## Declared Architecture

The template declares the cart API and handlers for listing, adding, updating, migrating, checking out, and reading totals. The table has a `pk`/`sk` key schema, DynamoDB Stream old/new images, and TTL on `expirationTime`. The deletion queue has a dead-letter queue and drives a reserved-concurrency worker; the stream drives the aggregate handler.

# Limitations

This is desired state only. Parameter and substitution expressions do not establish a deployed API URL, table, queue, region, or account.
