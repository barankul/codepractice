// Webview mutable state — single source of truth
import type { ProgressStats, Recommendation, TopicStat, CustomPractice, UiLanguage } from "../shared/protocol";

export const state = {
  // Topic / language selection
  topics: {} as Record<string, string[]>,
  icons: {} as Record<string, string>,
  selectedLang: "Java",
  selectedTopic: "__multi__",
  selectedMode: "practice" as "practice" | "bugfix",
  selectedCodeSize: "snippet" as "snippet" | "codebase",
  selectedSource: "offline" as "ai" | "offline",

  // Custom practice
  customLang: "Java",
  customPractices: [] as CustomPractice[],
  _isCustomMode: false,
  _customPrompt: "",
  _customModeLang: "Java",

  // UI flags
  hintVisible: false,
  _isBugFixMode: false,
  practiceSkipped: false,

  // Progress
  progressStats: { totalPractices: 0, masteredTopics: 0, dueCount: 0, weakTopics: 0 } as ProgressStats,
  recommendations: [] as Recommendation[],
  topicStats: [] as TopicStat[],

  // i18n
  allTranslations: {} as Record<string, Record<string, string>>,
  currentUiLang: "en",
  uiLanguages: [] as UiLanguage[],

  // Settings
  currentProvider: "local",

  // Loading
  currentLoadingAction: "",
  loadingTimeoutId: null as ReturnType<typeof setTimeout> | null,

  // Alt methods
  altMethodsWrap: null as HTMLElement | null,
  altMethodsList: null as HTMLElement | null,
  altMethodsLoaded: false,

  // Toast
  lastToastAction: null as (() => void) | null,
};
