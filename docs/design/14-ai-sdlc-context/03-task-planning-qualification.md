# 14.03 — Task Planning context qualification

> Status: Benchmark is implemented; the real pair remains incomplete because of
> evidence trace and model quota, so it is not product proof.

## Goal

Verify that a User Story can be broken into better implementation tasks when a
developer allows AgentBase to read local Code Graph/source, compared with tracker
context alone. This qualifies context, not a task generator or
`agentbase-add-context`.

## Boundary

- Feature/US and relations come from a read-only tracker fixture.
- The assisted arm binds exactly one local Git repository, indexes lazily through
  MCP and reads bounded architecture/search/trace/snippet evidence.
- The direct arm has no AgentBase MCP or source checkout.
- Both arms return the same structured task plan; the runner only validates,
  scores and retains evidence and does not create tasks.
- Hub overview may determine scope but does not replace exact source for
  files/symbols/dependencies. This phase measures Code Graph value.

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
- Benchmark adds a suite and A/B result; the real pair still needs owner review.
- Scope does not bind AgentBase to ECS; the scenario is an AWS/Terraform fixture.

## Non-goals

Do not create a context packet, store source in Hub, add a skill/MCP tool,
modify code automatically, require BA/PO to clone a repository, or prove task
planning for every language/provider from one fixture.
