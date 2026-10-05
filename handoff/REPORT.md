# Vòng 7 — 2026-10-05

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 7, kết thúc bằng `HẾT VÒNG 7`. Reviewer đã kiểm
end-to-end trên Hub GHE tạm và yêu cầu sửa onboarding Hub rỗng, thu gọn response
Finalize/Inspect, tránh lặp nội dung OKF, tự đưa skeleton Prepare vào validation,
mở rộng census cho lịch AWS, sửa mô tả/tên field và kiểm chứng rồi push.

## Kết quả theo từng mục

| Mục | Trạng thái | Kết quả |
| --- | --- | --- |
| 1. Hub mới không bị ngõ cụt | Làm xong | `abs hub connect` giữ token vừa nhập khi remote không có branch, báo bước tiếp theo là preview/confirm bootstrap; có test CLI. |
| 2. Response Finalize/Inspect | Làm xong | MCP chỉ trả payload trong `content[].text`; nhóm `added` giữ metadata nhưng không lặp bytes, file `preserved` không trả nội dung; có test giới hạn response. |
| 3. Nội dung OKF bị lặp | Làm xong | Skeleton con chỉ giữ sources nó tự dùng và liên kết, không chép embedded sources của parent; receipt authoring test đã cập nhật. |
| 4. Validate tự biết concept Prepare | Làm xong | Validation có `session_id` tự nhập targets từ các skeleton của session; có đường kiểm thử trong bộ receipt/authoring. |
| 5. Census trigger lịch | Làm xong | Nhận diện EventBridge rule/target và Scheduler; integration bỏ test/stub/mock; Flow candidate trùng outbound bị loại; có test. |
| 6. Mô tả và tên gọi | Làm xong | Mô tả bootstrap không còn nói ghi Hub CI; Inspect trả thêm `proposal_digest` đúng field Publish nhận. |
| 7. Báo cáo và gate | Làm xong | Code/docs/tests ở commit `7d20246`; báo cáo này là commit riêng theo quy tắc handoff. Không chạm Hub thật. |

## Kiểm chứng

- Node `v24.18.0`; chạy `TMPDIR` qua symlink bằng `base=$(mktemp -d)`, thư mục
  thật `real` và symlink `link`.
- `TMPDIR="$base/link" npm run verify`: đạt; contract, typecheck,
  dependency, knip, gitleaks và `npm test` đều qua. Kết quả test: `246/246`,
  fail `0`; gitleaks báo không có leak.
- Test tập trung trước gate: Discovery `31/31`, CLI `9/9`, Inspect `2/2`.
- Fixture response dùng cùng proposal/inspection và một file 17,000 ký tự:
  serialization cũ (content + structuredContent, cùng dữ liệu hai lần) là
  `35,168` bytes; response mới của Finalize/Inspect dùng một bản payload là
  `17,623` bytes. Group `added` không chứa lại file bytes; đây là fixture một
  file nên tỷ lệ nhỏ hơn trường hợp nhiều group thực tế.
- Đã rà thủ công diff sắp push so với `origin/main`: không có token,
  hostname nội bộ, URL Hub thật, email riêng tư, đường dẫn tuyệt đối trên máy,
  hoặc tên dự án/khách hàng/người. Các URL và tên trong fixture là giá trị giả
  lập đã có sẵn trong test; `gitleaks` không thay thế bước rà thủ công này.

## Chưa làm / chưa kiểm chứng được

- Không có mục bắt buộc nào còn thiếu.
- Không chạy census trên Hub thật và không publish tới Hub thật theo quy tắc
  handoff.

## Câu hỏi và phản biện cho reviewer

- Không có câu hỏi chặn công việc.
- Fixture response một file đo được mức giảm khoảng 50%; các response nhiều
  entry sẽ giảm thêm vì đã bỏ cả structuredContent và bytes lặp trong groups.
