# 06.01 — Relation discovery

> Trạng thái: Canonical relation/candidate boundary và bounded AWS/SQS Domain Enrichment đã implement; broader inference deferred.

## Quyết định ngắn

Agent chỉ ghi canonical relation khi xác định được cả hai endpoint và có evidence
cho interaction. Dấu hiệu hợp lý nhưng chưa đủ được giữ thành relation candidate
kèm Question; suy đoán không có evidence bị bỏ.

```text
đủ endpoint identity + đủ interaction evidence → canonical relation
có evidence nhưng thiếu một trong hai          → candidate + Question
chỉ suy đoán                                    → không lưu
```

Không tạo placeholder concept hoặc dangling edge chỉ để graph trông đầy đủ.

## Hai lớp bằng chứng độc lập

### 1. Endpoint identity

Identity trả lời: **hai nguồn có đang nói về cùng một endpoint/resource không?**

Theo thứ tự mạnh đến yếu:

1. exact provider identity, ví dụ AWS ARN;
2. provider resource ID cùng scope cần thiết như account, region và service;
3. deterministic source chain như Terraform module input/output, remote-state
   output hoặc exact deploy reference;
4. endpoint/config reference có thể kiểm tra thêm;
5. display name, variable name hoặc resource name đứng riêng.

Ba nhóm đầu có thể support một strong match khi scope không mâu thuẫn. Hai nhóm
cuối chỉ tạo candidate. Exact rule cho portable external identity thuộc phần
`02-resource-identity-matching.md`.

### 2. Interaction evidence

Interaction trả lời: **source làm gì với target?** Ví dụ `publishes-to`,
`consumes`, `depends-on` hoặc `reads-from`.

Evidence có thể đến từ code, Terraform/Terragrunt, repository documentation,
configuration hoặc một bounded provider observation. ARN chỉ xác nhận endpoint;
nó không tự chứng minh Lambda publish, Service consume hay API gọi nhau.

Canonical relation cần source IDs thuộc concept sở hữu edge, đúng với validator
hiện tại. Nguồn chỉ mô tả identity mà không mô tả interaction không được dùng để
suy ra predicate.

## Behavior trong Ingest

Initial Ingest và Refresh chỉ điều tra repository đang được authorize:

- target đã có trong Published Hub/eligible Local Draft và strong match: có thể
  ghi relation ngay;
- current repository đủ evidence để promote một independently useful target
  concept trong cùng proposal: có thể tạo target và relation cùng lúc;
- interaction có evidence nhưng target chưa resolve chắc chắn: giữ candidate +
  Question;
- target có vẻ giống chỉ vì tên/prose: không auto-match;
- không có interaction evidence: không tạo relation candidate chỉ từ suy đoán.

Batch Ingest vẫn là nhiều lần Ingest cô lập chạy tuần tự. Nó không reconcile
candidates giữa các members và không trở thành Domain Enrichment ngầm.

## Candidate contract

Phần 06 chỉ yêu cầu một unresolved candidate giữ đủ ý nghĩa để xử lý sau:

- source concept identity;
- proposed canonical predicate;
- target hints đã quan sát, không tự chuẩn hóa thành canonical identity;
- source evidence cho interaction và từng identity hint;
- repository/source revision đã quan sát;
- reason chưa thể tạo canonical relation.

Question lifecycle, serialized shape và conflict presentation thuộc phần 07.
Candidate không được load như graph edge và không ảnh hưởng Domain membership.

## Behavior trong Domain Enrichment

Domain Enrichment đọc bounded candidates từ các repositories đã được người dùng
chọn. Nó có thể:

1. đối chiếu Published knowledge và evidence từ hai phía;
2. dùng deterministic IaC/config chain khi đã đủ;
3. sau khi người dùng tự login, gọi provider CLI read-only cho đúng candidate;
4. tạo canonical relation proposal khi endpoint và interaction đều đủ;
5. đóng, cập nhật hoặc giữ Question khi kết quả sai, mâu thuẫn hoặc vẫn thiếu.

Provider CLI là evidence bổ sung, không phải bước bắt buộc. MCP không scan toàn
account/region và verification không tự Accept hoặc Publish.

## Reuse và thay đổi tối thiểu

- Giữ canonical predicates, relation identity, evidence IDs, target/link
  validation và inbound traversal hiện tại.
- Canonical edge tiếp tục nằm trong `relationships` của source concept.
- Không thêm relation database, unresolved graph node hoặc inverse edge.
- Runtime mới về sau chỉ cần tạo/read candidates qua Question contract và promote
  candidate thành proposal edge sau khi validation thành công.

## Failure và recovery

- Target ambiguous hoặc provider permission thiếu: giữ Question với limitation;
  không downgrade thành một match theo tên.
- Identity match nhưng interaction chưa được chứng minh: có thể giữ identity
  candidate, không tạo relation.
- Interaction rõ nhưng target chưa xác định: giữ relation candidate, không tạo
  dangling edge.
- Provider observation mâu thuẫn source: giữ cả provenance và chuyển conflict
  sang phần 07; không chọn nguồn thắng trong phần 06.

## Ví dụ chấp nhận

| Evidence | Outcome |
|---|---|
| Cùng Queue ARN và Terraform/code chứng minh Function publish vào queue | Canonical `publishes-to` relation. |
| Cùng Queue ARN nhưng không có evidence Function sử dụng queue | Chỉ identity match; không có relation. |
| `EVENT_QUEUE_URL` và `crawler_queue` có vẻ liên quan nhưng chưa resolve | Candidate + Question. |
| Chỉ giống từ khóa `queue` trong hai repository | Không lưu relation. |
