Created and validated the OKF bundle in [okf](<OUTPUT_ROOT>/okf/index.md).

Canonical concepts:

- Repository, system, two services, two API surfaces
- Cart migration flow
- DynamoDB cart table and SQS deletion queue
- Shopping-cart SAM infrastructure definition

Validation passed for all 10 concepts with resolving links and provenance spans.

Limitations / unresolved items:

- No deployed stack or deployment instance is evidenced.
- Authentication template details were not modeled as a separate canonical component.
- API response schemas, message idempotency, runtime health, and ownership boundaries are not documented by the inspected source.