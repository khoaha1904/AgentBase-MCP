# 13. Visualize Published knowledge

AgentBase có hai cách biến knowledge đã Published thành hình ảnh. Chúng dùng
cùng dữ liệu nhưng phục vụ hai việc khác nhau.

## 1. Vẽ diagram khi đang hỏi

`agentbase-diagram` là workflow nhẹ. Người dùng hỏi về một phần cụ thể, AgentBase
chọn các concept/relation liên quan rồi vẽ một trong ba loại đầu tiên:

- Architecture: các thành phần và ranh giới chính;
- Dependency: thành phần nào phụ thuộc thành phần nào;
- Sequence: một luồng chạy theo thứ tự nào.

Diagram chỉ mô tả dữ liệu có bằng chứng. Thiếu relation thì trả diagram một phần
hoặc báo chưa đủ dữ liệu; Agent không tự nối các node cho đẹp.

## 2. Generate Domain site một lần

`agentbase-domain-site` là workflow nặng và chỉ chạy khi người dùng yêu cầu rõ.
Nó generate một static 2D knowledge map cho đúng một Domain từ đúng một
Published Hub commit. Site có search, filter, focus theo lân cận, Flow toggle
và sidebar đọc thông tin node.

Kết quả là một build directory cố định. Người dùng review rồi có thể copy sang
repo riêng như `Domain-Hub` và publish bằng GitHub Pages. Sau khi generate, site
không cần MCP, token hay kết nối Hub; vì vậy muốn dữ liệu mới phải generate lại.

## Một nguồn dữ liệu chung

```text
Published OKF commit
        ↓
Published visualization projection
        ├── bounded packet → diagram
        └── full Domain snapshot → static 2D site
```

Projection giữ concept, relation, direction, provenance và open Question. Nó
không lưu màu, tọa độ hoặc layout vào Hub. Relation candidate chưa được chấp
nhận không trở thành edge.

Một relation đã Published có thể nối sang Domain khác. View vẫn thuộc đúng một
Domain: đầu bên ngoài chỉ hiện như boundary node và không bị hiểu thành repository
thuộc nhiều Domain hoặc tự mở rộng cả Domain kia.

## Ranh giới

- Chỉ đọc Published Hub; không trộn Local Draft.
- Không thay thế search/query knowledge hoặc Code Graph.
- Không tạo full-Hub UI hoặc giữ thêm một chế độ 3D.
- Không watcher, daemon, live refresh hoặc auto-push Domain site.
- Phải cảnh báo trước khi đưa knowledge nội bộ lên Pages/repo có visibility rộng.
- Architecture có thể partial; Dependency cần edge thật; Sequence cần
  `flow_steps` thật.

Qualification hiện tại dùng một Domain có tám repository, runtime relations và
Flow steps thật. Cả ba loại diagram và static 2D site đều được tạo từ cùng một
Published commit; thiếu topology ở Domain khác vẫn được báo rõ thay vì suy diễn.
