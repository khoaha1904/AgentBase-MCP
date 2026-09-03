# Slide 14 — Validate

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đào sâu stage 05 và chỉ rõ điều kiện để một workspace được trả về như proposal
có thể review.

## Thông điệp duy nhất

Proposal chỉ tồn tại khi citation, relation, schema và limits đều qua validation;
failure quay lại workspace sửa được, không tạo partial success mơ hồ.

## Nội dung hiển thị

```text
CITATIONS       exact repo · revision · path · line span
RELATIONS       endpoints · evidence · allowed relation
SCHEMA          OKF type · frontmatter · navigation
LIMITS          protected bytes · size · sensitive content

PASS → finalized inspection
FAIL → repairable workspace
```

## Lời thoại dự kiến

“Stage cuối giải quyết một vấn đề đơn giản: agent không thể tự chứng nhận output
do chính nó vừa viết.

Vì vậy ý tưởng của mình là đặt một deterministic quality gate trong MCP.
Citation phải khớp repo, revision, path và line span; relation phải có endpoint
và evidence; file phải đúng OKF schema; limits và policy cũng phải pass.

Nếu hợp lệ, output đi vào finalized inspection. Nếu không, MCP trả workspace
cùng lỗi cụ thể để sửa, chứ không tạo một partial proposal mơ hồ.”

## Câu chuyển sang slide 15

“Năm stage kết thúc ở một proposal hợp lệ. Từ đây, authority chuyển khỏi agent
và sang con người.”

## Nguồn

- `AgentBase-MCP/docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
- `AgentBase-MCP/docs/architecture/state-and-trust.md`
