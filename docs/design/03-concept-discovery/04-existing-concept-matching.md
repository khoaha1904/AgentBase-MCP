# 03.04 — Existing concept matching

> Trạng thái: Bounded Hub/active proposal matching implemented cho current slice.

## Mục tiêu

Trước khi tạo concept, Agent thực hiện một bounded match pass để tránh duplicate.
Đây không phải nhiều reasoning rounds hoặc provider-wide discovery.

## Search scope

Một pass đối chiếu bao gồm:

1. candidates/concepts đã materialize trong current proposal;
2. active local Hub, vốn đã overlay Published knowledge và accepted pending
   Local Draft commits;
3. exact references/aliases/technical identities có sẵn trong kết quả đó.

Ingest không gọi provider CLI hoặc scan repository khác để cố xác nhận indirect
match. Việc đó thuộc Domain Enrichment.

## Outcomes

- Strong identity match: enrich existing canonical concept.
- Same-run duplicate: gom evidence vào một candidate/concept.
- Name/prose similarity only: giữ separate candidate hoặc Question.
- No match: tạo concept mới nếu candidate qua qualification.

Match result không được rewrite protected Published bytes. New evidence đi qua
proposal update/relation/Question bình thường.

## Efficiency boundary

Matching là một bounded Hub query theo identity, alias và metadata, ưu tiên
confirmed Domain/current Repository scope. Không lặp full-Hub search cho từng
source line. Candidate list và query bounds do phần 09 đặt budget.
