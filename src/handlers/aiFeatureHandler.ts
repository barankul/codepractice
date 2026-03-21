// AI機能 — hints, solution, alt methods, teach me, cross-lang
import * as vscode from "vscode";
import type { HandlerContext, MsgOf } from "./types";
import { openExplainPanel, showApiPreview as showApiPreviewPanel } from "../panelHtml";
import { runJavaCoreSolution, generateHintedCode, generateAlternativeMethods, generateCrossLanguageCode, generateTeachingExample, fixPracticeCode } from "../aiGenerators";
import { normalizeJavaPractice, unescapeCodeLiterals } from "../parsers";
import { CROSS_LANG_TARGETS, practiceFilename, practiceExt, PRACTICE_DIR } from "../constants";
import { t } from "../aiHelpers";
import { checkDemoMode } from "../demoData";

/** Sanitize error messages for user-facing toasts */
export function friendlyError(e: any): string {
  const msg = e?.message ?? String(e);
  if (/ECONNREFUSED|ConnectException/i.test(msg)) { return t("msg.noConnection") || "Could not connect to AI service. Check your settings."; }
  if (/ETIMEDOUT|timeout/i.test(msg)) { return t("msg.timeout") || "Request timed out. Please try again."; }
  if (/ENOENT|not found/i.test(msg)) { return "Service not found. Check your AI provider settings."; }
  if (/401|403|unauthorized|forbidden/i.test(msg)) { return "Invalid API key. Check your settings."; }
  if (/429|rate.?limit/i.test(msg)) { return "Rate limit reached. Please wait a moment."; }
  if (/fetch failed|network/i.test(msg)) { return "Network error. Check your internet connection."; }
  if (msg.length > 100) { return "An error occurred. Check your AI provider settings."; }
  return msg;
}

/** 教授 — generate teaching example */
export async function handleTeachMe(ctx: HandlerContext): Promise<void> {
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }

  ctx.post({ type: "busy", value: true });

  try {
    ctx.output.appendLine(`TeachMe: ${ctx.currentPractice.lang} / ${ctx.currentPractice.topic}`);

    // Offline mode: show solution as the teaching example
    if (await checkDemoMode() && ctx.currentPractice.solutionCode) {
      openExplainPanel(
        ctx,
        ctx.currentPractice.lang,
        "Solution Walkthrough",
        ctx.currentPractice.task,
        ctx.currentPractice.solutionCode,
        ctx.currentPractice.hint || "Study this solution to understand the approach."
      );
      ctx.post({ type: "busy", value: false });
      return;
    }

    const example = await generateTeachingExample(
      ctx.context,
      ctx.currentPractice.lang,
      ctx.currentPractice.topic,
      ctx.currentPractice.task,
      ctx.currentPractice.code
    );

    openExplainPanel(
      ctx,
      ctx.currentPractice.lang,
      example.exampleTask || "Teaching Example",
      ctx.currentPractice.task,
      example.code,
      example.explanation
    );
  } catch (e: any) {
    const msgText = e?.message ?? String(e);
    ctx.output.appendLine(`ERROR: ${msgText}`);
    ctx.post({ type: "toast", kind: "error", text: friendlyError({ message: msgText }) });
  } finally {
    ctx.post({ type: "busy", value: false });
  }
}

/** チャット開始 — open AI chat panel */
export function handleOpenChat(ctx: HandlerContext): void {
  ctx.setSessionFlag("chatOpened", true);
  ctx.chatPanelManager.openChatPanel(ctx.currentPractice);
}

/** 即時解答 — fill in solution, record as skipped */
export async function handleQuickSolve(ctx: HandlerContext): Promise<void> {
  ctx.setSessionFlag("practiceSkipped", true);
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }

  ctx.post({ type: "busy", value: true });

  try {
    let solutionCode: string;
    let explanation: string;

    // Offline mode: use pre-stored solutionCode
    if (await checkDemoMode() && ctx.currentPractice.solutionCode) {
      solutionCode = ctx.currentPractice.solutionCode;
      explanation = ctx.currentPractice.hint || "Study the solution code to understand the approach.";
    } else {
      const solution = await runJavaCoreSolution(
        ctx.context,
        ctx.currentPractice.lang,
        ctx.currentPractice.topic,
        ctx.currentPractice.task,
        ctx.currentPractice.code
      );
      solutionCode = solution.code;
      explanation = solution.explanation;
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (ws) {
      const ext = practiceFilename(ctx.currentPractice.lang);
      const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, ext);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(solutionCode, "utf8"));

      const doc = await vscode.workspace.openTextDocument(fileUri);
      const editor = await vscode.window.showTextDocument(doc, { preview: false });
      const fullRange = new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(doc.getText().length)
      );
      await editor.edit(eb => eb.replace(fullRange, solutionCode));
    }

    const title = ctx.currentPractice.title || `${ctx.currentPractice.lang} - ${ctx.currentPractice.topic}`;
    await ctx.progressTracker.recordPractice(
      ctx.currentPractice.lang, ctx.currentPractice.topic,
      title, ctx.currentPractice.task, false, "again"
    );

    openExplainPanel(
      ctx,
      ctx.currentPractice.lang,
      ctx.currentPractice.title || ctx.currentPractice.topic,
      ctx.currentPractice.task,
      "",
      explanation
    );

    ctx.post({ type: "skipped" });
  } catch (e: any) {
    const msgText = e?.message ?? String(e);
    ctx.output.appendLine(`ERROR quickSolve: ${msgText}`);
    ctx.post({ type: "toast", kind: "error", text: friendlyError({ message: msgText }) });
  } finally {
    ctx.post({ type: "busy", value: false });
  }
}

/** ヒント閲覧 — track hint usage */
export function handleHintViewed(ctx: HandlerContext): void {
  ctx.setSessionFlag("hintUsed", true);
}

/** ヒント追加 — add hints to code without giving solution */
export async function handleAddHints(ctx: HandlerContext): Promise<void> {
  ctx.setSessionFlag("hintUsed", true);
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }

  ctx.post({ type: "busy", value: true });

  try {
    let hintedCode: string;

    if (await checkDemoMode() && ctx.currentPractice.hint) {
      const lang = ctx.currentPractice.lang;
      const commentPrefix = lang === "SQL" ? "-- " : "// ";
      const hintComment = `${commentPrefix}HINT: ${ctx.currentPractice.hint}`;
      hintedCode = ctx.currentPractice.code.replace(
        /(\/\/\s*YOUR CODE HERE|--\s*Write your)/i,
        `$1\n${hintComment}`
      );
      if (hintedCode === ctx.currentPractice.code) {
        // No marker found, prepend hint
        hintedCode = hintComment + "\n" + ctx.currentPractice.code;
      }
    } else {
      hintedCode = await generateHintedCode(
        ctx.context,
        ctx.currentPractice.lang,
        ctx.currentPractice.task,
        ctx.currentPractice.code
      );
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) {
      ctx.post({ type: "toast", kind: "error", text: t("msg.noWorkspace") });
      return;
    }
    const filename = practiceFilename(ctx.currentPractice.lang);
    const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, filename);

    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(hintedCode, "utf8"));

    const doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc, { preview: false });

    ctx.currentPractice.code = hintedCode;
    ctx.post({ type: "toast", kind: "ok", text: t("msg.hintsAdded") });
  } catch (e: any) {
    const msgText = e?.message ?? String(e);
    ctx.output.appendLine(`ERROR: ${msgText}`);
    ctx.post({ type: "toast", kind: "error", text: friendlyError({ message: msgText }) });
  } finally {
    ctx.post({ type: "busy", value: false });
  }
}

/** 解答表示 — open solution file, record as skipped */
export async function handleShowSolution(ctx: HandlerContext): Promise<void> {
  ctx.setSessionFlag("practiceSkipped", true);
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }

  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noWorkspace") });
    return;
  }

  ctx.post({ type: "busy", value: true });

  try {
    ctx.output.appendLine(`Generating solution for: ${ctx.currentPractice.lang} / ${ctx.currentPractice.topic}`);

    if (await checkDemoMode() && ctx.currentPractice.solutionCode) {
      const lang = ctx.currentPractice.lang;
      const solutionFilename = lang === "TypeScript" ? "Solution.ts" :
                               lang === "SQL" ? "Solution.sql" : "Solution.java";
      const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
      await vscode.workspace.fs.createDirectory(dirUri);
      const fileUri = vscode.Uri.joinPath(dirUri, solutionFilename);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(ctx.currentPractice.solutionCode, "utf8"));
      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
      ctx.post({ type: "toast", kind: "ok", text: t("msg.solutionOpened") });
      ctx.post({ type: "busy", value: false });
      return;
    }

    const solution = await runJavaCoreSolution(
      ctx.context,
      ctx.currentPractice.lang,
      ctx.currentPractice.topic,
      ctx.currentPractice.task,
      ctx.currentPractice.code
    );

    const lang = ctx.currentPractice.lang;
    const solutionFilename = lang === "TypeScript" ? "Solution.ts" :
                             lang === "SQL" ? "Solution.sql" : "Solution.java";

    let solutionCode = solution.code;
    if (lang === "Java") {
      solutionCode = normalizeJavaPractice(solutionCode);
      solutionCode = solutionCode.replace(/^(class\s+)Solution\b/m, "$1Practice");
    }

    if (lang !== "SQL") {
      const verifyOutput = await ctx.verifySolutionOutput(solutionCode, lang);
      if (!verifyOutput) {
        ctx.output.appendLine(`[ShowSolution] Solution failed to run — asking AI to fix...`);
        try {
          const expected = ctx.currentPractice.expectedOutput || "";
          const fixed = await fixPracticeCode(lang, ctx.currentPractice.task, solutionCode, expected, "Compilation/runtime error");
          const fixedCode = lang === "Java" ? normalizeJavaPractice(fixed.code) : fixed.code;
          const fixedOutput = await ctx.verifySolutionOutput(fixedCode, lang);
          if (fixedOutput) {
            solutionCode = fixedCode;
            ctx.output.appendLine(`[ShowSolution] Fix successful — output: "${fixedOutput}"`);
          } else {
            ctx.output.appendLine(`[ShowSolution] Fix still fails — showing original`);
          }
        } catch (e: any) {
          ctx.output.appendLine(`[ShowSolution] Fix error: ${e?.message || e}`);
        }
      } else {
        ctx.output.appendLine(`[ShowSolution] Solution verified — output: "${verifyOutput}"`);
      }
    }

    if (lang === "Java") {
      solutionCode = solutionCode.replace(/^(public\s+class\s+)\w+/m, "$1Solution");
      solutionCode = solutionCode.replace(/^(class\s+)Practice\b/m, "$1Solution");
    }

    const headerComment = lang === "SQL"
      ? `-- SOLUTION: ${ctx.currentPractice.task}\n-- Compare with your Practice.sql\n\n`
      : `// SOLUTION: ${ctx.currentPractice.task}\n// Compare with your Practice file\n\n`;
    solutionCode = headerComment + solutionCode;

    const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR);
    const solutionUri = vscode.Uri.joinPath(dirUri, solutionFilename);
    await vscode.workspace.fs.writeFile(solutionUri, Buffer.from(solutionCode, "utf8"));

    const solutionDoc = await vscode.workspace.openTextDocument(solutionUri);
    await vscode.window.showTextDocument(solutionDoc, {
      viewColumn: vscode.ViewColumn.Beside,
      preview: false
    });

    const title = ctx.currentPractice.title || `${ctx.currentPractice.lang} - ${ctx.currentPractice.topic}`;
    await ctx.progressTracker.recordPractice(
      ctx.currentPractice.lang, ctx.currentPractice.topic,
      title, ctx.currentPractice.task, false, "again"
    );

    ctx.post({ type: "skipped" });
  } catch (e: any) {
    const msgText = e?.message ?? String(e);
    ctx.output.appendLine(`ERROR: ${msgText}`);
    ctx.post({ type: "toast", kind: "error", text: friendlyError({ message: msgText }) });
  } finally {
    ctx.post({ type: "busy", value: false });
  }
}

/** 別解生成 — generate alternative approaches */
export async function handleAlternativeMethods(ctx: HandlerContext): Promise<void> {
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }
  ctx.post({ type: "busy", value: true });
  try {
    if (await checkDemoMode()) {
      if (ctx.currentPractice.altMethods && ctx.currentPractice.altMethods.length > 0) {
        ctx.post({ type: "alternativeMethodsResult", methods: ctx.currentPractice.altMethods });
      } else {
        ctx.post({ type: "toast", kind: "info", text: t("msg.offlineNotAvailable") || "This feature requires an AI provider. Configure one in settings." });
      }
      ctx.post({ type: "busy", value: false });
      return;
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    let currentCode = ctx.currentPractice.code;
    if (ws) {
      const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, practiceFilename(ctx.currentPractice.lang));
      try {
        const bytes = await vscode.workspace.fs.readFile(fileUri);
        currentCode = Buffer.from(bytes).toString("utf8");
      } catch { /* use starter code */ }
    }

    const methods = await generateAlternativeMethods(
      ctx.currentPractice.lang,
      ctx.currentPractice.task,
      currentCode
    );

    ctx.post({ type: "alternativeMethodsResult", methods });
  } catch (e: any) {
    ctx.post({ type: "toast", kind: "error", text: friendlyError(e) });
  } finally {
    ctx.post({ type: "busy", value: false });
  }
}

/** 別解表示 — open alternative method as file */
export async function handleOpenAltMethod(ctx: HandlerContext, msg: MsgOf<"openAltMethod">): Promise<void> {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) { return; }
  try {
    const ext = ctx.currentPractice?.lang === "TypeScript" ? "ts" : "java";
    const safeName = (msg.name as string).replace(/[^a-zA-Z0-9_]/g, "_");
    const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, "_solutions");
    await vscode.workspace.fs.createDirectory(dirUri);

    let codeStr = unescapeCodeLiterals(msg.code as string || "");
    if (codeStr.length > 100 && !codeStr.includes("\n")) {
      codeStr = codeStr
        .replace(/;\s*/g, ";\n")
        .replace(/\{\s*/g, "{\n")
        .replace(/\}\s*/g, "}\n")
        .replace(/import\s/g, "\nimport ");
    }

    const codeLines = codeStr.split("\n");
    const hasIndentation = codeLines.some(l => /^\s{2,}/.test(l) && l.trim().length > 0);
    if (!hasIndentation && codeLines.length > 3) {
      let depth = 0;
      const unit = ext === "java" ? "    " : "  ";
      codeStr = codeLines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) { return ""; }
        if (/^[}\])]+/.test(trimmed)) { depth = Math.max(0, depth - 1); }
        const indented = unit.repeat(depth) + trimmed;
        const opens = (trimmed.match(/\{/g) || []).length;
        const closes = (trimmed.match(/\}/g) || []).length;
        depth = Math.max(0, depth + opens - closes);
        return indented;
      }).join("\n");
    }

    let explStr = msg.explanation as string || "";
    explStr = explStr.replaceAll("\\n", "\n");

    if (ext === "java") {
      codeStr = codeStr.replace(/^\s*package\s+[\w.]+\s*;\s*\n?/m, "");
      codeStr = codeStr.replace(/^(public\s+class\s+)\w+/m, `$1${safeName}`);
    }

    const commentLine = "//";
    const header =
      `${commentLine} ============================================\n` +
      `${commentLine} Alternative Solution: ${msg.name}\n` +
      `${commentLine} ============================================\n` +
      `${commentLine}\n` +
      explStr.split("\n").map((l: string) => `${commentLine} ${l}`).join("\n") +
      `\n${commentLine} ============================================\n\n`;

    const packageLine = ext === "java" ? "package _solutions;\n\n" : "";
    const fileContent = packageLine + header + codeStr;
    const fileUri = vscode.Uri.joinPath(dirUri, `${safeName}.${ext}`);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent, "utf8"));

    const doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: false });
  } catch (e: any) {
    ctx.post({ type: "toast", kind: "error", text: friendlyError(e) });
  }
}

/** 他言語変換 — generate code in a different language */
export async function handleCrossLanguage(ctx: HandlerContext, msg: MsgOf<"crossLanguage">): Promise<void> {
  if (!ctx.currentPractice) {
    ctx.post({ type: "toast", kind: "error", text: t("msg.noPractice") });
    return;
  }
  const targetLang = msg.targetLang as string;
  ctx.post({ type: "busy", value: true });
  try {
    // Offline mode: use pre-stored crossLang translations
    if (await checkDemoMode()) {
      const crossData = ctx.currentPractice.crossLang?.[targetLang]
        || ctx.currentPractice.crossLang?.[targetLang.toLowerCase()];
      if (crossData) {
        ctx.post({ type: "crossLanguageResult", code: crossData.code, highlights: crossData.highlights, targetLang });
      } else {
        ctx.post({ type: "toast", kind: "info", text: t("msg.offlineNotAvailable") || "This feature requires an AI provider. Configure one in settings." });
      }
      return;
    }

    const ws = vscode.workspace.workspaceFolders?.[0];
    let currentCode = ctx.currentPractice.solutionCode || ctx.currentPractice.code;
    if (ws) {
      const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, practiceFilename(ctx.currentPractice.lang));
      try {
        const bytes = await vscode.workspace.fs.readFile(fileUri);
        currentCode = Buffer.from(bytes).toString("utf8");
      } catch { /* use stored code */ }
    }

    const result = await generateCrossLanguageCode(
      ctx.currentPractice.lang,
      targetLang,
      ctx.currentPractice.task,
      currentCode
    );
    ctx.post({ type: "crossLanguageResult", code: result.code, highlights: result.highlights, targetLang });
  } catch (e: any) {
    ctx.post({ type: "toast", kind: "error", text: friendlyError(e) });
  } finally {
    ctx.post({ type: "busy", value: false });
  }
}

/** APIプレビュー — run code and open API preview panel */
export async function handleOpenApiPreview(ctx: HandlerContext): Promise<void> {
  if (ctx.currentPractice?.mode === "api") {
    try {
      const result = await ctx.runCode();
      showApiPreviewPanel(ctx, result.trim(), ctx.currentPractice.apiType || "generic");
    } catch (e: any) {
      showApiPreviewPanel(ctx, `Error: ${e?.message || e}`, "generic");
    }
  }
}

/** 他言語ファイル表示 — open cross-language file with highlights */
export async function handleOpenCrossLang(ctx: HandlerContext, msg: MsgOf<"openCrossLang">): Promise<void> {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) { return; }
  try {
    const targetLang = msg.targetLang as string;
    const targetExt = CROSS_LANG_TARGETS[targetLang] || "txt";
    const dirUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, "_solutions");
    await vscode.workspace.fs.createDirectory(dirUri);

    const codeStr = unescapeCodeLiterals(msg.code as string || "");

    const filename = `CrossLang_${targetLang.replace(/[^a-zA-Z0-9]/g, "")}.${targetExt}`;
    const fileUri = vscode.Uri.joinPath(dirUri, filename);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(codeStr, "utf8"));

    const doc = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: false });

    if (ctx.crossLangDecorationType) {
      ctx.crossLangDecorationType.dispose();
    }

    const highlights = msg.highlights as { lines: number[]; explanation: string }[] || [];
    if (highlights.length > 0) {
      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(30, 100, 220, 0.12)',
        isWholeLine: true,
        overviewRulerColor: 'rgba(30, 100, 220, 0.6)',
        overviewRulerLane: vscode.OverviewRulerLane.Left,
      });
      ctx.setCrossLangDecorationType(decorationType);

      const decorations: vscode.DecorationOptions[] = [];
      for (const h of highlights) {
        const hoverMsg = new vscode.MarkdownString(h.explanation);
        for (const lineNum of h.lines) {
          const lineIdx = lineNum - 1;
          if (lineIdx >= 0 && lineIdx < doc.lineCount) {
            decorations.push({
              range: doc.lineAt(lineIdx).range,
              hoverMessage: hoverMsg,
            });
          }
        }
      }
      editor.setDecorations(decorationType, decorations);
    }
  } catch (e: any) {
    ctx.post({ type: "toast", kind: "error", text: friendlyError(e) });
  }
}
