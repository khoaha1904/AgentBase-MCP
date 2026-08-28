# 05.03 — Local Draft storage and Published query boundary

> Trạng thái: Implemented baseline (capability 056).

## Không thêm storage layer

The local storage root is not a second knowledge authority. New MCP runtime
state uses one owner-private `AGENTBASE_HOME`/`~/.agentbase` root:

```text
~/.agentbase/
  config/   Hub configuration and owner-private credentials
  hubs/     durable Hub checkout, Draft `main` and Published ref
  state/    proposals, sessions, transactions and enrichment checkpoints
  cache/    rebuildable Code Graph/provider/query cache
  tmp/      disposable checkout/workspace staging
```

The root is created with mode `0700`; files containing credentials use `0600`.
Repository proposal bundles use `state/repositories/<stable-root-digest>/`; the
source checkout may still contain a short-lived `.agentbase/okf.lock` and
atomic switch backups during an apply. Legacy XDG directories remain readable
and untouched. A safe legacy `/tmp/agentbase-<uid>/hub-runtime` is copied once
to durable `state/hub-runtime` only when the new target is absent; collision or
symlink input fails closed and the source is never deleted.

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
