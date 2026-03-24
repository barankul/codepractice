import * as vscode from "vscode";
import { TRANSLATIONS } from "./i18n";
import {
  DEFAULT_AI_PROVIDER,
  DEFAULT_LOCAL_ENDPOINT,
  getDefaultModel,
  getProviderSecretKey,
} from "./shared/aiConfigDefaults";

// Response language for AI outputs
let _responseLang = "en";
const LANG_NAMES: Record<string, string> = { en: "English", ja: "Japanese", tr: "Turkish" };

export function setResponseLang(lang: string): void {
  _responseLang = lang;
  console.log("[CodePractice] setResponseLang =", lang);
}

export function getResponseLang(): string {
  return _responseLang;
}

/** Translate a UI key using the current response language */
export function t(key: string): string {
  type UILang = keyof typeof TRANSLATIONS;
  const lang = (_responseLang || "en") as UILang;
  const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  return dict[key] || TRANSLATIONS["en"][key] || key;
}

/** Returns a short instruction like "Answer in Japanese." based on current response language. */
export function getLangInstruction(): string {
  const name = LANG_NAMES[_responseLang] || "English";
  return `Answer in ${name}.`;
}

interface AiConfig {
  endpoint: string;
  headers: Record<string, string>;
  model: string;
  isGemini?: boolean;
  isClaude?: boolean;
}

// SecretStorage for API keys
let _secrets: vscode.SecretStorage | null = null;

export function initSecrets(secrets: vscode.SecretStorage): void {
  _secrets = secrets;
}

export async function getSecret(key: string): Promise<string> {
  if (!_secrets) { return ""; }
  return (await _secrets.get(key)) || "";
}

export async function setSecret(key: string, value: string): Promise<void> {
  if (!_secrets) { return; }
  if (value) {
    await _secrets.store(key, value);
  } else {
    await _secrets.delete(key);
  }
}

export async function getStoredProviderApiKey(provider: string): Promise<string> {
  const secretKey = getProviderSecretKey(provider);
  const providerKey = await getSecret(secretKey);
  if (providerKey) {
    return providerKey;
  }
  if (provider === "cerebras" || provider === "together" || provider === "openrouter" || provider === "local") {
    return await getSecret("endpointApiKey");
  }
  return "";
}

// AI Configuration helper - supports local LM Studio, Groq, and Gemini
let _cachedAiConfig: AiConfig | null = null;
let _configBuildingPromise: Promise<AiConfig> | null = null;
let _configListener: vscode.Disposable | null = null;

async function buildAiConfig(): Promise<AiConfig> {
  const cfg = vscode.workspace.getConfiguration("codepractice");
  const provider = cfg.get<string>("aiProvider") || DEFAULT_AI_PROVIDER;

  if (provider === "groq") {
    const apiKey = await getStoredProviderApiKey("groq");
    const model = cfg.get<string>("groqModel") || getDefaultModel("groq");

    if (!apiKey) {
      throw new Error("Groq API key not set. Open CodePractice settings and enter your API key.");
    }

    return {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      model
    };
  }

  if (provider === "gemini") {
    const apiKey = await getStoredProviderApiKey("gemini");
    const model = cfg.get<string>("geminiModel") || getDefaultModel("gemini");

    if (!apiKey) {
      throw new Error("Gemini API key not set. Open CodePractice settings and enter your API key.");
    }

    return {
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      headers: { "Content-Type": "application/json" },
      model,
      isGemini: true
    };
  }

  if (provider === "cerebras") {
    const apiKey = await getStoredProviderApiKey("cerebras");
    if (!apiKey) {
      throw new Error("Cerebras API key not set. Open CodePractice settings and enter your API key.");
    }
    const model = cfg.get<string>("cerebrasModel") || getDefaultModel("cerebras");
    return {
      endpoint: "https://api.cerebras.ai/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      model
    };
  }

  if (provider === "together") {
    const apiKey = await getStoredProviderApiKey("together");
    if (!apiKey) {
      throw new Error("Together API key not set. Open CodePractice settings and enter your API key.");
    }
    return {
      endpoint: "https://api.together.xyz/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      model: cfg.get<string>("togetherModel") || getDefaultModel("together")
    };
  }

  if (provider === "openrouter") {
    const apiKey = await getStoredProviderApiKey("openrouter");
    if (!apiKey) {
      throw new Error("OpenRouter API key not set. Open CodePractice settings and enter your API key.");
    }
    return {
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      model: cfg.get<string>("openrouterModel") || getDefaultModel("openrouter")
    };
  }

  if (provider === "openai") {
    const apiKey = await getStoredProviderApiKey("openai");
    if (!apiKey) {
      throw new Error("OpenAI API key not set. Open CodePractice settings and enter your API key.");
    }
    const model = cfg.get<string>("openaiModel") || getDefaultModel("openai");
    return {
      endpoint: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      model
    };
  }

  if (provider === "claude") {
    const apiKey = await getStoredProviderApiKey("claude");
    if (!apiKey) {
      throw new Error("Claude API key not set. Open CodePractice settings and enter your API key.");
    }
    const model = cfg.get<string>("claudeModel") || getDefaultModel("claude");
    return {
      endpoint: "https://api.anthropic.com/v1/messages",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      model,
      isClaude: true
    };
  }

  // Local LM Studio
  const endpoint = cfg.get<string>("aiEndpoint") || DEFAULT_LOCAL_ENDPOINT;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const endpointApiKey = await getStoredProviderApiKey("local");
  if (endpointApiKey) {
    headers["Authorization"] = `Bearer ${endpointApiKey}`;
  }
  return {
    endpoint,
    headers,
    model: cfg.get<string>("endpointModel") || getDefaultModel("local")
  };
}

export async function getAiConfig(): Promise<AiConfig> {
  if (!_configListener) {
    _configListener = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("codepractice")) {
        _cachedAiConfig = null;
        _configBuildingPromise = null;
      }
    });
  }
  if (_cachedAiConfig) { return _cachedAiConfig; }
  if (!_configBuildingPromise) {
    _configBuildingPromise = buildAiConfig().then(cfg => {
      _cachedAiConfig = cfg;
      _configBuildingPromise = null;
      return cfg;
    });
  }
  return _configBuildingPromise;
}

export function invalidateAiConfigCache(): void {
  _cachedAiConfig = null;
  _configBuildingPromise = null;
}

export function disposeAiConfigListener(): void {
  _configListener?.dispose();
  _configListener = null;
}

// Helper function to make AI requests with timeout + retry
const AI_TIMEOUT_MS = 60_000; // 60 second timeout
const AI_MAX_RETRIES = 2;     // up to 2 retries (3 total attempts)
const AI_MAX_RESPONSE_SIZE = 200_000; // 200KB max response to prevent freeze

export async function makeAiRequest(systemPrompt: string, userPrompt: string): Promise<string> {
  const aiConfig = await getAiConfig();

  let body: string;
  if (aiConfig.isGemini) {
    const fullPrompt = systemPrompt + "\n\n" + userPrompt;
    body = JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { temperature: 0.2 }
    });
  } else if (aiConfig.isClaude) {
    body = JSON.stringify({
      model: aiConfig.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });
  } else {
    body = JSON.stringify({
      model: aiConfig.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
  }

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(aiConfig.endpoint, {
          method: "POST",
          headers: aiConfig.headers,
          body,
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        // 429 = rate limited, 5xx = server error → retry
        if ((response.status === 429 || response.status >= 500) && attempt < AI_MAX_RETRIES) {
          const wait = (attempt + 1) * 1000; // 1s, 2s backoff
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        // Clear error messages for auth failures
        if (response.status === 401) {
          throw new Error(`Invalid API key (401 Unauthorized). Check your AI provider settings.`);
        }
        if (response.status === 403) {
          throw new Error(`Access denied (403 Forbidden). Your API key may lack permissions or your plan may have expired.`);
        }
        if (response.status === 429) {
          throw new Error(`Rate limited. Free models have usage limits — wait a moment and try again, or switch to a different model in settings.`);
        }
        throw new Error(`AI request failed: ${response.status}`);
      }

      let json: any;
      try {
        json = await response.json();
      } catch {
        throw new Error("AI returned invalid JSON response");
      }

      let content: string | undefined;
      if (aiConfig.isGemini) {
        const candidates = json?.candidates;
        if (!Array.isArray(candidates) || candidates.length === 0) {
          console.warn(`[AI] Gemini returned no candidates. Response keys: ${Object.keys(json || {}).join(", ")}`);
        }
        content = candidates?.[0]?.content?.parts?.[0]?.text;
      } else if (aiConfig.isClaude) {
        const blocks = json?.content;
        if (Array.isArray(blocks)) {
          content = blocks.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
        }
      } else {
        content = json?.choices?.[0]?.message?.content;
        // Reasoning models may have null content — fall back to reasoning field
        if (!content) {
          const reasoning = json?.choices?.[0]?.message?.reasoning;
          const reasoningContent = json?.choices?.[0]?.message?.reasoning_content;
          content = reasoning || reasoningContent;
          if (content) {
            console.log(`[CodePractice] Using reasoning fallback (content was null), length=${content.length}`);
          }
        }
      }

      // Debug: log what we got from AI
      const msgObj = json?.choices?.[0]?.message;
      if (msgObj) {
        const keys = Object.keys(msgObj).join(", ");
        console.log(`[CodePractice] AI message keys: [${keys}], content=${!!msgObj.content}, contentLen=${(msgObj.content||"").length}`);
      }

      if (!content) {
        console.error(`[CodePractice] AI empty response. Full JSON keys:`, JSON.stringify(json).slice(0, 500));
        throw new Error("AI returned empty response");
      }
      // Strip markdown bold from labels: **TITLE:** → TITLE:  **EXPLANATION:** → EXPLANATION:
      content = content.replace(/\*\*([A-Z_]+):\*\*/g, "$1:");
      // Also handle **TITLE: without closing ** (some models do this)
      content = content.replace(/\*\*([A-Z_]+):/g, "$1:");

      // Truncate oversized responses to prevent UI freeze
      if (content.length > AI_MAX_RESPONSE_SIZE) {
        console.warn(`[CodePractice] AI response truncated: ${content.length} → ${AI_MAX_RESPONSE_SIZE} chars`);
        content = content.slice(0, AI_MAX_RESPONSE_SIZE);
      }
      return content;
    } catch (e: any) {
      lastError = e;
      if (e?.name === "AbortError") {
        lastError = new Error("AI request timed out (60s). Check your connection or try again.");
      }
      // Retry on timeout or network errors (transient)
      const isTransient = e?.name === "AbortError" ||
        e?.code === "ECONNREFUSED" || e?.code === "ENOTFOUND" ||
        e?.code === "ETIMEDOUT" || e?.code === "ECONNRESET" ||
        e?.code === "EAI_AGAIN" || e?.message?.includes("fetch failed");
      if (attempt < AI_MAX_RETRIES && isTransient) {
        const wait = (attempt + 1) * 1000;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
    }
  }

  throw lastError || new Error("AI request failed after retries");
}
