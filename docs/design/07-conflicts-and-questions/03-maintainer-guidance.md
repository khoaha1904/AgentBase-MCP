# 07.03 — Maintainer Guidance

> Trạng thái: Exact subject-property transaction đã implement; broad scope deferred.

## Quyết định ngắn

Maintainer Guidance là attributed human knowledge, không phải absolute truth.
Trong MVP nó chỉ áp dụng cho exact Question subject/property.

## Khi nào tạo Guidance

- Human trả lời một Question hoặc đưa ra explicit project decision.
- Answer bind exact Question ID/revision và `human:<identity>`.
- Provider/source evidence có thể resolve Question mà không tạo Maintainer
  Guidance; MCP không giả provider observation thành câu trả lời của con người.
- Model suggestion không trở thành Guidance cho tới khi human xác nhận.

Guidance là Markdown knowledge dưới `guidance/`, đi qua proposal, review, Accept
và Publish như concept/Question khác.

## Scope

| Scope | Áp dụng | Authority |
|---|---|---|
| `subject-property` | Exact concept/relation candidate và property đang hỏi | Default. |
| `repository` | Một canonical Repository ID | Không dùng trong MVP. |
| `domain` | Một canonical Domain ID | Không dùng trong MVP. |
| `hub` | Toàn Hub authority | Không dùng trong MVP. |

Không suy rộng từ wording như “thường”, “chắc là” hoặc từ việc nhiều
repositories đang dùng cùng một value. AI không tự nâng exact answer thành
Domain/Hub policy.

Quyết định rộng hơn được ghi bằng update có evidence vào Repository, Domain hoặc
System concept liên quan qua Proposal bình thường. MCP không tạo broad Guidance
scope engine.

## Guidance document

Một Guidance revision giữ:

- stable Question ID/revision và human identity;
- normalized scope kind/target;
- answer/decision ngắn gọn;
- evidence/reason do maintainer cung cấp nếu có;
- creation time và link trở lại Question.

Path hiện tại `guidance/<question-id>-r<revision>.md` được tái sử dụng. Question
trỏ tới active Guidance; older revisions vẫn đọc được cho history nhưng query
mặc định không trình bày chúng như current guidance.

## Conflict với evidence mới

- Evidence cùng hướng bổ sung provenance, không tạo bản Guidance giống hệt.
- Evidence mới mâu thuẫn chuyển Question sang `Needs Review`; active Guidance
  vẫn tồn tại nhưng được trình bày là contested.
- Human review có thể giữ Guidance, tạo revision thay thế hoặc thu hồi nó.
- Chỉ accepted revision mới đưa Question về `Resolved`.

Guidance không tự biến thành truth winner. Evidence mâu thuẫn tạo/giữ Question
thay vì engine âm thầm chọn một.

## Volatile values

Human có thể xác nhận một observed value, nhưng Guidance phải ghi rõ đó là user
evidence tại thời điểm/revision nào. Với value dễ stale, dùng observed snapshot
và file source theo phần 08; không biến số user nói thành timeless config
truth.

## Atomic answer transaction

Answer proposal phải atomically:

1. create new Guidance revision;
2. update Question state và active Guidance link;
3. include any related knowledge/relation update selected for cùng resolution.

Nếu proposal chưa Accept thì Published Question/Guidance không đổi. Stale
Question revision, invalid scope hoặc conflicting Hub base dừng trước mutation.

## Security và access

- Hub permission model hiện coi người đọc Hub được đọc toàn bộ Guidance.
- Không thêm per-project ACL hoặc redact theo Domain.
- Answer/Guidance không được chứa secret, credential hoặc signed URL.
- Trust boundary tái sử dụng obvious-secret detection của observed snapshots trước
  khi proposal được tạo; PR review vẫn là sensitivity gate cuối. Không xây DLP
  engine riêng.
- Human attribution là audit identity, không phải chữ ký mật mã hay permission
  escalation.

## Baseline impact

Reuse current Guidance renderer/path, explicit `human:*` attribution và proposal
lifecycle. Exact scope và atomic Question update không cần policy engine hoặc
rules database; Git giữ prior revision history.
