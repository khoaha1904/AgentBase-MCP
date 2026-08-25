# 07.00 — Baseline and impact

> Trạng thái: Shared Question và AWS/SQS three-tier enrichment đã implement;
> per-item lifecycle states removed from MVP.

## Outcome

Phần 07 cho phép nhiều source-backed claims cùng tồn tại, giữ uncertainty thành
Question và biến câu trả lời của maintainer thành scoped evidence/guidance thay
vì một global truth. Conflict không chặn Ingest và có thể được xử lý theo batch
trong Domain Enrichment.

## Baseline có thể tái sử dụng

- Concept documents đã giữ source IDs/provenance và canonical relations giữ
  evidence IDs.
- Current `agentbase.live_claims` định danh volatile observations; phần 08 đã
  supersede nó bằng snapshot-first `agentbase.observed_values`.
- Proposal Finalize render bounded Question declarations thành ordinary Hub
  Markdown và index trước inspection/digest; không còn Question sidecar.
- Question ID derive từ immutable origin tuple, không chứa Hub/machine identity;
  exact revision check ngăn trả lời một Question đã đổi dưới chân user.
- `answer_hub_question` yêu cầu explicit `human:*`, tạo đúng một Maintainer
  Guidance proposal và không sửa accepted Hub bytes trực tiếp.
- Refresh đã có explicit removal/correction intent và review grouping; current
  runtime `supersede/retract` state đã được loại bỏ theo current contract.
- Hub query đã đọc canonical claims/relations tại exact commit nhưng chưa compose
  conflict-aware answer đầy đủ.

## Gap còn deferred

1. Runtime chấp nhận explicit `needs-review`, nhưng chưa tự infer nó từ evidence
   mới mâu thuẫn Guidance.
2. Baseline Ingest/Refresh hiện tạo Question từ observed-value references.
   Capability 046 Initial Ingest sẽ reuse chính SharedQuestion renderer và thêm
   private Receipt-bound QuestionPlan cho missing-evidence/relation/identity
   candidate có exact source revision; nó không tạo Question system thứ hai.
3. Maintainer Guidance hiện bind exact subject/property; chưa có reviewed
   Domain/Hub-wide scope hoặc provider evidence resolution.
4. Conflict-aware query composition và batch Question resolution chưa có.
5. Conflict-aware query composition đầy đủ thuộc phần 10.

## Impact checkpoint

| Boundary | Impact | Lý do |
|---|---|---|
| Claim/provenance model | Contained nếu tái sử dụng natural knowledge identities | Không nên tạo universal claim database hoặc ID cho mọi paragraph. |
| Shared Published Questions | Broad change | Cần Hub representation, query và synchronization thay cho machine-only truth. |
| Needs Review lifecycle | Contained after shared model | Thêm transition dựa trên new evidence/guidance revision. |
| Maintainer Guidance scope | Contained change | Reuse current proposal/document path và explicit human authority. |
| Conflict presentation | Contained after model | Chủ yếu query/read composition, không cần scorer. |
| Exact correction/removal | Contained change | Proposal/PR nêu reason/evidence; Git giữ history, không thêm tombstone state. |
| Batch Question resolution | Broad change | Dùng Domain Enrichment multi-repository proposal/checkpoints ở phần 06/09. |

Không cần rewrite OKF concepts, Git-backed Hub hoặc proposal lifecycle. Phần 08
clean-cutover live-reference model cũ thành observed snapshots; phần 07 chỉ dùng
stable observed-value identity và provenance, không sở hữu resolver. Question trong unaccepted proposal là work-in-progress; sau
Accept nó là shared Hub knowledge. Private index/cache không có authority.

## Dependency boundaries

- Relation/identity candidates đến từ phần 06.
- Observed snapshots và current-source response boundary thuộc phần 08.
- Domain Enrichment orchestration thuộc phần 09.
- Conflict-aware response thuộc phần 10.
- Review/PR publication thuộc phần 11.

Phần 07 định nghĩa governance contract; không lặp lại các workflow đó.
