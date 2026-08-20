---
name: agentbase-ingest
description: Ingest one authorized local source repository into a sparse, evidence-backed AgentBase OKF proposal preview. Use when a user asks to initialize, ingest, understand, or draft Hub knowledge for one repository; do not use for Refresh, multi-repository batches, provider CLI enrichment, Accept, or Publish.
---

# Ingest one repository

Create one reviewable proposal from bounded source evidence. The user supplies
the repository, not an authoring prompt. Stop before Accept or Publish.

## Workflow

1. **Preflight** — Read [`references/preflight.md`](references/preflight.md).
   Call `preflight_hub_ingest`, compare the repository documents with returned
   Domain summaries, show evidence and warnings, then obtain one explicit
   primary-Domain confirmation.
2. **Discover** — Follow `use-codebase-memory` for one repository map and one
   bounded architecture pass. Reuse a fresh graph; never ingest graph records.
3. **Investigate** — Shortlist candidates. Require both stable identity and
   independent query/link value. Resolve every promoted claim or relation to an
   exact source path/span; keep important ambiguity as a Question or limitation.
4. **Author** — Call `get_okf_authoring_schemas` exactly once with the qualified
   candidates plus exact semantic/resource observations. Pass that same
   evidence-bearing request to `prepare_hub_okf`; never replace it with free
   text `signals`. Run one bounded active-Hub identity match, then follow
   `agentbase-okf` inside the returned workspace. Create only useful concepts
   and required navigation.
5. **Validate** — Run changed-set and final validation. Make at most one repair
   from exact failures. Inspect and present the complete proposal diff,
   Questions, limitations and partial-coverage status.

## Stop rules

- Stop as Incomplete when repository authority changes, provider cleanup is
  uncertain, evidence/proposal integrity fails, or the one repair still fails.
- A valid sparse or no-change result is success; completeness is not required.
- After one exact validation failure, make at most one repair. A second failure
  is Incomplete and requires an explicit user retry; never start another hidden
  reasoning pass.
- Do not call a provider CLI, clone another repository, Accept, submit,
  synchronize, rebuild a PR or publish from this skill.
- Do not store source blocks, graph output, secrets or arbitrary config dumps in
  Hub. A small directly evidenced snapshot is optional and remains an observed,
  non-current value.
