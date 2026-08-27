# 06.08 — Mock provider qualification

> Trạng thái: implemented trong capability 053; không có production mock mode.

## Mục đích

Mock qualification kiểm chứng Domain Enrichment khi topology cần test chưa có
AWS account hoặc Published Domain đủ rộng. Nó kiểm tra candidate manifest,
provider adapter, reconciliation, Question outcome và proposal lifecycle; nó
không thay thế real-provider qualification.

## Boundary

```text
source/Published evidence
        ↓
bounded relation hypothesis + confidence
        ↓
temporary Published fixture + exact candidate manifest
        ↓
deterministic mock AWS CLI response
        ↓
existing SQS adapter → reconciliation → Enrichment proposal
```

- Harness được gọi trực tiếp trong test/qualification script, không mở thêm
  public MCP tool hoặc `--mock` production flag.
- Mock process runner phải nhận đúng argv mà `AwsCliAdapter` phát hành và trả
  shape tương ứng với `--version`, STS caller identity, get-queue-url và
  get-queue-attributes.
- Fixture values dùng account/region/name/ARN deterministic và dễ nhận biết là
  test data. Không gọi network, không đọc credential và không scan account.
- Candidate hypothesis ghi source evidence IDs, owning repository, predicate,
  confidence và limitation. Tên/ARN được mock không biến hypothesis thành fact.

## Fixture contract

Một fixture tối thiểu có:

1. một Domain đã Published trong temporary Hub;
2. ít nhất hai Repository thuộc Domain;
3. source concepts/Questions có identity và interaction evidence hợp lệ;
4. một hoặc nhiều shared queue candidates với cùng name/account/region;
5. response map cho confirmed, expected-ARN mismatch, unavailable/denied và
   retryable failure;
6. expected proposal assertions: external identity, canonical relation,
   Question state và unchanged Published base.

Fixture Crawler-shaped có thể dùng các concept `crawler-events`,
`crawler-results` và `crawler-review` đã xuất hiện trong offline E2E; nó không
được nhầm là dữ liệu thật của Crawler Domain.

## Candidate investigation

Investigation chỉ là bước bounded trước khi tạo fixture:

- đọc Published/source references đã chọn;
- gom các tên queue/endpoint trùng hoặc liên quan;
- đối chiếu producer/consumer evidence và gán confidence;
- đưa candidate chưa chắc vào Question thay vì tự tạo Resource/edge.

Không xây generic cross-repository inference engine, không list provider account,
không suy ra ARN thật từ tên và không tự Accept/Publish.

## Safety and recovery

Mock state nằm trong temporary test root hoặc qualification artifact riêng. Nếu
fixture sai, xóa/recreate artifact không ảnh hưởng canonical Hub. Mock harness
chỉ chạy tới proposal/inspection trong temporary state; nó không gọi Accept hoặc
Publish. Production MCP tools tiếp tục không có mock mode, nên mock observation
không đi vào canonical publication path.

## Verification

Capability phải chứng minh cùng một adapter/reconciliation path xử lý:

- confirmed shared queue và nhiều source repositories;
- rejected identity khi ARN không khớp expected value;
- unresolved access/not-found limitation;
- retryable failure rồi retry thành công;
- proposal có relation/identity/Question changes nhưng Published fixture trước
  Accept không đổi.
