# 08.08 — Uniform context freshness requirements

> Status: G3-C1 implemented and verified.

> Release evidence: Required

Product Contracts:
[Trust, conflicts and freshness](../../product/04-trust-conflicts-and-freshness.md)
and [Query and context](../../product/05-query-and-context.md).

Architecture Contracts:
[Group 3 derived evidence](../../architecture/state-and-trust.md#group-3-derived-evidence)
and [Group 3 usefulness-proof flow](../../architecture/flows.md#group-3-usefulness-proof-flow).

## Baseline and impact

Published search/read already returns one exact synchronized commit, Repository
documents already carry observed source revision/time, and Hub CI has a separate
age projection. The gap is that ordinary context responses do not carry one
uniform verification status.

This is a **contained, medium-risk additive change**. It reuses Published query
projection and Repository observation parsing. It adds no Hub schema, MCP tool,
input parameter, source probe, durable state or protocol era. Existing clients
may ignore the new response member; no existing member is renamed or removed.

## Requirements

- **AB-FRESH-001** — Every public Published Hub search and exact-read result
  MUST include one `freshness` envelope containing the exact Published commit,
  evaluation time, overall `fresh|stale|unknown` status, bounded reason,
  `current_source_verified` and a bounded Repository list. It MUST remain
  additive to the existing result.
- **AB-FRESH-002** — Each Repository entry MUST use canonical Repository concept
  identity and, when admitted, strong Repository identity, observed revision and
  observation time. It MUST carry its own status, reason and
  `current_source_verified`; filesystem paths and credentials are forbidden.
- **AB-FRESH-003** — A Repository entry is `fresh` only when an explicitly
  supplied, identity-matched current-source receipt has a comparable revision
  equal to the Published observation. It is `stale` when those revisions differ
  and `unknown` when either side is missing or current source was not verified.
- **AB-FRESH-004** — Overall status is `stale` when any returned Repository is
  stale, `fresh` only when at least one Repository is returned and all are fresh,
  and `unknown` otherwise. Age MUST NOT change status. Empty or bounded-away
  Repository context MUST NOT be presented as fresh.
- **AB-FRESH-005** — Published Hub search MUST derive Repository scope only from
  admitted canonical structural relations for the returned matches and bounded
  relation/Flow context. Equal names, paths, Domain membership or prose MUST NOT
  infer ownership.
- **AB-FRESH-006** — Exact concept read MUST report the exact Published commit
  and any Repository observation contained by that exact Repository document.
  It MUST NOT expand into unrelated Hub documents merely to manufacture a
  freshness result; a non-Repository exact read therefore remains `unknown`
  unless a separately admitted composer supplies verified context.
- **AB-FRESH-007** — Ordinary Published query MUST NOT inspect a checkout,
  invoke Code Graph/provider/network access, resolve credentials or trigger
  Refresh. Its runtime envelope is consequently warning-only and normally
  `unknown`; an authorized higher-level source workflow may recompute the same
  pure model from an exact current-source receipt.
- **AB-FRESH-008** — The envelope MUST sort and deduplicate Repository entries,
  cap them at 64 and expose an exact omitted count. Any omission prevents an
  overall `fresh` result. Reasons are stable machine tokens plus optional
  bounded safe detail, never unbounded provider errors.
- **AB-FRESH-009** — Malformed Published commit, timestamps, revisions,
  Repository identities, duplicate conflicting observations or current-source
  receipts MUST fail the affected projection visibly. Failure MUST NOT fall back
  to stale cached metadata or mutate Hub/workflow state.
- **AB-FRESH-010** — `agentbase-context` and `agentbase-query` MUST surface the
  returned Published commit, freshness status and reason, preserve `unknown`
  honestly and never claim current implementation from a Published-only result.
- **AB-FRESH-011** — Freshness metadata MUST NOT rank or hide query matches,
  choose among conflicting claims, block publication, create a Question or
  authorize source access. Hub CI age reporting remains a separate derived
  projection over the same Published observations.
- **AB-FRESH-012** — Verification MUST cover deterministic fresh/stale/unknown
  aggregation, multiple and omitted Repositories, malformed/conflicting inputs,
  Published-only search/read output, unchanged search ordering/content and the
  existing modern and legacy MCP tool surface without a new tool or input field.

## Compatibility and recovery

The response addition requires no content migration or state recovery. A newer
caller may treat a missing envelope from an older AgentBase release as
`unknown`; it must never infer `fresh`. If envelope construction fails, the
affected request fails visibly while the synchronized Published commit and all
Hub state remain unchanged.
