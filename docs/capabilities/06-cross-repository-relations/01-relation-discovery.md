# 06.01 — Relation discovery

> Status: Canonical relation/candidate boundary and bounded AWS/SQS Domain
> Enrichment are implemented; broader inference is deferred.

## Short decision

The Agent records a canonical relation only when it identifies both endpoints
and has interaction evidence. Reasonable but insufficient signals stay as a
relation candidate with a Question; unsupported inference is discarded.

An endpoint may be a `Resource` node (for example shared SQS/SNS) only after
node eligibility proves stable identity and independent query/link value. A
queue/topic declaration does not automatically authorize a node; a transport
Resource and message/event `Interface` are not combined into one endpoint.

```text
sufficient endpoint identity + interaction evidence → canonical relation
evidence exists but either is missing                → candidate + Question
inference only                                       → do not store
```

Do not create placeholder concepts or dangling edges merely to make the graph
look complete.

## Two independent evidence layers

### 1. Endpoint identity

Identity answers: **are two sources referring to the same endpoint/resource?**

From strongest to weakest:

1. exact provider identity, for example an AWS ARN;
2. provider resource ID with required scope such as account, region and service;
3. deterministic source chain such as Terraform module input/output,
   remote-state output or exact deploy reference;
4. endpoint/config reference that can be verified further;
5. display name, variable name or standalone resource name.

The first three groups can support a strong match when scopes do not conflict.
The last two create candidates only. Exact portable external-identity rules are
in `02-resource-identity-matching.md`.

### 2. Interaction evidence

Interaction answers: **what does source do with the target?** For example,
`publishes-to`, `consumes`, `depends-on` or `reads-from`.

Evidence may come from code, Terraform/Terragrunt, repository documentation,
configuration or a bounded provider observation. An ARN confirms an endpoint;
it does not prove that a Lambda publishes, a Service consumes or two APIs call
each other.

A canonical relation needs source IDs owned by the concept that owns the edge,
as required by the current validator. A source that describes identity only
cannot infer a predicate.

## Ingest behavior

Initial Ingest and Refresh investigate only the authorized repository:

- target exists in Published Hub/current proposal with a strong match: record a
  relation immediately;
- the current repository has enough evidence to promote an independently useful
  target concept in the same proposal: create target and relation together;
- interaction is evidenced but the target is not confidently resolved: retain a
  candidate + Question;
- target appears similar only by name/prose: do not auto-match;
- no interaction evidence: do not create a relation candidate from inference.

Unrelated Local Drafts are outside matching scope. Batch Ingest remains multiple
isolated sequential Ingest runs. Its source-name suggestions are authoring
context only and do not reconcile member knowledge or become Domain Enrichment.

## Deterministic source-name suggestions

Owner-approved source-only comparison covers common conventions, not every
repository. It reuses the census selector (256 files/64 KiB each, 4096 visited
entries per repo); `.properties`, `.tfvars`, XML and Groovy are eligible standard
config/source formats. Secret, cache, minified, test, docs and fixture paths
remain excluded. Unsupported dynamic config, external config services, deploy
order and external CI are explicit limitations.
General XML eligibility does not broaden launch or URL census patterns: only
the existing web-descriptor/POM classifiers emit their established signals.

- **AB-NAME-001** — Compare 2..32 unique local Git roots read-only; use selected
  census files and disclose sampled/oversized/observation bounds. No network,
  provider credential, model call, Hub mutation or new MCP tool.
- **AB-NAME-002** — Extract definition/use evidence with repo, relative path and
  line for common AWS resource/data names, function/module naming inputs, ARN/
  resource URLs, Maven/Gradle coordinates, scoped npm packages, class-level
  RequestMapping and base URLs. Git module references retain repository/module
  identity and bounded version-drift counts; they never expose credentials.
- **AB-NAME-003** — Resolve simple var inputs/defaults/tfvars, same-module locals,
  function environment reads and Spring Value/properties through at most two
  indirections, retaining evidence across the chain. Keep multiple configured
  values; do not evaluate HCL functions/merges/ternaries or runtime expressions.
- **AB-NAME-004** — Normalize case, camel/separator spelling, standard environment
  tokens, interpolation and ARN/URL resource names. Remove standard AWS
  region/account suffixes from bucket identity hints. Generic/short/high-frequency
  names are excluded; name matching is always candidate evidence.
- **AB-NAME-005** — Unique cross-repo definition/use matches retain mechanism,
  evidence at both ends, suggested predicate and exact/normalized confidence.
  Unresolved interpolation may yield partial matches only as Questions, never
  actionable suggestions. Duplicate definitions, referenced-not-defined names
  and module-version-drift remain separate bounded diagnostics.
- **AB-NAME-006** — Compare with exact synced Published concepts/relationships,
  never Local Draft. Keep existing/new status in the private full result; return
  only new suggestions (top 50), Questions and explicit omitted/truncated counts.
  Batch Prepare retains its full private report in the batch session; opt-in
  `scan_workspace_repositories` uses `match_names: true` and private scan state.
- **AB-NAME-007** — Agent verifies endpoint/interaction evidence and user scope
  before authoring normal relationships with sources at both ends and resolving
  body links. No inverse foreign-repository mutation; Refresh the evidence owner
  separately. A report is context, never Published identity or review authority.
- **AB-NAME-008** — Offline qualification uses this same matcher and product
  search, retaining an explicit empty baseline option. Generated F1/F2 assert
  deterministic arithmetic/evidence, not quality admission thresholds. Public
  corpus runs stay outside verify and retain fixed commits in operator temp
  storage; report counts, limits and precision/recall without source content.

Distinctive config literals can be returned as low-confidence Questions by an
explicit library option; they are disabled by default because a repeated literal
does not identify a definition/use direction. No private endpoint convention is
encoded. Shared names above 8 repos (or 75% of a workspace larger than 8) are
suppressed; callers can inspect source directly for these common modules.

## Candidate contract

Section 06 requires an unresolved candidate to retain enough meaning for later
handling:

- source-concept identity;
- proposed canonical predicate;
- observed target hints, not normalized automatically into canonical identity;
- source evidence for interaction and each identity hint;
- observed repository/source revision;
- why a canonical relation cannot yet be created.

Question lifecycle, serialized shape and conflict presentation belong to section
07. A candidate is not loaded as a graph edge and does not affect Domain
membership.

## Domain Enrichment behavior

Domain Enrichment reads bounded candidates from repositories selected by the
user. It may:

1. compare Published knowledge and evidence from both sides;
2. use a deterministic IaC/config chain when sufficient;
3. after the user logs in, call the provider CLI read-only for exactly the
   candidate;
4. create a canonical-relation proposal when endpoint and interaction are
   sufficient;
5. close, update or retain the Question when the result is false, conflicting or
   still incomplete.

Provider CLI is supplementary evidence, not a required step. MCP does not scan
an entire account/region, and verification does not Accept or Publish
automatically.

## Reuse and minimum change

- Keep current canonical predicates, relation identity, evidence IDs, target/link
  validation and inbound traversal.
- A canonical edge remains in the source concept's `relationships`.
- Do not add a relation database, unresolved graph node or inverse edge.
- Future runtime only needs to create/read candidates through the Question
  contract and promote a candidate to a proposal edge after validation passes.

## Failure and recovery

- An ambiguous target or missing provider permission retains a Question with a
  limitation; do not downgrade to a name match.
- An identity match without proven interaction may retain an identity candidate,
  not a relation.
- Clear interaction with an unknown target retains a relation candidate, not a
  dangling edge.
- A provider observation conflicting with source retains both provenance entries
  and moves conflict to section 07; section 06 does not choose a winning source.

## Accepted examples

| Evidence | Outcome |
|---|---|
| Same Queue ARN and Terraform/code proves a Function publishes to the queue | Canonical `publishes-to` relation. |
| Same Queue ARN but no evidence that the Function uses the queue | Identity match only; no relation. |
| `EVENT_QUEUE_URL` and `crawler_queue` appear related but remain unresolved | Candidate + Question. |
| Only the keyword `queue` is similar in two repositories | No stored relation. |
