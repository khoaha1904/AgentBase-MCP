---
title: Cart API
type: api
status: draft
benchmark_key: cart-api
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L57-L75
relationships:
  - kind: authenticates_with
    target: cognito-user-pool
---

Regional API Gateway REST API for the shopping cart, with a [Cognito user pool](cognito-user-pool.md) authorizer configured. Individual operations are documented by their route concepts.

Limitation: the template does not assign an explicit API name.
