# 04 — Schema selection

> Trạng thái: Catalog 7 đã implement; catalog 6 design đã superseded.

High-level decision:
[MCP lựa chọn schema thế nào?](../../present/04-how-concept-schemas-are-selected.md)

## Phân rã

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — baseline, gap,
  impact và phạm vi clean cutover.
- [`01-provider-neutral-catalog.md`](01-provider-neutral-catalog.md) — catalog
  schema theo vai trò kiến trúc chung.
- [`02-selection-and-fallback.md`](02-selection-and-fallback.md) — pipeline chọn
  schema, fallback, limitation và Question.
- [`03-cloud-provider-profiles.md`](03-cloud-provider-profiles.md) — profile ánh
  xạ AWS product vào schema chung và metadata.
- [`04-source-detector-profiles.md`](04-source-detector-profiles.md) — detector
  cho Terraform và các source type về sau.
- [`05-catalog-cutover.md`](05-catalog-cutover.md) — thay catalog hiện tại và
  rebuild draft mà không có content migration.

## Current implementation

Catalog `7.0.0` giữ tám Initial Ingest roles: Repository, Domain, System,
Component, Function, Interface, Flow và Resource. Entity/Metric chỉ dùng cho
enrichment. AWS Profile v2 + Terraform-family Detector v1 tách technology khỏi
concept role; resource nội bộ mặc định embedded. Terraform/Terragrunt được hỗ
trợ, SAM/CloudFormation chưa hỗ trợ. Legacy/foreign type vẫn readable nhưng
AgentBase không author type đã retired.
