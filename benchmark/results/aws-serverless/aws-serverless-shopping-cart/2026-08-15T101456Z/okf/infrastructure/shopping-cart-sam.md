---
title: Shopping Cart SAM Definition
description: AWS SAM/CloudFormation root definition for cart APIs, functions, storage, and queueing.
type: Infrastructure Definition
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
configuration_root: backend/shoppingcart-service.yaml
declared_resources:
  - CartApi
  - DynamoDBShoppingCartTable
  - CartDeleteSQSQueue
  - CartDeleteSQSDLQ
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L45
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L429
relationships:
  - kind: declares
    target: components/shopping-cart-service
  - kind: declares
    target: components/anonymous-cart-migration-lambda
  - kind: declares
    target: components/cart-deletion-worker-lambda
  - kind: declares
    target: components/cart-aggregate-lambda
  - kind: declares
    target: resources/cart-table
  - kind: declares
    target: resources/cart-deletion-queue
  - kind: defines
    target: interfaces/cart-api
---
# Shopping Cart SAM Definition

## Purpose

`backend/shoppingcart-service.yaml` is the AWS SAM root desired-state definition for the cart API, Lambda handlers, DynamoDB table, SQS queue, IAM roles and policies, and API logging/tracing settings.

## Configuration Root

Its inputs include SSM parameter references for Cognito identifiers and the product-service URL, plus an allowed CORS origin. Function globals set Python 3.8, tracing, a live alias, and shared environment variables.

## Declared Architecture

The definition declares the [Cart API](../interfaces/cart-api.md), the [Cart Table](../resources/cart-table.md), the [Cart Deletion Queue](../resources/cart-deletion-queue.md), and operationally distinct migration, deletion-worker, and aggregate Lambdas.

## Inputs and Outputs

It publishes the cart API URL to the SSM path `/serverless-shopping-cart-demo/shopping-cart/cart-api-url` and as a CloudFormation output.

## Limitations

This is a desired-state configuration only. No source evidence proves a stack deployment or the values supplied to its parameters.

It declares the [Shopping Cart Service](../components/shopping-cart-service.md), [Anonymous Cart Migration Lambda](../components/anonymous-cart-migration-lambda.md), [Cart Deletion Worker Lambda](../components/cart-deletion-worker-lambda.md), and [Cart Aggregate Lambda](../components/cart-aggregate-lambda.md).
