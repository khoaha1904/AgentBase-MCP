# State and trust boundaries

> Status: Accepted and implemented state/trust baseline. Group 1 uses a
> trusted-enterprise default with stable extension boundaries. Group 2 release
> lifecycle, integration, CI qualification and exact profile-scoped writer
> concurrency are implemented. Group 3 derived evidence boundaries are
> owner-approved; G3-C1 freshness and G3-C2 proposal impact are implemented,
> while G3-C3 real-model usefulness qualification is deferred and is not a
> current release gate. Group 4 Profile, home, migration and final mutation
> admission boundaries are implemented and verified; Group 4 is closed for the
> current internal enterprise release. G5-C1 compact-layout state boundaries
> are implemented and verified; G5-C2 semantic-quality
> state is deferred and inactive.
> Group 6 bounded Refresh convergence and frozen owned release surface are
> implemented and verified.

## Authority flow

```text
read-only source repository
        ↓
private provider/cache state
        ↓
normalized provenance-bearing evidence
        ↓
local proposal/recovery workspace
        ↓ explicit review and acceptance
shared Git-backed Hub knowledge
```

| State | Scope | Shared | Rebuildable |
|---|---|---:|---:|
| Detailed graph and provider cache | machine/repository | no | yes |
| Freshness receipt | machine/repository/provider | no | yes |
| Observation/evidence bundle | source revision | no in current product | yes |
| Unaccepted proposal workspace | local transaction | no | yes from reviewed input |
| Derived Question/query projection | exact local Hub commit | no | yes from shared documents |
| Context freshness envelope | one response/exact Published commit | no | yes from Published observations and optional authorized source receipt |
| Proposal semantic impact projection | one finalized proposal/exact admitted base | no | yes while that proposal and base are retained |
| Semantic coverage and AI quality report | one authoring attempt/exact source, Receipt and draft digest | no | yes while that attempt is repairable or reviewable |
| Repository Refresh coverage debt | canonical Repository/current bounded recovery state | yes through reviewed Git | governed; cleared by a clean explicit Coverage confirmation |
| Accepted Hub state and pending commits | user/team knowledge | yes through Git | governed |
| Qualification result and owner disposition | pinned Benchmark case/run | yes in AgentBase-Benchmark | no; append-only evidence |

Private state lives outside source checkouts where required, uses bounded exact
paths and never enters normalized evidence. Mutations use atomic state and exact
ownership. Failure preserves the previous admitted state and returns visible
recovery rather than silently changing authority.

Refresh coverage debt is not a second freshness database or run history. It is
a bounded extension of the canonical Repository metadata containing only
partial status, omitted count, current-campaign pass count, limitations and
observation time. Delta preserves older debt. Coverage removes it only when a
non-partial pass adds no knowledge; after three non-converged passes the debt
remains visible for owner review rather than becoming run history.

## Local state partition

Application-local state is partitioned below one owner-private
`AGENTBASE_HOME`/`~/.agentbase` root:

| Path | Owner |
|---|---|
| `bin/` | stable application launcher and release recovery control |
| `runtime/` | immutable application releases and atomic selection pointers |
| `config/` | configuration and credentials |
| `hubs/` | durable Hub checkouts |
| `state/` | recoverable workflow state |
| `cache/` | rebuildable provider/query data |
| `tmp/` | disposable workspaces |

Storage behavior and compatibility belong to the
[Knowledge Entry Capability Contract](../capabilities/05-knowledge-entry/03-local-draft-storage.md).

## Trust boundaries

Source repositories are read-only from provider workflows. Credentials remain
outside normalized evidence and enter only the adapter that performs the remote
operation. Normalized evidence must not contain secrets, absolute machine paths
or private provider records.

## Group 1 extension boundaries

The default deployment trusts the operator's process access and configured
enterprise identities. Architecture keeps three small boundaries so stricter
deployment policy can be added later without entering the knowledge core:

| Boundary | Trusted-enterprise behavior | Future extension |
|---|---|---|
| Source resolver | Resolve any selected readable path to its exact Git root and pin source state for the workflow | Restrict roots, repositories or source classes |
| Credential provider | Resolve credentials through the configured enterprise or local provider for the exact remote operation | Add managed identity, Vault or narrower target policy |
| Capability policy | Make normal AgentBase workflows available within the trusted deployment | Filter tools/actions using authenticated deployment context |

These boundaries do not replace lifecycle invariants. Finalize, Accept, Publish,
external merge and Sync remain distinct correctness transitions in every
deployment profile. The trusted profile adds no persistent source admission,
separate capability activation or per-action security ticket.

## Group 2 installation state

Application bytes and owner data share one private root but have independent
lifecycle ownership. `bin/` and `runtime/` are application-managed and may be
removed by uninstall. `config/`, `hubs/` and `state/` are durable owner data and
are preserved by default. `cache/` and `tmp/` remain rebuildable/disposable.

One installation lock below `runtime/` serializes install, upgrade, rollback
and uninstall for the selected `AGENTBASE_HOME`. Staging uses `tmp/`; durable
phase receipts use `state/installation/`. A transaction preflights all release,
launcher, skill and selected-client targets before mutation, stages and verifies
the new state, and changes the active release pointer only at its commit point.
Failure or interrupted recovery restores the exact previous pointer and only
installer-owned integration bytes.

Each successful upgrade retains exactly the active and immediately previous
release payloads. Rollback restores the previous payload and its released skill
set as one transaction. Uninstall removes only exact installer-owned launcher,
runtime, skills and client entries; conflicting or subsequently changed state
is reported and preserved rather than overwritten.

Installation reads Hub/profile metadata only for compatibility preflight. It
does not acquire knowledge migration authority, edit a Hub checkout or delete
Draft/Published state. Consequently a future OKF layout migration cannot make
an application rollback silently become a knowledge rollback; both operations
retain separate previews, receipts and owner decisions.

## Group 2 workflow concurrency

Hub mutation locks are scoped by exact local Hub profile. At most one process
may create an admitted Maintainer-answer proposal, accept, publish,
synchronize, initialize, bootstrap or recover that profile at a time; read-only
projection remains commit-bound. Prepared authoring, Batch and Enrichment
workspaces are isolated candidates rather than admitted profile state, so they
may coexist but every transition rechecks its exact base and digest. Stale-lock
recovery must prove the recorded local process is no longer live before taking
ownership, and the old global lock remains a compatibility exclusion boundary
during upgrade.

There is no cross-machine lock. Separate users produce ordinary Git branches
and pull requests. Synchronization compares exact remote ancestry and either
rebases/revalidates pending work or returns a visible conflict requiring human
resolution and re-review. Git and the hosting provider are the only shared
coordination boundary; AgentBase introduces no central server or distributed
lock service.

## Group 3 derived evidence

The freshness envelope is verification metadata, not Hub truth. It contains the
exact Published commit, evaluation time and one bounded entry for every relied-
upon Repository observation: canonical Repository identity, observed revision
and time when available, whether current source was verified, and a bounded
reason. Status is deterministic:

- `stale` when any comparable, explicitly verified current revision differs;
- `fresh` only when every relied-upon observation is comparable, explicitly
  verified and equal; and
- `unknown` otherwise, including Published-only use, missing observations or
  unavailable source.

Age remains visible metadata but never changes status by threshold. `stale` and
`unknown` warn only: they do not hide knowledge, rank claims, start Refresh or
grant source access.

Proposal impact is retained inside the existing owner-private proposal
workspace only while review, publication or recovery needs that proposal. It
records exact base/proposal identities and digests plus derived concept,
relation, Question, navigation, Domain and Repository impact, dangling
references, duplicate candidates and explicit omissions. A rendered HTML or
diagram is disposable after review. Neither form enters the Hub, Git branch or
Published visualization authority; the pull request may contain only a bounded
text rendering tied to the exact inspection.

The deferred stewardship measurement creates no production telemetry ledger.
Pinned Benchmark results may later record bounded operator-supplied preparation,
review, publish and Refresh effort alongside outcomes derivable from
proposal/Git evidence. Only AgentBase-Benchmark retains an immutable run and
owner disposition; Product and Capability documents summarize the current
accepted boundary without copying result authority. No such run is required by
the current internal enterprise release.

## Group 4 Hub profile and home state

Profile identity is Published Hub state at the well-known
`shared/agentbase-profile.md` concept. It pins OKF `0.2`, Profile `1.0`, the
Domain Capsule layout and admitted AgentBase extension families. Root
`index.md` retains only base `okf_version`. No local configuration, release
receipt or cache may override the profile declared by the exact Published
commit.

Every Profile 1.0 concept path deterministically yields exactly one physical
home: `domains/<slug>/` or `shared/`. The implemented development layout maps
the Domain selector to a separate `domain.md`; the accepted compact target
instead makes the capsule `index.md` the exact `domains/<slug>` Domain identity.
Physical home controls stewardship and default navigation. Semantic Domain
participation remains an evidenced relation, so moving a file cannot silently
add or remove participation.

A grouped Initial Ingest home plan is owner-confirmed proposal input. It contains
one Repository default and bounded candidate exceptions; it is retained only in
the existing proposal/session state until the resulting paths are reviewed.
There is no permanent home-plan ledger. Accepted paths and relations become the
only shared result.

Profile absence classifies a Hub as `legacy-unprofiled`; an unknown or malformed
declaration is `unsupported`, never silently treated as Profile 1.0. Legacy
knowledge may be read with an explicit limitation but cannot receive new
Profile 1.0 authoring. Migration records an owner/agent-authored exact move map
and rewritten full tree from a Published commit, retains both as an ordinary
proposal and uses that commit as the rollback point. Application rollback
changes no Hub bytes.

## Group 5 compact Hub state

The compact pre-release revision keeps Profile identity at
`shared/agentbase-profile.md` but changes its declared layout. A Domain concept
and selector share identity `domains/<slug>` through that capsule's `index.md`;
Repository dossiers use `repositories/`, all other standalone semantic roles use
`knowledge/`, and Questions use `questions/`. Type remains frontmatter state and
does not create a directory. AgentBase-authored `log.md` is not admitted to a
compact Profile Hub.

Git commits and pull requests are the durable shared activity history. Existing
Discovery Receipts and proposal artifacts remain below private `state/` under
their implemented session/proposal lifecycle. The deferred semantic-quality
design adds no quality packet, reviewer report, draft probe, repair record or
owner-override state to the current release. Optional operator AI review notes
are external advice and never Hub or proposal authority.
