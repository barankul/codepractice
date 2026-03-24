import * as fs from "fs";
import * as path from "path";
import initSqlJs from "sql.js";
import { TOPICS } from "./constants";
import type { UILang } from "./i18n";
import { buildMultiTestCode, parseMultiTestTcLine } from "./multiTestRunner";
import { createOfflineBugFixPractice } from "./offlineBugFix";
import {
  OFFLINE_PRACTICES_BY_LANG,
  auditOfflinePracticeCatalogStructure,
  collectLocalizationCoverage,
  findLocalizationGaps,
  formatCatalogIssues,
  formatLocalizationGaps,
} from "./offlinePracticeAudit";
import { localizeOfflinePractice } from "./offlinePracticeLocalization";
import type { OfflinePractice } from "./practiceRandomizer";
import { spawnWithLimits } from "./testEngine";
import { buildTsRunCommand } from "./tsRunner";

export type OfflineSmokeUiLang = Extract<UILang, "en" | "ja">;

export interface OfflineTopicCoverageRow {
  lang: string;
  topic: string;
  practiceCount: number;
}

export interface OfflineSmokeIssue {
  kind:
    | "environment"
    | "topic_missing_practice"
    | "en_localization_mutation"
    | "normal_run_failed"
    | "multitest_missing"
    | "multitest_build_failed"
    | "multitest_run_failed"
    | "multitest_output_mismatch"
    | "bugfix_missing"
    | "bugfix_localization_failed";
  lang: string;
  topic: string;
  title: string;
  detail: string;
}

export interface OfflineSmokePracticeResult {
  key: string;
  lang: string;
  topic: string;
  title: string;
  normalStatus: "passed" | "failed" | "skipped";
  multiTestStatus: "passed" | "failed" | "missing" | "skipped";
  bugFixEnStatus: "passed" | "failed" | "skipped";
  bugFixJaStatus: "passed" | "failed" | "skipped";
}

export interface OfflineLangSmokeSummary {
  lang: string;
  totalPractices: number;
  normalPassed: number;
  normalChecked: number;
  multiPassed: number;
  multiChecked: number;
  multiMissing: number;
  bugFixEnPassed: number;
  bugFixEnChecked: number;
  bugFixJaPassed: number;
  bugFixJaChecked: number;
}

export interface OfflineSmokeSummary {
  totalPractices: number;
  totalTopics: number;
  topicCoverageGaps: number;
  catalogIssueCount: number;
  jaLocalizationGapCount: number;
  enLocalizationMutationCount: number;
  runtimeIssueCount: number;
}

export interface OfflineSmokeReport {
  generatedAt: string;
  uiLangs: OfflineSmokeUiLang[];
  summary: OfflineSmokeSummary;
  langSummaries: OfflineLangSmokeSummary[];
  topicCoverage: OfflineTopicCoverageRow[];
  catalogIssues: ReturnType<typeof auditOfflinePracticeCatalogStructure>;
  jaLocalizationGaps: ReturnType<typeof findLocalizationGaps>;
  enLocalizationMutations: OfflineSmokeIssue[];
  runtimeIssues: OfflineSmokeIssue[];
  localizationCoverage: {
    ja: ReturnType<typeof collectLocalizationCoverage>;
  };
  practiceResults: OfflineSmokePracticeResult[];
}

export interface RunOfflineSmokeAuditOptions {
  workspaceRoot: string;
  distRoot?: string;
  tempRoot?: string;
  uiLangs?: OfflineSmokeUiLang[];
  timeoutMs?: number;
}

interface CommandResult {
  ok: boolean;
  output: string;
  detail: string;
}

interface ToolAvailability {
  java: boolean;
  node: boolean;
  sql: boolean;
}

const SQL_SCHEMA = `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      age INTEGER,
      city TEXT
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      product TEXT,
      amount REAL,
      order_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      category TEXT,
      price REAL,
      stock INTEGER
    );

    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      salary REAL NOT NULL
    );

    CREATE TABLE archived_orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      product TEXT,
      amount REAL,
      order_date TEXT
    );

    INSERT INTO users VALUES (1, 'Alice', 'alice@gmail.com', 25, 'New York');
    INSERT INTO users VALUES (2, 'Bob', 'bob@yahoo.com', 30, 'London');
    INSERT INTO users VALUES (3, 'Charlie', 'charlie@gmail.com', 22, 'New York');
    INSERT INTO users VALUES (4, 'Diana', 'diana@example.com', 28, 'Berlin');
    INSERT INTO users VALUES (5, 'Eve', 'eve@gmail.com', 35, 'Osaka');

    INSERT INTO orders VALUES (1, 1, 'Laptop', 1200.00, '2024-01-15');
    INSERT INTO orders VALUES (2, 1, 'Mouse', 25.00, '2024-01-16');
    INSERT INTO orders VALUES (3, 2, 'Webcam', 75.00, '2024-01-17');
    INSERT INTO orders VALUES (4, 3, 'Monitor', 300.00, '2024-01-18');
    INSERT INTO orders VALUES (5, 2, 'Laptop', 1200.00, '2024-01-19');
    INSERT INTO orders VALUES (6, 1, 'Speakers', 150.00, '2024-01-20');

    INSERT INTO products VALUES (1, 'Laptop', 'Electronics', 1200.00, 50);
    INSERT INTO products VALUES (2, 'Mouse', 'Electronics', 25.00, 200);
    INSERT INTO products VALUES (3, 'Webcam', 'Electronics', 75.00, 150);
    INSERT INTO products VALUES (4, 'Monitor', 'Electronics', 300.00, 80);
    INSERT INTO products VALUES (5, 'Speakers', 'Electronics', 150.00, 120);

    INSERT INTO employees VALUES (1, 'Alice', 'Engineering', 50000);
    INSERT INTO employees VALUES (2, 'Bob', 'Sales', 60000);
    INSERT INTO employees VALUES (3, 'Charlie', 'Engineering', 55000);
    INSERT INTO employees VALUES (4, 'Diana', 'Sales', 60000);
    INSERT INTO employees VALUES (5, 'Eve', 'Marketing', 48000);
`;

function normalizeStrict(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
    .replace(/\u00AD/g, "")
    .split("\n")
    .map((line) => line
      .replace(/\s*\|\s*/g, " | ")
      .replace(/\t/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/\b\d+(?:\.\d+)?ms\b/g, "__ms__")
      .replace(/(\d+)\.0+(?!\d)/g, "$1")
      .replace(/(\d+\.\d*?)0+(?!\d)/g, "$1")
      .replace(/(\d+)\.$/g, "$1")
      .trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

function normalizeStrictSorted(value: string): string {
  const lines = normalizeStrict(value).split("\n").filter((line) => line.length > 0);
  if (lines.length <= 1) {
    return lines.join("\n");
  }

  const header = lines[0];
  const body = lines.slice(1).sort();
  return [header, ...body].join("\n");
}

function numericMatch(left: string, right: string): boolean {
  const a = Number.parseFloat(left.trim());
  const b = Number.parseFloat(right.trim());
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return false;
  }
  if (a === b) {
    return true;
  }
  const epsilon = Math.max(Math.abs(b) * 0.005, 0.01);
  return Math.abs(a - b) <= epsilon;
}

function outputMatchesExpected(actual: string, expected: string): boolean {
  const actualCandidates = [actual];
  const expectedCandidates = [expected];

  const actualLines = actual.split("\n");
  if (actualLines.length > 1) {
    actualCandidates.push(actualLines.slice(1).join("\n"));
    if (actualLines.length > 2 && /^[-=]+$/.test(actualLines[1].trim())) {
      actualCandidates.push(actualLines.slice(2).join("\n"));
    }
  }

  const expectedLines = expected.split("\n");
  if (expectedLines.length > 1) {
    expectedCandidates.push(expectedLines.slice(1).join("\n"));
    if (expectedLines.length > 2 && /^[-=]+$/.test(expectedLines[1].trim())) {
      expectedCandidates.push(expectedLines.slice(2).join("\n"));
    }
  }

  for (const actualCandidate of actualCandidates) {
    for (const expectedCandidate of expectedCandidates) {
      if (normalizeStrict(actualCandidate) === normalizeStrict(expectedCandidate)) {
        return true;
      }
      if (normalizeStrictSorted(actualCandidate) === normalizeStrictSorted(expectedCandidate)) {
        return true;
      }
      if (numericMatch(actualCandidate, expectedCandidate)) {
        return true;
      }

      const actualNormalizedLines = normalizeStrict(actualCandidate).split("\n");
      const expectedNormalizedLines = normalizeStrict(expectedCandidate).split("\n");
      if (
        actualNormalizedLines.length === expectedNormalizedLines.length &&
        actualNormalizedLines.every((line, index) =>
          line === expectedNormalizedLines[index] || numericMatch(line, expectedNormalizedLines[index]),
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

function compact(value: string, limit = 140): string {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function practiceKey(practice: OfflinePractice): string {
  return `${practice.lang}\u241f${practice.topic}\u241f${practice.title}`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "practice";
}

function trimCommandDetail(stdout: string, stderr: string): string {
  const content = [stdout.trim(), stderr.trim()].filter(Boolean).join(" | ");
  return compact(content || "no output");
}

async function ensureCleanDir(dirPath: string): Promise<void> {
  await fs.promises.rm(dirPath, { recursive: true, force: true });
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function checkCommandAvailable(command: string, args: string[], cwd: string): Promise<boolean> {
  const result = await spawnWithLimits(command, args, {
    cwd,
    shell: false,
    timeoutMs: 10_000,
    maxOutputBytes: 20_000,
  });
  return result.exitCode === 0 || result.exitCode === 1;
}

async function detectToolAvailability(workspaceRoot: string, distRoot: string): Promise<ToolAvailability> {
  const java = await checkCommandAvailable("javac", ["-version"], workspaceRoot);
  const node = await checkCommandAvailable("node", ["-v"], workspaceRoot);
  const sql = fs.existsSync(path.join(distRoot, "sql-wasm.wasm"));
  return { java, node, sql };
}

class SqlSmokeRunner {
  private SQL: any | null = null;

  public constructor(private readonly wasmPath: string) {}

  public async execute(sql: string): Promise<CommandResult> {
    if (!this.SQL) {
      this.SQL = await initSqlJs({ locateFile: () => this.wasmPath });
    }

    const db = new this.SQL.Database();
    try {
      db.run(SQL_SCHEMA);
      const trimmed = sql.replace(/--.*$/gm, "").trim();
      const isModify = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(trimmed);
      const results = db.exec(sql);

      if (results.length === 0) {
        if (isModify) {
          return {
            ok: true,
            output: `result\n----------------------------------------\n${db.getRowsModified()} row(s) affected`,
            detail: "modified rows",
          };
        }
        return { ok: true, output: "", detail: "empty result" };
      }

      const lines = [
        results[0].columns.join(" | "),
        "-".repeat(40),
        ...results[0].values.map((row: unknown[]) => row.map((value) => value === null ? "NULL" : String(value)).join(" | ")),
      ];
      if (results[0].values.length === 0) {
        lines.push("(0 rows)");
      }

      return { ok: true, output: lines.join("\n").trim(), detail: "query executed" };
    } catch (error: any) {
      return { ok: false, output: "", detail: compact(error?.message || String(error)) };
    } finally {
      db.close();
    }
  }
}

async function runSourceFile(
  lang: string,
  code: string,
  tempDir: string,
  timeoutMs: number,
): Promise<CommandResult> {
  if (lang === "SQL") {
    throw new Error("SQL must use SqlSmokeRunner");
  }

  const filename = lang === "Java" ? "Practice.java" : "Practice.ts";
  const filePath = path.join(tempDir, filename);
  await fs.promises.writeFile(filePath, code, "utf8");

  let command = "";
  let cleanup: string | undefined;

  if (lang === "Java") {
    command = "javac -encoding UTF-8 -J-Duser.language=en Practice.java && java -Dfile.encoding=UTF-8 -Duser.language=en Practice";
  } else {
    const built = buildTsRunCommand(tempDir, filename);
    command = built.command;
    cleanup = built.cleanup;
  }

  const result = await spawnWithLimits(command, [], {
    cwd: tempDir,
    shell: true,
    timeoutMs,
    maxOutputBytes: 1_000_000,
  });

  if (cleanup) {
    try {
      await fs.promises.rm(cleanup, { force: true });
    } catch {}
  }

  const output = (result.stdout || "").trim();
  if (result.exitCode === 0 && !result.timedOut) {
    return { ok: true, output, detail: trimCommandDetail(result.stdout, result.stderr) };
  }

  if (lang === "Java") {
    try {
      await fs.promises.rm(path.join(tempDir, "Practice.class"), { force: true });
    } catch {}
  }

  return {
    ok: false,
    output,
    detail: result.timedOut ? "timed out" : trimCommandDetail(result.stdout, result.stderr),
  };
}

async function runPracticeSolution(
  practice: OfflinePractice,
  tempRoot: string,
  timeoutMs: number,
  sqlRunner: SqlSmokeRunner | null,
  index: number,
): Promise<CommandResult> {
  const tempDir = path.join(tempRoot, `${String(index).padStart(3, "0")}-${slug(practice.lang)}-${slug(practice.topic)}-${slug(practice.title)}`);
  await ensureCleanDir(tempDir);

  if (practice.lang === "SQL") {
    if (!sqlRunner) {
      return { ok: false, output: "", detail: "sql-wasm.wasm missing" };
    }
    return sqlRunner.execute(practice.solutionCode);
  }

  return runSourceFile(practice.lang, practice.solutionCode, tempDir, timeoutMs);
}

async function executeMultiTestCode(
  practice: OfflinePractice,
  builtCode: string,
  className: string,
  tempRoot: string,
  timeoutMs: number,
  index: number,
  suffix: string,
): Promise<{ status: "passed" | "failed"; detail: string; outputs: Map<number, string> }> {
  const tempDir = path.join(
    tempRoot,
    `${String(index).padStart(3, "0")}-multitest-${suffix}-${slug(practice.lang)}-${slug(practice.topic)}-${slug(practice.title)}`,
  );
  await ensureCleanDir(tempDir);

  const filename = practice.lang === "Java" ? `${className}.java` : `${className}.ts`;
  const filePath = path.join(tempDir, filename);
  await fs.promises.writeFile(filePath, builtCode, "utf8");

  let command = "";
  let cleanup: string | undefined;
  if (practice.lang === "Java") {
    command = `javac -encoding UTF-8 -J-Duser.language=en ${className}.java && java -Dfile.encoding=UTF-8 -Duser.language=en ${className}`;
  } else {
    const builtCommand = buildTsRunCommand(tempDir, filename);
    command = builtCommand.command;
    cleanup = builtCommand.cleanup;
  }

  const result = await spawnWithLimits(command, [], {
    cwd: tempDir,
    shell: true,
    timeoutMs,
    maxOutputBytes: 1_000_000,
  });

  if (cleanup) {
    try {
      await fs.promises.rm(cleanup, { force: true });
    } catch {}
  }

  if (result.exitCode !== 0 || result.timedOut) {
    return {
      status: "failed",
      detail: result.timedOut ? "timed out" : trimCommandDetail(result.stdout, result.stderr),
      outputs: new Map<number, string>(),
    };
  }

  const outputs = new Map<number, string>();
  for (const line of (result.stdout || "").split("\n")) {
    const parsed = parseMultiTestTcLine(line);
    if (parsed) {
      outputs.set(parsed.tcNum, parsed.output);
    }
  }

  return {
    status: "passed",
    detail: `${outputs.size} captured outputs`,
    outputs,
  };
}

async function runMultiTest(
  practice: OfflinePractice,
  tempRoot: string,
  timeoutMs: number,
  index: number,
): Promise<{ status: "passed" | "failed"; detail: string }> {
  if (practice.lang === "SQL") {
    return { status: "passed", detail: "SQL skipped" };
  }

  const testCases = practice.testCases || [];
  const className = "PracticeTC";
  const referenceClassName = "PracticeTCRef";
  const originalConsoleError = console.error;
  console.error = () => undefined;
  let built: string | null;
  let referenceBuilt: string | null;
  try {
    built = buildMultiTestCode(practice.solutionCode, practice.code, testCases, practice.lang, className);
    referenceBuilt = buildMultiTestCode(practice.solutionCode, practice.code, testCases, practice.lang, referenceClassName);
  } finally {
    console.error = originalConsoleError;
  }
  if (!built) {
    return { status: "failed", detail: "buildMultiTestCode returned null" };
  }
  if (!referenceBuilt) {
    return { status: "failed", detail: "reference buildMultiTestCode returned null" };
  }

  const studentRun = await executeMultiTestCode(practice, built, className, tempRoot, timeoutMs, index, "student");
  if (studentRun.status === "failed") {
    return { status: "failed", detail: studentRun.detail };
  }

  const referenceRun = await executeMultiTestCode(practice, referenceBuilt, referenceClassName, tempRoot, timeoutMs, index, "reference");
  if (referenceRun.status === "failed") {
    return { status: "failed", detail: `reference failed: ${referenceRun.detail}` };
  }

  if (studentRun.outputs.size !== testCases.length) {
    return {
      status: "failed",
      detail: `expected ${testCases.length} TC outputs, got ${studentRun.outputs.size}`,
    };
  }
  if (referenceRun.outputs.size !== testCases.length) {
    return {
      status: "failed",
      detail: `reference expected ${testCases.length} TC outputs, got ${referenceRun.outputs.size}`,
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const actual = studentRun.outputs.get(i + 1) || "";
    const expected = referenceRun.outputs.get(i + 1) || "";
    if (actual.startsWith("ERROR:")) {
      return { status: "failed", detail: `TC${i + 1} runtime error: ${compact(actual)}` };
    }
    if (expected.startsWith("ERROR:")) {
      return { status: "failed", detail: `TC${i + 1} reference runtime error: ${compact(expected)}` };
    }
    if (!outputMatchesExpected(actual, expected)) {
      return {
        status: "failed",
        detail: `TC${i + 1} mismatch vs reference: expected "${compact(expected, 60)}" got "${compact(actual, 60)}"`,
      };
    }
  }

  return { status: "passed", detail: `${studentRun.outputs.size}/${testCases.length} cases matched reference` };
}

export function collectOfflineTopicCoverage(): OfflineTopicCoverageRow[] {
  const rows: OfflineTopicCoverageRow[] = [];

  for (const [lang, topics] of Object.entries(TOPICS)) {
    const practices = OFFLINE_PRACTICES_BY_LANG[lang as keyof typeof OFFLINE_PRACTICES_BY_LANG] || [];
    for (const topic of topics.filter((value) => value !== "API")) {
      rows.push({
        lang,
        topic,
        practiceCount: practices.filter((practice: OfflinePractice) => practice.topic === topic).length,
      });
    }
  }

  return rows;
}

export function findOfflineTopicCoverageGaps(): OfflineSmokeIssue[] {
  return collectOfflineTopicCoverage()
    .filter((row) => row.practiceCount === 0)
    .map((row) => ({
      kind: "topic_missing_practice" as const,
      lang: row.lang,
      topic: row.topic,
      title: "(topic coverage)",
      detail: `No offline practice exists for ${row.lang}/${row.topic}`,
    }));
}

export function buildOfflineUiMatrix(uiLangs: OfflineSmokeUiLang[] = ["en", "ja"]): Array<{
  uiLang: OfflineSmokeUiLang;
  lang: string;
  topic: string;
  title: string;
}> {
  const rows: Array<{ uiLang: OfflineSmokeUiLang; lang: string; topic: string; title: string }> = [];

  for (const practice of Object.values(OFFLINE_PRACTICES_BY_LANG).flat()) {
    for (const uiLang of uiLangs) {
      const localized = localizeOfflinePractice(practice, uiLang);
      rows.push({
        uiLang,
        lang: localized.lang,
        topic: localized.topic,
        title: localized.title,
      });
    }
  }

  return rows;
}

export function findEnglishLocalizationMutations(): OfflineSmokeIssue[] {
  const issues: OfflineSmokeIssue[] = [];

  for (const practice of Object.values(OFFLINE_PRACTICES_BY_LANG).flat()) {
    const localized = localizeOfflinePractice(practice, "en");

    const fieldPairs: Array<[string, string, string]> = [
      ["title", practice.title, localized.title],
      ["task", practice.task, localized.task],
      ["hint", practice.hint, localized.hint],
      ["judge.summary", practice.judgeFeedback.summary, localized.judgeFeedback.summary],
    ];

    for (const [field, source, target] of fieldPairs) {
      if (source !== target) {
        issues.push({
          kind: "en_localization_mutation",
          lang: practice.lang,
          topic: practice.topic,
          title: practice.title,
          detail: `${field} changed in English localization`,
        });
      }
    }

    for (const [index, line] of practice.judgeFeedback.lines.entries()) {
      if (localized.judgeFeedback.lines[index]?.problem !== line.problem) {
        issues.push({
          kind: "en_localization_mutation",
          lang: practice.lang,
          topic: practice.topic,
          title: practice.title,
          detail: `judge.lines[${index}].problem changed in English localization`,
        });
      }
      if (localized.judgeFeedback.lines[index]?.fix !== line.fix) {
        issues.push({
          kind: "en_localization_mutation",
          lang: practice.lang,
          topic: practice.topic,
          title: practice.title,
          detail: `judge.lines[${index}].fix changed in English localization`,
        });
      }
    }

    for (const [index, method] of practice.altMethods?.entries() || []) {
      if (localized.altMethods?.[index]?.name !== method.name) {
        issues.push({
          kind: "en_localization_mutation",
          lang: practice.lang,
          topic: practice.topic,
          title: practice.title,
          detail: `altMethods[${index}].name changed in English localization`,
        });
      }
      if (localized.altMethods?.[index]?.explanation !== method.explanation) {
        issues.push({
          kind: "en_localization_mutation",
          lang: practice.lang,
          topic: practice.topic,
          title: practice.title,
          detail: `altMethods[${index}].explanation changed in English localization`,
        });
      }
    }

    for (const [targetLang, value] of Object.entries(practice.crossLang || {})) {
      for (const [index, highlight] of value.highlights.entries()) {
        if (localized.crossLang?.[targetLang]?.highlights[index]?.explanation !== highlight.explanation) {
          issues.push({
            kind: "en_localization_mutation",
            lang: practice.lang,
            topic: practice.topic,
            title: practice.title,
            detail: `crossLang.${targetLang}.highlights[${index}] changed in English localization`,
          });
        }
      }
    }
  }

  return issues;
}

function createLangSummaries(practiceResults: OfflineSmokePracticeResult[]): OfflineLangSmokeSummary[] {
  return Object.keys(OFFLINE_PRACTICES_BY_LANG).map((lang) => {
    const rows = practiceResults.filter((row) => row.lang === lang);
    return {
      lang,
      totalPractices: rows.length,
      normalPassed: rows.filter((row) => row.normalStatus === "passed").length,
      normalChecked: rows.filter((row) => row.normalStatus !== "skipped").length,
      multiPassed: rows.filter((row) => row.multiTestStatus === "passed").length,
      multiChecked: rows.filter((row) => row.multiTestStatus === "passed" || row.multiTestStatus === "failed").length,
      multiMissing: rows.filter((row) => row.multiTestStatus === "missing").length,
      bugFixEnPassed: rows.filter((row) => row.bugFixEnStatus === "passed").length,
      bugFixEnChecked: rows.filter((row) => row.bugFixEnStatus !== "skipped").length,
      bugFixJaPassed: rows.filter((row) => row.bugFixJaStatus === "passed").length,
      bugFixJaChecked: rows.filter((row) => row.bugFixJaStatus !== "skipped").length,
    };
  });
}

export async function runOfflineSmokeAudit(options: RunOfflineSmokeAuditOptions): Promise<OfflineSmokeReport> {
  const uiLangs = options.uiLangs || ["en", "ja"];
  const distRoot = options.distRoot || path.join(options.workspaceRoot, "dist");
  const tempRoot = options.tempRoot || path.join(options.workspaceRoot, ".codepractice", "offline-smoke");
  const timeoutMs = options.timeoutMs || 20_000;

  await ensureCleanDir(tempRoot);

  const topicCoverage = collectOfflineTopicCoverage();
  const topicCoverageGaps = findOfflineTopicCoverageGaps();
  const catalogIssues = auditOfflinePracticeCatalogStructure();
  const jaLocalizationGaps = findLocalizationGaps("ja", ["title", "task", "hint", "judge", "altMethods", "crossLang"]);
  const enLocalizationMutations = findEnglishLocalizationMutations();
  const toolAvailability = await detectToolAvailability(options.workspaceRoot, distRoot);
  const runtimeIssues: OfflineSmokeIssue[] = [];

  if (!toolAvailability.java) {
    runtimeIssues.push({
      kind: "environment",
      lang: "Java",
      topic: "(env)",
      title: "(javac)",
      detail: "javac is not available in PATH",
    });
  }
  if (!toolAvailability.node) {
    runtimeIssues.push({
      kind: "environment",
      lang: "TypeScript",
      topic: "(env)",
      title: "(node)",
      detail: "node is not available in PATH",
    });
  }
  if (!toolAvailability.sql) {
    runtimeIssues.push({
      kind: "environment",
      lang: "SQL",
      topic: "(env)",
      title: "(sql-wasm)",
      detail: "dist/sql-wasm.wasm is missing",
    });
  }

  const sqlRunner = toolAvailability.sql ? new SqlSmokeRunner(path.join(distRoot, "sql-wasm.wasm")) : null;
  const verifyCache = new Map<string, Promise<string | null>>();
  const verifyOutput = async (code: string, lang: string): Promise<string | null> => {
    const key = `${lang}\u241f${code}`;
    const cached = verifyCache.get(key);
    if (cached) {
      return cached;
    }

    const pending = (async () => {
      if (lang === "Java" && !toolAvailability.java) {
        return null;
      }
      if (lang === "TypeScript" && !toolAvailability.node) {
        return null;
      }
      if (lang === "SQL" && !sqlRunner) {
        return null;
      }

      const pseudoPractice = {
        lang,
        topic: "Smoke",
        level: 1,
        title: "Verifier",
        task: "",
        code,
        solutionCode: code,
        expectedOutput: "",
        hint: "",
        judgeFeedback: { summary: "", lines: [] },
      } satisfies OfflinePractice;

      const index = verifyCache.size + 1_000;
      const result = await runPracticeSolution(pseudoPractice, tempRoot, timeoutMs, sqlRunner, index);
      return result.ok ? result.output : null;
    })();

    verifyCache.set(key, pending);
    return pending;
  };

  const practiceResults: OfflineSmokePracticeResult[] = [];
  const practices = Object.values(OFFLINE_PRACTICES_BY_LANG).flat();

  for (const [index, practice] of practices.entries()) {
    const practiceResult: OfflineSmokePracticeResult = {
      key: practiceKey(practice),
      lang: practice.lang,
      topic: practice.topic,
      title: practice.title,
      normalStatus: "skipped",
      multiTestStatus: practice.lang === "SQL" ? "skipped" : "missing",
      bugFixEnStatus: "skipped",
      bugFixJaStatus: "skipped",
    };

    const canRunLang =
      (practice.lang === "Java" && toolAvailability.java) ||
      (practice.lang === "TypeScript" && toolAvailability.node) ||
      (practice.lang === "SQL" && !!sqlRunner);

    if (canRunLang) {
      const normalRun = await runPracticeSolution(practice, tempRoot, timeoutMs, sqlRunner, index + 1);
      const normalPassed = practice.lang === "SQL"
        ? normalRun.ok
        : normalRun.ok && outputMatchesExpected(normalRun.output, practice.expectedOutput);
      const bugFixSource = normalRun.ok
        ? { ...practice, expectedOutput: normalRun.output }
        : practice;

      if (normalPassed) {
        practiceResult.normalStatus = "passed";
      } else {
        practiceResult.normalStatus = "failed";
        runtimeIssues.push({
          kind: "normal_run_failed",
          lang: practice.lang,
          topic: practice.topic,
          title: practice.title,
          detail: normalRun.ok
            ? `expected "${compact(practice.expectedOutput, 60)}" got "${compact(normalRun.output, 60)}"`
            : normalRun.detail,
        });
      }

      if (practice.lang !== "SQL") {
        if (!practice.testCases || practice.testCases.length < 2) {
          practiceResult.multiTestStatus = "missing";
          runtimeIssues.push({
            kind: "multitest_missing",
            lang: practice.lang,
            topic: practice.topic,
            title: practice.title,
            detail: "Need at least 2 test cases for multi-test smoke coverage",
          });
        } else {
          const multi = await runMultiTest(practice, tempRoot, timeoutMs, index + 1);
          practiceResult.multiTestStatus = multi.status;
          if (multi.status !== "passed") {
            runtimeIssues.push({
              kind: multi.detail.includes("returned null")
                ? "multitest_build_failed"
                : multi.detail.includes("expected")
                ? "multitest_output_mismatch"
                : "multitest_run_failed",
              lang: practice.lang,
              topic: practice.topic,
              title: practice.title,
              detail: multi.detail,
            });
          }
        }
      }

      if (uiLangs.includes("en")) {
        const bugFixEn = await createOfflineBugFixPractice(bugFixSource, verifyOutput, "en");
        if (bugFixEn) {
          practiceResult.bugFixEnStatus = "passed";
        } else {
          practiceResult.bugFixEnStatus = "failed";
          runtimeIssues.push({
            kind: "bugfix_missing",
            lang: practice.lang,
            topic: practice.topic,
            title: practice.title,
            detail: "Could not generate a verified offline bug-fix mutation",
          });
        }
      }

      if (uiLangs.includes("ja")) {
        const bugFixEn = await createOfflineBugFixPractice(bugFixSource, verifyOutput, "en");
        const bugFixJa = await createOfflineBugFixPractice(bugFixSource, verifyOutput, "ja");

        if (!bugFixJa || !bugFixEn) {
          practiceResult.bugFixJaStatus = "failed";
          runtimeIssues.push({
            kind: "bugfix_missing",
            lang: practice.lang,
            topic: practice.topic,
            title: practice.title,
            detail: "Could not generate a verified Japanese offline bug-fix mutation",
          });
        } else if (
          bugFixJa.title === bugFixEn.title ||
          bugFixJa.task === bugFixEn.task ||
          bugFixJa.hint === bugFixEn.hint ||
          bugFixJa.bugExplanation === bugFixEn.bugExplanation ||
          bugFixJa.judgeFeedback.summary === bugFixEn.judgeFeedback.summary
        ) {
          practiceResult.bugFixJaStatus = "failed";
          runtimeIssues.push({
            kind: "bugfix_localization_failed",
            lang: practice.lang,
            topic: practice.topic,
            title: practice.title,
            detail: "Japanese bug-fix copy still matches English text for one or more key fields",
          });
        } else {
          practiceResult.bugFixJaStatus = "passed";
        }
      }
    }

    practiceResults.push(practiceResult);
  }

  const langSummaries = createLangSummaries(practiceResults);

  return {
    generatedAt: new Date().toISOString(),
    uiLangs,
    summary: {
      totalPractices: practices.length,
      totalTopics: topicCoverage.length,
      topicCoverageGaps: topicCoverageGaps.length,
      catalogIssueCount: catalogIssues.length,
      jaLocalizationGapCount: jaLocalizationGaps.length,
      enLocalizationMutationCount: enLocalizationMutations.length,
      runtimeIssueCount: runtimeIssues.length,
    },
    langSummaries,
    topicCoverage,
    catalogIssues,
    jaLocalizationGaps,
    enLocalizationMutations,
    runtimeIssues: [...topicCoverageGaps, ...runtimeIssues],
    localizationCoverage: {
      ja: collectLocalizationCoverage("ja"),
    },
    practiceResults,
  };
}

export function hasOfflineSmokeFailures(report: OfflineSmokeReport): boolean {
  return (
    report.summary.topicCoverageGaps > 0 ||
    report.summary.catalogIssueCount > 0 ||
    report.summary.jaLocalizationGapCount > 0 ||
    report.summary.enLocalizationMutationCount > 0 ||
    report.summary.runtimeIssueCount > 0
  );
}

function summarizeIssueKinds(issues: OfflineSmokeIssue[]): string[] {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.kind, (counts.get(issue.kind) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([kind, count]) => `- ${kind}: ${count}`);
}

function formatSmokeIssues(label: string, issues: OfflineSmokeIssue[], limit: number): string[] {
  if (issues.length === 0) {
    return [`${label}: 0`];
  }

  const lines = [`${label}: ${issues.length}`];
  for (const issue of issues.slice(0, limit)) {
    lines.push(`- [${issue.kind}] ${issue.lang}/${issue.topic}/${issue.title}: ${issue.detail}`);
  }
  if (issues.length > limit) {
    lines.push(`... ${issues.length - limit} more`);
  }
  return lines;
}

export function formatOfflineSmokeReport(report: OfflineSmokeReport, limit = 40): string {
  const lines: string[] = [];

  lines.push("Offline Smoke Audit");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Practices: ${report.summary.totalPractices}`);
  lines.push(`Topic coverage gaps: ${report.summary.topicCoverageGaps}`);
  lines.push(`Catalog issues: ${report.summary.catalogIssueCount}`);
  lines.push(`JA localization gaps: ${report.summary.jaLocalizationGapCount}`);
  lines.push(`EN localization mutations: ${report.summary.enLocalizationMutationCount}`);
  lines.push(`Runtime issues: ${report.summary.runtimeIssueCount}`);
  if (report.runtimeIssues.length > 0) {
    lines.push("Runtime issue breakdown:");
    lines.push(...summarizeIssueKinds(report.runtimeIssues.filter((issue) => issue.kind !== "topic_missing_practice")));
  }
  lines.push("");
  lines.push("Per-language runtime summary:");
  for (const row of report.langSummaries) {
    lines.push(
      `- ${row.lang}: normal ${row.normalPassed}/${row.normalChecked}, ` +
      `multi ${row.multiPassed}/${row.multiChecked}, multiMissing ${row.multiMissing}, ` +
      `bugfix(en) ${row.bugFixEnPassed}/${row.bugFixEnChecked}, bugfix(ja) ${row.bugFixJaPassed}/${row.bugFixJaChecked}`,
    );
  }
  lines.push("");
  lines.push("Japanese localization coverage:");
  for (const row of report.localizationCoverage.ja) {
    lines.push(
      `- ${row.lang}: prose ${row.localizedProsePractices}/${row.totalPractices}, ` +
      `judge ${row.localizedJudgeFields}/${row.totalJudgeFields}, ` +
      `alt ${row.localizedAltFields}/${row.totalAltFields}, ` +
      `cross ${row.localizedCrossFields}/${row.totalCrossFields}`,
    );
  }
  lines.push("");
  lines.push(...formatSmokeIssues("Topic coverage issues", report.runtimeIssues.filter((issue) => issue.kind === "topic_missing_practice"), limit));
  lines.push("");
  lines.push("Catalog issues detail:");
  lines.push(formatCatalogIssues(report.catalogIssues, limit));
  lines.push("");
  lines.push("JA localization gaps detail:");
  lines.push(formatLocalizationGaps(report.jaLocalizationGaps, limit));
  lines.push("");
  lines.push(...formatSmokeIssues("EN localization mutation detail", report.enLocalizationMutations, limit));
  lines.push("");
  lines.push(...formatSmokeIssues(
    "Runtime issue detail",
    report.runtimeIssues.filter((issue) => issue.kind !== "topic_missing_practice"),
    limit,
  ));

  return lines.join("\n");
}
