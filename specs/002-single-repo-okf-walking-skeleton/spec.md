# Capability 002: Single-Repository OKF Walking Skeleton

- **Status:** Completed and promoted to the living contract
- **Created:** 2026-08-12
- **Last clarified:** 2026-08-12
- **Completed:** 2026-08-12
- **OKF target:** Google Open Knowledge Format `v0.2`

## Outcome

On one local TypeScript repository, a coding agent can use bounded structural
evidence from Codebase Memory to propose a small, conformant Open Knowledge
Format bundle, review its file-tree/content diff, apply it explicitly, add a
human guidance concept, and rebuild without erasing that guidance or treating
previous AI output as new evidence.

The first concept bundle may be incomplete or partly wrong. This capability
proves the smallest compounding knowledge loop; semantic completeness,
cross-repository reconciliation and strict governance remain later work.

## Source correction

The previous preview incorrectly modeled OKF as one custom `OKF.md` report with
JSON comments and protected marker ranges. That preview is withdrawn.

In this capability, OKF has the meaning pinned in
`docs/references/open-knowledge-format.md`: a directory of concept Markdown
files with YAML frontmatter, bundle-relative concept identity, standard
Markdown cross-links, and reserved `index.md`/`log.md` structures.

## Owner decisions

- Target Google Open Knowledge Format `v0.2`, pinned to the reviewed source
  commit recorded in `docs/references/open-knowledge-format.md`.
- AgentBase owns Codebase Memory `v0.10.1` as an exact runtime dependency. Its
  official npm wrapper downloads and checksum-verifies the platform binary into
  package-private storage during installation or one-time recovery.
- Users do not supply an executable path. AgentBase resolves only its managed
  dependency, never discovers `PATH`, and never invokes Codebase Memory's native
  install/update/config commands, registers another MCP, activates a daemon or
  enables background watching.
- The current host coding agent is the AI runtime. AgentBase adds no model SDK,
  API key or provider configuration.
- Generation writes a complete proposed bundle under AgentBase-owned local
  state, shows a bundle-level diff, and requires a separate explicit apply to
  the shared `okf/` directory.
- Agent-generated concepts start as `status: draft`, record `generated`, and do
  not claim `verified` until an actual verifier checks them.
- Human correction and defer guidance are stored as human-authored
  `Maintainer Guidance` concepts with documented AgentBase extension fields.
- Only concepts explicitly identified as AgentBase-generated drafts are
  replaceable. Every other current concept is protected by default.
- The main user flow is prepare, review the automatically validated diff, then
  explicitly apply. Validation, diff and recovery commands remain diagnostics,
  not mandatory happy-path steps.
- Scope is one TypeScript repository. AWS, Terraform/Terragrunt enrichment,
  cross-repository links, a Hub, remote publication and a review UI are deferred.

## User stories

### User Story 1 — Obtain real, bounded repository evidence (P1)

As a coding agent, I can prepare a current repository evidence bundle through a
real Codebase Memory engine without broadly reading the source tree or leaving a
standing process.

Acceptance:

- installing AgentBase resolves the exact managed provider package and obtains
  the checksum-verified platform binary without asking the user for a path;
- a missing managed binary gets one bounded package-owned recovery attempt;
  unsupported platform, offline bootstrap, checksum failure, non-executable or
  incompatible identity stops before indexing without falling back to `PATH`;
- the adapter uses Codebase Memory `v0.10.1` one-shot CLI only and records the
  engine identity, source revision, dirty state and limitations;
- repository overview, structural search and trace results are translated into
  one bounded provider-neutral evidence bundle;
- the accepted fixture task contains every manifest-declared critical fact and
  references no more than three of its 12 authored files;
- the process exits after each command and any provider conflict or malformed
  output becomes an explicit failure rather than a fallback;
- the canonical offline verification does not execute or download the managed
  binary and still passes when the real provider is unavailable.

### User Story 2 — Generate and review a conformant OKF bundle proposal (P1)

As a repository maintainer, I can ask the host coding agent to turn current
evidence into linked draft concepts, inspect all file additions/changes, and
decide whether to apply the proposal.

Acceptance:

- preparation creates a complete proposed bundle without changing current
  `okf/` content;
- the bundle-root `index.md` declares `okf_version: "0.2"` and provides
  progressive links to the proposed concepts;
- every concept is a UTF-8 Markdown file with parseable YAML frontmatter and a
  non-empty free-form `type`;
- the accepted fixture proposal contains at least one repository concept, two
  linked technical concepts and one visible open-question concept;
- every generated concept explicitly uses `status: draft`, records a valid
  `generated` actor/time, omits `verified`, and attaches source provenance where
  the evidence bundle supports a claim;
- standard Markdown links connect related concepts and consumers can derive
  concept IDs from normalized bundle-relative paths;
- the host agent may use bounded source snippets and repository docs when graph
  evidence alone is insufficient, while recording those sources;
- previous generated concepts may provide continuity but are never copied into
  `sources` or counted as independent support;
- preparation creates a proposal workspace in `prepared` state, the host agent
  may edit only its `bundle/` subtree, and successful validation records the
  exact generated tree digest before showing the diff;
- a bundle-level diff shows created, modified, preserved and explicitly deleted
  AgentBase-draft files before apply.

### User Story 3 — Preserve human guidance and rebuild safely (P1)

As a repository maintainer, I can add a correction or defer instruction as a
human-owned concept, rebuild, and retain that knowledge without silently losing
the current bundle.

Acceptance:

- guidance is a conformant concept with `type: Maintainer Guidance`, a
  `generated.by` actor beginning `human:`, and a normal Markdown link to the
  affected concept or open question;
- an optional AgentBase defer extension has a stable directive ID and subject;
  it remains active until a maintainer removes or explicitly reopens it;
- rebuild preserves every concept that is not clearly an AgentBase-generated
  draft byte-for-byte and preserves unknown frontmatter values in mutable
  AgentBase drafts it round-trips;
- agent generation does not modify a human-verified concept; conflicting new
  evidence creates a draft open question or new linked draft concept;
- apply rejects a stale base tree digest, invalid OKF structure, removal of a
  protected concept or malformed proposal, while allowing a reviewed deletion
  of an explicitly AgentBase-owned draft;
- apply stages a complete next directory, records a recovery manifest, switches
  the bundle through bounded same-filesystem renames, and restores or exposes an
  exact recovery action after interruption;
- every state-changing operation uses an atomic repository-local exclusive lock
  so two agents cannot prepare/apply/recover shared state concurrently;
- any failed apply leaves the previous bundle active or deterministically
  recoverable from AgentBase-owned state; it never silently reports partial
  success.

## Functional requirements

### Real-engine boundary

- **AB-MVP-001**: AgentBase MUST own Codebase Memory through the exact runtime
  dependency `codebase-memory-mcp@0.10.1`, resolve only its package-private
  executable, and MUST NOT request a user path, search `PATH`, or read/modify a
  separately installed user copy.
- **AB-MVP-002**: The supported engine identity MUST be Codebase Memory
  `v0.10.1`; AgentBase MUST bind the npm package integrity, upstream
  checksum-verified platform artifact, reported version and executable SHA-256,
  and MUST stop before indexing when compatibility cannot be established. If
  package-private binary recovery is needed, it MUST be visible, bounded to the
  exact managed package and fail closed when offline or verification fails.
- **AB-MVP-003**: The adapter MUST use one-shot `cli` commands only, MUST NOT
  invoke the native `install`, `update`, `uninstall` or `config` commands, start
  or connect to a persistent daemon, and MUST treat exact-build or cache
  admission conflicts as explicit failures.
- **AB-MVP-004**: Before shaping the adapter around assumed fields, an approved
  implementation MUST capture sanitized output and filesystem-mutation evidence
  from `v0.10.1` on a disposable copy of the representative fixture.
- **AB-MVP-005**: The first provider surface MUST be limited to indexing,
  architecture overview, structural search, call tracing and bounded source
  snippet retrieval needed by the accepted flow.
- **AB-MVP-006**: A repository evidence bundle MUST record provider and adapter
  versions, source commit, dirty-state digest, query inputs, bounded results,
  repository-relative source references, limitations and a deterministic bundle
  digest without exposing machine-local roots.
- **AB-MVP-007**: The mandatory offline verification MUST use sanitized captured
  fixtures and a fake process boundary; a separate opt-in integration command
  MAY execute the already managed package-private binary but MUST NOT download
  during the canonical gate.

### OKF bundle proposal

- **AB-MVP-008**: OKF generation MUST use the current host coding agent through
  a repository-local workflow and MUST NOT add a model SDK, API key or hosted AI
  service to the AgentBase runtime.
- **AB-MVP-009**: The shared output MUST be an OKF `v0.2` bundle directory named
  `okf/`; generation MUST write a complete proposal under AgentBase-owned local
  state and MUST NOT mutate the current bundle before explicit apply.
- **AB-MVP-010**: Every non-reserved proposed `.md` file MUST have parseable YAML
  frontmatter with a non-empty `type`; `index.md` and `log.md`, when present,
  MUST follow their reserved OKF structures.
- **AB-MVP-011**: The bundle-root index MUST declare `okf_version: "0.2"`, link
  proposed concepts for progressive disclosure and use bundle-relative file
  paths as concept identities.
- **AB-MVP-012**: Agent-generated concepts MUST explicitly use `status: draft`,
  record `generated.by` and `generated.at`, omit unearned `verified` events, and
  use valid `sources` plus stable source IDs for important supported claims;
  repository source resources MUST use normalized
  `repository://<repository-id>/<relative-path>#L<start>-L<end>` identifiers and
  MUST NOT expose checkout roots.
- **AB-MVP-013**: Related concepts MUST use standard Markdown links; unknown
  concept types, unknown frontmatter keys, missing optional fields and broken
  links MUST remain consumable, with broken links reported as warnings.
- **AB-MVP-014**: Existing AI-generated concepts MUST be labeled continuity
  context and MUST NOT appear as independent provenance or increase trust without
  new repository evidence or actual verification.
- **AB-MVP-015**: A proposal MUST bind the current OKF bundle tree digest and
  current repository-evidence digest, and MUST expose created, modified,
  preserved, deleted-AgentBase-draft and prohibited-deletion entries before
  apply. Prepare MUST byte-copy the current bundle into a proposal workspace,
  record `prepared`, restrict host-agent writes to its `bundle/` subtree, and
  record the exact generated tree digest only after successful validation.

### Human guidance, rebuild and recovery

- **AB-MVP-016**: Human correction or defer input MUST be representable as a
  conformant `Maintainer Guidance` concept with a `human:` generated actor and a
  Markdown link to its subject.
- **AB-MVP-017**: An AgentBase defer extension MUST carry a stable ID and
  subject; it suppresses the matching item until a maintainer removes or
  explicitly reopens the directive and does not mean rejection or deletion.
- **AB-MVP-018**: A concept is mutable only when `generated.by` identifies an
  `agentbase/` producer, `status` is explicitly `draft`, and no human verifier
  exists. Rebuild MUST preserve every other concept byte-for-byte. Modified
  mutable drafts MUST preserve unknown frontmatter values; new evidence
  conflicting with protected knowledge MUST remain a separate visible draft.
- **AB-MVP-019**: Apply MUST reject a stale base tree, non-conformant proposal,
  protected-concept mutation or deletion without clear AgentBase-draft
  ownership. Explicitly diffed deletion of a mutable AgentBase draft is allowed;
  concept rename and semantic merge remain outside the ordinary MVP path.
- **AB-MVP-020**: Apply MUST stage a complete sibling next bundle, record exact
  current/next/backup paths in a recovery manifest, use bounded same-filesystem
  directory renames, and use an atomically acquired repository-local
  single-writer lock for state-changing operations. Injected interruption at
  every declared process checkpoint MUST have a deterministic startup recovery
  action; power-loss durability is not claimed without an explicit fsync design.

### Value evidence

- **AB-MVP-021**: One disposable vertical rehearsal MUST cover real graph
  context, first multi-concept proposal, human guidance, persistent defer,
  AgentBase-draft removal, stale apply and interrupted directory switch.
- **AB-MVP-022**: The same accepted fixture task MAY be measured once with
  graph-assisted exploration and once with direct source exploration, recording
  elapsed time, files or bytes presented to the agent, required-fact coverage
  and maintainer correction count without imposing an unmeasured speed target;
  this benchmark does not block the walking-skeleton release.

## Success criteria

- **SC-MVP-001**: The accepted graph-assisted fixture task returns 100% of the
  manifest-declared critical evidence while referencing no more than three of
  the 12 authored files.
- **SC-MVP-002**: No mandatory `npm run verify` path needs network, credentials,
  a model call, Codebase Memory binary, daemon or watcher.
- **SC-MVP-003**: The accepted proposal passes OKF `v0.2` conformance, contains
  at least four linked concepts across the required fixture categories and does
  not change current `okf/` bytes before apply.
- **SC-MVP-004**: Rebuild preserves every non-AgentBase-draft concept
  byte-for-byte, preserves parsed unknown extension values in a modified
  AgentBase draft, and may visibly remove a stale AgentBase draft only after the
  user reviews the diff and explicitly applies it.
- **SC-MVP-005**: Stale-base, invalid base/producer validation,
  protected-mutation and each injected directory-switch interruption leave the
  previous bundle active or pass deterministic recovery to the intended
  previous or next valid state.
- **SC-MVP-006**: When the optional benchmark is run, its report contains both
  arms and all four metrics; performance and correction thresholds are set only
  after those results are reviewed.

## Edge cases

- A repository without `okf/` uses an empty base-tree digest and proposes the
  first complete bundle.
- A directory named `okf/` that is not conformant is not rewritten
  automatically; the workflow reports an explicit migration prerequisite.
- A concept without `status` is conformant and means `stable` under OKF, but an
  AgentBase-generated draft without explicit `status: draft` fails producer
  validation.
- Unknown types and keys are preserved. Missing optional metadata and broken
  links are warnings, not whole-bundle failures.
- Base OKF conformance and AgentBase producer-policy validation are reported
  separately; failure of a producer convention is not mislabeled as base-format
  non-conformance.
- Duplicate concept IDs, escaping paths, invalid YAML, empty `type`, invalid
  reserved files, duplicate source IDs or mismatched citation footnotes fail or
  warn according to the pinned OKF and AgentBase producer contract.
- A dirty worktree is allowed and represented by commit plus dirty-state digest;
  it is not silently treated as the clean commit.
- A Codebase Memory command that exits successfully but emits malformed or
  partial output is an adapter failure with bounded diagnostics.
- If an engine run would create or alter tracked repository files, the spike
  records the behavior and the adapter uses an AgentBase-owned disposable or
  stable mirror; it must not silently mutate the selected repository.
- A deferred question remains suppressed until the maintainer removes or
  explicitly reopens its directive; automatic evidence-scoped resurfacing is
  deferred.
- Only ambiguity that affects an emitted concept, relationship or conclusion is
  required to become an open question.
- An injected process interruption between declared bundle-switch checkpoints
  is recovered from the exact manifest; cleanup never guesses from similarly
  named user directories. Sudden power-loss durability is not claimed.

## Constraints

- Preserve the Node.js 24, directly executed TypeScript and modular-monolith
  foundation.
- Parse and round-trip YAML through a reviewed library or constrained adapter;
  do not implement a fragile general YAML parser by hand. The adapter MUST use a
  safe schema, reject duplicate keys, bound aliases/resources and frontmatter
  size, and consume a bare `verified` mapping as a one-item event sequence.
- Keep the external process adapter provider-specific and all OKF policy in core
  or application capabilities.
- Do not read `.env`, credentials, cloud state or machine-global agent config.
- Do not require a clean worktree.
- Keep Codebase Memory outputs and local evidence/proposal state disposable and
  ignored by Git; the current `okf/` bundle is the shareable layer.
- Do not port legacy AgentBase modules or generalize a universal claim lifecycle
  before this loop demonstrates value.

## Out of scope

- A custom AgentBase downloader, native Codebase Memory installer/configuration,
  self-update command or reuse of global binaries. Distribution is delegated to
  the exact official npm dependency owned by AgentBase.
- MCP server registration, daemon reuse, watcher, continuous refresh or UI.
- AWS CLI, Terraform/Terragrunt plan or state access.
- Cross-repository, cross-account or cross-region relationships.
- Hub storage, GitHub publication, pull requests or remote review.
- General concept ontology or centrally registered type taxonomy.
- Per-claim confidence scoring, review ledger or complete stale/supersede state.
- Attested Computation execution or attester runtime.
- Deletion of protected or ambiguously owned concepts; concept rename or merge.
- Multi-language conformance or engine comparison.
- Fully automatic business-feature inference or semantic correctness gating.

## Assumptions

- AgentBase installation can run the exact dependency's checksum-verifying
  postinstall. If package installation was performed with scripts disabled, the
  managed wrapper may make one visible recovery attempt on first real use.
- The host coding agent can follow the repository-local OKF workflow and edit a
  proposed Markdown bundle; AgentBase orchestrates evidence, conformance, diff
  and apply rather than invoking the model itself.
- AgentBase concept types and extension fields are producer conventions layered
  on OKF's permissive base and are documented for round-trip preservation.
- Automatic evidence-triggered defer reopening is later hardening; MVP defer is
  durable until an explicit maintainer action.
- Timing results depend on machine and agent conditions, so the first benchmark
  establishes a baseline instead of claiming a universal speedup.
