# Feature Specification: Agent-driven OKF Benchmark

**Feature Branch**: `012-agent-okf-benchmark`

**Created**: 2026-08-14

**Status**: Complete

**Input**: Replace the manually authored AWS baseline with a repeatable benchmark in which a real host coding agent uses AgentBase MCP graph and schema tools, investigates pinned repositories, creates OKF Markdown, and is scored against repository-specific expected concepts, metadata, evidence and relationships.

## Owner Decisions Treated as Settled

- The detailed Codebase Memory graph is benchmark input, not the durable output being optimized.
- A benchmark run includes a real coding agent; hand-authored OKF is not an agent benchmark.
- The agent uses MCP graph and OKF schema tools, then may inspect authorized repository files and Git history when the graph is insufficient.
- Expected output describes semantic concepts, schema choices, metadata, evidence and relationships; prose and exact Markdown bytes are not golden.
- Every run preserves agent configuration, prompt, tool trace, OKF bundle, metrics and report under a timestamped result directory.
- The first executable adapter is the installed Codex CLI. Provider parity and a general agent framework are deferred.
- Real model runs are explicit and opt-in. Canonical verification remains offline with a fake process.

## User Scenarios & Testing

### User Story 1 - Run an Agent Against a Pinned AWS Repository (Priority: P1)

An owner starts a benchmark suite and receives an isolated result produced by a real agent using the exact AgentBase MCP surface rather than by manual authoring.

**Why this priority**: Without a real agent invocation the benchmark cannot measure whether schemas and graph tools lead to useful OKF.

**Independent Test**: Run the harness with a fake Codex executable and assert the exact prompt/configuration, MCP requirement, trace capture, isolated output and unchanged source repository; separately opt into one real AWS run.

**Acceptance Scenarios**:

1. **Given** a clean pinned fixture, **When** a run starts, **Then** the harness records source commit, catalog version, agent executable/version, model, prompt and run ID before invoking the agent.
2. **Given** an isolated result workspace, **When** the agent runs, **Then** it can read the fixture and use required AgentBase MCP tools but can write only benchmark output.
3. **Given** agent or MCP failure, **When** the process exits, **Then** the run retains diagnostics and trace, produces no passing metrics and leaves the fixture unchanged.

---

### User Story 2 - Score Semantic OKF Quality (Priority: P1)

An owner sees whether the agent selected the right concrete schema instances and produced useful evidence-bearing relationships, not merely whether Markdown parsed.

**Why this priority**: Structural validity alone allows shallow OKF to report a misleading perfect score.

**Independent Test**: Score controlled good, missing, unexpected and wrong-metadata bundles against one expected repository contract and assert separate schema, instance, metadata, relationship, provenance and conformance metrics.

**Acceptance Scenarios**:

1. **Given** a repository expectation, **When** output is scored, **Then** expected and actual concept instances are matched by bounded semantic identity terms and evidence; agent-authored keys remain stable relationship identities but are not golden slugs.
2. **Given** valid but shallow Markdown, **When** required metadata or relationships are absent, **Then** its semantic score is lower even if OKF conformance passes.
3. **Given** unsupported concepts or relationships, **When** output is scored, **Then** they are reported as unexpected and cannot improve recall.

---

### User Story 3 - Guide Agent Investigation with Rich Schemas (Priority: P1)

An authoring agent reads a schema that explains which metadata, evidence questions and relationships must be investigated for AWS and business concepts.

**Why this priority**: A schema that only names headings cannot reliably guide discovery or make shallow output visibly incomplete.

**Independent Test**: Read AWS Lambda, Terraform Module and Business Flow through MCP and assert each exposes bounded investigation questions, metadata guidance and relationship guidance used by the benchmark prompt.

**Acceptance Scenarios**:

1. **Given** an AWS Lambda schema, **When** the agent reads it, **Then** it receives guidance for purpose, resource identity, runtime, handler resolution, triggers, dependencies, permissions and limitations.
2. **Given** a Terraform or business-flow concept, **When** its schema is read, **Then** it identifies the evidence needed to connect infrastructure resources to runtime and user-observable outcomes.
3. **Given** missing evidence, **When** the agent authors OKF, **Then** the schema directs it to state the limitation instead of inventing metadata.

### Edge Cases

- Agent executable is missing, wrong version or returns malformed JSONL.
- A fixture commit differs, is dirty before the run or changes during the run.
- MCP cannot initialize or the agent never calls required schema/graph tools.
- The agent exits successfully without creating an OKF bundle.
- Output contains conformant unknown types, duplicate benchmark keys, broken links or sources for another repository.
- A relationship target is missing or evidence spans are malformed.
- A run ID already exists or an interrupted run is finalized again.

## Requirements

### Functional Requirements

- **FR-001 / AB-BENCH-001**: A suite MUST pin every fixture commit, expected semantic contract, agent model/configuration, prompt version and schema catalog version used for comparison.
- **FR-002 / AB-BENCH-002**: A real run MUST invoke one explicit non-interactive host-agent process per repository, require the AgentBase MCP server, capture newline-delimited events and use an isolated result workspace outside the source repository.
- **FR-003 / AB-BENCH-003**: The benchmark prompt MUST require graph indexing once, schema list/select/read usage, evidence-led repository investigation, sparse concept creation, normalized provenance, concept links and explicit limitations.
- **FR-004 / AB-BENCH-004**: Each repository expectation MUST define stable concept instances with expected schema, required semantic metadata, required evidence topics and expected relationships without prescribing prose bytes.
- **FR-005 / AB-BENCH-005**: Scoring MUST report OKF conformance, schema-selection precision/recall, concept-instance precision/recall, metadata completeness, relationship coverage, provenance validity and unexpected output separately.
- **FR-006 / AB-BENCH-006**: Successful finalization MUST prove the source fixture is still clean at the pinned commit and MUST fail visibly for missing artifacts, invalid output, agent failure or source drift.
- **FR-007 / AB-BENCH-007**: A result MUST retain reproducible run metadata, exact prompt, agent JSONL trace, final agent message, OKF bundle, metrics and a concise human report under the repository and UTC run ID.
- **FR-008 / AB-BENCH-008**: Canonical verification MUST exercise process invocation, timeout/failure, source immutability and semantic scoring offline; real model execution MUST remain a separate opt-in command.
- **FR-009 / AB-SCHEMA-010**: Concrete schemas used by the AWS suite MUST expose investigation questions, semantic metadata guidance and relationship guidance through the existing MCP schema tools.
- **FR-010 / AB-SCHEMA-011**: Schema guidance MUST distinguish required evidence from optional enrichment and direct the agent to record limitations when required evidence is unavailable.

### Key Entities

- **Benchmark Suite**: Versioned set of pinned repositories, agent configuration and prompt version.
- **Repository Expectation**: Golden semantic contract containing concept instances, metadata requirements and relationships.
- **Agent Run**: One isolated process execution with immutable inputs and captured events.
- **Agent Artifact**: Prompt, trace, final response and authored OKF bundle.
- **Benchmark Metrics**: Independent structural and semantic scores plus failures.

## Success Criteria

### Measurable Outcomes

- **SC-001**: One command can produce a complete agent-run artifact set for each pinned AWS repository without manual OKF authoring.
- **SC-002**: Controlled scoring fixtures distinguish complete, shallow, missing and unexpected OKF output across all seven required metric groups.
- **SC-003**: The first real run records whether each expected AWS concept and relationship was found, with no structurally valid shallow bundle receiving a perfect semantic score.
- **SC-004**: Source fixtures remain byte-for-byte Git-clean before and after 100% of successful, failed and timed-out test runs.
- **SC-005**: Canonical offline verification passes without model credentials or network access.

## Assumptions

- Codex CLI authentication is host-owned and is never read, copied or recorded by AgentBase.
- The suite pins a model name and records the installed CLI version; model service internals remain outside benchmark control.
- Codebase Memory may rebuild its private graph each run; graph snapshot export is deferred until measured runtime justifies it.
- Semantic scoring uses stable benchmark metadata fields in OKF frontmatter and standard Markdown links, while human review remains authoritative for prose usefulness.

## Explicit Non-goals

- Comparing Codex, Claude Code and OpenCode in this capability.
- Adding a model SDK, API key handling, daemon, scheduler or cloud benchmark service.
- Publishing raw Code Graph data into OKF or Git.
- Using an LLM-as-judge for prose quality.
- Making a real model run part of `npm run verify`.
