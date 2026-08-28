# 12 — Giới hạn và phạm vi của phiên bản đầu

> Trạng thái: MVP boundary đã chốt, implement và audit offline sau khi đồng bộ
> đủ 12 phần.

## Câu trả lời ngắn

Phiên bản đầu ưu tiên Hub overview, Published-only query và provenance. Không
cấu hình Remote Hub thì AgentBase chỉ dùng Code Graph/workspace Scan.

MCP đã hoàn tất Capability 051 hardening trên domain Crawler: content
redaction, query failure visibility, provider contract qualification và giới
hạn ingest đo được. Semantic search vẫn là hướng mở rộng sau này.

## Giới hạn được chấp nhận trong phiên bản đầu

- Không có backup/shared Local Draft; máy hỏng có thể làm mất draft chưa
  publish.
- Reconciliation giảm relation bị bỏ sót nhưng không bảo đảm tìm hết khi các
  repository thiếu identity chung.
- Refresh một repository không đọc lại repository khác.
- Không có remote lock cho Initial Ingest; nếu trùng, bản đến sau bị hủy và tạo
  lại bằng Refresh.
- Không có remote auto-clone hoặc provider account/region scan toàn cục.
- Không có fine-grained ACL trong Hub; có quyền Hub thì đọc được toàn bộ
  Published knowledge.
- Structured IaC MVP hỗ trợ Terraform/Terragrunt; SAM/CloudFormation chưa hỗ trợ.
- Hub query chỉ đọc synchronized Published knowledge; Local Draft thuộc review.
- Question runtime dùng shared Hub documents; private state chỉ là cache có thể
  rebuild, không phải authority.
- Installer không hỏi Hub/token. `agentbase-hub` config URL, target branch và
  token sau; mỗi profile giữ Published/Draft state riêng.
- Một remote hoàn toàn rỗng được explicit Bootstrap thẳng target branch đúng một
  lần với `index.md`, README và CI. Sau đó mọi knowledge đều qua PR.

## Quyết định high-level

Không còn điểm mở. Canonical repository dùng Repository ID ổn định: rename,
move hoặc clone cùng lineage vẫn là repository cũ; fork độc lập là repository
mới; mirror/copy mơ hồ phải được người dùng xác nhận.

### Benchmark và local temporary storage

Benchmark data có một ownership boundary riêng tại sibling repository
`AgentBase-Benchmark`. Repo này giữ source checkout được pin, prompt bất biến,
suite/expectation và result theo thời gian. AgentBase-MCP chỉ giữ benchmark
engine/scorer và fixture nhỏ phục vụ product verification.

Các workspace tạm của benchmark, Code Graph và Hub lifecycle luôn nằm trong OS
temporary directory hoặc state root đã được workflow sở hữu, có prefix rõ và bị
dọn sau run. Không có dữ liệu benchmark lâu dài trong `tmp/`; chỉ `results/`
trong `AgentBase-Benchmark` là evidence được giữ lại. `npm run demo` và
`npm run verify` không phụ thuộc Benchmark checkout hay model-backed run.

Expected probe dùng ba mức `critical`, `important`, `optional`. Critical là
quality gate; hai mức còn lại được báo cáo riêng và chỉ đóng góp secondary
weighted diagnostic. Score không thay thế lifecycle/conformance hoặc human
review.

## Phần còn deferred

- Capability 044 trước hết chỉ migrate source/build của Codebase Memory và giữ
  diagram-design ở trạng thái chưa kích hoạt; không thêm UI hoặc tool mới.
- Source/build đã được xác minh trên Linux x64; macOS arm64 trong môi trường công
  ty vẫn là gate bắt buộc trước khi capability 044 được đóng.
- Remote repository reader có giới hạn, dùng token MCP cho GitHub/GitHub
  Enterprise và không clone/build graph cho repo remote.
- Published Hub graph là view local, read-only, dựng lại được từ OKF đã publish;
  không phải database hay nguồn sự thật thứ hai.
- Diagram theo query dùng diagram-design để tạo HTML/SVG local từ phần knowledge
  người dùng chọn; diagram không tự trở thành Hub knowledge.
- Provider profiles ngoài bounded AWS/SQS Domain Enrichment hiện tại.
- Batch Refresh và mixed Init/Refresh.
- Azure/GCP profile và semantic profile migration.

Semantic/vector search chỉ được xem xét sau khi lexical MiniSearch và graph
context có bộ đo relevance chứng minh chưa đủ; nó không phải fallback tự động.

Rich deterministic PR summary, independent Init PR, same-Repository
Init/Refresh stack và existing-PR reconciliation đã implement; chúng không còn
là deferred scope.
