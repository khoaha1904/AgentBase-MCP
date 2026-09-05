# Slide 24 — Runtime architecture

## Vai trò của slide

Tổng hợp ownership và trust boundary cho engineering audience.

## Thông điệp duy nhất

AgentBase-MCP không phải model; nó cung cấp contract, validation và state
transition quanh agent reasoning.

## Nội dung hiển thị

```text
AI AGENT + SKILLS
reason · investigate · author
            ↓ MCP
BUSINESS TOOLS / WORKFLOW ORCHESTRATION
ingest · refresh · query · review/publish
            ↓
CORE CONTRACTS -> ADAPTERS
Codebase Memory · local Git/Hub · GitHub · provider observations

Source: private, read-only authority
Raw graph: private, local, rebuildable
Published Hub: shared, Git-backed, reviewed

NO MODEL SDK · NO MODEL KEY INSIDE AGENTBASE-MCP
```

## Lời thoại dự kiến

“Coding agent sở hữu reasoning và synthesis. Skills hướng dẫn workflow. MCP giữ
input/output contract, validation, digest và state transition. Adapter mới chạm
Codebase Memory, Git, Hub hoặc provider observation. Source là read-only
authority; raw graph local và rebuildable; Published Hub là shared reviewed
knowledge. AgentBase-MCP không chứa model SDK hoặc model key.”

## Nguồn

- `docs/architecture/runtime.md`
- `docs/architecture/state-and-trust.md`
- `docs/architecture/ownership.md`
