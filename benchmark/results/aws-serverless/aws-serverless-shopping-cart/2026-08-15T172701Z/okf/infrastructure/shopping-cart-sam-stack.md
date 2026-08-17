---
title: Shopping Cart SAM Stack
description: AWS SAM desired-state definition for the cart API, Lambda handlers, DynamoDB table, cleanup queue, and API Gateway support.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
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
  - id: cart-stack-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L434
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-stack-definition]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [cart-stack-definition]
---

# Purpose

This SAM template defines the desired AWS resources for the shopping cart service.

# Configuration Root

`backend/shoppingcart-service.yaml` uses the AWS Serverless transform. It accepts Cognito user-pool values, product-service URL, and allowed-origin parameters, including SSM parameter defaults for the first three values.

# Declared Architecture

The definition declares the regional Cart API; cart HTTP handlers; an SQS-triggered deletion handler; a DynamoDB-stream aggregation handler; a DynamoDB table with `pk`/`sk` keys, old-and-new-image stream, and TTL; an SQS queue and DLQ; and IAM roles/policies.

# Inputs and Outputs

`AllowedOrigin` is a required string parameter. The stack outputs and writes the Cart API URL using API Gateway and region substitutions.

# Limitations

This file is desired state only. It does not prove stack creation, an AWS account, a region, concrete API IDs, or physical resource ARNs.

## Relationships

The definition belongs to the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and is implemented in the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
