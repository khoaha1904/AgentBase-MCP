export type KnowledgeActivityEntry = Readonly<{
  date: string;
  summary: string;
}>;

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function boundedSummary(value: string): string {
  const normalized = value.replace(/[\r\n]+/g, " ").trim();
  if (!normalized || Buffer.byteLength(normalized) > 1024) throw new Error("knowledge activity summary is invalid");
  return normalized;
}

export function parseKnowledgeActivityLog(source: string): readonly KnowledgeActivityEntry[] {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines[0] !== "# Knowledge Activity") throw new Error("knowledge activity log title is invalid");
  const entries: KnowledgeActivityEntry[] = [];
  let date: string | undefined;
  for (const line of lines.slice(1)) {
    const heading = /^## (\d{4}-\d{2}-\d{2})$/.exec(line)?.[1];
    if (heading) {
      if (!validDate(heading)) throw new Error("knowledge activity date is invalid");
      date = heading;
      continue;
    }
    if (!date || !line.startsWith("* ")) throw new Error("knowledge activity entry is invalid");
    entries.push({ date, summary: boundedSummary(line.slice(2)) });
  }
  if (entries.some((entry, index) => index > 0 && entry.date > entries[index - 1]!.date)) {
    throw new Error("knowledge activity entries must be newest first");
  }
  return entries;
}

export function renderKnowledgeActivityLog(entries: readonly KnowledgeActivityEntry[]): string {
  const ordered = [...entries].map((entry) => {
    if (!validDate(entry.date)) throw new Error("knowledge activity date is invalid");
    return { date: entry.date, summary: boundedSummary(entry.summary) };
  }).sort((left, right) => right.date.localeCompare(left.date));
  const lines = ["# Knowledge Activity", ""];
  let date: string | undefined;
  for (const entry of ordered) {
    if (entry.date !== date) {
      if (date) lines.push("");
      date = entry.date;
      lines.push(`## ${entry.date}`, "");
    }
    lines.push(`* ${entry.summary}`);
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function appendKnowledgeActivity(
  source: string | undefined,
  entry: KnowledgeActivityEntry,
): string {
  const prior = source ? parseKnowledgeActivityLog(source) : [];
  const normalized = { date: entry.date, summary: boundedSummary(entry.summary) };
  if (prior.some((item) => item.date === normalized.date && item.summary === normalized.summary)) {
    return renderKnowledgeActivityLog(prior);
  }
  return renderKnowledgeActivityLog([normalized, ...prior]);
}

export function repositoryActivityLogPath(subjectDirectory: string): string {
  if (!/^repositories\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subjectDirectory)) {
    throw new Error("Repository activity subject is invalid");
  }
  return `${subjectDirectory}/log.md`;
}
