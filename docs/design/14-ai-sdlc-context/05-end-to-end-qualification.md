# 14.05 — End-to-end A/B qualification

> Status: Runner is implemented; real pair `2026-08-29T05-45-00Z` reached
> deterministic `needs_review` and owner review remains pending.

## Goal

Measure the difference of the compact `Feature → US → Tasks` lifecycle between:

- **without AgentBase**: Feature and tracker context only;
- **with AgentBase**: same input, with Published Hub and local Code Graph/source
  query when needed.

This is aggregate measurement after isolated Phase 1 and Phase 2 tests. It does
not replace them: the result is broader but harder to attribute per phase.

## Boundary và impact

- Một model run tạo cả normalized US và task plan; không dùng US được tạo ở arm
  kia.
- Existing tracker US không được đọc, để đo việc Feature có chuyển thành US hay
  không. Output chỉ là benchmark draft, không tự publish.
- Full arm vẫn chỉ bind một source repo và dùng các MCP tool hiện có; không thêm
  context packet, skill, schema, query engine hoặc storage.
- Ingest/Hub/public `abs` không đổi. Chạy full arm tốn thêm thời gian index và
  model tokens; scope fixture vẫn AWS/Terraform, không phải cam kết universal.

## Gate

Hai arm có cùng Feature, tracker artifacts được phép đọc, prompt, model và
output schema. Full arm phải giữ evidence/limitation. Pass chỉ khi không giảm
critical US/task quality và có ít nhất một important improvement; real run cần
owner review.

## Kết quả đầu tiên

Với fixture ECS/Terraform, hai arm giữ cùng hai critical outcomes. Full arm thêm
hai important outcomes: boundary source cụ thể và quyết định compatibility cho
`/status`; không có unsupported claim. Nó dùng một Hub search, bốn Hub reads và
21 graph calls trong bound 24. Đây là tín hiệu end-to-end tốt hơn baseline,
nhưng chưa phải bằng chứng universal hay quyết định productization.
