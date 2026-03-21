// 練習生成 — practice generation handler
import * as vscode from "vscode";
import type { HandlerContext, WebviewMessage, MsgOf } from "./types";
import { showSchemaPanel } from "../panelHtml";
import { parseMeta, normalizeJavaPractice, isValidCodeBlock } from "../parsers";
import { runJavaCore, checkJdk, promptJdkInstall } from "../javaRunner";
import { runJavaCoreSolution, generateBugFromRealCode, generateCustomPractice, generateTestCode, fixPracticeCode, generateApiPractice } from "../aiGenerators";
import type { BugFixResult } from "../aiGenerators";
import { pickRandomEntry, type CodeSize } from "../githubIndex";
import { fetchGitHubCode } from "../githubFetcher";
import { resetDatabase } from "../sqlRunner";
import { ensureJUnitJar, JUNIT_JAR } from "../scaffoldGradle";
import { ensureVitestScaffold } from "../scaffoldVitest";
import { t } from "../aiHelpers";
import { friendlyError } from "./aiFeatureHandler";
import { practiceFilename, PRACTICE_DIR } from "../constants";
import { checkDemoMode, getDemoPractice, invalidateDemoModeCache } from "../demoData";

/** 実コード判定 — check if solution has real logic */
function hasRealSolutionLogic(code: string, starterCode: string): boolean {
  const starterLines = new Set(starterCode.split("\n").map(l => l.trim()));
  const solutionOnly = code.split("\n")
    .filter(l => {
      const t = l.trim();
      if (!t || t === "{" || t === "}" || t === ");") return false;
      if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) return false;
      if (t.startsWith("TODO") || t.includes("YOUR CODE HERE")) return false;
      if (starterLines.has(t)) return false;
      return true;
    });
  return solutionOnly.length >= 1;
}

/** 検証＋修正 — verify output and retry-fix loop */
async function verifyAndFix(
  ctx: HandlerContext,
  code: string,
  lang: string,
  task: string,
  expectedOutput: string,
  label: string
): Promise<{ code: string; output: string }> {
  let solutionCode = lang === "Java" ? normalizeJavaPractice(code) : code;
  let verifiedOutput = expectedOutput;

  const realOutput = await ctx.verifySolutionOutput(solutionCode, lang);

  if (realOutput && realOutput === verifiedOutput) {
    ctx.output.appendLine(`[${label} Verify] Output matches expected: "${realOutput}"`);
    return { code: solutionCode, output: realOutput };
  }

  const MAX_FIX_ATTEMPTS = 2;
  let currentCode = solutionCode;
  let lastError = realOutput || "Compilation/runtime error — no output produced";
  ctx.output.appendLine(`[${label} Fix] Expected "${verifiedOutput}" got "${lastError}" — retrying up to ${MAX_FIX_ATTEMPTS} times...`);
  let fixedOk = false;

  for (let attempt = 1; attempt <= MAX_FIX_ATTEMPTS && !fixedOk; attempt++) {
    try {
      ctx.output.appendLine(`[${label} Fix] Attempt ${attempt}/${MAX_FIX_ATTEMPTS}...`);
      const fixed = await fixPracticeCode(lang, task, currentCode, verifiedOutput, lastError);
      const fixedCode = lang === "Java" ? normalizeJavaPractice(fixed.code) : fixed.code;

      const fixedOutput = await ctx.verifySolutionOutput(fixedCode, lang);
      if (fixedOutput) {
        verifiedOutput = fixedOutput;
        solutionCode = fixedCode;
        fixedOk = true;
        ctx.output.appendLine(`[${label} Fix] Success on attempt ${attempt} — output: "${fixedOutput}"`);
      } else {
        currentCode = fixedCode;
        lastError = "Compilation/runtime error — no output produced";
        ctx.output.appendLine(`[${label} Fix] Attempt ${attempt} failed — still won't compile`);
      }
    } catch (e: any) {
      ctx.output.appendLine(`[${label} Fix] Attempt ${attempt} error: ${e?.message || e}`);
    }
  }

  if (!fixedOk) {
    if (realOutput) {
      verifiedOutput = realOutput;
      ctx.output.appendLine(`[${label} Fix] Could not fix after ${MAX_FIX_ATTEMPTS} attempts — using actual output: "${realOutput}"`);
    } else {
      ctx.output.appendLine(`[${label} Fix] Could not fix after ${MAX_FIX_ATTEMPTS} attempts — using AI expected output: "${verifiedOutput}"`);
    }
  }

  return { code: solutionCode, output: verifiedOutput };
}

const MAX_TEST_GEN_ATTEMPTS = 2;

/** テスト生成＋コンパイル — generate and compile test file */
async function generateAndCompileTest(
  ctx: HandlerContext,
  genId: number,
  dirUri: vscode.Uri,
  lang: string,
  task: string,
  codeForTests: string,
  expectedOutput: string,
): Promise<string | null> {
  if (ctx.generationId !== genId) { return null; }

  const testCode = await generateTestCode(lang, task, codeForTests, expectedOutput);
  if (ctx.generationId !== genId) { return null; }

  if (!testCode || testCode.length <= 50) {
    ctx.output.appendLine(`[TestGen] AI returned insufficient test code`);
    return null;
  }

  const testFilename = lang === "Java" ? "PracticeTest.java" : "Practice.test.ts";
  const testUri = vscode.Uri.joinPath(dirUri, testFilename);
  await vscode.workspace.fs.writeFile(testUri, Buffer.from(testCode, "utf8"));

  const compileOk = await ctx.verifyTestCompiles(dirUri.fsPath, lang, testFilename);
  if (compileOk && ctx.generationId === genId) {
    ctx.output.appendLine(`[TestGen] Wrote ${testFilename} (${testCode.length} chars, compile OK)`);
    return testFilename;
  }

  try { await vscode.workspace.fs.delete(testUri); } catch {}
  ctx.output.appendLine(`[TestGen] Test code doesn't compile — deleted ${testFilename}`);
  return null;
}

/** テスト生成待機 — await test generation with retry */
async function awaitTestGen(
  ctx: HandlerContext,
  genId: number,
  dirUri: vscode.Uri,
  lang: string,
  task: string,
  codeForTests: string,
  expectedOutput: string,
  practice: { testFile?: string; testStatus?: "pending" | "ready" | "failed" }
): Promise<void> {
  if (lang === "SQL") { return; }

  practice.testStatus = "pending";
  ctx.post({ type: "testGenStatus", status: "pending" });

  try {
    ctx.output.appendLine(`[TestGen] Generating tests for ${lang}...`);
    if (lang === "Java") {
      await ensureJUnitJar(dirUri.fsPath, ctx.context.extensionUri.fsPath);
    } else {
      await ensureVitestScaffold(dirUri);
    }

    for (let attempt = 1; attempt <= MAX_TEST_GEN_ATTEMPTS; attempt++) {
      if (ctx.generationId !== genId) {
        ctx.output.appendLine(`[TestGen] Aborted — new practice generated`);
        return;
      }

      ctx.output.appendLine(`[TestGen] Attempt ${attempt}/${MAX_TEST_GEN_ATTEMPTS}...`);
      const testFilename = await generateAndCompileTest(ctx, genId, dirUri, lang, task, codeForTests, expectedOutput);

      if (testFilename) {
        practice.testFile = testFilename;
        practice.testStatus = "ready";
        ctx.post({ type: "testGenStatus", status: "ready" });
        return;
      }
    }

    practice.testStatus = "failed";
    ctx.post({ type: "testGenStatus", status: "failed" });
    ctx.post({ type: "toast", kind: "warn", text: t("msg.testsFailed") });
    ctx.output.appendLine(`[TestGen] All ${MAX_TEST_GEN_ATTEMPTS} attempts failed — output-only judge will be used`);
  } catch (e: any) {
    practice.testStatus = "failed";
    ctx.post({ type: "testGenStatus", status: "failed" });
    ctx.output.appendLine(`[TestGen] Failed: ${e?.message || e} — output-only judge will be used`);
  }
}

type GenerateMsg = MsgOf<"generate"> | MsgOf<"similarPractice"> | MsgOf<"levelUp">;

/** 練習生成 — generate/levelUp/similar practice handler */
export async function handleGenerate(ctx: HandlerContext, msg: GenerateMsg): Promise<void> {
  if (ctx.isGenerating) {
    ctx.post({ type: "toast", kind: "warn", text: t("msg.alreadyGenerating") });
    return;
  }
  ctx.setGenerating(true);
  ctx.resetSessionTracking();

  if (ctx.explainPanel) {
    ctx.explainPanel.dispose();
    ctx.setExplainPanel(undefined);
  }

  const lang = msg.lang;
  let topic = msg.topic;
  const isLevelUp = msg.type === "levelUp";
  const isSimilar = msg.type === "similarPractice";
  const practiceMode = msg.type === "generate" ? (msg.mode || "practice") : "practice";
  const codeSize = (msg.type === "generate" ? (msg.codeSize || "snippet") : "snippet") as CodeSize;

  let multiTopicReason = "";
  if (topic === "__multi__") {
    const smart = ctx.progressTracker.pickSmartTopic(lang);
    topic = smart.topic;
    multiTopicReason = smart.reason;
  }

  if (!lang || !topic) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.pickLangTopic") });
    ctx.setGenerating(false);
    return;
  }

  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.openFolder") });
    ctx.setGenerating(false);
    return;
  }

  if (ctx.currentPractice?.topic !== topic) {
    ctx.setLevel(ctx.progressTracker.getRecommendedLevel(lang, topic));
  } else if (isLevelUp) {
    ctx.setLevel(ctx.currentLevel + 1);
  }

  const thisGenId = ctx.bumpGenerationId();
  ctx.post({ type: "busy", value: true });

  if (await checkDemoMode()) {
    try {
      ctx.output.show(true);
      ctx.output.appendLine(`[OFFLINE] Generate: ${lang} / ${topic} (Level ${ctx.currentLevel})`);
      ctx.post({ type: "loadingProgress", text: "Loading practice..." });

      const demo = getDemoPractice(lang, topic, ctx.currentLevel);
      if (!demo) {
        ctx.post({ type: "toast", kind: "error", text: `No practice available for ${lang} / ${topic}` });
        return;
      }

      const filename = practiceFilename(lang);
      const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dirUri);
      const fileUri = vscode.Uri.joinPath(dirUri, filename);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(demo.code, "utf8"));

      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, { preview: false });

      const topicXP = ctx.progressTracker.getTopicXP(lang, topic);
      ctx.post({
        type: "details",
        details: {
          lang, topic,
          title: demo.title,
          task: demo.task,
          expectedOutput: demo.expectedOutput,
          hint: demo.hint,
          level: demo.level,
          topicXP,
        }
      });

      const practice = {
        lang, topic,
        task: demo.task,
        code: demo.code,
        expectedOutput: demo.expectedOutput,
        title: demo.title,
        hint: demo.hint,
        testCases: demo.testCases,
        solutionCode: demo.solutionCode,
        judgeFeedback: demo.judgeFeedback,
        altMethods: demo.altMethods,
        crossLang: demo.crossLang,
        testFile: undefined as string | undefined,
      };
      ctx.setCurrentPractice(practice);
      await ctx.chatPanelManager.updateChatContext(ctx.currentPractice!);

      ctx.post({ type: "testGenStatus", status: "ready" });

      if (lang === "SQL") { showSchemaPanel(ctx); }

      ctx.output.appendLine(`[OFFLINE] Loaded: "${demo.title}"`);
    } catch (e: any) {
      ctx.output.appendLine(`[OFFLINE] Error: ${e?.message ?? e}`);
      ctx.post({ type: "toast", kind: "error", text: friendlyError(e) });
    } finally {
      ctx.setGenerating(false);
      ctx.post({ type: "busy", value: false });
    }
    return;
  }

  try {
    ctx.output.show(true);
    ctx.output.appendLine(`Generate: ${lang} / ${topic} (Level ${ctx.currentLevel})${isSimilar ? " [SIMILAR]" : ""}${practiceMode === "bugfix" ? " [BUG FIX]" : ""}`);

    if (practiceMode === "bugfix") {
      ctx.post({ type: "loadingProgress", text: t("loading.fetchCode") });
      let effectiveCodeSize = codeSize;
      if (effectiveCodeSize === "codebase" && ctx.currentLevel < 3) {
        effectiveCodeSize = "snippet";
      }
      const entry = pickRandomEntry(lang, topic, ctx.currentLevel, effectiveCodeSize);
      let bugResult: BugFixResult | null = null;

      if (entry) {
        const sourceCode = await fetchGitHubCode(entry, ctx.context);
        if (sourceCode) {
          ctx.post({ type: "loadingProgress", text: t("loading.injectBug") });
          bugResult = await generateBugFromRealCode(
            sourceCode, lang, topic, ctx.currentLevel, entry.repo
          );
        }
      }

      if (!bugResult || !bugResult.buggyCode) {
        ctx.output.appendLine("GitHub fetch failed, falling back to debug JAR");
        const res = await runJavaCore(ctx.context, lang, topic, ctx.currentLevel, [], "debug");
        const parsed = parseMeta(res.meta);
        bugResult = {
          title: parsed.title || `${lang} Bug Fix - ${topic}`,
          description: parsed.description || parsed.task,
          buggyCode: res.content,
          bugHint: parsed.bugHint || parsed.hint || "",
          bugExplanation: parsed.bugExplanation || "",
          expectedOutput: parsed.expectedOutput,
          sourceRepo: "generated",
          filename: res.filename
        };
      }

      const bugTopicXP = ctx.progressTracker.getTopicXP(lang, topic);
      ctx.post({
        type: "details",
        details: {
          lang, topic,
          title: bugResult.title,
          task: bugResult.description,
          expectedOutput: bugResult.expectedOutput,
          hint: bugResult.bugHint,
          bugExplanation: bugResult.bugExplanation,
          sourceRepo: bugResult.sourceRepo,
          level: ctx.currentLevel,
          mode: "bugfix",
          multiTopicReason,
          topicXP: bugTopicXP,
        }
      });

      ctx.post({ type: "loadingProgress", text: t("loading.openBuggy") });
      const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dirUri);
      const fileUri = vscode.Uri.joinPath(dirUri, bugResult.filename);

      let code = bugResult.buggyCode;
      if (lang === "Java") {
        code = normalizeJavaPractice(code);
      }

      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(code, "utf8"));
      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, { preview: false });

      ctx.setCurrentPractice({
        lang, topic,
        task: bugResult.description,
        code,
        expectedOutput: bugResult.expectedOutput,
        title: bugResult.title,
        mode: "bugfix",
        bugExplanation: bugResult.bugExplanation,
        sourceRepo: bugResult.sourceRepo
      });
      await ctx.chatPanelManager.updateChatContext(ctx.currentPractice);

      ctx.practiceHistory.push({ lang, topic, title: bugResult.title, task: bugResult.description });
      if (ctx.practiceHistory.length > 50) {
        ctx.practiceHistory.splice(0, ctx.practiceHistory.length - 50);
      }

      if (lang === "SQL") { showSchemaPanel(ctx); }

    } else if (topic === "API") {
      ctx.post({ type: "loadingProgress", text: t("loading.genApi") });
      ctx.output.appendLine(`[API] Generating API practice for ${lang} level ${ctx.currentLevel}...`);
      const apiResult = await generateApiPractice(lang, ctx.currentLevel);

      const filename = practiceFilename(lang);
      const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dirUri);
      const fileUri = vscode.Uri.joinPath(dirUri, filename);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(apiResult.starterCode, "utf8"));

      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, { preview: false });

      ctx.post({
        type: "details",
        details: {
          lang, topic, title: apiResult.title, task: apiResult.task,
          expectedOutput: apiResult.expectedFields.map(f => `${f}: ...`).join("\n"),
          hint: apiResult.hint,
          level: ctx.currentLevel,
          mode: "api",
        }
      });

      ctx.setCurrentPractice({
        lang, topic, task: apiResult.task, code: apiResult.starterCode,
        expectedOutput: apiResult.expectedFields.join(", "),
        title: apiResult.title, hint: apiResult.hint,
        mode: "api",
        solutionCode: apiResult.solutionCode,
        expectedFields: apiResult.expectedFields,
        apiType: apiResult.apiType,
      });

      ctx.resetSessionTracking();
      ctx.bumpGenerationId();

      ctx.practiceHistory.push({
        lang, topic, title: apiResult.title, task: apiResult.task
      });

      ctx.output.appendLine(`[API] Generated: ${apiResult.title} (type=${apiResult.apiType}, fields=${apiResult.expectedFields.join(",")})`);

    } else {
      let topicHistory = ctx.practiceHistory
        .filter(h => h.lang === lang && h.topic === topic)
        .map(h => h.title)
        .slice(-5);

      if (isSimilar && ctx.currentPractice?.task) {
        topicHistory = [`SIMILAR REQUEST: Generate the SAME type of exercise as "${ctx.currentPractice.task}" but with DIFFERENT numbers/values`];
      }

      if (lang === "SQL") {
        await resetDatabase();
      }

      ctx.post({ type: "loadingProgress", text: t("loading.genCode"), percent: 10 });
      let res = await runJavaCore(ctx.context, lang, topic, ctx.currentLevel, topicHistory);
      let parsed = parseMeta(res.meta);
      let codeOnly = res.content;

      if (!isValidCodeBlock(codeOnly, lang)) {
        ctx.output.appendLine(`[Validate] Starter code failed validation (plain text?) — retrying once...`);
        ctx.output.appendLine(`[Validate] First 100 chars: "${codeOnly.slice(0, 100)}"`);
        // Add failed title to history to force a different generation
        const failedTitle = parsed.title || "FAILED_PLAIN_TEXT";
        const retryHistory = [...topicHistory, failedTitle];
        res = await runJavaCore(ctx.context, lang, topic, ctx.currentLevel, retryHistory);
        parsed = parseMeta(res.meta);
        codeOnly = res.content;
        if (!isValidCodeBlock(codeOnly, lang)) {
          ctx.output.appendLine(`[Validate] Retry also failed — proceeding anyway`);
        }
      }

      ctx.post({ type: "loadingProgress", text: t("loading.genCode"), percent: 60 });
      ctx.output.appendLine(`[Practice] meta first 300 chars: "${(res.meta || "").slice(0, 300)}"`);
      ctx.output.appendLine(`[Practice] parsed.title: "${parsed.title}"`);
      ctx.output.appendLine(`[Practice] parsed.task: "${parsed.task}"`);
      ctx.output.appendLine(`[Practice] parsed.hint: "${parsed.hint}"`);
      const tcRawMatch = (res.meta || "").match(/TEST_CASES:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
      ctx.output.appendLine(`[Practice] Raw TEST_CASES from AI: ${tcRawMatch ? '"' + tcRawMatch[1].trim().slice(0, 500) + '"' : 'NOT FOUND in meta'}`);

      if (lang === "Java") {
        codeOnly = normalizeJavaPractice(codeOnly);
      }

      let verifiedOutput = (res.actualOutput && res.actualOutput.trim()) || parsed.expectedOutput;

      let solutionCode: string | null = null;
      if (lang !== "SQL") {
        // Use AI-generated solutionCode directly if available (skip extra AI call)
        const aiSolution = res.solutionCode && res.solutionCode.trim()
          ? (lang === "Java" ? normalizeJavaPractice(res.solutionCode) : res.solutionCode)
          : null;

        if (aiSolution) {
          ctx.output.appendLine(`[Verify] Using AI solutionCode directly (skipping extra solve call)`);
          ctx.post({ type: "loadingProgress", text: t("loading.verifySolution"), percent: 75 });
          try {
            const result = await verifyAndFix(ctx, aiSolution, lang, parsed.task, verifiedOutput, "Practice");
            solutionCode = result.code;
            verifiedOutput = result.output;
          } catch (e: any) {
            ctx.output.appendLine(`[Verify] AI solutionCode verify failed: ${e?.message || e}`);
          }
        }

        // Fallback: generate solution via separate AI call only if no solutionCode
        if (!solutionCode) {
          try {
            ctx.post({ type: "loadingProgress", text: t("loading.genSolution"), percent: 70 });
            ctx.output.appendLine(`[Verify] No AI solutionCode — solving via separate call...`);
            const solved = await runJavaCoreSolution(ctx.context, lang, topic, parsed.task, codeOnly);
            let solvedCode = lang === "Java" ? normalizeJavaPractice(solved.code) : solved.code;
            ctx.post({ type: "loadingProgress", text: t("loading.verifySolution"), percent: 80 });
            const result = await verifyAndFix(ctx, solvedCode, lang, parsed.task, verifiedOutput, "Practice");
            solutionCode = result.code;
            verifiedOutput = result.output;
          } catch (e: any) {
            ctx.output.appendLine(`[Verify] Fallback solve failed: ${e?.message || e}`);
          }
        }
      } else {
        // SQL: verify solution by running through sql.js — use real output as expectedOutput
        solutionCode = res.solutionCode?.trim() || codeOnly;
        const realOutput = await ctx.verifySolutionOutput(solutionCode, lang);
        if (realOutput) {
          verifiedOutput = realOutput;
          ctx.output.appendLine(`[Verify SQL] Real output captured: "${realOutput.slice(0, 80)}"`);
        } else {
          ctx.output.appendLine(`[Verify SQL] No output — using AI expectedOutput`);
        }
      }

      ctx.post({ type: "loadingProgress", text: t("loading.openFile"), percent: 95 });
      const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dirUri);
      const fileUri = vscode.Uri.joinPath(dirUri, res.filename);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(codeOnly, "utf8"));

      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, { preview: false });

      const topicXP = ctx.progressTracker.getTopicXP(lang, topic);
      ctx.post({
        type: "details",
        details: {
          lang, topic,
          title: parsed.title || `${lang} - ${topic}`,
          task: parsed.task,
          expectedOutput: verifiedOutput,
          hint: parsed.hint,
          level: ctx.currentLevel,
          multiTopicReason,
          topicXP,
        }
      });

      ctx.output.appendLine(`[Practice] testCases: ${parsed.testCases ? parsed.testCases.length + ' found' : 'NONE'}, solutionCode: ${solutionCode ? 'YES (' + solutionCode.length + ' chars)' : 'NO'}`);
      if (parsed.testCases) {
        for (const tc of parsed.testCases) {
          ctx.output.appendLine(`[Practice]   TC: "${tc.input}" -> "${tc.output}"`);
        }
      }

      const practice = { lang, topic, task: parsed.task, code: codeOnly, expectedOutput: verifiedOutput, title: parsed.title, testCases: parsed.testCases, solutionCode: solutionCode || undefined, testFile: undefined as string | undefined };
      ctx.setCurrentPractice(practice);
      await ctx.chatPanelManager.updateChatContext(ctx.currentPractice!);

      ctx.practiceHistory.push({
        lang, topic,
        title: parsed.title || `${lang} - ${topic}`,
        task: parsed.task
      });

      if (ctx.practiceHistory.length > 50) {
        ctx.practiceHistory.splice(0, ctx.practiceHistory.length - 50);
      }

      if (lang === "SQL") { showSchemaPanel(ctx); }

      const isStarterTemplate = /\/\/\s*TODO|\/\*\s*TODO|\bTODO\b|\/\/\s*YOUR\s*CODE\s*HERE|\/\*\s*YOUR\s*CODE\s*HERE/i.test(codeOnly);
      if (!isStarterTemplate) {
        await awaitTestGen(ctx, thisGenId, dirUri, lang, parsed.task, codeOnly, verifiedOutput, practice);
      }
    }
  } catch (e: any) {
    const rawMsg = e?.message ?? String(e);
    ctx.output.appendLine(`ERROR: ${rawMsg}`);
    let userMsg = rawMsg;
    if (rawMsg.includes("spawn") || rawMsg.includes("ENOENT")) {
      userMsg = "Java not found. Install JDK and add to PATH.";
    } else if (rawMsg.includes("timeout") || rawMsg.includes("ETIMEDOUT")) {
      userMsg = "AI request timed out. Check your network.";
    } else if (rawMsg.includes("fetch") || rawMsg.includes("ECONNREFUSED")) {
      userMsg = "Cannot reach AI server. Check settings.";
    } else if (rawMsg.includes("JSON")) {
      userMsg = "AI returned invalid response. Try again.";
    }
    ctx.post({ type: "toast", kind: "error", text: userMsg, retryable: "generate" });
  } finally {
    ctx.setGenerating(false);
    ctx.post({ type: "busy", value: false });
  }
}

/** カスタム練習生成 — generate custom practice from user prompt */
export async function handleGenerateCustom(ctx: HandlerContext, msg: MsgOf<"generateCustom">): Promise<void> {
  if (ctx.isGenerating) {
    ctx.post({ type: "toast", kind: "warn", text: t("msg.alreadyGenerating") });
    return;
  }

  if (await checkDemoMode()) {
    ctx.post({ type: "toast", kind: "warn", text: t("msg.offlineNotAvailable") || "This feature requires an AI provider. Configure one in Settings." });
    return;
  }

  ctx.setGenerating(true);
  const thisGenId = ctx.bumpGenerationId();
  ctx.resetSessionTracking();
  const prompt = String(msg.prompt || "").trim().slice(0, 500);
  const lang = String(msg.lang || "Java");

  if (!prompt) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.describePrompt") });
    ctx.setGenerating(false);
    return;
  }

  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.openFolder") });
    ctx.setGenerating(false);
    return;
  }

  ctx.post({ type: "busy", value: true });

  try {
    ctx.output.show(true);
    ctx.output.appendLine(`Custom Practice: ${lang} / "${prompt.slice(0, 60)}"`);

    const level = ctx.currentLevel || 1;
    ctx.post({ type: "loadingProgress", text: t("loading.genCustom"), percent: 10 });
    let result = await generateCustomPractice(prompt, lang, level);

    if (!result.starterCode) {
      throw new Error("AI did not generate any code");
    }

    if (!isValidCodeBlock(result.starterCode, lang)) {
      ctx.output.appendLine(`[Custom Validate] Starter code failed validation — retrying once...`);
      result = await generateCustomPractice(prompt, lang, level);
      if (!result.starterCode || !isValidCodeBlock(result.starterCode, lang)) {
        ctx.output.appendLine(`[Custom Validate] Retry also failed — proceeding anyway`);
      }
    }

    const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
    await vscode.workspace.fs.createDirectory(dirUri);

    const filename = practiceFilename(lang);
    const fileUri = vscode.Uri.joinPath(dirUri, filename);

    let starterCode = result.starterCode;
    if (lang === "Java") {
      starterCode = normalizeJavaPractice(starterCode);
    }

    let solutionCode = starterCode;
    let expectedOutput = result.expectedOutput;
    ctx.output.appendLine(`[Custom] Starter code length: ${starterCode.length}`);

    if (lang !== "SQL") {
      try {
        ctx.post({ type: "loadingProgress", text: t("loading.genSolution"), percent: 60 });
        ctx.output.appendLine(`[Custom] Solving starter code to get ground-truth output...`);
        const solved = await runJavaCoreSolution(ctx.context, lang, "Custom", result.task, starterCode);
        solutionCode = lang === "Java" ? normalizeJavaPractice(solved.code) : solved.code;
      } catch (e: any) {
        ctx.output.appendLine(`[Custom] quickSolve failed: ${e?.message || e} — using AI solutionCode`);
        solutionCode = result.solutionCode || starterCode;
        if (lang === "Java") { solutionCode = normalizeJavaPractice(solutionCode); }
      }
      ctx.post({ type: "loadingProgress", text: t("loading.verifySolution"), percent: 80 });
      const vfResult = await verifyAndFix(ctx, solutionCode, lang, result.task, expectedOutput, "Custom");
      solutionCode = vfResult.code;
      expectedOutput = vfResult.output;
    } else {
      const realOutput = await ctx.verifySolutionOutput(solutionCode, lang);
      if (realOutput) { expectedOutput = realOutput; }
    }

    ctx.post({ type: "loadingProgress", text: t("loading.openFile"), percent: 95 });
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(starterCode, "utf8"));

    const doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc, { preview: false });

    const customTopicXP = ctx.progressTracker.getTopicXP(lang, "Custom");
    ctx.post({ type: "switchTab", tab: "practice" });
    ctx.post({
      type: "details",
      details: {
        lang,
        topic: "Custom",
        title: result.title,
        task: result.task,
        expectedOutput,
        hint: result.hint,
        level,
        customPrompt: prompt,
        topicXP: customTopicXP
      }
    });

    const practice = { lang, topic: "Custom", task: result.task, code: starterCode, expectedOutput, title: result.title, testFile: undefined as string | undefined };
    ctx.setCurrentPractice(practice);
    await ctx.chatPanelManager.updateChatContext(ctx.currentPractice!);

    const practices = ctx.context.globalState.get<any[]>("codepractice.customPractices") || [];
    practices.push({
      id: Date.now().toString(),
      title: result.title,
      lang,
      prompt,
      task: result.task,
      createdAt: new Date().toISOString()
    });
    if (practices.length > 30) { practices.splice(0, practices.length - 30); }
    await ctx.context.globalState.update("codepractice.customPractices", practices);
    ctx.post({ type: "customPractices", practices });

    await awaitTestGen(ctx, thisGenId, dirUri, lang, result.task, solutionCode, expectedOutput, practice);
  } catch (e: any) {
    const rawMsg = e?.message ?? String(e);
    ctx.output.appendLine(`ERROR: ${rawMsg}`);
    ctx.post({ type: "toast", kind: "error", text: friendlyError(e), retryable: "generate" });
  } finally {
    ctx.setGenerating(false);
    ctx.post({ type: "busy", value: false });
  }
}
