# 10.02 — Published and Local Draft overlay

> Trạng thái: Technical design đã được owner chốt; runtime hiện chỉ đọc `activeHead`.

## Outcome

Mặc định query thấy cả Published knowledge và Local Draft changes. Agent trình
bày một concept theo identity chung nhưng không trộn bytes, provenance hoặc
publication status của hai lớp thành một “truth”.

## Exact layer anchors

- **Published**: exact admitted `remoteBase` commit của attached Hub.
- **Local Draft**: ordered accepted proposal commits trong
  `remoteBase..activeHead`; effective draft bytes nằm tại exact `activeHead`.
- **Local-only Hub**: chưa có Published layer. Accepted local proposals chỉ là
  Local Draft cho tới khi bootstrap/publish tạo remote authority.

Query không fetch remote, inspect PR branch hoặc dùng working-tree bytes. Nó chỉ
đọc hai commits đã được Local Hub admission xác nhận.

## Current local storage

Hub checkout là một Git repository riêng do MCP quản lý tại
`$XDG_DATA_HOME/agentbase-mcp/hubs/<localHubId>`; fallback là
`$HOME/.local/share/agentbase-mcp/hubs/<localHubId>`. Nó không nằm trong source
repository hoặc project workspace.

Finalize giữ proposal workspace riêng trong private runtime state. Chỉ khi user
Accept exact reviewed proposal, MCP copy reviewed Hub tree vào detached Git
worktree, tạo đúng một commit có proposal ID/mode/source/digests trong commit
trailers, rồi fast-forward local `main` tới commit đó.

```text
origin/main ── P                         Published = remoteBase P
               \
local main      D1 ── D2 ── D3          Local Draft head = activeHead D3
                ↑     ↑     ↑
              proposal commits with stable IDs in trailers
```

Vì vậy query pick layer bằng Git anchors, không bằng một tên thư mục draft:
Published đọc `P`; effective Local Draft đọc `D3`; proposal attribution đọc
ordered commits trong `P..D3`. Accept chỉ advance local Hub, không merge/push
remote `main`. PR branches là publication state riêng được tạo sau.

## Query views

Mọi Hub query surface dùng một view có ba lựa chọn:

- `combined` — default; Published baseline cộng Local Draft changes;
- `published` — chỉ exact `remoteBase`;
- `local-draft` — chỉ contributions thay đổi bởi pending accepted proposals.

`local-draft` là delta để review, không phải bản sao đầy đủ của Published tree.
Concept không đổi từ Published không xuất hiện trong draft-only result.

## Overlay model

Concept được group bằng canonical concept identity/path:

```text
concept
├── published?   { commit, content/provenance }
└── local_draft? { head_commit, proposal_ids, change, content/provenance }
```

Local Draft `change` là `added`, `updated` hoặc `removed` so với Published.
Một removal giữ Published variant cho review và thêm draft tombstone; combined
view không âm thầm làm knowledge biến mất.

Nếu nhiều pending proposals cùng sửa một concept, query trả:

- effective bytes tại `activeHead` một lần;
- ordered `proposal_ids` của mọi proposal đã chạm path đó;
- không trả từng intermediate version trừ khi user inspect proposal riêng.

Fields, observations, relationships hoặc prose không được merge độc lập giữa
hai versions. Response composition có thể hiển thị một heading chung, nhưng
mọi fact vẫn thuộc exact variant đã cung cấp nó.

## Search, read and traversal behavior

- **Search combined** chạy trên cả two layer views rồi group matches theo concept
  identity; match ghi rõ layer nào chứa term.
- **Read combined** trả Published variant và effective Local Draft variant/tombstone
  nếu path đã đổi.
- **Traversal combined** giữ relationship edges theo layer. Một edge bị draft
  xóa vẫn hiện là Published + draft removal, không bị union thành active truth.
- **Observed values** giữ từng layer riêng; snapshot có cùng stream ID ở hai
  layers vẫn là hai observations tại hai exact Hub/source states.

Ordering deterministic: best search rank trước, rồi canonical identity; trong
một concept luôn Published trước Local Draft và proposal IDs theo accepted
ancestry.

## Attribution

Proposal attribution được derive từ exact pending commit diffs, không gán mọi
Local Draft result cho proposal cuối cùng. Đây là gap của current observed-value
query: nó mới label `activeHead` bằng last pending proposal, nên chưa đủ cho
multi-proposal overlay.

Published status không có nghĩa “đúng hơn”; Local Draft status không có nghĩa
“đã merge remote”. Hai lớp chỉ mô tả lifecycle và review state.

## Failure and recovery

- `remoteBase` không là ancestor của `activeHead`, pending ancestry đứt hoặc
  proposal trailer invalid: fail closed; không đoán overlay.
- Một path invalid ở một layer không được thay bằng bytes của layer kia. Response
  báo layer failure và vẫn có thể trả safe variants độc lập.
- Local Hub đổi head trong query: discard result và retry only on a new explicit
  read; không trộn commits từ hai thời điểm.
- Synchronize/publish thay anchors: query tiếp theo dùng newly admitted state;
  query hiện tại không tự write, reconcile hoặc update PR.

## Minimal implementation shape

Reuse current `HubQueryReader` với explicit commit thay vì tạo overlay database:

1. construct Published reader at `remoteBase` when remote authority exists;
2. construct active reader at `activeHead`;
3. derive changed paths + proposal attribution from pending Git commits;
4. compose bounded layer-tagged results in `app/hub-okf/query`;
5. expose one optional `view` field through existing Hub query tools.

No new dependency, cache, index, daemon or Hub file format is required. This is
a contained query change, but implementation must use a new numbered capability
because it changes observable query output.
