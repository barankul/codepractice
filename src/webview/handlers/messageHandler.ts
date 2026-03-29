// Message handler — window.addEventListener("message") dispatch
import { state } from "../state";
import { dom } from "../dom";
import { t, applyTranslations } from "../i18n";
import { post } from "../vscodeApi";
import { showLoading, showPerfCard, showToast } from "../ui/loading";
import { renderLangButtons, renderTopics, updateCodeSizeGroupVisibility, updateSourceToggle } from "../ui/langTopics";
import { renderCustomLangButtons, renderCustomHistory } from "../ui/custom";
import { renderProgressStats, renderRecommendations, renderTopicProgress } from "../ui/progress";
import { loadSettingsUI, updateConfigBanner, updateOfflineIndicators, isCurrentlyOffline, providerDisplayNames, getSelectedModelLabel } from "../ui/settings";
import { renderUiLanguageSwitch } from "../ui/uiLanguage";
import { highlightCode, enhanceTask } from "../ui/codeView";
import { createAltMethodsWrap, removeAltMethodsWrap } from "../ui/altMethods";
import { hideCrossLang, showPracticeView, syncCrossLangForJudge } from "../practiceView";
import type { ExtToWebviewMsg } from "../../shared/protocol";

const DEFAULT_CROSS_LANG_TARGETS = ["Java", "TypeScript", "JavaScript", "Python", "C#", "C++", "Go", "Rust"];
const QUICK_SOLVE_ICON_HTML = '<svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/><path d="M19 4l.6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6L17 6.2l1.4-.6L19 4z"/></svg>';

function setRunOutputCompactMode(enabled: boolean): void {
  dom.outputWrap?.classList.toggle("output-compact", enabled);
}

function clearJudgeFeedbackUi(): void {
  dom.outputWrap?.querySelector(".judge-feedback")?.remove();
}

function resetLastJudgeState(): void {
  state.lastTestResults = null;
  state.lastJudgeMsg = null;
}

function clearBusyButtonStates(): void {
  [dom.genBtn, dom.topbarGenBtn, dom.runBtn, dom.judgeBtn].forEach(btn => btn?.classList.remove("busy"));
}

function setBusyButtonStates(action?: string): void {
  clearBusyButtonStates();
  const normalized = (action || "").toLowerCase();
  if (normalized === "generate" || normalized.startsWith("gen")) {
    dom.genBtn?.classList.add("busy");
    dom.topbarGenBtn?.classList.add("busy");
  } else if (normalized === "run") {
    dom.runBtn?.classList.add("busy");
  } else if (normalized === "judge") {
    dom.judgeBtn?.classList.add("busy");
  }
}

function getQuickSolveAppliedLabel(): string {
  return t("practice.applied");
}

function getAltMethodsUnavailableMessage(): string {
  return t("msg.altMethodsUnavailable");
}

function setQuickSolveAppliedState(applied: boolean): void {
  state.quickSolveApplied = applied;
  const btn = dom.quickSolveBtn;
  if (!btn) return;
  if (!btn.dataset.defaultHtml) btn.dataset.defaultHtml = btn.innerHTML;
  btn.classList.remove("applied-animate");
  btn.classList.toggle("applied", applied);
  if (applied) {
    void btn.offsetWidth;
    btn.classList.add("applied-animate");
  }
  btn.innerHTML = applied
    ? QUICK_SOLVE_ICON_HTML + getQuickSolveAppliedLabel()
    : (btn.dataset.defaultHtml || (QUICK_SOLVE_ICON_HTML + t("practice.quickSolve")));
}

function clearInlineRunOutput(): void {
  dom.runOutputWrap?.classList.remove("show");
  if (dom.runOutputEl) dom.runOutputEl.textContent = "\u2014";
  if (dom.runDuration) dom.runDuration.textContent = "";
}

function clearJudgeRewards(): void {
  if (dom.judgeRewards) dom.judgeRewards.innerHTML = "";
}

function setJudgeFooter(passedCount: number, totalCount: number, status: "pass" | "partial" | "fail"): void {
  if (dom.judgeFooterText) {
    const lang = state.currentUiLang;
    if (lang === "ja") dom.judgeFooterText.textContent = `${passedCount}/${totalCount} \u901a\u904e`;
    else if (lang === "tr") dom.judgeFooterText.textContent = `${passedCount}/${totalCount} ge\u00e7ti`;
    else dom.judgeFooterText.textContent = `${passedCount}/${totalCount} passed`;
  }
  if (dom.judgeFooterDot) {
    dom.judgeFooterDot.className = "judge-footer-dot" + (status === "pass" ? "" : status === "partial" ? " partial" : " fail");
  }
  if (dom.judgeFooter) dom.judgeFooter.style.display = "flex";
}

function setTopbarStatus(kind: "pass" | "partial" | "fail" | null): void {
  if (!dom.resultBadge) return;

  if (!kind) {
    dom.resultBadge.textContent = "";
    dom.resultBadge.className = "result-badge topbar-status-badge";
    (dom.resultBadge as HTMLElement).style.display = "none";
    return;
  }

  dom.resultBadge.textContent = kind === "pass" ? t("judge.passUpper") : kind === "partial" ? t("judge.partialUpper") : t("judge.failUpper");
  dom.resultBadge.className = "result-badge topbar-status-badge " + kind;
  (dom.resultBadge as HTMLElement).style.display = "inline-flex";
}

function resetResultHero(): void {
  const hero = document.getElementById("resultHero");
  const celebrate = document.getElementById("resultCelebrate");
  const score = document.getElementById("resultScore");
  const subtext = document.getElementById("resultSubtext");
  const progress = document.getElementById("resultProgressFill");
  if (hero) hero.classList.remove("show");
  if (celebrate) {
    celebrate.textContent = "";
    celebrate.className = "result-celebrate";
  }
  if (score) score.innerHTML = '0<span class="result-score-dim">/0</span>';
  if (subtext) subtext.textContent = "";
  if (progress) {
    progress.className = "result-progress-fill";
    (progress as HTMLElement).style.width = "0%";
  }
}

function getJudgeHeroCopy(kind: "pass" | "partial" | "fail"): { title: string; subtitle: string } {
  const lang = state.currentUiLang;
  if (lang === "ja") {
    if (kind === "pass") return { title: "合格", subtitle: "すべてのテストに成功" };
    if (kind === "partial") return { title: "部分通過", subtitle: "一部のテストに成功" };
    return { title: "不合格", subtitle: "テストに失敗" };
  }
  if (lang === "tr") {
    if (kind === "pass") return { title: "Başarılı", subtitle: "Tüm testler geçti" };
    if (kind === "partial") return { title: "Kısmi", subtitle: "Bazı testler geçti" };
    return { title: "Başarısız", subtitle: "Testler başarısız oldu" };
  }
  if (kind === "pass") return { title: "Passed", subtitle: "All tests passed" };
  if (kind === "partial") return { title: "Partial", subtitle: "Some tests passed" };
  return { title: "Fail", subtitle: "Tests failed" };
}

function getJudgeHeroCopySafe(kind: "pass" | "partial" | "fail"): { title: string; subtitle: string } {
  const lang = state.currentUiLang;
  if (lang === "ja") {
    if (kind === "pass") return { title: "\u5408\u683c", subtitle: "\u3059\u3079\u3066\u306e\u30c6\u30b9\u30c8\u306b\u901a\u904e" };
    if (kind === "partial") return { title: "\u4e00\u90e8\u5408\u683c", subtitle: "\u4e00\u90e8\u306e\u30c6\u30b9\u30c8\u306b\u901a\u904e" };
    return { title: "\u4e0d\u5408\u683c", subtitle: "\u30c6\u30b9\u30c8\u306b\u5931\u6557" };
  }
  if (lang === "tr") {
    if (kind === "pass") return { title: "Ba\u015far\u0131l\u0131", subtitle: "T\u00fcm testler ge\u00e7ti" };
    if (kind === "partial") return { title: "K\u0131smi", subtitle: "Baz\u0131 testler ge\u00e7ti" };
    return { title: "Ba\u015far\u0131s\u0131z", subtitle: "Testler ge\u00e7medi" };
  }
  if (kind === "pass") return { title: "Passed", subtitle: "All tests passed" };
  if (kind === "partial") return { title: "Partial", subtitle: "Some tests passed" };
  return { title: "Fail", subtitle: "Tests failed" };
}

export function initMessageHandler(): void {
  window.addEventListener("message", (event: MessageEvent) => {
    const msg = event.data as ExtToWebviewMsg;

    if (msg.type === "init") {
      state.topics = msg.topics || {};
      state.icons = msg.icons || {};
      state.selectedLang = msg.defaultLang || "Java";
      state.selectedTopic = msg.defaultTopic || (state.topics[state.selectedLang]?.[0] || "");

      if (msg.translations) state.allTranslations = msg.translations;
      if (msg.uiLang) state.currentUiLang = msg.uiLang;
      if (msg.uiLanguages) {
        state.uiLanguages = msg.uiLanguages;
        renderUiLanguageSwitch();
      }
      applyTranslations();
      setQuickSolveAppliedState(state.quickSolveApplied);
      renderLangButtons();
      renderTopics();
      renderCustomLangButtons();
      showPracticeView(state.practiceView);

      if (msg.customPractices) { state.customPractices = msg.customPractices; renderCustomHistory(); }
      if (msg.stats) renderProgressStats(msg.stats);
      if (msg.recommendations) renderRecommendations(msg.recommendations);
      if (msg.aiSettings) loadSettingsUI(msg.aiSettings);
      updateCodeSizeGroupVisibility();
      updateSourceToggle();
    }

    if (msg.type === "settingsSaved") {
      if (dom.settingsSavedMsg) {
        dom.settingsSavedMsg.textContent = t("settings.savedUsing") + " " + (providerDisplayNames[state.currentProvider] || state.currentProvider) + " \u00b7 " + getSelectedModelLabel(state.currentProvider);
        dom.settingsSavedMsg.classList.add("show");
        dom.saveSettingsBtn?.classList.add("saved");
        if (dom.saveSettingsBtn) dom.saveSettingsBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + t("settings.savedShort");
        setTimeout(() => {
          dom.settingsSavedMsg?.classList.remove("show");
          dom.saveSettingsBtn?.classList.remove("saved");
          if (dom.saveSettingsBtn) dom.saveSettingsBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + t("settings.save");
        }, 2500);
      }
    }

    if (msg.type === "customPractices") {
      state.customPractices = msg.practices || [];
      renderCustomHistory();
    }

    if (msg.type === "switchTab") {
      document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const targetTab = document.querySelector('.tab[data-tab="' + (msg.tab || "practice") + '"]');
      if (targetTab) targetTab.classList.add("active");
      const targetPanel = document.getElementById((msg.tab || "practice") + "Panel");
      if (targetPanel) targetPanel.classList.add("active");
      document.body.classList.remove("practice-focus-mode", "settings-focus-mode");
      if ((msg.tab || "practice") === "progress") post({ type: "getProgress" });
      if ((msg.tab || "practice") === "custom") post({ type: "getCustomPractices" });
    }

    if (msg.type === "progressData") {
      if (msg.stats) renderProgressStats(msg.stats);
      if (msg.recommendations) renderRecommendations(msg.recommendations);
      if (msg.topicStats) renderTopicProgress(msg.topicStats);
    }

    if (msg.type === "progressUpdate") {
      if (msg.stats) renderProgressStats(msg.stats);
    }

    if (msg.type === "busy") {
      const v = !!msg.value;
      if (v) setBusyButtonStates(msg.action || state.currentLoadingAction);
      else clearBusyButtonStates();
      if (dom.spin) dom.spin.style.display = "none";
      const topProg = document.getElementById("topbarProgress");
      if (topProg) { v ? topProg.classList.add("active") : topProg.classList.remove("active"); }
      if (dom.genBtn) dom.genBtn.disabled = v;
      if (dom.topbarGenBtn) dom.topbarGenBtn.disabled = v;
      if (dom.runBtn) dom.runBtn.disabled = v;
      if (dom.judgeBtn) dom.judgeBtn.disabled = v;
      if (!state.practiceSkipped) {
        if (dom.teachBtn) dom.teachBtn.disabled = v;
        if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = v;
        if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = v;
        if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = v;
      }
      showLoading(v, msg.action || state.currentLoadingAction);
    }

    if (msg.type === "testGenStatus") {
      if (dom.judgeBtn) {
        if (msg.status === "pending") {
          dom.judgeBtn.disabled = true;
          dom.judgeBtn.title = t("msg.testsGenerating");
        } else {
          dom.judgeBtn.disabled = false;
          dom.judgeBtn.title = "";
        }
      }
    }

    if (msg.type === "loadingProgress") {
      if (dom.loadingTip && msg.text) dom.loadingTip.textContent = msg.text;
      const lbi = document.getElementById("loadingBarInner");
      const lpc = document.getElementById("loadingPct");
      if (lbi && msg.percent != null) {
        (lbi as HTMLElement).style.width = msg.percent + "%";
        if (lpc) lpc.textContent = msg.percent + "%";
      }
    }

    if (msg.type === "ghostModeStatus") {
      if (dom.ghostModeBtn) {
        if (msg.active) dom.ghostModeBtn.classList.add("active");
        else dom.ghostModeBtn.classList.remove("active");
      }
    }

    if (msg.type === "toast") {
      let retryFn: (() => void) | null = null;
      if (msg.retryable === "generate") {
        retryFn = () => {
          state.currentLoadingAction = "generate";
          post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
        };
      }
      showToast(msg.kind, msg.text, retryFn);
    }

    if (msg.type === "details") {
      handleDetails(msg);
    }

    if (msg.type === "solution") {
      const inlineJudgeRecovery = state.pendingJudgeRecoverySolution && state.practiceView === "judge" && !!state.lastJudgeMsg && !state.lastJudgeMsg.pass;
      state.pendingJudgeRecoverySolution = false;
      if (!inlineJudgeRecovery) {
        showPracticeView("judge");
        hideCrossLang();
        setTopbarStatus(null);
        clearInlineRunOutput();
        dom.outputWrap?.classList.remove("show");
        dom.passButtons?.classList.remove("show");
        dom.judgeRecoveryActions?.classList.remove("show");
      }
      const s = msg.solution;
      const solEl = document.getElementById("solution");
      if (solEl) { solEl.innerHTML = s.code ? highlightCode(s.code) : "\u2014"; }
      const expEl = document.getElementById("explanation");
      if (expEl) expEl.textContent = s.explanation || "\u2014";
      dom.solutionWrap?.classList.add("show");
      if (!inlineJudgeRecovery && dom.teachBtn) dom.teachBtn.style.display = "none";
    }

    if (msg.type === "quickSolveApplied") {
      showPracticeView("detail");
      setTopbarStatus(null);
      setQuickSolveAppliedState(true);
      clearInlineRunOutput();
      clearJudgeRewards();
      dom.outputWrap?.classList.remove("show");
      dom.solutionWrap?.classList.remove("show");
      dom.passButtons?.classList.remove("show");
      dom.judgeRecoveryActions?.classList.remove("show");
      state.pendingJudgeRecoverySolution = false;
      if (dom.judgeFooter) dom.judgeFooter.style.display = "none";
      if (dom.teachBtn) { dom.teachBtn.disabled = false; dom.teachBtn.style.display = "block"; }
      if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = false;
      if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = false;
      if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = false;
      state.practiceSkipped = false;
    }

    if (msg.type === "skipped") {
      state.practiceSkipped = true;
      showPracticeView("detail");
      setTopbarStatus(null);
      clearInlineRunOutput();
      clearJudgeRewards();
      dom.outputWrap?.classList.remove("show");
      dom.solutionWrap?.classList.remove("show");
      dom.passButtons?.classList.remove("show");
      dom.judgeRecoveryActions?.classList.remove("show");
      state.pendingJudgeRecoverySolution = false;
      if (dom.judgeFooter) dom.judgeFooter.style.display = "none";
      if (dom.teachBtn) { dom.teachBtn.disabled = true; dom.teachBtn.style.display = "block"; }
      if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = true;
      if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = true;
      if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = true;
    }

    if (msg.type === "alternativeMethodsResult") {
      const allMethods = (msg.methods || []).filter(m =>
        !!m &&
        typeof m.code === "string" &&
        m.code.trim().length > 0 &&
        String(m.name || "").trim().toLowerCase() !== "error"
      );
      const hasStudentLead = allMethods.length > 0 && /student'?s approach/i.test(String(allMethods[0].name || ""));
      const visibleMethods = (hasStudentLead ? allMethods.slice(1) : allMethods)
        .map((m, visibleIdx) => ({ method: m, originalIndex: hasStudentLead ? visibleIdx + 1 : visibleIdx }));

      if (visibleMethods.length === 0) {
        removeAltMethodsWrap();
        state.altMethodsLoaded = false;
        showToast("info", getAltMethodsUnavailableMessage());
        return;
      }

      state.altMethodsLoaded = true;
      createAltMethodsWrap();
      if (!state.altMethodsList) {
        return;
      }
      state.altMethodsList.innerHTML = "";

      visibleMethods.forEach(({ method: m, originalIndex }) => {
        const card = document.createElement("div");
        card.className = "alt-method-card";
        card.style.cursor = "pointer";
        const header = document.createElement("div");
        header.className = "alt-method-header";
        const nameEl = document.createElement("span");
        nameEl.className = "alt-method-name";
        nameEl.textContent = m.name || t("alt.method");
        header.appendChild(nameEl);
        card.appendChild(header);
        if (m.explanation) {
          const explanationEl = document.createElement("div");
          explanationEl.className = "alt-method-explanation";
          explanationEl.textContent = m.explanation;
          card.appendChild(explanationEl);
        }
        card.addEventListener("click", () => {
          post({ type: "openAltMethod", index: originalIndex, name: m.name || t("alt.method"), code: m.code || "", explanation: m.explanation || "" });
        });
        state.altMethodsList!.appendChild(card);
      });
    }

    if (msg.type === "crossLanguageResult") {
      post({ type: "openCrossLang", lang: "", code: msg.code || "", highlights: msg.highlights || [], targetLang: msg.targetLang || "" });
    }

    if (msg.type === "output") {
      handleOutput(msg);
    }

    if (msg.type === "judgeResult") {
      handleJudgeResult(msg);
    }
  });
}

// ─── Detail handlers extracted for readability ───

function handleDetails(msg: Extract<ExtToWebviewMsg, { type: "details" }>): void {
  const d = msg.details;
  const isBugFix = d.mode === "bugfix";
  state.currentPracticeLang = d.lang || "Java";
  state.availableCrossLangs = isBugFix ? [] : (d.availableCrossLangs ?? null);
  state._isBugFixMode = isBugFix;
  showPracticeView("detail");
  setTopbarStatus(null);
  dom.practiceDetailPage?.classList.add("fade-in");
  const titleEl = document.getElementById("title");
  const langBadgeEl = document.getElementById("langBadge");
  const taskEl = document.getElementById("task");
  const miniEl = document.getElementById("mini");
  const hintEl = document.getElementById("hint");
  if (titleEl) titleEl.textContent = d.title || t("tab.practice");
  if (langBadgeEl) langBadgeEl.textContent = d.lang.toUpperCase();
  if (taskEl) taskEl.innerHTML = enhanceTask(d.task);
  if (miniEl) miniEl.textContent = d.expectedOutput || "\u2014";
  if (hintEl) hintEl.textContent = d.hint || "\u2014";

  const autoBadge = document.getElementById("autoSelectedBadge");
  if (autoBadge) {
    if (d.multiTopicReason) { autoBadge.style.display = "inline-flex"; autoBadge.textContent = (d.topic || "") + " \u2022 " + d.multiTopicReason; }
    else { autoBadge.style.display = "none"; }
  }

  state._isCustomMode = (d.topic === "Custom" && !!d.customPrompt);
  state._customPrompt = d.customPrompt || "";
  state._customModeLang = d.lang || "Java";

  const cpEditWrap = document.getElementById("customPromptEditWrap");
  if (cpEditWrap) {
    if (state._isCustomMode) {
      cpEditWrap.style.display = "block";
      const cpEditInput = document.getElementById("customPromptEdit") as HTMLTextAreaElement | null;
      if (cpEditInput) cpEditInput.value = state._customPrompt;
    } else { cpEditWrap.style.display = "none"; }
  }

  const lvl = d.topicXP ? d.topicXP.level : (d.level || 1);
  if (dom.levelBadge) {
    dom.levelBadge.textContent = t("practice.lvl") + " " + lvl;
    dom.levelBadge.className = "level-badge lvl-" + Math.min(lvl, 5);
  }
  if (dom.practiceXpTopic) {
    dom.practiceXpTopic.textContent = d.topic || t("practice.multiTopic");
  }
  if (dom.detailFooterText) {
    const topicLabel = d.topic === "__multi__" ? t("practice.multiTopic") : (d.topic || t("practice.multiTopic"));
    dom.detailFooterText.textContent = `${topicLabel} • ${t("practice.lvl")} ${lvl}`;
  }

  if (d.topicXP) {
    const xpPct = d.topicXP.xpNeeded > 0 ? Math.round((d.topicXP.xp / d.topicXP.xpNeeded) * 100) : 0;
    if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = xpPct + "%";
    if (dom.practiceXpCount) dom.practiceXpCount.textContent = d.topicXP.xp + " / " + d.topicXP.xpNeeded + " XP";
  } else {
    if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = "0%";
    if (dom.practiceXpCount) dom.practiceXpCount.textContent = "0 / 100 XP";
  }

  // Reset states
  setQuickSolveAppliedState(false);
  state.hintVisible = false;
  dom.hintBody?.classList.remove("show");
  if (dom.hintToggle) dom.hintToggle.textContent = t("hint.show");
  dom.solutionWrap?.classList.remove("show");
  if (dom.teachBtn) { dom.teachBtn.style.display = "block"; dom.teachBtn.disabled = false; }
  if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = false;
  if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = false;
  if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = false;
  clearInlineRunOutput();
  clearJudgeRewards();
  dom.outputWrap?.classList.remove("show");
  setRunOutputCompactMode(false);
  resetResultHero();
  if (dom.outputEl) { dom.outputEl.style.display = "none"; dom.outputEl.textContent = "\u2014"; }
  if (dom.testCasesList) dom.testCasesList.innerHTML = "";
  setTopbarStatus(null);
  dom.passButtons?.classList.remove("show");
  dom.judgeRecoveryActions?.classList.remove("show");
  if (dom.judgeFooter) dom.judgeFooter.style.display = "none";
  clearJudgeFeedbackUi();
  resetLastJudgeState();

  // Remove old celebration
  if (dom.outputWrap) {
    dom.outputWrap.querySelector(".celebrate")?.remove();
    dom.outputWrap.querySelector(".xp-earned-wrap")?.remove();
    dom.outputWrap.querySelector(".xp-levelup-banner")?.remove();
  }
  removeAltMethodsWrap();
  state.altMethodsLoaded = false;
  state.practiceSkipped = false;
  state.pendingJudgeRecoverySolution = false;
  dom.practiceJudgePage?.classList.remove("fade-in");
  if (dom.ghostModeBtn) dom.ghostModeBtn.classList.remove("active");
  syncCrossLangForJudge(false);

  // Populate cross-language dropdown
  if (dom.crossLangDropdown) {
    dom.crossLangDropdown.innerHTML = "";
    const crossTargets = isBugFix
      ? []
      : (state.availableCrossLangs ?? DEFAULT_CROSS_LANG_TARGETS.filter(targetLang => targetLang !== d.lang));

    crossTargets.forEach(targetLang => {
      const item = document.createElement("button");
      item.className = "cross-lang-item";
      item.textContent = targetLang;
      /*
        item.title = `${d.lang} offline practice için ${targetLang} cross-language henüz eklenmedi.`;
        item.style.opacity = "0.7";
        item.addEventListener("click", () => {
          dom.crossLangDropdown!.classList.remove("show");
          showToast("info", `${d.lang} offline practice için ${targetLang} cross-language henüz yok.`);
        });
      */
        item.addEventListener("click", () => {
          dom.crossLangDropdown!.classList.remove("show");
          dom.crossLangBtn?.classList.remove("expanded");
          dom.crossLangBtn?.setAttribute("aria-expanded", "false");
          state.currentLoadingAction = "teach";
          post({ type: "crossLanguage", targetLang });
        });
      dom.crossLangDropdown!.appendChild(item);
    });
  }

  // Bug Fix mode
  const bugBadge = document.getElementById("bugFixBadge");
  const sourceAttr = document.getElementById("sourceAttribution");
  const sourceRepoName = document.getElementById("sourceRepoName");
  const bugExItem = document.getElementById("bugExplanationItem");
  const bugExBody = document.getElementById("bugExplanationBody");

  if (bugBadge) bugBadge.style.display = isBugFix ? "inline-flex" : "none";
  if (isBugFix && d.sourceRepo && d.sourceRepo !== "generated") {
    if (sourceAttr) sourceAttr.style.display = "block";
    if (sourceRepoName) sourceRepoName.textContent = d.sourceRepo;
  } else { if (sourceAttr) sourceAttr.style.display = "none"; }

  (window as any)._bugExplanation = isBugFix ? (d.bugExplanation || "") : "";
  if (bugExItem) bugExItem.style.display = "none";
  if (bugExBody) bugExBody.textContent = "";

  if (dom.hintCodeBtn) dom.hintCodeBtn.textContent = isBugFix ? t("practice.revealBug") : t("practice.addHints");

  const isApi = d.mode === "api";
  if (dom.apiPreviewBtn) dom.apiPreviewBtn.style.display = isApi ? "inline-flex" : "none";
}

function handleOutput(msg: Extract<ExtToWebviewMsg, { type: "output" }>): void {
  showPracticeView("detail");
  state.pendingJudgeRecoverySolution = false;
  setTopbarStatus(null);
  clearJudgeFeedbackUi();
  dom.outputWrap?.classList.remove("show");
  dom.solutionWrap?.classList.remove("show");
  dom.passButtons?.classList.remove("show");
  dom.judgeRecoveryActions?.classList.remove("show");
  clearJudgeRewards();
  if (dom.judgeFooter) dom.judgeFooter.style.display = "none";
  if (dom.teachBtn) dom.teachBtn.style.display = "block";
  if (dom.runOutputWrap) dom.runOutputWrap.classList.add("show");
  if (dom.runOutputEl) dom.runOutputEl.textContent = msg.text || "\u2014";
  if (dom.runDuration) dom.runDuration.textContent = msg.durationMs != null ? `${msg.durationMs} ms` : "";
  resetResultHero();
  if (dom.outputEl) { dom.outputEl.style.display = "none"; dom.outputEl.textContent = "\u2014"; }
  if (dom.testCasesList) { dom.testCasesList.innerHTML = ""; dom.testCasesList.style.display = "none"; }
  showPerfCard(undefined);
  if (dom.outputWrap) {
    dom.outputWrap.querySelector(".celebrate")?.remove();
    dom.outputWrap.querySelector(".xp-earned-wrap")?.remove();
    dom.outputWrap.querySelector(".xp-levelup-banner")?.remove();
  }
  dom.passButtons?.classList.remove("show");
  hideCrossLang();
  removeAltMethodsWrap();
}

function handleJudgeResult(msg: Extract<ExtToWebviewMsg, { type: "judgeResult" }>): void {
  showPracticeView("judge");
  hideCrossLang();
  clearInlineRunOutput();
  setQuickSolveAppliedState(false);
  dom.solutionWrap?.classList.remove("show");
  dom.outputWrap?.classList.add("show");
  setRunOutputCompactMode(false);

  const hero = document.getElementById("resultHero");
  const celebrate = document.getElementById("resultCelebrate");
  const score = document.getElementById("resultScore");
  const subtext = document.getElementById("resultSubtext");
  const progress = document.getElementById("resultProgressFill");

  // Store test results for repair feature
  if (msg.testResults) {
    state.lastTestResults = msg.testResults;
    state.lastJudgeMsg = msg;
  }

  // Test case cards
  if (msg.testResults && msg.testResults.length > 0 && dom.testCasesList) {
    dom.testCasesList.innerHTML = "";
    let passed = 0;
    const total = msg.testResults.length;
    for (let ti = 0; ti < total; ti++) {
      const tr = msg.testResults[ti];
      if (tr.pass) passed++;
      const card = document.createElement("div");
      card.className = "tc-card " + (tr.pass ? "tc-pass" : "tc-fail");
      const dot = document.createElement("div");
      dot.className = "tc-dot";
      dot.textContent = tr.pass ? "\u2713" : "\u2717";
      card.appendChild(dot);
      const body = document.createElement("div");
      body.className = "tc-body";
      const nameEl = document.createElement("div");
      nameEl.className = "tc-name " + (tr.pass ? "pass" : "fail");
      nameEl.textContent = (ti + 1) + ". " + (tr.name || (tr.pass ? t("judge.passed") : t("judge.failUpper")));
      body.appendChild(nameEl);
      if (tr.pass && (tr.got || tr.expected)) {
        const previewRow = document.createElement("div");
        previewRow.className = "tc-pass-preview";
        previewRow.textContent = tr.got || tr.expected;
        body.appendChild(previewRow);
      }
      if (!tr.pass) {
        if (tr.expected) {
          const expRow = document.createElement("div"); expRow.className = "tc-detail-row";
          const expLabel = document.createElement("span"); expLabel.className = "tc-detail-label"; expLabel.textContent = t("test.expected");
          const expVal = document.createElement("span"); expVal.className = "tc-detail-value"; expVal.textContent = tr.expected;
          expRow.appendChild(expLabel); expRow.appendChild(expVal); body.appendChild(expRow);
        }
        if (tr.got) {
          const gotRow = document.createElement("div"); gotRow.className = "tc-detail-row";
          const gotLabel = document.createElement("span"); gotLabel.className = "tc-detail-label"; gotLabel.textContent = t("test.got");
          const gotVal = document.createElement("span"); gotVal.className = "tc-detail-value fail-val"; gotVal.textContent = tr.got;
          gotRow.appendChild(gotLabel); gotRow.appendChild(gotVal); body.appendChild(gotRow);
        }
        // Repair button — only show when ref output differs from expected (AI mismatch)
        if (tr.refOutput && tr.refOutput !== tr.expected) {
          const repairBtn = document.createElement("button");
          repairBtn.className = "tc-repair-btn";
          repairBtn.textContent = t("test.repair");
          repairBtn.title = t("test.repairTip");
          repairBtn.addEventListener("click", () => {
            if (!state.lastTestResults) return;
            const entry = state.lastTestResults[ti];
            if (!entry || !entry.refOutput) return;
            entry.expected = entry.refOutput;
            entry.pass = (entry.got.trim() === entry.refOutput.trim());
            // Re-render test results with updated data
            const updatedMsg = {
              ...state.lastJudgeMsg,
              pass: state.lastTestResults.every(r => r.pass),
              testResults: state.lastTestResults,
            };
            handleJudgeResult(updatedMsg);
            // Notify extension to persist the corrected expected value
            post({ type: "repairTestCase", index: ti } as any);
          });
          body.appendChild(repairBtn);
        }
      }
      card.appendChild(body);
      dom.testCasesList.appendChild(card);
    }
    // Summary bar
    const summary = document.createElement("div"); summary.className = "tc-summary";
    summary.textContent = passed + "/" + total + " " + t("judge.passed");
    const summaryBar = document.createElement("div"); summaryBar.className = "tc-summary-bar";
    const summaryFill = document.createElement("div"); summaryFill.className = "tc-summary-fill";
    summaryFill.style.width = Math.round((passed / total) * 100) + "%";
    summaryBar.appendChild(summaryFill); summary.appendChild(summaryBar);
    dom.testCasesList.appendChild(summary);
    dom.testCasesList.style.display = "grid";
    if (dom.outputEl) dom.outputEl.style.display = "none";
  } else {
    if (dom.testCasesList) dom.testCasesList.style.display = "none";
    if (dom.outputEl) { dom.outputEl.style.display = "block"; dom.outputEl.textContent = msg.output || "\u2014"; }
  }

  const passedCount = msg.testResults?.filter(tr => tr.pass).length ?? (msg.pass ? 1 : 0);
  const totalCount = msg.testResults?.length ?? 1;
  const isPartial = !msg.pass && totalCount > 1 && passedCount > 0;
  const heroStatus = msg.pass ? "pass" : isPartial ? "partial" : "fail";
  if (msg.pass) {
    state.pendingJudgeRecoverySolution = false;
  }
  setTopbarStatus(heroStatus);
  clearJudgeRewards();
  setJudgeFooter(passedCount, totalCount, heroStatus);
  const heroCopy = getJudgeHeroCopySafe(heroStatus);
  if (hero && celebrate && score && subtext && progress) {
    hero.classList.add("show");
    celebrate.className = "result-celebrate " + heroStatus;
    celebrate.textContent = heroCopy.title;
    score.innerHTML = `${passedCount}<span class="result-score-dim">/${totalCount}</span>`;
    subtext.textContent = heroCopy.subtitle;
    progress.className = "result-progress-fill " + heroStatus;
    (progress as HTMLElement).style.width = `${Math.round((passedCount / Math.max(totalCount, 1)) * 100)}%`;
  }

  if (msg.pass) {
    showPerfCard(msg.durationMs);
    clearJudgeFeedbackUi();
    if (msg.xp && msg.xp.earned > 0) {
      const xpEl = document.createElement("div"); xpEl.className = "xp-earned-wrap";
      const bk = msg.xp.breakdown || { speed: 1, hint: 1, chat: 1, firstTry: 1 };
      const parts: string[] = [];
      if (bk.speed && bk.speed !== 1.0) parts.push('<span class="' + (bk.speed > 1 ? "bonus" : "") + '">' + t("xp.speed") + " " + bk.speed + "x</span>");
      if (bk.hint && bk.hint > 1) parts.push('<span class="bonus">' + t("xp.noHint") + " " + bk.hint + "x</span>");
      if (bk.chat && bk.chat > 1) parts.push('<span class="bonus">' + t("xp.noChat") + " " + bk.chat + "x</span>");
      if (bk.firstTry && bk.firstTry > 1) parts.push('<span class="bonus">' + t("xp.firstTry") + " " + bk.firstTry + "x</span>");
      xpEl.innerHTML = '<div class="xp-earned-amount">+' + Number(msg.xp.earned) + " XP</div>" + (parts.length > 0 ? '<div class="xp-earned-breakdown">' + parts.join(" \u00b7 ") + "</div>" : "");
      dom.judgeRewards?.appendChild(xpEl);

      const newPct = msg.xp.needed > 0 ? Math.round((msg.xp.total / msg.xp.needed) * 100) : 0;
      if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = Math.min(newPct, 100) + "%";
      if (dom.practiceXpCount) dom.practiceXpCount.textContent = msg.xp.total + " / " + msg.xp.needed + " XP";

      if (msg.xp.leveledUp) {
        const lvlBanner = document.createElement("div"); lvlBanner.className = "xp-levelup-banner";
        lvlBanner.textContent = t("xp.levelUp") + " LVL " + msg.xp.level;
        dom.judgeRewards?.appendChild(lvlBanner);
        if (dom.levelBadge) {
          dom.levelBadge.textContent = t("practice.lvl") + " " + msg.xp.level;
          dom.levelBadge.className = "level-badge lvl-" + Math.min(msg.xp.level, 5);
        }
        if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = Math.round((msg.xp.total / msg.xp.needed) * 100) + "%";
        if (dom.practiceXpCount) dom.practiceXpCount.textContent = msg.xp.total + " / " + msg.xp.needed + " XP";
      }
    }

    dom.passButtons?.classList.add("show");
    dom.judgeRecoveryActions?.classList.remove("show");
    const hasCrossLangTargets = !state._isBugFixMode && (state.availableCrossLangs === null || state.availableCrossLangs.length > 0);
    syncCrossLangForJudge(hasCrossLangTargets);
    if (state._isBugFixMode) {
      removeAltMethodsWrap();
    } else {
      if (!state.altMethodsLoaded) { post({ type: "alternativeMethods" }); }
      else { createAltMethodsWrap(); }
    }
  } else {
    showPerfCard(undefined);
    dom.passButtons?.classList.remove("show");
    dom.judgeRecoveryActions?.classList.add("show");
    hideCrossLang();

    // AI feedback
    clearJudgeFeedbackUi();
    if (msg.feedback && msg.feedback.summary) {
      const fbWrap = document.createElement("div"); fbWrap.className = "judge-feedback";
      const fbSummary = document.createElement("div"); fbSummary.className = "fb-summary";
      fbSummary.textContent = msg.feedback.summary;
      fbWrap.appendChild(fbSummary);
      if (msg.feedback.lines && msg.feedback.lines.length > 0) {
        const fbList = document.createElement("div"); fbList.className = "fb-lines";
        for (const fl of msg.feedback.lines) {
          const fbItem = document.createElement("div"); fbItem.className = "fb-line-item";
          const fbLineNum = document.createElement("span"); fbLineNum.className = "fb-line-num"; fbLineNum.textContent = t("feedback.line") + " " + fl.line;
          const fbProblem = document.createElement("span"); fbProblem.className = "fb-problem"; fbProblem.textContent = fl.problem;
          const fbFix = document.createElement("div"); fbFix.className = "fb-fix"; fbFix.textContent = fl.fix;
          fbItem.appendChild(fbLineNum); fbItem.appendChild(fbProblem); fbItem.appendChild(fbFix);
          fbList.appendChild(fbItem);
        }
        fbWrap.appendChild(fbList);
      }
      const fbTarget = dom.testCasesList || dom.outputEl;
      if (fbTarget && fbTarget.parentNode) { fbTarget.parentNode.insertBefore(fbWrap, fbTarget.nextSibling); }
      else { dom.outputWrap?.appendChild(fbWrap); }
    }
    if (!state.pendingJudgeRecoverySolution && !dom.solutionWrap?.classList.contains("show")) {
      state.pendingJudgeRecoverySolution = true;
      post({ type: "showSolution" });
    }
  }

  // Update progress stats if included
  if (msg.stats) renderProgressStats(msg.stats);
}
