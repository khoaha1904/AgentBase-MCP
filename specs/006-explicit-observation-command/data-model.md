# Data Model: Explicit Observation Command

## Observation request

- Absolute repository root
- Non-empty symbol focus
- Explicit transport/refresh diagnostics when requested

## Observation bundle

The existing `RepositoryEvidenceBundle` is authoritative:

- exact engine and adapter identity;
- source repository identity and revision/dirty digest;
- normalized task query inputs;
- provider-derived facts and repository-relative source references;
- completeness and limitations;
- deterministic bundle digest.

It is evidence, not a canonical code graph and not OKF knowledge.

## State transitions

```text
request -> provider round -> normalized observation bundle -> stdout
       \-> visible failure -> no successful bundle
```

There is no transition from observation to OKF. A later `okf` invocation is a
new user action with its own proposal/apply lifecycle.
