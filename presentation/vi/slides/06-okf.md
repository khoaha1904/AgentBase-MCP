# Slide 06 — OKF: từ pattern thành format chung

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Giới thiệu OKF như một open format do Google Cloud đề xuất để formalize LLM
Wiki, thay vì mô tả nó như một platform hoặc một knowledge engine.

## Thông điệp duy nhất

OKF chuẩn hóa tập convention tối thiểu để con người, agent và nhiều công cụ có
thể cùng tạo, đọc và trao đổi knowledge.

## Nội dung hiển thị

- Một knowledge bundle là thư mục Markdown.
- YAML frontmatter chứa metadata có cấu trúc.
- Markdown links tạo quan hệ giữa các concept.
- Provenance, verification và freshness là metadata có thể truy vấn.

## Lời thoại dự kiến

“Ý tưởng LLM Wiki rất hợp với bài toán này, nhưng nó vẫn chỉ là một pattern.
Nếu mỗi team tự định nghĩa một cấu trúc Markdown và YAML riêng, thì cuối cùng
mỗi knowledge base lại cần một parser và một bộ convention riêng.

Google Cloud sau đó giới thiệu Open Knowledge Format, hay OKF. Họ mô tả OKF là
cách formalize LLM Wiki thành một format có thể trao đổi giữa nhiều producer và
consumer khác nhau.

Về hình thức, OKF vẫn rất đơn giản: một thư mục Markdown, một ít YAML frontmatter
và các Markdown link. Phần đáng giá không phải là cú pháp, mà là convention chung
về concept, source, người tạo, người review, trạng thái và freshness.

Vì vậy, thay vì tạo thêm một Markdown format chỉ AgentBase hiểu, mình chọn OKF
làm format nền rồi bổ sung phần đặc thù của AgentBase ở bên trên.”

## Câu chuyển sang slide 07

“OKF định nghĩa knowledge được lưu như thế nào. Nhưng agent sẽ truy cập nó bằng
cách nào?”

## Nguồn

- Google Cloud announcement: https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
- OKF v0.2 specification: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
