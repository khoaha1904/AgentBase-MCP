# Repository skills

Skills are grouped by user goal. Each skill owns one public workflow and keeps
its UI metadata inside its own directory.

## Product skills

- [`use-codebase-memory`](use-codebase-memory/SKILL.md) — map, search, trace and
  read exact source from one local repository.
- [`agentbase-ingest`](agentbase-ingest/SKILL.md) — confirm one repository and
  Domain, investigate bounded evidence and stop at a sparse proposal preview.
- [`agentbase-refresh`](agentbase-refresh/SKILL.md) — compare one canonical
  repository with accepted knowledge, inspect exact source diffs and stop at a
  reviewable update proposal.
- [`agentbase-okf`](agentbase-okf/SKILL.md) — current proposal-authoring workflow
  after AgentBase has prepared a bounded workspace.

Domain Enrichment will be a separate future skill because it operates across
Published repositories and may use a user-authenticated provider CLI. Empty
future skill directories are not kept.

## Development skills

The `speckit-*` directories drive repository development; they are not AgentBase
product workflows.
