# serverless-data-pipelines-demo — agent OKF benchmark

- Agent: gpt-5.6-sol via codex-cli 0.149.0
- Catalog/prompt: 7.0.0 / okf-author-v22
- Agent outcome: succeeded
- OKF validation: passed
- Authoring assessment: reviewable
- Owner review: needs_revision
- Initial Ingest acceptance: valid_partial
- Discovery qualification: passed; 2 representative checks
- Regression: No prior accepted run in this suite
- Reference concept coverage: 75% (3/4)
- Recognized schema agreement: 100% (3/3)
- Metadata completeness: n/a (0/0)
- Provenance coverage: 33% (1/3)
- Reference relationship coverage: 50% (1/2)
- Source-conflict visibility: n/a (0/0)
- Observed-value coverage: n/a (0/0)
- Embedded-knowledge coverage: 50% (1/2)
- Unjudged concepts / relationships: 6 / 5
- Missing reference concepts / relationships: 1 / 1

## Unjudged concepts

- components/apiscript
- components/athena-query-execution
- components/comprehend-analysis
- components/glue-crawler-initiation
- flows/apistatemachine
- questions/question-fdef536388c97e1c411d44ca

## Unjudged relationships

- components/api-sourcing|implemented-in|repositories/serverless-data-pipelines-demo
- components/apiscript|implemented-in|repositories/serverless-data-pipelines-demo
- components/athena-query-execution|implemented-in|repositories/serverless-data-pipelines-demo
- components/comprehend-analysis|implemented-in|repositories/serverless-data-pipelines-demo
- components/glue-crawler-initiation|implemented-in|repositories/serverless-data-pipelines-demo

## Owner-review findings

- glue-crawler-trigger: embedded knowledge is missing from an allowed parent with exact evidence

## Defect boundaries

### OKF

- None

### MCP/runtime

- None

### Benchmark

- None

## Limitations

- Deterministic source-path checks do not prove that authored observations are semantically supported; human review is required.
- Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.
