// DOM element cache — getElementById lookups done once at startup

function el(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export const dom = {
  // Practice form
  langRow: el("langRow"),
  topicGrid: el("topicGrid"),
  genBtn: el("genBtn") as HTMLButtonElement | null,
  practiceForm: el("practiceForm"),
  practiceTopbar: el("practiceTopbar"),
  topbarBackBtn: el("topbarBackBtn") as HTMLButtonElement | null,
  topbarGenBtn: el("topbarGenBtn") as HTMLButtonElement | null,
  detailsWrap: el("detailsWrap"),

  // Toast
  toast: el("toast"),
  toastIcon: el("toastIcon"),
  toastText: el("toastText"),

  // Spinner
  spin: el("spin"),

  // Hint
  hintToggle: el("hintToggle") as HTMLButtonElement | null,
  hintBody: el("hintBody"),
  hintCodeBtn: el("hintCodeBtn") as HTMLButtonElement | null,

  // Teach / Solution
  teachBtn: el("teachBtn") as HTMLButtonElement | null,
  solutionWrap: el("solutionWrap"),
  retryBtn: el("retryBtn") as HTMLButtonElement | null,
  showSolutionBtn: el("showSolutionBtn") as HTMLButtonElement | null,
  quickSolveBtn: el("quickSolveBtn") as HTMLButtonElement | null,

  // Run / Judge
  runBtn: el("runBtn") as HTMLButtonElement | null,
  judgeBtn: el("judgeBtn") as HTMLButtonElement | null,

  // Output
  outputWrap: el("outputWrap"),
  outputEl: el("output"),
  testCasesList: el("testCasesList"),
  resultBadge: el("resultBadge"),

  // Perf card
  perfCard: el("perfCard"),
  perfTime: el("perfTime"),
  perfLabel: el("perfLabel"),
  perfGaugeFill: el("perfGaugeFill"),
  perfNeedle: el("perfNeedle"),

  // Ghost mode
  ghostModeBtn: el("ghostModeBtn") as HTMLButtonElement | null,

  // Next / Similar
  nextPracticeBtn: el("nextPracticeBtn") as HTMLButtonElement | null,
  similarPracticeBtn: el("similarPracticeBtn") as HTMLButtonElement | null,
  passButtons: el("passButtons"),

  // Level / XP
  levelBadge: el("levelBadge"),
  practiceXpFill: el("practiceXpFill"),
  practiceXpCount: el("practiceXpCount"),

  // Chat
  openChatBtn: el("openChatBtn") as HTMLButtonElement | null,

  // Loading
  loadingOverlay: el("loadingOverlay"),
  loadingIcon: el("loadingIcon"),
  loadingText: el("loadingText"),
  loadingTip: el("loadingTip"),

  // Progress panel
  practicePanel: el("practicePanel"),
  statDue: el("statDue"),
  statWeak: el("statWeak"),
  statMastered: el("statMastered"),
  statTotal: el("statTotal"),
  recList: el("recList"),
  topicProgressList: el("topicProgressList"),
  dueNumber: el("dueNumber"),
  reviewDueBtn: el("reviewDueBtn") as HTMLButtonElement | null,
  streakBanner: el("streakBanner"),
  streakCount: el("streakCount"),
  streakBest: el("streakBest"),

  // Custom panel
  customLangRow: el("customLangRow"),
  customPromptInput: el("customPromptInput") as HTMLTextAreaElement | null,
  customGenBtn: el("customGenBtn") as HTMLButtonElement | null,
  customHistoryList: el("customHistoryList"),

  // Settings
  settingsGearBtn: el("settingsGearBtn") as HTMLButtonElement | null,
  settingsPanel: el("settingsPanel"),
  saveSettingsBtn: el("saveSettingsBtn") as HTMLButtonElement | null,
  settingsSavedMsg: el("settingsSaved"),

  // UI language
  uiLangSelect: el("uiLangSelect") as HTMLSelectElement | null,

  // Alt methods / Cross-lang
  altMethodsAnchor: el("altMethodsAnchor"),
  crossLangBtn: el("crossLangBtn") as HTMLButtonElement | null,
  crossLangDropdown: el("crossLangDropdown"),

  // API Preview
  apiPreviewBtn: el("apiPreviewBtn") as HTMLButtonElement | null,
};
