Created the Google OKF v0.2 bundle in [okf](<OUTPUT_ROOT>/okf).

Concept keys:

- `aws-health-alerting-schedule`
- `aws-health-alerting-lambda`
- `aws-health-event-state-store`
- `aws-health-alert-delivery`

Limitations: AgentBase indexing succeeded exactly once, but all subsequent MCP graph, schema-catalog, and concept-validation calls were immediately cancelled by the MCP service. I kept concepts sparse and source-backed, using only exact normalized repository line spans.