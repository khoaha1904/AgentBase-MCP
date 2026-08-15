---
title: Cart Service
description: Serverless service that manages carts and exposes cart operations.
type: Service
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: cart-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L371
  - id: cart-api-docs
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    link: ../systems/serverless-shopping-cart.md
    evidence: [cart-template]
  - kind: provides
    target: interfaces/cart-api
    link: ../interfaces/cart-api.md
    evidence: [cart-template]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    link: ../repositories/aws-serverless-shopping-cart.md
    evidence: [cart-template]
---

# Cart Service

## Responsibility

The service lists, adds, updates, migrates, checks out, and aggregates shopping-cart entries through Lambda handlers.

## Interfaces

- [Cart REST API](../interfaces/cart-api.md)

## Dependencies

It uses the cart DynamoDB table, calls the product-service URL while adding/updating items, and sends migration cleanup work to SQS.

## Operations

SAM config sets a 5-second global function timeout, with 30 seconds for migration and 10 seconds for checkout and total lookup. X-Ray tracing is active globally.

## Relationships

- `reads-from`: [Cart table](../resources/cart-table.md) (source: cart-template)
- `writes-to`: [Cart table](../resources/cart-table.md) (source: cart-template)

## Limitations

The configured product-service URL identifies a dependency but does not establish a deployed endpoint.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [Cart REST API](../interfaces/cart-api.md)
- [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md)
