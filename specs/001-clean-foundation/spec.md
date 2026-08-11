# Capability 001: Clean Foundation

- **Status:** Product direction accepted; implementation pending
- **Created:** 2026-08-11

## Outcome

A developer can start a new AgentBase session in a clean repository, understand
the product boundary without reading legacy code, and add the first capability
under automatically enforced architecture rules.

## User stories

### 1. Start with trustworthy context

As the product owner, I can start a new agent session and have it discover the
current vision, decisions, boundaries and next task from repository-local files.

Acceptance:

- the root guide provides one ordered start path;
- current and historical work are distinguishable;
- legacy repositories are clearly read-only references;
- unresolved decisions are explicit rather than hidden assumptions.

### 2. Keep code navigable for agents

As a coding agent, I can identify which capability owns a file and use a small
public entrypoint before opening private implementation details.

Acceptance:

- every runtime source and test file has exactly one declared owner;
- invalid cross-capability imports and dependency cycles fail verification;
- file-growth checks compare against an accepted review baseline;
- focused tests can be run by capability.

### 3. Protect the product boundary

As the product owner, I can evolve or replace the local graph engine without
making durable OKF knowledge depend on its private schema.

Acceptance:

- core defines a provider-neutral Code Intelligence contract;
- a deterministic fake proves the contract before an external engine is added;
- no raw engine record is part of an observation or OKF public type;
- Part 1 remains useful without credentials or AI-heavy investigation.

## Constraints

- Use a modular monolith.
- Do not port legacy runtime code in this capability.
- Do not install, download or start Codebase Memory in this capability.
- Select runtime and dependencies through the plan, with a bias toward a small
  standard-library-first toolchain.
- Keep all tests deterministic and offline.
- Do not introduce secret or `.env` handling.

## Out of scope

- Production OKF schema and storage.
- AI investigation and human review UI.
- Terraform/Terragrunt enrichment.
- A real Codebase Memory adapter.
- Packaging, deployment or remote services.

## Open owner-visible questions

- What is the smallest visible Part 1 demonstration: repository map, relevant
  neighborhood query, or both?
- What performance improvement is meaningful enough for the first benchmark?
- Which language/repository fixture best represents the first intended user?
