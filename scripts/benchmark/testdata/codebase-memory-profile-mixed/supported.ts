export function supportedGreeting(name: string): string {
  return `hello ${name}`;
}

export function runSupportedGreeting(): string {
  return supportedGreeting("AgentBase");
}
