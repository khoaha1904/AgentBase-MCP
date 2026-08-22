# 11.03 — Dependency validation

> Trạng thái: Core structural validation implemented; Batch membership workflow designed.

## Outcome

Finalize chặn một proposal có cấu trúc gãy nhưng không đòi knowledge phải đầy
đủ. AI sửa editable draft và quyết định khi nào cần hỏi user; MCP Finalize chỉ
chạy deterministic validation trên exact bytes/evidence đã cung cấp.

## Hard dependencies

Thiếu một hard dependency làm Finalize fail:

- relation target hoặc Flow endpoint không tồn tại trong Published baseline hay
  final draft;
- Markdown link bắt buộc không resolve tới target tương ứng;
- Question/evidence reference unknown, ambiguous hoặc ngoài proposal authority;
- removal để lại direct relation, Flow step, Question reference hoặc governed
  navigation bị dangling;
- index trỏ tới file không tồn tại, duplicate target hoặc sửa protected lines;
- proposal sửa protected bytes, vượt source ownership hoặc có lifecycle intent
  thiếu reason/evidence/replacement bắt buộc.

MCP trả exact bounded failures. Nó không tự thêm lại item, tự xóa relation, tạo
Question hay sửa bundle để validation pass.

## Incomplete knowledge is allowed

Những điều sau không phải hard dependency khi cấu trúc vẫn hợp lệ:

- cross-repository relation chưa được xác nhận;
- provider/account/region/ARN chưa được quan sát;
- source coverage partial hoặc optional detail unavailable;
- conflict, Open Question hoặc Limitation còn tồn tại;
- chưa có đủ evidence để tạo một optional concept/relation.

Chúng được giữ thành attributed Question/Limitation hoặc đơn giản là chưa được
author. Finalize không biến completeness thành gate.

## AI and MCP responsibilities

```text
AI edits the authoring draft
        ↓
MCP Finalize validates exact structure and evidence
        ↓ deterministic failures
AI repairs mechanical issues or asks one bounded owner question
        ↓
MCP Finalize runs again
```

- AI tự sửa lỗi máy móc có một kết quả rõ: dangling index, relation vừa bỏ cùng
  target, Question reference cần bỏ theo item bị loại.
- AI hỏi user khi nhiều kết quả nghiệp vụ đều hợp lệ: relation cần giữ như
  external dependency hay bỏ, repo có thật sự rời batch/scope, hoặc evidence
  cạnh tranh làm thay đổi meaning.
- Nếu chưa cần quyết định để proposal hợp lệ, AI giữ Question/Limitation thay vì
  ngắt flow chỉ để làm dữ liệu đầy đủ hơn.
- Finalize không gọi model, không tự reasoning và không tự retry.

## Removing one repository from a batch

Trước execution, user sửa confirmed membership tự do. Sau khi draft đã có:

1. user xác nhận loại repository khỏi batch;
2. AI bỏ contributions thuộc repository đó khỏi editable workspace;
3. relation/Flow/Question/index còn lại được kiểm tra với Published baseline và
   final batch membership;
4. mechanical dangling references được sửa; ambiguous business dependency mới
   hỏi user;
5. MCP Finalize lại toàn bundle;
6. chỉ final atomic membership mới trở thành proposal, Accept và PR.

Nếu concept target đã Published, relation có thể giữ với provenance đúng. Nếu
target chỉ tồn tại trong repository bị loại, relation phải bỏ hoặc batch phải
giữ repository; không được tạo placeholder concept để qua gate.

## Publication dependency

Finalize dependency là dependency nội dung bên trong proposal. Trước PR, MCP
kiểm tra thêm publication dependency giữa accepted proposals:

- independent Repository Init bắt đầu từ Published `main`;
- Refresh phụ thuộc proposal trước của cùng Repository;
- Local Draft storage order không tạo dependency giữa repository khác nhau;
- selected proposal không được cắt thành item subset lúc Publish.

## Current implementation gap

Single-repository proposal đã validate relationship/Flow targets, links,
Question evidence, protected bytes, additive indexes và lifecycle intent. Batch
Ingest cùng bước AI-guided membership removal chưa implement; không cần thêm
dependency graph database hoặc solver khi triển khai.
