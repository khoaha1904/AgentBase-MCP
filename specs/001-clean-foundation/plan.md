# Plan: Clean Foundation

- **Status:** Draft for the next session

## Architecture approach

Use a modular monolith with provider-neutral core contracts and concrete
providers composed at the application edge. Establish automated ownership and
dependency rules before adding a real engine.

## Work sequence

1. Resolve the three owner-visible questions in `spec.md`.
2. Compare minimal runtime/toolchain options against offline testing, MCP
   integration, process management and agent navigation needs.
3. Record the selected runtime in an ADR.
4. Add the smallest project/test configuration.
5. Add a machine-readable module ownership registry and architecture checker.
6. Define the Code Intelligence public contract.
7. Implement a deterministic in-memory fake and focused contract tests.
8. Add a thin application demonstration using only the fake.
9. Run full offline verification and update the handoff.

## Proposed initial modules

- `core/code-intelligence`: repository identity, index snapshot and query
  contracts;
- `providers/fake-code-intelligence`: deterministic test provider;
- `app`: composition and one demonstrable workflow.

`observations` and `knowledge` remain documented future boundaries until their
own specifications are active.

## Verification strategy

- unit tests beside each capability;
- reusable contract suite shared by fake and future providers;
- architecture tests for ownership, imports, cycles and review budgets;
- one offline product-flow test;
- no network, credentials, daemon or external binary.

## Risks to resolve

- Choosing a runtime merely because the legacy project or AgentDocks uses it.
- Designing the contract around Codebase Memory's current response shapes.
- Creating generic framework abstractions before a real product flow exists.
- Setting arbitrary file-size thresholds without a measured baseline.
