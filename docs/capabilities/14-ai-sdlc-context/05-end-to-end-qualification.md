# 14.05 — End-to-end A/B qualification

> Status: Runner is implemented; real pair `2026-08-29T05-45-00Z` reached
> deterministic `needs_review` and owner review remains pending.

## Goal

Measure the difference of the compact `Feature → US → Tasks` lifecycle between:

- **without AgentBase**: Feature and tracker context only;
- **with AgentBase**: same input, with Published Hub and local Code Graph/source
  query when needed.

This is aggregate measurement after isolated Phase 1 and Phase 2 tests. It does
not replace them: the result is broader but harder to attribute per phase.

## Boundary and impact

- One model run creates both normalized US and task plan; it does not use a US
  created by the other arm.
- Existing tracker US is not read, to measure whether Feature becomes US. Output
  is benchmark draft only and does not publish automatically.
- The full arm binds one source repo and uses existing MCP tools; it adds no
  context packet, skill, schema, query engine or storage.
- Ingest/Hub/public `abs` are unchanged. The full arm consumes index time and
  model tokens; fixture scope remains AWS/Terraform, not a universal promise.

## Gate

Both arms have the same Feature, permitted tracker artifacts, prompt, model and
output schema. The full arm retains evidence/limitations. It passes only with no
critical US/task-quality regression and at least one important improvement; a
real run needs owner review.

## First result

With the ECS/Terraform fixture, both arms retain the same two critical outcomes.
The full arm adds two important outcomes: a source-specific boundary and the
`/status` compatibility decision, with no unsupported claim. It uses one Hub
search, four Hub reads and 21 graph calls within the limit of 24. This is a
better end-to-end signal than baseline, not universal evidence or a
productization decision.
