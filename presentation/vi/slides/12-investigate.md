# Slide 12 — Investigate

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đào sâu stage 03 và làm rõ Code Graph là công cụ điều hướng, còn exact source
mới là evidence có thể trích dẫn.

## Thông điệp duy nhất

Candidate chỉ được giữ khi agent có thể lần theo graph tới source evidence trong
snapshot đã khóa.

## Nội dung hiển thị

```text
Candidate
   ↓
Code Graph: symbols · callers · call paths · dependencies
   ↓
Exact Source: path · revision · line span
   ↓
Normalized Evidence

PRIVATE GRAPH stays local
```

## Lời thoại dự kiến

“Discover chỉ cho mình candidate, chưa cho mình fact. Vấn đề là nếu agent viết
ngay từ candidate thì nó đang biến một suy đoán hợp lý thành knowledge.

Ý tưởng của mình ở Investigate là tách navigation khỏi authority. Agent dùng
Code Graph để tìm symbol, caller và call path nhanh hơn, nhưng graph chỉ dẫn
đường. Kết luận cuối phải quay về exact source trong snapshot đã khóa, gồm path,
revision và line span.

Output là normalized evidence có giới hạn; raw graph vẫn nằm local.”

## Câu chuyển sang slide 13

“Khi evidence đã đủ, agent mới bắt đầu viết — nhưng agent không phải tự chế cấu
trúc OKF từ đầu.”

## Nguồn

- `AgentBase-MCP/docs/architecture/state-and-trust.md`
- `AgentBase-MCP/docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
