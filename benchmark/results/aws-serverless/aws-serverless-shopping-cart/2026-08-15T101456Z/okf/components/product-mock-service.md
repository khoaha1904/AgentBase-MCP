---
title: Product Mock Service
description: Serverless mock service that returns product details.
type: Service
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L56
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
  - kind: provides
    target: interfaces/product-api
---
# Product Mock Service

## Responsibility

This bare-bones mock product service returns details for all products or an individual product. It exists to demonstrate the cart application's functionality.

## Interfaces

It provides the [Product API](../interfaces/product-api.md). The [Shopping Cart Service](shopping-cart-service.md) is configured to retrieve a product by identifier from the product service.

## Limitations

Its backing product data and production ownership are not modeled as independent knowledge entities because the source only characterizes this service as a mock.

This service is part of the [Shopping Cart System](../systems/serverless-shopping-cart.md).
