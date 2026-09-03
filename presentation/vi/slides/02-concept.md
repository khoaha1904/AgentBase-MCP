# Slide 02 — AgentBase, ở mức đơn giản nhất

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Cho khán giả một mental model đơn giản về AgentBase và nói rõ buổi trình bày
sẽ tập trung vào điều gì.

## Thông điệp duy nhất

Ở mức cơ bản, AgentBase là một knowledge base bằng Markdown và một MCP giúp AI
agent truy cập knowledge đó. Phần đáng nói là cách biến concept này thành một
hệ thống dùng được trong thực tế.

## Nội dung hiển thị

```text
Knowledge Base          MCP          AI Agent
   Markdown              ↔              ↔
```

Không chỉ cách nó hoạt động — mà là cách nó được hoàn thiện để dùng trong thực tế.

## Lời thoại dự kiến

“Chào mọi người. Hôm nay mình muốn giới thiệu về AgentBase.

Nếu nói ở mức đơn giản nhất thì AgentBase gồm hai phần: một knowledge base được
lưu dưới dạng Markdown, và một MCP giúp AI agent truy cập vào knowledge đó.

Concept này thực ra không quá mới. Về cơ bản, nó vẫn là một knowledge base được
kết nối với agent.

Nhưng trong buổi hôm nay, mình không chỉ muốn demo AgentBase hoạt động như thế
nào. Phần mình muốn chia sẻ sâu hơn là quá trình biến concept khá đơn giản này
thành một hệ thống có thể sử dụng được trong thực tế.

Mình sẽ nói về những vấn đề mình gặp trong quá trình xây dựng, cách mình giải
quyết chúng, và AgentBase khác gì so với cách làm knowledge base bằng RAG hoặc
chỉ dùng Markdown thông thường.

Và để hiểu tại sao mình lại xây nó theo hướng này, mình muốn bắt đầu từ bài
toán thực tế của team.”

## Câu chuyển sang slide 03

“Đầu tiên là bối cảnh của team mình.”

## Không đưa vào slide này

- Chưa giải thích kiến trúc MCP.
- Chưa trình bày Codebase Memory hoặc OKF.
- Chưa chứng minh ưu điểm so với RAG.
