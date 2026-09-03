# Slide 08 — Knowledge không tự xuất hiện

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Trả lời câu hỏi còn thiếu sau slide MCP: knowledge ban đầu đến từ đâu? Đồng thời
giới thiệu Codebase Memory đúng với vai trò của nó trong AgentBase: biến source
code thành evidence có thể truy vấn và kiểm chứng.

## Thông điệp duy nhất

Knowledge không tự xuất hiện. Nó bắt đầu từ evidence có thể kiểm chứng trong
source code; Codebase Memory giúp AgentBase lấy được evidence đó.

## Nội dung hiển thị

```text
Source repositories → Codebase Memory → Source evidence
                         local graph       symbols
                                           call paths
                                           dependencies
```

Thông điệp chuyển tiếp đặt dưới flow:

```text
EVIDENCE ≠ SHARED KNOWLEDGE
Còn cần được liên kết, review và tích lũy.
```

Trong card Codebase Memory chỉ đặt một dòng nhỏ:

```text
LOCAL · REPO-SCOPED · PINNED
```

## Lời thoại dự kiến

“Đến đây flow nghe khá đơn giản: knowledge được lưu bằng OKF, còn agent truy cập
nó qua MCP. Nhưng vẫn còn một câu hỏi: knowledge ban đầu đến từ đâu?

Với bài toán của team mình, một trong những nguồn quan trọng nhất chính là source
code. Nhưng nếu lại yêu cầu agent đọc trực tiếp toàn bộ các repository, thì mình
quay trở lại đúng vấn đề ban đầu: quá nhiều code, quá nhiều liên kết và quá nhiều
context phải tự suy đoán.

Ở đây mình dùng Codebase Memory như một local code graph engine. Nó biến source
thành các symbol và những liên kết như caller, call path hay dependency. Từ đó,
AgentBase có thể hỏi đúng phần source cần thiết và chỉ trả về một lượng evidence
có giới hạn.

Nhưng evidence này chưa tự động trở thành knowledge chung. Nó vẫn cần được liên
kết với domain, được con người review và sau đó mới tích lũy vào knowledge base.”

## Nếu được hỏi về policy

Không cần chủ động đọc phần này trong luồng chính. Trả lời ngắn gọn:

“Codebase Memory là một OSS component dùng làm local code graph engine. Bản dùng
trong AgentBase được pin theo source và version, đóng gói và kiểm tra checksum
riêng, chỉ được làm việc với một repository đã chỉ định. AgentBase không đưa UI,
watcher, installer hay updater của upstream vào runtime thông thường. Đây là các
technical control của integration; phê duyệt cuối cùng vẫn thuộc quy trình OSS
và Security nội bộ.”

Không nói “đã compliant” hoặc “zero network” cho tới khi artifact phát hành thực
tế đã được review và phê duyệt.

## Câu chuyển sang slide 09

“Vì vậy AgentBase không phải một công cụ đơn lẻ. Nó là cách mình ghép source,
code graph, MCP, OKF và workflow review thành một luồng hoàn chỉnh.”

## Nguồn kiểm chứng

- AgentBase repository-reading runtime requirements:
  `AgentBase-MCP/docs/capabilities/01-repository-reading/05-runtime-requirements.md`
- AgentBase installation requirements:
  `AgentBase-MCP/docs/capabilities/12-version-scope/02-installation-requirements.md`
- Upstream Codebase Memory license: MIT.
