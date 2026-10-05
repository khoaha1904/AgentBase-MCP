# Quy tắc làm việc với reviewer

Thư mục này lưu trao đổi vận hành giữa hai máy, không phải tài liệu sản phẩm.
Quy tắc dưới đây được lưu từ Vòng 2; mỗi prompt mới chỉ thay phần vòng hiện tại.

## Vai trò và kênh trao đổi

- Reviewer chạy trên máy khác, kiểm tra AgentBase trên macOS và dữ liệu thật,
  rồi viết prompt sửa lỗi, rút gọn hoặc thêm tính năng.
- Agent thực hiện prompt trong repository này. Chủ repo chuyển prompt bằng
  cách copy tay; chiều trả lời đi qua GitHub để reviewer pull về kiểm tra.
- Reviewer đọc `handoff/REPORT.md`. Mọi kết quả, câu hỏi hoặc phản biện cần
  chuyển cho reviewer phải có trong báo cáo; không phụ thuộc câu trả lời chat.
- Đối chiếu số vòng với báo cáo trước khi làm. Không lặp lại mục đã hoàn tất;
  chỉ thực hiện vòng hiện tại, kể cả mục chưa hoàn tất được yêu cầu tiếp tục.

## Giới hạn thông tin

- Agent không thấy dự án thật phía reviewer. Dựng fixture tổng quát tái hiện
  tình huống trong prompt, không hỏi tên dự án hoặc dữ liệu thật.
- Repository công khai. Không ghi thông tin riêng tư vào code, fixture,
  documentation, commit hoặc báo cáo: token thật, hostname nội bộ, URL Hub thật,
  tên dự án/khách hàng/người, email riêng tư hoặc đường dẫn tuyệt đối trên máy.
- Không cần chuyển file từ reviewer; ý định cần thiết được nêu bằng text trong
  prompt. Không dùng `git am` hoặc `git apply` cho diff bị đổi khoảng trắng do copy.
- Không kết nối, sync hoặc publish tới Hub thật. Kiểm tra `abs status` trước
  thao tác có thể đọc hoặc thay đổi Hub; dùng dữ liệu fixture dùng xong bỏ.
- Code, docs sản phẩm, tên test và commit message viết tiếng Anh. Báo cáo và
  quy tắc trao đổi trong `handoff/` viết tiếng Việt theo yêu cầu chủ repo.

## Nguyên tắc census từ Vòng 5

Census chỉ phủ các quy ước phổ biến ở đa số repository. Trường hợp đặc biệt
để agent đọc code và suy luận; census ghi limitation, không cố viết pattern
cho mọi repository. Ưu tiên bỏ hoặc thu hẹp pattern gây nhiễu. Chỉ thêm pattern
mới khi đó là quy ước chuẩn, được dùng rộng rãi.

## Báo cáo mỗi vòng

Ghi đè toàn bộ `handoff/REPORT.md`; lịch sử vòng trước nằm trong Git. Đặt ngoài
`docs/` để không trở thành Product/Architecture/Capability Contract. Nếu gate
chặn báo cáo, chỉnh tối thiểu chỉ cho `handoff/` và giải thích thay đổi trong báo
cáo; không bỏ qua kiểm tra bí mật hoặc nới lỏng kiểm tra hành vi.

```markdown
# Vòng <số> — <YYYY-MM-DD>
## Prompt đã nhận
<tóm tắt tiêu đề và các mục; xác nhận dòng kết thúc prompt>
## Kết quả theo từng mục
<làm xong / làm một phần / không làm; commit hash và lý do>
## Kiểm chứng
<lệnh, phiên bản Node, số test trước/sau; output rút gọn>
## Chưa làm / chưa kiểm chứng được
## Câu hỏi và phản biện cho reviewer
<chỗ mơ hồ, ý định sai hoặc cách đơn giản hơn; quyết định tạm chọn>
```

Nếu không thấy dòng kết thúc vòng được prompt chỉ định, ghi nguyên dòng cuối
cùng nhận được vào báo cáo. Không coi phần bị cắt là đã nhận đầy đủ.

Nếu có cách tốt hơn, có thể thực hiện rồi giải thích, hoặc dừng mục đó để hỏi;
không âm thầm đổi ý định. Báo cáo không chứa log thô làm lộ đường dẫn hoặc dữ
liệu riêng tư. Dùng biến mô tả fixture và chỉ giữ các dòng kiểm chứng cần thiết.

## Commit và push

- Mỗi hạng mục một commit, tiêu đề tiếng Anh; giữ nguyên tiêu đề khi prompt
  cung cấp tiêu đề chính xác.
- Commit báo cáo riêng: `Update handoff report for round <số>`.
- Chỉ push code đã qua toàn bộ gate; dùng Node 24.x và `TMPDIR` qua symlink
  khi prompt yêu cầu. Không sửa guard chỉ để test qua.
- Nếu bị chặn, push các commit đã qua gate cùng báo cáo ghi rõ phần bị chặn.
  Không giữ báo cáo ở local vì reviewer chỉ thấy GitHub.
- Không force-push lên `main`, không làm lại commit đã được chấp nhận.
