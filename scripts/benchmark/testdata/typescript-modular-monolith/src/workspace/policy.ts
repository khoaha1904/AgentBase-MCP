export function allowWorkspace(path: string): boolean {
  return path.startsWith("/") && !path.includes("..");
}
