// Loading overlay + toast + perf card
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";

const loadingTipKeys = [
  "tip.analyzing", "tip.generating", "tip.processing",
  "tip.almostReady", "tip.preparing", "tip.building",
];

export function showLoading(show: boolean, action = ""): void {
  if (show) {
    state.currentLoadingAction = action;
    dom.loadingOverlay?.classList.add("show");
    const lbi = document.getElementById("loadingBarInner");
    const lpc = document.getElementById("loadingPct");
    if (lbi) lbi.style.width = "0%";
    if (lpc) lpc.textContent = "";

    if (action === "generate") {
      if (dom.loadingText) dom.loadingText.textContent = t("loading.generatingPractice");
    } else if (action === "judge") {
      if (dom.loadingText) dom.loadingText.textContent = t("loading.checkingCode");
    } else if (action === "run") {
      if (dom.loadingText) dom.loadingText.textContent = t("loading.runningCode");
    } else if (action === "teach") {
      if (dom.loadingText) dom.loadingText.textContent = t("loading.preparingSolution");
    } else if (action === "hint") {
      if (dom.loadingText) dom.loadingText.textContent = t("loading.addingHints");
    } else {
      if (dom.loadingText) dom.loadingText.textContent = t("loading.working");
    }

    const tipKey = loadingTipKeys[Math.floor(Math.random() * loadingTipKeys.length)];
    if (dom.loadingTip) dom.loadingTip.textContent = t(tipKey);

    if (state.loadingTimeoutId) clearTimeout(state.loadingTimeoutId);
    state.loadingTimeoutId = setTimeout(() => {
      dom.loadingOverlay?.classList.remove("show");
      state.currentLoadingAction = "";
      state.loadingTimeoutId = null;
      if (dom.genBtn) dom.genBtn.disabled = false;
      if (dom.topbarGenBtn) dom.topbarGenBtn.disabled = false;
      if (dom.runBtn) dom.runBtn.disabled = false;
      if (dom.judgeBtn) dom.judgeBtn.disabled = false;
      if (dom.teachBtn) dom.teachBtn.disabled = false;
      if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = false;
      if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = false;
      if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = false;
    }, 30000);
  } else {
    dom.loadingOverlay?.classList.remove("show");
    state.currentLoadingAction = "";
    if (state.loadingTimeoutId) { clearTimeout(state.loadingTimeoutId); state.loadingTimeoutId = null; }
  }
}

export function showPerfCard(ms: number | undefined | null): void {
  if (!dom.perfCard || ms == null) { dom.perfCard?.classList.remove("show"); return; }
  if (dom.perfTime) dom.perfTime.textContent = ms < 1000 ? ms + " ms" : (ms / 1000).toFixed(2) + " s";

  let grade: string, cls: string, color: string;
  if (ms < 200) { grade = "Excellent"; cls = "excellent"; color = "var(--good)"; }
  else if (ms < 800) { grade = "Good"; cls = "good"; color = "#22d3ee"; }
  else if (ms < 2000) { grade = "Sufficient"; cls = "sufficient"; color = "var(--accent)"; }
  else if (ms < 5000) { grade = "Slow"; cls = "slow"; color = "#f59e0b"; }
  else { grade = "Very Slow"; cls = "very-slow"; color = "var(--bad, #ef4444)"; }

  if (dom.perfLabel) { dom.perfLabel.textContent = grade; dom.perfLabel.className = "perf-label " + cls; }
  const ratio = Math.min(1, Math.max(0, 1 - ms / 5000));
  const offset = 82 - ratio * 82;
  if (dom.perfGaugeFill) {
    (dom.perfGaugeFill as HTMLElement).style.setProperty("stroke-dashoffset", String(offset));
    (dom.perfGaugeFill as HTMLElement).style.setProperty("stroke", color);
  }
  const angle = -90 + (1 - ratio) * 180;
  if (dom.perfNeedle) (dom.perfNeedle as HTMLElement).style.transform = "rotate(" + angle + "deg)";
  dom.perfCard.classList.add("show");
}

export function showToast(kind: string, text: string, retryAction?: (() => void) | null): void {
  if (!dom.toast) return;
  dom.toast.className = "toast show " + (kind === "ok" ? "ok" : "err");
  if (dom.toastIcon) dom.toastIcon.textContent = kind === "ok" ? "\u2713" : "\u26A0";
  if (dom.toastText) dom.toastText.textContent = text;

  const oldRetry = dom.toast.querySelector(".toast-retry");
  if (oldRetry) oldRetry.remove();

  if (kind !== "ok" && retryAction) {
    state.lastToastAction = retryAction;
    const retryBtn = document.createElement("button");
    retryBtn.className = "toast-retry";
    retryBtn.textContent = t("practice.retry");
    retryBtn.onclick = () => {
      dom.toast!.className = "toast";
      if (state.lastToastAction) state.lastToastAction();
    };
    dom.toast.appendChild(retryBtn);
  }

  clearTimeout((dom.toast as any)._timer);
  (dom.toast as any)._timer = setTimeout(() => { dom.toast!.className = "toast"; }, kind === "ok" ? 3000 : 6000);
}
