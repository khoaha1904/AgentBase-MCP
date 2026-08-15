---
title: Migrate Cart Function
type: AWS Lambda
description: Lambda that merges an anonymous cart into an authenticated user's cart and queues cleanup.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Migrate anonymous cart items to an authenticated user's cart.
resource_name: MigrateCartFunction
runtime: python3.8
handler: migrate_cart.lambda_handler
sources:
  - id: migrate-cart-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - id: migrate-cart-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [migrate-cart-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:shopping-cart-api
    evidence: [migrate-cart-definition]
    link: "[Shopping Cart API](../interfaces/shopping-cart-api.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [migrate-cart-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [migrate-cart-handler]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Migrate Cart Function

The authenticated `POST /cart/migrate` function has a 30-second timeout. It merges anonymous cart items under the Cognito subject and sends the old items to the deletion queue.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart API](../interfaces/shopping-cart-api.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

## Failure Behavior

If the authorizer claims do not contain a user subject, the handler returns HTTP 400. The template does not configure an explicit Lambda failure destination.
