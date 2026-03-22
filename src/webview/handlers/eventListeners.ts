// Event listeners — all button click handlers
import { state } from "../state";
import { dom } from "../dom";
import { t, applyTranslations } from "../i18n";
import { post } from "../vscodeApi";
import { showLoading, showToast } from "../ui/loading";
import { renderLangButtons, renderTopics, updateSourceToggle } from "../ui/langTopics";
import { renderCustomLangButtons } from "../ui/custom";
import { showProviderConfig, updateConfigBanner, updateOfflineIndicators, isCurrentlyOffline, collectSettings } from "../ui/settings";

export function initEventListeners(): void {
  // UI language selector
  if (dom.uiLangSelect) {
    dom.uiLangSelect.addEventListener("change", () => {
      state.currentUiLang = dom.uiLangSelect!.value;
      applyTranslations();
      post({ type: "setUiLang", lang: state.currentUiLang });
    });
  }

  // Tab switching
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panelId = (tab as HTMLElement).dataset.tab + "Panel";
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add("active");
      if ((tab as HTMLElement).dataset.tab === "progress") post({ type: "getProgress" });
      if ((tab as HTMLElement).dataset.tab === "custom") post({ type: "getCustomPractices" });
    });
  });

  // Generate button
  if (dom.genBtn) {
    dom.genBtn.addEventListener("click", () => {
      if (dom.genBtn!.disabled) return;
      dom.genBtn!.disabled = true;
      state.currentLoadingAction = "generate";
      const wb = document.getElementById("welcomeBanner");
      if (wb) wb.style.display = "none";
      post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
    });
  }

  // Top bar: Back button
  if (dom.topbarBackBtn) {
    dom.topbarBackBtn.addEventListener("click", () => {
      if (dom.practiceForm) dom.practiceForm.style.display = "block";
      if (dom.practiceTopbar) dom.practiceTopbar.style.display = "none";
      if (dom.detailsWrap) dom.detailsWrap.style.display = "none";
    });
  }

  // Top bar: New Practice button
  if (dom.topbarGenBtn) {
    dom.topbarGenBtn.addEventListener("click", () => {
      if (dom.topbarGenBtn!.disabled) return;
      dom.topbarGenBtn!.disabled = true;
      state.currentLoadingAction = "generate";
      if (state._isCustomMode && state._customPrompt) {
        post({ type: "generateCustom", prompt: state._customPrompt, lang: state._customModeLang });
      } else {
        post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
      }
    });
  }

  // Run button
  if (dom.runBtn) {
    dom.runBtn.addEventListener("click", () => {
      if (dom.runBtn!.disabled) return;
      dom.runBtn!.disabled = true;
      if (dom.judgeBtn) dom.judgeBtn.disabled = true;
      state.currentLoadingAction = "run";
      post({ type: "run" });
    });
  }

  // Judge button
  if (dom.judgeBtn) {
    dom.judgeBtn.addEventListener("click", () => {
      if (dom.judgeBtn!.disabled) return;
      if (dom.runBtn) dom.runBtn.disabled = true;
      dom.judgeBtn!.disabled = true;
      state.currentLoadingAction = "judge";
      post({ type: "judge" });
    });
  }

  // Hint code button
  if (dom.hintCodeBtn) {
    dom.hintCodeBtn.addEventListener("click", () => {
      if (dom.hintCodeBtn!.disabled) return;
      if (state._isBugFixMode) {
        const bugExItem = document.getElementById("bugExplanationItem");
        const bugExBody = document.getElementById("bugExplanationBody");
        if (bugExItem && (window as any)._bugExplanation) {
          bugExItem.style.display = "block";
          if (bugExBody) bugExBody.textContent = (window as any)._bugExplanation;
          dom.hintCodeBtn!.disabled = true;
          post({ type: "hintViewed" });
        }
        return;
      }
      dom.hintCodeBtn!.disabled = true;
      state.currentLoadingAction = "hint";
      post({ type: "addHints" });
    });
  }

  // Show solution button
  if (dom.showSolutionBtn) {
    dom.showSolutionBtn.addEventListener("click", () => {
      if (dom.showSolutionBtn!.disabled) return;
      dom.showSolutionBtn!.disabled = true;
      state.currentLoadingAction = "teach";
      post({ type: "showSolution" });
    });
  }

  // Next practice button
  if (dom.nextPracticeBtn) {
    dom.nextPracticeBtn.addEventListener("click", () => {
      dom.passButtons?.classList.remove("show");
      state.currentLoadingAction = "generate";
      if (state._isCustomMode && state._customPrompt) {
        post({ type: "generateCustom", prompt: state._customPrompt, lang: state._customModeLang });
      } else {
        post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
      }
    });
  }

  // Similar practice button
  if (dom.similarPracticeBtn) {
    dom.similarPracticeBtn.addEventListener("click", () => {
      dom.passButtons?.classList.remove("show");
      state.currentLoadingAction = "generate";
      if (state._isCustomMode && state._customPrompt) {
        post({ type: "generateCustom", prompt: state._customPrompt, lang: state._customModeLang });
      } else {
        post({ type: "similarPractice", lang: state.selectedLang, topic: state.selectedTopic });
      }
    });
  }

  // Hint toggle
  if (dom.hintToggle) {
    dom.hintToggle.addEventListener("click", () => {
      state.hintVisible = !state.hintVisible;
      dom.hintBody?.classList.toggle("show", state.hintVisible);
      if (dom.hintToggle) dom.hintToggle.textContent = state.hintVisible ? t("hint.hide") : t("hint.show");
      if (state.hintVisible) post({ type: "hintViewed" });
    });
  }

  // Teach me button
  if (dom.teachBtn) {
    dom.teachBtn.addEventListener("click", () => {
      if (dom.teachBtn!.disabled) return;
      dom.teachBtn!.disabled = true;
      state.currentLoadingAction = "teach";
      post({ type: "teachMe", lang: state.selectedLang, topic: state.selectedTopic });
    });
  }

  // Try similar button (in solution panel)
  if (dom.retryBtn) {
    dom.retryBtn.addEventListener("click", () => {
      dom.solutionWrap?.classList.remove("show");
      if (dom.teachBtn) dom.teachBtn.style.display = "block";
      state.currentLoadingAction = "generate";
      post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
    });
  }

  // Open AI Chat
  if (dom.openChatBtn) {
    dom.openChatBtn.addEventListener("click", () => {
      const offline = isCurrentlyOffline() || state.selectedSource === "offline";
      if (offline) { showToast("warn", "AI Chat requires an AI provider. Configure an API key in Settings."); return; }
      post({ type: "openChat" });
    });
  }

  // Quick Solve
  if (dom.quickSolveBtn) {
    dom.quickSolveBtn.addEventListener("click", () => {
      if (dom.quickSolveBtn!.disabled) return;
      if (dom.teachBtn) dom.teachBtn.disabled = true;
      if (dom.showSolutionBtn) dom.showSolutionBtn.disabled = true;
      if (dom.hintCodeBtn) dom.hintCodeBtn.disabled = true;
      dom.quickSolveBtn!.disabled = true;
      state.currentLoadingAction = "teach";
      post({ type: "quickSolve", lang: state.selectedLang, topic: state.selectedTopic });
    });
  }

  // Ghost Mode
  if (dom.ghostModeBtn) {
    dom.ghostModeBtn.addEventListener("click", () => {
      post({ type: "toggleGhostMode" });
    });
  }

  // Review Due
  if (dom.reviewDueBtn) {
    dom.reviewDueBtn.addEventListener("click", () => {
      const dueRec = state.recommendations.find(r => r.type === "due");
      if (dueRec) {
        document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        document.querySelector('.tab[data-tab="practice"]')?.classList.add("active");
        dom.practicePanel?.classList.add("active");
        state.selectedLang = dueRec.lang;
        state.selectedTopic = dueRec.topic;
        renderLangButtons();
        renderTopics();
        state.currentLoadingAction = "generate";
        post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
      } else {
        showToast("ok", t("progress.noReviewsDue"));
      }
    });
  }

  // Custom panel: Generate
  if (dom.customGenBtn) {
    dom.customGenBtn.addEventListener("click", () => {
      const prompt = (dom.customPromptInput ? dom.customPromptInput.value : "").trim();
      if (!prompt) { showToast("error", "Please describe what you want to practice"); return; }
      state.currentLoadingAction = "generate";
      post({ type: "generateCustom", prompt, lang: state.customLang });
    });
  }

  // Custom panel: Open Settings
  const customGoSettingsBtn = document.getElementById("customGoSettingsBtn");
  if (customGoSettingsBtn) {
    customGoSettingsBtn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const settingsTab = document.querySelector('.tab[data-tab="settings"]');
      const settingsPanel = document.getElementById("settingsPanel");
      if (settingsTab) settingsTab.classList.add("active");
      if (settingsPanel) settingsPanel.classList.add("active");
    });
  }

  // Custom panel: Switch to AI
  const customSwitchAiBtn = document.getElementById("customSwitchAiBtn");
  if (customSwitchAiBtn) {
    customSwitchAiBtn.addEventListener("click", () => {
      state.selectedSource = "ai";
      document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => {
        (b as HTMLElement).classList.toggle("active", (b as HTMLElement).dataset.source === "ai");
      });
      post({ type: "setForceOffline", forceOffline: false });
      updateOfflineIndicators();
      updateConfigBanner(state.currentProvider);
      document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const customTab = document.querySelector('.tab[data-tab="custom"]');
      const customPanel = document.getElementById("customPanel");
      if (customTab) customTab.classList.add("active");
      if (customPanel) customPanel.classList.add("active");
      post({ type: "getCustomPractices" });
    });
  }

  // Custom Re-generate
  const customRegenBtn = document.getElementById("customRegenBtn") as HTMLButtonElement | null;
  if (customRegenBtn) {
    customRegenBtn.addEventListener("click", () => {
      const cpEdit = document.getElementById("customPromptEdit") as HTMLTextAreaElement | null;
      const newPrompt = cpEdit ? cpEdit.value.trim() : "";
      if (!newPrompt) { showToast("error", "Please describe what you want to practice"); return; }
      state._customPrompt = newPrompt;
      state.currentLoadingAction = "generate";
      post({ type: "generateCustom", prompt: newPrompt, lang: state._customModeLang });
    });
  }

  // Settings gear
  if (dom.settingsGearBtn) {
    dom.settingsGearBtn.addEventListener("click", () => {
      const isActive = dom.settingsPanel?.classList.contains("active");
      document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      if (!isActive) {
        dom.settingsPanel?.classList.add("active");
      } else {
        document.querySelector('.tab[data-tab="practice"]')?.classList.add("active");
        dom.practicePanel?.classList.add("active");
      }
    });
  }

  // Provider cards
  document.querySelectorAll(".provider-card").forEach(card => {
    card.addEventListener("click", () => {
      showProviderConfig((card as HTMLElement).dataset.provider || "");
    });
  });

  // API key toggle
  document.querySelectorAll(".api-key-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById((btn as HTMLElement).dataset.target || "") as HTMLInputElement | null;
      if (input) input.type = input.type === "password" ? "text" : "password";
    });
  });

  // Save settings
  if (dom.saveSettingsBtn) {
    dom.saveSettingsBtn.addEventListener("click", () => {
      const settings = collectSettings();
      post({ type: "saveSettings", settings });
      updateConfigBanner(state.currentProvider);
      updateOfflineIndicators();
      updateSourceToggle();
    });
  }

  // Reset progress
  const resetProgressBtn = document.getElementById("resetProgressBtn") as HTMLButtonElement | null;
  if (resetProgressBtn) {
    let _resetPending = false;
    let _resetTimer: ReturnType<typeof setTimeout> | null = null;
    resetProgressBtn.addEventListener("click", () => {
      if (_resetPending) {
        if (_resetTimer) clearTimeout(_resetTimer);
        _resetPending = false;
        resetProgressBtn.textContent = t("settings.resetProgress") || "Reset All Progress";
        post({ type: "resetProgress" });
      } else {
        _resetPending = true;
        resetProgressBtn.textContent = t("settings.resetConfirmClick") || "Click again to confirm";
        resetProgressBtn.style.background = "rgba(239,68,68,0.3)";
        _resetTimer = setTimeout(() => {
          _resetPending = false;
          resetProgressBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' + (t("settings.resetProgress") || "Reset All Progress");
          resetProgressBtn.style.background = "";
        }, 3000);
      }
    });
  }

  // Mode toggle (Practice / Bug Fix)
  document.querySelectorAll("#modeToggle .mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#modeToggle .mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedMode = ((btn as HTMLElement).dataset.mode || "practice") as "practice" | "bugfix";
      const csGroup = document.getElementById("codeSizeGroup");
      if (csGroup) csGroup.style.display = state.selectedMode === "bugfix" ? "block" : "none";
    });
  });

  // Code size toggle
  document.querySelectorAll("#codeSizeToggle .mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#codeSizeToggle .mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedCodeSize = ((btn as HTMLElement).dataset.size || "snippet") as "snippet" | "codebase";
    });
  });

  // Source toggle (AI / Offline)
  document.querySelectorAll("#sourceToggle .mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sourceToggle .mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedSource = ((btn as HTMLElement).dataset.source || "offline") as "ai" | "offline";
      post({ type: "setForceOffline", forceOffline: state.selectedSource === "offline" });
      updateOfflineIndicators();
    });
  });

  // Cross-language dropdown
  if (dom.crossLangBtn && dom.crossLangDropdown) {
    dom.crossLangBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dom.crossLangDropdown!.classList.contains("show");
      if (!isOpen) {
        const rect = dom.crossLangBtn!.getBoundingClientRect();
        dom.crossLangDropdown!.style.position = "fixed";
        dom.crossLangDropdown!.style.left = rect.left + "px";
        dom.crossLangDropdown!.style.bottom = (window.innerHeight - rect.top + 4) + "px";
        dom.crossLangDropdown!.style.top = "auto";
      }
      dom.crossLangDropdown!.classList.toggle("show");
    });
    document.addEventListener("click", () => { dom.crossLangDropdown!.classList.remove("show"); });
    dom.crossLangDropdown.addEventListener("click", (e) => { e.stopPropagation(); });
  }

  // API Preview
  if (dom.apiPreviewBtn) {
    dom.apiPreviewBtn.addEventListener("click", () => {
      post({ type: "openApiPreview" });
    });
  }
}
