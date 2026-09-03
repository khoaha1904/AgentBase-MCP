# Slide 17 — Agent reasoning, MCP giữ boundary

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Tổng hợp kiến trúc runtime và giải thích MCP không phải model hoặc một agent thứ
hai.

## Thông điệp duy nhất

Coding agent chịu trách nhiệm reasoning và synthesis; AgentBase-MCP cung cấp các
tool contract xác định, kiểm tra input/output và bảo vệ state/authority.

## Nội dung hiển thị

```text
AI Agent + AgentBase skills
reason · investigate · author
              ↓ MCP
Business tools / workflow orchestration
five-stage authoring · refresh · query · review
              ↓
Core contracts
code intelligence · knowledge · hub · query
              ↓ adapters
Codebase Memory | local Git/Hub | GitHub | provider observations
```

Hai trust boundary:

- Source + raw graph: private, read-only, rebuildable.
- Published Hub: shared, Git-backed, reviewed.

Callout: `NO MODEL SDK · NO MODEL KEY INSIDE AGENTBASE-MCP`

## Lời thoại dự kiến

“Một điểm dễ nhầm là MCP không tự reasoning và AgentBase-MCP cũng không chứa một
model riêng.

Coding agent đang sử dụng mới là bên điều tra, tổng hợp và viết nội dung. Skills
định hướng workflow. MCP expose những business tool có input/output rõ ràng cho
workflow năm stage vừa xem, Refresh, query và review. Nó giữ scope, scaffold,
validation, digest, state transition và authority.

Bên dưới là core contract cho code intelligence, knowledge, Hub và query. Các
adapter mới được phép chạm tới Codebase Memory, local Git, GitHub hoặc provider
observation.

Nhờ vậy model có thể linh hoạt trong reasoning, nhưng không thể chỉ bằng một câu
trả lời mà bỏ qua review, đọc nhầm repository hoặc tự biến draft thành Published
knowledge.”

## Câu chuyển sang slide 18

“Để thấy các boundary này phối hợp như thế nào, mình sẽ đi qua một tình huống
Crawler cụ thể từ đầu đến cuối.”

## Nguồn

- `AgentBase-MCP/docs/architecture/ownership.md`
- `AgentBase-MCP/docs/architecture/runtime.md`
- `AgentBase-MCP/docs/architecture/state-and-trust.md`
