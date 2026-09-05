# Slide 13 — AgentBase thêm một knowledge lifecycle

## Vai trò của slide

Định vị sản phẩm mà không dựng đối thủ giả.

## Thông điệp duy nhất

AgentBase không thay Markdown hay RAG; nó thêm durable synthesis, provenance,
review authority và refresh lifecycle.

## Nội dung hiển thị

| Cách tiếp cận | Làm tốt | Cần xây thêm nếu muốn shared knowledge |
|---|---|---|
| Markdown | Con người đọc, sửa, version | Retrieval contract, provenance, lifecycle |
| RAG | Tìm source chunk khi hỏi | Durable synthesis, review authority, maintenance |
| AgentBase | Shared source-backed knowledge lifecycle | Không thay mọi search/RAG use case |

## Lời thoại dự kiến

“Markdown là substrate tốt và AgentBase vẫn dùng nó. RAG rất tốt khi cần retrieve
source chunk ở thời điểm hỏi. AgentBase tập trung vào lớp khác: synthesis bền,
provenance có cấu trúc, human publication authority và refresh. Ba cách có thể
đứng cạnh nhau; AgentBase không cần thay mọi search hay RAG use case.”

## Câu chuyển

“Với vị trí đó, release hiện tại đã sẵn sàng cho điều gì và chưa tuyên bố điều
gì?”

## Nguồn

- `docs/product/00-scope-and-authority.md`
- `docs/product/05-query-and-context.md`
