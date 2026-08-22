# Data Model: Batch Initial Ingest Qualification

## Batch qualification manifest

- Suite/version, catalog, prompt, agent version/model/reasoning/timeout
- One confirmed Domain
- Ordered members with fixture path, exact commit and optional diagnostic expectation

## Batch run

- UTC identity, portable prompt digest, exact fixture states, agent/process usage
- Completed MCP calls, proposal identity/mode/member IDs and failures
- Combined OKF tree plus inspection-derived member/shared path attribution

## State

`running -> succeeded | failed`; only `succeeded` with no clear blocker permits
one later sequential replica.
