# 09.02 — Refresh and change detection

> Trạng thái: Single-repository Refresh implemented và qualified.

## Default Refresh focus

Refresh không full-scan repo và cũng không chỉ nhìn changed files:

1. **Changed:** source paths/symbols đã đổi từ observed revision;
2. **Known gaps:** Questions, limitations, broken/aging references và ambiguous
   matches liên quan repository;
3. **Small discovery pass:** bounded architecture overview để tìm important
   candidate từng bị miss.

Priority theo thứ tự trên. Discovery pass dùng graph cache khi fresh và không mở
unbounded source scan.

## Build-up semantics

- Partial but valid knowledge được bổ sung qua nhiều Refresh.
- Source không đổi vẫn có thể tạo proposal mới nếu known gap hoặc discovery pass
  tìm được useful evidenced knowledge.
- Không có useful change là successful no-op, không phải failure.
- Missing concept ở một lần discovery không chứng minh concept cũ đã biến mất.
  Exact Git/source diff có thể tạo evidence-backed removal candidate, nhưng
  không tự materialize deletion ngoài proposal review.

## Explicit full refresh

User có thể yêu cầu full refresh để rerun broad discovery, ví dụ sau skill/profile
upgrade hoặc khi repository knowledge rõ ràng thiếu. Full ở đây là broad bounded
investigation, không có nghĩa đọc mọi file hoặc bắt completeness 100%.

Full refresh vẫn giữ source authority, candidate gates, one guidance call,
validation và one-repair budget như normal Refresh.

Đây là approved future **Full Discovery Refresh**, chưa được Capability 046
implement. Capability 046 chỉ đưa exact remote-default SourceSnapshot authority
vào normal Refresh và broad discovery vào new Init; nó không silently re-init
Published repository. Qualification Hub có thể intentionally reset/re-ingest
disposable data để đo Init mới.

## Reconciliation

Refresh chỉ thay contribution của current repository và giữ foreign-source
evidence/protected bytes. Changed source có thể thêm/update evidence. Absence
không evidence chỉ tạo finding/Question; exact deletion/rename/history evidence
đi qua reconciliation rules ở phần 09.06.

## Freshness output

Successful Refresh cập nhật observed revision/time cho repository contribution
được xử lý. Query trình bày age/revision; nó không tự kích hoạt Refresh. Partial
coverage không được ghi thành full-repository freshness guarantee.

## Qualification note

Refresh V2/V3 bắt buộc đọc exact Git diff của mọi changed path trước gaps và
discovery. Hai Terra runs trên ECS fixture cùng cập nhật `/status` → `/health`
ở server route + Terraform target groups, chỉ đổi Interface knowledge và
Repository observation. README cũ vẫn ghi `/status` được giữ thành limitation,
không bị model tự chọn một nguồn rồi xóa conflict.
