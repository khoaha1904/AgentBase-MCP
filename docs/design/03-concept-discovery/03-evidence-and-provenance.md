# 03.03 — Evidence roles and provenance

> Trạng thái: Evidence ownership/provenance validation implemented.

## Nguyên tắc

Evidence không có một confidence score chung. Mỗi source role chỉ hỗ trợ một
loại claim; wording của claim không được mạnh hơn điều nguồn chứng minh.

| Source role | Claim ceiling |
|---|---|
| implementation code | source có behavior/integration được chỉ ra |
| IaC/config declaration | repository khai báo desired resource/configuration |
| README/ADR/docs | documented purpose, contract, decision hoặc future intent |
| provider observation | resource/value được quan sát tại account/region/time |
| maintainer guidance | owner-provided classification/answer tại attribution |

## Rules

- Một exact source có thể đủ; không áp minimum source count.
- Code dùng provider client không chứng minh deployed resource tồn tại.
- Terraform/IaC declaration không chứng minh apply thành công hoặc runtime state.
- Provider CLI observation không tự chứng minh source ownership hoặc design intent.
- README/ADR có thể là primary evidence cho purpose/decision, nhưng future hoặc
  ambiguous language không được viết thành implemented behavior.
- Maintainer guidance coexist với source claims; nó không xóa hoặc biến thành
  objective runtime truth.

## Provenance

Mỗi attributed claim/relation giữ source ID, exact reference và source revision
đã quan sát; Refresh không được gắn revision mới lên retained evidence cũ nếu
chưa đọc/xác nhận lại source đó. Provider
observation còn bind provider/account/region, observed time và resource identity.
Observed snapshot tuân theo phần 01/08 và không được trình bày như current truth.

## Uncertainty

Không dùng `72% confidence`. Ghi limitation cụ thể:

- implementation found, deployment not verified;
- declaration found, runtime state unknown;
- documentation describes future intent;
- identity match remains ambiguous.

Ambiguity ảnh hưởng query value hoặc canonical identity thì tạo Question; thiếu
chi tiết không quan trọng chỉ giữ limitation.
