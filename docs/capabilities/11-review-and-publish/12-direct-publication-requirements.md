# Direct publication

> Status: G7-C1 application primitive implemented with isolated Git tests;
> configured CLI direct publication and per-Hub policy are implemented.
> MCP/skill public cutover and unified PR publication are implemented.
> Legacy production helpers are retired; candidate cleanup/recovery and
> owner-authorized old test-state disposal are implemented. Group 7 is closed
> for the current scope; `npm run verify` passes with 244/244 tests.
> Release evidence: Required

Product: [Knowledge lifecycle](../../product/03-knowledge-lifecycle.md).
Architecture: [State and trust](../../architecture/state-and-trust.md#group-7-direct-publication-boundary).

## Boundary and delivery

Review/Publish owns `publication/direct-publish.ts`, exposed through the Hub
application entrypoint. It reuses prepared proposals, verified semantic impact,
final mutation admission, profile locks and the Git adapter. Its configured
CLI entry resolves profile policy under activation ownership; the primitive
still requires explicit mode authorization and the reviewed digest. CLI and
MCP share the configured policy entry; skills stop at preview or explicitly
confirm Publish without an Accept transition. Historical helpers are excluded
from the release runtime. No migration or automatic disposal of owner work is
part of the publication workflow.

One proposal is one complete commit, including existing batch/enrichment
proposals. No automatic merge/rebase, AI critic, service or shared ledger is
introduced. Changed bases fail closed for renewed preparation/review. An
interruption while building a candidate permits retry only after exact ownership
validation; unknown state is preserved for operator recovery. Committed candidates
are pinned by private Git refs before their clean worktrees are removed. Small
receipts and refs remain for idempotent retry; no background garbage collector
or automatic removal of authoring bundles is introduced.

## Requirements

- **AB-PREPARED-PUBLISH-005** — New publication transactions MUST record exact
  profile/proposal/base/digest ownership before building a candidate. Retry MAY
  rebuild only its proven disposable candidate after an interrupted build;
  it MUST preserve the authoring bundle and refuse unknown/mismatched state.
  Once committed, pin the exact candidate in a private Git ref before removing
  its clean worktree. Cleanup failure MUST be visible and retryable without
  republishing or losing the receipt. Completed direct retries after later
  synchronization MUST recognize an ancestor already in local Published state.
- **AB-PREPARED-PUBLISH-006** — Production runtime actions and the Hub public
  application entrypoint MUST no longer import/export Accept or stacked submit
  behavior. Historical authoring tests MAY use an explicitly test-only adapter;
  it MUST NOT enter the release runtime dependency closure. One-time authorized
  test-state disposal MUST preserve Published checkouts/configuration and first
  exclude live transaction owners or registered candidate worktrees.

- **AB-PREPARED-PUBLISH-001** — Direct and PR policy MUST share exact proposal
  validation and isolated candidate construction. PR mode MUST push only a
  deterministic proposal branch and open/reuse one matching PR against the
  configured target. It MUST NOT call Accept, advance local main/Published,
  stack PRs or merge. Changed target/base or foreign branch/PR content MUST
  stop for new review; no force push or automatic reconciliation is allowed.
- **AB-PREPARED-PUBLISH-002** — Retried PR publication MUST inspect the exact branch
  and open/all PR history before writing. Lost branch/PR acknowledgements MUST
  preserve the candidate and report an unknown outcome; retries MUST reuse an
  exact open PR rather than duplicate it. Closed PRs MUST NOT be recreated
  automatically. PR text MUST bind scope, exact base/diff, changes and
  uncertainty to verified inspection without inventing semantic claims.
- **AB-PREPARED-PUBLISH-003** — MCP MUST expose `publish_hub_okf_proposal` with exact
  `proposal_id`, `proposal_digest` and confirmed `publication_mode: direct|pr`.
  CLI MUST accept the same modes. Both MUST reject policy mismatch. Remove
  `accept_hub_okf_proposal`, `list_pending_hub_okf`, `submit_hub_okf_proposals`
  and hidden CLI Accept/pending/submit routes; no compatibility alias remains.
  An exact `in-review` PR outcome is successful submission, not Published.
  Unknown/split outcomes MUST remain visible as errors with structured details.
- **AB-PREPARED-PUBLISH-004** — Shipped workflow skills MUST end authoring at preview
  and require one explicit Publish confirmation before sharing. They MUST NOT
  require Accept or Local Draft management. Existing explicit-only invocation
  policy remains unchanged. Freeze the revised owned surface at 44 tools
  (three legacy tools removed, one Publish added), with protocol tests proving
  old actions unavailable and the new action correctly dispatched/annotated.

Accept and stacked-publication implementations are test-only fixtures, excluded
from the release artifact. Shared Git/Published inspection and Sync owners remain
where the new workflow needs them; no legacy public workflow is exposed.

- **AB-DIRECT-007** — Remote Hub profiles MAY persist `publicationPolicy` as
  `direct` or `pr`; invalid values MUST fail. An unset policy resolves to the
  approved `direct` default for the new workflow. `abs hub policy` MUST report
  exact active Hub identity and effective policy; `abs hub policy --mode
  direct|pr` MUST update only that active profile under the activation lock.
  Neither action accesses credentials, publishes or discards work. Status MUST
  expose effective policy and the available Direct/PR modes.
- **AB-DIRECT-008** — `abs hub publish --proposal <id> --digest <digest>
  --mode direct|pr` MUST bind explicit confirmation to the selected policy and
  delegate to the direct primitive through the configured Hub application
  boundary. Hold activation ownership while resolving/using that profile,
  preventing a concurrent policy/switch change. A policy mismatch MUST block
  publication, never fall back to another mode or call Accept. Unknown remote or incomplete local recognition
  MUST return a nonzero CLI exit with the structured split outcome.

CLI and MCP use the same policy-bound Publish. The legacy public Accept,
pending and submit actions are removed. Historical authoring tests retain
test-only helpers, not user-callable compatibility routes.

- **AB-DIRECT-001** — Direct publication MUST require explicit direct
  authorization, exact Hub identity, a prepared proposal and the confirmed diff
  digest. Reverify retained inspection and Profile integrity before any push.
  Tampered content or inapplicable inspection MUST NOT be published.
- **AB-DIRECT-002** — The primitive MUST use the profile mutation lock and
  require a clean local `main` at the reviewed Published base for a new
  transaction. Existing accepted work MUST remain untouched and block the new
  path. A candidate MUST have that exact parent and the complete reviewed tree;
  building it MUST NOT advance local main or Published.
- **AB-DIRECT-003** — Before push, retain a versioned receipt bound to the
  profile, proposal, base, diff, tree and exact candidate commit. Publish only
  that commit using the configured canonical remote and target branch, without
  force. A changed remote or concurrent writer MUST NOT be overwritten. No
  policy fallback, branch-protection bypass or PR merge is authorized.
- **AB-DIRECT-004** — Retry MUST inspect target ancestry before another push.
  An already published candidate, including one followed by other commits,
  MUST NOT produce a duplicate. Unverifiable network outcomes MUST remain
  explicitly unknown with the same recoverable candidate, not false success.
- **AB-DIRECT-005** — Confirmed remote success MUST fast-forward a clean local
  main and advance the exact Published ref without a second routine sync.
  Failed local recognition MUST report remote success separately and retain
  retry state. Recognition MUST NOT overwrite a dirty checkout, unexpected
  local head or unrelated Published boundary.
- **AB-DIRECT-006** — Tests MUST exercise actual isolated Git repositories for
  success, exact tree/parent, refusal before mutation, remote races/rejection,
  lost push acknowledgement, duplicate-free retries and split-outcome recovery.
  They MUST NOT access a configured user Hub or require a provider token.

## Verification and compatibility

Adjacent requirement-linked tests plus the repository gate qualify this slice.
Historical PR tests use release-excluded fixtures. The MCP surface
has 44 owned tools; CLI and MCP share policy-bound Direct/PR Publish.
A receipt is private recovery metadata, never Hub content or proof of
semantic completeness. Git history is preserved; content correction requires a
new reviewed proposal, never a target reset.

The Initial Ingest integration fixture now publishes through the configured
Direct entry into an isolated bare Git remote, followed by five Delta/Coverage
Refresh publications. Each requires exact reviewed content and recognizes
Published without Accept; a final unconfirmed preview stays private with zero
local draft commits. This is deterministic lifecycle evidence, not a new
real-model quality or live GitHub qualification claim.
