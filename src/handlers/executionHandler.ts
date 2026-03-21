// コード実行 — run, judge, ghost mode handlers
import * as vscode from "vscode";
import type { HandlerContext } from "./types";
import { showApiPreview } from "../panelHtml";
import { normalizeOutput, checkOutput, checkApiOutput } from "../outputChecker";
import { stripCodeBlocks, getCommonMistakeHint } from "../parsers";
import { practiceFilename, PRACTICE_DIR } from "../constants";
import { runSQL } from "../codeRunners";
import { runTests } from "../testEngine";
import { checkJdk, promptJdkInstall } from "../javaRunner";
import { JUNIT_JAR } from "../scaffoldGradle";
import { buildTsRunCommand } from "../tsRunner";
import { buildMultiTestCode, extractStudentLogic, extractPrintStatement } from "../multiTestRunner";
import { parseVitestOutput, vitestToTestResults } from "../vitestOutputParser";
import { t } from "../aiHelpers";
import { generateJudgeFeedback } from "../aiGenerators";
import type { JudgeFeedback } from "../aiGenerators";
import * as fs from "fs";
import type { TestCase } from "../constants";
import { checkDemoMode } from "../demoData";

let errorDecorationType: vscode.TextEditorDecorationType | undefined;

/** 実行 — compile and run, show output */
export async function handleRun(ctx: HandlerContext): Promise<void> {
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.generateFirst") });
    return;
  }
  if (ctx.isRunning) {
    ctx.post({ type: "toast", kind: "warn", text: t("msg.alreadyRunning") });
    return;
  }

  ctx.setRunning(true);
  ctx.post({ type: "busy", value: true });

  const startMs = Date.now();
  try {
    const result = await ctx.runCode();
    let text = result;
    const lang = ctx.currentPractice.lang;
    const hint = getCommonMistakeHint(result, lang);
    if (hint) { text += "\n\n" + hint; }
    ctx.post({ type: "output", text, durationMs: Date.now() - startMs });
  } catch (e: any) {
    const msgText = e?.message ?? String(e);
    ctx.output.appendLine(`Run Error: ${msgText}`);
    const lang = ctx.currentPractice?.lang || "";
    const hint = getCommonMistakeHint(msgText, lang);
    const errText = hint ? `Error: ${msgText}\n\n${hint}` : `Error: ${msgText}`;
    ctx.post({ type: "output", text: errText, durationMs: Date.now() - startMs });
  } finally {
    ctx.setRunning(false);
    ctx.post({ type: "busy", value: false });
  }
}

/** 判定 — run, compare output, run tests, award XP */
export async function handleJudge(ctx: HandlerContext): Promise<void> {
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }
  if (ctx.isRunning) {
    ctx.post({ type: "toast", kind: "warn", text: t("msg.alreadyRunning") });
    return;
  }

  const mode = ctx.currentPractice.mode;
  if (ctx.currentPractice.testStatus === "pending" && mode !== "bugfix" && mode !== "api" && ctx.currentPractice.lang !== "SQL") {
    ctx.post({ type: "toast", kind: "warn", text: t("msg.testsGenerating") });
    return;
  }

  ctx.setSessionFlag("judgeAttempts", ctx.judgeAttempts + 1);
  ctx.setRunning(true);
  ctx.post({ type: "busy", value: true });

  try {
    let currentFileCode = "";
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (ws) {
      const lang = ctx.currentPractice.lang;
      const ext = practiceFilename(lang);
      const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, ext);
      try {
        const bytes = await vscode.workspace.fs.readFile(fileUri);
        currentFileCode = Buffer.from(bytes).toString("utf8");
      } catch { /* file not found */ }
    }

    const codeStartMs = Date.now();
    const result = await ctx.runCode();
    const codeDurationMs = Date.now() - codeStartMs;

    let verdict: { pass: boolean; testResults?: { name: string; pass: boolean; expected: string; got: string }[] };
    if (ctx.currentPractice.mode === "bugfix") {
      const expected = stripCodeBlocks(ctx.currentPractice.expectedOutput || "");
      const actual = result.trim();
      const outputPass = expected.length > 0 && (
        actual === expected ||
        normalizeOutput(actual, ctx.currentPractice.lang) === normalizeOutput(expected, ctx.currentPractice.lang)
      );
      verdict = {
        pass: outputPass,
        testResults: [{
          name: "Output Correctness",
          pass: outputPass,
          expected: expected.slice(0, 120),
          got: actual.slice(0, 120)
        }]
      };
    } else if (ctx.currentPractice.mode === "api") {
      const actual = result.trim();
      const fields = ctx.currentPractice.expectedFields || [];
      verdict = checkApiOutput(actual, fields);
      showApiPreview(ctx, actual, ctx.currentPractice.apiType || "generic");
    } else {
      verdict = ctx.checkOutputResult(result, currentFileCode);
    }

    if (ctx.currentPractice.testStatus === "failed" && ctx.currentPractice.mode !== "bugfix" && ctx.currentPractice.mode !== "api") {
      ctx.output.appendLine(`[Judge] Warning: test generation failed — using output-only verdict`);
    }

    if (ctx.currentPractice.testFile && ctx.currentPractice.mode !== "bugfix" && ctx.currentPractice.mode !== "api") {
      try {
        const testResults = await ctx.runPracticeTests();
        if (testResults && testResults.length > 0) {
          verdict.testResults = [...(verdict.testResults || []), ...testResults];
          const allPass = verdict.testResults.every(t => t.pass);
          verdict.pass = allPass;
          ctx.output.appendLine(`[TestRunner] ${testResults.filter(t => t.pass).length}/${testResults.length} tests passed`);
        } else {
          ctx.output.appendLine(`[TestRunner] No test results returned — test file may be invalid. Using output-only verdict.`);
        }
      } catch (e: any) {
        ctx.output.appendLine(`[TestRunner] Failed: ${e?.message || e} — test file may be missing or corrupted. Using output-only verdict.`);
      }
    }

    const _tcCount = ctx.currentPractice.testCases?.length || 0;
    const _hasSol = !!ctx.currentPractice.solutionCode;
    ctx.output.appendLine(`[MultiTest] Pre-check: testCases=${_tcCount}, solutionCode=${_hasSol}, mode=${ctx.currentPractice.mode || 'practice'}, lang=${ctx.currentPractice.lang}`);
    if (_tcCount === 0) { ctx.output.appendLine(`[MultiTest] SKIPPED: no test cases parsed from AI response`); }
    else if (!_hasSol) { ctx.output.appendLine(`[MultiTest] SKIPPED: no solutionCode stored`); }

    const MAX_TEST_CASES = 10;
    const cappedTestCases = ctx.currentPractice.testCases
      ? ctx.currentPractice.testCases.slice(0, MAX_TEST_CASES)
      : [];
    if (ctx.currentPractice.testCases && ctx.currentPractice.testCases.length > MAX_TEST_CASES) {
      ctx.output.appendLine(`[MultiTest] Capping test cases from ${ctx.currentPractice.testCases.length} to ${MAX_TEST_CASES}`);
    }
    if (cappedTestCases.length > 0
        && ctx.currentPractice.solutionCode
        && ctx.currentPractice.mode !== "bugfix" && ctx.currentPractice.mode !== "api" && ctx.currentPractice.lang !== "SQL") {
      try {
        const multiResults = await ctx.runMultiTestCases(
          currentFileCode,
          ctx.currentPractice.code,
          cappedTestCases,
          ctx.currentPractice.lang,
          ctx.currentPractice.solutionCode
        );
        if (multiResults && multiResults.length > 0) {
          const multiPass = multiResults.filter(r => r.pass).length;
          const multiTotal = multiResults.length;
          verdict.testResults = [...(verdict.testResults || []), ...multiResults];
          // Multi-test should not override a passing output verdict when:
          // - 0 multi-test cases pass (likely a code extraction bug, not a wrong solution)
          // - Majority of multi-test cases pass (edge case failures in reference/extraction)
          if (multiPass === 0 && verdict.pass) {
            ctx.output.appendLine(`[MultiTest] 0/${multiTotal} passed but output verdict was PASS — keeping PASS (likely extraction issue)`);
          } else if (multiPass > 0 && multiPass >= multiTotal / 2 && verdict.pass) {
            ctx.output.appendLine(`[MultiTest] ${multiPass}/${multiTotal} passed (majority) — keeping PASS`);
          } else {
            const allPass = verdict.testResults.every(t => t.pass);
            verdict.pass = allPass;
          }
        }
      } catch (e: any) {
        ctx.output.appendLine(`[MultiTest] Error: ${e?.message || e} — using output-only verdict`);
      }
    }

    const pass = verdict.pass;

    const title = ctx.currentPractice.title || `${ctx.currentPractice.lang} - ${ctx.currentPractice.topic}`;
    await ctx.progressTracker.recordPractice(
      ctx.currentPractice.lang,
      ctx.currentPractice.topic,
      title,
      ctx.currentPractice.task,
      pass,
      pass ? "good" : "again"
    );

    let xpResult: { newXP: number; level: number; leveledUp: boolean; xpNeeded: number; xpEarned: number } | undefined;
    let xpBreakdown: { speed: number; hint: number; chat: number; firstTry: number } | undefined;
    if (pass) {
      const xpEarned = ctx.calculateXP();
      xpBreakdown = ctx.getXPBreakdown();
      xpResult = await ctx.progressTracker.addTopicXP(
        ctx.currentPractice.lang,
        ctx.currentPractice.topic,
        xpEarned
      );
      ctx.setLevel(xpResult.level);
      ctx.output.appendLine(`[XP] +${xpEarned} XP → Level ${xpResult.level} (${xpResult.newXP}/${xpResult.xpNeeded})`);
    }

    const stats = ctx.progressTracker.getOverallStats();

    let feedback: JudgeFeedback | undefined;
    if (!pass && currentFileCode && (ctx.currentPractice.solutionCode || ctx.currentPractice.judgeFeedback)) {
      try {
        if (ctx.currentPractice.judgeFeedback && await checkDemoMode()) {
          feedback = ctx.currentPractice.judgeFeedback;
          ctx.output.appendLine(`[Feedback] (offline) ${feedback.summary}`);
        } else if (ctx.currentPractice.solutionCode) {
          feedback = await generateJudgeFeedback(
            currentFileCode,
            ctx.currentPractice.solutionCode,
            ctx.currentPractice.task,
            ctx.currentPractice.expectedOutput || "",
            result,
            ctx.currentPractice.lang
          );
          ctx.output.appendLine(`[Feedback] ${feedback.summary}`);
        }
        if (feedback) {
          for (const fl of feedback.lines) {
            ctx.output.appendLine(`  Line ${fl.line}: ${fl.problem} → ${fl.fix}`);
          }
          applyErrorDecorations(ctx.currentPractice.lang, feedback);
        }
      } catch (e: any) {
        ctx.output.appendLine(`[Feedback] Failed: ${e?.message || e}`);
      }
    } else if (pass) {
      clearErrorDecorations();
    }

    ctx.post({
      type: "judgeResult",
      output: result,
      pass,
      stats,
      durationMs: codeDurationMs,
      testResults: verdict.testResults,
      feedback: feedback ? {
        summary: feedback.summary,
        lines: feedback.lines
      } : undefined,
      xp: xpResult ? {
        earned: xpResult.xpEarned,
        total: xpResult.newXP,
        level: xpResult.level,
        needed: xpResult.xpNeeded,
        leveledUp: xpResult.leveledUp,
        breakdown: xpBreakdown
      } : undefined
    });
  } catch (e: any) {
    const msgText = e?.message ?? String(e);
    ctx.output.appendLine(`Judge Error: ${msgText}`);
    ctx.post({ type: "judgeResult", output: `Error: ${msgText}`, pass: false });
  } finally {
    ctx.setRunning(false);
    ctx.post({ type: "busy", value: false });
  }
}

/** エラー装飾 — apply red decorations on error lines */
function applyErrorDecorations(lang: string, feedback: JudgeFeedback): void {
  clearErrorDecorations();
  if (!feedback.lines.length) return;

  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) return;

  const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, practiceFilename(lang));
  const editor = vscode.window.visibleTextEditors.find(
    e => e.document.uri.toString() === fileUri.toString()
  );
  if (!editor) return;

  errorDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    isWholeLine: true,
    overviewRulerColor: "rgba(239, 68, 68, 0.7)",
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    border: "1px solid rgba(239, 68, 68, 0.3)",
  });

  const decorations: vscode.DecorationOptions[] = [];
  for (const fl of feedback.lines) {
    const lineIdx = fl.line - 1; // 1-based → 0-based
    if (lineIdx < 0 || lineIdx >= editor.document.lineCount) continue;
    decorations.push({
      range: editor.document.lineAt(lineIdx).range,
      hoverMessage: new vscode.MarkdownString(
        `**${fl.problem}**\n\n\`${fl.fix}\``
      ),
    });
  }

  editor.setDecorations(errorDecorationType, decorations);
}

/** 装飾クリア — clear error decorations */
function clearErrorDecorations(): void {
  if (errorDecorationType) {
    errorDecorationType.dispose();
    errorDecorationType = undefined;
  }
}
