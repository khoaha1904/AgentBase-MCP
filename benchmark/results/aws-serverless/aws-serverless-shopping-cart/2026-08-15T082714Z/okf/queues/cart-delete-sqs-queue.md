---
title: Cart deletion SQS queue
description: Queue used to deliver cart item deletion work.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L423
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
type: Queue
benchmark_key: cart-delete-sqs-queue
relationships: []
---

# Messages

The queue has a 20-second visibility timeout and a dead-letter queue after five receives.

# Producers

The template grants the cart role permission to send messages, but does not identify a specific producing handler in the cited queue declaration.

# Consumers

`DeleteFromCartFunction` is configured with this queue as an SQS event source.
