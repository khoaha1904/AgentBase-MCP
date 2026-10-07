# Vòng 12 — 2026-10-08

## Prompt đã nhận

Đã nhận đầy đủ prompt, kết thúc bằng `HẾT VÒNG 12`; lưu nguyên văn ngoài repo
để đọc lại sau compact, không commit. Vòng 11 A/B được reviewer chấp nhận:
253/253 trên macOS, Refresh thật qua và bộ đo chạy trên 11 repo IaC.
Vòng này làm mục 2 → C → D1/D2 → E → D3, gate và push riêng từng phần.
Không chạm Hub thật, không thêm runtime dependency hoặc nới guard.

## Mục 2 — Inspect và session Refresh

Làm xong; commit `4641d6e`.

- Inspect mặc định trả unified hunks với 3 dòng ngữ cảnh, tối đa 8 KiB/file,
  digest, kích thước byte trước/sau và đường dẫn file private trong proposal.
  Giữ proposal_digest, semanticImpact, file list, counts, Questions, limitations
  và suggestions. `include_content: true` trả bounded toàn văn thay cho hunks;
  file private cung cấp bytes đầy đủ khi cần. Preserved không có nội dung.
- Retained inspection và kiểm tra proposal/tree/semanticImpact không đổi;
  projection chỉ diễn ra sau verification. Groups chỉ có metadata. Có test
  nhiều hunk, tạo/xóa file, thiếu newline và rewrite vượt bound.
- Prepare trả `resumed`, `createdAt`, `workspaceChanges` (128 mục cùng omitted)
  và hướng dẫn restart. Resume giữ thời điểm và các chỉnh sửa trước.
  `restart: true` chỉ dành cho Refresh: tạo bundle mới, giữ session cũ và dùng
  pointer private để lần Prepare cùng input sau đó resume bundle mới.
  Reader, source, Hub-base, authority và repair guards vẫn giữ nguyên.
- Test A1 đi Prepare → Validate có session/targets rỗng → Finalize → Inspect;
  kiểm tra thêm resume thấy file sửa, restart giữ nguyên bytes cũ và lần Prepare
  tiếp theo chọn session mới. Skill Refresh và contract đã cập nhật.

### Số đo trên cùng fixture

UTF-8 byte của JSON response gồm MCP envelope; token chỉ ước lượng bytes/4.

| Refresh A1 | Trước | Sau |
| --- | ---: | ---: |
| Finalize | 598 | 598 |
| Inspect | 13.306 | 9.644 |

Opt-in Inspect toàn văn vẫn 13.306 byte trên chính fixture này. Độ dài đường
dẫn temp làm response mặc định khác đôi chút giữa lần chạy.

| Bộ đo B, cost fixture | Trước mục 2 | Sau mục 2 |
| --- | ---: | ---: |
| listTools, giữ 36 tool | 38.954 | 39.175 |
| Preflight | 1.149 | 1.147 |
| Discover | 1.983 | 1.983 |
| Schemas | 3.256 | 3.256 |
| Prepare | 2.870 | 3.099 |
| Validate | 627 | 627 |
| Finalize | 1.159 | 1.159 |
| Inspect | 9.400 | 9.865 |

Cost fixture tạo file mới và toàn bộ nội dung là diff; overhead metadata/path
làm response tăng nhẹ. Test hai file Refresh sửa 1 dòng/file xác nhận Inspect
nhỏ hơn nửa opt-in toàn văn. Không coi số đo tạo file là mức giảm Refresh.

F1: baseline 0/8, recall 0, precision không xác định (0 candidate).
F2: baseline 0/2 tương tự. Seed và retrieval không đổi; F2 hit@1 tổng 0,5,
hit@5 = 1. Public corpus chưa chạy, thực hiện trong C.

## Phần C — Đối chiếu tên chéo repo

Chưa làm; tiếp tục ngay sau checkpoint mục 2.

## Phần D1/D2 — Luật nội dung và tool schema

Chưa làm.

## Phần E — Windows và npm registry

Chưa làm.

## Phần D3 — Rút gọn skill và docs

Chưa làm; làm cuối, không chạm `presentation/`.

## Kiểm chứng và rà diff

- Node `v24.18.0`, `TMPDIR` qua symlink. Test tập trung 6/6.
- `npm run verify`: trước **253/253**, sau **254/254**, fail/skip 0.
  Contract, retired graph, release evidence (209/209 trên 67 test files),
  upstream, Hub validator, typecheck, depcruise, knip, gitleaks và diff check
  đều đạt. Skill validator đạt.
- Đã đọc toàn bộ diff code/test/contract/skill và báo cáo so với `origin/main`:
  không thấy token thật, hostname nội bộ, URL Hub thật, email riêng tư, đường
  dẫn tuyệt đối trên máy hoặc tên dự án/khách hàng/người. File paths trong
  response là dữ liệu runtime private, không có path máy thật được hardcode.
- Chỉ push `origin main` tới đúng repository public đã được chủ repo cho phép;
  commit báo cáo `Update handoff report for round 12 (2)`. Không force-push.

## Chưa làm / chưa kiểm chứng được

C, D1/D2, E và D3 còn lại; đây là checkpoint từng phần, tiếp tục trong phiên.
Chưa có số đo corpus public hoặc evidence CI Windows/macOS cho Vòng 12.

## Câu hỏi và phản biện

Chọn projection sau verification để giảm bytes mà giữ nguyên state và guard
publication. Diff dùng alignment tất định có bound, không thêm dependency.
Restart dùng pointer tới session mới thay vì xóa/ghi đè bundle cũ; hành động
này không Publish hoặc thay đổi Hub. Không có câu hỏi chặn mục 2.
