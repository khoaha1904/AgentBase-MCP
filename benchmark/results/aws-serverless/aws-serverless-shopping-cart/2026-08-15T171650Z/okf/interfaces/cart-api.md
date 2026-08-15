---
title: Cart REST API
description: API Gateway surface for cart retrieval, mutation, migration, checkout, and aggregate lookup.
type: API Surface
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: cart-api-docs
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: cart-routes
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L315
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-routes]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [cart-routes]
---

# Cart REST API

## Purpose

Consumer-facing HTTP boundary for a user's cart and aggregate product quantities.

## Consumers

The Vue frontend invokes `/cart`, `/cart/migrate`, and `/cart/checkout` through Amplify.

## Authentication

The API declares a Cognito authorizer; migration and checkout explicitly select it. Frontend calls include an authorization token when a session exists.

## Operations

`GET /cart`; `POST /cart`; `PUT /cart/{product_id}`; `POST /cart/migrate`; `POST /cart/checkout`; and `GET /cart/{product_id}/total`.

## Failure Behavior

Handler-level responses and API Gateway behavior are implementation-specific; no shared error contract is documented.

## Limitations

The aggregate endpoint is documented as unauthenticated and is not used by the frontend.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md)
