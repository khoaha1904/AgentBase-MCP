# Data Model: Domain node details

Capability 050 adds no durable or Published fields. The browser uses the
existing `PublishedVisualizationProjection` nodes, edges, flows and questions.

`documentOverview` is transient UI text assembled from title, type, description,
identity/path, source references and direct relation summaries. It is not a
replacement for `read_hub_okf_concept` and is never written back to the Hub.
