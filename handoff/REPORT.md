# Vòng 10 — 2026-10-06

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 10, kết thúc bằng `HẾT VÒNG 10`. Reviewer xác nhận
Vòng 9 đạt `248/248` trên macOS; Domain continuity, gợi ý Refresh và luồng
Refresh repo sở hữu evidence đã chạy được trên Hub GHE tạm. Vòng này yêu cầu
rút response Refresh, trả publication digest, chuẩn hóa Repository cũ, gắn
Resource cross-boundary vào Domain đã xác nhận và làm rõ gap/coverage.

## Kết quả theo từng mục

| Mục | Trạng thái | Kết quả và commit |
| --- | --- | --- |
| 1. Response file modified | Làm xong | `1581fd9`: CLI/MCP Finalize chỉ trả `proposal_id`, `proposal_digest`, counts, Questions/limitations, coverage/accounting summary, Refresh suggestions và source-head status nếu có. Inspection đầy đủ vẫn lưu private cho Inspect/Publish. Mọi `groups.*` chỉ có metadata; bytes chỉ ở `entries`. Inspect chuẩn hóa cả groups của inspection cũ khi đọc. Test giới hạn Finalize dưới 1.000 byte và Inspect dưới 24.000 byte trên fixture hai file modified; kiểm tra CLI/MCP cùng kết quả. `c7624b1` sửa fixture dùng đúng kiểu input proposal. |
| 2. Finalize digest | Làm xong | `c540288`: thêm `proposal_digest` bằng đúng `proposal.diffDigest`; public summary dùng field này cùng `proposal_id`. Không đổi digest hay yêu cầu Publish. |
| 3. Repository kiểu cũ | Làm xong | `3b9e2e6`: Refresh Prepare nhận diện các hàng Embedded Knowledge được chép nguyên từ concept con có cùng source repository, thay chúng bằng link và trả Repository đã sửa trong `skeletons`. Bảng chỉ chứa hàng chép được bỏ; bảng trộn giữ hàng riêng của Repository. Giữ prose riêng, sources, metadata, identity và bytes của concept con. Không sửa Repository human/verified hoặc có nguồn từ repo khác. Skill OKF nói rõ bảng nằm ở concept sở hữu evidence, Repository link tới con. |
| 4. Resource cross-boundary | Làm xong | `f4415d8`: Resource schema cho phép `part-of → Domain`. Prepare mở rộng Domain home đã xác nhận của Resource promoted bằng cross-boundary thành participation có owner-guidance trong plan đã lưu; skeleton có edge và Markdown link, không cần `implemented-in` tới repo đang ingest. Test đường Prepare repo thứ hai kiểm tra relation, validate và continuity `domains`; test plan kiểm tra default/exception home, không duplicate, shared home và promotion khác. |
| 5. Coverage và known gaps | Làm xong | `05f99cc`: ghi rõ coverage là phạm vi điều tra còn changeAccounting là tính đầy đủ của delta nguồn; hai cờ có thể khác nhau. `knownGaps` giữ danh sách object, mỗi object có `detail` ngắn và `details` là danh sách limitation/missing evidence. Finalize giữ cả hai summary, không lặp limitation đã trùng và vẫn trả các Question ID từ Receipt. |
| 6. Báo cáo, gate, rà diff | Làm xong | Báo cáo là commit riêng `Update handoff report for round 10`. Chỉ push `origin main` sau gate. Không chạm Hub thật. |

## Kích thước response

Dùng cùng một fixture Refresh trên baseline Vòng 9 và source Vòng 10: hai file
Function `publisher`/`consumer`, mỗi file khoảng 4KB, 120 dòng nội dung chung và
một dòng thay đổi. Tạo byte inspection, proposal refresh và semantic impact
bằng code thật; dùng action fixture để trả proposal đó qua `callHubOkfTool`.
Đo UTF-8 byte của `JSON.stringify(response)` gồm MCP content envelope, không
chỉ riêng nội dung file. Test lưu/read inspection bằng review action thật;
fixture không gọi Hub hay provider thật.

| Response | Trước | Sau |
| --- | ---: | ---: |
| Finalize | 41.406 byte | 453 byte |
| Inspect | 41.348 byte | 22.592 byte |
| Tổng hai lần gọi | 82.754 byte | 23.045 byte |

Tổng giảm khoảng **72,2%**. Số đo là fixture này, không thay thế số 142KB của
reviewer. Modified vẫn trả before/after đầy đủ đúng một lần trong Inspect,
bounded và có digest/truncated; chưa đổi sang diff-only để reviewer có nguyên
nội dung kiểm tra mà không cần thêm lần gọi hoặc một bộ tạo diff mới.
Finalize không trả file bytes, semantic impact hay per-path accounting outcomes.

## Kiểm chứng

- Node `v24.18.0`, `TMPDIR` qua symlink `link` trỏ tới thư mục thật `real`.
- `TMPDIR="$round10_tmp/link" npm run verify`: đạt **251/251**, fail `0`,
  skip `0`; baseline reviewer là `248/248`.
- Contract, retired-code-graph, release-evidence, upstream-foundations,
  hub-validator, typecheck, depcruise, knip, gitleaks và `git diff --check` đạt.
  Release evidence: `205/205` active requirements trên `65` test files;
  gitleaks báo `no leaks found`.
- Đã chạy `npm run build:hub-validator`; artifact hiện tại không cần đổi.
- Test tập trung authoring/profile/layout/inspection đạt `11/11`; kiểm tra
  cuối cho gap và compact summary đạt `6/6`.
- Test compact response kiểm tra modified bytes không ở groups, digest, CLI/MCP,
  inspection cũ, no-change và replacement-session không mất recovery guidance;
  coverage partial nhưng delta complete vẫn giữ cả hai ý nghĩa và Question ID.
- Test layout dùng Prepare session thật, kiểm tra trả skeleton, tính idempotent,
  link, frontmatter giữ nguyên, mixed table/prose và bảo vệ human/verified bytes.
- Test ingest hai repo kiểm tra Resource có owner-evidenced `part-of`, link tới
  Domain, validation qua và continuity của Resource có Domain đúng.
- Đã đọc thủ công toàn bộ diff sắp push so với `origin/main`, gồm source, tests,
  packaged skills, Product/Architecture/Capability Contracts và báo cáo: không
  thấy token thật, hostname nội bộ, URL Hub thật, email riêng tư, đường dẫn tuyệt
  đối trên máy hoặc tên dự án/khách hàng/người. Tên và dữ liệu thêm vào là fixture
  tổng quát; gitleaks bổ sung kiểm tra secret, không thay thế rà thủ công.
- Branch hiện tại là `main`; origin có đúng một đích push là repository công
  khai này. Không dùng remote/branch khác, không force-push.

## Chưa làm / chưa kiểm chứng được

- Không chạy Hub GHE thật hay macOS; mọi Hub/source/publication remote trong
  test đều là fixture local dùng xong bỏ.
- Chuẩn hóa Repository chỉ xử lý bảng chuẩn có hàng thực sự chép từ concept
  con với provenance khớp. Không xóa nội dung riêng hoặc tự diễn giải prose tùy
  biến. Giữ sources cũ để bảo toàn evidence; không thực hiện migration toàn Hub.
- Resource đã Published từ trước không bị tự sửa khi ingest repo khác. Agent
  có thể thêm participation có evidence qua Refresh bình thường; không tự
  rehome và không suy luận repository sở hữu chỉ từ config/tên.
- `shared/` không phải Domain; Resource homed ở shared vẫn cần participation
  được xác nhận riêng. Các promotion basis khác giữ quy tắc home và participation
  tách biệt như trước.

## Câu hỏi và phản biện cho reviewer

Không có câu hỏi chặn. Đã chọn before/after một lần trong Inspect thay vì
thêm diff-only representation. Mọi file detail vẫn có thể được reviewer kiểm
tra trước Publish; Finalize chỉ cung cấp identity/digest và summary để đi tới
lần Inspect duy nhất.
