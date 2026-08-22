# 02 — Hub, Domain và Repository được tổ chức thế nào?

> Trạng thái: Hướng sản phẩm đã chốt; single-repository Domain/Repository foundation đã implement.

## Câu trả lời ngắn

Một Hub chứa mạng lưới kiến thức của nhiều Domain. Domain, Repository, System,
workload và shared contract/resource hữu ích là concept; relation nối chúng.

```text
Một AgentBase-Hub
├── Domains: Crawler, Recommendation
├── Repositories: crawler-api, recommendation-service
├── Systems và Components
├── Interfaces và shared Resources
└── Integration contracts có danh tính riêng, nếu có
```

Các Domain thực tế như Crawler và Recommendation nằm cùng một Hub; không cần
thêm một Domain cha chỉ để biểu diễn ngành của cả công ty.

## Quan hệ không nằm trong một khu vực riêng

```text
Crawler Worker ──publishes-to──→ Vehicle Data Queue
                                      ↑
Recommendation Worker ──consumes─────┘
```

Nếu `Vehicle Data Queue` có shared contract/ownership đủ mạnh để promote thành
Resource hoặc Interface, nó chỉ tồn tại một lần. Queue nội bộ đơn giản vẫn có
thể là embedded knowledge trong producer/consumer. Relation được dùng giống
nhau cho cả nội bộ một Domain và xuyên nhiều Domain.

Một API call hoặc gửi message thông thường chỉ là relation. Chỉ tạo concept
Integration Contract riêng khi nó có danh tính, ownership, mapping hoặc giá trị
query độc lập.

## Xác nhận Domain trước khi Ingest

```text
Đọc nhanh README và tài liệu chính
                ↓
Đề xuất Domain và so với Hub hiện tại
                ↓
Hiển thị trùng khớp hoặc cảnh báo
                ↓
Người dùng xác nhận hoặc sửa
                ↓
Mới bắt đầu Ingest
```

AI không tự quyết định Domain và cũng không tin mù quáng tên người dùng nhập.
Domain mới, tên gần giống Domain cũ và dấu hiệu không phù hợp đều phải được báo
rõ trước khi Ingest.

Với batch nhiều repository, người dùng có thể gán tất cả vào một Domain. AI vẫn
kiểm tra từng repository, cảnh báo repository bất thường và chờ người dùng;
không tự đổi Domain hoặc tự loại repository.

## Điểm đã chốt

- Một Domain có thể chứa kiến thức từ nhiều repository.
- Mỗi repository có đúng một Domain chính. Việc concept hoặc relation của nó
  liên kết sang Domain khác không làm repository thuộc thêm Domain đó.
- Với monorepo, subproject chỉ là evidence/query scope và kế thừa primary Domain
  của repository; nó không có Repository ID hoặc Domain assignment riêng trong
  phiên bản đầu.
- Một repository có thể liên kết với repository ở Domain khác qua API, Queue,
  event hoặc integration contract.
- API/shared Queue có thể là Interface/Resource concept khi có independent
  value; relation là đường nối, không phải một thư mục “quan hệ dùng chung”.
- Mỗi concept có một danh tính trong Hub, không được sao chép theo từng Domain.
- Quan hệ khó xác minh giữa nhiều repository được trình bày ở
  [phần 06](06-cross-repository-and-cross-domain-relationships.md).

## Còn để low-level quyết định

- Chính xác những README/docs nào được đọc khi kiểm tra Domain.
- Giao diện xác nhận cho một repository và batch nhiều repository.
