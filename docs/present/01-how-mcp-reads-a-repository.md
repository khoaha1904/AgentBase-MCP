# 01 — MCP đọc một dự án như thế nào?

> Trạng thái: Hướng sản phẩm đã chốt; local Code Graph đã implement. Quy tắc
> chọn repository trong workspace nhiều repo chờ audit implementation sau khi
> hoàn tất 12 phần.

## Câu trả lời ngắn

MCP dùng Code Graph để tạo một bản đồ của repository, sau đó đọc chính xác
những đoạn code và tài liệu cần thiết để làm bằng chứng.

```text
Người dùng gọi skill ingest/refresh
             ↓
Agent yêu cầu MCP lập bản đồ repository
             ↓
Code Graph tìm file, function, dependency và luồng gọi
             ↓
Agent dùng bản đồ để tìm đúng nơi cần kiểm tra
             ↓
MCP đọc code hoặc tài liệu gốc để lấy bằng chứng
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

## Khi nào graph được tạo?

Graph được tạo hoặc reuse theo kiểu lazy: chỉ khi một workflow thật sự cần đọc
source chính xác của repository đã chọn. Việc mở thư mục cha hoặc chỉ query Hub
không làm MCP prebuild graph.

Trong Ingest, graph được tạo hoặc reuse ở bước điều tra. Trong Refresh, MCP chỉ
reuse cache khi repository identity, source revision, engine và namespace khớp;
nếu source đã đổi thì index lại. Process được đóng sau run, còn cache local có
thể giữ lại. Không có watcher, daemon hoặc background indexing mặc định.

## Một câu để trình bày

> AgentBase-MCP không đọc mù toàn bộ dự án. Nó dùng Code Graph như một bản đồ để
> tìm đúng phần cần xem, rồi quay lại code và tài liệu gốc để xác minh trước khi
> tạo kiến thức cho Hub.
