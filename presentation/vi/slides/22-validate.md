# Slide 22 — Validate

## Vai trò của slide

Nêu deterministic gate và giới hạn ý nghĩa của nó.

## Thông điệp duy nhất

Validation chứng minh proposal tuân contract và evidence rules, không chứng minh
knowledge đầy đủ hoặc luôn đúng về semantics.

## Nội dung hiển thị

```text
CITATIONS       repo · revision · path · line span
RELATIONS       endpoints · allowed relation · evidence
SCHEMA          OKF type · frontmatter · navigation
LIMITS          protected bytes · size · sensitive content

PASS -> finalized inspection
FAIL -> repairable workspace

VALID != COMPLETE
```

## Lời thoại dự kiến

“MCP kiểm tra citation, relation, schema và limits một cách deterministic. Failure
quay lại workspace với lỗi cụ thể. Pass chỉ có nghĩa output đủ điều kiện để
inspect và review; completeness, semantic judgment và business acceptance vẫn
không được suy ra từ validation.”

## Câu chuyển

“Sau gate kỹ thuật, authority chuyển sang con người.”

## Nguồn

- `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
- `docs/architecture/state-and-trust.md`
