# 01.02 — Code Graph lifecycle

> Trạng thái: Local managed graph lifecycle và lazy host routing implemented.

## Quyết định

Code Graph có process/session tạm thời và cache local có thể tái sử dụng. Graph
không phải Hub knowledge và không được publish. Một Git root là một graph unit:
monorepo dùng một graph, còn các Git repository độc lập không dùng chung graph.

```text
bắt đầu workflow cần exact source
        ↓
kiểm tra repository identity + source state + engine identity
        ↓
fresh → reuse cache        changed/forced → refresh graph
        ↓
nhiều bounded queries trong cùng repository run
        ↓
đóng process/session; giữ cache và freshness receipt
```

## Identity và freshness

- Mỗi repository/provider workspace có namespace local riêng.
- Freshness dựa trên repository identity, commit hoặc dirty digest, graph engine
  identity và cache namespace.
- Source không đổi thì reuse graph; source đổi, receipt không hợp lệ hoặc owner
  yêu cầu refresh thì index lại.
- Reuse chỉ bỏ qua indexing. Query và source-integrity checks vẫn chạy.

## Lifetime

- Việc mở workspace hoặc query Published Hub không tự tạo graph.
- Một repository evidence round bind đúng một repository root.
- Agent được query nhiều lần trong round; nếu workflow cần repo khác, session cũ
  phải đóng sạch trước khi bind repo tiếp theo.
- Provider process/session phải đóng ở success, failure và cancellation.
- Cache và freshness receipt được giữ ngoài authored source để lần sau reuse.
- Cache mất hoặc hỏng chỉ làm graph phải rebuild; không làm mất Hub knowledge.

## Boundary

- Không watcher hoặc daemon mặc định.
- Không prebuild mọi graph trong workspace và không gộp nhiều graph.
- Không copy raw graph, provider cache hoặc freshness receipt vào Local Draft/Hub.
- Không clone remote repository để tạo graph.
- Không reuse graph giữa hai repository identity chỉ vì source trông giống nhau.
- Failed refresh không được giả vờ cache mới là fresh; caller nhận failure rõ và
  có thể retry explicit.

## Baseline reuse

Thiết kế giữ nguyên managed provider workspace, graph freshness receipt và
cleanup contract hiện tại. Low-level implementation chỉ cần để umbrella skill
định tuyến đúng lifecycle; không cần một cache manager mới.
