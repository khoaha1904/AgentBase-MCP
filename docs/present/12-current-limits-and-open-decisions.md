# 12 — Giới hạn và phạm vi của phiên bản đầu

> Trạng thái: MVP boundary đã chốt, implement và audit offline sau khi đồng bộ
> đủ 12 phần.

## Câu trả lời ngắn

Phiên bản đầu ưu tiên Hub overview, Published-only query và provenance. Không
cấu hình Remote Hub thì AgentBase chỉ dùng Code Graph/workspace Scan.

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

## Phần còn deferred

- Provider profiles ngoài bounded AWS/SQS Domain Enrichment hiện tại.
- Batch Refresh và mixed Init/Refresh.
- Azure/GCP profile và semantic profile migration.
- Static HTML/graph review.
- Remote repository reader là capability ưu tiên đầu tiên ngay sau phase MVP.

Rich deterministic PR summary, independent Init PR, same-Repository
Init/Refresh stack và existing-PR reconciliation đã implement; chúng không còn
là deferred scope.
