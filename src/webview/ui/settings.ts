// Settings panel — provider config, offline indicators, config banner
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";
import { post } from "../vscodeApi";
import type { AiSettings } from "../../shared/protocol";
import { DEFAULT_AI_PROVIDER, DEFAULT_LOCAL_ENDPOINT, getDefaultModel } from "../../shared/aiConfigDefaults";

const providerDisplayNames: Record<string, string> = {
  groq: "Groq", cerebras: "Cerebras", together: "Together", openrouter: "OpenRouter",
  gemini: "Gemini", openai: "OpenAI", claude: "Claude", local: "Local",
};

const modelSelectors: Record<string, string> = {
  groq: "settingsGroqModel", cerebras: "settingsCerebrasModel", together: "settingsTogetherModel",
  openrouter: "settingsOpenrouterModel", gemini: "settingsGeminiModel", openai: "settingsOpenaiModel",
  claude: "settingsClaudeModel", local: "settingsEndpointModel",
};

const keyFields: Record<string, string> = {
  groq: "settingsGroqKey", gemini: "settingsGeminiKey", openai: "settingsOpenaiKey",
  claude: "settingsClaudeKey", cerebras: "settingsCerebrasKey", together: "settingsTogetherKey",
  openrouter: "settingsOpenrouterKey", local: "settingsLocalKey",
};

function getOfflinePracticeFooterText(): string {
  if (state.currentUiLang === "ja") return "\u30aa\u30d5\u30e9\u30a4\u30f3 \u2022 138 \u554f";
  if (state.currentUiLang === "tr") return "\u00c7evrimd\u0131\u015f\u0131 \u2022 138 al\u0131\u015ft\u0131rma";
  return "Offline • 138 practices";
}

function getAiModeFooterText(): string {
  if (state.currentUiLang === "ja") return "AI \u30e2\u30fc\u30c9";
  if (state.currentUiLang === "tr") return "AI Modu";
  return "AI Mode";
}

function updatePanelFooters(provider: string): void {
  if (dom.practiceFormFooterText) {
    const usingOffline = isCurrentlyOffline() || state.selectedSource === "offline";
    dom.practiceFormFooterText.textContent = usingOffline
      ? getOfflinePracticeFooterText()
      : `${providerDisplayNames[provider] || provider} • ${getAiModeFooterText()}`;
  }
  if (dom.customFooterText) {
    dom.customFooterText.textContent = getAiModeFooterText();
  }
  if (dom.settingsFooterText) {
    if (isCurrentlyOffline()) {
      dom.settingsFooterText.textContent = getOfflinePracticeFooterText();
    } else {
      dom.settingsFooterText.textContent = `${providerDisplayNames[provider] || provider} • ${getSelectedModelLabel(provider)}`;
    }
  }
}

export function showProviderConfig(provider: string): void {
  state.currentProvider = provider;
  document.querySelectorAll(".provider-item").forEach(c =>
    (c as HTMLElement).classList.toggle("active", (c as HTMLElement).dataset.provider === provider));
  document.querySelectorAll(".provider-config").forEach(c => c.classList.remove("active"));
  const cfg = document.getElementById("config-" + provider);
  if (cfg) cfg.classList.add("active");
}

export function getSelectedModelLabel(provider: string): string {
  const sel = document.getElementById(modelSelectors[provider]) as HTMLSelectElement | HTMLInputElement | null;
  if (!sel) return "";
  if (sel.tagName === "SELECT") return (sel as HTMLSelectElement).options[(sel as HTMLSelectElement).selectedIndex]?.text || sel.value;
  return sel.value || "Custom";
}

export function isCurrentlyOffline(): boolean {
  const prov = state.currentProvider || DEFAULT_AI_PROVIDER;
  const keyEl = document.getElementById(keyFields[prov]) as HTMLInputElement | null;
  if (prov === "local") {
    const ep = document.getElementById("settingsLocalEndpoint") as HTMLInputElement | null;
    return !(ep && ep.value) && !(keyEl && keyEl.value);
  }
  return !(keyEl && keyEl.value);
}

export function updateOfflineIndicators(): void {
  const offline = isCurrentlyOffline() || state.selectedSource === "offline";
  const badge = document.getElementById("offlineBadge");
  const banner = document.getElementById("currentConfigBanner");
  if (badge) badge.classList.toggle("show", offline);
  if (banner) banner.classList.toggle("offline", offline);

  // Custom panel overlay
  const customOverlay = document.getElementById("customOfflineOverlay");
  const customForm = document.getElementById("customFormSection");
  const customSubtitle = document.getElementById("customSubtitle");
  const customHistory = document.getElementById("customHistorySection");
  const customSettingsBtn = document.getElementById("customGoSettingsBtn");
  const customSwitchBtn = document.getElementById("customSwitchAiBtn");
  const customOfflineDesc = customOverlay ? customOverlay.querySelector(".custom-offline-desc") : null;
  const customOfflineSource = document.getElementById("customOfflineSource");
  const customPromptInput = document.getElementById("customPromptInput") as HTMLTextAreaElement | null;
  const customGenBtn = document.getElementById("customGenBtn") as HTMLButtonElement | null;

  if (customOverlay) {
    (customOverlay as HTMLElement).style.display = offline ? "flex" : "none";
    customOverlay.classList.toggle("inline-banner", offline);
  }
  if (customForm) (customForm as HTMLElement).style.display = "";
  if (customSubtitle) (customSubtitle as HTMLElement).style.display = "";
  if (customHistory) (customHistory as HTMLElement).style.display = "";
  if (customPromptInput) {
    customPromptInput.disabled = offline;
    customPromptInput.placeholder = offline ? t("custom.aiRequired") : t("custom.prompt");
  }
  if (customGenBtn) customGenBtn.disabled = offline;
  document.getElementById("customPanel")?.classList.toggle("custom-ai-required", offline);

  const noApiKey = isCurrentlyOffline();
  const hasKeyButOffline = !noApiKey && state.selectedSource === "offline";
  if (customSettingsBtn) (customSettingsBtn as HTMLElement).style.display = noApiKey ? "" : "none";
  if (customSwitchBtn) (customSwitchBtn as HTMLElement).style.display = hasKeyButOffline ? "" : "none";
  if (customOfflineDesc && hasKeyButOffline) {
    customOfflineDesc.innerHTML = t("custom.aiModeRequiredDesc");
  } else if (customOfflineDesc && noApiKey) {
    customOfflineDesc.innerHTML = t("custom.aiRequiredDesc");
  }
  if (customOfflineSource) {
    customOfflineSource.textContent = `${t("practice.sourceCode")}: ${t("practice.sourceAI")}`;
  }

  // AI Chat button
  const chatBtn = document.getElementById("openChatBtn") as HTMLButtonElement | null;
  if (chatBtn) {
    chatBtn.disabled = offline;
    chatBtn.title = offline ? t("settings.aiChatRequiresProvider") : t("practice.aiChat");
    chatBtn.style.opacity = offline ? "0.4" : "";
    chatBtn.style.cursor = offline ? "not-allowed" : "";
  }

  updatePanelFooters(state.currentProvider || DEFAULT_AI_PROVIDER);
}

export function updateConfigBanner(provider: string): void {
  const bn = document.getElementById("bannerProviderName");
  const bm = document.getElementById("bannerModelName");
  const offline = isCurrentlyOffline();
  if (offline) {
    if (bn) bn.textContent = t("settings.offlineMode");
    if (bm) bm.textContent = t("settings.builtInPractices");
  } else {
    if (bn) bn.textContent = providerDisplayNames[provider] || provider;
    if (bm) bm.textContent = getSelectedModelLabel(provider);
  }
  updateOfflineIndicators();
  updatePanelFooters(provider);
}

export function loadSettingsUI(s: AiSettings): void {
  if (!s) return;
  const prov = s.provider || DEFAULT_AI_PROVIDER;
  showProviderConfig(prov);
  const setVal = (id: string, val: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (el) el.value = val;
  };
  setVal("settingsLocalEndpoint", s.localEndpoint || "");
  setVal("settingsEndpointModel", s.endpointModel || getDefaultModel("local"));
  setVal("settingsGroqKey", s.groqApiKey || "");
  setVal("settingsGroqModel", s.groqModel || getDefaultModel("groq"));
  setVal("settingsCerebrasKey", s.cerebrasApiKey || "");
  setVal("settingsCerebrasModel", s.cerebrasModel || getDefaultModel("cerebras"));
  setVal("settingsTogetherKey", s.togetherApiKey || "");
  setVal("settingsTogetherModel", s.togetherModel || getDefaultModel("together"));
  setVal("settingsOpenrouterKey", s.openrouterApiKey || "");
  setVal("settingsOpenrouterModel", s.openrouterModel || getDefaultModel("openrouter"));
  setVal("settingsGeminiKey", s.geminiApiKey || "");
  setVal("settingsGeminiModel", s.geminiModel || getDefaultModel("gemini"));
  setVal("settingsOpenaiKey", s.openaiApiKey || "");
  setVal("settingsOpenaiModel", s.openaiModel || getDefaultModel("openai"));
  setVal("settingsClaudeKey", s.claudeApiKey || "");
  setVal("settingsClaudeModel", s.claudeModel || getDefaultModel("claude"));
  setVal("settingsLocalKey", s.localApiKey || "");
  const legacyEndpointKey = s.endpointApiKey || "";
  if (legacyEndpointKey) {
    if (!s.cerebrasApiKey && prov === "cerebras") setVal("settingsCerebrasKey", legacyEndpointKey);
    else if (!s.togetherApiKey && prov === "together") setVal("settingsTogetherKey", legacyEndpointKey);
    else if (!s.openrouterApiKey && prov === "openrouter") setVal("settingsOpenrouterKey", legacyEndpointKey);
    else if (!s.localApiKey && prov === "local") setVal("settingsLocalKey", legacyEndpointKey);
  }
  updateConfigBanner(prov);
}

export function collectSettings(): Record<string, string> {
  const getVal = (id: string, fallback: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    return el?.value || fallback;
  };
  let epKey = "";
  if (state.currentProvider === "cerebras") epKey = getVal("settingsCerebrasKey", "");
  else if (state.currentProvider === "together") epKey = getVal("settingsTogetherKey", "");
  else if (state.currentProvider === "openrouter") epKey = getVal("settingsOpenrouterKey", "");
  else if (state.currentProvider === "local") epKey = getVal("settingsLocalKey", "");

  return {
    provider: state.currentProvider,
    localEndpoint: getVal("settingsLocalEndpoint", DEFAULT_LOCAL_ENDPOINT),
    groqApiKey: getVal("settingsGroqKey", ""),
    groqModel: getVal("settingsGroqModel", getDefaultModel("groq")),
    cerebrasApiKey: getVal("settingsCerebrasKey", ""),
    cerebrasModel: getVal("settingsCerebrasModel", getDefaultModel("cerebras")),
    togetherApiKey: getVal("settingsTogetherKey", ""),
    togetherModel: getVal("settingsTogetherModel", getDefaultModel("together")),
    openrouterApiKey: getVal("settingsOpenrouterKey", ""),
    openrouterModel: getVal("settingsOpenrouterModel", getDefaultModel("openrouter")),
    geminiApiKey: getVal("settingsGeminiKey", ""),
    geminiModel: getVal("settingsGeminiModel", getDefaultModel("gemini")),
    openaiApiKey: getVal("settingsOpenaiKey", ""),
    openaiModel: getVal("settingsOpenaiModel", getDefaultModel("openai")),
    claudeApiKey: getVal("settingsClaudeKey", ""),
    claudeModel: getVal("settingsClaudeModel", getDefaultModel("claude")),
    localApiKey: getVal("settingsLocalKey", ""),
    endpointApiKey: epKey,
    endpointModel: getVal("settingsEndpointModel", getDefaultModel("local")),
  };
}

export { providerDisplayNames };
