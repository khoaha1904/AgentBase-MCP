---
title: Serverless Shopping Cart
description: Sample AWS serverless shopping-cart system with a Vue frontend, cart API, product mock API, and Cognito authentication definitions.
type: System
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: owner-guidance
    resource: agentbase://owner-guidance/domains/commerce
  - id: readme-overview
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
  - id: build-orchestration
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/Makefile#L1-L44
relationships:
  - kind: part-of
    target: domains/commerce
    evidence: [owner-guidance]
---

# Purpose

The system demonstrates a serverless shopping cart. Its Vue frontend uses Amplify for authentication and API communication; the backend exposes REST APIs using API Gateway, Lambda, Cognito, and DynamoDB.

# Components

* [Shopping Cart Service](../components/shopping-cart-service.md) owns cart operations and aggregate quantities.
* [Product Mock Service](../components/product-mock-service.md) supplies product details used by cart writes.

# Interfaces and Flows

The frontend calls the [Cart API](../interfaces/cart-api.md) and [Product API](../interfaces/product-api.md). Critical behavior is captured in [Cart Migration](../flows/cart-migration.md) and [Cart Quantity Aggregation](../flows/cart-quantity-aggregation.md).

# Infrastructure

The desired state is defined by the three SAM templates: [shopping cart](../infrastructure/shopping-cart-sam-stack.md), [product mock](../infrastructure/product-mock-sam-stack.md), and [authentication](../infrastructure/authentication-sam-stack.md). The source documents build and deployment commands, but not a particular deployed account, region, or instance.

# Limitations

The repository calls this a sample application and states that checkout has no real payment integration. No deployed environment is evidenced.

## Relationships

This system is part of [Commerce](../domains/commerce.md) and is implemented in the [AWS Serverless Shopping Cart source](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
