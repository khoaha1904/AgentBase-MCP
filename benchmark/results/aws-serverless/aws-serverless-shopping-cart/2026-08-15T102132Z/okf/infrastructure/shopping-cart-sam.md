---
title: Shopping Cart SAM Definition
description: Root SAM desired-state configuration for the shopping-cart service and its infrastructure.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
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
  - CartDeleteSQSDLQ
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L74
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L434
relationships:
  - kind: declares
    target: components/shopping-cart-service
  - kind: declares
    target: resources/shopping-cart-table
  - kind: declares
    target: resources/cart-deletion-queue
---
# Purpose

This SAM root declares desired state for the shopping-cart API, Lambda functions, DynamoDB table, SQS queue and DLQ, API logging/tracing, and supporting IAM/SSM resources.

# Configuration Root

`backend/shoppingcart-service.yaml` is a SAM template with external SSM parameters for Cognito values and product-service URL, plus an allowed-origin input.

# Declared Architecture

It declares the [Shopping Cart Service](../components/shopping-cart-service.md), [Shopping Cart Table](../resources/shopping-cart-table.md), and [Cart Deletion Queue](../resources/cart-deletion-queue.md). It also defines API Gateway and function bindings for the [Cart API](../interfaces/cart-api.md) and its asynchronous workers.

# Inputs and Outputs

Inputs resolve user-pool and product-service settings from SSM and accept an allowed origin. The template writes the cart API URL to an SSM parameter and outputs the API endpoint URL.

# Limitations

This is configuration evidence only; it does not prove that a stack or any logical resource is deployed.

# Relationships

[components/shopping-cart-service](../components/shopping-cart-service.md)
[resources/shopping-cart-table](../resources/shopping-cart-table.md)
[resources/cart-deletion-queue](../resources/cart-deletion-queue.md)
