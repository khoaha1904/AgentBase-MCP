# 04 — MCP lựa chọn schema cho concept thế nào?

> Trạng thái: Catalog 7 và AWS Terraform/Terragrunt guidance đã implement.

## Câu trả lời ngắn

Schema mô tả một ranh giới knowledge hữu ích. Provider/product chỉ là metadata;
resource nội bộ thường được nhúng trong concept cha.

Catalog 7 có tám role cho Initial Ingest:

`Repository`, `Domain`, `System`, `Component`, `Function`, `Interface`, `Flow`
và `Resource`.

`Function` phù hợp với một Lambda có runtime boundary riêng. SQS, SNS, table,
bucket, load balancer hoặc host thường nằm trong `Embedded Knowledge` của
Function/Component/System. Chỉ promote thành `Interface` hoặc `Resource` khi có
shared contract, ownership, lifecycle hay operational value độc lập.

## Agent ánh xạ công nghệ thế nào?

- **Cloud Provider Profile** hiểu resource của AWS, Azure hoặc GCP.
- **Detector Profile** hiểu cách source khai báo resource, ví dụ Terraform.
- **Repository evidence** chứng minh dự án thực sự dùng resource đó.
- **Tài liệu chính thức** chỉ giúp Agent hiểu field và behavior; nó không chứng
  minh repository đang dùng công nghệ đó.

```text
aws_lambda_function → Function concept + AWS/Lambda metadata
aws_sqs_queue       → embedded queue knowledge trong parent
aws_dynamodb_table  → embedded table knowledge trong parent
```

Người dùng gọi một skill Ingest chung; Agent tự chọn profile phù hợp. Khi cần
kiểm tra resource thật, người dùng login CLI và cho phép Provider Verification
read-only. MCP không login hoặc lưu credential.

## Một concept, một schema

Một workload dùng một Queue không bắt buộc tạo hai concept. Queue chỉ có file
riêng khi nó vượt qua promotion gate; nếu không, parent vẫn giữ role, technology
và exact sources của Queue trong bảng embedded knowledge.

Nếu bằng chứng chưa đủ cho schema cụ thể, Agent dùng schema chung hơn kèm
limitation. Nếu vẫn không chắc, Agent giữ Question thay vì đoán.

## Phạm vi hiện tại

- Mỗi concept có đúng một schema provider-neutral.
- AWS Profile v2 và Terraform-family Detector v1 đã có; Terraform và Terragrunt
  được nhận diện, SAM/CloudFormation/YAML chưa hỗ trợ trong MVP.
- Catalog, Cloud Provider Profile và Detector Profile có version độc lập. Đổi
  mapping AWS/Terraform không tự làm thay đổi schema catalog hoặc buộc toàn Hub
  Refresh.
- Profile upgrade chỉ thêm mapping hoặc documentation không cần migration. Nếu
  sửa mapping đã tạo Published knowledge, MCP tạo một Hub Migration Draft cho
  toàn bộ concept bị ảnh hưởng; maintainer review và merge một migration PR.
- Migration thiếu evidence không tự reclassify concept. Nó giữ knowledge hiện
  tại và tạo Question để Refresh hoặc Domain Enrichment xử lý.
- Catalog `7.0.0` đã clean-cutover từ thiết kế catalog 6 phức tạp hơn. Type cũ
  vẫn readable theo open-world compatibility nhưng AgentBase không author mới.
- AgentBase không author type đã retired; foreign unknown OKF types vẫn được đọc
  và bảo toàn theo open-world compatibility.
- Azure/GCP profile, semantic profile migration và provider verification vẫn là
  phần mở rộng sau MVP.
