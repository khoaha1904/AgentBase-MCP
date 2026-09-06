# Runtime boundaries

> Status: Accepted and implemented runtime composition baseline and Group 1
> trusted-enterprise extension design. Group 2 release/operations architecture
> is implemented across release assembly, local application lifecycle,
> client/skill integration, CI qualification and local/Git concurrency. Group 3
> usefulness-proof composition is owner-approved; G3-C1 freshness and G3-C2
> proposal impact are implemented. G3-C3 real-model usefulness qualification is
> deferred and is not a current release gate. Group 4 Domain Capsule/Profile,
> migration and final mutation-admission composition is implemented and
> verified; Group 4 is closed for the current internal enterprise release.
> G5-C1 compact-layout composition is implemented and verified; G5-C2
> semantic-quality composition is deferred and inactive.

| Boundary | Architecture ownership | Capability Contract |
|---|---|---|
| MCP composition and wire protocol | `app/codebase-memory-mcp` registers business tools; protocol adapters own version and transport negotiation | [MCP protocol](../capabilities/12-version-scope/09-mcp-protocol-requirements.md) and [Code Graph runtime](../capabilities/01-repository-reading/05-runtime-requirements.md) |
| Code Intelligence | `core/code-intelligence` owns neutral values; provider adapters own engine lifecycle and translation | [Repository Reading](../capabilities/01-repository-reading/README.md) |
| Knowledge authoring | `core/knowledge` owns portable documents and policy; `app/repository-okf` composes repository evidence | [Knowledge Entry](../capabilities/05-knowledge-entry/README.md) and [Ingest/Refresh](../capabilities/09-ingest-and-refresh/README.md) |
| Hub governance and publication | `core/hub` owns identity/transitions; `app/hub-okf` owns local workflows; `providers/github-hub` owns transport | [Review and Publish](../capabilities/11-review-and-publish/README.md) |
| Provider enrichment | provider adapters own bounded observations; `app/hub-okf/enrichment` owns reconciliation | [Cross-repository Relations](../capabilities/06-cross-repository-relations/README.md) |
| Query and visualization | `core/knowledge/query` owns accepted reads; application projections remain derived and commit-bound | [Query Routing](../capabilities/10-query-routing/README.md) and [Visualization](../capabilities/13-visualization/README.md) |
| CLI, installation and local storage | `src/cli.ts` dispatches; application owners and installation scripts own transactions | [Version Scope](../capabilities/12-version-scope/README.md) |
| Benchmark and AI-SDLC qualification | scripts own isolated measurement; production runtime contains no model execution authority | [Benchmark](../capabilities/12-version-scope/03-benchmark-requirements.md) and [AI-SDLC Context](../capabilities/14-ai-sdlc-context/README.md) |

The high-level MCP server factory owns tool registration. Low-level protocol
adapters own wire versions and transport negotiation. Business capabilities do
not import transport internals, and transport adapters do not acquire product
authority.

Provider credentials and network access stay behind their owning adapters.
Reusable adapters do not themselves choose a deployment policy or open a
production service.

Group 7 provides `publishHubProposalDirect` at the existing Hub
application entrypoint. Direct and PR policy share Git transport and proposal
admission; the primitive never changes installed configuration.
The configured entry exposes it through explicit CLI direct publication
and profile-local policy selection. The configuration activation lock spans
policy resolution and publication; the primitive retains the nested profile
mutation lock. Neither boundary may acquire these locks in reverse order.
MCP/skill public cutover and unified PR publication are implemented. No runtime service
is introduced.
The approved cutover removes legacy Accept/Local Draft routes without a
pending-work migration adapter; old test state is discarded separately from
Published data. Optional PR mode uses the replacement workflow.
Accept and stacked submit no longer belong to runtime actions or the public
application entrypoint. Historical implementations live in test-support paths
excluded from the release artifact.

Group 1 standardizes three composition seams rather than a full authorization
framework:

- the source boundary resolves a selected path to an exact Git root and source
  state;
- remote adapters obtain credentials through a credential provider rather than
  embedding secret ownership in knowledge workflows; and
- the high-level MCP server factory applies one capability policy before tools
  are registered for a transport.

The trusted-enterprise policy exposes the normal AgentBase tool set and relies
on process and enterprise identity access. Every advertised action still carries
truthful read-only/destructive/idempotence metadata, and every transport must
preserve core workflow state transitions. A future hardened/public deployment
may replace or wrap these seams with authenticated restrictions; it must not
fork the knowledge model or lifecycle. The default HTTP adapter is supported
only inside the trusted enterprise boundary.

## Group 2 release composition

One immutable release archive is built for each supported platform. It contains
the bundled CLI/MCP application, production dependencies, product skills,
native Code Graph provider and static assets. Node.js remains the only external
runtime prerequisite; ordinary installation does not run `npm ci`, compile
native source or depend on a mutable checkout.

The installed runtime has three layers:

1. `AGENTBASE_HOME/bin/abs` is the stable launcher used by MCP client entries
   and the user-facing command link.
2. `AGENTBASE_HOME/runtime/releases/<version>-<platform>/` contains immutable
   release payloads.
3. Atomic `current` and `previous` pointers select the active and retained
   rollback releases.

The launcher resolves ordinary CLI/MCP requests through `current`. Upgrade,
rollback and uninstall are routed through an installation control path outside
the selected application release so a broken `current` payload cannot remove
recovery authority. The normal command link at `~/.local/bin/abs` targets the
stable launcher; MCP clients register the stable launcher directly and do not
depend on `PATH`.

Initial installation uses the exact release archive's `install.sh`. Subsequent
`abs upgrade --bundle <file>` consumes an explicitly supplied local archive;
automatic release discovery and downloading are not runtime responsibilities.
This keeps release distribution replaceable by a future private-GitHub or
company-artifact adapter without changing installation transactions.

Repository CI owns pull-request verification. Release CI builds and qualifies
each platform archive from one versioned source commit and emits its manifest,
SHA-256 checksums and SBOM. Signing or attestation may wrap that boundary for a
future hardened/public profile but is not part of the trusted-enterprise
runtime. The current workflow admits only `linux-x64`, records deterministic
gate results in the manifest and retains the archive plus adjacent checksum;
additional platform jobs wait for their reviewed native artifacts.

Revalidation against Product Groups 3 and 4 adds release compatibility metadata
without moving knowledge authority into installation. The manifest declares the
AgentBase OKF profiles the application can read and author, its local-state
schema, MCP eras and any qualified product/scale claims. An upgrade may reject
an incompatible active state before cutover, but it never rewrites Hub
documents. OKF profile/path migration—including the later Domain Capsule
cutover—remains a separately reviewed knowledge workflow.

## Group 3 usefulness-proof composition

Group 3 adds no daemon, model runtime, durable context store or second review
database. It composes three existing boundaries:

1. Published query/context derives one machine-readable freshness envelope from
   the exact Published commit and the Repository observations actually used by
   the response. An explicitly authorized source workflow may add a comparable
   current-source receipt; Hub query never initiates that access.
2. Proposal review derives one semantic impact projection from the exact
   finalized proposal and admitted base. Text and any optional visualization
   render the same projection; Git diff and the exact Publish confirmation digest remain
   the review authorities.
3. Qualification runners in this repository execute pinned cases, while the
   sibling AgentBase-Benchmark repository owns source registrations, semantic
   expectations, immutable results and owner dispositions. Generated Domain
   sites remain presentation output only.

The real-model qualification pass is deferred and is not part of ordinary
runtime, deterministic verification or the current internal enterprise release
gate. When resumed, it first measures the current lexical profile; retrieval
code changes only after a versioned case exposes a decision-relevant failure,
and the smallest bounded correction reruns the same case. Group 4 Domain Capsule
compatibility is preserved by carrying canonical Domain, Repository and concept
identities in these projections; current Markdown paths are evidence locations,
not new identity keys.

## Group 4 Profile and Domain Capsule composition

The OKF loader classifies each exact commit as Profile 1.0,
`legacy-unprofiled` or `unsupported`. Profile 1.0 validation uses the same
bundle parser and requires the well-known valid OKF profile concept plus
Domain-Capsule paths. Generic base-OKF parsing remains available for explicit
legacy reads and loss-aware migration; mutation paths require an admitted
authoring profile.

MCP transport eras and existing tool names do not change; G4-C7 adds two
explicit migration tools. `domains/<slug>` remains the external Domain selector
and the compact pre-release revision makes it the exact Domain identity. The
implemented development mapping through `domain.md` is superseded. Profile 1.0
authoring adds a grouped home plan and broadens proposal subject paths; released
skills migrate in the same application transaction. Compatibility aliases may
accept the former `confirmed_domain` shape while preparing a Domain-default
plan, but a missing explicit `shared` confirmation never becomes an inferred
home. Returned concept identities and paths use Profile 1.0 directly.

New Hub bootstrap publishes the base OKF index, Profile 1.0 concept, shared
index and Hub CI as one baseline. G4-C2 switches that default together with its
grouped-home Initial Ingest path, so the runtime does not create a
Profile-shaped but unauthorable Hub.

Query and visualization derive one commit-bound projection with distinct
`home`, `participant` and `boundary` roles. Home comes from the path;
participation comes only from accepted relations; boundary comes from existing
bounded relation/Flow expansion. Proposal semantic impact consumes the same
classification when paths or Domain participation change.

The G4 development baseline proved exact `agentbase-okf@1.0` read/author paths,
migration and deterministic fixtures. G5-C1 replaces its layout and compact
end-to-end verification now permits the author declaration. Manifests continue
declaring `qualified_scale: null`; no model or capacity benchmark runs as part
of release qualification.

## Group 5 compact authoring composition

Profile 1.0 is corrected before its first supported release. The shared Profile
declaration remains the compatibility source, while the parser, bootstrap,
authoring, mutation admission, CI, query and visualization all switch together
to the compact grammar. Qualification Hub data is reset/re-ingested instead of
adding a migration adapter for the discarded development layout. Release
metadata must not declare compact Profile 1.0 author compatibility until this
complete path is verified.

The production MCP remains model-provider-neutral and does not call a model
API. Authoring reuses the implemented deterministic Discovery Receipt,
coverage, source, evidence, OKF and Profile checks before Finalize; Inspect and
explicit Publish remain the material-change review and sharing boundaries. Optional external AI
review can advise draft edits but creates no packet/report API, persisted state,
automatic repair, override, Batch gate or release dependency.
