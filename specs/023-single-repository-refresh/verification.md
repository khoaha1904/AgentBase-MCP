# Verification: Single-Repository Refresh

Date: 2026-08-22

## Offline evidence

- `python3 .../skill-creator/scripts/quick_validate.py .agents/skills/agentbase-refresh` — passed.
- `npm run spec:check` — passed.
- `npm run verify` — passed: specification, TypeScript, dependency boundaries,
  unused-code analysis, secret scan and 50/50 tests.
- `git diff --check` — passed.

The cohesive Initial Ingest scenario now accepts one local baseline, commits a
source change, derives the exact changed path, prepares Refresh, finalizes one
unaccepted reviewable draft and verifies that the Repository observation
checkpoint advances to the new source commit. Existing scenarios cover
no-change cleanup, truthful partial coverage, source mutation, invalid changed
source spans, omission preservation and explicit owned removal.

## Review findings closed

- Omission and elapsed time no longer authorize deletion.
- Finalize rejects changed source state, stale Hub head and invalid changed
  current-repository source spans.
- Repository observation state is portable Hub metadata, not private local
  state; no-change reports the current observation without creating a proposal.
- Shared concepts retain foreign/protected value and destructive operations use
  typed, evidence-bound lifecycle intents.
- Inspection exposes Added, Updated, Removed, Superseded/Retracted and
  Questions/Limitations groups.

## Model-backed qualification

Owner-authorized Terraform qualification completed without Accept, Publish,
provider CLI enrichment or a Hub PR.

### OKF and MCP findings

- V1 diagnostic `2026-08-21T190339Z` found a real MCP gate defect: Refresh
  selected only signal-matched `Domain` and could not update the existing
  `Function`. Refresh now retains every non-governance catalog role already
  attributed to the current Repository; final proposal metadata preserves the
  same allowlist.
- V1 probe `2026-08-21T190732Z` produced the correct five-minute schedule.
  Replica `2026-08-21T190943Z` exposed an authoring stability defect: it read
  only the first 620 lines of the changed Terraform file, missed the changed
  hunk at lines 755–795, retained `rate(1 minute)` and added unrelated
  secondary-region detail. The packaged skill now requires the exact
  commit-to-commit diff for every changed path before gaps or discovery.
- Immutable V2 probe `2026-08-21T191712Z` and replica
  `2026-08-21T191905Z` both completed the exact lifecycle once, produced one
  reviewable Local Draft, changed the schedule to `rate(5 minutes)`, removed
  both one-minute renderings and retained the desired-state limitation. The
  Function bytes are identical across both runs. Different tree digests are
  limited to the independently generated source commit in Repository
  observation metadata.
- Both accepted V2 runs are `review_ready`, with 100% applicable concept,
  schema, provenance, relationship and embedded-knowledge coverage. The probe
  took 95,553 ms with 45,592 uncached input tokens; the replica took 81,533 ms
  with 42,468 uncached input tokens.

### Benchmark findings

- The inherited Initial Ingest semantic expectation could score a structurally
  valid but stale Refresh as `review_ready`. Refresh V2 adds an exact mutation
  gate: expected new knowledge must be present and superseded literal knowledge
  absent before a run can succeed.
- One discarded pre-V2 diagnostic used correct OKF content but wrong graph-tool
  parameter names. V2 states the exact `repo_path`, `name`, `mode` and `project`
  inputs. V1 was restored unchanged and V2 received a new prompt identity.
- The generic metrics payload still calls its categorical field
  `initialIngestAcceptance`; this is report-label debt only. Refresh validity is
  independently gated by lifecycle, exact mutation, bundle validation and
  owner-review assessment.
