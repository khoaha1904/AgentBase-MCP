# Research: Correct Tool Guidance

## Public graph metadata

- **Decision**: Override the pinned provider's public description/annotations at
  the existing AgentBase descriptor adapter.
- **Rationale**: Provider metadata is captured for compatibility, but its
  `index_status` prose names the unreleased `query_graph` action and marks
  query/read actions destructive. AgentBase owns its released contract.
- **Alternatives considered**: Change the captured fixture; omit all
  annotations; modify the upstream dependency.

## Question ownership

- **Decision**: Add Question review to `agentbase-hub`.
- **Rationale**: The Hub skill already owns proposal inspection, Accept and
  publication boundaries. A ninth skill would add a user choice for one small
  review subflow.
- **Alternatives considered**: Let `agentbase-query` mutate knowledge; add an
  `agentbase-questions` skill; remove the tools.
