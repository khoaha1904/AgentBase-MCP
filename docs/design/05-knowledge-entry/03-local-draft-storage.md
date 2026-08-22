# 05.03 — Local Draft storage and query overlay

> Trạng thái: Technical design draft.

## Không thêm storage layer

Local Hub Git hiện tại là source of truth duy nhất cho publication state:

```text
remoteBase ── Published baseline
     └── pending proposal commits ── Local Draft / In Review
                                  ↑ activeHead (local query tree)
```

- `remoteBase`: exact remote `main` đã synchronize.
- `activeHead`: Published baseline cộng toàn bộ accepted local proposals.
- `remoteBase..activeHead`: ordered pending proposal commits.
- Authoring workspace chưa Accept không phải Local Draft queryable.

## State mapping

| Product state | Git/lifecycle evidence |
|---|---|
| Local Draft | accepted proposal commit nằm trong pending ancestry |
| In Review | pending proposal có publication receipt/PR đang được theo dõi |
| Published | synchronize nhận diện proposal trên remote history/patch |

`In Review` detail và PR closure/retry thuộc phần 11. Không background poll GitHub;
normal query dùng last-known local publication evidence.

## Query projection

Query vẫn đọc exact `activeHead`, nhưng response cần kèm:

- `remoteBase` và `activeHead`;
- pending proposal IDs/commits liên quan tới kết quả;
- classification `published`, `local-draft`, hoặc
  `published-with-local-changes` ở mức concept/file;
- In Review metadata khi lifecycle owner cung cấp.

Classification được tính từ Git tree/diff và proposal trailers, không ghi vào
OKF Markdown và không tạo durable search index.

## Failure rule

Nếu ancestry, trailers hoặc layer attribution mơ hồ, query không đoán state.
Nó trả lỗi lifecycle/limitation và yêu cầu synchronize/recovery trước.
