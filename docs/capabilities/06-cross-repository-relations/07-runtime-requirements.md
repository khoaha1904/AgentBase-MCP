# 06.07 — Capability requirements

> Status: The first AWS/SQS slice is implemented with deterministic offline E2E.
> Group 1 retains bounded provider execution while resolving executable and
> credentials through the verified trusted-enterprise adapter boundary.

These `AB-ENRICH-*` requirements are the normative Cross-Repository Relations
Capability Contract for the released bounded enrichment slice.

- **AB-ENRICH-001** — A run binds exact remote Published Hub commit, one
  confirmed Domain, 1–32 Published Repository IDs, exact candidate/Question
  revisions and released profile versions. Local pending commits/open PRs are
  not input.
- **AB-ENRICH-002** — An explicit Domain Enrichment workflow resolves the
  configured authenticated AWS CLI session and records exact account/profile,
  bounded regions and manifest digest for evidence consistency. MCP does not
  login, store credentials, change config/profile or use default region as
  knowledge.
- **AB-ENRICH-003** — AWS provider exposes only released typed read-only
  profiles through the configured provider executable, bounded environment and
  direct argv without shell. Arbitrary command/flag and account, service or
  unspecified-region enumeration are forbidden.
- **AB-ENRICH-004** — Provider success admits only a normalized safe observation
  with authority, location, native identity, allowlisted fields, profile version,
  time and digest. Raw output, credential context and secret-like values never
  enter checkpoints, proposals or Hub.
- **AB-ENRICH-005** — Strong identity uses a released provider key. Same name,
  variable or label is insufficient; identity match does not create a relation
  without independent interaction evidence.
- **AB-ENRICH-006** — Candidates run sequentially and end `confirmed`,
  `rejected`, `unresolved` or `failed`. `unresolved` is a truthful terminal
  outcome; `failed` requires explicit retry or manifest revision.
- **AB-ENRICH-007** — Question resolution separates automatic factual result,
  recommended maintainer confirmation and direct maintainer input. Only a
  selected `human:*` answer creates Guidance; defer keeps the Question Open.
- **AB-ENRICH-008** — Finalize creates one immutable Domain Enrichment proposal
  for the exact manifest. It may add safe observations, identities, evidenced
  relations and Question/Guidance changes but never auto-merges concepts,
  Accepts, Publishes or mutates provider resources.
- **AB-ENRICH-009** — Accept/publication reuses existing reviewed lifecycle with
  explicit Domain + Repository set and target Published `main`. Base/revision/
  dependency drift stops or revalidates; membership does not silently change.
- **AB-ENRICH-010** — Missing CLI/login/scope, access denial and not found retain
  existing knowledge with limitation. Protocol, timeout, integrity or unsafe
  output admits no partial observation.
- **AB-ENRICH-011** — Fixture-only qualification MAY inject a deterministic
  process runner/adapter following released SQS argv and normalized response;
  production MCP tools MUST continue using the real bounded provider adapter.
- **AB-ENRICH-012** — Cross-repository hypotheses MUST retain source/evidence
  ownership and confidence. A guessed queue name, ARN or relation MUST remain a
  candidate/Question until a provider observation or maintainer answer resolves
  it.
- **AB-ENRICH-013** — Mock observations MUST run against an ephemeral or
  explicitly test-scoped Published fixture and MUST NOT become current provider
  truth or be published to the canonical Hub.
- **AB-ENRICH-014** — Mock qualification MUST exercise deterministic confirmed,
  rejected, unresolved/failed and retry outcomes without network, real
  credentials or account-wide enumeration.
- **AB-ENRICH-RUNTIME-001** — Immediately before execution, the adapter records
  the resolved provider/account, regions, released profile and immutable
  manifest revision/digest. Drift creates no observation and returns the
  workflow for review; no separate security ticket is required in the trusted
  profile.
- **AB-ENRICH-RUNTIME-002** — Offline tests cover configured executable and
  credential availability, changed account/region/manifest, bounded direct
  read-only argv, normalized output, timeout and absence of account-wide
  enumeration.

AWS v1 releases only `aws.sts.caller-identity@1` and `aws.sqs.queue@1`. Azure/
GCP, account scan, concept redirect/merge, background enrichment and provider
lookup in ordinary query remain deferred.
