# Slide 10 — Preflight

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đào sâu stage 01 và giải thích vì sao identity, revision và Domain phải được
chốt trước khi agent điều tra source.

## Thông điệp duy nhất

Không có source context chính xác thì mọi suy luận phía sau đều không đáng tin.

## Nội dung hiển thị

```text
REPOSITORY IDENTITY       SOURCE REVISION       PRIMARY DOMAIN
đúng repository          exact commit          owner confirms scope

OUTPUT: Authorized Source Snapshot
```

## Lời thoại dự kiến

“Ở Preflight, vấn đề mình muốn tránh là agent bắt đầu scan khi chưa biết chính
xác context. Một kết luận có thể đúng với code nhưng lại thuộc sai repository,
sai revision hoặc sai business domain.

Vì vậy ý tưởng của mình là chưa cho workflow đi tiếp ngay. AgentBase phải khóa
repository identity, exact source revision và yêu cầu owner xác nhận primary
Domain.

Output của bước này là một Authorized Source Snapshot. Tất cả evidence,
citation và những lần Refresh sau đều phải quay về đúng snapshot đó.”

## Câu chuyển sang slide 11

“Đã khóa đúng source rồi, câu hỏi tiếp theo không phải là đọc hết — mà là phần
nào thực sự đáng trở thành knowledge?”

## Nguồn

- `AgentBase-MCP/docs/product/01-repository-understanding.md`
- `AgentBase-MCP/docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
