import { isMap, isScalar, isSeq, LineCounter, parseDocument } from "yaml";

type Hint = Readonly<{ line: number; kind: "runtime" | "interface" | "resource"; text: string }>;
const SUPPORTED = new Set([
  "AWS::Serverless::Function", "AWS::Serverless::Api", "AWS::Serverless::HttpApi",
  "AWS::Lambda::Function", "AWS::Lambda::EventSourceMapping", "AWS::SQS::Queue",
  "AWS::ApiGateway::RestApi", "AWS::ApiGateway::Resource", "AWS::ApiGateway::Method",
  "AWS::ApiGatewayV2::Api", "AWS::ApiGatewayV2::Route", "AWS::ApiGatewayV2::Integration",
]);
const GLOBALS = ["Handler", "Runtime", "CodeUri", "Timeout", "MemorySize"];

/** Inspect declarations only; never evaluate CloudFormation or resolve physical identities. */
export function templateDiscovery(text: string): Readonly<{ hints: readonly Hint[]; limitations: readonly string[] }> {
  if (!/AWS::[A-Za-z0-9]+::/.test(text)) return { hints: [], limitations: [] };
  const lineCounter = new LineCounter();
  const doc = parseDocument(text, { lineCounter, uniqueKeys: true });
  const limitations = new Set<string>();
  const hints: Hint[] = [];
  if (doc.errors.length) return { hints, limitations: ["template parse failed; declarations require manual source qualification"] };
  const resources = doc.get("Resources", true);
  if (!isMap(resources)) return { hints, limitations: ["template Resources is not a supported mapping"] };
  const globals = doc.getIn(["Globals", "Function"], true);
  const hasSam = resources.items.some((pair) => isMap(pair.value)
    && String(pair.value.get("Type")).startsWith("AWS::Serverless::"));
  const transform = doc.get("Transform", true);
  const transforms = isSeq(transform) ? transform.items : [transform];
  if (hasSam && !transforms.some((item) => isScalar(item) && item.value === "AWS::Serverless-2016-10-31")) {
    limitations.add("SAM declarations lack a recognized SAM Transform");
  }
  if (transforms.some((item) => item && (!isScalar(item) || item.value !== "AWS::Serverless-2016-10-31"))) {
    limitations.add("additional template transforms are not evaluated");
  }
  if (isMap(globals) && globals.items.some((pair) => !GLOBALS.includes(String(pair.key)))) {
    limitations.add("Globals.Function properties outside Handler/Runtime/CodeUri/Timeout/MemorySize are not interpreted");
  }
  const allGlobals = doc.get("Globals", true);
  if ((allGlobals !== undefined && !isMap(allGlobals)) || (globals !== undefined && !isMap(globals))) {
    limitations.add("Globals must be a supported mapping");
  }
  if (isMap(allGlobals) && allGlobals.items.some((pair) => String(pair.key) !== "Function")) {
    limitations.add("Globals outside Function are not interpreted");
  }
  const line = (node: unknown) => {
    const range = (node as { range?: number[] } | null)?.range;
    return lineCounter.linePos(range?.[0] ?? 0).line;
  };
  const literal = (node: unknown): string | undefined => isScalar(node) && !node.tag
    && ["string", "number", "boolean"].includes(typeof node.value) ? String(node.value) : undefined;
  const reference = (node: unknown): string | undefined => {
    let id: unknown;
    if (isScalar(node) && ["!Ref", "!GetAtt"].includes(node.tag ?? "")) id = String(node.value).split(".")[0];
    else if (isMap(node)) {
      id = node.get("Ref");
      const att = node.get("Fn::GetAtt", true);
      if (att !== undefined) id = isSeq(att) ? literal(att.items[0]) : literal(att)?.split(".")[0];
    }
    return typeof id === "string" && resources.has(id) ? id : undefined;
  };
  for (const pair of resources.items) {
    const id = String(pair.key), resource = pair.value;
    if (!isMap(resource)) { limitations.add("non-mapping resource declaration is not interpreted"); continue; }
    const type = literal(resource.get("Type", true));
    if (!type || !SUPPORTED.has(type)) { limitations.add("template contains unsupported resource types"); continue; }
    const resourceProperties = resource.get("Properties", true);
    if (resourceProperties !== undefined && !isMap(resourceProperties)) limitations.add("resource Properties is not a supported mapping");
    if (resource.has("Condition")) limitations.add("conditional resource declarations are not proven active");
    const runtime = type.endsWith("::Function");
    hints.push({ line: line(pair.key), kind: runtime ? "runtime" : type.includes("ApiGateway")
      || type.includes("::Api") || type.endsWith("::HttpApi") ? "interface" : "resource", text: `${id}: ${type} declaration` });
    for (const property of runtime ? GLOBALS : []) {
      const local = resource.getIn(["Properties", property], true);
      const inherited = type === "AWS::Serverless::Function" && isMap(globals) ? globals.get(property, true) : undefined;
      const value = local ?? inherited;
      if (value === undefined) continue;
      const rendered = literal(value);
      if (rendered === undefined) { limitations.add("runtime property expressions are unresolved"); continue; }
      hints.push({ line: line(value), kind: "resource", text: `${id}.${property}=${rendered}${local === undefined ? " (Globals inherited)" : ""}` });
    }
    const events = resource.getIn(["Properties", "Events"], true);
    if (type === "AWS::Serverless::Function" && events !== undefined && !isMap(events)) {
      limitations.add("SAM Events is not a supported mapping");
    }
    if (type === "AWS::Serverless::Function" && isMap(events)) for (const event of events.items) {
      const eventType = isMap(event.value) ? literal(event.value.get("Type", true)) : undefined;
      if (!eventType || !["Api", "HttpApi", "SQS", "Schedule", "ScheduleV2"].includes(eventType)) {
        limitations.add("template contains unsupported SAM event types"); continue;
      }
      hints.push({ line: line(event.key), kind: "interface", text: `${id}.Events.${String(event.key)}: ${eventType} trigger declaration` });
      const properties = isMap(event.value) ? event.value.get("Properties", true) : undefined;
      if (isMap(properties)) for (const name of ["Queue", "RestApiId", "ApiId", "Path", "Method", "Schedule", "ScheduleExpression"]) {
        const value = properties.get(name, true);
        if (value === undefined) continue;
        const target = reference(value), rendered = literal(value);
        if (target || rendered !== undefined) hints.push({ line: line(value), kind: "interface",
          text: `${id}.Events.${String(event.key)}.${name}: ${target ? `same-template reference ${target}` : rendered}` });
        else limitations.add("event properties contain unresolved references or expressions");
      }
    }
    if (type === "AWS::Lambda::EventSourceMapping") for (const name of ["FunctionName", "EventSourceArn"]) {
      const value = resource.getIn(["Properties", name], true), target = reference(value);
      if (target) hints.push({ line: line(value), kind: "interface", text: `${id}.${name}: same-template reference ${target}` });
      else limitations.add("event-source mapping endpoint is not a resolved same-template reference");
    }
  }
  if (doc.warnings.some((warning) => !/Unresolved tag: !(Ref|GetAtt)\b/.test(warning.message))) {
    limitations.add("template contains unsupported tags or YAML warnings");
  }
  return { hints, limitations: [...limitations].sort() };
}
