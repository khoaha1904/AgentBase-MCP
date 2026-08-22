# Research: AgentBase-Hub CI

## Runner access

**Decision**: Checkout public `khoaha1904/AgentBase-MCP` at
`v0.1.0-rc.1`, install with scripts disabled and run its offline command.

**Rationale**: No second token and no validator copy in Hub. A missing tag fails
visibly. Release preparation owns creating the tag.

## Workflow permissions

**Decision**: `contents: read`, `pull_request` rather than
`pull_request_target`, pinned checkout/setup-node action SHAs, no artifact write.

**Rationale**: Fork PRs can validate without receiving a secret or write authority.

## Outputs

**Decision**: Write one Actions Summary containing integrity, warnings and
freshness. Do not commit `reports/` or upload an artifact in the MVP.

**Rationale**: Summary is enough to review and introduces no retention or write policy.

## Existing Hub

**Decision**: Dedicated fixed workflow-only branch and PR after explicit preview.

**Rationale**: CI setup is repository maintenance, not OKF knowledge and should
not fake a source Repository proposal.

