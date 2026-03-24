// 定数 — constants
export const PRACTICE_DIR = ".codepractice";

export const TOPICS: Record<string, string[]> = {
  Java: ["Array", "ArrayList", "HashMap", "HashSet", "String", "Methods", "API"],
  TypeScript: ["Type Basics", "Union Types", "Functions", "Arrays", "Objects", "Async/Await", "API"],
  SQL: ["SELECT Basics", "WHERE", "JOIN Basics", "GROUP BY", "ORDER BY", "INSERT/UPDATE"]
};

export const LANG_ICONS: Record<string, string> = {
  Java: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 18.5c2.7 1 6.3 1 9 0"/><path d="M6.8 16.2c3.2 1.2 7.2 1.2 10.4 0"/><path d="M8.5 11.3h6v2.1a2.9 2.9 0 0 1-2.9 2.9h-.2a2.9 2.9 0 0 1-2.9-2.9v-2.1Z"/><path d="M14.5 12h1a1.6 1.6 0 0 1 0 3.2h-1"/><path d="M10.8 4.3c1 1-.8 1.8 0 2.9.7.9 2.1 1 2.1 2.5"/><path d="M13.9 3.8c1 .9-.8 1.7 0 2.8.6.8 1.9.9 1.9 2.3"/></svg>',
  TypeScript: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5" fill="currentColor"/><path fill="var(--vscode-editor-background, #fff)" d="M7.4 8.2h7v1.9h-2.6V16H9.9v-5.9H7.4V8.2Zm8.1 4c.5-.5 1.3-.8 2.2-.8.9 0 1.7.2 2.5.7v1.9c-.7-.5-1.5-.8-2.4-.8-.5 0-.8.1-1.1.2-.2.1-.3.3-.3.5 0 .3.2.6.5.8.2.1.6.3 1.2.5.9.3 1.5.6 1.9 1 .4.4.6.9.6 1.6 0 .8-.3 1.5-.9 1.9-.6.4-1.4.7-2.5.7-1 0-2-.2-2.8-.7v-2c.8.6 1.7.9 2.8.9.9 0 1.3-.2 1.3-.7 0-.3-.2-.6-.5-.8-.2-.1-.7-.4-1.3-.6-.8-.3-1.4-.7-1.8-1-.4-.4-.6-.9-.6-1.5 0-.8.3-1.5.9-2Z"/></svg>',
  SQL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/></svg>'
};

export const CROSS_LANG_TARGETS: Record<string, string> = {
  Java: "java",
  TypeScript: "ts",
  JavaScript: "js",
  Python: "py",
  "C#": "cs",
  "C++": "cpp",
  Go: "go",
  Rust: "rs",
};

const CROSS_LANG_CANONICAL_NAMES: Record<string, string> = Object.keys(CROSS_LANG_TARGETS).reduce((acc, target) => {
  acc[target.toLowerCase()] = target;
  return acc;
}, {} as Record<string, string>);

/** Normalize cross-language target labels like "java" into canonical UI labels like "Java". */
export function canonicalCrossLangName(targetLang: string): string | null {
  const trimmed = targetLang.trim();
  if (!trimmed) { return null; }
  return CROSS_LANG_CANONICAL_NAMES[trimmed.toLowerCase()] || trimmed;
}

/** Return the actual cross-language targets available for a practice, ordered by the UI preference list. */
export function getAvailableCrossLangTargets(
  crossLang: Record<string, unknown> | undefined,
  currentLang?: string
): string[] {
  if (!crossLang) { return []; }

  const currentCanonical = currentLang ? canonicalCrossLangName(currentLang) : null;
  const seen = new Set<string>();

  for (const rawTarget of Object.keys(crossLang)) {
    const canonical = canonicalCrossLangName(rawTarget);
    if (!canonical || canonical === currentCanonical) { continue; }
    seen.add(canonical);
  }

  const preferredOrder = Object.keys(CROSS_LANG_TARGETS);
  const orderedTargets = preferredOrder.filter(target => seen.has(target));
  const customTargets = [...seen].filter(target => !CROSS_LANG_TARGETS[target]).sort((a, b) => a.localeCompare(b));

  return [...orderedTargets, ...customTargets];
}

export type CoreResult = { filename: string; content: string; meta: string; actualOutput?: string; solutionCode?: string };

export interface PracticeData {
  lang: string;
  topic: string;
  task: string;
  code: string;
  expectedOutput?: string;
  title?: string;
  hint?: string;
  bugExplanation?: string;
  mode?: string;
  testCases?: TestCase[];
  solutionCode?: string;
  expectedFields?: string[];
  apiType?: string;
  judgeFeedback?: { summary: string; lines: { line: number; problem: string; fix: string }[] };
  altMethods?: { name: string; code: string; explanation: string }[];
}

export interface TestCase {
  input: string;
  output: string;
}

/** ファイル名 — practice filename */
export function practiceFilename(lang: string): string {
  return lang === "TypeScript" ? "Practice.ts" : lang === "SQL" ? "Practice.sql" : "Practice.java";
}

/** 拡張子 — file extension */
export function practiceExt(lang: string): string {
  return lang === "TypeScript" ? "ts" : lang === "SQL" ? "sql" : "java";
}

export interface ParsedMeta {
  title: string;
  task: string;
  starterCode: string;
  expectedOutput: string;
  hint: string;
  description?: string;
  bugHint?: string;
  bugExplanation?: string;
  testCases?: TestCase[];
}
