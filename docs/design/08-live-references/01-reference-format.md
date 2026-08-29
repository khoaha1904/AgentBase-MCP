# 08.01 — File source and observed-value format

> Status: The Repository reference and observed-value contract are implemented.

## Decision summary

An observed value points to an admitted Repository-file or provider-observation
source, not an executable symbol/function. Multiple values can share one
`sources[].id`; current-source rereading applies only to the Repository-file variant.

## File source

A canonical repository source has two forms:

```text
repository://<repository-id>/<encoded-relative-path>
repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>
```

- Repository ID and path provide authority/provenance.
- A line span is optional and only an evidence hint at the observed revision.
- Absolute paths, remote URLs, checkout/cache locations and credentials are forbidden.
- The path is normalized beneath the canonical Repository root.
- A file move only makes current lookup return `current-path-unavailable`;
  provenance at the observed revision remains valid. Refresh or a human can
  repair the reference, but MCP does not search for a symbol to rewrite the path.

A broad file reference is used when multiple values reside in the same file. An
exact line span should still be used when available and helpful to the reviewer,
but is not required merely to snapshot an understandable value.

Observed-value sources are a closed discriminated union by URI scheme:

- `repository://...` — repository-file source with Git state;
- `provider-observation://...` — persistent bounded provider source from 08.06.

Other source URI kinds may remain valid open-world OKF sources but cannot back
`agentbase.observed_values` until this contract explicitly admits them.

## Observed-value contract

New values live at `agentbase.observed_values[]` in the owning concept:

```yaml
sources:
  - id: queue-config
    resource: repository://repository-crawler-aaaaaaaaaaaa/config/queue.ts
agentbase:
  observed_values:
    - id: AB-OBS-<24hex>
      subject: systems/crawler
      property: session_ttl_days
      role: configuration
      value: 7
      source_id: queue-config
      observed:
        commit: <40-hex revision>
        dirty: false
        dirty_digest: null
        at: 2026-08-22T08:00:00Z
```

The contract retains a stable bundle-unique ID, normalized subject/property, role
`documentation|implementation|configuration|provider`, one scalar/single-line value,
source ID and exact observed source state/time. There is no `target.kind`, target
name, resolver instruction or `current: true`.

A value retains the current bounds/sensitive filter: non-empty, one line, at most
256 UTF-8 bytes and only a finite number, boolean or string. A concept has at most
64 observed values; completeness is not the goal.

An entry must reside in the concept it describes, and `subject` must equal that
concept's canonical identity. Cross-concept values cannot be stored on another
concept's behalf; a shared source does not imply a shared owner.

MCP creates a new ID as `AB-OBS-<24hex>`, where the hex is a SHA-256 prefix of
the canonical JSON tuple containing `agentbase-observation-v1`, owning concept
identity, subject, property, role and stable source scope. Repository scope is
Repository identity plus normalized path. Provider scope is provider plus profile
family, authority, location and native identity; evidence digest, time and profile
version are not part of the scope. Refresh/Enrichment first matches an existing
stream by owning concept, subject, property, role and stable source scope; a match
must retain its ID. A reviewed file-move repair changes the source path but keeps
the ID. Only a new semantic stream receives a new ID; the model cannot assign an
ID to evade matching.

Repository source-state invariants:

- clean: valid 40-hex commit, `dirty: false`, `dirty_digest: null`;
- dirty with HEAD: valid commit, `dirty: true`, required digest;
- unborn repository: `commit: null`, `dirty: true`, required digest;
- `observed.at` is always valid RFC3339.

Provider source is the discriminated `provider-observation://` record in 08.06;
its exact `observed` shape is `{ evidence_digest: <64hex>, at: <RFC3339> }` and
it has no Git commit/dirty fields. Repository entries cannot carry provider state
and provider entries cannot carry Repository state.

## Authoring normalization

Persisted/validated Hub entries always have exact `id` and `observed` state, but
an active authoring workspace may omit both for a new observation. Before
Prepare/Refresh validation, MCP performs one deterministic normalization pass:

- new Repository entry gets `AB-OBS-<24hex>` from the canonical identity tuple
  and the current session's commit/dirty digest/time;
- existing current-Repository entry preserves its accepted ID; when its
  value/source changes, MCP stamps current source state;
- unchanged or omitted accepted entry preserves its prior bytes/state;
- foreign-Repository entry must remain semantically unchanged;
- an author-supplied ID is accepted only when it names the exact existing stream
  being updated/repaired; a new author cannot choose an ID.

Normalization writes only the isolated proposal bundle, not source repository or
accepted Hub bytes. Validation and Question binding run after normalization.

Same-proposal Question declarations do not require the host to know generated
IDs. They identify positions by `subject + property + role + source_id`; MCP
resolves those natural references to normalized observed-value IDs before it
locks the proposal.

## Identity and multiple observations

- A stable ID identifies one source-attributed observation stream, not universal
  property truth.
- Two sources for the same subject/property retain two entries and may conflict
  under Section 07.
- Refresh updates the exact attributable entry with a new value/revision/time;
  absence does not delete it.
- Same source file can support many entries without duplicating `sources[]`.
- Provider-native resource identity stays in 06.02 metadata; only a small useful
  provider value belongs here.

## Current-value lookup

Observed-value contract intentionally contains no durable locator beyond file.
When explicitly asked for current value, host Agent uses the referenced file as
context and normal authorized MCP graph/search/snippet reads. It may answer when
evidence is clear, ask/qualify ambiguity, or return unavailable. It does not
write the newly read value back to Hub without Refresh/Enrichment proposal.

## Cutover

Replace `agentbase.live_claims` and `read_hub_live_evidence`; do not retain both
contracts. Because no old contract has been Published, local/unaccepted drafts
may be rebuilt. Unknown foreign extensions remain readable but are not authored
or interpreted as AgentBase observed values.
