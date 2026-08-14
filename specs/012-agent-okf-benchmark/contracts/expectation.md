# Repository Expectation Contract

```json
{
  "repository": "example",
  "concepts": [
    {
      "key": "primary-lambda",
      "identityTerms": ["primary", "lambda"],
      "type": "AWS Lambda",
      "requiredMetadata": ["business_purpose", "runtime", "handler"],
      "requiredSourcePaths": ["infra/main.tf", "src/handler.py"]
    }
  ],
  "relationships": [
    { "from": "schedule", "to": "primary-lambda", "kind": "triggers" }
  ]
}
```

`identityTerms` plus source evidence match semantically equivalent agent slugs
without relying on prose bytes. Every concept document carries unique
frontmatter `benchmark_key`. Relationship
scoring uses a normal Markdown link from the source concept body to the target
concept; `kind` appears in a frontmatter `relationships` entry containing the
target benchmark key. Exact prose, headings beyond schema requirements and
file paths beyond valid OKF structure are not golden.
