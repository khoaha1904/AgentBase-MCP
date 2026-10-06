# Vòng 9 — 2026-10-06

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 9, kết thúc bằng `HẾT VÒNG 9`. Reviewer xác nhận
Vòng 8 đạt `247/247`, validation có session và Repository skeleton đã đạt;
chấp nhận chiều ngược đi qua Refresh của repository sở hữu evidence. Vòng này
sửa Domain continuity trên đường Initial Ingest chính, thêm gợi ý Refresh và
làm rõ yêu cầu Markdown link cho relationship.

## Kết quả theo từng mục

| Mục | Trạng thái | Kết quả và commit |
| --- | --- | --- |
| 1. Domain continuity | Làm xong | `91cc757`: giải quyết home plan đã xác nhận trước khi dựng continuity; lấy Domain từ default home, exception homes và participations. Dùng projection Domain có sẵn để bao gồm concept có physical home dù không có `part-of`, và concept tham gia Domain từ shared home. Test đi qua runtime thật: publish repo A vào Hub Git fixture, rồi Prepare repo B với `repositories/vehicle-consumer` và `confirmed_domain`; kết quả có Repository A, runtime A và tên queue embedded. `0702136` chỉnh câu trong contract cho rõ. |
| 2. Gợi ý chiều ngược | Làm xong | `2a8f2bd`: Finalize/Inspect trả `inspection.refreshSuggestions` gồm `items` và `omitted`. Mỗi gợi ý chỉ rõ Repository ID/identity, parent identity, Resource identity và tên embedded để Refresh kiểm tra `publishes-to`/`writes-to`. Tối đa 16 gợi ý, thứ tự ổn định, bỏ repo đang trong proposal và trường hợp đã có chiều ngược. Skill ingest nhắc báo gợi ý và tính chưa xác minh cho người dùng. |
| 3. Relationship cần link | Làm xong | `eb47e73`: skill ingest và OKF nói rõ mỗi relationship trong frontmatter cần link Markdown giải quyết được tới target trong nội dung. |
| 4. Báo cáo, gate và rà diff | Làm xong | Báo cáo này là commit riêng `Update handoff report for round 9`; chỉ push `origin main` sau gate và kiểm tra báo cáo. Không chạm Hub thật. |

## Kiểm chứng

- Node `v24.18.0`. `TMPDIR` trỏ tới symlink `link` của một thư mục fixture
  riêng; test xác nhận đường dẫn thật khi cần.
- `TMPDIR="$round9_tmp/link" npm run verify`: đạt toàn bộ gate, `248/248`,
  fail `0`, skip `0`; Vòng 8 là `247/247`. Thêm một test cho gợi ý Refresh và
  mở rộng test end-to-end/inspection đang có.
- Contract, retired-code-graph, release-evidence, upstream-foundations,
  hub-validator, typecheck, depcruise, knip, gitleaks và `git diff --check` đạt.
  Release evidence: `205/205` active requirements trên `64` test files;
  gitleaks báo `no leaks found`.
- Test tập trung Prepare/continuity: `4/4`. Test Finalize/Inspect/gợi ý:
  `5/5`, gồm so sánh gợi ý Finalize với Inspect và so sánh nguyên bytes parent
  của repo A giữa retained base và proposed bundle.
- Test gợi ý kiểm tra tên không khớp, Resource đã Published, repo đang được
  xử lý, cả hai predicate ngược, tính ổn định và overflow `18 → 16 + 2`.
  Inspection từ chối gợi ý bị sửa sau Finalize.
- Sandbox chặn child-process của Git trong test/contract checker; đã chạy lại
  gate với quyền thực thi cần thiết trên fixture cô lập. Không sửa guard.
- Đã đọc thủ công toàn bộ diff sắp push so với `origin/main`, gồm code, test,
  packaged skills, contract và báo cáo: không thấy token thật, hostname nội bộ,
  URL Hub thật, email riêng tư, đường dẫn tuyệt đối trên máy hoặc tên dự án/
  khách hàng/người. Tên repo/Domain là dữ liệu tổng quát giả lập; email trong
  lệnh tạo commit fixture là email tác giả commit. Gitleaks bổ sung kiểm tra
  secret, không thay thế rà thủ công.
- Đã kiểm tra branch hiện tại là `main`, origin có đúng một đích push là
  repository công khai này; không dùng remote hoặc branch khác.

## Chưa làm / chưa kiểm chứng được

- Gợi ý chỉ đối chiếu tên Resource với tên embedded sau khi chuẩn hóa chữ
  hoa/thường và khoảng trắng; đây là ứng viên, không chứng minh identity hay
  ownership. Parent phải có provenance từ đúng một Repository có identity
  trên retained base; parent nhiều nguồn Repository được để agent điều tra.
  Không dò theo prose, ARN hoặc fuzzy name và không tự thêm relationship.
- Giữ giới hạn continuity hiện có: mặc định tối đa 128 concept Domain, tối đa
  16 tên embedded mỗi concept và omitted counts cho concept bị cắt.
- Không chạy lại end-to-end trên macOS hoặc Hub GHE thật; các test dùng
  repository Git dùng xong bỏ và publication remote local giả lập.

## Câu hỏi và phản biện cho reviewer

Không có câu hỏi chặn. Gợi ý Refresh thực hiện cách đã được chấp nhận ở Vòng 8:
repo B có thể promote Resource, còn quan hệ ngược cần evidence của repo A và
một Refresh A riêng. Nếu chỉ trùng tên, agent phải kiểm tra nguồn trước khi
thêm quan hệ; gợi ý không xác nhận rằng repo A thực sự sở hữu Resource đó.
