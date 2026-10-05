# Vòng 5 — 2026-10-05

## Prompt đã nhận

Đã nhận đầy đủ prompt Vòng 5, kết thúc bằng `HẾT VÒNG 5`. Đã đọc
`handoff/README.md` và báo cáo Vòng 4. Vòng này yêu cầu thu hẹp quy ước census
về các pattern phổ biến, không crash khi Seed có hơn 64 group, chỉ giữ tách
runtime Terraform theo resource, bỏ nhiễu `handler|main|bootstrap` trong code,
loại file minified/bundle/chunk, chạy gate Node 24.x với `TMPDIR` qua symlink,
ghi báo cáo và push. Không chạm Hub thật.

## Kết quả theo từng mục

| Mục | Trạng thái | Commit và kết quả |
| --- | --- | --- |
| 0. Nguyên tắc census | Làm xong | `c70e6c8` — ghi nguyên tắc chỉ phủ quy ước phổ biến, ưu tiên bỏ/thu hẹp pattern gây nhiễu vào `handoff/README.md`, Product Contract và capability discovery. |
| 1. Giới hạn 64 group | Làm xong | `6605589` — gom runtime theo file; Terraform `.tf/.hcl` giữ group theo resource block; `buildSeed` cắt trước `validateDiscoverySeed`, giữ đại diện từng lane và ưu tiên P0; ghi số group bị cắt vào `p1P2Overflow` và limitation. Thêm fixture hơn 64 runtime file và fixture web.xml nhiều tag. |
| 2. Pattern handler/main/bootstrap | Làm xong | `6605589` — marker key/value chỉ áp dụng trong yaml/yml/json/tf/hcl/toml/properties; code UI JavaScript không sinh runtime P0. Thêm test nút UI. |
| 3. File minified | Làm xong | `6605589` — loại `*.min.js`, `*.min.css`, `*.bundle.js`, `*.chunk.js` ngay từ census admission; thêm test. |
| 4. Kiểm chứng và báo cáo | Làm xong | `6605589` và commit báo cáo riêng sau đây; không kết nối, sync hoặc publish Hub thật. |

## Kiểm chứng

Node của gate: `v24.18.0`, thuộc dải Node 24.x của repository. Lệnh cuối dùng
`TMPDIR` trỏ qua symlink và xác nhận `TMPDIR symlink: true`.

```text
TMPDIR="$SYMLINK_TMP" npm run verify
Contract checks passed.
Retired code graph check passed.
Release evidence check passed: 204/204 active requirements across 63 test files.
no dependency violations found (191 modules, 892 dependencies cruised)
no leaks found
tests 243
pass 243
fail 0
cancelled 0
skipped 0
npm run verify: exit 0
```

Focused discovery behavior is covered by 30 tests in
`src/app/agentbase-mcp/discovery-session.test.ts`; all passed in the final
gate. The restricted local sandbox initially blocked fixture `git` subprocesses
with `EPERM`; the required gate was rerun in the approved verification context
and passed without changing guards or tests for the restriction.

## Chưa làm / chưa kiểm chứng được

- Không còn mục Vòng 5 bị chặn.
- Chưa chạy trên macOS; reviewer sẽ kiểm tra lại census trên dữ liệu thật.
- Không có dữ liệu repo thật phía reviewer; fixture tổng quát là bằng chứng của
  các giới hạn mới.
- `git push origin main` chưa thực hiện được: auto-review chặn remote SSH vì
  không xác minh được đây là đích riêng tư/được ủy quyền. Các commit vẫn giữ
  nguyên ở local để chủ repo xác nhận đích push.

## Câu hỏi và phản biện cho reviewer

- Không có câu hỏi chặn công việc.
- Runtime grouping hiện gộp mọi tín hiệu runtime trong một file; chỉ Terraform
  resource block là ngoại lệ vì mỗi resource là workload riêng. HCL block scope
  dùng heuristic ngoặc có giới hạn, được ghi rõ limitation.
- Khi vượt 64 group, Seed vẫn `ready` nếu identity hợp lệ; `p1P2Overflow` đếm
  toàn bộ group bị cắt, kể cả P0, và limitation nêu số P0 bị cắt. Đây là coverage
  debt để agent đọc source, không phải claim đã phủ đủ mọi P0.
