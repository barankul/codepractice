type UiLang = "en" | "ja" | "tr";

export interface OfflineBugFixSourcePractice {
  lang: string;
  topic: string;
  level: number;
  title: string;
  task: string;
  code: string;
  solutionCode: string;
  expectedOutput: string;
  hint: string;
  testCases?: { input: string; output: string }[];
}

export interface OfflineBugFixPractice {
  lang: string;
  topic: string;
  level: number;
  title: string;
  task: string;
  code: string;
  solutionCode: string;
  expectedOutput: string;
  hint: string;
  mode: "bugfix";
  sourceRepo: "offline";
  bugExplanation: string;
  judgeFeedback: { summary: string; lines: { line: number; problem: string; fix: string }[] };
  testCases?: { input: string; output: string }[];
}

export type VerifyOfflineBugFixOutput = (code: string, lang: string) => Promise<string | null>;

interface MutationSpec {
  langs: string[];
  pattern: RegExp;
  from: string;
  to: string;
  skipLine?: (line: string) => boolean;
}

interface MutationCandidate {
  code: string;
  line: number;
  from: string;
  to: string;
}

const MUTATIONS: MutationSpec[] = [
  { langs: ["Java", "TypeScript"], pattern: /\+=/, from: "+=", to: "-=" },
  { langs: ["Java", "TypeScript"], pattern: /\*=/, from: "*=", to: "+=" },
  { langs: ["Java", "TypeScript"], pattern: /Math\.max/, from: "Math.max", to: "Math.min" },
  { langs: ["Java", "TypeScript", "SQL"], pattern: /<=/, from: "<=", to: "<" },
  { langs: ["Java", "TypeScript", "SQL"], pattern: />=/, from: ">=", to: ">" },
  { langs: ["Java", "TypeScript"], pattern: /&&/, from: "&&", to: "||" },
  { langs: ["Java", "TypeScript"], pattern: /\|\|/, from: "||", to: "&&" },
  { langs: ["Java", "TypeScript"], pattern: /\+\+/, from: "++", to: "--", skipLine: line => /\bfor\s*\(/.test(line) },
  { langs: ["TypeScript"], pattern: /===/, from: "===", to: "!==" },
  { langs: ["TypeScript"], pattern: /\.push\(/, from: ".push(", to: ".unshift(" },
  { langs: ["SQL"], pattern: /\bSUM\s*\(/i, from: "SUM(", to: "COUNT(" },
  { langs: ["SQL"], pattern: /\bCOUNT\s*\(/i, from: "COUNT(", to: "SUM(" },
  { langs: ["SQL"], pattern: /\bAVG\s*\(/i, from: "AVG(", to: "SUM(" },
  { langs: ["SQL"], pattern: /\bASC\b/i, from: "ASC", to: "DESC", skipLine: line => !/\border\s+by\b/i.test(line) },
  { langs: ["SQL"], pattern: /\bDESC\b/i, from: "DESC", to: "ASC", skipLine: line => !/\border\s+by\b/i.test(line) },
  { langs: ["SQL"], pattern: /\bAND\b/i, from: "AND", to: "OR" },
  { langs: ["SQL"], pattern: /\bOR\b/i, from: "OR", to: "AND" },
  { langs: ["Java", "TypeScript", "SQL"], pattern: /\b1\b/, from: "1", to: "0" },
  { langs: ["Java", "TypeScript", "SQL"], pattern: /\b0\b/, from: "0", to: "1" },
  { langs: ["Java", "TypeScript", "SQL"], pattern: /\b2\b/, from: "2", to: "3" },
];

function normalizeOutputText(value: string): string {
  return (value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function lineIsEditable(line: string, lang: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) { return false; }
  if (/^(\/\/|\/\*|\*|--)/.test(trimmed)) { return false; }
  if (/^import\s+/.test(trimmed) || /^package\s+/.test(trimmed)) { return false; }
  if (lang === "Java" && /System\.out\.print/.test(trimmed)) { return false; }
  if (lang === "TypeScript" && /console\.log\s*\(/.test(trimmed)) { return false; }
  return true;
}

function applyMutation(code: string, lang: string, spec: MutationSpec): { code: string; line: number } | null {
  const lines = code.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!lineIsEditable(line, lang)) { continue; }
    if (spec.skipLine && spec.skipLine(line)) { continue; }
    if (!spec.pattern.test(line)) { continue; }

    const updated = line.replace(spec.pattern, spec.to);
    if (updated === line) { continue; }

    const nextLines = [...lines];
    nextLines[i] = updated;
    return { code: nextLines.join("\n"), line: i + 1 };
  }

  return null;
}

function buildMutationCandidate(
  lines: string[],
  index: number,
  updatedLine: string,
  from: string,
  to: string,
): MutationCandidate | null {
  if (updatedLine === lines[index]) { return null; }
  const nextLines = [...lines];
  nextLines[index] = updatedLine;
  return {
    code: nextLines.join("\n"),
    line: index + 1,
    from,
    to,
  };
}

function statementCanBeRemoved(line: string, lang: string): boolean {
  const trimmed = line.trim();
  if (!lineIsEditable(line, lang)) { return false; }
  if (!trimmed.endsWith(";")) { return false; }
  if (/[{}]/.test(trimmed)) { return false; }
  if (/^(?:if|for|while|switch|catch|return|throw|break|continue)\b/.test(trimmed)) { return false; }
  if (/^(?:public|private|protected|static|class|interface|type|enum|function|async\s+function)\b/.test(trimmed)) { return false; }
  if (/^(?:const|let|var|final)\b/.test(trimmed)) { return false; }
  if (lang === "Java" && /^(?:int|long|double|float|boolean|char|byte|short|String|List|ArrayList|Map|HashMap|Set|HashSet|TreeSet)\b/.test(trimmed)) { return false; }
  if (lang === "SQL" && !/^(?:SELECT|FROM|WHERE|GROUP|HAVING|ORDER|INSERT|UPDATE|DELETE)\b/i.test(trimmed)) { return false; }
  return true;
}

function buildFallbackMutationCandidates(code: string, lang: string): MutationCandidate[] {
  const candidates: MutationCandidate[] = [];
  const seen = new Set<string>();
  const lines = code.split("\n");

  const pushCandidate = (candidate: MutationCandidate | null): void => {
    if (!candidate || seen.has(candidate.code)) { return; }
    seen.add(candidate.code);
    candidates.push(candidate);
  };

  if (lang === "SQL") {
    const trimmed = code.trim();
    if (/^\s*SELECT\b/i.test(trimmed) && !/\bLIMIT\b/i.test(trimmed)) {
      pushCandidate({
        code: trimmed.replace(/;?\s*$/, " LIMIT 1;"),
        line: 1,
        from: "full result set",
        to: "LIMIT 1",
      });
    }
    if (/\bDISTINCT\b/i.test(code)) {
      pushCandidate({
        code: code.replace(/\bDISTINCT\s+/i, ""),
        line: 1,
        from: "DISTINCT",
        to: "plain SELECT",
      });
    }
    if (/\bWHERE\b/i.test(code)) {
      pushCandidate({
        code: code.replace(/\bWHERE\b/i, "WHERE 1 = 0 AND"),
        line: 1,
        from: "original filter",
        to: "empty-result filter",
      });
    }
    if (/\bHAVING\b/i.test(code)) {
      pushCandidate({
        code: code.replace(/\bHAVING\b/i, "HAVING 1 = 0 AND"),
        line: 1,
        from: "original HAVING clause",
        to: "empty-result HAVING",
      });
    }
    if (/^\s*INSERT\s+INTO\s+users\b[\s\S]*\bVALUES\s*\(/i.test(trimmed) && !/\)\s*,/.test(trimmed)) {
      pushCandidate({
        code: trimmed.replace(/;?\s*$/, ", ('Bug User', 'bug@example.com', 99, 'Bug City');"),
        line: 1,
        from: "single-row INSERT",
        to: "two-row INSERT",
      });
    }
    if (/^\s*INSERT\s+INTO\s+products\b[\s\S]*\bVALUES\b/i.test(trimmed) && !/\bON\s+CONFLICT\b/i.test(trimmed)) {
      pushCandidate({
        code: trimmed.replace(/;?\s*$/, ",\n  ('Bug Product', 'Misc', 1.00, 1);"),
        line: 1,
        from: "original product INSERT",
        to: "extra inserted row",
      });
    }
    if (/\bON\s+CONFLICT\b/i.test(trimmed) && /\bDO\s+UPDATE\s+SET\b/i.test(trimmed)) {
      pushCandidate({
        code: trimmed.replace(/\bDO\s+UPDATE\s+SET[\s\S]*$/i, "DO NOTHING;"),
        line: 1,
        from: "DO UPDATE",
        to: "DO NOTHING",
      });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!lineIsEditable(line, lang)) { continue; }

    if (lang !== "SQL") {
      if (/\s>\s/.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\s>\s/, " < "), ">", "<"));
      }
      if (/\s<\s/.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\s<\s/, " > "), "<", ">"));
      }
      if (/\s\*\s/.test(line) && !/["'`]/.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\s\*\s/, " + "), "*", "+"));
      }
    } else {
      if (/\s=\s/.test(line) && !/\bSET\b/i.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\s=\s/, " != "), "=", "!="));
      }
      if (/\s<\s/.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\s<\s/, " > "), "<", ">"));
      }
      if (/\s>\s/.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\s>\s/, " < "), ">", "<"));
      }
      if (/\bLIKE\b/i.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\bLIKE\b/i, "NOT LIKE"), "LIKE", "NOT LIKE"));
      }
      if (/\bBETWEEN\b/i.test(line)) {
        pushCandidate(buildMutationCandidate(lines, i, line.replace(/\bBETWEEN\b/i, "NOT BETWEEN"), "BETWEEN", "NOT BETWEEN"));
      }
    }

    if (/\btrue\b/.test(line)) {
      pushCandidate(buildMutationCandidate(lines, i, line.replace(/\btrue\b/, "false"), "true", "false"));
    }
    if (/\bfalse\b/.test(line)) {
      pushCandidate(buildMutationCandidate(lines, i, line.replace(/\bfalse\b/, "true"), "false", "true"));
    }

    const stringMatch = line.match(/"[^"\n]*"|'[^'\n]*'/);
    if (stringMatch) {
      const originalLiteral = stringMatch[0];
      const quote = originalLiteral[0];
      pushCandidate(
        buildMutationCandidate(
          lines,
          i,
          line.replace(originalLiteral, `${quote}BUG${quote}`),
          originalLiteral,
          `${quote}BUG${quote}`,
        ),
      );
    }

    const templateMatch = line.match(/`[^`\n]*`/);
    if (templateMatch) {
      const originalLiteral = templateMatch[0];
      pushCandidate(
        buildMutationCandidate(
          lines,
          i,
          line.replace(originalLiteral, "`BUG`"),
          originalLiteral,
          "`BUG`",
        ),
      );
    }

    const numberMatch = line.match(/\b\d+\b/);
    if (numberMatch) {
      const originalNumber = numberMatch[0];
      const nextNumber = String(Number.parseInt(originalNumber, 10) + 1);
      pushCandidate(buildMutationCandidate(lines, i, line.replace(/\b\d+\b/, nextNumber), originalNumber, nextNumber));
    }

    if (statementCanBeRemoved(line, lang)) {
      const replacement = lang === "SQL" ? "-- BUG: removed core step" : "// BUG: removed core step";
      pushCandidate(buildMutationCandidate(lines, i, replacement, line.trim(), "removed statement"));
    }
  }

  return candidates;
}

function bugFixTitle(title: string, uiLang: UiLang): string {
  if (uiLang === "ja") { return `${title} ・バグ修正`; }
  if (uiLang === "tr") { return `${title} • Hata Duzeltme`; }
  return `${title} • Bug Fix`;
}

function bugFixTask(task: string, uiLang: UiLang): string {
  if (uiLang === "ja") {
    return `このコードは本来、次の動作をするはずです。\n${task}\n期待される結果になるように、バグを見つけて修正してください。`;
  }
  if (uiLang === "tr") {
    return `Bu kodun yapması gereken şey şudur:\n${task}\nÇıktı beklenen sonuçla eşleşecek şekilde bugı bulup düzeltin.`;
  }
  return `This code is supposed to do the following:\n${task}\nFind and fix the bug so the output matches the expected result.`;
}

function bugFixHint(baseHint: string, uiLang: UiLang): string {
  const extra = uiLang === "ja"
    ? "中核ロジックの重要なトークンが1つ変わっています。計算や比較をしている行を注意深く確認してください。"
    : uiLang === "tr"
    ? "Temel mantıktaki önemli bir parça değiştirilmiş. Hesaplama veya karşılaştırma yapan satırı dikkatlice kontrol et."
    : "One important token in the core logic was changed. Check the line that performs the main calculation or comparison.";
  return baseHint ? `${baseHint}\n${extra}` : extra;
}

function bugFixSummary(from: string, to: string, uiLang: UiLang): string {
  if (uiLang === "ja") {
    return `中核ロジックで \`${from}\` の代わりに \`${to}\` が使われています。`;
  }
  if (uiLang === "tr") {
    return `Temel mantıkta \`${from}\` yerine \`${to}\` kullanılmış.`;
  }
  return `The core logic uses \`${to}\` where \`${from}\` is required.`;
}

function bugFixProblem(from: string, to: string, uiLang: UiLang): string {
  if (uiLang === "ja") {
    return `この行では \`${from}\` の代わりに \`${to}\` が使われています。`;
  }
  if (uiLang === "tr") {
    return `Bu satırda \`${from}\` yerine \`${to}\` kullanılmış.`;
  }
  return `This line uses \`${to}\` instead of \`${from}\`.`;
}

function bugFixLineFix(from: string, to: string, uiLang: UiLang): string {
  if (uiLang === "ja") {
    return `\`${to}\` を \`${from}\` に戻してください。`;
  }
  if (uiLang === "tr") {
    return `\`${to}\` ifadesini tekrar \`${from}\` olarak değiştir.`;
  }
  return `Replace \`${to}\` with \`${from}\`.`;
}

function bugFixExplanation(from: string, to: string, uiLang: UiLang): string {
  if (uiLang === "ja") {
    return `バグは、ここで \`${from}\` ではなく \`${to}\` が使われていることです。正しい動作に戻すには \`${from}\` に修正してください。`;
  }
  if (uiLang === "tr") {
    return `Bug, burada \`${from}\` yerine \`${to}\` kullanılması. Doğru davranış için bunu tekrar \`${from}\` yapmalısın.`;
  }
  return `The bug is that \`${to}\` is used where \`${from}\` should be. Change it back to \`${from}\` to restore the correct behavior.`;
}

export async function createOfflineBugFixPractice(
  practice: OfflineBugFixSourcePractice,
  verifyOutput: VerifyOfflineBugFixOutput,
  uiLang: UiLang = "en"
): Promise<OfflineBugFixPractice | null> {
  const baseCode = (practice.solutionCode || practice.code || "").trim();
  if (!baseCode) { return null; }
  const baselineOutput = await verifyOutput(baseCode, practice.lang);
  if (baselineOutput === null) { return null; }

  for (const spec of MUTATIONS) {
    if (!spec.langs.includes(practice.lang)) { continue; }

    const candidate = applyMutation(baseCode, practice.lang, spec);
    if (!candidate) { continue; }

    const output = await verifyOutput(candidate.code, practice.lang);
    if (output === null) { continue; }
    if (normalizeOutputText(output) === normalizeOutputText(baselineOutput)) { continue; }

    return {
      lang: practice.lang,
      topic: practice.topic,
      level: practice.level,
      title: bugFixTitle(practice.title, uiLang),
      task: bugFixTask(practice.task, uiLang),
      code: candidate.code,
      solutionCode: practice.solutionCode,
      expectedOutput: practice.expectedOutput,
      hint: bugFixHint(practice.hint, uiLang),
      mode: "bugfix",
      sourceRepo: "offline",
      bugExplanation: bugFixExplanation(spec.from, spec.to, uiLang),
      judgeFeedback: {
        summary: bugFixSummary(spec.from, spec.to, uiLang),
        lines: [
          {
            line: candidate.line,
            problem: bugFixProblem(spec.from, spec.to, uiLang),
            fix: bugFixLineFix(spec.from, spec.to, uiLang),
          },
        ],
      },
      testCases: practice.testCases,
    };
  }

  for (const candidate of buildFallbackMutationCandidates(baseCode, practice.lang)) {
    const output = await verifyOutput(candidate.code, practice.lang);
    if (output === null) { continue; }
    if (normalizeOutputText(output) === normalizeOutputText(baselineOutput)) { continue; }

    return {
      lang: practice.lang,
      topic: practice.topic,
      level: practice.level,
      title: bugFixTitle(practice.title, uiLang),
      task: bugFixTask(practice.task, uiLang),
      code: candidate.code,
      solutionCode: practice.solutionCode,
      expectedOutput: practice.expectedOutput,
      hint: bugFixHint(practice.hint, uiLang),
      mode: "bugfix",
      sourceRepo: "offline",
      bugExplanation: bugFixExplanation(candidate.from, candidate.to, uiLang),
      judgeFeedback: {
        summary: bugFixSummary(candidate.from, candidate.to, uiLang),
        lines: [
          {
            line: candidate.line,
            problem: bugFixProblem(candidate.from, candidate.to, uiLang),
            fix: bugFixLineFix(candidate.from, candidate.to, uiLang),
          },
        ],
      },
      testCases: practice.testCases,
    };
  }

  return null;
}
