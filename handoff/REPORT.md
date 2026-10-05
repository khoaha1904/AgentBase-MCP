# Vòng 8 — 2026-10-05

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 8, kết thúc bằng `HẾT VÒNG 8`. Reviewer xác nhận
Vòng 7 đạt `246/246`, response ingest đã giảm mạnh, và yêu cầu sửa validation
hồi quy, credential theo Hub profile, Repository lặp nội dung, continuity giữa
các Repository cùng Domain, cập nhật skill và kiểm chứng rồi push.

## Kết quả theo từng mục

| Mục | Trạng thái | Kết quả |
| --- | --- | --- |
| 1. Validate hồi quy | Làm xong | Session validation loại skeleton có identity/path nằm trong `changes`; runtime đưa các target Published được relationship của bundle tham chiếu vào; test kiểm tra changed skeleton không gây duplicate và Domain Published được nhận. |
| 2. Token remote trống | Làm xong | `hub connect` ghi token vào credential của đúng Hub profile, giữ nguyên token chung; profile token được ưu tiên khi attach/bootstrap; thông báo hướng người dùng tới skill `$agentbase-hub`, có test. |
| 3. Repository lặp nội dung | Làm xong | Repository skeleton chỉ giữ source của Repository, navigation/link tới concept promoted; không chép sources hoặc bảng Embedded Knowledge của concept con. |
| 4. Liên kết cùng Domain | Làm xong một phần | Prepare continuity trả `domainConcepts` có summary bounded và tối đa 16 tên embedded item/concept; skill ingest và OKF đã hướng dẫn sử dụng context này. |
| 5. Liên kết hai chiều | Đề xuất, chưa tự động hóa | Khi Repository B promote Resource chung, agent thêm `reads-from` B → Resource. Chiều `publishes-to` của Repository A nên đi qua một Refresh A proposal với evidence của A; tự sửa concept Published của A trong ingest B sẽ vượt ownership/lifecycle boundary. Prepare đã cung cấp đủ tên/identity để tạo follow-up rõ ràng. |
| 6. Báo cáo và gate | Làm xong | Code/docs/tests ở commit `d5a8796`; báo cáo này là commit riêng theo quy tắc handoff. Không chạm Hub thật. |

## Kiểm chứng

- Node `v24.18.0`; chạy `TMPDIR` qua symlink bằng một thư mục thật `real` và
  symlink `link`.
- `TMPDIR="$base/link" npm run verify`: đạt toàn bộ contract/type/dependency/
  knip/gitleaks checks và `npm test` `247/247`, fail `0`; gitleaks báo không có
  leak.
- Test tập trung: CLI `9/9`, server `4/4`, Initial Ingest `2/2`, setup `7/7`,
  continuity `2/2`.
- Đã rà thủ công diff sắp push so với `origin/main`: không có token,
  hostname nội bộ, URL Hub thật, email riêng tư, đường dẫn tuyệt đối trên máy,
  hoặc tên dự án/khách hàng/người. URL và tên trong fixture là giá trị giả lập;
  `gitleaks` không thay thế bước rà thủ công này.

## Chưa làm / chưa kiểm chứng được

- Chưa tự sinh relationship ngược giữa hai Repository trong một Ingest; đã ghi
  lý do ownership/lifecycle và cách Refresh follow-up ở mục đề xuất.
- Không chạy census, sync hoặc publish trên Hub thật theo quy tắc handoff.

## Câu hỏi và phản biện cho reviewer

- Cách đơn giản nhất hiện tại là coi quan hệ ngược là một Refresh proposal của
  Repository sở hữu evidence. Nếu reviewer muốn một relation-candidate workflow
  tự động giữa hai proposal, đó là capability riêng cần xác định ownership và
  admission trước khi triển khai.
