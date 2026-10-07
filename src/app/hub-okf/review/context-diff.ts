type Line = Readonly<{ kind: " " | "+" | "-"; text: string }>;

// Bound quadratic alignment work; large rewrites still produce an explicit,
// bounded hunk with complete bytes available in the proposal workspace.
export function contextualDiff(before: string, after: string, maximumBytes = 8192): Readonly<{
  text: string; truncated: boolean;
}> {
  const left = before.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const right = after.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  let prefix = 0, suffix = 0;
  while (prefix < Math.min(left.length, right.length) && left[prefix] === right[prefix]) prefix++;
  while (suffix < Math.min(left.length, right.length) - prefix
    && left[left.length - suffix - 1] === right[right.length - suffix - 1]) suffix++;
  const a = left.slice(prefix, left.length - suffix), b = right.slice(prefix, right.length - suffix);
  const lines: Line[] = left.slice(0, prefix).map((text) => ({ kind: " ", text }));
  if ((a.length + 1) * (b.length + 1) <= 2_000_000) {
    const width = b.length + 1, table = new Uint32Array((a.length + 1) * width);
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
      table[i * width + j] = a[i] === b[j] ? 1 + table[(i + 1) * width + j + 1]!
        : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!);
    }
    let i = 0, j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i] === b[j]) {
        lines.push({ kind: " ", text: a[i++]! }); j++;
      } else if (i < a.length && (j === b.length || table[(i + 1) * width + j]! >= table[i * width + j + 1]!)) {
        lines.push({ kind: "-", text: a[i++]! });
      } else lines.push({ kind: "+", text: b[j++]! });
    }
  } else {
    lines.push(...a.map((text) => ({ kind: "-" as const, text })), ...b.map((text) => ({ kind: "+" as const, text })));
  }
  lines.push(...left.slice(left.length - suffix).map((text) => ({ kind: " " as const, text })));
  const ranges: { start: number; end: number }[] = [];
  for (let i = 0; i < lines.length; i++) if (lines[i]!.kind !== " ") {
    const start = Math.max(0, i - 3), end = Math.min(lines.length, i + 4);
    const last = ranges.at(-1);
    if (last && start <= last.end) last.end = end;
    else ranges.push({ start, end });
  }
  let oldLine = 1, newLine = 1, position = 0, text = "";
  for (const range of ranges) {
    while (position < range.start) {
      if (lines[position]!.kind !== "+") oldLine++;
      if (lines[position++]!.kind !== "-") newLine++;
    }
    const hunk = lines.slice(range.start, range.end);
    const oldCount = hunk.filter((line) => line.kind !== "+").length;
    const newCount = hunk.filter((line) => line.kind !== "-").length;
    text += `@@ -${oldCount ? oldLine : oldLine - 1},${oldCount} +${newCount ? newLine : newLine - 1},${newCount} @@\n`;
    for (const line of hunk) text += `${line.kind}${line.text}${line.text.endsWith("\n") ? "" : "\n\\ No newline at end of file\n"}`;
    oldLine += oldCount; newLine += newCount; position = range.end;
    if (Buffer.byteLength(text) > maximumBytes) break;
  }
  const bytes = Buffer.from(text);
  return { text: bytes.subarray(0, maximumBytes).toString("utf8"), truncated: bytes.length > maximumBytes };
}
