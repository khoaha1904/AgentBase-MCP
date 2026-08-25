# 03.01 — Candidate discovery

> Trạng thái: Bounded Agent candidate gates và Capability 046 broad discovery
> coverage đã implement.

## Discovery lanes và Seed

Discover chạy năm lane: repository identity/product; runtime/entrypoint;
interface/route/event/trigger; dependency/integration/data/channel; và deploy/
operations. Sau index, MCP tự chạy fixed provider baseline và bounded safe file
census để tạo private per-connection Discovery Seed. Raw graph nodes được compact
thành session-stable evidence groups; repeated low-value rows giữ count và source
samples. Agent không tự khai lane status, priority hoặc absence.

Investigate gửi một Inventory. Mỗi important Seed group phải map sang đúng
one outcome: `materialized`, `question` hoặc `ignored`. Một materialized group
có thể trỏ tới nhiều candidate; candidate đã khai concept/embedded và parent nên
Inventory không khai lại. Coverage group không split/merge trong MVP; mỗi item
có một origin group nhưng nhiều group có thể cùng đóng góp vào một candidate.
Guidance thành công
freeze compact Inventory Receipt; raw graph/
source không vào Receipt hoặc Hub.

Agent không tạo Inventory item ID, QuestionPlan ID, output parent hoặc
candidate-level evidence list lần hai. MCP derive các field đó từ active Seed và
cùng guidance request. Seed group source list chỉ là bounded samples để hiểu và
review group; nó không được dùng như một exhaustive repository-evidence
allowlist. Caller-correctable defects được trả thành một bounded diagnostic set
trong cùng `INVALID_ARGUMENT`, tránh buộc Agent khám phá từng lỗi tuần tự.

Materialized embedded candidate được bind vào parent bằng candidate-owned exact
evidence. Human-readable label trong table/prose có thể được Agent cải thiện;
Finalize không dùng exact identity-hint substring làm materialization gate.
Nếu exact evidence không còn trong parent, MCP append lại canonical embedded row
từ frozen Receipt trước validation; raw graph không được dùng lại.

`get_okf_authoring_schemas` validates the submitted Inventory against the active Seed
and returns `discovery_receipt_id`. New-mode `prepare_hub_okf` consumes that
exact ID instead of trusting a re-sent mutable guidance payload. Before Prepare
the receipt is immutable connection state; Prepare atomically creates one
private authoring session. Exact retry returns the same session; mismatched use
fails.

Question outcome tạo private QuestionPlan dùng existing SharedQuestion kind.
Agent chọn `candidate_key + evidence_id` đã có trong cùng guidance request; MCP
tự derive exact normalized source resource và SourceSnapshot revision trước khi
freeze candidate-evidence reference vào Receipt. Agent không tự tạo
`repository://` URI hoặc revision. Không bind được subject/evidence thì giữ
limitation, không tạo Question mồ côi.

## Candidate sources

Agent tạo candidate từ evidence đã đọc, không từ tên đoán mò:

- root README/docs/ADR cho declared purpose, boundary hoặc decision;
- architecture/entrypoint/package boundary từ graph rồi exact source;
- infrastructure/resource declaration có logical identity;
- API, event, queue hoặc data contract có integration value;
- existing Hub concept và relation cần source mới bổ sung.

Graph node, file, function, cloud keyword hoặc import chỉ là discovery signal.
Chúng không tự động trở thành concept.

Explicit `embedded` disposition không phụ thuộc provider profile. Nếu technology
mapping không có, guidance vẫn trả embedded với provider-neutral metadata và
limitation; `unsupported` chỉ áp dụng cho standalone promotion/schema không đủ
bằng chứng hoặc không được catalog hỗ trợ.

## Hai qualification gates

Mỗi candidate phải trả lời:

1. **Identity:** có thể chỉ ra đây là thực thể nào một cách ổn định không?
2. **Query/link value:** người dùng có lý do độc lập để tìm nó hoặc liên kết
   concept khác tới nó không?

Có cả hai gate thì candidate được đưa sang schema selection. Thiếu một gate thì
Agent tìm thêm bounded evidence; vẫn chưa rõ và có ảnh hưởng thì giữ Question,
còn không có independent value thì bỏ khỏi run hiện tại. Việc bỏ không được lưu
thành suppression rule; Refresh sau có thể đánh giá lại bằng evidence mới.

## Candidate record tối thiểu

Candidate trong workflow cần mang:

- proposed role/name và identity hint;
- source IDs hỗ trợ;
- signal rút ra từ từng source;
- lý do có query/link value;
- missing evidence hoặc ambiguity còn lại.

Không có numeric score hoặc confidence percentage. Completeness/limitation mô
tả phần thiếu cụ thể thay vì một con số trông chính xác giả.

## Guards

- Free-form signal không source không được mở quyền author schema.
- Một source trực tiếp có thể đủ; không đặt minimum source count giả tạo.
- Future intent hoặc docs mơ hồ không được trình bày như implemented state.
- Candidate không được tạo chỉ để làm Hub chi tiết hơn.
- Route, entrypoint, runtime root, API spec, IaC/deploy group, explicit service
  boundary, channel và datastore không được biến mất trước khi có outcome.
- P0 classification do MCP cố định; P0 ignored chỉ nhận `duplicate-covered` trỏ
  tới một non-ignored item sẽ materialize. Generated/out-of-scope phải được xếp
  dưới P0 lúc tạo Seed, không dùng làm lý do pass P0.
- Explicit outbound/trigger/datastore boundary có thể tạo một P1 Flow candidate
  và một representative trace; không tạo process graph.
- CRUD handler, helper, test, generated/vendor row và lockfile-only dependency
  được group/ignore; important không đồng nghĩa standalone concept.

## Deterministic/AI balance

Workflow deterministic giữ repository authority, graph/source bounds, candidate
shape, identity checks, schema catalog, validation và retry budget. Agent chỉ
đảm nhiệm semantic interpretation: source đang mô tả boundary gì, candidate nào
có query value và ambiguity nào cần Question.

Không hard-code một pipeline concept riêng cho AWS/serverless/e-commerce. Source
detector/provider profile chỉ tạo evidence signal; Agent vẫn áp dụng hai gates
provider-neutral. Ngược lại, Agent không được tự nới authority, schema hoặc vòng
lặp vì “reasoning” thấy có ích.
