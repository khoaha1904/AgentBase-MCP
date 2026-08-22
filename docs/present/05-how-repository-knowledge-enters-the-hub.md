# 05 — Kiến thức từ repository được đưa vào Hub thế nào?

> Trạng thái: Proposal, Local Draft và Hub publication foundation đã implement.

## Câu trả lời ngắn

Ingest tạo proposal để người dùng review. Accept biến proposal thành knowledge
dùng được ngay ở local; nhiều Local Draft commit có thể được gom vào một PR.

```text
Repository ──Ingest──→ Proposal ──review + Accept──→ Local Draft ──PR──→ Published
```

## Repository đóng góp gì?

- concept hoặc thông tin mới cho concept đã có;
- relation giữa các concept;
- evidence trỏ về code, config hoặc tài liệu;
- Question và limitation khi bằng chứng chưa đủ.

Repository không sở hữu bản sao riêng của mọi concept. Hai repository có thể
cùng đóng góp evidence cho một Queue dùng chung; nếu chưa chắc là cùng resource,
Agent giữ candidate và Question thay vì merge nhầm.

## Hub giữ overview, source giữ chi tiết

Hub giữ vai trò, ownership, relation, decision, Question và reference quan
trọng. Function, class, config field hoặc luồng code nhỏ thường chỉ là evidence.
Khi cần implementation, Agent đi theo reference tới source hoặc Code Graph.

## Trạng thái xuất bản

Một reviewed proposal/change set chứa các knowledge item như concept, claim,
relation, Question hoặc evidence update. Người dùng chọn/bỏ item trước khi
Accept; sau Accept, proposal trở thành một Local Draft commit bất biến và là
đơn vị publication:

| Trạng thái | Ý nghĩa |
|---|---|
| Local Draft | Proposal commit query được trên local, chưa chia sẻ qua remote |
| In Review | Proposal commit đã nằm trong một PR, vẫn được giữ local |
| Published | Proposal commit đã merge và được Hub synchronization nhận diện |

Đây không phải nhãn đúng/sai. Published vẫn là knowledge có provenance, không
phải sự thật tuyệt đối. Một concept có thể có remote base và pending local
changes; query phải chỉ rõ commit/proposal của từng lớp thay vì gán publication
state riêng cho mọi field trong Markdown.

PR có thể nhóm nhiều proposal commit liên tiếp từ nhiều lần Ingest hoặc Refresh.
Lifecycle review, retry và cleanup được trình bày ở
[phần 11](11-review-accept-and-publish.md).

## Còn để low-level quyết định

- Cách query trình bày remote base và pending proposal changes.
- ID dùng để nhận diện proposal commit đã publish.
- Backup/shared draft có cần cho phiên bản sau hay không.
