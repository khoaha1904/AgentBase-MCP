---
title: Cart SAM Template
description: AWS SAM desired-state definition for cart APIs, functions, data, queues, and IAM.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
configuration_root: backend/shoppingcart-service.yaml
declared_resources: CartApi, cart Lambda functions, DynamoDBShoppingCartTable, CartDeleteSQSQueue, CartDeleteSQSDLQ, IAM resources
sources:
  - id: template-root
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L45
  - id: template-resources
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L47-L429
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [template-resources]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [template-root]
---

# Cart SAM Template

## Purpose

Defines the cart service's desired AWS architecture.

## Configuration Root

`backend/shoppingcart-service.yaml` is an AWS SAM template.

## Declared Architecture

It declares API Gateway, Cognito authorizer integration, Lambda functions and layer, DynamoDB table and stream, SQS queue/DLQ, IAM policies, and an SSM API URL parameter.

## Inputs and Outputs

The template reads Cognito identifiers and the product-service URL from SSM parameters, requires an allowed CORS origin, and outputs a Cart API URL expression.

## Limitations

The URL expression and resource logical IDs are desired configuration, not evidence of an actual deployment.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md)
