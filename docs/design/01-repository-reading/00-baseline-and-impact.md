# 01 — Baseline and impact checkpoint

> Trạng thái: Baseline hiện tại đã implement; workspace routing mới chờ audit.

## Baseline hiện tại

AgentBase-MCP đã có các primitive cần thiết để đọc một repository:

- owned Codebase Memory session cho đúng một repository local;
- index, architecture, graph search, trace và exact source snippet;
- source identity, freshness receipt và explicit refresh;
- bounded evidence bundle có source path và line span;
- kiểm tra repository không bị provider sửa trong graph round;
- public `agentbase-query`, `agentbase-ingest`, `agentbase-refresh` và các
  workflow batch/domain liên quan;
- internal `use-codebase-memory` cho Code Graph và `agentbase-okf` cho authoring.

Nguồn baseline:

- [Repository OKF boundary](../../../src/app/repository-okf/README.md)
- [Graph round](../../../src/app/repository-okf/graph/graph-round.ts)
- [Evidence preparation](../../../src/app/repository-okf/evidence/prepare-evidence.ts)
- [Owned graph skill](../../../.agents/skills/use-codebase-memory/SKILL.md)
- [OKF authoring skill](../../../.agents/skills/agentbase-okf/SKILL.md)

## Gap hiện tại

Public skills đã điều phối Hub, Code Graph và authoring. Gap cần audit sau review
12 phần chỉ còn ở host-level routing: khi caller đứng ở một thư mục cha chứa
nhiều Git repository, Agent phải chọn một repository explicit hoặc duy nhất hợp
lý trước khi gọi graph; nếu vẫn mơ hồ thì hỏi lại.

MCP runtime không cần tự hiểu ý nghĩa workspace, tự chọn concept hoặc duy trì
một registry mới. Graph round tiếp tục nhận đúng repository và task focus do
workflow đã xác định.

## Impact

**Contained change.** Tái sử dụng provider, MCP tools, freshness, evidence và
public skills hiện có. Không thêm graph engine, background worker, model SDK,
workflow database, combined graph hoặc workspace registry.

Nếu thiết kế sau này yêu cầu MCP tự khám phá toàn repository bằng một fixed
pipeline không có Agent điều phối, impact sẽ thành broad change và mâu thuẫn với
high-level hiện tại.
