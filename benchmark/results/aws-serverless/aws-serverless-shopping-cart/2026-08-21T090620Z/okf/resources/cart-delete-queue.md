---
type: Queue
title: Cart Deletion Queue
description: Desired asynchronous handoff for deleting migrated anonymous-cart items.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:08:05.434Z
sources:
  - id: obs_queue
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shoppingcart-service.yaml#L413-L423
  - id: queue_producer
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shopping-cart-service/migrate_cart.py#L76-L90
agentbase:
  technology:
    - AWS
---

# Purpose

The migration handler sends anonymous-cart items to a queue for asynchronous deletion [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shopping-cart-service/migrate_cart.py#L76-L90).

# Messages

The handler serializes each cart item as the message body [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shopping-cart-service/migrate_cart.py#L85-L87).

# Producers

Cart migration is the evidenced producer [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shopping-cart-service/migrate_cart.py#L76-L90).

# Consumers

The desired-state template configures `DeleteFromCartFunction` with this queue as an SQS event source [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shoppingcart-service.yaml#L316-L345).

# Failure Behavior

The desired-state queue configuration names a dead-letter queue and allows five receives before redrive [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shoppingcart-service.yaml#L413-L423).
