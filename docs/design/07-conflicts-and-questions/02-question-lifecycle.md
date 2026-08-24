# 07.02 — Shared Question lifecycle

> Trạng thái: Shared Question MVP đã implement và verify bằng local lifecycle.

## Quyết định ngắn

Question là một governance document trong Hub. Proposal chứa Question để review;
Accept đưa nó vào Local Hub; merge PR chia sẻ nó cho mọi máy.

```text
proposal staging → accepted Local Hub → PR → Published Hub main
```

Runtime hiện không cần private ledger/cache. Một exact Hub tree dựng được toàn bộ
current Question state.

## Shared representation

Mỗi Question là một bounded Markdown document dưới `questions/` và xuất hiện
trong `questions/index.md`. Document giữ:

- stable Question ID và human-readable title;
- kind: conflict, missing evidence, relation candidate, identity candidate hoặc
  maintainer decision;
- subject/property/scope;
- current governance state;
- typed claim/candidate/evidence references;
- missing evidence và limitations;
- links tới applicable Maintainer Guidance/resolution evidence;
- visible short explanation cho human reviewer.

Question là MCP-rendered governance document `type: Question`, không phải
Concept Schema/role để model chọn trong Ingest. Canonical path là
`questions/<question-id>.md`; `questions/index.md` là navigation do renderer
quản lý.

Top-level `status` tiếp tục là ordinary OKF document lifecycle (`draft`,
`stable`, ...), độc lập publication và governance. Current Question state nằm ở
`agentbase.question.state` với đúng `open`, `resolved` hoặc `needs-review`.
Dedicated Question validator kiểm tra exact nested contract:

```yaml
type: Question
status: draft
agentbase:
  question:
    id: <stable-id>
    revision: 1
    state: open
    kind: conflict
    origin_subject: <immutable identity at creation>
    origin_property: <immutable property at creation>
    subject: <canonical identity or stable candidate subject>
    property: <bounded property>
    scope_key: <immutable bounded origin key>
    references:
      - reference_kind: owned-item
        owner: <owning concept identity>
        item_kind: claim
        item_key: <natural key>
        source_id: <ID resolved in owner's sources[]>
        observed_revision: <optional source/provider revision>
    missing_evidence: []
    limitations: []
    guidance: []
```

Allowed kinds are `conflict`, `missing-evidence`, `relation-candidate`,
`identity-candidate` and `maintainer-decision`. Exact fields are bounded;
unknown nested fields, invalid state transition, unresolved typed reference,
duplicate Question ID/path or duplicate index target fail validation. MCP owns
initial rendering, short readable body và state transitions; Agent không tự ghi
Question bytes hoặc invent ID/revision/state.

References are an exact tagged union:

- `owned-item`: `owner + item_kind + item_key + source_id`, where `source_id`
  resolves inside the owner concept;
- `candidate-evidence`: `candidate_key + source_resource`, where the exact
  normalized repository/provider/AgentBase resource proves the candidate.

Both variants may add `observed_revision`; it is required when the referenced
observation has a source/provider revision and forbidden from standing in as a
value. Candidate references never invent a placeholder owner concept.

One Question has at most 64 references, 64 missing-evidence entries, 64
limitations and 16 Guidance links. IDs/keys are at most 256 UTF-8 bytes; human
summaries/reasons are at most 512 bytes each; the ordinary 64 KiB frontmatter
and 256 KiB concept-document bounds still apply. `questions/index.md` contains
each normalized Question target exactly once. These are safety bounds, not
completeness targets.

Question không chứa raw source, provider response dump, secret hoặc duplicated
concept prose. Git giữ revision history; file chỉ cần current state và references,
không append toàn bộ event ledger vào frontmatter.

## Stable identity

Question ID có dạng `question-<24 lowercase hex>` và được tạo một lần từ SHA-256
của UTF-8 canonical JSON array `[1, kind, origin_subject, origin_property,
scope_key]`; array order and JSON string escaping are fixed by contract.
`origin_*` fields never change; current `subject/property` may follow an accepted
rename/redirect. Git Hub đã là namespace nên input không chứa machine-local Hub ID
hoặc remote name. Scope key không chứa wording, evidence list, timestamp hoặc
current display name.

ID và path `questions/<id>.md` không đổi sau creation. Subject rename/redirect
chỉ cập nhật current reference qua reviewed proposal; không derive lại ID.

New Question starts at revision `1`. Every accepted modification to the Question
document—including title/body wording—must increment revision by exactly one;
an unchanged Question or navigation-only index change does not. This conservative
rule keeps stale-answer checks deterministic across machines.

## Lifecycle

```text
Open ──accepted resolution/guidance──→ Resolved
  ↑                                      │
  └──────── explicit reopen ─────────────┤
                                         │ conflicting new evidence
                                         ↓
                                    Needs Review
                                         │ accepted review
                                         └────────→ Resolved
```

- **Open:** còn thiếu answer/evidence.
- **Resolved:** không còn action/question cần maintainer xử lý tại revision hiện
  tại; không có nghĩa conflict biến mất hoặc một position thành absolute truth.
- **Needs Review:** accepted guidance vẫn tồn tại nhưng evidence mới mâu thuẫn.

State thay đổi chỉ qua proposal được review/Accept. Answer chưa Accept không làm
Published Question thành Resolved. Open Question có thể Published; Question state
độc lập publication state.

Competing current positions vẫn được query khi Question đã `resolved`. Một
position chỉ rời current view qua reviewed correction/removal có reason và
evidence; Git giữ history.

## Authoring boundary

Only the dedicated MCP Question renderer may create or modify a Question. It
validates exact previous→next ID, revision, state transition, typed references
and protected fields before the ordinary proposal digest/Accept lifecycle.
Generic Ingest/Refresh authoring cannot edit Question bytes, and implementation
must not broaden the generic mutable-draft predicate to make this work.

## Creation

Question có thể được tạo từ:

- competing claims;
- missing evidence cho một otherwise useful concept;
- unresolved relation/resource identity candidate ở phần 06;
- explicit maintainer decision cần thiết;
- new evidence mâu thuẫn guidance đã accepted.

Creation cần ít nhất một exact evidence/candidate reference hoặc một explicit
human decision request. Pure model speculation không được tạo Question.

Trong ordinary Ingest/Refresh, `property` là một stable token đã tồn tại trên
`agentbase.observed_values` của cùng subject, không phải nguyên câu hỏi. Mỗi
`observation_ref` phải match exact property + role + source ID. Nếu concept chưa
có observation phù hợp, agent giữ uncertainty trong prose/Limitations và bỏ qua
Question declaration; không tạo observation giả chỉ để qua validation.

Question được tạo trong cùng proposal với knowledge/candidate làm phát sinh nó
khi có thể. Nếu source concept chưa tồn tại, Question vẫn dùng stable candidate
scope và evidence resources; không cần placeholder concept.

## Resolution

Resolution proposal atomically:

1. thêm Maintainer Guidance hoặc provider/source-backed resolution evidence;
2. cập nhật Question state/references;
3. thêm relation/identity/knowledge change phát sinh nếu có;
4. giữ competing historical evidence.

Một answer khác ở stale Question revision bị từ chối. New answer mâu thuẫn không
overwrite answer cũ; nó tạo reviewed revision và appropriate state transition.

## Synchronization và recovery

- Published Question authority là exact Hub commit.
- Local accepted Questions tham gia normal pending proposal review; ordinary
  query thấy chúng sau publication và synchronization.
- Pull/synchronize nhận Question như Hub Markdown bình thường.
- Nếu sau này có cache, nó phải bind Hub commit và rebuild được; MVP không có
  Question cache.
- Interrupted Accept/Publish dùng proposal/Git recovery hiện tại, không có một
  private ledger write quyết định truth sau commit.

## Clean cutover

Question ledger v1 chưa được publish và không phải shared authority. Khi runtime
đổi sang Question documents, preflight scan accepted Guidance có
`agentbase.question`. Không có orphan Guidance thì bỏ ledger cũ và không xây
dual-write/permanent migration layer. Nếu có Guidance không resolve tới Question
document, cutover dừng với explicit migrate/regenerate instruction; không âm
thầm bỏ accepted Question context. Unaccepted Questions được tạo lại qua
Refresh/Enrichment; accepted Hub content là baseline duy nhất.

## Baseline impact

Broad authority change này đã clean-cut private ledger/sidecar. Git/Hub lifecycle
được tái sử dụng; không thêm service/database, compatibility reader hoặc cache.
