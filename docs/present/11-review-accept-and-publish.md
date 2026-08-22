# 11 — Review và Publish

> Trạng thái: Main-branch publication đã có; rich/stacked PR còn thiếu.

## Câu trả lời ngắn

AgentBase không tự thay đổi Hub remote. Người dùng chọn knowledge item trong
proposal trước khi Accept, rồi có thể gom nhiều Local Draft commit vào một PR;
Git review/merge là cổng publish cuối.

```text
Proposal ──preview + Accept──→ Local Draft ──PR──→ In Review ──sync──→ Published
```

## Review và tạo PR

- Preview trước Accept nhóm item theo repository và lần Ingest/Refresh.
- Người dùng có thể loại một nhóm hoặc từng knowledge item, ví dụ concept,
  claim, relation, Question hoặc evidence update.
- Accept khóa đúng nội dung đã review thành một immutable Local Draft commit.
- Local Draft commit có thể tích lũy qua nhiều repository và vẫn query được.
- Question và limitation chưa giải quyết có thể publish nếu giữ rõ provenance.
- Resolve Question hoặc duyệt merge concept chỉ tạo Local Draft mới, không tự
  publish.
- Một Domain Enrichment có thể gom updates của nhiều repository, Question và
  cross-repository relation thành một Local Draft/PR dependency-safe.
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

Trước PR, MCP pull Hub mới nhất, reconcile Local Draft và yêu cầu giải quyết Git
conflict. Người dùng chọn một nhóm proposal commit liên tiếp; không tạo PR nếu
nhóm không dependency-safe hoặc reconciliation chưa hoàn tất.

## Khi PR kết thúc

- Proposal commit được đưa vào PR chuyển thành `In Review` nhưng vẫn còn local.
- PR bị đóng/từ chối đưa proposal về `Local Draft` để thử lại.
- Sau khi merge, MCP pull Hub và nhận diện từng proposal bằng commit/proposal/
  diff identity. Proposal đã Published rời pending ancestry; proposal còn lại
  được rebase và giữ local.

Workflow phải retry được mà không làm mất draft hoặc publish trùng. Branch,
commit, change ID và cơ chế retry cụ thể thuộc low-level.

## Dependency và quyền publish

Trước Accept, MCP kiểm tra các item đã chọn có đủ dependency hay không. Ví dụ,
relation phải trỏ tới concept đã Published hoặc được chọn cùng proposal. Trước
PR, MCP kiểm tra nhóm proposal là một pending prefix dependency-safe. MCP không
tự thêm item âm thầm và không tạo proposal/PR chưa hợp lệ.

Người có quyền source/workspace có thể tạo và review Local Draft. Quyền Git
quyết định ai được tạo PR; maintainer review/merge là authority cuối để knowledge
trở thành Published. Quyền đọc Hub không mặc nhiên cho phép sửa Hub, và
AgentBase phiên bản đầu không xây thêm ACL ghi riêng.

## Gap publication đã xác nhận

Tool `submit_hub_okf_proposals` hiện dùng token riêng của MCP và tạo PR vào
configured target `main`. Nó chưa hỗ trợ stacked workflow `Refresh PR → Init
branch` khi Init chưa merge, và PR body hiện chưa có template review giàu ngữ
nghĩa ở trên. Không dùng `gh` hoặc token ngoài MCP để lách hai gap này.
