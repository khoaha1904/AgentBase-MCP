# 02 — Baseline and impact checkpoint

> Trạng thái: Owner đã chấp nhận one-repository-one-Domain và inheritance.

## High-level hiện tại

- Mỗi repository có đúng một Domain chính.
- Relation xuyên Domain không làm repository thuộc thêm Domain.
- High-level hiện còn nói monorepo có thể gắn từng subproject/phạm vi Ingest vào
  Domain tương ứng.

Hai ý đầu rõ ràng; ý monorepo có thể được hiểu thành một Git repository có nhiều
Domain, nên đang mâu thuẫn với “mỗi repository đúng một Domain”.

## Baseline hiện tại

AgentBase đã có:

- canonical Domain concept `domains/<slug>`;
- optional `confirmed_domain` gồm exact identity/title;
- deterministic owner-guidance evidence cho xác nhận của người dùng;
- validation bắt một current-source **System** có `part-of → Domain`;
- query tự suy ra Domain scope qua chuỗi `part-of`;
- Repository concept và stable source repository ID độc lập với System/Domain.

Nguồn baseline:

- [Confirmed Domain validation](../../../src/core/knowledge/governance/confirmed-domain.ts)
- [Schema catalog](../../../src/core/knowledge/schemas/catalog.ts)
- [Hub prepare MCP input](../../../src/app/hub-okf/mcp/mcp-tools.ts)
- [Hub prepare runtime](../../../src/app/hub-okf/query/runtime-actions.ts)
- [Domain-scoped query graph](../../../src/core/knowledge/query/hub-query-graph.ts)
- [Repository source identity](../../../src/app/repository-okf/evidence/source-state.ts)

## Gap

Baseline chưa có repository-primary-Domain contract:

- Repository schema chưa có `part-of → Domain` guidance.
- Confirmed Domain validation chỉ kiểm tra System, không kiểm tra Repository.
- Một repository có thể prepare nhiều proposal với các confirmed Domain khác
  nhau mà không có mismatch warning.
- Runtime không đọc README/docs hoặc so sánh candidate với Domain hiện có; host
  phải truyền exact confirmed Domain vào `prepare_hub_okf`.
- Batch confirmation chưa có workflow chung.
- Một subfolder trong Git monorepo được normalize về Git root, nên hiện không có
  Repository ID riêng cho từng subproject.

## Phần tái sử dụng được

- Domain identity, owner guidance, System `part-of` validation và query scoping.
- Repository concept/source identity và entity-centered graph.
- Existing Hub search có thể liệt kê/match Domain trước khi prepare.
- Host skill có thể đọc bounded README/docs và điều phối batch; không cần model
  SDK hoặc một Domain-classification service trong runtime.

## Đề xuất tối thiểu

1. Giữ đúng quyết định một repository có một primary Domain.
2. Lưu assignment bằng evidenced `Repository part-of → Domain` relation; không
   tạo metadata registry hoặc side database mới.
3. Lần đầu Ingest yêu cầu owner confirmation. Refresh phải khớp assignment đã
   Published/Local Draft; mismatch chỉ cảnh báo và dừng để người dùng sửa.
4. Host skill đọc bounded root README/docs, search Domain hiện có, trình bày
   candidate/mismatch và chỉ gọi prepare sau xác nhận.
5. Batch dùng cùng preflight cho từng repository rồi xác nhận một matrix; chưa
   cần thêm batch MCP tool.
6. Mọi subproject trong một Git repository **kế thừa primary Domain của
   repository**. Subproject chỉ là evidence/query scope, không có Repository ID
   hoặc Domain assignment riêng.
7. Concept/relation vẫn có thể nối sang Domain khác; điều đó không đổi primary
   Domain của repository.

Repository `part-of` giúp domain query hiện tại tái sử dụng graph derivation.
Existing Repository concept chưa có edge được bổ sung dần bằng Refresh; không
bulk-migrate Hub. Nếu concept được bảo vệ/human-authored, Agent không tự sửa;
nó báo maintainer thực hiện explicit reviewed correction và không tạo bản sao.

## Impact

- Domain suggestion/confirmation skill: **Contained change**.
- Repository `part-of` schema + validation: **Contained change**.
- Batch preflight do host skill điều phối: **Contained change**.
- Cho subproject có Domain/Repository identity riêng: **Broad change** qua source
  identity, graph binding, evidence URI, refresh và Hub validation.

## Quyết định đã chốt

Mọi subproject trong một Git repository kế thừa đúng một primary Domain.
Subproject chỉ là evidence/query scope; multi-domain Repository identity riêng
không thuộc phiên bản đầu. Cross-domain concept/relation vẫn được phép và không
đổi primary Domain của repository.

Impact sau quyết định: **Contained change**.
