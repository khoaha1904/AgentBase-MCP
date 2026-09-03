# Slide 09 — Một proposal được tạo qua 5 stage

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Mở chương kỹ thuật bằng một sườn duy nhất để người nghe biết toàn bộ quá trình
trước khi đi sâu vào từng phần.

## Thông điệp duy nhất

AgentBase không biến source thành knowledge trong một lần prompt; MCP dẫn agent
qua năm stage có output và guardrail rõ ràng.

## Nội dung hiển thị

```text
01 Preflight      identity · revision · Domain confirmation
02 Discover       bounded candidates · sparse by design
03 Investigate    Code Graph · exact source
04 Author         enrich generated OKF skeletons
05 Validate       citations · relations · schema · limits

OUTPUT: editable proposal — chưa Accept, chưa Publish
```

## Lời thoại dự kiến

“Từ đây mình sẽ đi sâu vào phần quan trọng nhất: làm sao một repository trở
thành một proposal OKF có thể review được.

Thay vì nhìn nó như nhiều flow nhỏ, mình gom toàn bộ quá trình vào năm stage.
Preflight khóa đúng repository, revision và Domain. Discover chỉ chọn một tập
candidate có giới hạn. Investigate quay từng candidate về Code Graph và exact
source. Author đưa phần đã hiểu vào OKF skeleton do MCP tạo sẵn. Cuối cùng,
Validate kiểm tra citation, relation, schema và các giới hạn.

Điểm cần nhớ là sau cả năm stage, output vẫn chỉ là một editable proposal. Nó
chưa được Accept và chưa phải shared knowledge.”

## Câu chuyển sang slide 10

“Stage đầu tiên nghe đơn giản, nhưng nó ngăn một loại lỗi rất nguy hiểm: hiểu
đúng code nhưng ở sai repository hoặc sai revision.”

## Nguồn

- `AgentBase-MCP/docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
- `AgentBase-MCP/docs/architecture/flows.md`
