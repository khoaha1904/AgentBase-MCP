# Vòng 2 — 2026-10-02

## Prompt đã nhận

Vòng 2 yêu cầu port tay các bản sửa 0001–0009, giữ nguyên tiêu đề commit;
0003–0004 đã được chấp nhận và chỉ cần xác nhận. Mỗi hạng mục có commit riêng,
báo cáo tiếng Việt nằm ngoài tài liệu sản phẩm và phải được push cùng phần đã
qua gate, kể cả khi còn mục bị chặn. Không dùng `git am` hoặc `git apply`.

Nội dung Vòng 2 nhận được dừng sau câu “0001 ... thêm vào .gitignore các”.
Ba đường dẫn của 0001 đã có đầy đủ trong prompt trước. Phần còn lại của Vòng 2,
đặc biệt tiêu đề chính xác và diff của 0002, 0005–0009, chưa được nhận.
Đây là báo cáo đầu tiên; chưa có báo cáo vòng trước trong working tree.

## Kết quả theo từng mục

| Mục | Trạng thái | Commit và kết quả |
| --- | --- | --- |
| 0001 | Làm xong | `d89b5f6` — thêm `.npmrc`, `*.tsbuildinfo`, `.claude/settings.local.json` vào `.gitignore`; giữ đúng tiêu đề được cung cấp. |
| 0002 | Chưa port | Ý định cài từ clone sạch đã có trong prompt trước, nhưng chưa có tiêu đề gốc và diff bổ sung của Vòng 2. Chưa thêm `.nvmrc` hoặc hướng dẫn theo version manager. |
| 0003 | Đã được bao phủ | `f3738f4` — CLI và checkout installer so entrypoint bằng `fs.realpathSync`; test gọi CLI và `install.sh` qua symlink. Không commit lại. |
| 0004 | Đã được bao phủ | `9c846a0` — canonicalize root tạm của qualification, release, lifecycle, source snapshot và visualization. Không commit lại. |
| 0005–0007 | Chưa port | Chưa nhận tiêu đề, diff hoặc ý định; không suy đoán nội dung. |
| 0008 | Chưa port | Prompt trước mô tả lỗi thiếu scope `workflow`, nhưng chưa có tiêu đề gốc và nội dung Vòng 2. |
| 0009 | Chưa port | Prompt trước mô tả bootstrap không ghi CI bundle, nhưng chưa có tiêu đề gốc và nội dung Vòng 2. Bootstrap hiện chưa được thay đổi trong vòng này. |

`2db7ab1` bổ sung ngoại lệ ngôn ngữ chỉ cho `handoff/`, sau khi checker thực sự
báo `CONTRACT-NON-ENGLISH` tại file này. `AGENTS.md` và `docs/README.md` ghi đúng
ranh giới trao đổi vận hành. Test hiện có thêm trường hợp cho phép báo cáo và
vẫn từ chối tiếng Việt tại `handoff-copy/`, `docs/handoff/` và source. Không thêm
ngoại lệ Knip, release-evidence hoặc Gitleaks; các gate đó giữ nguyên.

Các hạng mục của prompt trước đã hoàn tất ở local, nay được đưa lên cùng báo cáo
theo quy tắc push phần đã qua gate khi bị chặn:

| Hạng mục trước | Trạng thái | Commit và kết quả |
| --- | --- | --- |
| Gỡ source diagram-design | Làm xong | `589eb8a` — gỡ snapshot, importer và `verify:upstreams`; giữ template đã chỉnh và toàn văn MIT trong NOTICE. Checker kiểm tra trực tiếp asset được ship. |
| Hai lỗi census | Làm xong | `aae7d84` — loại cache kể cả khi đã commit; nhận diện Spring/JAX-RS và ưu tiên tên/path controller Java/Kotlin; thêm requirement `AB-DISC-009` và 3 test. |
| Điều tra nền tảng | Làm xong trên Linux | `eeb9d57` — ghi cách gọi installer trực tiếp bằng Node và giới hạn Windows/macOS Intel; không đổi engines hoặc format release. |

## Kiểm chứng

Node của gate: `v24.18.0`. Gate đầy đủ cuối vòng đã qua sau khi track báo cáo,
với thư mục tạm đi qua symlink và dữ liệu AgentBase dùng xong bỏ, không cấu hình
Hub thật. Các biến dưới đây trỏ tới fixture tạm; không công bố đường dẫn máy:

```text
TMPDIR="$SYMLINK_TMP" AGENTBASE_HOME="$DISPOSABLE_STATE" npm run verify
Contract checks passed.
Retired code graph check passed: no provider paths, imports, dependencies or build caches.
Release evidence check passed: 196/196 active requirements across 57 test files.
upstream foundations: verified with narrow diagram activation
no dependency violations found (185 modules, 865 dependencies cruised)
no leaks found
tests 202
pass 202
fail 0
skipped 0
```

Trước vòng này: 202/202 qua. Sau vòng này: 202/202 qua, không bỏ qua test.
Số test đã tăng từ 199 lên 202 do ba test census được thêm trong `aae7d84`.
0001 chỉ đổi ignore. Test ngôn ngữ hiện có được mở rộng, không thêm hoặc xóa
test case; test checker chạy riêng đạt 7/7. Không nới lỏng gate ngoài ngoại lệ
ngôn ngữ đã được chủ repo yêu cầu cho `handoff/`.

```text
git check-ignore --no-index .npmrc fixture.tsbuildinfo .claude/settings.local.json
.npmrc
fixture.tsbuildinfo
.claude/settings.local.json
```

```text
grep -rn "pathToFileURL(path.resolve(process.argv\[1\]))" src scripts
(không có output; exit 1 của grep nghĩa là không tìm thấy)
```

Probe Node 22 LTS mới nhất đã chạy ở hạng mục trước, bằng runtime tạm kiểm tra
checksum từ nguồn chính thức, cùng fixture symlink:

```text
Node v22.23.3
npm test
tests 202
pass 199
fail 3
skipped 0
```

Ba test hỏng ở installer/product-skills và hai test release CI đều gặp guard
Node 24. Kết quả này không đủ để mở rộng engines. Gọi installer trực tiếp bằng
Node 24 trong checkout fixture, dùng npm double, đã trả exit 0; chưa thử cài thật
trên Windows. Không kết nối, sync hoặc publish tới Hub thật.

## Chưa làm / chưa kiểm chứng được

- Chưa port 0002, 0005–0009; chưa thể tuyên bố đủ chín bản sửa hoặc test sau khi
  port đủ chín bản sửa.
- Chưa chạy trên macOS hoặc Windows. Symlink trên Linux tái hiện lỗi root tạm;
  nó không thay thế kiểm chứng trên các nền tảng đó.
- Không có dự án thật phía reviewer; các test census dùng fixture tổng quát.

## Câu hỏi và phản biện cho reviewer

- Cần phần text còn lại của Vòng 2, từ sau mục 0001, gồm tiêu đề gốc và ý định/diff
  của 0002, 0005–0009. Không cần chuyển file patch hoặc cung cấp dự án thật.
- Không tạo thêm commit cho 0003–0004 vì prompt đã xác nhận chúng được bao phủ.
- Checker của diagram hiện kiểm tra template được ship, thay cho snapshot đã gỡ;
  nó vẫn yêu cầu inline SVG, không có tài nguyên mạng và có upstream NOTICE.
- Báo cáo này là trao đổi vận hành, không phải Product/Architecture/Capability
  Contract; không đưa bản sao quyết định sản phẩm vào `docs/`.
