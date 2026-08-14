# AWS and Terraform Product Dogfood

- **Date:** 2026-08-14
- **Terraform serverless source:** `aws-health-aware` at `928494c70a904a65b877d426516882397541eafd`
- **Backend/frontend source:** `aws-serverless-shopping-cart` at `66a863f1b7a2a7f319adddce6a55e090ce9f6734`
- **Sources modified:** no
- **Remote effects or credentials:** none

## Why this replaces the generic dogfood priority

AgentBase is intended to preserve higher-level AWS, Terraform and cross-repository knowledge, so a generic TypeScript repository is not representative enough to choose the next capability. This qualification exercises a real Terraform serverless deployment and a separate SAM backend plus Vue frontend.

## Terraform serverless result

The managed Codebase Memory graph indexed `aws-health-aware` successfully with 240 nodes and 537 edges. Raw MCP search found:

- Terraform `aws_lambda_function.AHA-LambdaFunction-PrimaryRegion` at lines 656–702;
- Python `handler.main` at lines 1042–1060;
- the DynamoDB table declarations at lines 245–306;
- the EventBridge rule, target and invocation permission at lines 755–803.

The graph did not connect the Terraform Lambda resource to `handler.main`. The Lambda resource had only file-structure `DEFINES` and `USAGE` neighbors. More importantly, AgentBase's explicit observation round failed at `trace_path`: the current task adapter treats every requested target as a callable function. A valid Terraform resource therefore causes `SESSION_TOOL_FAILED` and the complete observation is discarded even though search found the exact resource.

## Backend plus frontend result

Raw graph search over `aws-serverless-shopping-cart` found all of these in one result neighborhood:

- frontend `cartMigrate` in `frontend/src/backend/api.js`;
- route `ANY /cart/migrate`;
- SAM `MigrateCartFunction` declaration and `migrate_cart.lambda_handler` source;
- related cart handlers and frontend store actions.

The graph linked the frontend function to the route through `HTTP_CALLS`, but did not link the route or SAM declaration to the backend Lambda handler. It also emitted a suspicious backend-to-frontend call edge caused by a generic `query` name, so inferred cross-language calls cannot be promoted to durable knowledge without source confirmation.

The ordinary AgentBase observation command returned zero source-backed search, snippet and trace facts for a unique Python function. A fully qualified retry failed at `trace_path`. The raw graph is useful, but the current normalized observation adapter is still tuned to the accepted TypeScript walking-skeleton shape.

## OKF representation result

A separate isolated manual qualification used exact Terraform and handler line spans as bounded source evidence. The existing catalog selected:

- Repository;
- Terraform Module;
- AWS Lambda;
- Database Table;
- Event.

One draft linked the Terraform module, primary Lambda, DynamoDB table and one-minute EventBridge schedule. Validation accepted six created files and one root-index modification with no conflict or prohibited deletion. Local acceptance and searches for `EventBridge` and `DynamoDB` returned the linked concepts correctly.

This proves the current OKF/catalog/Hub layer can represent the narrow Terraform serverless architecture. It does **not** prove the product can generate that draft automatically: the qualification used a digest of the reviewed Terraform file and direct source spans because normalized observation had failed.

## Product gap

The next bottleneck is not OKF storage or another schema. It is the bridge from mixed code/IaC graph results to bounded source-backed observations:

```text
Codebase Memory search finds Terraform and application nodes
  -> current function-only trace round fails or loses them
  -> no trustworthy observation reaches OKF authoring
```

## Recommended Capability 012

Use the Full Feature route for **Terraform-backed AWS observation** with these defaults:

1. Make observation target-aware: Terraform resources are searched and excerpted without calling function-only trace operations.
2. Cover one narrow serverless Terraform family first: module, Lambda, handler reference, DynamoDB table, EventBridge rule/target and their declared relationships.
3. Preserve evidence basis in relation names. Terraform configuration may establish `declares`, `targets`, `configured_with` or `depends_on`; it must not claim runtime reads/writes without handler or SDK evidence.
4. Treat graph edges as navigation hints. Cross-file and cross-language relationships require exact source spans before becoming normalized observations.
5. Keep SAM/backend/frontend findings as a conformance follow-up, not additional implementation scope for the first Terraform slice.

Do not add Terraform plan/apply, AWS credentials, state access, a watcher, a model SDK or a new graph engine. A later slice may add SAM/frontend-to-handler parity after the Terraform observation path is trustworthy.
