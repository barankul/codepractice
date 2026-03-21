// Language buttons + topic grid rendering
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";
import { post } from "../vscodeApi";
import { escHtml } from "./codeView";
import { isCurrentlyOffline } from "./settings";

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

export function renderLangButtons(): void {
  if (!dom.langRow) return;
  dom.langRow.innerHTML = "";
  Object.keys(state.topics).forEach(lang => {
    const b = document.createElement("button");
    b.className = "lang-btn" + (lang === state.selectedLang ? " active" : "");
    const icon = state.icons[lang] || "";
    b.textContent = icon ? icon + " " + lang : lang;
    b.onclick = () => {
      state.selectedLang = lang;
      state.selectedTopic = "__multi__";
      renderLangButtons();
      renderTopics();
    };
    dom.langRow!.appendChild(b);
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
  const csGroup = document.getElementById("codeSizeGroup");
  if (value === "API") {
    if (modeToggle) modeToggle.style.display = "none";
    if (csGroup) csGroup.style.display = "none";
    state.selectedMode = "practice";
    document.querySelectorAll("#modeToggle .mode-btn").forEach(b => {
      (b as HTMLElement).classList.toggle("active", (b as HTMLElement).dataset.mode === "practice");
    });
  } else {
    if (modeToggle) modeToggle.style.display = "";
    if (csGroup) csGroup.style.display = state.selectedMode === "bugfix" ? "block" : "none";
  }
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
  post({ type: "setForceOffline", forceOffline: state.selectedSource === "offline" });
}
