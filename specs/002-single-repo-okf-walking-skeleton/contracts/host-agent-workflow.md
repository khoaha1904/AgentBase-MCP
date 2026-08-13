# Contract: Host-Agent OKF Bundle Workflow

## Actor boundary

AgentBase prepares deterministic local evidence and enforces OKF/bundle safety.
The already-active coding agent performs semantic synthesis. AgentBase does not
start a model, manage API credentials or promise deterministic prose.

## User flow

```text
1. prepare --repo <root>
2. host agent follows .agents/skills/agentbase-okf/SKILL.md
3. host agent validates and shows bundle tree/content diff
4. apply only after explicit user instruction
```

Preparation reports source state, provider identity, evidence digest, current
bundle tree digest, limitations and proposal directory. The skill instructs the
agent to start with graph architecture/search/trace evidence, retrieve only
bounded exact sources when needed, and author linked OKF `v0.2` concepts.

Prepare records proposal state `prepared` and byte-copies the current bundle.
The host agent may modify only the returned proposal's `bundle/` subtree.
Successful validation records state `generated` and the exact tree digest used
by diff/apply; any later edit requires validation again.

## Authoring rules

The host agent:

- writes one concept per useful knowledge unit, not one aggregate report;
- creates parseable YAML with a descriptive `type`;
- sets its concepts to `status: draft` and records `generated`;
- does not add `verified` on behalf of a person or process;
- uses `sources` and matching footnotes for important supported claims;
- uses ordinary Markdown links between concepts;
- creates draft/open-question concepts only for uncertainty that affects emitted
  knowledge;
- treats previous agent concepts only as continuity;
- modifies or deletes only explicit AgentBase-generated drafts and preserves
  every other concept as raw bytes;
- preserves unknown extension values in any mutable draft it round-trips;
- updates root `index.md`; consumes an existing valid `log.md` without requiring
  the MVP to generate one.

## Apply authority

Generation approval does not imply apply approval. The host agent may prepare,
author, validate and show the diff in one working turn, but must stop before
`apply` unless the user explicitly requests applying that proposal.

## Failure behavior

- Missing/incompatible provider: report prerequisite; keep offline tests and
  current bundle available.
- Partial graph evidence: emit limitations and useful draft concepts where
  possible; do not use absence as proof.
- Invalid agent-authored bundle: retain proposal and report exact concept/path
  errors; do not edit current shared knowledge.
- Stale base: require regeneration/new diff; do not force apply.
- Interrupted apply: retain recovery manifest and execute only its exact recovery
  path before new proposal work.
- Competing writer: fail with lock-owner diagnostics; never run two
  state-changing OKF operations concurrently.

## Manual acceptance

One disposable rehearsal uses the real host agent. It records evidence digest,
concept tree, cross-links, bundle diff, human correction, defer behavior,
persistent suppression, stale-draft deletion and correction count. Generated content quality is
reviewed as product evidence; conformance and lifecycle remain automated.
