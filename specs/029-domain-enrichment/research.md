# Research: Domain Enrichment

## Minimum provider slice

**Decision**: Release AWS caller-identity and exact SQS queue verification only.

**Rationale**: One queue shared by crawler/consumer repositories proves the
complete cross-repository identity and relation flow. Adding Lambda, SNS, EC2 or
a generic operation registry before a fixture needs them creates unsupported
surface and more secret-filtering risk.

**Alternatives considered**: A generic AWS command runner; release many common
services; provider-free enrichment. The first is unsafe, the second speculative,
and the third cannot verify hidden queue identities that motivated this feature.

## AWS authority and executable

**Decision**: The user establishes AWS CLI login outside MCP. The adapter invokes
the fixed command name `aws` with fixed argv and inherited process environment,
without reading environment values or accepting a path/profile from tool input.

**Rationale**: AWS CLI's normal credential chain remains user-owned. A fixed
binary/argv with `shell:false`, account preflight and no debug output is bounded
without turning MCP into a login or credential broker.

**Alternatives considered**: Access keys in tool input, credential-file parsing,
arbitrary executable path or an SDK dependency. All expand credential authority;
the SDK also adds a dependency while still requiring the same user session.

## Exact SQS verification

**Decision**: For a known queue candidate, use confirmed queue name, owner and
region to obtain its exact URL, then read allowlisted attributes including ARN.

**Rationale**: SQS attribute reads require a queue URL. `get-queue-url` is an
exact server-side lookup when name and owner are supplied and does not enumerate
the account. The returned ARN supplies the strong identity key.

**Alternatives considered**: List queues, resource/tag search, derive URL
locally or treat Terraform address/name as deployed identity. These enumerate,
can be partition/endpoint-sensitive or confuse source declaration with runtime
identity.

## Proposal scope

**Decision**: Add a discriminated Domain Enrichment proposal scope rather than
placing multiple repositories behind one fake `sourceRepositoryId`.

**Rationale**: Review, commit reconstruction and publication need the exact
Domain/repository membership. Existing Init/Refresh semantics must remain intact.

**Alternatives considered**: One proposal per repository, batch publication of
ordinary Refresh proposals or a synthetic Repository concept. All lose atomic
cross-repository meaning or misrepresent authority.

## Checkpoint and retry model

**Decision**: Persist a bounded private manifest plus per-candidate normalized
outcome/digest. Run sequentially; retry only through an explicit call.

**Rationale**: An external CLI may fail mid-run. Atomic files allow exact retry
without publishing partial state or adding a service/database. Sequential work
avoids provider concurrency and reconciliation conflicts.

**Alternatives considered**: No checkpoints, parallel calls, hidden automatic
retry or a durable job service. They either repeat successful calls, complicate
authority or overbuild a local workflow.

## Duplicate concepts

**Decision**: Emit a reviewed duplicate candidate/Question, not a merge redirect.

**Rationale**: Same ARN proves deployed-resource identity, not compatible
concept meaning, granularity or canonical path. Actual merge changes query and
history behavior and deserves its own capability.

**Alternatives considered**: Auto-merge exact ARN matches or implement Part
06.05 now. Both make the provider slice materially broader and risk destructive
semantic reconciliation.

## Qualification boundary

**Decision**: Fake-provider E2E is the implementation gate; real AWS smoke and
model-backed quality qualification are separate owner-authorized checkpoints.

**Rationale**: The canonical gate must stay offline and deterministic. Real
provider authority and model variance should not mask contract defects.

**Alternatives considered**: Real AWS in `npm run verify` or immediate model
benchmark. Both make the development gate credential/network dependent.
