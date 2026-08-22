# 03.02 — Concept qualification and identity

> Trạng thái: Identity/query-value qualification implemented.

## Qualification

Candidate chỉ thành concept khi có cả stable identity và independent query/link
value. Schema role, source file hoặc technology keyword không thay hai gate này.

## Identity precedence

Khi đối chiếu một candidate:

1. exact canonical concept identity đã được source/provenance xác nhận;
2. provider/source-native identity mạnh như Terraform address, API method+path,
   ARN hoặc provider+account+region+resource type+resource ID;
3. repository-scoped logical identity có stable contract/source anchor;
4. display name hoặc semantic similarity chỉ tạo match candidate, không xác
   nhận same entity.

Không có strong identity thì Agent không auto-merge. Nó có thể giữ separate
candidate/Question để Domain Enrichment xác minh sau.

## Canonical path và technical identity

Hub path là logical human-readable identity, ví dụ:

```text
resources/vehicle-events-queue
```

ARN, Terraform address, provider account/region hoặc API route là attributed
metadata/reference dùng cho matching. Chúng không thay canonical path và không
tạo provider-specific directory tree.

Một logical resource có thể có nhiều deployment identities theo environment hoặc
region; phần 06 sở hữu reconciliation/multi-region model, không giải quyết bằng
cách nhồi mọi ARN vào canonical path.

## Guards

- Cùng tên không có nghĩa cùng concept.
- Rename không tự tạo concept mới khi strong identity/continuity còn giữ được.
- Hai strong identities khác nhau không auto-merge vì prose trông giống nhau.
- Existing Published concept được enrich khi match chắc; protected content không
  bị rewrite chỉ vì candidate mới có metadata chi tiết hơn.
