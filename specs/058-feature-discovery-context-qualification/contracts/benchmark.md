# Benchmark contract

```text
npm run benchmark:context -- pair <suite> [UTC-pair-id]
npm run benchmark:context -- compare <suite> <UTC-pair-id>
npm run benchmark:context -- review <suite> <UTC-pair-id> --decision <accepted|rejected> --note <text>
```

`pair` validates exact inputs, then runs discovery-only without AgentBase and
discovery-plus-AgentBase with only `search_hub_okf` and
`read_hub_okf_concept`. It injects no prepared context. It retains safe prompts,
tool trace and raw outputs only under the Benchmark result tree; temporary Hub
checkout, agent workspace and AgentBase state remain isolated.

For this internal development suite, `pair` first requires the exact `hub-3`
profile and pinned Published commit to be active locally. It copies that
read-only checkout into disposable state; it does not clone GitHub, read the
shared token or change the active profile. This fixture rule does not add Hub
roles to the public product model.

Provider usage/authentication/turn failures remain in raw events and are
classified into bounded secret-free run metadata. A failed arm is
`incomplete`; it is never interpreted as Hub/query quality evidence.

`compare` validates the session allowlist/bounds and scores both retained outputs
against hidden tiered probes. It never reruns a model or modifies either arm.
Time, tokens and tool bytes remain diagnostic. A real pair satisfying
deterministic gates emits `needs_review`; only owner review can produce `passed`.

`review` records one immutable explicit owner decision after inspection. It does
not alter raw output, tool trace or deterministic scores. An existing review
cannot be overwritten; materially changed qualification requires a new pair.

These developer commands do not enter `abs --help` and do not change
`benchmark:okf`, whose contract remains OKF authoring.
