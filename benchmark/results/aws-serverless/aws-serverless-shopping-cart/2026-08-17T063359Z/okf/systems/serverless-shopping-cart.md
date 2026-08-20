---
title: Serverless Shopping Cart
description: Sample AWS serverless shopping-cart system with a Vue client, REST services, and DynamoDB-backed cart state.
type: System
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: readme-overview
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
  - id: owner-guidance-commerce
    resource: agentbase://owner-guidance/domains/commerce
relationships:
  - kind: part-of
    target: domains/commerce
    evidence: [owner-guidance-commerce]
---

# Purpose

This sample implements a shopping cart using AWS serverless services and a web client.
It is part of the [Commerce domain](../domains/commerce.md).

# Components

* [Web Client](../components/shopping-cart-web-client.md)
* [Shopping Cart Service](../components/shopping-cart-service.md)
* [Product Mock Service](../components/product-mock-service.md)

# Interfaces and Flows

The system exposes [Cart API](../interfaces/cart-api.md) and [Product API](../interfaces/product-api.md). Its critical behavior is documented as [cart migration and cleanup](../flows/cart-migration-and-cleanup.md) and [cart-total projection](../flows/cart-total-projection.md).

# Resources and Desired State

Cart state is held in the [shopping-cart DynamoDB table](../resources/shopping-cart-table.md); cleanup uses the [cart-deletion queue](../resources/cart-deletion-queue.md). [Shopping-cart SAM desired state](../infrastructure/shopping-cart-sam.md) declares these runtime resources.

# Limitations

The repository defines desired state only. It does not evidence a particular deployed stack, AWS account, region, endpoint, or running instance.
