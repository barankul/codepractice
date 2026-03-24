// Language buttons + topic grid rendering
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";
import { post } from "../vscodeApi";
import { escHtml } from "./codeView";
import { isCurrentlyOffline } from "./settings";

// Language SVG icons for V5 card grid
export const langIcons: Record<string, string> = {
  Java: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 18.5c2.7 1 6.3 1 9 0"/><path d="M6.8 16.2c3.2 1.2 7.2 1.2 10.4 0"/><path d="M8.5 11.3h6v2.1a2.9 2.9 0 0 1-2.9 2.9h-.2a2.9 2.9 0 0 1-2.9-2.9v-2.1Z"/><path d="M14.5 12h1a1.6 1.6 0 0 1 0 3.2h-1"/><path d="M10.8 4.3c1 1-.8 1.8 0 2.9.7.9 2.1 1 2.1 2.5"/><path d="M13.9 3.8c1 .9-.8 1.7 0 2.8.6.8 1.9.9 1.9 2.3"/></svg>',
  TypeScript: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5" fill="currentColor"/><path fill="var(--vscode-editor-background, #fff)" d="M7.4 8.2h7v1.9h-2.6V16H9.9v-5.9H7.4V8.2Zm8.1 4c.5-.5 1.3-.8 2.2-.8.9 0 1.7.2 2.5.7v1.9c-.7-.5-1.5-.8-2.4-.8-.5 0-.8.1-1.1.2-.2.1-.3.3-.3.5 0 .3.2.6.5.8.2.1.6.3 1.2.5.9.3 1.5.6 1.9 1 .4.4.6.9.6 1.6 0 .8-.3 1.5-.9 1.9-.6.4-1.4.7-2.5.7-1 0-2-.2-2.8-.7v-2c.8.6 1.7.9 2.8.9.9 0 1.3-.2 1.3-.7 0-.3-.2-.6-.5-.8-.2-.1-.7-.4-1.3-.6-.8-.3-1.4-.7-1.8-1-.4-.4-.6-.9-.6-1.5 0-.8.3-1.5.9-2Z"/></svg>',
  JavaScript: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M10 8v8c0 1.1-.9 2-2 2"/><path d="M16 12c0-1.1-.9-2-2-2h-.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H14c-1.1 0-2-.9-2-2"/></svg>',
  Python: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4 0-5 2-5 4v3h5v1H6c-2 0-4 1.5-4 5s1.5 5 4 5h2v-3c0-2 1.5-3.5 3.5-3.5h5c1.5 0 3-1 3-3V7c0-2-1.5-4-5-4z"/><circle cx="9" cy="6.5" r="0.8"/><path d="M12 21c4 0 5-2 5-4v-3h-5v-1h6c2 0 4-1.5 4-5s-1.5-5-4-5h-2v3c0 2-1.5 3.5-3.5 3.5h-5c-1.5 0-3 1-3 3v4c0 2 1.5 4 5 4z"/><circle cx="15" cy="17.5" r="0.8"/></svg>',
  SQL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/></svg>',
  "C#": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/><path d="M16 9v6"/><path d="M19 9v6"/><path d="M14.5 10.5h6"/><path d="M14.5 13.5h6"/></svg>',
  "C++": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/><path d="M16 9v6"/><path d="M19 9v6"/><path d="M14.5 12h6"/><path d="M17.5 9v6"/></svg>',
  Go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h2"/><path d="M16 12h2"/><rect x="4" y="8" width="16" height="8" rx="4"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>',
  Rust: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4 12h2"/><path d="M18 12h2"/><path d="M9 9l4 6"/><path d="M15 9l-4 6"/></svg>',
};

// Topic SVG icons
const topicIcons: Record<string, string> = {
  "Array": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9.33 6v12"/><path d="M14.66 6v12"/></svg>',
  "ArrayList": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="7" height="12" rx="2"/><rect x="13" y="6" width="7" height="12" rx="2"/><path d="M7.5 9h0"/><path d="M16.5 9h0"/></svg>',
  "HashMap": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L7 21"/><path d="M17 3l-2 18"/><path d="M5 8h16"/><path d="M4 16h16"/></svg>',
  "HashSet": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L7 21"/><path d="M17 3l-2 18"/><path d="M5 8h16"/><path d="M4 16h16"/></svg>',
  "String": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12"/><path d="M9 7v10"/><path d="M15 7v10"/><path d="M7 17h10"/></svg>',
  "Methods": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8c2-3 6-3 8 0s6 3 8 0"/><path d="M6 16c2-3 6-3 8 0s6 3 8 0"/></svg>',
  "Type Basics": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8"/><path d="M12 8v10"/></svg>',
  "Union Types": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 6-8 6-8-6 8-6z"/><path d="M12 15v6"/><path d="M9 21h6"/></svg>',
  "Functions": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8c2-3 6-3 8 0s6 3 8 0"/><path d="M6 16c2-3 6-3 8 0s6 3 8 0"/></svg>',
  "Arrays": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9.33 6v12"/><path d="M14.66 6v12"/></svg>',
  "Objects": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="7" height="7" rx="2"/><rect x="13" y="5" width="7" height="7" rx="2"/><rect x="4" y="14" width="7" height="7" rx="2"/><rect x="13" y="14" width="7" height="7" rx="2"/><path d="M11 8h2"/><path d="M8 12v2"/><path d="M16 12v2"/></svg>',
  "Async/Await": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7a4 4 0 1 0 0 10"/><path d="M16 7a4 4 0 1 1 0 10"/><path d="M10 12h4"/></svg>',
  "SELECT Basics": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/><path d="M9 11h4"/></svg>',
  "WHERE": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/><path d="M9 11h4"/></svg>',
  "JOIN Basics": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="5" height="6" rx="2"/><rect x="10" y="9" width="5" height="6" rx="2"/><rect x="16" y="9" width="4" height="6" rx="2"/><path d="M9 12h1"/><path d="M15 12h1"/></svg>',
  "GROUP BY": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="7" height="12" rx="2"/><rect x="13" y="6" width="7" height="12" rx="2"/><path d="M7.5 9h0"/><path d="M16.5 9h0"/></svg>',
  "ORDER BY": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h10"/><path d="M6 10h12"/><path d="M8 14h10"/><path d="M6 18h12"/><path d="M5 6l-2 2 2 2"/></svg>',
  "INSERT/UPDATE": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/></svg>',
  "API": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
};

const defaultTopicIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 3v4h4"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>';

export function shouldShowCodeSizeGroup(
  selectedMode: "practice" | "bugfix",
  selectedSource: "ai" | "offline",
  selectedTopic: string
): boolean {
  return selectedTopic !== "API" && selectedMode === "bugfix" && selectedSource === "ai";
}

export function updateCodeSizeGroupVisibility(): void {
  const csGroup = document.getElementById("codeSizeGroup");
  const shouldShow = shouldShowCodeSizeGroup(state.selectedMode, state.selectedSource, state.selectedTopic);

  if (!shouldShow) {
    state.selectedCodeSize = "snippet";
  }

  document.querySelectorAll("#codeSizeToggle .mode-btn").forEach(btn => {
    (btn as HTMLElement).classList.toggle("active", (btn as HTMLElement).dataset.size === state.selectedCodeSize);
  });

  if (csGroup) {
    csGroup.style.display = shouldShow ? "block" : "none";
  }
}

export function renderLangButtons(): void {
  if (!dom.langRow) return;
  dom.langRow.innerHTML = "";
  Object.keys(state.topics).forEach(lang => {
    const card = document.createElement("div");
    card.className = "lang-card" + (lang === state.selectedLang ? " active" : "");
    const svgIcon = langIcons[lang] || "";
    if (svgIcon) {
      const iconDiv = document.createElement("div");
      iconDiv.className = "lang-card-icon";
      iconDiv.innerHTML = svgIcon;
      card.appendChild(iconDiv);
    }
    const nameSpan = document.createElement("span");
    nameSpan.className = "lang-card-name";
    nameSpan.textContent = lang;
    card.appendChild(nameSpan);
    card.onclick = () => {
      state.selectedLang = lang;
      state.selectedTopic = "__multi__";
      renderLangButtons();
      renderTopics();
    };
    dom.langRow!.appendChild(card);
  });
}

export function selectTopicRow(value: string): void {
  state.selectedTopic = value;
  if (!dom.topicGrid) return;
  dom.topicGrid.querySelectorAll(".topic-row").forEach(r => {
    (r as HTMLElement).classList.toggle("active", (r as HTMLElement).dataset.value === value);
  });
  const infoEl = document.getElementById("multiTopicInfo");
  if (infoEl) infoEl.style.display = value === "__multi__" ? "block" : "none";

  const modeToggle = document.getElementById("modeToggle");
  if (value === "API") {
    if (modeToggle) modeToggle.style.display = "none";
    state.selectedMode = "practice";
    document.querySelectorAll("#modeToggle .mode-btn").forEach(b => {
      (b as HTMLElement).classList.toggle("active", (b as HTMLElement).dataset.mode === "practice");
    });
  } else {
    if (modeToggle) modeToggle.style.display = "";
  }
  updateCodeSizeGroupVisibility();
}

export function renderTopics(): void {
  if (!dom.topicGrid) return;
  dom.topicGrid.innerHTML = "";

  // Multi-Topic row
  const multiRow = document.createElement("div");
  multiRow.className = "topic-row multi" + (state.selectedTopic === "__multi__" ? " active" : "");
  multiRow.dataset.value = "__multi__";
  multiRow.innerHTML = '<span class="topic-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg></span><span class="topic-name">' + t("practice.multiTopic") + "</span>";
  multiRow.addEventListener("click", () => { selectTopicRow("__multi__"); });
  dom.topicGrid.appendChild(multiRow);

  const list = state.topics[state.selectedLang] || [];
  list.forEach(tp => {
    const row = document.createElement("div");
    row.className = "topic-row" + (state.selectedTopic === tp ? " active" : "");
    row.dataset.value = tp;
    const icon = topicIcons[tp] || defaultTopicIcon;
    row.innerHTML = '<span class="topic-icon">' + icon + '</span><span class="topic-name">' + escHtml(tp) + "</span>";
    row.addEventListener("click", () => { selectTopicRow(tp); });
    dom.topicGrid!.appendChild(row);
  });

  const infoEl = document.getElementById("multiTopicInfo");
  if (infoEl) infoEl.style.display = state.selectedTopic === "__multi__" ? "block" : "none";
}

export function updateSourceToggle(): void {
  const offline = isCurrentlyOffline();
  if (offline) {
    state.selectedSource = "offline";
    document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => {
      (b as HTMLElement).classList.toggle("active", (b as HTMLElement).dataset.source === "offline");
      if ((b as HTMLElement).dataset.source === "ai") (b as HTMLButtonElement).disabled = true;
    });
  } else {
    document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => {
      if ((b as HTMLElement).dataset.source === "ai") (b as HTMLButtonElement).disabled = false;
    });
  }
  updateCodeSizeGroupVisibility();
  post({ type: "setForceOffline", forceOffline: state.selectedSource === "offline" });
}
