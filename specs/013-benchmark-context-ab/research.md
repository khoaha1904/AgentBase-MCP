# Research: Benchmark Context A/B

## Decision 1: Compare complete workflows

**Decision**: Compare the current AgentBase MCP-assisted authoring workflow with
an unassisted direct-source authoring baseline.

**Rationale**: This answers the owner's product question: whether using
AgentBase produces comparable or better OKF with lower model context cost. It
does not pretend to isolate graph retrieval from schema guidance or prompt
effects.

**Alternatives considered**:

- Give the direct arm schema MCP but no graph MCP. Rejected because it is not a
  direct-source baseline and requires a new filtered MCP surface.
- Embed the same schema catalog in both prompts. Rejected because it duplicates
  AgentBase knowledge and removes part of the product being evaluated.

## Decision 2: Reuse the existing process adapter

**Decision**: Add an explicit arm parameter to the existing Codex runner. MCP
arguments and required-tool checks are included only for the MCP arm.

**Rationale**: Model, effort, sandbox, timeout, portable trace capture and output
validation already work. A provider abstraction has no second provider or
consumer.

**Alternatives considered**:

- Add an experiment/adapter framework. Rejected as speculative.
- Duplicate the runner for the direct arm. Rejected because the common process
  contract could drift and make the pair less comparable.

## Decision 3: Add a paired result envelope

**Decision**: Store `pair.json`, sibling `mcp/` and `direct/` arm directories,
then `comparison.json` and a concise pair `report.md` beneath one UTC pair ID.
Keep historical single-arm directories and commands unchanged.

**Rationale**: One envelope makes shared inputs and completeness explicit while
retaining each arm's existing prompt, trace, output, metrics and report shape.

**Alternatives considered**:

- Link two unrelated run IDs after execution. Rejected because common identity
  is weaker and partial failures are harder to interpret.
- Migrate all previous results. Rejected because it changes historical evidence
  without product value.

## Decision 4: Trust agent usage events, do not invent file telemetry

**Decision**: Parse the final completed-turn usage record emitted by the pinned
Codex CLI, preserve all supplied token categories, derive uncached input only
when both input and cached input exist, and record wall-clock elapsed time.
Record directly observed command/tool counts, but mark source-read volume
unavailable unless the external event provides deterministic evidence.

**Rationale**: The existing trace contains cumulative `turn.completed.usage`.
Shell command text is not proof of every file or byte consumed, and an OS-level
tracer adds portability, privacy and lifecycle cost beyond this question.

**Alternatives considered**:

- Parse `sed`, `nl`, `rg` and similar commands into byte estimates. Rejected
  because it produces an incomplete value that looks authoritative.
- Add `strace` or a filesystem proxy. Rejected as a new platform dependency and
  larger experiment than token comparison requires.

## Decision 5: Sequential arms with preserved partial evidence

**Decision**: Run both arms sequentially, continue to the second arm if the
first fails, and generate an explicitly incomplete comparison whenever either
arm lacks a finalizable result.

**Rationale**: Sequential runs avoid overlapping model processes and local MCP
resource contention. Preserving both outcomes makes external failure visible
without silently wasting the comparison opportunity.

**Alternatives considered**:

- Run arms concurrently. Rejected because contention would confound timing and
  complicate failure handling.
- Stop after the first failure. Rejected because it discards useful diagnostic
  and baseline evidence.

## Decision 6: No automatic winner

**Decision**: Report semantic quality and efficiency separately, with raw
per-arm values and arithmetic deltas only where both values are comparable.

**Rationale**: Product tradeoffs need owner judgment. A scalar score would
encode unapproved weights and could hide a quality regression behind token
savings.

**Alternatives considered**:

- Define a weighted score or promotion threshold now. Rejected until multiple
  paired runs establish stable variance and owner priorities.
