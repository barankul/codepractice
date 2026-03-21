import * as vscode from "vscode";
import type { HandlerContext, MsgOf } from "./types";
import { TOPICS, LANG_ICONS } from "../constants";
import { TRANSLATIONS, UI_LANGUAGES } from "../i18n";
import { setResponseLang, getSecret, setSecret, invalidateAiConfigCache, t } from "../aiHelpers";

/** 初期化 — init webview with topics/settings/progress */
export async function handleReady(ctx: HandlerContext): Promise<void> {
  const stats = ctx.progressTracker.getOverallStats();
  const recommendations = ctx.progressTracker.getRecommendations();

  const savedUiLang = ctx.context.globalState.get<string>("uiLang") || "en";
  setResponseLang(savedUiLang);

  const cfg = vscode.workspace.getConfiguration("codepractice");
  const aiSettings = {
    provider: cfg.get<string>("aiProvider") || "groq",
    localEndpoint: cfg.get<string>("aiEndpoint") || "http://127.0.0.1:1234/v1/chat/completions",
    groqApiKey: await getSecret("groqApiKey"),
    groqModel: cfg.get<string>("groqModel") || "llama-3.3-70b-versatile",
    cerebrasModel: cfg.get<string>("cerebrasModel") || "llama-3.3-70b",
    togetherModel: cfg.get<string>("togetherModel") || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    openrouterModel: cfg.get<string>("openrouterModel") || "meta-llama/llama-3.3-70b-instruct:free",
    geminiApiKey: await getSecret("geminiApiKey"),
    geminiModel: cfg.get<string>("geminiModel") || "gemini-2.0-flash",
    openaiApiKey: await getSecret("openaiApiKey"),
    openaiModel: cfg.get<string>("openaiModel") || "gpt-4o-mini",
    claudeApiKey: await getSecret("claudeApiKey"),
    claudeModel: cfg.get<string>("claudeModel") || "claude-sonnet-4-20250514",
    endpointApiKey: await getSecret("endpointApiKey"),
    endpointModel: cfg.get<string>("endpointModel") || ""
  };

  const customPractices = ctx.context.globalState.get<any[]>("codepractice.customPractices") || [];

  ctx.post({
    type: "init",
    topics: TOPICS,
    icons: LANG_ICONS,
    defaultLang: "Java",
    defaultTopic: "__multi__",
    stats,
    recommendations,
    translations: TRANSLATIONS,
    uiLanguages: UI_LANGUAGES,
    uiLang: savedUiLang,
    aiSettings,
    customPractices
  });
}

/** 進捗取得 — send progress to webview */
export function handleGetProgress(ctx: HandlerContext, msg: MsgOf<"getProgress">): void {
  const stats = ctx.progressTracker.getOverallStats();
  const recommendations = ctx.progressTracker.getRecommendations(msg.lang);
  const topicStats = ctx.progressTracker.getAllTopicStats(msg.lang);
  ctx.post({ type: "progressData", stats, recommendations, topicStats });
}

/** 難易度評価 — record FSRS rating */
export async function handleRateDifficulty(ctx: HandlerContext, msg: MsgOf<"rateDifficulty">): Promise<void> {
  if (ctx.currentPractice) {
    const title = ctx.currentPractice.title || `${ctx.currentPractice.lang} - ${ctx.currentPractice.topic}`;
    await ctx.progressTracker.recordPractice(
      ctx.currentPractice.lang,
      ctx.currentPractice.topic,
      title,
      ctx.currentPractice.task,
      msg.passed,
      msg.difficulty
    );
    const stats = ctx.progressTracker.getOverallStats();
    ctx.post({ type: "progressUpdate", stats });
  }
}

/** 言語変更 — change UI language */
export function handleSetUiLang(ctx: HandlerContext, msg: MsgOf<"setUiLang">): void {
  const lang = String(msg.lang || "en");
  ctx.context.globalState.update("uiLang", lang);
  setResponseLang(lang);
}

/** 設定保存 — save AI settings */
export async function handleSaveSettings(ctx: HandlerContext, msg: MsgOf<"saveSettings">): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("codepractice");
  const s = msg.settings;
  if (s) {
    await Promise.all([
      cfg.update("aiProvider", s.provider, vscode.ConfigurationTarget.Global),
      cfg.update("aiEndpoint", s.localEndpoint, vscode.ConfigurationTarget.Global),
      cfg.update("groqModel", s.groqModel, vscode.ConfigurationTarget.Global),
      cfg.update("cerebrasModel", s.cerebrasModel, vscode.ConfigurationTarget.Global),
      cfg.update("togetherModel", s.togetherModel, vscode.ConfigurationTarget.Global),
      cfg.update("openrouterModel", s.openrouterModel, vscode.ConfigurationTarget.Global),
      cfg.update("geminiModel", s.geminiModel, vscode.ConfigurationTarget.Global),
      cfg.update("openaiModel", s.openaiModel, vscode.ConfigurationTarget.Global),
      cfg.update("claudeModel", s.claudeModel, vscode.ConfigurationTarget.Global),
      cfg.update("endpointModel", s.endpointModel, vscode.ConfigurationTarget.Global),
      setSecret("groqApiKey", s.groqApiKey || ""),
      setSecret("geminiApiKey", s.geminiApiKey || ""),
      setSecret("openaiApiKey", s.openaiApiKey || ""),
      setSecret("claudeApiKey", s.claudeApiKey || ""),
      setSecret("endpointApiKey", s.endpointApiKey || "")
    ]);
    invalidateAiConfigCache();
    ctx.post({ type: "settingsSaved" });
  }
}

/** カスタム取得 — get custom practices */
export function handleGetCustomPractices(ctx: HandlerContext): void {
  const practices = ctx.context.globalState.get<any[]>("codepractice.customPractices") || [];
  ctx.post({ type: "customPractices", practices });
}

/** 進捗リセット — reset all progress */
export async function handleResetProgress(ctx: HandlerContext): Promise<void> {
  ctx.progressTracker.resetAll();
  const stats = ctx.progressTracker.getOverallStats();
  const recommendations = ctx.progressTracker.getRecommendations();
  ctx.post({ type: "progressData", stats, recommendations });
  ctx.post({ type: "toast", kind: "ok", text: t("settings.resetDone") });
}

/** カスタム削除 — delete custom practice */
export async function handleDeleteCustomPractice(ctx: HandlerContext, msg: MsgOf<"deleteCustomPractice">): Promise<void> {
  const practices = ctx.context.globalState.get<any[]>("codepractice.customPractices") || [];
  const updated = practices.filter(p => p.id !== msg.id);
  await ctx.context.globalState.update("codepractice.customPractices", updated);
  ctx.post({ type: "customPractices", practices: updated });
}
