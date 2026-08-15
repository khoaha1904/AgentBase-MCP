---
title: Serverless Shopping Cart
description: Sample AWS serverless shopping-cart system with a Vue frontend and REST backend.
type: System
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/commerce
  - id: readme-architecture
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
relationships:
  - kind: part-of
    target: domains/commerce
    evidence: [owner-domain]
---

# Serverless Shopping Cart

## Purpose

This sample demonstrates an AWS serverless shopping-cart microservice, backed by REST APIs and a Vue application.

## Architecture

The system comprises a cart service, a mock-product service, a browser frontend, Cognito authentication definitions, and a DynamoDB cart table. The cart service also uses SQS cleanup and DynamoDB Streams aggregation.

## Key Entities

- [Cart service](../components/cart-service.md)
- [Product mock service](../components/product-mock-service.md)
- [Cart API](../interfaces/cart-api.md)
- [Cart table](../resources/cart-table.md)
- [Anonymous-cart migration](../flows/anonymous-cart-migration.md)
- [Cart quantity aggregation](../flows/cart-quantity-aggregation.md)

## Limitations

The repository contains desired-state templates only; no account, region, ARN, or deployed-instance evidence was inspected.

## Relationship Links

- [Commerce](../domains/commerce.md)
