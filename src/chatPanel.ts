// AIチャット — chat panel manager
import * as vscode from "vscode";
import * as crypto from "crypto";
import { makeAiRequest, getResponseLang, getLangInstruction, t } from "./aiHelpers";
import { PracticeData, practiceFilename, PRACTICE_DIR } from "./constants";
import { parseMeta, normalizeJavaPractice, stripCodeBlocks, escapeHtml } from "./parsers";

/** ホストデリゲート — host delegate for run/judge/file access */
export interface ChatHostDelegate {
  runCode(): Promise<string>;
  judgeCode(): Promise<{ pass: boolean; output: string; testResults?: { name: string; pass: boolean; expected: string; got: string }[] }>;
  writeAndOpenFile(code: string, lang: string): Promise<void>;
}

interface ChatSession {
  id: string;
  title: string;
  lang: string;
  topic: string;
  createdAt: string;
  messages: { role: string; text: string }[];
}

interface ChatSessionSummary {
  id: string;
  title: string;
  lang: string;
  createdAt: string;
  messageCount: number;
}

/** チャットパネル — AI chat panel manager */
export class ChatPanelManager {
  private chatPanel?: vscode.WebviewPanel;
  private chatMessages: { role: string; text: string; msgType?: string; data?: any }[] = [];
  private host?: ChatHostDelegate;
  private currentChatPractice?: PracticeData;

  // Session state
  private sessionListTimer?: ReturnType<typeof setTimeout>;
  private currentSessionId?: string;
  private currentSessionTitle?: string;
  private currentSessionLang?: string;
  private currentSessionTopic?: string;
  private currentSessionCreatedAt?: string;

  constructor(host?: ChatHostDelegate) {
    this.host = host;
  }

  /** 現在の練習取得 — get active chat practice */
  getCurrentChatPractice(): PracticeData | undefined {
    return this.currentChatPractice;
  }

  private getChatsDirUri(): vscode.Uri | undefined {
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) { return undefined; }
    return vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, "_chats");
  }

  private startNewSession(practice: PracticeData | undefined): void {
    this.currentSessionId = String(Date.now());
    this.currentSessionCreatedAt = new Date().toISOString();
    this.currentSessionTitle = practice?.title || `${practice?.lang || "General"} - ${practice?.topic || "Chat"}`;
    this.currentSessionLang = practice?.lang || "";
    this.currentSessionTopic = practice?.topic || "";
    this.chatMessages = [];
  }

  private async saveSession(): Promise<void> {
    if (!this.currentSessionId || this.chatMessages.length === 0) { return; }
    const dir = this.getChatsDirUri();
    if (!dir) { return; }

    try {
      await vscode.workspace.fs.createDirectory(dir);
      const session: ChatSession = {
        id: this.currentSessionId,
        title: this.currentSessionTitle || "Chat",
        lang: this.currentSessionLang || "",
        topic: this.currentSessionTopic || "",
        createdAt: this.currentSessionCreatedAt || new Date().toISOString(),
        messages: [...this.chatMessages]
      };
      const fileUri = vscode.Uri.joinPath(dir, `${this.currentSessionId}.json`);
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(JSON.stringify(session, null, 2), "utf8"));
    } catch { /* ignore write errors */ }
  }

  private async loadSession(id: string): Promise<void> {
    // Validate session ID to prevent path traversal
    if (!/^\d+$/.test(id)) { return; }
    const dir = this.getChatsDirUri();
    if (!dir) { return; }

    try {
      const fileUri = vscode.Uri.joinPath(dir, `${id}.json`);
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      const session: ChatSession = JSON.parse(Buffer.from(bytes).toString("utf8"));

      this.currentSessionId = session.id;
      this.currentSessionTitle = session.title;
      this.currentSessionLang = session.lang;
      this.currentSessionTopic = session.topic;
      this.currentSessionCreatedAt = session.createdAt;
      this.chatMessages = session.messages;

      this.chatPanel?.webview.postMessage({
        type: "loadMessages",
        messages: session.messages,
        title: session.title
      });
    } catch { /* file not found or parse error */ }
  }

  private async listSessions(): Promise<ChatSessionSummary[]> {
    const dir = this.getChatsDirUri();
    if (!dir) { return []; }

    try {
      const entries = await vscode.workspace.fs.readDirectory(dir);
      const summaries: ChatSessionSummary[] = [];

      for (const [name, type] of entries) {
        if (type !== vscode.FileType.File || !name.endsWith(".json")) { continue; }
        try {
          const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(dir, name));
          const session: ChatSession = JSON.parse(Buffer.from(bytes).toString("utf8"));
          summaries.push({
            id: session.id,
            title: session.title,
            lang: session.lang,
            createdAt: session.createdAt,
            messageCount: session.messages.length
          });
        } catch { /* skip corrupt files */ }
      }

      summaries.sort((a, b) => Number(b.id) - Number(a.id));
      return summaries;
    } catch {
      return [];
    }
  }

  private async sendSessionList(): Promise<void> {
    const sessions = await this.listSessions();
    this.chatPanel?.webview.postMessage({ type: "sessionList", sessions, activeId: this.currentSessionId });
  }

  /** チャット質問処理 — handle user question via AI */
  async handleChatQuestion(
    question: string,
    lang: string,
    topic: string,
    currentPractice: PracticeData | undefined
  ): Promise<string> {
    let currentCode = "";
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (ws) {
      const ext = practiceFilename(lang);
      try {
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, ext));
        currentCode = Buffer.from(bytes).toString("utf8");
      } catch { /* no file */ }
    }

    const practiceContext = currentPractice
      ? `Topic: ${currentPractice.topic}\nTask: ${currentPractice.task}\nExpected Output: ${currentPractice.expectedOutput || "N/A"}\nStudent's Current Code:\n\`\`\`${lang.toLowerCase()}\n${currentCode || currentPractice.code || "N/A"}\n\`\`\``
      : `Language: ${lang}, Topic: ${topic}`;

    const systemPrompt = `You are a coding tutor teaching ${lang}. ${getLangInstruction()}
The student will ask you questions. Explain clearly and concisely. Show code examples.
Keep answers short (3-5 sentences). Use backticks for code examples.`;

    const userPrompt = `Current exercise:\n${practiceContext}\n\nStudent asks: "${question}"`;

    return await makeAiRequest(systemPrompt, userPrompt);
  }

  /** 練習生成 — generate practice from chat request */
  private async generatePracticeFromChat(userPrompt: string, lang: string): Promise<void> {
    const systemPrompt = `You are a coding practice generator for ${lang}. ${getLangInstruction()}
Generate a practice exercise based on the user's request.
Return in this EXACT format:

TITLE: <short title>
TASK: <clear task description for a beginner, 2-4 sentences>
EXPECTED_OUTPUT: <what the correct solution should print>
HINT: <one helpful hint>

\`\`\`${lang.toLowerCase()}
<starter code with TODO comments where the student needs to write code>
\`\`\`

Rules:
- Starter code must compile/run but produce wrong or no output
- Leave the core logic as TODO comments
- Add helpful inline comments for beginners
- The task should be solvable in 5-15 minutes`;

    const response = await makeAiRequest(systemPrompt, userPrompt);

    // Parse the response
    const meta = parseMeta(response);

    // Extract code block
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    let starterCode = codeMatch ? codeMatch[1].trim() : "";

    if (!starterCode || !meta.task) {
      throw new Error("Could not generate a valid practice from this request.");
    }

    if (lang === "Java") {
      starterCode = normalizeJavaPractice(starterCode);
    }

    // Build practice data
    const practice: PracticeData = {
      lang,
      topic: "Chat Practice",
      task: meta.task,
      code: starterCode,
      expectedOutput: meta.expectedOutput,
      title: meta.title || "Chat Practice",
      hint: meta.hint
    };

    this.currentChatPractice = practice;

    // Write file and open in editor
    if (this.host) {
      await this.host.writeAndOpenFile(starterCode, lang);
    }

    // Send practice card to webview
    this.chatPanel?.webview.postMessage({
      type: "practiceCard",
      title: practice.title,
      task: practice.task,
      lang,
      hint: practice.hint || ""
    });

    // Add to chat messages for persistence
    this.chatMessages.push({
      role: "ai",
      text: `Practice: ${practice.title}\n${practice.task}`,
      msgType: "practiceCard",
      data: { title: practice.title, task: practice.task, lang, hint: practice.hint || "" }
    });
  }

  /** パネル表示 — open or reveal the chat panel */
  openChatPanel(
    currentPractice: PracticeData | undefined
  ): void {
    if (this.chatPanel) {
      this.chatPanel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    this.chatPanel = vscode.window.createWebviewPanel(
      "codepracticeChat",
      "AI Chat",
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    const task = currentPractice?.task || "No practice loaded";
    const lang = currentPractice?.lang || "Java";
    const title = currentPractice?.title || `${lang} Practice`;

    // Start a new session for this practice
    this.startNewSession(currentPractice);

    const nonce = crypto.randomBytes(16).toString("base64");
    const chatT: Record<string, string> = {};
    for (const k of [
      "chat.history", "chat.newChat", "chat.noChats", "chat.emptyMsg", "chat.emptyChips",
      "chat.placeholder", "chat.send", "chat.hint", "chat.explain", "chat.generatePractice",
      "chat.thinking", "chat.generating", "chat.running", "chat.judging", "chat.thinkingGeneric",
      "chat.output", "chat.pass", "chat.fail", "chat.run", "chat.judge",
      "chat.copy", "chat.copied", "chat.noMessages", "chat.msgs",
      "chat.hintPrompt", "chat.explainPrompt", "chat.generatePrompt"
    ]) { chatT[k] = t(k); }
    this.chatPanel.webview.html = getChatPanelHtml(title, task, lang, nonce, chatT);

    // Send session list after a tick (webview needs to initialize first)
    if (this.sessionListTimer) { clearTimeout(this.sessionListTimer); }
    this.sessionListTimer = setTimeout(() => this.sendSessionList().catch(() => {}), 100);

    const ALLOWED_CHAT_MSGS = new Set([
      "chatMsg", "chatRun", "chatJudge", "loadSession", "newSession", "deleteSession"
    ]);
    const messageDisposable = this.chatPanel.webview.onDidReceiveMessage(async (msg: any) => {
      if (!msg?.type || !ALLOWED_CHAT_MSGS.has(msg.type)) { return; }
      if (msg.type === "chatMsg") {
        const question = msg.text;
        const activeLang = this.currentChatPractice?.lang || currentPractice?.lang || "Java";
        this.chatMessages.push({ role: "user", text: question });

        // Detect practice generation request
        const isPracticeReq = /\b(give|generate|create|make|ver|olustur|yap|oluştur)\b.*\b(practice|exercise|problem|soru|al[ıi][sş]t[ıi]rma|challenge)\b/i.test(question)
          || /\b(practice|exercise|soru|al[ıi][sş]t[ıi]rma)\b.*\b(about|on|for|with|ver|yap|olustur|oluştur)\b/i.test(question);

        if (isPracticeReq) {
          this.chatPanel?.webview.postMessage({ type: "chatThinking", action: "generate" });
          try {
            await this.generatePracticeFromChat(question, activeLang);
            await this.saveSession();
            await this.sendSessionList();
          } catch (e: any) {
            this.chatPanel?.webview.postMessage({ type: "chatError", text: e?.message || String(e) });
          }
          return;
        }

        // Normal Q&A
        try {
          const activePractice = this.currentChatPractice || currentPractice;
          const answer = await this.handleChatQuestion(
            question,
            activeLang,
            activePractice?.topic || "General",
            activePractice
          );
          this.chatMessages.push({ role: "ai", text: answer });
          this.chatPanel?.webview.postMessage({ type: "chatResponse", answer });

          await this.saveSession();
          await this.sendSessionList();
        } catch (e: any) {
          this.chatPanel?.webview.postMessage({ type: "chatResponse", answer: "Error: " + (e?.message || String(e)) });
        }
      }

      if (msg.type === "chatRun") {
        if (!this.host) { return; }
        this.chatPanel?.webview.postMessage({ type: "chatThinking", action: "run" });
        try {
          const output = await this.host.runCode();
          this.chatPanel?.webview.postMessage({ type: "chatRunResult", output });
          this.chatMessages.push({ role: "ai", text: output, msgType: "runResult" });
          await this.saveSession();
        } catch (e: any) {
          this.chatPanel?.webview.postMessage({ type: "chatRunResult", output: "Error: " + (e?.message || String(e)) });
        }
      }

      if (msg.type === "chatJudge") {
        if (!this.host) { return; }
        this.chatPanel?.webview.postMessage({ type: "chatThinking", action: "judge" });
        try {
          const result = await this.host.judgeCode();
          this.chatPanel?.webview.postMessage({
            type: "chatJudgeResult",
            pass: result.pass,
            output: result.output,
            testResults: result.testResults
          });
          this.chatMessages.push({
            role: "ai",
            text: result.pass ? "PASS" : "FAIL",
            msgType: "judgeResult",
            data: { pass: result.pass, output: result.output }
          });
          await this.saveSession();
        } catch (e: any) {
          this.chatPanel?.webview.postMessage({ type: "chatJudgeResult", pass: false, output: "Error: " + (e?.message || String(e)) });
        }
      }

      if (msg.type === "loadSession") {
        await this.loadSession(msg.id);
      }

      if (msg.type === "newSession") {
        try {
          await this.saveSession();
          this.startNewSession(currentPractice);
          this.currentChatPractice = undefined;
          this.chatPanel?.webview.postMessage({ type: "clearChat" });
          await this.sendSessionList();
        } catch (e: any) {
          console.warn(`[Chat] newSession error: ${e?.message || e}`);
        }
      }

      if (msg.type === "deleteSession") {
        try {
          const delId = String(msg.id || "");
          if (!/^\d+$/.test(delId)) { return; } // prevent path traversal
          const dir = this.getChatsDirUri();
          if (dir) {
            try {
              await vscode.workspace.fs.delete(vscode.Uri.joinPath(dir, `${delId}.json`));
            } catch { /* ignore */ }
          }
          await this.sendSessionList();
        } catch (e: any) {
          console.warn(`[Chat] deleteSession error: ${e?.message || e}`);
        }
      }
    });

    this.chatPanel.onDidDispose(async () => {
      if (this.sessionListTimer) { clearTimeout(this.sessionListTimer); }
      messageDisposable.dispose();
      try { await this.saveSession(); } catch { /* best effort on dispose */ }
      this.chatPanel = undefined;
    });
  }

  /** コンテキスト更新 — update chat context for new practice */
  async updateChatContext(currentPractice: PracticeData | undefined): Promise<void> {
    if (!this.chatPanel || !currentPractice) { return; }

    // Save previous session before switching
    await this.saveSession();

    // Start a new session
    this.startNewSession(currentPractice);

    this.chatPanel.webview.postMessage({
      type: "contextUpdate",
      title: currentPractice.title || `${currentPractice.lang} Practice`,
      task: currentPractice.task,
      lang: currentPractice.lang
    });

    // Clear chat UI and refresh session list
    this.chatPanel.webview.postMessage({ type: "clearChat" });
    await this.sendSessionList();
  }
}

function getChatPanelHtml(title: string, task: string, lang: string, nonce: string, chatT: Record<string, string>): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <style nonce="${nonce}">
    :root {
      --accent: #3B82F6;
      --accent-hover: #2563EB;
      --accent-soft: rgba(59,130,246,0.10);
      --card-border: var(--vscode-widget-border, rgba(128,128,128,0.12));
      --surface: rgba(128,128,128,0.04);
      --surface-hover: rgba(128,128,128,0.08);
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --mono: var(--vscode-editor-font-family, "Cascadia Code", "Fira Code", Consolas, monospace);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: transparent;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-size: 13px;
      height: 100vh;
      overflow: hidden;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.18); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.35); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .layout {
      display: flex;
      height: 100vh;
    }

    /* History sidebar */
    .history-panel {
      width: 210px;
      min-width: 0;
      border-right: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
      transition: width 0.2s cubic-bezier(0.4,0,0.2,1);
      background: var(--surface);
    }
    .history-panel.collapsed {
      width: 0;
      border-right: none;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 10px;
      font-weight: 600;
      font-size: 10px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      border-bottom: 1px solid var(--card-border);
      flex-shrink: 0;
    }
    .history-header button {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 14px;
      line-height: 24px;
      text-align: center;
      transition: background 0.15s;
    }
    .history-header button:hover { background: var(--accent-hover); }
    .history-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px;
    }
    .history-item {
      padding: 8px 10px;
      cursor: pointer;
      font-size: 11px;
      border-radius: var(--radius-sm);
      margin-bottom: 2px;
      transition: all 0.15s;
    }
    .history-item:hover {
      background: var(--surface-hover);
    }
    .history-item.active {
      background: var(--accent-soft);
      border-left: 3px solid var(--accent);
    }
    .history-item .hi-title {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
    }
    .history-item .hi-meta {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 3px;
      opacity: 0.7;
    }
    .history-empty {
      padding: 20px 10px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      opacity: 0.6;
    }

    /* Toggle button */
    .history-toggle {
      position: absolute;
      left: 206px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      background: var(--surface);
      border: 1px solid var(--card-border);
      border-left: none;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      padding: 10px 4px;
      font-size: 10px;
      line-height: 1;
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .history-toggle:hover { background: var(--surface-hover); color: var(--accent); }

    /* Chat area */
    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .context-bar {
      padding: 10px 16px;
      background: var(--accent-soft);
      border-bottom: 1px solid var(--card-border);
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      flex-shrink: 0;
    }
    .context-title {
      font-weight: 700;
      font-size: 12px;
      color: var(--accent);
      margin-bottom: 3px;
    }
    .context-task {
      font-size: 11px;
      line-height: 1.45;
      max-height: 42px;
      overflow: hidden;
      opacity: 0.8;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .msg {
      margin-bottom: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-lg);
      font-size: 13px;
      line-height: 1.6;
      max-width: 88%;
      animation: fadeIn 0.25s ease;
    }
    .msg.user {
      background: var(--accent);
      color: #fff;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }
    .msg.user code {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }
    .msg.ai {
      background: var(--surface);
      border: 1px solid var(--card-border);
      margin-right: auto;
      border-bottom-left-radius: 4px;
    }
    .msg code {
      background: var(--vscode-textCodeBlock-background, rgba(110,118,129,0.15));
      color: var(--accent);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--mono);
      font-size: 12px;
    }
    .msg pre {
      background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.12));
      padding: 10px 12px;
      border-radius: var(--radius-md);
      margin: 8px 0;
      overflow-x: auto;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.5;
      border: 1px solid var(--card-border);
    }
    .msg pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border-radius: 0;
    }
    .msg strong { font-weight: 700; }
    .msg em { font-style: italic; opacity: 0.9; }
    .msg ul, .msg ol { margin: 6px 0; padding-left: 20px; }
    .msg li { margin: 3px 0; }
    .empty {
      text-align: center;
      color: var(--vscode-descriptionForeground);
      padding: 48px 24px;
      font-size: 12px;
      line-height: 1.7;
      opacity: 0.6;
    }
    .input-area {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--card-border);
      flex-shrink: 0;
      background: var(--surface);
    }
    .input-area input {
      flex: 1;
      font-family: inherit;
      font-size: 13px;
      padding: 8px 12px;
      height: 36px;
      background: var(--vscode-input-background);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      color: var(--vscode-input-foreground);
      outline: none;
      transition: border-color 0.15s;
    }
    .input-area input:hover { border-color: rgba(128,128,128,0.3); }
    .input-area input:focus { border-color: var(--accent); }
    .input-area input::placeholder { color: var(--vscode-input-placeholderForeground); opacity: 0.6; }
    .input-area button {
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 18px;
      height: 36px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 0.15s;
      box-shadow: 0 1px 3px rgba(59,130,246,0.2);
    }
    .input-area button:hover { background: var(--accent-hover); box-shadow: 0 2px 6px rgba(59,130,246,0.3); }
    .input-area button:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .typing {
      color: var(--accent);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 16px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes typingDots {
      0%, 80% { opacity: 0.3; }
      40% { opacity: 1; }
    }

    /* Practice card */
    .practice-card {
      background: var(--accent-soft);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      margin: 8px 0;
      animation: fadeIn 0.25s ease;
    }
    .pc-title { font-weight: 700; font-size: 13px; color: var(--accent); margin-bottom: 6px; }
    .pc-task { font-size: 12px; line-height: 1.5; color: var(--vscode-foreground); opacity: 0.85; }
    .pc-hint { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 6px; font-style: italic; }
    .pc-actions { display: flex; gap: 8px; margin-top: 10px; }
    .pc-btn {
      font-family: inherit;
      font-size: 11px;
      padding: 5px 14px;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s;
    }
    .pc-btn.run { background: var(--surface-hover); color: var(--vscode-foreground); border: 1px solid var(--card-border); }
    .pc-btn.run:hover { background: rgba(128,128,128,0.15); }
    .pc-btn.judge { background: var(--accent); color: #fff; }
    .pc-btn.judge:hover { background: var(--accent-hover); }

    /* Judge result card */
    .judge-card {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      margin: 8px 0;
      animation: fadeIn 0.25s ease;
    }
    .judge-card.pass { background: rgba(74,186,106,0.12); border-left: 3px solid #4aba6a; }
    .judge-card.fail { background: rgba(229,83,75,0.10); border-left: 3px solid #e5534b; }
    .jc-verdict { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
    .judge-card.pass .jc-verdict { color: #4aba6a; }
    .judge-card.fail .jc-verdict { color: #e5534b; }

    /* Output block */
    .output-block {
      background: rgba(0,0,0,0.15);
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      font-family: var(--mono);
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 4px;
    }

    /* Quick action chips */
    .quick-chips {
      display: flex;
      gap: 6px;
      padding: 6px 16px 10px 16px;
      flex-wrap: wrap;
      flex-shrink: 0;
      background: var(--surface);
    }
    .quick-chip {
      font-family: inherit;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      background: transparent;
      border: 1px solid var(--card-border);
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      transition: all 0.15s;
    }
    .quick-chip:hover { background: var(--surface-hover); color: var(--vscode-foreground); border-color: var(--accent); }

    /* Copy button on code blocks */
    .code-wrap { position: relative; }
    .copy-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      font-family: inherit;
      font-size: 10px;
      padding: 2px 8px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 3px;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .code-wrap:hover .copy-btn { opacity: 1; }
    .copy-btn:hover { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
  </style>
</head>
<body>
  <div class="layout">
    <!-- History sidebar -->
    <div class="history-panel" id="historyPanel">
      <div class="history-header">
        <span>${escapeHtml(chatT["chat.history"])}</span>
        <button id="newChatBtn" title="${escapeHtml(chatT["chat.newChat"])}">+</button>
      </div>
      <div class="history-list" id="historyList">
        <div class="history-empty">${escapeHtml(chatT["chat.noChats"])}</div>
      </div>
    </div>

    <button class="history-toggle" id="historyToggle" title="Toggle history">&#x25C0;</button>

    <!-- Chat area -->
    <div class="chat-area">
      <div class="context-bar">
        <div class="context-title" id="ctxTitle">${escapeHtml(title)}</div>
        <div class="context-task" id="ctxTask">${escapeHtml(task)}</div>
      </div>
      <div class="messages" id="messages">
        <div class="empty">${escapeHtml(chatT["chat.emptyMsg"]).replace(/\n/g, "<br>")}</div>
      </div>
      <div class="input-area">
        <input type="text" id="chatInput" placeholder="${escapeHtml(chatT["chat.placeholder"])}" />
        <button id="sendBtn">${escapeHtml(chatT["chat.send"])}</button>
      </div>
      <div class="quick-chips">
        <button class="quick-chip" data-action="hint">\u{1f4a1} ${escapeHtml(chatT["chat.hint"])}</button>
        <button class="quick-chip" data-action="explain">\u{1f50d} ${escapeHtml(chatT["chat.explain"])}</button>
        <button class="quick-chip" data-action="generate">\u{1f4dd} ${escapeHtml(chatT["chat.generatePractice"])}</button>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const _t = ${JSON.stringify(chatT)};
    const messagesEl = document.getElementById("messages");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const historyList = document.getElementById("historyList");
    const historyPanel = document.getElementById("historyPanel");
    const historyToggle = document.getElementById("historyToggle");

    function escapeHtml(t) {
      return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    function formatMsg(text) {
      let html = escapeHtml(text);
      // Code blocks (triple backtick) — wrap with copy button
      html = html.replace(/\\\`\\\`\\\`(\\w*)\\n([\\s\\S]*?)\\\`\\\`\\\`/g, '<div class="code-wrap"><button class="copy-btn">' + _t["chat.copy"] + '</button><pre>$2</pre></div>');
      html = html.replace(/\`\`\`(\\w*)\\n?([\\s\\S]*?)\`\`\`/g, '<div class="code-wrap"><button class="copy-btn">' + _t["chat.copy"] + '</button><pre>$2</pre></div>');
      // Inline code
      html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
      // Bold (**text**)
      html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
      // Italic (*text*)
      html = html.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
      // Bullet lists (- item or * item)
      html = html.replace(/^[\\-\\*]\\s+(.+)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*<\\/li>)/gs, '<ul style="margin:4px 0;padding-left:18px;">$1</ul>');
      // Numbered lists (1. item)
      html = html.replace(/^(\\d+)\\.\\s+(.+)$/gm, '<li>$2</li>');
      // Headers (### text)
      html = html.replace(/^###\\s+(.+)$/gm, '<strong style="font-size:13px;display:block;margin:6px 0 2px;">$1</strong>');
      html = html.replace(/^##\\s+(.+)$/gm, '<strong style="font-size:14px;display:block;margin:8px 0 3px;">$1</strong>');
      // Line breaks
      html = html.replace(/\\n/g, "<br>");
      // Clean up double <br> after block elements
      html = html.replace(/<\\/pre><\\/div><br>/g, '</pre></div>');
      html = html.replace(/<\\/pre><br>/g, '</pre>');
      html = html.replace(/<\\/ul><br>/g, '</ul>');
      return html;
    }

    function addPracticeCard(data) {
      var empty = messagesEl.querySelector(".empty");
      if (empty) empty.remove();
      var div = document.createElement("div");
      div.className = "practice-card";
      var hintHtml = data.hint ? '<div class="pc-hint">💡 ' + escapeHtml(data.hint) + '</div>' : '';
      div.innerHTML = '<div class="pc-title">📝 ' + escapeHtml(data.title) + '</div>'
        + '<div class="pc-task">' + escapeHtml(data.task) + '</div>'
        + hintHtml
        + '<div class="pc-actions">'
        + '<button class="pc-btn run" id="chatRunBtn">\u25b6 ' + escapeHtml(_t["chat.run"]) + '</button>'
        + '<button class="pc-btn judge" id="chatJudgeBtn">\u2696 ' + escapeHtml(_t["chat.judge"]) + '</button>'
        + '</div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addRunResult(output) {
      var div = document.createElement("div");
      div.className = "msg ai";
      div.innerHTML = '<div style="font-size:11px;font-weight:600;margin-bottom:4px;opacity:0.7">\u25b6 ' + escapeHtml(_t["chat.output"]) + '</div>'
        + '<div class="output-block">' + escapeHtml(output) + '</div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addJudgeResult(data) {
      var div = document.createElement("div");
      div.className = "judge-card " + (data.pass ? "pass" : "fail");
      var icon = data.pass ? "\u2713" : "\u2717";
      var label = data.pass ? _t["chat.pass"] : _t["chat.fail"];
      div.innerHTML = '<div class="jc-verdict">' + icon + ' ' + label + '</div>'
        + '<div class="output-block">' + escapeHtml(data.output || "") + '</div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeTyping() {
      var typing = document.getElementById("typingIndicator");
      if (typing) typing.remove();
      sendBtn.disabled = false;
      chatInput.disabled = false;
    }

    function showThinking(label) {
      var empty = messagesEl.querySelector(".empty");
      if (empty) empty.remove();
      var existing = document.getElementById("typingIndicator");
      if (existing) existing.remove();
      var typing = document.createElement("div");
      typing.className = "typing";
      typing.id = "typingIndicator";
      typing.textContent = label;
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(role, text) {
      var empty = messagesEl.querySelector(".empty");
      if (empty) empty.remove();

      var div = document.createElement("div");
      div.className = "msg " + role;
      div.innerHTML = formatMsg(text);
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function send() {
      var text = chatInput.value.trim();
      if (!text) return;
      addMessage("user", text);
      chatInput.value = "";
      sendBtn.disabled = true;
      chatInput.disabled = true;

      var typing = document.createElement("div");
      typing.className = "typing";
      typing.id = "typingIndicator";
      typing.textContent = _t["chat.thinking"];
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      vscode.postMessage({ type: "chatMsg", text: text });
    }

    sendBtn.addEventListener("click", send);
    chatInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });

    function renderSessions(sessions, activeId) {
      historyList.innerHTML = "";
      if (!sessions || sessions.length === 0) {
        historyList.innerHTML = '<div class="history-empty">' + escapeHtml(_t["chat.noChats"]) + '</div>';
        return;
      }
      for (var i = 0; i < sessions.length; i++) {
        (function(s) {
          var div = document.createElement("div");
          div.className = "history-item" + (s.id === activeId ? " active" : "");
          var d = new Date(s.createdAt);
          var dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
          div.innerHTML = '<div class="hi-title">' + escapeHtml(s.title) + '</div>'
            + '<div class="hi-meta">' + escapeHtml(s.lang + " \\u00b7 " + s.messageCount + " " + _t["chat.msgs"] + " \\u00b7 " + dateStr) + '</div>';
          div.addEventListener("click", function() {
            vscode.postMessage({ type: "loadSession", id: s.id });
            var items = document.querySelectorAll(".history-item");
            for (var j = 0; j < items.length; j++) items[j].classList.remove("active");
            div.classList.add("active");
          });
          historyList.appendChild(div);
        })(sessions[i]);
      }
    }

    document.getElementById("newChatBtn").addEventListener("click", function() {
      vscode.postMessage({ type: "newSession" });
    });

    historyToggle.addEventListener("click", function() {
      historyPanel.classList.toggle("collapsed");
      if (historyPanel.classList.contains("collapsed")) {
        historyToggle.innerHTML = "&#x25B6;";
        historyToggle.style.left = "0";
      } else {
        historyToggle.innerHTML = "&#x25C0;";
        historyToggle.style.left = "206px";
      }
    });

    document.querySelectorAll(".quick-chip").forEach(function(chip) {
      chip.addEventListener("click", function() {
        var action = this.dataset.action;
        if (action === "generate") chatInput.value = _t["chat.generatePrompt"];
        else if (action === "hint") chatInput.value = _t["chat.hintPrompt"];
        else if (action === "explain") chatInput.value = _t["chat.explainPrompt"];
        sendBtn.click();
      });
    });

    document.addEventListener("click", function(e) {
      if (e.target.classList && e.target.classList.contains("copy-btn")) {
        var pre = e.target.parentElement.querySelector("pre");
        if (pre) {
          navigator.clipboard.writeText(pre.textContent).catch(function(){});
          e.target.textContent = _t["chat.copied"];
          setTimeout(function() { e.target.textContent = _t["chat.copy"]; }, 1500);
        }
      }
      // Run / Judge buttons inside practice cards
      if (e.target.id === "chatRunBtn") {
        vscode.postMessage({ type: "chatRun" });
      }
      if (e.target.id === "chatJudgeBtn") {
        vscode.postMessage({ type: "chatJudge" });
      }
    });

    window.addEventListener("message", function(event) {
      var msg = event.data;

      if (msg.type === "chatResponse") {
        removeTyping();
        addMessage("ai", msg.answer);
        chatInput.focus();
      }

      if (msg.type === "practiceCard") {
        removeTyping();
        addPracticeCard(msg);
        chatInput.focus();
      }

      if (msg.type === "chatRunResult") {
        removeTyping();
        addRunResult(msg.output);
      }

      if (msg.type === "chatJudgeResult") {
        removeTyping();
        addJudgeResult(msg);
      }

      if (msg.type === "chatThinking") {
        var labels = { generate: _t["chat.generating"], run: _t["chat.running"], judge: _t["chat.judging"] };
        showThinking(labels[msg.action] || _t["chat.thinkingGeneric"]);
      }

      if (msg.type === "chatError") {
        removeTyping();
        addMessage("ai", "⚠ Error: " + msg.text);
      }

      if (msg.type === "contextUpdate") {
        document.getElementById("ctxTitle").textContent = msg.title;
        document.getElementById("ctxTask").textContent = msg.task;
      }

      if (msg.type === "sessionList") {
        renderSessions(msg.sessions, msg.activeId);
      }

      if (msg.type === "loadMessages") {
        messagesEl.innerHTML = "";
        if (msg.messages && msg.messages.length > 0) {
          for (var i = 0; i < msg.messages.length; i++) {
            var m = msg.messages[i];
            if (m.msgType === "practiceCard" && m.data) {
              addPracticeCard(m.data);
            } else if (m.msgType === "runResult") {
              addRunResult(m.text);
            } else if (m.msgType === "judgeResult" && m.data) {
              addJudgeResult(m.data);
            } else {
              addMessage(m.role, m.text);
            }
          }
        } else {
          messagesEl.innerHTML = '<div class="empty">' + escapeHtml(_t["chat.noMessages"]) + '</div>';
        }
        if (msg.title) {
          document.getElementById("ctxTitle").textContent = msg.title;
        }
      }

      if (msg.type === "clearChat") {
        messagesEl.innerHTML = '<div class="empty">' + _t["chat.emptyChips"].replace(/\\n/g, "<br>") + ' \u{1f447}</div>';
      }
    });

    chatInput.focus();
  </script>
</body>
</html>`;
}
