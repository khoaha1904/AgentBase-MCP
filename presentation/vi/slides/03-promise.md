# Slide 03 — Mental model đơn giản

## Vai trò của slide

Giải thích AgentBase mà không yêu cầu người nghe biết MCP hoặc OKF.

## Thông điệp duy nhất

AgentBase là một Markdown Knowledge Hub được MCP nối vào AI agent.

## Nội dung hiển thị

```text
MARKDOWN KNOWLEDGE HUB  <->  MCP  <->  AI AGENT
team đọc và sửa              đường vào      tìm và dùng context

Source-backed · Reviewable · Compounding
```

## Lời thoại dự kiến

“Ở mức đơn giản nhất, knowledge vẫn là Markdown để team đọc, diff và sửa bằng
Git. MCP là đường truy cập có contract cho agent. Agent tìm và tổng hợp context,
nhưng không tự biến câu trả lời của mình thành knowledge dùng chung. Ba thuộc
tính mình theo đuổi là có nguồn, review được và build up theo thời gian.”

## Câu chuyển

“Trước khi đi vào cách xây, mình muốn cho thấy promise này thay đổi một change
request cụ thể như thế nào.”

## Nguồn

- `docs/product/00-scope-and-authority.md`
- `docs/product/05-query-and-context.md`
