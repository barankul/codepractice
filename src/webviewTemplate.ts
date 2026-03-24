// webviewTemplate.ts — generates the webview HTML shell
// CSS is embedded inline (nonce), JS is loaded from external bundle (nonce + src)
import css from "./webview/webview.css";

export function buildWebviewHtml(nonce: string, scriptUri: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style nonce="${nonce}">
${css}
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
        <button class="btn-retry" id="retryBtn" data-i18n="practice.trySimilar"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>Try Similar Practice</button>
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
      <div class="provider-list" id="providerCards">
        <div class="provider-item" data-provider="groq"><div class="provider-item-icon" style="color:#f97316">G</div><div class="provider-item-info"><div class="provider-item-name">Groq</div><div class="provider-item-desc">100K tokens/day</div></div><span class="provider-item-free">FREE</span></div>
        <div class="provider-item" data-provider="cerebras"><div class="provider-item-icon" style="color:#8b5cf6">C</div><div class="provider-item-info"><div class="provider-item-name">Cerebras</div><div class="provider-item-desc">~1M tokens/day</div></div><span class="provider-item-free">FREE</span></div>
        <div class="provider-item" data-provider="together"><div class="provider-item-icon" style="color:#06b6d4">T</div><div class="provider-item-info"><div class="provider-item-name">Together</div><div class="provider-item-desc">$1 free credit</div></div><span class="provider-item-free">FREE</span></div>
        <div class="provider-item" data-provider="openrouter"><div class="provider-item-icon" style="color:#ec4899">O</div><div class="provider-item-info"><div class="provider-item-name">OpenRouter</div><div class="provider-item-desc">Free tier available</div></div><span class="provider-item-free">FREE</span></div>
        <div class="provider-item" data-provider="gemini"><div class="provider-item-icon" style="color:#3b82f6">G</div><div class="provider-item-info"><div class="provider-item-name">Gemini</div><div class="provider-item-desc">Free tier available</div></div><span class="provider-item-free">FREE</span></div>
        <div class="provider-item" data-provider="openai"><div class="provider-item-icon" style="color:#10b981">O</div><div class="provider-item-info"><div class="provider-item-name">OpenAI</div><div class="provider-item-desc">Pay-as-you-go</div></div></div>
        <div class="provider-item" data-provider="claude"><div class="provider-item-icon" style="color:#d97706">C</div><div class="provider-item-info"><div class="provider-item-name">Claude</div><div class="provider-item-desc">Pay-as-you-go</div></div></div>
        <div class="provider-item" data-provider="local"><div class="provider-item-icon" style="color:#6b7280">L</div><div class="provider-item-info"><div class="provider-item-name" data-i18n="settings.local">Local</div><div class="provider-item-desc">LM Studio</div></div></div>
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

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
