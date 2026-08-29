# 05.02 — Hub overview boundary

> Status: Technical design draft.

## What enters the Hub?

- A concept with identity and independent query value.
- Important claims, relations, decisions, Questions and limitations.
- Bounded provenance with enough reference to return to source.
- A small scalar snapshot useful to a reader when exact provenance exists and it
  is clearly marked as observed rather than current truth.
- Navigation needed to find a concept by Domain/System/Repository.

## What remains in source?

- Functions, classes, handlers and small implementation flows.
- Config fields or scalars without independent knowledge value.
- Raw Code Graph rows, provider caches and absolute checkout paths.
- Secrets, credentials and sensitive data.
- Raw source snippets, config dumps and provider responses that only avoid a
  future reread.

## Enforcement

The authoring skill, schema guidance and current changed-set validation enforce
this boundary; MCP does not need a second ontology/parser to guess every source
detail.

Proposals remain sparse: create a concept only with identity and query value.
Details not promoted may still appear as source evidence/reference. Missing
evidence creates a limitation or Question, not a placeholder fact.

## Ownership

- `agentbase-okf` skill: authoring policy and sparsity.
- `core/knowledge`: OKF/schema/relationship validation.
- `app/hub-okf`: exact proposal lifecycle and protected-content boundary.
- Sections 03/04 decide discovery/schema; section 05 decides storage boundary.
