# 04.01 — Provider-neutral catalog 7

> Trạng thái: Implemented.

## Initial Ingest roles

| Role | Boundary |
|---|---|
| Repository | Canonical source ownership/observation |
| Domain | Owner-confirmed business grouping |
| System | Recognizable capability composed from cooperating concepts |
| Component | Independently useful workload or software boundary |
| Function | Independently triggered/deployed function boundary |
| Interface | Shared API/event/resource contract |
| Flow | Cross-concept sequence with query/navigation value |
| Resource | Independently operated/shared resource boundary |

Entity và Metric là enrichment-only. Provider products không tạo schema mới.

## Service-level runtime relations

`System` là boundary đủ dùng cho một service khi không có workload con độc lập
cần thành `Component`. Trong trường hợp đó, System có thể khai báo
`consumes -> Interface` bằng exact runtime-call/subscription evidence. Không tạo
Component trùng lặp chỉ để mang relation, và không mở rộng thành một
`depends-on` System tổng quát.

## Embedded knowledge

Queue, topic, event bus, table, bucket, database, load balancer và host mặc định
nằm trong Function/Component/System parent. Một embedded item giữ:

- display name và concise role;
- provider-neutral kind;
- optional provider/product/source-tool/resource-type metadata;
- exact evidence sources.

Nó chưa có concept ID, file riêng hoặc graph edge. Promote sang Interface hoặc
Resource chỉ khi có evidence về shared contract, ownership, lifecycle,
operational boundary hoặc independent query value.

## Technology metadata

```yaml
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_lambda_function
```

Metadata chỉ mô tả implementation evidence; Terraform vẫn là desired state và
không chứng minh deployment/account/region/ARN hiện tại.
