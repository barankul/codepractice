// テストエンジン型 — test engine type definitions

export type RunnerKind = "ts-vitest" | "java-junit" | "custom";

export interface RunTestsOptions {
  workspaceRoot: string;
  runner: RunnerKind;
  // Required for "custom", optional override for built-in runners. May contain shell operators.
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  timeoutMs?: number;
  maxOutputBytes?: number;
  writeLog?: boolean;
  logDir?: string;
}

export interface CommandLine {
  command: string;
  args: string[];
  cwd: string;
}

export interface TestArtifacts {
  logPath?: string;
  junitXmlPath?: string;
}

export interface RunTestsResult {
  passed: boolean;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  truncatedOutput: boolean;
  stdout: string;
  stderr: string;
  // Engine-level error (runner not found, detection failed, etc.)
  errorMessage?: string;
  commandLine: CommandLine;
  artifacts?: TestArtifacts;
}

export interface SpawnOptions {
  cwd: string;
  env?: Record<string, string>;
  timeoutMs: number;
  maxOutputBytes: number;
  shell?: boolean;
}

export interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  truncatedOutput: boolean;
  durationMs: number;
}
