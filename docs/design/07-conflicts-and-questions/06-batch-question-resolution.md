# 07.06 — Batch Question resolution

> Trạng thái: Owner đã chốt automatic/recommended/manual resolution tiers; chưa implement.

## Quyết định ngắn

Domain Enrichment tự rà soát evidence trước, rồi phân Question thành ba mức:

```text
deterministically verified → tự propose resolution, chỉ show kết quả
strong but non-authoritative → hỏi user với recommended option
insufficient evidence → hỏi trực tiếp, kèm context/example hoặc defer
```

Tự động ở đây chỉ tạo Enrichment Draft để review. Nó không tự Accept, Publish
hoặc biến recommendation thành truth.

## Tier 1 — Automatically verified

Dùng khi deterministic checks đủ chứng minh outcome, ví dụ:

- exact provider identity/account/region match qua released read-only operation;
- exact Terraform input/output/remote-state chain resolve cùng target;
- exact source revision chứng minh relation/config change;
- candidate được chứng minh là false/not-the-same resource.

Agent không hỏi lại một câu mà MCP đã xác minh deterministic. Batch summary chỉ
show proposed result, evidence, operation/profile version và limitation. User
vẫn review toàn draft trước Accept.

Provider identity chỉ xác minh “cùng resource”; canonical relation vẫn cần
interaction evidence theo 06.01.

Tier 1 chỉ áp dụng cho factual Question có released deterministic verification
criterion. Product/policy, ownership, concept merge, intended semantics và
maintainer authority luôn cần Tier 2 hoặc Tier 3 dù technical evidence mạnh.

## Tier 2 — Recommended confirmation

Dùng khi evidence nghiêng rõ về một lựa chọn nhưng quyết định vẫn mang tính
semantic, ownership hoặc maintainer authority.

Prompt phải show:

- Question ngắn gọn;
- evidence chính và điều còn thiếu;
- 2–3 concrete options nếu có;
- một option `Recommended` cùng lý do;
- lựa chọn defer/keep Open.

Ví dụ:

```text
Hai concepts có vẻ là cùng Vehicle Events interface.
Recommended: merge vào interfaces/vehicle-events
Lý do: cùng Queue ARN và cùng contract; tên repository khác nhau.
Khác: giữ riêng / cần thêm evidence.
```

Recommendation chỉ tồn tại trong review interaction cho tới khi user chọn. Nó
không được persist như accepted human evidence trước confirmation.

## Tier 3 — Direct maintainer input

Dùng khi source/provider không có đáp án đáng tin hoặc câu hỏi là product/policy
decision. Agent hỏi trực tiếp và cung cấp:

- context/evidence đang có;
- chính xác điều gì chưa biết;
- example answer hoặc expected format;
- plausible options nếu chúng thực sự có evidence;
- `defer` khi user chưa muốn trả lời.

Agent không tạo fake alternatives hoặc gắn `Recommended` nếu evidence không đủ.
Question chưa được trả lời tiếp tục `Open` và không làm batch fail.

## Bounded re-investigation

Trước khi hỏi user, Agent có một bounded recheck pass:

- reread selected Published Hub evidence/references;
- compare selected repositories/candidates;
- reread authorized source file khi workflow có quyền;
- gọi released provider verification cho exact candidate;
- không clone repo, build cross-repository graph, scan account hoặc lặp reasoning
  tới khi ép ra answer.

Nếu recheck chuyển Question sang Tier 1, Agent show result thay vì hỏi. Nếu vẫn
mơ hồ, nó chuyển Tier 2/3 với limitation rõ.

## Batch interaction

Domain Enrichment chạy automatic verification trước, sau đó trình một bounded
decision packet thay vì ngắt giữa từng candidate:

1. auto-verified outcomes để user scan;
2. recommended confirmations cần chọn;
3. direct Questions cần answer/defer;
4. omitted count nếu packet vượt bound.

Mỗi answer bind exact Question ID/revision và explicit `human:*` identity.
Selected answers, automatic evidence changes và Questions còn Open cùng đi vào
một Enrichment proposal.

## Partial success và failure

- User không cần clear hết Questions để finalize truthful partial draft.
- Defer/permission denied/insufficient evidence là `unresolved`, không phải run
  failure.
- Stale revision, invalid answer, evidence integrity hoặc provider protocol
  failure giữ run Incomplete cho affected selected item.
- User có thể retry item lỗi hoặc reconfirm membership để bỏ nó; hệ thống không
  tự drop.
- Một accepted Enrichment proposal không split thành nhiều PR.

## Provenance và state transition

- Tier 1 resolution trỏ provider/source evidence, không tạo Maintainer Guidance.
- Tier 2/3 answer tạo scoped Maintainer Guidance và Question update atomically.
- Refresh/Enrichment chỉ propose `Needs Review` khi exact typed references chứng
  minh evidence mới mâu thuẫn accepted Guidance; validator kiểm tra references
  và Accept mới đổi state. Stale age, mất quyền hoặc source tạm unavailable không
  tự tạo transition.
- Recommended option chưa được chọn không xuất hiện như human evidence.

## Reuse và impact

Reuse Domain Enrichment manifest/checkpoints ở 06.03, provider verification ở
06.04 và shared Question/Guidance proposal ở 07.02–03. Không thêm chat session
database, background resolver hoặc autonomous retry loop.
