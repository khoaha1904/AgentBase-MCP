# Research: Minimum qualification path

## Reject prebuilt context

A prepared packet is easy to compare but tests a hand-selected briefing rather
than the intended behavior. It also introduces selection, transformation and
storage concepts with no runtime consumer. Phase 1 instead lets Discovery call
the two existing Published Hub tools when it detects a gap.

## Reuse existing query and MCP

`search_hub_okf` already returns ranked bounded matches, relation context and an
exact commit. `read_hub_okf_concept` already returns one validated concept with
provenance. Enabling only these tools is smaller and closer to real host-agent
orchestration than adding a wrapper tool or skill first.

The first real pair showed that optional wording let the model skip an available
Hub entirely. The fixed scenario already contains an explicit system-context
gap, so the shared prompt requires one targeted search when that tool exists.
This is query guidance, not prefetched content; the workflow still chooses terms
and reads.

The second pair used the Hub correctly but selected the tool's general limit of
ten, exceeding the qualification budget of eight. Prompt v3 states the already
approved session bounds; admission still rejects violations independently.

The third pair complied with every bound and produced useful evidence, but it
mentioned upstream/storage nodes in prose without exact identities or evidence,
so it covered only part of the direct path and added no complete hidden
important probe. Prompt v4 adds generic flow-completeness and output-consistency
guidance without naming fixture identities or changing the scorer.

## Reuse the Crawler fixture

The fixture has cross-repository messaging topology plus meaningful missing
knowledge. It tests useful facts, query relevance and truthful gaps without
expanding AWS/provider support.

The fixture is an ordinary active Hub profile under product semantics. The
development runner reuses its exact synchronized local Published revision and
copies that revision into isolated state. Remote clone/authentication and a
product-level primary/test Hub distinction are unnecessary.

## Keep a focused runner and scorer

Existing benchmark helpers already cover process identity, sequential arms,
usage and durable results. OKF-authoring semantics do not fit Discovery output,
so `benchmark:context` reuses only process/result helpers and keeps its
tool-session admission and priority scorer separate from `benchmark:okf`.

## Treat the Discovery prompt as a proxy

The private company Discovery skill is unavailable. Both arms use one immutable
generic prompt and output schema. Results qualify on-demand AgentBase value in a
controlled workflow, not compatibility with the private skill.

## First ECS pair outcome

After the prompt and admission contract were tightened, pair
`2026-08-29T03-56-31Z` passed deterministic qualification. The assisted arm
used two scoped searches and five exact reads at the pinned Hub commit. It
matched the critical backend-health interface and added the important frontend
consumer and blue-green delivery probes that the direct arm missed; both arms
had no unsupported claims. The comparison is `needs_review`, not an automatic
product pass. Owner review is the remaining gate.

The runner now retains exact `repository://` and `agentbase://` source URIs
found inside pinned concept excerpts, in addition to concept paths. This closes
the evidence-admission gap exposed by the first real run without broadening the
MCP or query surface.

## Three-scenario signal

The first three current-data scenarios are: ECS readiness
(`2026-08-29T03-56-31Z`, `needs_review`, critical and two important
improvements), Crawler cross-repository (`2026-08-29T04-08-19Z`, `needs_review`,
critical and two important improvements), and ECS compatibility. Its first
attempt (`2026-08-29T04-12-41Z`) was `incomplete` because of a forbidden command
event and an undeclared evidence ID. After tightening the runner, rerun
`2026-08-29T04-21-39Z` passed deterministic checks and is `needs_review`, with
the critical backend interface plus one important improvement. The failed
attempt remains evidence of workflow/model compliance risk; it is not hidden by
selecting only passing reruns.

## Defer integration skill and semantic automation

One scenario cannot justify `agentbase-add-context`. A real result also needs
owner review because exact identities, relations and references cannot prove the
meaning or usefulness of arbitrary model prose.
