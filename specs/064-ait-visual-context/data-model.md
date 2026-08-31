# Data model: AIT useful visual context

No new persisted product entity or OKF schema is introduced.

## AIT diagram decision

- `phase`: Feature Discovery or Task Planning
- `priority`: P0 or conditional P1
- `decision`: the exact AIT question the visual helps answer
- `authority`: Published Hub commit or authorized repository revision
- `view`: impact map or flow lens
- `omissions`: explicit missing/untraceable knowledge
- `admission`: ready, partially ready or not ready

This is a qualification decision record in contracts/benchmark evidence, not a
Hub document.

## Development fixture input

- exact Hub identity: `khoaha1904/hub-3#main`
- provider scope: account `123456789012`, region `ap-southeast-1`
- resource: SQS queue `crawler-jobs`
- selected repository IDs: Crawler publisher and worker
- candidate: queue identity plus Question revision 1

The input exists in the qualification script. The generated provider
observation, external identity and Question transition use current ordinary OKF
contracts and remain time-bound.

## State transitions

```text
guard target → Prepare → fake CLI through real adapter → Run → Finalize
→ inspect → explicit Accept → explicit submit → external merge → synchronize
```

Any failure stops at its current transition. Before Accept, Hub knowledge is
unchanged. After Accept, existing Local Draft/publication recovery applies.
