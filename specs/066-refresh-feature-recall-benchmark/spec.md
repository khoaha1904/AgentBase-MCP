# Feature Specification: Refresh feature-recall benchmark

**Feature Branch**: `feature/refresh-change-accounting`

**Created**: 2026-08-31

**Status**: Complete — benchmark retained two actionable runtime gaps

**Input**: Measure the current Hub-to-Refresh balance with a realistic feature
change, then determine whether the refreshed knowledge materially helps AIT.

## Contract Delta

- **Change classification**: bounded benchmark workflow and evidence capture.
- **Product Contract**: `docs/product/07-ai-sdlc-context.md` retains AIT as the
  reason to capture feature-level knowledge rather than complete source detail.
- **Architecture Contract**: `docs/architecture/flows.md` retains the ordinary
  isolated Refresh proposal lifecycle; no production Hub path is added.
- **Capability Contract**:
  `docs/capabilities/12-version-scope/03-benchmark-requirements.md` owns the
  feature-recall benchmark boundary.
- **Stable requirements**: `AB-BENCH-088..090`.
- **Current-contract updates**: the benchmark requirements above.
- **Baseline commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Owner Decisions

- C0 is the exact current Published `hub-3` snapshot copied into benchmark
  input. It does not rerun Initial Ingest or mutate the operator Hub.
- C1 is one deterministic Crawler worker feature commit adding bounded retry
  behavior, a dead-letter queue and failure visibility.
- Success means later AIT can discover the changed failure path, resource
  wiring and operational signal with exact source evidence. It does not require
  every code detail or a fixed concept inventory.
- The run records elapsed time and tokens separately from quality.
- C2 decoy/noise testing runs only if C1 is valid and useful.

## User Scenarios & Testing

### User Story 1 - Measure meaningful feature recall (Priority: P1)

As the AgentBase owner, I can run one isolated Refresh over a realistic feature
commit and see whether important new knowledge survives for a later AIT task.

**Independent Test**: Refresh the copied C0 Hub against C1 and verify exact
changed-path accounting plus critical semantic probes for failure handling,
DLQ/redrive wiring and operational visibility.

**Acceptance Scenarios**:

1. **Given** the pinned C0 Hub and clean Crawler fixture, **When** the benchmark
   applies C1, **Then** neither the fixture nor operator Hub is changed.
2. **Given** four changed paths, **When** Refresh finalizes, **Then** inspection
   retains exactly one outcome for each path and materializes the runtime and
   infrastructure changes with exact source evidence.
3. **Given** a structurally valid proposal, **When** critical AIT knowledge is
   absent, **Then** quality is `needs_revision` even if lifecycle execution
   succeeded.

### User Story 2 - Make cost and usefulness comparable (Priority: P2)

As the AgentBase owner, I can review duration, token use and semantic results as
separate facts before deciding whether more detailed discovery is worthwhile.

**Independent Test**: Retain the prompt, mutation manifest, proposal,
inspection, output Hub and assessment below the Benchmark result tree.

## Requirements

- **FR-001**: The benchmark MUST seed disposable Refresh state from one pinned
  copied Published snapshot without reading or writing the operator Hub.
- **FR-002**: The synthetic feature commit MUST be deterministic and support a
  newly created source file as well as bounded replacements.
- **FR-003**: Result evidence MUST retain proposal inspection and exact change
  accounting in addition to the proposed OKF bundle.
- **FR-004**: Critical semantic probes MUST evaluate only changed/new concept
  knowledge with exact current-repository source evidence.
- **FR-005**: Quality, lifecycle validity, elapsed time and tokens MUST remain
  separate in the result.
- **FR-006**: No Accept, Publish, provider CLI or production Hub mutation is
  permitted.

## Success Criteria

- **SC-001**: All four C1 paths receive exactly one retained outcome.
- **SC-002**: `main.tf` and `src/handler.py` have materialized outcomes backed
  by changed concept evidence.
- **SC-003**: All critical failure-path, DLQ/redrive and operational-visibility
  probes match changed/new concepts, or quality visibly reports
  `needs_revision`.
- **SC-004**: The run reports exact elapsed milliseconds and available token
  usage without using either as a quality proxy.
- **SC-005**: Focused tests and `npm run verify` pass before the real C1 run.

## Assumptions

- The current Crawler Hub snapshot is already an accepted useful C0; this slice
  measures Refresh recall rather than Initial Ingest cost.
- Synthetic source behavior is ordinary repository truth inside the benchmark.

## Implementation Evidence

- The deterministic C1 source commit changes four paths and is admitted through
  a benchmark-only source-snapshot boundary; no operator Hub or fixture changed.
- The valid setup run completed in 176,520 ms and retained exact proposal,
  inspection, OKF, manifest, events and usage.
- Refresh accounted for all four paths and retained all three critical feature
  atoms with exact source evidence.
- The run remains invalid because Finalize ran twice after pre-Finalize
  validation missed the revision-distinct source-ID rule.
- Both promoted Resources lack structured Repository/Domain integration and are
  absent from a deterministic Crawler visualization projection. C2 did not run.
