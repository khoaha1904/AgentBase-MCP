---
title: Shopping Cart Service
description: SAM-defined serverless service providing cart operations and cart-maintenance workers.
type: Service
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L45
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L371
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: provides
    target: interfaces/cart-api
  - kind: implements
    target: flows/cart-migration
  - kind: implements
    target: flows/cart-total-maintenance
  - kind: uses
    target: resources/shopping-cart-table
  - kind: uses
    target: resources/cart-deletion-queue
---
# Responsibility

This service provides cart reads and writes plus protected migration and checkout operations. Its SAM definition also binds workers to cart-deletion SQS messages and DynamoDB stream records.

# Interfaces

It provides the [Cart API](../interfaces/cart-api.md).

# Dependencies

The service declares a DynamoDB cart table, an SQS deletion queue, a Cognito API authorizer, and an externally supplied product-service URL. The [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md) is the desired-state source for those bindings.

# Operations

The operationally significant behaviors are [Cart Migration](../flows/cart-migration.md) and [Cart Total Maintenance](../flows/cart-total-maintenance.md).

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[interfaces/cart-api](../interfaces/cart-api.md)
[flows/cart-migration](../flows/cart-migration.md)
[flows/cart-total-maintenance](../flows/cart-total-maintenance.md)
[resources/shopping-cart-table](../resources/shopping-cart-table.md)
[resources/cart-deletion-queue](../resources/cart-deletion-queue.md)
