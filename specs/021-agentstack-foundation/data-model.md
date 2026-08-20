# Data Model: AgentStack Foundation

This capability adds no runtime or persisted product data. Its configuration
entities are repository-owned static inputs to native tools.

## Dependency Rule

- stable name and severity;
- source path condition;
- target dependency condition;
- exact architectural purpose.

Rules are evaluated by dependency-cruiser. AgentBase stores no dependency graph
or baseline result.

## Dead-Code Scope

- runtime/script/test entrypoints;
- project file patterns;
- intentionally disabled finding categories;
- narrow dependency/binary exceptions when required.

Knip derives findings on each run; no suppressions database is introduced.

## Secret Rule Configuration

- upstream default rule inheritance;
- optional narrow project rules/allowlists;
- redacted invocation owned by the package script.

No secret value or scan result is persisted by AgentBase.

## Verification Gate

An ordered set of native commands. Any non-zero child result makes the gate
fail. The gate performs no recovery mutation; the maintainer fixes the finding
or deliberately revises the reviewed config/requirement.
