# 04.05 — Catalog cutover record

> Status: Catalog 7 clean cutover completed.

Catalog 6 was never Published and was replaced before release. There is no
Markdown converter, dual authoring mode or Hub migration. The retired AgentBase
type fails when newly authored and guides re-ingest/promotion; arbitrary foreign
types still round-trip under open-world compatibility.

Semantic profile changes after knowledge is Published must not rewrite the Hub
automatically. They require an impact scan, Migration Draft, owner review and
PR; missing evidence keeps the current knowledge with a Question.
