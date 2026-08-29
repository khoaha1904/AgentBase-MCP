# Feature Specification: Task Planning Context Qualification

**Status**: Benchmark implementation complete; clean real qualification pair pending model quota.

## Objective

Measure whether bounded local Code Graph/source context helps a developer turn
one realistic User Story into evidence-backed implementation tasks.

## Requirements

- **FR-001**: Both arms use the same User Story, tracker tools, prompt, model,
  output contract and pinned source revision; only source/AgentBase availability
  differs.
- **FR-002**: Assisted access binds one explicit local Git root and uses only
  existing read/index Code Graph tools. The provider remains disposable and
  source is never published or copied into Hub.
- **FR-003**: Every implementation claim is traceable to an exact relative path,
  optional line span and pinned commit; unresolved details remain questions.
- **FR-004**: Deterministic scoring separates critical, important and optional
  probes. Critical misses, unsupported claims, forbidden tool use or malformed
  output cannot pass.
- **FR-005**: Durable prompts, manifests, expectations and results belong to
  AgentBase-Benchmark. Runtime/cache/workspace state is temporary.
- **FR-006**: No public skill, MCP tool, query/index algorithm or task-writing
  automation is added by this qualification.

## Scenario

`us:health-endpoint`: expose a stable backend readiness endpoint and align ECS
target-group checks without breaking product routes. Source fixture is
`amazon-ecs-fullstack-app-terraform` at commit
`98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`.

## Success criteria

One fake pair proves isolation and validation. Real attempts retain both arms and
must surface budget, traceability or quota failures as `incomplete`; no result
may claim broad task-planning quality from this single ECS/Terraform scenario.
