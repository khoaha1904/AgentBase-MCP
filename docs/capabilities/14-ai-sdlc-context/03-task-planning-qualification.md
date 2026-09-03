# 14.03 — Task Planning context qualification

> Status: Fair source-parity benchmark is implemented. One Crawler triad shows
> an efficiency candidate; one conventional ECS source/graph pair shows no
> measured net gain. Actual edit outcomes are qualified separately in
> [`09-implementation-outcome-qualification.md`](09-implementation-outcome-qualification.md).

## Goal

Measure whether Code Graph improves or reduces the cost of breaking a User
Story into implementation tasks compared with normal source reading. A
conditional third arm measures Hub only for a named cross-repository or
accepted-contract gap. This qualifies context, not a task generator.

## Boundary

- Feature/US and relations come from a read-only tracker fixture.
- Every arm receives an independent disposable copy of the same pinned source
  with ordinary bounded read-only search and file access.
- The graph arm alone binds that repository, indexes once through MCP and reads
  bounded architecture/search/trace/snippet/coverage evidence.
- A Hub arm is optional and requires one named knowledge hypothesis plus an
  exact Published revision; it does not run for generic local context.
- Both arms return the same structured task plan; the runner only validates,
  scores and retains evidence and does not create tasks.
- Hub never replaces exact source for files, symbols or dependencies.

## Correctness conditions

The task plan must separate backend-route, ECS/ALB health-check wiring,
consumer-compatibility and verification boundaries correctly. Each implementation
claim needs path/line/revision evidence or remains a question; live deployment/
rollback cannot become fact. Critical correctness cannot be offset by more tasks,
speed or fewer tokens.

## Impact

- Query/ingest/Hub/public `abs`: unchanged.
- Developer Task Planning adds Code Graph index/reuse when needed, consuming
  first-run time and local CPU/cache without cloning or publishing source.
- Crawler graph navigation retained equal measured quality with lower cost;
  conventional ECS retained equal quality with higher cost. Graph therefore
  remains selective rather than a default planning step.
- Scope does not bind AgentBase to ECS; the scenario is an AWS/Terraform fixture.

## Non-goals

Do not create a context packet, store source in Hub, add a skill/MCP tool,
modify code automatically, require BA/PO to clone a repository, or prove task
planning for every language/provider from one fixture.
