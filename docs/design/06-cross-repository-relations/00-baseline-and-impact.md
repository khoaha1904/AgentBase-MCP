# 06.00 — Baseline and impact

> Trạng thái: AWS/SQS relation/enrichment slice implemented; Published concept
> merge/redirect explicitly deferred beyond MVP.

## Outcome

Phần 06 mở rộng graph knowledge hiện tại để một relation có thể nối concept
trong cùng repository, khác repository hoặc khác Domain mà không biến Ingest
thành một đợt scan toàn Hub/provider. Matching không chắc chắn phải giữ riêng
cho Domain Enrichment hoặc review; nó không được trở thành canonical edge.

## Baseline có thể tái sử dụng

- Concept identity hiện là normalized OKF path; relation identity là
  `source + predicate + target`.
- `relationships` đã giữ canonical direction và evidence IDs thuộc source
  concept. Validator yêu cầu target tồn tại và có Markdown link resolve được.
- Hub query đã load canonical edges, derive inbound traversal và chỉ dùng
  `part-of` để derive Domain membership. Vì vậy một cross-Domain edge không làm
  repository hoặc concept trở thành multi-Domain.
- Initial Ingest/Refresh đã bind một authorized local repository, validate exact
  source evidence và có một bounded Hub match pass. Nó không clone repository
  khác, gọi provider CLI hoặc điều tra toàn Domain.
- Proposal/Accept/Publish hiện đã cung cấp atomic review unit; Domain Enrichment
  có thể dùng lại publication lifecycle thay vì có data store riêng.
- Repository identity đã có forge ID, remote aliases và Git lineage. Đây chỉ là
  identity của Git repository, chưa phải identity của cloud resource/concept.

## Gap còn lại

Provider-neutral external identity, bounded AWS/SQS verification, Domain
Enrichment và multi-region rules đã được thiết kế và implement offline. Real AWS
qualification và provider khác vẫn deferred.

Hai Published concepts có strong duplicate identity chỉ tạo Question/merge
candidate. Merge/redirect runtime không thuộc MVP; không còn là gap phải đóng
trước release.

## Impact checkpoint

| Boundary | Impact | Lý do |
|---|---|---|
| Relation discovery và one-sided evidence | Contained change | Tái sử dụng relation/evidence model; chỉ cần phân biệt canonical edge và unresolved candidate. |
| External resource identity và matching | Broad change | Thêm portable metadata/validation và ảnh hưởng Ingest, Enrichment, query. |
| Domain Enrichment reconciliation | Broad change | Nối knowledge, provider evidence, Questions và publication của nhiều repositories. |
| Provider verification | Broad change | Thêm provider adapter, quyền CLI, account/region boundary và recovery. |
| Concept merge/redirect/history | Post-MVP broad change | MVP giữ Question và hai identities; không implement redirect. |
| Multi-region representation | Contained after identity model | Không nên chốt encoding trước external identity. |

Không có lý do để rewrite relationship graph, OKF documents, Git-backed Hub hay
publication lifecycle. Runtime hiện tại dừng đúng ở bounded enrichment proposal;
merge Published identities không nằm trên critical path.

## Deferred khỏi phần 06

- Question lifecycle và conflict presentation thuộc phần 07.
- Live value resolution thuộc phần 08.
- Ingest/Refresh/Domain Enrichment orchestration thuộc phần 09.
- Query response composition thuộc phần 10.
- PR mechanics và publication state thuộc phần 11.

Phần 06 chỉ định nghĩa contract mà các workflow đó sử dụng, không lặp lại toàn
bộ lifecycle của chúng.
