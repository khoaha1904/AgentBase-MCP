---
type: Business Flow
title: Authenticated cart migration
description: Moves an anonymous cart to an authenticated user and queues removal of old items.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: frontend-call
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/frontend/src/backend/api.js#L71-L77
  - id: handler-flow
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
---

# Trigger

The frontend posts to the [cart migration endpoint](../api/post-cart-migrate.md).[^frontend-call]

# Outcome

Anonymous cart items are copied to user-keyed records in the [cart table](../data/tables/shopping-cart.md), and old items are sent to the [delete queue](../infrastructure/aws/sqs/cart-delete.md).[^handler-flow]

# Flow

The endpoint invokes the [migration Lambda](../infrastructure/aws/lambda/migrate-cart.md), which performs the DynamoDB and SQS operations.
