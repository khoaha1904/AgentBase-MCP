# amazon-ecs-fullstack — agent OKF benchmark

- Agent: gpt-5.6-terra via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-refresh-v3
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: reviewable
- Owner review: needs_revision
- Initial Ingest acceptance: valid_partial
- Reference concept coverage: 100% (5/5)
- Recognized schema agreement: 100% (5/5)
- Metadata completeness: n/a (0/0)
- Provenance coverage: 100% (4/4)
- Reference relationship coverage: 100% (4/4)
- Source-conflict visibility: n/a (0/0)
- Live-evidence reference coverage: n/a (0/0)
- Embedded-knowledge coverage: 75% (3/4)
- Unjudged concepts / relationships: 2 / 8
- Missing reference concepts / relationships: 0 / 0

## Unjudged concepts

- flows/application-delivery-pipeline
- interfaces/backend-http-api

## Unjudged relationships

- components/demo-backend|provides|interfaces/backend-http-api
- components/demo-backend|implemented-in|repositories/amazon-ecs-fullstack-app-terraform
- components/demo-frontend|consumes|interfaces/backend-http-api
- components/demo-frontend|implemented-in|repositories/amazon-ecs-fullstack-app-terraform
- flows/application-delivery-pipeline|part-of|systems/ecs-fullstack-demo
- interfaces/backend-http-api|part-of|systems/ecs-fullstack-demo
- interfaces/backend-http-api|implemented-in|repositories/amazon-ecs-fullstack-app-terraform
- systems/ecs-fullstack-demo|implemented-in|repositories/amazon-ecs-fullstack-app-terraform

## Owner-review findings

- delivery-pipeline: embedded knowledge is missing from an allowed parent with exact evidence

## Limitations

- Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
