import { dom } from "./dom";
import { state } from "./state";

export type PracticeView = "form" | "detail" | "judge";

export function hideCrossLang(): void {
  if (dom.crossLangBtn) {
    dom.crossLangBtn.style.display = "none";
    dom.crossLangBtn.classList.remove("expanded");
    dom.crossLangBtn.setAttribute("aria-expanded", "false");
  }
  dom.crossLangDropdown?.classList.remove("show");
}

export function syncCrossLangForJudge(visible: boolean): void {
  if (state.practiceView !== "judge" || !dom.crossLangBtn) {
    hideCrossLang();
    return;
  }
  dom.crossLangBtn.style.display = visible ? "block" : "none";
  if (!visible) {
    dom.crossLangBtn.classList.remove("expanded");
    dom.crossLangBtn.setAttribute("aria-expanded", "false");
    dom.crossLangDropdown?.classList.remove("show");
  }
}

export function showPracticeView(view: PracticeView): void {
  state.practiceView = view;
  document.body.classList.toggle("practice-focus-mode", view !== "form");
  if (view !== "form") {
    document.body.classList.remove("settings-focus-mode");
  }

  if (dom.practiceForm) {
    dom.practiceForm.style.display = view === "form" ? "block" : "none";
  }
  if (dom.practiceTopbar) {
    dom.practiceTopbar.style.display = view === "form" ? "none" : "flex";
    dom.practiceTopbar.classList.toggle("judge-view", view === "judge");
  }

  dom.practiceDetailPage?.classList.toggle("active", view === "detail");
  dom.practiceJudgePage?.classList.toggle("active", view === "judge");

  const isJudge = view === "judge";
  if (dom.openChatBtn) dom.openChatBtn.style.display = isJudge ? "none" : "inline-flex";
  if (dom.topbarGenBtn) dom.topbarGenBtn.style.display = view === "form" ? "none" : "inline-flex";
  if (dom.levelBadge) (dom.levelBadge as HTMLElement).style.display = isJudge ? "none" : "inline-block";
  if (dom.resultBadge && !isJudge) (dom.resultBadge as HTMLElement).style.display = "none";

  const bugBadge = document.getElementById("bugFixBadge");
  if (bugBadge) bugBadge.style.display = !isJudge && state._isBugFixMode ? "inline-flex" : "none";

  const autoBadge = document.getElementById("autoSelectedBadge");
  if (autoBadge) autoBadge.style.display = !isJudge && !!autoBadge.textContent ? "inline-flex" : "none";

  if (dom.ghostModeBtn) {
    const showGhost = !isJudge && state.currentPracticeLang !== "SQL";
    dom.ghostModeBtn.style.display = showGhost ? "inline-flex" : "none";
  }

  if (!isJudge) {
    hideCrossLang();
  }
}
