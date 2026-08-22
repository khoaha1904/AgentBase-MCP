# 08.01 — File source and observed-value format

> Trạng thái: Repository reference và observed-value contract đã implement.

## Quyết định ngắn

Observed value trỏ tới một admitted Repository-file hoặc provider-observation
source, không trỏ executable symbol/function. Nhiều values có thể dùng chung
một `sources[].id`; current-source reread chỉ áp dụng Repository-file variant.

## File source

Canonical repository source có hai dạng:

```text
repository://<repository-id>/<encoded-relative-path>
repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>
```

- Repository ID và path là authority/provenance.
- Line span optional và chỉ là evidence hint tại observed revision.
- Absolute path, remote URL, checkout/cache location và credential bị cấm.
- Path normalize beneath canonical Repository root.
- File move chỉ làm current lookup trả `current-path-unavailable`; provenance tại
  observed revision vẫn valid. Refresh/human có thể repair reference nhưng MCP
  không tìm symbol để tự rewrite path.

Một broad file reference được dùng khi nhiều values nằm cùng file. Exact line
span vẫn nên dùng khi nó có sẵn và giúp reviewer, nhưng không bắt buộc chỉ để
snapshot một value dễ hiểu.

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

Contract giữ stable bundle-unique ID, normalized subject/property, role
`documentation|implementation|configuration|provider`, one scalar/single-line value,
source ID và exact observed source state/time. Không có `target.kind`, target
name, resolver instruction hoặc `current: true`.

Value giữ bounds/sensitive filter hiện tại: non-empty, one line, tối đa 256 UTF-8
bytes, finite number/boolean/string only. Một concept tối đa 64 observed values;
completeness không phải mục tiêu.

Entry phải nằm trong concept mà nó mô tả và `subject` phải bằng canonical
identity của concept đó. Cross-concept values không được đặt hộ trong một file
khác; shared source không có nghĩa shared owner.

MCP tạo ID mới theo `AB-OBS-<24hex>`, với hex là prefix SHA-256 của canonical
JSON tuple `agentbase-observation-v1`, owning concept identity, subject,
property, role và stable source scope. Repository scope là Repository identity +
normalized path. Provider scope là provider + profile family + authority +
location + native identity; evidence digest, time and profile version không thuộc
scope. Refresh/Enrichment trước tiên match existing stream theo owning concept +
subject + property + role + stable source scope; nếu match thì phải giữ ID.
Reviewed file-move repair đổi source path nhưng giữ ID. Một semantic stream mới
mới được cấp ID mới; model không tự đặt ID để né matching.

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

## Identity và multiple observations

- Stable ID identifies one source-attributed observation stream, không phải
  universal property truth.
- Hai sources cho cùng subject/property giữ hai entries và có thể conflict theo
  phần 07.
- Refresh updates exact attributable entry with new value/revision/time; absence
  không xóa it.
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
