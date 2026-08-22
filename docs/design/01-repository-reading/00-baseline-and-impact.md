# 01 — Baseline and impact checkpoint

> Trạng thái: Đã xác nhận hướng skill điều phối, MCP cung cấp công cụ.

## Baseline hiện tại

AgentBase-MCP đã có các primitive cần thiết để đọc một repository:

- managed Codebase Memory session cho đúng một repository local;
- index, architecture, graph search, trace và exact source snippet;
- source identity, freshness receipt và explicit refresh;
- bounded evidence bundle có source path và line span;
- kiểm tra repository không bị provider sửa trong graph round;
- skill riêng cho Code Graph và skill riêng cho OKF authoring.

Nguồn baseline:

- [Repository OKF boundary](../../../src/app/repository-okf/README.md)
- [Graph round](../../../src/app/repository-okf/graph/graph-round.ts)
- [Evidence preparation](../../../src/app/repository-okf/evidence/prepare-evidence.ts)
- [Managed graph skill](../../../.agents/skills/use-codebase-memory/SKILL.md)
- [OKF authoring skill](../../../.agents/skills/agentbase-okf/SKILL.md)

## Gap

Hai workflow hiện vẫn đứng riêng:

1. skill Code Graph giúp Agent điều tra source;
2. skill OKF bắt đầu khi proposal và bounded evidence đã được chuẩn bị.

Chưa có một Ingest/Refresh skill làm entrypoint, điều phối việc đọc README/docs,
dựng hoặc reuse graph, điều tra source, chuẩn bị evidence rồi chuyển sang
authoring. Graph round hiện cũng nhận một task focus đã được caller chọn; nó
không tự hiểu repository hoặc tự quyết định concept.

## Impact

**Contained change.** Tái sử dụng provider, MCP tools, freshness và evidence
contracts. Không thêm graph engine, background worker, model SDK hoặc workflow
database. Phần 01 chỉ thiết kế cách Agent/skill gọi các primitive; orchestration
Ingest/Refresh đầy đủ thuộc phần 09.

Nếu thiết kế sau này yêu cầu MCP tự khám phá toàn repository bằng một fixed
pipeline không có Agent điều phối, impact sẽ thành broad change và mâu thuẫn với
high-level hiện tại.
