// Message handler — window.addEventListener("message") dispatch
import { state } from "../state";
import { dom } from "../dom";
import { t, applyTranslations } from "../i18n";
import { post } from "../vscodeApi";
import { showLoading, showPerfCard, showToast } from "../ui/loading";
import { renderLangButtons, renderTopics, updateSourceToggle } from "../ui/langTopics";
import { renderCustomLangButtons, renderCustomHistory } from "../ui/custom";
import { renderProgressStats, renderRecommendations, renderTopicProgress } from "../ui/progress";
import { loadSettingsUI, updateConfigBanner, updateOfflineIndicators, isCurrentlyOffline, providerDisplayNames, getSelectedModelLabel } from "../ui/settings";
import { highlightCode, enhanceTask } from "../ui/codeView";
import { createAltMethodsWrap, removeAltMethodsWrap } from "../ui/altMethods";
import type { ExtToWebviewMsg } from "../../shared/protocol";

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
      if (msg.uiLanguages && dom.uiLangSelect) {
        state.uiLanguages = msg.uiLanguages;
        dom.uiLangSelect.innerHTML = "";
        state.uiLanguages.forEach(lang => {
          const opt = document.createElement("option");
          opt.value = lang.code;
          opt.textContent = lang.flag + " " + lang.label;
          if (lang.code === state.currentUiLang) opt.selected = true;
          dom.uiLangSelect!.appendChild(opt);
        });
      }
      applyTranslations();
      renderLangButtons();
      renderTopics();
      renderCustomLangButtons();

      const csGroupInit = document.getElementById("codeSizeGroup");
      if (csGroupInit) csGroupInit.style.display = state.selectedMode === "bugfix" ? "block" : "none";

      if (msg.customPractices) { state.customPractices = msg.customPractices; renderCustomHistory(); }
      if (msg.stats) renderProgressStats(msg.stats);
      if (msg.recommendations) renderRecommendations(msg.recommendations);
      if (msg.aiSettings) loadSettingsUI(msg.aiSettings);
      updateSourceToggle();
    }

    if (msg.type === "settingsSaved") {
      if (dom.settingsSavedMsg) {
        dom.settingsSavedMsg.textContent = "Saved! Using " + (providerDisplayNames[state.currentProvider] || state.currentProvider) + " \u00b7 " + getSelectedModelLabel(state.currentProvider);
        dom.settingsSavedMsg.classList.add("show");
        dom.saveSettingsBtn?.classList.add("saved");
        if (dom.saveSettingsBtn) dom.saveSettingsBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Saved!';
        setTimeout(() => {
          dom.settingsSavedMsg?.classList.remove("show");
          dom.saveSettingsBtn?.classList.remove("saved");
          if (dom.saveSettingsBtn) dom.saveSettingsBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Save Settings';
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
      if (dom.spin) dom.spin.style.display = v ? "block" : "none";
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
      const s = msg.solution;
      const solEl = document.getElementById("solution");
      if (solEl) { solEl.innerHTML = s.code ? highlightCode(s.code) : "\u2014"; }
      const expEl = document.getElementById("explanation");
      if (expEl) expEl.textContent = s.explanation || "\u2014";
      dom.solutionWrap?.classList.add("show");
      if (dom.teachBtn) dom.teachBtn.style.display = "none";
    }

    if (msg.type === "skipped") {
      state.practiceSkipped = true;
      if (dom.teachBtn) dom.teachBtn.disabled = true;
      if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = true;
      if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = true;
      if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = true;
      dom.passButtons?.classList.add("show");
    }

    if (msg.type === "alternativeMethodsResult") {
      state.altMethodsLoaded = true;
      createAltMethodsWrap();
      if (state.altMethodsList) {
        state.altMethodsList.innerHTML = "";
        (msg.methods || []).forEach((m, idx) => {
          const card = document.createElement("div");
          card.className = "alt-method-card" + (idx === 0 ? " alt-method-current" : "");
          card.style.cursor = "pointer";
          const header = document.createElement("div");
          header.className = "alt-method-header";
          const nameEl = document.createElement("span");
          nameEl.className = "alt-method-name";
          nameEl.textContent = m.name || "Method " + (idx + 1);
          header.appendChild(nameEl);
          if (idx === 0) {
            const yoursEl = document.createElement("span");
            yoursEl.className = "alt-method-yours";
            yoursEl.textContent = " " + t("alt.yours");
            header.appendChild(yoursEl);
          }
          if (idx > 0 && m.speedPercent) {
            const sp = m.speedPercent;
            const speedEl = document.createElement("span");
            speedEl.className = "alt-method-speed " + (sp > 110 ? "faster" : sp < 90 ? "slower" : "same");
            speedEl.textContent = sp > 100 ? "+" + (sp - 100) + "% " + t("alt.faster") : sp < 100 ? (100 - sp) + "% " + t("alt.slower") : "";
            if (speedEl.textContent) header.appendChild(speedEl);
          }
          card.appendChild(header);
          card.addEventListener("click", () => {
            post({ type: "openAltMethod", index: idx, name: m.name || "Method" + (idx + 1), code: m.code || "", explanation: m.explanation || "" });
          });
          state.altMethodsList!.appendChild(card);
        });
      }
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
  if (dom.practiceForm) dom.practiceForm.style.display = "none";
  if (dom.practiceTopbar) dom.practiceTopbar.style.display = "flex";
  const dwD = document.getElementById("detailsWrap");
  if (dwD) { dwD.style.display = "block"; dwD.classList.add("fade-in"); }
  document.getElementById("title")!.textContent = d.title || "Practice";
  document.getElementById("langBadge")!.textContent = d.lang.toUpperCase();
  document.getElementById("task")!.innerHTML = enhanceTask(d.task);
  document.getElementById("mini")!.textContent = d.expectedOutput || "\u2014";
  document.getElementById("hint")!.textContent = d.hint || "\u2014";

  const autoBadge = document.getElementById("autoSelectedBadge");
  if (autoBadge) {
    if (d.multiTopicReason) { autoBadge.style.display = "inline"; autoBadge.textContent = (d.topic || "") + " \u2022 " + d.multiTopicReason; }
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

  if (d.topicXP) {
    const xpPct = d.topicXP.xpNeeded > 0 ? Math.round((d.topicXP.xp / d.topicXP.xpNeeded) * 100) : 0;
    if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = xpPct + "%";
    if (dom.practiceXpCount) dom.practiceXpCount.textContent = d.topicXP.xp + " / " + d.topicXP.xpNeeded + " XP";
  } else {
    if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = "0%";
    if (dom.practiceXpCount) dom.practiceXpCount.textContent = "0 / 100 XP";
  }

  // Reset states
  state.hintVisible = false;
  dom.hintBody?.classList.remove("show");
  if (dom.hintToggle) dom.hintToggle.textContent = t("hint.show");
  dom.solutionWrap?.classList.remove("show");
  if (dom.teachBtn) { dom.teachBtn.style.display = "block"; dom.teachBtn.disabled = false; }
  if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = false;
  if (dom.quickSolveBtn) dom.quickSolveBtn.disabled = false;
  if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = false;
  dom.outputWrap?.classList.remove("show");
  if (dom.outputEl) { dom.outputEl.style.display = "none"; dom.outputEl.textContent = "\u2014"; }
  if (dom.testCasesList) dom.testCasesList.innerHTML = "";
  if (dom.resultBadge) { dom.resultBadge.textContent = ""; dom.resultBadge.className = "result-badge"; }
  dom.passButtons?.classList.remove("show");

  // Remove old celebration
  if (dom.outputWrap) {
    dom.outputWrap.querySelector(".celebrate")?.remove();
    dom.outputWrap.querySelector(".xp-earned-wrap")?.remove();
    dom.outputWrap.querySelector(".xp-levelup-banner")?.remove();
  }
  removeAltMethodsWrap();
  state.practiceSkipped = false;

  if (dom.ghostModeBtn) { dom.ghostModeBtn.style.display = d.lang !== "SQL" ? "inline-flex" : "none"; dom.ghostModeBtn.classList.remove("active"); }
  if (dom.crossLangBtn) dom.crossLangBtn.style.display = "none";
  if (dom.crossLangDropdown) dom.crossLangDropdown.classList.remove("show");

  // Populate cross-language dropdown
  if (dom.crossLangDropdown) {
    dom.crossLangDropdown.innerHTML = "";
    const crossTargets: Record<string, string> = { Java: "java", TypeScript: "ts", JavaScript: "js", Python: "py", "C#": "cs", "C++": "cpp", Go: "go", Rust: "rs" };
    Object.keys(crossTargets).forEach(targetLang => {
      if (targetLang === d.lang) return;
      const item = document.createElement("button");
      item.className = "cross-lang-item";
      item.textContent = targetLang;
      item.addEventListener("click", () => {
        dom.crossLangDropdown!.classList.remove("show");
        state.currentLoadingAction = "teach";
        post({ type: "crossLanguage", targetLang });
      });
      dom.crossLangDropdown!.appendChild(item);
    });
  }

  // Bug Fix mode
  const isBugFix = d.mode === "bugfix";
  const bugBadge = document.getElementById("bugFixBadge");
  const sourceAttr = document.getElementById("sourceAttribution");
  const sourceRepoName = document.getElementById("sourceRepoName");
  const bugExItem = document.getElementById("bugExplanationItem");
  const bugExBody = document.getElementById("bugExplanationBody");

  if (bugBadge) bugBadge.style.display = isBugFix ? "inline" : "none";
  if (isBugFix && d.sourceRepo && d.sourceRepo !== "generated") {
    if (sourceAttr) sourceAttr.style.display = "block";
    if (sourceRepoName) sourceRepoName.textContent = d.sourceRepo;
  } else { if (sourceAttr) sourceAttr.style.display = "none"; }

  (window as any)._bugExplanation = isBugFix ? (d.bugExplanation || "") : "";
  if (bugExItem) bugExItem.style.display = "none";
  if (bugExBody) bugExBody.textContent = "";

  state._isBugFixMode = isBugFix;
  if (dom.hintCodeBtn) dom.hintCodeBtn.textContent = isBugFix ? t("practice.revealBug") : t("practice.addHints");

  const isApi = d.mode === "api";
  if (dom.apiPreviewBtn) dom.apiPreviewBtn.style.display = isApi ? "inline-flex" : "none";
}

function handleOutput(msg: Extract<ExtToWebviewMsg, { type: "output" }>): void {
  dom.outputWrap?.classList.add("show");
  if (dom.outputEl) { dom.outputEl.style.display = "block"; dom.outputEl.textContent = msg.text || "\u2014"; }
  if (dom.testCasesList) { dom.testCasesList.innerHTML = ""; dom.testCasesList.style.display = "none"; }
  if (dom.resultBadge) { dom.resultBadge.textContent = ""; dom.resultBadge.className = "result-badge"; }
  showPerfCard(msg.durationMs);
  if (dom.outputWrap) {
    dom.outputWrap.querySelector(".celebrate")?.remove();
    dom.outputWrap.querySelector(".xp-earned-wrap")?.remove();
    dom.outputWrap.querySelector(".xp-levelup-banner")?.remove();
  }
  dom.passButtons?.classList.remove("show");
  if (dom.crossLangBtn) dom.crossLangBtn.style.display = "none";
  removeAltMethodsWrap();
}

function handleJudgeResult(msg: Extract<ExtToWebviewMsg, { type: "judgeResult" }>): void {
  dom.outputWrap?.classList.add("show");
  showPerfCard(msg.durationMs);

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
      const body = document.createElement("div");
      body.className = "tc-body";
      const nameEl = document.createElement("div");
      nameEl.className = "tc-name " + (tr.pass ? "pass" : "fail");
      nameEl.textContent = (ti + 1) + ". " + (tr.name || (tr.pass ? "Pass" : "Fail"));
      body.appendChild(nameEl);
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
    summary.textContent = passed + "/" + total + " passed";
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

  if (dom.resultBadge) {
    const isPartial = !msg.pass && msg.testResults && msg.testResults.length > 1 && msg.testResults.some(tr => tr.pass);
    if (isPartial) {
      dom.resultBadge.textContent = "PARTIAL";
      dom.resultBadge.className = "result-badge partial";
    } else {
      dom.resultBadge.textContent = msg.pass ? "PASS" : "FAIL";
      dom.resultBadge.className = "result-badge " + (msg.pass ? "pass" : "fail");
    }
  }

  if (msg.pass) {
    if (dom.outputWrap) {
      dom.outputWrap.querySelector(".celebrate")?.remove();
      dom.outputWrap.querySelector(".xp-earned-wrap")?.remove();
      dom.outputWrap.querySelector(".xp-levelup-banner")?.remove();
    }
    const celeb = document.createElement("div");
    celeb.className = "celebrate";
    celeb.innerHTML = '<div class="celebrate-text">' + t("judge.passed") + '</div>';
    dom.outputWrap?.insertBefore(celeb, dom.outputWrap.querySelector(".pass-buttons"));

    if (msg.xp && msg.xp.earned > 0) {
      const xpEl = document.createElement("div"); xpEl.className = "xp-earned-wrap";
      const bk = msg.xp.breakdown || { speed: 1, hint: 1, chat: 1, firstTry: 1 };
      const parts: string[] = [];
      if (bk.speed && bk.speed !== 1.0) parts.push('<span class="' + (bk.speed > 1 ? "bonus" : "") + '">' + t("xp.speed") + " " + bk.speed + "x</span>");
      if (bk.hint && bk.hint > 1) parts.push('<span class="bonus">' + t("xp.noHint") + " " + bk.hint + "x</span>");
      if (bk.chat && bk.chat > 1) parts.push('<span class="bonus">' + t("xp.noChat") + " " + bk.chat + "x</span>");
      if (bk.firstTry && bk.firstTry > 1) parts.push('<span class="bonus">' + t("xp.firstTry") + " " + bk.firstTry + "x</span>");
      xpEl.innerHTML = '<div class="xp-earned-amount">+' + Number(msg.xp.earned) + " XP</div>" + (parts.length > 0 ? '<div class="xp-earned-breakdown">' + parts.join(" \u00b7 ") + "</div>" : "");
      dom.outputWrap?.insertBefore(xpEl, dom.outputWrap.querySelector(".pass-buttons"));

      const newPct = msg.xp.needed > 0 ? Math.round((msg.xp.total / msg.xp.needed) * 100) : 0;
      if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = Math.min(newPct, 100) + "%";
      if (dom.practiceXpCount) dom.practiceXpCount.textContent = msg.xp.total + " / " + msg.xp.needed + " XP";

      if (msg.xp.leveledUp) {
        const lvlBanner = document.createElement("div"); lvlBanner.className = "xp-levelup-banner";
        lvlBanner.textContent = t("xp.levelUp") + " LVL " + msg.xp.level;
        dom.outputWrap?.insertBefore(lvlBanner, celeb);
        if (dom.levelBadge) {
          dom.levelBadge.textContent = t("practice.lvl") + " " + msg.xp.level;
          dom.levelBadge.className = "level-badge lvl-" + Math.min(msg.xp.level, 5);
        }
        if (dom.practiceXpFill) (dom.practiceXpFill as HTMLElement).style.width = Math.round((msg.xp.total / msg.xp.needed) * 100) + "%";
        if (dom.practiceXpCount) dom.practiceXpCount.textContent = msg.xp.total + " / " + msg.xp.needed + " XP";
      }
    }

    dom.passButtons?.classList.add("show");
    if (dom.crossLangBtn) dom.crossLangBtn.style.display = "block";
    if (!state.altMethodsLoaded) { post({ type: "alternativeMethods" }); }
    else { createAltMethodsWrap(); }
  } else {
    if (dom.outputWrap) {
      dom.outputWrap.querySelector(".celebrate")?.remove();
      dom.outputWrap.querySelector(".xp-earned-wrap")?.remove();
      dom.outputWrap.querySelector(".xp-levelup-banner")?.remove();
    }
    dom.passButtons?.classList.remove("show");
    if (dom.crossLangBtn) dom.crossLangBtn.style.display = "none";
    removeAltMethodsWrap();

    // AI feedback
    if (dom.outputWrap) {
      const oldFb = dom.outputWrap.querySelector(".judge-feedback");
      if (oldFb) oldFb.remove();
    }
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
  }

  // Update progress stats if included
  if (msg.stats) renderProgressStats(msg.stats);
}
