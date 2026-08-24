# 11.05 — Publication state

> Trạng thái: Core Git/PR recognition implemented; no separate state store required.

## Outcome

Publication status được suy ra từ Git và matching PR, không lưu một state machine
thứ hai dễ stale.

```text
accepted commit còn sau remoteBase     → Local Draft
+ matching open PR                     → In Review
proposal identity có trong remote target branch → Published
```

## Rules

- **Local Draft**: accepted proposal vẫn nằm trong pending ancestry sau admitted
  Published base.
- **In Review**: Local Draft có exact matching open PR branch/base/head. Đây là
  derived display state, không thay thế Local Draft và không ghi vào Hub.
- **Published**: chỉ khi Synchronize nhận diện proposal trong fetched remote
  target branch bằng commit, proposal/diff trailer hoặc stable patch identity.
- PR closed nhưng chưa merge: proposal vẫn là Local Draft và có thể được sửa/
  publish lại qua workflow review; MCP không tự reopen hoặc tạo PR khác âm thầm.
- GitHub unavailable: publication review state là `unknown`; Local Draft không
  mất và receipt cũ không được trình bày như current PR truth.

Publication receipt và transaction phase chỉ phục vụ retry/recovery. Chúng
không quyết định knowledge đã Published hay chưa.
Một legacy transaction thiếu profile ID/prior Published có thể bind lại vào
active profile chỉ khi exact Main/Published/candidate state vẫn khớp; khác biệt
dừng để con người kiểm tra, không tự đoán.

## Transitions

| Trigger | Result |
|---|---|
| Accept exact reviewed proposal | Local Draft commit |
| MCP creates/adopts exact open PR | derived In Review |
| PR closed without admitted merge | Local Draft |
| Maintainer merges and MCP synchronizes | Published |
| Network/permission failure | prior Git-backed state remains |

MCP không tự merge, approve, close, reopen, delete branch hoặc đổi trạng thái
để “sửa” lifecycle.

## Minimal implementation impact

Không thêm database, status file, polling daemon hay background watcher. Khi cần
hiển thị `In Review`, explicit publication/status flow đọc matching PR; ordinary
Hub query không gọi GitHub. Current pending ancestry, publication receipts và
synchronization recognition đã cung cấp phần nền cần thiết.
