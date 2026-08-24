# 05.03 — Local Draft storage and Published query boundary

> Trạng thái: Technical design draft.

## Không thêm storage layer

Mỗi remote Hub profile có Git state riêng cho publication lifecycle:

```text
remoteBase ── Published baseline
     └── pending proposal commits ── Local Draft / In Review
                                  ↑ activeHead (review/authoring tree)
```

- `remoteBase`: exact remote `main` đã synchronize.
- `activeHead`: Published baseline cộng toàn bộ accepted local proposals.
- `remoteBase..activeHead`: ordered pending proposal commits.
- Authoring workspace chưa Accept không phải Local Draft.

## State mapping

| Product state | Git/lifecycle evidence |
|---|---|
| Local Draft | accepted proposal commit nằm trong pending ancestry |
| In Review | pending proposal có publication receipt/PR đang được theo dõi |
| Published | synchronize nhận diện proposal trên remote history/patch |

`In Review` detail và PR closure/retry thuộc phần 11. Không background poll GitHub;
normal query reads the exact synchronized Published boundary.

## Query boundary

Ordinary search/read uses exact `remoteBase`. `activeHead` and proposal commits
remain available to inspect/review/PR workflows only.

Không có remote profile thì không khởi tạo local-only OKF authority: Hub query,
Ingest, Refresh và Draft operations không chạy. Local Code Graph vẫn độc lập và
dùng được. Chuyển profile chọn đúng state theo normalized remote URL + branch;
không overlay hoặc migrate ngầm Draft giữa các profile.

## Failure rule

Nếu Published anchor không thể admit chính xác, query fail closed. Nó không
thay bằng Local Draft hoặc remote working state.
