# Feature Specification: Benchmark Context A/B

**Feature Branch**: `013-benchmark-context-ab`

**Created**: 2026-08-15

**Status**: Complete

**Input**: Compare the existing AgentBase MCP-assisted OKF benchmark with a direct-source baseline on the same pinned repository, model and semantic task so that quality, token use and elapsed time can be evaluated without claiming savings from a single arm.

## Owner Decisions Treated as Settled

- The comparison has two arms: the existing AgentBase MCP workflow and an unassisted baseline that reads the repository source directly without AgentBase MCP.
- Both arms use the same pinned repository, model, reasoning effort, semantic expectation and authoring goal; workflow instructions differ only where the arm requires it.
- The first real comparison is one paired run against `aws-health-aware`; additional repositories are deferred until this slice is trustworthy.
- Quality and efficiency are reported separately. The harness does not automatically declare AgentBase the winner or hide a quality regression behind lower cost.
- Real model execution remains explicit and opt-in. Offline fake-process coverage remains canonical verification.
- This capability measures the current workflow; it does not improve schemas, prompts or semantic scoring gates.

## User Scenarios & Testing

### User Story 1 - Run a Comparable Pair (Priority: P1)

An owner runs one benchmark pair and receives an MCP-assisted result and a direct-source result created from equivalent pinned inputs.

**Why this priority**: A single MCP-assisted run can show task success, but cannot show whether AgentBase reduces context or cost relative to ordinary repository investigation.

**Independent Test**: Run the paired harness with a fake agent executable and prove that both arms receive the same repository, model, effort, semantic task and expectation while only the permitted investigation workflow differs.

**Acceptance Scenarios**:

1. **Given** a clean pinned fixture, **When** a pair starts, **Then** both arms record the same comparison identity and common inputs before either result is evaluated.
2. **Given** the MCP arm, **When** its agent process starts, **Then** the required AgentBase MCP graph and schema workflow remains available and auditable.
3. **Given** the direct-source arm, **When** its agent process starts, **Then** AgentBase MCP is absent and the agent is instructed to investigate only authorized repository source.

---

### User Story 2 - Compare Quality and Efficiency Honestly (Priority: P1)

An owner can see whether each arm found the expected concepts and relationships, and separately compare tokens, duration and observable investigation activity.

**Why this priority**: Token savings are useful only alongside the semantic quality produced for the same task.

**Independent Test**: Finalize controlled paired artifacts with different scores and usage values, then assert that the comparison reports per-arm quality and efficiency without collapsing them into one winner score.

**Acceptance Scenarios**:

1. **Given** two completed arms, **When** the pair is finalized, **Then** the report shows each existing semantic metric and conformance outcome side by side.
2. **Given** recorded usage events, **When** the pair is finalized, **Then** input, cached input, uncached input, output, reasoning-output and elapsed time are shown per arm with explicit deltas where comparable.
3. **Given** investigation activity that cannot be measured reliably, **When** the report is produced, **Then** the value is marked unavailable or as a conservative observation rather than inferred as complete source-read volume.

---

### User Story 3 - Preserve Reproducible Partial Evidence (Priority: P2)

An owner can inspect a failed or interrupted pair without losing the successful arm or receiving a misleading comparison.

**Why this priority**: External model and MCP processes can fail independently, and those failures are part of benchmark evidence.

**Independent Test**: Make either fake arm fail or time out and assert that both arms' available artifacts and the pair failure state remain inspectable while no winner or complete delta is reported.

**Acceptance Scenarios**:

1. **Given** one arm fails, **When** the pair stops or finalizes, **Then** completed artifacts for both arms are retained and the comparison is explicitly incomplete.
2. **Given** a completed pair, **When** its evidence is inspected later, **Then** the AgentBase source identity, fixture identity, agent version and arm configuration needed to interpret it are present.

### Edge Cases

- One arm succeeds while the other exits, times out or emits malformed events.
- The direct arm attempts to use an MCP tool or the MCP arm omits its required tools.
- Token usage is missing, cumulative, partially cached or represented differently by the external agent version.
- An arm creates valid output but semantic scoring fails or source state drifts.
- A pair identifier already exists or finalization is retried.
- The AgentBase working tree is dirty before a run, including benchmark artifacts from earlier runs.
- Observable shell commands do not reveal all source files or bytes read by the model.

## Requirements

### Functional Requirements

- **FR-001 / AB-BENCH-009**: A comparison MUST bind exactly one MCP-assisted arm and one direct-source arm to the same pinned fixture, semantic expectation, model, reasoning effort and authoring goal.
- **FR-002 / AB-BENCH-010**: The direct-source arm MUST run without AgentBase MCP configuration or tools and MUST restrict investigation to the authorized source fixture and ordinary host-agent capabilities.
- **FR-003 / AB-BENCH-011**: The MCP-assisted arm MUST retain the graph, schema and source-investigation requirements of the existing agent benchmark contract.
- **FR-004 / AB-BENCH-012**: Every arm MUST retain its status, timestamps, elapsed time, agent identity and version, prompt identity, fixture source identity, AgentBase source identity, event trace, output bundle and existing semantic metrics when available.
- **FR-005 / AB-BENCH-013**: Usage reporting MUST preserve available input, cached-input, uncached-input, output and reasoning-output token counts without treating missing or non-comparable fields as zero.
- **FR-006 / AB-BENCH-014**: Investigation-footprint reporting MUST distinguish directly observed activity from estimates and MUST mark unavailable measurements rather than claim complete repository-read volume without deterministic evidence.
- **FR-007 / AB-BENCH-015**: Pair finalization MUST report quality and efficiency in separate sections, show per-arm values and comparable deltas, and MUST NOT derive an automatic overall winner.
- **FR-008 / AB-BENCH-016**: Failure, timeout, malformed output, source drift or missing usage in either arm MUST preserve available evidence, mark the pair incomplete and prevent misleading complete-comparison claims.
- **FR-009 / AB-BENCH-017**: Canonical verification MUST cover paired invocation, arm isolation, measurement capture, partial failure and comparison generation offline; real model execution MUST remain explicit and opt-in.

### Key Entities

- **Benchmark Pair**: One comparison identity linking two arms and their common pinned inputs.
- **Benchmark Arm**: One MCP-assisted or direct-source agent execution with arm-specific workflow constraints.
- **Execution Measurement**: Recorded duration, available token categories and directly observable investigation activity for one arm.
- **Pair Comparison**: Side-by-side quality and efficiency evidence plus completeness state; it is not a scalar winner score.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Offline verification proves that 100% of paired runs use identical pinned fixture, model, effort, expectation and authoring goal across the two arms.
- **SC-002**: Every completed fake arm records status, elapsed time, execution identities, exact prompt, event trace, output and all usage categories made available by the agent.
- **SC-003**: Every complete pair reports all existing quality metrics and comparable efficiency values side by side, while every partial pair is visibly incomplete and preserves both arms' available evidence.
- **SC-004**: No comparison reports estimated source-read activity as complete measured volume and no comparison emits an automatic overall winner.
- **SC-005**: One opt-in real pair for `aws-health-aware` can be retained as product evidence without becoming a dependency of canonical verification.
- **SC-006**: The pinned source fixture remains unchanged after 100% of successful, failed and timed-out offline arm executions.

## Assumptions

- The direct-source arm is an unassisted workflow baseline, not an experiment that isolates only the graph API; schema guidance available exclusively through AgentBase is intentionally part of the product comparison.
- External agent token counters are authoritative when present, but their cache semantics are recorded rather than normalized beyond simple arithmetic.
- Command traces can show some investigation activity but cannot prove every byte consumed by an external model; token usage is the primary efficiency measure.
- Existing repository expectations and semantic scoring remain authoritative for quality comparison.

## Explicit Non-goals

- Comparing different models, providers, reasoning efforts or repositories inside one pair.
- Adding an LLM-as-judge, a synthetic overall score or an automatic promotion threshold.
- Improving the OKF prompt, schemas, expectations, validator or scorer in the same capability.
- Tracing operating-system file reads, adding a daemon or introducing a general benchmark framework.
- Making a real model run part of `npm run verify`.
