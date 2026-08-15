---
type: AWS Lambda
title: Cart Migration Function
description: Cognito-authorized Lambda that merges anonymous cart items into a user cart and queues old entries for deletion.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Merge an anonymous cart into the signed-in user's cart.
resource_name: MigrateCartFunction
runtime: python3.8
handler: migrate_cart.lambda_handler
sources:
  - id: migration-function-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - id: migration-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
relationships:
  - kind: part-of
    target: components/shopping-cart-service
    evidence: [migration-function-definition]
    link: "[Shopping Cart Service](shopping-cart-service.md)"
  - kind: triggered-by
    target: interfaces/cart-api
    evidence: [migration-function-definition]
    link: "[Cart API](../interfaces/cart-api.md)"
  - kind: writes-to
    target: resources/shopping-cart-table
    evidence: [migration-handler]
    link: "[Shopping Cart Table](../resources/shopping-cart-table.md)"
  - kind: publishes-to
    target: resources/cart-deletion-queue
    evidence: [migration-handler]
    link: "[Cart Deletion Queue](../resources/cart-deletion-queue.md)"
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [migration-function-definition]
    link: "[Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md)"
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [migration-handler]
    link: "[aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Responsibility

On authenticated `POST /cart/migrate`, read anonymous items, add their quantities to the user's cart, enqueue the old records for deletion, and return the merged user cart.

# Runtime

The SAM function uses the global Python 3.8 runtime and 512 MB memory, has a 30-second timeout, active tracing, and handler `migrate_cart.lambda_handler`.

# Triggers

API Gateway invokes it for `POST /cart/migrate` with the Cognito authorizer.

# Permissions

It uses the cart write role, which includes DynamoDB write actions and SQS send-message permission in the template.

# Failure Behavior

Missing Cognito claims produce a 400 response. The code waits for all local update threads before it queries and returns the user cart; queue-send and DynamoDB exceptions are not handled in the handler.

# Limitations

The source does not evidence Lambda retries, a dead-letter destination for this function, concurrency settings, or a deployed function ARN.

Related: [Shopping Cart Service](shopping-cart-service.md), [Cart API](../interfaces/cart-api.md), [Shopping Cart Table](../resources/shopping-cart-table.md), [Cart Deletion Queue](../resources/cart-deletion-queue.md), [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md), and [aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md).
