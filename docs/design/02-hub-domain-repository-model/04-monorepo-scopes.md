# 02.04 — Monorepo and source scopes

> Trạng thái: Owner-approved boundary; subproject-scope runtime deferred.

## Identity

Git worktree root là Repository identity boundary. Chọn một subfolder không tạo
Repository ID hoặc Repository concept mới; source-state normalization hiện tại
tiếp tục đưa nó về Git root.

```text
company-repo                 Repository / Primary Domain: Crawler
├── services/api             evidence/query scope
└── jobs/importer            evidence/query scope
```

Mọi scope kế thừa primary Domain của repository. Scope chỉ giới hạn discovery,
Code Graph query và source references; evidence URI vẫn dùng cùng Repository ID
với relative path đầy đủ.

## Independent repositories in one workspace

Một parent folder như `crawler-repos/` không phải Repository nếu các child là
những Git repositories độc lập. Mỗi child có Repository ID và Domain assignment
riêng; parent chỉ là routing/batch/workspace grouping, không tạo Hub concept.
Nhiều child có thể cùng một Domain, nhưng assignment vẫn được xác nhận từ bằng
chứng của từng repository chứ không suy ra chỉ từ tên parent.

## Unsupported in version one

- Repository ID riêng cho arbitrary subfolder.
- Một Git repository có nhiều primary Domains.
- Tự split monorepo thành synthetic repositories.

Nếu preflight yêu cầu một subproject Domain khác primary Domain, skill cảnh báo
unsupported assignment. Concept/relation xuyên Domain vẫn được biểu diễn theo
phần 06; nó không tạo subproject Repository identity.
