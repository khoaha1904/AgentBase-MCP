# 06.02 — External resource identity and matching

> Trạng thái: Technical design draft; provider adapters và runtime validation chưa implement.

## Quyết định ngắn

Concept giữ provider-neutral role. Identity thật do platform cấp được lưu như
optional external identity metadata; Terraform address chỉ là source evidence,
không được giả thành deployed identity.

```text
Concept: Interface / Function / Component / Resource
External identity: AWS ARN, Azure resource ID, ...
Source declaration: repository path + Terraform address/evidence
```

Ba lớp này không thay thế lẫn nhau. AWS metadata không tạo schema `SQS`, `EC2`
hay `Lambda` riêng.

## Portable envelope

External identities thuộc concept tại `agentbase.external_identities[]`. Common
contract gồm:

| Field | Ý nghĩa |
|---|---|
| `provider` | Provider namespace, ví dụ `aws`, `azure`, `gcp`. |
| `identity_type` | Loại native locator do provider profile hiểu, ví dụ `arn`. |
| `value` | Exact normalized provider-issued identity. |
| `service` | Provider service, chỉ là technology metadata. |
| `resource_type` | Provider-native resource type, không phải Concept Schema. |
| `scope` | Bounded string metadata cần để định danh, ví dụ account/region. |
| `evidence` | Non-empty source IDs chứng minh identity này. |
| `observed_at` | Thời điểm observation khi nguồn là provider runtime. |

Ví dụ để minh họa shape, không phải schema riêng cho AWS:

```yaml
agentbase:
  external_identities:
    - provider: aws
      identity_type: arn
      value: arn:aws:sqs:ap-southeast-1:123456789012:vehicle-events
      service: sqs
      resource_type: queue
      scope:
        account_id: "123456789012"
        region: ap-southeast-1
      evidence: [aws-queue-observation]
      observed_at: 2026-08-22T08:00:00Z
```

Core chỉ sở hữu bounded envelope, provenance và duplicate safety. Provider
profile sở hữu parsing, normalization, required scope keys và consistency giữa
`value` với `scope`. Unknown provider identity vẫn readable nhưng không được
AgentBase dùng để auto-match khi thiếu released profile.

## Matching key

- Với globally unique native ID như exact ARN: key là normalized
  `provider + identity_type + value`; parsed scope phải khớp metadata.
- Với provider ID chỉ unique trong một scope: key còn bao gồm mọi scope field mà
  released provider profile yêu cầu.
- Hai entries có cùng strong key là identity match candidate mạnh, không phải
  lệnh auto-merge concepts.
- Cùng display name, variable name, endpoint label hoặc resource name mà thiếu
  complete scope không phải strong key.
- Không tự match deployments thuộc hai providers khác nhau chỉ vì chúng có cùng
  role hoặc tên.

Một strong identity match chỉ trả lời “cùng resource”. Canonical relation vẫn
cần interaction evidence theo phần 06.01. Hai Published concepts cùng giữ một
strong key tạo conflict cần explicit merge review; validator không âm thầm chọn
concept thắng.

## Account và region

Account/project/subscription và region/location không phải secret. Chúng được
lưu khi cần cho identity, review và bounded provider lookup.

Scope precedence:

1. parse từ provider-native identity;
2. exact IaC/provider configuration có evidence;
3. owner-confirmed Domain Enrichment input;
4. bounded provider observation.

CLI default profile/region đứng riêng không được coi là knowledge truth. Nếu
resource type cần region nhưng candidate chưa xác định region, verification trả
về unresolved Question thay vì thử lần lượt nhiều regions. Global provider
resource dùng explicit profile rule; không gán tùy tiện một region mặc định.

## IaC resource chưa deploy

Một Terraform/Terragrunt resource chưa có provider-issued ID vẫn có thể tạo
concept dựa trên code nếu nó vượt qua concept qualification. Nó giữ:

- normal `repository://` source references;
- source-native address hoặc module/input/output chain trong candidate evidence;
- provider/service/resource-type technology metadata khi detector chứng minh.

Nó không có `external_identities` entry cho tới khi native identity được quan
sát. Domain Enrichment có thể thêm identity sau bằng một proposal; không cần đổi
concept ID hoặc schema.

## Nhiều identities trên một concept

Một concept có thể có nhiều entries khi nó đại diện một logical capability với
nhiều deployments, regions hoặc provider-native aliases. Mỗi entry cần evidence
riêng. Entries cũ không còn đúng không được giữ như current alias; supersede/
history thuộc phần 06.05 và Git history.

Quy tắc quyết định khi nào nhiều deployments vẫn là một concept thuộc phần
06.06. External identity không tự quyết định concept granularity.

## Security và giới hạn

- Cho phép provider resource IDs, account/project/subscription IDs, region và
  non-sensitive resource names mà người có quyền Hub được phép đọc.
- Không lưu credential, token, signed URL, connection string hoặc provider
  response dump.
- Secret-like identity value bị từ chối tại trust boundary.
- Provider lookup chỉ target exact candidate; metadata này không cấp quyền scan.

## Baseline impact

Đây là **Broad change** khi implement vì cần một portable metadata validator,
provider-profile normalization, Hub-wide duplicate detection và query summary.
Không cần database, new Concept Schema hoặc migration bắt buộc: field là optional
và concepts chưa được enrichment tiếp tục valid.

