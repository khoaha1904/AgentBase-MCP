# 01.02 — Code Graph lifecycle

> Trạng thái: Local managed graph lifecycle implemented.

## Quyết định

Code Graph có process/session tạm thời và cache local có thể tái sử dụng. Graph
không phải Hub knowledge và không được publish.

```text
bắt đầu Ingest/Refresh
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

- Một Ingest/Refresh run bind đúng một repository root.
- Agent được query nhiều lần trong run mà không đổi sang repository khác.
- Provider process/session phải đóng ở success, failure và cancellation.
- Cache và freshness receipt được giữ ngoài authored source để lần sau reuse.
- Cache mất hoặc hỏng chỉ làm graph phải rebuild; không làm mất Hub knowledge.

## Boundary

- Không watcher hoặc daemon mặc định.
- Không copy raw graph, provider cache hoặc freshness receipt vào Local Draft/Hub.
- Không clone remote repository để tạo graph.
- Không reuse graph giữa hai repository identity chỉ vì source trông giống nhau.
- Failed refresh không được giả vờ cache mới là fresh; caller nhận failure rõ và
  có thể retry explicit.

## Baseline reuse

Thiết kế giữ nguyên managed provider workspace, graph freshness receipt và
cleanup contract hiện tại. Low-level implementation chỉ cần để umbrella skill
định tuyến đúng lifecycle; không cần một cache manager mới.
