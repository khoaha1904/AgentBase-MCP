# 11 — Review và Publish

> Trạng thái: Init/Refresh stack, atomic Batch Initial Ingest và independent
> Domain Enrichment PR đã implement offline.

## Câu trả lời ngắn

AgentBase không tự thay đổi Hub remote. Người dùng chỉnh knowledge item trong
editable draft trước Finalize; Finalize khóa một proposal atomic để review và
Accept toàn bộ. Sau đó có thể gom các Local Draft commit dependency-safe vào
PR; Git review/merge là cổng publish cuối.

```text
Proposal ──preview + Accept──→ Local Draft ──PR──→ In Review ──sync──→ Published
```

## Review và tạo PR

- Preview trong authoring nhóm item theo repository và lần Ingest/Refresh.
- Người dùng có thể thêm, sửa hoặc loại một knowledge item khi draft còn
  editable. Sau Finalize, proposal không hỗ trợ cắt chọn từng item.
- Nếu review proposal đã khóa phát hiện sai, Agent quay lại authoring, áp dụng
  chỉnh sửa và Finalize lại một bundle dependency-safe; Accept luôn nhận toàn bộ
  exact proposal đã review.
- Accept khóa đúng nội dung đã review thành một immutable Local Draft commit.
- Local Draft commit có thể tích lũy qua nhiều repository và vẫn query được.
- Question và limitation chưa giải quyết có thể publish nếu giữ rõ provenance.
- Resolve Question hoặc duyệt merge concept chỉ tạo Local Draft mới, không tự
  publish.
- Một Domain Enrichment có thể gom updates của nhiều repository, Question và
  cross-repository relation thành một Local Draft/PR dependency-safe.
- Một Batch Initial Ingest đã Finalize là một proposal/Accept/PR unit; không thể
  chọn bỏ riêng member hoặc item sau Finalize.
- Một profile upgrade có semantic mapping change gom mọi Published concept bị
  ảnh hưởng thành một Hub Migration Draft và một migration PR. Upgrade không tự
  publish; item thiếu evidence giữ trạng thái hiện tại và đi kèm Question.

PR phải tự giải thích đủ để reviewer hiểu trước khi đọc file diff:

- mục đích của proposal và repository/Domain liên quan;
- knowledge nào được thêm, cập nhật, xóa, supersede/retract;
- Questions, limitations và source revision/evidence chính;
- validation/qualification đã chạy và điều gì chưa được xác minh.

Git diff vẫn là evidence cuối, nhưng không được bắt reviewer tự suy ra toàn bộ
ý nghĩa từ một danh sách Markdown thay đổi.

MVP review dùng structured preview và exact before/after content qua MCP. Một
trang HTML local có sơ đồ concept/relation và các nhóm thay đổi là enhancement
tùy chọn sau MVP. Nếu làm, trang đó chỉ render cùng immutable inspection data,
không trở thành knowledge authority, không cần service/database riêng và không
tự Accept hoặc Publish.

Trước PR, MCP xác nhận Hub Published mới nhất và yêu cầu giải quyết Git conflict.
Thứ tự commit của Local Draft chỉ là thứ tự lưu local, không mặc nhiên là
dependency publication. Mỗi Repository Init có thể mở PR riêng cùng lúc từ
Published `main`; Refresh chỉ phụ thuộc proposal trước của chính Repository đó.

## Khi PR kết thúc

- Proposal commit có matching open PR được hiển thị `In Review`, nhưng đó là
  trạng thái suy ra; proposal vẫn là Local Draft cho tới khi merge và sync.
- PR bị đóng/từ chối đưa proposal về `Local Draft` để thử lại.
- Sau khi merge, MCP pull Hub và nhận diện từng proposal bằng commit/proposal/
  diff identity. Proposal đã Published rời pending ancestry; proposal còn lại
  được rebase và giữ local.

Workflow phải retry được mà không làm mất draft hoặc publish trùng. Branch,
commit, change ID và cơ chế retry cụ thể thuộc low-level.

Không có publication status database riêng. Local Draft derive từ pending Git
ancestry, In Review từ exact matching open PR và Published từ proposal được nhận
diện trong remote `main`; receipt chỉ phục vụ retry/recovery.

## Dependency và quyền publish

Trước Accept, MCP kiểm tra các item đã chọn có đủ dependency nội dung hay không. Ví dụ,
relation phải trỏ tới concept đã Published hoặc được chọn cùng proposal. Trước
PR, MCP kiểm tra dependency theo từng Repository publication chain thay vì bắt
mọi proposal thành một global pending prefix. MCP không tự thêm item âm thầm và
không tạo proposal/PR chưa hợp lệ.

AI chỉnh draft và tự sửa dangling dependency máy móc trước khi gọi Finalize;
chỉ hỏi user khi có nhiều lựa chọn nghiệp vụ hợp lệ. Finalize là validator
deterministic, không gọi model: cấu trúc gãy thì fail, còn knowledge chưa đầy đủ
vẫn được đi tiếp với Question/Limitation rõ ràng.

Người có quyền source/workspace có thể tạo và review Local Draft. Quyền Git
quyết định ai được tạo PR; maintainer review/merge là authority cuối để knowledge
trở thành Published. Quyền đọc Hub không mặc nhiên cho phép sửa Hub, và
AgentBase phiên bản đầu không xây thêm ACL ghi riêng.

## Publication boundary hiện tại

Tool `submit_hub_okf_proposals` dùng token riêng của MCP. Mỗi Init tạo một branch
và PR độc lập từ Published `main`; chuỗi cùng Repository tạo stack
`main ← Init ← Refresh`, trong đó mỗi PR chỉ hiện delta của proposal đó. First
bootstrap vẫn có thể dùng một batch PR vì đó là một transaction tạo Hub ban đầu.

Tạo branch và PR Hub là **quyền hạn độc quyền của MCP** trong workflow này.
Agent chỉ yêu cầu MCP submit proposal IDs; agent không được dùng `gh`, GitHub
token cá nhân, ambient Git credential hay một publisher khác để làm thay. Quyền
này không bao gồm merge, approve, đóng PR hoặc thay đổi repository settings.

PR body được tạo deterministic từ accepted proposal, inspection và Git metadata;
metadata tùy chọn bị thiếu được ghi là unavailable. MCP không dùng `gh`, không
merge, approve, close hoặc xóa branch. Khi Published `main` đổi, proposal còn mở
được reconcile tuần tự và cập nhật trên chính branch/PR hiện có; conflict phải
được giải quyết trước khi branch đó được cập nhật.

Hub Initialization là một PR hỗ trợ riêng, không trộn với knowledge proposal.
Nó thêm README chuẩn khi thiếu và thêm/sửa đúng ba file CI khi CI chưa current;
README đã tồn tại và CI current luôn được giữ nguyên. Hub tự chạy validator đã
review mà không tải npm package, checkout MCP hay cần MCP token. Nếu baseline đã
đủ thì không tạo PR; maintainer vẫn là người quyết định merge.
