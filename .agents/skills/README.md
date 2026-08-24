# Repository skills

Released skills are grouped by product ownership. Six public skills match user
goals; two internal skills support those workflows. Some clients may still show
internal artifacts in a technical selector.

## Public skills

- [`agentbase-query`](agentbase-query/SKILL.md) — answer ordinary questions from
  synchronized Published knowledge, one authorized local repository, or both.
- [`agentbase-ingest`](agentbase-ingest/SKILL.md) — confirm one repository and
  Domain, investigate bounded evidence and stop at a sparse proposal preview.
- [`agentbase-refresh`](agentbase-refresh/SKILL.md) — compare one canonical
  repository with accepted knowledge, inspect exact source diffs and stop at a
  reviewable update proposal.
- [`agentbase-domain-enrichment`](agentbase-domain-enrichment/SKILL.md) — verify
  selected cross-repository SQS knowledge for one Published Domain and stop at
  one reviewable enrichment proposal.
- [`agentbase-batch-ingest`](agentbase-batch-ingest/SKILL.md) — preflight and
  ingest explicit local repositories sequentially into one atomic proposal.
- [`agentbase-hub`](agentbase-hub/SKILL.md) — inspect local/remote Hub status,
  review governed Questions, connect or switch one isolated profile,
  synchronize and recover explicitly.

## Internal supporting skills

- [`use-codebase-memory`](use-codebase-memory/SKILL.md) — map, search, trace and
  read exact source from one authorized local repository for a public workflow.
- [`agentbase-okf`](agentbase-okf/SKILL.md) — author and validate the exact
  bounded proposal workspace prepared by a public workflow.

## Development skills

The `speckit-*` directories drive repository development; they are not AgentBase
product workflows and are never copied by `./install.sh`.
