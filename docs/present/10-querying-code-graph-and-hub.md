# 10 — Query từ Code Graph và Hub

> Trạng thái: Query foundation đã có; multi-layer presentation còn cần hoàn thiện.

## Câu trả lời ngắn

Agent tự chọn Hub, source/Code Graph hoặc kết hợp cả hai. Người dùng không cần
chọn chế độ query.

| Câu hỏi | Nguồn ưu tiên |
|---|---|
| Có gì, vì sao, liên kết thế nào, tìm ở đâu? | Hub |
| Code hiện tại implement chính xác thế nào? | Source + Code Graph |
| Liên hệ overview với implementation | Kết hợp cả hai |

## Khi nào dùng source?

Code Graph chỉ dùng cho repository đã có local hoặc trong workspace. Với remote
repository, Agent chỉ đọc file theo reference khi credential do MCP quản lý có
quyền; MCP không tự clone repository. Agent không được tự gọi `gh`, dùng token
cá nhân/ambient credential hoặc một remote reader khác để vượt qua MCP.

Nếu thiếu quyền source, Agent trả phần Hub biết, kèm snapshot nếu có, và nói rõ
không thể xác minh implementation hoặc giá trị hiện tại. Agent không đoán.

## Published và Local Draft

Mặc định query local dùng cả Published Hub và Local Draft; người dùng có thể tắt
một lớp. Nếu cùng concept xuất hiện ở cả hai, kết quả hiển thị một concept nhưng
tách claim, publication status và provenance theo từng lớp.

Local merge không được trình bày như Hub remote đã đổi. Published cũng không
được ưu tiên như sự thật chỉ vì đã merge.

## Khi nguồn mâu thuẫn

Agent trình bày các claim liên quan, provenance, Question và Maintainer Guidance
đúng scope; guidance ở `Needs Review` phải kèm cảnh báo. Live reference resolve
được bổ sung như evidence hiện tại, không xóa claim lịch sử.

Quy tắc conflict canonical nằm ở
[phần 07](07-conflicts-questions-and-maintainer-guidance.md); live value nằm ở
[phần 08](08-live-references-for-change-prone-values.md).

## Quyền đọc

Hub là một trust boundary chung: có quyền Hub thì đọc được toàn bộ Published
knowledge, không có ACL riêng theo Domain, concept hoặc field. Quyền đọc source
vẫn phụ thuộc repository/provider tương ứng.

Đây là authority contract cho remote-repository query; remote file reader vẫn
chưa được implement trong MVP hiện tại. Cho tới khi có capability đó, khác repo
chỉ dùng được khi source đã có local/workspace hoặc Hub có knowledge/snapshot.
