// パネルHTML — HTML templates for explain/schema/API panels
import * as vscode from "vscode";
import { escapeHtml } from "./parsers";

/** 解説HTML — explain panel HTML */
export function getExplainHtml(
  lang: string,
  title: string,
  task: string,
  code: string,
  explanation: string
): string {
  const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fmtExplanation = esc(explanation)
    .replace(/\n/g, "<br>")
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root {
      --bg: var(--vscode-editor-background, #1e1e1e);
      --fg: var(--vscode-editor-foreground, #d4d4d4);
      --muted: var(--vscode-descriptionForeground, #888);
      --accent: var(--vscode-button-background, #0078d4);
      --border: var(--vscode-widget-border, rgba(128,128,128,0.15));
      --code-bg: var(--vscode-textCodeBlock-background, #2d2d2d);
      --mono: var(--vscode-editor-font-family, "Cascadia Code", Consolas, monospace);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      background: var(--bg);
      color: var(--fg);
      padding: 20px 24px;
      line-height: 1.5;
      font-size: 13px;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 3px; }

    .header {
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--fg);
      margin-bottom: 4px;
    }
    .header-meta {
      font-size: 11px;
      color: var(--muted);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .lang-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(0,120,212,0.15);
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .section {
      margin-bottom: 20px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      letter-spacing: 0.03em;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .task-text {
      font-size: 13px;
      color: var(--fg);
      line-height: 1.6;
      padding: 10px 12px;
      background: rgba(128,128,128,0.05);
      border-radius: 4px;
      border-left: 3px solid var(--accent);
    }

    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px 16px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      white-space: pre;
      color: var(--fg);
    }

    .explanation-text {
      font-size: 13px;
      color: var(--fg);
      line-height: 1.7;
      padding: 12px 14px;
      background: rgba(128,128,128,0.04);
      border-radius: 4px;
      border: 1px solid var(--border);
    }
    .explanation-text code {
      background: var(--code-bg);
      padding: 1px 5px;
      border-radius: 3px;
      font-family: var(--mono);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">${esc(title)}</div>
    <div class="header-meta">
      <span class="lang-badge">${esc(lang)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Your Task</div>
    <div class="task-text">${esc(task)}</div>
  </div>

  ${code ? `<div class="section">
    <div class="section-label">Example Code</div>
    <pre class="code-block">${esc(code)}</pre>
  </div>` : ""}

  <div class="section">
    <div class="section-label">How to Apply This</div>
    <div class="explanation-text">${fmtExplanation}</div>
  </div>
</body>
</html>`;
}

/** APIプレビューHTML — API preview panel HTML */
export function getApiPreviewHtml(output: string, apiType: string): string {
  const lines = output.trim().split("\n").filter(l => l.trim());
  const isError = /error|exception|enoent|econnrefused|fetch failed/i.test(output) && lines.length < 5;

  const fields: { label: string; value: string }[] = [];
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < line.length - 1) {
      fields.push({ label: line.slice(0, colonIdx).trim(), value: line.slice(colonIdx + 1).trim() });
    } else if (line.trim()) {
      fields.push({ label: "", value: line.trim() });
    }
  }

  const icons: Record<string, string> = {
    weather: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>',
    joke: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    dog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/></svg>',
    pokemon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><circle cx="12" cy="12" r="10"/><path d="M2 12h7"/><path d="M15 12h7"/><circle cx="12" cy="12" r="3"/></svg>',
    country: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    exchange: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    ip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  };
  const icon = icons[apiType] || icons.country;
  const typeLabel = apiType.charAt(0).toUpperCase() + apiType.slice(1);

  let fieldsHtml = "";
  if (isError) {
    fieldsHtml = `<div class="error-card"><div class="error-icon">!</div><div class="error-text">${escapeHtml(output.trim().slice(0, 300))}</div></div>`;
  } else if (fields.length === 0) {
    fieldsHtml = `<div class="empty">No output to display</div>`;
  } else {
    fieldsHtml = fields.map(f => {
      if (!f.label) {
        return `<div class="field"><span class="val">${escapeHtml(f.value)}</span></div>`;
      }
      const isUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i.test(f.value);
      const valHtml = isUrl
        ? `<img src="${escapeHtml(f.value)}" class="preview-img" alt="${escapeHtml(f.label)}" />`
        : `<span class="val">${escapeHtml(f.value)}</span>`;
      return `<div class="field"><span class="label">${escapeHtml(f.label)}</span>${valHtml}</div>`;
    }).join("");
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root {
      --bg: var(--vscode-editor-background, #1e1e1e);
      --fg: var(--vscode-editor-foreground, #d4d4d4);
      --muted: var(--vscode-descriptionForeground, #888);
      --accent: #3B82F6;
      --accent-soft: rgba(59,130,246,0.10);
      --border: var(--vscode-widget-border, rgba(128,128,128,0.15));
      --surface: rgba(128,128,128,0.06);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      background: var(--bg); color: var(--fg);
      padding: 20px; line-height: 1.6; font-size: 13px;
    }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .header svg { color: var(--accent); }
    .header h2 { font-size: 16px; font-weight: 600; }
    .type-badge {
      background: var(--accent-soft); color: var(--accent);
      font-size: 11px; padding: 2px 8px; border-radius: 10px;
      text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;
    }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 16px; margin-top: 8px;
    }
    .field {
      display: flex; align-items: baseline; gap: 8px;
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .field:last-child { border-bottom: none; }
    .label {
      font-weight: 600; color: var(--accent); min-width: 100px;
      font-size: 12px; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .val { color: var(--fg); word-break: break-word; }
    .preview-img {
      max-width: 200px; max-height: 200px; border-radius: 8px;
      border: 1px solid var(--border); margin-top: 4px;
    }
    .error-card {
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px; padding: 16px; display: flex; align-items: flex-start; gap: 12px;
    }
    .error-icon {
      background: #EF4444; color: white; width: 24px; height: 24px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 14px; flex-shrink: 0;
    }
    .error-text { color: #F87171; white-space: pre-wrap; font-family: monospace; font-size: 12px; }
    .empty { color: var(--muted); text-align: center; padding: 24px; }
    .raw { margin-top: 16px; }
    .raw summary { cursor: pointer; color: var(--muted); font-size: 12px; }
    .raw pre {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; padding: 10px; margin-top: 6px;
      font-size: 11px; white-space: pre-wrap; overflow-x: auto;
      font-family: var(--vscode-editor-font-family, monospace);
    }
  </style>
</head>
<body>
  <div class="header">
    ${icon}
    <h2>API Preview</h2>
    <span class="type-badge">${typeLabel}</span>
  </div>
  <div class="card">
    ${fieldsHtml}
  </div>
  <details class="raw">
    <summary>Raw Output</summary>
    <pre>${escapeHtml(output.trim())}</pre>
  </details>
</body>
</html>`;
}

/** スキーマHTML — SQL schema panel HTML */
export function getSchemaHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root {
      --bg: var(--vscode-editor-background, #1e1e1e);
      --fg: var(--vscode-editor-foreground, #d4d4d4);
      --muted: var(--vscode-descriptionForeground, #888);
      --accent: #3B82F6;
      --accent-soft: rgba(59,130,246,0.10);
      --border: var(--vscode-widget-border, rgba(128,128,128,0.15));
      --surface: rgba(128,128,128,0.06);
      --mono: var(--vscode-editor-font-family, "Cascadia Code", Consolas, monospace);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      background: var(--bg);
      color: var(--fg);
      padding: 16px 18px;
      line-height: 1.5;
      font-size: 13px;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 3px; }

    h2 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 14px;
      color: var(--fg);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    h2 .icon { font-size: 16px; }

    .table-wrap {
      margin-bottom: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .table-name {
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      padding: 6px 10px;
      letter-spacing: 0.03em;
      border-bottom: 1px solid var(--border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--mono);
      font-size: 11px;
    }
    th {
      background: var(--surface);
      font-weight: 700;
      color: var(--fg);
      padding: 5px 8px;
      text-align: left;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
    }
    td {
      padding: 4px 8px;
      color: var(--muted);
      border-bottom: 1px solid rgba(128,128,128,0.06);
      font-size: 10.5px;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(128,128,128,0.04); }

    .fk-note {
      font-size: 10px;
      color: var(--muted);
      padding: 4px 10px 6px;
      opacity: 0.7;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h2><span class="icon">&#128451;</span> Database Schema</h2>

  <div class="table-wrap">
    <div class="table-name">users</div>
    <table>
      <thead><tr><th>id</th><th>name</th><th>email</th><th>age</th><th>city</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Alice</td><td>alice@mail.com</td><td>25</td><td>Tokyo</td></tr>
        <tr><td>2</td><td>Bob</td><td>bob@mail.com</td><td>30</td><td>Osaka</td></tr>
        <tr><td>3</td><td>Charlie</td><td>charlie@mail.com</td><td>22</td><td>Tokyo</td></tr>
        <tr><td>4</td><td>Diana</td><td>diana@mail.com</td><td>28</td><td>Kyoto</td></tr>
        <tr><td>5</td><td>Eve</td><td>eve@mail.com</td><td>35</td><td>Osaka</td></tr>
      </tbody>
    </table>
  </div>

  <div class="table-wrap">
    <div class="table-name">orders</div>
    <table>
      <thead><tr><th>id</th><th>user_id</th><th>product</th><th>amount</th><th>order_date</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>1</td><td>Laptop</td><td>1200</td><td>2024-01-15</td></tr>
        <tr><td>2</td><td>1</td><td>Mouse</td><td>25</td><td>2024-01-16</td></tr>
        <tr><td>3</td><td>2</td><td>Keyboard</td><td>75</td><td>2024-01-17</td></tr>
        <tr><td>4</td><td>3</td><td>Monitor</td><td>300</td><td>2024-01-18</td></tr>
        <tr><td>5</td><td>2</td><td>Laptop</td><td>1200</td><td>2024-01-19</td></tr>
        <tr><td>6</td><td>4</td><td>Headphones</td><td>150</td><td>2024-01-20</td></tr>
      </tbody>
    </table>
    <div class="fk-note">user_id → users.id</div>
  </div>

  <div class="table-wrap">
    <div class="table-name">products</div>
    <table>
      <thead><tr><th>id</th><th>name</th><th>price</th><th>category</th><th>stock</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Laptop</td><td>1200</td><td>Electronics</td><td>50</td></tr>
        <tr><td>2</td><td>Mouse</td><td>25</td><td>Electronics</td><td>200</td></tr>
        <tr><td>3</td><td>Keyboard</td><td>75</td><td>Electronics</td><td>150</td></tr>
        <tr><td>4</td><td>Monitor</td><td>300</td><td>Electronics</td><td>80</td></tr>
        <tr><td>5</td><td>Headphones</td><td>150</td><td>Electronics</td><td>120</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

interface PanelHolder {
  explainPanel: vscode.WebviewPanel | undefined;
  setExplainPanel(p: vscode.WebviewPanel | undefined): void;
  schemaPanel: vscode.WebviewPanel | undefined;
  setSchemaPanel(p: vscode.WebviewPanel | undefined): void;
  apiPreviewPanel: vscode.WebviewPanel | undefined;
  setApiPreviewPanel(p: vscode.WebviewPanel | undefined): void;
}

/** 解説パネル表示 — open explain panel */
export function openExplainPanel(
  holder: PanelHolder,
  lang: string,
  title: string,
  task: string,
  solutionCode: string,
  explanation: string
): void {
  if (holder.explainPanel) {
    holder.explainPanel.webview.html = getExplainHtml(lang, title, task, solutionCode, explanation);
    holder.explainPanel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "codepracticeExplain",
    "Code Explanation",
    vscode.ViewColumn.Beside,
    { enableScripts: false, retainContextWhenHidden: false }
  );

  panel.webview.html = getExplainHtml(lang, title, task, solutionCode, explanation);
  panel.onDidDispose(() => { holder.setExplainPanel(undefined); });
  holder.setExplainPanel(panel);
}

/** スキーマパネル表示 — open schema panel */
export function showSchemaPanel(holder: PanelHolder): void {
  if (holder.schemaPanel) {
    holder.schemaPanel.reveal(vscode.ViewColumn.Beside, true);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "codepracticeSchema",
    "Database Schema",
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: false, retainContextWhenHidden: false }
  );

  panel.webview.html = getSchemaHtml();
  panel.onDidDispose(() => { holder.setSchemaPanel(undefined); });
  holder.setSchemaPanel(panel);
}

/** APIプレビュー表示 — open API preview panel */
export function showApiPreview(holder: PanelHolder, output: string, apiType: string): void {
  if (holder.apiPreviewPanel) {
    holder.apiPreviewPanel.webview.html = getApiPreviewHtml(output, apiType);
    holder.apiPreviewPanel.reveal(vscode.ViewColumn.Beside, true);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "codepracticeApiPreview",
    "API Preview",
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: false, retainContextWhenHidden: false }
  );

  panel.webview.html = getApiPreviewHtml(output, apiType);
  panel.onDidDispose(() => { holder.setApiPreviewPanel(undefined); });
  holder.setApiPreviewPanel(panel);
}
