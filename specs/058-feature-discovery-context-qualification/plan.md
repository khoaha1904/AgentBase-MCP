# Implementation Plan: On-Demand Feature Discovery Context Qualification

## Summary

Reuse the current MCP server, Published Hub `search_hub_okf` /
`read_hub_okf_concept` tools and benchmark process/result helpers. Add one
immutable generic Discovery prompt, one Crawler scenario/expectation and one
focused context runner/scorer. Add no packet builder, product skill, MCP tool or
OKF-authoring benchmark mode.

## Technical shape

- AgentBase-MCP owns the focused runner, tool-trace admission and scorer code.
- AgentBase-Benchmark owns immutable prompts, suite inputs, hidden probes and
  durable results.
- The developer first selects `hub-3` through ordinary peer-profile behavior.
  The runner verifies that active local profile and its pinned Published ref,
  then copies it into isolated disposable state. It does not clone a remote,
  read a credential or change the active profile.
- The direct arm starts no AgentBase server. The assisted arm starts the current
  MCP server with only the two Hub query tools enabled.
- Both arms receive the same prompt and empty working directory. Shell commands,
  source reads and all non-allowlisted tools are qualification failures.
- The runner records safe Published tool calls/results and validates call count,
  search limits, aggregate bytes and exact Hub revision. It creates no context
  representation beyond ordinary MCP results.

## Constitution check

Before implementation:

- **Evidence Before Abstraction**: one audited pinned Hub and one bounded
  on-demand qualification precede any public integration abstraction or claim.
- **Local-First Explicit Authority**: deterministic qualification is offline;
  real model execution is bounded, observable, opt-in and separately approved.
- **Agent-Navigable Ownership**: MCP owns runner code; Benchmark owns immutable
  inputs/results; existing Hub query remains the only retrieval owner.
- **Cumulative Knowledge**: the runner reads exact Published bytes and cannot
  mutate Hub, tracker, source or existing benchmark evidence.
- **Specification and Verification**: AB-CONTEXT requirements, failure/recovery
  tests and the canonical repository gate precede completion.

Post-design evaluation: compliant. The design removes the proposed packet
subsystem and adds no production dependency, query behavior, credential
boundary, migration, background service or irreversible operation. Approval is
limited to an internal benchmark mode; real model execution remains separate.

After implementation, T008 repeats this check against the actual diff and fails
completion if ownership, mutation, dependency, opt-in or verification boundaries
have changed.

## Sequence

1. Add deterministic tool-session admission and scoring tests.
2. Add the Crawler Discovery suite, shared prompt and hidden probes.
3. Add internal `benchmark:context` `pair`, `compare` and immutable `review`.
4. Run fake sequential arms proving capability isolation and retained evidence.
5. Run repository verification.
6. Only after separate owner confirmation, run one real pair and record owner
   review before any `passed` or productization decision.

## Impact

- Ordinary MCP/Hub query latency: unchanged.
- Ingest/Refresh latency and Hub/local storage: unchanged.
- MCP, skill and public `abs` surfaces: unchanged.
- Benchmark execution: one later opt-in pair may take several minutes and model
  quota.
- Product specificity: scenario data lives only in Benchmark; runner admission
  is limited to existing provider-neutral Hub query tools.

## Safety

No credential is read or placed in prompts or results. Only safe Published
fixture results are retained. The selected development profile is read-only;
its copied checkout, empty agent workspace and isolated AgentBase state are
disposable. Failure in one arm does not prevent retention or execution of the
other; incomplete evidence cannot pass.
