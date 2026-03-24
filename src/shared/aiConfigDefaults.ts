export const DEFAULT_AI_PROVIDER = "groq";
export const DEFAULT_LOCAL_ENDPOINT = "http://127.0.0.1:1234/v1/chat/completions";
export const DEFAULT_ENDPOINT_MODEL = "yi-coder-9b-chat";

export const DEFAULT_MODEL_BY_PROVIDER: Record<string, string> = {
  groq: "openai/gpt-oss-120b",
  cerebras: "qwen-3-235b-a22b-instruct-2507",
  together: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  openrouter: "nvidia/nemotron-3-super-120b-a12b:free",
  gemini: "gemini-2.5-flash",
  openai: "gpt-4.1-mini",
  claude: "claude-sonnet-4-6-20250827",
  local: DEFAULT_ENDPOINT_MODEL,
};

export const PROVIDER_SECRET_KEY_BY_PROVIDER: Record<string, string> = {
  groq: "groqApiKey",
  cerebras: "cerebrasApiKey",
  together: "togetherApiKey",
  openrouter: "openrouterApiKey",
  gemini: "geminiApiKey",
  openai: "openaiApiKey",
  claude: "claudeApiKey",
  local: "localApiKey",
};

export function getDefaultModel(provider: string): string {
  return DEFAULT_MODEL_BY_PROVIDER[provider] || DEFAULT_ENDPOINT_MODEL;
}

export function getProviderSecretKey(provider: string): string {
  return PROVIDER_SECRET_KEY_BY_PROVIDER[provider] || PROVIDER_SECRET_KEY_BY_PROVIDER.local;
}
