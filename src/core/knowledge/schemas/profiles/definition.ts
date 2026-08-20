export type DetectedResource = Readonly<{
  status: "exact" | "ambiguous" | "unsupported";
  provider?: string;
  resourceType: string;
  sourceTool: string;
  limitations: readonly string[];
}>;

export type ProviderResourceMapping = Readonly<{
  resourceType: string;
  product: string;
  schemaType: string;
}>;
