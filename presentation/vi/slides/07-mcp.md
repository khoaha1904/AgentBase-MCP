# Slide 07 — MCP đưa knowledge tới agent

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Tách rõ vai trò của OKF và MCP: một bên là format của knowledge khi lưu trữ,
một bên là interface để agent truy cập knowledge lúc runtime.

## Thông điệp duy nhất

OKF là contract của knowledge; MCP là contract truy cập knowledge.

## Nội dung hiển thị

```text
AI Agent ↔ AgentBase MCP ↔ OKF Knowledge Bundle
```

- Agent: hỏi và reasoning.
- MCP: search, navigate và trả context có giới hạn.
- OKF: lưu, liên kết và mô tả nguồn gốc knowledge.

## Lời thoại dự kiến

“Đến đây mình đã có một format để lưu và phát triển knowledge. Nhưng OKF chỉ
định nghĩa knowledge được tổ chức như thế nào. Nó không định nghĩa agent sẽ
truy cập knowledge đó ra sao.

Đây là phần MCP đảm nhiệm. Agent không cần biết knowledge nằm trong thư mục nào,
phải đọc index nào hay lần theo link ra sao. Nó gọi AgentBase thông qua MCP, còn
AgentBase chịu trách nhiệm tìm, giới hạn và trả về phần context phù hợp.

Nói ngắn gọn: OKF là contract của knowledge khi được lưu trữ; MCP là contract
để agent truy cập knowledge lúc runtime.”

## Câu chuyển sang slide 08

“Đến đây, agent đã có cách truy cập knowledge. Nhưng còn một câu hỏi quan trọng:
knowledge ban đầu đến từ đâu?”

## Nguồn

- MCP server overview: https://modelcontextprotocol.io/specification/2025-06-18/server/index
