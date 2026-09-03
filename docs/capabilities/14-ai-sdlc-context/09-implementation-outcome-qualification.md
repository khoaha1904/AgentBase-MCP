# 14.09 — Implementation outcome qualification

> Status: One real JavaScript provider source/graph pair is admitted. Code
> Graph is a quality-and-cost review candidate for this fixture, not a default.

## Goal

Measure whether local Code Graph changes the correctness or cost of an agent's
actual patch after Task Planning. Hub is deliberately absent because this
fixture has no cross-repository knowledge question.

## Fair boundary

- Both arms receive an independent editable clone of AgentDocks commit
  `b6aa2cd2281cedfc1075e605aa60afa5ddaf4a00`.
- Both receive the same bounded JSON-RPC error-handling requirement, model,
  reasoning effort, project instructions, dependencies and test authority.
- Source-native uses ordinary source reads. Source-plus-graph additionally
  indexes that clone once and performs bounded graph navigation.
- Only the protocol implementation, its focused test and the living contract
  may change. No commit, push, deployment, Hub access or source-fixture mutation
  is allowed.
- The runner independently executes focused protocol tests, a hidden semantic
  evaluator and the complete repository verification after each agent exits.

## Result

Run `2026-09-01T13-12-00Z` produced:

| Arm | Recorded v1 checks | Time | Total tokens | Patch | Retrieval |
|---|---|---:|---:|---:|---|
| source-native | focused `7/7`, hidden `2/2`, repository `357/357` | `279.983 s` | `1,193,331` | `+49/-1` | 17 commands |
| source plus graph | focused `7/7`, hidden `2/2`, repository `357/357` | `247.303 s` | `975,402` | `+36/-1` | 14 commands; 2 graph calls / 3,412 bytes |

The graph arm was `32.680 s` (`11.7%`) faster and used `217,929` (`18.3%`)
fewer tokens. Both patches were small and correctly kept provider `error.data`
out of diagnostics.

Manual diff review found that evaluator v1 omitted a message containing only
removable control characters. Source-native returned a code-only diagnostic in
that case; the graph patch correctly returned the generic fallback. The
immutable evaluator v2 added that check, and exact-patch replay failed
source-native and passed source-plus-graph. The recorded v1 result remains
unchanged; the replay is separate evidence.

## Decision

Code Graph showed a real quality and cost benefit in this one unfamiliar shared
protocol path. It does not justify indexing every implementation task: project
workflow reading and full verification dominated both arms, and the graph used
only one exact search after indexing. Keep normal source as the default; add
graph when the task names a navigation, impact, caller or dependency question.
Hub remains conditional on an unresolved cross-repository contract or owner.

The next AIT application audit is Phase 3 cross-repository defect tracing,
where Hub has a differentiated hypothesis that local Code Graph cannot replace.
