# 09.01 — Initial Ingest

> Trạng thái: Baseline implemented/qualified. Capability 046 target approved;
> discovery coverage implementation and requalification pending.

## User interaction

User gọi Ingest cho một repository hoặc batch explicit roots. Skill chỉ hỏi
owner decision tối thiểu như proposed/confirmed Domain; không yêu cầu prompt tự
viết, provider login hoặc cross-repository investigation.

## Stages

```text
1. Preflight   Hub + repository/Domain + exact remote-default source
2. Discover    graph + MCP fixed baseline/census → private Discovery Seed
3. Investigate five lanes + exact source → submitted Inventory
4. Author      freeze Receipt → guidance/skeletons → OKF proposal
5. Validate    Seed/Receipt coverage + OKF integrity + preview
```

Stage boundaries/checkpoints là deterministic. Agent reasoning chỉ nằm trong
semantic discovery/investigation và phải disposition important group thành
concept, embedded, Question hoặc ignored reason. MCP groups structure and
assigns lane/P0/validates coverage; Agent decides meaning. Không có progress thì
dừng investigation.

Preflight requires an active Remote Hub. It resolves exact remote default-branch
commit before graph creation through same-host Hub-token HTTPS. It reuses current
checkout only on a clean exact match and otherwise uses an AgentBase-private
mirror/worktree outside the source repository. Scan itself does not create a
graph. Without a Remote Hub there is no OKF Init/Local Draft.

## Success

Success không yêu cầu full repository coverage hoặc concept quota. Một run thành
công khi mọi discovery lane là covered, absent-after-check hoặc limited, mọi P0
group có disposition và proposal valid/useful/provenance-bearing. P1/P2 thiếu có
thể vẫn `Ready for review` cùng Question/limitation.

Missing low-value details là diagnostics. Ambiguity quan trọng thành Question.
Integrity/validation failure tạo Incomplete run và không vào query/publish.
P0 source/authority/adapter gap, P0-hiding pagination/diagnostic hoặc P0 overflow
chưa xử lý cũng tạo Incomplete.

## Repair budget

Validation có tối đa một Agent repair round trên exact failures. Vẫn lỗi thì giữ
repairable session/diagnostics và dừng; không tự mở thêm discovery loop.

## Exit boundary

Ingest dừng ở proposal preview. Accept, Publish và provider enrichment cần
authorization/workflow riêng. Một batch giữ proposal hoàn chỉnh của repository
khác khi một repository thất bại.

## Implementation/qualification note

MCP render canonical Repository, confirmed Domain, selected concept và index
skeletons trước khi Agent enrich; Agent không dựng frontmatter từ đầu. Catalog
7 qualification bằng Sol tạo một valid partial 7-concept ECS full-stack bundle
với System, frontend/backend Components, Interface và delivery Flow; AWS
resource nội bộ được giữ embedded. Explicit Batch Initial Ingest đã implement
offline bằng isolated
sequential member checkpoints cùng one atomic proposal.

Capability 046 does not add schema/catalog, public scanner tool or concept
quota. It reuses pinned Codebase Memory, exposes more normalized diagnostics to
the private Seed and requires released-skill qualification before replacing the
baseline status above. It does not retrofit Published repositories; that remains
future Full Discovery Refresh or an intentional qualification-data re-ingest.
