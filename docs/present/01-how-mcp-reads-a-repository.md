# 01 — MCP đọc một dự án như thế nào?

> Trạng thái: Local Code Graph, Capability 046 broad discovery/selective OKF và
> Capability 051 reliability hardening đã implement; released-skill
> qualification còn pending.

## Câu trả lời ngắn

MCP dùng Code Graph để tạo một bản đồ của repository, sau đó đọc chính xác
những đoạn code và tài liệu cần thiết để làm bằng chứng.

```text
Người dùng gọi skill ingest/refresh
             ↓
Preflight bind exact repository/source snapshot
             ↓
Discover lập/reuse graph rồi MCP chạy một baseline cố định
             ↓
Code Graph tìm file, function, dependency và luồng gọi
             ↓
MCP gom tín hiệu thành bounded discovery groups
             ↓
Agent điều tra nhóm quan trọng và đọc nguồn gốc làm bằng chứng
```

## Tại sao cần Code Graph?

Một repository có thể có hàng nghìn file. Đưa toàn bộ chúng vào AI trong một
lần vừa tốn kém vừa khiến AI khó tập trung vào phần quan trọng.

Code Graph hoạt động giống bản đồ hoặc mục lục. Nó cho biết:

- repository có những file và thành phần nào;
- function hoặc module nào gọi nhau;
- thành phần nào phụ thuộc thành phần nào;
- một luồng xử lý có thể đi qua những đâu.

Agent dùng bản đồ này để thu hẹp phạm vi. Ví dụ, khi cần tìm phần thu thập dữ
liệu performance, graph có thể dẫn agent tới một Lambda, event đầu vào và nơi
lưu kết quả. Agent sau đó đọc chính xác những nguồn đó để xác nhận.

## Bản đồ không phải bằng chứng cuối cùng

- **Code Graph** giúp tìm đúng chỗ.
- **Code, Terraform, config và tài liệu gốc** cung cấp bằng chứng.
- **Agent** điều tra và diễn giải bằng chứng theo skill.
- **MCP** cung cấp các công cụ đọc, tìm kiếm và kiểm tra có giới hạn.

MCP không chép toàn bộ Code Graph vào Hub. Graph là dữ liệu riêng, tạm thời và
có thể dựng lại. Chỉ kiến thức hữu ích, có nguồn và đã qua kiểm tra mới được đề
xuất để đưa vào Hub.

Code Graph chỉ được dùng cho repository đã có local hoặc nằm trong workspace.
MCP không tự clone repository remote để dựng graph khi người dùng query.

Hub authoring là ngoại lệ có authority rõ: Preflight dùng token của active Hub
để lấy exact remote default-branch commit từ cùng GitHub/GHE host vào cache riêng
của AgentBase. Đây không phải query-time clone và không thay đổi checkout, refs
hay credential của repository người dùng.

## Khi workspace có nhiều repository

Mỗi Git repository vẫn có Code Graph riêng. Thư mục cha chỉ là phạm vi giúp
Agent chọn repository cần đọc, không trở thành một graph lớn.

- Nếu thư mục đang mở là một Git monorepo, toàn bộ Git root dùng một graph;
  các project con chỉ là những scope/path bên trong graph đó.
- Nếu thư mục đang mở chứa nhiều Git repository độc lập, Agent chọn đúng repo
  theo yêu cầu rõ ràng, repo chứa working directory hiện tại, hoặc mapping local
  duy nhất đã biết từ Hub.
- Nếu có nhiều repo đều hợp lý, Agent hỏi lại thay vì tự đoán.
- Câu hỏi overview/domain dùng Published Hub trước và không cần dựng graph.
- Câu hỏi cần source của nhiều repo đọc từng repo tuần tự; không gộp graph và
  không tự quét toàn workspace.

Ngoại lệ là khi người dùng gọi explicit `agentbase-scan`: workflow này chỉ tìm
Git roots trong workspace đã chọn để lập inventory, có bounds rõ và không dựng
Code Graph hay đọc source sâu.

## MCP đọc sâu tới đâu?

Trong Initial Ingest/Batch Init, sau khi index exact Preflight source, MCP tự
chạy một baseline cố định gồm index diagnostics,
architecture aspects và file census an toàn; không phụ thuộc Agent nhớ gọi đủ
tool. Kết quả index giữ nguyên dữ liệu graph và kèm một Seed summary nhỏ để Agent
thấy các group ID cần xử lý. Discover kiểm kê rộng các nhóm có tín hiệu cao: root README, runtime/package
manifest, entrypoint, interface/route/event/trigger, integration/data/channel,
Terraform/Terragrunt, deploy và CI. Nó không crawl toàn bộ source hay `docs/`.
Agent chỉ mở sâu file mà graph/census chỉ ra là quan trọng; generated/vendor/
build và secret-like paths bị loại, lockfile chỉ là dependency hint. Mỗi nhóm
quan trọng phải được xử lý hoặc ghi limitation, nhưng không bắt buộc trở thành
concept.

Trước khi source line trở thành context cho Agent, MCP phải lọc nội dung nhạy
cảm inline như token, password hoặc URL có credential. Path denylist và content
redaction là hai lớp khác nhau: một file có tên hợp lệ vẫn không được đưa secret
thô vào Discovery Seed.

Query thường và normal change-first Refresh không chạy baseline này hoặc tạo
Discovery Seed. Chúng vẫn dùng graph/source theo đúng phạm vi riêng.

## Khi nào graph được tạo?

Graph được tạo hoặc reuse theo kiểu lazy: chỉ khi một workflow thật sự cần đọc
source chính xác của repository đã chọn. Việc mở thư mục cha hoặc chỉ query Hub
không làm MCP prebuild graph.

Trong Ingest, graph được tạo hoặc reuse ở bước Discover sau khi Preflight đã
chọn exact source. Nếu current checkout clean và trùng remote default commit,
MCP dùng nó; nếu feature/dirty/khác commit, MCP dùng detached worktree tạm. Trong
Refresh, cache chỉ được reuse khi repository identity, source revision, engine
và namespace khớp; nếu source đã đổi thì index lại. Process được đóng sau run,
còn cache local có thể giữ lại. Không có watcher, daemon hoặc background
indexing mặc định.

## Một câu để trình bày

> AgentBase-MCP không đọc mù toàn bộ dự án. Nó dùng Code Graph như một bản đồ để
> tìm đúng phần cần xem, rồi quay lại code và tài liệu gốc để xác minh trước khi
> tạo kiến thức cho Hub.
