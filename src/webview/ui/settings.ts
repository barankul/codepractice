// Settings panel — provider config, offline indicators, config banner
import { state } from "../state";
import { dom } from "../dom";
import { post } from "../vscodeApi";
import type { AiSettings } from "../../shared/protocol";

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

export function showProviderConfig(provider: string): void {
  state.currentProvider = provider;
  document.querySelectorAll(".provider-card").forEach(c =>
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
  const prov = state.currentProvider || "groq";
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

  if (customOverlay) (customOverlay as HTMLElement).style.display = offline ? "flex" : "none";
  if (customForm) (customForm as HTMLElement).style.display = offline ? "none" : "";
  if (customSubtitle) (customSubtitle as HTMLElement).style.display = offline ? "none" : "";
  if (customHistory) (customHistory as HTMLElement).style.display = offline ? "none" : "";

  const noApiKey = isCurrentlyOffline();
  const hasKeyButOffline = !noApiKey && state.selectedSource === "offline";
  if (customSettingsBtn) (customSettingsBtn as HTMLElement).style.display = noApiKey ? "" : "none";
  if (customSwitchBtn) (customSwitchBtn as HTMLElement).style.display = hasKeyButOffline ? "" : "none";
  if (customOfflineDesc && hasKeyButOffline) {
    customOfflineDesc.innerHTML = "Custom practices require AI mode.<br>Switch your source to AI to use this feature.";
  } else if (customOfflineDesc && noApiKey) {
    customOfflineDesc.innerHTML = "Custom practices require an AI provider.<br>Configure an API key in Settings to use this feature.";
  }

  // AI Chat button
  const chatBtn = document.getElementById("openChatBtn") as HTMLButtonElement | null;
  if (chatBtn) {
    chatBtn.disabled = offline;
    chatBtn.title = offline ? "AI Chat (requires AI provider)" : "AI Chat";
    chatBtn.style.opacity = offline ? "0.4" : "";
    chatBtn.style.cursor = offline ? "not-allowed" : "";
  }
}

export function updateConfigBanner(provider: string): void {
  const bn = document.getElementById("bannerProviderName");
  const bm = document.getElementById("bannerModelName");
  const offline = isCurrentlyOffline();
  if (offline) {
    if (bn) bn.textContent = "Offline Mode";
    if (bm) bm.textContent = "140+ built-in practices";
  } else {
    if (bn) bn.textContent = providerDisplayNames[provider] || provider;
    if (bm) bm.textContent = getSelectedModelLabel(provider);
  }
  document.querySelectorAll(".provider-card").forEach(c =>
    (c as HTMLElement).classList.toggle("saved", (c as HTMLElement).dataset.provider === provider));
  updateOfflineIndicators();
}

export function loadSettingsUI(s: AiSettings): void {
  if (!s) return;
  const prov = s.provider || "groq";
  showProviderConfig(prov);
  const setVal = (id: string, val: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (el) el.value = val;
  };
  setVal("settingsLocalEndpoint", s.localEndpoint || "");
  setVal("settingsEndpointModel", s.endpointModel || "");
  setVal("settingsGroqKey", s.groqApiKey || "");
  setVal("settingsGroqModel", s.groqModel || "openai/gpt-oss-120b");
  setVal("settingsCerebrasModel", s.cerebrasModel || "qwen-3-235b-a22b-instruct-2507");
  setVal("settingsTogetherModel", s.togetherModel || "meta-llama/Llama-3.3-70B-Instruct-Turbo");
  setVal("settingsOpenrouterModel", s.openrouterModel || "nvidia/nemotron-3-super-120b-a12b:free");
  setVal("settingsGeminiKey", s.geminiApiKey || "");
  setVal("settingsGeminiModel", s.geminiModel || "gemini-2.5-flash");
  setVal("settingsOpenaiKey", s.openaiApiKey || "");
  setVal("settingsOpenaiModel", s.openaiModel || "gpt-4.1-mini");
  setVal("settingsClaudeKey", s.claudeApiKey || "");
  setVal("settingsClaudeModel", s.claudeModel || "claude-sonnet-4-6-20250827");
  const epKey = s.endpointApiKey || "";
  if (epKey) {
    if (s.provider === "cerebras") setVal("settingsCerebrasKey", epKey);
    else if (s.provider === "together") setVal("settingsTogetherKey", epKey);
    else if (s.provider === "openrouter") setVal("settingsOpenrouterKey", epKey);
    else if (s.provider === "local") setVal("settingsLocalKey", epKey);
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
    localEndpoint: getVal("settingsLocalEndpoint", "http://127.0.0.1:1234/v1/chat/completions"),
    groqApiKey: getVal("settingsGroqKey", ""),
    groqModel: getVal("settingsGroqModel", "openai/gpt-oss-120b"),
    cerebrasModel: getVal("settingsCerebrasModel", "qwen-3-235b-a22b-instruct-2507"),
    togetherModel: getVal("settingsTogetherModel", "meta-llama/Llama-3.3-70B-Instruct-Turbo"),
    openrouterModel: getVal("settingsOpenrouterModel", "nvidia/nemotron-3-super-120b-a12b:free"),
    geminiApiKey: getVal("settingsGeminiKey", ""),
    geminiModel: getVal("settingsGeminiModel", "gemini-2.5-flash"),
    openaiApiKey: getVal("settingsOpenaiKey", ""),
    openaiModel: getVal("settingsOpenaiModel", "gpt-4.1-mini"),
    claudeApiKey: getVal("settingsClaudeKey", ""),
    claudeModel: getVal("settingsClaudeModel", "claude-sonnet-4-6-20250827"),
    endpointApiKey: epKey,
    endpointModel: getVal("settingsEndpointModel", ""),
  };
}

export { providerDisplayNames };
