---
type: Queue
title: Cart-delete-queue
description: Decoupled cart deletion transport and failure-handling boundary.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:31:26.461Z
sources:
  - id: obs_delete_queue
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shoppingcart-service.yaml#L413-L422
agentbase:
  technology:
    - AWS
---

# Purpose

Carries deferred cart-item deletion work. Its declared redrive policy sends messages that exceed the receive limit to a separate dead-letter queue.

# Interactions

The cart migration handler is configured with the queue reference, and a separately declared worker has an SQS trigger for it. This document records the intended asynchronous boundary rather than live queue state.

# Limitations

Suggested type `Queue` is evidence-bound agent intent and requires proposal review.

The template does not evidence a current queue URL, ARN, message depth, consumer health, or deployed redrive configuration.
