---
type: Infrastructure Definition
title: Shopping Cart SAM Stack
description: AWS SAM desired-state definition for the cart API, Lambda handlers, DynamoDB table, and deletion queues.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
configuration_root: backend/shoppingcart-service.yaml
declared_resources: "CartApi, cart Lambda functions, DynamoDBShoppingCartTable, CartDeleteSQSQueue, CartDeleteSQSDLQ, roles, policies, layer, and SSM parameter"
sources:
  - id: cart-sam-global-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L75
  - id: cart-sam-resources
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L429
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-sam-global-api]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [cart-sam-global-api]
    link: "[aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Purpose

Defines desired AWS resources for the shopping-cart service.

# Configuration Root

`backend/shoppingcart-service.yaml` is an AWS SAM template. Its inputs include Cognito identifiers and the product service URL sourced from SSM, plus an allowed CORS origin.

# Declared Architecture

It defines a regional API Gateway API with tracing and Cognito authorizer, cart Lambda functions, a shared layer, a DynamoDB table with stream and TTL, SQS deletion queue and DLQ, IAM roles/policies, and an SSM parameter that publishes the Cart API URL.

# Inputs and Outputs

The template reads `/serverless-shopping-cart-demo/auth/user-pool-arn`, `/auth/user-pool-id`, and `/products/products-api-url` by default. It emits a `CartApi` URL derived from the CloudFormation resource and region.

# Limitations

This is a configuration definition, not evidence that a stack was created. Parameter defaults and output expressions do not establish real account IDs, regions, URLs, ARNs, or resource instances.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and [aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md).
