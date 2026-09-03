# Slide 11 — Discover

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đào sâu stage 02 và phân biệt discovery với inventory toàn bộ codebase.

## Thông điệp duy nhất

Discover chỉ tạo một tập candidate có giá trị độc lập cho việc hỏi, giải thích
hoặc liên kết; không copy mọi artifact vào Hub.

## Nội dung hiển thị

```text
RAW SIGNALS
functions · events · queues · routes · resources · configs
                         ↓ bounded discovery
KNOWLEDGE CANDIDATES
concept · relation · question · ignore(reason)

OUTPUT: bounded candidate set — sparse by design
```

## Lời thoại dự kiến

“Sau khi context đã được khóa, vấn đề tiếp theo là source có quá nhiều signal.
Nếu biến mọi function, queue hay Terraform resource thành Markdown, mình chỉ
tạo thêm một bản copy của codebase, rất nhiễu và nhanh stale.

Ý tưởng của mình ở Discover là bounded discovery: chỉ lấy một tập candidate nhỏ
có giá trị độc lập để hỏi, giải thích hoặc liên kết. Signal chưa rõ trở thành
Question; phần không đáng lưu có thể ignore nhưng phải có lý do.

Output là một candidate set sparse by design, chưa phải knowledge đã được chấp
nhận.”

## Câu chuyển sang slide 12

“Nhưng candidate mới chỉ là giả thuyết. Muốn viết thành knowledge, nó phải quay
lại evidence.”

## Nguồn

- `AgentBase-MCP/docs/product/01-repository-understanding.md`
- `AgentBase-MCP/docs/product/02-knowledge-model-and-relations.md`
