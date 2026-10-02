# Repository skills

Released skills are grouped by product ownership. Ten public entry names include
one compatibility alias; two internal skills support those workflows. Some clients may still show
internal artifacts in a technical selector.

Public entry is explicit-only: name the skill or use an approved same-scope
handoff described below. Internal skills run only after delegation from an active explicitly
invoked public AgentBase workflow. Installing the catalog never makes ordinary
repository inspection an AgentBase query.

Within an explicit Query conversation, approval of a concrete repair offer may
enter its named authoring skill without repeating the command. That narrow
handoff grants preparation only; source/provider confirmations remain required,
and Publish always needs separate exact-result approval.

For authoring, start with **Add repository** (`agentbase-ingest`) or **Update
knowledge** (`agentbase-refresh`). These retain their installed command names.
Within an explicit authoring conversation they can hand off for the same
approved repository when Preflight finds new/existing identity. Users describe
the desired change rather than choosing Delta/Coverage. Provider evidence needs
a separately approved Domain Enrichment scope and provider-session confirmation.

## Public skills

- [`agentbase-query`](agentbase-query/SKILL.md) — answer questions or add bounded
  evidence to an active workflow from Published knowledge and authorized code.
- [`agentbase-context`](agentbase-context/SKILL.md) — compatibility entry to the
  same read instructions; prefer `agentbase-query` for new requests.
- [`agentbase-scan`](agentbase-scan/SKILL.md) — inventory bounded local Git roots,
  compare them with Published knowledge and wait for the user's workflow choice.
- [`agentbase-ingest`](agentbase-ingest/SKILL.md) — **Add repository**: confirm one repository and
  Domain, investigate bounded evidence and stop at a sparse proposal preview.
- [`agentbase-refresh`](agentbase-refresh/SKILL.md) — **Update knowledge**: compare one canonical
  repository with accepted knowledge, inspect exact source diffs and stop at a
  reviewable update proposal.
- [`agentbase-domain-enrichment`](agentbase-domain-enrichment/SKILL.md) — verify
  selected cross-repository SQS knowledge for one Published Domain and stop at
  one reviewable enrichment proposal.
- [`agentbase-batch-ingest`](agentbase-batch-ingest/SKILL.md) — preflight and
  ingest explicit local repositories sequentially into one atomic proposal.
- [`agentbase-diagram`](agentbase-diagram/SKILL.md) — render one focused
  Architecture, Dependency or Sequence view from exact Published knowledge.
- [`agentbase-domain-site`](agentbase-domain-site/SKILL.md) — explicitly export
  one static offline 2D Published Domain snapshot after a visibility warning.
- [`agentbase-hub`](agentbase-hub/SKILL.md) — inspect local/remote Hub status,
  review governed Questions, connect or switch one isolated profile,
  synchronize and recover explicitly.

## Internal supporting skills

- [`agentbase-okf`](agentbase-okf/SKILL.md) — author and validate the exact
  bounded proposal workspace prepared by a public workflow.
- [`use-diagram-design`](use-diagram-design/SKILL.md) — render only a truthful
  ready diagram packet into offline HTML/SVG for `agentbase-diagram`.
