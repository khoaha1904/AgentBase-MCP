# 09 — Baseline and impact checkpoint

> Trạng thái: Single-repository flow đã implement.

## Baseline hiện tại

- Repository graph round quản lý source identity, freshness, evidence và cleanup.
- Hub prepare tạo private authoring session từ exact active Hub head.
- Agent authoring workspace giữ base/bundle riêng và continuity có bounds.
- Finalize validate, lock và materialize immutable proposal.
- Inspect, Accept, pending commits, PR publication và recovery đã tách riêng.
- Refresh bảo vệ protected bytes và evidence của repository khác.

Nguồn baseline:

- [Repository graph/evidence](../../../src/app/repository-okf/README.md)
- [Hub authoring session](../../../src/app/hub-okf/authoring/authoring-session.ts)
- [Refresh reconciliation](../../../src/app/hub-okf/authoring/refresh.ts)
- [Hub MCP boundary](../../../src/app/hub-okf/mcp/mcp-tools.ts)

## Gap đã đóng

`agentbase-ingest` và `agentbase-refresh` đã nối graph reading, evidence-bearing
guidance, prepared skeletons, changed-document validation, finalize và inspect.
Evidence digest cho proposal mới được derive từ validated guidance + exact
source state thay vì opaque caller input.

## Gap còn lại

Không có durable multi-repository checkpoint/batch retry. OKF query chưa render
contribution age và Hub chưa có derived freshness report.

## Kết quả

Implementation giữ deterministic graph, proposal, validation, Git publication
và recovery boundaries. Phần còn lại tiếp tục là các vertical slice độc lập;
không mở lại single-repository flow thành một orchestration framework chung.
