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

Làm xong; commit `9c6089d`. Gate từ **254/254 → 256/256**, Node `v24.18.0`,
TMPDIR qua symlink; fail/skip 0. Skill validator đạt cho ba skill đã sửa.

- Dùng chung census selector, giữ giới hạn và các loại trừ cache/secret/minified.
  Trích quy ước Terraform/Terragrunt, Maven/Gradle, npm scope, Spring properties,
  class RequestMapping, ARN/URL và module git. Resolver scalar tối đa hai bước;
  không coi nested attribute/tag name hay prefix của biểu thức là identity.
- Chuẩn hoá môi trường/case/separator; mỗi link có evidence hai đầu và cơ chế.
  Duplicate definition/interpolation chưa giải thành Question; tên ngoài workspace
  và module version drift được báo riêng. Literal tầng 2 tắt mặc định vì không
  có vai trò định nghĩa/sử dụng đủ tin cậy; opt-in chỉ tạo Question.
- Batch Prepare dùng exact authorized snapshots. Workspace scan có opt-in
  `match_names`; default vẫn metadata-only. So sánh graph Published để chỉ gợi ý
  link mới. Không thêm tool; không tự sửa Hub hoặc concept repo khác.
- Response top 50, counts/omitted/truncated; full report content-addressed private
  0600. Cập nhật skill ingest, batch-ingest và refresh, giữ các confirmation guard.

### Số đo C

| Dataset | Baseline recall | Sau C recall | Sau C precision |
| --- | ---: | ---: | ---: |
| F1, 5 repo | 0/8 | 8/8 | 8/8 |
| F2, 2 repo | 0/2 | 2/2 | 2/2 |
| Corpus public, 16 root | 0/6 | 3/6 | 3/3 |

Không có link thừa. F2 retrieval không đổi: API rank 4, queue A rank 3, table X
rank 1; hit@1 tổng 0,5, hit@5 = 1. Public Hub fixture rỗng nên không đánh giá
retrieval. Ba link public thiếu: config URI Petclinic; servlet/class/method REST
composition Piggy; Cloud Stream destination chỉ có phía dùng, không có static
resource definition. Giữ limitation, không thêm pattern nội bộ.

listTools **39.175 → 39.194 byte**, vẫn 36 tool. F1/F2/public dùng cùng cost fixture:
Preflight 1.117, Discover 1.983, Schemas 3.256, Prepare 3.039, Validate 627,
Finalize 1.159, Inspect 9.775 byte; chênh với lần gate do độ dài path temp.
F1 Java consumer Seed 1.747 → 2.128 byte (properties đủ điều kiện census);
public Seed 2.770–12.478 byte, tất cả ready và có limitation. Public matcher
trả 1 Question, 95 tên chưa có definition (50 trả về, 45 omitted).
Token chỉ ước lượng bytes/4; không in source hoặc absolute path trong output đo.

### Corpus public và commit cố định

Script fetch nằm ngoài runtime/release/verify, shallow/sparse vào thư mục tạm.
Không commit source ngoài. Đã đọc source rồi lập spec độc lập, không dùng output
matcher làm đáp án. Chỉ thay tên queue/topic và URL/ARN của hai AWS consumer
trong bản copy tạm để tạo dây chéo repo; Java/Spring không sửa bytes.

| Public source | SHA |
| --- | --- |
| gruntwork-io/terragrunt-infrastructure-catalog-example | `07b676c33100702b525488552cef6f30c0139699` |
| gruntwork-io/terragrunt-infrastructure-live-stacks-example | `5da4c11ec479b3badc3abf984113f2820b69f31c` |
| aws-samples/serverless-patterns | `a6cb0af285a2c326cbc35acd3ee5dc0c659db75d` |
| spring-petclinic/spring-petclinic-microservices | `1d76b00d683e86b62867a6bf59530f8ab301244f` |
| spring-petclinic/spring-petclinic-microservices-config | `323993ce2519c6d02df63e08bf4458d123d3b611` |
| sqshq/piggymetrics | `6bb2cf9ddbca980b664d3edbb6ff775d75369278` |
| spring-projects/spring-integration-samples | `dd188a81c3897a6a65c4d850676ad6302fb09118` |
| spring-cloud/spring-cloud-stream-samples | `2ff1168833cfcab14d2251219dad15a8919c1672` |

Đã rà diff code/test/contract/skills/script và report so với origin/main: không
thấy token, host/URL Hub nội bộ, email riêng tư, path máy thật hoặc tên riêng.
Tên/SHA public trong bảng do chủ repo yêu cầu. Gitleaks và diff check đạt.

## Phần D1/D2 — Luật nội dung và tool schema

D1 làm xong; D2 giảm bytes nhưng **chưa đạt mục tiêu ~18 KB**. Commit `26fb48a`.
Gate **256/256 → 257/257**, Node 24/TMPDIR symlink; test focused 5/5 và skill
validator đạt. Validator artifact được regenerate từ source, không sửa guard.

- Repository/Resource có contentGuidance trong schema response và comment ngắn
  trong skeleton: role, runtime/entrypoint, triggers/interfaces, linked IO/store,
  điều kiện đổi luồng dữ liệu, lỗi/retry/DLQ và operations. Gợi ý khoảng 60 body
  lines; chi tiết qua sources/concept con, không nhân bản. Skills ingest/Refresh
  cùng quy tắc; F2 đã viết gọn và nêu điều kiện actual không rỗng.
- Rút mô tả tool, bỏ prose description khỏi wire input schema; giữ bản nguồn
  và guidance trong schema response/skills. Local $defs/$ref chia sẻ subschema
  giống nhau trong cùng tool. Test khai triển mọi schema chứng minh constraint
  giữ nguyên; official MCP client calls qua, vẫn đủ 36 tool/tham số/annotations.

| Bộ đo trên cùng fixture | Trước D | Sau D |
| --- | ---: | ---: |
| listTools bytes | 39.194 | 31.061 |
| Schemas bytes | 3.256 | 3.634 |
| Inspect cost fixture bytes | 9.775 | 10.005 |

Preflight/Discover/Prepare/Validate/Finalize không đổi: 1.117/1.983/3.039/627/1.159
byte ngoài gate; guidance thêm 230 byte vào skeleton nên Inspect tạo file tăng.
F1 8/8 precision 1, F2 2/2 precision 1, public 3/6 precision 1; Seed và retrieval
không đổi. Mọi token estimate vẫn bytes/4. Rà diff và report: không lọt token,
host/URL nội bộ, email riêng tư, absolute path máy hay tên riêng; gitleaks đạt.

## Phần E — Windows và npm registry

Commit `304bda0`. Registry và command portability làm xong; Windows native qualification chưa xong,
đợi CI và xử lý permission portability. Gate **257/257 → 258/258**, Node 24 với
TMPDIR symlink; focused 14/14. Installer non-interactive thực chạy npm public
trong bản copy/home tạm: thành công; không đăng ký client hay chạm Hub thật.
Smoke MCP stdio thực trên Linux: đủ 36 tool.

- Dùng npm registry đã cấu hình từ env hoặc npm config; giữ HTTPS và
  replace-registry-host=always. Strict opt-in AGENTBASE_REQUIRE_PRIVATE_REGISTRY=1
  tái dùng public deny-list; output chỉ hostname, bỏ npm stderr để tránh leak.
- Windows tìm exe/cmd, chạy standard npm JS shim qua Node, không shell/evaluate
  cmd text. Giữ nguyên argument bytes, kể cả &, path có dấu cách và CRLF shim;
  shim không hỗ trợ thì fail. Client identity kiểm cả shim và JS target.
  Home fallback USERPROFILE; skill copy/rollback và registration guard giữ nguyên.
- Helper được đưa vào release control allowlist, đóng dependency closure; gate
  đã bắt lỗi thiếu helper trước khi sửa. Không mở rộng release target IDs.
- Thêm matrix windows-latest/macos-latest: installer public, npm test, real MCP
  stdio listTools trên home fixture. Job Linux giữ nguyên bytes.
- Audit: path dùng Node path/realpath; symlink/conflict checks giữ nguyên. CRLF
  picker đã xử lý và shim test phủ CRLF. Atomic rename còn fail-closed khi bị
  khoá, không xoá đích để cưỡng ép; retry cần đóng app giữ file rồi chạy lại.
  Long path chưa kiểm trên Windows, dùng checkout ngắn. install.sh là wrapper
  POSIX tùy chọn; Node entrypoint không cần Bash. POSIX 0700/0600 guards trong
  state/credentials/recovery và Bash release launcher cần tương đương ACL native
  trước khi tuyên bố Windows chạy được; không bypass guard để pass CI.

Số đo E không đổi so D: F1 8/8 precision 1, F2 2/2 precision 1, public 3/6
precision 1. listTools 31.061 byte; responses 1.117/1.983/3.634/3.039/627/1.159/
10.005 byte theo thứ tự bộ đo. Seed/retrieval không đổi; token là bytes/4.
Đã rà toàn bộ diff/report, không có thông tin riêng; gitleaks/diff check đạt.
Fixture URL credential là giả dưới example.invalid, không lấy config máy thật.

## Phần D3 — Rút gọn skill và docs

Làm xong; commit `167f134`. Sửa shim npm Windows theo log CI trong commit
`b03a8a4`. Gate **258/258 → 258/258**, Node `v24.18.0`, TMPDIR qua symlink;
fail/skip 0. Không sửa test/guard để rút gọn docs, không chạm `presentation/`.

| Phạm vi, đếm từ theo whitespace | Trước D3 | Sau D3 |
| --- | ---: | ---: |
| 12 entrypoint SKILL.md | 7.483 | 4.229 |
| Toàn bộ 19 Markdown trong skills | 10.012 | 6.168 |
| Toàn bộ 144 Markdown trong docs | 98.590 | 91.499 |

- Rút gọn Ingest, Refresh, OKF, Query và Hub; gộp prose trùng trong hai reference
  OKF. Giữ exact source/home confirmations, explicit-only entry, protected bytes,
  attribution, body links, Seed/Receipt, một input correction và một content
  repair, resume/restart, authority failure và separate Publish/provider approval.
  Các skill nhỏ còn lại được giữ vì đã ngắn, có trách nhiệm riêng.
- Các baseline/impact cũ giờ nêu boundary hiện tại và link requirement owner.
  Gộp design Query/batch vào summary + normative links; bỏ speculative critic
  design nhưng giữ toàn bộ inactive AB-QUALITY IDs và owner-reopening boundary.
  Sửa mô tả cũ về Accept/stacked publication, freshness, số skill 13/3 thành
  12/2 và hướng dẫn traversal qua tool không tồn tại. Không bỏ unique normative
  requirements để chạy theo số từ; AGENTS/README giữ nguyên trong D3.
- 12/12 skill validator qua; product skill guard 3/3 qua. Đã rà confirmation/stop
  rules so với bản trước, toàn bộ link đích và link vào heading đã đổi đều tồn tại.
  Lần gate đầu bắt line wrapping của freshness và blank EOF; đã sửa nội dung,
  không sửa guard; gate cuối đạt hoàn toàn.

Bộ đo chạy lại sau D3: F1 **8/8**, F2 **2/2**, public **3/6**, precision 1 ở cả
ba dataset, không có link thừa. So với trước D3 không đổi. F2 API/queue A/table X
vẫn rank 4/3/1, hit@1 tổng 0,5 và hit@5 = 1. listTools vẫn **31.061 byte**, 36
tool; responses Preflight/Discover/Schemas/Prepare/Validate/Finalize/Inspect vẫn
**1.117 / 1.983 / 3.634 / 3.039 / 627 / 1.159 / 10.005 byte**. Seed và retrieval
không đổi; tokens chỉ ước lượng bytes/4. Corpus giữ SHAs/spec của C.

Đã rà diff sắp push so origin/main: không thấy token thật, host/URL Hub nội bộ,
email riêng tư, đường dẫn máy thật hoặc tên dự án/khách hàng/người. Gitleaks và
whitespace check đạt. Chỉ push đúng origin main, không force-push.

### CI phần E và sửa tiếp

CI trên commit báo cáo E: Linux verify **qua**; macOS Node 24.20.0 installer,
258 tests và real stdio smoke **qua**. Windows dừng ngay installer vì npm chính
thức dùng SET NPM_CLI_JS với %~dp0, khác shim fixture ban đầu; chưa chạy tests.
Đã sửa parser để chọn duy nhất adjacent npm-cli.js, kiểm file thật, giữ argument
bytes và không evaluate cmd/prefix script. Test phủ cả shim npm global và bundled,
CRLF và npm-prefix.js không bị chọn nhầm. Sau push cần CI xác nhận Windows;
không coi sửa parser local là đã qualified toàn nền tảng.

## Kiểm chứng và rà diff

- Node `v24.18.0`, `TMPDIR` qua symlink. Test tập trung 6/6.
- `npm run verify`: đầu vòng **253/253**, checkpoint cuối **258/258**, fail/skip 0.
  Contract, retired graph, release evidence (209/209 trên 69 test files),
  upstream, Hub validator, typecheck, depcruise, knip, gitleaks và diff check
  đều đạt. Skill validator đạt.
- Đã đọc toàn bộ diff code/test/contract/skill và báo cáo so với `origin/main`:
  không thấy token thật, hostname nội bộ, URL Hub thật, email riêng tư, đường
  dẫn tuyệt đối trên máy hoặc tên dự án/khách hàng/người. File paths trong
  response là dữ liệu runtime private, không có path máy thật được hardcode.
- Chỉ push `origin main` tới đúng repository public đã được chủ repo cho phép;
  báo cáo riêng theo từng checkpoint; mới nhất `Update handoff report for round 12 (D3)`. Không force-push.

## Chưa làm / chưa kiểm chứng được

D3 đã hoàn tất. D2 còn mục tiêu ~18 KB: hiện 31.061 byte; giữ đủ 36 tool và
mọi constraint. Windows native private ACL/long paths/release lifecycle chưa
qualified; CI Windows đang cần chạy lại bản sửa npm shim. macOS source CI đã qua.
Không coi Node invocation hoặc Linux test là bằng chứng Windows đầy đủ.

## Câu hỏi và phản biện

Chọn projection sau verification để giảm bytes mà giữ nguyên state và guard
publication. Diff dùng alignment tất định có bound, không thêm dependency.
Restart dùng pointer tới session mới thay vì xóa/ghi đè bundle cũ; hành động
này không Publish hoặc thay đổi Hub. Không có câu hỏi chặn mục 2.

C chọn matcher gợi ý có bound, không HCL evaluator hoặc suy identity từ tên.
Module git so theo repo/module/ref; Maven artifact khác tên repo vẫn dùng tọa độ.
Không ghép config bên ngoài, deploy order, external CI hoặc dynamic SSM path.

D2: tổng schema raw bỏ description vẫn 21.532 byte, chưa tính protocol dialect,
tool names và safety annotations. Chọn tự chứa mỗi tool và giữ tất cả guard;
chưa đạt 18 KB, không xoá tham số hoặc constraint để chạy theo số đo.

D3 chọn rút prose trùng và lịch sử đã nằm trong Git; giữ contract có nghĩa riêng
và các điểm dừng workflow thay vì đặt một quota buộc xoá requirement.
