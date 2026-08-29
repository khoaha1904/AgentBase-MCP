# 06.02 — External resource identity and matching

> Status: Provider-neutral envelope and AWS/SQS validation are implemented;
> other providers are deferred.

## Short decision

A concept keeps a provider-neutral role. Platform-issued real identity is stored
as optional external-identity metadata; a Terraform address is source evidence,
not a claimed deployed identity.

```text
Concept: Interface / Function / Component / Resource
External identity: AWS ARN, Azure resource ID, ...
Source declaration: repository path + Terraform address/evidence
```

These three layers do not replace one another. AWS metadata does not create a
separate `SQS`, `EC2` or `Lambda` schema.

## Portable envelope

External identities belong to a concept at `agentbase.external_identities[]`. The
common contract is:

| Field | Meaning |
|---|---|
| `provider` | Provider namespace, for example `aws`, `azure`, `gcp`. |
| `identity_type` | Native locator type understood by a provider profile, for example `arn`. |
| `value` | Exact normalized provider-issued identity. |
| `service` | Provider service; technology metadata only. |
| `resource_type` | Provider-native resource type, not Concept Schema. |
| `scope` | Bounded string metadata needed for identification, for example account/region. |
| `evidence` | Non-empty source IDs proving this identity. |
| `observed_at` | Observation time when source is provider runtime. |

Example illustrates shape, not an AWS-specific schema:

```yaml
agentbase:
  external_identities:
    - provider: aws
      identity_type: arn
      value: arn:aws:sqs:ap-southeast-1:123456789012:vehicle-events
      service: sqs
      resource_type: queue
      scope:
        account_id: "123456789012"
        region: ap-southeast-1
      evidence: [aws-queue-observation]
      observed_at: 2026-08-22T08:00:00Z
```

Core owns the bounded envelope, provenance and duplicate safety. A provider
profile owns parsing, normalization, required scope keys and consistency between
`value` and `scope`. Unknown provider identities remain readable but AgentBase
does not use them to auto-match without a released profile.

## Matching key

- For a globally unique native ID such as an exact ARN, the key is normalized
  `provider + identity_type + value`; parsed scope must match metadata.
- For a provider ID unique only in a scope, the key also includes every scope
  field required by the released provider profile.
- Two entries with the same strong key are a strong identity-match candidate,
  not an instruction to auto-merge concepts.
- Equal display name, variable name, endpoint label or resource name without
  complete scope is not a strong key.
- Do not auto-match deployments in different providers merely because role or
  name is equal.

A strong identity match answers only “same resource.” A canonical relation still
needs interaction evidence under 06.01. Two Published concepts with the same
strong key create a Question/merge candidate; MVP does not merge or redirect and
the validator does not silently select a winner.

## Account and region

Account/project/subscription and region/location are not secrets. Store them
when needed for identity, review and bounded provider lookup.

Scope precedence:

1. parse from provider-native identity;
2. exact IaC/provider configuration with evidence;
3. owner-confirmed Domain Enrichment input;
4. bounded provider observation.

A CLI default profile/region is separate and not knowledge truth. If a resource
type needs region but the candidate lacks it, verification returns an unresolved
Question rather than trying several regions. A global provider resource uses an
explicit profile rule; do not arbitrarily assign a default region.

## Undeployed IaC resource

A Terraform/Terragrunt resource without a provider-issued ID may still create a
concept from code when it passes concept qualification. It retains:

- normal `repository://` source references;
- source-native address or module/input/output chain in candidate evidence;
- provider/service/resource-type technology metadata when proven by detector.

It has no `external_identities` entry until native identity is observed. Domain
Enrichment may add identity later through a proposal without changing concept ID
or schema.

## Multiple identities on one concept

One concept may have multiple entries when it represents a logical capability
with multiple deployments, regions or provider-native aliases. Every entry needs
its own evidence. Old entries that are no longer true are not kept as current
aliases; correction/history belongs to 06.05 and Git history.

Section 06.06 decides when multiple deployments remain one concept. External
identity does not decide concept granularity automatically.

## Security and limits

- Allow provider resource IDs, account/project/subscription IDs, regions and
  non-sensitive resource names that Hub readers may access.
- Do not store credentials, tokens, signed URLs, connection strings or provider
  response dumps.
- Reject secret-like identity values at the trust boundary.
- Provider lookup targets only the exact candidate; metadata does not grant scan
  authority.

## Baseline impact

The AWS/SQS slice implements portable metadata validation, provider
normalization and Hub-wide duplicate rejection without adding a database,
Concept Schema or mandatory migration. Duplicate Published-concept merge/redirect
remains post-MVP.
