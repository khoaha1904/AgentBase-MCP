# OKF repository benchmarks

This directory keeps repeatable, reviewable OKF baselines. It is not a source
repository cache and it does not contain disposable Code Graph databases.

```text
benchmark/
  repos/<suite>/manifest.json
  results/<suite>/<repository>/<UTC-run-id>/
    run.json
    observation.json | observation-error.txt
    claims.json
    okf/
    metrics.json
    report.md
```

The manifest pins each local fixture by path and Git commit. A run refuses a
missing, dirty, or differently pinned fixture so comparisons keep the same
input. The source repositories remain outside this repository and are never
copied into benchmark results.

Start one run:

```bash
npm run benchmark:okf -- start aws-serverless
```

The command records the normalized `observe` output for every repository and
prints the shared UTC run ID. The authoring agent then writes an evidence-only
OKF v0.2 bundle and `claims.json` in each printed result directory. Each
expected claim must be marked `supported`, `missing`, or `incorrect`; a
supported claim names its concept and whether its evidence came from the
normalized observation or direct source inspection.

Finalize and compare the run:

```bash
npm run benchmark:okf -- finalize aws-serverless <UTC-run-id>
```

Finalization validates the OKF bundle, calculates semantic and
observation-backed coverage, then writes `metrics.json` and `report.md`.
Historical results are committed so a later implementation can be compared
against the same pinned repositories and expected claims.
