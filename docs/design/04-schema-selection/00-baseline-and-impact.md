# 04 — Current baseline and impact

> Trạng thái: Catalog 7 implementation là current authority.

## Baseline hiện tại

- Catalog version: `7.0.0`.
- Initial Ingest roles: Repository, Domain, System, Component, Function,
  Interface, Flow và Resource.
- Entity/Metric chỉ thuộc enrichment; Question/Guidance do workflow quản lý.
- Guidance tách technology detection, standalone/embedded disposition và schema
  selection.
- OKF parser vẫn open-world: foreign/legacy type được đọc và bảo toàn.

## Điều đã thay đổi so với design ban đầu

Catalog 6 từng định nghĩa hơn 20 role như Server, Queue, Database Table và
Infrastructure Module. Benchmark cho thấy catalog rộng làm Agent tốn công chọn
schema và dễ promote implementation detail thành file concept. Catalog 7 thay
nó bằng tám boundary tổng quát; queue/table/bucket/host thường trở thành
embedded knowledge có technology metadata và exact evidence trong parent.

Đây là clean cutover vì chưa có catalog-6 concept Published. Code Graph, OKF
document model, relationships và Hub lifecycle được giữ nguyên.

## Gap còn lại

Azure/GCP profiles, SAM/CloudFormation detector, provider verification và
semantic profile migration chưa thuộc MVP hiện tại.
