# 11.09 — Profile migration publication changes

> Trạng thái: Designed boundary; deferred until Published knowledge needs migration.

## Outcome

Một semantic detector/provider-profile change không tự rewrite Published Hub.
MCP impact scan tạo một Migration Draft để owner review và một migration PR.

## When migration is required

- Documentation hoặc additive mapping không đổi meaning đã Published: không
  migration.
- Mapping change có thể đổi schema/disposition/technology interpretation của
  Published knowledge: migration bắt buộc.
- Catalog/profile chưa từng tạo Published knowledge: clean cutover được phép;
  không dựng converter chỉ cho historical local artifacts.

## Migration unit

- exact Published base, old/new catalog-detector-profile versions;
- bounded affected concept identities và source/evidence references;
- Added/Updated/Removed changes cùng Questions/Limitations;
- one atomic Migration Draft → review → Accept → one PR to `main`.

Thiếu evidence không tự reclassify hoặc xóa concept. Giữ current knowledge và
tạo Question cho Refresh/Domain Enrichment. Migration không scan/rewrite foreign
open-world OKF types không thuộc AgentBase profile authority.

## Deferred implementation impact

MVP Catalog 7 chưa có Published predecessor cần migrate. Không implement impact
scanner, converter, dual-read/write hoặc migration command trước khi một real
profile upgrade tạo nhu cầu. Khi đó đây là separate Full Feature vì có thể sửa
nhiều Published concepts và cần recovery/compatibility review.
