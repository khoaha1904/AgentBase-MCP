# 05.02 — Hub overview boundary

> Trạng thái: Technical design draft.

## Hub nhận gì?

- Concept có identity và giá trị query độc lập.
- Claim, relation, decision, Question và limitation quan trọng.
- Bounded provenance cùng reference đủ để quay lại source.
- Snapshot scalar nhỏ, hữu ích cho người đọc, khi có exact provenance và được
  ghi rõ là observed value thay vì current truth.
- Navigation cần để tìm concept theo Domain/System/Repository.

## Source giữ gì?

- Function, class, handler và implementation flow nhỏ.
- Config field hoặc scalar không có giá trị knowledge độc lập.
- Raw Code Graph rows, provider cache và absolute checkout paths.
- Secret, credential và dữ liệu nhạy cảm.
- Raw source snippet, config dump và provider response chỉ để tránh tìm lại.

## Enforcement

Boundary này chủ yếu được enforce bởi authoring skill, schema guidance và changed-
set validation hiện tại; MCP không cần một ontology/parser thứ hai để đoán mọi
chi tiết source.

Proposal phải sparse: chỉ tạo concept khi có identity và query value. Chi tiết
không được promote vẫn có thể xuất hiện dưới dạng source evidence/reference.
Missing evidence tạo limitation hoặc Question, không tạo placeholder fact.

## Ownership

- `agentbase-okf` skill: authoring policy và sparsity.
- `core/knowledge`: OKF/schema/relationship validation.
- `app/hub-okf`: exact proposal lifecycle và protected-content boundary.
- Phần 03/04 quyết định discovery/schema; phần 05 chỉ quyết định storage boundary.
