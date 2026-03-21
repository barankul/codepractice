// 定数 — constants
export const PRACTICE_DIR = ".codepractice";

export const TOPICS: Record<string, string[]> = {
  Java: ["Array", "ArrayList", "HashMap", "HashSet", "String", "Methods", "API"],
  TypeScript: ["Type Basics", "Union Types", "Functions", "Arrays", "Objects", "Async/Await", "API"],
  SQL: ["SELECT Basics", "WHERE", "JOIN Basics", "GROUP BY", "ORDER BY", "INSERT/UPDATE"]
};

export const LANG_ICONS: Record<string, string> = {
  Java: "",
  TypeScript: "",
  SQL: ""
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
