---
title: Cart Migration
description: Authenticated workflow that merges an anonymous browser cart into a user's cart and asynchronously cleans up the old records.
type: Business Flow
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
business_purpose: Preserve products added before sign-in by merging them into the authenticated cart.
trigger: POST /cart/migrate after user login.
outcome: Authenticated cart contains merged quantities and anonymous records are queued for deletion.
sources:
  - id: migration-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - id: migration-api-binding
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - id: migration-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
  - id: delete-consumer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L14-L30
flow_steps:
  - order: 1
    source: interfaces/cart-api
    action: invokes
    target: components/shopping-cart-service
    mode: synchronous
    evidence: [migration-api-binding]
  - order: 2
    source: components/shopping-cart-service
    action: publishes
    target: resources/cart-delete-queue
    mode: asynchronous
    evidence: [migration-handler]
  - order: 3
    source: resources/cart-delete-queue
    action: delivers
    target: components/shopping-cart-service
    mode: asynchronous
    evidence: [delete-consumer]
relationships:
  - kind: part-of
    target: domains/commerce
    evidence: [migration-design]
---

# Purpose

Migrate products accumulated in an anonymous browser cart into the cart identified by the authenticated Cognito user.

# Trigger

The frontend calls `POST /cart/migrate` after login. API Gateway configures this route with the Cognito authorizer.

# Outcome

The migration handler adds each anonymous item quantity to the user's item, then returns the updated authenticated cart. Cleanup of anonymous records is delegated to SQS.

# Flow

The ordered steps above represent the API invocation, read/merge behavior, message publication, and asynchronous deletion delivery.

# Failure and Recovery

Invalid user claims return HTTP 400. Because deletion happens through SQS, it is deliberately not part of the synchronous merge; the queue has a DLQ after five receives.

# Limitations

The code starts one thread per anonymous item and joins the threads before responding. No behavior is documented for partial failures between a user-cart update and the cleanup message.

## Participants

[Cart API](../interfaces/cart-api.md) invokes the [Shopping Cart Service](../components/shopping-cart-service.md), which publishes to the [Cart Delete Queue](../resources/cart-delete-queue.md); the queue delivers cleanup work to the same [Shopping Cart Service](../components/shopping-cart-service.md). The flow is part of [Commerce](../domains/commerce.md).
