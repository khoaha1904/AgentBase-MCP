# 10.03 — Source access and degradation

> Trạng thái: Local degradation contract accepted; remote reader is the first
> post-phase query capability and is outside MVP only.

## Outcome

Hub knowledge và snapshot luôn đọc độc lập với source permission. Source
authority chỉ được kiểm tra cho explicit current-value/code request hoặc khi
task implementation/debug/impact thật sự cần code. Source không đọc được thì
câu trả lời degrade về Hub/snapshot thay vì fail toàn bộ hoặc đoán.

## Separate trust boundaries

- **Hub access**: có quyền vào Hub thì đọc được toàn Hub; không có Domain,
  concept hoặc field ACL riêng.
- **Local source access**: user đã chọn một exact local/workspace repository root
  cho current MCP connection.
- **Remote source access**: post-MVP bounded MCP action dùng active
  MCP-managed GitHub.com/GitHub Enterprise token;
  calling agent không nhận token và không dùng `gh`/ambient credential.
- **Provider access**: không thuộc normal query route; provider CLI observations
  chỉ chạy trong explicit Domain Enrichment workflow.

Hub relation hoặc `repository://` reference xác định source identity/path nhưng
không tự cấp quyền source.

## Snapshot-default access flow

Với câu hỏi về value:

1. đọc Hub observed snapshot và giữ exact layer/source/time/age;
2. nếu snapshot đủ trả lời user intent, dừng ở snapshot;
3. nếu user hỏi current value, kiểm tra current repository binding;
4. chỉ khi repository ID match mới dùng normal graph/file tools;
5. trình bày current result riêng với snapshot; không write-back.

Snapshot cũ, conflict/Question hiện hữu, hoặc việc local source đang available
không tự kích hoạt bước 3. Đây là semantic stopping rule của Agent, không phải
một quota hay bộ đếm source-read trong MCP.

Không có snapshot phù hợp không cấm một explicit authorized source read, nhưng
query không tự tạo snapshot hoặc proposal.

## Access and resolution states

Source access và value resolution là hai thứ khác nhau:

| State | Meaning |
|---|---|
| `not-checked` | Snapshot-only query; chưa probe source/credential. |
| `available` | Exact repository binding/path đã authorize cho read này. |
| `unavailable` | Repository không local, binding mismatch, path missing hoặc graph/file read không dùng được. |
| `unauthorized` | Future remote action đã thử MCP credential và provider trả permission denial. |

Khi access `available`, current resolution vẫn có thể là `resolved`,
`ambiguous`, `missing` hoặc `redacted`. Có quyền đọc file không chứng minh Agent
đã map đúng property vào một value.

Response giữ một bounded reason như `repository-not-local`, `binding-mismatch`,
`path-missing`, `graph-unavailable`, `permission-denied` hoặc `unsafe-value` để
người dùng biết vì sao current verification không hoàn tất. Nó không expose
local absolute path, token hoặc provider response body.

## Local and workspace repositories

- Một connection bind đúng một explicit repository root.
- Reference Repository ID phải match admitted identity của binding trước khi
  dùng relative path.
- Relative path phải nằm trong root; không follow symlink/path escape.
- Repository khác trong workspace chỉ được đọc sau khi user/host đã xác định
  exact root và reconnect vào nó. Không scan workspace parent hoặc build một
  cross-repository graph.
- Missing referenced path degrade thành `path-missing`; không chạy broad
  moved-symbol recovery hoặc đoán file thay thế.

Graph thiếu coverage có thể dùng bounded direct source fallback trong cùng
authorized root. Nếu freshness thực sự cần cho current question, Agent có thể
explicitly re-index; ordinary Hub/snapshot query không index.

## Remote references

Remote file reading is deferred from MVP but prioritized immediately after this
phase. Khi chưa có action đó:

- khác repository không local → `unavailable/repository-not-local`;
- trả Hub knowledge và snapshot nếu có;
- giữ remote/file reference để người dùng tự điều tra hoặc authorize workflow
  khác;
- không clone repository, gọi GitHub trực tiếp hoặc mượn publication transport
  như một hidden reader.

Remote reader capability dùng exact canonical Repository identity, bounded
file/revision reference và active profile token. Token chỉ ở MCP server, không
đưa cho Agent; GitHub.com và GitHub Enterprise khác base API nhưng dùng cùng
product contract. Nó không clone repo, dùng `gh`, scan repo hoặc biến local path
thành shared authority.

Remote default branch/head phù hợp cho explicit current-source request; exact
historical revision phù hợp để kiểm tra provenance. Transport, branch
resolution và response bounds sẽ được chốt trong capability đó, không nhồi vào
MVP query implementation.

## Integrity and safety failures

- Source thay đổi giữa current reads: trả indeterminate/unavailable; không ghép
  bytes từ hai revisions.
- Unsafe value: redact current candidate, giữ safe Hub knowledge/siblings.
- Secret-bearing path: không đọc để resolve value.
- Hub layer invalid không được thay bằng source result mang nhãn Hub knowledge.
- Source failure không tự tạo Question, Refresh, Enrichment hoặc publication.

## Minimal implementation impact

Local flow chủ yếu là host-skill wiring trên current tools. Runtime change chỉ
cần khi response cần structured degradation metadata. Remote source access là
broad separate capability; no dependency, cache hoặc reader abstraction được
thêm trước khi capability đó được owner duyệt.
