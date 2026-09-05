# Slide 11 — Từ shared scope đến exact source

## Vai trò của slide

Giải thích knowledge hỗ trợ planning nhưng không thay thế source investigation.

## Thông điệp duy nhất

Knowledge thu hẹp repository và dependency cần xét; exact source quyết định task
thực sự phải thay đổi.

## Nội dung hiển thị

```text
FEATURE DISCOVERY HANDOFF
CUR Analyzer -> analyzer SQS -> backend consumer
owner decisions: shared identity · retry/redrive · alarm · recovery
              ↓
Lambdas + backend -> Code Graph -> exact source
              ↓
TASKS
queue identity · retry/redrive · operational visibility
```

## Lời thoại dự kiến

“Sau khi owner xác nhận shared queue identity, retry/redrive, alarm và recovery
ownership, Task Planning chọn đúng Lambdas và backend. Code Graph giúp tìm
producer, consumer và dependency path, nhưng exact source mới quyết định file,
test và thay đổi. AgentBase cung cấp bounded context; planning workflow vẫn sở
hữu deliverable và approval của nó.”

## Câu chuyển

“Shared knowledge chỉ hữu ích lâu dài nếu source thay đổi hoặc lần ingest đầu còn
mỏng mà nó vẫn có đường phục hồi rõ ràng.”

## Nguồn

- `docs/product/07-ai-sdlc-context.md`
- `docs/capabilities/14-ai-sdlc-context/02-runtime-requirements.md`
