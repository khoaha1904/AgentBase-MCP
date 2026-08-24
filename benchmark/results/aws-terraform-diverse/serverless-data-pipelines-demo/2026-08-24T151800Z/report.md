# serverless-data-pipelines-demo — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v17
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: reviewable
- Owner review: useful_for_owner_review
- Initial Ingest acceptance: review_ready
- Reference concept coverage: 100% (4/4)
- Recognized schema agreement: 100% (4/4)
- Metadata completeness: n/a (0/0)
- Provenance coverage: 100% (3/3)
- Reference relationship coverage: 100% (2/2)
- Source-conflict visibility: n/a (0/0)
- Observed-value coverage: n/a (0/0)
- Embedded-knowledge coverage: 100% (2/2)
- Unjudged concepts / relationships: 7 / 12
- Missing reference concepts / relationships: 0 / 0

## Unjudged concepts

- components/api-glue-etl
- components/athena-query-execution
- components/comprehend-analysis
- components/glue-crawler-initiation
- flows/scheduled-api-data-pipeline
- questions/question-1d4b6d9a5a3b8bf34fcd314b
- questions/question-20351bf15fd148bcb3c675cf

## Unjudged relationships

- components/api-glue-etl|part-of|systems/serverless-data-pipeline
- components/api-glue-etl|implemented-in|repositories/serverless-data-pipelines-demo
- components/api-sourcing|part-of|systems/serverless-data-pipeline
- components/api-sourcing|implemented-in|repositories/serverless-data-pipelines-demo
- components/athena-query-execution|part-of|systems/serverless-data-pipeline
- components/athena-query-execution|implemented-in|repositories/serverless-data-pipelines-demo
- components/comprehend-analysis|part-of|systems/serverless-data-pipeline
- components/comprehend-analysis|implemented-in|repositories/serverless-data-pipelines-demo
- components/glue-crawler-initiation|part-of|systems/serverless-data-pipeline
- components/glue-crawler-initiation|implemented-in|repositories/serverless-data-pipelines-demo
- flows/scheduled-api-data-pipeline|part-of|systems/serverless-data-pipeline
- systems/serverless-data-pipeline|implemented-in|repositories/serverless-data-pipelines-demo

## Limitations

- Deterministic source-path checks do not prove that authored observations are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
