export function getWebviewHtml(nonce: string): string {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style nonce="${nonce}">
    :root {
      /* Brand accent — clean blue */
      --accent: #3B82F6;
      --accent-hover: #2563EB;
      --accent-soft: rgba(59,130,246,0.10);
      --accent-glow: rgba(59,130,246,0.25);

      /* Status colors — softer, more muted */
      --good: #4aba6a;
      --good-soft: rgba(74,186,106,0.12);
      --bad: #e5534b;
      --bad-soft: rgba(229,83,75,0.10);
      --warn: #d4a03c;
      --warn-soft: rgba(212,160,60,0.12);

      --mono: var(--vscode-editor-font-family, "Cascadia Code", "Fira Code", Consolas, monospace);
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;

      --card-bg: var(--vscode-input-background);
      --card-border: var(--vscode-widget-border, rgba(128,128,128,0.12));
      --surface: rgba(128,128,128,0.04);
      --surface-hover: rgba(128,128,128,0.08);

      --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-med: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
      --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
      --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: transparent;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-size: 13px;
      line-height: 1.5;
      padding: 0 16px 20px 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    /* Refined scrollbar */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background, rgba(128,128,128,0.18));
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, rgba(128,128,128,0.35));
    }
    ::selection {
      background: var(--accent-glow);
    }
    /* Global focus ring */
    button:focus-visible, select:focus-visible, input:focus-visible, textarea:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }
    button:focus:not(:focus-visible) { outline: none; }
    /* Global fade-in for dynamically shown content */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
    .fade-in { animation: fadeIn 0.3s var(--transition-med); }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0 8px;
    }
    .logo {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .logo::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(128,128,128,0.15);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: none;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* UI Language Selector */
    .ui-lang-select {
      font-family: inherit;
      font-size: 11px;
      padding: 2px 6px;
      height: 24px;
      background: var(--surface);
      color: var(--vscode-foreground);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      outline: none;
      transition: border-color var(--transition-fast);
    }
    .ui-lang-select:hover { border-color: var(--accent); }
    .ui-lang-select:focus { border-color: var(--accent); }

    /* Loading Overlay */
    .loading-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--vscode-editor-background, rgba(0,0,0,0.92));
      backdrop-filter: blur(4px);
      z-index: 1000;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .loading-overlay.show { display: flex; animation: fadeIn 0.2s ease; }
    .loading-icon {
      width: 32px; height: 32px;
      border: 2.5px solid rgba(128,128,128,0.16);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: none;
    }
    .loading-text {
      color: var(--vscode-foreground);
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      letter-spacing: 0.01em;
    }
    .topbar-progress {
      width: 100%;
      height: 2px;
      background: transparent;
      overflow: hidden;
      display: none;
    }
    .topbar-progress.active {
      display: block;
      background: rgba(128,128,128,0.1);
    }
    .topbar-progress-inner {
      height: 100%;
      width: 30%;
      background: linear-gradient(90deg, var(--accent), var(--accent-hover));
      border-radius: 1px;
      animation: loading-slide 1.4s ease-in-out infinite;
    }
    .loading-bar {
      width: 200px;
      height: 4px;
      background: rgba(128,128,128,0.15);
      border-radius: 4px;
      overflow: hidden;
    }
    .loading-bar-inner {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--accent), var(--accent-hover));
      border-radius: 4px;
      transition: width 0.6s ease;
    }
    .loading-pct {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      margin-top: 6px;
      opacity: 0.7;
    }
    .loading-tip {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      margin-top: 2px;
      text-align: center;
      max-width: 220px;
      opacity: 0.7;
    }

    /* Skeleton shimmer loading */
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
    .skeleton {
      background: linear-gradient(90deg,
        rgba(128,128,128,0.08) 25%,
        rgba(128,128,128,0.18) 50%,
        rgba(128,128,128,0.08) 75%
      );
      background-size: 400px 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-sm);
    }
    .skeleton-line { height: 12px; margin-bottom: 8px; border-radius: 3px; }
    .skeleton-line.w75 { width: 75%; }
    .skeleton-line.w50 { width: 50%; }
    .skeleton-line.w90 { width: 90%; }
    .skeleton-block { height: 60px; margin-bottom: 8px; }
    .skeleton-title { height: 16px; width: 60%; margin-bottom: 12px; }

    .subtitle {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      margin: 10px 0 6px;
      line-height: 1.5;
      padding-bottom: 4px;
      opacity: 0.8;
    }

    /* Welcome banner */
    .welcome-banner {
      background: var(--accent-soft);
      border: 1px solid var(--accent);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin: 12px 0 8px;
      animation: fadeIn 0.4s var(--transition-med);
    }
    .welcome-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 12px;
    }
    .welcome-steps {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .welcome-step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12.5px;
      line-height: 1.4;
    }
    .welcome-num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .welcome-tip {
      margin-top: 12px;
      padding: 8px 12px;
      background: var(--good-soft);
      border-radius: var(--radius-sm);
      font-size: 11.5px;
      color: var(--good);
      font-weight: 500;
    }

    /* Section */
    .section {
      padding: 16px 0 12px;
    }
    .section + .section {
      border-top: 1px solid var(--card-border);
    }

    .kicker {
      color: var(--vscode-descriptionForeground);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group:last-child {
      margin-bottom: 0;
    }

    /* Language buttons */
    .lang-row {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .lang-btn {
      font-family: inherit;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      background: var(--surface);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 5px 12px;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-weight: 500;
    }
    .lang-btn:hover {
      background: var(--surface-hover);
      color: var(--vscode-foreground);
      border-color: rgba(128,128,128,0.25);
    }
    .lang-btn.active {
      color: #fff;
      background: var(--accent);
      border-color: var(--accent);
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(59,130,246,0.25);
    }

    /* Topic list */
    .topic-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 2px 0;
    }
    .topic-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
      border: 1px solid transparent;
    }
    .topic-row:hover {
      background: var(--surface-hover);
    }
    .topic-row.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      box-shadow: 0 1px 6px rgba(59,130,246,0.20);
    }
    .topic-row.active .topic-name {
      font-weight: 600;
    }
    .topic-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--vscode-foreground);
      opacity: 0.7;
    }
    .topic-icon svg {
      width: 16px;
      height: 16px;
    }
    .topic-row.active .topic-icon {
      color: #fff;
      opacity: 1;
    }
    .topic-name {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .topic-row.multi {
      border: 1px dashed var(--accent-glow);
      background: var(--accent-soft);
    }
    .topic-row.multi.active {
      background: linear-gradient(135deg, var(--accent), #7c3aed);
      border: 1px solid transparent;
    }

    /* Select (settings only) */
    select {
      width: 100%;
      font-family: inherit;
      font-size: 13px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      height: 32px;
      color: var(--vscode-input-foreground);
      cursor: pointer;
      margin-bottom: 0;
      outline: none;
      transition: border-color var(--transition-fast);
    }
    select:hover { border-color: rgba(128,128,128,0.3); }
    select:focus {
      border-color: var(--accent);
    }

    /* Inline SVG icons inside buttons */
    .btn-icon { width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px; flex-shrink: 0; }
    .topbar-btn .btn-icon { width: 12px; height: 12px; margin-right: 3px; }
    .settings-gear .btn-icon { width: 14px; height: 14px; margin: 0; }
    .mode-btn .btn-icon { width: 12px; height: 12px; margin-right: 3px; vertical-align: -1px; }
    .tab .btn-icon { width: 13px; height: 13px; margin-right: 4px; vertical-align: -2px; }

    /* Primary button */
    .btn-primary, .btn-gen {
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      border: none;
      border-radius: var(--radius-md);
      padding: 8px 16px;
      height: 36px;
      cursor: pointer;
      width: 100%;
      transition: all var(--transition-fast);
      letter-spacing: 0.01em;
      box-shadow: 0 1px 3px rgba(59,130,246,0.2);
    }
    .btn-gen:hover { background: var(--accent-hover); box-shadow: 0 2px 6px rgba(59,130,246,0.3); }
    .btn-gen:active { transform: scale(0.98); }
    .btn-gen:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

    /* Secondary button */
    .btn-secondary {
      font-family: inherit;
      font-size: 13px;
      color: var(--vscode-foreground);
      background: var(--surface);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 6px 14px;
      height: 32px;
      cursor: pointer;
      width: 100%;
      transition: all var(--transition-fast);
    }
    .btn-secondary:hover { background: var(--surface-hover); border-color: rgba(128,128,128,0.25); }
    .btn-secondary:active { transform: scale(0.98); }
    .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Toast */
    .toast {
      margin-top: 10px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 12px;
      display: none;
      align-items: center;
      gap: 8px;
      animation: fadeIn var(--transition-med) ease;
    }
    .toast.show { display: flex; }
    .toast.ok {
      background: var(--good-soft);
      border: 1px solid rgba(74,186,106,0.2);
      color: var(--good);
    }
    .toast.err {
      background: var(--bad-soft);
      border: 1px solid rgba(229,83,75,0.2);
      color: var(--bad);
    }
    .toast-icon { font-size: 14px; flex-shrink: 0; }
    .toast-text { flex: 1; line-height: 1.4; }
    .toast-retry {
      font-family: inherit;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      flex-shrink: 0;
      transition: all var(--transition-fast);
      font-weight: 500;
    }
    .toast-retry:hover { opacity: 0.8; }

    /* Practice top bar (shown when practice is loaded) */
    .practice-topbar {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 8px 0;
      margin-bottom: 4px;
      border-bottom: 1px solid var(--card-border);
    }
    .practice-topbar .topbar-btn {
      font-family: inherit;
      font-size: 11px;
      font-weight: 500;
      padding: 5px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 1px solid var(--card-border);
      background: var(--surface);
      color: var(--vscode-descriptionForeground);
      transition: all var(--transition-fast);
    }
    .practice-topbar .topbar-icon-btn {
      padding: 5px 7px;
      flex-shrink: 0;
    }
    .practice-topbar .topbar-icon-btn .btn-icon {
      margin-right: 0;
      width: 14px;
      height: 14px;
    }
    .practice-topbar .topbar-btn:hover {
      background: var(--surface-hover);
      color: var(--vscode-foreground);
      border-color: rgba(128,128,128,0.25);
    }
    .practice-topbar .topbar-btn-chat {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .practice-topbar .topbar-btn-chat:hover {
      background: var(--accent-hover);
    }
    .practice-topbar .topbar-btn-gen {
      background: var(--surface);
      color: var(--vscode-descriptionForeground);
      border-color: var(--card-border);
    }
    .practice-topbar .topbar-btn-gen:hover {
      background: var(--surface-hover);
      color: var(--vscode-foreground);
    }
    .topbar-title-area {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* Details */
    #detailsWrap { display: none; }

    .details-title {
      margin: 0;
      color: var(--vscode-editor-foreground, var(--vscode-foreground));
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .badge-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }
    .badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-badge-foreground);
      background: var(--vscode-badge-background);
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    /* LeetCode-style difficulty colors */
    .diff-easy { background: var(--good-soft); color: var(--good); }
    .diff-medium { background: var(--warn-soft); color: var(--warn); }
    .diff-hard { background: var(--bad-soft); color: var(--bad); }

    /* Item sections */
    .item {
      padding: 12px 0 10px;
    }
    .item + .item {
      border-top: 1px solid rgba(128,128,128,0.06);
    }

    .item-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .item-label {
      color: var(--vscode-descriptionForeground);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .item-body {
      margin: 0;
      color: var(--vscode-foreground);
      font-size: 13px;
      line-height: 1.65;
      white-space: pre-wrap;
    }

    /* Task section */
    .task-enhanced {
      font-size: 13px;
      line-height: 1.75;
      color: var(--vscode-editor-foreground, var(--vscode-foreground));
    }

    /* Inline code styling */
    .task-enhanced code, .item-body code {
      background: var(--vscode-textCodeBlock-background, rgba(110,118,129,0.15));
      color: var(--vscode-textPreformat-foreground, var(--accent));
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--mono);
      font-size: 12px;
    }

    /* Keyword tooltip */
    .keyword {
      color: var(--accent);
      border-bottom: 1px dotted currentColor;
      cursor: help;
      position: relative;
    }
    .keyword:hover { opacity: 0.8; }
    .keyword[data-tip]:hover::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--vscode-editorHoverWidget-background, #1e1e1e);
      color: var(--vscode-editorHoverWidget-foreground, var(--vscode-foreground));
      padding: 5px 10px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      white-space: nowrap;
      z-index: 100;
      border: 1px solid var(--card-border);
      box-shadow: var(--shadow-md);
    }
    .keyword[data-tip]:hover::before {
      content: '';
      position: absolute;
      bottom: calc(100% + 1px);
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--vscode-editorHoverWidget-background, #1e1e1e);
      z-index: 101;
    }
    .kw-type { color: var(--vscode-symbolIcon-variableForeground, #79c0ff); }
    .kw-method { color: var(--vscode-symbolIcon-methodForeground, #d2a8ff); }
    .kw-value { color: var(--vscode-symbolIcon-constantForeground, #a5d6ff); }

    /* Expected output */
    .expected-output {
      background: var(--surface);
      border: 1px solid var(--card-border);
      padding: 12px 14px;
      border-radius: var(--radius-md);
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.5;
    }

    /* Hint */
    .hint-toggle {
      font-family: inherit;
      font-size: 11px;
      color: var(--accent);
      background: transparent;
      border: 0;
      padding: 2px 0;
      cursor: pointer;
      font-weight: 500;
      transition: opacity var(--transition-fast);
    }
    .hint-toggle:hover { opacity: 0.75; }
    .hint-body {
      display: none;
      margin-top: 8px;
    }
    .hint-body.show { display: block; animation: fadeIn var(--transition-med) ease; }
    .hint-text {
      margin: 0;
      color: var(--vscode-foreground);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      padding: 12px 14px;
      background: var(--surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--card-border);
      border-left: 3px solid var(--accent);
    }

    /* Actions */
    .actions {
      margin-top: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .action-group {
      display: flex;
      gap: 6px;
    }
    .action-group > button { flex: 1; }
    .action-divider {
      height: 1px;
      background: var(--card-border);
      margin: 2px 0;
    }
    .btn-teach, .btn-hint, .btn-show-solution, .btn-chat {
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground);
      background: var(--surface);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-sm);
      padding: 6px 14px;
      height: 32px;
      cursor: pointer;
      width: 100%;
      transition: all var(--transition-fast);
    }
    .btn-teach:hover, .btn-hint:hover, .btn-show-solution:hover {
      background: var(--surface-hover);
      border-color: rgba(128,128,128,0.25);
    }
    .btn-teach:active, .btn-hint:active, .btn-show-solution:active { transform: scale(0.98); }
    .btn-chat {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      border-radius: var(--radius-md);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(59,130,246,0.2);
    }
    .btn-chat:hover {
      background: var(--accent-hover);
      box-shadow: 0 2px 6px rgba(59,130,246,0.3);
    }
    .btn-teach:disabled, .btn-hint:disabled, .btn-show-solution:disabled, .btn-chat:disabled, .btn-test:disabled {
      opacity: 0.35; cursor: not-allowed; box-shadow: none;
    }
    .topbar-ghost {
      margin-left: auto;
      color: #a78bfa;
      background: rgba(167, 139, 250, 0.08);
      border-color: rgba(167, 139, 250, 0.3);
      padding: 4px 8px;
      min-width: 28px;
    }
    .topbar-ghost .btn-icon { margin-right: 0; width: 14px; height: 14px; }
    .topbar-ghost:hover {
      background: rgba(167, 139, 250, 0.15);
      border-color: rgba(167, 139, 250, 0.5);
      color: #c4b5fd;
    }
    .topbar-ghost.active {
      background: rgba(167, 139, 250, 0.2);
      border-color: #a78bfa;
      color: #c4b5fd;
      box-shadow: 0 0 8px rgba(167, 139, 250, 0.25);
    }
    .btn-test {
      font-family: inherit;
      font-size: 13px;
      color: #fff;
      background: var(--good);
      border: none;
      border-radius: var(--radius-md);
      padding: 6px 12px;
      height: 32px;
      width: 100%;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-top: 4px;
      font-weight: 500;
    }
    .btn-test:hover { opacity: 0.9; }

    /* Test output */
    .test-output-wrap {
      display: none;
      margin-top: 8px;
    }
    .test-output-wrap.show { display: block; }
    .test-summary {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .test-duration {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }
    .perf-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      margin-top: 8px;
      margin-bottom: 4px;
      display: none;
    }
    .perf-card.show { display: flex; align-items: center; justify-content: center; gap: 14px; }
    .perf-gauge {
      position: relative;
      width: 64px;
      height: 36px;
      flex-shrink: 0;
    }
    .perf-gauge svg { width: 64px; height: 36px; }
    .perf-gauge-bg { stroke: var(--surface); }
    .perf-gauge-fill {
      transition: stroke-dashoffset 0.8s ease, stroke 0.3s ease;
    }
    .perf-gauge-needle {
      transform-origin: 32px 34px;
      transition: transform 0.8s ease;
    }
    .perf-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .perf-time {
      font-family: var(--mono);
      font-size: 15px;
      font-weight: 700;
      color: var(--vscode-foreground);
    }
    .perf-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .perf-label.excellent { color: var(--good); }
    .perf-label.good { color: #22d3ee; }
    .perf-label.sufficient { color: var(--accent); }
    .perf-label.slow { color: #f59e0b; }
    .perf-label.very-slow { color: var(--bad, #ef4444); }

    /* Run/Judge row */
    .action-row {
      display: flex;
      gap: 6px;
    }
    .btn-run, .btn-judge {
      flex: 1;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: var(--radius-md);
      padding: 8px 16px;
      height: 36px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-run {
      color: var(--vscode-foreground);
      background: var(--surface);
      border: 1px solid var(--card-border);
    }
    .btn-run:hover { background: var(--surface-hover); border-color: rgba(128,128,128,0.3); }
    .btn-judge {
      color: #fff;
      background: var(--accent);
      box-shadow: 0 1px 3px rgba(59,130,246,0.2);
    }
    .btn-judge:hover { background: var(--accent-hover); box-shadow: 0 2px 6px rgba(59,130,246,0.3); }
    .btn-run:active, .btn-judge:active { transform: scale(0.98); }
    .btn-run:disabled, .btn-judge:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

    /* Output */
    .output-wrap {
      display: none;
      margin-top: 14px;
    }
    .output-wrap.show { display: block; animation: fadeIn var(--transition-med) ease; }
    .output-wrap .item {
      display: flex;
      flex-direction: column;
      min-height: 190px;
    }
    .output-wrap.output-compact .item {
      min-height: 0;
    }
    .output-text {
      background: var(--surface);
      padding: 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--card-border);
      box-sizing: border-box;
      flex: 1;
      min-height: 150px;
      max-height: 260px;
      overflow-y: auto;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.5;
    }
    .output-wrap.output-compact .output-text {
      background: var(--vscode-input-background, var(--surface));
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      flex: 0 1 auto;
      min-height: 0;
      font-size: 10px;
      line-height: 1.4;
      white-space: pre;
      overflow-x: auto;
      color: var(--vscode-descriptionForeground);
    }
    .result-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.04em;
    }
    .result-badge.pass {
      color: var(--good);
      background: var(--good-soft);
    }
    .result-badge.fail {
      color: var(--bad);
      background: var(--bad-soft);
    }

    /* Test case cards */
    .test-cases-list {
      margin-top: 8px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 5px;
      box-sizing: border-box;
      flex: 1;
      min-height: 150px;
      align-content: start;
    }
    @media (max-width: 200px) {
      .stats-grid { grid-template-columns: 1fr; }
      .provider-cards { grid-template-columns: repeat(2, 1fr); }
    }
    .tc-card {
      display: flex;
      flex-direction: column;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      font-size: 11px;
      border: 1px solid var(--card-border);
      cursor: pointer;
      transition: all var(--transition-fast);
      min-width: 0;
    }
    .tc-card:hover { background: var(--surface-hover); }
    .tc-card.tc-pass {
      border-left: 3px solid var(--good);
      background: rgba(74,186,106,0.03);
    }
    .tc-card.tc-fail {
      border-left: 3px solid var(--bad);
      background: var(--bad-soft);
    }
    .tc-body {
      flex: 1;
      min-width: 0;
    }
    .tc-name {
      font-weight: 600;
      font-size: 11px;
      margin-bottom: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tc-name.pass { color: var(--good); }
    .tc-name.fail { color: var(--bad); }
    .tc-detail {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
    .tc-detail-row {
      display: flex;
      gap: 4px;
      margin-top: 2px;
    }
    .tc-detail-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      min-width: 52px;
    }
    .tc-detail-value {
      font-size: 11px;
      font-family: var(--mono);
      color: var(--vscode-foreground);
      word-break: break-all;
    }
    .tc-detail-value.fail-val { color: var(--bad); }
    .tc-repair-btn {
      margin-top: 6px;
      padding: 3px 10px;
      font-size: 11px;
      border: 1px solid var(--vscode-button-border, #555);
      border-radius: 4px;
      background: var(--vscode-button-secondaryBackground, #333);
      color: var(--vscode-button-secondaryForeground, #ccc);
      cursor: pointer;
      opacity: 0.85;
    }
    .tc-repair-btn:hover {
      opacity: 1;
      background: var(--vscode-button-secondaryHoverBackground, #444);
    }
    .tc-summary {
      grid-column: 1 / -1;
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      padding: 8px 0 2px;
      border-top: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tc-summary-bar {
      flex: 1;
      height: 4px;
      background: var(--bad-soft);
      border-radius: 4px;
      overflow: hidden;
    }
    .tc-summary-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--good));
      border-radius: 4px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Judge feedback on failure */
    .judge-feedback {
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 12px 14px;
      margin: 8px 0 12px;
    }
    .fb-summary {
      font-size: 13px;
      color: var(--text);
      margin-bottom: 10px;
      line-height: 1.4;
    }
    .fb-lines { display: flex; flex-direction: column; gap: 8px; }
    .fb-line-item {
      background: rgba(239, 68, 68, 0.05);
      border-left: 3px solid rgba(239, 68, 68, 0.5);
      padding: 8px 10px;
      border-radius: 0 6px 6px 0;
    }
    .fb-line-num {
      font-weight: 600;
      color: #ef4444;
      font-size: 12px;
      margin-right: 8px;
    }
    .fb-problem {
      color: var(--text);
      font-size: 12px;
    }
    .fb-fix {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      color: var(--good);
      margin-top: 4px;
      padding: 4px 6px;
      background: rgba(34, 197, 94, 0.08);
      border-radius: 4px;
    }

    /* Pass celebration */
    .celebrate {
      text-align: center;
      padding: 8px 10px;
      animation: celebrate-in 0.3s ease;
      background: var(--good-soft);
      border-radius: var(--radius-md);
      margin-bottom: 4px;
    }
    @keyframes celebrate-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    .celebrate-text { font-size: 12px; font-weight: 600; color: var(--good); }

    /* XP earned animation */
    .xp-earned-wrap {
      text-align: center;
      margin-top: 8px;
      padding: 10px;
      animation: xp-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      background: var(--accent-soft);
      border-radius: var(--radius-md);
    }
    @keyframes xp-pop {
      0% { transform: translateY(10px) scale(0.95); opacity: 0; }
      60% { transform: translateY(-2px) scale(1.02); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    .xp-earned-amount {
      font-size: 18px; font-weight: 700;
      color: var(--accent);
    }
    .xp-earned-breakdown {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }
    .xp-earned-breakdown span { margin: 0 4px; }
    .xp-earned-breakdown .bonus { color: var(--good); font-weight: 600; }
    .xp-levelup-banner {
      font-size: 18px; font-weight: 800;
      color: var(--accent);
      text-align: center;
      margin: 10px 0 6px;
      padding: 12px;
      animation: levelup-flash 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      background: var(--accent-soft);
      border-radius: var(--radius-lg);
      border: 1px solid rgba(59,130,246,0.2);
    }
    @keyframes levelup-flash {
      0% { transform: scale(0.6); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      75% { transform: scale(0.97); }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Practice XP Bar */
    .practice-xp-wrap {
      margin-top: 8px;
      margin-bottom: 4px;
    }
    .practice-xp-top {
      display: flex;
      justify-content: flex-end;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .practice-xp-count {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      font-weight: 500;
    }
    .practice-xp-bar {
      height: 4px;
      background: rgba(128,128,128,0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    .practice-xp-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #60A5FA);
      border-radius: 4px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Solution */
    .solution-wrap {
      display: none;
      margin-top: 14px;
    }
    .solution-wrap.show { display: block; animation: fadeInScale var(--transition-med) ease; }
    .solution-label { color: var(--good); }
    .solution-code {
      font-family: var(--mono);
      font-size: 12px;
      background: var(--surface);
      padding: 12px;
      border-radius: var(--radius-md);
      border-left: 3px solid var(--good);
      line-height: 1.5;
    }
    .hl-keyword { color: #c586c0; font-weight: 600; }
    .hl-string { color: #ce9178; }
    .hl-comment { color: #6a9955; font-style: italic; }
    .hl-number { color: #b5cea8; }

    /* Copy button on code blocks */
    .code-block-wrap {
      position: relative;
    }
    .code-copy-btn {
      position: absolute; top: 6px; right: 6px;
      font-family: inherit; font-size: 10px;
      padding: 3px 8px; border-radius: var(--radius-sm);
      background: rgba(128,128,128,0.15); color: var(--vscode-descriptionForeground);
      border: 1px solid rgba(128,128,128,0.2);
      cursor: pointer; opacity: 0; transition: all var(--transition-fast);
      z-index: 2;
      backdrop-filter: blur(4px);
    }
    .code-block-wrap:hover .code-copy-btn { opacity: 1; }
    .code-copy-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    .code-copy-btn.copied { background: var(--good); color: #fff; border-color: var(--good); opacity: 1; }
    .btn-retry {
      font-family: inherit;
      font-size: 13px;
      color: #fff;
      background: var(--accent);
      border: none;
      border-radius: var(--radius-md);
      padding: 6px 14px;
      height: 32px;
      cursor: pointer;
      width: 100%;
      margin-top: 10px;
      transition: all var(--transition-fast);
      font-weight: 600;
    }
    .btn-retry:hover { background: var(--accent-hover); }
    .btn-retry:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Alternative methods */
    .alt-methods-wrap { margin-top: 14px; animation: fadeIn 0.25s ease; }
    .alt-method-card {
      margin-bottom: 8px; border: 1px solid var(--card-border); border-radius: var(--radius-md); overflow: hidden;
      transition: border-color var(--transition-fast);
    }
    .alt-method-card:hover { border-color: rgba(128,128,128,0.25); }
    .alt-method-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; background: var(--surface); cursor: pointer;
      transition: background var(--transition-fast);
    }
    .alt-method-header:hover { background: var(--surface-hover); }
    .alt-method-name { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
    .alt-method-speed { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
    .alt-method-speed.faster { background: var(--good-soft); color: var(--good); }
    .alt-method-speed.same { background: var(--surface); color: var(--vscode-descriptionForeground); }
    .alt-method-speed.slower { background: var(--warn-soft); color: var(--warn); }
    .alt-method-perf {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 600;
    }
    .alt-method-perf .perf-ms { color: var(--vscode-foreground); }
    .alt-method-perf .perf-quality { padding: 1px 6px; border-radius: 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; }
    .alt-method-perf .perf-quality.excellent { background: rgba(34,197,94,0.15); color: var(--good); }
    .alt-method-perf .perf-quality.good { background: rgba(34,211,238,0.15); color: #22d3ee; }
    .alt-method-perf .perf-quality.sufficient { background: rgba(59,130,246,0.15); color: var(--accent); }
    .alt-method-perf .perf-quality.slow { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .alt-method-perf .perf-quality.very-slow { background: rgba(239,68,68,0.15); color: var(--bad, #ef4444); }
    .alt-method-body { display: none; padding: 10px 12px; }
    .alt-method-body.show { display: block; }
    .alt-method-explanation { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; line-height: 1.5; }
    .alt-method-code {
      font-family: var(--mono); font-size: 11px; padding: 12px; border-radius: var(--radius-md);
      background: var(--surface);
      border-left: 3px solid var(--accent);
      max-height: 250px; overflow-y: auto; white-space: pre-wrap; line-height: 1.5;
    }
    .alt-method-current { border-color: var(--good); }
    .alt-method-yours { font-weight: 400; font-size: 10px; color: var(--good); margin-left: 4px; }

    /* Cross-language dropdown */
    .cross-lang-dropdown {
      display: none; position: absolute; bottom: calc(100% + 4px); left: 0;
      background: var(--vscode-editorHoverWidget-background, var(--surface));
      border: 1px solid var(--card-border); border-radius: var(--radius-md);
      box-shadow: var(--shadow-md); z-index: 50; min-width: 130px;
      padding: 4px 0; animation: fadeIn 0.15s ease;
    }
    .cross-lang-dropdown.show { display: block; }
    .cross-lang-item {
      display: block; width: 100%; padding: 6px 14px; border: none; background: none;
      color: var(--vscode-foreground); font-family: inherit; font-size: 12px;
      text-align: left; cursor: pointer; transition: background var(--transition-fast);
    }
    .cross-lang-item:hover { background: var(--surface-hover); }

    /* Pass buttons (shown after PASS) */
    .btn-next-practice, .btn-similar, .btn-level-up {
      display: none;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      border: none;
      border-radius: var(--radius-md);
      padding: 6px 12px;
      height: 32px;
      cursor: pointer;
      flex: 1;
      transition: all var(--transition-fast);
    }
    .btn-next-practice {
      color: #fff;
      background: var(--accent);
      box-shadow: 0 1px 3px rgba(59,130,246,0.2);
    }
    .btn-next-practice:hover { background: var(--accent-hover); box-shadow: 0 2px 6px rgba(59,130,246,0.3); }
    .btn-similar, .btn-level-up {
      color: var(--vscode-foreground);
      background: var(--surface);
      border: 1px solid var(--card-border);
      font-weight: 500;
    }
    .btn-similar:hover, .btn-level-up:hover { background: var(--surface-hover); border-color: rgba(128,128,128,0.25); }
    .pass-buttons {
      display: none;
      gap: 6px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--card-border);
    }
    .pass-buttons.show { display: flex; animation: fadeIn var(--transition-med) ease; }
    .pass-buttons.show .btn-next-practice,
    .pass-buttons.show .btn-similar,
    .pass-buttons.show .btn-level-up { display: block; }
    .btn-next-practice:disabled, .btn-similar:disabled, .btn-level-up:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

    /* Level badge */
    .level-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.03em;
    }
    .level-badge.lvl-1, .level-badge.lvl-2 { background: var(--good-soft); color: var(--good); }
    .level-badge.lvl-3, .level-badge.lvl-4 { background: var(--warn-soft); color: var(--warn); }
    .level-badge.lvl-5 { background: var(--bad-soft); color: var(--bad); }

    /* Mode toggle */
    .mode-toggle {
      display: flex;
      gap: 0;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--card-border);
      background: var(--surface);
      padding: 2px;
    }
    .mode-btn {
      flex: 1;
      font-family: inherit;
      font-size: 11px;
      font-weight: 500;
      padding: 6px 10px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .mode-btn.active {
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }
    .mode-btn:hover:not(.active) {
      background: var(--surface-hover);
      color: var(--vscode-foreground);
    }

    /* Auto-selected badge */
    .auto-badge {
      font-size: 9px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;
      background: var(--accent-soft);
      color: var(--accent);
      letter-spacing: 0.03em;
    }

    /* Custom practice textarea */
    .custom-prompt {
      width: 100%;
      font-family: var(--mono);
      font-size: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--vscode-foreground);
      resize: vertical;
      min-height: 64px;
      outline: none;
      transition: border-color var(--transition-fast);
      line-height: 1.5;
    }
    .custom-prompt:hover {
      border-color: rgba(128,128,128,0.3);
    }
    .custom-prompt:focus {
      border-color: var(--accent);
    }
    .custom-prompt::placeholder {
      color: var(--vscode-descriptionForeground);
      opacity: 0.5;
    }

    /* Custom practice history list */
    .custom-history-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
      max-height: 320px;
      overflow-y: auto;
    }
    .custom-history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      background: var(--surface);
      border: 1px solid var(--card-border);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .custom-history-item:hover {
      background: var(--surface-hover);
      border-color: rgba(128,128,128,0.2);
    }
    .custom-history-item-info {
      flex: 1;
      min-width: 0;
    }
    .custom-history-item-title {
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .custom-history-item-meta {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
      opacity: 0.8;
    }
    .custom-history-item-delete {
      font-size: 14px;
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      padding: 4px 6px;
      border-radius: var(--radius-sm);
      opacity: 0;
      transition: all var(--transition-fast);
    }
    .custom-history-item:hover .custom-history-item-delete {
      opacity: 1;
    }
    .custom-history-item-delete:hover {
      color: var(--bad);
      background: var(--bad-soft);
    }

    /* Multi-topic info text */
    .multi-topic-info {
      font-size: 11px;
      color: var(--accent);
      margin-top: 6px;
      font-style: italic;
      opacity: 0.8;
      padding: 4px 8px;
      background: var(--accent-soft);
      border-radius: var(--radius-sm);
    }

    /* Bug fix badge */
    .bug-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      background: var(--bad-soft);
      color: var(--bad);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Source attribution */
    .source-attribution {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      padding: 4px 0 10px 0;
      opacity: 0.7;
    }
    .source-attribution span:last-child {
      font-family: var(--mono);
      color: var(--accent);
    }

    /* Bug explanation */
    .bug-explanation {
      background: var(--bad-soft);
      border-left: 3px solid var(--bad);
      padding: 12px 14px;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      line-height: 1.6;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 2px;
      margin-bottom: 0;
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--vscode-sideBar-background, var(--vscode-editor-background));
      padding: 0 2px;
    }
    .tab {
      flex: 1;
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-descriptionForeground);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 10px 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .tab:hover { color: var(--vscode-foreground); background: rgba(128,128,128,0.04); }
    .tab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
    }

    /* Panels */
    .panel { display: none; padding-top: 6px; }
    .panel.active { display: block; animation: fadeIn var(--transition-med) ease; }

    /* Streak banner */
    .streak-banner {
      display: none;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-lg);
      margin-bottom: 12px;
      background: var(--accent-soft);
      border: 1px solid rgba(59,130,246,0.15);
    }
    .streak-banner.show { display: flex; animation: fadeInScale 0.4s ease; }
    .streak-fire {
      font-size: 24px;
    }
    .streak-info { flex: 1; }
    .streak-count {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
      line-height: 1.2;
    }
    .streak-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
      opacity: 0.8;
    }
    .streak-best {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      text-align: right;
      opacity: 0.7;
    }

    /* Progress Dashboard */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .stat-card {
      background: var(--surface);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      text-align: center;
      border: 1px solid var(--card-border);
      transition: all var(--transition-fast);
    }
    .stat-card:hover { background: var(--surface-hover); }
    .stat-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--vscode-foreground);
      margin-bottom: 4px;
      line-height: 1.1;
    }
    .stat-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      letter-spacing: 0.03em;
      font-weight: 500;
      text-transform: uppercase;
    }
    .stat-card.due { border-left: 3px solid var(--bad); }
    .stat-card.due .stat-value { color: var(--bad); }
    .stat-card.weak { border-left: 3px solid var(--warn); }
    .stat-card.weak .stat-value { color: var(--warn); }
    .stat-card.mastered { border-left: 3px solid var(--good); }
    .stat-card.mastered .stat-value { color: var(--good); }
    .stat-card.total { border-left: 3px solid var(--accent); }
    .stat-card.total .stat-value { color: var(--accent); }

    .due-review-text {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      padding: 6px 0;
      line-height: 1.5;
    }

    /* XP Level Bar */
    .xp-wrap {
      padding: 12px 14px;
      margin-bottom: 12px;
      background: var(--accent-soft);
      border-radius: var(--radius-lg);
      border: 1px solid rgba(59,130,246,0.12);
    }
    .xp-top {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 6px;
    }
    .xp-level { font-size: 12px; font-weight: 700; color: var(--accent); }
    .xp-count { font-size: 11px; color: var(--vscode-descriptionForeground); }
    .xp-bar {
      height: 5px; background: rgba(128,128,128,0.1);
      border-radius: 4px; overflow: hidden;
    }
    .xp-bar-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), #60A5FA);
      border-radius: 4px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .xp-next { font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 4px; opacity: 0.8; }

    /* Recommendations */
    .rec-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }
    .rec-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }
    .rec-item:hover { background: var(--surface-hover); border-color: var(--card-border); }
    .rec-type {
      font-size: 11px;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--surface);
      color: var(--vscode-descriptionForeground);
      flex-shrink: 0;
      font-weight: 600;
    }
    .rec-info { flex: 1; min-width: 0; }
    .rec-topic {
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground);
    }
    .rec-reason {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.8;
      margin-top: 1px;
    }
    .rec-item.due { border-left: 3px solid var(--bad); }
    .rec-item.due .rec-type { background: var(--bad-soft); color: var(--bad); }
    .rec-item.weak { border-left: 3px solid var(--warn); }
    .rec-item.weak .rec-type { background: var(--warn-soft); color: var(--warn); }
    .rec-item.interleave { border-left: 3px solid var(--accent); }
    .rec-item.interleave .rec-type { background: var(--accent-soft); color: var(--accent); }
    .rec-item.new { border-left: 3px solid var(--good); }
    .rec-item.new .rec-type { background: var(--good-soft); color: var(--good); }

    /* Topic progress */
    .topic-progress-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .topic-progress-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);
    }
    .topic-progress-item:hover { background: var(--surface); }
    .topic-progress-name {
      flex: 1;
      font-size: 12px;
      color: var(--vscode-foreground);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .topic-progress-bar {
      width: 64px;
      height: 4px;
      background: rgba(128,128,128,0.1);
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .topic-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--good));
      border-radius: 4px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .topic-progress-pct {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      width: 32px;
      text-align: right;
      flex-shrink: 0;
      font-weight: 500;
    }

    /* Settings Panel — matches app's section/card design language */
    .settings-panel { padding-top: 6px; }
    .settings-section { margin-bottom: 14px; }
    .settings-section .kicker { margin-bottom: 8px; }
    .settings-field {
      margin-bottom: 10px;
    }
    .settings-field label {
      display: block;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .settings-field input[type="text"],
    .settings-field input[type="password"] {
      width: 100%;
      padding: 7px 10px;
      font-family: var(--mono);
      font-size: 12px;
      background: var(--card-bg);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-sm);
      outline: none;
      transition: border-color var(--transition-fast);
    }
    .settings-field input:hover { border-color: rgba(128,128,128,0.25); }
    .settings-field input:focus { border-color: var(--accent); }
    .settings-field select {
      width: 100%;
      padding: 7px 10px;
      font-family: inherit;
      font-size: 12px;
      background: var(--card-bg);
      color: var(--vscode-foreground);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-sm);
      outline: none;
      transition: border-color var(--transition-fast);
    }
    .settings-field select:hover { border-color: rgba(128,128,128,0.25); }
    .settings-field select:focus { border-color: var(--accent); }
    .provider-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .provider-card {
      padding: 8px 4px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: var(--surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--vscode-foreground);
    }
    .provider-card:hover {
      background: var(--surface-hover);
      border-color: var(--card-border);
    }
    .provider-card.active {
      border-color: var(--accent);
      background: var(--accent-soft);
    }
    .provider-card .provider-sub {
      font-weight: 400;
      font-size: 10px;
      opacity: 0.6;
      margin-top: 2px;
    }
    .provider-quality {
      font-size: 9px;
      font-weight: 700;
      margin-top: 3px;
      padding: 1px 6px;
      border-radius: 8px;
      display: inline-block;
      letter-spacing: 0.03em;
    }
    .quality-a { background: var(--good-soft); color: var(--good); }
    .quality-b { background: var(--warn-soft); color: var(--warn); }
    .quality-c { background: var(--surface-hover); color: var(--vscode-descriptionForeground); opacity: 0.7; }
    .provider-config {
      display: none;
      padding: 10px 12px;
      background: var(--surface);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      margin-bottom: 10px;
    }
    .provider-config.active {
      display: block;
      animation: fadeIn var(--transition-med) ease;
    }
    .provider-info {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
      opacity: 0.7;
      letter-spacing: 0.02em;
    }
    .btn-save-settings {
      width: 100%;
      height: 36px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      margin-top: 8px;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-save-settings:hover {
      background: var(--accent-hover);
      box-shadow: var(--shadow-md);
    }
    .btn-save-settings:active { transform: scale(0.98); }
    .btn-reset-progress {
      width: 100%;
      height: 32px;
      font-size: 12px;
      font-weight: 500;
      color: var(--bad);
      background: var(--bad-soft);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      cursor: pointer;
      margin-top: 16px;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-reset-progress:hover {
      border-color: var(--bad);
      background: rgba(229,83,75,0.15);
    }
    .btn-reset-progress:active { transform: scale(0.98); }
    .settings-saved {
      font-size: 11px;
      color: var(--good);
      text-align: center;
      margin-top: 6px;
      display: none;
      font-weight: 500;
    }
    .settings-saved.show {
      display: block;
      animation: fadeIn 0.3s ease;
    }
    .settings-current-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--accent-soft);
      border: 1px solid var(--accent);
      border-radius: var(--radius-md);
      margin-bottom: 12px;
      font-size: 11px;
      color: var(--vscode-foreground);
    }
    .settings-current-banner .banner-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--good);
      flex-shrink: 0;
    }
    .settings-current-banner .banner-label {
      font-weight: 500;
      opacity: 0.7;
    }
    .settings-current-banner .banner-value {
      font-weight: 700;
    }
    .settings-current-banner.offline .banner-dot {
      background: #f59e0b;
    }
    .offline-badge {
      display: none;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      color: #f59e0b;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .offline-badge.show { display: flex; }
    .offline-badge .offline-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #f59e0b;
    }
    /* Custom panel offline overlay */
    .custom-offline-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      gap: 8px;
    }
    .custom-offline-icon {
      opacity: 0.4;
      margin-bottom: 4px;
    }
    .custom-offline-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }
    .custom-offline-desc {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
      max-width: 280px;
    }
    .custom-offline-source {
      margin-top: 6px;
      font-size: 10px;
      font-weight: 600;
      color: #f59e0b;
      letter-spacing: 0.3px;
      padding: 2px 10px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 10px;
    }
    .custom-offline-settings-btn,
    .custom-offline-switch-btn {
      margin-top: 12px;
      font-size: 12px;
      padding: 6px 16px;
    }

    .provider-card.saved {
      position: relative;
    }
    .provider-card.saved::after {
      content: "";
      position: absolute;
      top: 4px; right: 4px;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--good);
    }
    .btn-save-settings.saved {
      background: var(--good);
    }
    .btn-save-settings.saved:hover {
      background: var(--good);
      opacity: 0.9;
    }
    .settings-gear {
      background: var(--surface);
      border: 1px solid var(--card-border);
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }
    .settings-gear:hover {
      color: var(--accent);
      border-color: var(--accent);
      background: var(--accent-soft);
    }
    .api-key-wrap {
      position: relative;
    }
    .api-key-wrap input {
      padding-right: 34px;
    }
    .api-key-toggle {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      padding: 2px;
      transition: color var(--transition-fast);
      opacity: 0.6;
    }
    .api-key-toggle:hover { color: var(--accent); opacity: 1; }

  </style>
</head>
<body>
  <!-- Loading Overlay -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-icon" id="loadingIcon"></div>
    <div class="loading-text" id="loadingText" data-i18n="loading.generatingPractice">Generating practice...</div>
    <div class="loading-bar"><div class="loading-bar-inner" id="loadingBarInner"></div></div>
    <div class="loading-pct" id="loadingPct"></div>
    <div class="loading-tip" id="loadingTip" data-i18n="tip.aiThinking">AI is thinking...</div>
  </div>

  <div class="header">
    <div class="logo">CODEPRACTICE</div>
    <div class="header-actions">
      <div class="offline-badge" id="offlineBadge"><div class="offline-dot"></div>OFFLINE</div>
      <select id="uiLangSelect" class="ui-lang-select"></select>
      <button class="settings-gear" id="settingsGearBtn" title="Settings"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z"/></svg></button>
      <div class="spinner" id="spin"></div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <button class="tab active" data-tab="practice" data-i18n="tab.practice"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>Practice</button>
    <button class="tab" data-tab="custom" data-i18n="tab.custom"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg>Custom</button>
    <button class="tab" data-tab="progress" data-i18n="tab.progress"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 9h16"/><path d="M9.5 14.5a3.5 3.5 0 0 1 5.7-2.6"/><path d="M15.2 11.9H18v-2.8"/><path d="M14.5 15.5a3.5 3.5 0 0 1-5.7 2.6"/><path d="M8.8 18.1H6v2.8"/></svg>Progress</button>
  </div>

  <!-- Practice Panel -->
  <div id="practicePanel" class="panel active">
    <div id="practiceForm">
      <div class="welcome-banner" id="welcomeBanner">
        <div class="welcome-title" data-i18n="welcome.title">Welcome to CodePractice!</div>
        <div class="welcome-steps">
          <div class="welcome-step"><span class="welcome-num">1</span><span data-i18n="welcome.step1">Select a language & topic below</span></div>
          <div class="welcome-step"><span class="welcome-num">2</span><span data-i18n="welcome.step2">Click Generate to create a practice</span></div>
          <div class="welcome-step"><span class="welcome-num">3</span><span data-i18n="welcome.step3">Write your solution in the editor</span></div>
          <div class="welcome-step"><span class="welcome-num">4</span><span data-i18n="welcome.step4">Click Judge to check your code</span></div>
        </div>
        <div class="welcome-tip" data-i18n="welcome.tip">Start with Offline mode — no API key needed!</div>
      </div>
      <div class="subtitle" data-i18n="practice.subtitle">select language + topic, generate practice.</div>

      <div class="section">
        <div class="form-group">
          <div class="kicker" data-i18n="practice.language">Language</div>
          <div class="lang-row" id="langRow"></div>
        </div>

        <div class="form-group">
          <div class="kicker" data-i18n="practice.topic">Topic</div>
          <div class="topic-list" id="topicGrid"></div>
          <div class="multi-topic-info" id="multiTopicInfo" style="display:none;" data-i18n="practice.multiTopicDesc">Auto-selected based on your progress</div>
        </div>

        <div class="form-group">
          <div class="kicker" data-i18n="practice.mode">Mode</div>
          <div class="mode-toggle" id="modeToggle">
            <button class="mode-btn active" data-mode="practice" data-i18n="practice.modePractice"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>Practice</button>
            <button class="mode-btn" data-mode="bugfix" data-i18n="practice.modeBugFix"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9h6"/><path d="M10 5l-1-1"/><path d="M14 5l1-1"/><rect x="8" y="9" width="8" height="9" rx="3"/><path d="M7 12H5"/><path d="M19 12h-2"/><path d="M7 16H6"/><path d="M18 16h-1"/></svg>Bug Fix</button>
          </div>
        </div>

        <div class="form-group" id="codeSizeGroup" style="display:none;">
          <div class="kicker" data-i18n="practice.codeSize">Code Source</div>
          <div class="mode-toggle" id="codeSizeToggle">
            <button class="mode-btn active" data-size="snippet" data-i18n="practice.sizeSnippet">Snippet</button>
            <button class="mode-btn" data-size="codebase" data-i18n="practice.sizeCodebase">Codebase</button>
          </div>
        </div>

        <div class="form-group" id="sourceToggleGroup">
          <div class="kicker" data-i18n="practice.sourceCode">Source</div>
          <div class="mode-toggle" id="sourceToggle">
            <button class="mode-btn" data-source="ai" data-i18n="practice.sourceAI"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M16 15H8l-3 6h14l-3-6z"/><circle cx="9" cy="10" r="0.5" fill="currentColor"/><circle cx="15" cy="10" r="0.5" fill="currentColor"/></svg>AI</button>
            <button class="mode-btn active" data-source="offline" data-i18n="practice.sourceOffline"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>Offline</button>
          </div>
        </div>

        <button class="btn-gen" id="genBtn" aria-label="Generate practice" data-i18n="practice.generate"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/><path d="M19 6l.7 1.8L21.5 8.5l-1.8.7L19 11l-.7-1.8L16.5 8.5l1.8-.7L19 6z"/></svg>Generate</button>
      </div>
    </div>

  <div id="toast" class="toast">
    <span class="toast-icon" id="toastIcon"></span>
    <span class="toast-text" id="toastText"></span>
  </div>

  <div class="practice-topbar" id="practiceTopbar">
    <button class="topbar-btn topbar-icon-btn" id="topbarBackBtn" title="Back"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.3"/><path d="M4 4v4h4"/></svg></button>
    <div class="topbar-title-area">
      <h3 class="details-title" id="title">&mdash;</h3>
      <div class="badge-row">
        <span class="badge" id="langBadge">JAVA</span>
        <span class="level-badge" id="levelBadge">LVL 1</span>
        <span class="bug-badge" id="bugFixBadge" style="display:none;" data-i18n="practice.bugFix">BUG FIX</span>
        <span class="auto-badge" id="autoSelectedBadge" style="display:none;"></span>
      </div>
    </div>
    <button class="topbar-btn topbar-icon-btn topbar-btn-chat" id="openChatBtn" title="AI Chat"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg></button>
    <button class="topbar-btn topbar-btn-gen topbar-icon-btn" id="topbarGenBtn" title="New Practice"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/><path d="M19 6l.7 1.8L21.5 8.5l-1.8.7L19 11l-.7-1.8L16.5 8.5l1.8-.7L19 6z"/></svg></button>
    <button class="topbar-btn topbar-ghost" id="ghostModeBtn" title="Ghost Mode" style="display:none;"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v4c0 1 .5 2 1 3s1 2 1 3v1h2l1-2h6l1 2h2v-1c0-1 .5-2 1-3s1-2 1-3v-4a8 8 0 0 0-8-8z"/></svg></button>
  </div>
  <div class="topbar-progress" id="topbarProgress"><div class="topbar-progress-inner"></div></div>

  <div id="detailsWrap">
    <div class="section">
      <!-- XP Progress Bar -->
      <div class="practice-xp-wrap" id="practiceXpWrap">
        <div class="practice-xp-top">
          <span class="practice-xp-count" id="practiceXpCount">0 / 100 XP</span>
        </div>
        <div class="practice-xp-bar"><div class="practice-xp-fill" id="practiceXpFill" style="width:0%"></div></div>
      </div>
      <div class="source-attribution" id="sourceAttribution" style="display:none;">
        <span data-i18n="practice.sourceCode">Source</span>: <span id="sourceRepoName"></span>
      </div>

      <div class="item">
        <div class="item-head">
          <span class="item-label" data-i18n="practice.task">Task</span>
        </div>
        <div class="item-body task-enhanced" id="task">&mdash;</div>
      </div>

      <div class="item">
        <div class="item-head">
          <span class="item-label" data-i18n="practice.expectedOutput">Expected Output</span>
        </div>
        <pre class="item-body expected-output" id="mini">&mdash;</pre>
      </div>

      <div class="item">
        <div class="item-head">
          <span class="item-label" data-i18n="practice.hint">Hint</span>
          <button class="hint-toggle" id="hintToggle" data-i18n="hint.show">show</button>
        </div>
        <div class="hint-body" id="hintBody">
          <pre class="hint-text" id="hint">&mdash;</pre>
        </div>
      </div>

      <div class="item" id="bugExplanationItem" style="display:none;">
        <div class="item-head">
          <span class="item-label" data-i18n="practice.bugExplanation">Bug Explanation</span>
        </div>
        <pre class="item-body bug-explanation" id="bugExplanationBody">&mdash;</pre>
      </div>

      <div class="custom-prompt-edit-wrap" id="customPromptEditWrap" style="display:none;">
        <div class="item">
          <div class="item-head">
            <span class="item-label">Prompt</span>
          </div>
          <div style="display:flex;gap:6px;align-items:flex-start;">
            <textarea class="custom-prompt" id="customPromptEdit" rows="2" maxlength="500" style="flex:1;"></textarea>
            <button class="btn-run" id="customRegenBtn" style="white-space:nowrap;"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/><path d="M19 6l.7 1.8L21.5 8.5l-1.8.7L19 11l-.7-1.8L16.5 8.5l1.8-.7L19 6z"/></svg>Re-generate</button>
          </div>
        </div>
      </div>

      <div class="actions">
        <div class="action-row">
          <button class="btn-run" id="runBtn" aria-label="Run code" data-i18n="practice.run"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 9.5v5l5-2.5-5-2.5z"/></svg>Run</button>
          <button class="btn-judge" id="judgeBtn" aria-label="Judge code" data-i18n="practice.judge"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v6c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"/><path d="M9.5 12.5l1.7 1.7 3.8-3.8"/></svg>Judge</button>
        </div>
        <div class="action-divider"></div>
        <div class="action-group">
          <button class="btn-hint" id="hintCodeBtn" aria-label="Add hints to code" data-i18n="practice.addHints"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5c-1-1-1.5-2.3-1.5-3.8a5 5 0 0 1 10 0c0 1.5-.5 2.8-1.5 3.8-.8.8-1.2 1.5-1.2 2.5H9.7c0-1-.4-1.7-1.2-2.5z"/><path d="M12 2v1"/><path d="M4 6l1 1"/><path d="M20 6l-1 1"/></svg>Add Hints</button>
          <button class="btn-teach" id="teachBtn" aria-label="Teach me this concept" data-i18n="practice.teachMe"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg>Teach Me</button>
        </div>
        <div class="action-group">
          <button class="btn-show-solution" id="showSolutionBtn" aria-label="Show solution" data-i18n="practice.showSolution"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Show Solution</button>
          <button class="btn-show-solution" id="quickSolveBtn" aria-label="Quick solve" data-i18n="practice.quickSolve"><svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg>Quick Solve</button>
        </div>
        <button class="btn-hint" id="apiPreviewBtn" data-i18n="practice.apiPreview" style="display:none;"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>API Preview</button>
        <div class="cross-lang-wrap" style="position:relative;">
          <button class="btn-hint" id="crossLangBtn" data-i18n="practice.crossLang" style="display:none;"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>See in Another Language</button>
          <div class="cross-lang-dropdown" id="crossLangDropdown"></div>
        </div>
        <div id="altMethodsAnchor"></div>
      </div>

      <div class="solution-wrap" id="solutionWrap">
        <div class="item">
          <div class="item-head">
            <span class="item-label solution-label" data-i18n="practice.solution">Solution</span>
          </div>
          <pre class="item-body solution-code" id="solution">&mdash;</pre>
        </div>
        <div class="item">
          <div class="item-head">
            <span class="item-label" data-i18n="practice.explanation">Explanation</span>
          </div>
          <pre class="item-body" id="explanation">&mdash;</pre>
        </div>
        <button class="btn-retry" id="retryBtn" data-i18n="practice.trySimilar"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/><path d="M19 6l.7 1.8L21.5 8.5l-1.8.7L19 11l-.7-1.8L16.5 8.5l1.8-.7L19 6z"/></svg>Try Similar Practice</button>
      </div>

      <div class="output-wrap" id="outputWrap">
        <div class="perf-card" id="perfCard" style="display:none;">
          <div class="perf-gauge">
            <svg viewBox="0 0 64 36">
              <path class="perf-gauge-bg" d="M6 34 A26 26 0 0 1 58 34" fill="none" stroke-width="5" stroke-linecap="round"/>
              <path class="perf-gauge-fill" id="perfGaugeFill" d="M6 34 A26 26 0 0 1 58 34" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="82" stroke-dashoffset="82"/>
              <line class="perf-gauge-needle" id="perfNeedle" x1="32" y1="34" x2="32" y2="12" stroke="var(--vscode-foreground)" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="perf-info">
            <span class="perf-time" id="perfTime">—</span>
            <span class="perf-label" id="perfLabel"></span>
          </div>
        </div>
        <div class="item">
          <div class="item-head">
            <span class="result-badge" id="resultBadge"></span>
          </div>
          <div id="testCasesList" class="test-cases-list"></div>
          <pre class="item-body output-text" id="output" style="display:none;">&mdash;</pre>
        </div>
        <div class="pass-buttons" id="passButtons">
          <button class="btn-next-practice" id="nextPracticeBtn" data-i18n="practice.next"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>Next</button>
          <button class="btn-similar" id="similarPracticeBtn" data-i18n="practice.similar"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>Similar</button>
        </div>
      </div>

    </div>
  </div>
  </div><!-- /practicePanel -->

  <!-- Progress Panel -->
  <div id="progressPanel" class="panel">
    <div class="subtitle" data-i18n="progress.subtitle">smart review system with spaced repetition.</div>

    <!-- Streak Banner -->
    <div class="streak-banner" id="streakBanner">
      <div class="streak-fire">&#128293;</div>
      <div class="streak-info">
        <div class="streak-count" id="streakCount">0 Day Streak</div>
        <div class="streak-label" data-i18n="progress.keepPracticing">Keep practicing daily!</div>
      </div>
      <div class="streak-best" id="streakBest"></div>
    </div>

    <!-- XP Level -->
    <div class="xp-wrap" id="xpWrap">
      <div class="xp-top">
        <span class="xp-level" id="xpLevel">Level 1</span>
        <span class="xp-count" id="xpCount">0 / 50 XP</span>
      </div>
      <div class="xp-bar"><div class="xp-bar-fill" id="xpBarFill" style="width:0%"></div></div>
      <div class="xp-next" id="xpNext">50 XP to next level</div>
    </div>

    <!-- Daily Goal -->
    <div id="dailyGoal" class="daily-goal-wrap" style="display:none"></div>

    <!-- Weekly Trend -->
    <div id="weeklyTrend" class="weekly-trend-wrap" style="display:none"></div>

    <div class="section">
      <div class="stats-grid">
        <div class="stat-card due">
          <div class="stat-value" id="statDue">0</div>
          <div class="stat-label" data-i18n="progress.dueReview">Due for Review</div>
        </div>
        <div class="stat-card weak">
          <div class="stat-value" id="statWeak">0</div>
          <div class="stat-label" data-i18n="progress.weakTopics">Weak Topics</div>
        </div>
        <div class="stat-card mastered">
          <div class="stat-value" id="statMastered">0</div>
          <div class="stat-label" data-i18n="progress.mastered">Mastered</div>
        </div>
        <div class="stat-card total">
          <div class="stat-value" id="statTotal">0</div>
          <div class="stat-label" data-i18n="progress.totalPractices">Total Practice</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="kicker" data-i18n="progress.recommendations">WHAT TO PRACTICE NEXT?</div>
      <div class="rec-list" id="recList">
        <div class="rec-item">
          <span class="rec-type">-</span>
          <div class="rec-info">
            <div class="rec-topic" data-i18n="progress.loading">Loading...</div>
            <div class="rec-reason" data-i18n="progress.fetchingRecs">Fetching recommendations</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="kicker" data-i18n="progress.topicMastery">TOPIC MASTERY</div>
      <div class="topic-progress-list" id="topicProgressList">
        <div class="topic-progress-item">
          <span class="topic-progress-name" data-i18n="progress.noDataYet">No data yet</span>
          <div class="topic-progress-bar"><div class="topic-progress-fill" style="width: 0%"></div></div>
          <span class="topic-progress-pct">0%</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="kicker" data-i18n="progress.dueForReview">DUE FOR REVIEW</div>
      <div id="dueCount" class="due-review-text">
        <span id="dueNumber">0</span> <span data-i18n="progress.practicesDue">practices due for review</span>
      </div>
      <button class="btn-gen" id="reviewDueBtn" style="margin-top:8px;" data-i18n="progress.startReview"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 9h16"/><path d="M9.5 14.5a3.5 3.5 0 0 1 5.7-2.6"/><path d="M15.2 11.9H18v-2.8"/><path d="M14.5 15.5a3.5 3.5 0 0 1-5.7 2.6"/><path d="M8.8 18.1H6v2.8"/></svg>Start Review</button>
    </div>
  </div><!-- /progressPanel -->

  <!-- Custom Practice Panel -->
  <div id="customPanel" class="panel">
    <!-- Offline overlay for Custom panel -->
    <div id="customOfflineOverlay" class="custom-offline-overlay" style="display:none;">
      <div class="custom-offline-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
      <div class="custom-offline-title" data-i18n="custom.aiRequired">AI Required</div>
      <div class="custom-offline-desc" data-i18n-html="custom.aiRequiredDesc">Custom practices require an AI provider.<br>Configure an API key in Settings to use this feature.</div>
      <div class="custom-offline-source">Source: AI</div>
      <!-- When no API key: show Open Settings -->
      <button class="btn-gen custom-offline-settings-btn" id="customGoSettingsBtn" data-i18n="custom.openSettings"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Open Settings</button>
      <!-- When API key exists but source is offline: show Switch to AI -->
      <button class="btn-gen custom-offline-switch-btn" id="customSwitchAiBtn" data-i18n="custom.switchAi" style="display:none;"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M16 15H8l-3 6h14l-3-6z"/><circle cx="9" cy="10" r="0.5" fill="currentColor"/><circle cx="15" cy="10" r="0.5" fill="currentColor"/></svg>Switch to AI Mode</button>
    </div>
    <div class="subtitle" id="customSubtitle" data-i18n="custom.empty">No custom practices yet. Describe what you want to learn!</div>

    <div class="section" id="customFormSection">
      <div class="form-group">
        <div class="kicker" data-i18n="custom.language">Language</div>
        <div class="lang-row" id="customLangRow"></div>
      </div>

      <div class="form-group">
        <textarea class="custom-prompt" id="customPromptInput" rows="3" maxlength="500" data-i18n-placeholder="custom.prompt" placeholder="Describe what you want to practice..."></textarea>
      </div>

      <button class="btn-gen" id="customGenBtn" data-i18n="custom.generate"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/><path d="M19 6l.7 1.8L21.5 8.5l-1.8.7L19 11l-.7-1.8L16.5 8.5l1.8-.7L19 6z"/></svg>Generate</button>
    </div>

    <div class="section" id="customHistorySection">
      <div class="kicker" data-i18n="custom.history">My Practices</div>
      <div id="customHistoryList" class="custom-history-list"></div>
    </div>
  </div><!-- /customPanel -->

  <!-- Settings Panel -->
  <div id="settingsPanel" class="panel settings-panel">
    <div class="settings-current-banner" id="currentConfigBanner">
      <div class="banner-dot"></div>
      <span class="banner-label">Active:</span>
      <span class="banner-value" id="bannerProviderName">—</span>
      <span style="opacity:0.5">·</span>
      <span class="banner-value" id="bannerModelName" style="font-weight:500;opacity:0.8">—</span>
    </div>
    <div class="settings-section">
      <div class="kicker" data-i18n="settings.aiProvider">AI PROVIDER</div>
      <div class="provider-cards" id="providerCards">
        <div class="provider-card" data-provider="groq">Groq<div class="provider-sub">Free 100K/day</div></div>
        <div class="provider-card" data-provider="cerebras">Cerebras<div class="provider-sub">Free ~1M/day</div></div>
        <div class="provider-card" data-provider="together">Together<div class="provider-sub">$1 free</div></div>
        <div class="provider-card" data-provider="openrouter">OpenRouter<div class="provider-sub">Free tier</div></div>
        <div class="provider-card" data-provider="gemini">Gemini<div class="provider-sub">Free tier</div></div>
        <div class="provider-card" data-provider="openai">OpenAI<div class="provider-sub">Pay-as-you-go</div></div>
        <div class="provider-card" data-provider="claude">Claude<div class="provider-sub">Pay-as-you-go</div></div>
        <div class="provider-card" data-provider="local"><span data-i18n="settings.local">Local</span><div class="provider-sub">LM Studio</div></div>
      </div>
    </div>

    <div class="provider-config" id="config-groq">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsGroqKey" placeholder="gsk_..." />
          <button class="api-key-toggle" data-target="settingsGroqKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsGroqModel">
          <option value="openai/gpt-oss-120b">GPT-OSS 120B (best)</option>
          <option value="openai/gpt-oss-20b">GPT-OSS 20B (fastest)</option>
          <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
          <option value="llama-3.1-8b-instant">Llama 3.1 8B (fast)</option>
        </select>
      </div>
      <div class="provider-info">Free: 100K tokens/day</div>
    </div>

    <div class="provider-config" id="config-cerebras">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsCerebrasKey" placeholder="csk-..." />
          <button class="api-key-toggle" data-target="settingsCerebrasKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsCerebrasModel">
          <option value="qwen-3-235b-a22b-instruct-2507">Qwen 3 235B (preview)</option>
          <option value="gpt-oss-120b">GPT-OSS 120B</option>
          <option value="llama3.1-8b">Llama 3.1 8B (fast)</option>
        </select>
      </div>
      <div class="provider-info">Free: ~1M tokens/day</div>
    </div>

    <div class="provider-config" id="config-together">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsTogetherKey" placeholder="tok-..." />
          <button class="api-key-toggle" data-target="settingsTogetherKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsTogetherModel">
          <option value="meta-llama/Llama-3.3-70B-Instruct-Turbo">Llama 3.3 70B Turbo</option>
          <option value="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo">Llama 3.1 8B Turbo</option>
        </select>
      </div>
      <div class="provider-info">$1 free credit on signup</div>
    </div>

    <div class="provider-config" id="config-openrouter">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsOpenrouterKey" placeholder="sk-or-..." />
          <button class="api-key-toggle" data-target="settingsOpenrouterKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsOpenrouterModel">
          <option value="nvidia/nemotron-3-super-120b-a12b:free">Nemotron 3 Super 120B (free, fast)</option>
          <option value="qwen/qwen3-coder:free">Qwen3 Coder 480B (free)</option>
          <option value="openai/gpt-oss-120b:free">GPT-OSS 120B (free)</option>
          <option value="openrouter/hunter-alpha">Hunter Alpha 1T (free)</option>
          <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (free)</option>
          <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (free)</option>
          <option value="qwen/qwen3-235b-a22b:free">Qwen 3 235B (free)</option>
        </select>
      </div>
      <div class="provider-info">Free tier with rate limits</div>
    </div>

    <div class="provider-config" id="config-gemini">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsGeminiKey" placeholder="AIza..." />
          <button class="api-key-toggle" data-target="settingsGeminiKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsGeminiModel">
          <option value="gemini-2.5-flash">Gemini 2.5 Flash (free)</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro (paid)</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
        </select>
      </div>
      <div class="provider-info">Free tier (region dependent)</div>
    </div>

    <div class="provider-config" id="config-openai">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsOpenaiKey" placeholder="sk-..." />
          <button class="api-key-toggle" data-target="settingsOpenaiKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsOpenaiModel">
          <option value="gpt-4.1-mini">GPT-4.1 Mini — $0.40/1M</option>
          <option value="gpt-4.1-nano">GPT-4.1 Nano — $0.10/1M</option>
          <option value="gpt-4.1">GPT-4.1 — $2/1M</option>
          <option value="o4-mini">o4-mini — $1.10/1M</option>
          <option value="o3">o3 — $10/1M</option>
        </select>
      </div>
      <div class="provider-info">Pay-as-you-go</div>
    </div>

    <div class="provider-config" id="config-claude">
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsClaudeKey" placeholder="sk-ant-..." />
          <button class="api-key-toggle" data-target="settingsClaudeKey">&#128065;</button>
        </div>
      </div>
      <div class="settings-field">
        <label>Model</label>
        <select id="settingsClaudeModel">
          <option value="claude-sonnet-4-6-20250827">Sonnet 4.6 — $3/1M</option>
          <option value="claude-sonnet-4-20250514">Sonnet 4 — $3/1M</option>
          <option value="claude-haiku-4-5-20251001">Haiku 4.5 — $0.80/1M</option>
          <option value="claude-opus-4-6-20250904">Opus 4.6 — $15/1M</option>
        </select>
      </div>
      <div class="provider-info">Pay-as-you-go</div>
    </div>

    <div class="provider-config" id="config-local">
      <div class="settings-field">
        <label>Endpoint URL</label>
        <input type="text" id="settingsLocalEndpoint" placeholder="http://127.0.0.1:1234/v1/chat/completions" />
      </div>
      <div class="settings-field">
        <label>Model</label>
        <input type="text" id="settingsEndpointModel" placeholder="yi-coder-9b-chat" />
      </div>
      <div class="settings-field">
        <label>API Key</label>
        <div class="api-key-wrap">
          <input type="password" id="settingsLocalKey" placeholder="(optional)" />
          <button class="api-key-toggle" data-target="settingsLocalKey">&#128065;</button>
        </div>
      </div>
    </div>

    <button class="btn-save-settings" id="saveSettingsBtn" data-i18n="settings.save"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Save Settings</button>
    <div class="settings-saved" id="settingsSaved" data-i18n="settings.saved">Settings saved!</div>

    <button class="btn-reset-progress" id="resetProgressBtn" data-i18n="settings.resetProgress"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>Reset All Progress</button>
  </div><!-- /settingsPanel -->

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    let topics = {};
    let icons = {};
    let selectedLang = "Java";
    let selectedTopic = "__multi__";
    let selectedMode = "practice"; // "practice" or "bugfix"
    let selectedCodeSize = "snippet"; // "snippet" or "codebase"
    let selectedSource = "offline"; // "ai" or "offline"
    let customLang = "Java";
    let customPractices = []; // { id, title, lang, prompt, task, createdAt }
    let _isCustomMode = false;
    let _customPrompt = "";
    let _customModeLang = "Java";
    let hintVisible = false;

    // Progress state
    let progressStats = { totalPractices: 0, masteredTopics: 0, dueCount: 0, weakTopics: 0 };
    let recommendations = [];
    let topicStats = [];

    // i18n state
    let allTranslations = {};
    let currentUiLang = "en";
    let uiLanguages = [];

    function t(key) {
      const dict = allTranslations[currentUiLang] || allTranslations["en"] || {};
      return dict[key] || key;
    }

    function applyTranslations() {
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const val = t(key);
        if (val && val !== key) {
          // Preserve child SVG icons — only replace the text, not entire content
          const svg = el.querySelector("svg");
          if (svg) {
            Array.from(el.childNodes).forEach(n => { if (n.nodeType === 3) n.remove(); });
            svg.insertAdjacentText("afterend", val);
          } else {
            el.textContent = val;
          }
        }
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        const val = t(key);
        if (val && val !== key) el.placeholder = val;
      });
    }

    // Init language selector
    const uiLangSelect = document.getElementById("uiLangSelect");
    if (uiLangSelect) {
      uiLangSelect.addEventListener("change", () => {
        currentUiLang = uiLangSelect.value;
        applyTranslations();
        vscode.postMessage({ type: "setUiLang", lang: currentUiLang });
      });
    }

    // Enhance task text with keyword highlighting and tooltips
    function enhanceTask(text) {
      if (!text) return "—";

      // Strip code blocks from task text - code belongs only in the practice file
      var bt = String.fromCharCode(96);
      var codeBlockRe = new RegExp(bt+bt+bt+"[\\\\s\\\\S]*?"+bt+bt+bt, "g");
      let cleaned = text.replace(codeBlockRe, "").trim();
      // Also strip lines that look like code (indented with 4+ spaces or tabs)
      cleaned = cleaned.replace(/^[ \\t]{4,}.+$/gm, "").trim();
      // Remove consecutive blank lines
      cleaned = cleaned.replace(/\\n{3,}/g, "\\n\\n").trim();

      if (!cleaned) return "—";

      // Escape HTML
      let html = cleaned
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Replace inline code (backticks) with styled code
      html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');

      // Keywords with tooltips
      const keywords = {
        'int': ['kw-type', 'Integer - whole number type'],
        'String': ['kw-type', 'String - text type'],
        'boolean': ['kw-type', 'Boolean - true/false value'],
        'double': ['kw-type', 'Double - decimal number'],
        'float': ['kw-type', 'Float - decimal number'],
        'char': ['kw-type', 'Char - single character'],
        'void': ['kw-type', 'Void - returns nothing'],
        'ArrayList': ['kw-type', 'ArrayList - dynamic array'],
        'HashMap': ['kw-type', 'HashMap - key-value pairs'],
        'array': ['kw-type', 'Array - collection of elements'],
        'for': ['keyword', 'For loop - repeat'],
        'while': ['keyword', 'While loop - repeat while true'],
        'if': ['keyword', 'If - condition check'],
        'else': ['keyword', 'Else - when condition is false'],
        'switch': ['keyword', 'Switch - multi-value check'],
        'return': ['keyword', 'Return - send value back'],
        'method': ['kw-method', 'Method - reusable code block'],
        'function': ['kw-method', 'Function - reusable code block'],
        'println': ['kw-method', 'Print to console + new line'],
        'print': ['kw-method', 'Print to console'],
        'length': ['kw-method', 'Length of array or string'],
        'size': ['kw-method', 'Element count in collection'],
        'add': ['kw-method', 'Add element to collection'],
        'get': ['kw-method', 'Get element at index'],
        'true': ['kw-value', 'Boolean true value'],
        'false': ['kw-value', 'Boolean false value'],
        'null': ['kw-value', 'Null - empty reference'],
      };

      // Replace keywords - use placeholders to avoid double-replacement
      const placeholders = [];
      for (const [word, info] of Object.entries(keywords)) {
        const regex = new RegExp('\\\\b' + word + '\\\\b', 'g');
        html = html.replace(regex, function() {
          const ph = "\\x00PH" + placeholders.length + "\\x00";
          placeholders.push('<span class="' + info[0] + '" data-tip="' + info[1] + '">' + word + '</span>');
          return ph;
        });
      }
      // Restore placeholders
      for (let i = 0; i < placeholders.length; i++) {
        html = html.split("\\x00PH" + i + "\\x00").join(placeholders[i]);
      }

      // Line breaks
      html = html.replace(/\\n/g, "<br>");

      return html;
    }

    const langRow = document.getElementById("langRow");
    const topicGrid = document.getElementById("topicGrid");
    const genBtn = document.getElementById("genBtn");
    const practiceForm = document.getElementById("practiceForm");
    const practiceTopbar = document.getElementById("practiceTopbar");
    const topbarBackBtn = document.getElementById("topbarBackBtn");
    const topbarGenBtn = document.getElementById("topbarGenBtn");
    const detailsWrap = document.getElementById("detailsWrap");
    const toast = document.getElementById("toast");
    const spin = document.getElementById("spin");
    const hintToggle = document.getElementById("hintToggle");
    const hintBody = document.getElementById("hintBody");
    const teachBtn = document.getElementById("teachBtn");
    const solutionWrap = document.getElementById("solutionWrap");
    const retryBtn = document.getElementById("retryBtn");
    const runBtn = document.getElementById("runBtn");
    const judgeBtn = document.getElementById("judgeBtn");
    const outputWrap = document.getElementById("outputWrap");
    const outputEl = document.getElementById("output");
    const testCasesList = document.getElementById("testCasesList");
    const resultBadge = document.getElementById("resultBadge");
    const perfCard = document.getElementById("perfCard");
    const perfTime = document.getElementById("perfTime");
    const perfLabel = document.getElementById("perfLabel");
    const perfGaugeFill = document.getElementById("perfGaugeFill");
    const perfNeedle = document.getElementById("perfNeedle");

    function showPerfCard(ms) {
      if (!perfCard || ms == null) { if (perfCard) perfCard.classList.remove("show"); return; }
      // Format time
      perfTime.textContent = ms < 1000 ? ms + " ms" : (ms / 1000).toFixed(2) + " s";
      // Classify speed quality
      var grade, cls, color;
      if (ms < 200)       { grade = "Excellent"; cls = "excellent"; color = "var(--good)"; }
      else if (ms < 800)  { grade = "Good";      cls = "good";      color = "#22d3ee"; }
      else if (ms < 2000) { grade = "Sufficient"; cls = "sufficient"; color = "var(--accent)"; }
      else if (ms < 5000) { grade = "Slow";       cls = "slow";       color = "#f59e0b"; }
      else                { grade = "Very Slow";   cls = "very-slow";  color = "var(--bad, #ef4444)"; }
      perfLabel.textContent = grade;
      perfLabel.className = "perf-label " + cls;
      // Gauge: map ms to 0-100% of arc (82 dash units). Lower ms = more fill
      var ratio = Math.min(1, Math.max(0, 1 - ms / 5000));
      var offset = 82 - ratio * 82;
      if (perfGaugeFill) {
        perfGaugeFill.style.strokeDashoffset = String(offset);
        perfGaugeFill.style.stroke = color;
      }
      // Needle: rotate from -90deg (fast/left) to +90deg (slow/right)
      var angle = -90 + (1 - ratio) * 180;
      if (perfNeedle) perfNeedle.style.transform = "rotate(" + angle + "deg)";
      perfCard.classList.add("show");
    }
    const hintCodeBtn = document.getElementById("hintCodeBtn");
    const ghostModeBtn = document.getElementById("ghostModeBtn");
    const showSolutionBtn = document.getElementById("showSolutionBtn");
    const nextPracticeBtn = document.getElementById("nextPracticeBtn");
    const similarPracticeBtn = document.getElementById("similarPracticeBtn");
    const passButtons = document.getElementById("passButtons");
    const levelBadge = document.getElementById("levelBadge");

    // XP bar elements
    const practiceXpFill = document.getElementById("practiceXpFill");
    const practiceXpCount = document.getElementById("practiceXpCount");

    // Chat button (opens separate panel)
    const openChatBtn = document.getElementById("openChatBtn");

    // Loading overlay elements
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingIcon = document.getElementById("loadingIcon");
    const loadingText = document.getElementById("loadingText");
    const loadingTip = document.getElementById("loadingTip");

    // Loading tips to show randomly (use translation keys)
    const loadingTipKeys = [
      "tip.analyzing",
      "tip.generating",
      "tip.processing",
      "tip.almostReady",
      "tip.preparing",
      "tip.building"
    ];

    let currentLoadingAction = "";
    let loadingTimeoutId = null;

    function showLoading(show, action = "") {
      if (show) {
        currentLoadingAction = action;
        loadingOverlay.classList.add("show");
        var lbi = document.getElementById("loadingBarInner");
        var lpc = document.getElementById("loadingPct");
        if (lbi) lbi.style.width = "0%";
        if (lpc) lpc.textContent = "";

        // Set text based on action
        if (action === "generate") {
          loadingText.textContent = t("loading.generatingPractice");
        } else if (action === "judge") {
          loadingText.textContent = t("loading.checkingCode");
        } else if (action === "run") {
          loadingText.textContent = t("loading.runningCode");
        } else if (action === "teach") {
          loadingText.textContent = t("loading.preparingSolution");
        } else if (action === "hint") {
          loadingText.textContent = t("loading.addingHints");
        } else {
          loadingText.textContent = t("loading.working");
        }

        // Random tip
        var tipKey = loadingTipKeys[Math.floor(Math.random() * loadingTipKeys.length)];
        loadingTip.textContent = t(tipKey);

        // Auto-timeout: force-hide overlay after 30 seconds to prevent permanent stuck
        if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
        loadingTimeoutId = setTimeout(function() {
          loadingOverlay.classList.remove("show");
          currentLoadingAction = "";
          loadingTimeoutId = null;
          // Re-enable buttons in case busy:false never arrived
          if (genBtn) genBtn.disabled = false;
          if (topbarGenBtn) topbarGenBtn.disabled = false;
          if (runBtn) runBtn.disabled = false;
          if (judgeBtn) judgeBtn.disabled = false;
          if (teachBtn) teachBtn.disabled = false;
          if (showSolutionBtn) showSolutionBtn.disabled = false;
          if (hintCodeBtn) hintCodeBtn.disabled = false;
          if (quickSolveBtn) quickSolveBtn.disabled = false;
        }, 30000);
      } else {
        loadingOverlay.classList.remove("show");
        currentLoadingAction = "";
        if (loadingTimeoutId) { clearTimeout(loadingTimeoutId); loadingTimeoutId = null; }
      }
    }

    // Progress panel elements
    const practicePanel = document.getElementById("practicePanel");
    const statDue = document.getElementById("statDue");
    const statWeak = document.getElementById("statWeak");
    const statMastered = document.getElementById("statMastered");
    const statTotal = document.getElementById("statTotal");
    const recList = document.getElementById("recList");
    const topicProgressList = document.getElementById("topicProgressList");
    const dueNumber = document.getElementById("dueNumber");
    const reviewDueBtn = document.getElementById("reviewDueBtn");
    const streakBanner = document.getElementById("streakBanner");
    const streakCount = document.getElementById("streakCount");
    const streakBest = document.getElementById("streakBest");

    // Tab switching
    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const panelId = tab.dataset.tab + "Panel";
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.classList.add("active");
        }

        // Refresh progress when switching to progress tab
        if (tab.dataset.tab === "progress") {
          vscode.postMessage({ type: "getProgress" });
        }
        // Load custom practices when switching to custom tab
        if (tab.dataset.tab === "custom") {
          vscode.postMessage({ type: "getCustomPractices" });
        }
      });
    });

    // Custom Practice Panel Logic
    var customLangRow = document.getElementById("customLangRow");
    var customPromptInput = document.getElementById("customPromptInput");
    var customGenBtn = document.getElementById("customGenBtn");
    var customHistoryList = document.getElementById("customHistoryList");

    function renderCustomLangButtons() {
      if (!customLangRow) return;
      customLangRow.innerHTML = "";
      Object.keys(topics).forEach(function(lang) {
        var b = document.createElement("button");
        b.className = "lang-btn" + (lang === customLang ? " active" : "");
        var icon = icons[lang] || "";
        b.textContent = icon ? icon + " " + lang : lang;
        b.onclick = function() {
          customLang = lang;
          renderCustomLangButtons();
        };
        customLangRow.appendChild(b);
      });
    }

    function renderCustomHistory() {
      if (!customHistoryList) return;
      if (!customPractices || customPractices.length === 0) {
        customHistoryList.innerHTML = '<div style="font-size:11px;color:var(--vscode-descriptionForeground);padding:8px 0;">' + t("custom.empty") + '</div>';
        return;
      }
      customHistoryList.innerHTML = "";
      customPractices.slice().reverse().forEach(function(cp) {
        var div = document.createElement("div");
        div.className = "custom-history-item";

        var info = document.createElement("div");
        info.className = "custom-history-item-info";

        var title = document.createElement("div");
        title.className = "custom-history-item-title";
        title.textContent = cp.title;

        var meta = document.createElement("div");
        meta.className = "custom-history-item-meta";
        meta.textContent = cp.lang + " \u2022 " + (cp.prompt || "").slice(0, 50);

        info.appendChild(title);
        info.appendChild(meta);

        var del = document.createElement("button");
        del.className = "custom-history-item-delete";
        del.textContent = "\u00d7";
        del.title = "Delete";
        del.onclick = function(e) {
          e.stopPropagation();
          vscode.postMessage({ type: "deleteCustomPractice", id: cp.id });
        };

        div.appendChild(info);
        div.appendChild(del);

        div.onclick = function() {
          customPromptInput.value = cp.prompt || "";
          customLang = cp.lang || "Java";
          renderCustomLangButtons();
          // Auto-generate
          currentLoadingAction = "generate";
          vscode.postMessage({ type: "generateCustom", prompt: cp.prompt, lang: customLang });
        };

        customHistoryList.appendChild(div);
      });
    }

    if (customGenBtn) {
      customGenBtn.addEventListener("click", function() {
        var prompt = (customPromptInput ? customPromptInput.value : "").trim();
        if (!prompt) {
          showToast("error", "Please describe what you want to practice");
          return;
        }
        currentLoadingAction = "generate";
        vscode.postMessage({ type: "generateCustom", prompt: prompt, lang: customLang });
      });
    }

    // Custom panel: "Open Settings" button in offline overlay
    var customGoSettingsBtn = document.getElementById("customGoSettingsBtn");
    if (customGoSettingsBtn) {
      customGoSettingsBtn.addEventListener("click", function() {
        // Switch to settings tab
        document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
        document.querySelectorAll(".panel").forEach(function(p) { p.classList.remove("active"); });
        var settingsTab = document.querySelector('.tab[data-tab="settings"]');
        var settingsPanel = document.getElementById("settingsPanel");
        if (settingsTab) settingsTab.classList.add("active");
        if (settingsPanel) settingsPanel.classList.add("active");
      });
    }

    // Custom panel: "Switch to AI" button (shown when API key exists but source is offline)
    var customSwitchAiBtn = document.getElementById("customSwitchAiBtn");
    if (customSwitchAiBtn) {
      customSwitchAiBtn.addEventListener("click", function() {
        selectedSource = "ai";
        document.querySelectorAll("#sourceToggle .mode-btn").forEach(function(b) {
          b.classList.toggle("active", b.dataset.source === "ai");
        });
        vscode.postMessage({ type: "setForceOffline", forceOffline: false });
        updateOfflineIndicators();
        updateConfigBanner(currentProvider);
        // Switch back to custom tab to show the form
        document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
        document.querySelectorAll(".panel").forEach(function(p) { p.classList.remove("active"); });
        var customTab = document.querySelector('.tab[data-tab="custom"]');
        var customPanel = document.getElementById("customPanel");
        if (customTab) customTab.classList.add("active");
        if (customPanel) customPanel.classList.add("active");
        vscode.postMessage({ type: "getCustomPractices" });
      });
    }

    // Re-generate button in details panel (edit custom prompt and regenerate)
    var customRegenBtn = document.getElementById("customRegenBtn");
    if (customRegenBtn) {
      customRegenBtn.addEventListener("click", function() {
        var cpEdit = document.getElementById("customPromptEdit");
        var newPrompt = cpEdit ? cpEdit.value.trim() : "";
        if (!newPrompt) {
          showToast("error", "Please describe what you want to practice");
          return;
        }
        _customPrompt = newPrompt;
        currentLoadingAction = "generate";
        vscode.postMessage({ type: "generateCustom", prompt: newPrompt, lang: _customModeLang });
      });
    }

    // Settings Panel Logic
    var currentProvider = "groq";
    const settingsGearBtn = document.getElementById("settingsGearBtn");
    const settingsPanel = document.getElementById("settingsPanel");
    const providerCards = document.querySelectorAll(".provider-card");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const settingsSavedMsg = document.getElementById("settingsSaved");

    // Gear button toggles settings panel
    settingsGearBtn.addEventListener("click", () => {
      const isActive = settingsPanel.classList.contains("active");
      // Hide all panels and deactivate tabs
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      if (!isActive) {
        settingsPanel.classList.add("active");
      } else {
        // Go back to practice tab
        document.querySelector('.tab[data-tab="practice"]').classList.add("active");
        practicePanel.classList.add("active");
      }
    });

    function showProviderConfig(provider) {
      currentProvider = provider;
      providerCards.forEach(c => c.classList.toggle("active", c.dataset.provider === provider));
      document.querySelectorAll(".provider-config").forEach(c => c.classList.remove("active"));
      var configId = "config-" + provider;
      var cfg = document.getElementById(configId);
      if (cfg) cfg.classList.add("active");
    }

    providerCards.forEach(card => {
      card.addEventListener("click", () => {
        showProviderConfig(card.dataset.provider);
      });
    });

    // Show/hide API key
    document.querySelectorAll(".api-key-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        var input = document.getElementById(btn.dataset.target);
        if (input) {
          input.type = input.type === "password" ? "text" : "password";
        }
      });
    });

    // Provider display names
    var providerDisplayNames = { groq: "Groq", cerebras: "Cerebras", together: "Together", openrouter: "OpenRouter", gemini: "Gemini", openai: "OpenAI", claude: "Claude", local: "Local" };

    // Get the currently selected model name for a provider
    function getSelectedModelLabel(provider) {
      var selectors = {
        groq: "settingsGroqModel", cerebras: "settingsCerebrasModel", together: "settingsTogetherModel",
        openrouter: "settingsOpenrouterModel", gemini: "settingsGeminiModel", openai: "settingsOpenaiModel",
        claude: "settingsClaudeModel", local: "settingsEndpointModel"
      };
      var sel = document.getElementById(selectors[provider]);
      if (!sel) return "";
      if (sel.tagName === "SELECT") { return sel.options[sel.selectedIndex]?.text || sel.value; }
      return sel.value || "Custom";
    }

    // Update the active config banner
    function isCurrentlyOffline() {
      var prov = currentProvider || "groq";
      var keyFields = {
        groq: "settingsGroqKey", gemini: "settingsGeminiKey", openai: "settingsOpenaiKey",
        claude: "settingsClaudeKey", cerebras: "settingsCerebrasKey", together: "settingsTogetherKey",
        openrouter: "settingsOpenrouterKey", local: "settingsLocalKey"
      };
      var keyEl = document.getElementById(keyFields[prov]);
      if (prov === "local") {
        var ep = document.getElementById("settingsLocalEndpoint");
        return !(ep && ep.value) && !(keyEl && keyEl.value);
      }
      return !(keyEl && keyEl.value);
    }

    function updateOfflineIndicators() {
      var offline = isCurrentlyOffline() || selectedSource === "offline";
      var badge = document.getElementById("offlineBadge");
      var banner = document.getElementById("currentConfigBanner");
      if (badge) badge.classList.toggle("show", offline);
      if (banner) banner.classList.toggle("offline", offline);

      // Custom panel: show overlay & hide form/history when offline
      var customOverlay = document.getElementById("customOfflineOverlay");
      var customForm = document.getElementById("customFormSection");
      var customSubtitle = document.getElementById("customSubtitle");
      var customHistory = document.getElementById("customHistorySection");
      var customSettingsBtn = document.getElementById("customGoSettingsBtn");
      var customSwitchBtn = document.getElementById("customSwitchAiBtn");
      var customOfflineDesc = customOverlay ? customOverlay.querySelector(".custom-offline-desc") : null;
      if (customOverlay) customOverlay.style.display = offline ? "flex" : "none";
      if (customForm) customForm.style.display = offline ? "none" : "";
      if (customSubtitle) customSubtitle.style.display = offline ? "none" : "";
      if (customHistory) customHistory.style.display = offline ? "none" : "";
      // Determine: no API key vs has API key but source=offline
      var noApiKey = isCurrentlyOffline();
      var hasKeyButOffline = !noApiKey && selectedSource === "offline";
      if (customSettingsBtn) customSettingsBtn.style.display = noApiKey ? "" : "none";
      if (customSwitchBtn) customSwitchBtn.style.display = hasKeyButOffline ? "" : "none";
      if (customOfflineDesc && hasKeyButOffline) {
        customOfflineDesc.innerHTML = t("custom.aiModeRequiredDesc");
      } else if (customOfflineDesc && noApiKey) {
        customOfflineDesc.innerHTML = t("custom.aiRequiredDesc");
      }

      // AI Chat button: disable when offline
      var chatBtn = document.getElementById("openChatBtn");
      if (chatBtn) {
        chatBtn.disabled = offline;
        chatBtn.title = offline ? "AI Chat (requires AI provider)" : "AI Chat";
        chatBtn.style.opacity = offline ? "0.4" : "";
        chatBtn.style.cursor = offline ? "not-allowed" : "";
      }
    }

    function updateConfigBanner(provider) {
      var bn = document.getElementById("bannerProviderName");
      var bm = document.getElementById("bannerModelName");
      var offline = isCurrentlyOffline();
      if (offline) {
        if (bn) bn.textContent = "Offline Mode";
        if (bm) bm.textContent = "140+ built-in practices";
      } else {
        if (bn) bn.textContent = providerDisplayNames[provider] || provider;
        if (bm) bm.textContent = getSelectedModelLabel(provider);
      }
      // Mark saved provider card
      providerCards.forEach(c => c.classList.toggle("saved", c.dataset.provider === provider));
      updateOfflineIndicators();
    }

    // Save settings
    saveSettingsBtn.addEventListener("click", () => {
      var epKey = "";
      if (currentProvider === "cerebras") epKey = document.getElementById("settingsCerebrasKey").value || "";
      else if (currentProvider === "together") epKey = document.getElementById("settingsTogetherKey").value || "";
      else if (currentProvider === "openrouter") epKey = document.getElementById("settingsOpenrouterKey").value || "";
      else if (currentProvider === "local") epKey = document.getElementById("settingsLocalKey").value || "";

      var settings = {
        provider: currentProvider,
        localEndpoint: document.getElementById("settingsLocalEndpoint").value || "http://127.0.0.1:1234/v1/chat/completions",
        groqApiKey: document.getElementById("settingsGroqKey").value || "",
        groqModel: document.getElementById("settingsGroqModel").value || "openai/gpt-oss-120b",
        cerebrasApiKey: document.getElementById("settingsCerebrasKey").value || "",
        cerebrasModel: document.getElementById("settingsCerebrasModel").value || "qwen-3-235b-a22b-instruct-2507",
        togetherApiKey: document.getElementById("settingsTogetherKey").value || "",
        togetherModel: document.getElementById("settingsTogetherModel").value || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        openrouterApiKey: document.getElementById("settingsOpenrouterKey").value || "",
        openrouterModel: document.getElementById("settingsOpenrouterModel").value || "nvidia/nemotron-3-super-120b-a12b:free",
        geminiApiKey: document.getElementById("settingsGeminiKey").value || "",
        geminiModel: document.getElementById("settingsGeminiModel").value || "gemini-2.5-flash",
        openaiApiKey: document.getElementById("settingsOpenaiKey").value || "",
        openaiModel: document.getElementById("settingsOpenaiModel").value || "gpt-4.1-mini",
        claudeApiKey: document.getElementById("settingsClaudeKey").value || "",
        claudeModel: document.getElementById("settingsClaudeModel").value || "claude-sonnet-4-6-20250827",
        localApiKey: document.getElementById("settingsLocalKey").value || "",
        endpointApiKey: epKey,
        endpointModel: document.getElementById("settingsEndpointModel").value || "yi-coder-9b-chat"
      };
      vscode.postMessage({ type: "saveSettings", settings: settings });
      updateConfigBanner(currentProvider);
      updateOfflineIndicators();
      updateSourceToggle();
    });

    // Reset progress button — double-click to confirm (webview has no confirm dialog)
    var resetProgressBtn = document.getElementById("resetProgressBtn");
    if (resetProgressBtn) {
      var _resetPending = false;
      var _resetTimer = null;
      resetProgressBtn.addEventListener("click", function() {
        if (_resetPending) {
          clearTimeout(_resetTimer);
          _resetPending = false;
          resetProgressBtn.textContent = t("settings.resetProgress") || "Reset All Progress";
          vscode.postMessage({ type: "resetProgress" });
        } else {
          _resetPending = true;
          resetProgressBtn.textContent = t("settings.resetConfirmClick") || "Click again to confirm";
          resetProgressBtn.style.background = "rgba(239,68,68,0.3)";
          _resetTimer = setTimeout(function() {
            _resetPending = false;
            resetProgressBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' + (t("settings.resetProgress") || "Reset All Progress");
            resetProgressBtn.style.background = "";
          }, 3000);
        }
      });
    }

    // Load settings from init
    function loadSettingsUI(s) {
      if (!s) return;
      var prov = s.provider || "groq";
      showProviderConfig(prov);
      document.getElementById("settingsLocalEndpoint").value = s.localEndpoint || "";
      document.getElementById("settingsEndpointModel").value = s.endpointModel || "yi-coder-9b-chat";
      document.getElementById("settingsGroqKey").value = s.groqApiKey || "";
      document.getElementById("settingsGroqModel").value = s.groqModel || "openai/gpt-oss-120b";
      document.getElementById("settingsCerebrasKey").value = s.cerebrasApiKey || "";
      document.getElementById("settingsCerebrasModel").value = s.cerebrasModel || "qwen-3-235b-a22b-instruct-2507";
      document.getElementById("settingsTogetherKey").value = s.togetherApiKey || "";
      document.getElementById("settingsTogetherModel").value = s.togetherModel || "meta-llama/Llama-3.3-70B-Instruct-Turbo";
      document.getElementById("settingsOpenrouterKey").value = s.openrouterApiKey || "";
      document.getElementById("settingsOpenrouterModel").value = s.openrouterModel || "nvidia/nemotron-3-super-120b-a12b:free";
      document.getElementById("settingsGeminiKey").value = s.geminiApiKey || "";
      document.getElementById("settingsGeminiModel").value = s.geminiModel || "gemini-2.5-flash";
      document.getElementById("settingsOpenaiKey").value = s.openaiApiKey || "";
      document.getElementById("settingsOpenaiModel").value = s.openaiModel || "gpt-4.1-mini";
      document.getElementById("settingsClaudeKey").value = s.claudeApiKey || "";
      document.getElementById("settingsClaudeModel").value = s.claudeModel || "claude-sonnet-4-6-20250827";
      document.getElementById("settingsLocalKey").value = s.localApiKey || "";
      var epKey = s.endpointApiKey || "";
      if (epKey) {
        if (!s.cerebrasApiKey && s.provider === "cerebras") document.getElementById("settingsCerebrasKey").value = epKey;
        else if (!s.togetherApiKey && s.provider === "together") document.getElementById("settingsTogetherKey").value = epKey;
        else if (!s.openrouterApiKey && s.provider === "openrouter") document.getElementById("settingsOpenrouterKey").value = epKey;
        else if (!s.localApiKey && s.provider === "local") document.getElementById("settingsLocalKey").value = epKey;
      }
      updateConfigBanner(prov);
    }

    // Render progress stats
    function renderProgressStats(stats) {
      if (!stats) return;
      progressStats = stats;

      if (statDue) statDue.textContent = stats.dueCount || 0;
      if (statWeak) statWeak.textContent = stats.weakTopics || 0;
      if (statMastered) statMastered.textContent = stats.masteredTopics || 0;
      if (statTotal) statTotal.textContent = stats.totalPractices || 0;
      if (dueNumber) dueNumber.textContent = stats.dueCount || 0;

      // Streak display
      var streak = stats.currentStreak || 0;
      if (streakBanner) {
        if (streak > 0) {
          streakBanner.classList.add("show");
          if (streakCount) streakCount.textContent = streak + " " + t("progress.dayStreak");
          if (streakBest && stats.bestStreak) {
            streakBest.textContent = t("progress.best") + " " + stats.bestStreak;
          }
        } else {
          streakBanner.classList.remove("show");
        }
      }

      // XP Level Bar (real XP data from progressTracker)
      var totalXP = stats.totalXP || 0;
      var xpPerLevel = stats.xpNeeded || 200;
      var level = stats.globalLevel || 1;
      var xpInLevel = stats.xpInLevel || 0;
      var pct = xpPerLevel > 0 ? Math.round((xpInLevel / xpPerLevel) * 100) : 0;

      var xpBarFill = document.getElementById("xpBarFill");
      var xpLevel = document.getElementById("xpLevel");
      var xpCount = document.getElementById("xpCount");
      var xpNext = document.getElementById("xpNext");

      if (xpBarFill) xpBarFill.style.width = pct + "%";
      if (xpLevel) xpLevel.textContent = t("progress.level") + " " + level;
      if (xpCount) xpCount.textContent = xpInLevel + " / " + xpPerLevel + " " + t("progress.xp");
      if (xpNext) xpNext.textContent = (xpPerLevel - xpInLevel) + " " + t("progress.xpToNext");
    }

    // Render recommendations
    function renderRecommendations(recs) {
      if (!recList) return;
      if (!recs || recs.length === 0) {
        recList.innerHTML = '<div class="rec-item"><span class="rec-type">-</span><div class="rec-info"><div class="rec-topic">' + t("progress.startPracticing") + '</div><div class="rec-reason">' + t("progress.pickTopic") + '</div></div></div>';
        return;
      }
      recommendations = recs;

      recList.innerHTML = "";
      const typeIcons = { due: "!", weak: "~", interleave: "*", new: "+" };
      const typeReasons = {
        due: t("rec.timeToReview"),
        weak: t("rec.weakTopic"),
        interleave: t("rec.mixItUp"),
        new: t("rec.newTopic")
      };

      recs.slice(0, 5).forEach(rec => {
        const div = document.createElement("div");
        div.className = "rec-item " + rec.type;

        const icon = document.createElement("span");
        icon.className = "rec-type";
        icon.textContent = typeIcons[rec.type] || "-";

        const info = document.createElement("div");
        info.className = "rec-info";

        const topic = document.createElement("div");
        topic.className = "rec-topic";
        topic.textContent = rec.lang + " - " + rec.topic;

        const reason = document.createElement("div");
        reason.className = "rec-reason";
        reason.textContent = typeReasons[rec.type] || rec.reason;

        info.appendChild(topic);
        info.appendChild(reason);
        div.appendChild(icon);
        div.appendChild(info);

        div.onclick = () => {
          // Switch to practice tab and select this topic
          document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
          document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
          document.querySelector('.tab[data-tab="practice"]').classList.add("active");
          practicePanel.classList.add("active");

          selectedLang = rec.lang;
          selectedTopic = rec.topic;
          renderLangButtons();
          renderTopics();

          // Auto-generate
          currentLoadingAction = "generate";
          vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
        };

        recList.appendChild(div);
      });
    }

    // Render topic progress
    function renderTopicProgress(topics) {
      if (!topicProgressList) return;
      if (!topics || topics.length === 0) {
        topicProgressList.innerHTML = '<div class="topic-progress-item"><span class="topic-progress-name">No data yet</span><div class="topic-progress-bar"><div class="topic-progress-fill" style="width: 0%"></div></div><span class="topic-progress-pct">0%</span></div>';
        return;
      }
      topicStats = topics;

      topicProgressList.innerHTML = "";
      topics.forEach(t => {
        const div = document.createElement("div");
        div.className = "topic-progress-item";

        const name = document.createElement("span");
        name.className = "topic-progress-name";
        name.textContent = t.lang + " - " + t.topic;

        const bar = document.createElement("div");
        bar.className = "topic-progress-bar";
        const fill = document.createElement("div");
        fill.className = "topic-progress-fill";
        fill.style.width = Math.round(t.averageRetention) + "%";
        bar.appendChild(fill);

        const pct = document.createElement("span");
        pct.className = "topic-progress-pct";
        pct.textContent = Math.round(t.averageRetention) + "%";

        div.appendChild(name);
        div.appendChild(bar);
        div.appendChild(pct);
        topicProgressList.appendChild(div);
      });
    }

    // Review due button
    reviewDueBtn.addEventListener("click", () => {
      // Find first due recommendation and start it
      const dueRec = recommendations.find(r => r.type === "due");
      if (dueRec) {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        document.querySelector('.tab[data-tab="practice"]').classList.add("active");
        practicePanel.classList.add("active");

        selectedLang = dueRec.lang;
        selectedTopic = dueRec.topic;
        renderLangButtons();
        renderTopics();

        currentLoadingAction = "generate";
        vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
      } else {
        showToast("ok", t("progress.noReviewsDue"));
      }
    });

    // Run button
    runBtn.addEventListener("click", () => {
      if (runBtn.disabled) return;
      runBtn.disabled = true;
      judgeBtn.disabled = true;
      currentLoadingAction = "run";
      vscode.postMessage({ type: "run" });
    });

    // Judge button
    judgeBtn.addEventListener("click", () => {
      if (judgeBtn.disabled) return;
      runBtn.disabled = true;
      judgeBtn.disabled = true;
      currentLoadingAction = "judge";
      vscode.postMessage({ type: "judge" });
    });

    // Hint code button - add hints to current code (or reveal bug in bugfix mode)
    var _isBugFixMode = false;
    hintCodeBtn.addEventListener("click", () => {
      if (hintCodeBtn.disabled) return;
      if (_isBugFixMode) {
        // Reveal bug explanation
        var bugExItem = document.getElementById("bugExplanationItem");
        var bugExBody = document.getElementById("bugExplanationBody");
        if (bugExItem && window._bugExplanation) {
          bugExItem.style.display = "block";
          bugExBody.textContent = window._bugExplanation;
          hintCodeBtn.disabled = true;
          // Notify backend so hintUsed is set (prevents XP)
          vscode.postMessage({ type: "hintViewed" });
        }
        return;
      }
      hintCodeBtn.disabled = true;
      currentLoadingAction = "hint";
      vscode.postMessage({ type: "addHints" });
    });

    // Show solution button - open solution in side panel
    showSolutionBtn.addEventListener("click", () => {
      if (showSolutionBtn.disabled) return;
      showSolutionBtn.disabled = true;
      currentLoadingAction = "teach";
      vscode.postMessage({ type: "showSolution" });
    });

    // Next practice button - generate different practice after PASS
    nextPracticeBtn.addEventListener("click", () => {
      passButtons.classList.remove("show");
      currentLoadingAction = "generate";
      if (_isCustomMode && _customPrompt) {
        vscode.postMessage({ type: "generateCustom", prompt: _customPrompt, lang: _customModeLang });
      } else {
        vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
      }
    });

    // Similar practice button - same exercise, different values
    similarPracticeBtn.addEventListener("click", () => {
      passButtons.classList.remove("show");
      currentLoadingAction = "generate";
      if (_isCustomMode && _customPrompt) {
        vscode.postMessage({ type: "generateCustom", prompt: _customPrompt, lang: _customModeLang });
      } else {
        vscode.postMessage({ type: "similarPractice", lang: selectedLang, topic: selectedTopic });
      }
    });

    // Level up removed — levels are now XP-based (auto level up)

    // Hint toggle
    hintToggle.addEventListener("click", () => {
      hintVisible = !hintVisible;
      hintBody.classList.toggle("show", hintVisible);
      hintToggle.textContent = hintVisible ? t("hint.hide") : t("hint.show");
      if (hintVisible) { vscode.postMessage({ type: "hintViewed" }); }
    });

    // Teach me button
    teachBtn.addEventListener("click", () => {
      if (teachBtn.disabled) return;
      teachBtn.disabled = true;
      currentLoadingAction = "teach";
      vscode.postMessage({ type: "teachMe", lang: selectedLang, topic: selectedTopic });
    });

    // Try similar button
    retryBtn.addEventListener("click", () => {
      solutionWrap.classList.remove("show");
      teachBtn.style.display = "block";
      currentLoadingAction = "generate";
      vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
    });

    // Open AI Chat panel
    openChatBtn.addEventListener("click", () => {
      var offline = isCurrentlyOffline() || selectedSource === "offline";
      if (offline) {
        showToast("warn", "AI Chat requires an AI provider. Configure an API key in Settings.");
        return;
      }
      vscode.postMessage({ type: "openChat" });
    });

    // Quick Solve - apply solution to file
    const quickSolveBtn = document.getElementById("quickSolveBtn");
    if (quickSolveBtn) quickSolveBtn.addEventListener("click", () => {
      if (quickSolveBtn.disabled) return;
      teachBtn.disabled = true;
      showSolutionBtn.disabled = true;
      hintCodeBtn.disabled = true;
      quickSolveBtn.disabled = true;
      currentLoadingAction = "teach";
      vscode.postMessage({ type: "quickSolve", lang: selectedLang, topic: selectedTopic });
    });

    // Ghost Mode - toggle ghost text teaching
    if (ghostModeBtn) {
      ghostModeBtn.addEventListener("click", function() {
        vscode.postMessage({ type: "toggleGhostMode" });
      });
    }

    const altMethodsAnchor = document.getElementById("altMethodsAnchor");
    var altMethodsWrap = null;
    var altMethodsList = null;
    var altMethodsLoaded = false;
    var practiceSkipped = false;

    function createAltMethodsWrap() {
      if (altMethodsWrap) return;
      altMethodsWrap = document.createElement("div");
      altMethodsWrap.className = "alt-methods-wrap";
      altMethodsWrap.id = "altMethodsWrap";
      var header = document.createElement("div");
      header.className = "item-head";
      header.innerHTML = '<span class="item-label">' + t("practice.altMethods") + '</span>';
      altMethodsWrap.appendChild(header);
      altMethodsList = document.createElement("div");
      altMethodsList.id = "altMethodsList";
      altMethodsWrap.appendChild(altMethodsList);
      if (altMethodsAnchor) {
        altMethodsAnchor.parentNode.insertBefore(altMethodsWrap, altMethodsAnchor);
      }
    }

    function removeAltMethodsWrap() {
      if (altMethodsWrap) {
        altMethodsWrap.remove();
        altMethodsWrap = null;
        altMethodsList = null;
      }
      altMethodsLoaded = false;
    }

    // Cross-language button + dropdown
    const crossLangBtn = document.getElementById("crossLangBtn");
    const crossLangDropdown = document.getElementById("crossLangDropdown");
    if (crossLangBtn && crossLangDropdown) {
      crossLangBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        var isOpen = crossLangDropdown.classList.contains("show");
        if (!isOpen) {
          var rect = crossLangBtn.getBoundingClientRect();
          crossLangDropdown.style.position = "fixed";
          crossLangDropdown.style.left = rect.left + "px";
          crossLangDropdown.style.bottom = (window.innerHeight - rect.top + 4) + "px";
          crossLangDropdown.style.top = "auto";
        }
        crossLangDropdown.classList.toggle("show");
      });
      // Close dropdown on outside click
      document.addEventListener("click", function() {
        crossLangDropdown.classList.remove("show");
      });
      crossLangDropdown.addEventListener("click", function(e) { e.stopPropagation(); });
    }

    // API Preview button
    const apiPreviewBtn = document.getElementById("apiPreviewBtn");
    if (apiPreviewBtn) {
      apiPreviewBtn.addEventListener("click", function() {
        vscode.postMessage({ type: "openApiPreview" });
      });
    }

    function escHtml(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    function highlightCode(code) {
      var tokens = [];
      var i = 0;
      while (i < code.length) {
        if (code[i] === "/" && code[i+1] === "/") {
          var end = code.indexOf("\\n", i);
          if (end === -1) end = code.length;
          tokens.push({type:"comment",text:code.slice(i,end)});
          i = end;
        } else if (code[i] === "/" && code[i+1] === "*") {
          var end2 = code.indexOf("*/", i+2);
          if (end2 === -1) end2 = code.length; else end2 += 2;
          tokens.push({type:"comment",text:code.slice(i,end2)});
          i = end2;
        } else if (code[i] === '"' || code[i] === "'") {
          var q = code[i], j = i+1;
          while (j < code.length && code[j] !== q) { if (code[j] === "\\\\") j++; j++; }
          tokens.push({type:"string",text:code.slice(i,j+1)});
          i = j+1;
        } else {
          var ch = code[i];
          tokens.push({type:"code",text:ch});
          i++;
        }
      }
      var KW = "public,private,protected,static,final,void,class,interface,extends,implements,import,package,return,if,else,for,while,do,switch,case,break,continue,new,try,catch,finally,throw,throws,this,super,int,double,float,long,short,byte,char,boolean,String,var,let,const,function,async,await,export,default,from,type,enum,abstract,instanceof,typeof,null,true,false,undefined,System,console";
      var kwSet = {};
      KW.split(",").forEach(function(k){ kwSet[k]=1; });
      var out = "";
      for (var t = 0; t < tokens.length; t++) {
        var tk = tokens[t];
        var ht = escHtml(tk.text);
        if (tk.type === "comment") { out += '<span class="hl-comment">' + ht + "</span>"; }
        else if (tk.type === "string") { out += '<span class="hl-string">' + ht + "</span>"; }
        else { out += ht; }
      }
      out = out.replace(/([0-9]+\\.?[0-9]*)/g, '<span class="hl-number">$1</span>');
      var kwArr = KW.split(",");
      for (var k = 0; k < kwArr.length; k++) {
        var w = kwArr[k];
        var re = new RegExp("(?<![a-zA-Z0-9_])" + w + "(?![a-zA-Z0-9_])", "g");
        out = out.replace(re, '<span class="hl-keyword">' + w + "</span>");
      }
      return out;
    }

    function addCopyBtn(codeEl) {
      if (!codeEl || !codeEl.parentElement) return;
      var wrap = codeEl.parentElement;
      if (wrap.classList.contains("code-block-wrap")) return;
      wrap.style.position = "relative";
      wrap.classList.add("code-block-wrap");
      var btn = document.createElement("button");
      btn.className = "code-copy-btn";
      btn.textContent = t("practice.copy");
      btn.addEventListener("click", function() {
        var text = codeEl.textContent || "";
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = t("practice.copied");
          btn.classList.add("copied");
          setTimeout(function() { btn.textContent = t("practice.copy"); btn.classList.remove("copied"); }, 1500);
        }).catch(function() {
          btn.textContent = t("practice.copyFailed");
          setTimeout(function() { btn.textContent = t("practice.copy"); }, 1500);
        });
      });
      wrap.insertBefore(btn, codeEl);
    }

    let lastToastAction = null;
    function showToast(kind, text, retryAction) {
      const toastIcon = document.getElementById("toastIcon");
      const toastText = document.getElementById("toastText");
      toast.className = "toast show " + (kind === "ok" ? "ok" : "err");
      if (toastIcon) toastIcon.textContent = kind === "ok" ? "\\u2713" : "\\u26A0";
      if (toastText) toastText.textContent = text;

      // Remove old retry button if any
      var oldRetry = toast.querySelector(".toast-retry");
      if (oldRetry) oldRetry.remove();

      // Add retry button for errors
      if (kind !== "ok" && retryAction) {
        lastToastAction = retryAction;
        var retryBtn = document.createElement("button");
        retryBtn.className = "toast-retry";
        retryBtn.textContent = t("practice.retry");
        retryBtn.onclick = function() {
          toast.className = "toast";
          if (lastToastAction) lastToastAction();
        };
        toast.appendChild(retryBtn);
      }

      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => { toast.className = "toast"; }, kind === "ok" ? 3000 : 6000);
    }

    function renderLangButtons() {
      if (!langRow) return;
      langRow.innerHTML = "";
      Object.keys(topics).forEach((lang) => {
        const b = document.createElement("button");
        b.className = "lang-btn" + (lang === selectedLang ? " active" : "");
        const icon = icons[lang] || "";
        b.textContent = icon ? icon + " " + lang : lang;
        b.onclick = () => {
          selectedLang = lang;
          selectedTopic = "__multi__";
          renderLangButtons();
          renderTopics();
        };
        langRow.appendChild(b);
      });
    }

    // Topic SVG icons per topic name
    var topicIcons = {
      // Java
      "Array": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9.33 6v12"/><path d="M14.66 6v12"/></svg>',
      "ArrayList": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="7" height="12" rx="2"/><rect x="13" y="6" width="7" height="12" rx="2"/><path d="M7.5 9h0"/><path d="M16.5 9h0"/></svg>',
      "HashMap": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L7 21"/><path d="M17 3l-2 18"/><path d="M5 8h16"/><path d="M4 16h16"/></svg>',
      "HashSet": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L7 21"/><path d="M17 3l-2 18"/><path d="M5 8h16"/><path d="M4 16h16"/></svg>',
      "String": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12"/><path d="M9 7v10"/><path d="M15 7v10"/><path d="M7 17h10"/></svg>',
      "Methods": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8c2-3 6-3 8 0s6 3 8 0"/><path d="M6 16c2-3 6-3 8 0s6 3 8 0"/></svg>',
      // TypeScript
      "Type Basics": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8"/><path d="M12 8v10"/></svg>',
      "Union Types": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 6-8 6-8-6 8-6z"/><path d="M12 15v6"/><path d="M9 21h6"/></svg>',
      "Functions": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8c2-3 6-3 8 0s6 3 8 0"/><path d="M6 16c2-3 6-3 8 0s6 3 8 0"/></svg>',
      "Arrays": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9.33 6v12"/><path d="M14.66 6v12"/></svg>',
      "Objects": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="7" height="7" rx="2"/><rect x="13" y="5" width="7" height="7" rx="2"/><rect x="4" y="14" width="7" height="7" rx="2"/><rect x="13" y="14" width="7" height="7" rx="2"/><path d="M11 8h2"/><path d="M8 12v2"/><path d="M16 12v2"/></svg>',
      "Async/Await": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7a4 4 0 1 0 0 10"/><path d="M16 7a4 4 0 1 1 0 10"/><path d="M10 12h4"/></svg>',
      // SQL
      "SELECT Basics": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/><path d="M9 11h4"/></svg>',
      "WHERE": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/><path d="M9 11h4"/></svg>',
      "JOIN Basics": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="5" height="6" rx="2"/><rect x="10" y="9" width="5" height="6" rx="2"/><rect x="16" y="9" width="4" height="6" rx="2"/><path d="M9 12h1"/><path d="M15 12h1"/></svg>',
      "GROUP BY": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="7" height="12" rx="2"/><rect x="13" y="6" width="7" height="12" rx="2"/><path d="M7.5 9h0"/><path d="M16.5 9h0"/></svg>',
      "ORDER BY": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h10"/><path d="M6 10h12"/><path d="M8 14h10"/><path d="M6 18h12"/><path d="M5 6l-2 2 2 2"/></svg>',
      "INSERT/UPDATE": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/></svg>',
      // API
      "API": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
    };

    function selectTopicRow(value) {
      selectedTopic = value;
      if (!topicGrid) return;
      topicGrid.querySelectorAll(".topic-row").forEach(function(r) {
        r.classList.toggle("active", r.dataset.value === value);
      });
      var infoEl = document.getElementById("multiTopicInfo");
      if (infoEl) infoEl.style.display = value === "__multi__" ? "block" : "none";

      // Hide Bug Fix mode for API topic (not applicable)
      var modeToggle = document.getElementById("modeToggle");
      var csGroup = document.getElementById("codeSizeGroup");
      if (value === "API") {
        if (modeToggle) modeToggle.style.display = "none";
        if (csGroup) csGroup.style.display = "none";
        // Reset to practice mode
        selectedMode = "practice";
        document.querySelectorAll("#modeToggle .mode-btn").forEach(function(b) {
          b.classList.toggle("active", b.dataset.mode === "practice");
        });
      } else {
        if (modeToggle) modeToggle.style.display = "";
        // Sync codeSizeGroup with current mode
        if (csGroup) csGroup.style.display = selectedMode === "bugfix" ? "block" : "none";
      }
    }

    function renderTopics() {
      if (!topicGrid) return;
      topicGrid.innerHTML = "";

      // Multi-Topic row
      var multiRow = document.createElement("div");
      multiRow.className = "topic-row multi" + (selectedTopic === "__multi__" ? " active" : "");
      multiRow.dataset.value = "__multi__";
      multiRow.innerHTML = '<span class="topic-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg></span><span class="topic-name">' + t("practice.multiTopic") + '</span>';
      multiRow.addEventListener("click", function() { selectTopicRow("__multi__"); });
      topicGrid.appendChild(multiRow);

      var list = topics[selectedLang] || [];
      list.forEach(function(tp) {
        var row = document.createElement("div");
        row.className = "topic-row" + (selectedTopic === tp ? " active" : "");
        row.dataset.value = tp;
        var icon = topicIcons[tp] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 3v4h4"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>';
        row.innerHTML = '<span class="topic-icon">' + icon + '</span><span class="topic-name">' + escHtml(tp) + '</span>';
        row.addEventListener("click", function() { selectTopicRow(tp); });
        topicGrid.appendChild(row);
      });

      // Update info text visibility
      var infoEl = document.getElementById("multiTopicInfo");
      if (infoEl) infoEl.style.display = selectedTopic === "__multi__" ? "block" : "none";
    }

    // Mode toggle (Practice / Bug Fix)
    document.querySelectorAll("#modeToggle .mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#modeToggle .mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedMode = btn.dataset.mode || "practice";
        var csGroup = document.getElementById("codeSizeGroup");
        if (csGroup) csGroup.style.display = selectedMode === "bugfix" ? "block" : "none";
      });
    });

    // Code size toggle (Snippet / Codebase) - only visible in Bug Fix mode
    document.querySelectorAll("#codeSizeToggle .mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#codeSizeToggle .mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedCodeSize = btn.dataset.size || "snippet";
      });
    });

    // Source toggle (AI / Offline)
    document.querySelectorAll("#sourceToggle .mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSource = btn.dataset.source || "offline";
        vscode.postMessage({ type: "setForceOffline", forceOffline: selectedSource === "offline" });
        updateOfflineIndicators();
      });
    });

    // Auto-select source based on API key availability
    function updateSourceToggle() {
      var offline = isCurrentlyOffline();
      if (offline) {
        // No API key — force offline, disable AI button
        selectedSource = "offline";
        document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => {
          b.classList.toggle("active", b.dataset.source === "offline");
          if (b.dataset.source === "ai") b.disabled = true;
        });
      } else {
        document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => {
          if (b.dataset.source === "ai") b.disabled = false;
        });
      }
      vscode.postMessage({ type: "setForceOffline", forceOffline: selectedSource === "offline" });
    }

    genBtn.addEventListener("click", () => {
      if (genBtn.disabled) return;
      genBtn.disabled = true;
      currentLoadingAction = "generate";
      var wb = document.getElementById("welcomeBanner");
      if (wb) wb.style.display = "none";
      vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
    });

    // Top bar: Back button - go back to form
    topbarBackBtn.addEventListener("click", () => {
      practiceForm.style.display = "block";
      practiceTopbar.style.display = "none";
      detailsWrap.style.display = "none";
    });

    // Top bar: New Practice button - generate from current selection (or custom prompt)
    topbarGenBtn.addEventListener("click", () => {
      if (topbarGenBtn.disabled) return;
      topbarGenBtn.disabled = true;
      currentLoadingAction = "generate";
      if (_isCustomMode && _customPrompt) {
        vscode.postMessage({ type: "generateCustom", prompt: _customPrompt, lang: _customModeLang });
      } else {
        vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
      }
    });

    window.addEventListener("message", (event) => {
      const msg = event.data;

      if (msg.type === "init") {
        topics = msg.topics || {};
        icons = msg.icons || {};
        selectedLang = msg.defaultLang || "Java";
        selectedTopic = msg.defaultTopic || (topics[selectedLang]?.[0] || "");

        // i18n setup
        if (msg.translations) allTranslations = msg.translations;
        if (msg.uiLang) currentUiLang = msg.uiLang;
        if (msg.uiLanguages && uiLangSelect) {
          uiLanguages = msg.uiLanguages;
          uiLangSelect.innerHTML = "";
          uiLanguages.forEach(lang => {
            const opt = document.createElement("option");
            opt.value = lang.code;
            opt.textContent = lang.flag + " " + lang.label;
            if (lang.code === currentUiLang) opt.selected = true;
            uiLangSelect.appendChild(opt);
          });
        }
        applyTranslations();

        renderLangButtons();
        renderTopics();
        renderCustomLangButtons();

        // Ensure codeSizeGroup matches current mode on init
        var csGroupInit = document.getElementById("codeSizeGroup");
        if (csGroupInit) csGroupInit.style.display = selectedMode === "bugfix" ? "block" : "none";

        // Load custom practices from init
        if (msg.customPractices) {
          customPractices = msg.customPractices;
          renderCustomHistory();
        }

        // Initialize progress stats
        if (msg.stats) renderProgressStats(msg.stats);
        if (msg.recommendations) renderRecommendations(msg.recommendations);

        // Load AI settings into settings panel
        if (msg.aiSettings) loadSettingsUI(msg.aiSettings);

        // Set source toggle based on API key availability
        updateSourceToggle();
      }

      if (msg.type === "settingsSaved") {
        if (settingsSavedMsg) {
          settingsSavedMsg.textContent = "Saved! Using " + (providerDisplayNames[currentProvider] || currentProvider) + " · " + getSelectedModelLabel(currentProvider);
          settingsSavedMsg.classList.add("show");
          saveSettingsBtn.classList.add("saved");
          saveSettingsBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Saved!';
          setTimeout(() => {
            settingsSavedMsg.classList.remove("show");
            saveSettingsBtn.classList.remove("saved");
            saveSettingsBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Save Settings';
          }, 2500);
        }
      }

      // Custom practices list update
      if (msg.type === "customPractices") {
        customPractices = msg.practices || [];
        renderCustomHistory();
      }

      // Switch to a specific tab
      if (msg.type === "switchTab") {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        var targetTab = document.querySelector('.tab[data-tab="' + (msg.tab || "practice") + '"]');
        if (targetTab) targetTab.classList.add("active");
        var targetPanel = document.getElementById((msg.tab || "practice") + "Panel");
        if (targetPanel) targetPanel.classList.add("active");
      }

      // Progress data received
      if (msg.type === "progressData") {
        if (msg.stats) renderProgressStats(msg.stats);
        if (msg.recommendations) renderRecommendations(msg.recommendations);
        if (msg.topicStats) renderTopicProgress(msg.topicStats);
      }

      // Progress update (after practice)
      if (msg.type === "progressUpdate") {
        if (msg.stats) renderProgressStats(msg.stats);
      }

      if (msg.type === "busy") {
        const v = !!msg.value;
        spin.style.display = "none";
        var topProg = document.getElementById("topbarProgress");
        if (topProg) { v ? topProg.classList.add("active") : topProg.classList.remove("active"); }
        genBtn.disabled = v;
        topbarGenBtn.disabled = v;
        runBtn.disabled = v;
        judgeBtn.disabled = v;
        if (!practiceSkipped) {
          teachBtn.disabled = v;
          showSolutionBtn.disabled = v;
          hintCodeBtn.disabled = v;
          if (quickSolveBtn) quickSolveBtn.disabled = v;
        }
        showLoading(v, msg.action || currentLoadingAction);
      }

      if (msg.type === "testGenStatus") {
        if (msg.status === "pending") {
          judgeBtn.disabled = true;
          judgeBtn.title = t("msg.testsGenerating");
        } else {
          judgeBtn.disabled = false;
          judgeBtn.title = "";
        }
      }

      if (msg.type === "loadingProgress") {
        if (loadingTip && msg.text) {
          loadingTip.textContent = msg.text;
        }
        var lbi = document.getElementById("loadingBarInner");
        var lpc = document.getElementById("loadingPct");
        if (lbi && msg.percent != null) {
          lbi.style.width = msg.percent + "%";
          if (lpc) lpc.textContent = msg.percent + "%";
        }
      }

      if (msg.type === "ghostModeStatus") {
        if (ghostModeBtn) {
          if (msg.active) { ghostModeBtn.classList.add("active"); }
          else { ghostModeBtn.classList.remove("active"); }
        }
      }

      if (msg.type === "toast") {
        var retryFn = null;
        if (msg.retryable === "generate") {
          retryFn = function() {
            currentLoadingAction = "generate";
            vscode.postMessage({ type: "generate", lang: selectedLang, topic: selectedTopic, mode: selectedMode, codeSize: selectedCodeSize });
          };
        }
        showToast(msg.kind, msg.text, retryFn);
      }

      if (msg.type === "details") {
        const d = msg.details;
        practiceForm.style.display = "none";
        practiceTopbar.style.display = "flex";
        var dwD = document.getElementById("detailsWrap");
        dwD.style.display = "block";
        dwD.classList.add("fade-in");
        document.getElementById("title").textContent = d.title || "Practice";
        document.getElementById("langBadge").textContent = d.lang.toUpperCase();
        document.getElementById("task").innerHTML = enhanceTask(d.task);
        document.getElementById("mini").textContent = d.expectedOutput || "—";
        document.getElementById("hint").textContent = d.hint || "—";

        // Multi-Topic auto-selected indicator
        var autoBadge = document.getElementById("autoSelectedBadge");
        if (autoBadge) {
          if (d.multiTopicReason) {
            autoBadge.style.display = "inline";
            autoBadge.textContent = d.topic + " \u2022 " + d.multiTopicReason;
          } else {
            autoBadge.style.display = "none";
          }
        }

        // Track custom mode — so Next/Similar use the same prompt
        _isCustomMode = (d.topic === "Custom" && !!d.customPrompt);
        _customPrompt = d.customPrompt || "";
        _customModeLang = d.lang || "Java";

        // Show/hide custom prompt editor in details
        var cpEditWrap = document.getElementById("customPromptEditWrap");
        if (cpEditWrap) {
          if (_isCustomMode) {
            cpEditWrap.style.display = "block";
            var cpEditInput = document.getElementById("customPromptEdit");
            if (cpEditInput) cpEditInput.value = _customPrompt;
          } else {
            cpEditWrap.style.display = "none";
          }
        }

        // Update level badge with color
        const lvl = d.topicXP ? d.topicXP.level : (d.level || 1);
        levelBadge.textContent = t("practice.lvl") + " " + lvl;
        levelBadge.className = "level-badge lvl-" + Math.min(lvl, 5);

        // Update XP bar
        if (d.topicXP) {
          var xpPct = d.topicXP.xpNeeded > 0 ? Math.round((d.topicXP.xp / d.topicXP.xpNeeded) * 100) : 0;
          if (practiceXpFill) practiceXpFill.style.width = xpPct + "%";
          if (practiceXpCount) practiceXpCount.textContent = d.topicXP.xp + " / " + d.topicXP.xpNeeded + " XP";
        } else {
          if (practiceXpFill) practiceXpFill.style.width = "0%";
          if (practiceXpCount) practiceXpCount.textContent = "0 / 100 XP"; // fallback — actual values come from topicXP
        }

        // Reset states
        hintVisible = false;
        hintBody.classList.remove("show");
        hintToggle.textContent = t("hint.show");
        solutionWrap.classList.remove("show");
        teachBtn.style.display = "block";
        teachBtn.disabled = false;
        showSolutionBtn.disabled = false;
        document.getElementById("quickSolveBtn").disabled = false;
        hintCodeBtn.disabled = false;
        outputWrap.classList.remove("show");
        outputWrap.classList.remove("output-compact");
        outputEl.style.display = "none";
        outputEl.textContent = "\u2014";
        if (testCasesList) testCasesList.innerHTML = "";
        resultBadge.textContent = "";
        resultBadge.className = "result-badge";
        passButtons.classList.remove("show");
        // Remove old celebration div from previous practice
        var oldCelebReset = outputWrap.querySelector(".celebrate");
        if (oldCelebReset) oldCelebReset.remove();
        var oldXpReset = outputWrap.querySelector(".xp-earned-wrap");
        if (oldXpReset) oldXpReset.remove();
        var oldLvlReset = outputWrap.querySelector(".xp-levelup-banner");
        if (oldLvlReset) oldLvlReset.remove();
        removeAltMethodsWrap();
        practiceSkipped = false;
        if (ghostModeBtn) { ghostModeBtn.style.display = d.lang !== "SQL" ? "inline-flex" : "none"; ghostModeBtn.classList.remove("active"); }
        if (crossLangBtn) crossLangBtn.style.display = "none";
        if (crossLangDropdown) crossLangDropdown.classList.remove("show");

        // Populate cross-language dropdown (exclude current practice lang)
        if (crossLangDropdown) {
          crossLangDropdown.innerHTML = "";
          var crossTargets = { Java: "java", TypeScript: "ts", JavaScript: "js", Python: "py", "C#": "cs", "C++": "cpp", Go: "go", Rust: "rs" };
          Object.keys(crossTargets).forEach(function(targetLang) {
            if (targetLang === d.lang) return;
            var item = document.createElement("button");
            item.className = "cross-lang-item";
            item.textContent = targetLang;
            item.addEventListener("click", function() {
              crossLangDropdown.classList.remove("show");
              currentLoadingAction = "teach";
              vscode.postMessage({ type: "crossLanguage", targetLang: targetLang });
            });
            crossLangDropdown.appendChild(item);
          });
        }

        // Bug Fix mode adjustments
        var isBugFix = d.mode === "bugfix";
        var bugBadge = document.getElementById("bugFixBadge");
        var sourceAttr = document.getElementById("sourceAttribution");
        var sourceRepoName = document.getElementById("sourceRepoName");
        var bugExItem = document.getElementById("bugExplanationItem");
        var bugExBody = document.getElementById("bugExplanationBody");

        if (bugBadge) bugBadge.style.display = isBugFix ? "inline" : "none";

        if (isBugFix && d.sourceRepo && d.sourceRepo !== "generated") {
          if (sourceAttr) sourceAttr.style.display = "block";
          if (sourceRepoName) sourceRepoName.textContent = d.sourceRepo;
        } else {
          if (sourceAttr) sourceAttr.style.display = "none";
        }

        // Store bug explanation for reveal
        window._bugExplanation = isBugFix ? (d.bugExplanation || "") : "";

        // Hide bug explanation by default
        if (bugExItem) bugExItem.style.display = "none";
        if (bugExBody) bugExBody.textContent = "";

        // In bug fix mode, change "Add Hints" button to "Reveal Bug"
        _isBugFixMode = isBugFix;
        hintCodeBtn.textContent = isBugFix ? t("practice.revealBug") : t("practice.addHints");

        // API mode: show preview button
        var isApi = d.mode === "api";
        if (apiPreviewBtn) apiPreviewBtn.style.display = isApi ? "inline-flex" : "none";
      }

      if (msg.type === "solution") {
        const s = msg.solution;
        var solEl = document.getElementById("solution");
        if (solEl) {
          if (s.code) { solEl.innerHTML = highlightCode(s.code); }
          else { solEl.textContent = "\u2014"; }
        }
        var expEl = document.getElementById("explanation");
        if (expEl) expEl.textContent = s.explanation || "\u2014";
        solutionWrap.classList.add("show");
        teachBtn.style.display = "none";
      }

      // Skipped (quickSolve / showSolution) — gray out action buttons
      if (msg.type === "skipped") {
        practiceSkipped = true;
        teachBtn.disabled = true;
        hintCodeBtn.disabled = true;
        showSolutionBtn.disabled = true;
        document.getElementById("quickSolveBtn").disabled = true;
        passButtons.classList.add("show");
      }

      if (msg.type === "alternativeMethodsResult") {
        altMethodsLoaded = true;
        createAltMethodsWrap();
        if (altMethodsList) {
          altMethodsList.innerHTML = "";
          var methods = msg.methods || [];
          methods.forEach(function(m, idx) {
            var card = document.createElement("div");
            card.className = "alt-method-card" + (idx === 0 ? " alt-method-current" : "");
            card.style.cursor = "pointer";

            var header = document.createElement("div");
            header.className = "alt-method-header";

            var nameEl = document.createElement("span");
            nameEl.className = "alt-method-name";
            nameEl.textContent = m.name || "Method " + (idx + 1);
            header.appendChild(nameEl);

            if (idx > 0) {
              var speedEl = document.createElement("span");
              var sp = m.speedPercent || 100;
              speedEl.className = "alt-method-speed " + (sp > 110 ? "faster" : sp < 90 ? "slower" : "same");
              speedEl.textContent = sp > 100 ? "+" + (sp - 100) + "% faster" : sp < 100 ? (100 - sp) + "% slower" : "";
              if (speedEl.textContent) header.appendChild(speedEl);
            }

            card.appendChild(header);

            card.addEventListener("click", function() {
              vscode.postMessage({ type: "openAltMethod", name: m.name || "Method" + (idx + 1), code: m.code || "", explanation: m.explanation || "" });
            });

            altMethodsList.appendChild(card);
          });
        }
      }

      if (msg.type === "crossLanguageResult") {
        // Cross-language code received — request backend to open it with decorations
        vscode.postMessage({
          type: "openCrossLang",
          code: msg.code || "",
          highlights: msg.highlights || [],
          targetLang: msg.targetLang || "",
        });
      }

      if (msg.type === "output") {
        outputWrap.classList.add("show");
        outputWrap.classList.add("output-compact");
        outputEl.style.display = "block";
        outputEl.textContent = msg.text || "—";
        if (testCasesList) { testCasesList.innerHTML = ""; testCasesList.style.display = "none"; }
        resultBadge.textContent = "";
        resultBadge.className = "result-badge";
        // Show execution performance gauge
        showPerfCard(msg.durationMs);
        // Remove old celebration and pass buttons from previous judge
        var oldCelebOutput = outputWrap.querySelector(".celebrate");
        if (oldCelebOutput) oldCelebOutput.remove();
        var oldXpOutput = outputWrap.querySelector(".xp-earned-wrap");
        if (oldXpOutput) oldXpOutput.remove();
        var oldLvlOutput = outputWrap.querySelector(".xp-levelup-banner");
        if (oldLvlOutput) oldLvlOutput.remove();
        passButtons.classList.remove("show");
        if (crossLangBtn) crossLangBtn.style.display = "none";
        removeAltMethodsWrap();
      }

      if (msg.type === "judgeResult") {
        outputWrap.classList.add("show");
        outputWrap.classList.remove("output-compact");

        // Show execution performance gauge
        showPerfCard(msg.durationMs);

        // Render test case cards (2-column grid, no emoji)
        if (msg.testResults && msg.testResults.length > 0 && testCasesList) {
          testCasesList.innerHTML = "";
          var passed = 0;
          var total = msg.testResults.length;
          for (var ti = 0; ti < total; ti++) {
            var tr = msg.testResults[ti];
            if (tr.pass) passed++;
            var card = document.createElement("div");
            card.className = "tc-card " + (tr.pass ? "tc-pass" : "tc-fail");

            var body = document.createElement("div");
            body.className = "tc-body";
            var nameEl = document.createElement("div");
            nameEl.className = "tc-name " + (tr.pass ? "pass" : "fail");
            nameEl.textContent = (ti + 1) + ". " + (tr.name || (tr.pass ? "Pass" : "Fail"));
            body.appendChild(nameEl);

            // Show expected/got only for failed tests
            if (!tr.pass) {
              if (tr.expected) {
                var expRow = document.createElement("div");
                expRow.className = "tc-detail-row";
                var expLabel = document.createElement("span");
                expLabel.className = "tc-detail-label";
                expLabel.textContent = t("test.expected");
                var expVal = document.createElement("span");
                expVal.className = "tc-detail-value";
                expVal.textContent = tr.expected;
                expRow.appendChild(expLabel);
                expRow.appendChild(expVal);
                body.appendChild(expRow);
              }
              if (tr.got) {
                var gotRow = document.createElement("div");
                gotRow.className = "tc-detail-row";
                var gotLabel = document.createElement("span");
                gotLabel.className = "tc-detail-label";
                gotLabel.textContent = t("test.got");
                var gotVal = document.createElement("span");
                gotVal.className = "tc-detail-value fail-val";
                gotVal.textContent = tr.got;
                gotRow.appendChild(gotLabel);
                gotRow.appendChild(gotVal);
                body.appendChild(gotRow);
              }
            }

            card.appendChild(body);
            testCasesList.appendChild(card);
          }

          // Summary with progress bar (spans full width)
          var summary = document.createElement("div");
          summary.className = "tc-summary";
          summary.textContent = passed + "/" + total + " passed";
          var summaryBar = document.createElement("div");
          summaryBar.className = "tc-summary-bar";
          var summaryFill = document.createElement("div");
          summaryFill.className = "tc-summary-fill";
          summaryFill.style.width = Math.round((passed / total) * 100) + "%";
          summaryBar.appendChild(summaryFill);
          summary.appendChild(summaryBar);
          testCasesList.appendChild(summary);

          testCasesList.style.display = "grid";
          outputEl.style.display = "none";
        } else {
          // No test results - show raw output
          if (testCasesList) testCasesList.style.display = "none";
          outputEl.style.display = "block";
          outputEl.textContent = msg.output || "—";
        }

        resultBadge.textContent = msg.pass ? "PASS" : "FAIL";
        resultBadge.className = "result-badge " + (msg.pass ? "pass" : "fail");

        // Celebration for PASS
        if (msg.pass) {
          // Remove old celebration
          var oldCeleb = outputWrap.querySelector(".celebrate");
          if (oldCeleb) oldCeleb.remove();
          var oldXpEl = outputWrap.querySelector(".xp-earned-wrap");
          if (oldXpEl) oldXpEl.remove();
          var oldLvlUp = outputWrap.querySelector(".xp-levelup-banner");
          if (oldLvlUp) oldLvlUp.remove();

          var celeb = document.createElement("div");
          celeb.className = "celebrate";
          celeb.innerHTML = '<div class="celebrate-text">Passed</div>';
          outputWrap.insertBefore(celeb, outputWrap.querySelector(".pass-buttons"));

          // XP earned animation
          if (msg.xp && msg.xp.earned > 0) {
            var xpEl = document.createElement("div");
            xpEl.className = "xp-earned-wrap";
            var bk = msg.xp.breakdown || {};
            var parts = [];
            if (bk.speed && bk.speed !== 1.0) parts.push('<span class="' + (bk.speed > 1 ? "bonus" : "") + '">' + t("xp.speed") + " " + bk.speed + "x</span>");
            if (bk.hint && bk.hint > 1) parts.push('<span class="bonus">' + t("xp.noHint") + " " + bk.hint + "x</span>");
            if (bk.chat && bk.chat > 1) parts.push('<span class="bonus">' + t("xp.noChat") + " " + bk.chat + "x</span>");
            if (bk.firstTry && bk.firstTry > 1) parts.push('<span class="bonus">' + t("xp.firstTry") + " " + bk.firstTry + "x</span>");
            xpEl.innerHTML = '<div class="xp-earned-amount">+' + Number(msg.xp.earned) + ' XP</div>'
              + (parts.length > 0 ? '<div class="xp-earned-breakdown">' + parts.join(" · ") + '</div>' : '');
            outputWrap.insertBefore(xpEl, outputWrap.querySelector(".pass-buttons"));

            // Update XP bar
            var newPct = msg.xp.needed > 0 ? Math.round((msg.xp.total / msg.xp.needed) * 100) : 0;
            if (practiceXpFill) practiceXpFill.style.width = Math.min(newPct, 100) + "%";
            if (practiceXpCount) practiceXpCount.textContent = msg.xp.total + " / " + msg.xp.needed + " XP";

            // Level up banner
            if (msg.xp.leveledUp) {
              var lvlBanner = document.createElement("div");
              lvlBanner.className = "xp-levelup-banner";
              lvlBanner.textContent = t("xp.levelUp") + " LVL " + msg.xp.level;
              outputWrap.insertBefore(lvlBanner, celeb);
              // Update level badge
              levelBadge.textContent = t("practice.lvl") + " " + msg.xp.level;
              levelBadge.className = "level-badge lvl-" + Math.min(msg.xp.level, 5);
              // Reset XP bar for new level
              if (practiceXpFill) practiceXpFill.style.width = Math.round((msg.xp.total / msg.xp.needed) * 100) + "%";
              if (practiceXpCount) practiceXpCount.textContent = msg.xp.total + " / " + msg.xp.needed + " XP";
            }
          }

          passButtons.classList.add("show");
          if (crossLangBtn) crossLangBtn.style.display = "block";
          // Auto-load alternative methods on pass
          if (!altMethodsLoaded) {
            vscode.postMessage({ type: "alternativeMethods" });
          } else {
            createAltMethodsWrap();
          }
        } else {
          var oldCeleb2 = outputWrap.querySelector(".celebrate");
          if (oldCeleb2) oldCeleb2.remove();
          var oldXpEl2 = outputWrap.querySelector(".xp-earned-wrap");
          if (oldXpEl2) oldXpEl2.remove();
          var oldLvlUp2 = outputWrap.querySelector(".xp-levelup-banner");
          if (oldLvlUp2) oldLvlUp2.remove();
          passButtons.classList.remove("show");
          if (crossLangBtn) crossLangBtn.style.display = "none";
          removeAltMethodsWrap();

          // Show AI feedback on failure
          var oldFb = outputWrap.querySelector(".judge-feedback");
          if (oldFb) oldFb.remove();
          if (msg.feedback && msg.feedback.summary) {
            var fbWrap = document.createElement("div");
            fbWrap.className = "judge-feedback";
            var fbSummary = document.createElement("div");
            fbSummary.className = "fb-summary";
            fbSummary.textContent = msg.feedback.summary;
            fbWrap.appendChild(fbSummary);

            if (msg.feedback.lines && msg.feedback.lines.length > 0) {
              var fbList = document.createElement("div");
              fbList.className = "fb-lines";
              for (var fi = 0; fi < msg.feedback.lines.length; fi++) {
                var fl = msg.feedback.lines[fi];
                var fbItem = document.createElement("div");
                fbItem.className = "fb-line-item";
                var fbLineNum = document.createElement("span");
                fbLineNum.className = "fb-line-num";
                fbLineNum.textContent = t("feedback.line") + " " + fl.line;
                var fbProblem = document.createElement("span");
                fbProblem.className = "fb-problem";
                fbProblem.textContent = fl.problem;
                var fbFix = document.createElement("div");
                fbFix.className = "fb-fix";
                fbFix.textContent = fl.fix;
                fbItem.appendChild(fbLineNum);
                fbItem.appendChild(fbProblem);
                fbItem.appendChild(fbFix);
                fbList.appendChild(fbItem);
              }
              fbWrap.appendChild(fbList);
            }
            // Insert feedback after test cases list or output element
            var fbTarget = testCasesList || outputEl;
            if (fbTarget && fbTarget.parentNode) {
              fbTarget.parentNode.insertBefore(fbWrap, fbTarget.nextSibling);
            } else {
              outputWrap.appendChild(fbWrap);
            }
          }
        }
      }
    });

    vscode.postMessage({ type: "ready" });
  </script>
</body>
</html>`;
}
