# 06.06 — Multi-region resources

> Trạng thái: Technical design đã chốt; deployment-aware enrichment chưa implement.

## Quyết định ngắn

Region là deployment scope, không phải Domain hoặc Concept Schema. Một logical
capability mặc định giữ một concept với nhiều external identity entries; chỉ
tách khi từng deployment có ownership, lifecycle, behavior hoặc query value độc
lập.

```text
Vehicle Events (Interface concept)
  ├─ AWS deployment: account A / ap-southeast-1 / ARN 1
  └─ AWS deployment: account A / eu-west-1      / ARN 2
```

Hai ARN khác nhau chứng minh hai deployed resources, không tự quyết định chúng
là một hay hai logical concepts.

## Giữ một concept khi

- cùng purpose và external contract;
- cùng owner và lifecycle/release policy;
- chỉ là replicas hoặc regional deployments của một logical capability;
- người dùng thường query ở logical level;
- khác biệt region có thể trình bày ngắn bằng deployment references.

Concept giữ one provider-neutral overview. Mỗi deployment là một
`agentbase.external_identities[]` entry riêng với exact account/region/native
identity và evidence theo 06.02.

## Tách concepts khi

- deployments có owners hoặc release/lifecycle độc lập;
- consumers, contracts, data classification/residency hoặc failure behavior
  khác nhau đáng kể;
- một deployment có giá trị query/navigation độc lập;
- relation chỉ đúng cho một deployment và nếu giữ chung sẽ tạo claim sai;
- provider evidence cho thấy đây là resources khác vai trò, không chỉ replicas.

Concepts sau khi tách vẫn dùng cùng provider-neutral schema và có thể liên kết
bằng canonical relation phù hợp. Không tạo schema `RegionalQueue`, `AWSQueue`
hoặc một Domain cho từng region.

## Relation scope

Canonical relation hiện không có region selector:

- relation đúng ở logical level được ghi giữa logical concepts;
- deployment-specific detail nhỏ được giữ trong overview/evidence;
- nếu deployment-specific relation quan trọng cho query hoặc nếu unscoped edge
  sẽ gây hiểu sai, split endpoint concept trước rồi mới ghi relation;
- không mở rộng relation schema bằng arbitrary scope expression trong MVP.

Cách này ưu tiên graph nhỏ và đúng hơn một graph chi tiết nhưng mơ hồ.

## Verification

- Mỗi regional candidate phải có explicit/evidenced region trước provider call.
- MCP không dùng CLI default region làm truth và không thử nhiều regions.
- Provider verification xử lý từng exact deployment identity tuần tự.
- Account + region + scoped native ID phải consistent với provider profile.
- Global resource dùng explicit provider `global` scope rule; không gán một
  region giả để thỏa schema.

## Refresh và Enrichment

- Thêm deployment mới bổ sung external identity entry với provenance.
- Không thấy deployment trong lần đọc sau không tự xóa entry.
- Removal cần provider/source evidence và explicit destructive intent.
- Deployment được thay thế giữ history qua Git và ordinary correction/removal proposal; ID cũ không
  tiếp tục được trình bày như current alias.
- Nếu evidence mới chứng minh deployments đã có independent query value,
  Enrichment có thể propose split; reverse merge của Published concepts được
  giữ thành Question vì merge/redirect là post-MVP.

## Ví dụ

| Trường hợp | Representation |
|---|---|
| Một Lambda workload deploy cùng contract ở hai regions để HA | Một Function concept, hai external identities. |
| Hai regional queues có consumers và retention policy độc lập | Hai concepts nếu cần query riêng. |
| Cùng queue name ở hai regions | Hai deployment identities; tên giống không phải same-resource match. |
| Một global IAM role | Một external identity với provider-defined global scope. |

## Baseline impact

Đây là **Contained change sau 06.02**. Không cần Region entity, deployment graph,
new schema hoặc provider-specific concept tree. Independent deployment concepts
chỉ xuất hiện khi concept qualification hiện tại chứng minh query value.
