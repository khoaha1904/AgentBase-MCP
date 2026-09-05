# 11.11 — Proposal semantic-impact requirements

> Status: G3-C2 and the G4-C5 Profile impact extension are implemented and
> verified. G5-C1 compact identity projection is implemented and verified.

> Release evidence: Required

Product Contracts:
[Knowledge lifecycle](../../product/03-knowledge-lifecycle.md) and
[Visualization](../../product/06-visualization.md).

Architecture Contracts:
[Group 3 derived evidence](../../architecture/state-and-trust.md#group-3-derived-evidence)
and [Group 3 usefulness-proof flow](../../architecture/flows.md#group-3-usefulness-proof-flow).

## Baseline and impact

Finalized proposals already retain the exact base, proposed bundle, byte-level
inspection and proposal/tree/diff digests. Inspect, Accept and pull-request
publication already consume that retained workspace. The gap is that reviewers
must still reconstruct concept, relation, Question, navigation and ownership
impact from changed files.

This is a **contained, medium-complexity change**. It adds one deterministic
projection to the existing inspection lifecycle and reuses the retained bytes,
OKF parsers, canonical relation validation and strong identity readers. The main
error risk is an incomplete or unstable semantic delta, so the projection is
digest-bound and rederived before Accept. It adds no MCP tool or input, Hub
schema, protocol era, database, source/provider access or content migration.

Profile 1.0 adds a second scope axis. A concept's physical `home` says where it
is maintained; an explicit structural relation says which Domain participates
in its meaning. Proposal review must show both without changing the established
meaning of affected semantic Domains.

## Requirements

- **AB-IMPACT-001** — Every newly finalized proposal MUST retain one versioned
  `semanticImpact` projection derived from its exact retained base and proposed
  bundle. The projection MUST bind proposal ID, mode, base commit, base and
  proposed tree digests, existing byte-diff digest and its own content digest.
- **AB-IMPACT-002** — Concept impact MUST deterministically group additions,
  updates and removals using canonical concept identity and retain before/after
  path, type and status where present. Display names, prose and path similarity
  MUST NOT establish identity or turn a move into an inferred update.
- **AB-IMPACT-003** — Accepted relation and Flow-step impact MUST be derived by
  the canonical OKF relationship validator and grouped as added, updated or
  removed. Direction, endpoints, predicate/action/mode/order and evidence MUST
  remain explicit; changed evidence on the same semantic edge is an update.
- **AB-IMPACT-004** — Question impact MUST separately expose added, updated and
  removed Question identity, state, kind, subject and property from the governed
  Question parser. It MUST NOT infer resolution, severity or an answer.
- **AB-IMPACT-005** — Navigation impact MUST report changed governed navigation
  documents and deterministic added/removed resolved Markdown-link edges. It
  MUST retain source and target paths and MUST NOT treat external URLs, anchors
  or image resources as Hub topology.
- **AB-IMPACT-006** — Affected Domain and Repository scope MUST use canonical
  concept identities and admitted strong Repository IDs. Scope is derived only
  from changed concepts, explicit proposal source identities and canonical
  structural relations touching that change; equal names, prose, directory
  placement and arbitrary graph proximity MUST NOT imply ownership or Domain
  participation.
- **AB-IMPACT-007** — Dangling-reference impact MUST distinguish introduced,
  retained and resolved invalid relationship/Flow endpoints or unsafe/broken
  internal Markdown links. A newly introduced hard dependency remains a
  Finalize failure; listing it does not make the proposal acceptable.
- **AB-IMPACT-008** — Duplicate candidates MUST be reported only when two
  canonical concepts claim the same validated strong Repository ID or external
  identity. They MUST distinguish introduced, retained and resolved candidates;
  names, titles, technology labels and prose similarity MUST NOT create one.
- **AB-IMPACT-009** — Every impact category MUST have deterministic ordering and
  a bound of 512 entries. Truncation MUST expose the category and exact omitted
  count; parse/validation warnings that prevent a complete projection MUST be
  explicit omissions rather than silently discarded evidence.
- **AB-IMPACT-010** — Inspect and Accept for a newly finalized proposal MUST
  rederive the projection from retained base/proposed bytes and fail visibly if
  proposal identity, byte-diff digest, tree digest, impact digest or stored
  projection differs. Failure MUST occur before Hub/Git mutation and preserve
  the proposal for review or regeneration.
- **AB-IMPACT-011** — Existing byte-diff digest semantics, proposal identity,
  atomic Accept and exact Git diff MUST remain authoritative. An already
  accepted legacy proposal without the versioned projection MAY still publish
  with the existing bounded `inspection unavailable` warning; a newly prepared
  proposal MUST NOT use that fallback.
- **AB-IMPACT-012** — Review and pull-request text MUST render a bounded subset
  of the retained semantic projection without inventing narrative, credentials
  or local paths. Any future HTML/diagram MUST consume the same projection and
  remain disposable presentation rather than Hub or acceptance authority.
- **AB-IMPACT-013** — Verification MUST cover deterministic repeatability,
  concept/relation/Flow/Question/navigation deltas, affected canonical scope,
  strong-identity duplicates, dangling-reference transitions, category bounds,
  tampered or stale inspection rejection, mutation-before-failure exclusion,
  ordinary publication rendering and accepted-legacy publication fallback.
- **AB-IMPACT-014** — Semantic impact MUST classify the exact retained base and
  proposed bundle through the shared Hub Profile classifier. It MUST retain both
  resulting profile kinds and fail before retaining impact when either bundle
  declares an unsupported Profile. Profile absence remains an explicit
  `legacy-unprofiled` result.
- **AB-IMPACT-015** — Every Profile concept delta MUST retain its classified
  physical home. A Domain home records the stable `domains/<slug>` selector and
  compact Domain identity backed by `domains/<slug>/index.md`; shared home
  remains explicit. The projection MUST NOT infer home from type, former type
  directory, relations or display names.
- **AB-IMPACT-016** — Affected physical homes MUST be a separate bounded,
  deterministic collection derived from the same changed concept/edge/Flow/
  Question subjects and admitted source Repositories used for affected scope,
  across both base and proposed state. `affected.domains` retains semantic
  Domain meaning; a home MUST NOT be copied into it as participation.
- **AB-IMPACT-017** — Publication review MUST label physical homes separately
  from affected semantic Domains and Repositories. Rendering remains a bounded
  view of retained impact and MUST NOT reclassify paths independently.
- **AB-IMPACT-018** — The extension MUST add no MCP tool or input, Hub content
  migration, sidecar home registry or new service. Legacy proposal impact keeps
  its established scope behavior; verification MUST cover Profile home-only,
  cross-Domain participation, shared home, invalid Profile rejection and legacy
  compatibility.
- **AB-IMPACT-019** — Compact Profile impact MUST classify Repository dossiers,
  type-neutral `knowledge/`, Questions and Domain index concepts through the
  shared compact classifier. Removal of prior activity logs is support-layout
  cleanup, not semantic concept removal. Generated Domain navigation blocks are
  navigation impact and MUST NOT change the Domain concept's semantic digest.
  Optional external review notes never become concept/navigation impact.

## Compatibility and recovery

No Hub content or installed-state migration is required. New proposal producers
write the projection before exposing the finalized proposal. If old prepared
work lacks it, the user regenerates/finalizes that proposal; no adapter guesses
semantic impact. Proposals already accepted by an older release retain their
current publication fallback because Git diff remains the authority.

The added Profile fields extend semantic-impact format `1`; its identity,
digest verification and accepted-legacy fallback do not change. A retained,
unaccepted proposal whose projection predates this extension is regenerated
under the existing recovery rule rather than silently upgraded.
