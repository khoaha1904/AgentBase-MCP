# State and trust boundaries

> Status: Accepted state and trust baseline; update when authority, persistence,
> credential or recovery boundaries change.

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
| Accepted Hub state and pending commits | user/team knowledge | yes through Git | governed |

Private state lives outside source checkouts where required, uses bounded exact
paths and never enters normalized evidence. Mutations use atomic state and exact
ownership. Failure preserves the previous admitted state and returns visible
recovery rather than silently changing authority.

## Local state partition

Application-local state is partitioned below one owner-private
`AGENTBASE_HOME`/`~/.agentbase` root:

| Path | Owner |
|---|---|
| `config/` | configuration and credentials |
| `hubs/` | durable Hub checkouts |
| `state/` | recoverable workflow state |
| `cache/` | rebuildable provider/query data |
| `tmp/` | disposable workspaces |

Storage behavior and compatibility belong to the
[Knowledge Entry Capability Contract](../capabilities/05-knowledge-entry/03-local-draft-storage.md).

## Trust boundaries

Source repositories are read-only from provider workflows. Credentials remain
owner-private and enter only the exact adapter/workflow that owns their use.
Normalized evidence must not contain secrets, absolute machine paths or private
provider records. Local knowledge work receives no ambient network, executable
or credential authority.
