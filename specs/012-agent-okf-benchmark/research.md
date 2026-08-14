# Research: Agent-driven OKF Benchmark

## Decision: use Codex non-interactive execution

Use `codex exec` with `--ephemeral`, `--json`, explicit model, workspace and
sandbox. Official OpenAI documentation identifies this as the stable scripted
mode, supports JSONL events and allows the final message to be written to a
file.

**Rationale**: AgentBase already delegates synthesis to the host coding agent
and must not add a model SDK or credentials.

**Alternatives considered**: Responses API/Agents SDK would add credential and
dependency boundaries; manually authored output is not an agent benchmark.

## Decision: inject one required stdio MCP server per run

Pass a run-scoped `mcp_servers.agentbase` command, args and cwd through Codex
configuration overrides, with the server required to initialize.

**Rationale**: It avoids mutating user-global MCP configuration and gives the
agent the same graph/schema surface being evaluated.

**Alternatives considered**: `codex mcp add` mutates host configuration;
shell-only invocation would not test MCP schema/tool usability.

## Decision: semantic golden contracts, not golden Markdown

Match bounded semantic identity terms and evidence first; use agent-authored
`benchmark_key` fields for relationship identity, then score schema types, metadata keys, evidence
paths and Markdown-link relationships.

**Rationale**: Prose is intentionally variable while schema choice and factual
relationships are objectively scoreable.

**Alternatives considered**: Exact-tree diffs penalize harmless prose/layout
changes; an LLM judge is non-deterministic and would hide schema weaknesses.

## Decision: rebuild/reuse provider graph through MCP

Require one `index_repository` call and let the managed provider own its cache.

**Rationale**: Graph export is not required to measure OKF authoring and would
create a second graph lifecycle before runtime cost is measured.

**Alternatives considered**: Committing raw graph snapshots violates the
private/disposable graph boundary.
