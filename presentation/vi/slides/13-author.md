# Slide 13 — Author

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đào sâu stage 04 và phân chia rõ trách nhiệm giữa coding agent với MCP.

## Thông điệp duy nhất

MCP tạo cấu trúc OKF đúng contract; agent dùng reasoning để enrich meaning từ
evidence.

## Nội dung hiển thị

```text
AGENTBASE-MCP                    CODING AGENT
generated OKF skeleton          purpose · architecture
paths · IDs · frontmatter       behavior · limitations
sources · relations · nav       readable explanation
                  ↓
           EDITABLE PROPOSAL
```

## Lời thoại dự kiến

“Khi evidence đã đủ, vấn đề tiếp theo là kiểm soát output của agent. Nếu để agent
tự tạo path, YAML, ID và relation từ đầu, format rất dễ drift và khó review.

Ý tưởng của mình ở Author là tách structure khỏi meaning. MCP tạo workspace cùng
OKF skeleton đúng contract; coding agent chỉ tập trung enrich purpose,
architecture, behavior và limitation từ evidence.

Output vẫn là Markdown bình thường trong một editable proposal, nên con người
có thể đọc và sửa trực tiếp.”

## Câu chuyển sang slide 14

“Viết xong chưa có nghĩa là proposal hợp lệ. Trước khi cho con người review,
MCP còn một stage chặn cuối.”

## Nguồn

- `AgentBase-MCP/docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
- `AgentBase-MCP/docs/architecture/ownership.md`
