---
type: Database Table
title: Shopping cart DynamoDB table
description: Pay-per-request DynamoDB table keyed by pk and sk for cart records.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: sam-table
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L374-L394
  - id: handler-access
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L15-L40
---

# Data

SAM defines a DynamoDB table with partition key `pk`, sort key `sk`, on-demand billing, streams, and TTL.[^sam-table]

# Access

The [migration Lambda](../../infrastructure/aws/lambda/migrate-cart.md) reads the table from `TABLE_NAME` and updates user-keyed items.[^handler-access]
