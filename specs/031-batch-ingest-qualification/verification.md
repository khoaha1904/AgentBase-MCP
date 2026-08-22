# Verification: Batch Initial Ingest Qualification

## Offline gate

`npm run verify` passes after the V5 skeleton-preservation correction:

- specification and TypeScript checks pass;
- dependency cruise: 147 modules, 529 dependencies, zero violations;
- Knip and Gitleaks pass with no leak;
- canonical suite remains 50/50;
- graph rebinding proves clean close before the next repository and blocks the
  new binding when cleanup fails.

## Retained model evidence

- V1 `2026-08-22T140037Z`: member 1 OKF validated, then record failed because
  the MCP input schema did not expose the exact Question property/observation
  binding contract. MCP contract defect; no proposal.
- V2 `2026-08-22T140638Z`: member 1 recorded successfully, then repository 2
  indexing exposed the one-repository-per-connection binding gap. MCP lifecycle
  defect; no proposal.
- V3 `2026-08-22T142101Z`: stopped before Prepare because the benchmark prompt
  prohibited the one retryable guidance correction already qualified by Initial
  Ingest. Benchmark contract defect; it did not exercise graph switching.
- V4 `2026-08-22T142611Z`: guidance and Prepare succeeded for member 1. The
  agent removed the generated repository citation from the new shared Domain;
  changed-set validation did not expose that session-specific loss and the
  record trust gate correctly rejected it. No second member, proposal or replica
  ran. The draft was invalid specifically at provenance; the underlying content
  was useful. The product defect was that Prepare did not expose its editing
  constraint strongly enough, and this run contains no graph-switch evidence.

V1-V4 prompts and results remain unchanged. V5 exposes the generated-skeleton
preservation constraint in the MCP Prepare response and benchmark prompt. No
Accept, Publish, provider CLI, remote Hub mutation or PR has occurred.

## V5 probe — 2026-08-22

Run `2026-08-22T143631Z` completed in 426,963 ms as `valid_partial` and produced
review-only `batch-new` proposal `2422668c07e8418b3a2a43c8`. Both exact
Repository IDs completed independent index, architecture, Prepare and record
checkpoints; batch Finalize and Inspect each completed once. No Accept, Publish,
provider, remote-Hub or forbidden call occurred. One changed-set validation
repair was used successfully.

The seven-concept bundle is sparse and useful: two Repository concepts, two
Systems, one Domain, the AWS Health Aware event-processing Component and the
AWS DevOps Agent Space Resource. Internal schedules, state, associations and
integrations remain embedded, and limitations correctly distinguish Terraform
desired state from live deployment facts. There are no Questions because no
qualifying observed values exist.

Manual review found one product defect omitted by the deterministic assessment.
The composed Domain retains the first member's descriptive System row but its
`Batch Navigation` contains only the two Repository rows; it omits the second
member's System. Composition recognizes only authored navigation rows ending in
the literal role label `- System`, so an agent-enriched description is silently
excluded. This contradicts AB-BATCH-006's coordinator-owned confirmed-Domain
navigation projection. The run proves sequential graph rebinding and the full
lifecycle, but it does not authorize a stability replica until this navigation
composition defect is fixed and verified offline.

## Post-fix V5 probe — 2026-08-22

Run `2026-08-22T150414Z` completed in 360,904 ms as `valid_partial` with proposal
`c7175b9206bff9723fa63da8`. It completed exactly two index, architecture,
guidance, Prepare, validation and record checkpoints, followed by one batch
Finalize and Inspect. No repair, Accept, Publish, provider or remote-Hub call
occurred.

The proposal again contains the same stable seven-role shape: two Repositories,
two Systems, one Domain, one Component and one Resource. Exact identities vary
within accepted authoring granularity, but the roles and embedded boundaries are
consistent. The corrected Domain `Batch Navigation` contains both Repositories
and both Systems in member order. Static desired-state limitations remain
truthful and no Questions were manufactured.

Compared with the first V5 run, elapsed time fell by 66,059 ms, output tokens
fell from 17,137 to 12,989, and the one changed-set repair disappeared. There
are no new OKF, MCP/runtime or benchmark blockers. This completes capability
031; no third probe is authorized.
