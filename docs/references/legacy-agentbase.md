# Legacy AgentBase Reference

The previous implementation remains in sibling repositories:

- `../agentbase-mcp`: analyzers, MCP transport, proposal/review/apply flows and
  the largest behavioral test corpus;
- `../agentbase-hub`: shared knowledge examples, registry and Git-based review
  experiments;
- `../agentbase-docs`: historical product exploration, audit material,
  architecture decisions and research.

## Use policy

These repositories are evidence, not dependencies. Their working trees were
already heavily modified when `agentbase-next` was created. Do not edit, clean,
reset, stage or commit them from a new-project task.

Consult them only after a current specification identifies a precise question,
for example:

- What provenance behavior did the old lifecycle test prove?
- Which Terraform fact could the deterministic analyzer recover?
- Which review state transition had exact acceptance coverage?

Extract the smallest verified behavior and write a new contract first. Do not
copy directories or preserve old abstractions merely because they exist.

## Valuable concepts to reassess later

- exact source revision and analyzer provenance;
- proposal, human review, apply and re-verification lifecycle;
- stale knowledge and commit-bound query semantics;
- deterministic infrastructure observations;
- local Git fixtures for safe end-to-end tests.

None of these automatically belongs in the first implementation slice.
