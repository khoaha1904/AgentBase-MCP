# Vòng 3 — 2026-10-02

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 3, kết thúc bằng `HẾT VÒNG 3`. Các mục: lưu quy tắc
Vòng 2; hoàn tất sáu bản sửa cài đặt/chẩn đoán Git/bootstrap/quyền; cải thiện
mẫu census, phân biệt test/docs với entrypoint sản phẩm và xóa thư mục vendor
còn sót; chạy toàn bộ gate với Node 24 và TMPDIR qua symlink; báo cáo rồi push.
Đã đối chiếu báo cáo Vòng 2 trước khi làm. Không làm lại các mục đã được chấp nhận.

## Kết quả theo từng mục

### 0. Lưu quy tắc — làm xong

`bd9af74` — lưu vai trò, giới hạn thông tin, kênh báo cáo, mẫu REPORT, quy tắc
commit/push và xử lý prompt bị cắt trong `handoff/README.md`; AGENTS.md dẫn tới
file này. Không cần thêm ngoại lệ cho handoff: ngoại lệ tiếng Việt đã có ở Vòng 2.

### 1. Các bản sửa còn lại — làm xong

| Tiêu đề commit được yêu cầu | Commit | Thay đổi và kiểm chứng |
| --- | --- | --- |
| Make install.sh runnable on a fresh clone and document prerequisites | `edf795c` | Thêm `.nvmrc` = `24.20.0`; lỗi Node đưa lệnh fnm/Volta/asdf/nvm theo manager đang có, hoặc link tải chính thức. README nêu Node, registry và Gitleaks. Sáu unit test xác nhận hướng dẫn và dừng trước setup. |
| Stop reporting every Git failure as an insufficient Hub token | `b7da5ca` | Tách 401 bị từ chối, 403 thiếu quyền và Git remote/branch/network. Ba unit test giữ chi tiết đã che credential, không đổi cấu hình khi thất bại. |
| Point an empty Hub remote at bootstrap instead of a Git error | `d0da0e9` | Sau lỗi Git khi attach, probe ls-remote --heads best-effort: remote rỗng hướng dẫn bootstrap; thiếu branch báo đúng branch; probe lỗi hoặc target còn tồn tại giữ lỗi gốc. Bốn unit test; HTTP 401/403 không kích hoạt probe. |
| Carry the redacted Git stderr on a failed Git operation | `50dd84c` | Giữ prefix operation/exit status và tối đa 600 ký tự cuối stderr; che credential trước khi gộp whitespace/cắt. Bốn unit test gồm credential bị chia qua nhiều chunk, biên cắt, stderr rỗng và cleanup askpass. |
| Stop writing the Hub CI bundle on empty-remote bootstrap | `8a675a7` | Baseline đúng bốn file: README, root index, shared index và Profile. renderHubReadme(false) không mô tả CI chưa có; mặc định vẫn hỗ trợ luồng CI hiện có. Cập nhật AB-HUB-SETUP-006, AB-HOME-001, AB-HUB-CI-005 và docs product/version-scope/workflow. E2e kiểm tra cây remote dùng xong bỏ không có workflow/validator và giữ recovery sau gián đoạn; hai unit test README. |
| Name the workflow scope the Hub bootstrap push requires | `0c30267` | Nhận diện push bị từ chối vì thiếu workflow, giữ checkpoint, không lộ credential. README có bảng repo luôn cần cho Hub riêng tư; workflow cho initialize/upgrade ghi CI; bootstrap bốn file không cần scope này. |

Hai commit bổ sung trong quá trình kiểm chứng: `79ddd84` khai báo rõ kiểu của
process double sau khi TypeScript báo lỗi; `44476dd` nhận diện cả scope không có
dấu nháy, có backtick hoặc nháy đơn trong thông báo GitHub. Ba unit test scope
xác nhận thông báo, redaction và retry dùng lại đúng baseline/checkpoint.
Không đổi guard Node, timeout, giới hạn output hay kiểm tra trạng thái Hub.

0003 và 0004 đã được bao phủ ở các commit trước `f3738f4` và `9c846a0`;
không commit lại. Grep entrypoint chưa resolve vẫn rỗng và toàn bộ test chạy
qua root tạm symlink trong gate cuối.

### 2. Phát hiện mới — làm xong

| Mục | Commit | Thay đổi và kiểm chứng |
| --- | --- | --- |
| Một file chiếm nhiều slot | `d486a6b` | Mỗi group lấy một location/file trước, rồi vòng hai, vòng ba; tối đa tám location, thứ tự deterministic. Giữ full count và limitation. Hai fixture: controller nhiều annotation và Markdown nhiều integration signal. |
| Test/docs thành runtime/interface P0; thiếu main class | `20b03e8` | Test path/tên test và Markdown/docs không sinh P0 ở hai lane đó, kể cả template. Vẫn giữ context identity/integration/operations. Nhận diện SpringBootApplication và Java public static void main; ưu tiên Application/Main filename trong ngân sách hiện có. Hai fixture: loại test/docs và Maven có trên 256 file vẫn giữ Java/Kotlin entrypoint. |
| Thư mục vendor và hướng dẫn importer đã chết | `0f74c12` | Xóa vendor/README.md và thư mục; sửa README/AGENTS/docs bỏ mô tả source nhúng. Checker foundation từ chặn một snapshot chuyển sang chặn toàn bộ root vendor. Bỏ ngoại lệ ngôn ngữ vendor; test cũ nay xác nhận không được miễn. Fixture mới chứng minh asset của skill hợp lệ, root vendor quay lại bị chặn và NOTICE thiếu bị chặn. |

Thêm các requirement AB-DISC-010..011 cho hai hành vi census mới. Giới hạn
256/1.024 file, 64 KiB/file, 4.096 entry và phần ngân sách dành cho source
thường giữ nguyên. Không thêm parser hoặc graph provider.

## Kiểm chứng

Node dùng cho gate: `v24.18.0`, thỏa `>=24.12 <25`. `.nvmrc` khuyến nghị
`24.20.0`; không tuyên bố gate đã chạy bằng phiên bản đó.

Trước các test có thể tạo/đọc trạng thái Hub, đã chạy CLI status của checkout
với AGENTBASE_HOME dùng xong bỏ. Mọi remote trong test là Git local fixture
hoặc Git/process double; không kết nối, sync hoặc publish tới Hub thật.
Các biến dưới đây chỉ thư mục fixture, không công bố đường dẫn máy.

```text
node --version
v24.18.0

AGENTBASE_HOME="$DISPOSABLE_STATE" node src/cli.ts status
kind: unconfigured
local.state: not-created
credential: not-required
sync.state: not-applicable

TMPDIR="$SYMLINK_TMP" node -e 'console.log(require("node:fs").lstatSync(process.env.TMPDIR).isSymbolicLink())'
true

TMPDIR="$SYMLINK_TMP" AGENTBASE_HOME="$DISPOSABLE_STATE" npm run verify
Contract checks passed.
Retired code graph check passed: no provider paths, imports, dependencies or build caches.
Release evidence check passed: 198/198 active requirements across 63 test files.
upstream foundations: verified with narrow diagram activation
check:hub-validator: exit 0
typecheck: exit 0
no dependency violations found (191 modules, 892 dependencies cruised)
knip: exit 0
no leaks found
tests 229
pass 229
fail 0
cancelled 0
skipped 0
git diff --check: exit 0
npm run verify: exit 0
```

Trước vòng: 202/202 qua. Sau vòng: 229/229 qua. Thêm 27 case: cài đặt 6;
attach 7; Git stderr 4; scope workflow 3; README bootstrap/CI 2; census 4;
checker foundation 1. Không xóa test. Ba test cũ được sửa/mở rộng: e2e bootstrap
kiểm tra baseline mới và recovery; census vẫn kiểm giới hạn/oversize nhưng nay
runtime được phát hiện, lane integration giữ tình huống chưa phát hiện; checker
ngôn ngữ từ cho phép vendor chuyển sang từ chối. Không bỏ kiểm tra hành vi khác.

Các lần chạy tập trung cuối cho từng phần: attach 7/7; Git stderr + scope 7/7;
README + e2e 3/3; census 18/18; contract language + foundation 8/8.
Gate đầu dừng ở lỗi kiểu process double; `79ddd84` sửa test double, và gate đầy
đủ cuối đạt exit 0. Không nới lỏng checker để qua.

```text
grep -rn "pathToFileURL(path.resolve(process.argv\[1\]))" src scripts
(không có output; exit 1 là không tìm thấy)

git ls-files vendor
(không có output)

node -e 'console.log("vendor exists:", require("node:fs").existsSync("vendor"))'
vendor exists: false
```

## Chưa làm / chưa kiểm chứng được

- Không còn mục Vòng 3 bị chặn hoặc chưa triển khai.
- Chưa chạy trên macOS/Windows; Linux với TMPDIR symlink là bài tái hiện được
  yêu cầu, không phải chứng nhận thêm nền tảng release.
- Không có dự án thật của reviewer; các tình huống mới dùng fixture tổng quát.
- Không kiểm scope bằng token thật hoặc Hub thật. Test giả lập đúng thông báo
  từ chối và kiểm giữ checkpoint; e2e baseline dùng bare Git local.

## Câu hỏi và phản biện cho reviewer

- Không có câu hỏi còn chặn công việc; prompt đủ và đã thấy dòng kết thúc.
- Hiểu “mọi chỗ nhắc tới vendor” là bỏ hướng dẫn và lời hứa còn ship source
  nhúng. Giữ tên đường dẫn trong kiểm tra âm tính chống hồi quy (retired graph,
  release archive, foundation và language fixture), cùng bộ lọc dependency
  vendor trong source repo được phân tích. Xóa chúng sẽ làm yếu các bảo vệ đang
  cần giữ. Thuật ngữ vendor của SBOM/schema không phải thư mục source nhúng.
- Rule ngôn ngữ được siết bằng cách bỏ miễn trừ vendor; foundation cũng siết
  từ một snapshot sang cả root đã gỡ. Ngoại lệ handoff giữ đúng phạm vi Vòng 2;
  không thêm miễn trừ Knip, release-evidence hoặc Gitleaks.
- Spring/main vẫn là heuristic theo dòng. Filename tùy ý và declaration bị chia
  nhiều dòng chưa được resolve; census giữ limitation, không hứa phân tích AST
  hoặc call graph. Hai location Spring/main trong cùng file vẫn có provenance
  riêng, phù hợp nguyên tắc entrypoint hiện có.
