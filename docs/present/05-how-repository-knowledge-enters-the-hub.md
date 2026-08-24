# 05 — Kiến thức từ repository được đưa vào Hub thế nào?

> Trạng thái: Proposal, Local Draft và Hub publication foundation đã implement.

## Câu trả lời ngắn

Khi đã cấu hình Remote Hub, Ingest tạo proposal để người dùng review. Accept
khóa proposal thành Local Draft của đúng Hub đó; ordinary query vẫn chỉ đọc
Published knowledge đã synchronize.

```text
Repository ──Ingest──→ Proposal ──review + Accept──→ Local Draft ──PR──→ Published
```

Chưa cấu hình Remote Hub thì AgentBase chỉ dùng Code Graph cho source local;
Hub query, Ingest, Refresh và OKF Draft chưa có authority để chạy.

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
| Local Draft | Proposal commit được inspect/review trên local, chưa thuộc ordinary query |
| In Review | Proposal commit đã nằm trong một PR, vẫn được giữ local |
| Published | Proposal commit đã merge và được Hub synchronization nhận diện |

Đây không phải nhãn đúng/sai. Published vẫn là knowledge có provenance, không
phải sự thật tuyệt đối. Pending local changes được xem trong proposal review;
ordinary search/read chỉ dùng exact Published commit.

PR có thể nhóm nhiều proposal commit liên tiếp từ nhiều lần Ingest hoặc Refresh.
Lifecycle review, retry và cleanup được trình bày ở
[phần 11](11-review-accept-and-publish.md).

## Mỗi Hub có local state riêng

Một Hub profile được nhận diện bằng normalized remote URL và branch. Mỗi profile
có Published clone và Draft workspace riêng. Chuyển từ Hub A sang Hub B sẽ mở
state B đã có hoặc tạo state B mới; Published/Draft của A được giữ nguyên nhưng
không còn active và không bị trộn vào B.

## Low-level query decision

Search/read uses exact synchronized Published state; proposal inspection owns
pending changes.
