# 04 — Trust, conflicts and freshness

> Status: Provenance-preserving conflicts, shared Questions, exact Maintainer
> Guidance, observed snapshots, warning-only freshness and sensitive-value
> filtering are implemented. A uniform machine-readable freshness envelope is
> implemented by G3-C1. Its real-model usefulness campaign is deferred and does
> not block the current internal enterprise release.

## Outcome

AgentBase makes uncertainty visible instead of selecting a convenient truth.
Claims retain their sources, conflicting positions may coexist and
change-prone values are clearly labeled as observations rather than current
facts.

## Provenance and conflicts

- Multiple sources supporting one claim remain attributable.
- Conflicting claims are presented together; recency or Published status does
  not automatically choose a winner.
- Code, configuration, infrastructure and documentation keep their distinct
  source roles; there is no universal “code always wins” rule.
- Ambiguous evidence becomes a Question or limitation rather than an invented
  field or relation.
- Unknowns may be Published when their scope and evidence are explicit.

## Questions and Maintainer Guidance

Questions are shared Hub knowledge with a lifecycle independent from publication:

```text
Open → Resolved → Needs Review → Resolved
```

`Open` waits for evidence or a decision. `Resolved` means it is no longer
waiting, not that the answer is absolute truth. New conflicting evidence moves
the Question to `Needs Review` while preserving prior guidance and history.

A maintainer answer is scoped human evidence. In the current product it applies
to the exact Question or subject/property being reviewed; broader policy is a
normal concept update. Answers and state transitions create a new Local Draft
and never publish automatically.

## Observed snapshots

The Hub may retain a small useful non-sensitive scalar with source, revision and
observation time. It does not snapshot every configuration value or build a
live-symbol resolver.

A normal answer shows the snapshot and its age. When the user explicitly needs
the current value and authorized source is available, AgentBase reads source
through the normal repository boundary. Without access it returns the observed
value and clearly states that current source could not be verified.

Freshness is warning-only context. It does not declare knowledge false, trigger
Refresh, hide content or block publication. A broken source reference preserves
the historical observation and may produce a reviewable Question.

Every Group 3 context response that relies on Published knowledge or an observed
snapshot carries a uniform freshness envelope: exact Published commit, observed
source revision when available, observation time, whether current source was
verified, and `fresh`, `stale` or `unknown` status with a bounded reason. This
metadata describes verification state rather than truth and never grants source
access or triggers background work.

## Sensitive information

Hub access is a shared trust boundary. Credentials, tokens, secrets, signed
URLs, connection strings and equivalent sensitive values must never become
snapshots or Published knowledge. A reference may describe that a secret source
exists without resolving its value.

If sensitive content is discovered in Published knowledge, AgentBase must stop
returning it and propose reviewed removal; credential rotation and incident
response remain outside AgentBase.

## Correction and recovery

Confirmed correction/removal uses a normal proposal that identifies the exact
old content, reason and evidence. Git retains history and supports revert. Two
conflicting sources alone never authorize deleting one side.

Failure to verify one Question, snapshot or provider observation does not erase
other safe knowledge. Deferred and partial outcomes remain explicit.

## Non-goals

- Automatic truth ranking or conflict resolution.
- A private Question ledger as knowledge authority.
- Broad implicit Maintainer Guidance scopes.
- A universal live-reference engine or automatic source polling.
- A freshness score that silently ranks conflicting claims or hides `unknown`.
- Secret storage or incident-management automation.

## Downstream Capability Contracts

- [Conflicts, Questions and Guidance](../capabilities/07-conflicts-and-questions/README.md)
- [Observed snapshots and source references](../capabilities/08-live-references/README.md)
