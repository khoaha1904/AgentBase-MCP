# Slide 12 — Update knowledge: thay đổi và phần còn thiếu

## Vai trò của slide

Giải thích freshness và khả năng bổ sung phần ingest còn thiếu.

## Thông điệp duy nhất

Bạn nói muốn cập nhật hay bổ sung điều gì; AgentBase chọn phạm vi điều tra phù
hợp trong cùng Update knowledge.

## Nội dung hiển thị

```text
UPDATE KNOWLEDGE
Cập nhật thay đổi                Bổ sung phần thiếu
Theo Git delta                   Điều tra lại có giới hạn khi được yêu cầu
Mặc định                         Source không đổi vẫn bổ sung được

Giữ rõ phần chưa kiểm tra · xem preview trước Publish

Freshness warns · user starts · absence != deletion evidence
```

## Lời thoại dự kiến

“Repo mới thì Add repository; repo đã có thì Update knowledge. Bạn không cần
chọn thuật ngữ kỹ thuật: cập nhật source dùng Delta; yêu cầu bổ sung kiến thức
thiếu dùng Coverage có giới hạn, kể cả source không đổi. Phần chưa kiểm tra được
giữ lại để lần sau tiếp tục. Không tự đọc cloud hay Publish. Ba lượt chỉ là giới
hạn chi phí, không chứng minh đã đủ kiến thức; cũng không tự chạy ba lượt.”

## Câu chuyển

“Vậy AgentBase nằm ở đâu so với Markdown thuần hoặc RAG?”

## Nguồn

- `docs/product/03-knowledge-lifecycle.md`
- `docs/capabilities/09-ingest-and-refresh/09-runtime-requirements.md`
