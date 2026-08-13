export type CodebaseMemoryErrorCode =
  | "MANAGED_PACKAGE_MISSING"
  | "MANAGED_PACKAGE_INVALID"
  | "PACKAGE_INTEGRITY_FAILED"
  | "UNSUPPORTED_PLATFORM"
  | "EXECUTABLE_INTEGRITY_FAILED"
  | "EXECUTABLE_IDENTITY_FAILED"
  | "BOOTSTRAP_OFFLINE"
  | "PROCESS_SPAWN_FAILED"
  | "PROCESS_TIMEOUT"
  | "PROCESS_OUTPUT_LIMIT"
  | "SESSION_CONNECT_FAILED"
  | "SESSION_PROTOCOL_FAILED"
  | "SESSION_TOOL_FAILED"
  | "SESSION_REQUEST_TIMEOUT"
  | "SESSION_TOTAL_TIMEOUT"
  | "SESSION_OUTPUT_LIMIT"
  | "SESSION_PREMATURE_EXIT"
  | "SESSION_CLEANUP_FAILED"
  | "SESSION_CANCELLED"
  | "PROVIDER_CONFLICT"
  | "PROVIDER_EXIT"
  | "PROVIDER_MALFORMED_OUTPUT"
  | "UNSAFE_SOURCE_PATH";

export class CodebaseMemoryError extends Error {
  readonly code: CodebaseMemoryErrorCode;
  readonly operation: string;
  readonly exitCode?: number;

  constructor(code: CodebaseMemoryErrorCode, operation: string, message: string, options?: Readonly<{ exitCode?: number; cause?: unknown }>) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = "CodebaseMemoryError";
    this.code = code;
    this.operation = operation;
    if (options?.exitCode !== undefined) this.exitCode = options.exitCode;
  }
}
