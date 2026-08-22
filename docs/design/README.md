# AgentBase technical design

Thư mục này phân rã 12 quyết định high-level trong
[`docs/present`](../present/README.md) thành các thiết kế kỹ thuật có thể review
và triển khai riêng.

[Architecture ownership](00-architecture.md) là bản đồ source chung. Các file
`*-requirements.md` trong đúng numbered area giữ current `AB-*` requirements;
không có một cây contracts song song.

## Cách tổ chức

- Mỗi phần high-level tương ứng đúng một thư mục đánh số từ 01 đến 12.
- `README.md` trong thư mục giữ phạm vi, liên kết high-level và mục lục thiết kế
  con.
- Mỗi file con giải quyết một boundary kỹ thuật; không lặp lại product decision.
- File con có thể là current design, implemented baseline hoặc deferred design;
  status đầu file phải nói rõ loại nào.
- Historical design bị supersede được giữ để trace nhưng không được mô tả như
  current baseline.

## Nguyên tắc baseline-first

Technical design không thiết kế lại AgentBase từ đầu. Mỗi phần phải dựa trên hai
nguồn:

1. **High-level decision** là authority hiện tại, xác định outcome sản phẩm vừa
   được owner chốt.
2. **Implementation baseline** gồm code, schema, test và tài liệu hiện tại của
   AgentBase-MCP/Hub.

Trước khi đề xuất thay đổi, phần design phải ghi rõ:

- hiện tại hệ thống đã làm gì và thành phần nào có thể tái sử dụng;
- khoảng cách giữa baseline và high-level decision;
- phần nào giữ nguyên, phần nào sửa và phần tối thiểu phải thêm;
- compatibility, migration, failure/recovery và verification bị ảnh hưởng.

Nếu baseline khác high-level, tài liệu ghi thành gap để review. Không âm thầm
đổi product decision, không suy diễn code hiện tại là đúng tuyệt đối và không
mở rộng thành một cuộc rewrite ngoài phạm vi.

## Impact checkpoint

Mỗi phần phải phân loại tác động dự kiến lên baseline:

- **Reuse:** implementation hiện tại đã phù hợp hoặc chỉ cần wiring/documentation.
- **Contained change:** thay đổi giới hạn trong một boundary rõ ràng.
- **Broad change:** ảnh hưởng nhiều subsystem, schema hoặc migration.
- **Near rewrite:** high-level hiện tại khiến phần lớn baseline phải thay thế.

`Broad change` hoặc `Near rewrite` phải được báo cho owner trước khi tiếp tục
thiết kế sâu. Báo cáo phải chỉ ra phần code bị ảnh hưởng, lý do, phần có thể giữ
lại và ít nhất một phương án giảm phạm vi.

Nếu đọc baseline phát hiện constraint thật, giới hạn quan trọng hoặc một thiết
kế hiện tại hợp lý hơn, Agent phải đề xuất điều chỉnh high-level cùng trade-off.
Chỉ sau khi owner chấp thuận mới sửa `docs/present` và tiếp tục technical design.
Không tự bẻ technical design để né high-level, cũng không mù quáng bắt code theo
high-level khi tác động chưa được owner nhìn thấy.

## Vòng lặp chống dead spec

```text
High-level → Low-level → Implementation
     ↑            ↑             │
     └──── gap lớn┴─────────────┘
                  ↑ gap nhỏ phải backfill trước khi đóng slice
```

Khi implementation phát hiện assumption thiết kế không đúng:

- **Gap nhỏ, cùng responsibility:** có thể sửa một nhóm nhỏ để giữ nhịp làm
  việc, nhưng phải cập nhật low-level, high-level liên quan (nếu product outcome
  đổi) và current requirements trước khi verify/đóng capability.
- **Gap lớn:** dừng code. Gap được coi là lớn nếu đổi observable workflow,
  authority/credential, data model/schema, migration/recovery, ownership giữa
  subsystem, hoặc làm scope/impact khác đáng kể. Quay lại high-level để owner
  chốt outcome, sau đó sửa low-level rồi mới tiếp tục implementation.
- **Không được hợp thức hóa ngược:** test đang pass hoặc code đã chạy không tự
  biến implementation thành design đúng. Code không được dùng để âm thầm ghi
  đè quyết định high-level.
- **Completion gate:** chỉ đóng slice khi high-level, low-level, current requirements,
  code và verification mô tả cùng một behavior. Nếu cố ý deferred, cả hai level
  phải ghi rõ boundary đó thay vì để tài liệu hứa rằng nó đã có.

Một nhóm gap nhỏ chỉ được batch để giảm ngắt quãng, không được tích lũy vô hạn;
checkpoint tự nhiên là trước benchmark mới, trước PR và trước capability commit.

## Mục lục

1. [Repository reading](01-repository-reading/README.md)
2. [Hub, Domain và Repository model](02-hub-domain-repository-model/README.md)
3. [Concept discovery](03-concept-discovery/README.md)
4. [Schema selection](04-schema-selection/README.md)
5. [Knowledge entry](05-knowledge-entry/README.md)
6. [Cross-repository relations](06-cross-repository-relations/README.md)
7. [Conflicts, Questions và Guidance](07-conflicts-and-questions/README.md)
8. [Live references](08-live-references/README.md)
9. [Ingest và Refresh](09-ingest-and-refresh/README.md)
10. [Query routing](10-query-routing/README.md)
11. [Review và Publish](11-review-and-publish/README.md)
12. [Version scope](12-version-scope/README.md)

## Implementation trace — 2026-08-22

| Phần | Trạng thái low-level |
|---|---|
| 01 | Graph/source reading implemented cho local single-repository |
| 02 | Domain/Repository foundation implemented; batch/monorepo edge cases còn draft |
| 03 | Evidence-bearing candidate/guidance implemented; candidate UI còn deferred |
| 04 | Catalog 7 implemented; catalog 6 design đã superseded |
| 05 | Proposal/template/Local Hub foundation implemented; overlay UX còn draft |
| 06–08 | Contracts/foundation từng phần; Domain Enrichment/provider resolution chưa implement |
| 09 | Single-repository Init + Refresh implemented; batch/enrichment/freshness deferred |
| 10 | Query foundation implemented; overlay/freshness presentation chưa hoàn chỉnh |
| 11 | Main-target publication implemented; rich PR template và stacked PR chưa implement |
| 12 | Terraform/Terragrunt MVP; SAM/CloudFormation và provider expansion deferred |

Current runtime authority nằm ở `docs/design`, code và active spec. Design trong
thư mục này giải thích shape/trade-off và phải được cập nhật
khi implementation làm một assumption cũ không còn đúng.

## Thứ tự thiết kế ban đầu

Không bắt buộc đi theo số thứ tự. Dependency order hiện tại là:

```text
05 Knowledge/storage foundation
→ 02 Hub/Domain/Repository identity
→ 04 Schema model
→ 01 Repository reading
→ 03 Concept discovery
→ 09 Ingest/Refresh orchestration
→ 06 Relations → 07 Conflicts → 08 Live references
→ 10 Query → 11 Publish
→ 12 Cross-cutting scope check
```

Thứ tự trên là lịch sử thiết kế, không còn là work queue hiện tại.
