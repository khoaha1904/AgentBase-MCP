# 04.06 — Node eligibility and provider coverage

> Trạng thái: implemented và được kiểm chứng bằng conformance fixtures của
> capability 052.

## Node và concept

Concept là một knowledge instance được lưu bằng Markdown. Node là concept instance
được đưa vào Published graph projection. Governance documents và embedded rows
không phải node; Flow có thể là scenario node nhưng không được trộn mặc định với
architecture topology.

## Promotion gate

Candidate chỉ được author thành standalone node khi có đủ:

1. **Stable identity** — exact provider identity, scoped provider ID hoặc
   deterministic source identity (ví dụ Terraform address kèm source anchor).
2. **Independent query/link value** — người dùng hoặc concept khác có lý do độc
   lập để tìm/liên kết endpoint này.
3. **Boundary evidence** — lifecycle, ownership, permission, failure, scaling,
   security, cross-boundary usage hoặc contract evidence phù hợp với role.
4. **Interaction evidence khi tạo edge** — source chứng minh producer,
   consumer, trigger hoặc access; identity một mình không tạo relation.

Thiếu identity hoặc query value thì không tạo node. Có giá trị nhưng chưa đủ
boundary thì giữ embedded knowledge trong parent. Có evidence nhưng identity hoặc
interaction còn mơ hồ thì giữ candidate/Question. Không tạo placeholder node để
làm graph đầy hơn.

## Resource và Interface

- Queue/topic/bus là **Resource** khi đại diện hạ tầng vận hành hoặc integration
  boundary có identity và usage độc lập.
- API/event/message schema là **Interface** khi contract có consumer/producer value
  riêng.
- Một queue/topic (transport) không tự đại diện cho message/event schema
  (contract); hai concept chỉ tách khi cả hai cùng vượt gate.
- Lambda có deployment/trigger/failure boundary riêng thì là **Function**.
- IAM role, module nội bộ, handler, log group và resource packaging vẫn là
  embedded evidence trừ khi có boundary độc lập được chứng minh.

Ví dụ canonical topology:

```text
producer Function ──publishes-to──> queue Resource
consumer Function <──triggered-by── queue Resource
```

## Coverage rollout

Policy áp dụng cho mọi provider, nhưng conformance đầu tiên chỉ rollout nhóm AWS
phổ biến:

| Nhóm | AWS services | Role mặc định |
|---|---|---|
| Workload | Lambda | Function |
| Messaging | SQS, SNS, EventBridge | Resource khi shared/boundary đủ mạnh |
| Data | S3, DynamoDB, RDS | Resource khi lifecycle/usage độc lập |
| Hosting | EC2/VM | hosting evidence; không tự tạo Server node |

Mỗi service dùng cùng gate, relation vocabulary, external-identity envelope và
conformance scenarios. Profile chỉ sở hữu mapping technology, identity parsing
và source/provider evidence; profile không được tạo schema hoặc predicate riêng.

Provider mới (ví dụ GCP Pub/Sub, Cloud Storage, Cloud SQL) chỉ cần thêm profile,
parser và fixtures. Concept paths, `Resource`/`Interface` roles, canonical edges,
MiniSearch fields và projection schema không đổi. Mapping thay đổi trên knowledge
đã Published phải đi qua migration/Question review như các profile changes khác.

## Review và test impact

Bao phủ nhóm phổ biến giảm đáng kể phạm vi review so với toàn bộ AWS vì test được
tái sử dụng theo ba behavior families: workload, messaging và data. Mỗi service
chỉ thêm identity/interaction fixtures và mapping cases. Tuy vậy không coi đây là
phép nhân đơn giản theo số service: mỗi provider/resource vẫn phải kiểm tra IaC
identity, deployed identity, missing scope, ambiguous name, embedded fallback và
relation evidence.
