import { TOPICS } from "./constants";
import type { UILang } from "./i18n";
import { localizeOfflinePractice } from "./offlinePracticeLocalization";
import { JAVA_PRACTICES } from "./offlinePractices/java";
import { SQL_PRACTICES } from "./offlinePractices/sql";
import { TYPESCRIPT_PRACTICES } from "./offlinePractices/typescript";
import type { OfflinePractice } from "./practiceRandomizer";

type LocalizedUILang = Exclude<UILang, "en">;

export type OfflineCatalogIssueKind =
  | "lang_mismatch"
  | "invalid_topic"
  | "duplicate_practice"
  | "missing_field"
  | "content_language_mismatch";

export type LocalizationField =
  | "title"
  | "task"
  | "hint"
  | "judge"
  | "altMethods"
  | "crossLang";

export interface OfflineCatalogIssue {
  kind: OfflineCatalogIssueKind;
  lang: string;
  topic: string;
  title: string;
  detail: string;
}

export interface LocalizationGap {
  uiLang: LocalizedUILang;
  lang: string;
  topic: string;
  title: string;
  field: string;
  detail: string;
}

export interface LocalizationCoverage {
  uiLang: LocalizedUILang;
  lang: string;
  totalPractices: number;
  localizedProsePractices: number;
  totalJudgeFields: number;
  localizedJudgeFields: number;
  totalAltFields: number;
  localizedAltFields: number;
  totalCrossFields: number;
  localizedCrossFields: number;
}

export const OFFLINE_PRACTICES_BY_LANG = {
  Java: JAVA_PRACTICES,
  TypeScript: TYPESCRIPT_PRACTICES,
  SQL: SQL_PRACTICES,
} satisfies Record<string, OfflinePractice[]>;

function compact(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 140);
}

function practiceKey(practice: OfflinePractice): string {
  return `${practice.lang}\u241f${practice.topic}\u241f${practice.title}`;
}

function hasTypeScriptMarkers(text: string): boolean {
  return /\bconsole\.log\b|\bconst\b|\blet\b|\binterface\b|\bPromise<|\b=>\b/.test(text);
}

function hasJavaMarkers(text: string): boolean {
  return /\bpublic class\b|\bSystem\.out\.println\b|\bArrayList<|\bHashMap<|\bstatic void main\b/.test(text);
}

function looksLikePureSqlPractice(practice: OfflinePractice): boolean {
  const starter = practice.code.trimStart();
  const solution = practice.solutionCode.trimStart();
  const pureSqlStarter = starter.startsWith("-- Write your query here");
  const pureSqlSolution = /^(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(solution) &&
    !hasTypeScriptMarkers(solution) &&
    !hasJavaMarkers(solution);

  return pureSqlStarter || pureSqlSolution || practice.task.includes("Table structure:");
}

function pushIfMissing(
  issues: OfflineCatalogIssue[],
  practice: OfflinePractice,
  field: string,
  value: string | undefined,
): void {
  if (value && value.trim()) {
    return;
  }
  issues.push({
    kind: "missing_field",
    lang: practice.lang,
    topic: practice.topic,
    title: practice.title,
    detail: `Missing ${field}`,
  });
}

export function getAllOfflinePractices(): OfflinePractice[] {
  return Object.values(OFFLINE_PRACTICES_BY_LANG).flat();
}

export function auditOfflinePracticeCatalogStructure(): OfflineCatalogIssue[] {
  const issues: OfflineCatalogIssue[] = [];
  const seen = new Set<string>();

  for (const [lang, practices] of Object.entries(OFFLINE_PRACTICES_BY_LANG)) {
    const validTopics = new Set(TOPICS[lang] || []);

    for (const practice of practices) {
      if (practice.lang !== lang) {
        issues.push({
          kind: "lang_mismatch",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: `Expected lang ${lang}, got ${practice.lang}`,
        });
      }

      if (!validTopics.has(practice.topic)) {
        issues.push({
          kind: "invalid_topic",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: `Topic ${practice.topic} is not registered for ${lang}`,
        });
      }

      const key = practiceKey(practice);
      if (seen.has(key)) {
        issues.push({
          kind: "duplicate_practice",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: `Duplicate key ${key}`,
        });
      } else {
        seen.add(key);
      }

      pushIfMissing(issues, practice, "title", practice.title);
      pushIfMissing(issues, practice, "task", practice.task);
      pushIfMissing(issues, practice, "hint", practice.hint);
      pushIfMissing(issues, practice, "code", practice.code);
      pushIfMissing(issues, practice, "solutionCode", practice.solutionCode);
      pushIfMissing(issues, practice, "expectedOutput", practice.expectedOutput);
      pushIfMissing(issues, practice, "judgeFeedback.summary", practice.judgeFeedback?.summary);

      for (const [index, line] of practice.judgeFeedback?.lines.entries() || []) {
        pushIfMissing(issues, practice, `judgeFeedback.lines[${index}].problem`, line.problem);
        pushIfMissing(issues, practice, `judgeFeedback.lines[${index}].fix`, line.fix);
      }

      for (const [index, method] of practice.altMethods?.entries() || []) {
        pushIfMissing(issues, practice, `altMethods[${index}].name`, method.name);
        pushIfMissing(issues, practice, `altMethods[${index}].code`, method.code);
        pushIfMissing(issues, practice, `altMethods[${index}].explanation`, method.explanation);
      }

      for (const [targetLang, value] of Object.entries(practice.crossLang || {})) {
        pushIfMissing(issues, practice, `crossLang.${targetLang}.code`, value.code);
        for (const [index, highlight] of value.highlights.entries()) {
          pushIfMissing(issues, practice, `crossLang.${targetLang}.highlights[${index}].explanation`, highlight.explanation);
        }
      }

      for (const [index, testCase] of practice.testCases?.entries() || []) {
        pushIfMissing(issues, practice, `testCases[${index}].input`, testCase.input);
        if (typeof testCase.output !== "string") {
          issues.push({
            kind: "missing_field",
            lang: practice.lang,
            topic: practice.topic,
            title: practice.title,
            detail: `Missing testCases[${index}].output`,
          });
        }
      }

      if (lang !== "SQL" && looksLikePureSqlPractice(practice)) {
        issues.push({
          kind: "content_language_mismatch",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: "Non-SQL practice contains SQL-specific markers",
        });
      }

      if (lang === "SQL" && (hasTypeScriptMarkers(practice.solutionCode) || hasJavaMarkers(practice.solutionCode))) {
        issues.push({
          kind: "content_language_mismatch",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: "SQL solution contains Java/TypeScript markers",
        });
      }

      if (lang === "TypeScript" && hasJavaMarkers(practice.solutionCode)) {
        issues.push({
          kind: "content_language_mismatch",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: "TypeScript solution contains Java markers",
        });
      }

      if (lang === "Java" && hasTypeScriptMarkers(practice.solutionCode)) {
        issues.push({
          kind: "content_language_mismatch",
          lang,
          topic: practice.topic,
          title: practice.title,
          detail: "Java solution contains TypeScript markers",
        });
      }
    }
  }

  return issues;
}

function pushGap(
  gaps: LocalizationGap[],
  uiLang: LocalizedUILang,
  practice: OfflinePractice,
  field: string,
  original: string,
  localized: string,
): void {
  if (!original.trim()) {
    return;
  }
  if (localized !== original) {
    return;
  }
  gaps.push({
    uiLang,
    lang: practice.lang,
    topic: practice.topic,
    title: practice.title,
    field,
    detail: compact(original),
  });
}

export function findLocalizationGaps(
  uiLang: LocalizedUILang,
  fields: LocalizationField[] = ["title", "task", "hint"],
): LocalizationGap[] {
  const gaps: LocalizationGap[] = [];

  for (const practice of getAllOfflinePractices()) {
    const localized = localizeOfflinePractice(practice, uiLang);

    if (fields.includes("title")) {
      pushGap(gaps, uiLang, practice, "title", practice.title, localized.title);
    }
    if (fields.includes("task")) {
      pushGap(gaps, uiLang, practice, "task", practice.task, localized.task);
    }
    if (fields.includes("hint")) {
      pushGap(gaps, uiLang, practice, "hint", practice.hint, localized.hint);
    }
    if (fields.includes("judge")) {
      pushGap(gaps, uiLang, practice, "judge.summary", practice.judgeFeedback.summary, localized.judgeFeedback.summary);
      for (const [index, line] of practice.judgeFeedback.lines.entries()) {
        pushGap(gaps, uiLang, practice, `judge.lines[${index}].problem`, line.problem, localized.judgeFeedback.lines[index].problem);
        pushGap(gaps, uiLang, practice, `judge.lines[${index}].fix`, line.fix, localized.judgeFeedback.lines[index].fix);
      }
    }
    if (fields.includes("altMethods")) {
      for (const [index, method] of practice.altMethods?.entries() || []) {
        pushGap(gaps, uiLang, practice, `altMethods[${index}].name`, method.name, localized.altMethods?.[index].name || "");
        pushGap(gaps, uiLang, practice, `altMethods[${index}].explanation`, method.explanation, localized.altMethods?.[index].explanation || "");
      }
    }
    if (fields.includes("crossLang")) {
      for (const [targetLang, value] of Object.entries(practice.crossLang || {})) {
        for (const [index, highlight] of value.highlights.entries()) {
          pushGap(
            gaps,
            uiLang,
            practice,
            `crossLang.${targetLang}.highlights[${index}].explanation`,
            highlight.explanation,
            localized.crossLang?.[targetLang]?.highlights[index]?.explanation || "",
          );
        }
      }
    }
  }

  return gaps;
}

export function collectLocalizationCoverage(uiLang: LocalizedUILang): LocalizationCoverage[] {
  return Object.entries(OFFLINE_PRACTICES_BY_LANG).map(([lang, practices]) => {
    let localizedProsePractices = 0;
    let totalJudgeFields = 0;
    let localizedJudgeFields = 0;
    let totalAltFields = 0;
    let localizedAltFields = 0;
    let totalCrossFields = 0;
    let localizedCrossFields = 0;

    for (const practice of practices) {
      const localized = localizeOfflinePractice(practice, uiLang);

      if (
        localized.title !== practice.title &&
        localized.task !== practice.task &&
        localized.hint !== practice.hint
      ) {
        localizedProsePractices++;
      }

      totalJudgeFields += 1;
      if (localized.judgeFeedback.summary !== practice.judgeFeedback.summary) {
        localizedJudgeFields++;
      }
      for (const [index, line] of practice.judgeFeedback.lines.entries()) {
        totalJudgeFields += 2;
        if (localized.judgeFeedback.lines[index].problem !== line.problem) {
          localizedJudgeFields++;
        }
        if (localized.judgeFeedback.lines[index].fix !== line.fix) {
          localizedJudgeFields++;
        }
      }

      for (const [index, method] of practice.altMethods?.entries() || []) {
        totalAltFields += 2;
        if ((localized.altMethods?.[index].name || "") !== method.name) {
          localizedAltFields++;
        }
        if ((localized.altMethods?.[index].explanation || "") !== method.explanation) {
          localizedAltFields++;
        }
      }

      for (const [targetLang, value] of Object.entries(practice.crossLang || {})) {
        for (const [index, highlight] of value.highlights.entries()) {
          totalCrossFields++;
          if ((localized.crossLang?.[targetLang]?.highlights[index]?.explanation || "") !== highlight.explanation) {
            localizedCrossFields++;
          }
        }
      }
    }

    return {
      uiLang,
      lang,
      totalPractices: practices.length,
      localizedProsePractices,
      totalJudgeFields,
      localizedJudgeFields,
      totalAltFields,
      localizedAltFields,
      totalCrossFields,
      localizedCrossFields,
    };
  });
}

export function formatCatalogIssues(issues: OfflineCatalogIssue[], limit = 40): string {
  if (issues.length === 0) {
    return "No offline catalog issues.";
  }

  const lines = issues.slice(0, limit).map((issue) =>
    `- [${issue.kind}] ${issue.lang}/${issue.topic}/${issue.title}: ${issue.detail}`,
  );

  if (issues.length > limit) {
    lines.push(`... ${issues.length - limit} more issues`);
  }

  return lines.join("\n");
}

export function formatLocalizationGaps(gaps: LocalizationGap[], limit = 40): string {
  if (gaps.length === 0) {
    return "No localization gaps.";
  }

  const lines = gaps.slice(0, limit).map((gap) =>
    `- [${gap.uiLang}] ${gap.lang}/${gap.topic}/${gap.title} :: ${gap.field} :: ${gap.detail}`,
  );

  if (gaps.length > limit) {
    lines.push(`... ${gaps.length - limit} more gaps`);
  }

  return lines.join("\n");
}
