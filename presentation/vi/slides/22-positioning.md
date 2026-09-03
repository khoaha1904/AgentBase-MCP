# Slide 22 — AgentBase thêm một knowledge lifecycle

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Định vị AgentBase so với plain Markdown và RAG mà không biến chúng thành những
lựa chọn loại trừ nhau.

## Thông điệp duy nhất

AgentBase không thay thế Markdown hoặc RAG. Nó bổ sung lifecycle có governance
cho loại shared knowledge mà team cần cùng kiểm tra, sửa và duy trì.

## Nội dung hiển thị

```text
PLAIN MARKDOWN          RAG                   AGENTBASE
Durable documents      Relevant retrieval    Governed knowledge
Con người đọc và       Tìm source chunks     Source-backed
chỉnh sửa tốt           phù hợp lúc hỏi       Reviewable
                                              Compounding

Schema, provenance     Reviewed synthesis    Knowledge lifecycle
và lifecycle cần       và authority cần      là phần AgentBase thêm
xây thêm                xây thêm
```

Callout:

```text
Một lifecycle cho shared knowledge — không phải replacement
cho mọi search hoặc RAG use case.
```

## Lời thoại dự kiến

“Vậy AgentBase khác gì plain Markdown hoặc RAG? Mình không xem ba cách này là
đối thủ loại trừ nhau.

Plain Markdown rất tốt cho tài liệu bền và để con người trực tiếp chỉnh sửa.
RAG rất tốt khi cần retrieve những source chunk liên quan tại thời điểm hỏi.
Nhưng provenance có cấu trúc, durable synthesis, review authority và refresh
lifecycle đều là những phần phải xây thêm.

AgentBase tập trung đúng vào lớp đó: biến evidence thành knowledge đã được
review và tiếp tục duy trì nó. Nó không thay mọi search hay RAG use case; nó
thêm một lifecycle cho loại knowledge mà team cần cùng kiểm tra và sửa.”

## Câu chuyển sang slide 23

“Và đó cũng là ba điều mình muốn mọi người nhớ về AgentBase.”
