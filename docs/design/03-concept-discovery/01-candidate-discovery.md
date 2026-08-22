# 03.01 — Candidate discovery

> Trạng thái: Bounded Agent discovery + deterministic gates implemented.

## Candidate sources

Agent tạo candidate từ evidence đã đọc, không từ tên đoán mò:

- root README/docs/ADR cho declared purpose, boundary hoặc decision;
- architecture/entrypoint/package boundary từ graph rồi exact source;
- infrastructure/resource declaration có logical identity;
- API, event, queue hoặc data contract có integration value;
- existing Hub concept và relation cần source mới bổ sung.

Graph node, file, function, cloud keyword hoặc import chỉ là discovery signal.
Chúng không tự động trở thành concept.

## Hai qualification gates

Mỗi candidate phải trả lời:

1. **Identity:** có thể chỉ ra đây là thực thể nào một cách ổn định không?
2. **Query/link value:** người dùng có lý do độc lập để tìm nó hoặc liên kết
   concept khác tới nó không?

Có cả hai gate thì candidate được đưa sang schema selection. Thiếu một gate thì
Agent tìm thêm bounded evidence; vẫn chưa rõ thì giữ Question hoặc bỏ.

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

## Deterministic/AI balance

Workflow deterministic giữ repository authority, graph/source bounds, candidate
shape, identity checks, schema catalog, validation và retry budget. Agent chỉ
đảm nhiệm semantic interpretation: source đang mô tả boundary gì, candidate nào
có query value và ambiguity nào cần Question.

Không hard-code một pipeline concept riêng cho AWS/serverless/e-commerce. Source
detector/provider profile chỉ tạo evidence signal; Agent vẫn áp dụng hai gates
provider-neutral. Ngược lại, Agent không được tự nới authority, schema hoặc vòng
lặp vì “reasoning” thấy có ích.
