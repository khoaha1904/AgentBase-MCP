# 14.03 — Task Planning context qualification

> Trạng thái: benchmark đã implement; real pair còn incomplete vì evidence
> trace và model quota, chưa được coi là product proof.

## Mục tiêu

Kiểm chứng một User Story có thể được break thành implementation tasks tốt hơn
khi developer cho phép AgentBase đọc local Code Graph/source, so với chỉ có
tracker context. Đây là qualification của context, không phải task generator
hay `agentbase-add-context`.

## Boundary

- Feature/US và relations đến từ read-only tracker fixture.
- Assisted arm được bind đúng một local Git repository, index lazy qua MCP và
  đọc bounded architecture/search/trace/snippet evidence.
- Direct arm không có AgentBase MCP và không có source checkout.
- Cả hai arm trả cùng một structured task plan; runner chỉ validate, score và
  lưu evidence, không tự tạo task.
- Hub overview có thể xác định scope nhưng không thay thế exact source cho
  file/symbol/dependency. Phase này tập trung đo giá trị của Code Graph.

## Điều kiện đúng

Task plan phải chia đúng boundary backend route, ECS/ALB health-check wiring,
consumer compatibility và verification. Mỗi claim implementation phải có
path/line/revision evidence hoặc giữ thành question; không được biến live
deployment/rollback thành fact. Critical correctness không thể được bù bằng
nhiều task, tốc độ hay token thấp hơn.

## Impact

- Query/ingest/Hub/public `abs`: không đổi.
- Task Planning của developer: thêm một bước index/reuse Code Graph khi cần,
  nên mất thời gian lần đầu và dùng local CPU/cache; không clone hay publish
  source.
- Benchmark: thêm một suite và kết quả A/B; real pair vẫn cần owner review.
- Scope: không khóa AgentBase vào ECS; scenario chỉ là AWS/Terraform fixture.

## Non-goals

Không tạo context packet, không lưu source vào Hub, không thêm skill/MCP tool,
không tự sửa code, không yêu cầu BA/PO clone repository, không chứng minh task
plan của mọi ngôn ngữ/provider từ một fixture.
