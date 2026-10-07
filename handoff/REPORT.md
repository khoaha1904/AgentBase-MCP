# Vòng 11 — 2026-10-07

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 11, kết thúc bằng `HẾT VÒNG 11`. Chủ repo yêu cầu
làm A–E theo thứ tự, gate và push riêng từng phần. Reviewer đã xác nhận Vòng 10
đạt 251/251 trên macOS với Node 24.20.0. Không chạm Hub thật, không thêm runtime
dependency hoặc nới guard.

## Phần A — Refresh không đi tiếp được

Làm xong; commit `029d3af`.

- A1: reader chấp nhận skeleton của Refresh, vẫn kiểm tra hình dạng skeleton,
  Receipt của Initial Ingest, nguồn, đường dẫn, coverage và Hub-base.
- A2: adapter truyền relationship/Flow references từ `changes` vào validation
  session. Target tự sinh gồm Published concept được tham chiếu và skeleton,
  loại identity/path đang ở changed set; không phải tự khai báo Domain hoặc
  Resource của repo khác. Kiểm tra cả trước khi ghi bytes mới vào bundle.
- Test đường chính dùng Hub Git fixture: publish repo A với Repository layout
  cũ, publish repo B có Resource dùng chung, Prepare Coverage Refresh A với
  source không đổi và skeleton chuẩn hóa, sửa publisher, gọi MCP
  `validate_okf_changes` với session và `targets: []`, Finalize rồi Inspect.
  Đều đạt; proposal dừng ở preview, không Publish. Test cũ vẫn kiểm tra riêng
  source-delta accounting, publish và convergence.
- A3: đã rà replacement Initial Ingest: chỉ tái tạo mode `new` với Receipt
  rebound theo base mới, giữ confirmed Domain/home plan và materialize skeleton.
  Refresh không có Receipt tiếp tục trả `reprepare_required` khi base đổi.
  Batch checkpoint vẫn yêu cầu mode `new`, Receipt, source và manifest base;
  composition cũng kiểm tra base/membership. Không mở thêm đường recovery.
  Các test Receipt rebase, batch và source/base guards chạy trong gate.
- Bổ sung assertion reader từ chối skeleton sai extension và Initial Ingest
  có skeleton nhưng thiếu Receipt. Không sửa guard để vượt qua gate.

### Số đo A4

Đo UTF-8 byte của `JSON.stringify(response)` gồm MCP content envelope trên
chính fixture Refresh ở A1: Finalize **598 byte**, Inspect **13.306 byte**.
Hai concept sửa là Repository và Function; groups không lặp bytes. Đây là
số đo fixture, không phải dữ liệu Hub của reviewer.

## Phần B — Bộ đo tất định

Chưa làm. Sẽ bổ sung script offline, spec JSON riêng, link/retrieval/cost metrics
và fixture F1/F2; model scoring vẫn ngoài phạm vi.

## Phần C — Đối chiếu tên chéo repo

Chưa làm. Phụ thuộc bộ đo B; không coi gợi ý Refresh hiện có là matcher C.

## Phần D — Luật nội dung và giảm token

Chưa làm. Chưa rút tool schema, skill hoặc docs; không chạm `presentation/`.

## Phần E — Windows và npm registry

Chưa làm. Chưa đổi installer hoặc CI; chưa xác nhận Windows.

## Kiểm chứng và rà diff

- Phần A: Node `v24.18.0`, `TMPDIR` là symlink trỏ vào thư mục fixture thật.
- Test end-to-end tập trung đạt 2/2; test reader/layout và MCP integration
  được mở rộng trong suite hiện có, không thêm test đếm trùng.
- `npm run verify` Phần A đạt **251/251**, fail 0, skip 0; trước là 251/251.
  Contract, release evidence, retired graph, upstream, Hub validator, typecheck,
  depcruise, knip, gitleaks và diff checks đều đạt. Không thêm dependency.
- Đã đọc toàn bộ source/test/contract diff so với `origin/main`: không thấy
  token thật, hostname nội bộ, URL Hub thật, email riêng tư, đường dẫn tuyệt
  đối trên máy hoặc tên dự án/khách hàng/người. Chỉ thêm dữ liệu fixture tổng
  quát; email trong fixture là email tác giả commit.
- Chỉ push `origin main` tới đúng repository public này sau gate, không
  force-push. Báo cáo riêng: `Update handoff report for round 11 (A)`.

## Chưa làm / chưa kiểm chứng được

- B–E chưa làm ở checkpoint A; sẽ tiếp tục theo thứ tự sau push A.
- Không chạy macOS, Windows hoặc Hub GHE thật. Fixture local không chứng minh
  semantic usefulness hoặc đầy đủ coverage của repository thật.

## Câu hỏi và phản biện

Không có câu hỏi chặn A. Chọn truyền references của changed set qua adapter
thay vì trả toàn bộ target catalog: sửa đúng trường hợp agent validate trước
khi lưu bytes, đồng thời tránh phình response validation theo kích thước Hub.
