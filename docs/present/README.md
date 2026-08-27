# AgentBase — thiết kế sản phẩm high-level

Đây là bản trình bày hướng sản phẩm. Low-level design và implementation có thể
đi sau từng phần; trạng thái đồng bộ bên dưới giúp phân biệt điều đã chạy được
với định hướng chưa implement.

## AgentBase giải quyết việc gì?

Kiến thức về một hệ thống thường nằm rải rác trong code, hạ tầng, config và tài
liệu của nhiều repository. AgentBase giúp AI tìm, kiểm chứng và nối các kiến
thức đó thành một bản đồ dùng chung có nguồn rõ ràng.

```text
Source local/workspace ──→ Code Graph + MCP ──→ Local Draft
                                                    ↓ review + PR
                                              Published Hub
```

- **Source và Code Graph** trả lời chi tiết implementation hiện tại.
- **MCP và các skill** điều tra, kiểm chứng, tạo draft và query Published knowledge.
- **Hub** giữ overview: hệ thống có gì, vì sao, liên kết thế nào và tìm chi tiết
  ở đâu. Hub không sao chép toàn bộ repository.

Luồng chính là: **Ingest lần đầu → review Local Draft → Publish qua PR →
Refresh khi source đổi**. Mọi kết luận giữ provenance; AI không tự merge dữ
liệu mơ hồ, không tự chọn một nguồn xung đột làm sự thật và không tự publish.

## Thuật ngữ chính

- **MCP/skill:** công cụ và quy trình để Agent đọc, kiểm tra và cập nhật knowledge.
- **Domain:** nhóm nghiệp vụ như Crawler hoặc Recommendation.
- **Concept:** một thực thể cụ thể trong Hub, như service, API hoặc queue.
- **Schema:** khuôn vai trò chung mà MCP dùng để mô tả concept.
- **Relation:** quan hệ giữa hai concept.
- **Claim:** một nhận định; **evidence/provenance** là bằng chứng và nguồn của nó.
- **Question:** điều chưa rõ cần theo dõi hoặc xác nhận.
- **Local Draft / Published:** kiến thức chỉ có local / đã merge vào Hub chung.
- **Maintainer Guidance:** hướng dẫn có phạm vi do người dùng cung cấp.
- **PR:** đề nghị thay đổi để maintainer review và merge vào Hub chung.

## Các phần trình bày

0. [Product scope và authority](00-product-scope-and-authority.md)
1. [MCP đọc một repository như thế nào?](01-how-mcp-reads-a-repository.md)
2. [Hub, Domain và Repository được tổ chức thế nào?](02-hub-domains-and-repositories.md)
3. [MCP nhận diện concept trong repository thế nào?](03-how-concepts-are-identified.md)
4. [MCP lựa chọn schema cho concept thế nào?](04-how-concept-schemas-are-selected.md)
5. [Kiến thức từ repository được đưa vào Hub thế nào?](05-how-repository-knowledge-enters-the-hub.md)
6. [Quan hệ giữa nhiều repository và nhiều Domain](06-cross-repository-and-cross-domain-relationships.md)
7. [Dữ liệu xung đột, Questions và Maintainer Guidance](07-conflicts-questions-and-maintainer-guidance.md)
8. [Observed snapshots và source references](08-live-references-for-change-prone-values.md)
9. [Ingest và Refresh](09-ingest-and-refresh.md)
10. [Query từ Code Graph và Hub](10-querying-code-graph-and-hub.md)
11. [Review và Publish](11-review-accept-and-publish.md)
12. [Giới hạn và phạm vi của phiên bản đầu](12-current-limits-and-open-decisions.md)
13. [Visualize Published knowledge](13-visualizing-published-knowledge.md)

Cả 12 phần nền tảng đã được review như một tổng thể. Phần 13 là capability
presentation mới, giữ nguyên authority của các phần trước. Capability 051 đã
hoàn tất reliability hardening; nó không đổi OKF schema hoặc query authority.

## Trạng thái đồng bộ — 2026-08-24

| Phần | Implementation hiện tại |
|---|---|
| 01–05 | Local Code Graph, catalog 7, OKF template, remote-profile Local Draft và Published-only query đã implement |
| 06–08 | Relation/Question, snapshots, AWS/SQS Enrichment, freshness và Hub CI đã implement; profile khác deferred |
| 09 | Single Initial Ingest/Refresh, Batch Initial Ingest, Domain Enrichment, freshness và CI đã implement; Batch Refresh deferred |
| 10 | Hub search/read Published-only đã implement; multi-term/relation-aware query quality đã accepted cho capability 049; ordinary freshness marks và remote source reader chưa có |
| 11 | Review, Accept, rich batch PR và exact same-Repository Init/Refresh PR stack đã có; MCP không merge hoặc rebase các Init độc lập |
| 12 | MVP hiện hỗ trợ Terraform/Terragrunt; SAM/CloudFormation chưa hỗ trợ |
| 13 | Published projection, query diagram và static Domain site đã implement; còn model/domain qualification |

Model policy hiện chỉ là policy qualification: benchmark Initial Ingest dùng
Sol, Refresh dùng Terra. Nó chưa phải hard-coded runtime rule của MCP.

Khi implementation làm lộ một gap lớn, dự án quay lại high-level và low-level
để review trước khi code tiếp. Gap nhỏ có thể gom theo một slice, nhưng phải
backfill tài liệu trước benchmark/PR/commit hoàn tất; code chạy được không phải
lý do để high-level và low-level bị bỏ lại phía sau.
