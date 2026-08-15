---
type: Service
title: Shopping Cart Service
description: SAM-declared Lambda-backed REST service for cart operations.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-cart-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: cart-sam-functions
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L371
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [readme-cart-api]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: provides
    target: interfaces/cart-api
    evidence: [cart-sam-functions]
    link: "[Cart API](../interfaces/cart-api.md)"
  - kind: reads-from
    target: resources/shopping-cart-table
    evidence: [cart-sam-functions]
    link: "[Shopping Cart Table](../resources/shopping-cart-table.md)"
  - kind: writes-to
    target: resources/shopping-cart-table
    evidence: [cart-sam-functions]
    link: "[Shopping Cart Table](../resources/shopping-cart-table.md)"
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [cart-sam-functions]
    link: "[Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md)"
---

# Responsibility

The service implements cart retrieval, item addition and update, anonymous-to-user migration, checkout, and aggregate product-total retrieval.

# Interfaces

It provides the [Cart API](../interfaces/cart-api.md). Cart migration and checkout are configured with the Cognito authorizer; the documented API also permits anonymous cart use.

# Dependencies

It reads and writes [Shopping Cart Table](../resources/shopping-cart-table.md). Item mutation handlers are configured with a product-service URL, and migration publishes deletion work to [Cart Deletion Queue](../resources/cart-deletion-queue.md).

# Operations

SAM globally configures Python 3.8, 512 MB, a five-second default timeout, active tracing, and a `live` alias. Migration overrides timeout to 30 seconds; checkout and aggregate-total handlers use 10 seconds.

# Limitations

The source documents service operations but does not give an API versioning policy, service owner, production SLOs, or deployment evidence.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), [Cart API](../interfaces/cart-api.md), [Shopping Cart Table](../resources/shopping-cart-table.md), and [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
