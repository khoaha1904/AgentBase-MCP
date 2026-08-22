# 12 — Giới hạn và phạm vi của phiên bản đầu

> Trạng thái: Đã đồng bộ với MVP catalog 7 và qualification 2026-08-22.

## Câu trả lời ngắn

Phiên bản đầu ưu tiên Hub overview, local-first và có provenance. Nó chấp nhận
một số giới hạn để tránh đồng bộ, phân quyền và automation quá sớm.

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
- Publication hiện chỉ target configured `main`; chưa có stacked Init/Refresh PR.
- PR body chưa thay thế được owner review bằng một summary template đầy đủ.

## Quyết định high-level

Không còn điểm mở. Canonical repository dùng Repository ID ổn định: rename,
move hoặc clone cùng lineage vẫn là repository cũ; fork độc lập là repository
mới; mirror/copy mơ hồ phải được người dùng xác nhận.

## Phần còn deferred

- Provider Verification/Domain Enrichment skill.
- Batch checkpoint, query overlay và freshness report.
- Azure/GCP profile và semantic profile migration.
- Rich PR template và stacked proposal publication.
