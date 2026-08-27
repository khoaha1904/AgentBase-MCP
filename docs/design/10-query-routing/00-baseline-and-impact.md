# 10.00 — Baseline and impact

> Trạng thái: Published-only query contract implemented by capability 038.

## Outcome

Agent chọn Hub, local source/Code Graph hoặc cả hai theo câu hỏi. MCP giữ các
surface đọc nhỏ và deterministic; không thêm một reasoning router hoặc một tool
“trả lời mọi thứ”.

## Baseline có thể tái sử dụng

- Hub search và concept read dùng exact Published commit, có bounds và
  Domain/type scope.
- Concept Markdown đã chứa relationships, snapshots, provenance và Questions;
  không cần query action riêng cho từng loại dữ liệu.
- Gateway đã expose Code Graph/search/snippet cho một authorized local
  repository binding. Source reading không thuộc Hub query owner.
- Hub Questions là shared Markdown với governance riêng.
- Remote GitHub credential đã thuộc MCP publication/setup, nhưng chưa có remote
  repository file reader.

## Gap so với high-level

1. Search hiện chỉ match một substring nguyên vẹn, không dùng canonical
   relation/Flow text và có thể trả body excerpt rỗng sau whitespace collapse.
2. Exact Domain scope chỉ dùng `part-of`, nên concept `implemented-in` hoặc
   `declared-by` Repository thuộc Domain không đủ điều kiện search.
3. Không có response composition contract thống nhất cho conflict, Question và
   Maintainer Guidance.
4. Snapshot age và local Repository freshness report đã có, nhưng freshness mark
   trong ordinary search/read response còn deferred; scheduled CI đã dùng report này.
5. Explicit current-source read reuse graph/file tools. Bounded remote-reference
   reader là first post-phase query priority, không phải MVP blocker.

## Minimal direction

- Giữ routing ở host skill/agent policy; MCP không reasoning thay agent.
- Dùng snapshot-default: snapshot/Hub đủ trả lời thì dừng; source availability,
  age hoặc conflict không tự kích hoạt source read.
- Giữ đúng hai public query primitives: search và exact Markdown read.
- Xem OKF như structured Markdown KB: dùng official `description`, tags,
  heading/body, portable links và AgentBase relation extension. Discovery theo
  pattern search-then-read; không thêm persisted summary/index.
- Dùng established in-memory full-text relevance và heading-aware section
  records thay vì tự duy trì scoring formula; exact address vẫn là pre-pass.
- Phân biệt canonical Domain membership với Repository association và direct
  boundary inclusion trong scoped search.
- Không bắt query Hub phải có source credential; source failure không làm mất
  Hub knowledge hoặc snapshot.
- Không tự resolve conflict, Refresh hoặc write-back trong query path.

## Impact checkpoint

| Boundary | Impact | Lý do |
|---|---|---|
| Host source selection | Reuse/documentation | Existing Hub và graph tools đã tách đúng responsibility. |
| Search/ranking | Contained + reviewed dependency | Reuse transient Hub graph/Markdown; standard lexical scorer replaces custom relevance and returns best section. |
| Domain query context | Contained change | Reuse accepted structural relations without rewriting Hub membership. |
| Published + Local Draft overlay | Rejected for MVP | Draft belongs to review/PR, not ordinary query. |
| Conflict/Question composition | Contained after Part 07 | Shared Question runtime chưa tồn tại. |
| Observed/current values | Reuse | Part 08 snapshot query + normal graph/file reads. |
| Remote repository reference read | First post-phase capability | Shared stable cross-repo source via MCP token; deferred khỏi MVP only. |
| Freshness presentation/CI | Contained follow-up | Reuse implemented Repository report; ordinary response marks and scheduling remain. |

Không có broad change hoặc near rewrite. Query core, exact Published anchor và
hai public primitives được giữ; capability 049 thay matching/scope và mở rộng
result theo hướng additive.

## Deferred dependencies

- Shared conflict/Question documents: Part 07.
- Freshness scheduling and ordinary response marks: Part 09.08.
- Remote repository reading: first post-phase capability using exact identity,
  path/revision and MCP-managed GitHub.com/Enterprise token.
- Provider access: Parts 06 and 11.
- Query không tự clone, index hoặc gọi provider CLI.
