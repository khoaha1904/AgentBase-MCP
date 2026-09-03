# 09.10 — Workspace scan and workflow routing

> Status: The MVP contract is implemented.

## Purpose

`agentbase-scan` is a public read-only workflow that helps the user choose the
next step. It is not Ingest, Refresh, a mixed batch or Code Graph discovery.

## Boundaries

- Accept one explicit workspace root selected by the user.
- Inventory at most 32 unique Git roots inside the boundary, exclude private/internal
  Git directories and stop descending after finding a repository root.
- Do not scan the home directory/machine, follow symlinks outside the boundary,
  read source deeply or read README/documentation, build/reuse a graph or create a Proposal.
- Without a Remote Hub, return only local repository inventory and `Hub unavailable`.

## Classification

With an active remote profile, Scan uses the exact synchronized Published Hub and
lightweight Git metadata to return, per repository:

- display/path and strong identity hints;
- `not-in-hub`, `published-unchanged`, `published-source-advanced` or
  `init-local-draft`, `init-in-review`, `refresh-local-draft`,
  `refresh-in-review` or `ambiguous`;
- Published last-observed time/revision when available;
- suggested `ingest`, `refresh`, `none` or `confirm`.

A folder name alone does not confirm identity. An ambiguous fork/mirror/copy is
not automatically classified as Init or Refresh.

Scan/status reads profile-local proposal/pull-request metadata only to avoid
duplicate Init/Refresh suggestions and offer `review`, `submit`, `wait` or
`reconcile`. Draft bytes do not participate in Hub matching or ordinary query.

## User selection

Scan only presents options and waits for the user. One new repository routes to
single Initial Ingest; multiple new repositories can route to Batch Initial
Ingest. Selected Published repositories run single Refresh sequentially. The user
can choose any subset.

The MVP does not add Batch Refresh or an atomic mixed Init/Refresh manifest. Scan
simplifies selection but does not replace the authority, confirmation, Proposal,
Accept or Publish of the target workflow.

## Runtime requirements

- **AB-SCAN-001** — Scan requires one explicit absolute workspace root.
- **AB-SCAN-002** — Scan inventories at most 32 unique Git roots and stops
  descending after finding a root.
- **AB-SCAN-003** — Scan never follows symlinks, deeply reads source, builds a
  Code Graph or creates a Proposal.
- **AB-SCAN-004** — Without a remote Hub, Scan returns inventory with Hub
  classification unavailable.
- **AB-SCAN-005** — Hub matching uses only the exact synchronized Published
  commit; draft metadata can only suppress duplicate workflow suggestions.
- **AB-SCAN-006** — Classification reports current and last-observed Git state
  when available and does not resolve ambiguous identity automatically.
- **AB-SCAN-007** — Scan waits for user selection and never executes Ingest or
  Refresh itself.
