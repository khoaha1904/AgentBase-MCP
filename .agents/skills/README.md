# Repository skills

Skills are grouped by user goal. Each skill owns one public workflow and keeps
its UI metadata inside its own directory.

## Product skills

- [`use-codebase-memory`](use-codebase-memory/SKILL.md) — map, search, trace and
  read exact source from one local repository.
- [`agentbase-okf`](agentbase-okf/SKILL.md) — current proposal-authoring workflow
  after AgentBase has prepared a bounded workspace.

The approved design will replace the second entry with one complete public
Ingest workflow when that behavior is implemented. Domain Enrichment will be a
separate skill because it operates across Published repositories and may use a
user-authenticated provider CLI. Empty future skill directories are not kept.

## Development skills

The `speckit-*` directories drive repository development; they are not AgentBase
product workflows.
