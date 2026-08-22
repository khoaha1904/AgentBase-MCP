# 09.01 — Initial Ingest

> Trạng thái: Implemented và model-qualified trên Terraform full-stack fixture.

## User interaction

User gọi Ingest cho một repository hoặc batch explicit roots. Skill chỉ hỏi
owner decision tối thiểu như proposed/confirmed Domain; không yêu cầu prompt tự
viết, provider login hoặc cross-repository investigation.

## Stages

```text
1. Preflight   repository identity + Domain confirmation
2. Discover    README/docs + one architecture pass
3. Investigate shortlist candidates + exact source evidence
4. Author      bounded Hub match + one guidance call + proposal workspace
5. Validate    deterministic validation + at most one repair + preview
```

Stage boundaries/checkpoints là deterministic. Agent reasoning chỉ nằm trong
semantic discovery/investigation và phải tạo evidence mới, qualify/drop một
candidate hoặc ghi ambiguity cụ thể. Không có progress thì dừng investigation.

## Success

Success không yêu cầu full repository coverage. Một run thành công khi tạo được
một valid, useful, provenance-bearing proposal hoặc kết luận có evidence rằng
không có useful change trong budget hiện tại.

Missing low-value details là diagnostics. Ambiguity quan trọng thành Question.
Integrity/validation failure tạo Incomplete run và không vào query/publish.

## Repair budget

Validation có tối đa một Agent repair round trên exact failures. Vẫn lỗi thì giữ
repairable session/diagnostics và dừng; không tự mở thêm discovery loop.

## Exit boundary

Ingest dừng ở proposal preview. Accept, Publish và provider enrichment cần
authorization/workflow riêng. Một batch giữ proposal hoàn chỉnh của repository
khác khi một repository thất bại.

## Implementation/qualification note

MCP render canonical Repository, confirmed Domain, selected concept và index
skeletons trước khi Agent enrich; Agent không dựng frontmatter từ đầu. Catalog
7 qualification bằng Sol tạo một valid partial 7-concept ECS full-stack bundle
với System, frontend/backend Components, Interface và delivery Flow; AWS
resource nội bộ được giữ embedded. Batch sentence ở trên vẫn là design target,
chưa phải current runtime behavior.
