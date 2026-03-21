import * as vscode from "vscode";
import type { ProgressTracker } from "../progressTracker";
import type { ChatPanelManager } from "../chatPanel";
import type { TestCase } from "../constants";

export interface PracticeState {
  lang: string;
  topic: string;
  task: string;
  code: string;
  expectedOutput?: string;
  title?: string;
  hint?: string;
  mode?: string;
  bugExplanation?: string;
  sourceRepo?: string;
  testFile?: string;
  testCases?: TestCase[];
  solutionCode?: string;
  expectedFields?: string[];
  apiType?: string;
  testStatus?: "pending" | "ready" | "failed";
  judgeFeedback?: { summary: string; lines: { line: number; problem: string; fix: string }[] };
  altMethods?: { name: string; code: string; explanation: string }[];
  crossLang?: Record<string, { code: string; highlights: { lines: number[]; explanation: string }[] }>;
}

// Re-export from shared protocol — single source of truth for message types
export type { WebviewToExtMsg as WebviewMessage } from "../shared/protocol";
export type { ExtToWebviewMsg, HighlightEntry, CustomPractice, ProgressStats, Recommendation, TopicStat, UiLanguage, AiSettings, AltMethod, TestResultEntry, XpResult, JudgeFeedback, PracticeDetails } from "../shared/protocol";

/** メッセージ型抽出 — extract message type */
export type { MsgOfWv as MsgOf } from "../shared/protocol";

export interface HandlerContext {
  view: vscode.WebviewView;
  context: vscode.ExtensionContext;
  output: vscode.OutputChannel;

  // Practice state
  currentPractice: PracticeState | undefined;
  setCurrentPractice(p: PracticeState | undefined): void;

  // Progress
  progressTracker: ProgressTracker;
  chatPanelManager: ChatPanelManager;

  // Generation
  generationId: number;
  bumpGenerationId(): number;
  practiceHistory: { lang: string; topic: string; title: string; task: string }[];

  // Level
  currentLevel: number;
  setLevel(l: number): void;

  // Guards
  isGenerating: boolean;
  setGenerating(v: boolean): void;
  isRunning: boolean;
  setRunning(v: boolean): void;

  // Session tracking
  practiceStartTime: number;
  hintUsed: boolean;
  chatOpened: boolean;
  judgeAttempts: number;
  practiceSkipped: boolean;
  setSessionFlag(flag: "hintUsed" | "chatOpened" | "practiceSkipped" | "judgeAttempts", value: boolean | number): void;
  resetSessionTracking(): void;
  calculateXP(): number;
  getXPBreakdown(): { speed: number; hint: number; chat: number; firstTry: number };

  // Messaging
  post(msg: any): void;

  // Code execution helpers
  runCode(): Promise<string>;
  verifySolutionOutput(code: string, lang: string): Promise<string | null>;
  runPracticeTests(): Promise<{ name: string; pass: boolean; expected: string; got: string }[] | null>;
  runMultiTestCases(
    studentCode: string, starterCode: string,
    testCases: TestCase[], lang: string, solutionCode?: string
  ): Promise<{ name: string; pass: boolean; expected: string; got: string; refOutput?: string }[] | null>;
  verifyTestCompiles(workspaceRoot: string, lang: string, testFilename: string): Promise<boolean>;
  checkOutputResult(output: string, currentFileCode?: string): { pass: boolean; testResults?: { name: string; pass: boolean; expected: string; got: string }[] };

  // Panel helpers
  explainPanel: vscode.WebviewPanel | undefined;
  setExplainPanel(p: vscode.WebviewPanel | undefined): void;
  schemaPanel: vscode.WebviewPanel | undefined;
  setSchemaPanel(p: vscode.WebviewPanel | undefined): void;
  apiPreviewPanel: vscode.WebviewPanel | undefined;
  setApiPreviewPanel(p: vscode.WebviewPanel | undefined): void;
  crossLangDecorationType: vscode.TextEditorDecorationType | undefined;
  setCrossLangDecorationType(t: vscode.TextEditorDecorationType | undefined): void;
}
