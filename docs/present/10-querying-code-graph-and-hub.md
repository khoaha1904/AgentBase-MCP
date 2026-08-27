# 10 — Query từ Code Graph và Hub

> Trạng thái: Published-only Hub query, lexical query-quality capability 049 và
> Capability 051 failure-visibility/qualification hardening đã implement.

## Câu trả lời ngắn

Agent tự chọn Hub, source/Code Graph hoặc kết hợp cả hai. Người dùng không cần
chọn chế độ query.

Query dùng **snapshot-default**: nếu Hub/snapshot đã đủ trả lời câu hỏi thì dừng
ở đó. Source không phải bước xác minh mặc định, kể cả khi source đang có sẵn.

| Câu hỏi | Nguồn ưu tiên |
|---|---|
| Có gì, vì sao, liên kết thế nào, tìm ở đâu? | Hub |
| Code hiện tại implement chính xác thế nào? | Source + Code Graph |
| Liên hệ overview với implementation | Kết hợp cả hai |

## Khi nào dùng source?

Chỉ đọc source khi người dùng yêu cầu giá trị/code hiện tại, công việc
implementation/debug/impact thật sự cần code chính xác, hoặc Hub không đủ để
hoàn thành yêu cầu một cách an toàn. Snapshot cũ, đang có Question/conflict,
hoặc source đang available không tự kích hoạt source read.

Code Graph chỉ dùng cho repository đã có local hoặc trong workspace. Với remote
repository, Agent chỉ đọc file theo reference khi credential do MCP quản lý có
quyền; MCP không tự clone repository. Agent không được tự gọi `gh`, dùng token
cá nhân/ambient credential hoặc một remote reader khác để vượt qua MCP.

Nếu thiếu quyền source, Agent trả phần Hub biết, kèm snapshot nếu có, và nói rõ
không thể xác minh implementation hoặc giá trị hiện tại. Agent không đoán.

## Published và Local Draft

Hub search/read chỉ dùng exact Published commit đã synchronize về local. Local
Draft chỉ xuất hiện trong inspect/review/PR, không tham gia câu trả lời thông
thường. Khi chưa cấu hình remote Hub, Hub query và OKF authoring đều unavailable;
Code Graph vẫn dùng được độc lập.

Search tìm concept; read trả toàn bộ Markdown gồm knowledge, relationship links,
snapshot, provenance và Question. MVP không cần tool traversal, observed-value
hay freshness riêng. Agent có thể đọc link tiếp theo bằng search/read khi cần.

## Hub là structured Markdown knowledge base

OKF chuẩn hóa corpus — frontmatter, concept path, Markdown body, `index.md` và
links — chứ không chuẩn hóa search engine. Query vì vậy theo pattern quen thuộc
của Markdown KB: discover result có scope và snippet trước, rồi mới đọc exact
full document. MCP giữ contract `search → read`; một established full-text
engine chịu trách nhiệm lexical relevance thay vì AgentBase tự tạo query
language hoặc scoring algorithm.

Official `description` chính là one-line summary cho index, snippet và preview;
không thêm field `summary` trùng nghĩa. Search dùng allowlist gồm identity/path,
title, type, description, tags, Markdown headings/body, portable links và
AgentBase accepted relation/Flow extension. Arbitrary YAML vẫn chỉ xuất hiện khi
đọc exact document.

Markdown body được project tạm theo heading hierarchy. Một concept có thể match
nhiều section nhưng chỉ chiếm một result, kèm best heading path và bounded
excerpt. Đây là retrieval state trong memory, không tạo chunk file, concept mới
hoặc second knowledge store.

Search được phép dùng portable links, canonical relationship và Flow step đã có
để giúp Agent tìm producer, consumer, trigger hoặc endpoint liên quan. Nó không
suy diễn relation mới, không tự type một OKF Markdown link và không thay thế
exact Markdown read. Kết quả context giữ direction/evidence, có bound và cho
biết phần bị omit.

Domain scope là context để tìm knowledge, không phải thao tác viết lại Hub. Nó
gồm concept có canonical `part-of`, concept gắn bằng structural relation với
Repository thuộc Domain và direct external endpoint của một accepted relation.
Nó dừng ở endpoint đó, không tự mở rộng Domain bên ngoài.

Embedding, vector database, managed semantic search và durable index chỉ được
cân nhắc khi qualification thực tế chứng minh lexical + structured scope chưa
đủ. Static Domain Hub có thể đánh giá Pagefind riêng ở capability UI; browser
index không trở thành authority của MCP query.

## Khi nguồn mâu thuẫn

Agent trình bày các claim liên quan, provenance, Question và Maintainer Guidance
đúng scope; guidance ở `Needs Review` phải kèm cảnh báo. Observed snapshot được
trình bày cùng tuổi dữ liệu và source reference, không xóa claim lịch sử. Khi
người dùng hỏi giá trị hiện tại và có quyền source, Agent đọc source bằng luồng
MCP thông thường thay vì dựa vào một live-reference resolver riêng.

Conflict đã lưu trong Hub vẫn phải được trình bày. Quy tắc snapshot-default chỉ
tránh tạo thêm một vị trí tạm thời từ source khi câu trả lời hiện có đã đủ; nó
không che hoặc tự giải quyết conflict đã tồn tại.

Quy tắc conflict canonical nằm ở
[phần 07](07-conflicts-questions-and-maintainer-guidance.md); observed value nằm ở
[phần 08](08-live-references-for-change-prone-values.md).

Query phải phân biệt hai trường hợp:

- Document vượt giới hạn kích thước: có thể bị omit theo bound, nhưng kết quả
  phải nói rõ phần đã omit.
- Published document malformed: search/read phải dừng với lỗi rõ ràng, không
  trả một graph thiếu nhưng mang vẻ hoàn chỉnh.

Đây là quy tắc minh bạch của query, không phải query language mới và không thêm
field `summary` hoặc durable search index.

## Quyền đọc

Hub là một trust boundary chung: có quyền Hub thì đọc được toàn bộ Published
knowledge, không có ACL riêng theo Domain, concept hoặc field. Quyền đọc source
vẫn phụ thuộc repository/provider tương ứng.

Đây là authority contract cho remote-repository query. Remote file reader được
đưa khỏi MVP nhưng là query capability ưu tiên ngay sau phase này: nó sẽ dùng
active MCP-managed GitHub/GitHub Enterprise token và exact repository/file/
revision reference, không phụ thuộc path local của từng máy.

Cho tới khi capability đó được release, khác repo chỉ dùng được khi source đã có
local/workspace hoặc Hub có knowledge/snapshot/reference. Agent không dùng `gh`,
ambient credential hoặc tự clone để lách giới hạn.
