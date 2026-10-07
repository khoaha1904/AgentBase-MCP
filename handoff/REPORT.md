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

Làm xong phạm vi offline B1–B4; commit `99b3e08`. B5 tùy chọn chưa chạy.

- Script `scripts/qualification/measure.mjs` nhận đường dẫn spec JSON ngoài
  repo; in JSON trên stdout và bảng ngắn trên stderr. `--output` ghi JSON vào
  file với quyền private. Hình dạng spec và giới hạn nằm ở
  `docs/capabilities/12-version-scope/03-benchmark-requirements.md`.
- Dùng `scripts/qualification/` vì đây là tiện ích kiểm chứng source-only,
  ngoài runtime MCP và release bundle. Không khôi phục runner/model benchmark
  hoặc `scripts/benchmark`; guard retired runner giữ nguyên.
- Spec chứa 2–32 repo local, link mong đợi, câu hỏi và một trong hai Hub input:
  thư mục concept hoặc `AGENTBASE_HOME` đã sync. Chế độ Published đọc ref qua
  Git local, không đọc credential, không sync/fetch/migration. Checkout bẩn
  vẫn bị guard hiện có từ chối; không tự sửa.
- Search dùng đúng `searchHubConceptsWithFreshness` mà `search_hub_okf` gọi,
  giữ ranking sản phẩm. Ghi rank từng target, top-5 ID và hit@1/hit@5. Source
  expectation so với Repository identity đã resolve và relative source path.
- Chi phí dùng MCP client/server thật trong memory để đo `listTools` và một
  lượt Preflight → Discover → Schemas → Prepare → Validate → Finalize → Inspect
  trên home/Git fixture riêng, không token/network. Mỗi Seed của repo trong
  spec dùng census sản phẩm trên source local; remote authority là fixture,
  không tuyên bố đã preflight remote của repo thật.
- Output bỏ question text, source contents, absolute paths và raw exceptions;
  field phụ trong spec không được serialize ra kết quả. F1/F2 sinh trong test,
  không commit code repo bên ngoài. Test kiểm tra arithmetic và đường search,
  không đặt ngưỡng chất lượng làm admission gate.
- F1 có 5 repo với defaults/account/locals, ARN/URL interpolation, environment
  map và process.env, event source mapping, Spring @Value/placeholder, artifactId
  khác repo, Maven/Gradle version khác nhau, scoped npm, duplicate/external names,
  module refs v1/v2 và endpoint literal ở config theo nhiều cách.
- F2 có 2 repo và 6 concept ngắn: ghi rõ actual data rỗng thì không publish queue A,
  table X không nhận dữ liệu; trial luôn có qua queue B tới table Y.
- B5: chưa clone repo public hoặc lập spec public; không có SHA/kết quả public
  để báo cáo. Đây là bước tùy chọn, không đưa vào verify.

### Baseline B trước matcher C

| Fixture | Link tìm được / mong đợi | Recall | Precision |
| --- | ---: | ---: | --- |
| F1 | 0/8 | 0 | Không xác định, 0 candidate |
| F2 | 0/2 | 0 | Không xác định, 0 candidate |

Baseline này ghi rõ `empty-baseline`: chưa có matcher C, không lấy spec answer
làm candidate. Có danh sách missing; extra rỗng.

F2: table X hạng **1**, queue A hạng **3**, Repository API hạng **4**. Cả ba
trong top-5; hit@1 theo ba target là 1/3, hit@5 là 3/3. Top-5:
`resources/table-x`, `resources/table-y`, `resources/queue-a`,
`repositories/metrics-api`, `resources/queue-b`. Câu hỏi source-evidence riêng
trả `metrics-api:src/producer.js` ở hạng 1. Tổng 4 expectations: hit@1 = 0,5,
hit@5 = 1; 0 document bị bỏ do bound. Đây là lexical fixture evidence,
không phải đánh giá câu trả lời của model.

| Response trên cost fixture | Byte | Token ước lượng |
| --- | ---: | ---: |
| listTools, 36 tool | 38.954 | 9.738,5 |
| Preflight | 1.149 | 287,25 |
| Discover | 1.983 | 495,75 |
| Schemas | 3.256 | 814 |
| Prepare | 2.870 | 717,5 |
| Validate | 627 | 156,75 |
| Finalize | 1.159 | 289,75 |
| Inspect | 9.400 | 2.350 |

Cost fixture chỉ author Repository purpose, không đo semantic ingest của repo
thật. UTF-8 JSON bytes gồm MCP envelope; token = bytes/4, không phải tokenizer
model. Preflight/Prepare chứa private fixture paths nên độ dài path trên máy
chạy có thể làm byte count khác nhau; output chỉ giữ số đo, không in path đó.

Seed F1 lần lượt: infrastructure 3.178, producer 2.532, consumer 2.540,
spring-client 1.747, java-consumer 1.747 byte. Seed F2: metrics-api 1.909,
storage-worker 2.948 byte. Seed byte count không gồm MCP envelope; Discover
trong cost table có envelope.

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
- Phần B: `npm run verify` với Node `v24.18.0`, `TMPDIR` qua symlink đạt
  **253/253**, fail 0, skip 0; trước là 251/251. Thêm 2 test measurement,
  release evidence đạt 209/209 requirements trên 66 test files. Mọi gate đạt.
  Đã kiểm tra CLI `--output`, expected source, output projection và Published
  ref khác Local Draft; configuration/ref/content của operator fixture giữ nguyên.
- Đã đọc toàn bộ source/test/contract diff so với `origin/main`: không thấy
  token thật, hostname nội bộ, URL Hub thật, email riêng tư, đường dẫn tuyệt
  đối trên máy hoặc tên dự án/khách hàng/người. Chỉ thêm dữ liệu fixture tổng
  quát; email trong fixture là email tác giả commit.
- Đã đọc toàn bộ diff B gồm 3 contract và 4 script/test mới: không thấy token,
  hostname nội bộ, URL Hub thật, email riêng tư, absolute machine path hoặc tên
  dự án/khách hàng/người. GitHub/AWS URLs và tên thêm vào đều là fixture tổng quát.
  Gitleaks đạt, bổ sung cho rà tên/URL/path thủ công.
- Chỉ push `origin main` tới đúng repository public này sau gate, không
  force-push. Báo cáo riêng: `Update handoff report for round 11 (A)`.
  Checkpoint B: `Update handoff report for round 11 (B)`.

## Chưa làm / chưa kiểm chứng được

- Dừng ở ranh giới B theo quy tắc giới hạn ngữ cảnh của prompt; A và B đã qua
  gate và push theo từng phần, không để lại source làm dở. C–E chưa làm.
- Cần tiếp tục từ C: matcher tên và tích hợp batch/scan/skills, sau đó đo lại
  B; D giảm schema/skill/docs và luật nội dung; E installer registry/Windows CI.
- B5 public corpus tùy chọn chưa chạy; chưa có số đo trên repo thật.
- Không chạy macOS, Windows hoặc Hub GHE thật. Fixture local không chứng minh
  semantic usefulness hoặc đầy đủ coverage của repository thật.

## Câu hỏi và phản biện

Không có câu hỏi chặn A. Chọn truyền references của changed set qua adapter
thay vì trả toàn bộ target catalog: sửa đúng trường hợp agent validate trước
khi lưu bytes, đồng thời tránh phình response validation theo kích thước Hub.

Trong B chọn một fixture authoring cố định, nhỏ và tách khỏi corpus retrieval:
cho phép reviewer đo cùng protocol flow mà không cần model quyết định concept
cho repo thật. Source-name matcher chưa có nên baseline link recall bằng 0,
precision không xác định; không suy diễn rằng các relationship thật bị sai.
