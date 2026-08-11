# Decision Topics

Use these topics to keep product discussions short and avoid mixing unrelated
decisions.

## 1. Product

Questions about who uses each part, the job it solves and what counts as useful.
The immediate question is the smallest Part 1 experience worth shipping.

## 2. Code Intelligence

Questions about indexing, local graph queries, supported languages, engine
selection, version pinning and incremental refresh. This topic should optimize
for coding speed and token cost.

## 3. Observation Contract

Questions about which graph facts are important enough to leave the local
engine, how they remain reproducible and how engine-specific data is normalized.
This is the architectural boundary between the two products.

## 4. Knowledge and OKF

Questions about proposal, review, confidence, conflict, stale state, detach,
supersession and cumulative re-ingest. This topic optimizes for trustworthy
shared knowledge rather than local navigation detail.

## 5. Operations and Permissions

Questions about optional commands such as Terraform or Terragrunt init/plan,
credential availability and safe failure modes. Enhanced evidence collection
belongs here or in Part 2; it must not block the basic local graph.

## 6. Architecture for Agents

Questions about module ownership, file size, public entrypoints, tests,
dependency rules and documentation routing. These controls make both humans and
coding agents less likely to load or modify unrelated code.

## 7. Adoption and Packaging

Questions about installation, coexistence with a user's own MCP installation,
upgrades, rollback, cache isolation and compatibility guarantees.
