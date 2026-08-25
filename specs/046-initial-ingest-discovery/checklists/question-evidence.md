# Question evidence contract checklist

- [x] The requirement identifies the V18 failure as caller-authored provenance formatting, not missing repository knowledge.
- [x] The Agent-facing input is limited to candidate and evidence IDs from the same guidance request.
- [x] MCP-owned derivation of canonical source resource and SourceSnapshot revision is explicit.
- [x] Unknown or mismatched IDs have one correctable `INVALID_ARGUMENT` path.
- [x] Durable Receipt, SharedQuestion and Hub document formats remain unchanged.
- [x] V18 remains immutable and the corrected released-skill qualification uses V19.
