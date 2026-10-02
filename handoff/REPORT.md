# Vòng 4 — 2026-10-02

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 4, kết thúc bằng `HẾT VÒNG 4`. Đã đọc quy tắc
`handoff/README.md` và đối chiếu báo cáo Vòng 3. Vòng này yêu cầu gộp launcher
Java cùng file; loại identity từ README test/fixture và ưu tiên README gốc;
ưu tiên code/config trong mẫu integration; nhận diện servlet/WAR và Dockerfile;
suy ra nvm từ executable khi thiếu NVM_DIR; chạy verify qua TMPDIR symlink rồi
báo cáo và push. Không làm lại Vòng 3 đã được reviewer xác nhận trên macOS.

## Kết quả theo từng mục

| Mục | Trạng thái | Commit và kết quả |
| --- | --- | --- |
| 1. Gộp entrypoint trùng file | Làm xong | `d9893f3` — Java/Kotlin launcher được nhóm theo file; SpringBootApplication và main giữ hai location trong một group, count vẫn là 2. File launcher khác vẫn có group riêng. Thêm AB-DISC-012 và một fixture kiểm location/count/determinism; sửa kỳ vọng của test ngân sách Java từ 4 xuống 3 group. |
| 2. README test/fixture không phải identity | Làm xong | `6eede5d` — tách nhận diện test/fixture/mock, gồm __files và mappings; chặn cả identity trực tiếp và semantic-confirmation fallback. README fixture không nhận ưu tiên README. README gốc được chọn trước trong ngân sách và đứng trước README module trong mẫu identity. Thêm AB-DISC-013 và ba fixture: thứ tự root/module, fixture-only không có identity, và ngân sách đầy vẫn giữ root README. |
| 3. Docs sau code/config trong integration | Làm xong | `159856b` — trong từng lượt lấy một location/file, code/config/manifest đứng trước Markdown. Giữ count, context docs nếu còn slot, limitation và thứ tự deterministic; Flow candidate dùng cùng cách chọn mẫu. Thêm AB-DISC-014 và fixture với pom.xml, Dockerfile, workflow, script, Java, JSON, Python, go.mod cùng tài liệu; sửa test cũ để tám file code không bị Markdown đẩy ra. |
| 4. Runtime servlet/WAR và Dockerfile | Làm xong | `a210b55` — admit/ưu tiên tên file kết thúc bằng web.xml; nhận diện tag servlet, filter, listener, servlet-mapping và Dockerfile ENTRYPOINT/CMD thành runtime P0. Bỏ tag trong comment XML, giữ đúng số dòng; test/docs không sinh runtime. Thêm AB-DISC-015, cập nhật Product Contract và ba fixture: location thật, loại comment/fixture/XML không liên quan, và WAR vượt 256 file vẫn giữ descriptor/launcher. |
| 5. nvm thiếu NVM_DIR | Làm xong | `d2f7f0e` — đường dẫn executable có /.nvm/versions/node/ đủ để gợi ý nvm; version manager được cấu hình rõ vẫn ưu tiên hơn. Mở rộng AB-INSTALL-044, thêm hai test cho suy luận nvm, precedence và path gần giống không khớp. Test cũ dùng executable giả lập rõ ràng để không phụ thuộc nvm của máy chạy. |
| 6. Kiểm chứng và báo cáo | Làm xong | Code ở `d2f7f0e` đã qua npm run verify đầy đủ. Báo cáo có commit riêng với tiêu đề Update handoff report for round 4; được push cùng năm commit hạng mục theo quy tắc handoff. |

Không thay dependency, tool MCP, schema Receipt, ngân sách file/read/entry,
quyền Hub hoặc release format. Không nới lỏng checker hoặc thêm miễn trừ gate.

## Kiểm chứng

Node của gate: `v24.18.0`, thỏa `>=24.12 <25`. Không tuyên bố đã chạy bằng
Node 24.20.0 của reviewer. Các biến trong lệnh sau trỏ tới fixture dùng xong bỏ;
không ghi đường dẫn máy vào repository.

Trước test có thể chạm trạng thái Hub, đã chạy status của CLI checkout với
AGENTBASE_HOME riêng và xác nhận chưa cấu hình. Gate dùng Git local/fake provider
theo fixture hiện có; không kết nối, sync hoặc publish tới Hub thật.

```text
node --version
v24.18.0

AGENTBASE_HOME="$DISPOSABLE_STATE" node src/cli.ts status
kind: unconfigured
local.state: not-created
credential: not-required
sync.state: not-applicable

TMPDIR="$SYMLINK_TMP" node -e 'console.log("TMPDIR symlink:",require("node:fs").lstatSync(process.env.TMPDIR).isSymbolicLink())'
TMPDIR symlink: true

TMPDIR="$SYMLINK_TMP" AGENTBASE_HOME="$DISPOSABLE_STATE" npm run verify
Contract checks passed.
Retired code graph check passed: no provider paths, imports, dependencies or build caches.
Release evidence check passed: 202/202 active requirements across 63 test files.
upstream foundations: verified with narrow diagram activation
check:hub-validator: exit 0
typecheck: exit 0
no dependency violations found (191 modules, 892 dependencies cruised)
knip: exit 0
no leaks found
tests 239
pass 239
fail 0
cancelled 0
skipped 0
git diff --check: exit 0
npm run verify: exit 0
```

Trước vòng: 229/229 qua. Sau vòng: 239/239 qua. Thêm 10 case: gộp launcher 1;
identity/README 3; integration 1; servlet/Dockerfile 3; nvm 2. Không xóa test.
Hai test census cũ được cập nhật kỳ vọng hành vi mới: số group Spring/main và
Markdown sau tám file code. Sáu case installer cũ được cấp executable fixture
để kiểm đúng manager/fallback trên mọi máy; kiểm tra dừng trước setup giữ nguyên.
Test nhiều runtime Terraform trong cùng file vẫn qua, không gộp mất workload.

```text
TMPDIR="$SYMLINK_TMP" node --test src/app/agentbase-mcp/discovery-session.test.ts
tests 26
pass 26
fail 0
skipped 0

TMPDIR="$SYMLINK_TMP" node --test scripts/installation/install.test.mjs
tests 8
pass 8
fail 0
skipped 0
```

Lần test installer đầu phát hiện case PATH cũ phụ thuộc executable thật dưới
nvm của máy. Đã cấp path giả lập cho case đó, không sửa logic mới để chiều môi
trường test. Chạy tập trung và gate đầy đủ cuối đều qua.

## Chưa làm / chưa kiểm chứng được

- Không còn mục Vòng 4 bị chặn hoặc chưa triển khai.
- Chưa chạy Vòng 4 trên macOS/Windows. Linux với TMPDIR symlink là kiểm chứng
  của vòng này; kết quả macOS Vòng 3 là thông tin do reviewer cung cấp.
- Không có dữ liệu repo thật phía reviewer; mọi tình huống mới dùng fixture
  tổng quát. Không thử token thật hoặc Hub thật.

## Câu hỏi và phản biện cho reviewer

- Không có câu hỏi chặn công việc; đã thấy dòng kết thúc prompt.
- Mục 1 gộp launcher Java/Kotlin theo file. Giữ riêng các runtime hạ tầng độc
  lập như hai Lambda trong cùng Terraform; gộp toàn bộ runtime theo file sẽ làm
  mất tính kiểm đếm workload đã được test bảo vệ.
- Mục 3 giữ quy tắc một file một slot trước của Vòng 3. Code/config đứng trước
  docs trong mỗi lượt; khi còn slot sau các file code, docs vẫn được lấy trước
  location thứ hai của cùng file code. Count/limitation không che việc cắt mẫu.
- Servlet/WAR vẫn là heuristic tên file và dòng: không resolve XML entity,
  không phân tích đầy đủ namespace/XML hoặc thực thi Docker command. Chỉ admit
  XML có tên kết thúc bằng web.xml; không mở toàn bộ XML để tránh chiếm ngân sách.
