---
title: Shopping Cart Service
description: Serverless service that reads and changes carts, migrates anonymous carts, checks out carts, and maintains aggregate product quantities.
type: Service
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: cart-service-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L391
  - id: cart-service-behavior
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: product-lookup
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/utils.py#L15-L26
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-service-behavior]
  - kind: provides
    target: interfaces/cart-api
    evidence: [cart-service-definition]
  - kind: depends-on
    target: components/product-mock-service
    evidence: [product-lookup]
  - kind: publishes-to
    target: resources/cart-delete-queue
    evidence: [cart-service-definition]
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [cart-service-definition]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [cart-service-definition]
---

# Responsibility

This service provides cart retrieval, additions, quantity replacement, migration, checkout, and aggregate-total operations. Cart writes validate a product via the product service before updating DynamoDB. Migration moves anonymous-cart quantities to an authenticated-user key and sends cleanup messages asynchronously.

# Interfaces

The service provides the [Cart API](../interfaces/cart-api.md). Its configured functions include HTTP handlers for `/cart`, migration, checkout, and product totals; a DynamoDB stream handler maintains aggregate records; and an SQS handler deletes queued cart items.

# Dependencies

It calls the [Product Mock Service](product-mock-service.md) using a configured service URL. The SAM definition configures DynamoDB, Cognito authorizer support, and the [Cart Delete Queue](../resources/cart-delete-queue.md).

# Operations

SAM globals configure Python 3.8, active tracing, 512 MB memory, and a five-second default timeout. Migration has a 30-second timeout; checkout and total retrieval each have a ten-second timeout. The stream handler consumes batches of up to 100 with a 60-second batching window; delete processing reserves concurrency of 25 and uses batches of five.

# Limitations

The source defines desired configuration, not a deployed service instance. The documented cart policy says logged-in carts use a seven-day TTL, while migration writes a 30-day TTL; this disagreement is retained rather than resolved here.

## Relationships

The service is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), provides the [Cart API](../interfaces/cart-api.md), and is declared by the [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md). Its source is the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
