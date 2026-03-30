import type { UiLanguage } from "../../shared/protocol";
import { dom } from "../dom";
import { state } from "../state";
import { applyTranslations, t } from "../i18n";
import { post } from "../vscodeApi";
import { renderProgressStats, renderRecommendations, renderTopicProgress } from "./progress";
import { updateConfigBanner, updateOfflineIndicators } from "./settings";

function syncQuickSolveLabel(): void {
  if (!state.quickSolveApplied || !dom.quickSolveBtn) return;
  const svg = dom.quickSolveBtn.querySelector("svg");
  const label = t("practice.applied");
  dom.quickSolveBtn.classList.add("applied");
  if (svg) {
    Array.from(dom.quickSolveBtn.childNodes).forEach((node) => {
      if (node.nodeType === 3) node.remove();
    });
    svg.insertAdjacentText("afterend", label);
  } else {
    dom.quickSolveBtn.textContent = label;
  }
}

export function applyUiLanguage(lang: string, shouldPost = true): void {
  state.currentUiLang = lang;
  if (dom.uiLangSelect) {
    dom.uiLangSelect.value = lang;
  }
  renderUiLanguageSwitch();
  applyTranslations();
  renderProgressStats(state.progressStats);
  renderRecommendations(state.recommendations);
  renderTopicProgress(state.topicStats);
  updateConfigBanner(state.currentProvider);
  updateOfflineIndicators();
  syncQuickSolveLabel();
  if (shouldPost) {
    post({ type: "setUiLang", lang: state.currentUiLang });
  }
}

function createUiLangPill(lang: UiLanguage): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ui-lang-pill" + (lang.code === state.currentUiLang ? " active" : "");
  btn.dataset.lang = lang.code;
  btn.setAttribute("aria-pressed", String(lang.code === state.currentUiLang));
  btn.title = lang.label;
  btn.textContent = lang.label;
  return btn;
}

export function renderUiLanguageSwitch(): void {
  if (dom.uiLangSelect) {
    dom.uiLangSelect.innerHTML = "";
    state.uiLanguages.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = `${lang.flag} ${lang.label}`;
      opt.selected = lang.code === state.currentUiLang;
      dom.uiLangSelect!.appendChild(opt);
    });
  }

  if (!dom.uiLangSwitch) return;
  dom.uiLangSwitch.innerHTML = "";
  state.uiLanguages.forEach((lang) => {
    dom.uiLangSwitch!.appendChild(createUiLangPill(lang));
  });
}
