// テストエンジン — test runner with spawn, timeout, output limits
import { spawn, type ChildProcess } from "child_process";
import * as fsp from "fs/promises";
import * as path from "path";
import { PRACTICE_DIR } from "./constants";
import type {
  RunTestsOptions,
  RunTestsResult,
  CommandLine,
  TestArtifacts,
  SpawnOptions,
  SpawnResult,
} from "./testEngine.types";

export type {
  RunnerKind,
  RunTestsOptions,
  RunTestsResult,
  CommandLine,
  TestArtifacts,
  SpawnOptions,
  SpawnResult,
} from "./testEngine.types";

const IS_WIN = process.platform === "win32";
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_OUTPUT_BYTES = 1_000_000;

/** JSON安全読込 — read and parse JSON, null on failure */
export async function readJsonSafe(filePath: string): Promise<any | null> {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** ファイル存在確認 — check if file exists */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

interface ResolvedCommand {
  command: string;
  args: string[];
  shell: boolean;
}

/** vitest検出 — detect vitest command from package.json */
export async function detectVitestCommand(
  workspaceRoot: string
): Promise<ResolvedCommand | null> {
  const pkg = await readJsonSafe(path.join(workspaceRoot, "package.json"));
  if (!pkg) {
    return null;
  }

  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  if (!deps["vitest"]) {
    return null;
  }

  return { command: "npx", args: ["vitest", "run"], shell: IS_WIN };
}

/** JUnit検出 — detect Gradle/Maven wrapper for JUnit */
export async function detectJUnitCommand(
  workspaceRoot: string
): Promise<ResolvedCommand | null> {
  const gradlewBat = path.join(workspaceRoot, "gradlew.bat");
  const gradlewSh = path.join(workspaceRoot, "gradlew");

  if (IS_WIN) {
    if (await exists(gradlewBat)) {
      return { command: "gradlew.bat", args: ["test"], shell: true };
    }
  } else if (await exists(gradlewSh)) {
    return { command: "./gradlew", args: ["test"], shell: false };
  }

  const mvnwCmd = path.join(workspaceRoot, "mvnw.cmd");
  const mvnwSh = path.join(workspaceRoot, "mvnw");

  if (IS_WIN) {
    if (await exists(mvnwCmd)) {
      return { command: "mvnw.cmd", args: ["test"], shell: true };
    }
  } else if (await exists(mvnwSh)) {
    return { command: "./mvnw", args: ["test"], shell: false };
  }

  return null;
}

/** プロセス実行 — spawn process with timeout/output limits */
export function spawnWithLimits(
  command: string,
  args: string[],
  opts: SpawnOptions
): Promise<SpawnResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    let stdoutBuf = "";
    let stderrBuf = "";
    let totalBytes = 0;
    let truncated = false;
    let timedOut = false;
    let settled = false;

    const mergedEnv = { ...process.env, ...(opts.env || {}) };

    const child: ChildProcess = spawn(command, args, {
      cwd: opts.cwd,
      env: mergedEnv,
      shell: opts.shell ?? false,
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, opts.timeoutMs);

    function append(target: "stdout" | "stderr", chunk: Buffer) {
      if (truncated) {
        return;
      }
      const str = chunk.toString("utf8");
      totalBytes += chunk.length;

      if (totalBytes > opts.maxOutputBytes) {
        const overflow = totalBytes - opts.maxOutputBytes;
        const keep = str.slice(0, Math.max(0, str.length - overflow));
        if (target === "stdout") {
          stdoutBuf += keep;
        } else {
          stderrBuf += keep;
        }
        truncated = true;
        return;
      }

      if (target === "stdout") {
        stdoutBuf += str;
      } else {
        stderrBuf += str;
      }
    }

    child.stdout?.on("data", (d: Buffer) => append("stdout", d));
    child.stderr?.on("data", (d: Buffer) => append("stderr", d));

    function finish(exitCode: number | null) {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout: stdoutBuf,
        stderr: stderrBuf,
        exitCode,
        timedOut,
        truncatedOutput: truncated,
        durationMs: Date.now() - startTime,
      });
    }

    child.on("close", (code) => finish(code));
    child.on("error", (err) => {
      stderrBuf += `\nspawn error: ${err.message}`;
      finish(null);
    });
  });
}

/** プロセスツリー終了 — cross-platform process tree kill */
function killTree(child: ChildProcess): void {
  if (IS_WIN) {
    if (child.pid) {
      const tk = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
      tk.on("error", () => child.kill());
    }
  } else {
    child.kill("SIGKILL");
  }
}

type Resolution =
  | { ok: true; command: string; args: string[]; shell: boolean }
  | { ok: false; error: string };

function needsShell(cmd: string): boolean {
  return /[&|;<>()$`"'\\]/.test(cmd);
}

async function resolveCommand(
  opts: RunTestsOptions,
  workspaceRoot: string
): Promise<Resolution> {
  if (opts.command) {
    if (needsShell(opts.command)) {
      return { ok: true, command: opts.command, args: [], shell: true };
    }
    const parts = opts.command.trim().split(/\s+/);
    return { ok: true, command: parts[0], args: parts.slice(1), shell: IS_WIN };
  }

  switch (opts.runner) {
    case "ts-vitest": {
      const detected = await detectVitestCommand(workspaceRoot);
      if (detected) {
        return { ok: true, ...detected };
      }
      const hasPkg = await exists(path.join(workspaceRoot, "package.json"));
      if (!hasPkg) {
        return {
          ok: false,
          error:
            "No package.json found in workspace. " +
            "Create a Node.js project first, then install vitest:\n" +
            "  npm init -y && npm install -D vitest",
        };
      }
      return {
        ok: false,
        error:
          "vitest is not listed in package.json dependencies. Install it:\n" +
          "  npm install -D vitest\n" +
          'Then re-run with runner "ts-vitest".',
      };
    }

    case "java-junit": {
      const detected = await detectJUnitCommand(workspaceRoot);
      if (detected) {
        return { ok: true, ...detected };
      }
      return {
        ok: false,
        error:
          "Could not find a Gradle or Maven wrapper in the workspace.\n" +
          "Expected one of: gradlew, gradlew.bat, mvnw, mvnw.cmd\n\n" +
          "Options:\n" +
          "  1. Add a Gradle wrapper:  gradle wrapper\n" +
          "  2. Add a Maven wrapper:   mvn wrapper:wrapper\n" +
          '  3. Use a custom command:  { runner: "java-junit", command: "gradle test" }',
      };
    }

    case "custom":
      return {
        ok: false,
        error:
          'Runner "custom" requires a "command" option. ' +
          'Example: { runner: "custom", command: "npm test" }',
      };

    default:
      return {
        ok: false,
        error:
          `Unknown runner: "${opts.runner}". ` +
          'Supported: "ts-vitest", "java-junit", "custom".',
      };
  }
}

/** JUnit XML検索 — find JUnit XML report in common locations */
async function findJUnitXml(
  workspaceRoot: string
): Promise<string | undefined> {
  const candidates = [
    path.join(workspaceRoot, "build", "test-results", "test"),
    path.join(workspaceRoot, "target", "surefire-reports"),
  ];

  for (const dir of candidates) {
    if (!(await exists(dir))) {
      continue;
    }
    try {
      const files = await fsp.readdir(dir);
      const xml = files.find(
        (f) => f.endsWith(".xml") && f.startsWith("TEST-")
      );
      if (xml) {
        return path.join(dir, xml);
      }
    } catch {
      // skip
    }
  }
  return undefined;
}

/** ログ書込 — write timestamped test log file */
async function writeLogFile(
  logDir: string,
  result: RunTestsResult,
  opts: RunTestsOptions
): Promise<string | undefined> {
  try {
    await fsp.mkdir(logDir, { recursive: true });

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `test-${opts.runner}-${ts}.log`;
    const filePath = path.join(logDir, filename);

    const { commandLine: cl } = result;
    const lines = [
      "Test Engine Log",
      `Runner    : ${opts.runner}`,
      `Command   : ${cl.command} ${cl.args.join(" ")}`,
      `CWD       : ${cl.cwd}`,
      `Date      : ${new Date().toISOString()}`,
      `Passed    : ${result.passed}`,
      `Exit      : ${result.exitCode}`,
      `Duration  : ${result.durationMs}ms`,
      `TimedOut  : ${result.timedOut}`,
      `Truncated : ${result.truncatedOutput}`,
      "",
      "=== STDOUT ===",
      result.stdout,
      "",
      "=== STDERR ===",
      result.stderr,
    ];

    if (result.errorMessage) {
      lines.push("", "=== ENGINE ERROR ===", result.errorMessage);
    }

    await fsp.writeFile(filePath, lines.join("\n"), "utf8");
    return filePath;
  } catch {
    return undefined;
  }
}

/** エラー結果生成 — create failed result without spawning */
function makeErrorResult(
  errorMessage: string,
  commandLine: CommandLine
): RunTestsResult {
  return {
    passed: false,
    exitCode: null,
    durationMs: 0,
    timedOut: false,
    truncatedOutput: false,
    stdout: "",
    stderr: "",
    errorMessage,
    commandLine,
  };
}

/** テスト実行 — run tests with runner */
export async function runTests(
  options: RunTestsOptions
): Promise<RunTestsResult> {
  const root = path.resolve(options.workspaceRoot);
  const emptyCmd: CommandLine = { command: "", args: [], cwd: root };

  try {
    const stat = await fsp.stat(root);
    if (!stat.isDirectory()) {
      return makeErrorResult(
        `workspaceRoot is not a directory: ${options.workspaceRoot}`,
        emptyCmd
      );
    }
  } catch {
    return makeErrorResult(
      `workspaceRoot does not exist or is inaccessible: ${options.workspaceRoot}`,
      emptyCmd
    );
  }

  const resolved = await resolveCommand(options, root);

  if (!resolved.ok) {
    const errResult = makeErrorResult(resolved.error, emptyCmd);
    await maybeWriteLog(errResult, options, root);
    return errResult;
  }

  const finalArgs = [...resolved.args, ...(options.args || [])];

  const commandLine: CommandLine = {
    command: resolved.command,
    args: finalArgs,
    cwd: root,
  };

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;

  const spawnResult = await spawnWithLimits(resolved.command, finalArgs, {
    cwd: root,
    env: options.env,
    timeoutMs,
    maxOutputBytes,
    shell: resolved.shell,
  });

  const passed = spawnResult.exitCode === 0 && !spawnResult.timedOut;

  const artifacts: TestArtifacts = {};

  if (options.runner === "java-junit") {
    const xmlPath = await findJUnitXml(root);
    if (xmlPath) {
      artifacts.junitXmlPath = xmlPath;
    }
  }

  const result: RunTestsResult = {
    passed,
    exitCode: spawnResult.exitCode,
    durationMs: spawnResult.durationMs,
    timedOut: spawnResult.timedOut,
    truncatedOutput: spawnResult.truncatedOutput,
    stdout: spawnResult.stdout,
    stderr: spawnResult.stderr,
    commandLine,
    artifacts,
  };

  await maybeWriteLog(result, options, root);

  return result;
}

async function maybeWriteLog(
  result: RunTestsResult,
  opts: RunTestsOptions,
  workspaceRoot: string
): Promise<void> {
  if (opts.writeLog === false) {
    return;
  }
  const logDir =
    opts.logDir || path.join(workspaceRoot, PRACTICE_DIR, "logs");
  const logPath = await writeLogFile(logDir, result, opts);
  if (logPath) {
    result.artifacts = { ...result.artifacts, logPath };
  }
}
