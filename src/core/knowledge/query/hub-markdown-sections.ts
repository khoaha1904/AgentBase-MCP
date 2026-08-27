export type HubMarkdownSection = Readonly<{
  id: string;
  conceptIdentity: string;
  ordinal: number;
  headingPath: readonly string[];
  text: string;
  searchText: string;
}>;

const DEFAULT_MAXIMUM_SECTIONS = 512;

function sectionId(identity: string, ordinal: number): string {
  return `${identity}#section-${ordinal}`;
}

export function splitHubMarkdownSections(
  conceptIdentity: string,
  body: string,
  maximumSections = DEFAULT_MAXIMUM_SECTIONS,
): readonly HubMarkdownSection[] {
  if (!conceptIdentity.trim()) throw new Error("concept identity is required");
  if (!Number.isSafeInteger(maximumSections) || maximumSections < 1) {
    throw new Error("maximumSections must be a positive safe integer");
  }
  const sections: HubMarkdownSection[] = [];
  const headings: string[] = [];
  let lines: string[] = [], fenced = false;

  const flush = () => {
    const text = lines.join("\n").trim();
    lines = [];
    if (!text) return;
    if (sections.length === maximumSections) throw new Error("Markdown section limit exceeded");
    const ordinal = sections.length;
    sections.push({
      id: sectionId(conceptIdentity, ordinal),
      conceptIdentity,
      ordinal,
      headingPath: [...headings],
      text,
      searchText: text.replace(/\s+/g, " ").trim(),
    });
  };

  for (const line of body.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      lines.push(line);
      continue;
    }
    const heading = fenced ? undefined : line.match(/^(#{1,6})[ \t]+(.+?)\s*#*\s*$/);
    if (!heading?.[1] || !heading[2]) {
      lines.push(line);
      continue;
    }
    flush();
    const level = heading[1].length;
    headings.length = level - 1;
    headings[level - 1] = heading[2].trim();
  }
  flush();
  return sections;
}
