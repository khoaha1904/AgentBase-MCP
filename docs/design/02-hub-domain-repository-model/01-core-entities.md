# 02.01 — Core entities and ownership

> Trạng thái: Core Hub/Domain/Repository ownership implemented.

## Entity model

| Entity | Canonical identity | Ý nghĩa |
|---|---|---|
| Hub | admitted local/remote Hub identity | một knowledge graph dùng chung |
| Domain | `domains/<slug>` | business boundary được owner xác nhận |
| Repository | `repositories/<slug>` | source repository và development contract |
| System | `systems/<slug>` | capability do software/infrastructure phối hợp |
| Component/interface/resource | role-oriented canonical path | knowledge unit độc lập |

Source `repository-...` ID và Repository concept path là hai identity khác nhau.
Repository concept đại diện source bằng `repository://<repository-id>/...`
evidence; continuity theo source ID phải resolve về đúng một Repository concept.

## Primary Domain

Repository concept giữ đúng một evidenced relation:

```yaml
relationships:
  - kind: part-of
    target: domains/crawler
    evidence: [owner-domain]
```

`owner-domain` trỏ tới deterministic `agentbase://owner-guidance/domains/...`.
Không thêm `primaryDomain` registry, sidecar hoặc duplicate Repository theo
Domain.

System vẫn có `part-of → Domain` riêng. Component/resource lấy Domain qua chuỗi
`part-of`; `implemented-in → Repository` biểu diễn source ownership nhưng không
truyền Domain membership.

## Validation delta

- Repository schema cho phép đúng một `part-of` target type Domain.
- Confirmed-Domain finalization yêu cầu Repository concept hiện diện, cite current
  source và có matching owner-evidenced edge.
- System được tạo trong proposal vẫn cần Domain relation khi evidence hỗ trợ.
- Existing mutable AgentBase Repository chưa có edge được bổ sung bằng Refresh,
  không bulk migrate.
- Human-authored/verified Repository không được rewrite. Missing/mismatched
  assignment chặn proposal và yêu cầu explicit maintainer-reviewed correction;
  không tạo shadow Repository để né protected-content rule.
