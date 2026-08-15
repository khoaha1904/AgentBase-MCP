---
type: System
title: Serverless Shopping Cart
description: Sample AWS serverless shopping-cart application with a Vue frontend, cart service, and mock product service.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-overview
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
  - id: readme-cart-behavior
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L16-L50
---

# Purpose

This sample implements a shopping cart on AWS serverless technologies. It allows anonymous carts, then merges them into a signed-in user's cart; a Vue application uses AWS Amplify for authentication and API communication.

# Architecture

The [Vue Frontend](../components/vue-frontend.md) consumes the [Cart API](../interfaces/cart-api.md) and [Product API](../interfaces/product-api.md). The cart service stores cart entries in DynamoDB, uses SQS to defer deletion after migration, and uses a DynamoDB Stream to maintain aggregate quantities.

# Key Behavior

* [Cart Migration](../flows/cart-migration.md) merges anonymous items into the signed-in cart and defers deletion.
* [Cart Total Projection](../flows/cart-total-projection.md) incrementally maintains an aggregate per product.

# Limitations

The source defines deployable infrastructure but does not evidence an AWS account, region, stack instance, resource ARN, or an active deployment.
