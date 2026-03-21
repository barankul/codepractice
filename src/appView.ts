// メインビュー — webview provider for sidebar
import * as vscode from "vscode";
import { ProgressTracker } from "./progressTracker";
import { t } from "./aiHelpers";
import { normalizeJavaPractice } from "./parsers";
import { runJavaCore, checkJdk, promptJdkInstall } from "./javaRunner";
import { getWebviewHtml } from "./webviewHtml";
import { buildWebviewHtml } from "./webviewTemplate";
import { runSQL } from "./codeRunners";
import { runQuery, resetDatabase } from "./sqlRunner";
import { checkOutput, normalizeOutput } from "./outputChecker";
import { practiceFilename, PRACTICE_DIR } from "./constants";
import { ChatPanelManager } from "./chatPanel";
import { runTests } from "./testEngine";
import { JUNIT_JAR } from "./scaffoldGradle";
import { parseVitestOutput, vitestToTestResults } from "./vitestOutputParser";
import { buildMultiTestCode } from "./multiTestRunner";
import { buildTsRunCommand } from "./tsRunner";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import type { TestCase } from "./constants";
import type { HandlerContext, PracticeState, WebviewMessage } from "./handlers/types";

import { handleReady, handleGetProgress, handleRateDifficulty, handleSetUiLang, handleSaveSettings, handleGetCustomPractices, handleDeleteCustomPractice, handleResetProgress } from "./handlers/settingsHandler";
import { handleRun, handleJudge } from "./handlers/executionHandler";
import { handleTeachMe, handleOpenChat, handleQuickSolve, handleHintViewed, handleAddHints, handleShowSolution, handleAlternativeMethods, handleOpenAltMethod, handleCrossLanguage, handleOpenApiPreview, handleOpenCrossLang } from "./handlers/aiFeatureHandler";
import { handleGenerate, handleGenerateCustom } from "./handlers/generateHandler";
import { setForceOffline } from "./demoData";

function getNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

/** メインビュー — sidebar webview provider */
export class CodePracticeAppView implements vscode.WebviewViewProvider {
  public static readonly viewType = "codepractice.app";

  private view?: vscode.WebviewView;
  private currentPractice?: PracticeState;

  private crossLangDecorationType?: vscode.TextEditorDecorationType;

  private async saveDirtyDocuments(): Promise<void> {
    await Promise.all(vscode.workspace.textDocuments.filter(d => d.isDirty).map(d => d.save()));
  }
  private generationId = 0;
  private practiceHistory: { lang: string; topic: string; title: string; task: string }[] = [];
  private currentLevel: number = 1;
  private progressTracker: ProgressTracker;

  private chatPanelManager = new ChatPanelManager({
    runCode: async () => {
      await this.saveDirtyDocuments();
      const chatPractice = this.chatPanelManager.getCurrentChatPractice();
      if (chatPractice) {
        const prev = this.currentPractice;
        this.currentPractice = chatPractice;
        try { return await this.runCode(); }
        finally { this.currentPractice = prev; }
      }
      return await this.runCode();
    },
    judgeCode: async () => {
      await this.saveDirtyDocuments();
      const chatPractice = this.chatPanelManager.getCurrentChatPractice();
      const prev = this.currentPractice;
      if (chatPractice) { this.currentPractice = chatPractice; }
      try {
        const output = await this.runCode();
        const result = this.checkOutputResult(output);
        return { pass: result.pass, output, testResults: result.testResults };
      } finally {
        if (chatPractice) { this.currentPractice = prev; }
      }
    },
    writeAndOpenFile: async (code: string, lang: string) => {
      const ws = vscode.workspace.workspaceFolders?.[0];
      if (!ws) { throw new Error("No workspace folder open"); }
      const filename = practiceFilename(lang);
      if (lang === "Java") { code = normalizeJavaPractice(code); }
      const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dirUri);
      const fileUri = vscode.Uri.joinPath(dirUri, filename);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(code, "utf8"));
      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, { preview: false });
    }
  });

  private explainPanel?: vscode.WebviewPanel;
  private schemaPanel?: vscode.WebviewPanel;
  private apiPreviewPanel?: vscode.WebviewPanel;

  private isRunning = false;
  private isGenerating = false;

  private practiceStartTime: number = 0;
  private hintUsed: boolean = false;
  private chatOpened: boolean = false;
  private judgeAttempts: number = 0;
  private practiceSkipped: boolean = false;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly output: vscode.OutputChannel,
    private readonly ghostProvider?: import("./ghostTextProvider").GhostTextProvider
  ) {
    this.progressTracker = new ProgressTracker(context);
    if (this.ghostProvider) {
      this.ghostProvider.onStatusChange = (active) => {
        this.post({ type: "ghostModeStatus", active });
      };
    }
  }

  private resetSessionTracking(): void {
    this.practiceStartTime = Date.now();
    this.hintUsed = false;
    this.chatOpened = false;
    this.judgeAttempts = 0;
    this.practiceSkipped = false;
  }

  private calculateXP(): number {
    if (this.practiceSkipped) { return 0; }

    const BASE_XP = [30, 50, 80, 120, 170];
    const baseXP = BASE_XP[Math.min(Math.max(this.currentLevel - 1, 0), 4)];
    const elapsedMin = (Date.now() - this.practiceStartTime) / 60000;

    let speedMult = 1.0;
    if (elapsedMin < 1) { speedMult = 1.5; }
    else if (elapsedMin < 3) { speedMult = 1.3; }
    else if (elapsedMin < 5) { speedMult = 1.1; }
    else if (elapsedMin < 10) { speedMult = 1.0; }
    else if (elapsedMin < 20) { speedMult = 0.9; }
    else { speedMult = 0.8; }

    const hintMult = this.hintUsed ? 1.0 : 1.25;
    const chatMult = this.chatOpened ? 1.0 : 1.15;
    const firstTryMult = this.judgeAttempts <= 1 ? 1.3 : 1.0;

    return Math.round(baseXP * speedMult * hintMult * chatMult * firstTryMult);
  }

  private getXPBreakdown(): { speed: number; hint: number; chat: number; firstTry: number } {
    const elapsedMin = (Date.now() - this.practiceStartTime) / 60000;
    let speed = 1.0;
    if (elapsedMin < 1) { speed = 1.5; }
    else if (elapsedMin < 3) { speed = 1.3; }
    else if (elapsedMin < 5) { speed = 1.1; }
    else if (elapsedMin < 10) { speed = 1.0; }
    else if (elapsedMin < 20) { speed = 0.9; }
    else { speed = 0.8; }

    return {
      speed,
      hint: this.hintUsed ? 1.0 : 1.25,
      chat: this.chatOpened ? 1.0 : 1.15,
      firstTry: this.judgeAttempts <= 1 ? 1.3 : 1.0
    };
  }

  private post(msg: any): void {
    try {
      this.view?.webview?.postMessage(msg);
    } catch { /* view disposed */ }
  }

  private async verifySolutionOutput(code: string, lang: string): Promise<string | null> {
    if (lang === "SQL") {
      // SQL: run through in-process sql.js runner
      try {
        await resetDatabase();
        const result = await runQuery(code);
        if (result.error) {
          this.output.appendLine(`[Verify SQL] Error: ${result.error}`);
          return null;
        }
        if (result.columns.length === 0) { return null; }
        let output = result.columns.join(" | ") + "\n";
        output += "-".repeat(40) + "\n";
        for (const row of result.values) {
          output += row.map((v: any) => v === null ? "NULL" : String(v)).join(" | ") + "\n";
        }
        if (result.values.length === 0) { output += "(0 rows)\n"; }
        output = output.trim();
        this.output.appendLine(`[Verify SQL] Output: "${output.slice(0, 100)}"`);
        return output.length > 0 ? output : null;
      } catch (e: any) {
        this.output.appendLine(`[Verify SQL] Error: ${e?.message || e}`);
        return null;
      }
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) { this.output.appendLine("[Verify] Skipped — no workspace folder open"); return null; }

    try {
      const dir = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dir);

      const filename = practiceFilename(lang);
      const fileUri = vscode.Uri.joinPath(dir, filename);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(code, "utf8"));

      const workspaceRoot = dir.fsPath;
      let command: string;
      let cleanup: string | undefined;
      if (lang === "Java") {
        command = "javac -encoding UTF-8 -J-Duser.language=en Practice.java && java -Dfile.encoding=UTF-8 -Duser.language=en Practice";
      } else {
        const ts = buildTsRunCommand(workspaceRoot, "Practice.ts");
        command = ts.command;
        cleanup = ts.cleanup;
      }

      const result = await runTests({
        workspaceRoot,
        runner: "custom",
        command,
        timeoutMs: 15_000,
        writeLog: false,
      });

      if (cleanup) { try { fs.unlinkSync(cleanup); } catch {} }

      if (result.timedOut || result.exitCode !== 0) {
        this.output.appendLine(`[Verify] Solution run failed: exit=${result.exitCode}, stderr=${(result.stderr || "").slice(0, 200)}`);
        return null;
      }

      const output = (result.stdout || "").trim();
      if (output.length > 0) {
        return output;
      }
      return null;
    } catch (e: any) {
      this.output.appendLine(`[Verify] Error: ${e?.message || e}`);
      return null;
    }
  }

  private async runMultiTestCases(
    studentCode: string,
    starterCode: string,
    testCases: TestCase[],
    lang: string,
    solutionCode?: string
  ): Promise<{ name: string; pass: boolean; expected: string; got: string }[] | null> {
    if (!testCases || testCases.length === 0 || lang === "SQL") { return null; }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) { return null; }

    try {
      const dir = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dir);
      const workspaceRoot = dir.fsPath;

      const runMultiTest = async (code: string, label: string): Promise<Record<number, string> | null> => {
        // Sanitize label — for Java, filename must match class name exactly
        const safeLabel = label.replace(/[^a-zA-Z0-9_]/g, "");
        const filename = lang === "TypeScript" ? `${safeLabel}_${Date.now()}.ts` : `${safeLabel}.java`;
        const fileUri = vscode.Uri.joinPath(dir, filename);
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(code, "utf8"));

        let command: string;
        let multiCleanup: string | undefined;
        if (lang === "Java") {
          command = `javac -encoding UTF-8 -J-Duser.language=en ${safeLabel}.java && java -Dfile.encoding=UTF-8 -Duser.language=en ${safeLabel}`;
        } else {
          const ts = buildTsRunCommand(workspaceRoot, filename);
          command = ts.command;
          multiCleanup = ts.cleanup;
        }

        const result = await runTests({
          workspaceRoot,
          runner: "custom",
          command,
          timeoutMs: 20_000,
          writeLog: false,
        });

        // Clean up temp files (source + compiled artifacts)
        try { fs.unlinkSync(fileUri.fsPath); } catch {}
        if (lang === "Java") {
          try { fs.unlinkSync(path.join(workspaceRoot, `${safeLabel}.class`)); } catch {}
        }
        if (multiCleanup) { try { fs.unlinkSync(multiCleanup); } catch {} }

        if (result.timedOut || result.exitCode !== 0) {
          this.output.appendLine(`[MultiTest] ${safeLabel} failed: exit=${result.exitCode}, stderr=${(result.stderr || "").slice(0, 200)}`);
          return null;
        }

        const output = (result.stdout || "").trim();
        const tcOutputs: Record<number, string> = {};
        for (const line of output.split("\n")) {
          const m = line.trim().match(/^TC(\d+):(.*)$/);
          if (m) { tcOutputs[parseInt(m[1])] = m[2].trim(); }
        }
        return tcOutputs;
      };

      // Step 1: Run SOLUTION code to get reference outputs
      let referenceOutputs: Record<number, string> | null = null;
      if (solutionCode) {
        this.output.appendLine(`[MultiTest] Building reference test code from solutionCode (${solutionCode.length} chars)...`);
        const solTestCode = buildMultiTestCode(solutionCode, starterCode, testCases, lang, "PracticeTCRef");
        if (solTestCode) {
          this.output.appendLine(`[MultiTest] Running solution as reference...`);
          this.output.appendLine(`[MultiTest] Generated ref code (${solTestCode.length} chars):\n${solTestCode.slice(0, 600)}`);
          referenceOutputs = await runMultiTest(solTestCode, "PracticeTCRef");
          if (referenceOutputs) {
            this.output.appendLine(`[MultiTest] Reference outputs: ${JSON.stringify(referenceOutputs)}`);
          } else {
            this.output.appendLine(`[MultiTest] Reference run returned null (compile/runtime error)`);
          }
        } else {
          // Debug: log why buildMultiTestCode failed
          const { extractMainBody, extractPrintStatement, extractStudentLogic } = require("./multiTestRunner");
          const body = extractMainBody(solutionCode, lang);
          const print = extractPrintStatement(solutionCode, lang);
          this.output.appendLine(`[MultiTest] buildMultiTestCode returned null for solution`);
          this.output.appendLine(`[MultiTest]   mainBody: ${body ? body.trim().length + ' chars' : 'EMPTY'}`);
          this.output.appendLine(`[MultiTest]   printStmt: ${print ? '"' + print.trim() + '"' : 'NULL'}`);
          this.output.appendLine(`[MultiTest]   solutionCode first 300 chars: ${solutionCode.slice(0, 300)}`);
        }
      }

      if (!referenceOutputs) {
        this.output.appendLine("[MultiTest] Reference solution failed — skipping (AI expected values unreliable)");
        return null;
      }

      // Step 2: Run STUDENT code with test case data
      const studentTestCode = buildMultiTestCode(studentCode, starterCode, testCases, lang);
      if (!studentTestCode) {
        const { extractMainBody, extractPrintStatement } = require("./multiTestRunner");
        const body = extractMainBody(studentCode, lang);
        const print = extractPrintStatement(studentCode, lang);
        this.output.appendLine(`[MultiTest] Could not build student test code — skipping`);
        this.output.appendLine(`[MultiTest]   studentMainBody: ${body ? body.trim().length + ' chars' : 'EMPTY'}`);
        this.output.appendLine(`[MultiTest]   studentPrintStmt: ${print ? '"' + print.trim() + '"' : 'NULL'}`);
        return null;
      }

      this.output.appendLine(`[MultiTest] Running ${testCases.length} test cases...`);
      this.output.appendLine(`[MultiTest] Student test code (${studentTestCode.length} chars):\n${studentTestCode.slice(0, 600)}`);
      const studentOutputs = await runMultiTest(studentTestCode, "PracticeTC");
      if (!studentOutputs) { this.output.appendLine(`[MultiTest] Student run returned null (compile/runtime error)`); return null; }
      this.output.appendLine(`[MultiTest] Student outputs: ${JSON.stringify(studentOutputs)}`);

      // Step 3: Validate reference outputs against expected values & compare
      // If reference output doesn't match the test case's expected output, the solution code
      // has a bug for that edge case — use the expected output from the test case instead
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const tcNum = i + 1;
        const refVal = referenceOutputs[tcNum];
        if (refVal !== undefined && tc.output && normalizeOutput(refVal, lang) !== normalizeOutput(tc.output, lang)) {
          this.output.appendLine(`[MultiTest] TC${tcNum} ref mismatch: ref="${refVal}" vs expected="${tc.output}" — using expected value`);
          referenceOutputs[tcNum] = tc.output;
        }
      }

      const results: { name: string; pass: boolean; expected: string; got: string }[] = [];
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const tcNum = i + 1;
        const got = studentOutputs[tcNum];
        const expectedVal = referenceOutputs[tcNum];
        const shortInput = tc.input.length > 50 ? tc.input.slice(0, 50) + "..." : tc.input;

        if (expectedVal === undefined) {
          this.output.appendLine(`[MultiTest] TC${tcNum} skipped: reference produced no output`);
          results.push({ name: `Test ${tcNum}: ${shortInput}`, pass: false, expected: "(reference failed)", got: got ?? "(no output)" });
          continue;
        }
        if (got === undefined) {
          results.push({ name: `Test ${tcNum}: ${shortInput}`, pass: false, expected: expectedVal, got: "(no output)" });
        } else {
          const pass = normalizeOutput(got, lang) === normalizeOutput(expectedVal, lang);
          results.push({ name: `Test ${tcNum}: ${shortInput}`, pass, expected: expectedVal, got });
        }
      }

      const passCount = results.filter(r => r.pass).length;
      this.output.appendLine(`[MultiTest] ${passCount}/${results.length} test cases passed`);
      return results;
    } catch (e: any) {
      this.output.appendLine(`[MultiTest] Error: ${e?.message || e}`);
      return null;
    }
  }

  private async verifyTestCompiles(cwd: string, lang: string, _testFilename: string): Promise<boolean> {
    try {
      if (lang === "Java") {
        const sep = process.platform === "win32" ? ";" : ":";
        const cp = `.${sep}${JUNIT_JAR}`;
        const result = await runTests({
          workspaceRoot: cwd,
          runner: "custom",
          command: `javac -encoding UTF-8 -cp "${cp}" PracticeTest.java Practice.java`,
          timeoutMs: 15_000,
          writeLog: false,
        });
        if (result.exitCode !== 0) {
          this.output.appendLine(`[TestGen] Compile check failed: ${(result.stderr || "").slice(0, 200)}`);
        }
        return result.exitCode === 0;
      }
      const result = await runTests({
        workspaceRoot: cwd,
        runner: "custom",
        command: `npx tsc --noEmit --skipLibCheck ${_testFilename}`,
        timeoutMs: 15_000,
        writeLog: false,
      });
      return result.exitCode === 0;
    } catch {
      return true;
    }
  }

  private async runCode(): Promise<string> {
    if (this.currentPractice?.lang === "SQL") {
      return await runSQL();
    }

    if (!this.currentPractice) {
      throw new Error(t("msg.noPractice"));
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) {
      throw new Error(t("msg.noWorkspace"));
    }

    const lang = this.currentPractice.lang;
    await Promise.all(
      vscode.workspace.textDocuments
        .filter(doc => doc.isDirty)
        .map(doc => doc.save())
    );

    const workspaceRoot = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR).fsPath;
    let command: string;
    let cleanup: string | undefined;
    if (lang === "Java") {
      if (!(await checkJdk())) {
        await promptJdkInstall();
        throw new Error("JDK not found. Install JDK 17+ and restart VS Code.");
      }
      command = "javac -encoding UTF-8 -J-Duser.language=en Practice.java && java -Dfile.encoding=UTF-8 -Duser.language=en Practice";
    } else {
      const ts = buildTsRunCommand(workspaceRoot, "Practice.ts");
      command = ts.command;
      cleanup = ts.cleanup;
    }

    const result = await runTests({
      workspaceRoot,
      runner: "custom",
      command,
      timeoutMs: 15_000,
      writeLog: false,
    });

    if (cleanup) { try { fs.unlinkSync(cleanup); } catch {} }

    this.output.appendLine(`[TestEngine] custom "${command}" => exit=${result.exitCode}, ${result.durationMs}ms`);

    if (result.timedOut) {
      return t("msg.timeout");
    }

    const output = result.stderr
      ? `${result.stdout}\n${result.stderr}`
      : result.stdout || "(no output)";

    return output;
  }

  private checkOutputResult(output: string, currentFileCode?: string): { pass: boolean; testResults?: { name: string; pass: boolean; expected: string; got: string }[] } {
    if (!this.currentPractice) {
      return { pass: false };
    }
    return checkOutput(output, this.currentPractice, this.output, currentFileCode);
  }

  private async runPracticeTests(): Promise<{ name: string; pass: boolean; expected: string; got: string }[] | null> {
    if (!this.currentPractice?.testFile) { return null; }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) { return null; }

    const workspaceRoot = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR).fsPath;
    const lang = this.currentPractice.lang;

    if (lang === "Java") {
      const sep = process.platform === "win32" ? ";" : ":";
      const cp = `.${sep}${JUNIT_JAR}`;

      const compile = await runTests({
        workspaceRoot,
        runner: "custom",
        command: `javac -encoding UTF-8 -cp "${cp}" PracticeTest.java Practice.java`,
        timeoutMs: 15_000,
        writeLog: false,
      });

      if (compile.exitCode !== 0) {
        this.output.appendLine(`[JUnit] Compile failed: ${(compile.stderr || "").slice(0, 300)}`);
        return [{ name: "JUnit: Compile", pass: false, expected: "Pass", got: (compile.stderr || "").slice(0, 150) }];
      }

      this.post({ type: "toast", kind: "info", text: "Running JUnit tests..." });
      const result = await runTests({
        workspaceRoot,
        runner: "custom",
        command: `java -jar ${JUNIT_JAR} -cp . --select-class PracticeTest --details tree`,
        timeoutMs: 30_000,
        writeLog: false,
      });

      this.output.appendLine(`[JUnit] exit=${result.exitCode}, ${result.durationMs}ms`);
      if (result.stderr) { this.output.appendLine(`[JUnit] stderr: ${result.stderr.slice(0, 300)}`); }
      if (result.stdout) { this.output.appendLine(`[JUnit] stdout: ${result.stdout.slice(0, 300)}`); }

      const combined = (result.stdout || "") + "\n" + (result.stderr || "");
      const tests: { name: string; pass: boolean; expected: string; got: string }[] = [];

      const passPattern = /[✔✓√]\s+(.+)/g;
      const failPattern = /[✘✗×]\s+(.+)/g;
      let m;
      while ((m = passPattern.exec(combined)) !== null) {
        tests.push({ name: `JUnit: ${m[1].trim()}`, pass: true, expected: "Pass", got: "Pass" });
      }
      while ((m = failPattern.exec(combined)) !== null) {
        tests.push({ name: `JUnit: ${m[1].trim()}`, pass: false, expected: "Pass", got: "Failed" });
      }

      if (tests.length > 0) { return tests; }

      if (result.passed) {
        return [{ name: "JUnit: All Tests", pass: true, expected: "Pass", got: "Pass" }];
      } else {
        const errSnippet = combined.slice(0, 200);
        return [{ name: "JUnit: Test Suite", pass: false, expected: "Pass", got: errSnippet || "Tests failed" }];
      }
    }

    if (lang === "TypeScript") {
      const result = await runTests({
        workspaceRoot,
        runner: "ts-vitest",
        timeoutMs: 30_000,
        writeLog: false,
      });

      this.output.appendLine(`[Vitest] exit=${result.exitCode}, ${result.durationMs}ms`);

      const combined = result.stdout + "\n" + result.stderr;
      const summary = parseVitestOutput(combined);

      if (summary.testCases.length > 0) {
        return vitestToTestResults(summary);
      }

      if (result.passed) {
        return [{ name: "Vitest: All Tests", pass: true, expected: "Pass", got: "Pass" }];
      } else {
        const errSnippet = (result.stderr || result.stdout || "").slice(0, 200);
        return [{ name: "Vitest: Test Suite", pass: false, expected: "Pass", got: errSnippet || "Tests failed" }];
      }
    }

    return null;
  }

  private buildContext(): HandlerContext {
    const self = this;
    return {
      view: this.view!,
      context: this.context,
      output: this.output,

      get currentPractice() { return self.currentPractice; },
      setCurrentPractice: (p) => { this.currentPractice = p; },

      progressTracker: this.progressTracker,
      chatPanelManager: this.chatPanelManager,

      generationId: this.generationId,
      bumpGenerationId: () => ++this.generationId,
      practiceHistory: this.practiceHistory,

      currentLevel: this.currentLevel,
      setLevel: (l) => { this.currentLevel = l; },

      get isGenerating() { return self.isGenerating; },
      setGenerating: (v) => { this.isGenerating = v; },
      get isRunning() { return self.isRunning; },
      setRunning: (v) => { this.isRunning = v; },

      practiceStartTime: this.practiceStartTime,
      hintUsed: this.hintUsed,
      chatOpened: this.chatOpened,
      judgeAttempts: this.judgeAttempts,
      practiceSkipped: this.practiceSkipped,
      setSessionFlag: (flag: string, value: boolean | number) => {
        switch (flag) {
          case "hintUsed": this.hintUsed = value as boolean; break;
          case "chatOpened": this.chatOpened = value as boolean; break;
          case "practiceSkipped": this.practiceSkipped = value as boolean; break;
          case "judgeAttempts": this.judgeAttempts = value as number; break;
        }
      },
      resetSessionTracking: () => this.resetSessionTracking(),
      calculateXP: () => this.calculateXP(),
      getXPBreakdown: () => this.getXPBreakdown(),

      post: (msg) => this.post(msg),

      runCode: () => this.runCode(),
      verifySolutionOutput: (code, lang) => this.verifySolutionOutput(code, lang),
      runPracticeTests: () => this.runPracticeTests(),
      runMultiTestCases: (sc, st, tc, l, sol) => this.runMultiTestCases(sc, st, tc, l, sol),
      verifyTestCompiles: (cwd, lang, fn) => this.verifyTestCompiles(cwd, lang, fn),
      checkOutputResult: (output, code?) => this.checkOutputResult(output, code),

      explainPanel: this.explainPanel,
      setExplainPanel: (p) => { this.explainPanel = p; },
      schemaPanel: this.schemaPanel,
      setSchemaPanel: (p) => { this.schemaPanel = p; },
      apiPreviewPanel: this.apiPreviewPanel,
      setApiPreviewPanel: (p) => { this.apiPreviewPanel = p; },
      crossLangDecorationType: this.crossLangDecorationType,
      setCrossLangDecorationType: (t) => { this.crossLangDecorationType = t; },
    };
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;

    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "dist")],
    };

    view.webview.html = this.getHtml();

    const ALLOWED_MSG_TYPES = new Set([
      "ready", "generate", "levelUp", "similarPractice", "run", "judge",
      "teachMe", "openChat", "quickSolve", "hintViewed", "addHints",
      "showSolution", "alternativeMethods", "openAltMethod", "crossLanguage",
      "openApiPreview", "openCrossLang", "getProgress", "rateDifficulty",
      "setUiLang", "saveSettings", "getCustomPractices", "deleteCustomPractice", "resetProgress",
      "generateCustom", "loadingProgress", "toggleGhostMode", "setForceOffline"
    ]);

    view.webview.onDidReceiveMessage(async (msg: WebviewMessage) => {
      if (!this.view) return;
      if (!msg?.type || !ALLOWED_MSG_TYPES.has(msg.type)) {
        this.output.appendLine(`[Security] Rejected unknown message type: ${msg?.type}`);
        return;
      }

      const ctx = this.buildContext();

      switch (msg.type) {
        // Settings & init
        case "ready":               return handleReady(ctx);
        case "getProgress":         return handleGetProgress(ctx, msg);
        case "rateDifficulty":      return handleRateDifficulty(ctx, msg);
        case "setUiLang":           return handleSetUiLang(ctx, msg);
        case "saveSettings":        return handleSaveSettings(ctx, msg);
        case "setForceOffline":     setForceOffline(!!msg.forceOffline); return;
        case "getCustomPractices":  return handleGetCustomPractices(ctx);
        case "deleteCustomPractice": return handleDeleteCustomPractice(ctx, msg);
        case "resetProgress":       return handleResetProgress(ctx);

        // Generation
        case "generate":
        case "levelUp":
        case "similarPractice":     return handleGenerate(ctx, msg);
        case "generateCustom":      return handleGenerateCustom(ctx, msg);

        // Execution
        case "run":                 return handleRun(ctx);
        case "judge":               return handleJudge(ctx);

        // AI features
        case "teachMe":             return handleTeachMe(ctx);
        case "openChat":            return handleOpenChat(ctx);
        case "quickSolve":          return handleQuickSolve(ctx);
        case "hintViewed":          return handleHintViewed(ctx);
        case "addHints":            return handleAddHints(ctx);
        case "showSolution":        return handleShowSolution(ctx);
        case "alternativeMethods":  return handleAlternativeMethods(ctx);
        case "openAltMethod":       return handleOpenAltMethod(ctx, msg);
        case "crossLanguage":       return handleCrossLanguage(ctx, msg);
        case "openApiPreview":      return handleOpenApiPreview(ctx);
        case "openCrossLang":       return handleOpenCrossLang(ctx, msg);

        // Ghost Text teaching mode
        case "toggleGhostMode":     return this.handleToggleGhostMode();
      }
    });
  }

  private async handleToggleGhostMode(): Promise<void> {
    if (!this.ghostProvider) return;

    if (this.ghostProvider.isActive()) {
      this.ghostProvider.deactivate();
      this.post({ type: "toast", kind: "ok", text: t("ghost.deactivated") });
      return;
    }

    if (!this.currentPractice?.solutionCode) {
      this.post({ type: "toast", kind: "warn", text: t("ghost.noSolution") });
      return;
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) return;

    const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, practiceFilename(this.currentPractice.lang));
    this.ghostProvider.activate(this.currentPractice.solutionCode, fileUri, this.currentPractice.code);
    this.post({ type: "toast", kind: "ok", text: t("ghost.activated") });
  }

  private static USE_BUNDLED_WEBVIEW = true;

  private getHtml(): string {
    if (!CodePracticeAppView.USE_BUNDLED_WEBVIEW) {
      return getWebviewHtml(getNonce());
    }
    const nonce = getNonce();
    const scriptUri = this.view!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview.js")
    );
    return buildWebviewHtml(nonce, scriptUri.toString());
  }
}
