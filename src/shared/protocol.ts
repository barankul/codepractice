// 共有プロトコル — shared message protocol between extension and webview
// This file must NOT import 'vscode' or any Node module — plain TypeScript types only.

// ─── Webview → Extension (28 message types) ───

export type WebviewToExtMsg =
  | { type: "ready" }
  | { type: "generate"; lang: string; topic: string; mode?: string; codeSize?: string }
  | { type: "similarPractice"; lang: string; topic: string }
  | { type: "levelUp"; lang: string; topic: string }
  | { type: "generateCustom"; prompt: string; lang: string }
  | { type: "run" }
  | { type: "judge" }
  | { type: "hintViewed" }
  | { type: "addHints" }
  | { type: "showSolution" }
  | { type: "quickSolve"; lang: string; topic: string }
  | { type: "teachMe"; lang: string; topic: string }
  | { type: "openChat" }
  | { type: "alternativeMethods" }
  | { type: "openAltMethod"; index: number; name?: string; code?: string; explanation?: string }
  | { type: "crossLanguage"; targetLang: string }
  | { type: "openCrossLang"; lang: string; code: string; targetLang?: string; highlights?: HighlightEntry[] }
  | { type: "openApiPreview" }
  | { type: "rateDifficulty"; passed: boolean; difficulty: "again" | "hard" | "good" | "easy" }
  | { type: "getProgress"; lang?: string }
  | { type: "setUiLang"; lang: string }
  | { type: "saveSettings"; settings: Record<string, string> }
  | { type: "getCustomPractices" }
  | { type: "deleteCustomPractice"; id: string }
  | { type: "resetProgress" }
  | { type: "setForceOffline"; forceOffline: boolean }
  | { type: "toggleGhostMode" }
  | { type: "repairTestCase"; index: number };

// ─── Extension → Webview (17 message types) ───

export type ExtToWebviewMsg =
  | { type: "init"; topics: Record<string, string[]>; icons: Record<string, string>; defaultLang: string; defaultTopic: string; translations: Record<string, Record<string, string>>; uiLang: string; uiLanguages: UiLanguage[]; customPractices: CustomPractice[]; stats: ProgressStats; recommendations: Recommendation[]; aiSettings: AiSettings }
  | { type: "progressData"; stats: ProgressStats; recommendations: Recommendation[]; topicStats?: TopicStat[] }
  | { type: "progressUpdate"; stats: ProgressStats }
  | { type: "settingsSaved" }
  | { type: "customPractices"; practices: CustomPractice[] }
  | { type: "busy"; value: boolean; action?: string }
  | { type: "output"; text: string; durationMs?: number }
  | { type: "judgeResult"; pass: boolean; output?: string; testResults?: TestResultEntry[]; durationMs?: number; xp?: XpResult; feedback?: JudgeFeedback; stats?: ProgressStats }
  | { type: "toast"; kind: "ok" | "warn" | "error" | "info"; text: string; retryable?: string }
  | { type: "details"; details: PracticeDetails }
  | { type: "solution"; solution: { code: string; explanation: string } }
  | { type: "loadingProgress"; text?: string; percent?: number }
  | { type: "testGenStatus"; status: "pending" | "ready" | "failed" }
  | { type: "switchTab"; tab: string }
  | { type: "skipped" }
  | { type: "alternativeMethodsResult"; methods: AltMethod[] }
  | { type: "crossLanguageResult"; code: string; highlights: HighlightEntry[]; targetLang: string }
  | { type: "ghostModeStatus"; active: boolean };

// ─── Supporting types ───

export interface HighlightEntry {
  lines: number[];
  explanation: string;
}

export interface CustomPractice {
  id: string;
  title: string;
  lang: string;
  prompt: string;
  task?: string;
  createdAt?: string;
}

export interface ProgressStats {
  totalPractices: number;
  masteredTopics: number;
  dueCount: number;
  weakTopics: number;
  currentStreak?: number;
  bestStreak?: number;
  totalXP?: number;
  xpNeeded?: number;
  globalLevel?: number;
  xpInLevel?: number;
  dailyGoal?: { target: number; completed: number; date: string };
  weeklyTrend?: { date: string; practices: number; passRate: number }[];
  sessionSummary?: { practicesDone: number; passed: number; failed: number; xpEarned: number; newMastered: string[] };
}

export interface Recommendation {
  type: string;
  lang: string;
  topic: string;
  reason?: string;
}

export interface TopicStat {
  lang: string;
  topic: string;
  averageRetention: number;
}

export interface UiLanguage {
  code: string;
  flag: string;
  label: string;
}

export interface AiSettings {
  provider: string;
  localEndpoint?: string;
  groqApiKey?: string;
  groqModel?: string;
  cerebrasApiKey?: string;
  cerebrasModel?: string;
  togetherApiKey?: string;
  togetherModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  claudeApiKey?: string;
  claudeModel?: string;
  localApiKey?: string;
  endpointApiKey?: string;
  endpointModel?: string;
}

export interface AltMethod {
  name: string;
  code: string;
  explanation: string;
  speedPercent?: number;
}

export interface TestResultEntry {
  name: string;
  pass: boolean;
  expected: string;
  got: string;
  refOutput?: string;
}

export interface XpResult {
  earned: number;
  total: number;
  needed: number;
  level: number;
  leveledUp: boolean;
  breakdown: { speed: number; hint: number; chat: number; firstTry: number };
}

export interface JudgeFeedback {
  summary: string;
  lines: { line: number; problem: string; fix: string }[];
}

export interface PracticeDetails {
  title: string;
  lang: string;
  task: string;
  expectedOutput?: string;
  hint?: string;
  availableCrossLangs?: string[];
  level?: number;
  topicXP?: { xp: number; xpNeeded: number; level: number };
  mode?: string;
  bugExplanation?: string;
  sourceRepo?: string;
  customPrompt?: string;
  topic?: string;
  multiTopicReason?: string;
}

// ─── Utility ───

/** Extract a specific message type from either union */
export type MsgOfExt<T extends ExtToWebviewMsg["type"]> = Extract<ExtToWebviewMsg, { type: T }>;
export type MsgOfWv<T extends WebviewToExtMsg["type"]> = Extract<WebviewToExtMsg, { type: T }>;
