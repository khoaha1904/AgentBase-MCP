# Interface Contract: Repository Observed Values

- Frontmatter authority: `agentbase.observed_values[]` per Part 08.01.
- Derived body view: exact `## Observed values` table per Part 08.02.
- MCP action: `read_hub_observed_values({ path })` per AB-QUERY-006..010.
- Response: exact Hub commit/path/concept plus bounded values and
  `source_access: not-checked`; no repository bind or source probe.
- Legacy `agentbase.live_claims` and `read_hub_live_evidence` are unsupported.
- New authoring entries may omit `id`/`observed`; the proposal normalizer owns
  both. Finalize Question input uses natural observation references, not IDs.
